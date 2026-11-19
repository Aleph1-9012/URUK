export const STENCIL_EXPONENTS = [0, 1, 2] as const;

export type RingConfiguration = {
  inputBits: number;
  inputCells: number[];
  outputBits: number;
  outputCells: number[];
};

export type ImageGroup = {
  outputBits: number;
  outputCells: number[];
  inputBits: number[];
  inputCells: number[][];
};

export type RingAction = {
  order: number;
  ruleBits: number;
  ruleCells: number[];
  rows: number[];
  matrix: number[][];
  rank: number;
  configurations: RingConfiguration[];
  groups: ImageGroup[];
  missingOutputs: number[];
  kernel: number[];
  inverseBits: number | null;
  inverseCells: number[] | null;
  inverseRows: number[] | null;
  abBits: number | null;
  baBits: number | null;
  abRows: number[] | null;
  baRows: number[] | null;
};

export type UnitTally = { order: number; ruleCount: number; units: number; injective: number; onto: number; exceptions: number };

function validateOrder(order: number): void {
  if (!Number.isInteger(order) || order < 1 || order > 30) throw new RangeError('Cyclic bit vectors need between one and thirty cells.');
}

function validateElement(bits: number, order: number): void {
  if (!Number.isInteger(bits) || bits < 0 || bits >= 2 ** order) throw new RangeError('A cyclic element must fit its complete coefficient vector.');
}

function residue(value: number, order: number): number {
  return (value % order + order) % order;
}

/** Reduce exponents in F2[C_m]: coincident terms cancel, even for m = 1 or 2. */
export function polynomialBits(exponents: readonly number[], order: number): number {
  validateOrder(order);
  let bits = 0;

  for (const exponent of exponents) {
    if (!Number.isSafeInteger(exponent)) throw new RangeError('Polynomial exponents must be exact integers.');

    bits ^= 1 << residue(exponent, order);
  }

  return bits;
}

export function coefficientCells(bits: number, order: number): number[] {
  validateOrder(order);
  validateElement(bits, order);

  return Array.from({ length: order }, (_, index) => bits >>> index & 1);
}

function rotate(bits: number, shift: number, order: number): number {
  if (shift === 0) return bits;

  return ((bits << shift) | (bits >>> (order - shift))) & (2 ** order - 1);
}

function convolve(a: number, b: number, order: number): number {
  let result = 0;

  for (let index = 0; index < order; index++) {
    if (a >>> index & 1) result ^= rotate(b, index, order);
  }

  return result;
}

export function cyclicConvolution(a: number, b: number, order: number): number {
  validateOrder(order);
  validateElement(a, order);
  validateElement(b, order);

  return convolve(a, b, order);
}

/** Row r is a shifted by +r. Row vectors therefore satisfy v C(a) = v * a. */
export function circulantRows(a: number, order: number): number[] {
  validateOrder(order);
  validateElement(a, order);

  return Array.from({ length: order }, (_, row) => rotate(a, row, order));
}

function binaryRow(rows: readonly number[], index: number): number {
  const row = rows[index];

  if (row === undefined) throw new Error('Binary elimination needs each actual row.');

  return row;
}

export function binaryRank(rows: readonly number[], columns: number): number {
  validateOrder(columns);

  for (const row of rows) validateElement(row, columns);

  const remaining = [...rows];
  let rank = 0;

  for (let column = 0; column < columns; column++) {
    let pivot = rank;

    while (pivot < remaining.length && !(binaryRow(remaining, pivot) >>> column & 1)) pivot++;

    if (pivot === remaining.length) continue;

    const basis = binaryRow(remaining, pivot);
    remaining[pivot] = binaryRow(remaining, rank);
    remaining[rank] = basis;

    for (let row = rank + 1; row < remaining.length; row++) {
      const value = binaryRow(remaining, row);

      if (value >>> column & 1) remaining[row] = value ^ basis;
    }

    rank++;
  }

  return rank;
}

function ringAction(order: number): RingAction {
  const ruleBits = polynomialBits(STENCIL_EXPONENTS, order);
  const rows = circulantRows(ruleBits, order);
  const rank = binaryRank(rows, order);
  const configurations: RingConfiguration[] = [];
  const byImage = new Map<number, ImageGroup>();

  for (let inputBits = 0; inputBits < 2 ** order; inputBits++) {
    const outputBits = convolve(inputBits, ruleBits, order);
    const inputCells = coefficientCells(inputBits, order);
    const outputCells = coefficientCells(outputBits, order);
    configurations.push({ inputBits, inputCells, outputBits, outputCells });
    let group = byImage.get(outputBits);

    if (!group) {
      group = { outputBits, outputCells, inputBits: [], inputCells: [] };
      byImage.set(outputBits, group);
    }

    group.inputBits.push(inputBits);
    group.inputCells.push(inputCells);
  }

  const groups = [...byImage.values()].sort((a, b) => a.outputBits - b.outputBits);
  const missingOutputs: number[] = [];

  for (let output = 0; output < 2 ** order; output++) {
    if (!byImage.has(output)) missingOutputs.push(output);
  }

  if (groups.length !== 2 ** rank) throw new Error('The computed image must agree with the independently eliminated rank.');

  const inverseBits = byImage.get(1)?.inputBits[0] ?? null;
  const inverseRows = inverseBits === null ? null : circulantRows(inverseBits, order);
  const abBits = inverseBits === null ? null : convolve(ruleBits, inverseBits, order);
  const baBits = inverseBits === null ? null : convolve(inverseBits, ruleBits, order);

  return {
    order, ruleBits, ruleCells: coefficientCells(ruleBits, order), rows,
    matrix: rows.map(row => coefficientCells(row, order)), rank,
    configurations, groups, missingOutputs, kernel: byImage.get(0)?.inputBits ?? [],
    inverseBits, inverseCells: inverseBits === null ? null : coefficientCells(inverseBits, order), inverseRows,
    abBits, baBits,
    abRows: inverseBits === null ? null : rows.map(row => convolve(row, inverseBits, order)),
    baRows: inverseRows === null ? null : inverseRows.map(row => convolve(row, ruleBits, order)),
  };
}

function unitTally(order: number): UnitTally {
  const ruleCount = 2 ** order;
  let units = 0;
  let injective = 0;
  let onto = 0;
  let exceptions = 0;

  for (let rule = 0; rule < ruleCount; rule++) {
    const reached = new Uint8Array(ruleCount);
    let imageCount = 0;
    let inverse: number | null = null;

    for (let input = 0; input < ruleCount; input++) {
      const output = convolve(input, rule, order);

      if (reached[output] === 0) {
        reached[output] = 1;
        imageCount++;
      }

      if (output === 1) inverse = input;
    }

    const oneToOne = imageCount === ruleCount;
    const reachesAll = reached.every(value => value === 1);
    const unit = inverse !== null && convolve(rule, inverse, order) === 1;
    const fullRank = binaryRank(circulantRows(rule, order), order) === order;
    units += Number(unit);
    injective += Number(oneToOne);
    onto += Number(reachesAll);

    if (oneToOne !== reachesAll || oneToOne !== unit || oneToOne !== fullRank) exceptions++;
  }

  return { order, ruleCount, units, injective, onto, exceptions };
}

function cyclicWindow() {
  const order = 21;
  const integers = Array.from({ length: order }, (_, index) => index - 10);
  const residues = integers.map(value => residue(value, order));
  const decodedWindow = new Map(residues.map((value, index) => [value, integers[index]]));
  const injective = decodedWindow.size === integers.length;
  const translations = Array.from({ length: order }, (_, shift) => ({ shift, permutation: Array.from({ length: order }, (_, cell) => residue(cell + shift, order)) }));
  const sums: { x: number; y: number; residue: number; decoded: number; expected: number; matches: boolean }[] = [];
  let errors = 0;

  for (let x = -5; x <= 5; x++) {
    for (let y = -5; y <= 5; y++) {
      const sumResidue = residue(residue(x, order) + residue(y, order), order);
      const decoded = decodedWindow.get(sumResidue);

      if (decoded === undefined) throw new Error('Every cyclic sum must decode to one integer in the displayed window.');

      const expected = x + y;
      const matches = decoded === expected;
      errors += Number(!matches);
      sums.push({ x, y, residue: sumResidue, decoded, expected, matches });
    }
  }

  return { order, integers, residues, translations, sums, checks: sums.length, errors, injective };
}

/** Finite commutative cyclic toys only; none supplies the papers' unknown group or its c. */
export function buildRingRulesModel() {
  return {
    stencilExponents: STENCIL_EXPONENTS,
    four: ringAction(4),
    three: ringAction(3),
    tally: Array.from({ length: 8 }, (_, index) => unitTally(index + 1)),
    window: cyclicWindow(),
  };
}

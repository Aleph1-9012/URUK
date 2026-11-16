export type Fraction = { readonly n: bigint; readonly d: bigint };

export type Point = { readonly x: number; readonly y: number };

export type ExactPoint = { readonly x: Fraction; readonly y: Fraction };

export type TapeSymbol = 0 | 1;

export type ControlState = 'q0' | 'q1' | 'halt';

export type MachineName = 'A' | 'S';

export type Move = 'L' | 'R';

export type Configuration = { readonly state: ControlState; readonly left: readonly TapeSymbol[]; readonly right: readonly TapeSymbol[] };

export type MachineFrame = Configuration & { readonly step: number; readonly x: Fraction; readonly y: Fraction; readonly point: Point };

export type Matrix2 = readonly [readonly [Fraction, Fraction], readonly [Fraction, Fraction]];

export type Shear = { readonly kind: 'U' | 'L'; readonly coefficient: Fraction; readonly matrix: Matrix2 };

export type BranchStage = {
  readonly index: number;
  readonly label: string;
  readonly kind: 'source' | 'translation' | 'U' | 'L';
  readonly matrix: Matrix2;
  readonly translation: ExactPoint;
  readonly exactCorners: readonly ExactPoint[];
  readonly corners: readonly Point[];
  readonly exactMarker: ExactPoint;
  readonly marker: Point;
  readonly area: Fraction;
};

export type HistoryRecord = {
  readonly input: readonly TapeSymbol[];
  readonly source: Point;
  readonly exactSource: ExactPoint;
  readonly target: Point;
  readonly exactTarget: ExactPoint;
  readonly h: Fraction;
  readonly history: number;
  readonly group: number;
};

function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;

  while (b !== 0n) [a, b] = [b, a % b];

  return a;
}

export function fraction(n: bigint, d = 1n): Fraction {
  if (d === 0n) throw new RangeError('An exact fraction needs a nonzero denominator.');

  if (d < 0n) { n = -n; d = -d; }

  const divisor = gcd(n, d);

  return Object.freeze({ n: n / divisor, d: d / divisor });
}

export function add(a: Fraction, b: Fraction): Fraction {
  return fraction(a.n * b.d + b.n * a.d, a.d * b.d);
}

export function subtract(a: Fraction, b: Fraction): Fraction {
  return fraction(a.n * b.d - b.n * a.d, a.d * b.d);
}

export function multiply(a: Fraction, b: Fraction): Fraction {
  return fraction(a.n * b.n, a.d * b.d);
}

export function divide(a: Fraction, b: Fraction): Fraction {
  return fraction(a.n * b.d, a.d * b.n);
}

export function fractionNumber(value: Fraction): number {
  return Number(value.n) / Number(value.d);
}

export function fractionText(value: Fraction): string {
  return value.d === 1n ? String(value.n) : `${value.n}/${value.d}`;
}

function exactPoint(x: Fraction, y: Fraction): ExactPoint {
  return Object.freeze({ x, y });
}

export function pointNumbers(point: ExactPoint): Point {
  return Object.freeze({ x: fractionNumber(point.x), y: fractionNumber(point.y) });
}

const ZERO = fraction(0n);
const ONE = fraction(1n);
const BASE = fraction(5n);
const BLANK = fraction(1n, 4n);
const CENTER = exactPoint(fraction(1n, 2n), fraction(1n, 2n));

function digit(symbol: TapeSymbol): Fraction {
  return fraction(symbol === 0 ? 1n : 3n);
}

export function encodeTape(cells: readonly TapeSymbol[]): Fraction {
  let value = BLANK;

  for (let index = cells.length - 1; index >= 0; index--) {
    const cell = cells[index];

    if (cell === undefined) throw new Error('Each finite tape prefix needs its cell.');

    value = divide(add(digit(cell), value), BASE);
  }

  return value;
}

export function readSymbol(coordinate: Fraction): TapeSymbol {
  const leading = (coordinate.n * 5n) / coordinate.d;

  if (leading === 1n) return 0;
  if (leading === 3n) return 1;

  throw new RangeError('Only a separated tape-symbol band can be read as a cell.');
}

export function affineStep(point: ExactPoint, write: TapeSymbol, move: Move): ExactPoint {
  const rightDigit = digit(readSymbol(point.y));
  const written = digit(write);
  const remainder = subtract(multiply(BASE, point.y), rightDigit);

  if (move === 'R') return exactPoint(divide(add(point.x, written), BASE), remainder);

  const leftDigit = digit(readSymbol(point.x));

  return exactPoint(subtract(multiply(BASE, point.x), leftDigit), divide(add(leftDigit, divide(add(written, remainder), BASE)), BASE));
}

function trim(cells: readonly TapeSymbol[]): readonly TapeSymbol[] {
  let end = cells.length;

  while (end > 0 && cells[end - 1] === 0) end--;

  return Object.freeze(cells.slice(0, end));
}

export function symbolicStep(config: Configuration, write: TapeSymbol, move: Move, state: ControlState): Configuration {
  if (move === 'R') return Object.freeze({ state, left: trim([write, ...config.left]), right: trim(config.right.slice(1)) });

  return Object.freeze({ state, left: trim(config.left.slice(1)), right: trim([config.left[0] ?? 0, write, ...config.right.slice(1)]) });
}

export function machineInstruction(name: MachineName, state: ControlState, read: TapeSymbol): { write: TapeSymbol; move: Move; state: ControlState } {
  if (state === 'halt') throw new Error('A halted toy machine has no next instruction.');

  if (name === 'A') {
    if (state !== 'q0') throw new Error('Machine A uses only q0 before halting.');

    return { write: 1, move: 'R', state: read === 0 ? 'halt' : 'q0' };
  }

  return { write: 1, move: state === 'q0' ? 'R' : 'L', state: state === 'q0' ? 'q1' : 'q0' };
}

export function runMachine(name: MachineName, input: readonly TapeSymbol[], maximumSteps: number): readonly MachineFrame[] {
  if (!Number.isSafeInteger(maximumSteps) || maximumSteps < 0) throw new RangeError('A finite toy run needs a nonnegative integer step limit.');

  let config: Configuration = { state: 'q0', left: Object.freeze([]), right: trim(input) };
  let coordinates = exactPoint(encodeTape(config.left), encodeTape(config.right));
  const path: MachineFrame[] = [];

  for (let step = 0; step <= maximumSteps; step++) {
    path.push(Object.freeze({ ...config, step, x: coordinates.x, y: coordinates.y, point: pointNumbers(coordinates) }));

    if (config.state === 'halt' || step === maximumSteps) break;

    const instruction = machineInstruction(name, config.state, readSymbol(coordinates.y));
    coordinates = affineStep(coordinates, instruction.write, instruction.move);
    config = symbolicStep(config, instruction.write, instruction.move, instruction.state);
  }

  return Object.freeze(path);
}

function matrix(a: Fraction, b: Fraction, c: Fraction, d: Fraction): Matrix2 {
  return Object.freeze([Object.freeze([a, b] as const), Object.freeze([c, d] as const)] as const);
}

export function matrixProduct(a: Matrix2, b: Matrix2): Matrix2 {
  return matrix(add(multiply(a[0][0], b[0][0]), multiply(a[0][1], b[1][0])), add(multiply(a[0][0], b[0][1]), multiply(a[0][1], b[1][1])), add(multiply(a[1][0], b[0][0]), multiply(a[1][1], b[1][0])), add(multiply(a[1][0], b[0][1]), multiply(a[1][1], b[1][1])));
}

export function determinant(a: Matrix2): Fraction {
  return subtract(multiply(a[0][0], a[1][1]), multiply(a[0][1], a[1][0]));
}

export function applyAffine(point: ExactPoint, linear: Matrix2, translation: ExactPoint): ExactPoint {
  return exactPoint(add(add(multiply(linear[0][0], point.x), multiply(linear[0][1], point.y)), translation.x), add(add(multiply(linear[1][0], point.x), multiply(linear[1][1], point.y)), translation.y));
}

function shear(kind: 'U' | 'L', coefficient: Fraction): Shear {
  return Object.freeze({ kind, coefficient, matrix: kind === 'U' ? matrix(ONE, coefficient, ZERO, ONE) : matrix(ONE, ZERO, coefficient, ONE) });
}

function factorization(lambda: Fraction) {
  const factors = Object.freeze([shear('U', subtract(lambda, ONE)), shear('L', ONE), shear('U', subtract(divide(ONE, lambda), ONE)), shear('L', fraction(-lambda.n, lambda.d))]);
  let product = matrix(ONE, ZERO, ZERO, ONE);

  for (const factor of factors) product = matrixProduct(product, factor.matrix);

  return Object.freeze({ lambda, factors, execution: Object.freeze([...factors].reverse()), product });
}

function polygonArea(corners: readonly ExactPoint[]): Fraction {
  let twice = ZERO;

  for (let index = 0; index < corners.length; index++) {
    const a = corners[index];
    const b = corners[(index + 1) % corners.length];

    if (!a || !b) throw new Error('Every polygon edge needs two corners.');

    twice = add(twice, subtract(multiply(a.x, b.y), multiply(a.y, b.x)));
  }

  return divide(twice, fraction(2n));
}

function computeTapeShearsModel() {
  const pathA = runMachine('A', [1, 1, 1], 20);
  const pathS = runMachine('S', [1, 1, 1], 6);
  const halt = pathA[pathA.length - 1];
  const firstS = pathS[0];

  if (!halt || halt.state !== 'halt' || !firstS) throw new Error('The two toy machines need a halted A run and an initial S configuration.');

  const repeatAfter = pathS.findIndex((frame, index) => index > 0 && frame.state === firstS.state && frame.left.join(',') === firstS.left.join(',') && frame.right.join(',') === firstS.right.join(','));

  if (repeatAfter < 1) throw new Error('The shuttle run must repeat its full control-and-tape configuration.');

  const machineA = Object.freeze({ path: pathA, haltStep: halt.step });
  const machineS = Object.freeze({ path: pathS, repeatAfter });
  const initial = machineA.path[0];

  if (!initial) throw new Error('The branch marker needs the original machine input.');

  const source = Object.freeze([exactPoint(BLANK, fraction(13n, 20n)), exactPoint(fraction(3n, 4n), fraction(13n, 20n)), exactPoint(fraction(3n, 4n), fraction(3n, 4n)), exactPoint(BLANK, fraction(3n, 4n))]);
  const stages: BranchStage[] = [];
  let corners: readonly ExactPoint[] = source;
  let marker = exactPoint(initial.x, initial.y);
  const identity = matrix(ONE, ZERO, ZERO, ONE);

  function append(label: string, kind: BranchStage['kind'], linear: Matrix2, translation: ExactPoint): void {
    if (kind !== 'source') {
      corners = Object.freeze(corners.map(point => applyAffine(point, linear, translation)));
      marker = applyAffine(marker, linear, translation);
    }

    stages.push(Object.freeze({ index: stages.length, label, kind, matrix: linear, translation, exactCorners: corners, corners: Object.freeze(corners.map(pointNumbers)), exactMarker: marker, marker: pointNumbers(marker), area: polygonArea(corners) }));
  }

  append('SOURCE', 'source', identity, exactPoint(ZERO, ZERO));
  append('TRANSLATE y - 1/5', 'translation', identity, exactPoint(ZERO, fraction(-1n, 5n)));
  const rightFactors = factorization(fraction(1n, 5n));

  for (const factor of rightFactors.execution) {
    const mappedCenter = applyAffine(CENTER, factor.matrix, exactPoint(ZERO, ZERO));
    const translation = exactPoint(subtract(CENTER.x, mappedCenter.x), subtract(CENTER.y, mappedCenter.y));
    append(`${factor.kind}(${fractionText(factor.coefficient)})`, factor.kind, factor.matrix, translation);
  }

  append('TRANSLATE x + 1/5', 'translation', identity, exactPoint(fraction(1n, 5n), ZERO));
  const sourceStage = stages[0];
  const target = stages[stages.length - 1];

  if (!sourceStage || !target) throw new Error('The branch needs its source and final translated target.');

  const historyRecords: HistoryRecord[] = [];
  const historyGroups: { target: Point; exactTarget: ExactPoint; records: HistoryRecord[] }[] = [];
  const groupsByPoint = new Map<string, number>();

  for (let bits = 0; bits < 8; bits++) {
    const input: readonly TapeSymbol[] = Object.freeze([bits & 4 ? 1 : 0, bits & 2 ? 1 : 0, bits & 1 ? 1 : 0]);
    const exactSource = exactPoint(BLANK, encodeTape(input));
    const exactTarget = affineStep(exactSource, 1, 'R');
    const h = divide(add(BLANK, digit(input[0] ?? 0)), BASE);
    const key = `${fractionText(exactTarget.x)},${fractionText(exactTarget.y)}`;
    let group = groupsByPoint.get(key);

    if (group === undefined) {
      group = historyGroups.length;
      groupsByPoint.set(key, group);
      historyGroups.push({ target: pointNumbers(exactTarget), exactTarget, records: [] });
    }

    const record = Object.freeze({ input, source: pointNumbers(exactSource), exactSource, target: pointNumbers(exactTarget), exactTarget, h, history: fractionNumber(h), group });
    const bucket = historyGroups[group];

    if (!bucket) throw new Error('Every input needs its exact output group.');

    bucket.records.push(record);
    historyRecords.push(record);
  }

  const bands = Object.freeze(([0, 1] as const).map(symbol => {
    const d = digit(symbol);
    const low = divide(add(d, BLANK), BASE);
    const high = divide(add(d, fraction(3n, 4n)), BASE);

    return Object.freeze({ symbol, digit: Number(d.n), low, high, lower: fractionNumber(low), upper: fractionNumber(high) });
  }));
  const blankBand = bands[0];
  const oneBand = bands[1];

  if (!blankBand || !oneBand) throw new Error('Both symbol hulls are needed to delimit their separating gap.');

  return Object.freeze({
    base: 5,
    digits: Object.freeze([1, 3] as const),
    blankTail: BLANK,
    bands,
    gap: Object.freeze({ low: blankBand.high, high: oneBand.low, lower: blankBand.upper, upper: oneBand.lower }),
    machineA,
    machineS,
    factorizations: Object.freeze([factorization(fraction(5n)), rightFactors]),
    branch: Object.freeze({ stages: Object.freeze(stages), source: sourceStage, target, area: polygonArea(source), sourceMarker: initial.point, targetMarker: target.marker }),
    history: Object.freeze({ records: Object.freeze(historyRecords), groups: Object.freeze(historyGroups.map(group => Object.freeze({ ...group, records: Object.freeze(group.records) }))), withoutHistory: historyGroups.length, withHistory: historyRecords.length }),
  });
}

export type TapeShearsModel = ReturnType<typeof computeTapeShearsModel>;

let cachedModel: TapeShearsModel | undefined;

export function buildTapeShearsModel(): TapeShearsModel {
  if (!cachedModel) cachedModel = computeTapeShearsModel();

  return cachedModel;
}

export type Sign = 1 | -1;

export type SignRow = readonly Sign[];

export type Complex = { re: number; im: number };

export type SlidePair = { top: number; bottom: number; agree: boolean };

export type FoldedRow = [Sign[], Sign[], Sign[], Sign[]];

export type Evaluations = { c: number; d: number; g: Complex };

export type CoefficientRows = { c: number[]; d: number[]; g: Complex[] };

export const BARKER13 = [1, 1, 1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1] as const;

export const ROW4 = [-1, 1, 1, 1] as const;

export const REMARK4 = [1, 1, 1, -1] as const;

// The fixed output of Python's random.Random(179), not a Hadamard row.
export const ROW36 = [
  1, 1, 1, 1, -1, -1, 1, -1, 1, 1, -1, -1,
  -1, 1, -1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
  -1, 1, 1, 1, -1, 1, 1, 1, 1, -1, 1, -1,
] as const;

export const KNOWN_ROWS = {
  2: [1, 1],
  3: [1, 1, -1],
  4: ROW4,
  5: [1, 1, 1, -1, 1],
  7: [1, 1, 1, -1, -1, 1, -1],
  11: [1, 1, 1, -1, -1, -1, 1, -1, -1, 1, -1],
  13: BARKER13,
} as const;

function integerShift(t: number): void {
  if (!Number.isInteger(t)) throw new RangeError('Sign rows shift by a whole number of positions.');
}

export function slidePairs(row: SignRow, t: number): SlidePair[] {
  integerShift(t);
  const shift = Math.abs(t);
  const pairs: SlidePair[] = [];

  for (let index = 0; index < row.length - shift; index++) {
    const top = t < 0 ? index : index + shift;
    const bottom = t < 0 ? index + shift : index;
    pairs.push({ top, bottom, agree: row[top] === row[bottom] });
  }

  return pairs;
}

export function aperiodic(row: SignRow, t: number): number {
  integerShift(t);
  const shift = Math.abs(t);
  let sum = 0;

  for (let index = 0; index < row.length - shift; index++) {
    const first = row[index];
    const second = row[index + shift];

    if (first === undefined || second === undefined) throw new Error('A sign row has one sign at every position.');

    sum += first * second;
  }

  return sum;
}

export function periodic(row: SignRow, t: number): number {
  integerShift(t);

  if (row.length === 0) return 0;

  const shift = (t % row.length + row.length) % row.length;
  let sum = 0;

  for (let index = 0; index < row.length; index++) {
    const first = row[index];
    const second = row[(index + shift) % row.length];

    if (first === undefined || second === undefined) throw new Error('A sign row has one sign at every position.');

    sum += first * second;
  }

  return sum;
}

export function circulant(row: SignRow): Sign[][] {
  return Array.from({ length: row.length }, (_, index) => row.slice(row.length - index).concat(row.slice(0, row.length - index)));
}

export function fold(row: SignRow, u: number): FoldedRow {
  if (!Number.isInteger(u) || u < 1 || u % 2 === 0 || row.length !== 4 * u * u) {
    throw new RangeError('The C4 × C(u²) fold needs odd positive u and exactly 4u² signs.');
  }

  const columns = u * u;
  const grid: FoldedRow = [new Array<Sign>(columns).fill(1), new Array<Sign>(columns).fill(1), new Array<Sign>(columns).fill(1), new Array<Sign>(columns).fill(1)];

  for (const [index, sign] of row.entries()) {
    const target = grid[index % 4];

    if (target) target[index % columns] = sign;
  }

  return grid;
}

export function evaluations(row: SignRow): Evaluations {
  if (row.length !== 4) throw new RangeError('The scalar c, d and g evaluations need exactly four signs.');

  const [a, b, c, d] = row;

  if (a === undefined || b === undefined || c === undefined || d === undefined) throw new Error('Each evaluation needs four signs.');

  return { c: (a + b + c + d) / 2, d: (a - b + c - d) / 2, g: { re: (a - c) / 2, im: (b - d) / 2 } };
}

export function coefficientRows(grid: FoldedRow): CoefficientRows {
  const columns = grid[0].length;

  if (grid.some(row => row.length !== columns)) throw new RangeError('The fold has four equally long rows.');

  const result: CoefficientRows = { c: [], d: [], g: [] };

  for (let column = 0; column < columns; column++) {
    const a = grid[0][column];
    const b = grid[1][column];
    const c = grid[2][column];
    const d = grid[3][column];

    if (a === undefined || b === undefined || c === undefined || d === undefined) throw new Error('Each fold column needs four signs.');

    const value = evaluations([a, b, c, d]);
    result.c.push(value.c);
    result.d.push(value.d);
    result.g.push(value.g);
  }

  return result;
}

export function allOnesWalk(u: number, order: number): Complex[] {
  const length = u * u;

  if (!Number.isInteger(u) || u < 1 || !Number.isInteger(order) || order < 1 || length % order !== 0) {
    throw new RangeError('The character order must divide the positive cyclic group order u².');
  }

  const path: Complex[] = [{ re: 0, im: 0 }];
  let re = 0;
  let im = 0;

  for (let index = 0; index < length; index++) {
    const angle = 2 * Math.PI * (index % order) / order;
    re += Math.cos(angle);
    im += Math.sin(angle);
    path.push({ re, im });
  }

  return path;
}

export function isPrimePower(value: number): boolean {
  if (!Number.isInteger(value) || value < 2) return false;

  for (let prime = 2; prime * prime <= value; prime++) {
    if (value % prime !== 0) continue;

    while (value % prime === 0) value /= prime;

    return value === 1;
  }

  return true;
}

export function Turynsurvivors(limit = 100): number[] {
  const survivors: number[] = [];

  for (let u = 3; u < limit; u += 2) {
    if (!isPrimePower(u)) survivors.push(u);
  }

  return survivors;
}

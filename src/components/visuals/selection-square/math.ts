// Only the twelve numbers, target and prime are shipped from 138-checks/subsetsum.json.
// Every sum, ordering, walk cell and modular alias is computed from those inputs.
import data from './data.json';

export type HalfSelection = { mask: number; sum: number; selection: number[] };

export type SelectionCell = {
  readonly id: number;
  readonly mask: number;
  // Raw square coordinates are the two six-bit masks, not the sorted positions.
  readonly rowMask: number;
  readonly colMask: number;
  readonly sortedRow: number;
  readonly sortedCol: number;
  readonly sum: number;
  readonly remainder: number;
  readonly hit: boolean;
  readonly alias: boolean;
};

export type WalkStep = { row: number; col: number; cell: SelectionCell; sum: number; move: 'down' | 'right' | 'hit' };

export type Trial = { mask: number; selection: number[]; sum: number; comparison: 'small' | 'big' | 'hit' };

export type ChartReading = { n: number; brute: number; mitm: number; claimed: number; liYe: number; log2Gain: number; gain: number };

export type SelectionModel = {
  numbers: number[];
  n: number;
  half: number;
  size: number;
  target: number;
  prime: number;
  targetRemainder: number;
  rows: HalfSelection[];
  cols: HalfSelection[];
  rowOrder: number[];
  colOrder: number[];
  rowRank: number[];
  colRank: number[];
  cells: SelectionCell[];
  hit: SelectionCell;
  solution: number[];
  walk: WalkStep[];
  sameRemainder: SelectionCell[];
  aliases: SelectionCell[];
  trials: Trial[];
  chart: ChartReading[];
};

function entry(values: readonly number[], index: number): number {
  const value = values[index];

  if (value === undefined) throw new RangeError('The selection list contains its indexed entry.');

  return value;
}

function isPrime(prime: number): boolean {
  if (!Number.isSafeInteger(prime) || prime < 2) return false;

  for (let divisor = 2; divisor * divisor <= prime; divisor++) {
    if (prime % divisor === 0) return false;
  }

  return true;
}

export function selectionIndices(n: number, mask: number): number[] {
  if (!Number.isInteger(n) || n < 1 || n > 24 || !Number.isInteger(mask) || mask < 0 || mask >= 2 ** n) throw new RangeError('A selection mask uses exactly the stated finite list of bits.');

  const selected: number[] = [];

  for (let index = 0; index < n; index++) {
    if (mask & 1 << index) selected.push(index);
  }

  return selected;
}

export function selectionSum(numbers: readonly number[], mask: number): number {
  let sum = 0;

  for (const index of selectionIndices(numbers.length, mask)) sum += entry(numbers, index);

  if (!Number.isSafeInteger(sum)) throw new RangeError('The toy selection sum is an exact safe integer.');

  return sum;
}

function halfSelections(numbers: readonly number[], offset: number): HalfSelection[] {
  return Array.from({ length: 2 ** numbers.length }, (_, mask) => ({ mask, sum: selectionSum(numbers, mask), selection: selectionIndices(numbers.length, mask).map(index => index + offset) }));
}

function inverseOrder(order: readonly number[]): number[] {
  const ranks = new Array<number>(order.length).fill(-1);

  for (const [position, mask] of order.entries()) {
    if (!Number.isInteger(mask) || mask < 0 || mask >= order.length || ranks[mask] !== -1) throw new Error('A sorted half-list is a permutation of its mask identities.');

    ranks[mask] = position;
  }

  return ranks;
}

export function cellAtRaw(model: SelectionModel, rowMask: number, colMask: number): SelectionCell {
  if (!Number.isInteger(rowMask) || !Number.isInteger(colMask) || rowMask < 0 || colMask < 0 || rowMask >= model.size || colMask >= model.size) throw new RangeError('The raw cell uses one valid mask from each half.');

  const cell = model.cells[rowMask * model.size + colMask];

  if (!cell) throw new Error('Every raw pair of half-selections has its square cell.');

  return cell;
}

export function cellAtSorted(model: SelectionModel, row: number, col: number): SelectionCell {
  if (!Number.isInteger(row) || !Number.isInteger(col) || row < 0 || col < 0 || row >= model.size || col >= model.size) throw new RangeError('The sorted cell lies inside the selection square.');

  return cellAtRaw(model, entry(model.rowOrder, row), entry(model.colOrder, col));
}

export function chartAt(n: number): ChartReading {
  if (!(Number.isFinite(n) && n >= 0 && n <= 200)) throw new RangeError('The exponent chart displays n between zero and two hundred.');

  const log2Gain = .01 * n;

  return { n, brute: n, mitm: n / 2, claimed: .49 * n, liYe: .499999 * n, log2Gain, gain: 2 ** log2Gain };
}

export function createSelectionModel(): SelectionModel {
  const numbers = data.numbers;
  const n = numbers.length;
  const half = n / 2;
  const size = 2 ** half;
  const target = data.target;
  const prime = data.prime;

  if (n !== 12 || numbers.some(value => !Number.isSafeInteger(value)) || !Number.isSafeInteger(target) || !isPrime(prime)) throw new Error('The illustration uses twelve exact integers, an exact target and a prime modulus.');

  const targetRemainder = (target % prime + prime) % prime;
  const rows = halfSelections(numbers.slice(0, half), 0);
  const cols = halfSelections(numbers.slice(half), half);
  const rowOrder = rows.slice().sort((a, b) => a.sum - b.sum || a.mask - b.mask).map(row => row.mask);
  const colOrder = cols.slice().sort((a, b) => b.sum - a.sum || a.mask - b.mask).map(col => col.mask);
  const rowRank = inverseOrder(rowOrder);
  const colRank = inverseOrder(colOrder);
  const cells: SelectionCell[] = [];
  const hits: SelectionCell[] = [];
  const sameRemainder: SelectionCell[] = [];
  const aliases: SelectionCell[] = [];

  for (const row of rows) {
    for (const col of cols) {
      const sum = row.sum + col.sum;
      const remainder = (sum % prime + prime) % prime;
      const hit = sum === target;
      const alias = remainder === targetRemainder && !hit;
      const cell = { id: row.mask * size + col.mask, mask: row.mask | col.mask << half, rowMask: row.mask, colMask: col.mask, sortedRow: entry(rowRank, row.mask), sortedCol: entry(colRank, col.mask), sum, remainder, hit, alias };
      cells.push(cell);

      if (hit) hits.push(cell);
      if (remainder === targetRemainder) sameRemainder.push(cell);
      if (alias) aliases.push(cell);
    }
  }

  const hit = hits[0];

  if (hits.length !== 1 || !hit) throw new Error('The canonical instance has exactly one target selection.');

  const trials = [7, 4095, 1365].map((mask): Trial => {
    const sum = selectionSum(numbers, mask);

    return { mask, sum, selection: selectionIndices(n, mask), comparison: sum < target ? 'small' : sum > target ? 'big' : 'hit' };
  });
  const model: SelectionModel = { numbers, n, half, size, target, prime, targetRemainder, rows, cols, rowOrder, colOrder, rowRank, colRank, cells, hit, solution: selectionIndices(n, hit.mask), walk: [], sameRemainder, aliases, trials, chart: Array.from({ length: 11 }, (_, index) => chartAt(index * 20)) };
  let row = 0;
  let col = 0;

  while (row < size && col < size) {
    const cell = cellAtSorted(model, row, col);
    const move = cell.sum < target ? 'down' : cell.sum > target ? 'right' : 'hit';
    model.walk.push({ row, col, cell, sum: cell.sum, move });

    if (move === 'hit') break;
    if (move === 'down') row++;
    else col++;
  }

  if (model.walk.at(-1)?.cell !== hit || trials.some(trial => trial.comparison === 'hit')) throw new Error('The staircase reaches the unique hit, while the three opening trials all miss.');

  return model;
}

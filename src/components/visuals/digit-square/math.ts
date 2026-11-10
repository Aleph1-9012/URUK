// Only the two decimal inputs are shipped from 109-checks/multiply.json.
// Products and both arithmetic representations are computed with BigInt.
import data from './data.json';

export const KAPPA_POWER = 182;

export const KAPPA = 2 ** -KAPPA_POWER;

export type SchoolCell = { id: number; xIndex: number; yIndex: number; xDigit: number; yDigit: number; value: number; power: number; weighted: bigint };

export type SchoolDiagonal = { power: number; cellIds: number[]; rawSum: bigint; carryIn: bigint; total: bigint; digit: number; carryOut: bigint };

export type KaratsubaSplit = {
  half: number;
  base: bigint;
  aHigh: bigint;
  aLow: bigint;
  bHigh: bigint;
  bLow: bigint;
  highPath: string;
  lowPath: string;
  middlePath: string;
  high: bigint;
  low: bigint;
  middle: bigint;
  cross: bigint;
};

export type KaratsubaNode = {
  path: string;
  parentPath: string | null;
  depth: number;
  n: number;
  a: bigint;
  b: bigint;
  result: bigint;
  children: string[];
  split: KaratsubaSplit | null;
  // This flag counts two-digit operands at the nominal one-position leaves.
  carried: boolean;
};

export type FftPair = readonly [number, number];

export type GapReading = { log2n: number; relativeGap: number };

export type HalfSaving = { power: number; log2Log2N: bigint; tex: string };

function digitAt(digits: readonly number[], index: number): number {
  const digit = digits[index];

  if (digit === undefined) throw new RangeError('Each digit-square coordinate selects an input digit.');

  return digit;
}

function karatsubaTree(a: bigint, b: bigint, n: number): { tree: KaratsubaNode; nodes: KaratsubaNode[]; nodesByPath: Map<string, KaratsubaNode>; levels: KaratsubaNode[][]; leaves: KaratsubaNode[] } {
  if (a < 0n || b < 0n || !Number.isInteger(n) || n < 1 || n > 64 || (n & (n - 1)) !== 0) throw new RangeError('The arithmetic illustration uses nonnegative integers and power-of-two nominal widths.');

  const nodesByPath = new Map<string, KaratsubaNode>();

  function build(first: bigint, second: bigint, length: number, path: string): KaratsubaNode {
    const parentPath = path.length === 0 ? null : path.slice(0, -1);

    if (length === 1) {
      const leaf = { path, parentPath, depth: path.length, n: length, a: first, b: second, result: first * second, children: [], split: null, carried: first > 9n || second > 9n };
      nodesByPath.set(path, leaf);

      return leaf;
    }

    const half = length / 2;
    const base = 10n ** BigInt(half);
    const aHigh = first / base;
    const aLow = first % base;
    const bHigh = second / base;
    const bLow = second % base;
    const highPath = `${path}H`;
    const lowPath = `${path}L`;
    const middlePath = `${path}M`;
    const high = build(aHigh, bHigh, half, highPath).result;
    const low = build(aLow, bLow, half, lowPath).result;
    const middle = build(aHigh + aLow, bHigh + bLow, half, middlePath).result;
    const cross = middle - high - low;
    const result = high * base * base + cross * base + low;
    const node = { path, parentPath, depth: path.length, n: length, a: first, b: second, result, children: [highPath, lowPath, middlePath], split: { half, base, aHigh, aLow, bHigh, bLow, highPath, lowPath, middlePath, high, low, middle, cross }, carried: false };
    nodesByPath.set(path, node);

    return node;
  }

  const tree = build(a, b, n, '');
  const nodes = Array.from(nodesByPath.values()).sort((first, second) => first.path < second.path ? -1 : first.path > second.path ? 1 : 0);
  const levels: KaratsubaNode[][] = Array.from({ length: Math.log2(n) + 1 }, () => []);
  const leaves: KaratsubaNode[] = [];

  for (const node of nodes) {
    const level = levels[node.depth];

    if (!level) throw new Error('Every recursive product belongs to its nominal-width depth.');

    level.push(node);

    if (node.children.length === 0) leaves.push(node);
  }

  return { tree, nodes, nodesByPath, levels, leaves };
}

export function buildFftLevels(size: number): FftPair[][] {
  if (!Number.isInteger(size) || size < 2 || size > 65536 || (size & (size - 1)) !== 0) throw new RangeError('A butterfly diagram has a finite power-of-two number of entries.');

  const levels: FftPair[][] = [];

  for (let level = 0; level < Math.log2(size); level++) {
    const pairs: FftPair[] = [];

    for (let entry = 0; entry < size; entry++) {
      if (!(entry & (1 << level))) pairs.push([entry, entry ^ (1 << level)]);
    }

    levels.push(pairs);
  }

  return levels;
}

/** n=2^log2n. This returns the fractional saving, avoiding cancellation in 1-exp(-tiny). */
export function gapAt(log2n: number, kappa = KAPPA): number {
  if (!(Number.isFinite(log2n) && log2n >= 1 && Number.isFinite(kappa) && kappa > 0 && kappa <= 1)) throw new RangeError('The logarithmic comparison uses log₂n at least one and a positive saving exponent.');

  return -Math.expm1(-kappa * Math.log(log2n));
}

/** The logarithm of the reference n·log₂n model, without constructing n itself. */
export function workAt(log2n: number): number {
  if (!(Number.isFinite(log2n) && log2n >= 1)) throw new RangeError('The reference work model uses log₂n at least one.');

  return log2n + Math.log2(log2n);
}

export function halfSavingThreshold(): HalfSaving {
  return { power: KAPPA_POWER, log2Log2N: 1n << BigInt(KAPPA_POWER), tex: `\\log_2 n=2^{2^{${KAPPA_POWER}}}` };
}

export function scientificTex(value: number, significantDigits = 3): string {
  if (!(Number.isFinite(value) && value > 0) || !Number.isInteger(significantDigits) || significantDigits < 1 || significantDigits > 8) throw new RangeError('Scientific labels require a positive finite value and one to eight significant digits.');

  const [coefficient, exponentText] = value.toExponential(significantDigits - 1).split('e');

  if (!coefficient || !exponentText) throw new Error('A scientific number has its coefficient and exponent.');

  return `${coefficient}\\times10^{${Number(exponentText)}}`;
}

export function createDigitModel() {
  const x = data.x;
  const y = data.y;

  if (!/^[1-9]{8}$/u.test(x) || !/^[1-9]{8}$/u.test(y)) throw new Error('The canonical school illustration uses two eight-digit inputs with no zero digits.');

  const n = x.length;
  const xValue = BigInt(x);
  const yValue = BigInt(y);
  const xDigits = Array.from(x, Number);
  const yDigits = Array.from(y, Number);
  const school: SchoolCell[] = [];

  // x is above the square; y is at the left. Canonical Python school[xIndex][yIndex] is transposed for display.
  for (let yIndex = 0; yIndex < n; yIndex++) {
    for (let xIndex = 0; xIndex < n; xIndex++) {
      const xDigit = digitAt(xDigits, xIndex);
      const yDigit = digitAt(yDigits, yIndex);
      const value = xDigit * yDigit;
      const power = 2 * n - 2 - xIndex - yIndex;
      school.push({ id: yIndex * n + xIndex, xIndex, yIndex, xDigit, yDigit, value, power, weighted: BigInt(value) * 10n ** BigInt(power) });
    }
  }

  const diagonals: SchoolDiagonal[] = [];
  const digits: number[] = [];
  let carry = 0n;

  for (let power = 0; power <= 2 * n - 2 || carry > 0n; power++) {
    const cellIds: number[] = [];
    let rawSum = 0n;

    for (const cell of school) {
      if (cell.power !== power) continue;

      cellIds.push(cell.id);
      rawSum += BigInt(cell.value);
    }

    const carryIn = carry;
    const total = rawSum + carry;
    const digit = Number(total % 10n);
    carry = total / 10n;
    digits.push(digit);
    diagonals.push({ power, cellIds, rawSum, carryIn, total, digit, carryOut: carry });
  }

  const schoolProduct = BigInt(digits.reverse().join(''));
  const recursion = karatsubaTree(xValue, yValue, n);
  const product = recursion.tree.result;

  if (schoolProduct !== product || product !== xValue * yValue) throw new Error('Both carried arithmetic constructions produce the exact input product.');

  let carriedCount = 0;

  for (const leaf of recursion.leaves) {
    if (leaf.carried) carriedCount++;
  }

  const fftSize = 16;
  const fftLevels = buildFftLevels(fftSize);
  const gapReadings = [64, 1000, 1e6].map(log2n => ({ log2n, relativeGap: gapAt(log2n) }));

  return { x, y, xValue, yValue, n, xDigits, yDigits, school, diagonals, schoolProduct, product, productText: product.toString(), ...recursion, carriedCount, fftSize, fftLevels, gapReadings, halfSaving: halfSavingThreshold() };
}

export type DigitModel = ReturnType<typeof createDigitModel>;

export function nodeAt(model: DigitModel, path: string): KaratsubaNode {
  const node = model.nodesByPath.get(path);

  if (!node) throw new Error('Each carried recursion box has its computed path node.');

  return node;
}

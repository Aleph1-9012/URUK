import { DOMINO_CELLS, L_CELLS, L_VECTORS, ROW_SHIFTS } from './data';

export { DOMINO_CELLS, L_CELLS, L_VECTORS, ROW_SHIFTS } from './data';

export type GridPoint = { x: number; y: number };

export type GridWindow = { left: number; right: number; bottom: number; top: number };

export type CoverageCell = GridPoint & { count: number };

export type WindowCoverage = { cells: CoverageCell[]; exact: boolean; missing: GridPoint[]; overlaps: GridPoint[] };

export type PeriodWitness = { source: GridPoint; target: GridPoint; sourceShift: number; targetShift: number };

export type FinitePeriod = { vector: GridPoint; comparisons: number; holds: boolean | null; witness: PeriodWitness | null };

export const DOMINO_WINDOW = { left: -6, right: 7, bottom: 0, top: 24 } as const;

export const L_WINDOW = { left: -3, right: 4, bottom: -3, top: 4 } as const;

export const ALIGNED_SHIFTS = ROW_SHIFTS.map(() => 0);

function modulus(value: number, divisor: number): number {
  return (value % divisor + divisor) % divisor;
}

function validateWindow(window: GridWindow): void {
  if (!Object.values(window).every(Number.isInteger) || window.right <= window.left || window.top <= window.bottom) throw new RangeError('A lattice inspection window needs integer bounds and positive width and height.');
}

function validateRows(shifts: readonly number[], window: GridWindow): void {
  validateWindow(window);

  if (window.bottom < 0 || window.top > shifts.length || shifts.some(shift => shift !== 0 && shift !== 1)) throw new RangeError('The domino window must lie in the shipped zero-or-one row shifts.');
}

export function dominoTranslations(shifts: readonly number[] = ROW_SHIFTS, window: GridWindow = DOMINO_WINDOW): GridPoint[] {
  validateRows(shifts, window);
  const translations: GridPoint[] = [];

  for (let row = window.bottom; row < window.top; row++) {
    const shift = shifts[row];

    if (shift === undefined) throw new Error('Every shown domino row needs its exact shift.');

    const first = Math.ceil((window.left - 1 - shift) / 2);
    const end = Math.ceil((window.right - shift) / 2);

    for (let index = first; index < end; index++) translations.push({ x: 2 * index + shift, y: row });
  }

  return translations;
}

export function coverWindow(tile: readonly GridPoint[], translations: readonly GridPoint[], window: GridWindow): WindowCoverage {
  validateWindow(window);
  const counts = new Map<string, number>();

  for (const shift of translations) {
    for (const cell of tile) {
      const x = shift.x + cell.x;
      const y = shift.y + cell.y;

      if (!Number.isInteger(x) || !Number.isInteger(y)) throw new RangeError('The planar grid certificate uses integer tile cells and translations.');
      if (x < window.left || x >= window.right || y < window.bottom || y >= window.top) continue;

      const key = x + ',' + y;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const cells: CoverageCell[] = [];
  const missing: GridPoint[] = [];
  const overlaps: GridPoint[] = [];

  for (let y = window.bottom; y < window.top; y++) {
    for (let x = window.left; x < window.right; x++) {
      const count = counts.get(x + ',' + y) ?? 0;
      cells.push({ x, y, count });

      if (count === 0) missing.push({ x, y });
      if (count > 1) overlaps.push({ x, y });
    }
  }

  return { cells, exact: missing.length === 0 && overlaps.length === 0, missing, overlaps };
}

export function finitePeriod(shifts: readonly number[], vector: GridPoint, window: GridWindow = DOMINO_WINDOW): FinitePeriod {
  validateRows(shifts, window);

  if (!Number.isInteger(vector.x) || !Number.isInteger(vector.y)) throw new RangeError('The planar period test uses integer translation vectors.');

  const left = Math.max(window.left, window.left - vector.x);
  const right = Math.min(window.right, window.right - vector.x);
  let comparisons = 0;
  let witness: PeriodWitness | null = null;

  for (let row = window.bottom; row < window.top; row++) {
    const targetRow = row + vector.y;

    if (targetRow < window.bottom || targetRow >= window.top) continue;

    const sourceShift = shifts[row];
    const targetShift = shifts[targetRow];

    if (sourceShift === undefined || targetShift === undefined) throw new Error('Each inspected period needs both exact row shifts.');

    const first = left + modulus(sourceShift - left, 2);

    for (let x = first; x < right; x += 2) {
      comparisons++;

      if (modulus(x + vector.x - targetShift, 2) === 0) continue;
      if (!witness) witness = { source: { x, y: row }, target: { x: x + vector.x, y: targetRow }, sourceShift, targetShift };
    }
  }

  return { vector: { ...vector }, comparisons, holds: comparisons === 0 ? null : witness === null, witness };
}

export function quotientResidue(point: GridPoint): number {
  if (!Number.isInteger(point.x) || !Number.isInteger(point.y)) throw new RangeError('The L-tetromino quotient uses lattice points.');

  return modulus(point.x + 3 * point.y, 4);
}

export function latticeCoordinates(point: GridPoint): { i: number; j: number } | null {
  if (quotientResidue(point) !== 0) return null;

  // i*(-4,0)+j*(-3,1)=(x,y), so j=y and i=-(x+3y)/4.
  return { i: -(point.x + 3 * point.y) / 4, j: point.y };
}

export function lTranslations(window: GridWindow = L_WINDOW): GridPoint[] {
  validateWindow(window);
  const translations: GridPoint[] = [];

  for (let y = window.bottom - 2; y < window.top; y++) {
    const left = window.left - 1;
    const first = left + modulus(-3 * y - left, 4);

    for (let x = first; x < window.right; x += 4) translations.push({ x, y });
  }

  return translations;
}

export function buildTileModel() {
  const alignedTranslations = dominoTranslations(ALIGNED_SHIFTS);
  const shiftedTranslations = dominoTranslations(ROW_SHIFTS);
  const lPoints = lTranslations();
  const first = L_VECTORS[0];
  const second = L_VECTORS[1];
  const residues = L_CELLS.map(quotientResidue);

  return {
    window: DOMINO_WINDOW,
    aligned: {
      shifts: ALIGNED_SHIFTS,
      translations: alignedTranslations,
      coverage: coverWindow(DOMINO_CELLS, alignedTranslations, DOMINO_WINDOW),
      horizontal: finitePeriod(ALIGNED_SHIFTS, { x: 2, y: 0 }),
      vertical: finitePeriod(ALIGNED_SHIFTS, { x: 0, y: 1 }),
    },
    shifted: {
      shifts: ROW_SHIFTS,
      translations: shiftedTranslations,
      coverage: coverWindow(DOMINO_CELLS, shiftedTranslations, DOMINO_WINDOW),
      horizontal: finitePeriod(ROW_SHIFTS, { x: 2, y: 0 }),
      verticalTests: Array.from({ length: 12 }, (_, index) => finitePeriod(ROW_SHIFTS, { x: 0, y: index + 1 })),
    },
    l: {
      cells: L_CELLS,
      vectors: L_VECTORS,
      window: L_WINDOW,
      translations: lPoints,
      coverage: coverWindow(L_CELLS, lPoints, L_WINDOW),
      quotient: { modulus: 4, residues, determinant: first.x * second.y - first.y * second.x },
    },
  };
}

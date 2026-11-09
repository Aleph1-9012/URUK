import { expect, test } from 'bun:test';
import {
  BARKER13, KNOWN_ROWS, REMARK4, ROW4, ROW36, Turynsurvivors, allOnesWalk, aperiodic,
  circulant, coefficientRows, evaluations, fold, isPrimePower, periodic, slidePairs,
} from '../src/components/visuals/barker-echoes/math';

test('179: overlap counts, wrapped counts and the length-two exception remain distinct', () => {
  const expected = [13, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];

  for (let shift = 0; shift < BARKER13.length; shift++) {
    const pairs = slidePairs(BARKER13, shift);
    const agree = pairs.reduce((sum, pair) => sum + Number(pair.agree), 0);
    expect(pairs).toHaveLength(BARKER13.length - shift);
    expect(aperiodic(BARKER13, shift)).toBe(expected[shift] ?? 0);
    expect(agree - (pairs.length - agree)).toBe(expected[shift] ?? 0);
    expect(aperiodic(BARKER13, -shift)).toBe(expected[shift] ?? 0);

    for (const pair of pairs) {
      expect(pair.top - pair.bottom).toBe(shift);
      expect(pair.agree).toBe(BARKER13[pair.top] === BARKER13[pair.bottom]);
    }

    if (shift > 0) expect(periodic(BARKER13, shift)).toBe(1);
  }

  expect([1, 2, 3].map(shift => slidePairs(BARKER13, shift).filter(pair => pair.agree).length)).toEqual([6, 6, 5]);

  for (const row of Object.values(KNOWN_ROWS)) {
    for (let shift = 1; shift < row.length; shift++) {
      expect(Math.abs(aperiodic(row, shift))).toBeLessThanOrEqual(1);
      expect(periodic(row, shift)).toBe(aperiodic(row, shift) + aperiodic(row, row.length - shift));

      if (row.length > 2 && row.length % 2 === 0) expect(periodic(row, shift)).toBe(0);
    }
  }

  expect(periodic([1, 1], 1)).toBe(2);
  expect(periodic([1, -1], 1)).toBe(-2);
  expect(aperiodic(BARKER13, 13)).toBe(0);
});

test('179: the modulo-four fold and its coefficient rows agree with the reference, keeping both four-sign rows apart', () => {
  const grid = fold(ROW36, 3);
  const occupied = new Set<string>();

  for (const [index, sign] of ROW36.entries()) {
    const row = index % 4;
    const column = index % 9;
    const key = `${row},${column}`;
    expect(occupied.has(key)).toBe(false);
    occupied.add(key);
    expect(grid[row]?.[column]).toBe(sign);
  }

  expect(occupied.size).toBe(ROW36.length);
  const coefficients = coefficientRows(grid);
  expect(coefficients.c).toEqual([2, 0, 1, 0, 1, 0, 0, 0, 1]);
  expect(coefficients.d).toEqual([0, -2, 1, 0, -1, 0, 0, 0, 1]);
  expect(coefficients.g).toEqual([
    { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 1 }, { re: -1, im: -1 }, { re: -1, im: 0 },
    { re: 1, im: -1 }, { re: -1, im: -1 }, { re: -1, im: 1 }, { re: 0, im: 1 },
  ]);
  expect(evaluations(ROW4)).toEqual({ c: 1, d: -1, g: { re: -1, im: 0 } });
  expect(evaluations(REMARK4)).toEqual({ c: 1, d: 1, g: { re: 0, im: 1 } });
});

test('179: character walks close, Turyn filters prime powers, and the right-shift matrix is orthogonal', () => {
  for (const [u, orders] of [[3, [1, 3]], [15, [1, 3, 5, 15]]] as const) {
    for (const order of orders) {
      const path = allOnesWalk(u, order);
      const last = path[path.length - 1];
      expect(path).toHaveLength(u * u + 1);
      expect(last?.re).toBeCloseTo(order === 1 ? u * u : 0, 12);
      expect(last?.im).toBeCloseTo(0, 12);

      for (let index = 1; index < path.length; index++) {
        const before = path[index - 1];
        const after = path[index];

        if (!before || !after) throw new Error('Every character walk has consecutive points.');

        expect(Math.hypot(after.re - before.re, after.im - before.im)).toBeCloseTo(1, 12);
      }
    }
  }

  expect(Turynsurvivors()).toEqual([15, 21, 33, 35, 39, 45, 51, 55, 57, 63, 65, 69, 75, 77, 85, 87, 91, 93, 95, 99]);
  expect([2, 3, 4, 8, 9, 25, 27, 49, 81].every(isPrimePower)).toBe(true);
  expect([1, 6, 12, 15, 21, 35, 99].some(isPrimePower)).toBe(false);
  const matrix = circulant(ROW4);
  expect(matrix[0]).toEqual(ROW4.slice());
  expect(matrix[1]).toEqual([1, -1, 1, 1]);
  expect(matrix[3]).toEqual(REMARK4.slice());

  for (const [i, first] of matrix.entries()) {
    for (const [j, second] of matrix.entries()) {
      let dot = 0;

      for (let column = 0; column < first.length; column++) dot += (first[column] ?? 0) * (second[column] ?? 0);

      expect(dot).toBe(i === j ? first.length : 0);
    }
  }

  for (const row of [BARKER13, ROW4, REMARK4, ROW36]) {
    let total = 0;

    for (let shift = 0; shift < row.length; shift++) total += periodic(row, shift);

    const rowSum = row.reduce<number>((sum, sign) => sum + sign, 0);
    expect(total).toBe(rowSum * rowSum);
  }
});

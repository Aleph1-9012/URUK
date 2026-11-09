import { expect, test } from 'bun:test';
import { ALTERATION_REFERENCE, COLUMN_FIXTURE, ETA_REFERENCE, MINIMUM_REFERENCE, POOL26, RANDOM13 } from '../src/components/visuals/smallest-triangles/data';
import {
  BOUND_EXPONENTS, ETA, alteration, columnArea, columnDeterminant, gridSites, integerParabola,
  interpolatePoints, nearestFreeMatch, parabolaMinimum, parabolaPoints, projectedColumnPoints,
  smallestTriangle, triangleArea, triangleDeterminant, type ColumnTriple, type Point,
} from '../src/components/visuals/smallest-triangles/math';

function shoelace(a: Point, b: Point, c: Point): number {
  return Math.abs(a.x * b.y + b.x * c.y + c.x * a.y - a.y * b.x - b.y * c.x - c.y * a.x) / 2;
}

test('191: seeded minima and exact alteration agree with the reference while carried points use the live geometry', () => {
  const randomMinimum = smallestTriangle(RANDOM13);
  expect(randomMinimum.triple).toEqual([0, 10, 12]);
  expect(randomMinimum.area).toBeCloseTo(MINIMUM_REFERENCE[0].area, 14);
  const grid = gridSites();
  expect(smallestTriangle(grid)).toEqual({ triple: [0, 1, 2], determinant: 0, area: 0 });
  const deleted = alteration();
  expect(deleted.smallTriangles).toEqual(ALTERATION_REFERENCE.smallTriangles.slice());
  expect(deleted.deletedIndices).toEqual(ALTERATION_REFERENCE.deleted.slice());
  expect(deleted.deletionOrder).toEqual(ALTERATION_REFERENCE.deletionOrder.slice());
  expect(deleted.survivorIndices).toEqual(ALTERATION_REFERENCE.survivors.slice());
  expect(deleted.smallTriangles).toHaveLength(78);
  expect(deleted.survivors).toHaveLength(13);
  expect(smallestTriangle(deleted.survivors).area).toBeCloseTo(MINIMUM_REFERENCE[4].area, 14);
  expect(smallestTriangle(deleted.survivors).area).toBeGreaterThanOrEqual(deleted.threshold);

  for (const triple of deleted.smallTriangles) expect(triple.some(vertex => deleted.deletedIndices.includes(vertex))).toBe(true);

  const assignment = nearestFreeMatch(RANDOM13, grid);
  expect(new Set(assignment).size).toBe(RANDOM13.length);
  const free = new Set(grid.map((_, index) => index));
  const targets: Point[] = [];

  for (const [index, selected] of assignment.entries()) {
    const from = RANDOM13[index];
    const target = grid[selected];

    if (!from || !target) throw new Error('Each carried point has a target.');

    const selectedDistance = (target.x - from.x) ** 2 + (target.y - from.y) ** 2;

    for (const candidate of free) {
      const other = grid[candidate];

      if (!other) continue;

      expect(selectedDistance).toBeLessThanOrEqual((other.x - from.x) ** 2 + (other.y - from.y) ** 2);
    }

    free.delete(selected);
    targets.push(target);
  }

  expect(nearestFreeMatch([{ x: .5, y: 0 }], [{ x: 0, y: 0 }, { x: 1, y: 0 }])).toEqual([0]);

  for (const amount of [0, .17, .5, .81, 1]) {
    const carried = interpolatePoints(RANDOM13, targets, amount);
    let independentMinimum = Infinity;

    for (let i = 0; i < carried.length - 2; i++) {
      for (let j = i + 1; j < carried.length - 1; j++) {
        for (let k = j + 1; k < carried.length; k++) {
          const a = carried[i];
          const b = carried[j];
          const c = carried[k];

          if (!a || !b || !c) continue;

          independentMinimum = Math.min(independentMinimum, shoelace(a, b, c));
        }
      }
    }

    expect(smallestTriangle(carried).area).toBeCloseTo(independentMinimum, 13);
  }

  expect(POOL26[0]).not.toEqual(RANDOM13[0]);
});

test('191: integer parabola determinants preserve exact ties and the homogeneous-column area is projectively invariant', () => {
  for (const prime of [3, 5, 7, 13]) {
    const points = integerParabola(prime);
    let minimum = Infinity;

    for (let i = 0; i < prime - 2; i++) {
      for (let j = i + 1; j < prime - 1; j++) {
        for (let k = j + 1; k < prime; k++) {
          const a = points[i];
          const b = points[j];
          const c = points[k];

          if (!a || !b || !c) throw new Error('The parabola has one point per field label.');

          const determinant = triangleDeterminant(a, b, c);
          expect(Number.isInteger(determinant)).toBe(true);
          expect(determinant).not.toBe(0);
          const product = (j - i) * (k - i) * (k - j);
          expect((determinant - product) % prime === 0).toBe(true);
          minimum = Math.min(minimum, Math.abs(determinant));
        }
      }
    }

    const exact = parabolaMinimum(prime);
    expect(exact.numerator).toBe(minimum);
    expect(exact.area).toBe(minimum / (2 * prime * prime));
    expect(parabolaPoints(prime)).toHaveLength(prime);
  }

  const exact = parabolaMinimum();
  expect(exact.triple).toEqual([0, 1, 4]);
  expect(exact.determinant).toBe(-1);
  expect(exact.numerator).toBe(1);
  expect(exact.denominator).toBe(338);
  const integer = integerParabola();
  let largestDeterminant = 0;

  for (let i = 0; i < 11; i++) {
    for (let j = i + 1; j < 12; j++) {
      for (let k = j + 1; k < 13; k++) {
        const a = integer[i];
        const b = integer[j];
        const c = integer[k];

        if (a && b && c) largestDeterminant = Math.max(largestDeterminant, Math.abs(triangleDeterminant(a, b, c)));
      }
    }
  }

  expect(largestDeterminant).toBe(139);
  const formula = columnArea();
  expect(formula).toEqual({ determinant: 429, numerator: 33, denominator: 680, area: 33 / 680 });
  const projected = projectedColumnPoints();
  const [a, b, c] = projected;

  if (!a || !b || !c) throw new Error('Three columns project to three points.');

  expect(triangleArea(a, b, c)).toBeCloseTo(formula.area, 14);
  const scaled: ColumnTriple = [
    [COLUMN_FIXTURE[0][0] * 2, COLUMN_FIXTURE[0][1] * 2, COLUMN_FIXTURE[0][2] * 2],
    [COLUMN_FIXTURE[1][0] * 3, COLUMN_FIXTURE[1][1] * 3, COLUMN_FIXTURE[1][2] * 3],
    [COLUMN_FIXTURE[2][0] * 5, COLUMN_FIXTURE[2][1] * 5, COLUMN_FIXTURE[2][2] * 5],
  ];
  expect(projectedColumnPoints(scaled)).toEqual(projected);
  expect(columnArea(scaled).numerator).toBe(formula.numerator);
  expect(columnArea(scaled).denominator).toBe(formula.denominator);
  expect(columnDeterminant(scaled)).toBe(formula.determinant * 30);
  expect(columnArea([COLUMN_FIXTURE[0], COLUMN_FIXTURE[0], COLUMN_FIXTURE[2]]).area).toBe(0);
});

test('191: independent Pascal coefficients reproduce the exact eta, with the claimed tick unresolved at every shown zoom', () => {
  const row = Array<bigint>(42).fill(0n);
  row[0] = 1n;

  for (let n = 1; n <= 163; n++) {
    for (let k = Math.min(n, 41); k > 0; k--) row[k] = (row[k] ?? 0n) + (row[k - 1] ?? 0n);
  }

  const M = row[41] ?? 0n;
  const T = M * (M - 1n) * (M - 2n) / 6n;
  expect(M.toString()).toBe(ETA_REFERENCE.M);
  expect(T.toString()).toBe(ETA_REFERENCE.T);
  expect(ETA.M).toBe(M);
  expect(ETA.k).toBe(T ** 2n + 1n);
  expect(ETA.denominator.toString()).toBe(ETA_REFERENCE.denominator);
  expect(ETA.M.toString()).toHaveLength(39);
  expect(ETA.k.toString()).toHaveLength(232);
  expect(ETA.value / ETA_REFERENCE.eta).toBeCloseTo(1, 12);
  expect(ETA.value * ETA.digitsForTwo).toBeCloseTo(Math.log10(2), 14);
  const logN = ETA.digitsToBeatLog * Math.LN10;
  expect(ETA.value * logN / Math.log(logN)).toBeCloseTo(1, 14);

  for (const zoom of [10, 100, 200]) {
    expect(ETA.value * 10 ** zoom).toBeLessThan(Number.EPSILON);
    expect(BOUND_EXPONENTS.heilbronn + ETA.value * 10 ** zoom).toBe(BOUND_EXPONENTS.heilbronn);
  }

  expect(BOUND_EXPONENTS.cpz2025).toBeLessThan(BOUND_EXPONENTS.cpz2023);
  expect(BOUND_EXPONENTS.cpz2023).toBeLessThan(BOUND_EXPONENTS.kps1981);
  expect(BOUND_EXPONENTS.kps1981).toBeLessThan(BOUND_EXPONENTS.roth);
});

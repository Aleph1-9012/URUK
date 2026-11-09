import { expect, test } from 'bun:test';
import { MODE_REFERENCES, SCATTER, SCATTER_GRID, SELECTED_HIGH_CELL, SELECTED_LOW_CELL } from '../src/components/visuals/silent-lines/data';
import { computeContour, frequency, growthAt, growthCell, measuredRatio, modeGradient, modeValue, perSquareLengths, referenceFor, wedgeBounds, type Contour, type Mode, type Point } from '../src/components/visuals/silent-lines/math';

const contours = new Map<string, Contour>();

function contourFor(mode: Mode): Contour {
  const key = `${mode.m},${mode.n},${mode.sign}`;
  const existing = contours.get(key);

  if (existing) return existing;

  const contour = computeContour(mode);
  contours.set(key, contour);

  return contour;
}

function distanceToContour(point: Point, contour: Contour): number {
  let distance = Infinity;

  for (let index = 0; index < contour.segments.length; index += 4) {
    const ax = contour.segments[index] ?? 0;
    const ay = contour.segments[index + 1] ?? 0;
    const dx = (contour.segments[index + 2] ?? 0) - ax;
    const dy = (contour.segments[index + 3] ?? 0) - ay;
    const t = Math.max(0, Math.min(1, ((point.x - ax) * dx + (point.y - ay) * dy) / (dx * dx + dy * dy)));
    distance = Math.min(distance, Math.hypot(ax + dx * t - point.x, ay + dy * t - point.y));
  }

  return distance;
}

test('350: exact product and unit-diagonal contours, symmetry lines and analytic derivatives agree with the field', () => {
  for (const [m, n] of [[1, 0], [2, 1], [3, 2], [5, 3], [7, 4], [9, 9]]) {
    if (m === undefined || n === undefined) throw new Error('A product mode has two frequencies.');

    const mode: Mode = { m, n, sign: 0 };
    const contour = computeContour(mode);
    expect(contour.length).toBe(m + n);

    for (const path of contour.paths) {
      expect(Math.abs(modeValue(mode, path[0] ?? 0, path[1] ?? 0))).toBeLessThan(1e-12);
      expect(Math.abs(modeValue(mode, path[2] ?? 0, path[3] ?? 0))).toBeLessThan(1e-12);
    }
  }

  for (const sign of [-1, 1] as const) {
    const contour = computeContour({ m: 0, n: 1, sign });
    expect(contour.length).toBe(Math.SQRT2);
    expect(contour.paths[0]).toEqual(new Float64Array(sign === -1 ? [0, 0, 1, 1] : [0, 1, 1, 0]));
  }

  for (const { mode } of MODE_REFERENCES) {
    for (const t of [.07, .23, .51, .86]) {
      if (mode.sign === -1) expect(Math.abs(modeValue(mode, t, t))).toBeLessThan(1e-13);
      if ((mode.m + mode.n) % 2 === 1 && mode.sign === 1) expect(Math.abs(modeValue(mode, t, 1 - t))).toBeLessThan(1e-13);
    }

    for (const [x, y] of [[.153, .337], [.371, .811]]) {
      if (x === undefined || y === undefined) throw new Error('A derivative probe has two coordinates.');

      const h = 1e-6;
      const gradient = modeGradient(mode, x, y);
      expect(gradient.x).toBeCloseTo((modeValue(mode, x + h, y) - modeValue(mode, x - h, y)) / (2 * h), 6);
      expect(gradient.y).toBeCloseTo((modeValue(mode, x, y + h) - modeValue(mode, x, y - h)) / (2 * h), 6);
      const step = 1e-4;
      const laplacian = (modeValue(mode, x + step, y) + modeValue(mode, x - step, y) + modeValue(mode, x, y + step) + modeValue(mode, x, y - step) - 4 * modeValue(mode, x, y)) / step ** 2;
      expect(Math.abs(laplacian + frequency(mode) ** 2 * modeValue(mode, x, y)) / frequency(mode) ** 2).toBeLessThan(1e-5);
    }
  }
});

test('350: six computed contours retain the exact symmetry lines and the 230 measured modes fit their data wedge', () => {
  for (const reference of MODE_REFERENCES) {
    const contour = contourFor(reference.mode);
    expect(Math.abs(contour.length / reference.length - 1)).toBeLessThan(.005);
    expect(contour.segments.length % 4).toBe(0);
    let pathLength = 0;

    for (const path of contour.paths) {
      for (let index = 2; index < path.length; index += 2) pathLength += Math.hypot((path[index] ?? 0) - (path[index - 2] ?? 0), (path[index + 1] ?? 0) - (path[index - 1] ?? 0));
    }

    expect(pathLength).toBeCloseTo(contour.length, 9);

    for (const t of [.12, .38, .67, .91]) {
      if (reference.mode.sign === -1) expect(distanceToContour({ x: t, y: t }, contour)).toBeLessThan(2 / contour.grid);
      if (reference.mode.sign === 1 && (reference.mode.m + reference.mode.n) % 2 === 1) expect(distanceToContour({ x: t, y: 1 - t }, contour)).toBeLessThan(2 / contour.grid);
    }

    for (let index = 0; index < contour.segments.length; index += 800) {
      const x = ((contour.segments[index] ?? 0) + (contour.segments[index + 2] ?? 0)) / 2;
      const y = ((contour.segments[index + 1] ?? 0) + (contour.segments[index + 3] ?? 0)) / 2;
      expect(x >= 0 && x < 1 && y >= 0 && y < 1).toBe(true);
      expect(Math.abs(modeValue(reference.mode, x, y))).toBeLessThan(.002);
    }
  }

  const wedge = wedgeBounds();
  expect(SCATTER).toHaveLength(230);
  expect(wedge.upperMode).toEqual({ m: 1, n: 3, sign: -1 });
  expect(wedge.upper).toBeGreaterThan(Math.SQRT2 / Math.PI);
  expect(wedge.upper).toBeLessThan(.486);

  for (const [m, n, sign, k, length] of SCATTER) {
    expect(k).toBeCloseTo(frequency({ m, n, sign }), 12);
    expect(length / k + 1e-14).toBeGreaterThanOrEqual(wedge.lower);
    expect(length / k).toBeLessThanOrEqual(wedge.upper);
    if (sign === 0) expect(length).toBe(m + n);
  }

  for (const mode of [{ m: 1, n: 3, sign: -1 }, { m: 0, n: 1, sign: 1 }, { m: 5, n: 8, sign: 1 }] as const) {
    const row = SCATTER.find(([m, n, sign]) => m === mode.m && n === mode.n && sign === mode.sign);

    if (!row) throw new Error('Every sampled mode appears in the scatter.');

    const contour = computeContour(mode, SCATTER_GRID);
    expect(Math.abs(contour.length / row[4] - 1)).toBeLessThan(.005);
    expect(measuredRatio(mode, contour.length)).toBeCloseTo(contour.length / row[3], 12);
  }
});

function cartesianDiskIntegral(mode: Mode, centre: Point, radius: number): number {
  const grid = 160;
  const step = 2 * radius / grid;
  let integral = 0;

  for (let i = 0; i < grid; i++) {
    const x = -radius + (i + .5) * step;

    for (let j = 0; j < grid; j++) {
      const y = -radius + (j + .5) * step;

      if (x * x + y * y >= radius * radius) continue;

      const value = modeValue(mode, centre.x + x, centre.y + y);
      integral += value * value * step * step;
    }
  }

  return integral;
}

test('350: R4 growth agrees with independent disk integration and the canonical cells match computed local lengths', () => {
  for (const expected of MODE_REFERENCES) {
    const measured = referenceFor(expected.mode, contourFor(expected.mode));
    expect(measured.q).toBe(expected.q);
    expect(measured.growth).toHaveLength(expected.q ** 2);
    expect(measured.perSquareLength).toHaveLength(expected.q ** 2);
    expect(measured.growthMin).toBeCloseTo(expected.growthMin, 10);
    expect(measured.growthMean).toBeCloseTo(expected.growthMean, 10);
    expect(measured.growthMax).toBeCloseTo(expected.growthMax, 10);
    expect(measured.highSquares).toBe(expected.highSquares);
    expect(measured.localBound).toBeCloseTo(expected.localBound, 10);
    expect(measured.totalBound).toBeCloseTo(expected.totalBound, 9);
  }

  const mode: Mode = { m: 3, n: 5, sign: 1 };
  const reference = referenceFor(mode);
  const expected = MODE_REFERENCES.find(row => row.mode.m === mode.m && row.mode.n === mode.n && row.mode.sign === mode.sign);

  if (!expected) throw new Error('The selected mode has an independent Python summary.');

  for (const [x, y] of [SELECTED_HIGH_CELL, SELECTED_LOW_CELL, [0, 0], [9, 9]]) {
    if (x === undefined || y === undefined) throw new Error('A growth cell has two coordinates.');

    const cell = growthCell(mode, x, y);
    expect(growthAt(mode, reference.q, x, y)).toBeCloseTo(cell.E, 10);
  }

  for (const [x, y] of [SELECTED_HIGH_CELL, SELECTED_LOW_CELL]) {
    const cell = growthCell(mode, x, y);
    const independent = Math.log(cartesianDiskIntegral(mode, cell.centre, 4 / reference.q) / cartesianDiskIntegral(mode, cell.centre, 1 / reference.q)) / 2;
    expect(Math.abs(independent - cell.E)).toBeLessThan(.005);
  }

  const high = growthCell(mode, ...SELECTED_HIGH_CELL);
  const low = growthCell(mode, ...SELECTED_LOW_CELL);
  const mean = reference.growth.reduce((sum, E) => sum + E, 0) / reference.growth.length;
  expect(high.E).toBeCloseTo(Math.max(...reference.growth), 12);
  expect(low.E).toBeCloseTo(Math.min(...reference.growth), 12);
  expect(mean).toBeCloseTo(expected.growthMean, 10);
  expect(reference.growth.filter(E => E > mean + 1)).toHaveLength(expected.highSquares);
  expect(reference.growthArgmin).toEqual(SELECTED_LOW_CELL);
  expect(reference.growthArgmax).toEqual(SELECTED_HIGH_CELL);
  expect(low.length).toBe(0);
  const computed = perSquareLengths(contourFor(mode), reference.q);
  expect(computed.reduce((sum, length) => sum + length, 0)).toBeCloseTo(contourFor(mode).length, 9);
  expect(computed[SELECTED_HIGH_CELL[0] * reference.q + SELECTED_HIGH_CELL[1]]).toBeCloseTo(high.length, 10);
  expect(computed[SELECTED_LOW_CELL[0] * reference.q + SELECTED_LOW_CELL[1]]).toBe(0);
  let largestRatio = 0;

  for (const [index, length] of computed.entries()) largestRatio = Math.max(largestRatio, length * reference.q / (1 + (reference.growth[index] ?? 0)));

  expect(largestRatio).toBeCloseTo(expected.localBound, 10);
  expect(largestRatio).toBeLessThan(.47);
  expect(contourFor(mode).length).toBeLessThan(.47 * reference.q * (1 + mean));
});

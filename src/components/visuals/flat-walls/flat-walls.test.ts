import { expect, test } from 'bun:test';
import { buildFlatWallsModel, circularAnalyticResidual, circularResidual, circularValue, coneNorms, conePoint, direction, flatGradient, flatLaplacian, flatValue, laplacianResidual, profile, profilePrime, profileSecond, stippleDensity, type Point, type Vector4, type Vector8 } from './math';

function scale4(point: Vector4, scale: number): Vector4 {
  return [point[0] * scale, point[1] * scale, point[2] * scale, point[3] * scale];
}

function negative8(point: Vector8): Vector8 {
  return [-point[0], -point[1], -point[2], -point[3], -point[4], -point[5], -point[6], -point[7]];
}

function independentNorm(values: readonly number[]): number {
  let sum = 0;

  for (const value of values) sum += value ** 2;

  return Math.sqrt(sum);
}

test('375: analytic walls agree with independent calculus and second-order differences, while the radial illustration fails the equation on an annulus', () => {
  const h = .002;

  for (let index = 0; index <= 24; index++) {
    const s = -.125 + (index - 12) / 4;
    const first = (profile(s + h) - profile(s - h)) / (2 * h);
    const second = (profile(s + h) - 2 * profile(s) + profile(s - h)) / (h * h);
    expect(Math.abs(first - profilePrime(s))).toBeLessThan(1e-6);
    expect(Math.abs(second - profileSecond(s))).toBeLessThan(1e-6);
    expect(profilePrime(s)).toBeGreaterThan(0);
  }

  const model = buildFlatWallsModel();

  for (const wall of model.walls) {
    expect(Math.abs(wall.e.x ** 2 + wall.e.y ** 2 - 1)).toBeLessThan(3e-16);
    const errors: number[] = [];

    for (const step of [.04, .02, .01]) {
      let maximum = 0;

      for (const sample of wall.samples) {
        const point = sample.point;
        const value = flatValue(point, wall.e, wall.offset);
        const analytic = flatLaplacian(point, wall.e, wall.offset) - (value ** 3 - value);
        expect(Math.abs(analytic)).toBeLessThan(5e-16);
        maximum = Math.max(maximum, Math.abs(laplacianResidual(p => flatValue(p, wall.e, wall.offset), point, step)));
        const gradient = flatGradient(point, wall.e, wall.offset);
        expect(Math.abs(-wall.e.y * gradient.x + wall.e.x * gradient.y)).toBeLessThan(2e-16);
        expect(wall.e.x * gradient.x + wall.e.y * gradient.y).toBeGreaterThan(0);
      }

      errors.push(maximum);
    }

    const coarse = errors[0];
    const medium = errors[1];
    const fine = errors[2];

    if (coarse === undefined || medium === undefined || fine === undefined) throw new Error('Convergence comparison needs its three sampled grid widths.');

    expect(coarse / medium).toBeGreaterThan(3.98);
    expect(coarse / medium).toBeLessThan(4.02);
    expect(medium / fine).toBeGreaterThan(3.98);
    expect(medium / fine).toBeLessThan(4.02);
    expect(fine).toBeLessThan(1e-4);
    const tangent = { x: -wall.e.y, y: wall.e.x };
    const normalValues = [-2, 0, 2].map(s => stippleDensity(flatValue({ x: wall.e.x * s, y: wall.e.y * s }, wall.e, 0)));
    const [dense, middle, sparse] = normalValues;

    if (dense === undefined || middle === undefined || sparse === undefined) throw new Error('The monotonicity check needs its three actual phase samples.');

    expect(dense).toBeGreaterThan(middle);
    expect(middle).toBeGreaterThan(sparse);
    expect(Math.abs(flatValue({ x: tangent.x * 2, y: tangent.y * 2 }, wall.e, wall.offset) - flatValue({ x: 0, y: 0 }, wall.e, wall.offset))).toBeLessThan(3e-16);
  }

  for (const radius of [.7, 1.6, 3, 4.4]) {
    for (const theta of [0, .37, 1.7]) {
      const point = { x: radius * Math.cos(theta), y: radius * Math.sin(theta) };
      expect(Math.abs(circularResidual(point, .002) - circularAnalyticResidual(point))).toBeLessThan(1e-5);
    }
  }

  expect(Math.abs(circularResidual({ x: 3, y: 0 }) - 1 / (3 * Math.SQRT2))).toBeLessThan(1e-4);
  expect(circularResidual({ x: 3, y: 0 })).toBeGreaterThan(.2);
  expect(() => circularResidual({ x: 0, y: 0 })).toThrow();
  const rightSlope = (circularValue({ x: .0001, y: 0 }) - circularValue({ x: 0, y: 0 })) / .0001;
  const leftSlope = (circularValue({ x: -.0001, y: 0 }) - circularValue({ x: 0, y: 0 })) / -.0001;
  expect(rightSlope).toBeGreaterThan(0);
  expect(leftSlope).toBeLessThan(0);
  const e = direction(.71);
  const point: Point = { x: .6, y: -.8 };
  const slope = flatGradient(point, e, -.4);
  const numeric = (flatValue({ x: point.x + h, y: point.y }, e, -.4) - flatValue({ x: point.x - h, y: point.y }, e, -.4)) / (2 * h);
  expect(Math.abs(slope.x - numeric)).toBeLessThan(1e-6);
});

test('375: eight-dimensional cone normalization preserves source directions and block equality; the norm display is a nonlinear many-to-one projection', () => {
  const source: readonly [Vector4, Vector4][] = [
    [[1, -2, 3, -.5], [2, .25, -1, 4]],
    [[-.1, .7, -1.3, 2.1], [-3, .2, 1, -1]],
  ];

  for (const [a, b] of source) {
    const result = conePoint(a, b);
    const first = result.point.slice(0, 4);
    const second = result.point.slice(4);
    const na = independentNorm(first);
    const nb = independentNorm(second);
    expect(Math.abs(na - nb)).toBeLessThan(1e-14);

    for (let index = 0; index < 4; index++) {
      expect(first[index]).toBe(a[index]);

      for (let other = 0; other < 4; other++) {
        const bi = b[index];
        const bj = b[other];
        const si = second[index];
        const sj = second[other];

        if (bi === undefined || bj === undefined || si === undefined || sj === undefined) throw new Error('Direction preservation needs both coordinate pairs.');

        expect(Math.abs(si * bj - sj * bi)).toBeLessThan(1e-13);
      }
    }

    const rescaled = conePoint(scale4(a, 2.7), scale4(b, .31));

    for (let index = 0; index < 8; index++) {
      const actual = rescaled.point[index];
      const original = result.point[index];

      if (actual === undefined || original === undefined) throw new Error('Homogeneity needs all eight coordinates.');

      expect(Math.abs(actual - 2.7 * original)).toBeLessThan(1e-13);
    }

    const opposite = coneNorms(negative8(result.point));
    expect(Math.abs(opposite.rho1 - result.rho1)).toBeLessThan(1e-14);
    expect(Math.abs(opposite.rho2 - result.rho2)).toBeLessThan(1e-14);
    expect(opposite.rho1).toBeGreaterThan(0);
  }

  for (const result of buildFlatWallsModel().cone.points) {
    const first = independentNorm(result.point.slice(0, 4));
    const second = independentNorm(result.point.slice(4));
    expect(Math.abs(first - second)).toBeLessThan(1e-13);
    expect(Math.abs(result.equationResidual)).toBeLessThan(1e-12);
    expect(result.point.length).toBe(8);
  }
});

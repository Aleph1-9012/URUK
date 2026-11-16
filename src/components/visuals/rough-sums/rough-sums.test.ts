import { expect, test } from 'bun:test';
import reference from './test-fixture.json';
import { buildRoughSumsData, computeCoefficients, evaluateFunction, interpolatedSum, logAddExp, partialSum, preparePlot, summationPath } from './math';

const data = buildRoughSumsData();

test('075: live Simpson coefficients agree with independent Gauss quadrature and refine at the expected accuracy', () => {
  const finer = computeCoefficients(200, 40, .00025);
  expect(data.coefficients).toHaveLength(reference.coefficients.length);

  for (const [k, oracle] of reference.coefficients.entries()) {
    const coefficient = data.coefficients[k];
    const refined = finer[k];

    if (coefficient === undefined || refined === undefined) throw new Error('Every checked Fourier frequency must be computed.');

    expect(Math.abs(coefficient - oracle)).toBeLessThan(6e-10);
    expect(Math.abs(refined - oracle)).toBeLessThan(4e-11);
  }

  const constant = data.coefficients[0];

  if (constant === undefined) throw new Error('The normalized mean needs its constant coefficient.');

  expect(constant).toBeCloseTo(1 / (2 * Math.PI), 12);
  expect(data.audit.zeroCoefficientError).toBeLessThan(1e-12);

  for (const point of reference.points) {
    expect(evaluateFunction(point.x)).toBeCloseTo(point.f, 13);
    expect(evaluateFunction(-point.x)).toBeCloseTo(point.f, 13);
    expect(evaluateFunction(point.x + 2 * Math.PI)).toBeCloseTo(point.f, 13);
  }
});

test('075: partial sums recover the Fourier frequencies, match pointwise oracles, and add one cosine between integer orders', () => {
  const cache = preparePlot(data.coefficients);
  const samples = Array.from({ length: 512 }, (_, index) => {
    const x = 2 * Math.PI * index / 512;

    return { x, y: partialSum(data.coefficients, 200, x) };
  });

  for (const k of [0, 1, 5, 20, 199, 200]) {
    let real = 0;
    let imaginary = 0;

    for (const sample of samples) {
      real += sample.y * Math.cos(k * sample.x) / samples.length;
      imaginary -= sample.y * Math.sin(k * sample.x) / samples.length;
    }

    const expected = reference.coefficients[k];

    if (expected === undefined) throw new Error('Every recovered frequency has a Gauss-quadrature reference.');

    expect(real).toBeCloseTo(expected, 8);
    expect(Math.abs(imaginary)).toBeLessThan(1e-12);
  }

  for (const point of reference.points) {
    const path = summationPath(data.coefficients, 200, point.x);
    const positive = cache.x.indexOf(point.x);
    const negative = cache.x.indexOf(-point.x);
    expect(positive).toBeGreaterThanOrEqual(0);
    expect(negative).toBeGreaterThanOrEqual(0);

    for (const [index, order] of reference.orders.entries()) {
      const expected = point.sums[index];
      const atStep = path[order];
      const cached = cache.partialValues[order];

      if (expected === undefined || atStep === undefined || !cached) throw new Error('Every illustrated summation step has its independent pointwise reference.');

      expect(partialSum(data.coefficients, order, point.x)).toBeCloseTo(expected, 7);
      expect(atStep).toBeCloseTo(expected, 7);
      expect(cached[positive]).toBeCloseTo(expected, 7);
      expect(cached[negative]).toBeCloseTo(expected, 7);
    }

    const before = partialSum(data.coefficients, 20, point.x);
    const after = partialSum(data.coefficients, 21, point.x);
    expect(interpolatedSum(data.coefficients, 20.375, point.x)).toBeCloseTo(.625 * before + .375 * after, 13);
  }

  const near = reference.points.find(point => point.x === .05);

  if (!near) throw new Error('The slow near-spike sequence must be checked.');

  expect(partialSum(data.coefficients, 20, near.x)).toBeGreaterThan(partialSum(data.coefficients, 50, near.x));
  expect(partialSum(data.coefficients, 50, near.x)).toBeGreaterThan(partialSum(data.coefficients, 100, near.x));
  expect(Math.abs(partialSum(data.coefficients, 200, near.x) - near.f)).toBeGreaterThan(.05);
  expect(cache.functionValues[cache.x.indexOf(0)]).toBe(Infinity);
  expect(() => partialSum(data.coefficients, 20.5, 0)).toThrow();
  expect(() => interpolatedSum(data.coefficients, 201, 0)).toThrow();
});

test('075: stable normalized Orlicz integrals match independent quadrature and distinguish saturation from logarithmic growth', () => {
  for (const row of data.integrals) {
    const oracle = reference.integrals.find(expected => expected.T === row.T);

    if (!oracle) throw new Error('Every displayed cutoff has an independent integral reference.');

    expect(Math.abs(row.k3 - oracle.k3)).toBeLessThan(2e-10);
    expect(Math.abs(row.k2 - oracle.k2)).toBeLessThan(2e-10);
  }

  const previous = data.integrals.at(-2);
  const last = data.integrals.at(-1);

  if (!previous || !last) throw new Error('The growth comparison needs two final cutoffs.');

  expect(last.k3 - previous.k3).toBeGreaterThan(0);
  expect(last.k3 - previous.k3).toBeLessThan(4e-7);
  expect(last.k2 - previous.k2).toBeCloseTo(Math.log(last.T / previous.T) / Math.PI, 3);
  expect(logAddExp(Math.log(2), 1e8)).toBe(1e8);
  expect(logAddExp(1e8, Math.log(2))).toBe(1e8);
  expect(logAddExp(-1000, -1000)).toBeCloseTo(-1000 + Math.log(2), 13);
});

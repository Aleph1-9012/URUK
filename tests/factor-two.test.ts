import { expect, test } from 'bun:test';
import {
  A, BLOCK_SWAP, D, E, IDENTITY, LOWER, SWAP, U0, UPPER, absolute, applyRealMatrix, bandData,
  domainU, ellipseMatrix, multiplyMatrix, numericalRangeBoundary, numericalValue, openingMatrix,
  operatorNorm, positivityAt, realEntries, realMatrix, resolvent, sweepVector, topSingularPairReal,
} from '../src/components/visuals/factor-two/math';

test('325: stretching, the opening dip, and the exact disk-to-ellipse ranges come from the matrices', () => {
  expect(operatorNorm(D)).toBe(1.5);
  expect(operatorNorm(openingMatrix(.35))).toBeCloseTo(1.223, 3);
  expect(operatorNorm(A)).toBe(2);
  expect(applyRealMatrix(A, { x: 0, y: 1 })).toEqual({ x: 2, y: 0 });

  for (const amount of [0, .5, 1]) {
    const boundary = numericalRangeBoundary(ellipseMatrix(amount), 240);
    let maxX = 0;
    let maxY = 0;

    for (const point of boundary) {
      maxX = Math.max(maxX, Math.abs(point.x));
      maxY = Math.max(maxY, Math.abs(point.y));
      expect(point.x ** 2 / (1 + amount ** 2) + point.y ** 2).toBeCloseTo(1, 12);
    }

    expect(maxX).toBeCloseTo(Math.sqrt(1 + amount ** 2), 12);
    expect(maxY).toBeCloseTo(1, 12);
  }

  for (let index = 0; index <= 24; index++) {
    const theta = index * Math.PI / 48;
    const phase = index * .73;
    const value = numericalValue(sweepVector(theta, phase), A);
    expect(value.re).toBeCloseTo(Math.sin(2 * theta) * Math.cos(phase), 13);
    expect(value.im).toBeCloseTo(Math.sin(2 * theta) * Math.sin(phase), 13);
    expect(absolute(value)).toBeLessThanOrEqual(1 + 1e-14);
  }

  const pair = topSingularPairReal(E);
  expect(pair.norm).toBeCloseTo(1 + Math.sqrt(2), 13);
  expect(pair.input.x).toBeCloseTo(.3826834323650898, 13);
  expect(pair.input.y).toBeCloseTo(.9238795325112867, 13);
  expect(pair.output.x).toBeCloseTo(.9238795325112867, 13);
  expect(pair.output.y).toBeCloseTo(-.3826834323650898, 13);
  expect(multiplyMatrix(E, E)).toEqual(IDENTITY);
});

test('325: the similarity and complete sharp example preserve their exact order', () => {
  const similar = multiplyMatrix(multiplyMatrix(realMatrix(1, 0, 0, 2), A), realMatrix(1, 0, 0, .5));
  expect(realEntries(similar)).toEqual([0, 1, 0, 0]);
  expect(operatorNorm(similar)).toBe(1);
  expect(operatorNorm(SWAP)).toBe(1);
  expect(BLOCK_SWAP).toEqual([[0, 0, 0, 2], [0, 0, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  expect(realEntries(multiplyMatrix(UPPER, LOWER))).toEqual([1, 0, 0, 0]);
  expect(realEntries(multiplyMatrix(LOWER, UPPER))).toEqual([0, 0, 0, 1]);
});

test('325: confocal positivity approaches zero at the range and the drawn shrink stops there', () => {
  const expected = [.632, .352, .097, .020, 0, -.104];

  for (const [index, offset] of [.4, .2, .05, .01, 0, -.05].entries()) {
    const values = bandData(U0 + offset, 360);
    const minimum = Math.min(...values.map(sample => sample.value));
    expect(minimum).toBeCloseTo(expected[index] ?? 0, 3);
  }

  let mean00 = 0;
  let mean01 = 0;
  let mean11 = 0;

  for (let index = 0; index < 360; index++) {
    const angle = index / 360 * Math.PI * 2;
    const r = resolvent(U0 + .2, angle);
    mean00 += r[0].re / 360;
    mean01 += r[1].re / 360;
    mean11 += r[3].re / 360;
    expect(positivityAt(U0 + .2, angle)).toBeGreaterThan(0);
  }

  expect(mean00).toBeCloseTo(1, 12);
  expect(mean01).toBeCloseTo(0, 12);
  expect(mean11).toBeCloseTo(1, 12);

  for (const time of [97000, 99000, 101000, 103400, 114000]) expect(domainU(time)).toBeGreaterThanOrEqual(U0);

  expect(domainU(114000)).toBe(U0);
});

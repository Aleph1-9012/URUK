import { expect, test } from 'bun:test';
import { buildDoublingClockModel, gapAt, lowerHarmonicGap } from './math';

test('362: relativistic speed rows satisfy the unit-mass relation and stable gaps agree with direct finite logarithms', () => {
  const model = buildDoublingClockModel();
  let previousVelocity = 0;
  let previousDeficit = Infinity;

  for (const row of model.speeds) {
    const angle = Math.atan(row.momentum);
    expect(Math.abs(row.velocity - Math.sin(angle))).toBeLessThan(2e-15);
    expect(Math.abs(row.oneMinusVelocity * (1 + row.velocity) - 1 / (1 + row.momentum ** 2))).toBeLessThan(2e-15);
    expect(row.velocity).toBeGreaterThan(previousVelocity);
    expect(row.velocity).toBeLessThan(1);
    expect(row.oneMinusVelocity).toBeGreaterThan(0);
    expect(row.oneMinusVelocity).toBeLessThan(previousDeficit);
    previousVelocity = row.velocity;
    previousDeficit = row.oneMinusVelocity;
  }

  for (const n of [1, 2, 3, 7, 12, 100, 500, 1000]) {
    expect(Math.abs(gapAt(n) - 1 / Math.log(2 + 2 ** (n + 10)))).toBeLessThan(2e-16);
  }

  expect(Number.isFinite(gapAt(model.limit))).toBe(true);
  expect(() => gapAt(0)).toThrow(RangeError);
  expect(() => gapAt(1.5)).toThrow(RangeError);
});

test('362: independently compensated time sums and harmonic bounds support the first strictly exceeded horizons', () => {
  const model = buildDoublingClockModel();
  let oracle = 0;
  let compensation = 0;
  let harmonicFloor = 0;
  let allIncreasing = true;
  let allAboveFloor = true;

  for (let n = 1; n <= model.limit; n++) {
    const term = 1 / ((n + 10) * Math.log(2) + Math.log1p(2 ** (-n - 9)));
    const corrected = term - compensation;
    const next = oracle + corrected;
    compensation = (next - oracle) - corrected;
    oracle = next;
    harmonicFloor += lowerHarmonicGap(n);
    const previous = model.partialSums[n - 1];
    const actual = model.partialSums[n];

    if (previous === undefined || actual === undefined) throw new Error('Every stored rung needs its cumulative time and predecessor.');

    if (!(actual > previous)) allIncreasing = false;
    if (actual < harmonicFloor - 1e-10 || gapAt(n) < lowerHarmonicGap(n)) allAboveFloor = false;

    if (n <= 12 || n % 997 === 0 || n === model.limit) expect(Math.abs(actual - oracle)).toBeLessThan(5e-11);
  }

  expect(allIncreasing).toBe(true);
  expect(allAboveFloor).toBe(true);

  for (const crossing of model.crossings) {
    const before = model.partialSums[crossing.n - 1];
    const after = model.partialSums[crossing.n];

    if (before === undefined || after === undefined) throw new Error('A horizon crossing needs both adjacent cumulative times.');

    expect(before).toBeLessThanOrEqual(crossing.horizon);
    expect(after).toBeGreaterThan(crossing.horizon);
    expect(crossing.time).toBe(after);
  }
});

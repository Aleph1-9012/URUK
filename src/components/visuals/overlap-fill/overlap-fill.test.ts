import { expect, test } from 'bun:test';
import reference from './test-fixture.json';
import { GOLDEN_LAMBDA, goldenModel, goldenPairSign, histogram, histogramPieces, signSums } from './math';

test('148: all-sign histograms agree with canonical bins and independent exact rational laws', () => {
  for (const row of reference.histograms) {
    const actual = histogram(row.lambda);
    expect(actual.counts).toEqual(row.counts);
    expect(actual.counts.reduce((sum, count) => sum + count, 0)).toBe(16384);
    expect(actual.occupiedFraction).toBe(row.occupiedFraction);

    for (const [index, count] of actual.counts.entries()) {
      const reflected = actual.counts[63 - index];

      if (reflected === undefined) throw new Error('Each displayed bin needs its reflected bin.');

      expect(count).toBe(reflected);
    }
  }

  for (const row of reference.rational) {
    const actual = histogram(row.numerator / row.denominator);
    expect(actual.counts).toEqual(row.counts);
    expect(row.distinct).toBe(16384);
  }

  const truncated = histogram(.9);
  const sums = signSums(.9);
  let maximum = 0;

  for (const value of sums) maximum = Math.max(maximum, Math.abs(value));

  expect(maximum).toBeCloseTo(truncated.finiteRadius, 12);
  let omittedRadius = 0;

  for (let exponent = 15; exponent <= 500; exponent++) omittedRadius += .9 ** exponent;

  expect(omittedRadius).toBeCloseTo(truncated.tailRadius, 12);
  expect(truncated.tailRadius / truncated.radius).toBeGreaterThan(.22);
  expect(truncated.occupied).toBe(50);

  for (const count of truncated.counts.slice(0, 7)) expect(count).toBe(0);
  for (const count of truncated.counts.slice(-7)) expect(count).toBe(0);

  expect(() => histogram(1)).toThrow();
  expect(() => histogram(.5, 21)).toThrow();
});

test('148: two half-weighted thirteen-term copies form the fourteen-term law on one target grid', () => {
  for (const lambda of [.4, .5, .62, .7, .9]) {
    const pieces = histogramPieces(lambda);
    const expected = histogram(lambda);
    expect(pieces.sourceTerms).toBe(13);
    expect(pieces.negative.reduce((sum, count) => sum + count, 0)).toBe(8192);
    expect(pieces.positive.reduce((sum, count) => sum + count, 0)).toBe(8192);
    expect(pieces.combined.counts).toEqual(expected.counts);

    for (const [index, count] of pieces.negative.entries()) {
      const counterpart = pieces.positive[63 - index];
      const sameBin = pieces.positive[index];
      const combined = pieces.combined.counts[index];

      if (counterpart === undefined || sameBin === undefined || combined === undefined) throw new Error('Both transformed copies must use the complete common target grid.');

      expect(count).toBe(counterpart);
      expect(count + sameBin).toBe(combined);
    }
  }

  expect(() => histogramPieces(.5, 0)).toThrow();
});

test('148: exact golden integer pairs merge words with their multiplicities, giving Fibonacci counts and finite entropy rates', () => {
  const golden = goldenModel();
  const fibonacci = [0, 1];

  for (let index = 2; index <= 23; index++) {
    const a = fibonacci[index - 1];
    const b = fibonacci[index - 2];

    if (a === undefined || b === undefined) throw new Error('Each Fibonacci count needs its two preceding terms.');

    fibonacci.push(a + b);
  }

  expect(golden.rows).toHaveLength(20);
  let previousRate = Infinity;

  for (const [index, row] of golden.rows.entries()) {
    const expected = reference.golden.rows[index];
    const fibonacciCount = fibonacci[row.n + 3];

    if (!expected || fibonacciCount === undefined) throw new Error('Each golden depth needs independent map counts and entropy.');

    expect(row.maps).toBe(expected.maps);
    expect(row.maps).toBe(fibonacciCount - 1);
    expect(row.words).toBe(expected.words);
    expect(row.entropyPerStep).toBeCloseTo(expected.entropyPerStep, 12);
    expect(row.entropyPerStep).toBeLessThanOrEqual(Math.LN2 + 1e-14);
    expect(row.entropyPerStep).toBeLessThanOrEqual(previousRate + 1e-14);
    previousRate = row.entropyPerStep;
  }

  expect(golden.histogram.counts).toEqual(reference.golden.histogram14);
  expect(golden.histogram.counts.reduce((sum, count) => sum + count, 0)).toBe(16384);
  const one = golden.powers[0];
  const lambda = golden.powers[1];
  const square = golden.powers[2];

  if (!one || !lambda || !square) throw new Error('The first exact collision needs the first three golden powers.');

  expect(one.a - lambda.a - square.a).toBe(0);
  expect(one.b - lambda.b - square.b).toBe(0);

  for (const [exponent, pair] of golden.powers.entries()) {
    expect(pair.a + pair.b * GOLDEN_LAMBDA).toBeCloseTo(GOLDEN_LAMBDA ** exponent, 9);
    expect(goldenPairSign(pair.a, pair.b)).toBe(1);
    expect(goldenPairSign(-pair.a, -pair.b)).toBe(-1);
  }

  expect(goldenPairSign(0, 0)).toBe(0);
  expect(goldenPairSign(1, -1)).toBe(1);
  expect(goldenPairSign(-1, 1)).toBe(-1);
  expect(() => goldenPairSign(.5, 0)).toThrow();
});

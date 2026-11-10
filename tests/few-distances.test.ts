import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import reference from './fixtures/few-distances.json';
import { createDistanceModel } from '../src/components/visuals/few-distances/math';

const model = createDistanceModel();

// Independent ordered-difference convolution. In one coordinate there are t
// equal-coordinate pairs and 2(t-a) ordered pairs with absolute difference a.
function differenceHistogram(t: number, dimensions: number): Map<number, number> {
  const one = new Map<number, number>([[0, t]]);

  for (let difference = 1; difference < t; difference++) one.set(difference * difference, 2 * (t - difference));

  let coefficients = new Map<number, number>([[0, 1]]);

  for (let dimension = 0; dimension < dimensions; dimension++) {
    const next = new Map<number, number>();

    for (const [first, a] of coefficients) {
      for (const [second, b] of one) next.set(first + second, (next.get(first + second) ?? 0) + a * b);
    }

    coefficients = next;
  }

  const positive = new Map<number, number>();

  for (const [squared, count] of [...coefficients].sort((a, b) => a[0] - b[0])) {
    if (squared > 0) positive.set(squared, count / 2);
  }

  return positive;
}

test('166: all cubic-grid pair identities and frequencies agree with independent ordered-difference convolution', () => {
  expect(model.grid.length).toBe(125);
  expect(new Set(model.grid.map(point => `${point.x},${point.y},${point.z}`)).size).toBe(model.grid.length);
  expect(model.pairCount).toBe(model.grid.length * (model.grid.length - 1) / 2);
  const convolution = differenceHistogram(model.side, 3);
  expect(model.histogram.map(bucket => [bucket.squared, bucket.count])).toEqual([...convolution]);
  expect(model.histogram.map(bucket => [bucket.squared, bucket.count])).toEqual(Object.entries(reference.t5_pair_counts).map(([squared, count]) => [Number(squared), count]));
  expect(model.squaredValues).toEqual(reference.t5_squares);
  expect(model.missing).toEqual(reference.t5_missing);
  expect(model.distinct).toBe(model.squaredValues.length);
  const pairKeys = new Set<string>();

  for (const [id, pair] of model.gridPairs.entries()) {
    const a = model.grid[pair.a];
    const b = model.grid[pair.b];

    if (!a || !b) throw new Error('Each displayed pair has two original grid vertices.');

    expect(pair.id).toBe(id);
    expect(pair.a).toBeLessThan(pair.b);
    pairKeys.add(`${pair.a},${pair.b}`);
    expect(pair.squared).toBe((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2);
  }

  expect(pairKeys.size).toBe(model.pairCount);
  expect(model.histogram.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(model.pairCount);
  expect(model.common.squared).toBe(5);
  expect(model.common.count).toBe(720);
  expect(model.examples.map(pair => pair.squared)).toEqual([1, 2, 5, 48]);
  expect(new Set(model.repeatedFive).size).toBe(model.repeatedFive.length);

  for (const id of model.repeatedFive) expect(model.gridPairs[id]?.squared).toBe(5);

  for (const bucket of model.histogram) {
    expect(bucket.pairIds.length).toBe(bucket.count);

    for (const id of bucket.pairIds) expect(model.gridPairs[id]?.squared).toBe(bucket.squared);
  }
});

function ieeeNumerator(value: number): bigint {
  const bytes = new ArrayBuffer(8);
  const view = new DataView(bytes);
  view.setFloat64(0, value, false);
  const bits = view.getBigUint64(0, false);
  const rawExponent = Number((bits >> 52n) & 2047n);
  const fraction = bits & ((1n << 52n) - 1n);
  const mantissa = rawExponent === 0 ? fraction : fraction | (1n << 52n);
  const shift = rawExponent === 0 ? -1023 : rawExponent - 1024;
  const divisor = shift < 0 ? 1n << BigInt(-shift) : 1n;

  if (mantissa % divisor !== 0n) throw new Error('The shipped IEEE coordinate is an exact multiple of 2^-51.');

  const numerator = shift >= 0 ? mantissa << BigInt(shift) : mantissa / divisor;

  return bits >> 63n ? -numerator : numerator;
}

test('166: the seeded binary coordinates give 7750 exactly distinct rational squared distances without decimal rounding', () => {
  const integers = model.random.map((point, index) => {
    const oracle = reference.random_integer_points[index];

    if (!oracle) throw new Error('Every canonical random point has its independent Python integer-ratio reference.');

    const numerators = [ieeeNumerator(point.x), ieeeNumerator(point.y), ieeeNumerator(point.z)];
    expect(numerators.map(String)).toEqual(oracle);

    return numerators;
  });
  const exact = new Set<bigint>();

  for (let a = 0; a < integers.length; a++) {
    const first = integers[a];

    if (!first) throw new Error('An independent rational pair has its first point.');

    for (let b = a + 1; b < integers.length; b++) {
      const second = integers[b];

      if (!second) throw new Error('An independent rational pair has its second point.');

      let squared = 0n;

      for (let coordinate = 0; coordinate < 3; coordinate++) {
        const p = first[coordinate];
        const q = second[coordinate];

        if (p === undefined || q === undefined) throw new Error('Each exact rational point has its three components.');

        squared += (q - p) ** 2n;
      }

      exact.add(squared);
    }
  }

  const sorted = [...exact].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  const hash = createHash('sha256').update(`${sorted.map(String).join('\n')}\n`).digest('hex');
  expect(hash).toBe(reference.random_exact.squared_numerator_sha256);
  expect(exact.size).toBe(model.randomPairs.length);
  expect(model.randomDistinct).toBe(new Set(model.randomPairs.map(pair => pair.squared)).size);
  expect(model.randomDistinct).toBe(reference.random_float_distinct);
  expect(model.randomCertificate.distinct).toBe(exact.size);
  expect(model.randomCertificate.coordinateDenominator).toBe(BigInt(reference.random_exact.coordinate_denominator));
  expect(model.randomCertificate.squaredDenominator).toBe(BigInt(reference.random_exact.squared_denominator));
  expect(model.randomCertificate.smallest).toBe(BigInt(reference.random_exact.smallest));
  expect(model.randomCertificate.largest).toBe(BigInt(reference.random_exact.largest));
  expect(model.randomCertificate.minimumGap).toBe(BigInt(reference.random_exact.minimum_gap));
  expect(model.randomCertificate.minimumGap > 0n).toBe(true);
});

test('166: growth comes from integer differences with real ratio dips, and the stable plane is 25 distinct middle-layer points', () => {
  for (const [index, row] of model.growth.entries()) {
    const oracle = reference.growth[index];

    if (!oracle) throw new Error('Each finite grid size has its independent Python reference.');

    const coefficients = differenceHistogram(row.t, 3);
    expect(row.squaredValues).toEqual([...coefficients.keys()]);
    expect(row.squaredValues).toEqual(oracle.squared_values);
    expect(row.distinct).toBe(coefficients.size);
    expect(row.distinct).toBe(oracle.distinct);
    expect(row.ratio).toBe(oracle.ratio);
    expect(row.n).toBe(row.t ** 3);
  }

  const five = model.growth.find(row => row.t === 5);
  const six = model.growth.find(row => row.t === 6);
  const eleven = model.growth.find(row => row.t === 11);
  const twelve = model.growth.find(row => row.t === 12);

  if (!five || !six || !eleven || !twelve) throw new Error('Both finite grid dips have their computed endpoint samples.');

  expect(six.ratio).toBeLessThan(five.ratio);
  expect(twelve.ratio).toBeLessThan(eleven.ratio);
  expect(model.plane.points.length).toBe(reference.plane.n);
  expect(model.plane.sourceIndices).toEqual(reference.plane.source_indices);
  expect(model.plane.points.map(point => [point.x, point.y, point.z])).toEqual(reference.plane.points);
  expect(new Set(model.plane.points.map(point => `${point.x},${point.y},${point.z}`)).size).toBe(model.plane.points.length);

  for (const [index, point] of model.plane.points.entries()) {
    const source = model.plane.sourceIndices[index];

    if (source === undefined) throw new Error('Every stable-plane vertex retains its original grid identity.');

    expect(point.y).toBe(2);
    expect(model.grid[source]).toEqual(point);
  }

  expect(model.plane.pairCount).toBe(reference.plane.pairs);
  expect(model.plane.distinct).toBe(reference.plane.distinct);
  expect(model.plane.histogram.map(bucket => [bucket.squared, bucket.count])).toEqual([...differenceHistogram(model.side, 2)]);
});

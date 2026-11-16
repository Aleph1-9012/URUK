import { expect, test } from 'bun:test';
import reference from './test-fixture.json';
import { buildDistanceModel, computeHitBins, generateDust } from './math';

const model = buildDistanceModel();

test('073: opening distances agree with the independent full-precision oracle, and bins respect positive pairs and Euclidean geometry', () => {
  expect(model.opening.pairs).toHaveLength(66);
  const distances = model.opening.pairs.map(pair => pair.distance).sort((a, b) => a - b);

  for (const [index, expected] of reference.opening.distances.entries()) {
    const actual = distances[index];

    if (actual === undefined) throw new Error('Every oracle opening distance must be computed live.');

    expect(actual).toBeCloseTo(expected, 13);
  }

  expect(new Set(distances).size).toBe(66);
  const triangle = [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 4 }, { x: 0, y: 0 }];
  const moved = triangle.map(point => ({ x: 10 - point.y, y: 7 + point.x }));
  expect(computeHitBins(triangle, 1, 8)).toEqual([3, 4, 5]);
  expect(computeHitBins(moved, 1, 8)).toEqual([3, 4, 5]);
  expect(computeHitBins(triangle, 1, 26, 'squared-distance')).toEqual([9, 16, 25]);
  expect(computeHitBins([{ x: 0, y: 0 }, { x: .3, y: .4 }], .1, 8)).toEqual([5]);
  expect(computeHitBins([{ x: 0, y: 0 }, { x: .5 - 1e-8, y: 0 }], .1, 8)).toEqual([4]);
  expect(computeHitBins([{ x: 0, y: 0 }, { x: .001, y: 0 }], .1, 8)).toEqual([0]);
});

test('073: live Cantor dusts follow digit addresses and their full-stage bins match the exact rational oracle', () => {
  for (const dust of model.dusts) {
    const oracle = reference.dusts.find(row => row.lam === dust.lambda);

    if (!oracle) throw new Error('Every illustrated dust has an exact rational bin oracle.');

    expect(oracle.stage).toBe(dust.stage);
    expect(dust.dimension).toBeCloseTo(oracle.dimension, 3);
    expect(dust.points).toHaveLength(oracle.n_points);
    expect(dust.hitBins).toEqual(oracle.hit);
    expect(dust.totalBins).toBe(oracle.bins_total);
    expect(dust.lambda ** dust.stage).toBeLessThanOrEqual(dust.delta);

    const addresses: number[] = [];

    for (let index = 0; index < 2 ** dust.stage; index++) {
      let coordinate = 0;

      for (let digit = 0; digit < dust.stage; digit++) coordinate += ((index >> digit) & 1) * (1 - dust.lambda) * dust.lambda ** digit;

      addresses.push(coordinate);
    }

    for (const [index, point] of dust.points.entries()) {
      const x = addresses[index % addresses.length];
      const y = addresses[Math.floor(index / addresses.length)];

      if (x === undefined || y === undefined) throw new Error('Each product-dust point must have two digit addresses.');

      expect(point.x).toBeCloseTo(x, 14);
      expect(point.y).toBeCloseTo(y, 14);
    }

    const sorted = addresses.toSorted((a, b) => a - b);

    for (let index = 1; index < sorted.length; index++) {
      const previous = sorted[index - 1];
      const current = sorted[index];

      if (previous === undefined || current === undefined) throw new Error('Adjacent dust cells must exist.');

      expect(current - previous + 1e-14).toBeGreaterThan(dust.lambda ** dust.stage);
    }

    for (const preview of dust.previews) {
      expect(preview.points).toHaveLength(4 ** preview.stage);
      expect(preview.stage).toBeLessThan(dust.stage);
    }
  }

  expect(generateDust(.25, 0)).toEqual([{ x: 0, y: 0 }]);
  expect(() => generateDust(.5, 2)).toThrow();
  expect(() => generateDust(.25, -1)).toThrow();
});

test('073: finite patch occupancy is separate from its continuum, and positive lattice values and random occupancy match independent oracles', () => {
  expect(model.patch.hitBins).toEqual(reference.patch.hit);
  expect(model.patch.totalBins).toBe(reference.patch.bins_total);
  expect(model.patch.hitBins).not.toContain(0);
  expect(model.patch.points).toHaveLength(41 * 41);
  expect(model.patch.maxDistance).toBeCloseTo(Math.hypot(model.patch.side, model.patch.side), 14);

  const integerValues = new Set<number>();

  for (let dx = 0; dx <= model.lattice.N; dx++) {
    for (let dy = 0; dy <= model.lattice.N; dy++) {
      if (dx || dy) integerValues.add(dx * dx + dy * dy);
    }
  }

  expect(model.lattice.hitBins).toEqual([...integerValues].sort((a, b) => a - b));
  expect(model.lattice.hitBins).toEqual(reference.lattice.lattice_hit);
  expect(model.lattice.hitBins).not.toContain(0);
  expect(model.lattice.hitBins).toHaveLength(reference.lattice.lattice_values);
  expect(model.lattice.points).toHaveLength(reference.lattice.n_points);
  expect(model.random.points).toHaveLength(model.lattice.points.length);
  expect(model.random.hitBins).toEqual(reference.lattice.random_hit);
  expect(model.random.hitBins).toHaveLength(reference.lattice.random_values);
  expect(model.random.hitBins).toContain(0);
  expect(model.random.hitBins.length).toBeGreaterThan(model.lattice.hitBins.length);
});

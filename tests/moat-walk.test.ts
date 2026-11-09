import { expect, test } from 'bun:test';
import {
  UNIT_SIEVE_BOUND, axisPrimes, createPrimeField, diskLoop, gaussianFlood, gaussianPrimeCoords,
  isGaussianPrime, nearbyClusters, periodicSieve, stepVectors, windingNumber, type Flood,
} from '../src/components/visuals/moat-walk/math';

const field = createPrimeField(1100);

const floods = new Map<number, Flood>();

function floodFor(stepSquared: number): Flood {
  const existing = floods.get(stepSquared);

  if (existing) return existing;

  const flood = gaussianFlood(stepSquared, 1100, stepSquared > 2 ? floodFor(stepSquared === 4 ? 2 : stepSquared === 8 ? 4 : 8) : null, field);
  floods.set(stepSquared, flood);

  return flood;
}

test('028: the Gaussian-prime kinds and axis gap agree with the exact norm sieve', () => {
  const coords = gaussianPrimeCoords(40, field);
  let normTwo = 0;
  let axes = 0;
  let split = 0;

  for (let index = 0; index < coords.length; index += 2) {
    const x = coords[index] ?? 0;
    const y = coords[index + 1] ?? 0;

    if (x * x + y * y === 2) normTwo++;
    else if (x === 0 || y === 0) axes++;
    else split++;
  }

  expect([normTwo, axes, split]).toEqual([4, 24, 952]);
  expect(coords.length / 2).toBe(980);
  expect(axisPrimes(130, field)).toEqual([3, 7, 11, 19, 23, 31, 43, 47, 59, 67, 71, 79, 83, 103, 107, 127]);

  for (let value = 122; value <= 125; value++) expect(field.sieve[value]).toBe(0);
});

test('028: all four drawn floods close, retain their BFS layers, and resume from the old cluster', () => {
  for (const [stepSquared, count, radius, layers, stepCount] of [
    [2, 100, 11.70, 13, 9], [4, 720, 45.31, 35, 13], [8, 2996, 93.47, 56, 25], [10, 249508, 1024.35, null, 37],
  ] as const) {
    const flood = floodFor(stepSquared);
    expect(flood.closed).toBe(true);
    expect(flood.count).toBe(count);
    expect(Math.sqrt(flood.maxRadiusSquared)).toBeCloseTo(radius, 2);
    expect(stepVectors(stepSquared)).toHaveLength(stepCount);
    expect(flood.resumeOrder).toHaveLength(count);

    if (layers !== null) expect(flood.maxDepth).toBe(layers);

    let validLinks = true;

    for (let index = 1; index < flood.count; index++) {
      const parent = flood.parents[index] ?? -1;
      const x = (flood.coords[index * 2] ?? 0) - (flood.coords[parent * 2] ?? 0);
      const y = (flood.coords[index * 2 + 1] ?? 0) - (flood.coords[parent * 2 + 1] ?? 0);

      if (parent < 0 || parent >= index || x * x + y * y > stepSquared || (flood.depth[index] ?? 0) !== (flood.depth[parent] ?? 0) + 1) validLinks = false;
    }

    expect(validLinks).toBe(true);
    const oldCount = stepSquared === 2 ? 1 : floodFor(stepSquared === 4 ? 2 : stepSquared === 8 ? 4 : 8).count;
    expect(flood.resumeOffsets[1]).toBe(oldCount);
  }
}, 20000);

test('028: the empty open disk is circled by a genuine prime loop in the sqrt-eight cluster', () => {
  const loop = diskLoop(field);
  expect(loop.winding).toBeCloseTo(1, 12);
  expect(windingNumber(loop.coords, { x: 45, y: 45 })).toBeCloseTo(1, 12);
  const component = floodFor(8);
  const members = new Set<string>();

  for (let index = 0; index < component.coords.length; index += 2) members.add(`${component.coords[index]},${component.coords[index + 1]}`);

  for (let index = 0; index < loop.coords.length - 2; index += 2) {
    const x = loop.coords[index] ?? 0;
    const y = loop.coords[index + 1] ?? 0;
    const nextX = loop.coords[index + 2] ?? 0;
    const nextY = loop.coords[index + 3] ?? 0;
    expect(isGaussianPrime(field, x, y)).toBe(true);
    expect(members.has(`${x},${y}`)).toBe(true);
    expect((x - 45) ** 2 + (y - 45) ** 2).toBeGreaterThanOrEqual(13);
    expect((nextX - x) ** 2 + (nextY - y) ** 2).toBeLessThanOrEqual(8);
  }

  for (let x = 42; x <= 48; x++) {
    for (let y = 42; y <= 48; y++) {
      if ((x - 45) ** 2 + (y - 45) ** 2 < 13) expect(isGaussianPrime(field, x, y)).toBe(false);
    }
  }
});

test('028: the complete local islands and lifted period-65 sieve have the stated finite components', () => {
  const islands = nearbyClusters(100, 150, field);
  expect(islands.count).toBe(833);
  expect([...islands.sizes].sort((a, b) => b - a).slice(0, 6)).toEqual([720, 53, 53, 53, 53, 38]);
  expect([...islands.sizes].filter(size => size === 1)).toHaveLength(228);
  expect(Math.sqrt(islands.maxRadiusSquared)).toBeLessThan(145);
  const sieve = periodicSieve();
  expect(sieve.finite).toBe(true);
  expect(sieve.order).toHaveLength(2304);
  expect(sieve.sizes).toHaveLength(243);
  expect(sieve.largest).toBe(580);
  expect([...sieve.sizes].filter(size => size === 1)).toHaveLength(24);
  const first = sieve.offsets[sieve.largestComponent] ?? 0;
  const last = sieve.offsets[sieve.largestComponent + 1] ?? first;
  const component = new Set<string>();

  for (let position = first; position < last; position++) {
    const node = sieve.order[position] ?? 0;
    component.add(`${sieve.liftCoords[node * 2]},${sieve.liftCoords[node * 2 + 1]}`);
  }

  for (let position = first; position < last; position++) {
    const node = sieve.order[position] ?? 0;
    expect(component.has(`${(sieve.liftCoords[node * 2] ?? 0) + 65},${sieve.liftCoords[node * 2 + 1]}`)).toBe(false);
  }

  expect(UNIT_SIEVE_BOUND).toBe(270416);
});

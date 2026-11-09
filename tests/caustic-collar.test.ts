import { expect, test } from 'bun:test';
import {
  BilliardTable, FOCUS, TAU, causticParameter, computePeriodicFamily,
  computePortrait, periodicPath, traceOrbit, type PeriodicQ,
} from '../src/components/visuals/caustic-collar/math';

const ellipse = new BilliardTable(0);

const wobble = new BilliardTable(.01);

test('147: reflected paths stay on the rim, obey reflection and touch their confocal caustic', () => {
  expect(ellipse.perimeter).toBeCloseTo(7.592274, 6);
  expect(wobble.perimeter).toBeCloseTo(7.593965, 6);
  expect(FOCUS).toBeCloseTo(.9797958971132712, 13);
  let leastEllipse = Infinity;
  let leastWobble = Infinity;

  for (let index = 0; index < 1000; index++) {
    leastEllipse = Math.min(leastEllipse, ellipse.curvature(index / 1000 * TAU));
    leastWobble = Math.min(leastWobble, wobble.curvature(index / 1000 * TAU));
  }

  expect(leastEllipse).toBeCloseTo(.510204, 6);
  expect(leastWobble).toBeCloseTo(.503882, 5);

  for (const [index, delta] of [.45, .25, .12].entries()) {
    const orbit = traceOrbit(ellipse, .3, delta, 400);
    const expected = [.2050569187965825, .0663403910272335, .0155325089734845][index] ?? 0;
    let lambdaError = 0;
    let reflectionError = 0;
    let rimError = 0;

    for (let impact = 0; impact < 400; impact++) {
      const first = { x: orbit.coords[impact * 2] ?? 0, y: orbit.coords[impact * 2 + 1] ?? 0 };
      const second = { x: orbit.coords[impact * 2 + 2] ?? 0, y: orbit.coords[impact * 2 + 3] ?? 0 };
      lambdaError = Math.max(lambdaError, Math.abs(causticParameter(first, second) - expected));
      rimError = Math.max(rimError, Math.abs(first.x ** 2 / 1.96 + first.y ** 2 - 1));

      if (impact === 0) continue;

      const previous = { x: orbit.coords[impact * 2 - 2] ?? 0, y: orbit.coords[impact * 2 - 1] ?? 0 };
      const beforeLength = Math.hypot(first.x - previous.x, first.y - previous.y);
      const afterLength = Math.hypot(second.x - first.x, second.y - first.y);
      const before = { x: (first.x - previous.x) / beforeLength, y: (first.y - previous.y) / beforeLength };
      const after = { x: (second.x - first.x) / afterLength, y: (second.y - first.y) / afterLength };
      const velocity = ellipse.velocity(orbit.parameters[impact] ?? 0);
      const speed = Math.hypot(velocity.x, velocity.y);
      const tangent = { x: velocity.x / speed, y: velocity.y / speed };
      const normal = { x: -tangent.y, y: tangent.x };
      reflectionError = Math.max(reflectionError, Math.abs((before.x - after.x) * tangent.x + (before.y - after.y) * tangent.y));
      reflectionError = Math.max(reflectionError, Math.abs((before.x + after.x) * normal.x + (before.y + after.y) * normal.y));
    }

    expect(orbit.caustic).toBeCloseTo(expected, 12);
    expect(lambdaError).toBeLessThan(1e-11);
    expect(rimError).toBeLessThan(1e-13);
    expect(reflectionError).toBeLessThan(1e-11);
  }
});

test('147: full portraits are reflected orbits; low wobble launches wrap and high ones spread', () => {
  for (const table of [ellipse, wobble]) {
    const portrait = computePortrait(table);
    expect(portrait.points.length).toBe(44 * 700 * 2);
    expect(portrait.orbitOffsets[44]).toBe(44 * 700);

    for (let index = 0; index < portrait.points.length; index += 2) {
      const position = portrait.points[index] ?? -1;
      const angle = portrait.points[index + 1] ?? -1;
      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThanOrEqual(1);
      expect(angle).toBeGreaterThan(0);
      expect(angle).toBeLessThan(Math.PI);
    }
  }

  const low = traceOrbit(wobble, .3, .12, 700);
  const bins = new Set<number>();

  for (let impact = 1; impact < low.deltas.length; impact++) bins.add(Math.floor((low.phase[impact * 2] ?? 0) * 100));

  expect(bins.size).toBe(100);
  const high = traceOrbit(wobble, .37, 1.06, 700);
  expect(Math.max(...high.deltas) - Math.min(...high.deltas)).toBeGreaterThan(1.5);
});

test('147: the three rational families keep one ellipse length and break on the wobble', () => {
  const orders: PeriodicQ[] = [3, 4, 5];
  const expectedEllipse = [6.400094652792707, 6.881860213634101, 7.128145242550887];
  const wobbleRanges = [[6.350516284323971, 6.452050744651405], [6.8855153147692345, 6.886454392213244], [7.1290556330428, 7.132196246267635]];

  for (const [index, q] of orders.entries()) {
    const family = computePeriodicFamily(ellipse, q);
    const expected = expectedEllipse[index] ?? 0;
    expect(family.maxGradient).toBeLessThan(1e-10);
    expect(Math.max(...family.lengths) - Math.min(...family.lengths)).toBeLessThan(1e-11);
    expect(family.lengths[0]).toBeCloseTo(expected, 11);
    expect(Math.max(...family.startResiduals.map(Math.abs))).toBeLessThan(1e-10);

    for (const fraction of [.12345, .44321, .99123]) {
      const path = periodicPath(family, fraction);
      expect(path.length).toBeCloseTo(expected, 10);
      expect(Math.abs(path.startResidual)).toBeLessThan(1e-9);
    }

    const changed = computePeriodicFamily(wobble, q);
    expect(changed.maxGradient).toBeLessThan(1e-10);
    expect(Math.min(...changed.lengths)).toBeCloseTo(wobbleRanges[index]?.[0] ?? 0, 10);
    expect(Math.max(...changed.lengths)).toBeCloseTo(wobbleRanges[index]?.[1] ?? 0, 10);

    if (q === 3) {
      expect(Math.max(...changed.startResiduals.map(Math.abs))).toBeGreaterThan(.05);
      expect(Math.max(...changed.lengths) - Math.min(...changed.lengths)).toBeGreaterThan(.10);
    }
  }
});

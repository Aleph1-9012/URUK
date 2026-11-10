import { expect, test } from 'bun:test';
import reference from './fixtures/endless-bounce.json';
import { apply, areaShareLeft, collisionSide, compose, computeBounceExperiment, createBounceModel, experimentBuffers, HEADING, IDENTITY, insideTriangle, nextCollision, reflection, runBilliard, samplePackedRunByDistance, sampleRunByDistance, START } from '../src/components/visuals/endless-bounce/math';

const model = createBounceModel();

const KEYS = ['irrational', 'equilateral', 'right_isosceles'] as const;

test('150: live collision points reproduce the reference trajectory and preserve unit specular motion', () => {
  for (const key of KEYS) {
    const table = model.cases[key];
    const run = table.run;
    expect(run.kind).toBe('complete');
    let largestPointError = 0;
    let largestReflectionError = 0;

    for (const [index, point] of run.points.entries()) {
      const source = reference[key].first_400_points[index];

      if (!source || source[0] === undefined || source[1] === undefined) throw new Error('The reference includes every shown collision.');

      largestPointError = Math.max(largestPointError, Math.hypot(point.x - source[0], point.y - source[1]));
      expect(insideTriangle(table.triangle, point)).toBe(true);
      const side = run.sides[index];
      const incoming = run.directions[index];
      const outgoing = run.directions[index + 1];

      if (side === undefined || incoming === undefined || outgoing === undefined) continue;

      const a = table.triangle[side];
      const b = table.triangle[(side + 1) % 3];

      if (!a || !b) throw new Error('The collision side has two endpoints.');

      const length = Math.hypot(b.x - a.x, b.y - a.y);
      const ex = (b.x - a.x) / length;
      const ey = (b.y - a.y) / length;
      const u = { x: Math.cos(incoming), y: Math.sin(incoming) };
      const v = { x: Math.cos(outgoing), y: Math.sin(outgoing) };
      largestReflectionError = Math.max(largestReflectionError, Math.abs((u.x - v.x) * ex + (u.y - v.y) * ey), Math.abs((u.x + v.x) * ey - (u.y + v.y) * ex));
    }

    expect(largestPointError).toBeLessThan(1e-6);
    expect(largestReflectionError).toBeLessThan(1e-12);
  }
});

test('150: the hundred-thousand-bounce experiments give six/eight rational headings and the recorded area/time shares', () => {
  const experiment = computeBounceExperiment();

  for (const key of KEYS) {
    const table = model.cases[key];
    const computed = experiment[key];
    expect(computed.run.kind).toBe('complete');
    expect(computed.bounces).toBe(100000);
    expect(computed.stats.distinct).toBe(reference[key].directions);
    expect(computed.stats.empty).toBe(reference[key].direction_bins_empty);
    expect(computed.stats.bins.reduce((total, count) => total + count, 0)).toBe(computed.bounces);

    for (const row of computed.shares) {
      const recorded = table.reference.shares.find(source => source.bounces === row.bounces);

      if (!recorded) throw new Error('The computed gauge milestone has an independent reference.');

      expect(Math.abs(row.share - recorded.share)).toBeLessThan(.000051);
    }

    expect(Math.abs(areaShareLeft(table.triangle) - reference[key].area_share_left)).toBeLessThan(.000051);
    const endTime = table.run.times.at(-1);

    if (endTime === undefined) throw new Error('The immediate run has its final event time.');

    for (const distance of [0, .05, 1, endTime - .001]) {
      const packed = samplePackedRunByDistance(computed.run, distance);
      const immediate = sampleRunByDistance(table.run, distance);
      expect(packed.bounce).toBe(immediate.bounce);
      expect(Math.hypot(packed.point.x - immediate.point.x, packed.point.y - immediate.point.y)).toBeLessThan(1e-12);
    }
  }

  const transferred = structuredClone(experiment, { transfer: experimentBuffers(experiment) });
  expect(transferred.irrational.run.times.length).toBe(100001);
  expect(samplePackedRunByDistance(transferred.equilateral.run, 1).point).toEqual(sampleRunByDistance(model.cases.equilateral.run, 1).point);
});

test('150: event-time sampling travels at unit speed and a corner encounter stops visibly instead of choosing a side', () => {
  const table = model.cases.irrational;
  const run = table.run;
  const last = run.times.at(-1);

  if (last === undefined) throw new Error('The trajectory has its final event time.');

  let worstSpeedError = 0;

  for (let i = 1; i < 1000; i++) {
    const distance = i / 1000 * last;
    const a = sampleRunByDistance(run, distance);
    const b = sampleRunByDistance(run, distance + 1e-6);

    if (a.bounce !== b.bounce) continue;

    worstSpeedError = Math.max(worstSpeedError, Math.abs(Math.hypot(b.point.x - a.point.x, b.point.y - a.point.y) - 1e-6));
  }

  expect(worstSpeedError).toBeLessThan(1e-12);
  const target = table.triangle[2];
  const theta = Math.atan2(target.y - START.y, target.x - START.x);
  const corner = runBilliard(table.triangle, START, theta, 10);
  expect(corner.kind).toBe('corner');

  if (corner.kind !== 'complete') expect(corner.reason).toContain('UNDEFINED');

  const p = corner.points.at(-1);

  if (!p) throw new Error('A corner encounter records its endpoint.');

  expect(Math.hypot(p.x - target.x, p.y - target.y)).toBeLessThan(1e-12);
  expect(nextCollision(table.triangle, { x: 0, y: -.2 }, { x: 0, y: -1 }).kind).toBe('stalled');
});

test('150: composing actual wall reflections unfolds each trajectory into its initial straight unit-speed ray', () => {
  for (const key of KEYS) {
    const table = model.cases[key];
    let map = IDENTITY;
    let largestError = 0;

    for (let collision = 0; collision < 100; collision++) {
      const point = table.run.points[collision + 1];
      const distance = table.run.times[collision + 1];
      const recordedSide = table.run.sides[collision];

      if (!point || distance === undefined || recordedSide === undefined) throw new Error('The unfolding uses one hundred complete recorded collisions.');

      const developed = apply(map, point);
      const expected = { x: START.x + distance * Math.cos(HEADING), y: START.y + distance * Math.sin(HEADING) };
      largestError = Math.max(largestError, Math.hypot(developed.x - expected.x, developed.y - expected.y));
      const side = collisionSide(table.triangle, point);
      expect(side).toBe(recordedSide);
      const a = table.triangle[side];
      const b = table.triangle[(side + 1) % 3];

      if (!a || !b) throw new Error('The developed collision selects one complete wall.');

      map = compose(map, reflection(a, b));
    }

    expect(largestError).toBeLessThan(1e-9);
  }
});

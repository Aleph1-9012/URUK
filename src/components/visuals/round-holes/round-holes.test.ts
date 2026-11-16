import { expect, test } from 'bun:test';
import reference from './test-fixture.json';
import { cantorStage, countableHoles, createHoleModel, derivativeAt, inverseJoukowski, joukowski, type Point } from './math';

const model = createHoleModel();

test('071: the live maps agree with polar ellipse coordinates, use the exterior inverse branch, and preserve right angles', () => {
  for (const t of reference.t_steps) {
    for (const radius of [1.0001, model.parameters.R, 1.7, 2.1, 2.6, 4.4, 6]) {
      for (let index = 0; index < 73; index++) {
        const theta = 2 * Math.PI * (index + .17) / 73;
        const original = { x: radius * Math.cos(theta), y: radius * Math.sin(theta) };
        const mapped = joukowski(original, t);
        expect(mapped.x).toBeCloseTo((radius + t / radius) * Math.cos(theta), 12);
        expect(mapped.y).toBeCloseTo((radius - t / radius) * Math.sin(theta), 12);
        const restored = inverseJoukowski(mapped, t);
        expect(Math.hypot(restored.x - original.x, restored.y - original.y)).toBeLessThan(2e-9);
        expect(Math.hypot(restored.x, restored.y)).toBeGreaterThan(1);
        const derivative = derivativeAt(original, t);
        expect(Math.hypot(derivative.x, derivative.y) + 1e-14).toBeGreaterThanOrEqual(1 - t / (radius * radius));

        const tangent = { x: -(radius + t / radius) * Math.sin(theta), y: (radius - t / radius) * Math.cos(theta) };
        const radial = { x: (1 - t / (radius * radius)) * Math.cos(theta), y: (1 + t / (radius * radius)) * Math.sin(theta) };
        const cosine = (tangent.x * radial.x + tangent.y * radial.y) / (Math.hypot(tangent.x, tangent.y) * Math.hypot(radial.x, radial.y));
        expect(Math.abs(cosine)).toBeLessThan(1e-12);
      }
    }
  }

  expect(model.audit.maxInverseError).toBeLessThan(1e-9);
  expect(model.audit.worstAngleError).toBeLessThan(5e-9);
  expect(model.audit.minDerivativeMagnitude).toBeGreaterThan(.45);
  expect(() => joukowski({ x: 2, y: 1 }, -1)).toThrow();
  expect(() => joukowski({ x: 2, y: 1 }, 2)).toThrow();
});

function distanceToSegment(point: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const squared = dx * dx + dy * dy;
  const along = squared === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / squared));

  return Math.hypot(point.x - a.x - along * dx, point.y - a.y - along * dy);
}

test('071: both holes and the clipped net are genuine mapped boundaries, with roundness matching the independent Python oracle', () => {
  const centre = { x: model.parameters.centre, y: 0 };

  for (const [index, t] of reference.t_steps.entries()) {
    const roundness = model.roundness[index];
    const oracle = Object.entries(reference.hole2_roundness).find(([parameter]) => Number(parameter) === t);

    if (!roundness || !oracle) throw new Error('Each live map parameter has a Python roundness reference.');

    expect(t).toBe(roundness.t);
    expect(Math.abs(roundness.spread - oracle[1])).toBeLessThan(5e-5);
    const a = model.parameters.R + t / model.parameters.R;
    const b = model.parameters.R - t / model.parameters.R;

    for (const point of model.hole1) {
      const mapped = joukowski(point, t);
      expect(Math.abs((mapped.x / a) ** 2 + (mapped.y / b) ** 2 - 1)).toBeLessThan(1e-12);
    }

    for (const point of model.hole2) {
      const mapped = joukowski(point, t);
      expect((mapped.x / a) ** 2 + (mapped.y / b) ** 2).toBeGreaterThan(1);
    }
  }

  const identity = model.roundness.find(row => row.t === 0);
  const bent = model.roundness.find(row => row.t === 1);

  if (!identity || !bent) throw new Error('The map family includes its bent and identity endpoints.');

  expect(identity.spread).toBeLessThan(1e-13);
  expect(bent.spread).toBeGreaterThan(.1);

  for (const curve of model.net) {
    for (const run of curve.runs) {
      for (const [index, point] of run.entries()) {
        expect(Math.hypot(point.x, point.y) + 1e-12).toBeGreaterThanOrEqual(model.parameters.R);
        expect(Math.hypot(point.x - centre.x, point.y) + 1e-12).toBeGreaterThanOrEqual(model.parameters.radius);

        if (curve.kind === 'circle') expect(Math.hypot(point.x, point.y)).toBeCloseTo(curve.parameter, 12);
        else expect(point.y * Math.cos(curve.parameter) - point.x * Math.sin(curve.parameter)).toBeCloseTo(0, 12);

        const next = run[index + 1];

        if (next) expect(distanceToSegment(centre, point, next) + 1e-12).toBeGreaterThanOrEqual(model.parameters.radius);
      }
    }
  }
});

test('071: finite Cantor pictures match ternary addresses and remain distinct domains, while countable discs are disjoint and accumulate only toward zero', () => {
  for (const stage of model.cantor) {
    const oracle = reference.cantor_stages[stage.k];

    if (!oracle) throw new Error('Each pictured Cantor stage has its Python reference.');

    expect(stage.holes).toBe(oracle.holes);
    const denominator = 3 ** stage.k;

    for (const [index, disc] of stage.discs.entries()) {
      let numerator = 0;

      for (let bit = stage.k - 1; bit >= 0; bit--) numerator = 3 * numerator + 2 * ((index >> bit) & 1);

      expect(disc.left).toBeCloseTo(numerator / denominator, 13);
      expect(disc.right).toBeCloseTo((numerator + 1) / denominator, 13);
      expect(disc.radius).toBeCloseTo(oracle.radius, 13);

      if (oracle.centres) {
        const centre = oracle.centres[index];

        if (centre === undefined) throw new Error('Every stored finite-stage disc has an oracle centre.');

        expect(disc.centre).toBeCloseTo(centre, 13);
      }

      const next = stage.discs[index + 1];

      if (next) expect(next.centre - disc.centre).toBeGreaterThan(disc.radius + next.radius);

      if (stage.k > 0) {
        const parent = cantorStage(stage.k - 1).discs[Math.floor(index / 2)];

        if (!parent) throw new Error('Every noninitial Cantor disc has its preceding interval.');

        expect(disc.parentId).toBe(parent.id);
        expect(disc.left + 1e-13).toBeGreaterThanOrEqual(parent.left);
        expect(disc.right - 1e-13).toBeLessThanOrEqual(parent.right);
        // The intervals nest; the round discs do not. Each stage is a different domain.
        expect(Math.abs(disc.centre - parent.centre) + disc.radius).toBeGreaterThan(parent.radius);
      }
    }
  }

  const countable = countableHoles(300);

  for (const [index, disc] of countable.entries()) {
    expect(disc.centre - disc.radius).toBeGreaterThan(0);
    const next = countable[index + 1];

    if (next) expect(disc.centre - next.centre).toBeGreaterThan(disc.radius + next.radius);

    const oracleCentre = reference.countable.centres[index];
    const oracleRadius = reference.countable.radii[index];

    if (oracleCentre !== undefined && oracleRadius !== undefined) {
      expect(Math.abs(disc.centre - oracleCentre)).toBeLessThan(5e-6);
      expect(Math.abs(disc.radius - oracleRadius)).toBeLessThan(5e-6);
    }
  }

  const last = countable.at(-1);

  if (!last) throw new Error('The countable picture has its last finite sample.');

  expect(last.centre).toBeLessThan(.004);
});

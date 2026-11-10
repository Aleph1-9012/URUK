import { expect, test } from 'bun:test';
import reference from './fixtures/warm-spot.json';
import { computeHeatAtlas, contours, createWarmModel, extrema, fieldSample, gradients, heatAdvance, laplacian, normalizeField, type Point } from '../src/components/visuals/warm-spot/math';

const model = createWarmModel();
const atlas = computeHeatAtlas(model);

function entry(values: ArrayLike<number>, index: number): number {
  const value = values[index];

  if (value === undefined) throw new Error('The independent check has its indexed numerical value.');

  return value;
}

function norm(values: Float64Array): number {
  let squared = 0;

  for (const value of values) squared += value * value;

  return Math.sqrt(squared);
}

function dot(first: Float64Array, second: Float64Array): number {
  let sum = 0;

  for (const [index, value] of first.entries()) sum += value * entry(second, index);

  return sum;
}

test('369: the full-precision first mode satisfies the insulated-grid eigenproblem and its sampled interior gradients do not vanish', () => {
  expect(model.cells.length).toBe(1444);
  expect(Math.abs(model.mu1 - reference.mu1_coarse) / model.mu1).toBeLessThan(.03);
  expect(model.mu2).toBeGreaterThan(2 * model.mu1);
  const applied = laplacian(model, model.phi1);
  const residual = applied.map((value, index) => value - model.mu1 * entry(model.phi1, index));
  expect(norm(residual) / norm(model.phi1)).toBeLessThan(5e-11);
  expect(Math.abs(dot(model.phi1, applied) / dot(model.phi1, model.phi1) - model.mu1)).toBeLessThan(1e-11);
  expect(Math.abs(extrema(model.phi1).mean)).toBeLessThan(1e-13);
  const limits = extrema(model.phi1);
  expect(model.edgeCells[limits.hot]).toBe(1);
  expect(model.edgeCells[limits.cold]).toBe(1);

  // Rebuild central derivatives from coordinates, independently of the packed-neighbor helper.
  const byCoordinate = new Map(model.cellIndices.map((cell, index) => [`${cell.row},${cell.col}`, index]));
  let min = Infinity;
  let max = 0;

  for (const index of model.deepIndices) {
    const cell = model.cellIndices[index];

    if (!cell) throw new Error('A sampled interior cell has its square-grid index.');

    const right = byCoordinate.get(`${cell.row},${cell.col + 1}`);
    const left = byCoordinate.get(`${cell.row},${cell.col - 1}`);
    const up = byCoordinate.get(`${cell.row + 1},${cell.col}`);
    const down = byCoordinate.get(`${cell.row - 1},${cell.col}`);

    if (right === undefined || left === undefined || up === undefined || down === undefined) throw new Error('A cell more than three mesh widths inside has all four central neighbors.');

    const gx = (entry(model.phi1, right) - entry(model.phi1, left)) / (2 * model.h);
    const gy = (entry(model.phi1, up) - entry(model.phi1, down)) / (2 * model.h);
    const magnitude = Math.hypot(gx, gy);
    min = Math.min(min, magnitude);
    max = Math.max(max, magnitude);
    expect(entry(model.edgeDistance, index)).toBeGreaterThan(3 * model.h);
  }

  expect(min).toBeGreaterThan(0);
  expect(min / max).toBeCloseTo(reference.gradient_ratio_full, 12);
  expect(model.gradientRatio).toBeCloseTo(min / max, 12);

  const linear = Float64Array.from(model.cells, point => 3 * point.x - 2 * point.y);

  for (const gradient of gradients(model, linear)) {
    expect(gradient.x).toBeCloseTo(3, 12);
    expect(gradient.y).toBeCloseTo(-2, 12);
  }
});

test('369: full-grid heat agrees with dense eigendecomposition while conserving mass, shrinking extrema and obeying the semigroup law', () => {
  const initial = extrema(model.u0);
  let previousSpread = initial.spread;
  let previousEnergy = dot(model.u0, model.u0);

  for (let frame = 0; frame < atlas.times.length; frame++) {
    const values = atlas.values.subarray(frame * atlas.cellCount, (frame + 1) * atlas.cellCount);
    const limits = extrema(values);
    expect(Math.abs(limits.mean - initial.mean)).toBeLessThan(5e-14);
    expect(limits.max).toBeLessThanOrEqual(initial.max + 1e-13);
    expect(limits.min).toBeGreaterThanOrEqual(initial.min - 1e-13);
    expect(limits.spread).toBeLessThanOrEqual(previousSpread + 1e-13);
    const energy = dot(values, values);
    expect(energy).toBeLessThanOrEqual(previousEnergy + 1e-13);
    previousSpread = limits.spread;
    previousEnergy = energy;
  }

  for (const oracle of reference.flow_vectors) {
    const frame = atlas.times.indexOf(oracle.t);
    expect(frame).toBeGreaterThanOrEqual(0);
    const values = atlas.values.subarray(frame * atlas.cellCount, (frame + 1) * atlas.cellCount);
    let error = 0;

    for (const [index, value] of values.entries()) error = Math.max(error, Math.abs(value - entry(oracle.values, index)));

    expect(error).toBeLessThan(2e-12);
    const limits = extrema(values);
    const track = reference.track.find(row => row.t === oracle.t);

    if (!track) throw new Error('Each dense reference vector has a canonical extremum track row.');

    expect(limits.hot).toBe(track.hot_index);
    expect(limits.cold).toBe(track.cold_index);
    expect(limits.spread).toBeCloseTo(track.spread, 5);
  }

  const sequential = heatAdvance(model, heatAdvance(model, model.u0, .017), .023);
  const direct = heatAdvance(model, model.u0, .04);
  let error = 0;

  for (const [index, value] of sequential.entries()) error = Math.max(error, Math.abs(value - entry(direct, index)));

  expect(error).toBeLessThan(2e-14);
  const constant = new Float64Array(model.cells.length).fill(2.5);
  const held = heatAdvance(model, constant, .05);

  for (const value of held) expect(value).toBeCloseTo(2.5, 13);
});

test('369: displayed contours, interpolation and extrema use the same finite-grid scalar values', () => {
  const initial = fieldSample(model, .8);
  expect(initial.kind).toBe('initial');
  expect(initial.tau).toBe(0);
  expect(initial.values).toBe(model.u0);
  model.computation = { kind: 'ready', atlas };
  const sample = fieldSample(model, .15);
  expect(sample.kind).toBe('computed');
  expect(sample.interpolated).toBe(true);
  const displayed = Array.from(sample.values);
  const min = Math.min(...displayed);
  const max = Math.max(...displayed);
  expect(sample.spread).toBe(max - min);
  expect(sample.hot).toBe(displayed.indexOf(max));
  expect(sample.cold).toBe(displayed.indexOf(min));
  let upper = 0;

  while (entry(atlas.times, upper) < .15) upper++;

  const firstTime = entry(atlas.times, upper - 1);
  const secondTime = entry(atlas.times, upper);
  const amount = (.15 - firstTime) / (secondTime - firstTime);

  for (const [cell, value] of sample.values.entries()) {
    const a = entry(atlas.values, (upper - 1) * atlas.cellCount + cell);
    const b = entry(atlas.values, upper * atlas.cellCount + cell);
    expect(value).toBe(a + (b - a) * amount);
  }
  const normalized = normalizeField(sample.values);
  expect(extrema(normalized).min).toBe(-1);
  expect(extrema(normalized).max).toBe(1);
  const xValues = Float64Array.from(model.cells, point => point.x);
  const level = .123;
  const segments = contours(model, xValues, [level]);
  expect(segments.length).toBeGreaterThan(10);

  for (const segment of segments) {
    expect(segment.a.x).toBeCloseTo(level, 13);
    expect(segment.b.x).toBeCloseTo(level, 13);
    expect(Math.hypot(segment.a.x - segment.b.x, segment.a.y - segment.b.y)).toBeGreaterThan(0);
  }

  const phiContours = contours(model, normalizeField(model.phi1), [-.75, -.5, -.25, 0, .25, .5, .75]);
  const endpoints: Point[] = [];

  for (const segment of phiContours) endpoints.push(segment.a, segment.b);

  expect(endpoints.length).toBeGreaterThan(100);
  expect(endpoints.every(point => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
  model.computation = { kind: 'pending' };
});

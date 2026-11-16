import { expect, test } from 'bun:test';
import { buildArrowGridModel, correlationAt, interpolateAngle, interpolateFields, localSlope, logCorrelationLength, periodicPlaquettes, plaquetteWinding, wrapAngle, type AngleField, type FourAngles } from './math';

/** Independent oriented angle increments from unit-vector cross and dot products. */
function vectorWinding(angles: FourAngles): number {
  let total = 0;

  for (let index = 0; index < 4; index++) {
    const a = angles[index];
    const b = angles[(index + 1) % 4];

    if (a === undefined || b === undefined) throw new Error('The winding oracle needs its four cyclic corners.');

    const cross = Math.cos(a) * Math.sin(b) - Math.sin(a) * Math.cos(b);
    const dot = Math.cos(a) * Math.cos(b) + Math.sin(a) * Math.sin(b);
    total += Math.atan2(cross, dot);
  }

  const turns = Math.round(total / (2 * Math.PI));

  return turns === 0 ? 0 : turns;
}

function deterministicField(size: number): number[][] {
  let state = size + 216;

  return Array.from({ length: size }, () => Array.from({ length: size }, () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;

    return state / 2 ** 32 * 2 * Math.PI - Math.PI;
  }));
}

function angularDistance(a: number, b: number): number {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

test('216: integer winding has the CCW sign and carried arrows take the shortest angular path', () => {
  const positive: FourAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  const negative: FourAngles = [0, -Math.PI / 2, -Math.PI, Math.PI / 2];
  const zero: FourAngles = [.1, .4, .7, .2];

  for (const [angles, expected] of [[positive, 1], [negative, -1], [zero, 0]] as const) {
    const winding = plaquetteWinding(angles);
    expect(winding.charge).toBe(expected);
    expect(vectorWinding(angles)).toBe(winding.charge);
    expect(winding.totalAngle).toBeCloseTo(expected * 2 * Math.PI, 13);
  }

  expect(plaquetteWinding([0, Math.PI / 2 + 6 * Math.PI, Math.PI - 4 * Math.PI, -Math.PI / 2 + 2 * Math.PI]).charge).toBe(1);
  expect(() => plaquetteWinding([0, Math.PI, 0, .1])).toThrow();

  for (const value of [-20, -Math.PI, 0, Math.PI, 20]) {
    const wrapped = wrapAngle(value);
    expect(wrapped >= -Math.PI && wrapped < Math.PI).toBe(true);
    expect(Math.cos(wrapped)).toBeCloseTo(Math.cos(value), 13);
    expect(Math.sin(wrapped)).toBeCloseTo(Math.sin(value), 13);
  }

  for (const [from, to] of [[179 * Math.PI / 180, -179 * Math.PI / 180], [-2.9, 2.9], [.2, 8 * Math.PI + .9]] as const) {
    const midpoint = interpolateAngle(from, to, .5);
    const distance = angularDistance(from, to);
    expect(angularDistance(midpoint, from)).toBeCloseTo(distance / 2, 13);
    expect(angularDistance(midpoint, to)).toBeCloseTo(distance / 2, 13);
    expect(angularDistance(interpolateAngle(from, to, 1), to)).toBeLessThan(1e-13);
  }

  const from = deterministicField(4);
  const to = deterministicField(4).map(row => row.map(angle => angle + .3));
  const middle = interpolateFields(from, to, .5);

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const value = middle[i]?.[j];
      const initial = from[i]?.[j];

      if (value === undefined || initial === undefined) throw new Error('Each carried site needs its interpolated angle.');

      expect(angularDistance(value, initial)).toBeCloseTo(.15, 13);
    }
  }

  expect(() => interpolateFields(from, [[0, 0], [0, 0]], .5)).toThrow();
});

test('216: retained periodic samples reproduce their vortex counts and every charge agrees with a unit-vector oracle', () => {
  const model = buildArrowGridModel();
  expect(model.samples.map(sample => sample.vortexCount)).toEqual([0, 22, 84]);
  expect(model.samples.map(sample => sample.beta)).toEqual([1.5, .9, .5]);

  for (const sample of model.samples) {
    expect(sample.plaquettes).toHaveLength(400);
    expect(new Set(sample.plaquettes.map(cell => `${cell.i},${cell.j}`)).size).toBe(400);
    let positive = 0;
    let negative = 0;

    for (const cell of sample.plaquettes) {
      const expected = vectorWinding(cell.angles);
      expect(expected).toBe(cell.charge);
      positive += Number(expected === 1);
      negative += Number(expected === -1);
    }

    expect(sample.positive).toBe(positive);
    expect(sample.negative).toBe(negative);
    expect(sample.vortexCount).toBe(positive + negative);
    expect(sample.totalCharge).toBe(0);
    expect(positive - negative).toBe(0);
    const shifted = sample.angles.map((row, i) => row.map((angle, j) => angle + .37 + 2 * Math.PI * ((i + j) % 3 - 1)));
    expect(periodicPlaquettes(shifted).map(cell => cell.charge)).toEqual(sample.plaquettes.map(cell => cell.charge));
  }

  for (const size of [3, 4, 7, 12]) {
    const field: AngleField = deterministicField(size);
    const cells = periodicPlaquettes(field);
    expect(cells.reduce((sum, cell) => sum + cell.charge, 0)).toBe(0);

    for (const cell of cells) expect(vectorWinding(cell.angles)).toBe(cell.charge);
  }

  expect(model.windingExample.charge).toBe(1);
  expect(model.hot.vortices.includes(model.windingExample)).toBe(true);
  expect(model.windingExample.wrappedDifferences.every(angle => angle > 0 && angle < Math.PI)).toBe(true);
});

test('216: leading curves keep their true amplitudes and their analytic slopes agree with numerical derivatives', () => {
  const model = buildArrowGridModel();
  const first = model.correlation[0];

  if (!first) throw new Error('The correlation plot needs its actual first point.');

  expect(first.r).toBe(10);
  expect(first.corrected).toBeGreaterThan(first.pure);
  expect(first.corrected - first.pure).toBeGreaterThan(.06);

  for (const r of [10, 100, 10000, 1e8]) {
    const point = correlationAt(r);
    const u = Math.log(r);
    const step = 1e-4;
    const value = (logR: number) => Math.log(Math.exp(logR) ** (-1 / 4) * Math.log(Math.exp(logR)) ** (1 / 8));
    const derivative = (value(u + step) - value(u - step)) / (2 * step);
    expect(localSlope(r)).toBeCloseTo(derivative, 9);
    expect(point.localSlope).toBeCloseTo(derivative, 9);
    expect(Math.log(point.pure)).toBeCloseTo(point.logPure, 13);
    expect(Math.log(point.corrected)).toBeCloseTo(point.logCorrected, 13);
    expect(point.localSlope).toBeGreaterThan(-.25);
  }

  const end = model.correlation.at(-1);

  if (!end) throw new Error('The correlation plot needs its final point.');

  expect(end.localSlope).toBeLessThan(first.localSlope);

  for (const point of model.lengthReadouts) {
    const step = point.delta * 1e-4;
    const derivative = (logCorrelationLength(point.delta + step) - logCorrelationLength(point.delta - step)) / (2 * step);
    const analytic = -1 / (2 * point.delta ** 1.5);
    expect(Math.abs(derivative - analytic) / Math.abs(analytic)).toBeLessThan(1e-7);
    expect(point.logXi).toBe(logCorrelationLength(point.delta));
    expect(point.illustrativeB).toBeLessThan(model.illustrativeCriticalB);
  }

  expect(() => correlationAt(1)).toThrow();
  expect(() => logCorrelationLength(0)).toThrow();
});

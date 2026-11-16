import { expect, test } from 'bun:test';
import { buildLastSlopesModel, normalizeSlope, slopeMark, torusCurve } from './math';

test('306: the toy contains exactly the rational window and its surviving opposite pairs satisfy the residue involution', () => {
  const model = buildLastSlopesModel();
  const unique = new Set<string>();

  // Enumerate all unreduced fractions first, independently of the primitive scan.
  for (let p = 1; p <= model.bound; p++) {
    for (let q = 1; q <= model.bound; q++) {
      for (const sign of [1, -1]) unique.add(String(sign * p / q));
    }
  }

  expect(new Set(model.window.map(slope => String(slope.p / slope.q)))).toEqual(unique);

  for (const [index, slope] of model.window.entries()) {
    const opposite = model.window[slope.oppositeIndex];

    if (!opposite) throw new Error('Each generated rational direction needs its opposite.');

    expect(opposite.p * slope.q + slope.p * opposite.q).toBe(0);
    expect(opposite.oppositeIndex).toBe(index);
    expect(opposite.niWu).toBe(slope.niWu);
    expect(Math.abs(slope.x + opposite.x)).toBeLessThan(1e-12);
    expect(Math.abs(slope.y - opposite.y)).toBeLessThan(1e-12);
    expect(Math.abs(slope.x * slope.x + slope.y * slope.y - 1)).toBeLessThan(1e-12);
    const modulus = Math.abs(slope.p);
    let residueProperty = true;

    for (let residue = 0; residue < modulus; residue++) {
      if ((slope.q * (slope.q * residue % modulus) + residue) % modulus !== 0) residueProperty = false;
    }

    expect(slope.niWu).toBe(residueProperty);
  }

  for (const index of model.stages.hanselman) {
    const slope = model.window[index];

    if (!slope) throw new Error('A retained slope needs its original generated entry.');

    expect(slope.niWu).toBe(true);
    expect(Math.abs(slope.p) === 1 || Math.abs(slope.p / slope.q) === 2).toBe(true);
  }

  for (const index of model.stages.dlme) {
    const slope = model.window[index];

    if (!slope) throw new Error('The last two slopes must remain live data after a claim is shown.');

    expect(slope.hanselman).toBe(true);
    expect(Math.abs(slope.p)).toBeGreaterThan(1);
  }
});

test('306: primitive boundary curves close once and measured torus angles recover the longitude and meridian windings', () => {
  for (const input of [{ p: 0, q: 1 }, { p: 1, q: 0 }, { p: 2, q: 1 }, { p: -2, q: 1 }, { p: 1, q: 3 }, { p: 5, q: 2 }, { p: 13, q: 8 }]) {
    const curve = torusCurve(input);
    const first = curve.points[0];
    const last = curve.points.at(-1);

    if (!first || !last) throw new Error('A boundary curve needs its two parameter endpoints.');

    expect(Math.hypot(last.x - first.x, last.y - first.y, last.z - first.z)).toBe(0);
    let previousLongitude = 0;
    let previousMeridian = 0;
    let longitude = 0;
    let meridian = 0;

    for (const point of curve.points.slice(1)) {
      const measuredLongitude = Math.atan2(point.y, point.x);
      const measuredMeridian = Math.atan2(point.z, Math.hypot(point.x, point.y) - curve.majorRadius);
      const longitudeStep = Math.atan2(Math.sin(measuredLongitude - previousLongitude), Math.cos(measuredLongitude - previousLongitude));
      const meridianStep = Math.atan2(Math.sin(measuredMeridian - previousMeridian), Math.cos(measuredMeridian - previousMeridian));
      longitude += longitudeStep;
      meridian += meridianStep;
      previousLongitude = measuredLongitude;
      previousMeridian = measuredMeridian;
      expect(Math.abs(Math.hypot(Math.hypot(point.x, point.y) - curve.majorRadius, point.z) - curve.minorRadius)).toBeLessThan(1e-12);

      if (point.t < 1) expect(Math.hypot(point.x - first.x, point.y - first.y, point.z - first.z)).toBeGreaterThan(1e-8);
    }

    expect(Math.abs(longitude / (2 * Math.PI) - input.q)).toBeLessThan(1e-12);
    expect(Math.abs(meridian / (2 * Math.PI) - input.p)).toBeLessThan(1e-12);
    expect(curve.intersections.withMeridian).toBe(Math.round(Math.abs(longitude / (2 * Math.PI))));
    expect(curve.intersections.withLongitude).toBe(Math.round(Math.abs(meridian / (2 * Math.PI))));
    expect(normalizeSlope(-3 * input.p, -3 * input.q)).toEqual(input);
  }

  expect(slopeMark({ p: 1, q: 0 }).y).toBe(-1);
  expect(slopeMark({ p: 0, q: 1 }).y).toBe(1);
  expect(() => torusCurve({ p: 2, q: 2 })).toThrow(RangeError);
  expect(() => torusCurve({ p: 1.5, q: 1 })).toThrow(RangeError);
  expect(() => normalizeSlope(0, 0)).toThrow(RangeError);
});

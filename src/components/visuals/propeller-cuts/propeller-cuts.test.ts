import { expect, test } from 'bun:test';
import reference from './test-fixture.json';
import { buildPropellerModel, equalAngles, gridScorePartition, gridSectorPartition, midpointGrid, mixAngles, sectorIndex, sectorMoment, sectorPartition } from './math';

const model = buildPropellerModel();

test('096: sector first moments agree with independent polar integration and keep their directions through empty-cell motions', () => {
  const panels = 20000;
  const step = 10 / panels;
  let radial = 0;

  for (let index = 0; index <= panels; index++) {
    const r = index * step;
    const weight = index === 0 || index === panels ? 1 : index % 2 === 1 ? 4 : 2;
    radial += weight * r * r * Math.exp(-r * r / 2) / (2 * Math.PI) * step / 3;
  }

  for (const start of [-75, 0, 23, 260]) {
    for (const opening of [0, 33, 90, 120, 180, 240, 360]) {
      const from = start * Math.PI / 180;
      const to = (start + opening) * Math.PI / 180;
      const moment = sectorMoment(start, opening);
      expect(moment.x).toBeCloseTo(radial * (Math.sin(to) - Math.sin(from)), 12);
      expect(moment.y).toBeCloseTo(radial * (Math.cos(from) - Math.cos(to)), 12);
    }
  }

  const states = [[90, 110, 160], [180, 180], equalAngles(3), equalAngles(4), equalAngles(5), equalAngles(6), [240, 60, 60]];

  for (let index = 0; index < states.length - 1; index++) {
    const from = states[index];
    const to = states[index + 1];

    if (!from || !to) throw new Error('Each continuous sector motion needs its endpoints.');

    for (const amount of [0, .125, .5, .875, 1]) {
      const angles = mixAngles(from, to, amount);
      const partition = sectorPartition(angles, 19);
      expect(angles).toHaveLength(6);
      expect(angles.reduce((sum, angle) => sum + angle, 0)).toBeCloseTo(360, 12);
      expect(partition.moments.reduce((sum, point) => sum + point.x, 0)).toBeCloseTo(0, 12);
      expect(partition.moments.reduce((sum, point) => sum + point.y, 0)).toBeCloseTo(0, 12);
      let start = 19;

      for (const [cell, opening] of angles.entries()) {
        const moment = partition.moments[cell];

        if (!moment) throw new Error('Every labelled cell needs its first moment, including empty cells.');

        expect(opening).toBeGreaterThanOrEqual(0);

        if (opening > 0) {
          const bisector = (start + opening / 2) * Math.PI / 180;
          expect(sectorIndex({ x: Math.cos(bisector), y: Math.sin(bisector) }, angles, 19)).toBe(cell);
        } else expect(moment).toEqual({ x: 0, y: 0 });

        start += opening;
      }
    }
  }

  expect(() => sectorPartition([0, 0, 0])).toThrow();
  expect(() => sectorPartition([120, 120, 119])).toThrow();
});

test('096: degree-search optima and backtracking agree with independent enumeration and the merge inequality for extra sectors', () => {
  const reward = Array.from({ length: 361 }, (_, angle) => Math.sin(angle * Math.PI / 360) ** 2);
  let bestTwo = -Infinity;
  let bestThree = -Infinity;
  let largestMergeDefect = -Infinity;

  for (let a = 0; a <= 360; a++) {
    const first = reward[a];
    const complement = reward[360 - a];

    if (first === undefined || complement === undefined) throw new Error('Each enumerated angle needs its trigonometric reward.');

    bestTwo = Math.max(bestTwo, first + complement);

    for (let b = 0; b <= 360 - a; b++) {
      const second = reward[b];
      const third = reward[360 - a - b];

      if (second === undefined || third === undefined) throw new Error('Each enumerated triple must fill the circle.');

      bestThree = Math.max(bestThree, first + second + third);

      if (a + b <= 180) {
        const merged = reward[a + b];

        if (merged === undefined) throw new Error('The merged sector must have a reward.');

        largestMergeDefect = Math.max(largestMergeDefect, first + second - merged);
      }
    }
  }

  // Among four or more cyclic sectors, an adjacent pair totals at most 180°.
  // Merging that pair cannot decrease F. Repetition reduces the upper search
  // bound to the independently enumerated three-sector problem.
  expect(largestMergeDefect).toBeLessThanOrEqual(1e-14);

  for (const row of model.degreeSearch) {
    const oracle = reference.degreeSearch.find(expected => expected.k === row.k);

    if (!oracle) throw new Error('Every search row needs its independent Python backtracking oracle.');

    expect(row.angles).toHaveLength(row.k);
    expect(row.angles.reduce((sum, angle) => sum + angle, 0)).toBe(360);
    expect(row.value).toBeCloseTo((row.k === 2 ? bestTwo : bestThree) / (2 * Math.PI), 12);
    expect(sectorPartition(row.angles).value).toBeCloseTo(row.value, 12);
    expect(row.angles).toEqual(oracle.angles);
    let active = 0;

    for (const angle of row.angles) {
      expect(Number.isInteger(angle)).toBe(true);

      if (angle > 0) active++;
    }

    expect(active).toBe(row.k === 2 ? 2 : 3);
  }
});

test('096: portable clouds and affine-score grid moments match the Python oracle, with honest finite-grid refinement and reference range', () => {
  expect(model.cloud).toHaveLength(reference.cloud.length);

  for (const [index, point] of model.cloud.entries()) {
    const oracle = reference.cloud[index];

    if (!oracle) throw new Error('Every generated Gaussian point needs its portable oracle.');

    const [x, y] = oracle;

    if (x === undefined || y === undefined) throw new Error('Every Gaussian oracle point needs two coordinates.');

    expect(point.x).toBeCloseTo(x, 12);
    expect(point.y).toBeCloseTo(y, 12);
  }

  expect(model.quadrature.q2).toBeCloseTo(reference.quadrature.two_halves, 12);
  expect(model.quadrature.q3).toBeCloseTo(reference.quadrature.three_sectors, 12);
  const fine = midpointGrid(.0625);
  expect(Math.abs(gridSectorPartition([180, 180], fine).value - model.halves.value)).toBeLessThan(Math.abs(model.quadrature.q2 - model.halves.value));
  expect(Math.abs(gridSectorPartition([120, 120, 120], fine).value - model.propeller.value)).toBeLessThan(Math.abs(model.quadrature.q3 - model.propeller.value));

  let insideReference = 0;

  for (const [index, cut] of model.randomCuts.cuts.entries()) {
    const oracle = reference.randomCuts.cuts[index];

    if (!oracle) throw new Error('Every affine-score partition needs its independently generated grid oracle.');

    expect(cut.value).toBeCloseTo(oracle.F, 12);

    if (Math.abs(cut.value - model.propeller.value) <= .003) insideReference++;

    for (const [cell, score] of cut.scores.entries()) {
      const coefficients = oracle.scores[cell];
      const firstMoment = oracle.moments[cell];
      const moment = cut.moments[cell];

      if (!coefficients || !firstMoment || !moment) throw new Error('Every score cell needs its affine parameters and actual midpoint moment.');

      const [x, y, offset] = coefficients;
      const [momentX, momentY] = firstMoment;

      if (x === undefined || y === undefined || offset === undefined || momentX === undefined || momentY === undefined) throw new Error('Every affine oracle needs three coefficients and a two-coordinate moment.');

      expect(score.x).toBeCloseTo(x, 12);
      expect(score.y).toBeCloseTo(y, 12);
      expect(score.offset).toBeCloseTo(offset, 12);
      expect(moment.x).toBeCloseTo(momentX, 12);
      expect(moment.y).toBeCloseTo(momentY, 12);
    }

    expect(cut.moments.reduce((sum, moment) => sum + moment.x, 0)).toBeCloseTo(0, 12);
    expect(cut.moments.reduce((sum, moment) => sum + moment.y, 0)).toBeCloseTo(0, 12);
  }

  expect(insideReference).toBe(reference.randomCuts.inside_reference_band);
  expect(model.randomCuts.min).toBeCloseTo(reference.randomCuts.min, 12);
  expect(model.randomCuts.max).toBeCloseTo(reference.randomCuts.max, 12);
  const first = model.randomCuts.cuts[0];

  if (!first) throw new Error('The affine sample needs a first cut.');

  const shifted = first.scores.map(score => ({ ...score, offset: score.offset + 10 }));
  expect(gridScorePartition(shifted, midpointGrid()).value).toBeCloseTo(first.value, 12);
});

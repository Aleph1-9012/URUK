import { expect, test } from 'bun:test';
import {
  AKLT_BOND, CLAIMED_BOUNDS, GROUND_ENERGY, LEVELS, ONE_GAPS, PURE_BOND,
  defectAfterSquare, doublingStep, energyBeta, gapFromPurity, ringState, thermalState,
} from '../src/components/visuals/gap-ladder/math';

test('268: the shipped ring spectrum has the correct state count, traces, first gap and bond energies', () => {
  let states = 0;
  let trace = 0;
  let traceSquare = 0;

  for (const level of LEVELS) {
    states += level.count;
    trace += level.count * level.energy;
    traceSquare += level.count * level.energy ** 2;
  }

  expect(LEVELS.length).toBe(683);
  expect(states).toBe(3 ** 8);
  expect(trace).toBeCloseTo(0, 8);
  expect(traceSquare).toBeCloseTo(8 * 12 * 3 ** 6, 7);
  expect(LEVELS[0].count).toBe(1);
  expect(LEVELS[1].count).toBe(3);
  expect(LEVELS[1].energy - LEVELS[0].energy).toBeCloseTo(ONE_GAPS[2], 12);
  expect(GROUND_ENERGY / 8).toBeCloseTo(-1.417119509737168, 12);

  for (const spin of [0, 1, 2] as const) {
    const energy = (spin * (spin + 1) - 4) / 2;
    expect(energy).toBe(PURE_BOND[spin]);
    expect(energy + energy ** 2 / 3).toBeCloseTo(AKLT_BOND[spin], 12);
  }

  expect(ringState(17500)).toMatchObject({ length: 8, spin: .5, gap: .522674, settled: true });
  expect(ringState(26500)).toMatchObject({ length: 8, spin: 1, gap: ONE_GAPS[2], settled: true });
  expect(ringState(72000)).toMatchObject({ length: 9, gap: null });
});

test('268: doubling inverse temperature squares state weights, improves purity and gives the stated lower bounds', () => {
  for (const beta of [2, 4, 8]) {
    const before = thermalState(beta);
    const after = thermalState(beta * 2);
    let total = 0;

    for (const [index, weight] of before.weights.entries()) {
      const squared = after.weights[index];

      if (!squared) throw new Error('Both thermal states use the same spectrum.');

      expect(weight.each ** 2 / before.purity).toBeCloseTo(squared.each, 12);
      total += weight.total;
    }

    expect(total).toBeCloseTo(1, 12);
    expect(after.defect).toBeLessThanOrEqual(defectAfterSquare(before.defect) + 1e-12);
  }

  for (const weights of [[.5, .3, .2], [.98, .01, .01], [1 / 3, 1 / 3, 1 / 3]]) {
    const purity = weights.reduce((sum, weight) => sum + weight ** 2, 0);
    const nextPurity = weights.reduce((sum, weight) => sum + (weight ** 2 / purity) ** 2, 0);
    expect(1 - nextPurity).toBeLessThanOrEqual(defectAfterSquare(1 - purity) + 1e-12);
  }

  const cold = thermalState(16);
  expect(cold.groundWeight).toBeCloseTo(.9997747944, 9);
  expect(cold.purity).toBeCloseTo(.9995496565, 9);
  expect(gapFromPurity(16, cold.purity)).toBeCloseTo(.4815655948, 9);
  expect(CLAIMED_BOUNDS.periodic60).toBeCloseTo(.000479191703, 12);
  expect(CLAIMED_BOUNDS.periodic2304).toBeCloseTo(.003821087084, 12);
  expect(CLAIMED_BOUNDS.open1921).toBeCloseTo(.005873941564, 12);
  expect(doublingStep(3)).toEqual({ sites: 480, beta: 210, power: 8 });
  expect(energyBeta(92000)).toBe(16);
});

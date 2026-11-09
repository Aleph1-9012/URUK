import { expect, test } from 'bun:test';
import { LOCALIZED_STATES, STRONG_STATS } from '../src/components/visuals/trapped-waves/data';
import { binaryApproximation, freeWave, separationCost } from '../src/components/visuals/trapped-waves/math';
import { WaveSimulation } from '../src/components/visuals/trapped-waves/simulation';

test('261: free crops, localized states and the logarithmic cost retain their numerical meaning', () => {
  const total = (values: Iterable<number>): number => {
    let sum = 0;

    for (const value of values) sum += value;

    return sum;
  };

  expect(total(freeWave(7, 81))).toBeCloseTo(1, 7);
  expect(total(freeWave(7, 31))).toBeCloseTo(.9768756171129352, 7);
  expect(total(freeWave(4.5, 21))).toBeCloseTo(.9810678168874577, 7);

  for (const state of LOCALIZED_STATES) {
    let near = 0;

    for (let y = 0; y < 31; y++) {
      for (let x = 0; x < 31; x++) {
        if ((x - 15 - state.x) ** 2 + (y - 15 - state.y) ** 2 <= 9) near += state.density[y * 31 + x] ?? 0;
      }
    }

    expect(total(state.density)).toBeCloseTo(1, 10);
    expect(near).toBeGreaterThan(.9);
  }

  for (const row of STRONG_STATS) {
    expect(row.norm).toBeCloseTo(1, 10);

    if (row.time >= 2) expect(row.within3).toBeGreaterThan(.8);
  }

  for (const [ratio, expected] of [[2, 9.064720284], [4, 4.532360142], [16, 2.266180071], [256, 1.133090035]] as const) {
    expect(separationCost(ratio)).toBeCloseTo(expected, 8);
  }

  for (const value of [-.99, -.4, 0, .37, .999]) {
    const approximation = binaryApproximation(value, 6);
    expect(value - approximation).toBeGreaterThanOrEqual(0);
    expect(value - approximation).toBeLessThan(2 / 64);
  }
});

test('261: the worker evolution matches diagonalization and the weak-disorder reference', async () => {
  const buffer = await Bun.file(new URL('../src/components/visuals/trapped-waves/unit.f64', import.meta.url)).arrayBuffer();
  const unit = new Float64Array(buffer);
  expect(unit.length).toBe(201 * 201);
  const small = new Float64Array(31 * 31);

  for (let y = 0; y < 31; y++) {
    for (let x = 0; x < 31; x++) small[y * 31 + x] = unit[(85 + y) * 201 + 85 + x] ?? 0;
  }

  const strong = new WaveSimulation(small, 8, 31);

  for (let step = 0; step < 80; step++) strong.advance(.5);

  const trapped = strong.frame();
  expect(trapped.norm).toBeCloseTo(1, 9);
  expect(trapped.rms).toBeCloseTo(2.0076611560841626, 8);
  const weak = new WaveSimulation(unit, 2);

  for (let step = 0; step < 80; step++) weak.advance(5);

  const spreading = weak.frame();
  expect(spreading.norm).toBeCloseTo(1, 9);
  expect(spreading.rms).toBeCloseTo(43.36276606098411, 8);
  expect(spreading.edge).toBeCloseTo(.005398951034771828, 10);
  expect(spreading.within31).toBeCloseTo(.27396546754513085, 9);
});

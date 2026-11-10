import { expect, test } from 'bun:test';
import { createFloorModel, gaussian, interpolateWrapped, latticeEnergy, mixtureValue, nearPairs, relaxAtStep, torusEnergy, TRIANGULAR_SPACING, type Point, type Torus } from '../src/components/visuals/cheapest-floor/math';

const model = createFloorModel();

function tiledEnergy(points: readonly Point[], torus: Torus): number {
  let total = 0;

  for (let i = 0; i < points.length; i++) {
    const a = points[i];

    if (!a) throw new Error('Every test point exists.');

    for (let j = 0; j < points.length; j++) {
      const b = points[j];

      if (!b) throw new Error('Every test point exists.');

      for (let tileX = -1; tileX <= 1; tileX++) {
        for (let tileY = -1; tileY <= 1; tileY++) {
          if (i === j && tileX === 0 && tileY === 0) continue;

          total += gaussian(Math.hypot(b.x + tileX * torus.w - a.x, b.y + tileY * torus.h - a.y));
        }
      }
    }
  }

  return total / points.length;
}

test('090: density-one lattice sums agree with the independent square theta product and the triangular shells', () => {
  const triangular = latticeEnergy('triangular');
  const square = latticeEnergy('square');
  const honeycomb = latticeEnergy('honeycomb');
  let theta = 0;

  for (let k = -30; k <= 30; k++) theta += Math.exp(-Math.PI * k * k);

  expect(square).toBeCloseTo(theta * theta - 1, 12);
  expect(triangular).toBeCloseTo(.15960, 5);
  expect(square).toBeCloseTo(.18034, 5);
  expect(honeycomb).toBeCloseTo(.27162, 5);
  expect(model.shells.slice(0, 4).map(shell => [shell.norm, shell.count])).toEqual([[1, 6], [3, 6], [4, 6], [7, 12]]);
  const shellSum = model.shells.reduce((sum, shell) => sum + shell.count * shell.value, 0);
  expect(shellSum).toBeCloseTo(triangular, 10);

  for (const shell of model.shells) {
    expect(shell.radius).toBeCloseTo(TRIANGULAR_SPACING * Math.sqrt(shell.norm), 12);
    expect(shell.value).toBeCloseTo(Math.exp(-Math.PI * 2 / Math.sqrt(3) * shell.norm), 12);
  }

  for (const row of model.byAlpha) {
    const triangularAtAlpha = latticeEnergy('triangular', row.alpha);
    const squareAtAlpha = latticeEnergy('square', row.alpha);
    const honeycombAtAlpha = latticeEnergy('honeycomb', row.alpha);

    expect(triangularAtAlpha).toBeLessThan(squareAtAlpha);
    expect(squareAtAlpha).toBeLessThan(honeycombAtAlpha);
    expect(Math.abs(triangularAtAlpha / row.triangular - 1)).toBeLessThan(.00005);
    expect(Math.abs(squareAtAlpha / row.square - 1)).toBeLessThan(.00005);
    expect(Math.abs(honeycombAtAlpha / row.honeycomb - 1)).toBeLessThan(.00005);
  }
});

test('090: the shipped relaxation and perfect patch have the stated energies, and wrapped interpolation crosses the short way', () => {
  const first = model.frames[0];
  const last = model.frames.at(-1);

  if (!first || !last) throw new Error('The run has its endpoint frames.');

  expect(first.length).toBe(120);
  expect(last.length).toBe(120);
  expect(model.initialEnergy).toBeCloseTo(.99386, 5);
  expect(model.finalEnergy).toBeCloseTo(.16086, 5);
  expect(torusEnergy(model.perfect, model.torus)).toBeCloseTo(model.floor, 9);
  expect(tiledEnergy(last, model.torus)).toBeCloseTo(model.finalEnergy, 12);
  expect(model.finalEnergy).toBeGreaterThan(model.floor);

  for (const step of [50, 500, 1000, 1500]) {
    const recorded = model.energies[step / 10];

    if (!recorded) throw new Error('The labelled landmark has a recorded energy.');

    expect(model.frameSteps.includes(step)).toBe(true);
    expect(Math.abs(torusEnergy(relaxAtStep(model, step), model.torus) - recorded.energy)).toBeLessThan(.00001);
  }

  const midpoint = interpolateWrapped({ x: 9.8, y: .3 }, { x: .2, y: 7.9 }, .5, { w: 10, h: 8 });
  expect(midpoint.x).toBeCloseTo(0, 12);
  expect(midpoint.y).toBeCloseTo(.1, 12);
  const shifted = last.map(point => ({ x: point.x + 2 * model.torus.w, y: point.y - model.torus.h }));
  expect(torusEnergy(shifted, model.torus)).toBeCloseTo(model.finalEnergy, 12);
  const end = relaxAtStep(model, model.steps);

  for (let index = 0; index < end.length; index++) {
    const a = end[index];
    const b = last[index];

    if (!a || !b) throw new Error('The interpolation keeps all point identities.');

    expect(a.x).toBeCloseTo(b.x, 11);
    expect(a.y).toBeCloseTo(b.y, 11);
  }

  const finalDegrees = new Array<number>(120).fill(0);

  for (const pair of nearPairs(last, model.torus, 1.2 * TRIANGULAR_SPACING)) {
    finalDegrees[pair.a] = (finalDegrees[pair.a] ?? 0) + 1;
    finalDegrees[pair.b] = (finalDegrees[pair.b] ?? 0) + 1;
  }

  expect(new Set(finalDegrees)).toEqual(new Set([6]));
});

test('090: the twelve shipped Gaussian bells approximate the inverse power over its stated range', () => {
  expect(model.mixture.length).toBe(12);
  let worst = 0;
  let quadratureDiscrepancy = 0;

  for (let i = 0; i < 400; i++) {
    const t = .3 + 2.7 * i / 399;
    const value = mixtureValue(t, model.mixture);
    let exactQuadrature = 0;

    for (let u = -6; u <= 5; u++) exactQuadrature += Math.exp(u) * Math.exp(-Math.exp(u) * t);

    worst = Math.max(worst, Math.abs(value * t - 1));
    quadratureDiscrepancy = Math.max(quadratureDiscrepancy, Math.abs((value - exactQuadrature) * t));
  }

  expect(worst).toBeLessThan(.004);
  expect(quadratureDiscrepancy).toBeLessThan(.00001);
});

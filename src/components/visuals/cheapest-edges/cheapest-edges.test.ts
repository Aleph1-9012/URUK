import { describe, expect, test } from 'bun:test';
import { annulusIntegral, buildCheapestEdgesModel, solveEnergyToy, solveSegment, tipField } from './math';

function close(actual: number, expected: number, tolerance: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(tolerance);
}

function continuumNoEdge(x: number): number {
  const amplitude = 2 / Math.cosh(.5);

  return x <= .5 ? amplitude * Math.cosh(x) : 4 - amplitude * Math.cosh(1 - x);
}

describe('finite energy and independent continuum comparison', () => {
  test('natural-endpoint minimization, edge scan and continuum refinement agree', () => {
    const model = buildCheapestEdgesModel();
    const { toy } = model;
    const h2 = toy.h ** 2;
    let maximumResidual = 0;

    for (let index = 0; index < toy.cells; index++) {
      const current = toy.noEdge.u[index];
      const original = toy.image[index];

      if (current === undefined || original === undefined) throw new Error('The residual needs each computed image cell.');

      let residual = h2 * (current - original);

      if (index > 0) {
        const previous = toy.noEdge.u[index - 1];

        if (previous === undefined) throw new Error('The interior residual needs its previous cell.');

        residual += current - previous;
      }

      if (index + 1 < toy.cells) {
        const next = toy.noEdge.u[index + 1];

        if (next === undefined) throw new Error('The interior residual needs its next cell.');

        residual += current - next;
      }

      maximumResidual = Math.max(maximumResidual, Math.abs(residual));
      expect(current).toBeGreaterThanOrEqual(-1e-12);
      expect(current).toBeLessThanOrEqual(4 + 1e-12);
      const reflected = toy.noEdge.u[toy.cells - index - 1];

      if (reflected === undefined) throw new Error('The step image comparison needs its reflected cell.');

      close(current + reflected, 4, 1e-10);
      const cutValue = toy.midpoint.u[index];

      if (cutValue === undefined) throw new Error('The edge solution needs each image cell.');

      close(cutValue, original, 1e-10);
    }

    expect(maximumResidual).toBeLessThan(3e-15);
    expect(toy.best.edgeAt).toBe(.5);
    expect(toy.midpoint.total).toBeLessThan(toy.noEdge.total);
    expect(toy.misplaced.total).toBeGreaterThan(toy.noEdge.total);
    close(toy.noEdge.total, toy.noEdge.roughness + toy.noEdge.distance, 1e-13);
    close(toy.midpoint.total, 1, 1e-12);
    const continuumEnergy = 8 * Math.tanh(.5);
    let previousError = Infinity;
    let previousEnergyError = Infinity;

    for (const cells of [100, 200, 400, 800]) {
      const solution = solveEnergyToy(cells);
      let error = 0;

      for (let index = 0; index < cells; index++) {
        const value = solution.u[index];

        if (value === undefined) throw new Error('The refinement comparison needs each solution cell.');

        error = Math.max(error, Math.abs(value - continuumNoEdge((index + .5) / cells)));
      }

      const energyError = Math.abs(solution.total - continuumEnergy);
      expect(error).toBeLessThan(previousError / 3.5);
      expect(energyError).toBeLessThan(previousEnergyError / 3.5);
      previousError = error;
      previousEnergyError = energyError;
    }

    expect(previousError).toBeLessThan(1e-6);
    expect(previousEnergyError).toBeLessThan(2e-6);
    const singleton = solveSegment([2.5], .1);
    const value = singleton.u[0];

    if (value === undefined) throw new Error('The one-cell segment needs its computed intensity.');

    close(value, 2.5, 1e-14);
    close(singleton.roughness + singleton.distance, 0, 1e-14);
  });

  test('the junction and crack-tip fields satisfy independent geometry and calculus facts', () => {
    const { triple, tip } = buildCheapestEdgesModel();
    const [a, b, c] = triple.terminals;
    const ab = Math.hypot(a.x - b.x, a.y - b.y);
    const bc = Math.hypot(b.x - c.x, b.y - c.y);
    const ca = Math.hypot(c.x - a.x, c.y - a.y);
    const area = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / 2;
    const exactNetwork = Math.sqrt((ab ** 2 + bc ** 2 + ca ** 2 + 4 * Math.sqrt(3) * area) / 2);
    close(triple.networkLength, exactNetwork, 1e-13);
    let balanceX = 0;
    let balanceY = 0;

    for (const leg of triple.legs) {
      const length = Math.hypot(leg.x, leg.y);
      balanceX += leg.x / length;
      balanceY += leg.y / length;
    }

    expect(Math.hypot(balanceX, balanceY)).toBeLessThan(2e-14);
    expect(triple.networkLength).toBeLessThan(triple.twoSidesLength);
    expect(triple.networkLength).toBeLessThan(triple.centroidLength);

    for (const angle of triple.angles) close(angle, 120, 1e-10);

    for (const point of [{ x: .4, y: .3 }, { x: -.2, y: .6 }, { x: .3, y: -.2 }]) {
      const field = tipField(point.x, point.y);
      const step = 1e-5;
      const dx = (tipField(point.x + step, point.y).u - tipField(point.x - step, point.y).u) / (2 * step);
      const dy = (tipField(point.x, point.y + step).u - tipField(point.x, point.y - step).u) / (2 * step);
      close(field.gradient.x, dx, 1e-9);
      close(field.gradient.y, dy, 1e-9);
      close(Math.hypot(field.gradient.x, field.gradient.y), .5 / Math.sqrt(field.r), 1e-14);
    }

    // Integrate in log-radius, independently of the analytic radial antiderivative.
    for (const row of tip.rows) {
      for (const [index, epsilon] of tip.epsilons.entries()) {
        const intervals = 2000;
        const start = Math.log(epsilon);
        const step = -start / intervals;
        let sum = 0;

        for (let sample = 0; sample <= intervals; sample++) {
          const r = Math.exp(start + sample * step);
          const gradient = tipField(r, 0).gradient;
          const integrand = 2 * Math.PI * Math.hypot(gradient.x, gradient.y) ** row.power * r ** 2;
          const weight = sample === 0 || sample === intervals ? 1 : sample % 2 === 0 ? 2 : 4;
          sum += weight * integrand;
        }

        const expected = row.values[index];

        if (expected === undefined) throw new Error('Each annular row needs its epsilon value.');

        close(sum * step / 3, expected, 1e-10);
      }
    }

    const p3Limit = Math.PI / 2;
    expect(annulusIntegral(3, 1e-8)).toBeLessThan(p3Limit);
    close(annulusIntegral(3, 1e-8), p3Limit, 2e-4);
    const increment = annulusIntegral(4, 1e-4) - annulusIntegral(4, 1e-2);
    close(annulusIntegral(4, 1e-6) - annulusIntegral(4, 1e-4), increment, 1e-13);
    expect(() => tipField(0, 0)).toThrow();
  });
});

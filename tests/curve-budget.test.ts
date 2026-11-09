import { expect, test } from 'bun:test';
import { CURVES, CURVE_SEGMENTS, MINIMUM_DEGREES, PINS, RANK_CERTIFICATES, RANK_PRIME, coefficientCount, evaluate, gradient, growthRuns, pinchBranches, pointCost } from '../src/components/visuals/curve-budget/math';

function choose(n: number, k: number): number {
  let value = 1;

  for (let index = 1; index <= k; index++) value = value * (n + 1 - index) / index;

  return value;
}

function power(base: number, exponent: number): number {
  let value = 1;
  let factor = (base % RANK_PRIME + RANK_PRIME) % RANK_PRIME;
  let left = exponent;

  while (left > 0) {
    if (left % 2 === 1) value = value * factor % RANK_PRIME;

    factor = factor * factor % RANK_PRIME;
    left = Math.floor(left / 2);
  }

  return value;
}

// Recompute the critical square matrix from the source pins. Each multiplication
// is reduced before another one is added, staying below 2^52 throughout.
function rankAt(degree: number, multiplicity: number): number {
  const monomials: Array<{ x: number; y: number }> = [];

  for (let total = 0; total <= degree; total++) {
    for (let x = 0; x <= total; x++) monomials.push({ x, y: total - x });
  }

  const rows: Float64Array[] = [];

  for (const pin of PINS) {
    const x = Math.round(pin.x * 20);
    const y = Math.round(pin.y * 20);

    for (let total = 0; total < multiplicity; total++) {
      for (let dx = 0; dx <= total; dx++) {
        const dy = total - dx;
        rows.push(Float64Array.from(monomials, (term) => {
          if (term.x < dx || term.y < dy) return 0;

          let value = choose(term.x, dx) * choose(term.y, dy) % RANK_PRIME;
          value = value * power(x, term.x - dx) % RANK_PRIME;

          return value * power(y, term.y - dy) % RANK_PRIME;
        }));
      }
    }
  }

  let rank = 0;

  for (let column = 0; column < monomials.length; column++) {
    const pivot = rows.findIndex((row, index) => index >= rank && row[column] !== 0);

    if (pivot < 0) continue;

    const current = rows[rank];
    const chosen = rows[pivot];

    if (!current || !chosen) continue;

    rows[rank] = chosen;
    rows[pivot] = current;
    const inverse = power(chosen[column] ?? 0, RANK_PRIME - 2);

    for (let j = column; j < monomials.length; j++) chosen[j] = (chosen[j] ?? 0) * inverse % RANK_PRIME;

    for (let i = rank + 1; i < rows.length; i++) {
      const row = rows[i];

      if (!row) continue;

      const factor = row[column] ?? 0;

      for (let j = column; j < monomials.length; j++) {
        row[j] = ((row[j] ?? 0) - factor * (chosen[j] ?? 0)) % RANK_PRIME;

        if ((row[j] ?? 0) < 0) row[j] = (row[j] ?? 0) + RANK_PRIME;
      }
    }

    rank++;

    if (rank === rows.length) break;
  }

  return rank;
}

test('039 curves pass through their stated pins, and the double point and pinch meet correctly', () => {
  for (const pin of PINS.slice(0, 5)) expect(Math.abs(evaluate(CURVES.conic, pin.x, pin.y))).toBeLessThan(1e-12);
  for (const pin of PINS.slice(0, 9)) expect(Math.abs(evaluate(CURVES.cubic, pin.x, pin.y))).toBeLessThan(1e-12);

  for (const index of [0, 2, 3, 4, 5, 6, 7]) {
    const pin = PINS[index];

    if (!pin) throw new Error('The nodal example needs its seven pins.');

    expect(Math.abs(evaluate(CURVES.nodal, pin.x, pin.y))).toBeLessThan(1e-12);
  }

  const derivative = gradient(CURVES.nodal, -.15, .1);
  expect(Math.hypot(derivative.x, derivative.y)).toBeLessThan(1e-12);
  expect(evaluate(CURVES.cubic, -.45, -.05)).toBeCloseTo(.3028514521, 9);
  const pinched = pinchBranches(1);
  expect(pinched.upper[0]).toEqual({ x: 0, y: 0 });
  expect(pinched.oval[100]?.x).toBe(0);
});

test('039 degree certificates preserve the finite-check scope, including the nonexistence at m=6,d=19', () => {
  expect(rankAt(19, 6)).toBe(210);
  expect(19).toBeGreaterThan(6 * Math.sqrt(10));

  for (const certificate of RANK_CERTIFICATES) {
    expect(coefficientCount(certificate.excludedDegree)).toBe(certificate.rank);
    expect(certificate.firstColumns).toBeGreaterThan(10 * pointCost(certificate.m));
    const minimum = MINIMUM_DEGREES[certificate.m - 1];

    if (minimum === undefined) throw new Error('Every certificate needs its plotted minimum degree.');

    expect(minimum).toBe(certificate.firstDegree);
    expect(certificate.firstDegree).toBeGreaterThan(certificate.m * Math.sqrt(10));
  }
});

test('039 curves are drawn in from their first pins without losing a segment', () => {
  const conic = growthRuns(CURVE_SEGMENTS.conic, PINS);
  const run = conic[0]?.[0];
  const near = (index: number) => Math.min(...(run?.points ?? []).map((point) => Math.hypot(point.x - (PINS[index]?.x ?? 0), point.y - (PINS[index]?.y ?? 0))));
  const reached = (index: number) => run?.points.findIndex((point) => Math.hypot(point.x - (PINS[index]?.x ?? 0), point.y - (PINS[index]?.y ?? 0)) === near(index)) ?? -1;

  expect(conic.length).toBe(1);
  expect(near(0)).toBeLessThan(.02);
  expect(reached(0)).toBe(0);
  expect(reached(1)).toBeLessThan(reached(2));
  expect(growthRuns(CURVE_SEGMENTS.cubic, PINS).length).toBe(2);
  expect(growthRuns(CURVE_SEGMENTS.nodal, PINS).length).toBe(3);

  for (const name of ['conic', 'cubic', 'nodal'] as const) {
    const pieces = growthRuns(CURVE_SEGMENTS[name], PINS);
    let drawn = 0;

    for (const runs of pieces) {
      for (const each of runs) drawn += each.points.length - 1;
    }

    expect(drawn).toBe(CURVE_SEGMENTS[name].length);
  }
});

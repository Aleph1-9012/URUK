import { expect, test } from 'bun:test';
import reference from './fixtures/promised-three.json';
import { createColourModel, firstFitColouring, properColouring } from '../src/components/visuals/promised-three/math';

const model = createColourModel();

test('106: every first-fit prefix makes the lowest legal choice in the shipped order and both full colorings are proper', () => {
  const colors = new Map<number, number>();

  for (const [index, step] of model.firstFit.steps.entries()) {
    const oracle = reference.first_fit_steps[index];

    if (!oracle) throw new Error('Each first-fit placement has its independent Python reference.');

    expect(model.firstFitOrder[index]).toBe(step.vertex);
    const neighbours: number[] = [];
    const forbidden = new Set<number>();

    for (const [a, b] of model.edges) {
      const other = a === step.vertex ? b : b === step.vertex ? a : null;

      if (other === null) continue;

      const color = colors.get(other);

      if (color === undefined) continue;

      neighbours.push(other);
      forbidden.add(color);
    }

    let selected = 0;

    while (forbidden.has(selected)) selected++;

    expect(step.color).toBe(selected);
    expect(step.neighbours).toEqual(neighbours.sort((a, b) => a - b));
    expect(step.used).toEqual([...forbidden].sort((a, b) => a - b));
    colors.set(step.vertex, selected);
    const settled = Array.from({ length: model.n }, (_, vertex) => colors.get(vertex) ?? -1);
    expect(step.colors).toEqual(settled);
    expect(step.colors).toEqual(oracle.colors);
    expect(step.colorCount).toBe(new Set(colors.values()).size);

    for (const [a, b] of model.edges) {
      const first = colors.get(a);
      const second = colors.get(b);

      if (first !== undefined && second !== undefined) expect(first).not.toBe(second);
    }
  }

  expect(model.firstFit.colors).toEqual(reference.first_fit);
  expect(model.firstFit.colorCount).toBe(reference.first_fit_colours);
  expect(properColouring(model.n, model.edges, model.firstFit.colors)).toBe(true);
  expect(properColouring(model.n, model.edges, model.planted)).toBe(true);
  expect(firstFitColouring(model.n, model.edges, Array.from({ length: model.n }, (_, vertex) => vertex)).colorCount).toBe(3);
  expect(model.classes.map(group => group.length)).toEqual([6, 6, 6]);
  expect(model.liftedClass).toEqual([12, 13, 14, 15, 16, 17]);

  for (const [a, b] of model.edges) expect(model.planted[a]).not.toBe(model.planted[b]);
});

test('106: exhaustive edge scans independently certify alpha = 6, all 12 maximum sets and chromatic number exactly 3', () => {
  const histogram = Array<number>(model.n + 1).fill(0);
  const largest: number[] = [];
  let maximum = -1;
  let twoColorings = 0;

  // Every subset is checked by scanning original edge endpoints, independently
  // of both take/drop optimization and Python's smaller-subset recurrence.
  for (let mask = 0; mask < 2 ** model.n; mask++) {
    let independent = true;
    let twoColoring = true;

    for (const [a, b] of model.edges) {
      const first = Boolean(mask & (1 << a));
      const second = Boolean(mask & (1 << b));

      if (first && second) independent = false;

      if (first === second) twoColoring = false;

      if (!independent && !twoColoring) break;
    }

    if (twoColoring) twoColorings++;

    if (!independent) continue;

    let size = 0;

    for (let vertex = 0; vertex < model.n; vertex++) {
      if (mask & (1 << vertex)) size++;
    }

    const previous = histogram[size];

    if (previous === undefined) throw new Error('An independent set has a valid cardinality bin.');

    histogram[size] = previous + 1;

    if (size > maximum) {
      maximum = size;
      largest.length = 0;
    }

    if (size === maximum) largest.push(mask);
  }

  expect(histogram).toEqual(reference.independent_histogram);
  expect(largest).toEqual(reference.largest_masks);
  expect(maximum).toBe(reference.alpha);
  expect(model.alpha).toBe(maximum);
  const lastMaximum = largest.at(-1);

  if (lastMaximum === undefined) throw new Error('The graph has at least one maximum independent set.');

  expect(model.independence.mask).toBe(lastMaximum);
  expect(model.maximumIndependentSet).toEqual(reference.alpha_set);
  expect(twoColorings).toBe(reference.two_colorings);
  expect(twoColorings).toBe(0);
  const [a, b, c] = model.triangle;

  for (const [u, v] of [[a, b], [a, c], [b, c]]) {
    expect(model.edges.some(([x, y]) => (x === u && y === v) || (x === v && y === u))).toBe(true);
  }

  expect(reference.triangles).toContainEqual([...model.triangle]);
  expect(new Set(model.planted).size).toBe(3);
  expect(model.chromatic).toBe(reference.chromatic);
});

test('106: isolates preserve the exact chromatic certificate while increasing independence, and the power-only curve matches decimal oracles', () => {
  const extended = model.withIsolates;
  expect(extended.n).toBe(model.n + extended.isolateCount);
  expect(extended.independentSet.length).toBe(extended.alpha);
  expect(new Set(extended.independentSet).size).toBe(extended.alpha);
  expect(extended.independentSet.slice(0, model.alpha)).toEqual(model.maximumIndependentSet);
  expect(extended.independentSet.slice(model.alpha)).toEqual(extended.isolated);

  for (const vertex of extended.isolated) {
    expect(vertex).toBeGreaterThanOrEqual(model.n);
    expect(vertex).toBeLessThan(extended.n);
  }

  for (const [a, b] of model.edges) {
    expect(extended.independentSet.includes(a) && extended.independentSet.includes(b)).toBe(false);
    expect(extended.colors[a]).not.toBe(extended.colors[b]);
  }

  // Any extended independent set restricts to at most alpha vertices of the
  // original graph, and at most all isolates; the shown witness attains both.
  expect(extended.alpha).toBe(model.alpha + extended.isolateCount);
  expect(extended.ratio).toBe(extended.alpha / extended.n);
  expect(extended.ratio).toBeGreaterThan(model.alpha / model.n);
  expect(extended.ratio.toFixed(3)).toBe(reference.ratio_with_isolated.toFixed(3));
  expect(extended.chromatic).toBe(model.chromatic);
  expect(properColouring(extended.n, model.edges, extended.colors)).toBe(true);

  for (const reading of model.growthReadings) {
    const text = Object.entries(reference.n_0195_decimal).find(([n]) => Number(n) === reading.n)?.[1];

    if (!text) throw new Error('Every plotted anchor has its independent 70-digit Decimal power reference.');

    const expected = Number(text);
    expect(Math.abs(reading.value - expected) / expected).toBeLessThan(1e-15);
  }

  for (let index = 1; index < model.growth.length; index++) {
    const first = model.growth[index - 1];
    const second = model.growth[index];

    if (!first || !second) throw new Error('The power-only curve has both neighboring samples.');

    expect(second.n).toBeGreaterThan(first.n);
    expect(second.value).toBeGreaterThan(first.value);
  }

  expect(new Set(model.positions.map(point => `${point.x},${point.y}`)).size).toBe(model.n);
});

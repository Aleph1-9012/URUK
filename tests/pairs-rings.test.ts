import { expect, test } from 'bun:test';
import reference from './fixtures/pairs-rings.json';
import { createPairsModel, edgeKey, freeVertices, shortestAugmentingPath, validMatching, type Edge, type Point } from '../src/components/visuals/pairs-rings/math';

const model = createPairsModel();

function oracleEdges(pairs: readonly number[][]): Edge[] {
  return pairs.map(pair => {
    const [a, b] = pair;

    if (a === undefined || b === undefined || pair.length !== 2) throw new Error('Each independent willing pair has two endpoints.');

    return [a, b];
  });
}

function independentMatchings(n: number, edges: readonly Edge[]): { best: number; count: number } {
  const adjacent: number[][] = Array.from({ length: n }, () => []);

  for (const [a, b] of edges) {
    const first = adjacent[a];
    const second = adjacent[b];

    if (!first || !second) throw new Error('The recursive matching check has both adjacency lists.');

    first.push(b);
    second.push(a);
  }

  const memo = new Map<number, { best: number; count: number }>();

  function solve(remaining: number): { best: number; count: number } {
    if (remaining === 0) return { best: 0, count: 1 };

    const known = memo.get(remaining);

    if (known) return known;

    let first = 0;

    while (!(remaining & 1 << first)) first++;

    const withoutFirst = remaining & ~(1 << first);
    const unpaired = solve(withoutFirst);
    let best = unpaired.best;
    let count = unpaired.count;
    const neighbors = adjacent[first];

    if (!neighbors) throw new Error('The first remaining person has its available partners.');

    for (const other of neighbors) {
      if (!(remaining & 1 << other)) continue;

      const paired = solve(withoutFirst & ~(1 << other));
      best = Math.max(best, paired.best + 1);
      count += paired.count;
    }

    const answer = { best, count };
    memo.set(remaining, answer);

    return answer;
  }

  return solve((1 << n) - 1);
}

function bipartite(n: number, edges: readonly Edge[]): boolean {
  const signs = new Int8Array(n);

  for (let start = 0; start < n; start++) {
    if (signs[start]) continue;

    signs[start] = 1;
    const queue = [start];

    for (const vertex of queue) {
      for (const [a, b] of edges) {
        const other = a === vertex ? b : b === vertex ? a : -1;

        if (other < 0) continue;

        const sign = signs[vertex];

        if (sign === undefined) throw new Error('A queued person has its assigned kind.');
        if (signs[other] === sign) return false;
        if (!signs[other]) {
          signs[other] = -sign;
          queue.push(other);
        }
      }
    }
  }

  return true;
}

test('120: independent vertex recursion certifies the exhaustive maximum and every live greedy/augmenting state', () => {
  const independent = independentMatchings(model.n, model.edges);
  expect(model.maximum).toBe(reference.maximum);
  expect(model.maximum).toBe(independent.best);
  expect(model.validSubsets).toBe(independent.count);
  expect(model.validSubsets).toBe(reference.valid_subsets);
  expect(model.checkedSubsets).toBe(reference.checked_subsets);
  expect(model.greedy).toEqual(oracleEdges(reference.greedy));
  expect(freeVertices(model.n, model.greedy)).toEqual([4, 11]);
  expect(model.greedySteps.length).toBe(reference.greedy_steps.length);

  for (const [index, step] of model.greedySteps.entries()) {
    const oracle = reference.greedy_steps[index];

    if (!oracle) throw new Error('Every attempted greedy link has its independent canonical record.');

    expect(step.matching).toEqual(oracleEdges(oracle.matching));
    expect(step.free).toEqual(oracle.free);
    expect(step.accepted).toBe(oracle.accepted);
    expect(validMatching(model.n, step.matching)).toBe(true);
  }

  const available = new Set(model.edges.map(edgeKey));
  const selected = new Set(model.greedy.map(edgeKey));
  const free = freeVertices(model.n, model.greedy);
  const shortPaths: number[][] = [];

  for (const start of free) {
    for (const end of free) {
      if (start === end) continue;

      expect(available.has(edgeKey([start, end]))).toBe(false);

      for (let a = 0; a < model.n; a++) {
        for (let b = 0; b < model.n; b++) {
          if (new Set([start, a, b, end]).size !== 4) continue;
          if (!available.has(edgeKey([start, a])) || !available.has(edgeKey([a, b])) || !available.has(edgeKey([b, end]))) continue;
          if (selected.has(edgeKey([start, a])) || !selected.has(edgeKey([a, b])) || selected.has(edgeKey([b, end]))) continue;

          shortPaths.push([start, a, b, end]);
        }
      }
    }
  }

  expect(shortPaths.some(path => path.every((vertex, index) => vertex === model.augmentingPath[index]))).toBe(true);
  const firstStep = reference.steps[0];

  if (!firstStep) throw new Error('The independent example has its first augmentation.');

  expect(model.augmentingPath).toEqual(firstStep.path);
  expect(model.flip.removed).toEqual([[0, 1]]);
  expect(new Set(model.flip.added.map(edgeKey))).toEqual(new Set(['0,4', '1,11']));
  expect(model.final).toEqual(oracleEdges(reference.final));
  expect(validMatching(model.n, model.final)).toBe(true);
  expect(freeVertices(model.n, model.final)).toEqual([]);
  expect(shortestAugmentingPath(model.n, model.edges, model.final)).toBeNull();
});

test('120: the blossom hides two internal pairs, preserves the outward base bond, and differs from the separate bipartite inset', () => {
  const blossom = model.blossom;
  expect(blossom.base).toBe(reference.blossom.base);
  expect(blossom.internalMatching).toEqual(oracleEdges(reference.blossom.internal_matching));
  expect(blossom.contractedMatching).toEqual(oracleEdges(reference.blossom.contracted_matching));
  expect(blossom.contractedEdges).toEqual(oracleEdges(reference.blossom.contracted_edges));
  expect(blossom.cycle.length % 2).toBe(1);
  expect(blossom.externalMatching.some(edge => edgeKey(edge) === '1,11')).toBe(true);
  expect(blossom.contractedMatching.some(edge => edgeKey(edge) === '11,12')).toBe(true);
  expect(blossom.contractedMatching.length + blossom.internalMatching.length).toBe(model.final.length);
  const contractedPeople = new Set(blossom.contractedVertices);
  const contractedPaired = new Set(blossom.contractedMatching.flat());
  expect(contractedPaired).toEqual(contractedPeople);
  expect(independentMatchings(model.n + 1, blossom.contractedEdges).best + blossom.internalMatching.length).toBe(model.maximum);

  const cycleEdges: Edge[] = [];

  for (const [index, a] of blossom.cycle.entries()) {
    const b = blossom.cycle[(index + 1) % blossom.cycle.length];

    if (b === undefined) throw new Error('The independently checked odd ring closes.');

    cycleEdges.push([a, b]);
  }

  // Every choice of exposed ring person leaves a matching covering the other four.
  for (const exposed of blossom.cycle) {
    let coversOthers = false;

    for (let subset = 0; subset < 32; subset++) {
      const occupied: number[] = [];

      for (const [index, edge] of cycleEdges.entries()) {
        if (subset & 1 << index) occupied.push(...edge);
      }

      if (occupied.length === 4 && new Set(occupied).size === 4 && !occupied.includes(exposed)) coversOthers = true;
    }

    expect(coversOthers).toBe(true);
  }

  expect(bipartite(model.n, model.edges)).toBe(false);
  expect(bipartite(model.inset.n, model.inset.edges)).toBe(true);
  expect(model.inset.matching.length).toBe(independentMatchings(model.inset.n, model.inset.edges).best);
  expect(model.inset.matching.flat().length).toBe(new Set(model.inset.matching.flat()).size);
  expect(new Set([...model.inset.left, ...model.inset.right]).size).toBe(model.inset.n);
});

test('120: shared drawing coordinates have no link crossings and the genuine sparse-chart values match the independent table', () => {
  function point(index: number): Point {
    const position = model.positions[index];

    if (!position) throw new Error('Every drawn person has a shared position.');

    return position;
  }

  function orientation(a: Point, b: Point, c: Point): number {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  }

  let crossings = 0;

  for (const [index, [a, b]] of model.edges.entries()) {
    for (const [c, d] of model.edges.slice(index + 1)) {
      if (new Set([a, b, c, d]).size !== 4) continue;
      if (orientation(point(a), point(b), point(c)) * orientation(point(a), point(b), point(d)) < -1e-12 && orientation(point(c), point(d), point(a)) * orientation(point(c), point(d), point(b)) < -1e-12) crossings++;
    }
  }

  expect(crossings).toBe(0);
  expect(model.ringCentre).toEqual({ x: 0, y: 0 });

  for (const [index, row] of model.chart.entries()) {
    const oracle = reference.chart[index];

    if (!oracle) throw new Error('Each chart sample has its independent Python value.');

    expect(row.n).toBe(oracle.n);
    expect(row.input).toBe(oracle.n_plus_m);
    expect(Math.round(row.classical)).toBe(oracle.m_sqrt_n);
  }
});

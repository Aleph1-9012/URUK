import { expect, test } from 'bun:test';
import { analyzeGraph, buildBranchSetsModel, chartValues, cycleGraph, graphFromEdges, isEdge, matchingWitness, minorWitness, properColouring, type Edge, type Graph, type GraphAnalysis } from './math';

function matrix(graph: Graph): number[][] {
  const result = Array.from({ length: graph.n }, () => Array<number>(graph.n).fill(0));

  for (const [a, b] of graph.edges) {
    const first = result[a];
    const second = result[b];

    if (!first || !second) throw new Error('Every oracle edge needs two matrix rows.');

    first[b] = 1;
    second[a] = 1;
  }

  return result;
}

function extremeSetSize(adjacency: number[][], wanted: number): number {
  let best = 0;

  for (let mask = 1; mask < 1 << adjacency.length; mask++) {
    let size = 0;
    let qualifies = true;

    for (let a = 0; a < adjacency.length; a++) {
      if (!(mask & (1 << a))) continue;

      size++;

      for (let b = a + 1; b < adjacency.length; b++) {
        if ((mask & (1 << b)) && adjacency[a]?.[b] !== wanted) qualifies = false;
      }
    }

    if (qualifies) best = Math.max(best, size);
  }

  return best;
}

function bruteColours(adjacency: number[][]): number {
  if (!adjacency.length) return 0;

  for (let k = 1; k <= adjacency.length; k++) {
    for (let word = 0; word < k ** adjacency.length; word++) {
      let digits = word;
      const colours: number[] = [];

      for (let vertex = 0; vertex < adjacency.length; vertex++) {
        colours.push(digits % k);
        digits = Math.floor(digits / k);
      }

      let proper = true;

      for (let a = 0; a < adjacency.length; a++) {
        for (let b = a + 1; b < adjacency.length; b++) {
          if (adjacency[a]?.[b] === 1 && colours[a] === colours[b]) proper = false;
        }
      }

      if (proper) return k;
    }
  }

  throw new Error('The independent colouring oracle must reach the singleton colouring.');
}

function contract(adjacency: number[][], a: number, b: number): number[][] {
  const keep: number[] = [];

  for (let vertex = 0; vertex < adjacency.length; vertex++) {
    if (vertex !== b) keep.push(vertex);
  }

  return keep.map(x => keep.map(y => {
    if (x === y) return 0;

    const first = x === a ? [a, b] : [x];
    const second = y === a ? [a, b] : [y];

    return Number(first.some(u => second.some(v => adjacency[u]?.[v] === 1)));
  }));
}

function contractionOracle(adjacency: number[][]): number {
  const states = [adjacency];
  const seen = new Set<string>();
  let best = 0;

  // Unlike production's branch-set partition search, this explores actual edge
  // contractions. Taking a clique at each state also permits unused vertices.
  for (const current of states) {
    const key = current.map(row => row.join('')).join('/');

    if (seen.has(key)) continue;

    seen.add(key);
    best = Math.max(best, extremeSetSize(current, 1));

    for (let a = 0; a < current.length; a++) {
      for (let b = a + 1; b < current.length; b++) {
        if (current[a]?.[b] === 1) states.push(contract(current, a, b));
      }
    }
  }

  return best;
}

function checkWitnesses(row: GraphAnalysis): void {
  expect(properColouring(row.graph, row.colours)).toBe(true);
  const occupied = new Set<number>();

  for (const [index, group] of row.minor.branches.entries()) {
    const tree = row.minor.trees[index];

    if (!tree) throw new Error('Each branch witness needs its spanning tree.');

    expect(tree.length).toBe(group.length - 1);

    for (const vertex of group) {
      expect(occupied.has(vertex)).toBe(false);
      occupied.add(vertex);
    }

    const reached = new Set<number>();
    const first = group[0];

    if (first === undefined) throw new Error('Every tested branch set must be nonempty.');

    reached.add(first);

    for (let pass = 0; pass < group.length; pass++) {
      for (const [a, b] of tree) {
        expect(isEdge(row.graph, a, b)).toBe(true);
        expect(group.includes(a) && group.includes(b)).toBe(true);

        if (reached.has(a)) reached.add(b);
        if (reached.has(b)) reached.add(a);
      }
    }

    expect(reached.size).toBe(group.length);
  }

  expect(row.minor.connections.length).toBe(row.minor.h * (row.minor.h - 1) / 2);

  for (const connection of row.minor.connections) {
    expect(isEdge(row.graph, ...connection.edge)).toBe(true);
    expect(row.minor.branches[connection.a]?.includes(connection.edge[0])).toBe(true);
    expect(row.minor.branches[connection.b]?.includes(connection.edge[1])).toBe(true);
  }

  const matched = new Set<number>();

  for (const edge of row.matching.edges) {
    expect(isEdge(row.graph, ...edge)).toBe(true);

    for (const vertex of edge) {
      expect(matched.has(vertex)).toBe(false);
      matched.add(vertex);
    }
  }

  expect(row.matching.connections.length).toBe(Math.max(0, row.matching.cm * (row.matching.cm - 1) / 2));

  for (const connection of row.matching.connections) {
    expect(isEdge(row.graph, ...connection.edge)).toBe(true);
    expect(row.matching.edges[connection.a]?.includes(connection.edge[0])).toBe(true);
    expect(row.matching.edges[connection.b]?.includes(connection.edge[1])).toBe(true);
  }
}

test('157: live cycle complements have certified colourings, independent pairs, complete-minor branches and maximum connected matchings', () => {
  const model = buildBranchSetsModel();
  expect(model.fiveCycle.chi).toBe(3);
  expect(model.fiveCycle.alpha).toBe(2);
  expect(model.fiveCycle.minor.h).toBe(3);
  expect(model.colouringAttempts.length).toBe(32);

  for (const attempt of model.colouringAttempts) {
    expect(properColouring(model.fiveCycle.graph, attempt.colours)).toBe(false);
    expect(attempt.clashes.length).toBeGreaterThan(0);
  }

  const complement = model.small[0];

  if (!complement) throw new Error('The carried family must start at the complementary five-cycle.');

  for (let a = 0; a < 5; a++) {
    for (let b = a + 1; b < 5; b++) {
      const x = model.isomorphism[a];
      const y = model.isomorphism[b];

      if (x === undefined || y === undefined) throw new Error('The cycle relabelling needs all five targets.');

      expect(isEdge(model.fiveCycle.graph, a, b)).toBe(isEdge(complement.graph, x, y));
    }
  }

  expect(model.contraction.branches).toEqual([[0, 1, 2], [3], [4]]);
  expect(model.contraction.trees[0]).toEqual([[0, 1], [1, 2]]);
  expect(model.triangle.edges.length).toBe(3);

  for (const row of model.small) {
    const adjacency = matrix(row.graph);
    const clique = extremeSetSize(adjacency, 1);
    const independent = extremeSetSize(adjacency, 0);
    checkWitnesses(row);
    expect(independent).toBe(2);
    expect(row.alpha).toBe(independent);
    expect(row.chi).toBe(Math.ceil(row.graph.n / independent));
    // A t-minor on n vertices has at least 2t−n singleton branches; those
    // singletons form a clique. This independently certifies these h maxima.
    expect(row.minor.h).toBe(Math.floor((row.graph.n + clique) / 2));
    expect(row.matching.cm).toBe(Math.floor(row.graph.n / 2));
  }
});

test('157: exact searches agree with independent colour-word and edge-contraction oracles on every labelled four-vertex graph', () => {
  const possible: Edge[] = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];

  for (let mask = 0; mask < 64; mask++) {
    const edges: Edge[] = [];

    for (const [index, edge] of possible.entries()) {
      if (mask & (1 << index)) edges.push(edge);
    }

    const row = analyzeGraph(graphFromEdges(4, edges));
    const adjacency = matrix(row.graph);
    expect(row.chi).toBe(bruteColours(adjacency));
    expect(row.alpha).toBe(extremeSetSize(adjacency, 0));
    expect(row.minor.h).toBe(contractionOracle(adjacency));
    checkWitnesses(row);
    expect(3 * row.minor.h).toBeLessThanOrEqual(row.graph.n + 4 * row.matching.cm + 2);
  }

  const empty = analyzeGraph(graphFromEdges(0, []));
  expect([empty.chi, empty.alpha, empty.minor.h, empty.matching.cm]).toEqual([0, 0, 0, 0]);
});

test('157: one cross-edge suffices for a connected matching, and the large-order chart keeps finite and asymptotic bounds distinct', () => {
  const path = graphFromEdges(4, [[0, 1], [1, 2], [2, 3]]);
  const witness = matchingWitness(path, [[0, 1], [2, 3]]);
  expect(witness.cm).toBe(2);
  expect(witness.connections).toEqual([{ a: 0, b: 1, edge: [1, 2] }]);
  expect(analyzeGraph(path).matching.cm).toBe(2);
  expect(analyzeGraph(graphFromEdges(4, [[0, 1], [2, 3]])).matching.cm).toBe(1);
  expect(() => matchingWitness(path, [[0, 1], [1, 2]])).toThrow();
  expect(() => minorWitness(cycleGraph(5), [[0, 2], [1], [3]])).toThrow();
  expect(() => minorWitness(path, [[99]])).toThrow();

  const model = buildBranchSetsModel();
  let previous = 0;

  for (const m of [101, 200, 1000, 100000, 10000000]) {
    const row = chartValues(m);
    const ratio = row.half / row.claimedH;
    expect(row.claimedH / ((m + 4 * (m / 100) + 2) / 3)).toBeCloseTo(1, 14);
    expect(row.third).toBeLessThan(row.claimedH);
    expect(row.claimedH).toBeLessThan(row.half);
    expect(ratio).toBeGreaterThan(previous);
    expect(ratio).toBeLessThan(model.ratio);
    previous = ratio;
  }

  expect(previous).toBeCloseTo(model.ratio, 6);
  expect(chartValues(4).claimedH).toBeGreaterThan(chartValues(4).half);
});

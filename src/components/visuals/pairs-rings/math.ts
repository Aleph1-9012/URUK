// Graph input and free editorial positions come from 120-checks/matching.py.
// Matchings, augmentations and the exhaustive maximum are recomputed live.
import data from './data.json';

export type Point = { x: number; y: number };

export type Edge = readonly [number, number];

export type Matching = Edge[];

export type GreedyStep = { edge: Edge; accepted: boolean; matching: Matching; free: number[] };

export type RuntimeReading = { n: number; m: number; classical: number; input: number };

export type Blossom = {
  base: number;
  cycle: number[];
  internalMatching: Matching;
  externalMatching: Matching;
  superVertex: number;
  contractedVertices: number[];
  contractedEdges: Edge[];
  contractedMatching: Matching;
};

export type BipartiteExample = { n: number; positions: Point[]; left: number[]; right: number[]; edges: Edge[]; matching: Matching };

function edgeFrom(pair: readonly number[]): Edge {
  const [a, b] = pair;

  if (a === undefined || b === undefined || pair.length !== 2) throw new Error('Each willing pair has two endpoints.');

  return [a, b];
}

function pointFrom(pair: readonly number[]): Point {
  const [x, y] = pair;

  if (x === undefined || y === undefined || pair.length !== 2) throw new Error('Each drawing position has two coordinates.');

  return { x, y };
}

export function edgeKey(edge: Edge): string {
  return `${Math.min(...edge)},${Math.max(...edge)}`;
}

function normalized(edge: Edge): Edge {
  return edge[0] < edge[1] ? edge : [edge[1], edge[0]];
}

function sortedEdges(edges: readonly Edge[]): Matching {
  return edges.map(normalized).sort(([a, b], [c, d]) => a - c || b - d);
}

/** Disjoint in-range endpoints; callers select edges from the graph. */
export function validMatching(n: number, matching: readonly Edge[]): boolean {
  const occupied = new Set<number>();

  for (const [a, b] of matching) {
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= n || b >= n || a === b || occupied.has(a) || occupied.has(b)) return false;

    occupied.add(a);
    occupied.add(b);
  }

  return true;
}

export function freeVertices(n: number, matching: readonly Edge[]): number[] {
  if (!Number.isInteger(n) || n < 1 || !validMatching(n, matching)) throw new RangeError('Free vertices are computed from a valid matching.');

  const used = new Set<number>();

  for (const [a, b] of matching) {
    used.add(a);
    used.add(b);
  }

  const free: number[] = [];

  for (let vertex = 0; vertex < n; vertex++) {
    if (!used.has(vertex)) free.push(vertex);
  }

  return free;
}

function greedyHistory(n: number, edges: readonly Edge[]): { matching: Matching; steps: GreedyStep[]; stages: Matching[] } {
  const matching: Matching = [];
  const steps: GreedyStep[] = [];
  const stages: Matching[] = [[]];

  for (const edge of edges) {
    const candidate = [...matching, edge];
    const accepted = validMatching(n, candidate);

    if (accepted) {
      matching.push(edge);
      stages.push(matching.slice());
    }

    steps.push({ edge, accepted, matching: matching.slice(), free: freeVertices(n, matching) });
  }

  return { matching, steps, stages };
}

export function greedyMatching(n: number, edges: readonly Edge[]): Matching {
  return greedyHistory(n, edges).matching;
}

/** Breadth-first enumeration of simple alternating paths on this small graph. */
export function shortestAugmentingPath(n: number, edges: readonly Edge[], matching: readonly Edge[]): number[] | null {
  if (!validMatching(n, matching)) throw new Error('An alternating-path search starts from a valid matching.');

  const graph: number[][] = Array.from({ length: n }, () => []);
  const occupied = new Set<number>();
  const matchedEdges = new Set(matching.map(edgeKey));

  for (const [a, b] of edges) {
    const first = graph[a];
    const second = graph[b];

    if (!first || !second) throw new Error('Every willing pair belongs to the finite network.');

    first.push(b);
    second.push(a);
  }

  for (const [a, b] of matching) {
    occupied.add(a);
    occupied.add(b);
  }

  // The descending source order fixes only the orientation of tied shortest paths.
  const queue = freeVertices(n, matching).reverse().map(vertex => [vertex]);

  for (let cursor = 0; cursor < queue.length; cursor++) {
    const path = queue[cursor];
    const end = path?.at(-1);

    if (!path || end === undefined) throw new Error('Every alternating-search state has its current endpoint.');

    const neighbors = graph[end];

    if (!neighbors) throw new Error('The current alternating endpoint has its adjacency list.');

    const wantMatched = path.length % 2 === 0;

    for (const next of neighbors) {
      if (path.includes(next) || matchedEdges.has(edgeKey([end, next])) !== wantMatched) continue;

      const candidate = [...path, next];

      if (!occupied.has(next) && candidate.length % 2 === 0) return candidate;

      queue.push(candidate);
    }
  }

  return null;
}

export function pathEdges(path: readonly number[]): Edge[] {
  const edges: Edge[] = [];

  for (let index = 1; index < path.length; index++) {
    const a = path[index - 1];
    const b = path[index];

    if (a === undefined || b === undefined) throw new Error('Every path link has consecutive endpoints.');

    edges.push(normalized([a, b]));
  }

  return edges;
}

export function flipMatching(n: number, edges: readonly Edge[], matching: readonly Edge[], path: readonly number[]): { removed: Matching; added: Matching; result: Matching } {
  if (!validMatching(n, matching) || path.length < 2 || path.length % 2 !== 0 || new Set(path).size !== path.length) throw new Error('An augmentation uses a simple odd-edge alternating path.');

  const start = path[0];
  const end = path.at(-1);
  const free = new Set(freeVertices(n, matching));

  if (start === undefined || end === undefined || !free.has(start) || !free.has(end)) throw new Error('An augmenting path joins two free vertices.');

  const available = new Set(edges.map(edgeKey));
  const selected = new Map(matching.map(edge => [edgeKey(edge), normalized(edge)]));
  const removed: Matching = [];
  const added: Matching = [];

  for (const [index, edge] of pathEdges(path).entries()) {
    const key = edgeKey(edge);

    if (!available.has(key) || selected.has(key) !== (index % 2 === 1)) throw new Error('Path edges exist and alternate unmatched, matched, unmatched.');

    if (selected.has(key)) {
      removed.push(edge);
      selected.delete(key);
    } else {
      added.push(edge);
      selected.set(key, edge);
    }
  }

  const result = sortedEdges(Array.from(selected.values()));

  if (!validMatching(n, result) || result.length !== matching.length + 1) throw new Error('Flipping an augmenting path increases a valid matching by one pair.');

  return { removed, added, result };
}

/** Exhaustive small-graph check; visits every link subset, including invalid ones. */
export function exhaustiveMaximum(n: number, edges: readonly Edge[]): { size: number; matching: Matching; checkedSubsets: number; validSubsets: number } {
  if (!Number.isInteger(n) || n < 1 || n > 24 || edges.length > 20) throw new RangeError('The illustrative exhaustive search is restricted to a small graph.');

  const checkedSubsets = 2 ** edges.length;
  let size = 0;
  let best = 0;
  let validSubsets = 0;

  for (let subset = 0; subset < checkedSubsets; subset++) {
    let used = 0;
    let pairs = 0;
    let valid = true;

    for (const [index, [a, b]] of edges.entries()) {
      if (!(subset & 1 << index)) continue;
      if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= n || b >= n || a === b) throw new Error('Exhaustive matching input edges have two distinct in-range vertices.');

      const endpoints = (1 << a) | (1 << b);

      if (used & endpoints) {
        valid = false;

        break;
      }

      used |= endpoints;
      pairs++;
    }

    if (!valid) continue;

    validSubsets++;

    if (pairs > size) {
      size = pairs;
      best = subset;
    }
  }

  const matching: Matching = [];

  for (const [index, edge] of edges.entries()) {
    if (best & 1 << index) matching.push(edge);
  }

  return { size, matching: sortedEdges(matching), checkedSubsets, validSubsets };
}

export function runtimeAt(n: number): RuntimeReading {
  if (!(Number.isFinite(n) && n >= 1)) throw new RangeError('The sparse-chart network size is positive and finite.');

  const m = 3 * n;

  return { n, m, classical: m * Math.sqrt(n), input: n + m };
}

function makeBlossom(n: number, edges: readonly Edge[], matching: readonly Edge[]): Blossom {
  const base = 1;
  const cycle = [1, 0, 4, 3, 2];
  const members = new Set(cycle);
  const selected = new Set(matching.map(edgeKey));
  const available = new Set(edges.map(edgeKey));
  const internalMatching: Matching = [];
  const externalMatching: Matching = [];

  for (let index = 0; index < cycle.length; index++) {
    const a = cycle[index];
    const b = cycle[(index + 1) % cycle.length];

    if (a === undefined || b === undefined) throw new Error('The blossom cycle closes around its base.');

    const key = edgeKey([a, b]);

    if (!available.has(key) || selected.has(key) !== (index % 2 === 1)) throw new Error('The odd ring alternates around its base, whose two cycle links are unmatched.');
  }

  for (const edge of matching) {
    if (members.has(edge[0]) && members.has(edge[1])) internalMatching.push(edge);
    else externalMatching.push(edge);
  }

  const superVertex = n;
  const redirect = (vertex: number): number => members.has(vertex) ? superVertex : vertex;
  const contracted = new Map<string, Edge>();

  for (const [a, b] of edges) {
    const first = redirect(a);
    const second = redirect(b);

    if (first === second) continue;

    const edge = normalized([first, second]);
    contracted.set(edgeKey(edge), edge);
  }

  const contractedMatching = sortedEdges(externalMatching.map(([a, b]): Edge => [redirect(a), redirect(b)]));
  const contractedVertices: number[] = [];

  for (let vertex = 0; vertex < n; vertex++) {
    if (!members.has(vertex)) contractedVertices.push(vertex);
  }

  contractedVertices.push(superVertex);

  if (internalMatching.length !== (cycle.length - 1) / 2 || contractedMatching.length + internalMatching.length !== matching.length || !validMatching(n + 1, contractedMatching)) throw new Error('Contraction preserves external pairs and hides exactly the ring’s internal pairs.');

  return { base, cycle, internalMatching: sortedEdges(internalMatching), externalMatching: sortedEdges(externalMatching), superVertex, contractedVertices, contractedEdges: sortedEdges(Array.from(contracted.values())), contractedMatching };
}

export function createPairsModel() {
  const n = data.n;
  const edges = data.edges.map(edgeFrom);
  const positions = data.positions.map(pointFrom);
  const ringCentre = pointFrom(data.ring_centre);

  if (positions.length !== n || new Set(edges.map(edgeKey)).size !== edges.length) throw new Error('The example has distinct willing links and one position per person.');

  const history = greedyHistory(n, edges);
  const augmentingPath = shortestAugmentingPath(n, edges, history.matching);

  if (!augmentingPath) throw new Error('The illustrated greedy matching has an augmenting path.');

  const flip = flipMatching(n, edges, history.matching, augmentingPath);
  const exhaustive = exhaustiveMaximum(n, edges);

  if (flip.result.length !== exhaustive.size) throw new Error('The illustrated flip reaches the exhaustive maximum.');

  const insetData = data.bipartite_example;
  const insetEdges = insetData.edges.map(edgeFrom);
  const insetMatching = greedyMatching(insetData.n, insetEdges);
  const left = new Set(insetData.left);
  const right = new Set(insetData.right);

  if (insetEdges.some(([a, b]) => !left.has(a) || !right.has(b))) throw new Error('The separate inset graph joins only its two designated kinds.');

  const inset: BipartiteExample = { n: insetData.n, positions: insetData.positions.map(pointFrom), left: insetData.left, right: insetData.right, edges: insetEdges, matching: insetMatching };

  return { n, positions, ringCentre, edges, oddRing: data.odd_ring, greedySteps: history.steps, greedyStages: history.stages, greedy: history.matching, augmentingPath, flip, final: flip.result, maximum: exhaustive.size, checkedSubsets: exhaustive.checkedSubsets, validSubsets: exhaustive.validSubsets, blossom: makeBlossom(n, edges, flip.result), inset, chart: [1e3, 1e4, 1e5, 1e6, 1e7].map(runtimeAt) };
}

export type PairModel = ReturnType<typeof createPairsModel>;

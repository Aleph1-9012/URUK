export type Edge = readonly [number, number];

export type Point = { readonly x: number; readonly y: number };

export type Graph = {
  readonly n: number;
  readonly edges: readonly Edge[];
  readonly adjacency: readonly number[];
};

export type BranchConnection = { readonly a: number; readonly b: number; readonly edge: Edge };

export type MinorWitness = {
  readonly h: number;
  readonly branches: readonly (readonly number[])[];
  readonly trees: readonly (readonly Edge[])[];
  readonly connections: readonly BranchConnection[];
};

export type MatchingWitness = {
  readonly cm: number;
  readonly edges: readonly Edge[];
  readonly connections: readonly BranchConnection[];
};

export type GraphAnalysis = {
  readonly graph: Graph;
  readonly chi: number;
  readonly colours: readonly number[];
  readonly alpha: number;
  readonly independent: readonly number[];
  readonly minor: MinorWitness;
  readonly matching: MatchingWitness;
};

export const CYCLE_SIZES = [5, 6, 7, 8] as const;

function vertices(mask: number, n: number): number[] {
  const result: number[] = [];

  for (let vertex = 0; vertex < n; vertex++) {
    if (mask & (1 << vertex)) result.push(vertex);
  }

  return result;
}

export function graphFromEdges(n: number, input: readonly Edge[]): Graph {
  if (!Number.isInteger(n) || n < 0 || n > 8) throw new RangeError('The exact graph stage supports zero through eight vertices.');

  const adjacency = Array<number>(n).fill(0);
  const edges: Edge[] = [];
  const seen = new Set<number>();

  for (const [x, y] of input) {
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= n || y >= n || x === y) throw new RangeError('Each graph edge needs two distinct in-range vertices.');

    const a = Math.min(x, y);
    const b = Math.max(x, y);
    const mask = (1 << a) | (1 << b);

    if (seen.has(mask)) throw new RangeError('Each graph edge must occur once.');

    seen.add(mask);
    edges.push([a, b]);
    const first = adjacency[a];
    const second = adjacency[b];

    if (first === undefined || second === undefined) throw new Error('Every in-range vertex needs its initialized adjacency mask.');

    adjacency[a] = first | (1 << b);
    adjacency[b] = second | (1 << a);
  }

  edges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  return { n, edges, adjacency };
}

export function cycleGraph(n: number): Graph {
  if (!Number.isInteger(n) || n < 3 || n > 8) throw new RangeError('The cycle stage supports three through eight vertices.');

  const edges: Edge[] = [];

  for (let vertex = 0; vertex < n; vertex++) edges.push([vertex, (vertex + 1) % n]);

  return graphFromEdges(n, edges);
}

export function isEdge(graph: Graph, a: number, b: number): boolean {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= graph.n || b >= graph.n) throw new RangeError('The adjacency query needs two in-range vertices.');

  const row = graph.adjacency[a];

  if (row === undefined) throw new Error('Each graph vertex needs its adjacency mask.');

  return (row & (1 << b)) !== 0;
}

export function complementCycleGraph(n: number): Graph {
  const cycle = cycleGraph(n);
  const edges: Edge[] = [];

  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      if (!isEdge(cycle, a, b)) edges.push([a, b]);
    }
  }

  return graphFromEdges(n, edges);
}

export function properColouring(graph: Graph, colours: readonly number[]): boolean {
  if (colours.length !== graph.n || colours.some(colour => !Number.isInteger(colour) || colour < 0)) return false;

  return graph.edges.every(([a, b]) => colours[a] !== colours[b]);
}

function minimumColouring(graph: Graph): number[] {
  if (graph.n === 0) return [];

  const colours = Array<number>(graph.n).fill(-1);

  function tryColours(vertex: number, used: number, limit: number): boolean {
    if (vertex === graph.n) return true;

    for (let colour = 0; colour < Math.min(limit, used + 1); colour++) {
      let conflict = false;

      for (let earlier = 0; earlier < vertex; earlier++) {
        if (colours[earlier] === colour && isEdge(graph, vertex, earlier)) conflict = true;
      }

      if (conflict) continue;

      colours[vertex] = colour;

      if (tryColours(vertex + 1, Math.max(used, colour + 1), limit)) return true;
    }

    colours[vertex] = -1;

    return false;
  }

  for (let count = 1; count <= graph.n; count++) {
    if (tryColours(0, 0, count)) return colours;
  }

  throw new Error('A finite loop-free graph must admit one colour per vertex.');
}

function largestIndependentSet(graph: Graph): number[] {
  let best: number[] = [];

  for (let mask = 1; mask < 1 << graph.n; mask++) {
    const selected = vertices(mask, graph.n);

    if (selected.length <= best.length) continue;

    let independent = true;

    for (const vertex of selected) {
      const adjacency = graph.adjacency[vertex];

      if (adjacency === undefined) throw new Error('Every independent-set candidate needs its adjacency mask.');

      if (adjacency & mask) independent = false;
    }

    if (independent) best = selected;
  }

  return best;
}

function spanningTree(graph: Graph, group: readonly number[]): Edge[] {
  const first = group[0];

  if (first === undefined) throw new RangeError('A branch set must be nonempty.');

  const seen = new Set([first]);
  const tree: Edge[] = [];
  const queue = [first];

  for (const current of queue) {
    for (const next of group) {
      if (!seen.has(next) && isEdge(graph, current, next)) {
        seen.add(next);
        queue.push(next);
        tree.push([current, next]);
      }
    }
  }

  if (seen.size !== group.length) throw new RangeError('Every minor branch set must be connected.');

  return tree;
}

function crossEdge(graph: Graph, a: readonly number[], b: readonly number[]): Edge | undefined {
  for (const x of a) {
    for (const y of b) {
      if (isEdge(graph, x, y)) return [x, y];
    }
  }

  return undefined;
}

export function minorWitness(graph: Graph, branches: readonly (readonly number[])[]): MinorWitness {
  const occupied = new Set<number>();
  const trees: Edge[][] = [];
  const connections: BranchConnection[] = [];

  for (const group of branches) {
    for (const vertex of group) {
      if (!Number.isInteger(vertex) || vertex < 0 || vertex >= graph.n) throw new RangeError('Each minor vertex must belong to the graph.');

      if (occupied.has(vertex)) throw new RangeError('Minor branch sets must be pairwise disjoint.');

      occupied.add(vertex);
    }

    trees.push(spanningTree(graph, group));
  }

  for (let a = 0; a < branches.length; a++) {
    for (let b = a + 1; b < branches.length; b++) {
      const first = branches[a];
      const second = branches[b];

      if (!first || !second) throw new Error('Each minor connection needs its two branch sets.');

      const edge = crossEdge(graph, first, second);

      if (!edge) throw new RangeError('Every pair of minor branch sets needs an actual joining edge.');

      connections.push({ a, b, edge });
    }
  }

  return { h: branches.length, branches, trees, connections };
}

function largestMinor(graph: Graph): MinorWitness {
  const count = 1 << graph.n;
  const connected = Array<boolean>(count).fill(false);
  const neighbours = Array<number>(count).fill(0);

  for (let mask = 1; mask < count; mask++) {
    const group = vertices(mask, graph.n);
    const first = group[0];

    if (first === undefined) throw new Error('A nonempty subset needs its first vertex.');

    let reached = 1 << first;
    let before = 0;

    while (before !== reached) {
      before = reached;

      for (const vertex of group) {
        const row = graph.adjacency[vertex];

        if (row === undefined) throw new Error('Each branch candidate needs every adjacency mask.');

        if (reached & (1 << vertex)) reached |= row & mask;
      }
    }

    connected[mask] = reached === mask;
    let adjacent = 0;

    for (const vertex of group) {
      const row = graph.adjacency[vertex];

      if (row === undefined) throw new Error('Each subset needs every member adjacency mask.');

      adjacent |= row;
    }

    neighbours[mask] = adjacent;
  }

  const blocks: number[] = [];
  let best: number[] = [];

  function partition(vertex: number): void {
    if (blocks.length + graph.n - vertex <= best.length) return;

    if (vertex === graph.n) {
      for (let a = 0; a < blocks.length; a++) {
        const block = blocks[a];

        if (block === undefined || !connected[block]) return;

        for (let b = a + 1; b < blocks.length; b++) {
          const other = blocks[b];
          const adjacent = neighbours[block];

          if (other === undefined || adjacent === undefined) throw new Error('Minor search needs each branch and its neighbour union.');

          if (!(adjacent & other)) return;
        }
      }

      // A winning partition must be copied before this backtracking branch is mutated.
      best = Array.from(blocks);

      return;
    }

    const bit = 1 << vertex;
    blocks.push(bit);
    partition(vertex + 1);
    blocks.pop();

    for (let index = 0; index < blocks.length; index++) {
      const before = blocks[index];

      if (before === undefined) throw new Error('Each partition branch needs its current subset.');

      blocks[index] = before | bit;
      partition(vertex + 1);
      blocks[index] = before;
    }

    // The unassigned option represents deleting this vertex before contracting.
    partition(vertex + 1);
  }

  partition(0);

  return minorWitness(graph, best.map(mask => vertices(mask, graph.n)));
}

export function matchingWitness(graph: Graph, edges: readonly Edge[]): MatchingWitness {
  const occupied = new Set<number>();
  const connections: BranchConnection[] = [];

  for (const edge of edges) {
    if (!isEdge(graph, edge[0], edge[1])) throw new RangeError('Each matching pair must be a graph edge.');

    for (const vertex of edge) {
      if (occupied.has(vertex)) throw new RangeError('Matching edges must be vertex-disjoint.');

      occupied.add(vertex);
    }
  }

  for (let a = 0; a < edges.length; a++) {
    for (let b = a + 1; b < edges.length; b++) {
      const first = edges[a];
      const second = edges[b];

      if (!first || !second) throw new Error('Each connected-matching pair needs its two edges.');

      const edge = crossEdge(graph, first, second);

      if (!edge) throw new RangeError('Each pair of matching edges needs at least one cross-edge.');

      connections.push({ a, b, edge });
    }
  }

  return { cm: edges.length, edges, connections };
}

function largestConnectedMatching(graph: Graph): MatchingWitness {
  const chosen: Edge[] = [];
  let best: Edge[] = [];

  function extend(start: number, used: number): void {
    if (chosen.length > best.length) best = Array.from(chosen);

    for (let index = start; index < graph.edges.length; index++) {
      const edge = graph.edges[index];

      if (!edge) throw new Error('Connected-matching search needs its next graph edge.');

      const mask = (1 << edge[0]) | (1 << edge[1]);

      if (used & mask || chosen.some(other => !crossEdge(graph, edge, other))) continue;

      chosen.push(edge);
      extend(index + 1, used | mask);
      chosen.pop();
    }
  }

  extend(0, 0);

  return matchingWitness(graph, best);
}

const analyses = new WeakMap<Graph, GraphAnalysis>();

export function analyzeGraph(graph: Graph): GraphAnalysis {
  const cached = analyses.get(graph);

  if (cached) return cached;

  const colours = minimumColouring(graph);
  const independent = largestIndependentSet(graph);
  const result = {
    graph,
    chi: graph.n ? Math.max(...colours) + 1 : 0,
    colours,
    alpha: independent.length,
    independent,
    minor: largestMinor(graph),
    matching: largestConnectedMatching(graph),
  };
  analyses.set(graph, result);

  return result;
}

export function chartValues(m: number) {
  if (!Number.isFinite(m) || m <= 0) throw new RangeError('The order axis needs a positive finite m.');

  return { m, half: m / 2, third: m / 3, claimedH: 26 * m / 75 + 2 / 3 };
}

export function asymptoticRatio(): number {
  return .5 / (26 / 75);
}

function schematicCloud(): Point[] {
  let state = 157;
  const random = (): number => {
    state = state * 16807 % 2147483647;

    return state / 2147483647;
  };
  const points: Point[] = [];

  for (let index = 0; index < 8; index++) {
    const angle = index * Math.PI / 4;
    points.push({ x: .8 * Math.cos(angle), y: .8 * Math.sin(angle) });
  }

  for (let index = 8; index < 72; index++) {
    const angle = random() * 2 * Math.PI;
    const radius = Math.sqrt(random());
    points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
  }

  return points;
}

export function buildBranchSetsModel() {
  const fiveCycle = analyzeGraph(cycleGraph(5));
  const contraction = minorWitness(fiveCycle.graph, [[0, 1, 2], [3], [4]]);
  const triangle = graphFromEdges(3, contraction.connections.map(connection => [connection.a, connection.b]));
  const colouringAttempts: { colours: number[]; clashes: Edge[] }[] = [];

  for (let mask = 0; mask < 32; mask++) {
    const colours = Array.from({ length: 5 }, (_, vertex) => (mask >> vertex) & 1);
    const clashes: Edge[] = [];

    for (const edge of fiveCycle.graph.edges) {
      if (colours[edge[0]] === colours[edge[1]]) clashes.push(edge);
    }

    colouringAttempts.push({ colours, clashes });
  }

  return {
    fiveCycle,
    small: CYCLE_SIZES.map(n => analyzeGraph(complementCycleGraph(n))),
    triangle,
    contraction,
    isomorphism: Array.from({ length: 5 }, (_, vertex) => 2 * vertex % 5),
    alternating: [0, 1, 0, 1, 0],
    colouringAttempts,
    lines: [100, 200, 500, 1000].map(chartValues),
    ratio: asymptoticRatio(),
    cloud: schematicCloud(),
  };
}

export type BranchSetsModel = ReturnType<typeof buildBranchSetsModel>;

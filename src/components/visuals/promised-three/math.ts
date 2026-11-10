// Only the canonical graph, planted promise and sampled first-fit order ship.
import data from './data.json';

export type Edge = readonly [number, number];

export type Point = { x: number; y: number };

export type FirstFitStep = { step: number; vertex: number; color: number; used: number[]; neighbours: number[]; colors: number[]; colorCount: number };

export type FirstFitResult = { colors: number[]; colorCount: number; steps: FirstFitStep[] };

export type IndependentResult = { size: number; mask: number; vertices: number[]; visited: number };

export type GrowthReading = { n: number; value: number };

function inputEdge(pair: readonly number[]): Edge {
  const a = pair[0];
  const b = pair[1];

  if (pair.length !== 2 || a === undefined || b === undefined) throw new Error('Every canonical undirected edge has two endpoints.');

  return [a, b];
}

function graph(n: number, edges: readonly Edge[]) {
  if (!Number.isInteger(n) || n < 1 || n > 26) throw new RangeError('The exact illustrative bit-set graph has one to twenty-six vertices.');

  const adjacency: number[][] = Array.from({ length: n }, () => []);
  const adjacencyMasks = Array<number>(n).fill(0);

  for (const [a, b] of edges) {
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= n || b >= n || a === b) throw new Error('Each simple graph edge joins two distinct existing vertices.');

    const first = adjacency[a];
    const second = adjacency[b];
    const firstMask = adjacencyMasks[a];
    const secondMask = adjacencyMasks[b];

    if (!first || !second || firstMask === undefined || secondMask === undefined) throw new Error('Each endpoint has its adjacency storage.');

    if (firstMask & (1 << b)) throw new Error('An undirected edge is represented once.');

    first.push(b);
    second.push(a);
    adjacencyMasks[a] = firstMask | (1 << b);
    adjacencyMasks[b] = secondMask | (1 << a);
  }

  for (const neighbours of adjacency) neighbours.sort((a, b) => a - b);

  return { adjacency, adjacencyMasks };
}

export function properColouring(n: number, edges: readonly Edge[], colors: readonly number[], partial = false): boolean {
  if (colors.length !== n) return false;

  for (const color of colors) {
    if (!Number.isInteger(color) || color < (partial ? -1 : 0)) return false;
  }

  for (const [a, b] of edges) {
    const first = colors[a];
    const second = colors[b];

    if (first === undefined || second === undefined) return false;

    if (first >= 0 && second >= 0 && first === second) return false;
  }

  return true;
}

export function firstFitColouring(n: number, edges: readonly Edge[], order: readonly number[]): FirstFitResult {
  const { adjacency } = graph(n, edges);

  if (order.length !== n || new Set(order).size !== n || order.some(vertex => !Number.isInteger(vertex) || vertex < 0 || vertex >= n)) throw new Error('A first-fit order visits every graph vertex exactly once.');

  const colors = Array<number>(n).fill(-1);
  const steps: FirstFitStep[] = [];
  let colorCount = 0;

  for (const vertex of order) {
    const row = adjacency[vertex];

    if (!row) throw new Error('Every first-fit vertex has its neighbours.');

    const neighbours: number[] = [];
    const usedSet = new Set<number>();

    for (const neighbour of row) {
      const previous = colors[neighbour];

      if (previous === undefined) throw new Error('Every neighbour has its current color slot.');

      if (previous >= 0) {
        neighbours.push(neighbour);
        usedSet.add(previous);
      }
    }

    let color = 0;

    while (usedSet.has(color)) color++;

    colors[vertex] = color;
    colorCount = Math.max(colorCount, color + 1);

    if (!properColouring(n, edges, colors, true)) throw new Error('Each first-fit prefix is a proper partial coloring.');

    steps.push({ step: steps.length + 1, vertex, color, used: [...usedSet].sort((a, b) => a - b), neighbours, colors: colors.slice(), colorCount });
  }

  return { colors, colorCount, steps };
}

export function maximumIndependent(n: number, edges: readonly Edge[]): IndependentResult {
  const { adjacencyMasks } = graph(n, edges);
  const memo = new Map<number, { size: number; mask: number }>([[0, { size: 0, mask: 0 }]]);

  function visit(mask: number): { size: number; mask: number } {
    const known = memo.get(mask);

    if (known) return known;

    const bit = mask & -mask;
    const vertex = 31 - Math.clz32(bit);
    const neighbours = adjacencyMasks[vertex];

    if (neighbours === undefined) throw new Error('Every selected independent-set vertex has its neighbours.');

    const rest = mask ^ bit;
    const drop = visit(rest);
    const tail = visit(rest & ~neighbours);
    const take = { size: tail.size + 1, mask: tail.mask | bit };
    const selected = take.size > drop.size || (take.size === drop.size && take.mask > drop.mask) ? take : drop;
    memo.set(mask, selected);

    return selected;
  }

  const answer = visit((1 << n) - 1);
  const vertices: number[] = [];

  for (let vertex = 0; vertex < n; vertex++) {
    if (answer.mask & (1 << vertex)) vertices.push(vertex);
  }

  return { ...answer, vertices, visited: memo.size };
}

export function growthAt(n: number): number {
  if (!(Number.isFinite(n) && n >= 1)) throw new RangeError('The power-only illustration uses a positive finite vertex count.');

  return n ** .195;
}

function triangleCertificate(n: number, adjacencyMasks: readonly number[]): readonly [number, number, number] | null {
  for (let a = 0; a < n; a++) {
    const first = adjacencyMasks[a];

    if (first === undefined) throw new Error('A triangle candidate has its adjacency mask.');

    for (let b = a + 1; b < n; b++) {
      const second = adjacencyMasks[b];

      if (second === undefined) throw new Error('A triangle candidate has its second adjacency mask.');

      if (!(first & (1 << b))) continue;

      for (let c = b + 1; c < n; c++) {
        if ((first & (1 << c)) && (second & (1 << c))) return [a, b, c];
      }
    }
  }

  return null;
}

export function createColourModel() {
  const n = data.n;
  const edges = data.edges.map(inputEdge);
  const planted = data.planted.slice();
  const firstFitOrder = data.first_fit_order.slice();
  const dependencies = graph(n, edges);

  if (!properColouring(n, edges, planted)) throw new Error('The shipped three-color promise is a complete proper coloring.');

  const plantedCount = Math.max(...planted) + 1;

  if (plantedCount !== 3) throw new Error('This illustration has exactly three planted classes.');

  const classes: number[][] = Array.from({ length: plantedCount }, () => []);

  for (const [vertex, color] of planted.entries()) {
    const group = classes[color];

    if (!group) throw new Error('Every planted vertex belongs to a color class.');

    group.push(vertex);
  }

  const triangle = triangleCertificate(n, dependencies.adjacencyMasks);

  if (!triangle) throw new Error('The canonical graph has a triangle certifying that two colors do not suffice.');

  // A proper three-coloring is an upper certificate; this triangle is a lower
  // certificate. Together they prove χ(G)=3, also after adding isolated dots.
  const chromatic = plantedCount;
  const firstFit = firstFitColouring(n, edges, firstFitOrder);
  const independence = maximumIndependent(n, edges);
  const alpha = independence.size;
  const maximumIndependentSet = independence.vertices;
  const liftedClass = classes[2];

  if (!liftedClass) throw new Error('The shown independent class is the third planted class.');

  const positions: Point[] = Array.from({ length: n }, (_, vertex) => ({ x: .5 + .46 * Math.cos(-Math.PI / 2 + 2 * Math.PI * vertex / n), y: .5 + .46 * Math.sin(-Math.PI / 2 + 2 * Math.PI * vertex / n) }));
  const isolated = Array.from({ length: n }, (_, index) => n + index);
  const withIsolates = { n: 2 * n, isolateCount: n, alpha: alpha + n, ratio: (alpha + n) / (2 * n), chromatic, independentSet: [...maximumIndependentSet, ...isolated], isolated, colors: [...planted, ...Array<number>(n).fill(0)] };
  const growth: GrowthReading[] = Array.from({ length: 121 }, (_, index) => {
    const count = 10 ** (3 + index / 20);

    return { n: count, value: growthAt(count) };
  });
  const growthReadings = [1e3, 1e6, 1e9].map(count => ({ n: count, value: growthAt(count) }));

  return { n, edges, ...dependencies, planted, plantedCount, classes, positions, firstFitOrder, firstFit, independence, alpha, maximumIndependentSet, liftedClass, triangle, chromatic, withIsolates, growth, growthReadings, growthExponent: .195, deltaUpper: 1 / 3 };
}

export type ColourModel = ReturnType<typeof createColourModel>;

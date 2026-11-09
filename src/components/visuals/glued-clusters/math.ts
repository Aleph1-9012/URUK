import { CROSSING_COUNTS, FINITE_EVENTS, SAMPLE_SIDE, SAMPLE_UNIFORMS } from './data';

export type Point = { x: number; y: number };

export type GridEdge = readonly [number, number];

export type Component = {
  id: number;
  members: number[];
  size: number;
  touchesBoundary: boolean;
  spansHorizontal: boolean;
  spansVertical: boolean;
};

export type SampleState = {
  width: number;
  height: number;
  p: number;
  edges: readonly GridEdge[];
  open: Uint8Array;
  componentOf: Int16Array;
  components: Component[];
  largestId: number;
  spansHorizontal: boolean;
  spansVertical: boolean;
};

export type DualSegment = { a: Point; b: Point; edgeIndex: number };

export type Fence = {
  p: number;
  centre: number;
  members: number[];
  boundaryEdgeIndices: number[];
  dualSegments: DualSegment[];
  orderedLoop: Point[];
  closed: boolean;
  simple: boolean;
};

export function boxEdges(width: number, height: number): GridEdge[] {
  const edges: GridEdge[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const vertex = y * width + x;

      if (x + 1 < width) edges.push([vertex, vertex + 1]);
      if (y + 1 < height) edges.push([vertex, vertex + width]);
    }
  }

  return edges;
}

export const SAMPLE_EDGES = boxEdges(SAMPLE_SIDE, SAMPLE_SIDE);

export const SMALL_EDGES = boxEdges(FINITE_EVENTS.width, FINITE_EVENTS.height);

const SAMPLE_ADJACENCY = Array.from({ length: SAMPLE_SIDE ** 2 }, (): number[] => []);

for (const [index, [a, b]] of SAMPLE_EDGES.entries()) {
  SAMPLE_ADJACENCY[a]?.push(index);
  SAMPLE_ADJACENCY[b]?.push(index);
}

export function gridPoint(vertex: number, width = SAMPLE_SIDE): Point {
  return { x: vertex % width, y: Math.floor(vertex / width) };
}

/** Recompute connectivity from the same fixed uniforms at the actual displayed p. */
export function sampleAt(p: number): SampleState {
  if (p < 0 || p > 1 || !Number.isFinite(p)) throw new RangeError('A percolation probability must lie between zero and one.');

  const count = SAMPLE_SIDE ** 2;
  const open = Uint8Array.from(SAMPLE_UNIFORMS, uniform => Number(uniform < p));
  const componentOf = new Int16Array(count).fill(-1);
  const components: Component[] = [];
  let largestId = 0;
  let largestSize = 0;
  let spansHorizontal = false;
  let spansVertical = false;

  for (let start = 0; start < count; start++) {
    if (componentOf[start] !== -1) continue;

    const id = components.length;
    const members = [start];
    componentOf[start] = id;
    let left = false;
    let right = false;
    let bottom = false;
    let top = false;

    for (let cursor = 0; cursor < members.length; cursor++) {
      const vertex = members[cursor];

      if (vertex === undefined) continue;

      const x = vertex % SAMPLE_SIDE;
      const y = Math.floor(vertex / SAMPLE_SIDE);
      left ||= x === 0;
      right ||= x === SAMPLE_SIDE - 1;
      bottom ||= y === 0;
      top ||= y === SAMPLE_SIDE - 1;

      for (const edgeIndex of SAMPLE_ADJACENCY[vertex] ?? []) {
        if (!open[edgeIndex]) continue;

        const edge = SAMPLE_EDGES[edgeIndex];

        if (!edge) continue;

        const neighbour = edge[0] === vertex ? edge[1] : edge[0];

        if (componentOf[neighbour] !== -1) continue;

        componentOf[neighbour] = id;
        members.push(neighbour);
      }
    }

    const horizontal = left && right;
    const vertical = bottom && top;
    components.push({ id, members, size: members.length, touchesBoundary: left || right || bottom || top, spansHorizontal: horizontal, spansVertical: vertical });
    spansHorizontal ||= horizontal;
    spansVertical ||= vertical;

    if (members.length > largestSize) {
      largestId = id;
      largestSize = members.length;
    }
  }

  return { width: SAMPLE_SIDE, height: SAMPLE_SIDE, p, edges: SAMPLE_EDGES, open, componentOf, components, largestId, spansHorizontal, spansVertical };
}

function dualOf(edgeIndex: number): DualSegment {
  const edge = SAMPLE_EDGES[edgeIndex];

  if (!edge) throw new RangeError('A boundary edge needs a valid sample index.');

  const a = gridPoint(edge[0]);
  const b = gridPoint(edge[1]);

  if (a.y === b.y) return { edgeIndex, a: { x: (a.x + b.x) / 2, y: a.y - .5 }, b: { x: (a.x + b.x) / 2, y: a.y + .5 } };

  return { edgeIndex, a: { x: a.x - .5, y: (a.y + b.y) / 2 }, b: { x: a.x + .5, y: (a.y + b.y) / 2 } };
}

function pointKey(point: Point): string {
  return `${point.x},${point.y}`;
}

function traceBoundary(segments: readonly DualSegment[]): { points: Point[]; closed: boolean; simple: boolean } {
  const adjacency = new Map<string, number[]>();

  for (const [index, segment] of segments.entries()) {
    for (const point of [segment.a, segment.b]) {
      const key = pointKey(point);
      const incident = adjacency.get(key);

      if (incident) incident.push(index);
      else adjacency.set(key, [index]);
    }
  }

  const start = segments[0]?.a;

  if (!start) return { points: [], closed: false, simple: false };

  const used = new Uint8Array(segments.length);
  const stack = [start];
  const points: Point[] = [];

  while (stack.length) {
    const vertex = stack[stack.length - 1];

    if (!vertex) break;

    const edgeIndex = adjacency.get(pointKey(vertex))?.find(index => !used[index]);

    if (edgeIndex === undefined) {
      points.push(vertex);
      stack.pop();
      continue;
    }

    const edge = segments[edgeIndex];

    if (!edge) break;

    used[edgeIndex] = 1;
    stack.push(pointKey(edge.a) === pointKey(vertex) ? edge.b : edge.a);
  }

  points.reverse();
  const first = points[0];
  const last = points[points.length - 1];
  const closed = points.length === segments.length + 1 && first !== undefined && last !== undefined && pointKey(first) === pointKey(last);
  const simple = closed && [...adjacency.values()].every(incident => incident.length === 2);

  return { points, closed, simple };
}

/** The outer fence of the largest component not touching the sampled box edge. */
export function interiorFence(p = .5): Fence {
  const sample = sampleAt(p);
  let interior: Component | undefined;

  for (const component of sample.components) {
    if (!component.touchesBoundary && (!interior || component.size > interior.size)) interior = component;
  }

  if (!interior) throw new RangeError('This sample has no cluster strictly inside the box.');

  const member = new Uint8Array(SAMPLE_SIDE ** 2);

  for (const vertex of interior.members) member[vertex] = 1;

  const outside = new Uint8Array(SAMPLE_SIDE ** 2);
  const queue: number[] = [];

  for (let vertex = 0; vertex < outside.length; vertex++) {
    const { x, y } = gridPoint(vertex);

    if (!member[vertex] && (x === 0 || y === 0 || x === SAMPLE_SIDE - 1 || y === SAMPLE_SIDE - 1)) {
      outside[vertex] = 1;
      queue.push(vertex);
    }
  }

  // Topological complement: this flood uses all lattice edges, irrespective of openness.
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const vertex = queue[cursor];

    if (vertex === undefined) continue;

    for (const edgeIndex of SAMPLE_ADJACENCY[vertex] ?? []) {
      const edge = SAMPLE_EDGES[edgeIndex];

      if (!edge) continue;

      const neighbour = edge[0] === vertex ? edge[1] : edge[0];

      if (!member[neighbour] && !outside[neighbour]) {
        outside[neighbour] = 1;
        queue.push(neighbour);
      }
    }
  }

  const boundaryEdgeIndices: number[] = [];
  const dualSegments: DualSegment[] = [];

  for (const [index, [a, b]] of SAMPLE_EDGES.entries()) {
    if (member[a] === member[b] || !(outside[a] || outside[b])) continue;

    boundaryEdgeIndices.push(index);
    dualSegments.push(dualOf(index));
  }

  const middle = (SAMPLE_SIDE - 1) / 2;
  let centre = interior.members[0] ?? 0;
  let distance = Infinity;

  for (const vertex of interior.members) {
    const point = gridPoint(vertex);
    const next = (point.x - middle) ** 2 + (point.y - middle) ** 2;

    if (next < distance || next === distance && vertex < centre) {
      centre = vertex;
      distance = next;
    }
  }

  const loop = traceBoundary(dualSegments);

  return { p, centre, members: interior.members, boundaryEdgeIndices, dualSegments, orderedLoop: loop.points, closed: loop.closed, simple: loop.simple };
}

/** Coefficients are configuration counts, including their combinatorial multiplicity. */
export function eventProbability(counts: readonly number[], p: number): number {
  const degree = counts.length - 1;
  let probability = 0;

  for (const [open, count] of counts.entries()) probability += count * p ** open * (1 - p) ** (degree - open);

  return probability;
}

export function gluingAt(p: number): { left: number; right: number; reachRelays: number; relayToTarget: number[]; worstRelay: number; b: number; missTarget: number } {
  const left = eventProbability(FINITE_EVENTS.left, p);
  const reachRelays = eventProbability(FINITE_EVENTS.reachRelays, p);
  const relayToTarget = FINITE_EVENTS.relayToTarget.map(counts => eventProbability(counts, p));
  const worstRelay = Math.min(...relayToTarget);

  return { left, right: reachRelays * worstRelay, reachRelays, relayToTarget, worstRelay, b: 1 - worstRelay, missTarget: reachRelays - left };
}

export function crossingAt(p: number): number {
  return eventProbability(CROSSING_COUNTS, p);
}

export function ballSizes(radius = 12): { square: number[]; cubic: number[]; tree: number[] } {
  const square: number[] = [];
  const cubic: number[] = [];
  const tree: number[] = [];

  for (let r = 0; r <= radius; r++) {
    square.push(2 * r * r + 2 * r + 1);
    cubic.push((4 * r ** 3 + 6 * r * r + 8 * r + 3) / 3);
    tree.push(3 * 2 ** r - 2);
  }

  return { square, cubic, tree };
}

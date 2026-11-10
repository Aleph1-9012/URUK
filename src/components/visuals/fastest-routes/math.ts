// NumPy seed-212 weights and finite-grid previews are emitted by 212-checks/fpp.py.
// The browser worker recomputes every distance, predecessor and route.
import data from './data.json';

export const R = data.R;
export const N = 2 * R + 1;

export type Point = { x: number; y: number };

export type Segment = { a: Point; b: Point };

export type GridWeights = { horizontal: Float64Array<ArrayBuffer>; vertical: Float64Array<ArrayBuffer> };

export type Search = { source: number; distances: Float64Array<ArrayBuffer>; predecessors: Int32Array<ArrayBuffer> };

export type PackedPaths = { offsets: Uint32Array<ArrayBuffer>; vertices: Int32Array<ArrayBuffer> };

export type BranchCount = { radius: number; count: number };

export type Hunt = { halfDistance: number; separation: number; source: number; target: number; time: number; vertices: Int32Array<ArrayBuffer>; middleRows: number[] };

export type RouteResult = { centre: Search; targets: Int32Array<ArrayBuffer>; tree: PackedPaths; branches: BranchCount[]; hunts: Hunt[]; treeTime: number; firstBoundaryTime: number };

export type CellRun = readonly [row: number, startCol: number, endCol: number];

export type CloseView = {
  // Nine vertices per side: horizontal is 9x8, vertical is 8x9, both row-major.
  horizontal: number[];
  vertical: number[];
  route: number[];
  time: number;
  target: number;
};

export type RouteModel = {
  N: number;
  R: number;
  source: number;
  close: CloseView;
  preview: { ball40Runs: CellRun[]; treePaths40: number[][] };
  computation: { kind: 'pending' } | { kind: 'ready'; result: RouteResult } | { kind: 'failed'; reason: string };
};

function entry(values: ArrayLike<number>, index: number): number {
  const value = values[index];

  if (value === undefined) throw new RangeError('The grid vector contains its indexed entry.');

  return value;
}

function validVertex(vertex: number): void {
  if (!Number.isInteger(vertex) || vertex < 0 || vertex >= N * N) throw new RangeError('A grid vertex lies inside the finite square.');
}

/** Display convention: columns point right; increasing row number points up. */
export function gridPoint(vertex: number): Point {
  validVertex(vertex);

  return { x: vertex % N - R, y: Math.floor(vertex / N) - R };
}

export function createRouteModel(): RouteModel {
  const ball40Runs = data.ball40_runs.map(row => {
    const [y, start, end] = row;

    if (y === undefined || start === undefined || end === undefined || y < 0 || y >= N || start < 0 || end >= N || start > end) throw new Error('Each canonical occupancy run lies in one finite-grid row.');

    return [y, start, end] satisfies CellRun;
  });

  if (data.close.horizontal.length !== 72 || data.close.vertical.length !== 72) throw new Error('The close view contains all edges of nine by nine vertices.');

  for (const vertex of data.close.route) validVertex(vertex);

  return { N, R, source: R * N + R, close: data.close, preview: { ball40Runs, treePaths40: data.tree_paths40 }, computation: { kind: 'pending' } };
}

/** Input format is explicitly little-endian Float64, horizontal then vertical. */
export function decodeWeights(buffer: ArrayBuffer): GridWeights {
  const count = N * (N - 1);

  if (buffer.byteLength !== count * 2 * 8) throw new RangeError('The shipped binary contains both complete edge arrays.');

  const view = new DataView(buffer);
  const horizontal = new Float64Array(count);
  const vertical = new Float64Array(count);

  for (let index = 0; index < count * 2; index++) {
    const value = view.getFloat64(index * 8, true);

    if (!(value > 0 && Number.isFinite(value))) throw new RangeError('Each shipped exponential edge time is positive and finite.');
    if (index < count) horizontal[index] = value;
    else vertical[index - count] = value;
  }

  return { horizontal, vertical };
}

type QueueItem = { vertex: number; distance: number };

class MinQueue {
  private readonly vertices: number[] = [];
  private readonly distances: number[] = [];

  get size(): number {
    return this.vertices.length;
  }

  private before(distance: number, vertex: number, index: number): boolean {
    const otherDistance = entry(this.distances, index);

    return distance < otherDistance || distance === otherDistance && vertex < entry(this.vertices, index);
  }

  push(vertex: number, distance: number): void {
    let index = this.vertices.length;
    this.vertices.push(vertex);
    this.distances.push(distance);

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (!this.before(distance, vertex, parent)) break;

      this.vertices[index] = entry(this.vertices, parent);
      this.distances[index] = entry(this.distances, parent);
      index = parent;
    }

    this.vertices[index] = vertex;
    this.distances[index] = distance;
  }

  pop(): QueueItem {
    if (this.vertices.length === 0) throw new Error('A nonempty priority queue has its next vertex.');

    const vertex = entry(this.vertices, 0);
    const distance = entry(this.distances, 0);
    const lastVertex = this.vertices.pop();
    const lastDistance = this.distances.pop();

    if (lastVertex === undefined || lastDistance === undefined) throw new Error('The queue has both trailing entries.');
    if (this.vertices.length === 0) return { vertex, distance };

    let index = 0;

    while (2 * index + 1 < this.vertices.length) {
      let child = 2 * index + 1;

      if (child + 1 < this.vertices.length && this.before(entry(this.distances, child + 1), entry(this.vertices, child + 1), child)) child++;
      const childDistance = entry(this.distances, child);
      const childVertex = entry(this.vertices, child);

      if (childDistance > lastDistance || childDistance === lastDistance && childVertex >= lastVertex) break;

      this.vertices[index] = childVertex;
      this.distances[index] = childDistance;
      index = child;
    }

    this.vertices[index] = lastVertex;
    this.distances[index] = lastDistance;

    return { vertex, distance };
  }
}

export function dijkstra(weights: GridWeights, source: number): Search {
  validVertex(source);

  if (weights.horizontal.length !== N * (N - 1) || weights.vertical.length !== N * (N - 1)) throw new RangeError('Dijkstra uses both complete finite-grid edge arrays.');

  const distances = new Float64Array(N * N).fill(Infinity);
  const predecessors = new Int32Array(N * N).fill(-1);
  const queue = new MinQueue();
  distances[source] = 0;
  queue.push(source, 0);

  function relax(from: number, to: number, distance: number, weight: number): void {
    const candidate = distance + weight;

    if (candidate >= entry(distances, to)) return;

    distances[to] = candidate;
    predecessors[to] = from;
    queue.push(to, candidate);
  }

  while (queue.size > 0) {
    const { vertex, distance } = queue.pop();

    if (distance > entry(distances, vertex)) continue;

    const row = Math.floor(vertex / N);
    const col = vertex % N;

    if (col < N - 1) relax(vertex, vertex + 1, distance, entry(weights.horizontal, row * (N - 1) + col));
    if (col > 0) relax(vertex, vertex - 1, distance, entry(weights.horizontal, row * (N - 1) + col - 1));
    if (row < N - 1) relax(vertex, vertex + N, distance, entry(weights.vertical, row * N + col));
    if (row > 0) relax(vertex, vertex - N, distance, entry(weights.vertical, (row - 1) * N + col));
  }

  return { source, distances, predecessors };
}

export function traceRoute(search: Search, target: number): Int32Array<ArrayBuffer> {
  validVertex(target);
  const reverse: number[] = [target];
  let current = target;

  while (current !== search.source) {
    current = entry(search.predecessors, current);

    if (current < 0 || reverse.length > N * N) throw new Error('Each finite shortest route reaches its source without a predecessor cycle.');

    reverse.push(current);
  }

  return Int32Array.from(reverse.reverse());
}

export function targetVertices(): Int32Array<ArrayBuffer> {
  const targets = new Set<number>();

  for (let angle = 0; angle < 360; angle++) {
    const radians = angle * 2 * Math.PI / 360;
    const row = R + Math.round(100 * Math.sin(radians));
    const col = R + Math.round(100 * Math.cos(radians));
    targets.add(row * N + col);
  }

  return Int32Array.from(Array.from(targets).sort((a, b) => a - b));
}

function packPaths(paths: readonly Int32Array[]): PackedPaths {
  const offsets = new Uint32Array(paths.length + 1);
  let count = 0;

  for (const [index, path] of paths.entries()) {
    offsets[index] = count;
    count += path.length;
  }

  offsets[paths.length] = count;
  const vertices = new Int32Array(count);

  for (const [index, path] of paths.entries()) vertices.set(path, entry(offsets, index));

  return { offsets, vertices };
}

export function treeRoute(tree: PackedPaths, index: number): Int32Array<ArrayBuffer> {
  if (!Number.isInteger(index) || index < 0 || index >= tree.offsets.length - 1) throw new RangeError('A tree route index selects one packed target route.');

  return tree.vertices.subarray(entry(tree.offsets, index), entry(tree.offsets, index + 1));
}

export function branchCounts(tree: PackedPaths): BranchCount[] {
  const result: BranchCount[] = [];

  for (const radius of [5, 10, 20, 40, 60, 80, 95]) {
    const crossings = new Set<number>();

    for (let index = 0; index < tree.offsets.length - 1; index++) {
      const path = treeRoute(tree, index);
      let crossing = -1;

      for (const vertex of path) {
        const point = gridPoint(vertex);

        if (Math.hypot(point.x, point.y) >= radius) {
          crossing = vertex;

          break;
        }
      }

      if (crossing < 0) throw new Error('Every radius-100 target route crosses each listed smaller circle.');

      crossings.add(crossing);
    }

    result.push({ radius, count: crossings.size });
  }

  return result;
}

export function solveRoutes(weights: GridWeights): RouteResult {
  const centre = dijkstra(weights, R * N + R);
  const targets = targetVertices();
  const tree = packPaths(Array.from(targets, target => traceRoute(centre, target)));
  let treeTime = 0;
  let firstBoundaryTime = Infinity;

  for (const target of targets) treeTime = Math.max(treeTime, entry(centre.distances, target));

  for (let row = 0; row < N; row++) {
    firstBoundaryTime = Math.min(firstBoundaryTime, entry(centre.distances, row), entry(centre.distances, (N - 1) * N + row), entry(centre.distances, row * N), entry(centre.distances, row * N + N - 1));
  }

  const hunts: Hunt[] = [];

  for (const halfDistance of [20, 40, 80, 120]) {
    const source = R * N + R - halfDistance;
    const target = R * N + R + halfDistance;
    const search = dijkstra(weights, source);
    const vertices = traceRoute(search, target);
    const middleRows = new Set<number>();

    for (const vertex of vertices) {
      if (vertex % N === R) middleRows.add(Math.floor(vertex / N) - R);
    }

    hunts.push({ halfDistance, separation: 2 * halfDistance, source, target, time: entry(search.distances, target), vertices, middleRows: Array.from(middleRows).sort((a, b) => a - b) });
  }

  return { centre, targets, tree, branches: branchCounts(tree), hunts, treeTime, firstBoundaryTime };
}

export function clipRoute(search: Search, vertices: ArrayLike<number>, time: number): Point[] {
  if (!(time >= 0 && Number.isFinite(time))) throw new RangeError('A route prefix uses a nonnegative finite passage time.');

  const points: Point[] = [];

  for (let index = 0; index < vertices.length; index++) {
    const vertex = entry(vertices, index);
    const distance = entry(search.distances, vertex);

    if (distance <= time) {
      points.push(gridPoint(vertex));

      continue;
    }

    if (index > 0) {
      const previous = entry(vertices, index - 1);
      const firstTime = entry(search.distances, previous);

      if (!(distance > firstTime)) throw new Error('The drawn centre route follows strictly increasing passage times.');

      const a = gridPoint(previous);
      const b = gridPoint(vertex);
      const amount = (time - firstTime) / (distance - firstTime);

      if (amount > 0) points.push({ x: a.x + (b.x - a.x) * amount, y: a.y + (b.y - a.y) * amount });
    }

    break;
  }

  return points;
}

export function ballStats(search: Search, time: number): { cells: number; axis: number; diagonalEuclid: number; touchesBoundary: boolean } {
  if (!(time >= 0 && Number.isFinite(time))) throw new RangeError('A passage ball uses nonnegative finite time.');

  let cells = 0;
  let axis = 0;
  let diagonal = 0;
  let touchesBoundary = false;

  for (const [vertex, distance] of search.distances.entries()) {
    if (distance > time) continue;

    cells++;
    const row = Math.floor(vertex / N);
    const col = vertex % N;
    const x = col - R;
    const y = row - R;

    if (row === R || col === R) axis = Math.max(axis, Math.abs(x), Math.abs(y));
    if (Math.abs(x) === Math.abs(y)) diagonal = Math.max(diagonal, Math.abs(x));
    if (row === 0 || col === 0 || row === N - 1 || col === N - 1) touchesBoundary = true;
  }

  return { cells, axis, diagonalEuclid: diagonal * Math.SQRT2, touchesBoundary };
}

/** Exact boundary of occupied unit squares centred at reached grid vertices. */
export function ballSegments(search: Search, time: number): Segment[] {
  if (!(time >= 0 && Number.isFinite(time))) throw new RangeError('A discrete outline uses nonnegative finite passage time.');

  const result: Segment[] = [];

  for (const [vertex, distance] of search.distances.entries()) {
    if (distance > time) continue;

    const row = Math.floor(vertex / N);
    const col = vertex % N;
    const { x, y } = gridPoint(vertex);

    if (col === 0 || entry(search.distances, vertex - 1) > time) result.push({ a: { x: x - .5, y: y - .5 }, b: { x: x - .5, y: y + .5 } });
    if (col === N - 1 || entry(search.distances, vertex + 1) > time) result.push({ a: { x: x + .5, y: y - .5 }, b: { x: x + .5, y: y + .5 } });
    if (row === 0 || entry(search.distances, vertex - N) > time) result.push({ a: { x: x - .5, y: y - .5 }, b: { x: x + .5, y: y - .5 } });
    if (row === N - 1 || entry(search.distances, vertex + N) > time) result.push({ a: { x: x - .5, y: y + .5 }, b: { x: x + .5, y: y + .5 } });
  }

  return result;
}

/** Exterior front only; unreached pockets enclosed by reached unit cells are omitted. */
export function outerBallSegments(search: Search, time: number): Segment[] {
  if (!(time >= 0 && Number.isFinite(time))) throw new RangeError('An exterior front uses nonnegative finite passage time.');

  const exterior = new Uint8Array(N * N);
  const queue = new Int32Array(N * N);
  let head = 0;
  let tail = 0;

  function add(vertex: number): void {
    if (exterior[vertex] || entry(search.distances, vertex) <= time) return;

    exterior[vertex] = 1;
    queue[tail] = vertex;
    tail++;
  }

  for (let index = 0; index < N; index++) {
    add(index);
    add((N - 1) * N + index);
    add(index * N);
    add(index * N + N - 1);
  }

  while (head < tail) {
    const vertex = entry(queue, head);
    head++;
    const row = Math.floor(vertex / N);
    const col = vertex % N;

    if (row > 0) add(vertex - N);
    if (row < N - 1) add(vertex + N);
    if (col > 0) add(vertex - 1);
    if (col < N - 1) add(vertex + 1);
  }

  const result: Segment[] = [];

  for (const [vertex, distance] of search.distances.entries()) {
    if (distance > time) continue;

    const row = Math.floor(vertex / N);
    const col = vertex % N;
    const { x, y } = gridPoint(vertex);

    if (col === 0 || exterior[vertex - 1]) result.push({ a: { x: x - .5, y: y - .5 }, b: { x: x - .5, y: y + .5 } });
    if (col === N - 1 || exterior[vertex + 1]) result.push({ a: { x: x + .5, y: y - .5 }, b: { x: x + .5, y: y + .5 } });
    if (row === 0 || exterior[vertex - N]) result.push({ a: { x: x - .5, y: y - .5 }, b: { x: x + .5, y: y - .5 } });
    if (row === N - 1 || exterior[vertex + N]) result.push({ a: { x: x - .5, y: y + .5 }, b: { x: x + .5, y: y + .5 } });
  }

  return result;
}

export function edgeTime(weights: GridWeights, first: number, second: number): number {
  validVertex(first);
  validVertex(second);
  const a = Math.min(first, second);
  const b = Math.max(first, second);

  if (b - a === 1 && Math.floor(a / N) === Math.floor(b / N)) return entry(weights.horizontal, Math.floor(a / N) * (N - 1) + a % N);
  if (b - a === N) return entry(weights.vertical, a);

  throw new Error('A route step joins two incident grid vertices.');
}

/** Analytic, strictly convex illustration fitted only to two finite reach readings. */
export function schematicGuide(search: Search, time: number): Point[] {
  const reading = ballStats(search, time);
  const a = reading.axis;
  const d = reading.diagonalEuclid;
  const difference = d - a;
  const minRadius = Math.min(a, d);
  const maxRadius = Math.max(a, d);

  // r=a+(d-a)sin²(2θ), so |r''|<=8|d-a|. This implies positive curvature.
  if (!(minRadius > 0 && minRadius * minRadius > maxRadius * 8 * Math.abs(difference))) throw new Error('The two-reading schematic guide satisfies a positive-curvature bound.');

  return Array.from({ length: 512 }, (_, index) => {
    const angle = index * 2 * Math.PI / 512;
    const radius = a + difference * Math.sin(2 * angle) ** 2;

    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });
}

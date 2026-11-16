import { GRID_SIZE, SAMPLE_EDGES } from './data';

export type Point = { x: number; y: number };

export type OpenEdge = readonly [number, number, number, number];

export type Cluster = { id: number; vertices: number[]; size: number };

export type BoundaryLoop = { corners: Point[]; steps: number; signedArea: number };

export function selfDualProbability(q: number): number {
  if (!Number.isFinite(q) || q <= 0) throw new RangeError('A random-cluster weight must be positive.');

  const root = Math.sqrt(q);

  return root / (1 + root);
}

/** q=0 is a limiting endpoint, not a member of the claimed model family. */
export function kappa(q: number): number {
  if (!Number.isFinite(q) || q <= 0 || q > 4) throw new RangeError('The SLE parameter formula here has domain 0 < q ≤ 4.');

  return 4 * Math.PI / Math.acos(-Math.sqrt(q) / 2);
}

function pointAt(points: readonly Point[], index: number): Point {
  const point = points[index];

  if (!point) throw new Error('Each ribbon corner needs its exact lattice point.');

  return point;
}

function polygonArea(corners: readonly Point[]): number {
  let twiceArea = 0;

  for (let index = 1; index < corners.length; index++) {
    const a = pointAt(corners, index - 1);
    const b = pointAt(corners, index);
    twiceArea += a.x * b.y - b.x * a.y;
  }

  return twiceArea / 2;
}

export function buildClusterSample(size: number, q: number, openEdges: readonly OpenEdge[]) {
  if (!Number.isInteger(size) || size < 2) throw new RangeError('The finite sample needs an integer side length of at least two.');

  const p = selfDualProbability(q);
  const parameter = kappa(q);
  const count = size * size;
  const parents = Array.from({ length: count }, (_, index) => index);
  const opened = new Set<string>();

  function root(vertex: number): number {
    let at = vertex;

    while (parents[at] !== at) {
      const parent = parents[at];

      if (parent === undefined) throw new Error('Each site needs its union-find parent.');

      at = parent;
    }

    while (parents[vertex] !== vertex) {
      const next = parents[vertex];

      if (next === undefined) throw new Error('Each site needs its union-find parent.');

      parents[vertex] = at;
      vertex = next;
    }

    return at;
  }

  function edgeKey(a: number, b: number): string {
    return a < b ? `${a},${b}` : `${b},${a}`;
  }

  for (const [x, y, nextX, nextY] of openEdges) {
    if (![x, y, nextX, nextY].every(value => Number.isInteger(value) && value >= 0 && value < size)
      || Math.abs(x - nextX) + Math.abs(y - nextY) !== 1) throw new RangeError('Open bonds must join adjacent sites inside the free-boundary square.');

    const a = x * size + y;
    const b = nextX * size + nextY;
    const key = edgeKey(a, b);

    if (opened.has(key)) throw new RangeError('A finite sample cannot repeat an open bond.');

    opened.add(key);
    parents[root(a)] = root(b);
  }

  const clusterIds = new Map<number, number>();
  const clusters: Cluster[] = [];
  const vertexCluster: number[] = [];

  for (let vertex = 0; vertex < count; vertex++) {
    const representative = root(vertex);
    let id = clusterIds.get(representative);

    if (id === undefined) {
      id = clusters.length;
      clusterIds.set(representative, id);
      clusters.push({ id, vertices: [], size: 0 });
    }

    const cluster = clusters[id];

    if (!cluster) throw new Error('Each site must belong to its computed cluster.');

    cluster.vertices.push(vertex);
    cluster.size++;
    vertexCluster.push(id);
  }

  // A site is a 2-by-2 square on the fifth-grid. An open bond adds a
  // width-two ribbon. Their boundary has four distinct corners at each site,
  // unlike midpoint pictures whose drawn curves can touch at a closed bond.
  function cornerId(x: number, y: number, sx: number, sy: number): number {
    return ((x * size + y) * 2 + sx) * 2 + sy;
  }

  function isOpen(x: number, y: number, nextX: number, nextY: number): boolean {
    return nextX >= 0 && nextX < size && nextY >= 0 && nextY < size
      && opened.has(edgeKey(x * size + y, nextX * size + nextY));
  }

  const corners: Point[] = [];
  const neighbors: [number, number][] = [];

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let sx = 0; sx < 2; sx++) {
        for (let sy = 0; sy < 2; sy++) {
          const nextX = x + 2 * sx - 1;
          const nextY = y + 2 * sy - 1;
          const acrossHorizontal = isOpen(x, y, nextX, y)
            ? cornerId(nextX, y, 1 - sx, sy) : cornerId(x, y, sx, 1 - sy);
          const acrossVertical = isOpen(x, y, x, nextY)
            ? cornerId(x, nextY, sx, 1 - sy) : cornerId(x, y, 1 - sx, sy);
          corners.push({ x: 5 * x + 2 * sx - 1, y: 5 * y + 2 * sy - 1 });
          neighbors.push([acrossHorizontal, acrossVertical]);
        }
      }
    }
  }

  const visited = new Set<number>();
  const loops: BoundaryLoop[] = [];

  for (let start = 0; start < corners.length; start++) {
    if (visited.has(start)) continue;

    const polygon: Point[] = [];
    let previous = -1;
    let current = start;

    while (!visited.has(current)) {
      visited.add(current);
      polygon.push(pointAt(corners, current));
      const adjacent = neighbors[current];

      if (!adjacent) throw new Error('Each ribbon corner needs its two incident boundary segments.');

      const next = adjacent[0] !== previous ? adjacent[0] : adjacent[1];
      previous = current;
      current = next;
    }

    if (current !== start) throw new Error('Each ribbon component must close into its own loop.');

    const steps = polygon.length;
    polygon.push(pointAt(polygon, 0));
    loops.push({ corners: polygon, steps, signedArea: polygonArea(polygon) });
  }

  const longestLoop = loops.reduce((longest, loop) => loop.steps > longest.steps ? loop : longest);
  const clusterCount = clusters.length;
  const cycleRank = openEdges.length - count + clusterCount;
  const eulerLoops = clusterCount + cycleRank;

  if (loops.length !== eulerLoops) throw new Error('The ribbon boundary count must agree with the planar Euler relation.');

  return {
    size, q, p, kappa: parameter, openEdges, openEdgeCount: openEdges.length,
    clusters, clusterCount, vertexCluster, loops, loopCount: loops.length,
    longestLoop, longestLoopSteps: longestLoop.steps, cycleRank, eulerLoops,
  };
}

export type ClusterSample = ReturnType<typeof buildClusterSample>;

export function buildClusterCurvesModel() {
  const q1 = buildClusterSample(GRID_SIZE, 1, SAMPLE_EDGES[0].open);
  const q2 = buildClusterSample(GRID_SIZE, 2, SAMPLE_EDGES[1].open);
  const q3 = buildClusterSample(GRID_SIZE, 3, SAMPLE_EDGES[2].open);
  const samples = [q1, q2, q3] as const;
  const kappaCurve = Array.from({ length: 257 }, (_, index) => {
    const q = index / 64;

    return { q, kappa: q === 0 ? 8 : kappa(q) };
  });
  const kappaReadouts = [1, 2, 3, 4].map(q => ({ q, kappa: kappa(q) }));

  return { size: GRID_SIZE, samples, q1, q2, q3, kappaCurve, kappaReadouts };
}

export type ClusterCurvesModel = ReturnType<typeof buildClusterCurvesModel>;

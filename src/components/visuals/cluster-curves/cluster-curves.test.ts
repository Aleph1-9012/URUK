import { expect, test } from 'bun:test';
import { buildClusterCurvesModel, buildClusterSample, kappa, selfDualProbability, type BoundaryLoop, type OpenEdge } from './math';

function pointKey(x: number, y: number): string {
  return `${x},${y}`;
}

function segmentKey(x: number, y: number, nextX: number, nextY: number): string {
  const a = pointKey(x, y);
  const b = pointKey(nextX, nextY);

  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

/** Raster-cell union, independent of the renderer's four-corner ribbon walk. */
function cellBoundary(size: number, openEdges: readonly OpenEdge[]): Set<string> {
  const cells = new Set<string>();

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (const dx of [-1, 0]) {
        for (const dy of [-1, 0]) cells.add(pointKey(5 * x + dx, 5 * y + dy));
      }
    }
  }

  for (const [x, y, nextX, nextY] of openEdges) {
    if (x !== nextX) {
      for (let column = 5 * Math.min(x, nextX) + 1; column < 5 * Math.max(x, nextX) - 1; column++) {
        for (const dy of [-1, 0]) cells.add(pointKey(column, 5 * y + dy));
      }
    } else {
      for (let row = 5 * Math.min(y, nextY) + 1; row < 5 * Math.max(y, nextY) - 1; row++) {
        for (const dx of [-1, 0]) cells.add(pointKey(5 * x + dx, row));
      }
    }
  }

  const boundary = new Set<string>();

  for (const cell of cells) {
    const [x, y] = cell.split(',').map(Number);

    if (x === undefined || y === undefined) throw new Error('The independent cell oracle needs two integer coordinates.');

    if (!cells.has(pointKey(x, y - 1))) boundary.add(segmentKey(x, y, x + 1, y));
    if (!cells.has(pointKey(x + 1, y))) boundary.add(segmentKey(x + 1, y, x + 1, y + 1));
    if (!cells.has(pointKey(x, y + 1))) boundary.add(segmentKey(x + 1, y + 1, x, y + 1));
    if (!cells.has(pointKey(x - 1, y))) boundary.add(segmentKey(x, y + 1, x, y));
  }

  return boundary;
}

function ribbonSegments(loops: readonly BoundaryLoop[]): Set<string> {
  const segments = new Set<string>();
  const corners = new Set<string>();

  for (const loop of loops) {
    expect(loop.corners[0]).toEqual(loop.corners.at(-1));
    expect(loop.steps).toBe(loop.corners.length - 1);
    expect(loop.signedArea).not.toBe(0);

    for (let index = 1; index < loop.corners.length; index++) {
      const a = loop.corners[index - 1];
      const b = loop.corners[index];

      if (!a || !b) throw new Error('Each ribbon segment needs two corners.');

      const key = pointKey(a.x, a.y);
      expect(corners.has(key)).toBe(false);
      corners.add(key);
      expect(a.x === b.x || a.y === b.y).toBe(true);
      const dx = Math.sign(b.x - a.x);
      const dy = Math.sign(b.y - a.y);
      const distance = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);

      for (let step = 0; step < distance; step++) {
        const segment = segmentKey(a.x + step * dx, a.y + step * dy, a.x + (step + 1) * dx, a.y + (step + 1) * dy);
        expect(segments.has(segment)).toBe(false);
        segments.add(segment);
      }
    }
  }

  return segments;
}

function componentSizes(size: number, edges: readonly OpenEdge[]): number[] {
  const adjacency = Array.from({ length: size * size }, () => new Set<number>());

  for (const [x, y, nextX, nextY] of edges) {
    adjacency[x * size + y]?.add(nextX * size + nextY);
    adjacency[nextX * size + nextY]?.add(x * size + y);
  }

  const seen = new Set<number>();
  const sizes: number[] = [];

  for (let start = 0; start < adjacency.length; start++) {
    if (seen.has(start)) continue;

    const pending = [start];
    let count = 0;

    while (pending.length) {
      const current = pending.pop();

      if (current === undefined) throw new Error('A nonempty BFS frontier needs its next site.');
      if (seen.has(current)) continue;

      seen.add(current);
      count++;

      for (const next of adjacency[current] ?? []) {
        if (!seen.has(next)) pending.push(next);
      }
    }

    sizes.push(count);
  }

  return sizes.sort((a, b) => a - b);
}

test('223: each retained sample has the independent raster boundary and BFS components', () => {
  const model = buildClusterCurvesModel();
  expect(model.samples.map(sample => [sample.openEdgeCount, sample.clusterCount, sample.loopCount, sample.longestLoopSteps]))
    .toEqual([[545, 83, 135, 892], [537, 95, 151, 336], [497, 133, 187, 228]]);

  for (const sample of model.samples) {
    expect(sample.clusters.map(cluster => cluster.size).sort((a, b) => a - b)).toEqual(componentSizes(sample.size, sample.openEdges));
    expect(ribbonSegments(sample.loops)).toEqual(cellBoundary(sample.size, sample.openEdges));
    expect(sample.loops.reduce((sum, loop) => sum + loop.steps, 0)).toBe(4 * sample.size * sample.size);

    for (const cluster of sample.clusters) {
      for (const vertex of cluster.vertices) expect(sample.vertexCluster[vertex]).toBe(cluster.id);
    }
  }
});

test('223: every bond configuration on a 2×2 square closes without duplicated corners or segments', () => {
  const edges: OpenEdge[] = [[0, 0, 1, 0], [0, 0, 0, 1], [1, 0, 1, 1], [0, 1, 1, 1]];

  for (let mask = 0; mask < 16; mask++) {
    const opened: OpenEdge[] = [];

    for (let bit = 0; bit < edges.length; bit++) {
      const edge = edges[bit];

      if (!edge) throw new Error('The exhaustive square needs all four possible bonds.');
      if (mask & 1 << bit) opened.push(edge);
    }

    const sample = buildClusterSample(2, 1, opened);
    expect(ribbonSegments(sample.loops)).toEqual(cellBoundary(2, opened));
    expect(sample.clusters.map(cluster => cluster.size).sort((a, b) => a - b)).toEqual(componentSizes(2, opened));
  }

  expect(() => buildClusterSample(2, 1, [[0, 0, 2, 0]])).toThrow();
  expect(() => buildClusterSample(2, 1, [[0, 0, 1, 1]])).toThrow();
  expect(() => buildClusterSample(2, 1, [[0, 0, 1, 0], [1, 0, 0, 0]])).toThrow();
});

test('223: the parameter curve satisfies its independent inverse relation and keeps q=0 as a limit', () => {
  let previous = 8;

  for (const q of [.000001, .01, .1, .25, .5, 1, 2, 3, 4]) {
    const parameter = kappa(q);
    const p = selfDualProbability(q);
    expect(parameter).toBeLessThan(previous);
    expect(-2 * Math.cos(4 * Math.PI / parameter)).toBeCloseTo(Math.sqrt(q), 13);
    expect(p / (1 - p)).toBeCloseTo(Math.sqrt(q), 13);
    previous = parameter;
  }

  expect(kappa(1e-12)).toBeGreaterThan(7.99999);
  expect(() => kappa(0)).toThrow();
  expect(() => kappa(4.01)).toThrow();
  expect(() => selfDualProbability(0)).toThrow();
});

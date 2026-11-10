import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import reference from './fixtures/fastest-routes.json';
import { N, R, ballSegments, ballStats, clipRoute, createRouteModel, decodeWeights, dijkstra, edgeTime, gridPoint, outerBallSegments, schematicGuide, solveRoutes, traceRoute, treeRoute, type GridWeights, type Search } from '../src/components/visuals/fastest-routes/math';

const binary = await Bun.file(new URL('../src/components/visuals/fastest-routes/weights.f64', import.meta.url)).arrayBuffer();
const weights = decodeWeights(binary);
const result = solveRoutes(weights);
const model = createRouteModel();

function entry(values: ArrayLike<number>, index: number): number {
  const value = values[index];

  if (value === undefined) throw new Error('The independent check has its indexed grid value.');

  return value;
}

function routeCost(vertices: ArrayLike<number>): number {
  let sum = 0;

  for (let step = 1; step < vertices.length; step++) sum += edgeTime(weights, entry(vertices, step - 1), entry(vertices, step));

  return sum;
}

test('212: the shipped seed weights reproduce every independent centre distance and certify the full shortest-route tree', async () => {
  expect(createHash('sha256').update(new Uint8Array(binary)).digest('hex')).toBe(reference.weight_asset.sha256);
  const oracleBuffer = await Bun.file(new URL('./fixtures/fastest-routes-distances.f64', import.meta.url)).arrayBuffer();
  expect(createHash('sha256').update(new Uint8Array(oracleBuffer)).digest('hex')).toBe(reference.centre_reference.sha256);
  const view = new DataView(oracleBuffer);
  let maxError = 0;
  let optimalityError = 0;
  let predecessorError = 0;

  for (let vertex = 0; vertex < N * N; vertex++) {
    const distance = entry(result.centre.distances, vertex);
    maxError = Math.max(maxError, Math.abs(distance - view.getFloat64(vertex * 8, true)));

    if (vertex !== result.centre.source) {
      const previous = entry(result.centre.predecessors, vertex);
      predecessorError = Math.max(predecessorError, Math.abs(distance - entry(result.centre.distances, previous) - edgeTime(weights, previous, vertex)));
      expect(distance).toBeGreaterThan(entry(result.centre.distances, previous));
    }

    const row = Math.floor(vertex / N);
    const col = vertex % N;

    for (const neighbor of [col > 0 ? vertex - 1 : -1, col < N - 1 ? vertex + 1 : -1, row > 0 ? vertex - N : -1, row < N - 1 ? vertex + N : -1]) {
      if (neighbor < 0) continue;

      optimalityError = Math.max(optimalityError, distance - entry(result.centre.distances, neighbor) - edgeTime(weights, neighbor, vertex));
    }
  }

  expect(maxError).toBeLessThan(2e-11);
  expect(predecessorError).toBeLessThan(3e-14);
  expect(optimalityError).toBeLessThan(3e-14);
  expect(result.centre.distances[result.centre.source]).toBe(0);
  expect(Array.from(result.targets)).toEqual(reference.targets.map(([row, col]) => {
    if (row === undefined || col === undefined) throw new Error('Each independent target has a row and column.');

    return row * N + col;
  }));

  for (let index = 0; index < result.targets.length; index++) {
    const route = treeRoute(result.tree, index);
    const target = entry(result.targets, index);
    expect(route[0]).toBe(result.centre.source);
    expect(route.at(-1)).toBe(target);
    expect(new Set(route).size).toBe(route.length);
    expect(routeCost(route)).toBeCloseTo(entry(result.centre.distances, target), 11);
  }

  expect(result.treeTime).toBeCloseTo(reference.tree_time, 11);
  expect(result.firstBoundaryTime).toBeCloseTo(reference.first_boundary_time, 11);
  expect(result.treeTime).toBeGreaterThan(result.firstBoundaryTime);
  expect(result.firstBoundaryTime).toBeGreaterThan(40);
});

test('212: all 360 routes give the canonical first-circle branch counts and all four finite-grid hunts hold the same middle row', () => {
  expect(result.branches).toEqual(Object.entries(reference.branches).map(([radius, count]) => ({ radius: Number(radius), count })));

  for (const hunt of result.hunts) {
    const oracle = Object.entries(reference.midline_routes).find(([half]) => Number(half) === hunt.halfDistance)?.[1];

    if (!oracle) throw new Error('Each finite-grid hunt has its independent Python route.');

    const expected = oracle.route.map(([row, col]) => {
      if (row === undefined || col === undefined) throw new Error('An oracle route step has both coordinates.');

      return row * N + col;
    });
    expect(Array.from(hunt.vertices)).toEqual(expected);
    expect(hunt.middleRows).toEqual([3]);
    expect(routeCost(hunt.vertices)).toBeCloseTo(hunt.time, 11);
    expect(Math.abs(hunt.time - oracle.time)).toBeLessThan(.000501);
    expect(gridPoint(hunt.source)).toEqual({ x: -hunt.halfDistance, y: 0 });
    expect(gridPoint(hunt.target)).toEqual({ x: hunt.halfDistance, y: 0 });
  }

  expect(gridPoint((R + 3) * N + R)).toEqual({ x: 0, y: 3 });
  expect(model.close.route).toEqual(Array.from(traceRoute(result.centre, model.close.target)));
  expect(model.close.route.every(vertex => {
    const point = gridPoint(vertex);

    return Math.abs(point.x) <= 4 && Math.abs(point.y) <= 4;
  })).toBe(true);
  expect(routeCost(model.close.route)).toBeCloseTo(model.close.time, 12);

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 8; col++) expect(model.close.horizontal[row * 8 + col]).toBe(weights.horizontal[(R - 4 + row) * (N - 1) + R - 4 + col]);
  }

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 9; col++) expect(model.close.vertical[row * 9 + col]).toBe(weights.vertical[(R - 4 + row) * N + R - 4 + col]);
  }
});

test('212: occupancy previews, route prefixes and scaled outlines retain the exact finite-grid geometry', () => {
  const preview = new Uint8Array(N * N);

  for (const [row, start, end] of model.preview.ball40Runs) {
    for (let col = start; col <= end; col++) preview[row * N + col] = 1;
  }

  let mismatch = 0;

  for (let vertex = 0; vertex < preview.length; vertex++) {
    if (Boolean(preview[vertex]) !== (entry(result.centre.distances, vertex) <= 40)) mismatch++;
  }

  expect(mismatch).toBe(0);

  for (const [time, oracle] of Object.entries(reference.reach)) {
    const reading = ballStats(result.centre, Number(time));
    expect(reading.cells).toBe(oracle.cells);
    expect(reading.axis).toBe(oracle.axis);
    expect(reading.diagonalEuclid).toBeCloseTo(oracle.diagonal_euclid, 1);
    expect(reading.touchesBoundary).toBe(false);
  }

  expect(model.preview.treePaths40.length).toBe(60);

  for (const [index, discrete] of model.preview.treePaths40.entries()) {
    const route = treeRoute(result.tree, index * 6);
    const expected: number[] = [];

    for (const vertex of route) {
      if (entry(result.centre.distances, vertex) <= 40) expected.push(vertex);
    }

    expect(discrete).toEqual(expected);
    const continuous = clipRoute(result.centre, route, 40);
    expect(continuous.length).toBeGreaterThanOrEqual(discrete.length);

    for (const [step, vertex] of discrete.entries()) expect(continuous[step]).toEqual(gridPoint(vertex));
  }

  const outlines = ballSegments(result.centre, 40);
  let boundaryEdges = 0;

  for (let vertex = 0; vertex < preview.length; vertex++) {
    if (!preview[vertex]) continue;

    for (const neighbor of [vertex - 1, vertex + 1, vertex - N, vertex + N]) {
      if (!preview[neighbor]) boundaryEdges++;
    }
  }

  expect(outlines.length).toBe(boundaryEdges);
  expect(outlines.every(segment => Math.abs(segment.a.x - segment.b.x) + Math.abs(segment.a.y - segment.b.y) === 1)).toBe(true);
  const completeEdges = new Set(outlines.map(segment => `${segment.a.x},${segment.a.y}:${segment.b.x},${segment.b.y}`));
  const outer = outerBallSegments(result.centre, 40);
  expect(outer.length).toBeLessThan(outlines.length);

  for (const segment of outer) expect(completeEdges.has(`${segment.a.x},${segment.a.y}:${segment.b.x},${segment.b.y}`)).toBe(true);

  // An eight-site square ring has one enclosed empty site. Its inner rim is not an exterior front.
  const ring: Search = { source: R * N + R + 1, distances: new Float64Array(N * N).fill(Infinity), predecessors: new Int32Array(N * N).fill(-1) };

  for (let y = -1; y <= 1; y++) {
    for (let x = -1; x <= 1; x++) {
      if (x !== 0 || y !== 0) ring.distances[(R + y) * N + R + x] = 0;
    }
  }

  expect(ballSegments(ring, 0).length).toBe(16);
  const ringFront = outerBallSegments(ring, 0);
  expect(ringFront.length).toBe(12);
  expect(ringFront.every(segment => Math.abs((segment.a.x + segment.b.x) / 2) === 1.5 || Math.abs((segment.a.y + segment.b.y) / 2) === 1.5)).toBe(true);
  const guide = schematicGuide(result.centre, 40);
  const axis = guide[0];
  const diagonal = guide[64];

  if (!axis || !diagonal) throw new Error('The analytic guide samples its axis and diagonal.');

  const reading = ballStats(result.centre, 40);
  expect(axis.x).toBe(reading.axis);
  expect(axis.y).toBe(0);
  expect(Math.hypot(diagonal.x, diagonal.y)).toBeCloseTo(reading.diagonalEuclid, 12);
  const difference = reading.diagonalEuclid - reading.axis;

  for (let index = 0; index < 512; index++) {
    const angle = index * 2 * Math.PI / 512;
    const r = reading.axis + difference * Math.sin(2 * angle) ** 2;
    const first = 2 * difference * Math.sin(4 * angle);
    const second = 8 * difference * Math.cos(4 * angle);
    expect(r * r + 2 * first * first - r * second).toBeGreaterThan(0);
  }
});

test('212: unit edge times independently give Manhattan passage distance and exact partial-edge prefixes', () => {
  const count = N * (N - 1);
  const uniform: GridWeights = { horizontal: new Float64Array(count).fill(1), vertical: new Float64Array(count).fill(1) };
  const search = dijkstra(uniform, R * N + R);
  let error = 0;

  for (const [vertex, distance] of search.distances.entries()) {
    const point = gridPoint(vertex);
    error = Math.max(error, Math.abs(distance - Math.abs(point.x) - Math.abs(point.y)));
  }

  expect(error).toBe(0);
  expect(ballStats(search, 2).cells).toBe(13);
  const route = traceRoute(search, R * N + R + 4);
  expect(clipRoute(search, route, 2.5)).toEqual([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2.5, y: 0 }]);
});

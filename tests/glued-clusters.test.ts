import { expect, test } from 'bun:test';
import { CROSSING_COUNTS, FENCE_REFERENCE, FINITE_EVENTS, GROWTH_REFERENCE, SAMPLE_CHECKS, SAMPLE_UNIFORMS } from '../src/components/visuals/glued-clusters/data';
import { SAMPLE_EDGES, ballSizes, crossingAt, gluingAt, gridPoint, interiorFence, sampleAt, type Point } from '../src/components/visuals/glued-clusters/math';

function winding(point: Point, loop: readonly Point[]): number {
  let angle = 0;

  for (let index = 1; index < loop.length; index++) {
    const a = loop[index - 1];
    const b = loop[index];

    if (!a || !b) throw new Error('A closed loop has consecutive points.');

    const ax = a.x - point.x;
    const ay = a.y - point.y;
    const bx = b.x - point.x;
    const by = b.y - point.y;
    angle += Math.atan2(ax * by - ay * bx, ax * bx + ay * by);
  }

  return Math.round(angle / (Math.PI * 2));
}

test('213: one coupled sample matches the sweep and its separate interior cluster has a closed missing-edge fence', () => {
  expect(SAMPLE_EDGES).toHaveLength(1984);
  expect(SAMPLE_UNIFORMS).toHaveLength(SAMPLE_EDGES.length);
  let previous: Uint8Array = new Uint8Array(SAMPLE_EDGES.length);

  for (const reference of SAMPLE_CHECKS) {
    const sample = sampleAt(reference.p);
    const largest = sample.components[sample.largestId];

    if (!largest) throw new Error('Every nonempty box has a largest component.');

    expect(largest.size).toBe(reference.largestSize);
    expect(sample.components.length).toBe(reference.clusterCount);
    expect(largest.spansHorizontal || largest.spansVertical).toBe(reference.largestSpans);

    for (const [index, [a, b]] of SAMPLE_EDGES.entries()) {
      expect(Number(sample.open[index] ?? 0)).toBeGreaterThanOrEqual(previous[index] ?? 0);

      if (sample.open[index]) expect(sample.componentOf[a]).toBe(sample.componentOf[b]);
    }

    expect(sample.components.reduce((sum, component) => sum + component.size, 0)).toBe(1024);
    previous = sample.open;
  }

  const threshold = SAMPLE_UNIFORMS[0];

  if (threshold === undefined) throw new Error('The seeded sample has a first edge.');

  expect(sampleAt(threshold).open[0]).toBe(0);
  expect(sampleAt(threshold + Number.EPSILON).open[0]).toBe(1);
  const fence = interiorFence();
  const half = sampleAt(.5);
  expect(fence.centre).toBe(FENCE_REFERENCE.centre);
  expect(gridPoint(fence.centre)).toEqual({ x: 21, y: 17 });
  expect(fence.members.slice().sort((a, b) => a - b)).toEqual(FENCE_REFERENCE.members.slice());
  expect(fence.members).toHaveLength(37);
  expect(half.components[half.largestId]?.size).toBe(278);
  expect(fence.boundaryEdgeIndices.map(index => SAMPLE_EDGES[index])).toEqual(FENCE_REFERENCE.boundaryEdges.slice());
  expect(fence.dualSegments).toHaveLength(34);
  expect(fence.orderedLoop).toHaveLength(35);
  expect(fence.closed && fence.simple).toBe(true);
  expect(fence.orderedLoop[0]).toEqual(fence.orderedLoop[34]);

  for (const segment of fence.dualSegments) {
    const edge = SAMPLE_EDGES[segment.edgeIndex];

    if (!edge) throw new Error('Every dual segment crosses a primal edge.');

    const a = gridPoint(edge[0]);
    const b = gridPoint(edge[1]);
    expect(half.open[segment.edgeIndex]).toBe(0);
    expect((a.x + b.x) / 2).toBe((segment.a.x + segment.b.x) / 2);
    expect((a.y + b.y) / 2).toBe((segment.a.y + segment.b.y) / 2);
    expect((a.x - b.x) * (segment.a.x - segment.b.x) + (a.y - b.y) * (segment.a.y - segment.b.y)).toBeCloseTo(0, 14);
    expect(Math.hypot(segment.a.x - segment.b.x, segment.a.y - segment.b.y)).toBe(1);
  }

  for (const vertex of fence.members) expect(Math.abs(winding(gridPoint(vertex), fence.orderedLoop))).toBe(1);

  expect(winding({ x: 0, y: 0 }, fence.orderedLoop)).toBeCloseTo(0, 14);
});

test('213: independent finite-graph enumeration reproduces every event coefficient and the polynomial readings', () => {
  const edges: [number, number][] = [];

  // Independent enumeration of all neighbouring vertex pairs, not the sample's edge order.
  for (let a = 0; a < 12; a++) {
    for (let b = a + 1; b < 12; b++) {
      if (Math.abs(a % 4 - b % 4) + Math.abs(Math.floor(a / 4) - Math.floor(b / 4)) === 1) edges.push([a, b]);
    }
  }

  expect(edges).toHaveLength(17);
  const left = Array<number>(18).fill(0);
  const reachRelays = Array<number>(18).fill(0);
  const relayTwo = Array<number>(18).fill(0);
  const relayTen = Array<number>(18).fill(0);
  const crossing = Array<number>(18).fill(0);

  for (let mask = 0; mask < 2 ** edges.length; mask++) {
    const parent = Array.from({ length: 12 }, (_, vertex) => vertex);
    const find = (start: number): number => {
      let vertex = start;

      while (parent[vertex] !== vertex) vertex = parent[vertex] ?? vertex;

      return vertex;
    };
    let opened = 0;

    for (const [index, [a, b]] of edges.entries()) {
      if ((mask & 2 ** index) === 0) continue;

      opened++;
      parent[find(a)] = find(b);
    }

    const roots = parent.map((_, vertex) => find(vertex));
    const hitsA = roots[4] === roots[2] || roots[4] === roots[10];
    const hitsT = roots[4] === roots[7];

    if (hitsA) reachRelays[opened] = (reachRelays[opened] ?? 0) + 1;
    if (hitsA && hitsT) left[opened] = (left[opened] ?? 0) + 1;
    if (roots[2] === roots[7]) relayTwo[opened] = (relayTwo[opened] ?? 0) + 1;
    if (roots[10] === roots[7]) relayTen[opened] = (relayTen[opened] ?? 0) + 1;

    let crosses = false;

    for (const a of [0, 4, 8]) {
      for (const b of [3, 7, 11]) crosses ||= roots[a] === roots[b];
    }

    if (crosses) crossing[opened] = (crossing[opened] ?? 0) + 1;
  }

  expect(left).toEqual(FINITE_EVENTS.left.slice());
  expect(reachRelays).toEqual(FINITE_EVENTS.reachRelays.slice());
  expect(relayTwo).toEqual(FINITE_EVENTS.relayToTarget[0].slice());
  expect(relayTen).toEqual(FINITE_EVENTS.relayToTarget[1].slice());
  expect(crossing).toEqual(CROSSING_COUNTS.slice());
  const sum = (counts: readonly number[]): number => counts.reduce((total, count) => total + count, 0);
  expect(gluingAt(.5).left).toBe(sum(left) / 2 ** 17);
  expect(gluingAt(.5).right).toBe(sum(reachRelays) * Math.min(sum(relayTwo), sum(relayTen)) / 2 ** 34);
  expect(crossingAt(.5)).toBe(sum(crossing) / 2 ** 17);
  expect(crossingAt(.5)).toBe(1 / 2);
  const atThreeQuarters = (counts: readonly number[]): number => counts.reduce((total, count, opened) => total + count * 3 ** opened, 0) / 4 ** 17;
  const reading = gluingAt(.75);
  expect(reading.left).toBeCloseTo(atThreeQuarters(left), 14);
  expect(reading.reachRelays).toBeCloseTo(atThreeQuarters(reachRelays), 14);
  expect(reading.b).toBeCloseTo(1 - atThreeQuarters(relayTwo), 14);
  expect(reading.missTarget).toBeLessThan(reading.b);
  expect(crossingAt(.49)).toBeLessThan(crossingAt(.5));
  expect(crossingAt(.48)).toBeLessThan(crossingAt(.49));

  for (let percent = 0; percent <= 100; percent++) {
    const value = gluingAt(percent / 100);
    expect(value.left + 1e-14).toBeGreaterThanOrEqual(value.right);
  }
});

test('213: enumerated lattice balls and a branching tree give the stated growth and radius-nine crossover', () => {
  const radius = 12;
  const square = Array<number>(radius + 1).fill(0);
  const cubic = Array<number>(radius + 1).fill(0);
  const tree = Array<number>(radius + 1).fill(0);

  for (let x = -radius; x <= radius; x++) {
    for (let y = -radius; y <= radius; y++) {
      const planarDistance = Math.abs(x) + Math.abs(y);

      for (let r = planarDistance; r <= radius; r++) square[r] = (square[r] ?? 0) + 1;

      for (let z = -radius; z <= radius; z++) {
        const distance = planarDistance + Math.abs(z);

        for (let r = distance; r <= radius; r++) cubic[r] = (cubic[r] ?? 0) + 1;
      }
    }
  }

  const depths = [0];

  for (let cursor = 0; cursor < depths.length; cursor++) {
    const depth = depths[cursor] ?? 0;

    for (let r = depth; r <= radius; r++) tree[r] = (tree[r] ?? 0) + 1;

    if (depth === radius) continue;

    for (let child = 0; child < (depth === 0 ? 3 : 2); child++) depths.push(depth + 1);
  }

  expect(ballSizes(radius)).toEqual({ square, cubic, tree });
  expect(square).toEqual(GROWTH_REFERENCE.square.slice());
  expect(cubic).toEqual(GROWTH_REFERENCE.cubic.slice());
  expect(tree).toEqual(GROWTH_REFERENCE.tree.slice());
  expect(tree.findIndex((size, r) => size > (cubic[r] ?? Infinity))).toBe(9);
});

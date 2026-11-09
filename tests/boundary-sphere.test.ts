import { expect, test } from 'bun:test';
import {
  CENTRAL_PENTAGON, SIDE_LENGTH, TILES, TILING_VERTICES, TREE, PENTAGON_RADIUS,
  exponentialCost, geodesic, gridCost, horizontalTranslation, hyperbolicDistance,
  magnifiedHalfWidth, quadraticCost, reflect, tilingMap,
} from '../src/components/visuals/boundary-sphere/math';

test('246 the free tree and reflected tiling have the stated counts, and the final move is a tiling symmetry', () => {
  expect(Array.from({ length: 6 }, (_, depth) => TREE.reduce((count, node) => count + Number(node.depth === depth), 0))).toEqual([1, 4, 12, 36, 108, 324]);
  expect(TILES.length).toBe(166);
  expect(TILING_VERTICES.length).toBe(440);
  expect(PENTAGON_RADIUS).toBeCloseTo(.3979754268, 9);
  const first = CENTRAL_PENTAGON[0];
  const second = CENTRAL_PENTAGON[1];

  if (!first || !second) throw new Error('The central pentagon needs a first side.');

  expect(hyperbolicDistance(first, second)).toBeCloseTo(SIDE_LENGTH, 12);
  const edge = geodesic(first, second);
  const point = { x: .1, y: -.2 };
  const returned = reflect(reflect(point, edge), edge);
  expect(Math.hypot(returned.x - point.x, returned.y - point.y)).toBeLessThan(1e-12);
  const transform = tilingMap(2 * SIDE_LENGTH);

  for (const corner of CENTRAL_PENTAGON) {
    const image = transform(corner);
    expect(Math.min(...TILING_VERTICES.map((vertex) => Math.hypot(image.x - vertex.x, image.y - vertex.y)))).toBeLessThan(1e-12);
  }
});

test('246 the magnification, admissible costs and exponential contradiction match the plotted quantities', () => {
  const distance = Math.log(400);
  const halfWidth = magnifiedHalfWidth(.1, distance);
  const image = horizontalTranslation({ x: -Math.cos(.1), y: Math.sin(.1) }, distance);
  expect(Math.atan2(image.y, image.x)).toBeCloseTo(Math.PI - halfWidth, 12);
  expect(halfWidth).toBeCloseTo(3.0417590017, 9);
  expect([3, 6, 12].map(gridCost)).toEqual([1, 1, 1]);
  expect(exponentialCost(40)).toBeLessThan(quadraticCost(40));
  expect(exponentialCost(41)).toBeGreaterThan(quadraticCost(41));
});

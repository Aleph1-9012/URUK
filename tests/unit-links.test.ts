import { expect, test } from 'bun:test';
import {
  DOUBLE_TRIANGLE, EXAMPLE_JUMP, EXAMPLE_RATIO, OPENING, RECIPROCAL_JUMP, SQUARE, UNIT_JUMPS,
  bestLatticeDistance, circlePoints, directionClasses, latticeLinkClasses, latticeLinkCount,
  multiply, shearDirections, shearGrid, unitPairs,
} from '../src/components/visuals/unit-links/math';

test('167: the counted small configurations and every link drawn during the shear are unit pairs', () => {
  expect(unitPairs(OPENING)).toHaveLength(3);
  expect(unitPairs(SQUARE)).toHaveLength(4);
  expect(unitPairs(DOUBLE_TRIANGLE)).toHaveLength(5);

  for (let index = 0; index <= 24; index++) {
    const angle = Math.PI / 2 - index * Math.PI / 144;
    const points = shearGrid(6, angle);
    const actual = new Set(unitPairs(points).map(([a, b]) => `${a},${b}`));
    const drawn = new Set<string>();

    for (const direction of shearDirections(angle)) {
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
          const toX = x + direction.x;
          const toY = y + direction.y;

          if (toX < 0 || toX >= 6 || toY < 0 || toY >= 6) continue;

          const a = y * 6 + x;
          const b = toY * 6 + toX;
          drawn.add(`${Math.min(a, b)},${Math.max(a, b)}`);
        }
      }
    }

    expect(drawn).toEqual(actual);
    expect(actual.size).toBe(index === 24 ? 85 : 60);
  }

  expect(unitPairs(shearGrid(30, Math.PI / 3))).toHaveLength(2581);
});

test('167: the exact lattice count, direction classes and best rescaling agree', () => {
  for (const [side, squaredRadius, count] of [[30, 65, 4944], [60, 325, 28200], [100, 1105, 98176]] as const) {
    expect(latticeLinkCount(side, squaredRadius)).toBe(count);
    expect(bestLatticeDistance(side)).toEqual({ squaredRadius, count });
  }

  expect(latticeLinkCount(30, 1)).toBe(1740);
  expect([1, 5, 25, 65].map(radius => circlePoints(radius).length)).toEqual([4, 8, 12, 16]);
  expect(directionClasses(65)).toHaveLength(8);
  const classes = latticeLinkClasses(30, 65);
  let segments = 0;

  for (const group of classes) {
    for (const { from, to } of group.segments) {
      expect((to.x - from.x) ** 2 + (to.y - from.y) ** 2).toBe(65);
      expect(Math.min(from.x, from.y, to.x, to.y)).toBeGreaterThanOrEqual(0);
      expect(Math.max(from.x, from.y, to.x, to.y)).toBeLessThan(30);
      segments++;
    }
  }

  expect(segments).toBe(4944);
});

test('167: all twelve radius-five jumps have reciprocal conjugates and the displayed ratio is exact', () => {
  expect(UNIT_JUMPS).toHaveLength(12);

  for (const jump of UNIT_JUMPS) {
    const product = multiply({ re: jump.x, im: jump.y }, { re: jump.x, im: -jump.y });
    expect(product.re).toBeCloseTo(1, 14);
    expect(product.im).toBe(0);
  }

  expect(multiply(EXAMPLE_JUMP, RECIPROCAL_JUMP)).toEqual({ re: 1, im: 0 });
  expect(EXAMPLE_RATIO.re).toBeCloseTo(24 / 25, 14);
  expect(EXAMPLE_RATIO.im).toBeCloseTo(7 / 25, 14);
  expect(Math.hypot(EXAMPLE_RATIO.re, EXAMPLE_RATIO.im)).toBeCloseTo(1, 14);
});

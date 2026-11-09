import { expect, test } from 'bun:test';
import { DESCENDANTS, FIXED_POINT, MAPS, PARENTS, TRANSPORT_SOURCES, TRANSPORT_TARGETS, diskMap, freeBall, freeBallSize, freeShare, integerShare, leftMultiply, mapSlopes, mapValue } from '../src/components/visuals/fair-average/math';

test('248 exact maps compose and invert correctly, and transport the separated basic intervals', () => {
  for (const map of Object.values(MAPS)) {
    for (const point of map) {
      expect(Number.isInteger(point.x * 16)).toBe(true);
      expect(Number.isInteger(point.y * 16)).toBe(true);
    }

    for (const slope of mapSlopes(map)) expect(Number.isInteger(Math.log2(slope))).toBe(true);
  }

  for (let index = 0; index <= 64; index++) {
    const x = index / 64;
    expect(mapValue(MAPS.composite, x)).toBe(mapValue(MAPS.x0, mapValue(MAPS.x1, x)));
    expect(mapValue(MAPS.inverse, mapValue(MAPS.x0, x))).toBe(x);
  }

  for (const [index, source] of TRANSPORT_SOURCES.entries()) {
    const target = TRANSPORT_TARGETS[index];

    if (!target) throw new Error('Every transport source needs its reference interval.');

    expect(mapValue(MAPS.transport, source.start)).toBe(target.start);
    expect(mapValue(MAPS.transport, source.end)).toBe(target.end);
  }

  for (const [index, children] of DESCENDANTS.entries()) {
    const parent = PARENTS[index];

    if (!parent) throw new Error('Every descendant family needs its parent.');

    for (const child of children) {
      expect(child.start).toBeGreaterThan(parent.start);
      expect(child.end).toBeLessThan(parent.end);
    }
  }
});

test('248 translated finite sets give the shown shares, and the continuous disk map fixes the marked point', () => {
  for (const radius of [2, 4]) {
    const ball = new Set(freeBall(radius));
    const moved = new Set(Array.from(ball, (word) => leftMultiply('a', word)));
    let changed = 0;

    for (const word of ball) changed += Number(!moved.has(word));
    for (const word of moved) changed += Number(!ball.has(word));

    expect(ball.size).toBe(freeBallSize(radius));
    expect(changed).toBe(2 * 3 ** radius);
    expect(changed / ball.size).toBe(freeShare(radius));
  }

  expect([5, 10, 20, 40].map(integerShare)).toEqual([.4, .2, .1, .05]);
  expect(freeShare(2)).toBeGreaterThan(1);
  const fixed = diskMap(FIXED_POINT);
  expect(fixed.x).toBeCloseTo(FIXED_POINT.x, 14);
  expect(fixed.y).toBeCloseTo(FIXED_POINT.y, 14);

  for (let index = 0; index < 64; index++) {
    const angle = 2 * Math.PI * index / 64;
    const image = diskMap({ x: Math.cos(angle), y: Math.sin(angle) });
    expect(Math.hypot(image.x, image.y)).toBeLessThanOrEqual(.900000000000001);
  }
});

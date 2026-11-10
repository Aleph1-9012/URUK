import { expect, test } from 'bun:test';
import { bushUnionBounds, coveringRadiusBound, createKakeyaModel, DELTA, insideTriangle, minimumSeparation, needlePose, rotateTriangles, SIDE, squareCells, treeTriangles, treeUnionArea, TRIANGLE_AREA, unionArea, type Point, type Triangle } from '../src/components/visuals/needle-room/math';

const model = createKakeyaModel();

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

test('074: the six-leg needle turn stays in the triangle with continuous physical endpoints and ends swapped', () => {
  let worstLength = 0;
  let outside = false;

  for (let frame = 0; frame <= 1500; frame++) {
    const pose = needlePose(frame / 1500);
    worstLength = Math.max(worstLength, Math.abs(distance(pose.a, pose.b) - 1));

    for (let sample = 0; sample <= 40; sample++) {
      const point = { x: pose.a.x + sample / 40 * (pose.b.x - pose.a.x), y: pose.a.y + sample / 40 * (pose.b.y - pose.a.y) };
      outside ||= !insideTriangle(point);
    }
  }

  expect(worstLength).toBeLessThan(1e-12);
  expect(outside).toBe(false);

  for (const clock of [4, 5, 9, 10, 14]) {
    const before = needlePose(clock / 15 - 1e-9);
    const after = needlePose(clock / 15 + 1e-9);
    expect(distance(before.a, after.a)).toBeLessThan(1e-7);
    expect(distance(before.b, after.b)).toBeLessThan(1e-7);
  }

  const start = needlePose(0);
  const end = needlePose(1);
  expect(distance(start.a, end.b)).toBeLessThan(1e-12);
  expect(distance(start.b, end.a)).toBeLessThan(1e-12);
  expect(end.leg).toBe(5);
  expect(end.directionDegrees).toBe(180);
});

test('074: sideways sprouting preserves every sliver direction, reduces area and matches independent slices and square counts', () => {
  let previousArea = Infinity;
  let worstDirectionDefect = 0;
  const original = treeTriangles(model.stages[0] ?? []);

  for (const [index, shifts] of model.stages.entries()) {
    const triangles = treeTriangles(shifts);
    const area = treeUnionArea(shifts, 2048);
    const expected = model.stageShares[index];

    if (expected === undefined) throw new Error('Every stage has a reference area share.');

    expect(Math.abs(area / TRIANGLE_AREA - expected)).toBeLessThan(.001);
    expect(area).toBeLessThanOrEqual(previousArea + 1e-12);
    previousArea = area;

    for (const [i, triangle] of triangles.entries()) {
      const base = original[i];

      if (!base) throw new Error('Every translated sliver has its original direction interval.');

      for (const vertex of [1, 2] as const) {
        worstDirectionDefect = Math.max(worstDirectionDefect, Math.abs((triangle[vertex].x - triangle[0].x) - (base[vertex].x - base[0].x)), Math.abs((triangle[vertex].y - triangle[0].y) - (base[vertex].y - base[0].y)));
      }
    }
  }

  expect(worstDirectionDefect).toBeLessThan(1e-12);
  expect(unionArea(model.slivers, 2048)).toBeCloseTo(previousArea, 4);
  const three = [...model.slivers, ...rotateTriangles(model.slivers, Math.PI / 3, model.centre), ...rotateTriangles(model.slivers, 2 * Math.PI / 3, model.centre)];
  expect(unionArea(three, 2048)).toBeCloseTo(model.threeArea, 3);
  const whole: Triangle[] = [[{ x: 0, y: 0 }, { x: SIDE, y: 0 }, { x: SIDE / 2, y: 1 }]];
  expect([1 / 8, 1 / 16].map(delta => squareCells(model.slivers, delta).length)).toEqual([36, 120]);
  expect([1 / 8, 1 / 16].map(delta => squareCells(whole, delta).length)).toEqual([49, 172]);
});

test('074: the Fibonacci bush is delta-separated and its union bounds have the cubic share against all tubes', () => {
  expect(model.net.length).toBe(2442);
  const separation = minimumSeparation(model.net);
  expect(separation).toBeGreaterThanOrEqual(DELTA);
  expect(separation / DELTA).toBeCloseTo(model.bush.closestPairOverDelta, 4);
  const cover = coveringRadiusBound(model.net);
  expect(Math.sin(cover)).toBeLessThanOrEqual(2 * DELTA);

  for (const row of model.bush.rows) {
    const bounds = bushUnionBounds(row.lambda);
    expect(bounds.unionLow).toBeCloseTo(row.unionLow, 5);
    expect(bounds.unionHigh).toBeCloseTo(row.unionHigh, 5);
    expect(bounds.shadedTotal).toBeCloseTo(row.shadedTotal, 4);
    expect(bounds.shareLow).toBeCloseTo(row.shareLow, 6);
    expect(bounds.shareHigh).toBeCloseTo(row.shareHigh, 6);
    expect(bounds.unionHigh).toBeGreaterThan(bounds.unionLow);
    expect(bounds.shareLow / row.lambda ** 3).toBeCloseTo(1 / (6 * model.net.length * DELTA ** 2), 12);
  }
});

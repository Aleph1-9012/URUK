import { expect, test } from 'bun:test';
import { Z, bookDrawing, brickyard, cycleCrossings, d, dimensionBasis, graphState, type GraphState } from '../src/components/visuals/fewest-crossings/math';

test('165: the strict two-page rule gives the formula as distinct crossing points', () => {
  const expected = [0, 0, 1, 3, 9, 18, 36, 60, 100, 150, 225, 315];

  for (let n = 3; n <= 14; n++) {
    const drawing = bookDrawing(n);
    expect(Z(n)).toBe(expected[n - 3] ?? 0);
    expect(drawing.count).toBe(Z(n));

    for (const crossing of drawing.intersections) {
      expect(crossing.tFirst).toBeGreaterThan(0);
      expect(crossing.tFirst).toBeLessThan(1);
      expect(crossing.tSecond).toBeGreaterThan(0);
      expect(crossing.tSecond).toBeLessThan(1);
    }
  }
});

function straightCount(drawing: GraphState): number {
  const points: { x: number; y: number }[] = [];

  for (const [index, first] of drawing.edges.entries()) {
    if (first.kind !== 'segment') continue;

    for (const second of drawing.edges.slice(index + 1)) {
      if (second.kind !== 'segment') continue;

      const p = first.from;
      const q = first.to;
      const r = second.from;
      const s = second.to;
      const orient = (a: typeof p, b: typeof p, c: typeof p) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

      if (orient(p, q, r) * orient(p, q, s) >= 0 || orient(r, s, p) * orient(r, s, q) >= 0) continue;

      const determinant = (q.x - p.x) * (s.y - r.y) - (q.y - p.y) * (s.x - r.x);
      const t = ((r.x - p.x) * (s.y - r.y) - (r.y - p.y) * (s.x - r.x)) / determinant;
      const u = ((r.x - p.x) * (q.y - p.y) - (r.y - p.y) * (q.x - p.x)) / determinant;

      if (t <= 1e-8 || t >= 1 - 1e-8 || u <= 1e-8 || u >= 1 - 1e-8) continue;

      const point = { x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) };

      if (!points.some(old => Math.hypot(old.x - point.x, old.y - point.y) < 1e-7)) points.push(point);
    }
  }

  return points.length;
}

test('165: brickyard motion and small drawings count their actual intersections', () => {
  expect(brickyard(3, 4, 0).count).toBe(18);
  expect(brickyard(3, 4, 1).count).toBe(2);

  for (let index = 0; index <= 40; index++) {
    const drawing = brickyard(3, 4, index / 40);
    expect(drawing.count).toBe(straightCount(drawing));
  }

  expect(graphState(32000).count).toBe(0);
  expect(graphState(34000).count).toBe(1);
  expect(graphState(36000).count).toBe(1);
  const curved = graphState(26750);
  expect(curved.count).toBeGreaterThan(2);
  expect(graphState(23000).count).toBe(2);
  expect(graphState(30499.999).count).toBe(2);

  for (const [m, n] of [[3, 3], [4, 4], [4, 5], [5, 5], [5, 6], [6, 6], [7, 7]] as const) expect(brickyard(m, n).count).toBe(d(m) * d(n));
});

test('165: the signed cycles cancel and the nine-vertex free curves retain all 36 crossings', () => {
  const signed = cycleCrossings(bookDrawing(7));
  expect(signed.map(crossing => crossing.sign)).toEqual([1, -1, -1, 1]);
  expect(signed.reduce((sum, crossing) => sum + crossing.sign, 0)).toBe(0);

  for (let time = 66000; time < 82000; time += 125) expect(graphState(time).count).toBeGreaterThanOrEqual(36);

  for (const s of [3, 4, 5]) expect(dimensionBasis(s).length ** 2).toBe(Z(2 * s + 1));
});

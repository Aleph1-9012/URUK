import { expect, test } from 'bun:test';
import { countInBall, createPolymerModel, diameter, enumerateWalks, exactCounts, exactDiameter, neighbours, position, RHO, snap, type Point, type Vertex } from '../src/components/visuals/polymer-walk/math';

const model = createPolymerModel();

function latticeKey(vertex: Vertex): string {
  return `${vertex.i},${vertex.j},${vertex.sub}`;
}

function integerBallCount(points: readonly Point[], centre: Point, radius: number): number {
  const c = snap(centre);
  let count = 0;

  for (const point of points) {
    const v = snap(point);
    const dx = 3 * (v.i - c.i) + 2 * (v.sub - c.sub);
    const dy = v.i - c.i + 2 * (v.j - c.j);

    if (dx * dx + 3 * dy * dy <= 4 * radius * radius) count++;
  }

  return count;
}

test('237: both shipped pivot samples are self-avoiding unit honeycomb walks, with the stated close ends and a real band crossing', () => {
  for (const points of [model.walk, model.closeWalk]) {
    expect(points.length).toBe(1025);
    const keys = new Set<string>();

    for (const [index, point] of points.entries()) {
      const vertex = snap(point);
      keys.add(latticeKey(vertex));
      const nextPoint = points[index + 1];

      if (!nextPoint) continue;

      expect(Math.hypot(nextPoint.x - point.x, nextPoint.y - point.y)).toBeCloseTo(1, 11);
      expect(neighbours(vertex).some(next => latticeKey(next) === latticeKey(snap(nextPoint)))).toBe(true);
    }

    expect(keys.size).toBe(points.length);
  }

  expect(model.closeGap).toBe(3);
  expect(model.closeDiameter).toBeCloseTo(133.29, 2);
  const crossing = model.crossing;
  expect(crossing.startIndex).toBe(25);
  expect(crossing.endIndex).toBe(106);
  expect(crossing.points[0]?.y).toBe(crossing.bottom);
  expect(crossing.points.at(-1)?.y).toBe(crossing.top);

  for (const point of crossing.points.slice(1, -1)) {
    expect(point.y).toBeGreaterThan(crossing.bottom);
    expect(point.y).toBeLessThan(crossing.top);
  }

  const seventh = model.walk[7];

  if (!seventh) throw new Error('The sample contains step seven.');

  const old = new Set(model.walk.slice(0, 6).map(point => latticeKey(snap(point))));
  expect(neighbours(snap(seventh)).some(vertex => old.has(latticeKey(vertex)))).toBe(true);
});

test('237: exact enumeration counts distinct paths and gives the critical-weight lower bound through eighteen steps', () => {
  const counts = exactCounts(18);
  expect(counts.slice(1)).toEqual([3, 6, 12, 24, 48, 90, 174, 336, 648, 1218, 2328, 4416, 8388, 15780, 29892, 56268, 106200, 199350]);

  for (const length of [3, 4, 7]) {
    const walks = enumerateWalks(length);
    const encodings = new Set(walks.map(points => points.map(point => latticeKey(snap(point))).join(';')));
    const count = counts[length];

    if (count === undefined) throw new Error('Each independently enumerated length has a computed count.');

    expect(encodings.size).toBe(count);

    for (const points of walks) expect(new Set(points.map(point => latticeKey(snap(point)))).size).toBe(length + 1);
  }

  for (const [n, count] of counts.entries()) expect(count * RHO ** n).toBeGreaterThanOrEqual(1);
});

test('237: live ball counts agree with exact lattice distances, and every highlighted subwalk matches its scatter pair', () => {
  for (const index of [0, 64, 256, 512, 768, 1024]) {
    const centre = model.walk[index];

    if (!centre) throw new Error('Each requested centre is on the sample.');

    for (const radius of [2, 4, 8, 16, 32]) expect(countInBall(model.walk, centre, radius)).toBe(integerBallCount(model.walk, centre, radius));
  }

  expect(model.subwalks.length).toBe(400);

  for (const subwalk of model.subwalks) {
    const points = model.walk.slice(subwalk.start, subwalk.start + subwalk.length + 1);
    expect(points.length).toBe(subwalk.length + 1);
    expect(Math.abs(diameter(points) - subwalk.diameter)).toBeLessThan(.000501);
  }

  const short = model.walk.slice(0, 30);
  const exact = exactDiameter(short);
  expect(diameter(short)).toBeLessThanOrEqual(exact + 1e-10);
  expect(diameter(short)).toBeGreaterThanOrEqual(exact * Math.cos(Math.PI / 180) - 1e-10);
  expect(position(snap({ x: 1.5, y: .8660 })).y).toBeCloseTo(Math.sqrt(3) / 2, 12);
});

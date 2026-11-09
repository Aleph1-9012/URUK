import { expect, test } from 'bun:test';
import { MODE_REFERENCES } from '../src/components/visuals/silent-lines/data';
import { computeContour, modeValue, type Contour, type Point } from '../src/components/visuals/silent-lines/math';
import { MAX_DESCENT_STEP, SNAP_ENERGY_TOLERANCE, grainAt, seedGrains, transportGrains } from '../src/components/visuals/silent-lines/transport';

function distanceToSegments(point: Point, contour: Contour): number {
  let best = Infinity;

  for (let index = 0; index < contour.segments.length; index += 4) {
    const ax = contour.segments[index] ?? 0;
    const ay = contour.segments[index + 1] ?? 0;
    const dx = (contour.segments[index + 2] ?? 0) - ax;
    const dy = (contour.segments[index + 3] ?? 0) - ay;
    const norm = dx * dx + dy * dy;
    const t = norm === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - ax) * dx + (point.y - ay) * dy) / norm));
    best = Math.min(best, Math.hypot(point.x - ax - dx * t, point.y - ay - dy * t));

    if (best < 1e-8) break;
  }

  return best;
}

test('350 grains: the same 600 identities descend through six modes, seek deterministically and finish on their computed contours', () => {
  const count = 600;
  const seeded = seedGrains(count);
  expect(seedGrains(count)).toEqual(seeded);
  let before = seeded;

  for (const reference of MODE_REFERENCES) {
    const contour = computeContour(reference.mode);
    const tracks = transportGrains(contour, before);
    expect(tracks.count).toBe(count);
    expect(tracks.ids).toEqual(Uint16Array.from({ length: count }, (_, id) => id));
    expect(tracks.before).toEqual(before);
    expect(before).toEqual(tracks.positions.slice(0, before.length));
    expect(tracks.after).toEqual(tracks.positions.slice(-before.length));
    expect(tracks.maxSnapDistance).toBeLessThan(.005);

    for (let id = 0; id < tracks.count; id++) {
      let previous = { x: before[id * 2] ?? 0, y: before[id * 2 + 1] ?? 0 };
      let previousEnergy = modeValue(reference.mode, previous.x, previous.y) ** 2;
      let largestIncrease = 0;
      let largestStep = 0;

      for (let frame = 1; frame < tracks.descentFrames; frame++) {
        const offset = (frame * tracks.count + id) * 2;
        const point = { x: tracks.positions[offset] ?? 0, y: tracks.positions[offset + 1] ?? 0 };
        const nextEnergy = modeValue(reference.mode, point.x, point.y) ** 2;
        largestIncrease = Math.max(largestIncrease, nextEnergy - previousEnergy);
        largestStep = Math.max(largestStep, Math.hypot(point.x - previous.x, point.y - previous.y));
        previous = point;
        previousEnergy = nextEnergy;
      }

      expect(largestIncrease).toBeLessThanOrEqual(2e-12);
      expect(largestStep).toBeLessThanOrEqual(MAX_DESCENT_STEP + 2e-7);
      let snapIncrease = 0;

      for (let frame = tracks.descentFrames; frame < tracks.frames; frame++) {
        const offset = (frame * tracks.count + id) * 2;
        const point = { x: tracks.positions[offset] ?? 0, y: tracks.positions[offset + 1] ?? 0 };
        snapIncrease = Math.max(snapIncrease, modeValue(reference.mode, point.x, point.y) ** 2 - previousEnergy);
      }

      expect(snapIncrease).toBeLessThanOrEqual(SNAP_ENERGY_TOLERANCE);
      const endpoint = { x: tracks.after[id * 2] ?? 0, y: tracks.after[id * 2 + 1] ?? 0 };
      expect(endpoint.x >= 0 && endpoint.x <= 1 && endpoint.y >= 0 && endpoint.y <= 1).toBe(true);
      expect(distanceToSegments(endpoint, contour)).toBeLessThan(2e-7);
      expect(grainAt(tracks, id, 0)).toEqual({ x: before[id * 2] ?? 0, y: before[id * 2 + 1] ?? 0 });
      expect(grainAt(tracks, id, 1)).toEqual(endpoint);
    }

    const sought = [.93, .13, .71, .13].map(phase => grainAt(tracks, 37, phase));
    expect(sought[1]).toEqual(sought[3]);
    expect(tracks.before).toEqual(before);
    before = tracks.after;
  }
});

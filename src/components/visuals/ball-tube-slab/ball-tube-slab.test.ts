import { expect, test } from 'bun:test';
import { ballSectionRadius, buildBallTubeSlabModel, periodicDiscCopies, periodicDistance, profileAt } from './math';

function sphereVolumeBySlices(radius: number): number {
  const intervals = 128;
  let integral = 0;

  for (let index = 0; index <= intervals; index++) {
    const z = -radius + 2 * radius * index / intervals;
    const weight = index === 0 || index === intervals ? 1 : index % 2 === 0 ? 2 : 4;
    integral += weight * Math.PI * ballSectionRadius(radius, z) ** 2;
  }

  return integral * 2 * radius / (3 * intervals);
}

function sphereAreaByConicalBands(radius: number): number {
  const bands = 4096;
  let area = 0;

  for (let index = 0; index < bands; index++) {
    const first = Math.PI * index / bands;
    const second = Math.PI * (index + 1) / bands;
    const r1 = radius * Math.sin(first);
    const r2 = radius * Math.sin(second);
    const z1 = radius * Math.cos(first);
    const z2 = radius * Math.cos(second);
    area += Math.PI * (r1 + r2) * Math.hypot(r2 - r1, z2 - z1);
  }

  return area;
}

test('354: candidate areas agree with independent geometric approximations and their lower envelope has the adjacent transitions only', () => {
  const model = buildBallTubeSlabModel();
  let previous: string | null = null;
  const observed: string[] = [];

  for (let index = 1; index <= 500; index++) {
    const volume = index / 1000;
    const point = profileAt(volume);
    const complement = profileAt(1 - volume);

    expect(Math.abs(point.area - complement.area)).toBeLessThan(1e-12);
    expect(point.ballRadius * 2).toBeLessThan(1);
    expect(point.tubeRadius * 2).toBeLessThan(1);

    if (point.candidate !== previous && point.candidate) observed.push(point.candidate);

    previous = point.candidate;
  }

  expect(observed).toEqual(model.branchOrder);

  for (const volume of [.01, .12, .2, .27, .4, .49]) {
    const point = profileAt(volume);
    const ballVolume = sphereVolumeBySlices(point.ballRadius);
    const ballArea = sphereAreaByConicalBands(point.ballRadius);
    const sides = 4096;
    const tubeVolume = sides * point.tubeRadius ** 2 * Math.sin(2 * Math.PI / sides) / 2;
    const tubeArea = sides * 2 * point.tubeRadius * Math.sin(Math.PI / sides);

    expect(Math.abs(ballVolume - volume)).toBeLessThan(1e-12);
    expect(Math.abs(ballArea - point.ballArea)).toBeLessThan(5e-7);
    expect(Math.abs(tubeVolume - volume)).toBeLessThan(3e-7);
    expect(Math.abs(tubeArea - point.tubeArea)).toBeLessThan(3e-7);
    expect(Math.abs(point.area - Math.min(ballArea, tubeArea, 2))).toBeLessThan(5e-7);
  }

  for (const transition of model.transitions) {
    expect(profileAt(transition.volume - 1e-6).candidate).toBe(transition.from);
    expect(profileAt(transition.volume + 1e-6).candidate).toBe(transition.to);
    expect(profileAt(transition.volume).tiedCandidates).toEqual([transition.from, transition.to]);
  }

  const crossing = profileAt(model.otherIntersection.volume);
  expect(crossing.tiedCandidates).toEqual(['tube']);
  expect(crossing.tubeArea).toBeLessThan(crossing.ballArea);
  expect(profileAt(1e-20).tiedCandidates).toEqual(['ball']);
});

test('354: periodic sections preserve membership and a ball central section is distinct from its equal-volume tube alternative', () => {
  const model = buildBallTubeSlabModel();

  for (const radius of [model.first.ballRadius, model.first.tubeRadius, model.second.tubeRadius]) {
    for (const center of [{ x: .5, y: .5 }, { x: .98, y: .96 }, { x: -1.02, y: 2.96 }]) {
      const copies = periodicDiscCopies(center, radius);

      for (let row = 0; row < 41; row++) {
        for (let column = 0; column < 41; column++) {
          const point = { x: (column + .31) / 41, y: (row + .27) / 41 };
          const dx = point.x - center.x - Math.round(point.x - center.x);
          const dy = point.y - center.y - Math.round(point.y - center.y);
          const expected = dx * dx + dy * dy < radius * radius;
          const actual = copies.some(copy => (point.x - copy.x) ** 2 + (point.y - copy.y) ** 2 < radius * radius);

          expect(actual).toBe(expected);
          expect(Math.abs(periodicDistance(point.x, center.x) - Math.abs(dx))).toBeLessThan(1e-12);
        }
      }
    }
  }

  const ballVolume = sphereVolumeBySlices(model.first.ballRadius);
  const tubeVolume = Math.PI * model.first.tubeRadius ** 2;
  expect(Math.abs(ballVolume - tubeVolume)).toBeLessThan(1e-12);
  expect(ballSectionRadius(model.first.ballRadius, 0)).toBeGreaterThan(model.first.tubeRadius);
  expect(ballSectionRadius(model.first.ballRadius, model.first.ballRadius * 1.1)).toBe(0);
  expect(profileAt(0).candidate).toBeNull();
  expect(profileAt(1).candidate).toBeNull();
  expect(() => profileAt(-.01)).toThrow(RangeError);
  expect(() => profileAt(1.01)).toThrow(RangeError);
});

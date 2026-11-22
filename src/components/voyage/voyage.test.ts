import { expect, test } from 'bun:test';
import { boatPose, KEEL, swellHeight, type Course } from './swell';

// A desktop pass, a phone pass at the shortest duration, and a wide screen at the longest.
const courses: Course[] = [
  { start: -370, distance: 3180, duration: 3280, boatWidth: 319 },
  { start: -160, distance: 600, duration: 2000, boatWidth: 128 },
  { start: -620, distance: 3760, duration: 3600, boatWidth: 540 },
];

test('the boat rides the swell forward and never drifts back', () => {
  for (const course of courses) {
    let previous = boatPose(course, 0).x;

    for (let elapsed = 8; elapsed <= course.duration; elapsed += 8) {
      const { x } = boatPose(course, elapsed);

      expect(x).toBeGreaterThan(previous);
      previous = x;
    }
  }
});

test('the hull sits on the water beneath its keel and tilts with it', () => {
  for (const course of courses) {
    const width = course.boatWidth;
    let tilted = 0;

    for (let elapsed = 0; elapsed <= course.duration; elapsed += 40) {
      const pose = boatPose(course, elapsed);
      const stern = swellHeight(pose.x + KEEL.stern * width, elapsed, width);
      const bow = swellHeight(pose.x + KEEL.bow * width, elapsed, width);
      const under: number[] = [];

      for (let along = KEEL.stern; along <= KEEL.bow; along += 0.01) under.push(swellHeight(pose.x + along * width, elapsed, width));

      expect(pose.heave).toBeGreaterThanOrEqual(Math.min(...under));
      expect(pose.heave).toBeLessThanOrEqual(Math.max(...under));

      // Where the water stands clearly higher at one end, that end of the hull is lifted.
      if (Math.abs(bow - stern) > 0.02 * width) {
        expect(Math.sign(pose.pitch)).toBe(Math.sign(bow - stern));
        tilted += 1;
      }
    }

    expect(tilted).toBeGreaterThan(0);
  }
});

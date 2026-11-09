import { expect, test } from 'bun:test';
import { swingAt, swingPeriod, swingTimeOf } from '../src/components/plate/swing';
import { formatK } from '../src/components/visuals/standard-map/labels';
import { FILM as MAP_FILM, K_START, drawOrbits, step } from '../src/components/visuals/standard-map/orbits';
import { apply, bandMaps, trackLines, x0, x0Inverse, x1 } from '../src/components/visuals/thompson/maps';
import { FILM_PERIOD, START_STEP, describeStep, stepAt, timeOfStep } from '../src/components/visuals/thompson/steps';
import { START_RULER, UNIT, cellAt, fits, patternOf, rulerEnd, tiles } from '../src/components/visuals/unit-ruler/tiling';
import { WANDER_PERIOD, between, rulerAt } from '../src/components/visuals/unit-ruler/wander';

function seeded(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;

    return state / 4294967296;
  };
}

test('158: the two ends of a unit ruler never land on the same pattern', () => {
  const random = seeded(158);

  for (let trial = 0; trial < 20000; trial += 1) {
    const start = { x: random() * 2000 - 1000, y: random() * 2000 - 1000 };
    const angle = random() * 2 * Math.PI;
    const end = rulerEnd({ start, angle });

    expect(Math.hypot(end.x - start.x, end.y - start.y)).toBeCloseTo(UNIT, 9);
    expect(patternOf(cellAt(end))).not.toBe(patternOf(cellAt(start)));
  }
});

test('158: every pattern appears on the plate', () => {
  const seen = new Set(tiles().map((tile) => tile.pattern));

  expect(seen.size).toBe(7);
});

test('248: each map fixes 0 and 1, rises, and has power-of-two slopes and dyadic breakpoints', () => {
  for (const map of [x0, x1, x0Inverse]) {
    expect(apply(map, 0)).toBe(0);
    expect(apply(map, 1)).toBe(1);

    for (let index = 1; index < map.from.length; index += 1) {
      const start = map.from[index - 1] ?? 0;
      const end = map.from[index] ?? 0;
      const slope = ((map.to[index] ?? 0) - (map.to[index - 1] ?? 0)) / (end - start);

      expect(slope).toBeGreaterThan(0);
      expect(Number.isInteger(Math.log2(slope))).toBe(true);
      expect(Number.isInteger(end * 2 ** 10)).toBe(true);
    }
  }
});

test('248: x₀ then its inverse puts every mark back', () => {
  for (let index = 0; index <= 32; index += 1) {
    expect(apply(x0Inverse, apply(x0, index / 32))).toBeCloseTo(index / 32, 12);
  }
});

test('248: the marks keep their order through all eight bands', () => {
  const lines = trackLines();

  expect(lines).toHaveLength(bandMaps.length + 1);

  for (const line of lines) {
    expect(line[0]).toBe(0);
    expect(line.at(-1)).toBe(1);
    expect(line.every((mark, index) => index === 0 || mark > (line[index - 1] ?? 1))).toBe(true);
  }

  expect(describeStep(2)).toStartWith('Step 2 of 8');
});

test('146: the standard map stays on the torus', () => {
  const random = seeded(146);

  for (let trial = 0; trial < 1000; trial += 1) {
    const [x, y] = step(random(), random(), random());

    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThan(1);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThan(1);
  }

  expect(formatK(0.2)).toBe('0.2');
  expect(formatK(0.150000001)).toBe('0.15');
  expect(formatK(1)).toBe('1');
});

test('146: a picture has one ink dot or more and only ink and nothing', () => {
  const pixels = drawOrbits(0.2, { width: 76, height: 56, dot: 1 }, { starts: 40, classifySteps: 50, orderlyEvery: 2, orderlySteps: 60, chaoticSteps: 8 });
  let inked = 0;

  expect(pixels).toHaveLength(76 * 56 * 4);

  for (let index = 3; index < pixels.length; index += 4) {
    inked += pixels[index] === 0 ? 0 : 1;
  }

  expect(inked).toBeGreaterThan(0);
});

test('films: a swing rests low, climbs, rests high and comes back', () => {
  for (const film of [MAP_FILM]) {
    const period = swingPeriod(film);

    expect(swingAt(film, 0)).toBe(film.low);
    expect(swingAt(film, film.hold + film.travel / 2)).toBeCloseTo((film.low + film.high) / 2, 9);
    expect(swingAt(film, 2 * film.hold + film.travel - 1)).toBe(film.high);
    expect(swingAt(film, period - film.travel / 2)).toBeCloseTo((film.low + film.high) / 2, 9);
    expect(swingAt(film, period)).toBe(film.low);
  }

  expect(swingAt(MAP_FILM, swingTimeOf(MAP_FILM, K_START))).toBeCloseTo(K_START, 9);
});

test('248 film: starts on the still picture, draws every band, rests on all eight', () => {
  expect(stepAt(timeOfStep(START_STEP))).toBe(START_STEP);
  expect(stepAt(0)).toBe(1);
  expect(stepAt(FILM_PERIOD - 1)).toBe(8);
  expect(stepAt(FILM_PERIOD)).toBe(1);
});

test('158 film: the wandering ruler starts where the HTML puts it and never leaves the plate', () => {
  const first = rulerAt(0);

  expect(first.start.x).toBeCloseTo(START_RULER.start.x, 9);
  expect(first.start.y).toBeCloseTo(START_RULER.start.y, 9);
  expect(first.angle).toBeCloseTo(START_RULER.angle, 9);

  for (let time = 0; time < WANDER_PERIOD; time += 20) {
    expect(fits(rulerAt(time))).toBe(true);
  }

  const halfway = between({ start: { x: 0, y: 0 }, angle: 3 }, { start: { x: 10, y: 0 }, angle: -3 }, 0.5);

  expect(halfway.start.x).toBeCloseTo(5, 9);
  // From 3 to −3 radians the short way round is through π, not through 0.
  expect(Math.abs(halfway.angle)).toBeCloseTo(Math.PI, 9);
});

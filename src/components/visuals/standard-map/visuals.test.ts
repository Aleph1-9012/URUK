import { expect, test } from 'bun:test';
import { swingAt, swingPeriod, swingTimeOf } from '../../plate/swing';
import { formatK } from './labels';
import { FILM as MAP_FILM, K_START, drawOrbits, step } from './orbits';

function seeded(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;

    return state / 4294967296;
  };
}

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

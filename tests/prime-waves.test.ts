import { expect, test } from 'bun:test';
import { latticePoints } from '../src/components/visuals/prime-waves/film';
import {
  CHART_END, PRIMES, li, offsetLi, primeCount, smoothPart, waveSize, waveTable, zeroWave,
} from '../src/components/visuals/prime-waves/primes';
import {
  CLAIMED_EDGE, CUES, DIAL_FROM, DIAL_TO, FILM_DURATION, FIRST_HEIGHT, SCENES, classicalWidth, cueAt, cueEnd, dialAt, panelAt,
  stillTime, zerosUsed, type Panel,
} from '../src/components/visuals/prime-waves/story';
import { phaseLines, sample, type Grid } from '../src/components/visuals/zeta-map/contours';
import { lValue, minusFour, principal } from '../src/components/visuals/zeta-map/lfunctions';
import { ZETA_GRID, computeMap } from '../src/components/visuals/zeta-map/maps';
import { zeroHeights } from '../src/components/visuals/zeta-map/zeros';

const size = ({ re, im }: { re: number; im: number }) => Math.hypot(re, im);

test('003 maths: ζ and L(s, χ₋₄) match known values', () => {
  expect(lValue(principal, 2, 0).re).toBeCloseTo(Math.PI ** 2 / 6, 12);
  expect(lValue(principal, -1, 0).re).toBeCloseTo(-1 / 12, 12);
  expect(lValue(principal, 0, 0).re).toBeCloseTo(-0.5, 12);
  // Catalan's constant, and π³/32.
  expect(lValue(minusFour, 2, 0).re).toBeCloseTo(0.915965594177219, 12);
  expect(lValue(minusFour, 3, 0).re).toBeCloseTo(Math.PI ** 3 / 32, 12);
});

test('003 maths: the tabled zeros are zeros, up to the top of the map', () => {
  for (const height of zeroHeights) {
    if (height > ZETA_GRID.top) break;

    expect(size(lValue(principal, 0.5, height))).toBeLessThan(1e-7);
  }
});

test('003 maths: the primes, their count and li(x)', () => {
  expect(PRIMES.length).toBe(25);
  expect(PRIMES.slice(0, 5)).toEqual([2, 3, 5, 7, 11]);
  expect(primeCount(CHART_END)).toBe(25);
  expect(primeCount(10.5)).toBe(4);
  expect(li(2)).toBeCloseTo(1.0451637801174927, 12);
  expect(li(100)).toBeCloseTo(30.126141584079633, 10);
  expect(offsetLi(2)).toBeCloseTo(0, 12);
});

test('003 maths: the smooth part and the first hundred waves rebuild the count between the primes', () => {
  let worst = 0;

  for (let x = 2.5; x < CHART_END; x += 1) {
    let value = smoothPart(x);

    for (const height of zeroHeights) {
      value += zeroWave(x, { re: 0.5, im: height });
    }

    worst = Math.max(worst, Math.abs(value - primeCount(x)));
  }

  expect(worst).toBeLessThan(0.2);
});

test('003 maths: the wave table sums the waves in order, and its dial starts at the first zero', () => {
  const count = 40;
  const table = waveTable(zeroHeights.slice(0, 3), count, { height: FIRST_HEIGHT, from: DIAL_FROM, to: DIAL_TO, rows: 4 });
  const first = (index: number) => table.partial[count + index] ?? Number.NaN;

  expect(table.zeros).toBe(3);
  expect(table.partial.length).toBe(4 * count);

  for (let index = 0; index < count; index += 1) {
    expect(table.partial[index]).toBe(0);
    expect(table.dial[index]).toBeCloseTo(first(index), 5);
    expect(first(index)).toBeCloseTo(zeroWave(table.xs[index] ?? 2, { re: 0.5, im: zeroHeights[0] ?? 0 }), 4);
  }

  // A zero further right gives a larger wave, as its envelope says.
  const largest = (row: number) => Math.max(...Array.from(table.dial.subarray(row * count, (row + 1) * count), Math.abs));

  expect(largest(3)).toBeGreaterThan(3 * largest(0));
  expect(waveSize(CHART_END, { re: CLAIMED_EDGE, im: FIRST_HEIGHT })).toBeGreaterThan(waveSize(CHART_END, { re: 0.5, im: FIRST_HEIGHT }));
});

test('003 maps: joined phase lines still meet at a zero, and the cousin’s zeros sit on the line ½', () => {
  const grid: Grid = { left: 0.3013, right: 0.7013, bottom: 13.9213, top: 14.3213, columns: 40, rows: 40 };
  const { points, starts } = phaseLines(grid, sample(grid, (real, imaginary) => lValue(principal, real, imaginary)), 6);
  const ends: number[] = [];

  for (let index = 0; index < points.length; index += 2) {
    ends.push(Math.hypot((points[index] ?? 0) - 0.5, (points[index + 1] ?? 0) - (zeroHeights[0] ?? 0)));
  }

  expect(Math.min(...ends)).toBeLessThan(0.02);
  // Twelve half-lines leave the zero; joined, they are a handful of lines, not one piece per cell.
  expect(starts.length).toBeLessThan(24);

  const map = computeMap('minus-four');

  // The first zero of L(s, χ₋₄), and the count up to height 30.
  expect(map.zeros[0]?.im).toBeCloseTo(6.020948904, 5);
  expect(map.zeros.length).toBe(10);

  for (const zero of map.zeros) {
    expect(zero.re).toBeCloseTo(0.5, 6);
  }

  for (const band of map.bands) {
    for (let index = 1; index < band.points.length; index += 2) {
      expect(band.points[index]).toBeGreaterThanOrEqual(band.bottom);
      expect(band.points[index]).toBeLessThanOrEqual(band.top);
    }
  }
});

test('003 film: between 45 and 120 seconds, subtitles in order, each long enough to read', () => {
  expect(FILM_DURATION).toBeGreaterThanOrEqual(45000);
  expect(FILM_DURATION).toBeLessThanOrEqual(120000);

  for (const [index, cue] of CUES.entries()) {
    const shown = cueEnd(index) - cue.at;
    const letters = cue.text.replace(/\$[^$]*\$/g, 'xxxxx').length;

    expect(shown).toBeGreaterThan(0);
    // About seventeen characters a second; the last subtitle stays after the film stops.
    if (index < CUES.length - 1) expect(shown).toBeGreaterThanOrEqual(letters * 1000 / 17 - 200);

    expect(cueAt(cue.at)).toBe(index);
    expect(cueAt(stillTime(index))).toBe(index);
  }

  expect(cueAt(FILM_DURATION + 5000)).toBe(CUES.length - 1);
  expect(SCENES.every((scene, index) => index === 0 || scene.first > (SCENES[index - 1]?.first ?? 0))).toBe(true);
});

test('003 film: drawings move without jumps, and the dial and the count of zeros run as the subtitles say', () => {
  const panels: readonly Panel[] = ['chart', 'plane', 'cousin', 'lattice', 'device'];

  for (const layout of ['wide', 'tall'] as const) {
    for (const panel of panels) {
      let previous = panelAt(panel, 0, layout);

      for (let time = 50; time <= FILM_DURATION; time += 50) {
        const now = panelAt(panel, time, layout);

        expect(Math.abs(now.box.x - previous.box.x) + Math.abs(now.box.y - previous.box.y)).toBeLessThan(0.05);
        expect(Math.abs(now.box.w - previous.box.w) + Math.abs(now.box.h - previous.box.h)).toBeLessThan(0.05);
        expect(Math.abs(Math.log((now.view.top - now.view.bottom) / (previous.view.top - previous.view.bottom)))).toBeLessThan(0.1);
        previous = now;
      }
    }
  }

  expect(dialAt(0)).toBe(DIAL_FROM);
  expect(dialAt(57500)).toBeCloseTo(DIAL_TO, 12);
  expect(dialAt(61000)).toBeCloseTo(DIAL_FROM, 12);
  expect(zerosUsed(40500)).toBe(0);
  expect(zerosUsed(47000)).toBe(100);
  expect(classicalWidth(Math.E ** 10)).toBeCloseTo(1 / 55.73412, 9);
});

test('003 film: the Eisenstein grid is a + bω with norm a² − ab + b², six units around 0', () => {
  const points = latticePoints(3.05);

  for (const point of points) {
    expect(point.x * point.x + point.y * point.y).toBeCloseTo(point.norm, 9);
  }

  expect(points[0]?.norm).toBe(0);
  expect(points.filter((point) => point.norm === 1).length).toBe(6);
  expect(points.some((point) => point.norm === 2)).toBe(false);
});

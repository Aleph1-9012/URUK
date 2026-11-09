import { expect, test } from 'bun:test';
import {
  BOUND_GAP, CATALAN, EXAMPLES, LOWER_BOUND, SUMS, UPPER_BOUND, partialSums,
} from '../src/components/visuals/catalan-bounds/catalan';
import { CUES, FILM_DURATION, geometryAt, termsAt, TIMELINE } from '../src/components/visuals/catalan-bounds/story';

test('005 maths: the accelerated constant and the exact fractions agree with known values', () => {
  expect(CATALAN).toBeCloseTo(0.915965594177219015, 14);
  expect(EXAMPLES.map(({ numerator, denominator }) => [numerator, denominator])).toEqual([
    [1n, 1n],
    [8n, 9n],
    [209n, 225n],
    [10016n, 11025n],
    [91369n, 99225n],
    [10956424n, 12006225n],
  ]);
  expect(partialSums(0)).toEqual([]);

  for (const [index, sum] of SUMS.entries()) {
    const previous = SUMS[index - 1];
    const previousNumerator = previous?.numerator ?? 0n;
    const previousDenominator = previous?.denominator ?? 1n;
    const odd = BigInt(2 * index + 1);
    const sign = index % 2 === 0 ? 1n : -1n;

    // Cross multiplication checks the new summand without converting large integers to floats.
    expect((sum.numerator * previousDenominator - previousNumerator * sum.denominator) * odd * odd)
      .toBe(sign * sum.denominator * previousDenominator);
    expect(sum.denominator).toBeGreaterThan(0n);
  }
});

test('005 maths: the walk alternates around G inside the next-term error bound', () => {
  for (const [index, sum] of SUMS.entries()) {
    const nextOdd = 2 * index + 3;

    expect(sum.error).toBeGreaterThan(0);
    expect(sum.error).toBeLessThan(1 / (nextOdd * nextOdd));

    if (index % 2 === 0) {
      expect(sum.value).toBeGreaterThan(CATALAN);
    } else {
      expect(sum.value).toBeLessThan(CATALAN);
    }

    const previous = SUMS[index - 1];

    if (previous) expect(sum.error).toBeLessThan(previous.error);
  }
});

test('005 maths: the first six shrinking errors lose their smallness when denominators are cleared', () => {
  for (const [index, sum] of EXAMPLES.entries()) {
    expect(sum.clearedError / Number(sum.denominator)).toBeCloseTo(sum.error, 14);
    const previous = EXAMPLES[index - 1];

    if (!previous) continue;

    expect(sum.error).toBeLessThan(previous.error);
    expect(sum.clearedError).toBeGreaterThan(previous.clearedError);
  }

  expect(EXAMPLES[0]?.clearedError).toBeCloseTo(0.084034405822781, 12);
  expect(EXAMPLES[5]?.clearedError).toBeCloseTo(40865.016, 3);
  // The film must not generalize the first-six trend to every partial sum.
  expect(SUMS[7]?.clearedError).toBeLessThan(SUMS[6]?.clearedError ?? 0);
});

test('005 maths: the two quoted limiting bounds have no overlap', () => {
  expect(UPPER_BOUND).toBeLessThan(LOWER_BOUND);
  expect(UPPER_BOUND).toBeLessThan(-2.2909);
  expect(BOUND_GAP).toBe(99875 / 1_000_000_000);
  expect(LOWER_BOUND - UPPER_BOUND).toBeCloseTo(BOUND_GAP, 14);
});

test('005 film: subtitles remain ordered and allow seventeen characters per second', () => {
  expect(FILM_DURATION).toBeGreaterThanOrEqual(45000);
  expect(FILM_DURATION).toBeLessThanOrEqual(120000);
  expect(CUES[0]?.at).toBe(0);

  for (const [index, cue] of CUES.entries()) {
    const shown = TIMELINE.cueEnd(index) - cue.at;
    const letters = cue.text.replace(/\$[^$]*\$/g, 'xxxxx').length;

    expect(shown).toBeGreaterThan(0);

    if (index < CUES.length - 1) expect(shown).toBeGreaterThanOrEqual(letters * 1000 / 17 - 200);

    expect(TIMELINE.cueAt(cue.at)).toBe(index);
    expect(TIMELINE.cueAt(TIMELINE.stillTime(index))).toBe(index);
  }

  expect(TIMELINE.cueAt(FILM_DURATION + 5000)).toBe(CUES.length - 1);
});

test('005 film: the measuring line moves and zooms continuously in both layouts', () => {
  for (const layout of ['wide', 'tall'] as const) {
    let previous = geometryAt(0, layout);

    for (let time = 50; time <= FILM_DURATION; time += 50) {
      const current = geometryAt(time, layout);
      const viewSpan = current.viewRight - current.viewLeft;
      const previousSpan = previous.viewRight - previous.viewLeft;

      expect(current.lineLeft).toBeGreaterThanOrEqual(0);
      expect(current.lineRight).toBeLessThanOrEqual(1);
      expect(current.lineRight).toBeGreaterThan(current.lineLeft);
      expect(current.lineY).toBeGreaterThanOrEqual(0);
      expect(current.lineY).toBeLessThanOrEqual(1);
      expect(viewSpan).toBeGreaterThan(0);
      expect(Math.abs(current.lineY - previous.lineY)).toBeLessThan(0.05);
      expect(Math.abs(current.lineLeft - previous.lineLeft) + Math.abs(current.lineRight - previous.lineRight)).toBeLessThan(0.05);
      expect(Math.abs(Math.log(viewSpan / previousSpan))).toBeLessThan(0.1);
      previous = current;
    }
  }
});

test('005 film: the opening finishes four visible steps before revealing the converging tail', () => {
  expect(termsAt(0)).toBe(0);
  expect(termsAt(6200)).toBe(4);
  expect(termsAt(7000)).toBe(4);
  expect(termsAt(7500)).toBe(4);
  expect(termsAt(14000)).toBe(SUMS.length);
  expect(termsAt(22000)).toBe(SUMS.length);
  let previous = 0;

  for (let time = 0; time <= 22000; time += 50) {
    const current = termsAt(time);

    expect(current).toBeGreaterThanOrEqual(previous);
    expect(current).toBeLessThanOrEqual(SUMS.length);
    expect(current - previous).toBeLessThan(0.2);
    previous = current;
  }
});

import { expect, test } from 'bun:test';
import {
  CEILINGS, CONVERGENTS, PI_DIGITS, PI_SCALE, PI_SCALED, continuedFraction, scaledPi,
} from '../src/components/visuals/fraction-rulers/approximations';
import { computeSeries } from '../src/components/visuals/fraction-rulers/series';
import {
  CUES, FILM_DURATION, cueAt, cueEnd, sceneAt, stillTime,
} from '../src/components/visuals/fraction-rulers/story';

test('017 maths: Machin arithmetic agrees at 120 and 300 digits and yields the known continued fraction', () => {
  expect(PI_DIGITS).toBe(300);
  expect(PI_SCALE).toBe(10n ** 300n);
  expect(PI_SCALED.toString().slice(0, 61)).toBe('3141592653589793238462643383279502884197169399375105820974944');
  expect(PI_SCALED / (10n ** 180n)).toBe(scaledPi(120));
  expect(continuedFraction(PI_SCALED, PI_SCALE, 26)).toEqual([
    3n, 7n, 15n, 1n, 292n, 1n, 1n, 1n, 2n, 1n, 3n, 1n, 14n,
    2n, 1n, 1n, 2n, 2n, 2n, 2n, 1n, 84n, 2n, 1n, 1n, 15n,
  ]);
});

test('017 maths: all 22 plotted fractions and achieved exponents survive independent lower-precision recomputation', () => {
  const expected = [
    [22n, 7n, 3.4293],
    [333n, 106n, 2.0144],
    [355n, 113n, 3.2020],
    [103993n, 33102n, 2.0439],
    [104348n, 33215n, 2.0966],
    [208341n, 66317n, 2.0558],
    [312689n, 99532n, 2.1080],
    [833719n, 265381n, 2.0391],
    [1146408n, 364913n, 2.1202],
    [4272943n, 1360120n, 2.0206],
    [5419351n, 1725033n, 2.1894],
    [80143857n, 25510582n, 2.0572],
    [165707065n, 52746197n, 2.0441],
    [245850922n, 78256779n, 2.0405],
    [411557987n, 131002976n, 2.0589],
    [1068966896n, 340262731n, 2.0527],
    [2549491779n, 811528438n, 2.0494],
    [6167950454n, 1963319607n, 2.0572],
    [14885392687n, 4738167652n, 2.0159],
    [21053343141n, 6701487259n, 2.1964],
    [1783366216531n, 567663097408n, 2.0343],
    [3587785776203n, 1142027682075n, 2.0321],
  ] as const;

  const pi120 = scaledPi(120);
  const scale120 = 10n ** 120n;
  let previousNumerator = 3n;
  let previousDenominator = 1n;

  expect(CONVERGENTS.length).toBe(expected.length);

  for (const [index, point] of CONVERGENTS.entries()) {
    const known = expected[index];

    if (!known) throw new Error(`Unexpected convergent at index ${index}.`);

    const signedMiss = pi120 * point.denominator - point.numerator * scale120;
    const absoluteMiss = signedMiss < 0n ? -signedMiss : signedMiss;
    const q = Number(point.denominator);
    const error120 = Number(absoluteMiss) / Number(scale120) / q;
    const determinant = point.numerator * previousDenominator - previousNumerator * point.denominator;

    expect(point.numerator).toBe(known[0]);
    expect(point.denominator).toBe(known[1]);
    expect(point.exponent).toBeCloseTo(known[2], 3);
    expect(point.error / error120).toBeCloseTo(1, 13);
    expect(point.exponent).toBeCloseTo(-Math.log(error120) / Math.log(q), 12);
    expect(point.logQ).toBeCloseTo(Math.log10(q), 13);
    expect(q ** -point.exponent / point.error).toBeCloseTo(1, 12);
    expect(determinant < 0n ? -determinant : determinant).toBe(1n);
    expect(point.error).toBeLessThan(1 / (q * q));
    previousNumerator = point.numerator;
    previousDenominator = point.denominator;
  }

  // The last point lies beyond 10^12; a chart ending at log q = 12 would crop it.
  expect(CONVERGENTS.at(-1)?.logQ).toBeGreaterThan(12);
  expect(CONVERGENTS.at(-1)?.logQ).toBeLessThan(12.1);
});

test('017 maths: the half-step comparisons and the dial select the stated fractions', () => {
  expect(CONVERGENTS[0]?.halfStepRatio).toBeCloseTo(56.4880804234, 8);
  expect(CONVERGENTS[2]?.halfStepRatio).toBeCloseTo(16586.8543923133, 7);
  const aboveThree: bigint[][] = [];
  const aboveTwoPointOneFive: bigint[][] = [];

  for (const point of CONVERGENTS) {
    const fraction = [point.numerator, point.denominator];

    if (point.exponent > 3) aboveThree.push(fraction);
    if (point.exponent > 2.15) aboveTwoPointOneFive.push(fraction);
  }

  expect(aboveThree).toEqual([[22n, 7n], [355n, 113n]]);
  expect(aboveTwoPointOneFive).toEqual([
    [22n, 7n], [355n, 113n], [5419351n, 1725033n], [21053343141n, 6701487259n],
  ]);
  expect(CEILINGS.map(({ year, value }) => [year, value])).toEqual([
    [1953, 42], [1974, 20], [1993, 8.016], [2008, 7.606], [2020, 7.103],
  ]);
});

test('017 maths: logarithmic samples preserve the Flint Hills jump and the two-million-term total', () => {
  const series = computeSeries();
  const miss = 355n * PI_SCALE - 113n * PI_SCALED;
  const delta = Number(miss) / Number(PI_SCALE);
  const nearPeriodSine = -Math.sin(delta);

  expect(delta).toBeCloseTo(0.000030144353364, 14);
  expect(Math.abs((Math.sin(355) - nearPeriodSine) / nearPeriodSine)).toBeLessThan(1e-9);
  expect(series.beforeJump).toBeCloseTo(4.807444, 5);
  expect(series.afterJump).toBeCloseTo(29.405625, 5);
  expect(series.throughTenThousand).toBeCloseTo(30.314511, 5);
  expect(series.total).toBeCloseTo(30.314541, 5);
  expect(series.afterJump - series.beforeJump).toBeCloseTo(1 / (355 ** 3 * nearPeriodSine ** 2), 9);
  expect(series.indices.length).toBe(series.totals.length);
  expect(series.indices[0]).toBe(1);
  expect(series.indices.at(-1)).toBe(2_000_000);
  expect(series.totals.at(-1)).toBe(series.total);

  for (const [index, n] of series.indices.entries()) {
    const total = series.totals[index] ?? Number.NaN;

    expect(Number.isFinite(total)).toBe(true);
    expect(total).toBeGreaterThan(0);

    if (index > 0) {
      expect(n).toBeGreaterThan(series.indices[index - 1] ?? 0);
      expect(total).toBeGreaterThanOrEqual(series.totals[index - 1] ?? 0);
    }
  }

  for (const [n, total] of [[354, series.beforeJump], [355, series.afterJump], [10000, series.throughTenThousand]] as const) {
    expect(series.totals[series.indices.indexOf(n)]).toBe(total);
  }
});

test('017 film: the ordered subtitles fit the reading time and reduced-motion stills', () => {
  expect(FILM_DURATION).toBeGreaterThanOrEqual(45000);
  expect(FILM_DURATION).toBeLessThanOrEqual(120000);
  expect(CUES[0]?.at).toBe(0);

  for (const [index, cue] of CUES.entries()) {
    const duration = cueEnd(index) - cue.at;
    const letters = cue.text.replace(/\$[^$]*\$/g, 'xxxxx').length;

    expect(duration).toBeGreaterThan(0);

    if (index < CUES.length - 1) expect(duration).toBeGreaterThanOrEqual(letters * 1000 / 17 - 200);

    expect(cueAt(cue.at)).toBe(index);
    expect(cueAt(stillTime(index))).toBe(index);
  }

  expect(cueAt(FILM_DURATION + 5000)).toBe(CUES.length - 1);
});

test('017 film: ruler zoom and chart bounds move continuously in both layouts', () => {
  for (const layout of ['wide', 'tall'] as const) {
    let previous = sceneAt(0, layout);

    for (let time = 50; time <= FILM_DURATION; time += 50) {
      const current = sceneAt(time, layout);
      const previousRange = previous.chart.top - previous.chart.bottom;
      const currentRange = current.chart.top - current.chart.bottom;

      expect(current.ruler.width).toBeGreaterThan(0);
      expect(Number.isFinite(current.ruler.center)).toBe(true);
      expect(Math.abs(Math.log(current.ruler.width / previous.ruler.width))).toBeLessThan(0.1);
      expect(Math.abs(current.ruler.center / current.ruler.width - previous.ruler.center / previous.ruler.width)).toBeLessThan(0.05);
      expect(currentRange).toBeGreaterThan(0);
      expect(Math.abs(Math.log(currentRange / previousRange))).toBeLessThan(0.1);
      expect(Math.abs(current.chart.x - previous.chart.x) + Math.abs(current.chart.y - previous.chart.y)).toBeLessThan(0.05);
      expect(Math.abs(current.chart.w - previous.chart.w) + Math.abs(current.chart.h - previous.chart.h)).toBeLessThan(0.05);
      expect(Math.abs(current.sum.x - previous.sum.x) + Math.abs(current.sum.y - previous.sum.y)).toBeLessThan(0.05);
      expect(Math.abs(current.sum.w - previous.sum.w) + Math.abs(current.sum.h - previous.sum.h)).toBeLessThan(0.05);
      expect(current.chart.w).toBeGreaterThan(0);
      expect(current.chart.h).toBeGreaterThan(0);
      expect(current.sum.w).toBeGreaterThan(0);
      expect(current.sum.h).toBeGreaterThan(0);
      expect(current.dial).toBeGreaterThan(2);
      previous = current;
    }
  }
});

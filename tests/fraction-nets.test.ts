import { expect, test } from 'bun:test';
import {
  CIRCLE_TOP, CUBIC_KNOTS, CUBIC_NET, NET_REACH, SQUARE_REMAINDERS, cubicY, exactMultiples, firstCatch, floatMultiples, fractionText,
  nearestMiss, onCircle, onCubic, onExampleCurve,
} from '../src/components/visuals/fraction-nets/nets';
import {
  CUES, FAR_VIEW, FILM_DURATION, NET_RUNS, SCENES, cameraAt, cueAt, cueEnd, netAt, netStart, panelAt, stillTime, type Panel,
} from '../src/components/visuals/fraction-nets/story';

test('004 nets: the net of 21sts is the first to catch x³ + y³ = 6, and no net up to 60 catches x² + y² = 3', () => {
  expect(firstCatch(60, onCubic)).toEqual([...CUBIC_KNOTS]);
  expect(CUBIC_NET).toBe(21);
  expect(firstCatch(60, onCircle)).toEqual([]);
  expect(cubicY(17 / 21)).toBeCloseTo(37 / 21, 12);
  expect(SQUARE_REMAINDERS).toEqual([0, 1, 1, 0, 1, 1, 0, 1, 1]);
});

test('004 nets: the circle’s nearest misses shrink but never reach it', () => {
  const miss = (c: number) => nearestMiss(c, -NET_REACH, NET_REACH, -NET_REACH, NET_REACH).miss;

  expect(miss(5)).toBeCloseTo(0.04, 6);
  expect(miss(21)).toBeCloseTo(0.00227, 5);
  expect(miss(40)).toBeCloseTo(0.000625, 6);

  for (let c = 1; c <= CIRCLE_TOP; c += 1) {
    expect(miss(c)).toBeGreaterThan(0);
  }
});

test('004 curve: the example’s multiples lie on it, are written exactly, and grow like 0.83 n² digits', () => {
  const multiples = exactMultiples(12);

  expect(multiples.map((multiple) => multiple.digits)).toEqual([1, 4, 7, 14, 20, 30, 41, 53, 67, 83, 100, 119]);
  expect(multiples.slice(0, 4).map((multiple) => fractionText(multiple.point.x)))
    .toEqual(['−4', '1681/144', '−2439844/5094049', '11183412793921/2234116132416']);

  for (const multiple of multiples) {
    expect(onExampleCurve(multiple.point)).toBe(true);
    // Odd multiples on the oval, even ones on the branch.
    expect(multiple.n % 2 === 1 ? multiple.x < 0 : multiple.x >= 5).toBe(true);

    if (multiple.n >= 6) expect(multiple.digits / multiple.n ** 2).toBeGreaterThan(0.8);
    if (multiple.n >= 6) expect(multiple.digits / multiple.n ** 2).toBeLessThan(0.86);
  }
});

test('004 curve: the float multiples follow the exact ones and fill both pieces', () => {
  const exact = exactMultiples(60);
  const floats = floatMultiples(150);

  for (const [index, point] of exact.entries()) {
    const float = floats[index];

    expect(float?.n).toBe(point.n);
    expect(Math.abs((float?.x ?? 0) - point.x)).toBeLessThan(1e-6 * Math.max(1, Math.abs(point.x)));
  }

  // Each float point is within 1e-4 of the curve (a few thousandths of a pixel): |F| ÷ |∇F| for F = y² − x³ + 25x.
  for (const { x, y } of floats) {
    const residual = Math.abs(y * y - (x ** 3 - 25 * x));
    expect(residual / Math.hypot(25 - 3 * x * x, 2 * y)).toBeLessThan(1e-4);
  }

  // The widest gap around the oval closes as the points come. Angles are measured on the oval scaled to v² = u³ − u
  // (u = x/5, v = y/5^1.5), around its middle u = −½.
  const widestGap = (count: number) => {
    const angles = floats.slice(0, count)
      .flatMap(({ x, y }) => (x < 0 ? [Math.atan2(y / 5 ** 1.5, x / 5 + 0.5)] : []))
      .sort((first, second) => first - second);
    let widest = (angles[0] ?? 0) + 2 * Math.PI - (angles.at(-1) ?? 0);

    for (let index = 1; index < angles.length; index += 1) {
      widest = Math.max(widest, (angles[index] ?? 0) - (angles[index - 1] ?? 0));
    }

    return widest * 180 / Math.PI;
  };

  expect(widestGap(20)).toBeGreaterThan(60);
  expect(widestGap(120)).toBeLessThan(15);
  const inView = floats.filter(({ x, y }) => x >= FAR_VIEW.left && x <= FAR_VIEW.right && Math.abs(y) <= FAR_VIEW.top);
  expect(inView.length).toBe(92);
});

test('004 film: between 45 and 120 seconds, subtitles in order, each long enough to read', () => {
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

  expect(SCENES.every((scene, index) => index === 0 || scene.first > (SCENES[index - 1]?.first ?? 0))).toBe(true);
});

test('004 film: every net shows, its knots never crowd, and the camera and parts move without jumps', () => {
  for (const run of NET_RUNS) {
    for (let c = run.first; c <= run.last; c += 1) {
      const time = netStart(run, c) + 1;

      expect(netAt(time)?.c).toBe(c);

      // The window is at most reach ÷ c across, so on screen the knots are at least (frame ÷ reach) apart.
      for (const layout of ['wide', 'tall'] as const) {
        const view = cameraAt(time, layout);
        expect((view.right - view.left) * c).toBeLessThanOrEqual(run.reach[layout] + 1e-9);
      }
    }
  }

  const panels: readonly Panel[] = ['plane', 'line', 'tests', 'side', 'chart'];

  for (const layout of ['wide', 'tall'] as const) {
    let view = cameraAt(0, layout);
    const boxes = panels.map((panel) => panelAt(panel, 0, layout));

    for (let time = 50; time <= FILM_DURATION; time += 50) {
      const now = cameraAt(time, layout);

      expect(Math.abs(now.left - view.left) + Math.abs(now.right - view.right)).toBeLessThan(0.5);
      expect(Math.abs(now.bottom - view.bottom) + Math.abs(now.top - view.top)).toBeLessThan(0.5);
      view = now;

      for (const [index, panel] of panels.entries()) {
        const box = panelAt(panel, time, layout);
        const before = boxes[index] ?? box;

        expect(Math.abs(box.x - before.x) + Math.abs(box.y - before.y) + Math.abs(box.w - before.w) + Math.abs(box.h - before.h)).toBeLessThan(0.05);
        boxes[index] = box;
      }
    }
  }
});

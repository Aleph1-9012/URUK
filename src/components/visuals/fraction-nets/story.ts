// The 004 film's timeline (v2, "nets and shadows"): subtitles, transcript scenes, the plane's camera, the nets, and where
// each part sits on the frame. Times are milliseconds. Subtitles are written from the article; $…$ marks a formula.
import { CIRCLE_TOP, CUBIC_NET } from './nets';

export type Cue = { at: number; text: string; sources: readonly number[] };

export const CUES = [
  { at: 0, text: 'Here is an equation: $x^{3}+y^{3}=6$. Does it have a solution in fractions?', sources: [] },
  { at: 6000, text: 'A computer can try every fraction, simplest first: whole numbers, halves, thirds, a finer net each time.', sources: [] },
  { at: 13000, text: 'The net of 21sts lands on the curve: $x=\\tfrac{17}{21}$, $y=\\tfrac{37}{21}$. Found.', sources: [] },
  { at: 18000, text: 'Now $x^{2}+y^{2}=3$. Finer nets catch nothing, and the search can’t tell “none yet” from “none ever”.', sources: [] },
  { at: 24500, text: 'A short argument settles it: squares leave remainder 0 or 1 when divided by 3, which rules out every fraction.', sources: [] },
  { at: 31500, text: 'Is there always such an argument, and can a computer always find it? That is Hilbert’s tenth problem, for fractions.', sources: [1] },
  { at: 38500, text: 'For whole numbers the answer is no (1970): equations can imitate computer programs, and no program can tell which programs stop.', sources: [1, 5, 6] },
  { at: 46500, text: 'To carry that over, an equation would need fraction solutions exactly when its first number is whole: a shadow of the whole numbers.', sources: [1] },
  { at: 54500, text: 'Mazur conjectured that fraction solutions, gaps filled in, form finitely many pieces, like this curve’s two. Their shadow can’t be endless separate points.', sources: [1, 5] },
  { at: 64500, text: 'If he is right, no such equation exists, and a different idea is needed.', sources: [1, 5] },
  { at: 69000, text: 'The paper claims the answer is still no: instead of one equation, it asks a fraction-decider many questions.', sources: [1] },
  { at: 75500, text: 'For each equation it builds endless finite tests: a whole-number solution exists exactly when all pass. A fraction-decider would then settle whole numbers, which is impossible.', sources: [1] },
  { at: 86500, text: 'The hard part: if every test passes, logic gives a larger number system, with integers that may be infinitely large, holding a solution.', sources: [1] },
  { at: 95000, text: 'The tests tie each number $a$ to a point on a curve: the multiple $\\eta(a)P$ of one point $P$. Written out, these points grow fast.', sources: [1] },
  { at: 103000, text: 'The tests keep every size below a constant times the largest index $B$; the points grow like $B^{2}$. So $B$ is ordinary, and so is the solution.', sources: [1] },
  { at: 112500, text: 'Unreviewed: no mathematician has said they have checked it. It leans on two other unchecked papers from the same release.', sources: [1, 2, 3, 15] },
] as const satisfies readonly Cue[];

export const FILM_DURATION = 120000;

// Groups of cues, for the transcript's headings.
export const SCENES = [
  { title: 'Nets of fractions', first: 0 },
  { title: 'None yet, or none ever', first: 3 },
  { title: 'What was known for whole numbers', first: 6 },
  { title: 'The blocked route', first: 7 },
  { title: 'The claim', first: 10 },
  { title: 'How the proof goes', first: 11 },
  { title: 'Where it stands', first: 15 },
] as const;

export function cueAt(time: number): number {
  let index = 0;

  for (const [position, cue] of CUES.entries()) {
    if (time >= cue.at) index = position;
  }

  return index;
}

export function cueEnd(index: number): number {
  return CUES[index + 1]?.at ?? FILM_DURATION;
}

// A settled picture for each cue, for stepping through without motion: just before the next cue begins.
export function stillTime(index: number): number {
  const end = cueEnd(index);

  return index === CUES.length - 1 ? end : end - 250;
}

export function formatTime(time: number): string {
  const seconds = Math.floor(Math.min(FILM_DURATION, Math.max(0, time)) / 1000);

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

// 0 before `start`, 1 after `end`, eased in between.
export function span(time: number, start: number, end: number): number {
  if (end <= start) return time >= end ? 1 : 0;

  const linear = Math.min(1, Math.max(0, (time - start) / (end - start)));

  return linear * linear * (3 - 2 * linear);
}

// Up over [inStart, inEnd], down over [outStart, outEnd].
export function fade(time: number, inStart: number, inEnd: number, outStart = Infinity, outEnd = Infinity): number {
  return Math.min(span(time, inStart, inEnd), 1 - span(time, outStart, outEnd));
}

// Linear share of [start, end], for counters and reveals that must not ease.
export function share(time: number, start: number, end: number): number {
  return Math.min(1, Math.max(0, (time - start) / (end - start)));
}

export type Layout = 'wide' | 'tall';

// A part's place on the frame, as shares of the frame's width and height.
export type Box = { x: number; y: number; w: number; h: number };

// The part of the plane the camera shows.
export type View = { left: number; right: number; bottom: number; top: number };

export type Panel = 'plane' | 'line' | 'tests' | 'side' | 'chart';

type Move = { from: number; to: number; wide?: Box; tall?: Box };

// Where each part sits, then each move it makes. A move eases from where the part was to where it goes.
// The line and the test row are drawn at their box's top edge, across its width.
const PANELS: Record<Panel, { wide: Box; tall: Box; moves: readonly Move[] }> = {
  // The plane: every curve and net. It fills most of the frame for the nets, then gives up room when the line comes in under it.
  plane: {
    wide: { x: 0.03, y: 0.03, w: 0.6, h: 0.86 },
    tall: { x: 0.04, y: 0.02, w: 0.92, h: 0.74 },
    // On a wide frame it spans the whole width for the whole numbers and the curve, then gives the right side to the
    // side panel for the multiples. Its height sets the scale, so the scale holds while its width changes.
    // On a phone it shrinks for the written multiples, and later fades for the chart.
    moves: [
      { from: 38500, to: 40500, wide: { x: 0.03, y: 0.03, w: 0.94, h: 0.66 }, tall: { x: 0.04, y: 0.02, w: 0.92, h: 0.6 } },
      { from: 92500, to: 94500, wide: { x: 0.03, y: 0.03, w: 0.52, h: 0.66 }, tall: { x: 0.04, y: 0.02, w: 0.92, h: 0.36 } },
    ],
  },
  // The line under the plane, on the plane's own scale, so the plane's points drop their shadows straight onto it.
  // On a phone the line and the tests rise to make room for the written multiples, and settle back under the chart.
  line: {
    wide: { x: 0.03, y: 0.765, w: 0.94, h: 0 },
    tall: { x: 0.03, y: 0.66, w: 0.94, h: 0 },
    moves: [
      { from: 92500, to: 94500, tall: { x: 0.03, y: 0.42, w: 0.94, h: 0 } },
      { from: 103000, to: 104500, tall: { x: 0.03, y: 0.66, w: 0.94, h: 0 } },
    ],
  },
  // The paper's tests, a row of boxes under the line (schematic).
  tests: {
    wide: { x: 0.03, y: 0.86, w: 0.94, h: 0.03 },
    tall: { x: 0.03, y: 0.756, w: 0.94, h: 0.03 },
    moves: [
      { from: 92500, to: 94500, tall: { x: 0.03, y: 0.516, w: 0.94, h: 0.03 } },
      { from: 103000, to: 104500, tall: { x: 0.03, y: 0.756, w: 0.94, h: 0.03 } },
    ],
  },
  // Typed matter: the net's name, the remainders, the multiples written out.
  side: {
    wide: { x: 0.67, y: 0.06, w: 0.3, h: 0.62 },
    tall: { x: 0.05, y: 0.79, w: 0.9, h: 0.19 },
    moves: [
      { from: 38500, to: 40500, wide: { x: 0.6, y: 0.06, w: 0.37, h: 0.62 }, tall: { x: 0.05, y: 0.71, w: 0.9, h: 0.28 } },
      { from: 92500, to: 94500, tall: { x: 0.05, y: 0.6, w: 0.9, h: 0.39 } },
    ],
  },
  // Digits of x(nP) against n, and the schematic bound. On a phone it takes the plane's place.
  chart: {
    wide: { x: 0.64, y: 0.08, w: 0.31, h: 0.52 },
    tall: { x: 0.12, y: 0.05, w: 0.8, h: 0.4 },
    moves: [],
  },
};

function blendBox(from: Box, to: Box, amount: number): Box {
  return {
    x: from.x + (to.x - from.x) * amount,
    y: from.y + (to.y - from.y) * amount,
    w: from.w + (to.w - from.w) * amount,
    h: from.h + (to.h - from.h) * amount,
  };
}

function blendView(from: View, to: View, amount: number): View {
  return {
    left: from.left + (to.left - from.left) * amount,
    right: from.right + (to.right - from.right) * amount,
    bottom: from.bottom + (to.bottom - from.bottom) * amount,
    top: from.top + (to.top - from.top) * amount,
  };
}

export function panelAt(panel: Panel, time: number, layout: Layout): Box {
  const plan = PANELS[panel];
  let box = plan[layout];

  for (const move of plan.moves) {
    if (time < move.from) break;

    const target = move[layout];

    if (target) box = blendBox(box, target, span(time, move.from, move.to));
  }

  return box;
}

// The plane's camera. It starts on the whole picture and closes in while the nets get finer. It pulls back to the whole
// picture while the circle is drawn, closes in again for the circle's nets, pulls back to both curves, then pulls back
// further for the whole numbers and the example curve.
export const FULL_VIEW: View = { left: -2.6, right: 2.6, bottom: -2.6, top: 2.6 };

export const FAR_VIEW: View = { left: -7.5, right: 8.5, bottom: -8, top: 8 };

const FULL_SIZE = FULL_VIEW.right - FULL_VIEW.left;

// Each run of nets: when it runs, which nets, how the early ones linger (power), and where the camera closes in.
// `reach` keeps the knots apart: the window is reach ÷ c across, so the knots stay about the same distance apart on screen.
// The cubic's window holds both caught knots; the circle's window is on the other side, so the two verdicts sit apart.
const ROOT = Math.sqrt(1.5);

export const NET_RUNS = [
  { start: 6500, end: 12800, first: 1, last: CUBIC_NET, power: 1.6, from: [0, 0], centre: [1.285, 1.285], reach: { wide: 33.6, tall: 26 } },
  { start: 19600, end: 24200, first: CUBIC_NET + 1, last: CIRCLE_TOP, power: 1, from: [-ROOT, ROOT], centre: [-ROOT, ROOT], reach: { wide: 32, tall: 22 } },
] as const;

// Where the circle's verdict is pinned: the middle of its window, on the circle.
export const CIRCLE_MARK = [-ROOT, ROOT] as const;

type NetRun = (typeof NET_RUNS)[number];

// How far a run has got, as a continuous net number: the net shown is its whole part.
export function netProgress(run: NetRun, time: number): number {
  return run.first + (run.last - run.first + 1) * share(time, run.start, run.end) ** run.power;
}

// When net c of a run first shows.
export function netStart(run: NetRun, c: number): number {
  return run.start + (run.end - run.start) * ((c - run.first) / (run.last - run.first + 1)) ** (1 / run.power);
}

function netWindow(run: NetRun, time: number, layout: Layout): View {
  const reach = run.reach[layout];
  const finest = reach / run.last;
  const size = Math.min(FULL_SIZE, Math.max(finest, reach / netProgress(run, time)));
  const amount = Math.min(1, Math.max(0, (FULL_SIZE - size) / (FULL_SIZE - finest)));
  const x = run.from[0] + (run.centre[0] - run.from[0]) * amount;
  const y = run.from[1] + (run.centre[1] - run.from[1]) * amount;

  return { left: x - size / 2, right: x + size / 2, bottom: y - size / 2, top: y + size / 2 };
}

export function cameraAt(time: number, layout: Layout): View {
  const [cubic, circle] = NET_RUNS;

  if (time < cubic.start) return FULL_VIEW;
  if (time < 16500) return netWindow(cubic, time, layout);
  if (time < 18700) return blendView(netWindow(cubic, time, layout), FULL_VIEW, span(time, 16500, 17700));
  if (time < 19600) return blendView(FULL_VIEW, netWindow(circle, time, layout), span(time, 18700, 19600));
  if (time < 31500) return netWindow(circle, time, layout);
  if (time < 38500) return blendView(netWindow(circle, time, layout), FULL_VIEW, span(time, 31500, 33500));

  return blendView(FULL_VIEW, FAR_VIEW, span(time, 39000, 41500));
}

// The net on screen: which run, which net, and how far it has faded in and out. The last net of each run holds, then goes.
export const NET_HOLDS = [{ until: 15000, gone: 15800 }, { until: 24600, gone: 25300 }] as const;

export function netAt(time: number): { run: NetRun; c: number; alpha: number; previous: number } | undefined {
  for (const [index, run] of NET_RUNS.entries()) {
    const hold = NET_HOLDS[index];

    if (!hold || time < run.start || time > hold.gone) continue;

    const c = Math.min(run.last, Math.floor(netProgress(run, time)));
    const shown = span(time, netStart(run, c), netStart(run, c) + 160);

    return { run, c, alpha: fade(time, run.start, run.start + 300, hold.until, hold.gone), previous: c > run.first ? 1 - shown : 0 };
  }

  return undefined;
}

// The proof's schematic pieces: the tests, the two searches, the stretched line and the solution that comes home.
export const TESTS = { drawn: 69800, searchStart: 76500, searchEnd: 83000, allPass: 87000 } as const;

export const STRETCH = { start: 88000, end: 90500 } as const;

export const STAR_RETURN = { start: 109500, end: 111500 } as const;

// The multiples written out, one line each, and when each starts typing.
export const WRITTEN = [
  { n: 1, at: 95800 },
  { n: 2, at: 96600 },
  { n: 3, at: 97500 },
  { n: 4, at: 98500 },
  { n: 5, at: 99700 },
  { n: 6, at: 101000 },
] as const;

// The schematic bound "a constant times B" in the size chart, and how many multiples it shows.
export const BOUND_SLOPE = 6;

export const MULTIPLES_SHOWN = 12;

// The 003 film's timeline: subtitles, transcript scenes, and where each drawing sits on the frame. Times are milliseconds.
// Subtitles are written from the article; $…$ marks a formula, set with Temml on the page.

export type Cue = { at: number; text: string; sources: readonly number[] };

export const CUES = [
  { at: 0, text: 'Some numbers can’t be split into smaller whole factors: 2, 3, 5, 7, 11, … These are the primes.', sources: [] },
  { at: 7000, text: 'Count them as you go and you get a staircase, $\\pi(x)$: one step up at each prime.', sources: [] },
  { at: 12500, text: 'A smooth curve, $\\mathrm{Li}(x)$, follows it. The prime number theorem (1896) says it approximates the count well.', sources: [2, 3] },
  { at: 19500, text: 'How well? The gap between the curve and the staircase is what this paper is about.', sources: [2] },
  { at: 25500, text: 'Riemann’s formula writes the gap as a sum of waves, one for each zero of a function called $\\zeta$ (zeta).', sources: [2, 3] },
  { at: 32500, text: '$\\zeta$ is the sum $1+\\frac{1}{2^{s}}+\\frac{1}{3^{s}}+\\cdots$, fed the points of a plane. Its zeros are where it gives 0: here, where the ink lines meet.', sources: [3] },
  { at: 40500, text: 'Each zero adds one wave. With the first hundred, the waves rebuild every step.', sources: [5] },
  { at: 46500, text: 'How far across a zero sits sets how fast its wave grows: like $x^{\\beta}$ for a zero at $\\beta$.', sources: [2, 3] },
  { at: 53000, text: 'If a zero sat further right, its wave would grow faster, and the staircase could stray far from the curve.', sources: [2] },
  { at: 60500, text: 'Every zero on this map sits at $\\tfrac12$. The Riemann hypothesis says all of them do. Nobody has proved it.', sources: [3, 5] },
  { at: 67500, text: 'Proved before: no zero on the edge at 1 (1896), then a sliver beside it that thins with height. No fixed fence.', sources: [2, 4] },
  { at: 75500, text: 'The paper claims a fence at $\\tfrac78$: no zero to its right, at any height. So no wave grows faster than about $x^{7/8}$.', sources: [1, 2] },
  { at: 83500, text: 'The claimed fence also covers $\\zeta$’s cousins, which count primes in patterns such as $4k+1$.', sources: [1] },
  { at: 89500, text: 'To prove it, the paper treats a whole family of such functions at once, built on the hexagonal grid of Eisenstein integers.', sources: [1] },
  { at: 98000, text: 'Suppose a zero sat past the fence. Then $1/L$, 1 divided by the function, would blow up near it.', sources: [1] },
  { at: 104500, text: 'The paper writes one sum in two ways. The second, it argues, keeps that quantity finite, so the zero cannot be there.', sources: [1] },
  { at: 112500, text: 'Experts are still checking the $\\tfrac78$ proof: it is under review. The page’s “approved” label is for a separate proof: Landau–Siegel zeros, real zeros very close to 1, do not exist.', sources: [16, 17, 18, 19] },
] as const satisfies readonly Cue[];

export const FILM_DURATION = 120000;

// Groups of cues, for the transcript's headings.
export const SCENES = [
  { title: 'The primes and their count', first: 0 },
  { title: 'The gap', first: 3 },
  { title: 'Waves from the zeros of ζ', first: 4 },
  { title: 'Where a zero sits', first: 7 },
  { title: 'What was known', first: 9 },
  { title: 'The claim', first: 11 },
  { title: 'How the proof goes', first: 13 },
  { title: 'Where it stands', first: 16 },
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

export type Layout = 'wide' | 'tall';

// A drawing's place on the frame, as shares of the frame's width and height.
export type Box = { x: number; y: number; w: number; h: number };

// The part of its own plane a drawing shows: real parts across, heights (or counts) up.
export type View = { left: number; right: number; bottom: number; top: number };

export type Panel = 'chart' | 'plane' | 'cousin' | 'lattice' | 'device';

type Move = { from: number; to: number; wide?: Box; tall?: Box; view?: View };

// Where each drawing starts, then each move it makes. A move eases from where the drawing was to where it goes.
const PANELS: Record<Panel, { wide: Box; tall: Box; view: View; moves: readonly Move[] }> = {
  // The number line, the staircase and the curve; later one zero's wave. Each draws to its own scale, so the chart has no moving view.
  chart: {
    wide: { x: 0.08, y: 0.1, w: 0.84, h: 0.42 },
    tall: { x: 0.08, y: 0.12, w: 0.76, h: 0.36 },
    view: { left: 0, right: 100, bottom: 0, top: 30 },
    moves: [
      // The number line starts at mid-height and lowers as the staircase begins to climb.
      { from: 5500, to: 7300, wide: { x: 0.08, y: 0.1, w: 0.84, h: 0.76 }, tall: { x: 0.08, y: 0.12, w: 0.76, h: 0.7 } },
      { from: 25500, to: 28000, wide: { x: 0.06, y: 0.12, w: 0.44, h: 0.72 }, tall: { x: 0.09, y: 0.04, w: 0.76, h: 0.32 } },
      { from: 60500, to: 63000, wide: { x: 0.07, y: 0.2, w: 0.34, h: 0.56 }, tall: { x: 0.09, y: 0.04, w: 0.76, h: 0.3 } },
    ],
  },
  // ζ over the plane: its map, its zeros, the fences. Tall boxes leave room below for the marks and tags at the foot.
  plane: {
    wide: { x: 0.64, y: 0.14, w: 0.32, h: 0.76 },
    tall: { x: 0.2, y: 0.56, w: 0.6, h: 0.36 },
    view: { left: -0.35, right: 1.35, bottom: 3, top: 64 },
    moves: [
      { from: 41000, to: 46000, view: { left: -0.35, right: 1.35, bottom: 3, top: 240 } },
      { from: 46500, to: 50000, view: { left: -0.25, right: 1.25, bottom: 6, top: 24 } },
      { from: 60500, to: 63500, wide: { x: 0.5, y: 0.06, w: 0.44, h: 0.84 }, tall: { x: 0.14, y: 0.42, w: 0.72, h: 0.46 }, view: { left: -0.3, right: 1.3, bottom: 0, top: 240 } },
      { from: 83500, to: 87500, wide: { x: 0.42, y: 0.08, w: 0.24, h: 0.76 }, tall: { x: 0.05, y: 0.08, w: 0.42, h: 0.78 }, view: { left: -0.3, right: 1.3, bottom: 0, top: 30 } },
      { from: 89500, to: 92000, tall: { x: 0.05, y: 0.5, w: 0.42, h: 0.38 } },
      { from: 98000, to: 100500, wide: { x: 0.46, y: 0.06, w: 0.48, h: 0.84 }, tall: { x: 0.12, y: 0.42, w: 0.76, h: 0.46 }, view: { left: -0.25, right: 1.25, bottom: 8, top: 40 } },
      { from: 112500, to: 115000, wide: { x: 0.2, y: 0.08, w: 0.26, h: 0.74 }, tall: { x: 0.05, y: 0.08, w: 0.42, h: 0.72 }, view: { left: -0.3, right: 1.3, bottom: -1, top: 30 } },
    ],
  },
  // A cousin of ζ: the Dirichlet L-function for primes 4k + 1 against 4k + 3. It waits off the frame's right edge.
  cousin: {
    wide: { x: 1.04, y: 0.08, w: 0.24, h: 0.76 },
    tall: { x: 1.04, y: 0.08, w: 0.42, h: 0.78 },
    view: { left: -0.3, right: 1.3, bottom: 0, top: 30 },
    moves: [
      { from: 83500, to: 86500, wide: { x: 0.72, y: 0.08, w: 0.24, h: 0.76 }, tall: { x: 0.53, y: 0.08, w: 0.42, h: 0.78 } },
      { from: 89500, to: 92000, tall: { x: 0.53, y: 0.5, w: 0.42, h: 0.38 } },
      { from: 98000, to: 100500, wide: { x: 1.04, y: 0.08, w: 0.24, h: 0.76 }, tall: { x: 1.04, y: 0.5, w: 0.42, h: 0.38 } },
      { from: 112500, to: 115000, wide: { x: 0.56, y: 0.08, w: 0.26, h: 0.74 }, tall: { x: 0.53, y: 0.08, w: 0.42, h: 0.72 }, view: { left: -0.3, right: 1.3, bottom: -1, top: 30 } },
    ],
  },
  // The Eisenstein integers a + bω, in their own coordinates.
  lattice: {
    wide: { x: 0.05, y: 0.12, w: 0.32, h: 0.72 },
    tall: { x: 0.1, y: 0.05, w: 0.8, h: 0.33 },
    view: { left: -3.2, right: 3.2, bottom: -3.2, top: 3.2 },
    moves: [],
  },
  // The one sum written two ways, as two rows. Schematic.
  device: {
    wide: { x: 0.05, y: 0.24, w: 0.36, h: 0.5 },
    tall: { x: 0.08, y: 0.04, w: 0.84, h: 0.33 },
    view: { left: 0, right: 1, bottom: 0, top: 1 },
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

export function panelAt(panel: Panel, time: number, layout: Layout): { box: Box; view: View } {
  const plan = PANELS[panel];
  let box = plan[layout];
  let view = plan.view;

  for (const move of plan.moves) {
    if (time < move.from) break;

    const amount = span(time, move.from, move.to);
    const target = move[layout];

    if (target) box = blendBox(box, target, amount);
    if (move.view) view = blendView(view, move.view, amount);
  }

  return { box, view };
}

// The hypothetical zero that slides right from the first zero's place, and back. Schematic.
export const FIRST_HEIGHT = 14.134725141734693;

export const DIAL_FROM = 0.5;

export const DIAL_TO = 0.95;

export function dialAt(time: number): number {
  const reach = DIAL_TO - DIAL_FROM;

  return DIAL_FROM + reach * span(time, 53500, 57000) - reach * span(time, 58500, 60300);
}

// Mossinghoff and Trudgian's zero-free region, width 1/(5.573412 ln t) beside the edge (source [4]), drawn for t ≥ 3.
export const CLASSICAL_CONSTANT = 5.573412;

export function classicalWidth(height: number): number {
  return 1 / (CLASSICAL_CONSTANT * Math.log(height));
}

export const CLAIMED_EDGE = 7 / 8;

// How many of the hundred tabled zeros have added their waves, with a fraction for the one coming in.
export function zerosUsed(time: number): number {
  return 100 * span(time, 41000, 46000) ** 1.7;
}

// The supposed zero of the argument, past the fence. Schematic.
export const SUPPOSED = { re: 0.93, im: 27.5 };

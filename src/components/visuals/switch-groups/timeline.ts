import { progress, smooth as ease, mix as between } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

import { settingOf } from './sat';

export type Cue = { at: number; text: string; sources: readonly number[] };

export const CUES = [
  { at: 0, text: 'Take three switches and two rules. Rule one: at least one switch is on. Rule two: at least one switch is off.', sources: [1] },
  { at: 7000, text: 'Try every setting: each switch is on or off, so the choices split 2\u00a0×\u00a02\u00a0×\u00a02\u00a0=\u00a08 ways. Only all-on and all-off break a rule; six obey both.', sources: [1] },
  { at: 15600, text: 'Each new switch doubles the settings to try. With rules of three switches, nobody knows a method fundamentally faster than trying them all.', sources: [1] },
  { at: 24000, text: 'This is 3-SAT. Cook proved in 1971 that a fast method for it would give a fast method for every problem whose solutions can be checked quickly.', sources: [4] },
  { at: 33000, text: 'Cleverer methods only lower the base: about $1.33^n$ steps instead of $2^n$. Each extra switch still multiplies the work by a fixed amount.', sources: [1, 5, 6] },
  { at: 42000, text: 'The Exponential Time Hypothesis (1999) says no method can avoid that: a fixed multiplier above 1 always remains, however clever the method.', sources: [2] },
  { at: 51000, text: 'OpenAI claims a counting method whose multiplier per switch shrinks toward 1 as formulas grow. If it holds, the hypothesis is false.', sources: [1] },
  { at: 60000, text: 'It only takes over beyond $2^{10^{10}}$ switches, a number with billions of digits. Below that, the paper\'s own procedure tries every setting.', sources: [1] },
  { at: 69000, text: 'How it goes. If the switches split into groups with every rule inside one group, each group could be counted alone and the counts multiplied.', sources: [1] },
  { at: 78000, text: 'Real rules cross between groups. The paper writes the count as a polynomial with a dial $T$; at $T=0$ it gives exactly the true count.', sources: [1] },
  { at: 86500, text: 'At $T=1,2,\\ldots,Q$ the rules see other groups only through a few shared summaries. Fix the summaries, and each group is counted alone.', sources: [1] },
  { at: 95500, text: 'A polynomial is pinned down by enough values and slopes. From those at $T=1$ to $Q$, the algorithm recovers its value at $T=0$: the count.', sources: [1] },
  { at: 104500, text: 'Summaries, groups and slopes all cost something. Balancing them, the paper gets $2^{o(n)}$: a multiplier per switch tending to 1.', sources: [1] },
  { at: 112000, text: 'Under review: the examiners, among them the hypothesis\'s own authors, say their involvement "should not be taken as certification". No error has been reported.', sources: [12] },
] as const satisfies readonly Cue[];

export const FILM_DURATION = 120000;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 300);

export const SCENES = [
  { title: 'Counting the settings', first: 0 },
  { title: 'What each switch costs', first: 3 },
  { title: 'The claim, and its catch', first: 6 },
  { title: 'How the claimed proof goes', first: 8 },
  { title: 'Where it stands', first: 13 },
] as const;


export type Layout = 'wide' | 'tall';

export type Box = { x: number; y: number; w: number; h: number };

// The board (switches and rules) and the panel beside or under it, as shares of the frame.
export function boxesFor(layout: Layout): { board: Box; panel: Box } {
  return layout === 'wide'
    ? { board: { x: 0.035, y: 0.06, w: 0.45, h: 0.88 }, panel: { x: 0.53, y: 0.06, w: 0.44, h: 0.88 } }
    : { board: { x: 0.04, y: 0.02, w: 0.92, h: 0.4 }, panel: { x: 0.04, y: 0.45, w: 0.92, h: 0.53 } };
}

export const ADDED = [0, 0, 0, 16000, 19600, 21200] as const;

export const TREE_ROWS = [7400, 8400, 9400, 16600] as const;

// The eight walks down the tree, one per setting, in the order of `LEDGER`; the first is slow.
export const WALKS = Array.from({ length: 8 }, (_, leaf) => {
  const start = leaf === 0 ? 10300 : 11700 + (leaf - 1) * 400;

  return { start, end: start + (leaf === 0 ? 900 : 300) };
});

export const WALKING = { from: 10300, to: 15600 } as const;

export function walkAt(time: number): number {
  if (time < WALKING.from || time >= WALKING.to) return -1;

  let current = 0;

  for (const [leaf, walk] of WALKS.entries()) {
    if (time >= walk.start) current = leaf;
  }

  return current;
}

// How far down the tree a walk's mark has come, in rows: 0 at the start, 3 at its end.
export function depthOf(time: number, leaf: number): number {
  const walk = WALKS[leaf];

  return walk ? 3 * progress(time, walk.start, walk.end) : 0;
}

// Whether switch `index` (0 to 2) is on during the walks. A switch takes the walk's side
// once the mark has passed its row, and keeps the last walk's side until then; all start off.
export function walkedOn(time: number, index: number): boolean {
  const leaf = walkAt(time);

  if (leaf < 0) return false;

  const source = depthOf(time, leaf) >= index + 1 ? leaf : leaf - 1;

  return source >= 0 && (settingOf(source, 3)[index] ?? false);
}

export const REGROUP = { from: 70000, to: 72600 } as const;

export const GROUP_GAP = 1.2;

// The spacing of the regrouped board, in board shares.
export const GROUP_STEP = 0.88 / (11 + 2 * GROUP_GAP);

// How far switch `index` (0-based) has arrived: the first three are there from the start.
// Switches 7 to 12 arrive once switches 5 and 6 have slid past their places.
export function arrivalOf(time: number, index: number): number {
  const at = index < 6 ? ADDED[index] ?? 0 : REGROUP.from + 2300 + (index - 6) * 200;

  return at === 0 ? 1 : ease(time, at, at + (index < 6 ? 900 : 600));
}

// Where switch `index` sits on the board, in the board's own shares.
export function pinPlace(time: number, index: number): { u: number; v: number } {
  const regroup = ease(time, REGROUP.from, REGROUP.to);
  let count = 0;

  for (let earlier = 0; earlier < 6; earlier += 1) {
    count += arrivalOf(time, earlier);
  }

  const rowU = 0.5 + (index - (count - 1) / 2) * 0.15;
  const groupU = 0.06 + (index + GROUP_GAP * Math.floor(index / 4)) * GROUP_STEP;

  return { u: between(index < 6 ? rowU : groupU, groupU, regroup), v: between(0.5, 0.52, regroup) };
}

// The dial T: its knob's value over time (0 until the summaries, then 1, 2 and 3).
export function dialAt(time: number): number {
  return ease(time, 86800, 87800) + ease(time, 92500, 93100) + ease(time, 94000, 94600);
}

// Where the claimed curve leaves the ×2 line, as a share of the chart's width: drawn loosely first, then moved past the threshold.
export function bendAt(time: number): number {
  return between(0.5, THRESHOLD_U, ease(time, 60300, 62600));
}

// The threshold's place on the broken axis, as a share of the chart's width.
export const THRESHOLD_U = 0.78;

export const BREAK_U = 0.68;

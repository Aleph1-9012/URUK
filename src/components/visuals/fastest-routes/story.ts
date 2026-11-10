import { createTimeline } from '../../plate/timeline';
import { mix, progress, smooth } from '../../../lib/animation';
import type { Box } from './drawing';

export const CUES = [
  { at: 0, title: 'Random travel times', text: 'Give every edge of a square grid a random travel time and ask how long it takes to get from one point to another along the fastest route.', sources: [1] },
  { at: 9000, title: 'First-passage percolation', text: 'This is first-passage percolation, introduced by Hammersley and Welsh in 1965 as a model of fluid seeping through rock, and it is the simplest random metric there is.', sources: [1] },
  { at: 19750, title: 'Fastest routes merge', text: 'Its fastest routes, the geodesics, behave like straight lines on a large scale but wiggle randomly.', sources: [1] },
  { at: 28750, title: 'The two-sided hunt', text: 'Can there be a geodesic that extends infinitely far in both directions, a "bigeodesic", every finite piece of which is a fastest route?', sources: [1] },
  { at: 39750, title: 'The conjecture', text: 'In the plane the answer is conjectured to be no, for any continuous distribution of edge times.', sources: [1] },
  { at: 46750, title: 'The limit of the growing ball', text: 'The conjecture is tied to the geometry of the limit shape, the asymptotic shape of the set reachable in time $t$, about which almost nothing is known rigorously.', sources: [1] },
  { at: 57250, title: 'Two claimed theorems', text: 'On 24 September 2026 OpenAI posted two papers: one claims that there are no bigeodesics at all, under a mild moment condition and with no assumption on the limit shape; the other claims that the limit shape for exponential edge times is strictly convex and smooth.', sources: [1, 2] },
  { at: 73750, title: 'Where the proofs stand', text: 'As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs.', sources: [1] },
] as const;

export const FILM_DURATION = 81750;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export const BRANCH_RADII = [5, 10, 20, 40, 60, 80, 95] as const;

export const HUNT_BEATS = [28750, 31500, 34250, 37000] as const;

export function cameraProgress(time: number): number {
  return smooth(time, 9000, 11500);
}

export function ballTime(time: number): number {
  const beats = [
    { at: 9000, value: 0 },
    { at: 12000, value: 10 },
    { at: 14000, value: 20 },
    { at: 16000, value: 30 },
    { at: 18000, value: 40 },
  ];

  if (time <= 9000) return 0;

  for (let index = 1; index < beats.length; index++) {
    const first = beats[index - 1];
    const second = beats[index];

    if (!first || !second) throw new Error('The ball clock has adjacent declared beats.');
    if (time <= second.at) return mix(first.value, second.value, progress(time, first.at, second.at));
  }

  return 40;
}

export function treeProgress(time: number): number {
  return progress(time, 19750, 27500);
}

export function branchRadius(time: number): number {
  const index = Math.min(BRANCH_RADII.length - 1, Math.floor(progress(time, 21250, 28250) * BRANCH_RADII.length));
  const radius = BRANCH_RADII[index];

  if (radius === undefined) throw new Error('The branch readout selects one declared radius.');

  return radius;
}

export function huntIndex(time: number): number {
  let index = 0;

  for (const [position, at] of HUNT_BEATS.entries()) {
    if (time >= at) index = position;
  }

  return index;
}

export function huntProgress(time: number): number {
  const start = HUNT_BEATS[huntIndex(time)];

  if (start === undefined) throw new Error('The finite hunt has a declared starting beat.');

  return progress(time, start, start + 2150);
}

export function outlineProgress(time: number): number {
  return smooth(time, 46750, 48750);
}

export function claimProgress(time: number): number {
  return smooth(time, 57250, 60750);
}

export function strikeProgress(time: number): number {
  return smooth(time, 65000, 68000);
}

export function layout(width: number, height: number, _time: number): { stage: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (tall) {
    return {
      stage: { x: width * .035, y: height * .025, w: width * .93, h: height * .58 },
      panel: { x: width * .05, y: height * .635, w: width * .90, h: height * .35 },
      tall,
    };
  }

  return {
    stage: { x: width * .025, y: height * .055, w: width * .59, h: height * .84 },
    panel: { x: width * .65, y: height * .09, w: width * .32, h: height * .82 },
    tall,
  };
}

import { createTimeline } from '../../plate/timeline';
import { progress, smooth } from '../../../lib/animation';
import type { Box } from './drawing';

export const CUES = [
  { at: 0, title: 'People and willing pairs', text: 'Take a network of people and the pairs who are willing to work together, and pair up as many as possible, each person in at most one pair.', sources: [1] },
  { at: 9000, title: 'Maximum matching', text: 'This is maximum matching, one of the oldest problems in algorithms.', sources: [1] },
  { at: 16000, title: 'An alternating path', text: 'Jack Edmonds solved it in polynomial time in 1965, with the paper that first proposed polynomial time as the meaning of "efficient"; Micali and Vazirani brought the time down to about $m\\sqrt n$ for $m$ edges and $n$ people in 1980.', sources: [1] },
  { at: 30500, title: 'The two-kind case', text: 'For sparse networks, where $m$ is a few times $n$, that bound stood for forty-six years, while the easier case with two kinds of people, the bipartite case, fell to almost-linear time in 2022 through a revolution in network-flow algorithms.', sources: [1] },
  { at: 45750, title: 'An odd ring', text: 'The obstacle in general networks is odd cycles.', sources: [1] },
  { at: 53750, title: 'The claimed almost-linear bound', text: 'On 24 September 2026 OpenAI posted an 86-page paper claiming an algorithm that runs in time $(n+m)^{1+o(1)}$ on every graph: essentially the time it takes to read the input.', sources: [1] },
  { at: 64250, title: 'Where the proof stands', text: 'As of 3 November 2026 no computer scientist has said publicly that they have checked the proof, and the release contains no Lean formalization of it.', sources: [1] },
] as const;

export const FILM_DURATION = 74000;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export function greedyProgress(time: number): number {
  return progress(time, 1500, 7500);
}

export function augmentReveal(time: number): number {
  return smooth(time, 16500, 20000);
}

export function flipProgress(time: number): { oldBond: number; newBonds: number; moving: boolean; complete: boolean } {
  return {
    oldBond: 1 - smooth(time, 20000, 21000),
    newBonds: smooth(time, 21000, 23000),
    moving: time >= 20000 && time < 23000,
    complete: time >= 23000,
  };
}

export function blossomProgress(time: number): number {
  return smooth(time, 48250, 49750) * (1 - smooth(time, 51500, 53500));
}

export function bipartiteProgress(time: number): number {
  return smooth(time, 30500, 31500) * (1 - smooth(time, 44500, 45750));
}

export function classicalProgress(time: number): number {
  return progress(time, 16000, 19500);
}

export function inputProgress(time: number): number {
  return progress(time, 30500, 33500);
}

export function claimProgress(time: number): number {
  return progress(time, 53750, 57500);
}

export function layout(width: number, height: number, _time: number): { stage: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (tall) {
    return {
      stage: { x: width * .035, y: height * .02, w: width * .93, h: height * .40 },
      panel: { x: width * .05, y: height * .455, w: width * .90, h: height * .53 },
      tall,
    };
  }

  return {
    stage: { x: width * .025, y: height * .055, w: width * .54, h: height * .84 },
    panel: { x: width * .60, y: height * .07, w: width * .37, h: height * .86 },
    tall,
  };
}

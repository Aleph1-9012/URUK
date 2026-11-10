import { createTimeline } from '../../plate/timeline';
import { mix, progress, smooth } from '../../../lib/animation';
import type { Box } from './drawing';

export const CUES = [
  { at: 0, title: 'One-hour jobs', text: 'You have a list of tasks that each take one hour, some of which cannot start until others finish, and a few identical workers.', sources: [1] },
  { at: 8250, title: 'The shortest schedule', text: 'How quickly can everything be done?', sources: [1] },
  { at: 13250, title: 'The two-worker rule', text: 'With two workers this is easy, by an algorithm of Coffman and Graham from 1972.', sources: [1] },
  { at: 23250, title: 'Any number of workers', text: 'With the number of workers as part of the input it is NP-complete, Ullman showed in 1975, which is the standard way of saying no efficient algorithm is expected.', sources: [1] },
  { at: 33500, title: 'Exactly three workers', text: 'In between sits the case of exactly three workers, which Garey and Johnson listed in 1979 among the open problems in their book on NP-completeness, and which stayed there for forty-seven years: the last problem from their list whose status had not moved.', sources: [1, 3] },
  { at: 49250, title: 'Faster exact search', text: 'Special cases were solved, approximation schemes were found, and in 2025 Nederlof, Swennenhuis and Węgrzycki gave the first exact algorithm faster than trying everything, in subexponential time.', sources: [1, 5] },
  { at: 61500, title: 'The claimed algorithm', text: 'On 24 September 2026 OpenAI posted a paper claiming a polynomial-time algorithm for three machines, with a running-time exponent of $150{,}020$.', sources: [1] },
  { at: 70500, title: 'Where the proof stands', text: 'As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof.', sources: [1, 2] },
] as const;

export const FILM_DURATION = 77250;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export function jobProgress(time: number): number { return progress(time, 500, 4250); }

export function dependencyProgress(time: number): number { return progress(time, 4250, 7500); }

export function gridProgress(time: number): number { return progress(time, 8250, 11500); }

export function readyLift(time: number): number { return smooth(time, 8750, 11500); }

export function labelProgress(time: number): number { return progress(time, 14500, 16500); }

export function twoLaneProgress(time: number): number { return progress(time, 16500, 21500); }

export function returnProgress(time: number): number { return smooth(time, 33500, 35000); }

export function threeLaneProgress(time: number): number { return progress(time, 35250, 40250); }

export function comparisonProgress(time: number): number { return smooth(time, 40250, 41500); }

export function optimumProgress(time: number): number { return progress(time, 41500, 46500); }

export function claimProgress(time: number): number { return progress(time, 61500, 64500); }

export function laneCount(time: number): number {
  if (time < 33500) return mix(3, 2, smooth(time, 13250, 14500));

  return mix(2, 3, smooth(time, 33500, 35000));
}

export function schedulePhase(time: number): 'empty' | 'two' | 'return' | 'three' | 'comparison' {
  if (time < 13250) return 'empty';
  if (time < 33500) return 'two';
  if (time < 35000) return 'return';
  if (time < 40250) return 'three';

  return 'comparison';
}

export function layout(width: number, height: number, _time: number): { stage: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (tall) return { stage: { x: width * .03, y: height * .015, w: width * .94, h: height * .38 }, panel: { x: width * .05, y: height * .42, w: width * .90, h: height * .56 }, tall };

  return { stage: { x: width * .025, y: height * .025, w: width * .40, h: height * .94 }, panel: { x: width * .465, y: height * .035, w: width * .51, h: height * .93 }, tall };
}

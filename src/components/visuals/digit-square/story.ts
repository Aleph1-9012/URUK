import { createTimeline } from '../../plate/timeline';
import { progress, smooth } from '../../../lib/animation';
import type { Box } from './drawing';

export const CUES = [
  { at: 0, title: 'The digit square', text: 'The method taught in school multiplies two $n$-digit numbers in about $n^{2}$ steps: every digit of one number meets every digit of the other.', sources: [1] },
  { at: 10000, title: 'A faster way', text: 'In 1960 Kolmogorov conjectured that nothing fundamentally faster was possible, and within a week his student Karatsuba found a way to do it in about $n^{1.585}$ steps.', sources: [1, 3] },
  { at: 20250, title: 'Three instead of four', text: 'Karatsuba and Ofman 1962, $O(n^{\\log_23})\\approx O(n^{1.585})$, by splitting each number in half and using three half-size multiplications instead of four.', sources: [1] },
  { at: 32250, title: 'The logarithmic era', text: 'A decade of improvements followed, and in 1971 Schönhage and Strassen reached $n\\log n\\log\\log n$ using the fast Fourier transform, and proposed that $n\\log n$ was the true answer.', sources: [1, 4] },
  { at: 42750, title: 'Work on every level', text: 'In 2019 Harvey and van der Hoeven finally achieved $n\\log n$, and the field expected that to be the end: the Fourier transform does $n$ work on each of $\\log n$ levels, and no one saw how to avoid any of it.', sources: [1, 5] },
  { at: 55500, title: 'The claimed improvement', text: 'On 23 September 2026 OpenAI posted a paper claiming an algorithm that runs in time $n(\\log n)^{1-\\kappa}$ with $\\kappa=2^{-182}$.', sources: [1] },
  { at: 63500, title: 'The machine model', text: 'The model matters: on machines with random access to memory, multiplication is known to be faster, and those results say nothing about this one.', sources: [1] },
  { at: 72750, title: 'How small is the saving?', text: 'The saving is unimaginably small, and that is beside the point: if the paper is right, $n\\log n$ is not a wall, and a conjecture that stood for fifty-five years is false.', sources: [1] },
  { at: 83500, title: 'Where the proof stands', text: 'As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof.', sources: [1, 2] },
] as const;

export const FILM_DURATION = 90250;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export function schoolProgress(time: number): number { return progress(time, 500, 5500); }

export function diagonalProgress(time: number): number { return smooth(time, 6000, 9000); }

export function schoolReturnProgress(time: number): number { return smooth(time, 10000, 11500); }

export function quarterProgress(time: number): number { return smooth(time, 11500, 14000); }

export function middleProgress(time: number): number { return smooth(time, 20250, 22500); }

export function recursionLevel(time: number): number {
  if (time <= 24500) return 0;
  if (time < 26250) return progress(time, 24500, 26250);
  if (time <= 28250) return 1;

  return 1 + progress(time, 28250, 30000);
}

export function leafTravel(time: number): number { return smooth(time, 32250, 37500); }

export function historyProgress(time: number): number { return progress(time, 32250, 37500); }

export function modernProgress(time: number): number { return progress(time, 42750, 45000); }

export function butterflyProgress(time: number): number { return progress(time, 45000, 52000); }

export function zoomProgress(time: number): number { return smooth(time, 55500, 58000); }

export function claimProgress(time: number): number { return progress(time, 58000, 61000); }

export function tapeProgress(time: number): number { return progress(time, 63500, 66000); }

export function layout(width: number, height: number, _time: number): { stage: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (tall) return { stage: { x: width * .03, y: height * .018, w: width * .94, h: height * .45 }, panel: { x: width * .05, y: height * .49, w: width * .90, h: height * .49 }, tall };

  return { stage: { x: width * .025, y: height * .03, w: width * .40, h: height * .94 }, panel: { x: width * .46, y: height * .04, w: width * .515, h: height * .92 }, tall };
}

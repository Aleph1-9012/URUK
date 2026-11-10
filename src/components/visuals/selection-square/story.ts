import { createTimeline } from '../../plate/timeline';
import { mix, progress, smooth } from '../../../lib/animation';
import type { Box, ChartView } from './drawing';

export const CUES = [
  { at: 0, title: 'Numbers and a target', text: 'Here are $n$ whole numbers and a target.', sources: [1] },
  { at: 6000, title: 'Try a selection', text: 'Is there a selection of them that adds up to the target exactly?', sources: [1] },
  { at: 11000, title: 'Subset Sum', text: 'This is Subset Sum, one of the first problems proved NP-complete, in Karp\'s 1972 list under the name Knapsack.', sources: [1] },
  { at: 18250, title: 'Every selection', text: 'Trying every selection takes $2^{n}$ steps.', sources: [1] },
  { at: 27250, title: 'Meet in the middle', text: 'In 1974 Horowitz and Sahni cut that to about $2^{n/2}$: split the numbers in half, list the sums of each half, and look for two that add to the target.', sources: [1, 3] },
  { at: 41250, title: 'The reference exponent', text: 'For fifty-two years nobody improved the exponent $1/2$ for arbitrary inputs, and that number became the reference point of exact algorithms and a baseline in cryptography.', sources: [1] },
  { at: 52250, title: 'The wrong sum, the right remainder', text: 'Reducing modulo a prime shrinks the lists but creates false positives, subsets with the right residue and the wrong sum, which must be found and removed.', sources: [1] },
  { at: 62000, title: 'Estimate and subtract', text: 'The new paper\'s organising idea is to do both halves of that trade: estimate a modular count by sampling, and enumerate the false positives exactly.', sources: [1] },
  { at: 71500, title: 'The claimed exponent', text: 'On 4 October 2026 OpenAI posted a paper claiming $O(2^{0.49n})$.', sources: [1] },
  { at: 78500, title: 'An independent human paper', text: 'Three days later Baitian Li and Lixi Ye posted an independent human paper reaching $O(2^{0.499999n})$ by a different method.', sources: [4] },
  { at: 86000, title: 'How large is the gain?', text: '$2^{0.49n}$ is smaller than $2^{n/2}$ by the exponential factor $2^{0.01n}$.', sources: [1] },
  { at: 93000, title: 'Where the proof stands', text: 'As of 3 November 2026 no computer scientist has said publicly that they have checked OpenAI\'s proof, and the release contains no Lean formalization for this family.', sources: [1, 8] },
] as const;

export const FILM_DURATION = 103500;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export function trialIndex(time: number): number {
  return Math.min(2, Math.floor(progress(time, 6000, 11000) * 3));
}

export function splitProgress(time: number): number { return smooth(time, 18250, 21000); }

export function fillProgress(time: number): number { return progress(time, 21000, 26750); }

export function sortProgress(time: number): number { return smooth(time, 27750, 31500); }

export function walkProgress(time: number): number { return progress(time, 31500, 39500); }

export function aliasProgress(time: number): number { return progress(time, 52750, 56500); }

export function strikeProgress(time: number): number { return progress(time, 62500, 68500); }

export function chartProgress(time: number): number { return progress(time, 41250, 44250); }

export function zoomProgress(time: number): number { return smooth(time, 71500, 73500); }

export function claimProgress(time: number): number { return progress(time, 71500, 75500); }

export function humanProgress(time: number): number { return progress(time, 78500, 81000); }

export function chartView(time: number): ChartView {
  const amount = zoomProgress(time);

  return { minN: mix(0, 150, amount), maxN: 200, minLog: mix(0, 70, amount), maxLog: mix(200, 100, amount) };
}

export function layout(width: number, height: number, _time: number): { stage: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (tall) return { stage: { x: width * .03, y: height * .018, w: width * .94, h: height * .60 }, panel: { x: width * .05, y: height * .64, w: width * .90, h: height * .34 }, tall };

  return { stage: { x: width * .025, y: height * .03, w: width * .49, h: height * .94 }, panel: { x: width * .55, y: height * .05, w: width * .42, h: height * .90 }, tall };
}

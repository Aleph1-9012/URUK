import { createTimeline } from '../../plate/timeline';
import { progress, smooth } from '../../../lib/animation';
import type { Box } from './drawing';

export const CUES = [
  { at: 0, title: 'Every pair', text: 'Place $n$ points in space and measure every distance between two of them.', sources: [1] },
  { at: 8000, title: 'How few?', text: 'How few different values can you get?', sources: [1] },
  { at: 13000, title: 'The grid', text: 'Paul Erdős asked this in 1946 and observed that a cubic grid of side $t$, with $n=t^{3}$ points, has only about $t^{2}=n^{2/3}$ distinct distances, since every squared distance is an integer below $3t^{2}$; in dimension $d$ the grid gives $n^{2/d}$.', sources: [1] },
  { at: 27500, title: 'Nothing does better?', text: 'He conjectured that nothing does better.', sources: [1] },
  { at: 34500, title: 'The plane', text: 'In the plane the question became one of the most famous in discrete geometry, and Guth and Katz settled it up to a logarithm in 2015 with polynomial partitioning.', sources: [1] },
  { at: 45000, title: 'The exponent ladder', text: 'In three and more dimensions the known lower bounds were far from the grid: Clarkson and others got close to $\\sqrt n$ in 1990, Aronov, Pach, Sharir and Tardos reached $n^{77/141}$, Solymosi and Vu built recurrences giving $n^{0.5643}$, and in August 2026 Tidor, Yu and Zakharov reached $n^{2/3-o(1)}$ in three dimensions, the grid exponent up to a subpolynomial loss.', sources: [1, 2, 3] },
  { at: 66000, title: 'A constant factor', text: 'On 23 September 2026 OpenAI posted a paper claiming the conjecture with a constant factor in every dimension $d\\ge3$.', sources: [1] },
  { at: 74000, title: 'The ratio matters', text: 'The paper is explicit that $n^{2/d-o(1)}$ does not give the theorem: the ratio $|\\Delta(P)|/n^{2/d}$ could still tend to zero more slowly than every negative power of $n$.', sources: [1] },
  { at: 83500, title: 'Where the proof stands', text: 'As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof.', sources: [1, 5] },
] as const;

export const FILM_DURATION = 90250;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export function nodeProgress(time: number): number { return progress(time, 250, 4000); }

export function pairProgress(time: number): number { return progress(time, 4000, 7000); }

export function tallyProgress(time: number): number { return progress(time, 13000, 25000); }

export function randomProgress(time: number): number { return smooth(time, 27500, 29500) * (1 - smooth(time, 34500, 36000)); }

export function flattenProgress(time: number): number { return smooth(time, 34500, 37500) * (1 - smooth(time, 40500, 44500)); }

export function ladderProgress(time: number): number { return progress(time, 45000, 63000); }

export function claimProgress(time: number): number { return progress(time, 66000, 69500); }

export function ratioProgress(time: number): number { return progress(time, 74000, 79500); }

export function cameraAngle(time: number): number { return .41 + time / 1000 * .018; }

export function layout(width: number, height: number, _time: number): { stage: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (tall) return { stage: { x: width * .03, y: height * .018, w: width * .94, h: height * .45 }, panel: { x: width * .04, y: height * .48, w: width * .92, h: height * .50 }, tall };

  return { stage: { x: width * .025, y: height * .03, w: width * .46, h: height * .90 }, panel: { x: width * .52, y: height * .03, w: width * .45, h: height * .90 }, tall };
}

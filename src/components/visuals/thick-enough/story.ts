import { createTimeline } from '../../plate/timeline';
import { progress, smooth } from '../../../lib/animation';
import type { Box } from './drawing';

export const CUES = [
  { at: 0, title: 'A constant gap', text: 'An arithmetic progression is a run of numbers with a constant gap, such as $5,8,11,14$.', sources: [1] },
  { at: 6000, title: 'Thick enough', text: 'Paul Erdős asked whether every set of positive integers that is "not too thin" must contain such runs of every length, and he made "not too thin" precise in a way that covers the prime numbers: the reciprocals of the set\'s members should add up to infinity.', sources: [1, 2] },
  { at: 22000, title: 'The primes', text: 'For the primes it also diverges, a fact Euler proved in 1737, even though primes become rarer and rarer.', sources: [4] },
  { at: 29000, title: 'A thin infinite set', text: 'The powers of two show that an infinite set can avoid progressions completely.', sources: [2] },
  { at: 37000, title: 'A largest small set', text: 'Small values can be found by exhaustive search: $r_3(9)=5$, and $r_3(14)=8$, attained for example by $\\{1,2,4,5,10,11,13,14\\}$.', sources: [5] },
  { at: 46000, title: 'Trying the missing numbers', text: 'Every set of nine numbers from $[14]$ contains three in progression.', sources: [5] },
  { at: 55000, title: 'Doubling blocks', text: 'Split the positive integers into blocks $[2^{m},2^{m+1})$, each twice as long as the one before.', sources: [1] },
  { at: 64000, title: 'The reciprocal bound', text: 'If that series converges, every progression-free set has a finite reciprocal sum, which is Erdős\'s conjecture read backwards.', sources: [1] },
  { at: 72250, title: 'Shrinking is not enough', text: 'Knowing only that $r_k(N)/N$ tends to zero, which is Szemerédi\'s theorem, is not enough.', sources: [1, 2] },
  { at: 78250, title: 'The claimed decay', text: 'On 23 September 2026 OpenAI posted a 198-page paper claiming the full answer, yes, as a corollary of a much stronger statement about how large a set can be while avoiding a progression.', sources: [1] },
  { at: 90000, title: 'Where the proof stands', text: 'As of 17 October 2026 no mathematician has said publicly that they have checked the proof.', sources: [1] },
] as const;

export const FILM_DURATION = 96250;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export function lineProgress(time: number): number { return progress(time, 250, 2000); }

export function progressionProgress(time: number): number { return progress(time, 2000, 4500); }

export function primeProgress(time: number): number { return progress(time, 6000, 13500); }

export function primeGaugeProgress(time: number): number { return progress(time, 6500, 19000); }

export function gaugeCompression(time: number): number { return smooth(time, 22000, 24500); }

export function powersProgress(time: number): number { return smooth(time, 29000, 32500); }

export function shortenProgress(time: number): number { return smooth(time, 37000, 39500); }

export function setProgress(time: number): number { return progress(time, 39500, 42000); }

export function completionFrame(time: number): { index: number; progress: number } {
  const position = Math.max(0, Math.min(5.999999, (time - 46500) / 1250));

  return { index: Math.floor(position), progress: position - Math.floor(position) };
}

export function blockProgress(time: number): number { return smooth(time, 55000, 59000); }

export function stackProgress(time: number): number { return progress(time, 64000, 68500); }

export function unstackProgress(time: number): number { return smooth(time, 72250, 75250); }

export function envelopeProgress(time: number): number { return progress(time, 78250, 84250); }

export function layout(width: number, height: number, _time: number): { stage: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (tall) return { stage: { x: width * .03, y: height * .02, w: width * .94, h: height * .60 }, panel: { x: width * .04, y: height * .65, w: width * .92, h: height * .32 }, tall };

  return { stage: { x: width * .03, y: height * .025, w: width * .94, h: height * .62 }, panel: { x: width * .04, y: height * .67, w: width * .92, h: height * .29 }, tall };
}

import { createTimeline } from '../../plate/timeline';
import { progress, smooth } from '../../../lib/animation';
import type { Box } from './drawing';

export const CUES = [
  { at: 0, title: 'Dots and arrows', text: 'Draw any number of dots and join some pairs with arrows, never two arrows between the same pair and never an arrow from a dot to itself.', sources: [1] },
  { at: 8750, title: 'One step and two', text: 'From a dot you can reach some dots in one step along the arrows, and some further dots in exactly two steps.', sources: [1] },
  { at: 17750, title: 'The dot that holds', text: 'Around 1990 Paul Seymour conjectured that in every such picture there is a dot whose two-step set is at least as large as its one-step set.', sources: [1] },
  { at: 28750, title: 'Opposite arrows matter', text: 'The exclusion of opposite arcs is essential: two vertices pointing at each other each have one out-neighbour and no second neighbour.', sources: [1] },
  { at: 37500, title: 'Try to remove the holders', text: 'The content of the conjecture is that no oriented graph can be arranged so that every vertex\'s second neighbourhood is strictly smaller than its first.', sources: [1] },
  { at: 51500, title: 'A fraction of the target', text: 'The statement takes a sentence; the proof resisted every attack for thirty-five years, with the best general result guaranteeing only about $0.716$ of the two-step dots the conjecture asks for.', sources: [1] },
  { at: 63500, title: 'The claimed proof', text: 'On 23 September 2026 OpenAI posted a fifteen-page proof of the full conjecture, together with a Lean formalization that the release\'s catalogue lists as complete.', sources: [1, 2] },
  { at: 74000, title: 'Where the proof stands', text: 'As of 2 November 2026 no mathematician has said publicly that they have checked the proof.', sources: [1, 11] },
] as const;

export const FILM_DURATION = 80250;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export const FLIPS = [
  { start: 38000, end: 39250, focus: 0 },
  { start: 41000, end: 42250, focus: 3 },
  { start: 44000, end: 45250, focus: 7 },
  { start: 47000, end: 48250, focus: 5 },
] as const;

export type SelectedState = { index: number; nextIndex: null; turning: false; turnProgress: 0 } | { index: number; nextIndex: number; turning: true; turnProgress: number };

export function selectedState(time: number): SelectedState {
  for (let index = 0; index < FLIPS.length; index++) {
    const flip = FLIPS[index];

    if (!flip) throw new Error('Every adversary move has its fixed turn interval.');
    if (time < flip.start) return { index, nextIndex: null, turning: false, turnProgress: 0 };
    if (time < flip.end) return { index, nextIndex: index + 1, turning: true, turnProgress: smooth(time, flip.start, flip.end) };
  }

  return { index: FLIPS.length, nextIndex: null, turning: false, turnProgress: 0 };
}

export function focusAt(time: number): number | null {
  if (time < 8750) return null;
  if (time < 11750) return 0;
  if (time < 14750) return 1;
  if (time < 37500) return 8;

  if (time < 50000) {
    for (let index = FLIPS.length - 1; index >= 0; index--) {
      const flip = FLIPS[index];

      if (flip && time >= flip.start) return flip.focus;
    }

    return FLIPS[0].focus;
  }

  return 8;
}

export function arrowProgress(time: number): number { return progress(time, 500, 8000); }

export function sealProgress(time: number): number { return progress(time, 17750, 20250); }

export function insetProgress(time: number): number {
  return smooth(time, 28750, 30250) * (1 - smooth(time, 35500, 37500));
}

export function ruleProgress(time: number): number { return progress(time, 52000, 54500); }

export function claimProgress(time: number): number { return progress(time, 63500, 66500); }

export function layout(width: number, height: number, _time: number): { stage: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (tall) return { stage: { x: width * .03, y: height * .015, w: width * .94, h: height * .48 }, panel: { x: width * .05, y: height * .52, w: width * .90, h: height * .46 }, tall };

  return { stage: { x: width * .025, y: height * .025, w: width * .53, h: height * .94 }, panel: { x: width * .59, y: height * .045, w: width * .385, h: height * .90 }, tall };
}

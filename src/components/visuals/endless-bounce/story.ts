import { createTimeline } from '../../plate/timeline';
import { smooth } from '../../../lib/animation';
import type { Box } from './drawing';
import type { TableKey } from './math';

export const CUES = [
  { at: 0, title: 'One ball in a triangle', text: 'Roll a frictionless ball inside a triangle and let it bounce forever.', sources: [1] },
  { at: 8000, title: 'Time, area and directions', text: 'Does it eventually pass through every region in every direction, spending time in proportion to size?', sources: [1] },
  { at: 16000, title: 'Rational angles', text: 'For triangles whose angles are rational multiples of $\\pi$, the answer is no in a precise sense: the reflections generate only finitely many directions, so a ball launched one way explores only a finite set of directions.', sources: [1] },
  { at: 29750, title: 'An irrational triangle', text: 'For an irrational triangle the ball\'s direction wanders through a continuum, and ergodicity on the whole phase space was expected but never proved for a single explicit triangle without an approximation condition.', sources: [1] },
  { at: 43250, title: 'What one run can show', text: 'Numerical experiments disagreed with one another, some suggesting mixing in irrational right triangles and others suggesting the opposite.', sources: [1] },
  { at: 52250, title: 'The two claimed results', text: 'On 25 September 2026 OpenAI posted a short paper claiming ergodicity for every irrational triangle, and on 5 October a second claiming weak mixing.', sources: [1, 2] },
  { at: 62250, title: 'The flat double', text: 'Glue two oppositely oriented copies of the triangle along corresponding sides to form an oriented flat surface $M$, regular across the sides, with cone points of angles $2\\alpha,2\\beta,2\\gamma$ at the vertices, on which reflection becomes straight continuation.', sources: [1] },
  { at: 77500, title: 'Why irrationality matters', text: 'The irrationality assumption is sharp for the full phase space, by the finite-group argument above.', sources: [1] },
  { at: 84500, title: 'The claim\'s limits', text: 'Strong mixing is not claimed, nor are polygons with more than three sides.', sources: [1, 2] },
  { at: 91500, title: 'Where the proofs stand', text: 'As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs.', sources: [1] },
] as const;

export const FILM_DURATION = 99500;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export const MORPHS = [
  { start: 16000, end: 18500, from: 'irrational', to: 'equilateral' },
  { start: 22750, end: 25000, from: 'equilateral', to: 'right_isosceles' },
  { start: 29750, end: 31750, from: 'right_isosceles', to: 'irrational' },
  { start: 77500, end: 78750, from: 'irrational', to: 'equilateral' },
  { start: 84500, end: 85750, from: 'equilateral', to: 'irrational' },
] as const satisfies readonly { start: number; end: number; from: TableKey; to: TableKey }[];

export function tableAt(time: number): { key: TableKey; from: TableKey; to: TableKey; amount: number; transition: boolean; localTime: number } {
  let key: TableKey = 'irrational';
  let started = 0;

  for (const morph of MORPHS) {
    if (time < morph.start) break;

    if (time < morph.end) return { key: morph.to, from: morph.from, to: morph.to, amount: smooth(time, morph.start, morph.end), transition: true, localTime: 0 };

    key = morph.to;
    started = morph.end;
  }

  return { key, from: key, to: key, amount: 1, transition: false, localTime: time - started };
}

export function playbackDistanceFor(key: TableKey, time: number): number {
  const until = Math.max(0, Math.min(FILM_DURATION, time));
  let current: TableKey = 'irrational';
  let started = 0;
  let elapsed = 0;

  for (const morph of MORPHS) {
    if (key === current) elapsed += Math.max(0, Math.min(until, morph.start) - started);

    if (until < morph.end) return elapsed / 1000 * 2.8;

    current = morph.to;
    started = morph.end;
  }

  if (key === current) elapsed += Math.max(0, until - started);

  return elapsed / 1000 * 2.8;
}

export function playbackDistance(time: number): number {
  return playbackDistanceFor(tableAt(time).key, time);
}

export function checkpointAt(time: number): number {
  const elapsed = time < 16000 ? time - 8000 : time >= 43250 && time < 52250 ? time - 43250 : Infinity;

  if (elapsed < 2000) return 100;
  if (elapsed < 4000) return 1000;
  if (elapsed < 6000) return 10000;

  return 100000;
}

export function layout(width: number, height: number, _time: number): { stage: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (!tall) {
    return {
      stage: { x: width * .025, y: height * .025, w: width * .53, h: height * .95 },
      panel: { x: width * .59, y: height * .035, w: width * .385, h: height * .93 },
      tall,
    };
  }

  const split = .40;

  return {
    stage: { x: width * .04, y: height * .02, w: width * .92, h: height * (split - .04) },
    panel: { x: width * .055, y: height * split, w: width * .89, h: height * (.98 - split) },
    tall,
  };
}

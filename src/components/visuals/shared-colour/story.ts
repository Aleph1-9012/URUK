import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "One fixed colouring", text: "Paint every positive integer one of finitely many colours.", sources: [1, 2, 3] },
  { at: 5000, title: "A same-colour sum", text: "In 1916 Schur proved that some $x$, $y$ and $x+y$ share a colour.", sources: [1] },
  { at: 10000, title: "Every nonempty subset sum", text: "Folkman, Rado and Sanders extended this to arbitrarily large finite sets all of whose subset sums share a colour.", sources: [1] },
  { at: 17500, title: "Colouring exponents", text: "Multiplication alone behaves the same way, by colouring exponents.", sources: [1] },
  { at: 23500, title: "Addition and multiplication together", text: "The hard question is both at once.", sources: [1] },
  { at: 26500, title: "Why the infinite guarantee fails", text: "Hindman showed in 1980 that no infinite set can have all its elements, pairwise sums and pairwise products in one colour.", sources: [1] },
  { at: 34500, title: "The finite conjecture", text: "For every $m$ there are $m$ numbers whose subset sums and subset products are all the same colour.", sources: [1] },
  { at: 41250, title: "Search finds a pair", text: "Even the four-element case $\\{x,y,x+y,xy\\}$ for two colours needed computer help from Graham and Hindman.", sources: [1] },
  { at: 47750, title: "A dilation can change the ink", text: "The integers resisted, because scaling a sum and scaling a product behave differently, so rational solutions cannot simply be cleared of denominators.", sources: [1] },
  { at: 57500, title: "The claim and a separated triple", text: "On 23 September 2026 OpenAI posted a seventy-page paper claiming it.", sources: [1, 2, 3] },
  { at: 64500, title: "Eleven distinct values", text: "The set can be chosen with $|\\mathrm{FS}(A)|=|\\mathrm{FP}(A)|=2^{m}-1$ and $\\mathrm{FS}(A)\\cap\\mathrm{FP}(A)=A$, so the monochromatic union has $2(2^{m}-1)-m$ distinct elements.", sources: [1] },
  { at: 71500, title: "Finite size, not an infinite sequence", text: "The theorem is for prescribed finite $m$; it does not assert an infinite simultaneous sequence, which Hindman showed cannot exist.", sources: [1] },
  { at: 80250, title: "The dated review record", text: "As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof.", sources: [1] },
  { at: 87000, title: "Outside formal evidence and its scope", text: "The release itself provides no Lean statement for this family.", sources: [4, 5] },
] as const;

export const FILM_DURATION = 104000;

export const SETTLED_TIMES = [
  4500, 9000, 16000, 22250, 25750, 33000, 40000,
  46500, 54500, 63250, 70750, 78000, 85000, 104000,
] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its chosen complete diagram.');

    return time;
  },
};

export const SCENE_TIMES = {
  paint: 0,
  schur: 5000,
  finiteSums: 10000,
  exponents: 17500,
  both: 23500,
  infiniteObstruction: 26500,
  finiteQuestion: 34500,
  pairSearch: 41250,
  scaling: 47750,
  paperClaim: 57500,
  separatedUnion: 64500,
  finiteScope: 71500,
  review: 80250,
  formalEvidence: 87000,
} as const;

const SCENE_NAMES = [
  'paint', 'schur', 'finiteSums', 'exponents', 'both', 'infiniteObstruction',
  'finiteQuestion', 'pairSearch', 'scaling', 'paperClaim', 'separatedUnion',
  'finiteScope', 'review', 'formalEvidence',
] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Each cue needs its named drawing scene.');

  return scene;
}

export function paintProgress(time: number): number {
  return progress(time, 0, 4000);
}

export function schurLift(time: number): number {
  return smooth(time, 5000, 6250) * (1 - smooth(time, 9250, 10000));
}

export function sumLift(time: number): number {
  return smooth(time, 10000, 11250) * (1 - smooth(time, 16500, 17500));
}

export function sumReveal(time: number): number {
  return progress(time, 11500, 15250);
}

export function exponentLift(time: number): number {
  return smooth(time, 17500, 19000) * (1 - smooth(time, 23000, 24500));
}

export function exponentArc(time: number): number {
  return progress(time, 19000, 21000);
}

export function bothPair(time: number): number {
  return smooth(time, 23500, 24750);
}

export function bothArcs(time: number): number {
  return progress(time, 24750, 25750) * (1 - smooth(time, 25750, 26500));
}

export function historicalProgress(time: number): number {
  return progress(time, 26500, 28500);
}

export function slotsProgress(time: number): number {
  return progress(time, 34500, 36750);
}

export function pairReveal(time: number): number {
  return progress(time, 41250, 43000);
}

export function ribbonProgress(time: number): number {
  return smooth(time, 41250, 44500);
}

export function pairArcs(time: number): number {
  return progress(time, 43000, 46000);
}

export function scaleProgress(time: number): number {
  return smooth(time, 47750, 50000);
}

export function scaleReturn(time: number): number {
  return smooth(time, 55000, 57500);
}

export function scaleExplanation(time: number): number {
  return progress(time, 50000, 51500);
}

export function tripleReveal(time: number): number {
  return smooth(time, 59500, 62000);
}

export function cameraProgress(time: number): number {
  return smooth(time, 57500, 59500);
}

export function claimProgress(time: number): number {
  return smooth(time, 60000, 62250);
}

export function sumArcs(time: number): number {
  return progress(time, 64500, 66750);
}

export function productArcs(time: number): number {
  return progress(time, 66750, 69250);
}

export function unionCount(time: number): number {
  return progress(time, 69250, 70500);
}

export function finiteScopeProgress(time: number): number {
  return progress(time, 71500, 73500);
}

export function reviewProgress(time: number): number {
  return progress(time, 80250, 81500);
}

export function ledgerProgress(time: number): number {
  return progress(time, 87000, 90000);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    paint: paintProgress(time),
    schurLift: schurLift(time),
    sumLift: sumLift(time),
    sumReveal: sumReveal(time),
    exponentLift: exponentLift(time),
    exponentArc: exponentArc(time),
    bothPair: bothPair(time),
    bothArcs: bothArcs(time),
    historical: historicalProgress(time),
    slots: slotsProgress(time),
    pairReveal: pairReveal(time),
    ribbon: ribbonProgress(time),
    pairArcs: pairArcs(time),
    scale: scaleProgress(time),
    scaleReturn: scaleReturn(time),
    scaleExplain: scaleExplanation(time),
    tripleReveal: tripleReveal(time),
    camera: cameraProgress(time),
    claim: claimProgress(time),
    sumArcs: sumArcs(time),
    productArcs: productArcs(time),
    unionCount: unionCount(time),
    finiteScope: finiteScopeProgress(time),
    review: reviewProgress(time),
    ledger: ledgerProgress(time),
  };
}

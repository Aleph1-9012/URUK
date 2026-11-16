import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: 'An arbitrary finite colouring', text: 'Colour every point of space with finitely many colours, as badly as you like.', sources: [1] },
  { at: 5500, title: 'A same-ink pair', text: 'Some shapes cannot be avoided: in a high enough dimension, any colouring contains two points at distance one of the same colour, and in fact a whole equilateral triangle, a whole regular simplex.', sources: [1] },
  { at: 17750, title: 'Spherical is necessary', text: 'Erdős, Graham, Montgomery, Rothschild, Spencer and Straus founded Euclidean Ramsey theory in 1973 and proved a necessary condition: the shape must lie on a sphere.', sources: [1, 2] },
  { at: 28250, title: "Graham's proposed converse", text: 'Graham conjectured that lying on a sphere is also sufficient.', sources: [1] },
  { at: 32750, title: 'A transitive set and a subset', text: 'Leader, Russell and Walters proposed in 2012 a rival answer, that a shape is Ramsey exactly when it sits inside a finite set with a transitive symmetry group.', sources: [1, 2] },
  { at: 43000, title: 'The conjectures disagree', text: 'But neither conjecture could be settled, and the two disagree about simple shapes, such as some cyclic quadrilaterals.', sources: [1, 2] },
  { at: 50750, title: 'A cited seven-point obstruction', text: "Pálvölgyi posted a seven-point configuration on a circle that is not Ramsey, refuting Graham's conjecture in a manuscript he says was written by ChatGPT.", sources: [1, 3] },
  { at: 60500, title: 'The claimed classification', text: 'On 23 September OpenAI posted a paper claiming a complete algebraic classification, from which it follows that some cyclic quadrilaterals are Ramsey without being subtransitive, refuting the other conjecture too.', sources: [1] },
  { at: 73750, title: 'The claimed five-point consequence', text: 'Every nonempty set of at most five points on a circle is Ramsey, hence every cyclic quadrilateral, including their non-subtransitive kites, which refutes the necessity half and their Conjecture 3.', sources: [1] },
  { at: 86250, title: 'Before and after multiplication', text: 'The tensor condition asks the identity to hold before multiplication, and that is the gap between spherical and Ramsey.', sources: [1] },
  { at: 94000, title: 'Exact coordinates', text: 'The criterion uses exact relations in the coordinate field; the paper says it "is not a procedure for recovering those relations from numerical approximations to arbitrary real coordinates".', sources: [1] },
  { at: 106000, title: 'The dated review record', text: 'As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof.', sources: [4] },
  { at: 112750, title: 'The formal statement and its scope', text: 'A kernel check is evidence about the formal statement, not a reading of the paper.', sources: [5] },
] as const;

export const FILM_DURATION = 118500;

// Each chosen frame retains the complete supporting example before its next move.
export const SETTLED_TIMES = [
  5000, 15500, 27000, 31500, 42000, 48750, 57500,
  70000, 79750, 93000, 102500, 110500, 118500,
] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting example.');

    return time;
  },
};

export const SCENE_TIMES = {
  colouring: 0,
  pigeonhole: 5500,
  spherical: 17750,
  graham: 28250,
  transitive: 32750,
  kite: 43000,
  heptagon: 50750,
  classification: 60500,
  fivePoints: 73750,
  tensor: 86250,
  exact: 94000,
  review: 106000,
  formalEvidence: 112750,
} as const;

const SCENE_NAMES = [
  'colouring', 'pigeonhole', 'spherical', 'graham', 'transitive', 'kite',
  'heptagon', 'classification', 'fivePoints', 'tensor', 'exact', 'review',
  'formalEvidence',
] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Each cue needs its named drawing scene.');

  return scene;
}

export function fieldProgress(time: number): number {
  return progress(time, 0, 3000);
}

export function circleProgress(time: number): number {
  return progress(time, 1000, 5000);
}

export function fieldRetreat(time: number): number {
  return smooth(time, 5500, 7500);
}

export function simplexProgress(time: number): number {
  return smooth(time, 5500, 7500);
}

export function trialIndex(time: number): number {
  return Math.min(80, Math.floor(progress(time, 7500, 15500) * 81));
}

export function trialsComplete(time: number): boolean {
  return time >= 15500;
}

export function triangleProgress(time: number): number {
  return smooth(time, 17750, 19750);
}

export function squareProgress(time: number): number {
  return smooth(time, 21500, 23250);
}

export function collinearProgress(time: number): number {
  return smooth(time, 25000, 26750);
}

export function sphereReturn(time: number): number {
  return smooth(time, 27250, 28250);
}

export function grahamProgress(time: number): number {
  return progress(time, 28250, 30000);
}

export function polygonProgress(time: number): number {
  return smooth(time, 32750, 34500);
}

export function rotationProgress(time: number): number {
  return progress(time, 35000, 39000);
}

export function rectangleProgress(time: number): number {
  return smooth(time, 39750, 42000);
}

export function kiteProgress(time: number): number {
  return smooth(time, 43000, 45250);
}

export function heptagonProgress(time: number): number {
  return smooth(time, 50750, 52750);
}

export function grahamStrike(time: number): number {
  return progress(time, 53500, 55000);
}

export function claimProgress(time: number): number {
  return progress(time, 60500, 63500);
}

export function kiteReturn(time: number): number {
  return smooth(time, 60500, 62750);
}

export function rivalStrike(time: number): number {
  return progress(time, 64000, 65500);
}

export function fivePreparation(time: number): number {
  return smooth(time, 72250, 73750);
}

export function fiveProgress(time: number): number {
  return progress(time, 73750, 79000);
}

export function sixthProgress(time: number): number {
  return smooth(time, 80500, 82500);
}

export function tensorPreparation(time: number): number {
  return smooth(time, 83750, 86250);
}

export function tensorSplit(time: number): number {
  return smooth(time, 86250, 88250);
}

export function tensorMerge(time: number): number {
  return smooth(time, 90000, 91750);
}

export function exactProgress(time: number): number {
  return smooth(time, 94000, 96250);
}

export function roundingProgress(time: number): number {
  return smooth(time, 98750, 101000);
}

export function roundingReturn(time: number): number {
  return smooth(time, 103500, 105000);
}

export function closingMorph(time: number): number {
  return smooth(time, 103500, 106000);
}

export function reviewProgress(time: number): number {
  return progress(time, 106000, 107250);
}

export function ledgerProgress(time: number): number {
  return progress(time, 106000, 107250);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    field: fieldProgress(time),
    circle: circleProgress(time),
    fieldRetreat: fieldRetreat(time),
    simplex: simplexProgress(time),
    trialIndex: trialIndex(time),
    trialsComplete: trialsComplete(time),
    triangle: triangleProgress(time),
    square: squareProgress(time),
    collinear: collinearProgress(time),
    sphereReturn: sphereReturn(time),
    graham: grahamProgress(time),
    polygon: polygonProgress(time),
    rotation: rotationProgress(time),
    rectangle: rectangleProgress(time),
    kite: kiteProgress(time),
    heptagon: heptagonProgress(time),
    grahamStrike: grahamStrike(time),
    claim: claimProgress(time),
    kiteReturn: kiteReturn(time),
    rivalStrike: rivalStrike(time),
    fivePreparation: fivePreparation(time),
    five: fiveProgress(time),
    sixth: sixthProgress(time),
    tensorPreparation: tensorPreparation(time),
    tensorSplit: tensorSplit(time),
    tensorMerge: tensorMerge(time),
    exact: exactProgress(time),
    rounding: roundingProgress(time),
    roundingReturn: roundingReturn(time),
    closingMorph: closingMorph(time),
    review: reviewProgress(time),
    ledger: ledgerProgress(time),
  };
}

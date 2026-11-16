import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Great circles close", text: "On a perfectly round sphere, walk straight ahead and you return to where you started along a great circle; there are infinitely many great circles, so infinitely many closed straight paths.", sources: [1] },
  { at: 12000, title: "A triaxial ellipsoid", text: "Dent the sphere, stretch it, make it an egg or a potato, and the straight paths, the geodesics, bend with the surface.", sources: [1] },
  { at: 19750, title: "Three principal closed geodesics", text: "Birkhoff showed in 1917 that at least one still closes up.", sources: [1] },
  { at: 24000, title: "A finite generic trace", text: "Whether infinitely many always do, on every possible shape of sphere in every dimension, became one of the classical problems of geometry.", sources: [1] },
  { at: 33000, title: "The closed-geodesic definition", text: "A closed geodesic is a nonconstant periodic one.", sources: [1] },
  { at: 36750, title: "Prime and repeated traversals", text: "It is prime if it goes around once rather than repeating a shorter closed geodesic several times.", sources: [1] },
  { at: 43250, title: "One geometric image", text: "Two closed geodesics count as the same if they have the same image: starting at a different point, running backwards, or going around twice gives nothing new.", sources: [1] },
  { at: 53500, title: "The classical two-sphere", text: "For the ordinary two-dimensional sphere the answer is yes, by work of Franks, Bangert and Hingston around 1992.", sources: [1, 3, 4] },
  { at: 61000, title: "The higher-dimensional claim", text: "On 24 September 2026 OpenAI posted a paper claiming infinitely many closed geodesics on every sphere of every dimension, and, using Perelman's geometrization theorem, on every closed three-dimensional space.", sources: [1] },
  { at: 74000, title: "The dated review", text: "As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof.", sources: [1] },
  { at: 80750, title: "The pinned formal scope", text: "Family 345 has no Lean scope note and no comparator statement in the release.", sources: [7] },
] as const;

export const FILM_DURATION = 86250;

export const SETTLED_TIMES = [11750, 19500, 23750, 32750, 36500, 43000, 53250, 60750, 73750, 80500, 86250] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

export const SCENE_TIMES = {
  round: 0,
  deform: 12000,
  principal: 19750,
  generic: 24000,
  closed: 33000,
  prime: 36750,
  sameImage: 43250,
  classical: 53500,
  claim: 61000,
  review: 74000,
  ledger: 80750,
} as const;

const SCENE_NAMES = ["round", "deform", "principal", "generic", "closed", "prime", "sameImage", "classical", "claim", "review", "ledger"] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function surfaceProgress(time: number): number {
  return progress(time, 0, 2000);
}

export function greatCirclesProgress(time: number): number {
  return progress(time, 2000, 11000);
}

export function deformProgress(time: number): number {
  return smooth(time, 12000, 17500);
}

export function toyTagProgress(time: number): number {
  return progress(time, 17500, 19000);
}

export function principalProgress(time: number): number {
  return progress(time, 19750, 23250);
}

export function genericProgress(time: number): number {
  return progress(time, 24000, 32000);
}

export function rewindProgress(time: number): number {
  return smooth(time, 33000, 35750);
}

export function primeProgress(time: number): number {
  return progress(time, 36750, 40250);
}

export function secondLapProgress(time: number): number {
  return progress(time, 40250, 42750);
}

export function sameImageProgress(time: number): number {
  return progress(time, 43250, 45500);
}

export function shiftedStartProgress(time: number): number {
  return progress(time, 45500, 47750);
}

export function reverseProgress(time: number): number {
  return progress(time, 47750, 50000);
}

export function repeatProgress(time: number): number {
  return progress(time, 50000, 52500);
}

export function relaxProgress(time: number): number {
  return smooth(time, 53500, 59000);
}

export function classicalProgress(time: number): number {
  return progress(time, 59000, 60500);
}

export function haloProgress(time: number): number {
  return progress(time, 61000, 63250);
}

export function infinityProgress(time: number): number {
  return progress(time, 63250, 65000);
}

export function claimProgress(time: number): number {
  return progress(time, 65000, 69750);
}

export function extensionsProgress(time: number): number {
  return progress(time, 69750, 73000);
}

export function unreviewedProgress(time: number): number {
  return progress(time, 74000, 76500);
}

export function reviewDateProgress(time: number): number {
  return progress(time, 76500, 79500);
}

export function ledgerProgress(time: number): number {
  return progress(time, 80750, 85000);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    surface: surfaceProgress(time),
    greatCircles: greatCirclesProgress(time),
    deform: deformProgress(time),
    toyTag: toyTagProgress(time),
    principal: principalProgress(time),
    generic: genericProgress(time),
    rewind: rewindProgress(time),
    prime: primeProgress(time),
    secondLap: secondLapProgress(time),
    sameImage: sameImageProgress(time),
    shiftedStart: shiftedStartProgress(time),
    reverse: reverseProgress(time),
    repeat: repeatProgress(time),
    relax: relaxProgress(time),
    classical: classicalProgress(time),
    halo: haloProgress(time),
    infinity: infinityProgress(time),
    claim: claimProgress(time),
    extensions: extensionsProgress(time),
    unreviewed: unreviewedProgress(time),
    reviewDate: reviewDateProgress(time),
    ledger: ledgerProgress(time),
  };
}

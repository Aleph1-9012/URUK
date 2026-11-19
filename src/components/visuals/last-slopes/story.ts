import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Removing the knotted tube", text: "Three-dimensional spaces can be built by surgery: drill out a tube around a knot in ordinary space, then glue the tube back in twisted.", sources: [] },
  { at: 8750, title: "Slope coordinates", text: "Each way of twisting is labelled by a fraction, the slope, and every closed three-dimensional space arises this way from some link.", sources: [] },
  { at: 17250, title: "The meridional filling", text: "Gordon and Luecke proved in 1989 that if you get ordinary space back, you did nothing: a nontrivial knot cannot be re-glued to give the three-sphere.", sources: [2] },
  { at: 27000, title: "Two slopes, one oriented space?", text: "Cameron Gordon asked in 1990 whether the same holds for every target: could two different slopes on the same knot ever give the same oriented space?", sources: [3] },
  { at: 36500, title: "Purely cosmetic", text: "Such a pair would be called purely cosmetic.", sources: [1] },
  { at: 40000, title: "A toy arithmetic window", text: "Thirty-five years of work with every tool in low-dimensional topology, Alexander polynomials, Heegaard Floer homology, quantum invariants and hyperbolic geometry, narrowed the possibilities to a single case, opposite slopes of magnitude two on a knot of genus two.", sources: [1, 4, 5] },
  { at: 56500, title: "Hanselman\u2019s remaining forms", text: "Hanselman's 2023 work with immersed curves cut this to $\\pm2$ or $\\pm1/q$, with $\\pm2$ possible only in genus two.", sources: [1, 4] },
  { at: 63750, title: "The last genus-two pair", text: "Finally Daemi, Lidman and Miller Eismeier's filtered instanton homology excluded the pairs $\\pm1/q$, leaving exactly opposite integer slopes of magnitude two on a genus-two knot.", sources: [1, 5] },
  { at: 75000, title: "The claimed exclusion", text: "On 23 September 2026 OpenAI posted a long gauge-theoretic paper claiming to exclude that case and hence the conjecture in full.", sources: [1] },
  { at: 83250, title: "The dated human review", text: "As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof.", sources: [1] },
  { at: 90000, title: "The pinned release\u2019s formal scope", text: "Family 306 has no Lean scope note and no comparator statement in the release.", sources: [7] },
] as const;

export const FILM_DURATION = 95500;

export const SETTLED_TIMES = [8500, 17000, 26750, 36250, 39750, 56250, 63500, 74750, 83000, 89750, 95500] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

const SCENE_NAMES = ["surgery", "slopes", "meridian", "question", "cosmetic", "niWu", "hanselman", "lastPair", "claim", "review", "ledger"] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function trefoilProgress(time: number): number {
  return progress(time, 0, 2500);
}

export function tubeProgress(time: number): number {
  return progress(time, 2500, 5000);
}

export function exteriorProgress(time: number): number {
  return smooth(time, 5000, 7000);
}

export function guideProgress(time: number): number {
  return progress(time, 7000, 8500);
}

export function slopeOneProgress(time: number): number {
  return smooth(time, 8750, 11000);
}

export function slopeTwoProgress(time: number): number {
  return smooth(time, 11000, 13500);
}

export function slopeHalfProgress(time: number): number {
  return smooth(time, 13500, 16000);
}

export function meridianProgress(time: number): number {
  return smooth(time, 17250, 20000);
}

export function comparisonCrossProgress(time: number): number {
  return progress(time, 20000, 24500);
}

export function questionProgress(time: number): number {
  return smooth(time, 27000, 31000);
}

export function comparisonThreadProgress(time: number): number {
  return progress(time, 31000, 34500);
}

export function cosmeticProgress(time: number): number {
  return progress(time, 36500, 39000);
}

export function windowProgress(time: number): number {
  return progress(time, 40000, 44000);
}

export function niWuProgress(time: number): number {
  return smooth(time, 44000, 52000);
}

export function niWuReadoutProgress(time: number): number {
  return progress(time, 52000, 55000);
}

export function hanselmanProgress(time: number): number {
  return smooth(time, 56500, 61000);
}

export function hanselmanReadoutProgress(time: number): number {
  return progress(time, 61000, 63000);
}

export function instantonProgress(time: number): number {
  return smooth(time, 63750, 69000);
}

export function lastMarkerProgress(time: number): number {
  return smooth(time, 69000, 71500);
}

export function lastCurvesProgress(time: number): number {
  return progress(time, 71500, 73500);
}

export function claimRingProgress(time: number): number {
  return progress(time, 75000, 77750);
}

export function claimStrokeProgress(time: number): number {
  return progress(time, 77750, 79750);
}

export function claimScopeProgress(time: number): number {
  return progress(time, 79750, 82250);
}

export function unreviewedProgress(time: number): number {
  return progress(time, 83250, 86000);
}

export function reviewDateProgress(time: number): number {
  return progress(time, 86000, 88500);
}

export function ledgerProgress(time: number): number {
  return progress(time, 90000, 93500);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    trefoil: trefoilProgress(time),
    tube: tubeProgress(time),
    exterior: exteriorProgress(time),
    guide: guideProgress(time),
    slopeOne: slopeOneProgress(time),
    slopeTwo: slopeTwoProgress(time),
    slopeHalf: slopeHalfProgress(time),
    meridian: meridianProgress(time),
    comparisonCross: comparisonCrossProgress(time),
    question: questionProgress(time),
    comparisonThread: comparisonThreadProgress(time),
    cosmetic: cosmeticProgress(time),
    window: windowProgress(time),
    niWu: niWuProgress(time),
    niWuReadout: niWuReadoutProgress(time),
    hanselman: hanselmanProgress(time),
    hanselmanReadout: hanselmanReadoutProgress(time),
    instanton: instantonProgress(time),
    lastMarker: lastMarkerProgress(time),
    lastCurves: lastCurvesProgress(time),
    claimRing: claimRingProgress(time),
    claimStroke: claimStrokeProgress(time),
    claimScope: claimScopeProgress(time),
    unreviewed: unreviewedProgress(time),
    reviewDate: reviewDateProgress(time),
    ledger: ledgerProgress(time),
  };
}

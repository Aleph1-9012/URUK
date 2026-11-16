import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Rotations as Lie groups", text: "The symmetries of a circle form a circle; the rotations of a sphere form a three-dimensional group; these are Lie groups, smooth objects on which one can do calculus.", sources: [1] },
  { at: 10750, title: "The merely continuous question", text: "In 1900 Hilbert asked, as the fifth of his twenty-three problems, whether the smoothness is automatic: if a group of transformations is merely continuous, must it be a Lie group?", sources: [1] },
  { at: 22000, title: "Residues form a tree", text: "Can the $p$-adic integers, a compact group that looks like a Cantor set, act faithfully by homeomorphisms on a manifold?", sources: [1, 3] },
  { at: 30000, title: "One finite-quotient action", text: "Equivalently, every continuous action of $\\mathbb Z_p$ factors through a finite quotient $\\mathbb Z/p^{k}\\mathbb Z$.", sources: [1, 3] },
  { at: 39000, title: "Known cases", text: "For dimensions one and two the answer was classical; John Pardon proved it for three-manifolds in 2013; for smooth, Lipschitz or quasiconformal actions it was known in all dimensions.", sources: [1, 2, 4] },
  { at: 50750, title: "The open topological cases", text: "The general topological case in dimension four and up stayed open.", sources: [1] },
  { at: 55500, title: "The new claim", text: "On 23 September 2026 OpenAI posted a paper claiming it in every dimension.", sources: [1] },
  { at: 60750, title: "Every action in the stated scope", text: "For every $n\\ge1$ and prime $p$, every jointly continuous action of $\\mathbb Z_p$ on a connected Hausdorff second-countable topological $n$-manifold without boundary has nonzero kernel, hence factors through a finite quotient.", sources: [1] },
  { at: 74500, title: "What the statement allows", text: "The manifold may be noncompact, nonorientable or nontriangulable, and arbitrary stabilizers and fixed points are allowed; no dimension bound on the orbit space is assumed.", sources: [1] },
  { at: 85500, title: "The dated review", text: "As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof.", sources: [1, 5] },
  { at: 92250, title: "The machine-checking ledger", text: "Family 304 has no Lean scope note and no comparator statement in the release.", sources: [7] },
] as const;

export const FILM_DURATION = 97750;

export const SETTLED_TIMES = [10500, 21500, 29750, 38750, 50250, 55250, 60500, 74250, 85250, 92000, 97750] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

export const SCENE_TIMES = {
  rotations: 0,
  rough: 10750,
  tree: 22000,
  toy: 30000,
  known: 39000,
  open: 50750,
  claim: 55500,
  exclusion: 60750,
  scope: 74500,
  review: 85500,
  ledger: 92250,
} as const;

const SCENE_NAMES = ["rotations", "rough", "tree", "toy", "known", "open", "claim", "exclusion", "scope", "review", "ledger"] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function circleProgress(time: number): number {
  return progress(time, 0, 2000);
}

export function rotationsProgress(time: number): number {
  return progress(time, 2000, 6500);
}

export function sphereProgress(time: number): number {
  return progress(time, 6500, 9500);
}

export function roughProgress(time: number): number {
  return smooth(time, 10750, 14500);
}

export function roughHoldProgress(time: number): number {
  return progress(time, 14500, 20500);
}

export function treeProgress(time: number): number {
  return progress(time, 22000, 28500);
}

export function odometerProgress(time: number): number {
  return progress(time, 30000, 34000);
}

export function quotientProgress(time: number): number {
  return smooth(time, 34000, 35000);
}

export function toyRotationsProgress(time: number): number {
  return progress(time, 35000, 37000);
}

export function kernelProgress(time: number): number {
  return progress(time, 37000, 38250);
}

export function rulerProgress(time: number): number {
  return progress(time, 39000, 41250);
}

export function classicalProgress(time: number): number {
  return progress(time, 41250, 44000);
}

export function pardonProgress(time: number): number {
  return progress(time, 44000, 46000);
}

export function regularityProgress(time: number): number {
  return progress(time, 46000, 49000);
}

export function openCaseProgress(time: number): number {
  return progress(time, 50750, 53750);
}

export function claimBracketProgress(time: number): number {
  return progress(time, 55500, 58250);
}

export function claimDateProgress(time: number): number {
  return progress(time, 58250, 60000);
}

export function claimGlyphsProgress(time: number): number {
  return progress(time, 60750, 64250);
}

export function claimScopeProgress(time: number): number {
  return progress(time, 64250, 70000);
}

export function manifoldScopeProgress(time: number): number {
  return progress(time, 74500, 80500);
}

export function publicReviewProgress(time: number): number {
  return progress(time, 85500, 89000);
}

export function reviewDateProgress(time: number): number {
  return progress(time, 89000, 91500);
}

export function ledgerProgress(time: number): number {
  return progress(time, 92250, 96000);
}

export function actionClock(time: number): number {
  return Math.max(0, (time - 39000) / 1800);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    actionClock: actionClock(time),
    circle: circleProgress(time),
    rotations: rotationsProgress(time),
    sphere: sphereProgress(time),
    rough: roughProgress(time),
    roughHold: roughHoldProgress(time),
    tree: treeProgress(time),
    odometer: odometerProgress(time),
    quotient: quotientProgress(time),
    toyRotations: toyRotationsProgress(time),
    kernel: kernelProgress(time),
    ruler: rulerProgress(time),
    classical: classicalProgress(time),
    pardon: pardonProgress(time),
    regularity: regularityProgress(time),
    openCase: openCaseProgress(time),
    claimBracket: claimBracketProgress(time),
    claimDate: claimDateProgress(time),
    claimGlyphs: claimGlyphsProgress(time),
    claimScope: claimScopeProgress(time),
    manifoldScope: manifoldScopeProgress(time),
    publicReview: publicReviewProgress(time),
    reviewDate: reviewDateProgress(time),
    ledger: ledgerProgress(time),
  };
}

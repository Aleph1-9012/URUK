import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Both matrix products", text: "In ordinary arithmetic, and for square matrices, a left inverse is a right inverse: if $ab=1$ then $ba=1$.", sources: [2] },
  { at: 7000, title: "An element of a group algebra", text: "Irving Kaplansky asked in the 1950s whether the same holds in every group algebra, the ring of finite formal sums of group elements with coefficients in a field.", sources: [2] },
  { at: 17250, title: "No merging and every image", text: "Walter Gottschalk asked a cousin of it in 1973 about cellular automata, rules like Conway's Game of Life played on the cells of a group: if such a rule never sends two different configurations to the same one, must every configuration be reachable?", sources: [2, 4] },
  { at: 32750, title: "The two failures on a finite ring", text: "A linear cellular automaton over $K$ is the same as right multiplication by an element of $K[G]$ acting on $K^{G}$, which is how the two conjectures connect: a left-invertible, non-right-invertible element gives an injective, non-surjective automaton.", sources: [2] },
  { at: 48250, title: "Finite pieces and a window", text: "Both questions were known to have the answer yes for every sofic group, a vast class containing every group anyone could write down, and for twenty-five years the obstacle was that nobody knew a group outside it.", sources: [2, 4] },
  { at: 61500, title: "The claimed counterexamples", text: "On 23 September and 4 October OpenAI posted papers claiming that over such groups both conjectures fail, the second even for a torsion-free group, and that a third conjecture about determinants falls with them.", sources: [1, 2, 4, 6] },
  { at: 74750, title: "The symbolic contradiction", text: "The auxiliary element $c$ with $ac=0$, $c\\ne0$ certifies failure of $ba=1$ in one line, since $ba=1$ would give $c=(ba)c=b(ac)=0$.", sources: [1] },
  { at: 82500, title: "No small example to draw", text: "The constructions are existence proofs with explicit recipes that have not been run; no small example is written down.", sources: [1, 2] },
  { at: 90250, title: "The dated review ledger", text: "As of 3 November 2026 no mathematician has said publicly that they have checked these particular proofs, though the nonsofic construction they rest on has been studied, strengthened and publicly discussed by named experts.", sources: [5, 6, 7, 8] },
] as const;
export const FILM_DURATION = 104250;

// Holds include the completed map or argument, rather than its first moving frame.
export const SETTLED_TIMES = [6500, 16000, 31250, 47000, 60000, 73000, 81500, 89000, 104250] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting example.');

    return time;
  },
};

export const SCENE_TIMES = {
  matrices: 0,
  groupAlgebra: 7000,
  c4: 17250,
  c3: 32750,
  sofic: 48250,
  claim: 61500,
  torsionFree: 74750,
  recipe: 82500,
  ledger: 90250,
} as const;

const SCENE_NAMES = ['matrices', 'groupAlgebra', 'c4', 'c3', 'sofic', 'claim', 'torsionFree', 'recipe', 'ledger'] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function matrixAProgress(time: number): number {
  return progress(time, 0, 1000);
}

export function matrixBProgress(time: number): number {
  return progress(time, 1250, 2500);
}

export function productABProgress(time: number): number {
  return progress(time, 2750, 4250);
}

export function productBAProgress(time: number): number {
  return progress(time, 4500, 6000);
}

export function collapseProgress(time: number): number {
  return smooth(time, 7000, 9500);
}

export function rowToRingProgress(time: number): number {
  return smooth(time, 17250, 19500);
}

export function c4MappingProgress(time: number): number {
  return progress(time, 20000, 30000);
}

export function c3ShrinkProgress(time: number): number {
  return smooth(time, 32750, 35000);
}

export function c3MappingProgress(time: number): number {
  return progress(time, 35500, 41000);
}

export function tallyProgress(time: number): number {
  return progress(time, 42000, 46500);
}

export function windowRingProgress(time: number): number {
  return smooth(time, 48250, 50750);
}

export function windowUnrollProgress(time: number): number {
  return smooth(time, 51250, 53750);
}

export function windowChecksProgress(time: number): number {
  return progress(time, 54250, 59500);
}

export function toyRetreatProgress(time: number): number {
  return smooth(time, 61500, 63750);
}

export function claimBlankProgress(time: number): number {
  return progress(time, 63000, 65250);
}

export function claimMarkProgress(time: number): number {
  return progress(time, 65000, 67250);
}

export function claimMapProgress(time: number): number {
  return progress(time, 67500, 71000);
}

export function proofProgress(time: number): number {
  return progress(time, 74750, 80750);
}

export function ledgerProgress(time: number): number {
  return progress(time, 90250, 93500);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    matrixA: matrixAProgress(time),
    matrixB: matrixBProgress(time),
    productAB: productABProgress(time),
    productBA: productBAProgress(time),
    collapse: collapseProgress(time),
    rowToRing: rowToRingProgress(time),
    c4Mapping: c4MappingProgress(time),
    c3Shrink: c3ShrinkProgress(time),
    c3Mapping: c3MappingProgress(time),
    tally: tallyProgress(time),
    windowRing: windowRingProgress(time),
    windowUnroll: windowUnrollProgress(time),
    windowChecks: windowChecksProgress(time),
    toyRetreat: toyRetreatProgress(time),
    claimBlank: claimBlankProgress(time),
    claimMark: claimMarkProgress(time),
    claimMap: claimMapProgress(time),
    proof: proofProgress(time),
    ledger: ledgerProgress(time),
  };
}

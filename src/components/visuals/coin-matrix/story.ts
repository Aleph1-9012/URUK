import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Independent upper-triangular signs", text: "Fill the upper half of a square grid, including its diagonal, with independent coin flips: $+1$ for heads and $-1$ for tails.", sources: [1, 2] },
  { at: 8250, title: "Reflecting the reused entries", text: "Reflect each off-diagonal entry across the diagonal.", sources: [1, 2] },
  { at: 12250, title: "Two equal equations", text: "Sometimes those equations are dependent, so the matrix loses information about its input. Two identical rows are one obvious way for this to happen.", sources: [1, 2] },
  { at: 21750, title: "A nonzero kernel vector", text: "A singular matrix has a nonzero vector $v$ with $Av=0$, called a kernel vector.", sources: [1, 2] },
  { at: 27250, title: "The invertible corner", text: "Replacing its bottom-right entry by $-1$ gives the two equations $x_1+x_2=y_1$ and $x_1-x_2=y_2$, which determine both unknowns.", sources: [1] },
  { at: 34750, title: "The elementary lower bound", text: "There is an elementary reason to expect the fair-coin probability to be at least $2^{-n}$.", sources: [1, 2] },
  { at: 40750, title: "A symmetric equal-row event", text: "Require the first two rows to agree. Outside their shared two-by-two corner, $n-2$ independent pairs of signs must match, each with probability $1/2$.", sources: [1, 2] },
  { at: 50500, title: "Dependence beyond row pairs", text: "A matrix can have dependent rows without any two being equal or opposite.", sources: [1, 3] },
  { at: 55750, title: "The fair-coin claim", text: "The fair-coin claim is $2^{-n+o(n)}$ for an $n$-by-$n$ matrix.", sources: [1] },
  { at: 60750, title: "A fixed biased coin", text: "OpenAI's papers dated 3 and 4 October 2026 claim a sharp answer at the exponential scale, first for fair coins and then for each fixed biased coin.", sources: [1, 2] },
  { at: 70250, title: "The dated review", text: "In our search on 7 November 2026, we found no public expert verification of either complete proof.", sources: [1, 2, 10] },
  { at: 77000, title: "The Lean catalogue", text: "Neither paper has a formalization listed in the release's Lean catalogue at the approved commit.", sources: [11] },
] as const;

export const FILM_DURATION = 83500;

// Equal-row and finite-count holds precede restoration and the asymptotic claim.
export const SETTLED_TIMES = [8000, 11750, 21000, 26500, 34000, 40250, 48000, 54500, 60250, 69750, 76500, 83500] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

export const SCENE_TIMES = {
  coins: 0,
  symmetry: 8250,
  dependent: 12250,
  kernel: 21750,
  invertible: 27250,
  lowerBound: 34750,
  equalRows: 40750,
  beyondPairs: 50500,
  fair: 55750,
  biased: 60750,
  review: 70250,
  catalogue: 77000,
} as const;

const SCENE_NAMES = ["coins", "symmetry", "dependent", "kernel", "invertible", "lowerBound", "equalRows", "beyondPairs", "fair", "biased", "review", "catalogue"] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function upperProgress(time: number): number {
  return progress(time, 0, 7500);
}

export function mirrorProgress(time: number): number {
  return smooth(time, 8250, 11500);
}

export function cornerProgress(time: number): number {
  return smooth(time, 12250, 15500);
}

export function cornerFlipProgress(time: number): number {
  return smooth(time, 15500, 17000);
}

export function equalRowsProgress(time: number): number {
  return progress(time, 17000, 19000);
}

export function kernelTwoProgress(time: number): number {
  return progress(time, 21750, 23000);
}

export function zeroProductsProgress(time: number): number {
  return progress(time, 23000, 25500);
}

export function cornerRestoreProgress(time: number): number {
  return smooth(time, 27250, 28500);
}

export function invertibleProductProgress(time: number): number {
  return progress(time, 28500, 29500);
}

export function equationsProgress(time: number): number {
  return progress(time, 29500, 32500);
}

export function regrowProgress(time: number): number {
  return smooth(time, 34750, 37000);
}

export function scaleProgress(time: number): number {
  return progress(time, 37000, 39250);
}

export function lowerBoundProgress(time: number): number {
  return progress(time, 39250, 40250);
}

export function whatIfProgress(time: number): number {
  return smooth(time, 40750, 43500);
}

export function pairFactorsProgress(time: number): number {
  return progress(time, 43500, 45750);
}

export function productProgress(time: number): number {
  return progress(time, 45750, 47500);
}

export function bruteCountsProgress(time: number): number {
  return progress(time, 47500, 48500);
}

export function restoreRowsProgress(time: number): number {
  return smooth(time, 48500, 50000);
}

export function kernelSixProgress(time: number): number {
  return progress(time, 50500, 52000);
}

export function sixProductsProgress(time: number): number {
  return progress(time, 52000, 53500);
}

export function smallCountsProgress(time: number): number {
  return progress(time, 50500, 53500);
}

export function countsRetireProgress(time: number): number {
  return smooth(time, 54750, 55500);
}

export function fairClaimProgress(time: number): number {
  return progress(time, 55750, 57500);
}

export function fairScopeProgress(time: number): number {
  return progress(time, 57500, 60250);
}

export function biasCoinProgress(time: number): number {
  return progress(time, 60750, 63000);
}

export function biasAgreementProgress(time: number): number {
  return progress(time, 63000, 65250);
}

export function biasClaimProgress(time: number): number {
  return progress(time, 65250, 68500);
}

export function biasScopeProgress(time: number): number {
  return progress(time, 68500, 69750);
}

export function unreviewedProgress(time: number): number {
  return progress(time, 70250, 73500);
}

export function reviewDateProgress(time: number): number {
  return progress(time, 73500, 76000);
}

export function catalogueProgress(time: number): number {
  return progress(time, 77000, 80250);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    upper: upperProgress(time),
    mirror: mirrorProgress(time),
    corner: cornerProgress(time),
    cornerFlip: cornerFlipProgress(time),
    equalRows: equalRowsProgress(time),
    kernelTwo: kernelTwoProgress(time),
    zeroProducts: zeroProductsProgress(time),
    cornerRestore: cornerRestoreProgress(time),
    invertibleProduct: invertibleProductProgress(time),
    equations: equationsProgress(time),
    regrow: regrowProgress(time),
    scale: scaleProgress(time),
    lowerBound: lowerBoundProgress(time),
    whatIf: whatIfProgress(time),
    pairFactors: pairFactorsProgress(time),
    product: productProgress(time),
    bruteCounts: bruteCountsProgress(time),
    restoreRows: restoreRowsProgress(time),
    kernelSix: kernelSixProgress(time),
    sixProducts: sixProductsProgress(time),
    smallCounts: smallCountsProgress(time),
    countsRetire: countsRetireProgress(time),
    fairClaim: fairClaimProgress(time),
    fairScope: fairScopeProgress(time),
    biasCoin: biasCoinProgress(time),
    biasAgreement: biasAgreementProgress(time),
    biasClaim: biasClaimProgress(time),
    biasScope: biasScopeProgress(time),
    unreviewed: unreviewedProgress(time),
    reviewDate: reviewDateProgress(time),
    catalogue: catalogueProgress(time),
  };
}

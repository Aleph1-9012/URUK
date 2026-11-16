import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Open edges and cluster weights", text: "Open each edge of a square grid at random, and weight the result by $q$ to the power of the number of clusters it creates.", sources: [1, 2, 3, 4] },
  { at: 8250, title: "Percolation, Ising and Potts", text: "For $q=1$ this is ordinary percolation; for $q=2$ it is the Ising model of magnetism in disguise; for integer $q$ it is the $q$-state Potts model.", sources: [1, 2, 3, 4] },
  { at: 18000, title: "The cluster boundaries", text: "This is the random-cluster model of Fortuin and Kasteleyn, and at its critical point the boundaries between clusters are fractal curves that, physicists predicted, look the same at every scale and in every shape of domain: conformally invariant.", sources: [1, 2, 3, 4] },
  { at: 33250, title: "The SLE parameter", text: "In 2000 Oded Schramm found what those limiting curves must be, a one-parameter family now called SLE$_\\kappa$, and Rohde and Schramm predicted the parameter for each $q$.", sources: [1, 2, 3, 4] },
  { at: 44000, title: "The parameter formula", text: "$\\kappa(1)=6$, $\\kappa(2)=16/3$ and $\\kappa(4)=4$.", sources: [1] },
  { at: 51000, title: "The separate human results", text: "Smirnov did it in 2001 for percolation on the triangular lattice, in work that brought him a Fields Medal, and in 2010 for the Ising case $q=2$; both proofs rest on a discrete holomorphic observable that exists only for those two models.", sources: [1] },
  { at: 65750, title: "The square-lattice gap", text: "For every other $q$, and for percolation on the square lattice rather than the triangular one, the convergence stayed open, and it is one of the central problems of two-dimensional probability.", sources: [1] },
  { at: 78000, title: "The claimed convergence", text: "Between 23 September and 5 October 2026 OpenAI posted six papers, roughly 62,000 lines of source, claiming the convergence for every cluster weight from $0$ to $4$, the full ensemble of nested loops, and Cardy's crossing formula for square-lattice percolation.", sources: [1, 2, 3, 4] },
  { at: 94500, title: "The dated review ledger", text: "As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs.", sources: [1, 5, 6] },
] as const;
export const FILM_DURATION = 101250;

// Each hold completes its finite example, parameter plot or evidence ledger.
export const SETTLED_TIMES = [7500, 17250, 32500, 42500, 50500, 64000, 76000, 93000, 101250] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

export const SCENE_TIMES = {
  grid: 0,
  models: 8250,
  loops: 18000,
  parameter: 33250,
  formula: 44000,
  humanProofs: 51000,
  openProblem: 65750,
  claim: 78000,
  review: 94500,
} as const;

const SCENE_NAMES = ['grid', 'models', 'loops', 'parameter', 'formula', 'humanProofs', 'openProblem', 'claim', 'review'] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function sitesProgress(time: number): number {
  return progress(time, 0, 1500);
}

export function edgesProgress(time: number): number {
  return progress(time, 1500, 6500);
}

export function q1RetreatProgress(time: number): number {
  return smooth(time, 8250, 9750);
}

export function q2EnterProgress(time: number): number {
  return smooth(time, 9750, 11500);
}

export function q2RetreatProgress(time: number): number {
  return smooth(time, 13000, 14500);
}

export function q3EnterProgress(time: number): number {
  return smooth(time, 14500, 16250);
}

export function q3RetreatProgress(time: number): number {
  return smooth(time, 18000, 19250);
}

export function q1ReturnProgress(time: number): number {
  return smooth(time, 19250, 20750);
}

export function loopTraceProgress(time: number): number {
  return progress(time, 20750, 24750);
}

export function loopZoomProgress(time: number): number {
  return smooth(time, 25250, 27750);
}

export function loopReturnProgress(time: number): number {
  return smooth(time, 29000, 31500);
}

export function thumbnailsProgress(time: number): number {
  return smooth(time, 33250, 36500);
}

export function thumbnailLeadProgress(time: number): number {
  return smooth(time, 33250, 34750);
}

export function thumbnailSiblingsProgress(time: number): number {
  return smooth(time, 34750, 36500);
}

export function axesProgress(time: number): number {
  return progress(time, 36500, 38500);
}

export function leadersProgress(time: number): number {
  return progress(time, 38750, 41750);
}

export function kappaCurveProgress(time: number): number {
  return progress(time, 44000, 47250);
}

export function kappaReadoutsProgress(time: number): number {
  return progress(time, 47250, 50250);
}

export function triangularProofProgress(time: number): number {
  return progress(time, 51000, 54250);
}

export function isingProofProgress(time: number): number {
  return progress(time, 55000, 58250);
}

export function predictedDashProgress(time: number): number {
  return progress(time, 59500, 61750);
}

export function squareOpenProgress(time: number): number {
  return progress(time, 65750, 68500);
}

export function openProblemProgress(time: number): number {
  return progress(time, 69500, 71250);
}

export function claimStrokeProgress(time: number): number {
  return progress(time, 78000, 83250);
}

export function claimScopeProgress(time: number): number {
  return progress(time, 83250, 86750);
}

export function qRingsProgress(time: number): number {
  return progress(time, 86750, 90000);
}

export function ledgerProgress(time: number): number {
  return progress(time, 94500, 97000);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    sites: sitesProgress(time),
    edges: edgesProgress(time),
    q1Retreat: q1RetreatProgress(time),
    q2Enter: q2EnterProgress(time),
    q2Retreat: q2RetreatProgress(time),
    q3Enter: q3EnterProgress(time),
    q3Retreat: q3RetreatProgress(time),
    q1Return: q1ReturnProgress(time),
    loopTrace: loopTraceProgress(time),
    loopZoom: loopZoomProgress(time),
    loopReturn: loopReturnProgress(time),
    thumbnails: thumbnailsProgress(time),
    thumbnailLead: thumbnailLeadProgress(time),
    thumbnailSiblings: thumbnailSiblingsProgress(time),
    axes: axesProgress(time),
    leaders: leadersProgress(time),
    kappaCurve: kappaCurveProgress(time),
    kappaReadouts: kappaReadoutsProgress(time),
    triangularProof: triangularProofProgress(time),
    isingProof: isingProofProgress(time),
    predictedDash: predictedDashProgress(time),
    squareOpen: squareOpenProgress(time),
    openProblem: openProblemProgress(time),
    claimStroke: claimStrokeProgress(time),
    claimScope: claimScopeProgress(time),
    qRings: qRingsProgress(time),
    ledger: ledgerProgress(time),
  };
}

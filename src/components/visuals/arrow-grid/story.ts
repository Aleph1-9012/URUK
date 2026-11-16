import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Arrows and neighbouring agreement", text: "Put an arrow at every point of a square grid, free to point in any direction in the plane, and let neighbouring arrows prefer to agree, with a strength $b$ that plays the role of inverse temperature.", sources: [1, 2, 3, 4] },
  { at: 12750, title: "The XY model", text: "This is the XY model, the simplest model of a thin magnetic film or a film of superfluid helium.", sources: [1, 2, 3, 4] },
  { at: 19250, title: "No magnetic order", text: "In two dimensions it cannot order: Mermin and Wagner showed that no temperature, however low, makes all the arrows point the same way.", sources: [1, 2, 3, 4] },
  { at: 28000, title: "Long-distance memory", text: "At low temperature the arrows remember each other over long distances, with correlations fading like a power of the distance.", sources: [1, 2, 3, 4] },
  { at: 36250, title: "Counting vortices in finite samples", text: "At high temperature vortices, points around which the arrows turn a full circle, unbind and destroy the memory exponentially fast.", sources: [1, 2, 3, 4] },
  { at: 44750, title: "The critical correlation formulas", text: "Kosterlitz's renormalization-group analysis predicted the exact numbers at the transition: correlations decay like $r^{-1/4}$ with a $(\\log r)^{1/8}$ correction.", sources: [1, 2] },
  { at: 54250, title: "The correlation-length prediction", text: "The correlation length just above the transition blows up like $e^{A/\\sqrt{b_c-b}}$, an essential singularity unlike any ordinary phase transition.", sources: [1, 2, 3] },
  { at: 63000, title: "The known low-temperature phase", text: "Fröhlich and Spencer proved in 1981 that the low-temperature phase exists; the exact critical numbers remained predictions.", sources: [1] },
  { at: 71000, title: "The claimed critical laws", text: "Between 24 September and 5 October 2026 OpenAI posted six papers, about 461 pages, claiming all of them for the ordinary square-lattice model.", sources: [1, 2, 3, 4] },
  { at: 80250, title: "The dated review ledger", text: "As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs.", sources: [1, 5, 6] },
] as const;
export const FILM_DURATION = 87000;

// Reduced motion holds each completed sample, formula plot or evidence ledger.
export const SETTLED_TIMES = [11500, 18000, 26750, 35000, 43750, 53500, 62000, 69750, 78750, 87000] as const;

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
  model: 12750,
  noOrder: 19250,
  memory: 28000,
  vortices: 36250,
  correlation: 44750,
  length: 54250,
  knownPhase: 63000,
  claim: 71000,
  review: 80250,
} as const;

const SCENE_NAMES = ['grid', 'model', 'noOrder', 'memory', 'vortices', 'correlation', 'length', 'knownPhase', 'claim', 'review'] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function populateProgress(time: number): number {
  return progress(time, 0, 4000);
}

export function alignProgress(time: number): number {
  return smooth(time, 3000, 10000);
}

export function coldProgress(time: number): number {
  return smooth(time, 12750, 15750);
}

export function noOrderProgress(time: number): number {
  return progress(time, 19250, 22000);
}

export function memoryThreadProgress(time: number): number {
  return progress(time, 28000, 31000);
}

export function memoryInsetProgress(time: number): number {
  return progress(time, 31500, 34250);
}

export function warmProgress(time: number): number {
  return smooth(time, 36250, 38250);
}

export function hotProgress(time: number): number {
  return smooth(time, 38750, 41000);
}

export function vortexZoomProgress(time: number): number {
  return smooth(time, 41250, 43250);
}

export function gridInsetProgress(time: number): number {
  return smooth(time, 44750, 47250);
}

const AXIS_CARRY_START = 46000;

export const AXIS_CARRY_GRID_INSET = gridInsetProgress(AXIS_CARRY_START);

export function axisCarryProgress(time: number): number {
  return smooth(time, AXIS_CARRY_START, 48750);
}

export function pureCurveProgress(time: number): number {
  return progress(time, 49000, 50750);
}

export function correctedCurveProgress(time: number): number {
  return progress(time, 50750, 52500);
}

export function slopeReadoutsProgress(time: number): number {
  return progress(time, 52500, 53250);
}

export function lengthAxisProgress(time: number): number {
  return smooth(time, 54250, 56500);
}

export function lengthCurveProgress(time: number): number {
  return progress(time, 56500, 60250);
}

export function lengthReadoutsProgress(time: number): number {
  return progress(time, 60250, 61750);
}

export function knownPhaseProgress(time: number): number {
  return progress(time, 63000, 65500);
}

export function claimMarksProgress(time: number): number {
  return progress(time, 71000, 74750);
}

export function ledgerProgress(time: number): number {
  return progress(time, 80250, 82500);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    populate: populateProgress(time),
    align: alignProgress(time),
    cold: coldProgress(time),
    noOrder: noOrderProgress(time),
    memoryThread: memoryThreadProgress(time),
    memoryInset: memoryInsetProgress(time),
    warm: warmProgress(time),
    hot: hotProgress(time),
    vortexZoom: vortexZoomProgress(time),
    gridInset: gridInsetProgress(time),
    axisCarry: axisCarryProgress(time),
    pureCurve: pureCurveProgress(time),
    correctedCurve: correctedCurveProgress(time),
    slopeReadouts: slopeReadoutsProgress(time),
    lengthAxis: lengthAxisProgress(time),
    lengthCurve: lengthCurveProgress(time),
    lengthReadouts: lengthReadoutsProgress(time),
    knownPhase: knownPhaseProgress(time),
    claimMarks: claimMarksProgress(time),
    ledger: ledgerProgress(time),
  };
}

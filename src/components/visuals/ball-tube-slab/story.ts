import { mix, progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "A ball in ordinary space", text: "In ordinary three-dimensional space, a ball encloses a given volume with the least surface area.", sources: [] },
  { at: 6500, title: "The periodic cell", text: "Now make the space periodic. Leaving a cube through one face brings you back through the opposite face.", sources: [] },
  { at: 14500, title: "Wrapped regions", text: "A region can wrap around this space, so it has options that an isolated ball does not.", sources: [1, 3] },
  { at: 20500, title: "Three candidate area curves", text: "The expected sequence is a ball for small volume, a circular tube that wraps around one direction for intermediate volume, and a slab for larger volume.", sources: [1, 2, 3] },
  { at: 30500, title: "The claimed full classification", text: "OpenAI's paper dated 24 September 2026 claims that these are all the minimizers, including exactly which shapes tie when one type gives way to another.", sources: [1, 2, 3] },
  { at: 40250, title: "The two envelope transitions", text: "The two transitions occur at volume fractions $4\\pi/81$, about $15.5\\%$, and $1/\\pi$, about $31.8\\%$.", sources: [1, 6, 12] },
  { at: 48250, title: "Alternative sections at equal scale", text: "At the first transition the ball has radius $1/3$, while the competing tube has radius $2/9$. They have equal volume and area, not equal radius. Their common perimeter is $4\\pi/9$.", sources: [1] },
  { at: 59500, title: "The dated specialist search", text: "Our search on 7 November found no public specialist verification of OpenAI's complete proof, so its human-review label here is \"unreviewed\".", sources: [12] },
  { at: 68500, title: "The reported formal check", text: "A kernel check of a formal statement is distinct from a specialist's assessment of the manuscript and its correspondence to that statement.", sources: [8, 9] },
] as const;

export const FILM_DURATION = 77500;

export const SETTLED_TIMES = [6250, 14250, 20250, 30250, 40000, 48000, 59250, 68250, 77500] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

export const SCENE_TIMES = {
  ordinary: 0,
  periodic: 6500,
  wrapping: 14500,
  candidates: 20500,
  claim: 30500,
  transitions: 40250,
  alternatives: 48250,
  review: 59500,
  ledger: 68500,
} as const;

const SCENE_NAMES = ["ordinary", "periodic", "wrapping", "candidates", "claim", "transitions", "alternatives", "review", "ledger"] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function ballProgress(time: number): number {
  return progress(time, 0, 2250);
}

export function discGrowProgress(time: number): number {
  return smooth(time, 2250, 5500);
}

export function cellProgress(time: number): number {
  return progress(time, 6500, 8500);
}

export function wrapProgress(time: number): number {
  return smooth(time, 8500, 12500);
}

export function slabProgress(time: number): number {
  return smooth(time, 14500, 16500);
}

export function tubeProgress(time: number): number {
  return smooth(time, 16500, 19000);
}

export function curvesProgress(time: number): number {
  return progress(time, 20500, 23500);
}

export function envelopeProgress(time: number): number {
  return progress(time, 23500, 25000);
}

export function volumeScanProgress(time: number): number {
  return smooth(time, 25000, 29500);
}

export const SCAN_PHASES = { firstArrival: .28, firstDeparture: .38, secondArrival: .68, secondDeparture: .78 } as const;

export function scanAmount(time: number): number {
  return mix(volumeScanProgress(time), SCAN_PHASES.firstArrival, comparisonCarryProgress(time));
}

export function tiesProgress(time: number): number {
  return progress(time, 30500, 32750);
}

export function claimScopeProgress(time: number): number {
  return progress(time, 32750, 38000);
}

export function transitionTicksProgress(time: number): number {
  return progress(time, 40250, 43000);
}

export function transitionLabelsProgress(time: number): number {
  return progress(time, 43000, 47000);
}

export function comparisonCarryProgress(time: number): number {
  return smooth(time, 48250, 51000);
}

export function secondFrameProgress(time: number): number {
  return smooth(time, 51000, 53500);
}

export function comparisonRadiiProgress(time: number): number {
  return progress(time, 53500, 57000);
}

export function comparisonReadoutProgress(time: number): number {
  return progress(time, 57000, 58500);
}

export function unreviewedProgress(time: number): number {
  return progress(time, 59500, 62500);
}

export function reviewDateProgress(time: number): number {
  return progress(time, 62500, 66000);
}

export function ledgerProgress(time: number): number {
  return progress(time, 68500, 72500);
}

export function replayReportProgress(time: number): number {
  return progress(time, 72500, 76000);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    ball: ballProgress(time),
    discGrow: discGrowProgress(time),
    cell: cellProgress(time),
    wrap: wrapProgress(time),
    slab: slabProgress(time),
    tube: tubeProgress(time),
    curves: curvesProgress(time),
    envelope: envelopeProgress(time),
    volumeScan: volumeScanProgress(time),
    scanAmount: scanAmount(time),
    ties: tiesProgress(time),
    claimScope: claimScopeProgress(time),
    transitionTicks: transitionTicksProgress(time),
    transitionLabels: transitionLabelsProgress(time),
    comparisonCarry: comparisonCarryProgress(time),
    secondFrame: secondFrameProgress(time),
    comparisonRadii: comparisonRadiiProgress(time),
    comparisonReadout: comparisonReadoutProgress(time),
    unreviewed: unreviewedProgress(time),
    reviewDate: reviewDateProgress(time),
    ledger: ledgerProgress(time),
    replayReport: replayReportProgress(time),
  };
}

import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "The random cells", text: "Throw points at random onto the plane and give each one the region of the plane closer to it than to any other point.", sources: [1] },
  { at: 7750, title: "A fair colouring", text: "Now colour each cell black or white by a fair coin.", sources: [1] },
  { at: 11750, title: "One black crossing", text: "Bollobás and Riordan proved in 2006 that one half is exactly the critical colour density: at that point black regions are on the edge of spanning the plane.", sources: [1, 3] },
  { at: 21750, title: "The shape of the window", text: "Physicists predicted in the 1990s, and Smirnov proved in 2001 for the triangular lattice, that at criticality the probability that a black path crosses a given shape from one side to another depends only on the conformal geometry of the shape.", sources: [1] },
  { at: 37000, title: "No preferred direction", text: "The Voronoi mosaic is the test case with no lattice at all: no preferred directions, no symmetry to exploit.", sources: [1] },
  { at: 44250, title: "Four boundary marks", text: "The conformal map of $D$ onto the upper half-plane sending $a,c,d$ to $0,1,\\infty$ sends $b$ to a number $x\\in(0,1)$, the cross-ratio.", sources: [1] },
  { at: 52250, title: "Cardy and the finite toy", text: "The same function as for every other critical planar percolation model.", sources: [1] },
  { at: 58250, title: "The claimed limit", text: "On 23 September 2026 OpenAI posted a paper claiming Cardy's formula for the Poisson-Voronoi model in every Jordan domain, followed on 5 October by two papers on pivotal cells and near-critical universality.", sources: [1, 2, 4] },
  { at: 71250, title: "Two sources of randomness", text: "The main theorem is annealed: the probability averages over both the random mosaic and the colours.", sources: [1] },
  { at: 78000, title: "The dated review", text: "As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs.", sources: [1] },
  { at: 84750, title: "Machine checking", text: "Family 224 has no Lean scope note and no comparator statement in the release.", sources: [6] },
] as const;

export const FILM_DURATION = 90250;

// Scene four holds the completed tall picture before the same window returns.
export const SETTLED_TIMES = [7250, 11250, 21000, 33500, 43500, 51500, 57750, 70500, 77500, 84250, 90250] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

export const SCENE_TIMES = {
  mosaic: 0,
  colour: 7750,
  critical: 11750,
  geometry: 21750,
  isotropy: 37000,
  crossRatio: 44250,
  cardy: 52250,
  claim: 58250,
  annealed: 71250,
  review: 78000,
  machine: 84750,
} as const;

const SCENE_NAMES = ["mosaic", "colour", "critical", "geometry", "isotropy", "crossRatio", "cardy", "claim", "annealed", "review", "machine"] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function sitesProgress(time: number): number {
  return progress(time, 0, 2000);
}

export function cellsProgress(time: number): number {
  return smooth(time, 2000, 7000);
}

export function blackProgress(time: number): number {
  return progress(time, 7750, 10500);
}

export function gaugeProgress(time: number): number {
  return progress(time, 11750, 13000);
}

export function chainProgress(time: number): number {
  return progress(time, 13000, 18500);
}

export function floodProgress(time: number): number {
  return progress(time, 13000, 16000);
}

export function routeProgress(time: number): number {
  return progress(time, 16000, 18500);
}

export function wideProgress(time: number): number {
  return smooth(time, 21750, 26000);
}

export function wideRouteProgress(time: number): number {
  return progress(time, 26000, 27750);
}

export function turnProgress(time: number): number {
  return smooth(time, 28000, 32000);
}

export function unturnProgress(time: number): number {
  return smooth(time, 34000, 35250);
}

export function squareProgress(time: number): number {
  return smooth(time, 35250, 37000);
}

export function compassProgress(time: number): number {
  return smooth(time, 37000, 40500);
}

export function compassReturnProgress(time: number): number {
  return smooth(time, 40500, 42500);
}

export function boundaryProgress(time: number): number {
  return progress(time, 44250, 45750);
}

export function halfLineProgress(time: number): number {
  return smooth(time, 45750, 49000);
}

export function crossRatioReadoutsProgress(time: number): number {
  return progress(time, 49000, 51000);
}

export function plotAxesProgress(time: number): number {
  return progress(time, 52250, 53750);
}

export function cardyCurveProgress(time: number): number {
  return progress(time, 53750, 55250);
}

export function toyBarsProgress(time: number): number {
  return progress(time, 55250, 57250);
}

export function claimRingsProgress(time: number): number {
  return progress(time, 58250, 61250);
}

export function claimBracketProgress(time: number): number {
  return progress(time, 61250, 63750);
}

export function claimTagsProgress(time: number): number {
  return progress(time, 63750, 67000);
}

export function companionProgress(time: number): number {
  return progress(time, 67000, 69500);
}

export function annealedTicksProgress(time: number): number {
  return progress(time, 71250, 76250);
}

export function mosaicInsetProgress(time: number): number {
  return smooth(time, 78000, 80250);
}

export function unreviewedProgress(time: number): number {
  return progress(time, 80250, 82750);
}

export function machineProgress(time: number): number {
  return progress(time, 84750, 87500);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    sites: sitesProgress(time),
    cells: cellsProgress(time),
    black: blackProgress(time),
    gauge: gaugeProgress(time),
    chain: chainProgress(time),
    flood: floodProgress(time),
    route: routeProgress(time),
    wide: wideProgress(time),
    wideRoute: wideRouteProgress(time),
    turn: turnProgress(time),
    unturn: unturnProgress(time),
    square: squareProgress(time),
    compass: compassProgress(time),
    compassReturn: compassReturnProgress(time),
    boundary: boundaryProgress(time),
    halfLine: halfLineProgress(time),
    crossRatioReadouts: crossRatioReadoutsProgress(time),
    plotAxes: plotAxesProgress(time),
    cardyCurve: cardyCurveProgress(time),
    toyBars: toyBarsProgress(time),
    claimRings: claimRingsProgress(time),
    claimBracket: claimBracketProgress(time),
    claimTags: claimTagsProgress(time),
    companion: companionProgress(time),
    annealedTicks: annealedTicksProgress(time),
    mosaicInset: mosaicInsetProgress(time),
    unreviewed: unreviewedProgress(time),
    machine: machineProgress(time),
  };
}

import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "A schematic segmented image", text: "In 1989 David Mumford and Jayant Shah proposed a way to segment an image into regions.", sources: [1, 2] },
  { at: 9000, title: "The three energy costs", text: "Find a smooth approximation $u$ of the picture $g$, allowed to jump across a set $K$ of edges, that minimizes the sum of three costs, the roughness of $u$ away from the edges, the total length of the edges, and the distance from the original image.", sources: [1] },
  { at: 25000, title: "The three local edge types", text: "Mumford and Shah conjectured what the optimal edge set looks like: in the interior of the image, a finite union of smooth arcs, each either continuing, ending at a free \"crack tip\", or meeting two others at exactly $120$ degrees, like the junctions in a soap foam.", sources: [1, 2] },
  { at: 41500, title: "A hypothetical blow-up obstruction", text: "The last obstacle was to exclude a bounded piece of edge floating in a blow-up limit.", sources: [1] },
  { at: 49500, title: "Two submitted proofs", text: "In September 2026 two proofs appeared within two days.", sources: [1, 3] },
  { at: 55500, title: "The interior regularity claim", text: "Every $x\\in K$ has an interior neighbourhood in which $K$ is, with $C^{1,\\alpha}$ arcs for some $\\alpha>0$, (i) a single embedded arc with $x$ in its interior, (ii) a single embedded arc ending at $x$, or (iii) three embedded arcs meeting only at $x$ with pairwise angles of $120$ degrees.", sources: [1] },
  { at: 72750, title: "Global components meeting an interior set", text: "Moreover, for every open $U$ compactly contained in $\\Omega$, only finitely many global connected components of $K$ meet $U$.", sources: [1] },
  { at: 84750, title: "The crack-tip exponent", text: "$\\nabla u\\in L^{4,\\infty}_{\\mathrm{loc}}(\\Omega)$ and $\\nabla u\\in L^{p}_{\\mathrm{loc}}$ for every $p<4$, the exponent reflecting the inverse-square-root gradient at a crack tip.", sources: [1] },
  { at: 94750, title: "The dated review ledger", text: "As of 20 October 2026 no mathematician has said publicly that they have read or checked either proof.", sources: [1, 3, 4] },
] as const;

export const FILM_DURATION = 102750;

export const SETTLED_TIMES = [8750, 24750, 41250, 49250, 55250, 72500, 84500, 94500, 102750] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Each reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

const SCENE_NAMES = ["image", "energy", "localTypes", "blowUp", "twoProofs", "claim", "components", "tip", "ledger"] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Each cue needs its named drawing scene.');

  return scene;
}

export function imagePatchesProgress(time: number): number {
  return progress(time, 0, 2500);
}

export function imageTraceProgress(time: number): number {
  return progress(time, 2500, 6500);
}

export function toySlideProgress(time: number): number {
  return smooth(time, 9000, 11000);
}

export function noEdgeProgress(time: number): number {
  return progress(time, 11000, 15000);
}

export function cutProgress(time: number): number {
  return progress(time, 15000, 18500);
}

export function scanProgress(time: number): number {
  return progress(time, 18500, 22500);
}

export function imageReturnProgress(time: number): number {
  return smooth(time, 25000, 27000);
}

export function localTypesProgress(time: number): number {
  return progress(time, 27000, 29500);
}

export function junctionProgress(time: number): number {
  return smooth(time, 29500, 33000);
}

export function networkProgress(time: number): number {
  return progress(time, 33000, 37500);
}

export function anglesProgress(time: number): number {
  return progress(time, 37500, 40500);
}

export function blowUpProgress(time: number): number {
  return smooth(time, 41500, 45000);
}

export function floatingProgress(time: number): number {
  return progress(time, 45000, 48000);
}

export function twoProofsProgress(time: number): number {
  return progress(time, 49500, 53000);
}

export function claimProgress(time: number): number {
  return smooth(time, 58000, 62000);
}

export function excludeProgress(time: number): number {
  return progress(time, 55500, 58000);
}

export function claimScopeProgress(time: number): number {
  return progress(time, 62500, 70500);
}

export function openSetProgress(time: number): number {
  return progress(time, 72750, 75750);
}

export function componentCountProgress(time: number): number {
  return progress(time, 75750, 81000);
}

export function tipZoomProgress(time: number): number {
  return smooth(time, 84750, 87500);
}

export function tipArrowsProgress(time: number): number {
  return progress(time, 87500, 90500);
}

export function tipTableProgress(time: number): number {
  return progress(time, 90500, 93500);
}

export function reviewProgress(time: number): number {
  return progress(time, 94750, 97750);
}

export function ledgerProgress(time: number): number {
  return progress(time, 97750, 101500);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    imagePatches: imagePatchesProgress(time),
    imageTrace: imageTraceProgress(time),
    toySlide: toySlideProgress(time),
    noEdge: noEdgeProgress(time),
    cut: cutProgress(time),
    scan: scanProgress(time),
    imageReturn: imageReturnProgress(time),
    localTypes: localTypesProgress(time),
    junction: junctionProgress(time),
    network: networkProgress(time),
    angles: anglesProgress(time),
    blowUp: blowUpProgress(time),
    floating: floatingProgress(time),
    twoProofs: twoProofsProgress(time),
    claim: claimProgress(time),
    exclude: excludeProgress(time),
    claimScope: claimScopeProgress(time),
    openSet: openSetProgress(time),
    componentCount: componentCountProgress(time),
    tipZoom: tipZoomProgress(time),
    tipArrows: tipArrowsProgress(time),
    tipTable: tipTableProgress(time),
    review: reviewProgress(time),
    ledger: ledgerProgress(time),
  };
}

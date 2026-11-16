import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Neutrality", text: "A nucleus of charge $Z$ attracts electrons until $Z$ of them make it neutral.", sources: [] },
  { at: 5750, title: "More electrons?", text: "Can it hold more?", sources: [] },
  { at: 8750, title: "The laboratory observation", text: "In the laboratory, at most one: hydrogen binds a second electron, as do most elements, and no isolated atom has ever been seen holding two extra.", sources: [1] },
  { at: 18250, title: "Strict binding", text: "The $n$-th electron is strictly bound if $E_n<E_{n-1}$: adding it lowers the energy.", sources: [1] },
  { at: 24250, title: "A schematic plateau", text: "The sequence $E_n$ is nonincreasing and eventually constant, and the question is where it stops decreasing.", sources: [1] },
  { at: 31500, title: "The true many-body problem", text: "Proving any of this from the Schr\u00f6dinger equation turned out to be very hard.", sources: [1] },
  { at: 37000, title: "Lieb\u2019s exact wall", text: "Elliott Lieb showed in 1984 that an atom cannot bind $2Z+1$ electrons, which leaves room for $Z$ extra.", sources: [1, 5] },
  { at: 44000, title: "A universal excess?", text: "The conjecture that the excess is bounded by a universal constant is Problem 9 on Barry Simon's list of open problems for the twenty-first century.", sources: [3] },
  { at: 53500, title: "The uniform molecular claim", text: "On 24 September 2026 OpenAI posted three papers claiming it, together with the generalized version Solovej formulated about the outer electrons of heavy atoms.", sources: [1, 2] },
  { at: 63750, title: "The dated review and companions", text: "As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs.", sources: [1] },
] as const;

export const FILM_DURATION = 70500;

export const SETTLED_TIMES = [5500, 8500, 18000, 24000, 31250, 36750, 43750, 53250, 63500, 70500] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

export const SCENE_TIMES = {
  neutral: 0,
  more: 5750,
  laboratory: 8750,
  binding: 18250,
  plateau: 24250,
  hard: 31500,
  lieb: 37000,
  conjecture: 44000,
  claim: 53500,
  review: 63750,
} as const;

const SCENE_NAMES = ["neutral", "more", "laboratory", "binding", "plateau", "hard", "lieb", "conjecture", "claim", "review"] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function nucleusProgress(time: number): number {
  return progress(time, 0, 1750);
}

export function neutralElectronsProgress(time: number): number {
  return smooth(time, 1750, 4750);
}

export function extraSlotsProgress(time: number): number {
  return smooth(time, 5750, 7750);
}

export function hydrogenProgress(time: number): number {
  return smooth(time, 8750, 11250);
}

export function labSecondProgress(time: number): number {
  return smooth(time, 11250, 14000);
}

export function labCrossProgress(time: number): number {
  return progress(time, 14000, 16750);
}

export function stairProgress(time: number): number {
  return progress(time, 18250, 21000);
}

export function bindingProbeProgress(time: number): number {
  return progress(time, 21000, 23000);
}

export function plateauProgress(time: number): number {
  return smooth(time, 24250, 26500);
}

export function chargeCycleProgress(time: number): number {
  return progress(time, 26500, 30500);
}

export function pullbackProgress(time: number): number {
  return smooth(time, 31500, 34500);
}

export function liebWallProgress(time: number): number {
  return progress(time, 37000, 39250);
}

export function wallValuesProgress(time: number): number {
  return progress(time, 39250, 42000);
}

export function liebHatchProgress(time: number): number {
  return progress(time, 42000, 43500);
}

export function questionBracketProgress(time: number): number {
  return progress(time, 44000, 47000);
}

export function symbolicResizeProgress(time: number): number {
  return smooth(time, 47000, 52000);
}

export function claimBracketProgress(time: number): number {
  return progress(time, 53500, 56000);
}

export function nucleiProgress(time: number): number {
  return smooth(time, 56000, 58500);
}

export function uniformScopeProgress(time: number): number {
  return progress(time, 58500, 62000);
}

export function reviewProgress(time: number): number {
  return progress(time, 63750, 65500);
}

export function companionLedgerProgress(time: number): number {
  return progress(time, 65500, 69000);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    nucleus: nucleusProgress(time),
    neutralElectrons: neutralElectronsProgress(time),
    extraSlots: extraSlotsProgress(time),
    hydrogen: hydrogenProgress(time),
    labSecond: labSecondProgress(time),
    labCross: labCrossProgress(time),
    stair: stairProgress(time),
    bindingProbe: bindingProbeProgress(time),
    plateau: plateauProgress(time),
    chargeCycle: chargeCycleProgress(time),
    pullback: pullbackProgress(time),
    liebWall: liebWallProgress(time),
    wallValues: wallValuesProgress(time),
    liebHatch: liebHatchProgress(time),
    questionBracket: questionBracketProgress(time),
    symbolicResize: symbolicResizeProgress(time),
    claimBracket: claimBracketProgress(time),
    nuclei: nucleiProgress(time),
    uniformScope: uniformScopeProgress(time),
    review: reviewProgress(time),
    companionLedger: companionLedgerProgress(time),
  };
}

import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "A marked material particle", text: "Mark one particle in a fluid initially at rest.", sources: [] },
  { at: 4000, title: "A programmed force and detector", text: "Apply a force specified by a finite program, and watch a fixed region.", sources: [] },
  { at: 9000, title: "A halting question", text: "Can the particle enter that region exactly when the program finishes?", sources: [] },
  { at: 14000, title: "A toy coding sheet", text: "A flow can encode a machine state in a particle's position.", sources: [1, 11] },
  { at: 19000, title: "Tape symbols as separated digits", text: "For example, successive digits of a coordinate can represent successive tape symbols.", sources: [1, 11] },
  { at: 25000, title: "Two exact toy runs", text: "A map that removes one leading digit and adds another can implement a tape operation.", sources: [1, 11] },
  { at: 37000, title: "Four area-preserving shears", text: "A shear moves parallel layers sideways without compressing them.", sources: [1] },
  { at: 46000, title: "Retaining the lost information", text: "A machine instruction can destroy information.", sources: [1] },
  { at: 56000, title: "The family\u2019s smooth-flow claim", text: "OpenAI's family of nine papers claims such constructions for smooth viscous flows.", sources: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { at: 62000, title: "What is fixed before the input", text: "The point and detector are fixed before the input is supplied. The force is allowed to depend on the input.", sources: [1] },
  { at: 70000, title: "Smooth constructed examples", text: "These are particular flows designed to remain smooth for all time. They do not settle the general Navier-Stokes existence and smoothness problem.", sources: [] },
  { at: 79500, title: "The dated review", text: "As of 7 November 2026, we found no public specialist statement accepting these proofs, no journal acceptance, and no identified mathematical error in this family.", sources: [18] },
  { at: 90000, title: "The bounded formal scope", text: "Some statements include complete halting equivalences; the set does not cover every claim in all nine manuscripts.", sources: [20, 21] },
] as const;

export const FILM_DURATION = 97500;

export const SETTLED_TIMES = [3750, 8750, 13750, 18750, 24750, 36750, 45750, 55750, 61750, 69750, 79250, 89750, 97500] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

export const SCENE_TIMES = {
  fluid: 0,
  detector: 4000,
  question: 9000,
  encoding: 14000,
  digits: 19000,
  tapeStep: 25000,
  shears: 37000,
  history: 46000,
  claim: 56000,
  fixed: 62000,
  smooth: 70000,
  review: 79500,
  ledger: 90000,
} as const;

const SCENE_NAMES = ["fluid", "detector", "question", "encoding", "digits", "tapeStep", "shears", "history", "claim", "fixed", "smooth", "review", "ledger"] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function fluidProgress(time: number): number {
  return progress(time, 0, 2000);
}

export function markProgress(time: number): number {
  return progress(time, 2000, 3500);
}

export function detectorProgress(time: number): number {
  return progress(time, 4000, 6000);
}

export function programProgress(time: number): number {
  return smooth(time, 6000, 8000);
}

export function questionProgress(time: number): number {
  return smooth(time, 9000, 12500);
}

export function loaderProgress(time: number): number {
  return smooth(time, 14000, 17500);
}

export function sheetProgress(time: number): number {
  return progress(time, 17500, 18500);
}

export function digitsProgress(time: number): number {
  return progress(time, 19000, 21500);
}

export function bandsProgress(time: number): number {
  return progress(time, 21500, 24000);
}

export function aRunProgress(time: number): number {
  return progress(time, 25000, 30500);
}

export function aReturnProgress(time: number): number {
  return smooth(time, 30500, 32000);
}

export function sRunProgress(time: number): number {
  return progress(time, 32000, 35500);
}

export function shearSourceProgress(time: number): number {
  return smooth(time, 37000, 38500);
}

export function shearOneProgress(time: number): number {
  return smooth(time, 38500, 40000);
}

export function shearTwoProgress(time: number): number {
  return smooth(time, 40000, 41500);
}

export function shearThreeProgress(time: number): number {
  return smooth(time, 41500, 43000);
}

export function shearFourProgress(time: number): number {
  return smooth(time, 43000, 44500);
}

export function translateProgress(time: number): number {
  return smooth(time, 44500, 45500);
}

export function historyInputsProgress(time: number): number {
  return smooth(time, 46000, 48500);
}

export function overwriteProgress(time: number): number {
  return smooth(time, 48500, 51000);
}

export function historyLiftProgress(time: number): number {
  return smooth(time, 51000, 54500);
}

export function overviewReturnProgress(time: number): number {
  return smooth(time, 56000, 58500);
}

export function claimProgress(time: number): number {
  return progress(time, 58500, 61000);
}

export function fixedProgress(time: number): number {
  return progress(time, 62000, 65000);
}

export function inputForceProgress(time: number): number {
  return progress(time, 65000, 68250);
}

export function smoothProgress(time: number): number {
  return progress(time, 70000, 73500);
}

export function scopeProgress(time: number): number {
  return progress(time, 73500, 77500);
}

export function unreviewedProgress(time: number): number {
  return progress(time, 79500, 83000);
}

export function reviewDateProgress(time: number): number {
  return progress(time, 83000, 88000);
}

export function formalProgress(time: number): number {
  return progress(time, 90000, 94000);
}

export function replayProgress(time: number): number {
  return progress(time, 94000, 96500);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    fluid: fluidProgress(time),
    mark: markProgress(time),
    detector: detectorProgress(time),
    program: programProgress(time),
    question: questionProgress(time),
    loader: loaderProgress(time),
    sheet: sheetProgress(time),
    digits: digitsProgress(time),
    bands: bandsProgress(time),
    aRun: aRunProgress(time),
    aReturn: aReturnProgress(time),
    sRun: sRunProgress(time),
    shearSource: shearSourceProgress(time),
    shearOne: shearOneProgress(time),
    shearTwo: shearTwoProgress(time),
    shearThree: shearThreeProgress(time),
    shearFour: shearFourProgress(time),
    translate: translateProgress(time),
    historyInputs: historyInputsProgress(time),
    overwrite: overwriteProgress(time),
    historyLift: historyLiftProgress(time),
    overviewReturn: overviewReturnProgress(time),
    claim: claimProgress(time),
    fixed: fixedProgress(time),
    inputForce: inputForceProgress(time),
    smooth: smoothProgress(time),
    scope: scopeProgress(time),
    unreviewed: unreviewedProgress(time),
    reviewDate: reviewDateProgress(time),
    formal: formalProgress(time),
    replay: replayProgress(time),
  };
}

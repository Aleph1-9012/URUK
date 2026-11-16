import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "A schematic plasma", text: "A plasma is a gas of charged particles.", sources: [] },
  { at: 5000, title: "Particle-field feedback", text: "Each particle moves under the electric and magnetic fields, and the fields are created by the particles, so the whole thing feeds back on itself.", sources: [] },
  { at: 14500, title: "Momentum and relativistic speed", text: "A particle with momentum $v$ has relativistic velocity $u(v)=v/\\sqrt{1+|v|^{2}}$, always below the speed of light, which is $1$ here.", sources: [1] },
  { at: 22250, title: "The continuation criterion", text: "Glassey and Strauss proved in 1986 that a classical solution can be continued as long as the momentum support of $f$ stays bounded: breakdown requires particles accelerated without limit.", sources: [1, 3, 4] },
  { at: 34250, title: "Assuming a finite horizon", text: "So blow-up requires a particle whose momentum becomes unbounded in finite time.", sources: [1] },
  { at: 40250, title: "A toy sum of claimed waiting gaps", text: "The time needed to double the largest momentum from $2^{n-1}$ to $2^{n}$ is at least $c/\\log(2+1024\\cdot2^{n})$, and the sum of these lower bounds diverges.", sources: [1] },
  { at: 56250, title: "The global regularity claim", text: "On 23 September 2026 OpenAI posted a paper claiming the general case: for every smooth initial state with compactly supported particles, the three-dimensional relativistic system has a unique smooth solution for all time.", sources: [1, 3, 4] },
  { at: 70000, title: "Bounds on each finite interval", text: "The bound on momentum support holds on each finite interval and may grow with it; the paper does not claim uniform-in-time bounds or describe the solution's behaviour as $t\\to\\infty$.", sources: [1] },
  { at: 81250, title: "The dated review", text: "As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof.", sources: [] },
  { at: 88000, title: "The formal-statement ledger", text: "A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval.", sources: [2, 6] },
] as const;

export const FILM_DURATION = 95750;

export const SETTLED_TIMES = [4750, 14250, 22000, 34000, 40000, 56000, 69750, 81000, 87750, 95750] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

export const SCENE_TIMES = {
  swarm: 0,
  feedback: 5000,
  velocity: 14500,
  criterion: 22250,
  finiteHorizon: 34250,
  doubling: 40250,
  global: 56250,
  finiteCaps: 70000,
  review: 81250,
  ledger: 88000,
} as const;

const SCENE_NAMES = ["swarm", "feedback", "velocity", "criterion", "finiteHorizon", "doubling", "global", "finiteCaps", "review", "ledger"] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function swarmProgress(time: number): number {
  return progress(time, 0, 2500);
}

export function ringProgress(time: number): number {
  return progress(time, 2500, 4250);
}

export function feedbackProgress(time: number): number {
  return progress(time, 5000, 10500);
}

export function ladderCarryProgress(time: number): number {
  return smooth(time, 14500, 17000);
}

export function velocityProgress(time: number): number {
  return progress(time, 17000, 20750);
}

export function energyCriterionProgress(time: number): number {
  return smooth(time, 22250, 26000);
}

export function climbProgress(time: number): number {
  return smooth(time, 26000, 32500);
}

export function timeAxisProgress(time: number): number {
  return progress(time, 34250, 36500);
}

export function horizonProgress(time: number): number {
  return progress(time, 36500, 39000);
}

export function gapsProgress(time: number): number {
  return progress(time, 40250, 44500);
}

export function partialSumsProgress(time: number): number {
  return smooth(time, 44500, 50500);
}

export function zoomProgress(time: number): number {
  return smooth(time, 50500, 53500);
}

export function harmonicProgress(time: number): number {
  return progress(time, 53500, 55000);
}

export function globalBracketProgress(time: number): number {
  return progress(time, 56250, 59500);
}

export function globalScopeProgress(time: number): number {
  return progress(time, 59500, 65000);
}

export function assumptionRetireProgress(time: number): number {
  return smooth(time, 65000, 68000);
}

export function capsProgress(time: number): number {
  return smooth(time, 70000, 75000);
}

export function capScopeProgress(time: number): number {
  return progress(time, 75000, 79500);
}

export function unreviewedProgress(time: number): number {
  return progress(time, 81250, 84000);
}

export function reviewDateProgress(time: number): number {
  return progress(time, 84000, 86500);
}

export function ledgerProgress(time: number): number {
  return progress(time, 88000, 93000);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    swarm: swarmProgress(time),
    ring: ringProgress(time),
    feedback: feedbackProgress(time),
    ladderCarry: ladderCarryProgress(time),
    velocity: velocityProgress(time),
    energyCriterion: energyCriterionProgress(time),
    climb: climbProgress(time),
    timeAxis: timeAxisProgress(time),
    horizon: horizonProgress(time),
    gaps: gapsProgress(time),
    partialSums: partialSumsProgress(time),
    zoom: zoomProgress(time),
    harmonic: harmonicProgress(time),
    globalBracket: globalBracketProgress(time),
    globalScope: globalScopeProgress(time),
    assumptionRetire: assumptionRetireProgress(time),
    caps: capsProgress(time),
    capScope: capScopeProgress(time),
    unreviewed: unreviewedProgress(time),
    reviewDate: reviewDateProgress(time),
    ledger: ledgerProgress(time),
  };
}

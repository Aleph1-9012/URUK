import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Equal overlaps in two levels", text: "Position and momentum are the classic pair: knowing one exactly leaves the other completely uncertain.", sources: [] },
  { at: 7000, title: "Equal probabilities in three levels", text: "For a quantum system with finitely many levels, $d$ of them, the analogue is a pair of measurement bases in which a definite outcome in one makes every outcome in the other equally likely.", sources: [] },
  { at: 19000, title: "Mutually unbiased measurements", text: "Such bases are called mutually unbiased, and they are the raw material of quantum state tomography and quantum key distribution.", sources: [] },
  { at: 27500, title: "Complete sets at prime dimensions", text: "At most $d+1$ bases can be pairwise unbiased, and when $d$ is a prime power, like $2$, $3$, $4$, $5$, $7$, $8$ or $9$, that many exist.", sources: [1, 3] },
  { at: 37250, title: "Three bases in six dimensions", text: "The first dimension that is not a prime power is six, and there nobody has ever found more than three, although seven would be allowed.", sources: [] },
  { at: 46000, title: "Zauner\u2019s conjecture", text: "Gerhard Zauner conjectured in his 1991 diploma thesis that three is the maximum.", sources: [] },
  { at: 51500, title: "Two different exclusion claims", text: "On 24 September 2026 OpenAI posted two papers: one claims, by a certified computation, that four unbiased bases do not exist in dimension six; the other proves by exact arithmetic that seven do not and settles a related conjecture about $6\\times6$ Hadamard matrices.", sources: [1, 2] },
  { at: 67750, title: "The dated review and Lean scope", text: "As of 18 October 2026 no mathematician has said publicly that they have checked the proofs.", sources: [1, 2] },
] as const;

export const FILM_DURATION = 74000;

export const SETTLED_TIMES = [6750, 18750, 27250, 37000, 45750, 51250, 67500, 74000] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

export const SCENE_TIMES = {
  two: 0,
  unbiased: 7000,
  applications: 19000,
  primes: 27500,
  six: 37250,
  zauner: 46000,
  claims: 51500,
  ledger: 67750,
} as const;

const SCENE_NAMES = ["two", "unbiased", "applications", "primes", "six", "zauner", "claims", "ledger"] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function tableProgress(time: number): number {
  return progress(time, 0, 2500);
}

export function stippleProgress(time: number): number {
  return progress(time, 2500, 5500);
}

export function rowLiftProgress(time: number): number {
  return smooth(time, 7000, 10000);
}

export function outcomeBarsProgress(time: number): number {
  return progress(time, 10000, 12000);
}

export function dimensionThreeProgress(time: number): number {
  return smooth(time, 12000, 16000);
}

export function thirdsProgress(time: number): number {
  return progress(time, 16000, 18000);
}

export function applicationsProgress(time: number): number {
  return progress(time, 19000, 22500);
}

export function primeCarryProgress(time: number): number {
  return smooth(time, 27500, 31000);
}

export function primeSetsProgress(time: number): number {
  return progress(time, 31000, 35000);
}

export function primePowerTicksProgress(time: number): number {
  return progress(time, 35000, 36500);
}

export function sixCarryProgress(time: number): number {
  return smooth(time, 38250, 40000);
}

export function primeRetireProgress(time: number): number {
  return smooth(time, 37250, 38250);
}

export function tripleProgress(time: number): number {
  return progress(time, 40000, 42000);
}

export function slotsProgress(time: number): number {
  return progress(time, 42000, 44500);
}

export function zaunerProgress(time: number): number {
  return progress(time, 46000, 48750);
}

export function noFourProgress(time: number): number {
  return progress(time, 51500, 54000);
}

export function conditionsProgress(time: number): number {
  return progress(time, 54000, 57750);
}

export function noSevenProgress(time: number): number {
  return progress(time, 57750, 60000);
}

export function weinerProgress(time: number): number {
  return progress(time, 60000, 62750);
}

export function claimReadoutProgress(time: number): number {
  return progress(time, 62750, 66000);
}

export function unreviewedProgress(time: number): number {
  return progress(time, 67750, 69000);
}

export function replicationProgress(time: number): number {
  return progress(time, 69000, 70750);
}

export function leanProgress(time: number): number {
  return progress(time, 70750, 73000);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    table: tableProgress(time),
    stipple: stippleProgress(time),
    rowLift: rowLiftProgress(time),
    outcomeBars: outcomeBarsProgress(time),
    dimensionThree: dimensionThreeProgress(time),
    thirds: thirdsProgress(time),
    applications: applicationsProgress(time),
    primeCarry: primeCarryProgress(time),
    primeSets: primeSetsProgress(time),
    primePowerTicks: primePowerTicksProgress(time),
    sixCarry: sixCarryProgress(time),
    primeRetire: primeRetireProgress(time),
    triple: tripleProgress(time),
    slots: slotsProgress(time),
    zauner: zaunerProgress(time),
    noFour: noFourProgress(time),
    conditions: conditionsProgress(time),
    noSeven: noSevenProgress(time),
    weiner: weinerProgress(time),
    claimReadout: claimReadoutProgress(time),
    unreviewed: unreviewedProgress(time),
    replication: replicationProgress(time),
    lean: leanProgress(time),
  };
}

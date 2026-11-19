import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: 'Two players on the grid', text: 'Two players take turns claiming squares on an unlimited sheet of graph paper.', sources: [1, 2, 3, 4] },
  { at: 5500, title: 'Eight target orientations', text: 'One of them, Maker, is trying to own all six squares of a particular shape, in any position, rotated or reflected; the other, Breaker, wants only to stop this.', sources: [1, 2, 3, 4] },
  { at: 15750, title: 'The six-cell target', text: 'The shape is Snaky, a row of four squares with a two-square tail stepping up at one end.', sources: [1, 2, 3, 4] },
  { at: 21750, title: 'Claims are permanent', text: 'Maker moves first and the players alternate, each claiming one unclaimed cell, permanently.', sources: [1] },
  { at: 28000, title: 'A conditional base claim', text: 'If Maker owns five cells of a Snaky placement and Breaker none of the six, one move completes it.', sources: [1] },
  { at: 34500, title: 'Two threats at once', text: "Breaker's next cell $b$ is not owned by Maker, so $b\\notin\\bigcap T_i$, and some child envelope $T_i$ avoids it.", sources: [1] },
  { at: 45500, title: 'A distant reply misses both', text: 'A Breaker reply outside $T$ misses every child envelope, so distant play needs no case analysis; this is what removes any board cutoff.', sources: [1] },
  { at: 54500, title: 'Height gives an upper bound', text: 'Each nonterminal step spends one Maker move and strictly decreases the height, so the game ends within $21$ Maker moves.', sources: [1] },
  { at: 62500, title: "The paper's certificate", text: 'On 25 September 2026 OpenAI posted a paper claiming that Maker wins on the plane in at most 21 moves, with the strategy written out as a finite certificate of 728 conditions and a checker program.', sources: [1, 2, 3, 4] },
  { at: 75000, title: 'A finite board and envelope', text: 'The same bound holds on a finite $17\\times17$ board, and Maker can confine its claims to a fixed board of 251 cells.', sources: [1] },
  { at: 82250, title: 'What the checker does', text: 'The checker does not play the game or search; it verifies that the certificate is a valid instance of the proved rule.', sources: [1] },
  { at: 90000, title: 'Where the proof stands', text: 'As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof.', sources: [1] },
] as const;

export const FILM_DURATION = 96750;

export const SETTLED_TIMES = [5250, 15500, 21500, 27750, 34250, 45250, 54250, 62250, 74750, 82000, 89750, 96750] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

const SCENE_NAMES = ['grid', 'orientations', 'snaky', 'turns', 'base', 'fork', 'outside', 'height', 'certificate', 'finite', 'checker', 'ledger'] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function gridProgress(time: number): number {
  return progress(time, 0, 2000);
}

export function firstMarksProgress(time: number): number {
  return progress(time, 2000, 4500);
}

export function clearProgress(time: number): number {
  return smooth(time, 5500, 6500);
}

export function orientationProgress(time: number): number {
  return progress(time, 6500, 14500);
}

export function settleProgress(time: number): number {
  return smooth(time, 15750, 17000);
}

export function rowProgress(time: number): number {
  return progress(time, 17000, 18750);
}

export function tailProgress(time: number): number {
  return progress(time, 18750, 20500);
}

export function turnsProgress(time: number): number {
  return progress(time, 21750, 26500);
}

export function baseProgress(time: number): number {
  return smooth(time, 28000, 29500);
}

export function baseFinishProgress(time: number): number {
  return progress(time, 29500, 32000);
}

export function forkProgress(time: number): number {
  return smooth(time, 34500, 37000);
}

export function requiredProgress(time: number): number {
  return progress(time, 37000, 39000);
}

export function pivotProgress(time: number): number {
  return progress(time, 39000, 40500);
}

export function breakerProgress(time: number): number {
  return progress(time, 40500, 42000);
}

export function answerProgress(time: number): number {
  return progress(time, 42000, 44000);
}

export function distantProgress(time: number): number {
  return progress(time, 45500, 47500);
}

export function insetProgress(time: number): number {
  return smooth(time, 47500, 49000);
}

export function heightThreeProgress(time: number): number {
  return smooth(time, 49000, 52000);
}

export function heightCountdownProgress(time: number): number {
  return progress(time, 54500, 58500);
}

export function paperScaleProgress(time: number): number {
  return progress(time, 58500, 61000);
}

export function certificateProgress(time: number): number {
  return smooth(time, 62500, 65000);
}

export function claimsProgress(time: number): number {
  return progress(time, 65000, 69000);
}

export function checkerProgress(time: number): number {
  return progress(time, 69000, 73000);
}

export function pullbackProgress(time: number): number {
  return smooth(time, 75000, 77500);
}

export function pivotClaimProgress(time: number): number {
  return progress(time, 77500, 79000);
}

export function envelopeProgress(time: number): number {
  return progress(time, 79000, 81000);
}

export function checkScopeProgress(time: number): number {
  return progress(time, 82250, 85750);
}

export function formalProgress(time: number): number {
  return progress(time, 85750, 88500);
}

export function reviewProgress(time: number): number {
  return progress(time, 90000, 93000);
}

export function ledgerProgress(time: number): number {
  return progress(time, 93000, 95500);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    grid: gridProgress(time),
    firstMarks: firstMarksProgress(time),
    clear: clearProgress(time),
    orient: orientationProgress(time),
    settle: settleProgress(time),
    row: rowProgress(time),
    tail: tailProgress(time),
    turns: turnsProgress(time),
    base: baseProgress(time),
    baseFinish: baseFinishProgress(time),
    fork: forkProgress(time),
    requiredA: requiredProgress(time),
    pivot: pivotProgress(time),
    breaker: breakerProgress(time),
    answer: answerProgress(time),
    distant: distantProgress(time),
    inset: insetProgress(time),
    height3: heightThreeProgress(time),
    heightCountdown: heightCountdownProgress(time),
    paperScale: paperScaleProgress(time),
    certificate: certificateProgress(time),
    claims: claimsProgress(time),
    checker: checkerProgress(time),
    pullback: pullbackProgress(time),
    pivotClaim: pivotClaimProgress(time),
    envelope: envelopeProgress(time),
    checkScope: checkScopeProgress(time),
    formal: formalProgress(time),
    review: reviewProgress(time),
    ledger: ledgerProgress(time),
  };
}

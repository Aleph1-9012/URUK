import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Absolute zero", text: "A bar magnet is strongest at absolute zero.", sources: [] },
  { at: 4000, title: "Long and short waves", text: "Warm it a little and its magnetization drops, and in 1930 Felix Bloch worked out how: the loss grows like the temperature to the power three halves, because the cheapest disturbances of a perfectly aligned magnet are long, slow waves of tilted spins, and their number at temperature $T$ scales like $T^{3/2}$.", sources: [1] },
  { at: 23000, title: "The ideal-magnon count", text: "The coefficient is the density of ideal \"magnons\", spin waves treated as non-interacting bosons with energy $Sk^{2}$ at wavenumber $k$.", sources: [1] },
  { at: 31750, title: "The textbook law", text: "Bloch's law is in every solid-state textbook and is confirmed by experiment.", sources: [1] },
  { at: 37000, title: "The quantum model", text: "What nobody had proved is that it follows from the standard quantum model of a magnet, Heisenberg's: a lattice of quantum spins, each wanting to point the same way as its neighbours.", sources: [1] },
  { at: 48500, title: "The missing ordering proof", text: "It was not even proved that this model is magnetized at all at any positive temperature in three dimensions, a question Elliott Lieb put on his list of open problems in 1999 and Robert Seiringer called \"the famous open problem\" in 2025.", sources: [1, 2] },
  { at: 63250, title: "The limiting claim", text: "On 24 September 2026 OpenAI posted a paper claiming the magnetization, and on 5 October three more claiming Bloch's law with its exact coefficient, the next correction term, and the uniform direction of the magnetization in a large box.", sources: [1, 2, 3, 4] },
  { at: 78000, title: "The dated review", text: "As of 3 November 2026 no mathematician has said publicly that they have checked any of the four proofs.", sources: [9] },
  { at: 85000, title: "The formal-statement ledger", text: "A Lean statement exists for the magnetization result alone and is not in the release's catalogue.", sources: [10] },
] as const;

export const FILM_DURATION = 91500;

export const SETTLED_TIMES = [3750, 22750, 31500, 36750, 48250, 63000, 77750, 84750, 91500] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

const SCENE_NAMES = ["zero", "waves", "ideal", "experiment", "model", "unproved", "claim", "review", "ledger"] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function arrowsProgress(time: number): number {
  return progress(time, 0, 2500);
}

export function axesProgress(time: number): number {
  return progress(time, 2500, 3750);
}

export function warmProgress(time: number): number {
  return smooth(time, 4000, 9000);
}

export function longWaveProgress(time: number): number {
  return progress(time, 9000, 13500);
}

export function shortWaveProgress(time: number): number {
  return progress(time, 13500, 16500);
}

export function blochProgress(time: number): number {
  return progress(time, 16500, 21000);
}

export function idealProgress(time: number): number {
  return progress(time, 23000, 25000);
}

export function cursorFirstProgress(time: number): number {
  return smooth(time, 25000, 26250);
}

export function cursorSecondProgress(time: number): number {
  return smooth(time, 27500, 29000);
}

export function cursorProgress(time: number): number {
  return (cursorFirstProgress(time) + 2 * cursorSecondProgress(time)) / 3;
}

export function experimentProgress(time: number): number {
  return progress(time, 31750, 34500);
}

export function blockProgress(time: number): number {
  return smooth(time, 37000, 41000);
}

export function blockFillProgress(time: number): number {
  return smooth(time, 41000, 45500);
}

export function unprovedProgress(time: number): number {
  return progress(time, 48500, 53000);
}

export function historicalProgress(time: number): number {
  return progress(time, 53000, 59000);
}

export function claimBracketProgress(time: number): number {
  return progress(time, 63250, 66000);
}

export function limitFormulaProgress(time: number): number {
  return progress(time, 66000, 69000);
}

export function nextTermProgress(time: number): number {
  return progress(time, 69000, 72000);
}

export function hypothesesProgress(time: number): number {
  return progress(time, 72000, 76000);
}

export function unreviewedProgress(time: number): number {
  return progress(time, 78000, 81000);
}

export function reviewDateProgress(time: number): number {
  return progress(time, 81000, 83500);
}

export function ledgerProgress(time: number): number {
  return progress(time, 85000, 89000);
}

export function replayProgress(time: number): number {
  return progress(time, 89000, 90750);
}

export function waveClock(time: number): number {
  return Math.max(0, (time - 4000) / 5000);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    waveClock: waveClock(time),
    arrows: arrowsProgress(time),
    axes: axesProgress(time),
    warm: warmProgress(time),
    longWave: longWaveProgress(time),
    shortWave: shortWaveProgress(time),
    bloch: blochProgress(time),
    ideal: idealProgress(time),
    cursorFirst: cursorFirstProgress(time),
    cursorSecond: cursorSecondProgress(time),
    cursor: cursorProgress(time),
    experiment: experimentProgress(time),
    block: blockProgress(time),
    blockFill: blockFillProgress(time),
    unproved: unprovedProgress(time),
    historical: historicalProgress(time),
    claimBracket: claimBracketProgress(time),
    limitFormula: limitFormulaProgress(time),
    nextTerm: nextTermProgress(time),
    hypotheses: hypothesesProgress(time),
    unreviewed: unreviewedProgress(time),
    reviewDate: reviewDateProgress(time),
    ledger: ledgerProgress(time),
    replay: replayProgress(time),
  };
}

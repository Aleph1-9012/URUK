import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "The same six points", text: "Cut a set into pieces.", sources: [] },
  { at: 6000, title: "Choosing from inside", text: "The Axiom of Choice lets you pick one point from every piece at once, however many pieces there are.", sources: [1] },
  { at: 13000, title: "An injection can leave its piece", text: "A weaker-sounding statement, the Partition Principle, says only that there are never more pieces than points: some one-to-one map sends each piece to a point, though the point need not lie in its own piece.", sources: [1, 4] },
  { at: 26000, title: "All finite injections", text: "For six points cut into pieces of sizes one, two and three there are $120$ injections from pieces to points and only six of them pick from inside; for infinite sets the gap between the two is the whole question.", sources: [1, 4] },
  { at: 39250, title: "The question since 1902", text: "Beppo Levi stated the principle in 1902.", sources: [1, 4] },
  { at: 43250, title: "Three withdrawn preprints", text: "Three preprints in 2025 and 2026 claimed a model in which the principle holds and Choice fails, and all three were withdrawn.", sources: [1, 4] },
  { at: 51500, title: "The new paper", text: "On 24 September 2026 OpenAI posted a forty-four-page paper claiming such a model.", sources: [1] },
  { at: 57250, title: "The relative-consistency claim", text: "If ZF is consistent, then so is $\\mathrm{ZF}+\\mathrm{PP}+\\mathrm{AC}_{\\mathrm{WO}}+\\neg\\mathrm{AC}$.", sources: [1] },
  { at: 65250, title: "Theorem 1.1 scope", text: "No atoms and no large cardinals are used in Theorem 1.1.", sources: [1] },
  { at: 69500, title: "The dated expert reading", text: "As of 18 October 2026 the paper has been read by one expert, Karagila, who rejected its exposition in strong terms, reported no mathematical error, and said he will not read further.", sources: [1, 3] },
  { at: 81000, title: "The formalization ledger", text: "A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval.", sources: [5, 6] },
] as const;

export const FILM_DURATION = 88750;

export const SETTLED_TIMES = [5500, 12750, 25000, 38500, 43000, 51000, 56500, 64750, 69000, 80500, 88750] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

export const SCENE_TIMES = {
  pieces: 0,
  inside: 6000,
  outside: 13000,
  board: 26000,
  levi: 39250,
  withdrawals: 43250,
  paper: 51500,
  diagram: 57250,
  scope: 65250,
  reader: 69500,
  ledger: 81000,
} as const;

const SCENE_NAMES = ["pieces", "inside", "outside", "board", "levi", "withdrawals", "paper", "diagram", "scope", "reader", "ledger"] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function pointsProgress(time: number): number {
  return progress(time, 0, 2000);
}

export function piecesProgress(time: number): number {
  return smooth(time, 2000, 5000);
}

export function insideEnterProgress(time: number): number {
  return smooth(time, 6000, 7500);
}

export function insideCycleProgress(time: number): number {
  return progress(time, 7500, 12250);
}

export function outsideProgress(time: number): number {
  return smooth(time, 13000, 16500);
}

export function outsideMarkProgress(time: number): number {
  return progress(time, 16500, 18000);
}

export function questionProgress(time: number): number {
  return progress(time, 18000, 20500);
}

export function boardSetupProgress(time: number): number {
  return smooth(time, 26000, 27500);
}

export function boardFillProgress(time: number): number {
  return progress(time, 27500, 35500);
}

export function boardReadoutProgress(time: number): number {
  return progress(time, 35500, 38000);
}

export function boardFoldProgress(time: number): number {
  return smooth(time, 39250, 41250);
}

export function dateLineProgress(time: number): number {
  return progress(time, 41250, 42500);
}

export function withdrawnSheetsProgress(time: number): number {
  return smooth(time, 43250, 46000);
}

export function withdrawnBarsProgress(time: number): number {
  return progress(time, 46000, 49000);
}

export function newSheetProgress(time: number): number {
  return smooth(time, 51500, 54000);
}

export function paperTagProgress(time: number): number {
  return progress(time, 54000, 56000);
}

export function diagramCarryProgress(time: number): number {
  return smooth(time, 57250, 59000);
}

export function nodesProgress(time: number): number {
  return smooth(time, 59000, 60000);
}

export function questionCarryProgress(time: number): number {
  return smooth(time, 57250, 60250);
}

export function knownArrowsProgress(time: number): number {
  return progress(time, 60000, 61250);
}

export function claimCutProgress(time: number): number {
  return progress(time, 61250, 62750);
}

export function claimTagProgress(time: number): number {
  return progress(time, 62750, 64250);
}

export function scopeTagsProgress(time: number): number {
  return progress(time, 65250, 67500);
}

export function readerMarkProgress(time: number): number {
  return progress(time, 69500, 72000);
}

export function expositionProgress(time: number): number {
  return progress(time, 72000, 75000);
}

export function reviewDateProgress(time: number): number {
  return progress(time, 75000, 77500);
}

export function ledgerProgress(time: number): number {
  return progress(time, 81000, 85000);
}

export function replayProgress(time: number): number {
  return progress(time, 85000, 87500);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    points: pointsProgress(time),
    pieces: piecesProgress(time),
    insideEnter: insideEnterProgress(time),
    insideCycle: insideCycleProgress(time),
    outside: outsideProgress(time),
    outsideMark: outsideMarkProgress(time),
    question: questionProgress(time),
    boardSetup: boardSetupProgress(time),
    boardFill: boardFillProgress(time),
    boardReadout: boardReadoutProgress(time),
    boardFold: boardFoldProgress(time),
    dateLine: dateLineProgress(time),
    withdrawnSheets: withdrawnSheetsProgress(time),
    withdrawnBars: withdrawnBarsProgress(time),
    newSheet: newSheetProgress(time),
    paperTag: paperTagProgress(time),
    diagramCarry: diagramCarryProgress(time),
    nodes: nodesProgress(time),
    questionCarry: questionCarryProgress(time),
    knownArrows: knownArrowsProgress(time),
    claimCut: claimCutProgress(time),
    claimTag: claimTagProgress(time),
    scopeTags: scopeTagsProgress(time),
    readerMark: readerMarkProgress(time),
    exposition: expositionProgress(time),
    reviewDate: reviewDateProgress(time),
    ledger: ledgerProgress(time),
    replay: replayProgress(time),
  };
}

import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "A linked network", text: "Colour the points of a network so that no two linked points share a colour.", sources: [4] },
  { at: 5250, title: "The proposed hidden complete network", text: "In 1943 Hugo Hadwiger proposed that this is the whole story for every network, flat or not: if a network needs $t$ colours, then it must contain the complete network on $t$ points, in which every pair is linked, in a loosened sense called a minor.", sources: [4] },
  { at: 21000, title: "The odd ring needs three", text: "A five-cycle, five vertices in a ring, needs three colours, because two colours would have to alternate around a ring of odd length and would collide.", sources: [4] },
  { at: 30750, title: "Contract two edges", text: "In the five-cycle, contract two neighbouring edges and a triangle remains, so $h=3$.", sources: [1, 4] },
  { at: 36500, title: "No three strangers", text: "When $\\alpha(G)\\le2$, no three vertices are pairwise non-adjacent: among any three people in the network, two know each other.", sources: [1, 5] },
  { at: 44250, title: "Small exact examples", text: "Then every colour class has at most two vertices, so a graph on $m$ vertices needs at least $m/2$ colours, and Hadwiger's conjecture demands a complete minor on at least $m/2$ vertices.", sources: [1, 5] },
  { at: 56000, title: "A schematic large network", text: "On 23 September 2026 OpenAI posted a paper claiming that it is false, with counterexamples in the special family that experts had long suspected might hide one.", sources: [1, 2, 3, 4, 5] },
  { at: 66250, title: "Pairwise joined matching edges", text: "A connected matching is a set of disjoint edges such that every two of them are joined by at least one further edge.", sources: [1] },
  { at: 74000, title: "The claimed sparse connected matching", text: "There are arbitrarily large integers $m$ for which some $m$-vertex graph $G$ satisfies $\\alpha(G)\\le2$ and $\\mathrm{cm}(G)<m/100$.", sources: [1] },
  { at: 81250, title: "The claimed minor upper bound", text: "The paper proves that any graph satisfies $h(G)\\le\\bigl(|V(G)|+4\\,\\mathrm{cm}(G)+2\\bigr)/3$.", sources: [1] },
  { at: 85250, title: "Only sufficiently large orders", text: "The graphs exist only for sufficiently large $m$; the paper fixes its constants in a long chain and gives no explicit size and no explicit graph.", sources: [1] },
  { at: 94750, title: "The dated review record", text: "As of 17 October 2026 no mathematician has said publicly that they have checked the counterexample.", sources: [9, 10, 11] },
  { at: 101500, title: "Formal evidence and approval", text: "A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval.", sources: [12] },
] as const;

export const FILM_DURATION = 109000;

const BASE_TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

// These frames hold the completed explanation before its supporting marks retire.
// In particular, the triangle and forbidden-triple insets are still full size.
export const SETTLED_TIMES = [5000, 18000, 27500, 34500, 42000, 55000, 61000, 73000, 79000, 85000, 93000, 98000, 109000] as const;

export const TIMELINE = {
  ...BASE_TIMELINE,
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its settled drawing frame.');

    return time;
  },
};

export const SCENE_TIMES = {
  opening: 0,
  conjecture: 5250,
  oddCycle: 21000,
  contraction: 30750,
  independence: 36500,
  examples: 44250,
  schematic: 56000,
  matching: 66250,
  claim: 74000,
  chart: 81250,
  gap: 85250,
  ledger: 94750,
  formalEvidence: 101500,
} as const;

const SCENE_NAMES = [
  'opening', 'conjecture', 'oddCycle', 'contraction', 'independence',
  'examples', 'schematic', 'matching', 'claim', 'chart', 'gap', 'ledger', 'formalEvidence',
] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Each film cue needs its named drawing scene.');

  return scene;
}

export function ringProgress(time: number): number {
  return smooth(time, 0, 1750);
}

export function edgeProgress(time: number): number {
  return progress(time, 250, 2750);
}

export function thirdColourProgress(time: number): number {
  return smooth(time, 5250, 6750);
}

export function minorHintProgress(time: number): number {
  return smooth(time, 9000, 11500) * (1 - smooth(time, 19500, 21000));
}

export function twoColourWalk(time: number): number {
  return progress(time, 21750, 26750);
}

export function colourResolution(time: number): number {
  return smooth(time, 28250, 29750);
}

export function contractionProgress(time: number): number {
  return smooth(time, 30750, 33250) * (1 - smooth(time, 36500, 38500));
}

export function contractionRelease(time: number): number {
  return smooth(time, 36500, 38500);
}

export function twoColourReplay(time: number): boolean {
  return time >= 21000 && time < 28250;
}

export function forbiddenTripleProgress(time: number): number {
  return smooth(time, 37500, 39500) * (1 - smooth(time, 42500, 44250));
}

export function colourPairProgress(time: number): number {
  return smooth(time, 44250, 45250);
}

export function relabellingProgress(time: number): number {
  return smooth(time, 44250, 45500);
}

export function exampleAt(time: number): { from: 5 | 6 | 7; to: 5 | 6 | 7 | 8; amount: number } {
  if (time < 46250) return { from: 5, to: 5, amount: 1 };
  if (time < 49500) return { from: 5, to: 6, amount: smooth(time, 46250, 47500) };
  if (time < 52750) return { from: 6, to: 7, amount: smooth(time, 49500, 50750) };

  return { from: 7, to: 8, amount: smooth(time, 52750, 54000) };
}

export function cloudProgress(time: number): number {
  return smooth(time, 56000, 59000);
}

export function matchingProgress(time: number): number {
  return smooth(time, 68500, 69750);
}

export function matchingConnection(time: number): number {
  return smooth(time, 69750, 72250);
}

export function definitionExpansion(time: number): number {
  return smooth(time, 66250, 68500);
}

export function definitionRetirement(time: number): number {
  return smooth(time, 74000, 76000);
}

export function definitionCloudShift(time: number): number {
  return definitionExpansion(time) * (1 - definitionRetirement(time));
}

export function claimProgress(time: number): number {
  return smooth(time, 74000, 75750);
}

export function chartProgress(time: number): number {
  return smooth(time, 81250, 84500);
}

export function gapProgress(time: number): number {
  return smooth(time, 85250, 87250);
}

export function ledgerProgress(time: number): number {
  return smooth(time, 94750, 96000);
}

export function replayMarkProgress(time: number): number {
  return smooth(time, 101500, 102750);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    ring: ringProgress(time),
    edges: edgeProgress(time),
    thirdColour: thirdColourProgress(time),
    minorHint: minorHintProgress(time),
    twoColourWalk: twoColourWalk(time),
    replayTwoColours: twoColourReplay(time),
    colourResolution: colourResolution(time),
    contraction: contractionProgress(time),
    contractionRelease: contractionRelease(time),
    forbiddenTriple: forbiddenTripleProgress(time),
    colourPairs: colourPairProgress(time),
    relabelling: relabellingProgress(time),
    example: exampleAt(time),
    cloud: cloudProgress(time),
    matching: matchingProgress(time),
    connection: matchingConnection(time),
    definitionExpansion: definitionExpansion(time),
    definitionRetirement: definitionRetirement(time),
    definitionCloudShift: definitionCloudShift(time),
    claim: claimProgress(time),
    chart: chartProgress(time),
    gap: gapProgress(time),
    ledger: ledgerProgress(time),
    replayMark: replayMarkProgress(time),
  };
}

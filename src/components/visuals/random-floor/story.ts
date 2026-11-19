import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: 'Maps may repeat a vertex', text: 'Take a small pattern graph $H$ and a large graph $G$, and drop the vertices of $H$ onto the vertices of $G$ at random, allowing repeats.', sources: [1, 2, 3] },
  { at: 9250, title: 'The homomorphism density', text: 'The chance that every edge of $H$ lands on an edge of $G$ is the homomorphism density $t(H,G)$.', sources: [1, 2, 3] },
  { at: 15750, title: 'The random benchmark', text: 'If $G$ is a random graph with edge density $p$, that chance is about $p^{e(H)}$.', sources: [1, 2, 3] },
  { at: 21250, title: 'Sidorenko asks for a floor', text: "In 1991 Alexander Sidorenko conjectured, following a question of Erdős and Simonovits about supersaturation, that for every bipartite pattern $H$ the random graph is the worst case: every $G$ of edge density $p$ has at least $p^{e(H)}$ density of copies of $H$.", sources: [1, 2, 3] },
  { at: 37750, title: 'Known patterns and a finite check', text: 'For trees, even cycles and complete bipartite graphs the inequality is classical.', sources: [1] },
  { at: 46750, title: 'Every pair occurs twice', text: 'The double occurrence of every pair is the engine.', sources: [1] },
  { at: 52750, title: "The paper's pattern is not drawn", text: "Let $H$ be the incidence graph of the 22 triples on 13 points in the paper's Table 1, a connected bipartite graph with 35 vertices and 66 edges.", sources: [1] },
  { at: 62250, title: 'The claimed counterexample', text: 'On 23 September 2026 OpenAI posted a paper claiming a counterexample: a specific bipartite graph on 35 vertices for which the random graph is not the worst case.', sources: [1, 2, 3] },
  { at: 72500, title: 'Existence of a finite host', text: 'It is an existence statement for $G$, obtained by sampling from a kernel, not an explicit small host.', sources: [1] },
  { at: 79500, title: 'A statement is not approval', text: 'A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval.', sources: [6] },
  { at: 87250, title: 'Where the proof stands', text: 'As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof.', sources: [] },
] as const;

export const FILM_DURATION = 94000;

export const SETTLED_TIMES = [9000, 15500, 21000, 37500, 46500, 52500, 62000, 72250, 79250, 87000, 94000] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

const SCENE_NAMES = ['drop', 'density', 'benchmark', 'conjecture', 'known', 'pairs', 'paper', 'claim', 'hostExistence', 'formal', 'ledger'] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function hostProgress(time: number): number {
  return progress(time, 0, 2500);
}

export function patternProgress(time: number): number {
  return progress(time, 1500, 3500);
}

export function dropProgress(time: number): number {
  return smooth(time, 3500, 8000);
}

export function mapsProgress(time: number): number {
  return progress(time, 9250, 12500);
}

export function densityProgress(time: number): number {
  return progress(time, 12500, 15000);
}

export function benchmarkProgress(time: number): number {
  return smooth(time, 15750, 17500);
}

export function benchmarkReturnProgress(time: number): number {
  return smooth(time, 21250, 22500);
}

export function cycleProgress(time: number): number {
  return smooth(time, 22500, 25500);
}

export function conjectureProgress(time: number): number {
  return progress(time, 25500, 28500);
}

export function cubeProgress(time: number): number {
  return smooth(time, 37750, 40500);
}

export function sweepProgress(time: number): number {
  return progress(time, 40500, 43500);
}

export function knownProgress(time: number): number {
  return progress(time, 43500, 45500);
}

export function triplesProgress(time: number): number {
  return smooth(time, 46750, 48750);
}

export function pairProgress(time: number): number {
  return progress(time, 48750, 51500);
}

export function paperProgress(time: number): number {
  return smooth(time, 52750, 56500);
}

export function arithmeticProgress(time: number): number {
  return progress(time, 56500, 60500);
}

export function claimProgress(time: number): number {
  return progress(time, 62250, 65500);
}

export function claimGaugeProgress(time: number): number {
  return progress(time, 65500, 69500);
}

export function hostOutlineProgress(time: number): number {
  return progress(time, 72500, 75750);
}

export function samplingProgress(time: number): number {
  return progress(time, 75750, 77750);
}

export function leanProgress(time: number): number {
  return progress(time, 79500, 82250);
}

export function notApprovalProgress(time: number): number {
  return progress(time, 82250, 85500);
}

export function reviewProgress(time: number): number {
  return progress(time, 87250, 90000);
}

export function ledgerProgress(time: number): number {
  return progress(time, 90000, 92500);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    host: hostProgress(time),
    pattern: patternProgress(time),
    drop: dropProgress(time),
    maps: mapsProgress(time),
    density: densityProgress(time),
    benchmark: benchmarkProgress(time),
    benchmarkOut: benchmarkReturnProgress(time),
    cycle: cycleProgress(time),
    conjecture: conjectureProgress(time),
    cube: cubeProgress(time),
    sweep: sweepProgress(time),
    known: knownProgress(time),
    triples: triplesProgress(time),
    pair: pairProgress(time),
    paper: paperProgress(time),
    arithmetic: arithmeticProgress(time),
    claim: claimProgress(time),
    claimGauge: claimGaugeProgress(time),
    hostOutline: hostOutlineProgress(time),
    sampling: samplingProgress(time),
    lean: leanProgress(time),
    notApproval: notApprovalProgress(time),
    review: reviewProgress(time),
    ledger: ledgerProgress(time),
  };
}

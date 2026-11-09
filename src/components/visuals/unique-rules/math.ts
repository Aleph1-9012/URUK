export type Edge = { from: number; to: number; opposite: boolean };

export const HIDDEN_LABELS = [0, 1, 0, 0, 1, 1, 0] as const;

const PAIRS = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1],
] as const;

export const EDGES = PAIRS.map(([from, to]) => ({ from, to, opposite: HIDDEN_LABELS[from] !== HIDDEN_LABELS[to] }));

export const BAD_EDGES = EDGES.map((edge) => edge.from === 3 && edge.to === 4 ? { ...edge, opposite: false } : edge);

export const CUT_EDGES = EDGES.map((edge) => ({ ...edge, opposite: true }));

export const WALK_EDGES = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [1, 0]] as const;

export function keepsRule(labels: readonly number[], edge: Edge): boolean {
  const from = labels[edge.from];
  const to = labels[edge.to];

  if (from === undefined || to === undefined) throw new RangeError('Each end of a rule needs a label.');

  return (from !== to) === edge.opposite;
}

export function keptCount(labels: readonly number[], edges: readonly Edge[]): number {
  let kept = 0;

  for (const edge of edges) {
    if (keepsRule(labels, edge)) kept += 1;
  }

  return kept;
}

export function walkLabels(edges: readonly Edge[]): number[] {
  const labels = Array.from({ length: 7 }, () => 0);
  labels[1] = 1;

  for (const [from, to] of WALK_EDGES) {
    const edge = edges.find((rule) => rule.from === from && rule.to === to || rule.from === to && rule.to === from);
    const current = labels[from];

    if (!edge || current === undefined) throw new Error('The prescribed walk needs all six of its rules.');

    labels[to] = current ^ Number(edge.opposite);
  }

  return labels;
}

export const WALK_LABELS = walkLabels(BAD_EDGES);

export type BestLabelling = { labels: readonly number[]; kept: number };

// All 128 labellings are examined. A preferred optimum keeps the same lamps through a scene change.
export function bestLabelling(edges: readonly Edge[], preferred: readonly number[] = HIDDEN_LABELS): BestLabelling {
  let best: BestLabelling = { labels: [...preferred], kept: keptCount(preferred, edges) };

  for (let mask = 0; mask < 128; mask += 1) {
    const labels = Array.from({ length: 7 }, (_, index) => mask >> index & 1);
    const kept = keptCount(labels, edges);

    if (kept > best.kept) best = { labels, kept };
  }

  return best;
}

export const BEST_LABELS = bestLabelling(BAD_EDGES).labels;

export const CUT_LABELS = bestLabelling(CUT_EDGES, [0, 0, 1, 0, 1, 0, 1]).labels;

// The gauge's illustrative promise widths are not parameters computed from the reduction.
export const EPSILON = 0.05;

export const DELTA = 0.15;

// Rounded for the drawing; its label must retain the approximation sign.
export const GW_RATIO = 0.87856;

export const VERTEX_COVER_FACTOR = 2;

export const NOISE_DETECTION = 1 / 8;

export const HIGH_RANK_ACCEPTANCE = 7 / 8;

// The curve's form is the paper's. These two constants are schematic choices.
export const AGREE_GAMMA = 0.15;

export const AGREE_C = 0.6;

export const AGREE_CROSSING = (Math.log(1 / AGREE_GAMMA) / AGREE_C) ** 3;

export function agreement(k: number): number {
  return Math.exp(-AGREE_C * Math.cbrt(k));
}

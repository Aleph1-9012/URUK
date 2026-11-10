// Only the canonical Python tournament history is shipped. All sets, scores and
// the exhaustive five-vertex check are recomputed from its arcs.
import data from './data.json';

export type Point = { x: number; y: number };

export type Arc = readonly [number, number];

export type PairDirection = -1 | 0 | 1;

export type VertexData = { vertex: number; first: number[]; second: number[]; firstCount: number; secondCount: number; holds: boolean; sink: boolean };

export type GraphScore = readonly [number, number];

export type PairChange = { pair: Arc; from: PairDirection; to: PairDirection; lost: number[]; gained: number[] };

export type GraphSnapshot = { arcs: Arc[]; vertices: VertexData[]; holders: number[]; sinks: number[]; score: GraphScore; change: PairChange | null };

export type PairCandidate = { pair: Arc; from: PairDirection; to: PairDirection; holders: number[]; sinks: number[]; score: GraphScore };

export type AdversaryAudit = { currentScore: GraphScore; best: PairCandidate; candidates: number; improves: boolean };

export type ExhaustiveResult = { n: number; total: number; withoutHolder: number; holderHistogram: number[]; sinkHistogram: number[]; firstCounterexample: Arc[] | null };

function validateOrder(n: number): void {
  if (!Number.isInteger(n) || n < 1 || n > 30) throw new RangeError('The finite bit-set calculation uses one to thirty labelled vertices.');
}

function popcount(value: number): number {
  let bits = value;
  bits -= (bits >>> 1) & 0x55555555;
  bits = (bits & 0x33333333) + ((bits >>> 2) & 0x33333333);

  return (((bits + (bits >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function adjacency(n: number, arcs: readonly Arc[]): Uint32Array<ArrayBuffer> {
  validateOrder(n);
  const out = new Uint32Array(n);

  for (const [a, b] of arcs) {
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= n || b >= n || a === b) throw new RangeError('Every arc joins two distinct existing vertices.');

    const row = out[a];

    if (row === undefined || row & (1 << b)) throw new Error('An arc is represented exactly once.');

    out[a] = row | (1 << b);
  }

  return out;
}

function secondBits(out: Uint32Array, vertex: number): number {
  const first = out[vertex];

  if (first === undefined) throw new RangeError('The selected vertex belongs to the graph.');

  let reached = 0;
  let remaining = first;

  while (remaining) {
    const bit = remaining & -remaining;
    const target = 31 - Math.clz32(bit);
    const row = out[target];

    if (row === undefined) throw new Error('An out-neighbour has its adjacency row.');

    reached |= row;
    remaining ^= bit;
  }

  return reached & ~first & ~(1 << vertex);
}

function members(bits: number, n: number): number[] {
  const result: number[] = [];

  for (let vertex = 0; vertex < n; vertex++) {
    if (bits & (1 << vertex)) result.push(vertex);
  }

  return result;
}

export function analyseGraph(n: number, arcs: readonly Arc[]): GraphSnapshot {
  const out = adjacency(n, arcs);
  const vertices: VertexData[] = [];
  const holders: number[] = [];
  const sinks: number[] = [];

  for (let vertex = 0; vertex < n; vertex++) {
    const firstBits = out[vertex];

    if (firstBits === undefined) throw new Error('Each vertex has its adjacency row.');

    const first = members(firstBits, n);
    const second = members(secondBits(out, vertex), n);
    const holds = first.length <= second.length;
    const sink = first.length === 0;
    vertices.push({ vertex, first, second, firstCount: first.length, secondCount: second.length, holds, sink });

    if (holds) holders.push(vertex);

    if (sink) sinks.push(vertex);
  }

  return { arcs: arcs.slice(), vertices, holders, sinks, score: [holders.length, sinks.length], change: null };
}

function direction(arcs: readonly Arc[], a: number, b: number): PairDirection {
  let found: PairDirection = 0;

  for (const [tail, head] of arcs) {
    if (tail === a && head === b) {
      if (found) throw new Error('A pair in an oriented graph has at most one arc.');

      found = 1;
    } else if (tail === b && head === a) {
      if (found) throw new Error('A pair in an oriented graph has at most one arc.');

      found = -1;
    }
  }

  return found;
}

export function arcsAfterChange(arcs: readonly Arc[], pair: Arc, to: PairDirection): Arc[] {
  const [a, b] = pair;
  const result: Arc[] = [];

  for (const arc of arcs) {
    if (!((arc[0] === a && arc[1] === b) || (arc[0] === b && arc[1] === a))) result.push(arc);
  }

  if (to === 1) result.push([a, b]);

  if (to === -1) result.push([b, a]);

  return result.sort((first, second) => first[0] - second[0] || first[1] - second[1]);
}

function scoreLess(first: GraphScore, second: GraphScore): boolean {
  return first[0] < second[0] || (first[0] === second[0] && first[1] < second[1]);
}

/** Pair order and direction order match Python's deterministic tie breaking. */
export function bestPairChange(n: number, arcs: readonly Arc[]): AdversaryAudit {
  const current = analyseGraph(n, arcs);
  let best: PairCandidate | null = null;
  let candidates = 0;
  const directions: readonly PairDirection[] = [0, 1, -1];

  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const from = direction(arcs, a, b);

      for (const to of directions) {
        if (to === from) continue;

        candidates++;
        const trial = analyseGraph(n, arcsAfterChange(arcs, [a, b], to));

        if (best === null || scoreLess(trial.score, best.score)) best = { pair: [a, b], from, to, holders: trial.holders, sinks: trial.sinks, score: trial.score };
      }
    }
  }

  if (best === null) throw new RangeError('The adversary needs at least two vertices.');

  return { currentScore: current.score, best, candidates, improves: scoreLess(best.score, current.score) };
}

/** All three possibilities (absent, forward, backward) for each of ten pairs. */
export function enumerateFive(): ExhaustiveResult {
  const n = 5;
  const pairs: Arc[] = [];

  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) pairs.push([a, b]);
  }

  const total = 3 ** pairs.length;
  const out = new Uint32Array(n);
  const holderHistogram = Array<number>(n + 1).fill(0);
  const sinkHistogram = Array<number>(n + 1).fill(0);
  let withoutHolder = 0;
  let firstCounterexample: Arc[] | null = null;

  for (let code = 0; code < total; code++) {
    out.fill(0);
    let quotient = code;

    for (const [a, b] of pairs) {
      const trit = quotient % 3;
      quotient = Math.floor(quotient / 3);

      if (trit === 1) out[a] = (out[a] ?? 0) | (1 << b);

      if (trit === 2) out[b] = (out[b] ?? 0) | (1 << a);
    }

    let holders = 0;
    let sinks = 0;

    for (let vertex = 0; vertex < n; vertex++) {
      const first = out[vertex];

      if (first === undefined) throw new Error('The exhaustive adjacency row exists.');

      if (popcount(first) <= popcount(secondBits(out, vertex))) holders++;

      if (first === 0) sinks++;
    }

    holderHistogram[holders] = (holderHistogram[holders] ?? 0) + 1;
    sinkHistogram[sinks] = (sinkHistogram[sinks] ?? 0) + 1;

    if (holders === 0) {
      withoutHolder++;

      if (firstCounterexample === null) {
        firstCounterexample = [];

        for (let a = 0; a < n; a++) {
          for (const b of members(out[a] ?? 0, n)) firstCounterexample.push([a, b]);
        }
      }
    }
  }

  return { n, total, withoutHolder, holderHistogram, sinkHistogram, firstCounterexample };
}

function inputArc(pair: readonly number[]): Arc {
  const a = pair[0];
  const b = pair[1];

  if (pair.length !== 2 || a === undefined || b === undefined) throw new Error('A canonical arc has exactly two endpoints.');

  return [a, b];
}

function changeBetween(previous: GraphSnapshot, current: GraphSnapshot, n: number): PairChange {
  let changed: { pair: Arc; from: PairDirection; to: PairDirection } | null = null;

  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const from = direction(previous.arcs, a, b);
      const to = direction(current.arcs, a, b);

      if (from === to) continue;

      if (changed !== null) throw new Error('A canonical adversary step changes one pair.');

      changed = { pair: [a, b], from, to };
    }
  }

  if (changed === null) throw new Error('A canonical adversary step changes a pair.');

  const lost: number[] = [];
  const gained: number[] = [];

  for (let vertex = 0; vertex < n; vertex++) {
    if (previous.holders.includes(vertex) && !current.holders.includes(vertex)) lost.push(vertex);

    if (!previous.holders.includes(vertex) && current.holders.includes(vertex)) gained.push(vertex);
  }

  return { ...changed, lost, gained };
}

export function createHoldModel() {
  const n = data.n;
  const history = data.history.map(entry => analyseGraph(n, entry.arcs.map(inputArc)));
  const audits: AdversaryAudit[] = [];

  for (const [index, snapshot] of history.entries()) {
    const audit = bestPairChange(n, snapshot.arcs);
    audits.push(audit);

    if (index === 0) continue;

    const previous = history[index - 1];
    const priorAudit = audits[index - 1];

    if (!previous || !priorAudit) throw new Error('Each later snapshot has its prior settled graph and audit.');

    snapshot.change = changeBetween(previous, snapshot, n);
    const actual = snapshot.change;

    if (!priorAudit.improves || priorAudit.best.pair[0] !== actual.pair[0] || priorAudit.best.pair[1] !== actual.pair[1] || priorAudit.best.to !== actual.to) throw new Error('The shipped history follows the independently recomputed best single-pair choices.');
  }

  const initial = history[0];
  const final = history.at(-1);
  const lastAudit = audits.at(-1);

  if (!initial || !final || !lastAudit || lastAudit.improves) throw new Error('The carried history finishes at its single-pair local optimum.');

  const positions: Point[] = Array.from({ length: n }, (_, vertex) => ({ x: Math.cos(-Math.PI / 2 + 2 * Math.PI * vertex / n), y: Math.sin(-Math.PI / 2 + 2 * Math.PI * vertex / n) }));
  const exhaustive = enumerateFive();
  const focus = [0, 1, 8];
  const ruleVertex = final.vertices[8];

  if (!ruleVertex) throw new Error('The illustration uses the actual final vertex numbered nine.');

  const fraction = .716;
  const rule = { fraction, vertex: ruleVertex.vertex, firstCount: ruleVertex.firstCount, secondCount: ruleVertex.secondCount, threshold: fraction * ruleVertex.firstCount };
  const cycle = analyseGraph(2, [[0, 1], [1, 0]]);

  return { n, positions, history, initial, final, audits, focus, cycle, rule, exhaustive, allOn5: exhaustive.total };
}

export type GraphModel = ReturnType<typeof createHoldModel>;

export type HoldModel = GraphModel;

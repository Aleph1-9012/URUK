import { expect, test } from 'bun:test';
import reference from './fixtures/dot-holds.json';
import { analyseGraph, createHoldModel, type Arc, type GraphScore, type PairDirection } from '../src/components/visuals/dot-holds/math';

const model = createHoldModel();

// Independent breadth-first search: first discovery gives directed distance,
// so a length-two walk to an already nearer vertex never enters N₂.
function bfsVertices(n: number, arcs: readonly Arc[]) {
  const adjacency: number[][] = Array.from({ length: n }, () => []);

  for (const [a, b] of arcs) {
    const row = adjacency[a];

    if (!row) throw new Error('The independent arc tail belongs to the graph.');

    row.push(b);
  }

  return Array.from({ length: n }, (_, vertex) => {
    const distance = Array<number>(n).fill(Infinity);
    distance[vertex] = 0;
    const queue = [vertex];

    for (let head = 0; head < queue.length; head++) {
      const source = queue[head];

      if (source === undefined) throw new Error('Every queued BFS vertex exists.');

      const depth = distance[source];
      const row = adjacency[source];

      if (depth === undefined || !row) throw new Error('Every queued BFS vertex has its distance and adjacency.');

      if (depth >= 2) continue;

      for (const target of row) {
        if (distance[target] !== Infinity) continue;

        distance[target] = depth + 1;
        queue.push(target);
      }
    }

    const first: number[] = [];
    const second: number[] = [];

    for (const [target, depth] of distance.entries()) {
      if (depth === 1) first.push(target);

      if (depth === 2) second.push(target);
    }

    return { vertex, first, second, firstCount: first.length, secondCount: second.length, holds: first.length <= second.length, sink: first.length === 0 };
  });
}

function bfsScore(n: number, arcs: readonly Arc[]): GraphScore {
  const vertices = bfsVertices(n, arcs);
  let holders = 0;
  let sinks = 0;

  for (const vertex of vertices) {
    if (vertex.holds) holders++;

    if (vertex.sink) sinks++;
  }

  return [holders, sinks];
}

test('173: all carried sets are exact directed-distance-two sets, deduplicated and excluding the source and its first neighbours', () => {
  for (const [step, snapshot] of model.history.entries()) {
    const oracle = reference.history[step];

    if (!oracle) throw new Error('Every carried graph has an independent Python reference.');

    const independent = bfsVertices(model.n, snapshot.arcs);
    expect(snapshot.vertices).toEqual(independent);
    expect(snapshot.holders).toEqual(oracle.holders);
    expect(snapshot.sinks).toEqual(oracle.sinks);
    expect(snapshot.arcs.length).toBe(36);
    expect(snapshot.holders.length).toBeGreaterThan(0);
    const pairs = new Set<string>();

    for (const [a, b] of snapshot.arcs) {
      const key = `${Math.min(a, b)},${Math.max(a, b)}`;
      expect(pairs.has(key)).toBe(false);
      pairs.add(key);
    }

    for (const vertex of snapshot.vertices) {
      const python = oracle.vertices[vertex.vertex];

      if (!python) throw new Error('Every vertex has independent set references.');

      expect(vertex.first).toEqual(python.first);
      expect(vertex.second).toEqual(python.second);
      expect(vertex.second.includes(vertex.vertex)).toBe(false);

      for (const target of vertex.first) expect(vertex.second.includes(target)).toBe(false);
    }
  }

  for (let length = 0; length <= model.initial.arcs.length; length++) {
    const prefix = analyseGraph(model.n, model.initial.arcs.slice(0, length));
    const python = reference.prefix_holders[length];

    if (!python) throw new Error('Each partial intro graph has its independent reference.');

    expect(prefix.holders).toEqual(python);
    expect(prefix.holders.length).toBeGreaterThan(0);
  }

  const diamond: Arc[] = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [3, 4]];
  expect(analyseGraph(5, diamond).vertices[0]?.second).toEqual([3]);
  expect(model.cycle.vertices).toEqual(bfsVertices(2, [[0, 1], [1, 0]]));

  for (const vertex of model.cycle.vertices) {
    expect(vertex.firstCount).toBe(1);
    expect(vertex.secondCount).toBe(0);
    expect(vertex.holds).toBe(false);
  }

  const empty = analyseGraph(3, []);
  expect(empty.holders).toEqual([0, 1, 2]);
  expect(empty.sinks).toEqual([0, 1, 2]);
  const triangle = analyseGraph(3, [[0, 1], [1, 2], [2, 0]]);
  expect(triangle.holders).toEqual([0, 1, 2]);
});

test('173: each adversary step is the independently best single-pair change and the final two-holder graph is only a local optimum', () => {
  const directions: readonly PairDirection[] = [0, 1, -1];

  for (const [step, snapshot] of model.history.entries()) {
    const candidates: { pair: Arc; from: PairDirection; to: PairDirection; score: GraphScore; order: number }[] = [];

    for (let a = 0; a < model.n; a++) {
      for (let b = a + 1; b < model.n; b++) {
        const present = snapshot.arcs.find(([tail, head]) => (tail === a && head === b) || (tail === b && head === a));
        const from: PairDirection = present ? (present[0] === a ? 1 : -1) : 0;

        for (const to of directions) {
          if (to === from) continue;

          const trial: Arc[] = [];

          for (const arc of snapshot.arcs) {
            if ((arc[0] === a && arc[1] === b) || (arc[0] === b && arc[1] === a)) continue;

            trial.push(arc);
          }

          if (to) trial.push(to === 1 ? [a, b] : [b, a]);

          candidates.push({ pair: [a, b], from, to, score: bfsScore(model.n, trial), order: candidates.length });
        }
      }
    }

    candidates.sort((a, b) => a.score[0] - b.score[0] || a.score[1] - b.score[1] || a.order - b.order);
    const best = candidates[0];
    const audit = model.audits[step];
    const python = reference.audits[step];

    if (!best || !audit || !python) throw new Error('Every graph has its independently ranked candidate changes.');

    expect(audit.candidates).toBe(candidates.length);
    expect(audit.best.pair).toEqual(best.pair);
    expect(audit.best.from).toBe(best.from);
    expect(audit.best.to).toBe(best.to);
    expect(audit.best.score).toEqual(best.score);
    expect([...audit.best.pair]).toEqual(python.best.pair);
    expect([...audit.best.score]).toEqual(python.best.score);
    expect(audit.improves).toBe(python.improves);
    const next = model.history[step + 1];

    if (next) {
      expect(next.change?.pair).toEqual(best.pair);
      expect(next.change?.to).toBe(best.to);
      expect(next.score).toEqual(best.score);
      expect(next.change?.gained).toEqual([]);
      expect(next.change?.lost.length).toBe(1);
    } else {
      expect(audit.improves).toBe(false);

      for (const trial of candidates) expect(trial.score[0]).toBeGreaterThanOrEqual(snapshot.holders.length);
    }
  }

  expect(model.final.holders).toEqual([2, 8]);
  expect(model.rule.firstCount).toBe(reference.rule.first_count);
  expect(model.rule.secondCount).toBe(reference.rule.second_count);
  expect(model.rule.threshold).toBeCloseTo(reference.rule.threshold, 14);
  // The cited guarantee is existential: the same rule would fail at initial dot2.
  const counterExampleToUniversal = model.initial.vertices[1];

  if (!counterExampleToUniversal) throw new Error('The initial dot numbered two exists.');

  expect(counterExampleToUniversal.secondCount).toBeLessThan(model.rule.fraction * counterExampleToUniversal.firstCount);
});

test('173: independent BFS over all ternary pair assignments verifies all59049 labelled oriented graphs and both distribution checksums', () => {
  const pairs: Arc[] = [];

  for (let a = 0; a < 5; a++) {
    for (let b = a + 1; b < 5; b++) pairs.push([a, b]);
  }

  const holderHistogram = [0, 0, 0, 0, 0, 0];
  const sinkHistogram = [0, 0, 0, 0, 0, 0];
  const arcs: Arc[] = [];
  let total = 0;
  let withoutHolder = 0;

  function visit(index: number): void {
    const pair = pairs[index];

    if (pair) {
      visit(index + 1);
      arcs.push(pair);
      visit(index + 1);
      arcs.pop();
      arcs.push([pair[1], pair[0]]);
      visit(index + 1);
      arcs.pop();

      return;
    }

    const [holders, sinks] = bfsScore(5, arcs);
    const holderBin = holderHistogram[holders];
    const sinkBin = sinkHistogram[sinks];

    if (holderBin === undefined || sinkBin === undefined) throw new Error('Each five-vertex graph belongs to valid histogram bins.');

    holderHistogram[holders] = holderBin + 1;
    sinkHistogram[sinks] = sinkBin + 1;
    total++;

    if (holders === 0) withoutHolder++;
  }

  visit(0);
  expect(total).toBe(reference.all_on_5);
  expect(withoutHolder).toBe(0);
  expect(holderHistogram).toEqual(reference.holder_histogram);
  expect(sinkHistogram).toEqual(reference.sink_histogram);
  expect(model.exhaustive.total).toBe(total);
  expect(model.exhaustive.withoutHolder).toBe(withoutHolder);
  expect(model.exhaustive.firstCounterexample).toBe(null);
  expect(model.exhaustive.holderHistogram).toEqual(holderHistogram);
  expect(model.exhaustive.sinkHistogram).toEqual(sinkHistogram);
});

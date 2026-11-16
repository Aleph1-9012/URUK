import { expect, test } from 'bun:test';
import reference from './test-fixture.json';
import { buildMazeModel, EXIT_ROOM, MAZE_EDGES, mazeAdjacency, ROOM_COUNT, seededWalk, walkDistributions } from './math';

const model = buildMazeModel();

test('103: live distributions agree with exact rational rows, conserve probability and accumulate absorption', () => {
  for (const [walk, oracle] of [[model.open, reference.open], [model.blocked, reference.blocked]] as const) {
    expect(walk.rows).toHaveLength(61);

    for (const [step, row] of walk.rows.entries()) {
      const expected = oracle[step];

      if (!expected) throw new Error('Every live distribution needs its independent exact row.');

      expect(row).toHaveLength(ROOM_COUNT);
      expect(row.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 14);

      for (const [room, probability] of row.entries()) {
        const rational = expected[room];

        if (!rational) throw new Error('Every room needs its exact rational probability.');

        const [numerator, denominator] = rational;

        if (numerator === undefined || denominator === undefined) throw new Error('The rational oracle needs its numerator and denominator.');

        expect(probability).toBeCloseTo(Number(numerator) / Number(denominator), 14);
        expect(probability).toBeGreaterThanOrEqual(0);
      }

      if (step > 0) {
        const previous = walk.rows[step - 1];
        const absorbed = row[EXIT_ROOM];
        const before = previous?.[EXIT_ROOM];

        if (absorbed === undefined || before === undefined) throw new Error('Absorption requires the current and preceding exit probabilities.');

        expect(absorbed).toBeGreaterThanOrEqual(before);
      }
    }
  }

  expect(model.open.rows[4]?.[EXIT_ROOM]).toBeCloseTo(5 / 108, 15);
  expect(model.open.firstHalf).toBe(21);
  expect(model.open.firstTwoThirds).toBe(32);
  expect(model.blocked.firstHalf).toBeNull();
  expect(model.blocked.firstTwoThirds).toBeNull();

  for (const row of model.blocked.rows) expect(row[EXIT_ROOM]).toBe(0);
});

test('103: each drawn transition transports the correct mass and removing the bridge disconnects the exit', () => {
  const adjacency = mazeAdjacency();
  const blocked = mazeAdjacency(true);
  const reached = new Set([0]);
  const pending = [0];

  for (const room of pending) {
    const neighbours = blocked[room];

    if (!neighbours) throw new Error('Each reachable room needs its adjacency list.');

    for (const target of neighbours) {
      if (reached.has(target)) continue;

      reached.add(target);
      pending.push(target);
    }
  }

  expect(reached.size).toBe(7);
  expect(reached.has(EXIT_ROOM)).toBe(false);

  for (const [step, flows] of model.open.flows.entries()) {
    const before = model.open.rows[step];
    const after = model.open.rows[step + 1];

    if (!before || !after) throw new Error('Every displayed transition needs both probability rows.');

    const incoming = Array.from({ length: ROOM_COUNT }, () => 0);

    for (const flow of flows) {
      const neighbours = adjacency[flow.from];
      const probability = before[flow.from];
      const existing = incoming[flow.to];

      if (!neighbours || probability === undefined || existing === undefined) throw new Error('Each flow needs its source distribution and target accumulator.');

      if (flow.from === EXIT_ROOM) {
        expect(flow.to).toBe(EXIT_ROOM);
        expect(flow.weight).toBe(1);
      } else {
        expect(neighbours.includes(flow.to)).toBe(true);
        expect(flow.weight).toBe(1 / neighbours.length);
      }

      expect(flow.probability).toBeCloseTo(probability * flow.weight, 15);
      incoming[flow.to] = existing + flow.probability;
    }

    for (const [room, probability] of incoming.entries()) {
      const expected = after[room];

      if (expected === undefined) throw new Error('Every target room needs its following probability.');

      expect(probability).toBeCloseTo(expected, 15);
    }
  }

  const independentDistances = new Map([[0, 0]]);
  const frontier = [0];

  for (const room of frontier) {
    const distance = independentDistances.get(room);

    if (distance === undefined) throw new Error('Each frontier room needs its shortest distance.');

    for (const edge of MAZE_EDGES) {
      const target = edge[0] === room ? edge[1] : edge[1] === room ? edge[0] : null;

      if (target === null || independentDistances.has(target)) continue;

      independentDistances.set(target, distance + 1);
      frontier.push(target);
    }
  }

  expect(independentDistances.get(EXIT_ROOM)).toBe(4);

  for (let step = 0; step < 4; step++) expect(model.open.rows[step]?.[EXIT_ROOM]).toBe(0);
});

test('103: the carried seeded sample uses legal passages and rejects surplus coin words before degree-three choices', () => {
  const adjacency = mazeAdjacency();
  const sample = model.sample;
  expect(sample.rooms).toHaveLength(61);
  expect(sample.decisions).toHaveLength(60);
  expect(sample.rooms.slice(0, 9)).toEqual([0, 1, 2, 3, 2, 3, 2, 6, 7]);
  let rejected = 0;

  for (const [step, decision] of sample.decisions.entries()) {
    const destinations = decision.from === EXIT_ROOM ? [EXIT_ROOM] : adjacency[decision.from];

    if (!destinations) throw new Error('Every sampled room needs its legal destinations.');

    const from = sample.rooms[step];
    const to = sample.rooms[step + 1];

    if (from === undefined || to === undefined) throw new Error('Each coin decision needs both carried room indices.');

    expect(decision.from).toBe(from);
    expect(decision.to).toBe(to);
    expect(destinations[decision.choice]).toBe(decision.to);
    expect(decision.degree).toBe(destinations.length);
    const width = Math.ceil(Math.log2(decision.degree));
    expect(decision.bits).toHaveLength(width * decision.trials.length);

    for (const [trial, choice] of decision.trials.entries()) {
      let decoded = 0;

      for (let digit = 0; digit < width; digit++) {
        const bit = decision.bits[trial * width + digit];

        if (bit !== 0 && bit !== 1) throw new Error('Each sampled coin result must be a bit.');

        decoded = 2 * decoded + bit;
      }

      expect(decoded).toBe(choice);

      if (trial === decision.trials.length - 1) expect(choice).toBeLessThan(decision.degree);
      else {
        expect(choice).toBeGreaterThanOrEqual(decision.degree);
        rejected++;
      }
    }
  }

  expect(rejected).toBeGreaterThan(0);
  expect(seededWalk().rooms).toEqual(sample.rooms);
  expect(() => walkDistributions(-1)).toThrow();
  expect(() => seededWalk(1, 0)).toThrow();
});

export type MazeEdge = readonly [number, number];

export type TransitionFlow = { from: number; to: number; weight: number; probability: number };

export type MazeWalk = {
  rows: number[][];
  flows: TransitionFlow[][];
  firstHalf: number | null;
  firstTwoThirds: number | null;
};

export type CoinDecision = { from: number; to: number; degree: number; bits: number[]; trials: number[]; choice: number };

export const ROOM_COUNT = 8;

export const START_ROOM = 0;

export const EXIT_ROOM = 7;

export const MAZE_EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [1, 4], [4, 5], [5, 6], [2, 6], [6, 7]] as const satisfies readonly MazeEdge[];

export const BLOCKED_PASSAGE = [6, 7] as const;

export function mazeAdjacency(blocked = false): number[][] {
  const adjacency: number[][] = Array.from({ length: ROOM_COUNT }, () => []);

  for (const [from, to] of MAZE_EDGES) {
    if (blocked && from === BLOCKED_PASSAGE[0] && to === BLOCKED_PASSAGE[1]) continue;

    const first = adjacency[from];
    const second = adjacency[to];

    if (!first || !second) throw new Error('Every maze passage must join two declared rooms.');

    first.push(to);
    second.push(from);
  }

  return adjacency;
}

export function walkDistributions(steps = 60, blocked = false): MazeWalk {
  if (!Number.isInteger(steps) || steps < 0) throw new RangeError('The maze walk needs a nonnegative integer step count.');

  const adjacency = mazeAdjacency(blocked);
  const first = Array.from({ length: ROOM_COUNT }, (_, room) => room === START_ROOM ? 1 : 0);
  const rows: number[][] = [first];
  const flows: TransitionFlow[][] = [];

  for (let step = 0; step < steps; step++) {
    const before = rows[step];
    const next = Array.from({ length: ROOM_COUNT }, () => 0);
    const currentFlows: TransitionFlow[] = [];

    if (!before) throw new Error('Each probability row needs its preceding distribution.');

    for (let from = 0; from < ROOM_COUNT; from++) {
      const probability = before[from];
      const neighbours = adjacency[from];

      if (probability === undefined || !neighbours) throw new Error('Every room needs its probability and passages.');

      const targets = from === EXIT_ROOM ? [EXIT_ROOM] : neighbours;

      if (targets.length === 0) throw new Error('A non-exit room cannot lose all of its passages.');

      const weight = 1 / targets.length;

      for (const to of targets) {
        const existing = next[to];

        if (existing === undefined) throw new Error('A transition must reach a declared room.');

        const mass = probability * weight;
        next[to] = existing + mass;
        currentFlows.push({ from, to, weight, probability: mass });
      }
    }

    rows.push(next);
    flows.push(currentFlows);
  }

  const firstAtLeast = (threshold: number): number | null => {
    const index = rows.findIndex(row => {
      const probability = row[EXIT_ROOM];

      if (probability === undefined) throw new Error('Every row must contain the absorbing exit.');

      return probability >= threshold;
    });

    return index < 0 ? null : index;
  };

  return { rows, flows, firstHalf: firstAtLeast(.5), firstTwoThirds: firstAtLeast(2 / 3) };
}

export function seededWalk(steps = 60, seed = 103) {
  if (!Number.isInteger(steps) || steps < 0) throw new RangeError('The sample walk needs a nonnegative integer step count.');
  if (!Number.isInteger(seed) || seed <= 0 || seed >= 2147483647) throw new RangeError('The portable coin stream needs a nonzero seed below its modulus.');

  let state = seed;
  const bit = () => {
    state = state * 16807 % 2147483647;

    return state < 2147483647 / 2 ? 0 : 1;
  };
  const adjacency = mazeAdjacency();
  const rooms = [START_ROOM];
  const decisions: CoinDecision[] = [];
  let room = START_ROOM;

  for (let step = 0; step < steps; step++) {
    const neighbours = room === EXIT_ROOM ? [EXIT_ROOM] : adjacency[room];

    if (!neighbours || neighbours.length === 0) throw new Error('The sample walker needs a passage or the absorbing exit.');

    const width = Math.ceil(Math.log2(neighbours.length));
    const bits: number[] = [];
    const trials: number[] = [];
    let choice: number;

    do {
      choice = 0;

      for (let digit = 0; digit < width; digit++) {
        const value = bit();
        bits.push(value);
        choice = 2 * choice + value;
      }

      trials.push(choice);
    } while (choice >= neighbours.length);

    const next = neighbours[choice];

    if (next === undefined) throw new Error('An accepted coin word must name an outgoing passage.');

    decisions.push({ from: room, to: next, degree: neighbours.length, bits, trials, choice });
    rooms.push(next);
    room = next;
  }

  return { rooms, decisions };
}

export function buildMazeModel() {
  const log = Math.log2(2 ** 10);

  return {
    open: walkDistributions(),
    blocked: walkDistributions(60, true),
    sample: seededWalk(),
    bits: Math.ceil(Math.log2(ROOM_COUNT)),
    records: { nisan: log ** 2, saksZhou: log ** 1.5, log },
  };
}

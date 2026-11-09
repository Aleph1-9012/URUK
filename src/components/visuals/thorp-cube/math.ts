export type Coin = 0 | 1;

export type ConditionalFrame = {
  step: number;
  /** Direction for the next transition, from this frame to step + 1. */
  activeBit: number;
  exposedPhysical: number;
  exposedCube: number;
  partnerPhysical: number;
  partnerCube: number;
  lawPhysical: number[];
  lawCube: number[];
  centeredPhysical: number[];
  centeredCube: number[];
  energy: number;
  blockedMass: number;
  /** The one-free input contribution L_s, before the next coin is revealed. */
  blockedEnergy: number;
};

export const OPENING_COINS = [1, 0, 0, 1] as const satisfies readonly Coin[];

export const EXPOSED_COINS = [0, 1, 1, 0, 1, 0] as const satisfies readonly Coin[];

export const INITIAL_DECK = [1, 2, 3, 4, 5, 6, 7, 8] as const;

function sizeAt(d: number): number {
  if (!Number.isInteger(d) || d < 1 || d > 20) throw new RangeError('Use an integer cube dimension from 1 to 20.');

  return 2 ** d;
}

function positionAt(position: number, n: number, coin: Coin): number {
  const half = n / 2;

  return 2 * (position % half) + (Number(position >= half) ^ coin);
}

/** Old physical slot -> new physical slot. Coin zero puts the top-half card first. */
export function shufflePositions(n: number, coins: readonly Coin[]): number[] {
  if (!Number.isInteger(n) || n < 2 || n % 2 !== 0 || coins.length !== n / 2) throw new RangeError('One coin is required for each pair in an even deck.');

  const target = Array<number>(n).fill(0);

  for (const [pair, coin] of coins.entries()) {
    target[pair] = pair * 2 + coin;
    target[pair + n / 2] = pair * 2 + (1 - coin);
  }

  return target;
}

/** A deck lists the card labels in physical slot order, top first. */
export function shuffleDeck(deck: readonly number[], coins: readonly Coin[]): number[] {
  const target = shufflePositions(deck.length, coins);
  const result = Array<number>(deck.length).fill(0);

  for (const [position, card] of deck.entries()) result[target[position] ?? 0] = card;

  return result;
}

export function rotateRight(x: number, d: number, steps: number): number {
  const n = sizeAt(d);
  const turns = ((steps % d) + d) % d;

  return ((x >>> turns) | (x << (d - turns))) & (n - 1);
}

/** At frame s the physical slot x is labelled rotr^s(x). */
export function cubePosition(x: number, d: number, step: number): number {
  return rotateRight(x, d, step);
}

/** Bit zero is the rightmost printed binary digit. */
export function activeBit(d: number, step: number): number {
  sizeAt(d);

  return ((d - 1 - step) % d + d) % d;
}

export function vertexLabel(x: number, d = 3): string {
  return x.toString(2).padStart(d, '0');
}

export function inCubeFrame(physicalLaw: readonly number[], d: number, step: number): number[] {
  const cube = Array<number>(sizeAt(d)).fill(0);

  for (const [position, mass] of physicalLaw.entries()) cube[cubePosition(position, d, step)] = mass;

  return cube;
}

export function singleCardLaw(d: number, steps: number, start = 0): number[] {
  const n = sizeAt(d);

  if (!Number.isInteger(steps) || steps < 0 || !Number.isInteger(start) || start < 0 || start >= n) throw new RangeError('Use a nonnegative shuffle count and an initial slot in the deck.');

  let law = Array<number>(n).fill(0);
  law[start] = 1;

  for (let step = 0; step < steps; step++) {
    const next = Array<number>(n).fill(0);

    for (const [position, mass] of law.entries()) {
      const first = positionAt(position, n, 0);
      const second = positionAt(position, n, 1);
      next[first] = (next[first] ?? 0) + mass / 2;
      next[second] = (next[second] ?? 0) + mass / 2;
    }

    law = next;
  }

  return law;
}

export function singleCardCubeLaw(d: number, steps: number, start = 0): number[] {
  return inCubeFrame(singleCardLaw(d, steps, start), d, steps);
}

export function totalVariation(law: readonly number[]): number {
  const uniform = 1 / law.length;
  let distance = 0;

  for (const mass of law) distance += Math.abs(mass - uniform) / 2;

  return distance;
}

function conditionalFrame(d: number, step: number, exposed: number, law: number[]): ConditionalFrame {
  const n = sizeAt(d);
  const partner = exposed ^ (n / 2);
  const centered = law.map((mass, position) => position === exposed ? 0 : mass - 1 / (n - 1));
  let energy = 0;

  for (const value of centered) energy += value * value;

  return {
    step,
    activeBit: activeBit(d, step),
    exposedPhysical: exposed,
    exposedCube: cubePosition(exposed, d, step),
    partnerPhysical: partner,
    partnerCube: cubePosition(partner, d, step),
    lawPhysical: law,
    lawCube: inCubeFrame(law, d, step),
    centeredPhysical: centered,
    centeredCube: inCubeFrame(centered, d, step),
    energy,
    blockedMass: law[partner] ?? 0,
    blockedEnergy: (centered[partner] ?? 0) ** 2,
  };
}

/** One exposed card; all unvisited pair coins are averaged independently. */
export function conditionalRun(d = 3, exposedStart = 0, taggedStart = 4, coins: readonly Coin[] = EXPOSED_COINS): ConditionalFrame[] {
  const n = sizeAt(d);

  if (!Number.isInteger(exposedStart) || !Number.isInteger(taggedStart) || exposedStart < 0 || taggedStart < 0 || exposedStart >= n || taggedStart >= n || exposedStart === taggedStart) throw new RangeError('The exposed and tagged cards need distinct initial slots.');

  let exposed = exposedStart;
  let law = Array<number>(n).fill(0);
  law[taggedStart] = 1;
  const frames = [conditionalFrame(d, 0, exposed, law)];

  for (const [step, coin] of coins.entries()) {
    const partner = exposed ^ (n / 2);
    const exposedNext = positionAt(exposed, n, coin);
    const next = Array<number>(n).fill(0);

    for (const [position, mass] of law.entries()) {
      if (position === partner) {
        const output = exposedNext ^ 1;
        next[output] = (next[output] ?? 0) + mass;
      } else {
        const first = positionAt(position, n, 0);
        const second = positionAt(position, n, 1);
        next[first] = (next[first] ?? 0) + mass / 2;
        next[second] = (next[second] ?? 0) + mass / 2;
      }
    }

    law = next;
    exposed = exposedNext;
    frames.push(conditionalFrame(d, step + 1, exposed, law));
  }

  return frames;
}

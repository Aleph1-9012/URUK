import { expect, test } from 'bun:test';
import {
  EXPOSED_COINS, INITIAL_DECK, OPENING_COINS, activeBit, conditionalRun, cubePosition,
  shuffleDeck, shufflePositions, singleCardCubeLaw, singleCardLaw, totalVariation, type Coin,
} from '../src/components/visuals/thorp-cube/math';
import { COUNTING_THRESHOLDS, DECK_LAW, ENERGY, NOISE, ONE_CARD_TV, PERMUTATION_COUNT } from '../src/components/visuals/thorp-cube/data';

function coinRow(mask: number, length: number): Coin[] {
  return Array.from({ length }, (_, index) => (mask & 2 ** index) === 0 ? 0 : 1);
}

test('238: physical pairs and the rotating cube give the same switches and one-card marginals', () => {
  expect(shufflePositions(8, OPENING_COINS)).toEqual([1, 2, 4, 7, 0, 3, 5, 6]);
  expect(shuffleDeck(INITIAL_DECK, OPENING_COINS)).toEqual([5, 1, 2, 6, 3, 7, 8, 4]);

  for (const d of [3, 4, 5]) {
    const n = 2 ** d;
    const masks = d === 3 ? Array.from({ length: 16 }, (_, index) => index) : [0, 0x5555, 0xffff];

    for (const mask of masks) {
      const target = shufflePositions(n, coinRow(mask, n / 2));
      expect(new Set(target).size).toBe(n);

      for (let step = 0; step < d * 2; step++) {
        for (let x = 0; x < n; x++) {
          const moved = target[x];

          if (moved === undefined) throw new Error('A permutation maps each physical slot.');

          const difference = cubePosition(x, d, step) ^ cubePosition(moved, d, step + 1);
          expect(difference === 0 || difference === 2 ** activeBit(d, step)).toBe(true);
        }
      }
    }

    for (let step = 0; step <= d; step++) {
      const physical = singleCardLaw(d, step);
      const cube = singleCardCubeLaw(d, step);
      const expected = Array<number>(n).fill(0);

      for (let vertex = 0; vertex < n; vertex++) {
        if (vertex % 2 ** (d - step) === 0) expected[vertex] = 1 / 2 ** step;
      }

      expect(cube).toEqual(expected);
      expect(physical.reduce((sum, mass) => sum + mass, 0)).toBe(1);
      expect(totalVariation(physical)).toBe(1 - 2 ** step / n);
    }
  }

  // Count all 16 global coin arrays, independently of the one-card update.
  for (let start = 0; start < 8; start++) {
    const law = Array<number>(8).fill(0);

    for (let mask = 0; mask < 16; mask++) {
      const output = shufflePositions(8, coinRow(mask, 4))[start];

      if (output === undefined) throw new Error('Every card has an output slot.');

      law[output] = (law[output] ?? 0) + 1 / 16;
    }

    expect(singleCardLaw(3, 1, start)).toEqual(law);
  }
});

test('238: conditional mass stays on free positions and independently averaged paths satisfy one-sweep memory', () => {
  const scripted = conditionalRun();
  const laws = [
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1 / 2, 0, 1 / 2, 0],
    [0, 0, 0, 0, 1 / 4, 1 / 4, 1 / 4, 1 / 4],
    [1 / 8, 1 / 8, 1 / 8, 0, 1 / 8, 1 / 8, 1 / 8, 1 / 4],
    [1 / 8, 0, 1 / 8, 1 / 8, 1 / 8, 3 / 16, 1 / 8, 3 / 16],
    [1 / 8, 0, 1 / 8, 1 / 8, 5 / 32, 5 / 32, 5 / 32, 5 / 32],
  ];
  expect(scripted.map(frame => frame.exposedCube)).toEqual([0, 0, 2, 3, 3, 1, 1]);
  expect(scripted.map(frame => frame.lawCube)).toEqual(laws);
  expect(scripted).toHaveLength(EXPOSED_COINS.length + 1);

  for (const frame of scripted) {
    expect(frame.lawCube[frame.exposedCube]).toBe(0);
    expect(frame.centeredCube[frame.exposedCube]).toBe(0);
    expect(frame.lawCube.reduce((sum, mass) => sum + mass, 0)).toBe(1);
    expect(frame.centeredCube.reduce((sum, mass) => sum + mass, 0)).toBeCloseTo(0, 14);
    expect(frame.partnerCube ^ frame.exposedCube).toBe(2 ** frame.activeBit);

    for (const [position, mass] of frame.lawPhysical.entries()) expect(frame.lawCube[cubePosition(position, 3, frame.step)]).toBe(mass);
  }

  for (const [vertex, value] of (scripted[4]?.centeredCube ?? []).entries()) {
    expect(value).toBeCloseTo(vertex === 3 ? 0 : vertex === 7 ? 3 / 28 : -1 / 56, 14);
  }

  for (const taggedStart of [4, 1]) {
    const energy = Array<number>(10).fill(0);
    const noise = Array<number>(9).fill(0);

    // Enumerate 512 equally likely exposed paths, not the full deck law.
    for (let path = 0; path < 512; path++) {
      for (const frame of conditionalRun(3, 0, taggedStart, coinRow(path, 9))) {
        let norm = 0;

        for (const value of frame.centeredCube) norm += value * value;

        energy[frame.step] = (energy[frame.step] ?? 0) + norm / 512;

        if (frame.step < 9) {
          const blocked = frame.centeredCube[frame.exposedCube ^ 2 ** activeBit(3, frame.step)] ?? 0;
          noise[frame.step] = (noise[frame.step] ?? 0) + blocked * blocked / 512;
        }
      }
    }

    for (let time = 3; time <= 9; time++) {
      let prediction = 0;

      for (let age = 1; age <= 3; age++) prediction += 2 ** -age * (noise[time - age] ?? 0);

      expect(energy[time]).toBeCloseTo(prediction, 12);
    }

    if (taggedStart === 4) {
      for (const [time, value] of energy.entries()) expect(value).toBeCloseTo(ENERGY[time] ?? 0, 12);

      for (const [time, value] of noise.entries()) expect(value).toBeCloseTo(NOISE[time] ?? 0, 12);
    }
  }
});

test('238: early support and distance coincidence follow from enumerating coin strings, with the counting thresholds checked separately', () => {
  let decks: number[][] = [INITIAL_DECK.slice()];
  expect(1 - 1 / PERMUTATION_COUNT).toBe(DECK_LAW[0].tv);

  for (let time = 1; time <= 3; time++) {
    const next: number[][] = [];

    for (const deck of decks) {
      for (let mask = 0; mask < 16; mask++) next.push(shuffleDeck(deck, coinRow(mask, 4)));
    }

    const support = new Set(next.map(deck => deck.join(','))).size;
    const checked = DECK_LAW[time];

    if (!checked) throw new Error('The checked law includes the first three shuffles.');

    expect(support).toBe(16 ** time);
    expect(support).toBe(checked.support);
    expect(next.length).toBe(support);
    expect(checked.tv).toBeCloseTo(1 - support / PERMUTATION_COUNT, 14);
    expect(checked.tv).toBeCloseTo(checked.countingBound, 14);
    decks = next;
  }

  for (let d = 1; d <= 20; d++) {
    const n = 2 ** d;
    let logFactorial = 0;

    for (let factor = 2; factor <= n; factor++) logFactorial += Math.log2(factor);

    const minimum = Math.ceil((logFactorial + Math.log2(3 / 4)) / (n / 2) - 1e-12);
    expect(minimum).toBe(COUNTING_THRESHOLDS[d - 1] ?? 0);
  }

  expect(DECK_LAW.find(point => point.tv <= 1 / 4)?.t).toBe(5);
  expect(DECK_LAW.find(point => point.support === PERMUTATION_COUNT)?.t).toBe(5);
  expect(ONE_CARD_TV.slice(0, 5)).toEqual([7 / 8, 3 / 4, 1 / 2, 0, 0]);
});

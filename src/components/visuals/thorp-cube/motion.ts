import { INITIAL_DECK, OPENING_COINS, shuffleDeck, type Coin } from './math';

function sampleCoins(seed: number, count: number): Coin[][] {
  let value = seed;
  const result: Coin[][] = [[...OPENING_COINS]];

  for (let step = 1; step < count; step++) {
    const coins: Coin[] = [];

    for (let pair = 0; pair < 4; pair++) {
      value = (Math.imul(1664525, value) + 1013904223) >>> 0;
      coins.push(value >>> 31 === 0 ? 0 : 1);
    }

    result.push(coins);
  }

  return result;
}

export const SAMPLE_COINS = sampleCoins(238, 18);

export const SAMPLE_DECKS: number[][] = [[...INITIAL_DECK]];

for (const coins of SAMPLE_COINS) {
  SAMPLE_DECKS.push(shuffleDeck(SAMPLE_DECKS.at(-1) ?? INITIAL_DECK, coins));
}

export function sampleStepAt(time: number): number {
  if (time < 13000) return 0;
  if (time < 14500) return 1;
  if (time < 21000) return Math.min(3, 1 + Math.floor((time - 14500) / 2100));

  if (time >= 35750 && time < 44000) return gridStepAt(time);
  if (time >= 44000) return Math.min(12, 6 + Math.floor((time - 44000) / 2000));

  return Math.min(12, 3 + Math.floor((time - 21000) / 3500));
}

export function gridStepAt(time: number): number {
  return time < 36500 ? 0 : Math.min(5, 1 + Math.floor((time - 36500) / 1000));
}

export function sampleDeckAt(time: number): readonly number[] {
  return SAMPLE_DECKS[sampleStepAt(time)] ?? INITIAL_DECK;
}

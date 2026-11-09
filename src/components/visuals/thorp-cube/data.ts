import { singleCardLaw, totalVariation } from './math';

export type DeckLawPoint = {
  t: number;
  tv: number;
  support: number;
  countingBound: number;
};

// Checked once against 238-checks/thorp.py. These summarize all 40,320 deck orders.
export const PERMUTATION_COUNT = 40320;

export const DECK_LAW = [
  {
    "t": 0,
    "tv": 0.9999751984126984,
    "support": 1,
    "countingBound": 0.9999751984126984
  },
  {
    "t": 1,
    "tv": 0.9996031746031745,
    "support": 16,
    "countingBound": 0.9996031746031746
  },
  {
    "t": 2,
    "tv": 0.9936507936507937,
    "support": 256,
    "countingBound": 0.9936507936507937
  },
  {
    "t": 3,
    "tv": 0.8984126984126986,
    "support": 4096,
    "countingBound": 0.8984126984126984
  },
  {
    "t": 4,
    "tv": 0.5365079365079366,
    "support": 18688,
    "countingBound": 0.0
  },
  {
    "t": 5,
    "tv": 0.20329861111111108,
    "support": 40320,
    "countingBound": 0.0
  },
  {
    "t": 6,
    "tv": 0.12466517857142859,
    "support": 40320,
    "countingBound": 0.0
  },
  {
    "t": 7,
    "tv": 0.0627654544890873,
    "support": 40320,
    "countingBound": 0.0
  },
  {
    "t": 8,
    "tv": 0.026206655350942458,
    "support": 40320,
    "countingBound": 0.0
  },
  {
    "t": 9,
    "tv": 0.015824236188616073,
    "support": 40320,
    "countingBound": 0.0
  },
  {
    "t": 10,
    "tv": 0.008004283148144917,
    "support": 40320,
    "countingBound": 0.0
  },
  {
    "t": 11,
    "tv": 0.00330243810774788,
    "support": 40320,
    "countingBound": 0.0
  },
  {
    "t": 12,
    "tv": 0.001984544311250959,
    "support": 40320,
    "countingBound": 0.0
  }
] as const satisfies readonly DeckLawPoint[];

// Entry d - 1 is the least t passing 2^(t*2^d/2) >= 3*(2^d)!/4.
export const COUNTING_THRESHOLDS = [1, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38] as const;

// One exposed card from slot 0; tagged card from slot 4. E_t = E ||w_t||².
export const ENERGY = [
  0.8571428571428485,
  0.8571428571428485,
  0.35714285714285926,
  0.10714285714285607,
  0.013392857142857009,
  0.005580357142857176,
  0.001674107142857126,
  0.00020926339285714076,
  8.719308035714337e-05,
  2.6157924107142595e-05
] as const;

// b_s = E L_s, the one-free input energy; the new noise itself has half this energy.
export const NOISE = [
  0.7346938775510236,
  0.020408163265306173,
  0.020408163265306173,
  0.011479591836734743,
  0.0003188775510204089,
  0.0003188775510204089,
  0.00017936862244898036,
  4.9824617346938805e-06,
  4.9824617346938805e-06
] as const;

export const ONE_CARD_TV = DECK_LAW.map(({ t }) => totalVariation(singleCardLaw(3, t)));

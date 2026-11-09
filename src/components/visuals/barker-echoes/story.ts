import { createTimeline } from '../../plate/timeline';

export const CUES = [
  {
    at: 0,
    title: "A row and its copy",
    text: "Write down a row of signs. Slide a copy along itself, and at each shift count the agreements minus the disagreements.",
    sources: [1],
  },
  {
    at: 7500,
    title: "Barker thirteen",
    text: "For this row every shifted count is 0 or 1. Such rows are Barker sequences, after R. H. Barker's 1953 paper on synchronizing signals.",
    sources: [1],
  },
  {
    at: 15500,
    title: "A sharp echo",
    text: "The thirteen-term code is a textbook radar pulse: its autocorrelation has a tall central peak and sidelobes of height one.",
    sources: [10],
  },
  {
    at: 23000,
    title: "The known lengths",
    text: "Nobody has found a Barker sequence longer than thirteen. Turyn and Storer proved in 1961 that no odd length beyond it works.",
    sources: [1, 4],
  },
  {
    at: 30500,
    title: "Wrap the copy around",
    text: "Let the copy wrap around. The counts are linked by $P_a(t)=C_a(t)+C_a(n-t)$, so for even Barker lengths above two every wrapped count is 0.",
    sources: [1],
  },
  {
    at: 38000,
    title: "Four shifted rows",
    text: "That is a circulant Hadamard row. The row (−1, 1, 1, 1) gives a 4 × 4 one: each shift makes two agreements and two disagreements.",
    sources: [1],
  },
  {
    at: 46000,
    title: "Ryser’s conjecture",
    text: "The conjecture attributed to Ryser in 1963: such a matrix exists only for n = 1 and n = 4.",
    sources: [1, 3],
  },
  {
    at: 52500,
    title: "The row-sum square",
    text: "Summing all the autocorrelations shows that the row sum squares to n, so n must be a perfect square, in fact $n=4u^{2}$.",
    sources: [1],
  },
  {
    at: 59500,
    title: "Sixty years of restrictions",
    text: "Turyn showed in 1965 that u must be odd and not a prime power. A 2017 search excluded every n up to $4\\cdot10^{30}$ but 4,489.",
    sources: [1, 5, 8],
  },
  {
    at: 66500,
    title: "A new claim",
    text: "On 23 September 2026 OpenAI posted a paper claiming there are no others, and with it the complete list of Barker lengths.",
    sources: [1],
  },
  {
    at: 73750,
    title: "Fold into four rows",
    text: "The proof folds the row into four rows of signs, one per position modulo 4. Evaluating at Z = 1, −1 and i and halving gives c, d and g.",
    sources: [1],
  },
  {
    at: 81750,
    title: "Three evaluations",
    text: "They are integral, since four odd integers sum to an even one. Two ratios built from them are roots of unity of odd order.",
    sources: [1],
  },
  {
    at: 89000,
    title: "Residue one",
    text: "Above 2 those ratios have residue 1, which forces both to be exactly 1.",
    sources: [1],
  },
  {
    at: 93250,
    title: "One term too many",
    text: "Then an alternating sum must vanish. But the all-ones sum is 0 at every nontrivial character and $u^{2}$ at the trivial one: one term too many.",
    sources: [1],
  },
  {
    at: 101750,
    title: "The order-four exception",
    text: "The genuine order-four row (1, 1, 1, −1) passes: there g = i, with residue 1 but even order, so the deduction is unavailable.",
    sources: [1],
  },
  {
    at: 109250,
    title: "Where it stands",
    text: "Unreviewed: no mathematician has said they have checked it. At least five earlier claimed proofs since 2016 were not accepted.",
    sources: [1, 2, 11, 12],
  },
] as const;

export const FILM_DURATION = 118000;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layout {
  stage: Box;
  chart: Box;
  ledger: Box;
  tall: boolean;
}

export function layout(width: number, height: number): Layout {
  const tall = width < 600;

  if (tall) {
    return {
      stage: { x: width * .04, y: height * .035, w: width * .92, h: height * .45 },
      chart: { x: width * .05, y: height * .49, w: width * .90, h: height * .235 },
      ledger: { x: width * .04, y: height * .755, w: width * .92, h: height * .235 },
      tall,
    };
  }

  return {
    stage: { x: width * .04, y: height * .04, w: width * .55, h: height * .69 },
    chart: { x: width * .63, y: height * .05, w: width * .33, h: height * .66 },
    ledger: { x: width * .04, y: height * .77, w: width * .92, h: height * .20 },
    tall,
  };
}

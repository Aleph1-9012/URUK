import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Fourteen tosses drawn", text: "Toss a fair coin forever and add up $\\pm\\lambda^{n}$ for each toss.", sources: [1, 2, 3] },
  { at: 7000, title: "Below one half", text: "For $\\lambda<1/2$ it lives on a Cantor set.", sources: [1, 2, 3] },
  { at: 14000, title: "Occupied bins are not a density", text: "For $\\lambda>1/2$ the pieces overlap and the question of whether it has a density has been open since the 1930s.", sources: [1, 2, 3] },
  { at: 22000, title: "Two carried copies", text: "When the images overlap, how much of the line does the measure fill?", sources: [1, 2, 3] },
  { at: 29000, title: "A conditional guide", text: "The guess, going back through work of Hochman, is that the dimension is the ratio of two numbers, the entropy of the random walk, which counts how many genuinely different maps the compositions produce, and the Lyapunov exponent, which measures how fast they contract; capped at one.", sources: [1, 2, 3] },
  { at: 46500, title: "When words define the same map", text: "Hochman proved this in 2014 under a weak separation condition, and a sequence of papers by Breuillard, Varjú, Rapaport, Feng and others proved it for algebraic parameters; the conjecture that it holds with no condition at all is Conjecture 3 in Varjú's survey of September 2026.", sources: [1, 2, 3] },
  { at: 63750, title: "Entropy with multiplicities", text: "On 24 September 2026 OpenAI posted a short paper claiming it in full.", sources: [1] },
  { at: 68750, title: "The general dimension claim", text: "No separation assumption is required; exact overlaps and repeated generators are allowed, and the ratios may be negative and unequal.", sources: [1] },
  { at: 77500, title: "The dated review record", text: "As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof.", sources: [1, 4] },
] as const;

export const FILM_DURATION = 84250;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

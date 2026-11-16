import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Never revisit a point", text: "A self-avoiding walk is a path on a grid that never visits the same point twice.", sources: [3] },
  { at: 6500, title: "Count the short walks", text: "It is the simplest model of a polymer chain, a molecule that cannot pass through itself.", sources: [3] },
  { at: 16250, title: "Between a rod and a random walk", text: "An ordinary random walk of $n$ steps wanders a distance of about $\\sqrt n$; a straight line goes $n$.", sources: [3] },
  { at: 22750, title: "The three-quarter prediction", text: "A planar self-avoiding walk wanders about $n^{3/4}$.", sources: [3] },
  { at: 31750, title: "Points inside a ball", text: "Equivalently its trace has mass dimension $4/3$, so a region of size $s$ holds about $s^{4/3}$ of its points.", sources: [1, 3] },
  { at: 38500, title: "The growth constant", text: "Duminil-Copin and Smirnov proved that prediction in 2012, $\\sqrt{2+\\sqrt2}$ per step.", sources: [3] },
  { at: 45500, title: "A logarithm below a rod", text: "But the best bound on the spread of a typical walk, by Krachun and Panagiotis in 2023, was still only \"less than $n$ by a logarithm\".", sources: [1] },
  { at: 54000, title: "All lengths and one length", text: "These identities control sums over walks of all lengths, not the uniform law on walks of one fixed length.", sources: [1, 2] },
  { at: 63000, title: "The diameter claim", text: "On 26 September 2026 OpenAI posted thirteen papers.", sources: [1] },
  { at: 71750, title: "The local mass claim", text: "The number of visited vertices within distance $s$ of any visited vertex is $n^{\\pm\\delta}\\min\\{n,s^{4/3}\\}$.", sources: [1] },
  { at: 78500, title: "Critical weights", text: "The proof works first with the critical activity $\\rho=(2+\\sqrt2)^{-1/2}$.", sources: [1] },
  { at: 84500, title: "Crossing a strip", text: "The mass of walks crossing a strip of height $N$ is comparable to $N^{-1/4}$.", sources: [2] },
  { at: 91000, title: "Every subwalk", text: "Every subwalk $\\sigma$ has length at most $H^{\\tau}(1+\\operatorname{diam}\\sigma)^{4/3}$.", sources: [1] },
  { at: 97500, title: "From weights to one length", text: "Submultiplicativity and the polynomial strip lower bound give $c_n\\rho^{n}\\ge1$ for the number $c_n$ of $n$-step walks.", sources: [1] },
  { at: 104500, title: "Diameter and endpoints", text: "A lower bound for the diameter does not imply that the two endpoints are far apart.", sources: [1] },
  { at: 110750, title: "Where the claim stands", text: "An automated referee run by a Stanford group has reported one major issue, with a proposed repair, in one of the thirteen papers that the headline depends on.", sources: [5, 7] },
] as const;

export const FILM_DURATION = 120000;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

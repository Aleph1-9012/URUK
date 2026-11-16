import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Eight values", text: "The fast Fourier transform is the most used algorithm in the world.", sources: [1] },
  { at: 5000, title: "Products and butterflies", text: "It turns a signal of $n$ samples into its $n$ frequencies in about $n\\log n$ operations instead of $n^{2}$, and it is inside every phone call, image file and radio receiver.", sources: [1] },
  { at: 16000, title: "Doubling the classical diagram", text: "Cooley and Tukey published it in 1965, Gauss had it in 1805, and since then the only question has been the constant in front of $n\\log n$.", sources: [3] },
  { at: 25000, title: "Which operation model?", text: "Whether the $n\\log n$ itself could be beaten was believed impossible, and in restricted models it is: Morgenstern proved in 1973 that any algorithm using only bounded multipliers needs $n\\log n$ operations.", sources: [1, 4] },
  { at: 37500, title: "Two claimed results", text: "On 25 September 2026 OpenAI posted two papers.", sources: [1, 2] },
  { at: 41500, title: "Existence without supplied lengths", text: "One shows that in the unrestricted model, where any complex number may be used as a multiplier, Fourier circuits smaller than $n\\log n$ exist for infinitely many lengths.", sources: [1, 2] },
  { at: 52250, title: "The isolated logarithmic factor", text: "The other gives a single algorithm that computes the exact transform at every length in $n(\\log n)^{1-10^{-13}}$ operations.", sources: [1] },
  { at: 62250, title: "Where the proofs stand", text: "As of 18 October 2026 no mathematician has said publicly that they have read or checked the proofs.", sources: [1, 2] },
  { at: 69000, title: "Formal statements and scope", text: "A kernel check is evidence about the formal statement, not a reading of the paper.", sources: [7] },
] as const;

export const FILM_DURATION = 74750;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

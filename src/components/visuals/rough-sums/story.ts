import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Rebuilding a rough function", text: "Every periodic function can be written as a sum of sines and cosines, Fourier claimed in 1807.", sources: [1] },
  { at: 7000, title: "The integrable counterexample", text: "In 1923 Kolmogorov, aged nineteen, built an integrable function whose Fourier series diverges at almost every point.", sources: [1] },
  { at: 14750, title: "Carleson’s theorem", text: "In 1966 Lennart Carleson proved that for square-integrable functions the series converges almost everywhere, settling a conjecture of Lusin from 1915 in one of the hardest proofs of the century.", sources: [1, 2] },
  { at: 27000, title: "Hunt’s extension", text: "Hunt extended it to every $L^{p}$ with $p>1$.", sources: [1] },
  { at: 31000, title: "The logarithmic gap", text: "Between $L^{1}$, where convergence fails, and $L^{p}$, where it holds, lies a scale of function classes measured by logarithms, and the natural conjecture was that $L\\log L$, the functions with $\\int|f|\\log|f|<\\infty$, is where convergence still holds.", sources: [1] },
  { at: 45250, title: "The known classes", text: "Sjölin proved it with an extra $\\log\\log$, Antonov in 1996 with an extra $\\log\\log\\log$, and Arias de Reyna, Lie, Di Plinio and Fragkos pushed closer; the endpoint itself resisted.", sources: [1, 3] },
  { at: 56000, title: "The claimed endpoint", text: "On 23 September 2026 OpenAI posted a paper claiming it.", sources: [1, 2, 3] },
  { at: 62000, title: "Where the proof stands", text: "As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof.", sources: [1] },
  { at: 68750, title: "A statement is not approval", text: "A kernel check is evidence about the formal statement, not a reading of the paper.", sources: [5] },
] as const;

export const FILM_DURATION = 74500;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Every pair leaves a distance", text: "Take a set of points in the plane and write down every distance between two of them.", sources: [] },
  { at: 6000, title: "A solid patch", text: "A solid patch produces every distance up to its width.", sources: [] },
  { at: 10000, title: "The finite bound", text: "A finite set of $n$ points produces at most $\\binom n2$ distances.", sources: [] },
  { at: 14500, title: "Between points and a patch", text: "In between are fractal sets: dust clouds with a dimension between $0$ and $2$.", sources: [] },
  { at: 20500, title: "Falconer’s threshold", text: "In 1985 Kenneth Falconer asked how large the dimension of a compact set must be to force its distance set to have positive length, proved that dimension above $3/2$ suffices in the plane and above $(d+1)/2$ in $\\mathbb R^{d}$, and showed with lattice examples that $d/2$ is the best one could hope for.", sources: [1, 3] },
  { at: 38250, title: "Forty years of thresholds", text: "The conjecture that $d/2$ suffices became one of the central problems of harmonic analysis, attacked with Fourier restriction, decoupling and, most recently, the projection theory of fractal sets.", sources: [1, 4, 5] },
  { at: 50750, title: "One scale of a lattice", text: "Why $d/2$ cannot be lowered: on a grid of spacing $1/N$ in $\\mathbb R^{d}$ every squared distance is an integer over $N^{2}$, so the distances crowd onto few values.", sources: [1, 3] },
  { at: 60750, title: "The all-dimensions claim", text: "Let $d\\ge2$ be an integer and let $E\\subset\\mathbb R^{d}$ be compact. If $\\dim_HE>d/2$, then $\\mathcal L^{1}(\\Delta(E))>0$.", sources: [1] },
  { at: 68750, title: "Where the proof stands", text: "As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof.", sources: [1] },
  { at: 75500, title: "A statement is not approval", text: "A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval.", sources: [2] },
] as const;

export const FILM_DURATION = 83250;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

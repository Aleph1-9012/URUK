import { createTimeline } from '../../plate/timeline';

// Claude's approved 268 cues, with their original timings and wording.
export const CUES = [
  {"at": 0, "title": "A ring of quantum magnets", "text": "Line up quantum spins, tiny magnets, in a ring, and let each one prefer to point opposite to its neighbours.", "sources": [1]},
  {"at": 6500, "title": "The first step on the energy ladder", "text": "The ring's possible energies form a ladder. The gap is the step from the lowest rung to the next: the least it costs to stir the ring.", "sources": [1]},
  {"at": 14500, "title": "A gap that closes", "text": "For spin one half, stirring a long chain costs almost nothing: the gap closes as the ring grows, as Lieb, Schultz and Mattis proved in 1961.", "sources": [1]},
  {"at": 23000, "title": "Haldane's prediction", "text": "In 1983 Duncan Haldane predicted that for spin one the gap stays open however long the chain. Numerics confirmed it to five digits.", "sources": [1]},
  {"at": 31000, "title": "The modified AKLT chain", "text": "In 1987 Affleck, Kennedy, Lieb and Tasaki proved a gap for a modified chain, with an extra term in each bond.", "sources": [1, 3]},
  {"at": 37500, "title": "Why the pure chain resisted", "text": "The finite-size gap criteria need a frustration-free chain, and the pure chain is not one. In 2025 Tasaki wrote that a rigorous proof seemed far beyond reach.", "sources": [1]},
  {"at": 47000, "title": "Two claimed lower bounds", "text": "On 24 September 2026 OpenAI posted two papers claiming the gap for the pure spin-one chain, with explicit lower bounds.", "sources": [1, 2]},
  {"at": 54500, "title": "Zooming in on the floor", "text": "For even rings of 60 sites or more, the main paper claims one lowest state and a gap above $\\tfrac4{105}\\log\\tfrac{80}{79}$; from 2304 sites, above $\\tfrac{\\log20}{784}$.", "sources": [1]},
  {"at": 62500, "title": "Positivity, not the value", "text": "Both are far below the numerical gap of 0.41. The papers claim only that the gap stays positive, not its value.", "sources": [1]},
  {"at": 69500, "title": "Odd open chains with end fields", "text": "A companion claims a gap for odd open chains with a field of 3/5 at both ends: the hypothesis Tasaki's index theorem needed.", "sources": [1, 2]},
  {"at": 77000, "title": "One number and two distributions", "text": "One number, the ring's partition function, carries two distributions: weights over its energies, and weights of a transfer step from site to site.", "sources": [1]},
  {"at": 86000, "title": "Squaring makes a pure distribution purer", "text": "Squaring the energy weights halves the temperature; squaring the step weights doubles the ring. A nearly pure distribution gets purer.", "sources": [1]},
  {"at": 94000, "title": "Doubling both directions", "text": "The two purities are coupled, so the ring doubles as the temperature halves, and the defects shrink doubly exponentially.", "sources": [1]},
  {"at": 101500, "title": "A gap from purity", "text": "Then excited states weigh little against the lowest one, bounding the gap for every even length. The starting values are computer-assisted.", "sources": [1]},
  {"at": 110000, "title": "Where it stands", "text": "Under review: Hal Tasaki studied the analytic argument and called it remarkably simple and elegant, but has not independently checked the computer-assisted estimates.", "sources": [4, 7]},
] as const;

export const FILM_DURATION = 120000;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 200);

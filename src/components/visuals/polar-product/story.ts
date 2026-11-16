import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "A body and its polar", text: "Every convex shape has a dual, called its polar: a big shape has a small polar and a long thin shape has a short wide one, so that multiplying the two volumes together gives a number that does not change when the shape is stretched or rotated.", sources: [1, 2, 3, 4, 6, 7] },
  { at: 15250, title: "Three area products", text: "For a disk that number is $\\pi^{2}\\approx9.87$, for a regular hexagon it is $9$, for a square it is $8$.", sources: [1, 2, 3, 4, 6, 7] },
  { at: 21500, title: "How small?", text: "In 1939 Kurt Mahler asked how small it can be.", sources: [1, 2, 3, 4, 6, 7] },
  { at: 25500, title: "The known planar floor", text: "He proved that in the plane the square is the answer, and conjectured that in every dimension the cube is, together with the cube's dual, the octahedron, and a family of hybrids.", sources: [1, 2, 3, 4, 6, 7] },
  { at: 36750, title: "The all-dimensional claim", text: "On 22 September 2026 OpenAI posted three papers claiming the full conjecture in every dimension, with the equality cases.", sources: [1, 2, 3, 4, 6, 7] },
  { at: 44750, title: "Where the proofs stand", text: "As of 18 October 2026 no mathematician has said publicly that they have checked the proofs.", sources: [1, 2] },
  { at: 51000, title: "A statement is not approval", text: "A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval.", sources: [11] },
] as const;

export const FILM_DURATION = 58750;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

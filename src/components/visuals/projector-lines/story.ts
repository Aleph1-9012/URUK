import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "One disc", text: "Take a disc.", sources: [1] },
  { at: 3000, title: "Straight cuts drawn", text: "Can you cut it into two pieces each narrower than the disc?", sources: [1] },
  { at: 7250, title: "Diameter and opposite points", text: "No: any two pieces of a disc, one of them contains two diametrically opposite points.", sources: [1] },
  { at: 13000, title: "Three sectors", text: "Three pieces suffice.", sources: [1] },
  { at: 16000, title: "The d-plus-one question", text: "In 1933 Karol Borsuk asked whether every bounded set in $d$-dimensional space can be cut into $d+1$ pieces of strictly smaller diameter, as the disc can be cut into three and a ball into four.", sources: [3] },
  { at: 28250, title: "Known small dimensions", text: "The answer is yes in dimensions one, two and three, and for sixty years it was believed to be yes always.", sources: [1, 3] },
  { at: 35250, title: "The historical counterexamples", text: "Then in 1993 Jeff Kahn and Gil Kalai found counterexamples in dimension $1{,}325$ and every dimension above $2{,}014$.", sources: [4] },
  { at: 42500, title: "Lines become projector points", text: "On 23 September 2026 OpenAI posted an eighteen-page paper claiming a counterexample in dimension nine, built from the lines through the origin in four-dimensional space.", sources: [1] },
  { at: 53250, title: "The Frobenius distance", text: "The distance between two projectors is $\\sqrt2$ times the sine of the angle between their lines, so two points of $X$ are at full diameter exactly when the lines are perpendicular.", sources: [1] },
  { at: 64750, title: "Four orthogonal axes", text: "A regular simplex with $d+1$ vertices needs $d+1$ pieces, because any two of its vertices are at full diameter.", sources: [1] },
  { at: 72250, title: "Ten empty claim labels", text: "It states that the projector set in the nine-dimensional trace-one space has diameter $\\sqrt2$ and no cover by ten sets of smaller diameter.", sources: [2] },
  { at: 81250, title: "The dated review record", text: "As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof.", sources: [1, 2] },
  { at: 88000, title: "A formal statement is not approval", text: "A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval.", sources: [2] },
] as const;

export const FILM_DURATION = 96000;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

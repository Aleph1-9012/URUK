import { createTimeline } from '../../plate/timeline';
import { PHONE_STAGE_WIDTH } from '../../plate/frame';

export const CUES = [
  { at: 0, title: "A map that keeps angles", text: "The Riemann mapping theorem says that any region of the plane without holes, however jagged, can be mapped onto a round disc by a map that preserves angles.", sources: [] },
  { at: 10000, title: "Koebe asks about holes", text: "In 1908 Paul Koebe asked for the version with holes: can any region, with any number of holes of any shape, be mapped conformally onto a region whose holes are all round discs or points?", sources: [] },
  { at: 21750, title: "The finite case", text: "He proved it himself for finitely many holes in 1920.", sources: [] },
  { at: 27750, title: "A countable family", text: "In 1993 Zheng-Xu He and Oded Schramm proved it for countably many, in the paper that also launched the modern theory of circle packings.", sources: [] },
  { at: 36500, title: "Still open in the survey", text: "A survey posted on 30 September 2026 by two specialists, Ntalampekos and Younsi, says the problem \"remains open after more than a hundred years\".", sources: [4] },
  { at: 46000, title: "Two separate claims", text: "On 23 September 2026 OpenAI posted two papers: one claims the full conjecture, for uncountably many holes with no condition at all, and the other claims one direction of He and Schramm's rigidity conjecture.", sources: [1, 2] },
  { at: 59000, title: "The full circle-domain claim", text: "Every nonempty connected open set $G\\subset\\hat{\\mathbb C}$ is conformally equivalent to a circle domain.", sources: [1] },
  { at: 65000, title: "Beyond countably many", text: "The first theorem imposes no geometric condition on the complement, which may have uncountably many components with no regularity or separation.", sources: [1] },
  { at: 74250, title: "Where the proofs stand", text: "As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs.", sources: [1, 2] },
  { at: 81000, title: "A statement is not approval", text: "A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval.", sources: [6] },
] as const;

export const FILM_DURATION = 88750;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export function layout(width: number, height: number, _time: number) {
  const tall = width < PHONE_STAGE_WIDTH;

  if (tall) {
    return {
      stage: { x: width * .035, y: height * .025, w: width * .93, h: height * .53 },
      panel: { x: width * .055, y: height * .58, w: width * .89, h: height * .40 },
      tall,
    };
  }

  return {
    stage: { x: width * .025, y: height * .03, w: width * .575, h: height * .94 },
    panel: { x: width * .635, y: height * .05, w: width * .34, h: height * .90 },
    tall,
  };
}

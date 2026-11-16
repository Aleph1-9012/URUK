import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "One Gaussian cloud", text: "Picture a cloud of points scattered around the origin according to the standard Gaussian distribution, in any number of dimensions.", sources: [1, 2, 3] },
  { at: 8500, title: "Unnormalized first moments", text: "Cut it into $k$ pieces however you like and, for each piece, add up the position vectors of its points, weighted by the Gaussian density, to get an unnormalized centre of mass.", sources: [1, 2, 3] },
  { at: 19750, title: "The sum of squared lengths", text: "How large can the sum of the squared lengths of these vectors be?", sources: [1, 2, 3] },
  { at: 24750, title: "Two half-spaces", text: "Cutting into two half-spaces gives $1/\\pi$.", sources: [1, 2, 3] },
  { at: 29750, title: "Three propeller blades", text: "In 2008 Subhash Khot and Assaf Naor met this question while studying how well a clustering problem can be approximated, and conjectured the answer: three flat sectors of $120$ degrees, like the blades of a propeller, extended trivially in the other directions, are the best possible, with value $9/(8\\pi)\\approx0.358$, and no fourth or fifth piece ever helps.", sources: [1, 2, 3] },
  { at: 50750, title: "The all-dimensions claim", text: "On 24 September 2026 OpenAI posted a paper claiming the conjecture in every dimension.", sources: [1, 2, 3] },
  { at: 57750, title: "Where the proof stands", text: "As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof.", sources: [] },
  { at: 64500, title: "A statement is not approval", text: "A kernel check is evidence about the formal statement, not a reading of the paper; Uruk does not count it as approval.", sources: [5] },
] as const;

export const FILM_DURATION = 72250;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

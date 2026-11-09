import { mix, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  {
    at: 0,
    title: "A fair coin per pair",
    text: "Cut a deck into two equal halves. Take the top card of each half; flip a coin to decide which goes down first, then the other.",
    sources: [1],
  },
  {
    at: 7750,
    title: "The Thorp shuffle",
    text: "Repeat with each pair until the deck is reassembled: the Thorp shuffle, introduced by Edward Thorp in 1973.",
    sources: [1],
  },
  {
    at: 14500,
    title: "One card's law",
    text: "For a deck of $n=2^{d}$ cards, a single tracked card is at a uniformly random position after just d shuffles.",
    sources: [1],
  },
  {
    at: 21000,
    title: "The whole deck",
    text: "But a deck is random only when the whole arrangement is, and the joint order of all n cards is a far harder question.",
    sources: [1],
  },
  {
    at: 28250,
    title: "The old upper bounds",
    text: "Morris proved in 2005 that $O(d^{44})$ shuffles suffice. Montenegro and Tetali brought it to $O(d^{29})$; Morris reached $O(d^{3})$ in 2013.",
    sources: [1, 3],
  },
  {
    at: 35750,
    title: "Count the possible orders",
    text: "Each shuffle uses n/2 coins, so t shuffles reach at most $2^{tn/2}$ orders, which must be at least n!. That gives the lower bound 2d − O(1).",
    sources: [1],
  },
  {
    at: 44000,
    title: "An optimal-order claim",
    text: "The conjecture was that the truth is O(d), matching that lower bound. On 26 September 2026 OpenAI posted twelve papers claiming it.",
    sources: [1, 2],
  },
  {
    at: 52000,
    title: "The constant 1600",
    text: "The headline paper needs 1600d shuffles as d grows; 1600 is an explicit choice in the proof, not a proposed sharp constant.",
    sources: [1],
  },
  {
    at: 59500,
    title: "Positions become a cube",
    text: "Label the positions by binary strings of length d. Undoing a fixed rotation turns each shuffle into a layer of switches along one coordinate.",
    sources: [1],
  },
  {
    at: 68250,
    title: "A sweep of switches",
    text: "A sweep through all d directions is d shuffles, and for one card those d averages carry any starting law to the uniform one.",
    sources: [1],
  },
  {
    at: 76000,
    title: "Expose one card's path",
    text: "The paper exposes cards' paths one at a time. A switch with two free positions averages the next card's chance; with one, it follows the exposed card's route.",
    sources: [1],
  },
  {
    at: 85750,
    title: "One sweep of noise",
    text: "The leftover is noise with mean zero. An exact identity keeps only one sweep of it, and opposite halves of the cube evolve independently.",
    sources: [1],
  },
  {
    at: 94250,
    title: "Contracting energy",
    text: "So the noise contracts: after 200d shuffles, the positions of 7n/8 randomly listed cards are close to uniform.",
    sources: [1],
  },
  {
    at: 101000,
    title: "Eight blocks, eight factors",
    text: "Fourier analysis over eight blocks lifts that to the whole deck, and eight factors of 200d shuffles make 1600d.",
    sources: [1],
  },
  {
    at: 108000,
    title: "Where it stands",
    text: "Unreviewed: no mathematician has said they have read or checked these papers. Lean statements exist, but Uruk does not count them as approval.",
    sources: [1, 4, 5],
  },
] as const;

export const FILM_DURATION = 117000;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layout {
  stage: Box;
  chart: Box;
  ledger: Box;
  tall: boolean;
}

export function layout(width: number, height: number, time = 0): Layout {
  const tall = width < 600;

  if (tall) {
    const expansion = smooth(time, 35750, 36750) * (1 - smooth(time, 41500, 43000));

    return {
      stage: { x: width * .04, y: height * .035, w: width * .92, h: height * .45 },
      chart: {
        x: width * mix(.05, .17, expansion),
        y: height * mix(.50, .15, expansion),
        w: width * mix(.90, .66, expansion),
        h: height * mix(.235, .59, expansion),
      },
      ledger: { x: width * .04, y: height * .79, w: width * .92, h: height * .19 },
      tall,
    };
  }

  return {
    stage: { x: width * .04, y: height * .04, w: width * .52, h: height * .69 },
    chart: { x: width * .61, y: height * .05, w: width * .35, h: height * .66 },
    ledger: { x: width * .04, y: height * .81, w: width * .92, h: height * .16 },
    tall,
  };
}

import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "One pointer in a maze", text: "Imagine a computer that can read its input as often as it likes but can write down only a handful of numbers, enough to count to the input's length and to point at a few positions in it.", sources: [1] },
  { at: 11750, title: "Three bits", text: "That is logarithmic space, the class $\\mathsf L$, and it captures what can be computed with almost no memory.", sources: [1] },
  { at: 18750, title: "Fresh random choices", text: "Now give that computer a coin to flip.", sources: [1] },
  { at: 21750, title: "The whole probability row", text: "In 1979 Aleliunas, Karp, Lipton, Lovász and Rackoff showed that with coins it can tell whether two points of a maze are connected, by walking randomly for a polynomial number of steps.", sources: [1, 5] },
  { at: 33500, title: "A hundred schematic bits", text: "Nisan's pseudorandom generator of 1990 showed that $\\log^{2}n$ bits of memory suffice.", sources: [3] },
  { at: 39000, title: "The general bound falls", text: "Saks and Zhou got to $\\log^{3/2}n$ in 1999.", sources: [1] },
  { at: 43000, title: "The maze alone", text: "Reingold removed the coins from the maze problem itself in 2005, in a result that won a Gödel Prize.", sources: [4] },
  { at: 49750, title: "The general question", text: "But the general question, $\\mathsf L=\\mathsf{BPL}$, stayed open and became the central problem of its field.", sources: [1] },
  { at: 55750, title: "The claimed equality", text: "On 23 September 2026 OpenAI posted a 108-page paper claiming it.", sources: [1] },
  { at: 60500, title: "A statement is not approval", text: "As of 20 October 2026 no computer scientist has said publicly that they have read or checked the proof.", sources: [1, 2] },
] as const;

export const FILM_DURATION = 67500;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

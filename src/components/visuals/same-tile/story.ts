import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: "Copies by translation", text: "Take a shape, make endless copies, and slide them around without turning until they cover all of space with no gaps and no overlaps.", sources: [1] },
  { at: 8750, title: "Other small patches", text: "Squares do this, hexagons do this, so do many stranger shapes.", sources: [1] },
  { at: 14750, title: "One repeating translation set", text: "Every shape anyone had found that can fill space this way can also do it in a repeating pattern, like wallpaper.", sources: [1] },
  { at: 22250, title: "One tile and two windows", text: "A tile can have both kinds of tilings.", sources: [1] },
  { at: 26250, title: "Only finite shifts are tested", text: "Dominoes laid in rows, with each row shifted at random, repeat sideways but not vertically; aligned rows repeat both ways.", sources: [1] },
  { at: 35250, title: "One periodic tiling is enough", text: "The conjecture is about the tile, not a particular tiling: it asks whether at least one periodic tiling exists.", sources: [1] },
  { at: 42750, title: "The conjecture about a tile", text: "The periodic tiling conjecture, stated explicitly by Lagarias and Wang in 1996, says that is always so: if a shape tiles by translation at all, it tiles periodically.", sources: [3] },
  { at: 53500, title: "Known lattice dimensions", text: "It is true on a line, by a 1977 theorem of Newman, and true in the plane, by a 2020 theorem of Bhattacharya.", sources: [4, 6] },
  { at: 60750, title: "The actual tile is not drawn", text: "On 23 September 2026 OpenAI posted a twenty-six-page paper claiming a three-dimensional counterexample.", sources: [1] },
  { at: 67750, title: "No fully periodic tiling claimed", text: "If the proof holds, the periodic tiling conjecture is false in $\\mathbb Z^{3}$ and $\\mathbb R^{3}$, and since it is true in dimensions one and two, the dividing line is exactly known for lattices.", sources: [1, 5] },
  { at: 79000, title: "The dated evidence and statement", text: "As of 18 October 2026 no mathematician has said publicly that they have read or checked the proof.", sources: [1, 2] },
] as const;

export const FILM_DURATION = 85750;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

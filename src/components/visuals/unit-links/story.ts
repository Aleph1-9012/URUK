import { createTimeline } from '../../plate/timeline';

export const CUES = [
  {"at": 0, "title": "One length, many links", "text": "Place n points in the plane and draw a line between every two that are exactly one unit apart. How many lines can there be?", "sources": [1]},
  {"at": 7500, "title": "Squares and triangles", "text": "A square of four points gives four lines and two triangles sharing an edge give five. Big grids give about two or three per point.", "sources": [1]},
  {"at": 15500, "title": "A length with many representations", "text": "Erdős saw in 1946 that a square grid does far better if its unit is a length whose square is a sum of two squares in many ways.", "sources": [1, 2]},
  {"at": 23500, "title": "Erdős's construction and guess", "text": "Even so, the count grows only a little faster than the number of points. Erdős guessed that was the truth and offered $500 to settle it.", "sources": [1, 2]},
  {"at": 32000, "title": "Two circles, two meetings", "text": "The other way, two unit circles meet in at most two points, so two points share at most two unit neighbours: at most about $n^{3/2}$ lines.", "sources": [2]},
  {"at": 40500, "title": "The four-thirds cap", "text": "In 1984 Spencer, Szemerédi and Trotter lowered the cap to about $n^{4/3}$. It was never improved, and there was a reason.", "sources": [1, 2]},
  {"at": 47500, "title": "Valtr's non-round circles", "text": "Valtr found a way to measure distance with unit circles that are not round, where $n^{4/3}$ is the right answer and the same proofs still work.", "sources": [1, 2]},
  {"at": 56000, "title": "Something special about round circles", "text": "So a better cap must use something special about round circles, as Thomas Bloom wrote.", "sources": [2]},
  {"at": 61500, "title": "The May construction", "text": "In May 2026 an OpenAI model disproved Erdős's guess with a construction that nine mathematicians checked and wrote up.", "sources": [1, 3, 5]},
  {"at": 68500, "title": "A claimed improvement", "text": "On 23 September 2026 OpenAI posted a separate paper claiming the cap $n^{4/3}$ can be lowered by some fixed amount, without saying how much.", "sources": [1]},
  {"at": 76500, "title": "Two ends of a wedge", "text": "The claimed proof assumes it cannot, then studies wedges, a circle's centre with two points on it, whose two ends share very little information.", "sources": [1]},
  {"at": 85500, "title": "A jump and its reciprocal", "text": "Round circles enter here. In complex coordinates each unit link has a jump $d$ one way and exactly $1/d$ the other.", "sources": [1]},
  {"at": 92500, "title": "The arithmetic obstruction", "text": "Measuring the jumps' arithmetic size, it ends with ratios that are each large while their products around rectangles stay small, and rules that out.", "sources": [1]},
  {"at": 101500, "title": "Where it stands", "text": "Unreviewed: no mathematician has said they checked this proof. An automated referee flagged one error, which its unnamed expert called fixable.", "sources": [2, 7, 8, 11]},
] as const;

export const FILM_DURATION = 112000;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layout {
  sheet: Box;
  exponent: Box;
  dial: Box;
  tall: boolean;
}

export function layout(width: number, height: number): Layout {
  const tall = width < 600;

  if (tall) {
    return {
      sheet: { x: width * .04, y: height * .035, w: width * .92, h: height * .535 },
      exponent: { x: width * .05, y: height * .61, w: width * .90, h: height * .35 },
      dial: { x: width * .31, y: height * .575, w: width * .38, h: height * .20 },
      tall,
    };
  }

  return {
    sheet: { x: width * .035, y: height * .045, w: width * .565, h: height * .90 },
    exponent: { x: width * .635, y: height * .08, w: width * .33, h: height * .84 },
    dial: { x: width * .65, y: height * .15, w: width * .30, h: height * .42 },
    tall,
  };
}

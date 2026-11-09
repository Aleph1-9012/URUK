import { createTimeline } from '../../plate/timeline';

// Claude's crossing-number storyboard, with its original cues and timings.
export const CUES = [
  {"at": 0, "title": "Turán's brickyard", "text": "In 1944 Pál Turán did forced labour at a brick factory. Every kiln had rails to every yard, and where two rails crossed, bricks fell.", "sources": [4]},
  {"at": 8500, "title": "The fewest crossings", "text": "He asked how to lay the rails with the fewest crossings: the crossing number of a complete bipartite graph.", "sources": [1, 2, 4]},
  {"at": 15000, "title": "Zarankiewicz's drawing", "text": "Zarankiewicz published a drawing in 1955 and claimed it was best, but his proof had a gap, and his formula became a conjecture.", "sources": [2, 4]},
  {"at": 23000, "title": "Edges may be curves", "text": "A drawing may route edges anywhere, as curves. The crossing number counts the crossing points of the best possible drawing.", "sources": [1, 2]},
  {"at": 30500, "title": "Three small graphs", "text": "$K_4$ can be drawn with no crossings, and $K_5$ needs one. So does $K_{3,3}$: three houses cannot reach three utilities.", "sources": [1, 2, 4]},
  {"at": 37500, "title": "The Harary–Hill formula", "text": "For the complete graph, every dot joined to every other, Harary and Hill gave the matching formula in 1963.", "sources": [1]},
  {"at": 44000, "title": "Two pages, exact counts", "text": "A two-page drawing puts the dots on a line and draws each edge as an arc above or below. It achieves the formula.", "sources": [1]},
  {"at": 51000, "title": "The complete-graph lower bound", "text": "Computers settled 11 and 12 dots by 2007, and 13 was reported in 2021. For large graphs, lower bounds reached over 98.5 percent.", "sources": [1, 5, 6]},
  {"at": 59000, "title": "The brickyard lower bound", "text": "For the brickyard, Kleitman settled one side of up to six in 1970, and flag algebras reached over 91 percent in 2023.", "sources": [2, 4]},
  {"at": 66000, "title": "What a general drawing lacks", "text": "Special drawings were settled, from two-page ones in 2013 to shortest arcs on a sphere in 2025. A general drawing has no such structure.", "sources": [1, 7]},
  {"at": 74500, "title": "Two claimed formulas", "text": "On 23 September 2026 OpenAI posted two short papers, of thirteen and sixteen pages, claiming both formulas for every drawing.", "sources": [1, 2]},
  {"at": 82000, "title": "Closed curves, signed crossings", "text": "The idea: sign each crossing by its orientation. Two closed curves in the plane cross with signs that add up to zero.", "sources": [1, 2]},
  {"at": 89000, "title": "A dimension becomes a crossing count", "text": "With a correction where edges share a dot, that identity feeds linear algebra, and a dimension count becomes a crossing count.", "sources": [1]},
  {"at": 97000, "title": "Where it stands", "text": "Unreviewed: no mathematician has said they read either paper. Both are formalized in Lean, and Uruk does not count a kernel check.", "sources": [3, 8]},
] as const;

export const FILM_DURATION = 108000;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layout {
  sheet: Box;
  tally: Box;
  gauge: Box;
  tall: boolean;
}

export function layout(width: number, height: number): Layout {
  const tall = width < 600;

  if (tall) {
    return {
      sheet: { x: width * .035, y: height * .025, w: width * .93, h: height * .53 },
      tally: { x: width * .05, y: height * .58, w: width * .90, h: height * .16 },
      gauge: { x: width * .05, y: height * .76, w: width * .90, h: height * .215 },
      tall,
    };
  }

  return {
    sheet: { x: width * .035, y: height * .045, w: width * .56, h: height * .90 },
    tally: { x: width * .63, y: height * .055, w: width * .335, h: height * .44 },
    gauge: { x: width * .63, y: height * .55, w: width * .335, h: height * .40 },
    tall,
  };
}

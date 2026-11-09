import { createTimeline } from '../../plate/timeline';

// Claude's near-boundary billiard storyboard, with its original cues and timings.
export const CUES = [
  {"at": 0, "title": "A shallow shot in an ellipse", "text": "Roll a ball inside an elliptical table and launch it at a shallow angle. It never crosses a smaller ellipse with the same two foci.", "sources": [1]},
  {"at": 8500, "title": "The caustic inside the path", "text": "Every segment of its path touches that inner curve, its caustic. Shallower launches give caustics closer to the rim.", "sources": [1]},
  {"at": 15500, "title": "A bounce becomes a phase point", "text": "Record each bounce by where it hits the rim and its angle. A caustic becomes a closed curve going round that cylinder.", "sources": [1]},
  {"at": 22500, "title": "An integrable billiard", "text": "The nested caustics fill a whole band inside the wall. This is what it means for the elliptical billiard to be integrable.", "sources": [1]},
  {"at": 30000, "title": "Birkhoff's converse", "text": "Birkhoff made the convex billiard a model system in 1927. The converse, printed in 1950: is the ellipse the only integrable table?", "sources": [1]},
  {"at": 38000, "title": "Caustics with gaps", "text": "Lazutkin showed in 1973 that every smooth, positively curved table has many caustics near the rim, but they can leave gaps.", "sources": [1]},
  {"at": 45500, "title": "Order across the whole cylinder", "text": "Bialy proved in 1993 that a table whose whole phase space is filled with such curves is a circle.", "sources": [1]},
  {"at": 51500, "title": "Tables close to ellipses", "text": "Avila, De Simoi and Kaloshin in 2016, then Kaloshin and Sorrentino in 2018, proved it for tables close to ellipses.", "sources": [3, 4]},
  {"at": 58500, "title": "Only a band by the rim", "text": "The near-boundary version assumes order only in a band by the rim, however thin, and no closeness to an ellipse.", "sources": [1, 2]},
  {"at": 65500, "title": "The near-boundary claim", "text": "On 24 September 2026 OpenAI posted two papers claiming it for smooth tables of positive curvature: such a band forces an ellipse.", "sources": [1, 2]},
  {"at": 73500, "title": "Continuity, and the scope", "text": "Only continuity is assumed across the band. It is not the full conjecture, in which the order may have gaps.", "sources": [1, 2]},
  {"at": 80000, "title": "Curves of periodic orbits", "text": "First, every small rational rotation occurs on a curve made entirely of periodic orbits, and their actions force the rim to be analytic.", "sources": [1]},
  {"at": 88500, "title": "Continuing the rim into complex values", "text": "Then the rim is continued into complex numbers. The paper rules out every case but one, a zero or pole of its normal: an ellipse.", "sources": [1]},
  {"at": 97000, "title": "Where it stands", "text": "Unreviewed: no mathematician has said they read these papers, and there is no Lean check for this family.", "sources": [1, 5, 6]},
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
  table: Box;
  phase: Box;
  ledger: Box;
  tall: boolean;
}

export function layout(width: number, height: number): Layout {
  const tall = width < 600;

  if (tall) {
    return {
      table: { x: width * .04, y: height * .025, w: width * .92, h: height * .425 },
      phase: { x: width * .055, y: height * .50, w: width * .89, h: height * .30 },
      ledger: { x: width * .04, y: height * .835, w: width * .92, h: height * .14 },
      tall,
    };
  }

  return {
    table: { x: width * .035, y: height * .045, w: width * .49, h: height * .90 },
    phase: { x: width * .56, y: height * .07, w: width * .405, h: height * .43 },
    ledger: { x: width * .55, y: height * .59, w: width * .42, h: height * .35 },
    tall,
  };
}

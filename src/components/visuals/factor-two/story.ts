// Claude's complete Crouzeix storyboard, with its original cues and timings.
export const CUES = [
  {"at": 0, "title": "A matrix stretches vectors", "text": "A matrix turns vectors into other vectors. Its norm is the most it can stretch any vector of length one.", "sources": [2]},
  {"at": 7000, "title": "What eigenvalues can miss", "text": "For a normal matrix the eigenvalues tell you everything. Most matrices are not normal, and for them the eigenvalues can badly mislead.", "sources": [2]},
  {"at": 15500, "title": "Two zero eigenvalues, a stretch of two", "text": "The paper's example has both eigenvalues zero, yet it sends the vector (0, 1) to (2, 0). It doubles a length.", "sources": [2]},
  {"at": 22500, "title": "Every vector leaves a mark", "text": "The numerical range repairs this. Each unit vector $x$ gives one number $x^{*}Ax$, and together they sweep out a region.", "sources": [1, 2]},
  {"at": 30000, "title": "A region that knows the stretch", "text": "It is always convex and contains every eigenvalue. Here it is the disk of radius one: the region knows about the 2.", "sources": [1, 2]},
  {"at": 37000, "title": "Crouzeix's conjecture", "text": "Crouzeix conjectured in 2004 that for every matrix and polynomial, $\\|p(A)\\|$ is at most twice the largest $|p|$ on this region.", "sources": [2, 7]},
  {"at": 44500, "title": "Why the factor cannot be smaller", "text": "The factor cannot be lower than two: with $p(z)=z$ the left side is 2 and the right side is $2\\cdot1$.", "sources": [2]},
  {"at": 50500, "title": "What complete adds", "text": "The complete conjecture lets the coefficients be matrices too. They need not commute, and a proof must never swap two of them.", "sources": [1, 2]},
  {"at": 58500, "title": "A new way to measure length", "text": "Paulsen showed in 1984 that the best complete factor is the best condition number of a change of inner product.", "sources": [1]},
  {"at": 65500, "title": "The last gap", "text": "Crouzeix proved a factor 11.08 in 2007. Crouzeix and Palencia reached $1+\\sqrt2$ in 2017, and the lemma behind it can go no lower.", "sources": [3, 4, 6]},
  {"at": 73500, "title": "The scalar theorem", "text": "In summer 2026 the scalar conjecture fell; Crouzeix, Townsend and Greenbaum checked the first proof. All three proofs were scalar.", "sources": [2, 9]},
  {"at": 81500, "title": "The complete claim", "text": "In September 2026 OpenAI claimed the complete factor two for every size, in two papers with different proofs, and for operators too.", "sources": [1, 2]},
  {"at": 89500, "title": "Enclosing the numerical range", "text": "The direct proof encloses the region in a smooth convex domain, traced by a circle, and looks where the stretch is largest.", "sources": [2]},
  {"at": 97000, "title": "Positivity gives the claimed bound", "text": "It bounds $FG$ and $GF$ separately, never exchanging them, and positivity on the boundary gives the sharp bound two.", "sources": [2]},
  {"at": 104000, "title": "Where it stands", "text": "Unreviewed: no mathematician has said they checked either paper. The scalar check does not transfer, and the 2 × 2 case was known in 2006.", "sources": [5, 9, 10, 11, 12]},
] as const;

export const FILM_DURATION = 114000;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layout {
  plane: Box;
  stretch: Box;
  balance: Box;
  scale: Box;
  tall: boolean;
}

export function layout(width: number, height: number): Layout {
  const tall = width < 600;

  if (tall) {
    return {
      plane: { x: width * .04, y: height * .035, w: width * .92, h: height * .41 },
      stretch: { x: width * .05, y: height * .47, w: width * .48, h: height * .235 },
      balance: { x: width * .57, y: height * .49, w: width * .38, h: height * .20 },
      scale: { x: width * .05, y: height * .735, w: width * .90, h: height * .235 },
      tall,
    };
  }

  return {
    plane: { x: width * .035, y: height * .045, w: width * .50, h: height * .90 },
    stretch: { x: width * .57, y: height * .05, w: width * .395, h: height * .49 },
    balance: { x: width * .57, y: height * .55, w: width * .395, h: height * .12 },
    scale: { x: width * .57, y: height * .71, w: width * .395, h: height * .25 },
    tall,
  };
}

export function cueAt(time: number): number {
  let index = 0;

  for (const [position, cue] of CUES.entries()) {
    if (time >= cue.at) index = position;
  }

  return index;
}

export function cueEnd(index: number): number {
  return CUES[index + 1]?.at ?? FILM_DURATION;
}

export function stillTime(index: number): number {
  return index === CUES.length - 1 ? FILM_DURATION : cueEnd(index) - 180;
}

export function formatTime(time: number): string {
  const seconds = Math.floor(Math.max(0, Math.min(FILM_DURATION, time)) / 1000);

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function span(time: number, start: number, end: number): number {
  return Math.min(1, Math.max(0, (time - start) / (end - start)));
}

export function smooth(time: number, start: number, end: number): number {
  const amount = span(time, start, end);

  return amount * amount * (3 - 2 * amount);
}

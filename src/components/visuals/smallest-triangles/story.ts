import { createTimeline } from '../../plate/timeline';

export const CUES = [
  {
    at: 0,
    title: "Find the smallest triangle",
    text: "Put n points in a unit square. Some three of them form the smallest triangle; call its area Δ. How large can Δ be made by placing the points well?",
    sources: [1],
  },
  {
    at: 9500,
    title: "A grid collapses the area",
    text: "Hans Heilbronn asked this around 1950. A grid wastes points on straight lines, where the area is zero.",
    sources: [1, 3],
  },
  {
    at: 16250,
    title: "Delete the small triangles",
    text: "Scatter 2n points at random and delete one point from every small triangle: n points survive, and Δ is about $1/n^{2}$.",
    sources: [1],
  },
  {
    at: 24000,
    title: "The parabola modulo thirteen",
    text: "Erdős's parabola does the same: its triangle determinants are nonzero integers, so no triangle is smaller than about $1/p^{2}$.",
    sources: [1, 3],
  },
  {
    at: 32000,
    title: "A logarithmic improvement",
    text: "Heilbronn conjectured that nothing does better by more than a constant factor. In 1982 Komlós, Pintz and Szemerédi beat that by a factor of log n.",
    sources: [1, 2],
  },
  {
    at: 41500,
    title: "The almost-minus-two belief",
    text: "For forty years the belief was that this was the truth up to slow factors: Δ could not exceed $n^{-2+\\epsilon}$ for any fixed ε > 0.",
    sources: [1, 5],
  },
  {
    at: 49500,
    title: "Upper bounds descend",
    text: "From above, the bounds fell from Roth's o(1/n) in 1951 to $n^{-7/6+\\epsilon}$, by Cohen, Pohoata and Zakharov.",
    sources: [1, 3, 4],
  },
  {
    at: 56000,
    title: "A claimed power saving",
    text: "On 25 September 2026 OpenAI posted a paper claiming a fixed power saving: every triangle can have area at least $c\\,n^{-2+\\eta}$.",
    sources: [1],
  },
  {
    at: 63750,
    title: "An exponent too small to see",
    text: "The paper calls η \"fixed but extremely small\", and it is: about $3\\times10^{-236}$. The true exponent still lies somewhere in between.",
    sources: [1],
  },
  {
    at: 71750,
    title: "Points from integer columns",
    text: "The proof works with integer columns: a column $(u_1,u_2,u_3)$ is the point $(u_1/u_3,\\,u_2/u_3)$, and a triangle is small only if its determinant is.",
    sources: [1],
  },
  {
    at: 80000,
    title: "Distinct field labels",
    text: "Labels from a finite field give columns $(1,\\xi,\\xi^{2})$, with nonzero determinant whenever the labels are distinct: Erdős's parabola again, over a larger field.",
    sources: [1],
  },
  {
    at: 89750,
    title: "The collinear case",
    text: "A second congruence condition, at an independent prime, handles determinant zero, the collinear case.",
    sources: [1],
  },
  {
    at: 96500,
    title: "Arithmetic sampling, then deletion",
    text: "Then sample many columns, delete one point from every bad pair or triple, and keep the rest. The probability of a repeated label is the saving.",
    sources: [1],
  },
  {
    at: 105750,
    title: "Where it stands",
    text: "Unreviewed: no mathematician has said they have checked the proof. A Lean statement covers a weaker form and is not in the release's catalogue.",
    sources: [1, 6, 7],
  },
] as const;

export const FILM_DURATION = 115000;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layout {
  stage: Box;
  readout: Box;
  ruler: Box;
  tall: boolean;
}

export function layout(width: number, height: number): Layout {
  const tall = width < 600;

  if (tall) {
    return {
      stage: { x: width * .05, y: height * .035, w: width * .90, h: height * .51 },
      readout: { x: width * .05, y: height * .56, w: width * .90, h: height * .19 },
      ruler: { x: width * .04, y: height * .79, w: width * .92, h: height * .18 },
      tall,
    };
  }

  return {
    stage: { x: width * .04, y: height * .04, w: width * .53, h: height * .67 },
    readout: { x: width * .62, y: height * .05, w: width * .34, h: height * .64 },
    ruler: { x: width * .04, y: height * .77, w: width * .92, h: height * .20 },
    tall,
  };
}

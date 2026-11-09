import { mix, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  {
    at: 0,
    title: "Sand finds the silent lines",
    text: "Sprinkle sand on a metal plate and bow its edge: the sand collects where the plate does not move.",
    sources: [3],
  },
  {
    at: 7750,
    title: "Higher notes, finer patterns",
    text: "Ernst Chladni showed these figures to Napoleon in 1809: the zero sets of eigenfunctions of the Laplacian. Higher notes give finer patterns.",
    sources: [3],
  },
  {
    at: 16750,
    title: "Yau's rule",
    text: "In 1982 Shing-Tung Yau conjectured the rule: on a closed surface, the nodal set of the mode with eigenvalue λ has length between $c\\sqrt\\lambda$ and $C\\sqrt\\lambda$.",
    sources: [2],
  },
  {
    at: 26000,
    title: "One fixed metric",
    text: "The metric is fixed once, and the constants must work for all its eigenfunctions.",
    sources: [2],
  },
  {
    at: 31500,
    title: "The analytic and lower bounds",
    text: "Donnelly and Fefferman proved it in 1988 for real-analytic shapes. On smooth surfaces, Brüning proved the lower bound in 1978.",
    sources: [1, 2],
  },
  {
    at: 39750,
    title: "The smooth upper bound",
    text: "The smooth upper bound stayed open: Logunov and Malinnikova improved $\\lambda^{3/4}$ to $\\lambda^{3/4-\\beta}$, still short of $\\sqrt\\lambda$.",
    sources: [1, 4],
  },
  {
    at: 46750,
    title: "A claimed split verdict",
    text: "On 23 September 2026 OpenAI posted a split verdict: the sharp upper bound holds on every smooth surface, and is false in dimensions three, four and five.",
    sources: [1, 2, 5],
  },
  {
    at: 56500,
    title: "Cut at the wavelength scale",
    text: "In local coordinates the equation becomes $\\Delta u+k^{2}p\\,u=0$, with $k=\\sqrt\\lambda$ the frequency. Cut the region into squares of side $s\\approx1/k$.",
    sources: [1],
  },
  {
    at: 64000,
    title: "Growth around one square",
    text: "Each square contributes nodal length at most $Cs(1+E)$, where E is the logarithmic growth of the norm from radius s to radius Rs.",
    sources: [1],
  },
  {
    at: 72000,
    title: "Sum over the squares",
    text: "There are $O(s^{-2})$ squares, so if the average growth is bounded, the total nodal length is $O(k)$.",
    sources: [1],
  },
  {
    at: 78250,
    title: "A bounded average",
    text: "The whole paper is the proof that the average is bounded, while individual squares may have large growth.",
    sources: [1],
  },
  {
    at: 85250,
    title: "A fixed higher-dimensional counterexample",
    text: "In dimensions three and four the bound fails for fixed smooth metrics, including metrics on $S^3$ arbitrarily close to the round one.",
    sources: [2],
  },
  {
    at: 93750,
    title: "One limit carries every witness",
    text: "The point is a single metric: nested neighbourhoods give a Cauchy sequence of metrics whose limit has eigenfunctions with unbounded ratio.",
    sources: [2],
  },
  {
    at: 102500,
    title: "Dimension five has a power excess",
    text: "In dimension five the nodal measure can grow faster than $\\lambda^{1/2+\\varepsilon_0}$; in three and four no power law is asserted.",
    sources: [2, 5],
  },
  {
    at: 109500,
    title: "Where it stands",
    text: "Unreviewed: no mathematician has said they have checked the proofs. The counterexamples' Lean statements are catalogued; the surface theorem's is not.",
    sources: [6, 7],
  },
] as const;

export const FILM_DURATION = 119000;

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
    const lengthFocus = smooth(time, 16750, 18000) * (1 - smooth(time, 31500, 32500));
    const lengthStageHeight = mix(.62, .53, lengthFocus);
    const lengthChartY = mix(.68, .59, lengthFocus);
    const lengthChartHeight = mix(.24, .34, lengthFocus);
    const dimensions = smooth(time, 102500, 103400);
    const closing = smooth(time, 109500, 110600);

    return {
      stage: { x: width * .04, y: height * .035, w: width * .92, h: height * mix(mix(lengthStageHeight, .40, dimensions), .51, closing) },
      chart: {
        x: width * .05,
        y: height * mix(mix(lengthChartY, .49, dimensions), .57, closing),
        w: width * .90,
        h: height * mix(mix(lengthChartHeight, .44, dimensions), .31, closing),
      },
      ledger: { x: width * .04, y: height * mix(.94, .91, closing), w: width * .92, h: height * mix(.05, .08, closing) },
      tall,
    };
  }

  return {
    stage: { x: width * .04, y: height * .04, w: width * .52, h: height * .72 },
    chart: { x: width * .62, y: height * .04, w: width * .34, h: height * .68 },
    ledger: { x: width * .04, y: height * .81, w: width * .92, h: height * .16 },
    tall,
  };
}

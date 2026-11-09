import { mix, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  {
    at: 0,
    title: "Keep or delete each link",
    text: "Build an endless grid. Keep each link between neighbouring points with probability p, and delete it otherwise.",
    sources: [1, 3],
  },
  {
    at: 6750,
    title: "Clusters join",
    text: "When p is small every piece is finite; when p is large one runs off to infinity. Does one exist exactly at the tipping point?",
    sources: [3],
  },
  {
    at: 14500,
    title: "The tipping point",
    text: "On the square grid the bond threshold is exactly $p_c=\\tfrac12$, a theorem of Kesten from 1980. On the cubic grid nobody knows an exact value.",
    sources: [3, 6, 16],
  },
  {
    at: 22750,
    title: "A loop blocks the way",
    text: "Harris proved in 1960 that $\\theta(\\tfrac12)=0$ there. In the plane, a closed loop of missing edges around a vertex blocks every path out.",
    sources: [2, 5, 6],
  },
  {
    at: 30250,
    title: "Beyond the plane",
    text: "There is no analogue in three dimensions, where a path can go around any surface.",
    sources: [2],
  },
  {
    at: 35500,
    title: "Graphs with enough symmetry",
    text: "Benjamini and Schramm asked in 1996 for every graph with enough symmetry; Hutchcroft proved it in 2016 for exponential growth.",
    sources: [1, 9, 10],
  },
  {
    at: 43250,
    title: "The separate lattice proof",
    text: "Kozma and Nitzan proposed a route in 2024. On 28 August 2026 Justin Leder of Anthropic published a machine-checked proof for every grid $\\mathbb Z^{d}$.",
    sources: [11, 12, 13],
  },
  {
    at: 52000,
    title: "Two OpenAI claims",
    text: "The answer is no, say two OpenAI papers of 24 September 2026: none on the cubic grid, and none on any graph with enough symmetry.",
    sources: [1, 2],
  },
  {
    at: 60000,
    title: "A finite gluing inequality",
    text: "Both rest on one finite inequality: if every relay reaches the target with high probability, reaching the relays almost guarantees reaching the target.",
    sources: [1, 2],
  },
  {
    at: 69250,
    title: "Reaching relays, missing the target",
    text: "If each relay reaches T with probability at least 1 − b, reaching the relays but missing T has chance at most b.",
    sources: [2],
  },
  {
    at: 76250,
    title: "Suppose a cluster reaches infinity",
    text: "Suppose an infinite cluster exists at $p_c$. Then large boxes connect to far-away pieces with probability close to one.",
    sources: [2],
  },
  {
    at: 83500,
    title: "A finite event changes continuously",
    text: "Those events depend on finitely many edges, so their probabilities change continuously with p and still hold slightly below $p_c$.",
    sources: [2],
  },
  {
    at: 91500,
    title: "Below the critical probability",
    text: "The proof then uses them to build an infinite cluster below $p_c$. That contradicts the definition of $p_c$.",
    sources: [2],
  },
  {
    at: 98250,
    title: "Cubes pass the connection",
    text: "On the cubic grid, seed boxes connect to each of 24 quarter-faces of a surrounding cube, and an exploration passes connections from cube to cube.",
    sources: [2, 18],
  },
  {
    at: 107250,
    title: "Three growth regimes",
    text: "On general graphs the proof splits by how fast balls in the graph grow.",
    sources: [1, 10, 19],
  },
  {
    at: 111750,
    title: "Where it stands",
    text: "Unreviewed: no mathematician has said they have checked either OpenAI paper. A leading expert's public reaction reported no check.",
    sources: [12, 14, 20, 21, 23, 25],
  },
] as const;

export const FILM_DURATION = 119500;

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
    const proof = smooth(time, 60000, 61200) * (1 - smooth(time, 110750, 111750));
    const growth = time >= 107250 && time < 111750;
    const cube = smooth(time, 98250, 99250) * (1 - smooth(time, 106250, 107250));
    const closing = smooth(time, 111750, 112750);

    return {
      stage: { x: width * .04, y: height * .035, w: width * .92, h: height * mix(mix(mix(.70, .38, proof), .70, cube), .54, closing) },
      chart: growth
        ? { x: width * .05, y: height * .04, w: width * .90, h: height * .65 }
        : { x: width * .05, y: height * .445, w: width * .90, h: height * .29 },
      ledger: { x: width * .04, y: height * mix(.77, .62, closing), w: width * .92, h: height * mix(.22, .37, closing) },
      tall,
    };
  }

  return {
    stage: { x: width * .04, y: height * .04, w: width * .53, h: height * .69 },
    chart: { x: width * .62, y: height * .05, w: width * .34, h: height * .65 },
    ledger: { x: width * .04, y: height * .79, w: width * .92, h: height * .18 },
    tall,
  };
}

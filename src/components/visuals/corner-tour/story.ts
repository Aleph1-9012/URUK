import { createTimeline } from '../../plate/timeline';
import { smooth } from '../../../lib/animation';
import type { Box } from './drawing';
import type { SolidKey } from './math';

export const CUES = [
  { at: 0, title: 'Three edges, even faces', text: 'Take a convex polyhedron in which exactly three edges meet at every corner and every face has an even number of sides, like a cube or a hexagonal prism.', sources: [1] },
  { at: 9750, title: 'Visit every corner once', text: 'Can you always walk along its edges, visiting every corner exactly once, and return to where you started?', sources: [1] },
  { at: 18750, title: 'Tait and Tutte', text: 'In 1884 Tait conjectured that every polyhedron with three edges per corner has such a tour, which would have proved the four-colour theorem; Tutte found a counterexample in 1946.', sources: [1] },
  { at: 30000, title: 'Barnette adds even faces', text: 'David Barnette asked in 1969 whether the tour exists once the faces are also required to have even length, which in graph terms means the graph is bipartite.', sources: [1] },
  { at: 40000, title: 'Squares and hexagons', text: 'Goodey proved it in 1975 when all faces are squares or hexagons.', sources: [1] },
  { at: 47000, title: 'Faces with at most eight sides', text: 'Schnieders proved the case of faces with at most eight sides in 2025; computers had checked every graph up to a few dozen vertices.', sources: [1] },
  { at: 55500, title: 'The claimed full conjecture', text: 'On 24 September 2026 OpenAI posted a nine-hundred-line paper claiming the conjecture in full.', sources: [1] },
  { at: 64500, title: 'A tour borders two trees', text: 'By a formulation going back to Stein and made precise by Alt, Payne, Schmidt and Wood, a Hamiltonian cycle in the original graph corresponds to a partition of the vertices of $T$ into two sets each inducing a tree.', sources: [1] },
  { at: 78000, title: 'Avoid one prescribed edge', text: 'The cycle can be chosen to avoid any single prescribed edge.', sources: [1] },
  { at: 86000, title: 'Existence without a fast recipe', text: 'The argument is an existence proof through a finite weighted sum; it "does not assert a polynomial-time construction of the cycle".', sources: [1] },
  { at: 94500, title: 'Where the proof stands', text: 'As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof.', sources: [1] },
] as const;

export const FILM_DURATION = 102500;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export const MORPHS = [
  { start: 40000, end: 41500, from: 'cube', to: 'hexagonal_prism' },
  { start: 47000, end: 48500, from: 'hexagonal_prism', to: 'truncated_octahedron' },
  { start: 64500, end: 65500, from: 'truncated_octahedron', to: 'cube' },
  { start: 71000, end: 72000, from: 'cube', to: 'hexagonal_prism' },
  { start: 78000, end: 79000, from: 'hexagonal_prism', to: 'truncated_octahedron' },
] as const satisfies readonly { start: number; end: number; from: SolidKey; to: SolidKey }[];

export function solidAt(time: number): { key: SolidKey; from: SolidKey; to: SolidKey; amount: number; transition: boolean; localTime: number } {
  let key: SolidKey = 'cube';
  let started = 0;

  for (const morph of MORPHS) {
    if (time < morph.start) break;

    if (time < morph.end) return { key: morph.to, from: morph.from, to: morph.to, amount: smooth(time, morph.start, morph.end), transition: true, localTime: 0 };

    key = morph.to;
    started = morph.end;
  }

  return { key, from: key, to: key, amount: 1, transition: false, localTime: time - started };
}

export function layout(width: number, height: number, _time: number): { stage: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (!tall) {
    return {
      stage: { x: width * .08, y: height * .025, w: width * .84, h: height * .67 },
      panel: { x: width * .045, y: height * .73, w: width * .91, h: height * .25 },
      tall,
    };
  }

  return {
    stage: { x: width * .04, y: height * .025, w: width * .92, h: height * .64 },
    panel: { x: width * .055, y: height * .70, w: width * .89, h: height * .28 },
    tall,
  };
}

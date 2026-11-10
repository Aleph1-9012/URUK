import { createTimeline } from '../../plate/timeline';
import { progress, smooth } from '../../../lib/animation';
import type { Box } from './drawing';

export const CUES = [
  { at: 0, title: "A scatter of repelling points", text: "Scatter points across a plane, one per unit of area on average, and make every pair repel with a force that weakens with distance.", sources: [1] },
  { at: 9000, title: "Slide downhill", text: "Which arrangement has the lowest total energy?", sources: [1] },
  { at: 15000, title: "The triangular floor", text: "Everyone's guess is the triangular lattice, the arrangement of cells in a honeycomb or of oranges in a flat tray, and among lattices this was proved long ago.", sources: [1] },
  { at: 25250, title: "Compare three regular patterns", text: "Rankin, Cassels, Ennola and Diananda for inverse powers, Montgomery in 1988 for every Gaussian.", sources: [1] },
  { at: 32250, title: "Could an irregular scatter win?", text: "But a lattice is a very special arrangement, and nothing prevented some irregular, non-repeating scatter from doing better.", sources: [1] },
  { at: 40250, title: "One pattern for every push", text: "In 2007 Henry Cohn and Abhinav Kumar conjectured that the triangular lattice is \"universally optimal\": the cheapest configuration for every reasonable repulsion at once.", sources: [1, 3] },
  { at: 51000, title: "The higher-dimensional precedents", text: "Cohn, Kumar, Miller, Radchenko and Viazovska proved the eight- and twenty-four-dimensional cases in 2022. The plane, the easiest to draw, stayed open.", sources: [1] },
  { at: 60750, title: "The universal claim", text: "On 23 and 26 September 2026 OpenAI posted four papers claiming it, together with three related conjectures.", sources: [1, 4] },
  { at: 69750, title: "A certificate beneath the bell", text: "Cohn and Kumar's programme asks for an auxiliary function $f$ lying below the potential, with nonnegative Fourier transform, that touches the potential exactly at the lattice distances; then Poisson summation turns the inequality into a proof.", sources: [1, 2] },
  { at: 85000, title: "Stack bells into an inverse power", text: "Prove the inequality for every Gaussian separately by a sharp Fourier certificate, then assemble a general potential from Gaussians.", sources: [1] },
  { at: 94000, title: "Two finite blocks and a tail", text: "For $\\alpha\\ge1$ the construction uses two finite $20\\times20$ interpolation blocks and an absolutely summable correction.", sources: [2] },
  { at: 101250, title: "The scope of the minimum", text: "The theorem identifies the minimum value, not every minimizer. The energy comparison is claimed; the per-potential certificate is not.", sources: [1] },
  { at: 110000, title: "Where the claims stand", text: "As of 20 October 2026 no mathematician has said publicly that they have read or checked the proofs.", sources: [5, 6] },
] as const;

export const FILM_DURATION = 118000;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export const CONTACT_ARRIVALS = [72000, 73000, 74000] as const;

export function relaxationStepAt(time: number): number {
  if (time < 15000) return 50 * progress(time, 9000, 15000);

  return 50 + 2050 * progress(time, 15000, 24000);
}

export function layout(width: number, height: number, time: number): { stage: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (!tall) {
    return {
      stage: { x: width * .025, y: height * .025, w: width * .47, h: height * .95 },
      panel: { x: width * .54, y: height * .035, w: width * .43, h: height * .92 },
      tall,
    };
  }

  const extraRoom = Math.max(smooth(time, 40250, 41100), smooth(time, 69750, 70600));
  const split = .48 - .10 * extraRoom;

  return {
    stage: { x: width * .04, y: height * .02, w: width * .92, h: height * (split - .04) },
    panel: { x: width * .055, y: height * split, w: width * .89, h: height * (.98 - split) },
    tall,
  };
}

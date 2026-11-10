import { createTimeline } from '../../plate/timeline';
import { smooth } from '../../../lib/animation';
import type { Box } from './drawing';

export const CUES = [
  { at: 0, title: 'Six people and a triangle', text: 'Among any six people, three are mutual acquaintances or three are mutual strangers; five people are not enough.', sources: [3] },
  { at: 10000, title: 'Every colouring checked', text: 'That is the Ramsey number $r(3,3)=6$, the first case of a theorem Frank Ramsey proved in 1930 on the way to a problem in logic.', sources: [3] },
  { at: 18000, title: 'The general party size', text: 'The general number $r(s,t)$ is the smallest party size that forces $s$ mutual acquaintances or $t$ mutual strangers, and almost nothing exact is known: $r(5,5)$ lies somewhere between $43$ and $46$.', sources: [3] },
  { at: 30500, title: 'Fix s and let t grow', text: 'Mathematicians therefore ask how $r(s,t)$ grows when $s$ is fixed and $t$ gets large.', sources: [1] },
  { at: 36500, title: 'The classical upper bounds', text: 'Erdős and Szekeres showed in 1935 that it grows no faster than $t^{s-1}$; in 1980 Ajtai, Komlós and Szemerédi shaved off a power of $\\log t$, giving $t^{s-1}/(\\log t)^{s-2}$.', sources: [1, 2] },
  { at: 46000, title: 'Close the polynomial gap', text: 'Whether that is the truth took decades to settle case by case: Kim proved it for $s=3$ in 1995, Mattheus and Verstraete found the power of $t$ for $s=4$ in 2023, and in May 2026 Bradač found the power of $t$ for every $s$, leaving a gap only in the power of the logarithm.', sources: [1, 2, 4, 5, 6] },
  { at: 63250, title: 'An ordered stream of flags', text: 'Choose $N=\\lfloor q^{d}\\sigma\\rfloor$ flags independently and uniformly, in order, and join positions $i<j$ when $a_i\\perp b_j$ and $a_j\\not\\perp b_i$.', sources: [2] },
  { at: 72250, title: 'No clique, a large stranger group', text: 'Linear independence of $d+1$ points on each other\'s hyperplanes is impossible, so the graph has no $K_{d+1}$.', sources: [2] },
  { at: 79250, title: 'The claimed logarithmic exponent', text: 'On 24 September 2026 OpenAI posted two papers claiming to close that gap for every $s\\ge5$.', sources: [1, 2] },
  { at: 87250, title: 'An information contradiction', text: 'Any long independent set selected from the random stream of flags must carry a certain minimum amount of information, and the papers describe such sets in fewer bits than that, a contradiction.', sources: [1, 2] },
  { at: 99500, title: 'What is and is not claimed', text: 'Both papers are explicit that they determine the exponent of the logarithm and not the constant. The case $s=4$ is not covered.', sources: [1, 2] },
  { at: 107750, title: 'Where the proofs stand', text: 'As of 18 October 2026 no mathematician has said publicly that they have read or checked the proofs.', sources: [7, 8, 9] },
] as const;

export const FILM_DURATION = 115750;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export function layout(width: number, height: number, time: number): { stage: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (!tall) {
    return {
      stage: { x: width * .025, y: height * .025, w: width * .49, h: height * .95 },
      panel: { x: width * .55, y: height * .035, w: width * .42, h: height * .93 },
      tall,
    };
  }

  const split = .52 - .15 * smooth(time, 46000, 46800);

  return {
    stage: { x: width * .04, y: height * .02, w: width * .92, h: height * (split - .04) },
    panel: { x: width * .055, y: height * split, w: width * .89, h: height * (.98 - split) },
    tall,
  };
}

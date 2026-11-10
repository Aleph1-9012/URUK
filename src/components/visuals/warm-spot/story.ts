import { createTimeline } from '../../plate/timeline';
import { mix, progress, smooth } from '../../../lib/animation';
import type { Box } from './drawing';

export const CUES = [
  { at: 0, title: 'Heat and insulation', text: 'Heat a flat metal plate unevenly, wrap its edge in perfect insulation, and wait.', sources: [1] },
  { at: 8000, title: 'The pattern that remains', text: 'The temperature evens out, but not all at once. One region stays warmest the longest and another stays coldest, and as time passes the pattern of warm and cold settles into a fixed shape that simply fades.', sources: [1] },
  { at: 21000, title: 'Rauch asks about the edge', text: 'In 1974 Jeffrey Rauch asked whether the hottest and coldest points of that final shape always sit on the edge of the plate.', sources: [1] },
  { at: 29000, title: 'A plate with holes', text: 'For plates with holes the answer is no, which Burdzy and Werner showed in 1999.', sources: [1, 5] },
  { at: 36000, title: 'The hole-free case', text: 'For plates without holes, the case Burdzy singled out as a conjecture in 2005, the answer was unknown.', sources: [1] },
  { at: 43000, title: 'The claimed theorem', text: 'On 24 September 2026 OpenAI posted a paper claiming that for every such plate with a smooth edge the answer is yes, in the strongest form: the final shape has no flat point anywhere inside, not even a saddle.', sources: [1] },
  { at: 56000, title: 'A follow-up, not an assessment', text: 'Krzysztof Burdzy, who formulated the conjecture, has built on the theorem in a note of his own while saying explicitly that he does not assess its proof.', sources: [1] },
  { at: 65750, title: 'Where the proof stands', text: 'As of 17 October 2026 no mathematician has said publicly that they have checked the proof.', sources: [1] },
] as const;

export const FILM_DURATION = 73750;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export const HEAT_BEATS = [
  { at: 8000, tau: 0 },
  { at: 9500, tau: .02 },
  { at: 11000, tau: .05 },
  { at: 12500, tau: .1 },
  { at: 14000, tau: .2 },
  { at: 15500, tau: .4 },
  { at: 17000, tau: .8 },
  { at: 18500, tau: 1.6 },
  { at: 20000, tau: 3.2 },
] as const;

export function heatTime(time: number): number {
  if (time <= 8000) return 0;

  for (let index = 1; index < HEAT_BEATS.length; index++) {
    const first = HEAT_BEATS[index - 1];
    const second = HEAT_BEATS[index];

    if (!first || !second) throw new Error('The heat clock has adjacent declared beats.');
    if (time <= second.at) return mix(first.tau, second.tau, progress(time, first.at, second.at));
  }

  return 3.2;
}

export function modeProgress(time: number): number {
  return smooth(time, 20250, 21000);
}

export function insetProgress(time: number): number {
  return smooth(time, 29000, 29750) * (1 - smooth(time, 35250, 36000));
}

export function layout(width: number, height: number, _time: number): { stage: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (tall) {
    return {
      stage: { x: width * .035, y: height * .025, w: width * .93, h: height * .505 },
      panel: { x: width * .05, y: height * .58, w: width * .90, h: height * .39 },
      tall,
    };
  }

  return {
    stage: { x: width * .025, y: height * .055, w: width * .59, h: height * .84 },
    panel: { x: width * .65, y: height * .09, w: width * .32, h: height * .82 },
    tall,
  };
}

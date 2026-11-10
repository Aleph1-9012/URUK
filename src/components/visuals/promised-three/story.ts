import { createTimeline } from '../../plate/timeline';
import { progress, smooth } from '../../../lib/animation';
import type { Box } from './drawing';

export const CUES = [
  { at: 0, title: 'A proper colouring', text: 'A proper colouring of a graph gives neighbouring vertices different colours.', sources: [1] },
  { at: 7000, title: 'A hard decision', text: 'Deciding whether three colours suffice is a classic hard problem.', sources: [1] },
  { at: 12000, title: 'Promised three', text: 'The question here is stranger: suppose you are promised that three colours suffice, and asked only to find some colouring with a hundred colours, or a million.', sources: [1] },
  { at: 22250, title: 'The hidden colouring', text: 'It sounds like it should be easy, and nobody knows how to do it.', sources: [1] },
  { at: 27250, title: 'A growing number of colours', text: 'The best algorithms use a number of colours that grows with the graph, about $n^{0.195}$ for $n$ vertices, and the best hardness results proved for decades that four colours, then five, are out of reach.', sources: [1] },
  { at: 39750, title: 'The human proof', text: 'On 14 September 2026 Fei, Minzer and Wang posted a human proof of a conjecture about 4-to-1 games that, through two earlier reductions, closes the question: for every fixed $c$, colouring a three-colourable graph with $c$ colours is NP-hard.', sources: [2, 3] },
  { at: 55000, title: 'The stronger claim', text: 'Ten days later OpenAI posted a paper proving something stronger by a different route: it is NP-hard even to find an independent set, a set of mutually non-adjacent vertices, containing any fixed positive fraction of the vertices, although a three-colourable graph always has one containing a third of them.', sources: [1] },
  { at: 73750, title: 'Adding isolated vertices', text: 'A graph with small independence ratio $\\alpha(G)/n$ needs many colours, since each colour class is an independent set; but a graph needing many colours can have independence ratio close to one, by adding isolated vertices.', sources: [1] },
  { at: 87250, title: 'Where the proof stands', text: 'As of 3 November 2026 no mathematician has said publicly that they have checked OpenAI\'s proof.', sources: [1, 10] },
] as const;

export const FILM_DURATION = 93750;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export function nodeProgress(time: number): number { return progress(time, 250, 3000); }

export function edgeProgress(time: number): number { return progress(time, 3000, 6500); }

export function firstFitProgress(time: number): number { return progress(time, 12750, 20750); }

export function revealProgress(time: number): number { return smooth(time, 22250, 24750); }

export function chartProgress(time: number): number { return progress(time, 27250, 31250); }

export function humanProgress(time: number): number { return smooth(time, 39750, 47500); }

export function liftProgress(time: number): number { return smooth(time, 55000, 58000); }

export function claimProgress(time: number): number { return progress(time, 55000, 58500); }

export function isolatedProgress(time: number): number { return smooth(time, 73750, 77000) * (1 - smooth(time, 81500, 85000)); }

export function isolatePhase(time: number): 'none' | 'arriving' | 'extended' | 'leaving' {
  if (time < 73750 || time >= 85000) return 'none';
  if (time < 77000) return 'arriving';
  if (time < 81500) return 'extended';

  return 'leaving';
}

export function layout(width: number, height: number, _time: number): { stage: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (tall) return { stage: { x: width * .03, y: height * .012, w: width * .94, h: height * .54 }, panel: { x: width * .055, y: height * .56, w: width * .89, h: height * .42 }, tall };

  return { stage: { x: width * .025, y: height * .025, w: width * .53, h: height * .92 }, panel: { x: width * .595, y: height * .035, w: width * .38, h: height * .93 }, tall };
}

import { fittedText } from '../../plate/canvas/fitted-text';

export type Box = { x: number; y: number; w: number; h: number };

export type ChartView = { minN: number; maxN: number; minLog: number; maxLog: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

export function chartPoint(n: number, logarithm: number, plot: Box, view: ChartView): { x: number; y: number } {
  return { x: plot.x + (n - view.minN) / (view.maxN - view.minN) * plot.w, y: plot.y + (view.maxLog - logarithm) / (view.maxLog - view.minLog) * plot.h };
}

export const text = fittedText(words => /[α-ωΑ-Ωℓ⊥≤≥≡∞√∇−→⇒⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/u.test(words) ? '"Garamond Math", serif' : /[À-ž]/u.test(words) ? '"Alegreya", "Garamond Math", serif' : '"Special Elite", monospace');

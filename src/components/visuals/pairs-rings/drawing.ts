import { fittedText } from '../../plate/canvas/fitted-text';

export type Box = { x: number; y: number; w: number; h: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

export type ChartPoint = { x: number; y: number };

export function runtimeChartBox(panel: Box, tall: boolean): Box {
  return {
    x: panel.x + (tall ? 32 : 46),
    y: panel.y + (tall ? 98 : 150),
    w: panel.w - (tall ? 42 : 61),
    h: panel.h - (tall ? 166 : 262),
  };
}

export function runtimeChartPoint(n: number, steps: number, plot: Box): ChartPoint {
  if (!(n >= 1e3 && n <= 1e7 && steps > 0 && Number.isFinite(steps))) throw new RangeError('The runtime chart uses finite positive step counts and people from a thousand to ten million.');

  return { x: plot.x + (Math.log10(n) - 3) / 4 * plot.w, y: plot.y + (11.5 - Math.log10(steps)) / 8.5 * plot.h };
}

export const text = fittedText(words => /[α-ωΑ-Ωℓ⊥≤≥∞√∇−⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/u.test(words) ? '"Garamond Math", serif' : /[À-ž]/u.test(words) ? '"Alegreya", "Garamond Math", serif' : '"Special Elite", monospace');

import { fittedText } from '../../plate/canvas/fitted-text';

export type Box = { x: number; y: number; w: number; h: number };

export type Point = { x: number; y: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

export function graphLayout(box: Box, tall: boolean): { centre: Point; radius: number; nodeRadius: number; head: number; countOffset: number } {
  return { centre: { x: box.x + box.w / 2, y: box.y + box.h / 2 }, radius: Math.min(box.w / 2 - (tall ? 32 : 44), box.h / 2 - (tall ? 38 : 60)), nodeRadius: tall ? 7 : 10, head: tall ? 3.5 : 5, countOffset: tall ? 23 : 32 };
}

export function insetBox(box: Box, tall: boolean): Box {
  const tight = !tall && box.h < 350;

  return { x: box.x + box.w * .09, y: box.y + (tall ? 70 : tight ? 128 : 146), w: box.w * .82, h: tall ? 130 : tight ? 118 : Math.min(210, box.h * .40) };
}

export const text = fittedText(words => /[α-ωΑ-Ωℓ⊥≤≥≡∞√∇−→⇒⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/u.test(words) ? '"Garamond Math", serif' : /[À-ž]/u.test(words) ? '"Alegreya", "Garamond Math", serif' : '"Special Elite", monospace');

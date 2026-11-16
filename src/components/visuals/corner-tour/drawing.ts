import { fittedText } from '../../plate/canvas/fitted-text';
import { line } from '../../plate/canvas/strokes';

export type Box = { x: number; y: number; w: number; h: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

export const text = fittedText(words => /[À-ž]/u.test(words) ? '"Alegreya", "Garamond Math", serif' : /[α-ωΑ-Ωℓ⊥≤≥∞⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/u.test(words) ? '"Garamond Math", serif' : '"Special Elite", monospace');

export function hatch(pen: CanvasRenderingContext2D, box: Box, colors: Colors): void {
  pen.save();
  pen.beginPath();
  pen.rect(box.x, box.y, box.w, box.h);
  pen.clip();
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .55;

  for (let x = Math.floor((box.x - box.h) / 5) * 5; x < box.x + box.w; x += 5) line(pen, x, box.y + box.h, x + box.h, box.y);

  pen.restore();
}

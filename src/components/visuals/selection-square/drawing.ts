import { fittedText } from '../../plate/canvas/fitted-text';

export type Box = { x: number; y: number; w: number; h: number };

export type ChartView = { minN: number; maxN: number; minLog: number; maxLog: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

export function chartPoint(n: number, logarithm: number, plot: Box, view: ChartView): { x: number; y: number } {
  return { x: plot.x + (n - view.minN) / (view.maxN - view.minN) * plot.w, y: plot.y + (view.maxLog - logarithm) / (view.maxLog - view.minLog) * plot.h };
}

function fontFamily(words: string): string {
  return /[α-ωΑ-Ωℓ⊥≤≥≡∞√∇−→⇒⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/u.test(words) ? '"Garamond Math", serif' : /[À-ž]/u.test(words) ? '"Alegreya", "Garamond Math", serif' : '"Special Elite", monospace';
}

export const text = fittedText(fontFamily);

export function phoneText(pen: CanvasRenderingContext2D, words: string, x: number, y: number, size: number, width: number, colors: Colors): number {
  pen.font = `${size}px ${fontFamily(words)}`;
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  const rows: string[] = [];
  let row = '';

  for (const word of words.split(' ')) {
    const next = row ? `${row} ${word}` : word;

    if (row && pen.measureText(next).width > width - 8 && !/^[·,:;!?]/u.test(word)) {
      rows.push(row);
      row = word;
    } else row = next;
  }

  if (row) rows.push(row);

  for (const [index, value] of rows.entries()) {
    const baseline = y + index * (size + 4);
    const bounds = pen.measureText(value);
    pen.fillStyle = colors.paper;
    pen.fillRect(x - bounds.width / 2 - 3, baseline - bounds.actualBoundingBoxAscent - 3, bounds.width + 6, bounds.actualBoundingBoxAscent + bounds.actualBoundingBoxDescent + 6);
    pen.fillStyle = colors.ink;
    pen.fillText(value, x, baseline);
  }

  return y + rows.length * (size + 4);
}

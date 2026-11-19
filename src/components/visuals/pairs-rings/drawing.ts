import { fittedText } from '../../plate/canvas/fitted-text';

export type Box = { x: number; y: number; w: number; h: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

export type ChartPoint = { x: number; y: number };

export function runtimeChartBox(panel: Box, tall: boolean): Box {
  return {
    x: panel.x + (tall ? 32 : 46),
    y: panel.y + (tall ? 126 : 150),
    w: panel.w - (tall ? 42 : 61),
    h: tall ? panel.h - 210 : panel.h - 262,
  };
}

export function runtimeChartPoint(n: number, steps: number, plot: Box): ChartPoint {
  if (!(n >= 1e3 && n <= 1e7 && steps > 0 && Number.isFinite(steps))) throw new RangeError('The runtime chart uses finite positive step counts and people from a thousand to ten million.');

  return { x: plot.x + (Math.log10(n) - 3) / 4 * plot.w, y: plot.y + (11.5 - Math.log10(steps)) / 8.5 * plot.h };
}

const fontFor = (words: string) => /[α-ωΑ-Ωℓ⊥≤≥∞√∇−⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/u.test(words) ? '"Garamond Math", serif' : /[À-ž]/u.test(words) ? '"Alegreya", "Garamond Math", serif' : '"Special Elite", monospace';

const fitted = fittedText(fontFor);

export function text(pen: CanvasRenderingContext2D, words: string, x: number, y: number, size: number, maxWidth: number, colors: Colors, align: CanvasTextAlign = 'center', tone = colors.ink): void {
  if (pen.canvas.clientWidth >= 600) {
    fitted(pen, words, x, y, size, maxWidth, colors, align, tone);

    return;
  }

  pen.font = `${size}px ${fontFor(words)}`;
  const rows: string[] = [];

  for (const paragraph of words.replace(/\s+([:;,.·!?])/gu, '\u00a0$1').split('\n')) {
    let row = '';

    for (const word of paragraph.split(' ')) {
      const next = row ? row + ' ' + word : word;

      if (row && pen.measureText(next).width > maxWidth) {
        rows.push(row);
        row = word;
      } else row = next;
    }

    if (row) rows.push(row);
  }

  pen.textAlign = align;
  pen.textBaseline = 'middle';

  for (const [index, row] of rows.entries()) {
    const baseline = y + (index - (rows.length - 1) / 2) * size * 1.3;
    const bounds = pen.measureText(row);
    const left = align === 'left' ? x : align === 'right' ? x - bounds.width : x - bounds.width / 2;
    pen.fillStyle = colors.paper;
    pen.fillRect(left - 3, baseline - bounds.actualBoundingBoxAscent - 3, bounds.width + 6, bounds.actualBoundingBoxAscent + bounds.actualBoundingBoxDescent + 6);
    pen.fillStyle = tone;
    pen.fillText(row, x, baseline);
  }
}

import { mix, smooth } from '../../../lib/animation';

export type Box = { x: number; y: number; w: number; h: number };

export type Point = { x: number; y: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

export const RECORDS = [
  { year: 1960, level: .08 },
  { year: 1962, level: .29 },
  { year: 1963, level: .43 },
  { year: 1971, level: .62 },
  { year: 2007, level: .77 },
  { year: 2019, level: .90 },
] as const;

export function historyChartBox(box: Box, tall: boolean): Box {
  const compact = !tall && box.h < 460;

  return { x: box.x + (tall ? 24 : 38), y: box.y + (tall ? 52 : compact ? 85 : 100), w: box.w - (tall ? 40 : 72), h: tall ? 139 : compact ? 120 : Math.min(170, box.h * .31) };
}

export function recordPoint(box: Box, year: number, tall: boolean): Point {
  const record = RECORDS.find(item => item.year === year);

  if (!record) throw new Error('The history chart only places its six cited records.');

  const plot = historyChartBox(box, tall);

  return { x: plot.x + (year - 1960) / 59 * plot.w, y: plot.y + record.level * plot.h };
}

export function leafDestination(box: Box, time: number, tall: boolean): Point {
  const record = recordPoint(box, 1962, tall);
  const amount = smooth(time, 55500, 58000);

  return { x: mix(record.x, box.x + (tall ? 34 : 51), amount), y: mix(record.y, box.y + (tall ? 71 : 86), amount) };
}

export function leafClusterSize(time: number, tall: boolean): number {
  return mix(tall ? .9 : 1.2, tall ? 2.1 : 2.7, smooth(time, 55500, 58000));
}

export function leafClusterPoint(index: number, box: Box, time: number, tall: boolean): Point {
  const centre = leafDestination(box, time, tall);
  const spacing = leafClusterSize(time, tall) + .5;

  return { x: centre.x + (index % 9 - 4) * spacing, y: centre.y + (Math.floor(index / 9) - 1) * spacing };
}

export function runtimeChartBox(box: Box, tall: boolean): Box {
  const compact = !tall && box.h < 460;

  return { x: box.x + (tall ? 34 : 52), y: box.y + (tall ? 111 : compact ? 135 : 155), w: box.w - (tall ? 50 : 78), h: tall ? 76 : compact ? Math.max(54, Math.min(70, box.h - 290)) : 110 };
}

export function runtimePoint(log2n: number, ratio: number, plot: Box): Point {
  return { x: plot.x + (log2n - 8) / 56 * plot.w, y: plot.y + (1.02 - ratio) / .04 * plot.h };
}

export function butterflyBox(box: Box, tall: boolean): Box {
  const height = Math.max(36, Math.min(100, (box.h - 300) * .7));

  return { x: box.x + (tall ? 10 : 22), y: box.y + (tall ? 250 : box.h - height - 31), w: box.w - (tall ? 20 : 44), h: tall ? 64 : height };
}

export function line(pen: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, amount = 1): void {
  pen.beginPath();
  pen.moveTo(x1, y1);
  pen.lineTo(mix(x1, x2, amount), mix(y1, y2, amount));
  pen.stroke();
}

export function text(pen: CanvasRenderingContext2D, words: string, x: number, y: number, size: number, maxWidth: number, colors: Colors, align: CanvasTextAlign = 'center', tone = colors.ink): void {
  const family = /[α-ωΑ-Ωℓ⊥≤≥≡∞√∇−→⇒⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/u.test(words) ? '"Garamond Math", serif' : /[À-ž]/u.test(words) ? '"Alegreya", "Garamond Math", serif' : '"Special Elite", monospace';

  for (const [index, row] of words.split('\n').entries()) {
    pen.font = `${size}px ${family}`;
    const width = pen.measureText(row).width;
    const fontSize = width > maxWidth ? size * maxWidth / width : size;
    pen.font = `${fontSize}px ${family}`;
    pen.textAlign = align;
    pen.textBaseline = 'middle';
    const bounds = pen.measureText(row);
    const left = align === 'left' ? x : align === 'right' ? x - bounds.width : x - bounds.width / 2;
    const baseline = y + index * (size + 4);
    pen.fillStyle = colors.paper;
    pen.fillRect(left - 3, baseline - bounds.actualBoundingBoxAscent - 3, bounds.width + 6, bounds.actualBoundingBoxAscent + bounds.actualBoundingBoxDescent + 6);
    pen.fillStyle = tone;
    pen.fillText(row, x, baseline);
  }
}

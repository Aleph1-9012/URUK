import { fittedText } from '../../plate/canvas/fitted-text';

export type Box = { x: number; y: number; w: number; h: number };

export type Point = { x: number; y: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

export type LineLayout = { x: number; y: number; pitch: number; rowGap: number; columns: number; rows: number; count: number; cellSize: number; arcHeight: number };

export type BlockLayout = { x: number; pitch: number; cellY: number; cellSize: number; barBase: number; barHeight: number; labelY: number };

export function lineLayout(box: Box, tall: boolean, count = 64): LineLayout {
  const columns = tall && count > 32 ? 32 : count;
  const rows = Math.ceil(count / columns);
  const available = box.w * (tall ? .96 : .78);
  const pitch = Math.min(count > 32 ? 15 : 27, available / columns);
  const x = box.x + (tall ? box.w / 2 : available / 2) - (columns - 1) * pitch / 2;

  return { x, y: box.y + box.h * (tall ? .23 : .34), pitch, rowGap: box.h * .24, columns, rows, count, cellSize: Math.min(tall ? 6 : 9, pitch * .66), arcHeight: tall ? 25 : 38 };
}

export function cellPoint(value: number, geometry: LineLayout): Point {
  if (!Number.isInteger(value) || value < 1 || value > geometry.count) throw new RangeError('A numbered cell lies inside the displayed positive-integer interval.');

  return { x: geometry.x + ((value - 1) % geometry.columns) * geometry.pitch, y: geometry.y + Math.floor((value - 1) / geometry.columns) * geometry.rowGap };
}

export function gaugeBox(box: Box, tall: boolean): Box {
  if (tall) return { x: box.x + box.w * .05, y: box.y + box.h * .74, w: box.w * .90, h: box.h * .19 };

  return { x: box.x + box.w * .82, y: box.y + box.h * .16, w: box.w * .16, h: box.h * .72 };
}

export function blockLayout(box: Box, tall: boolean): BlockLayout {
  const pitch = box.w * .94 / 31;

  return { x: box.x + box.w * .03, pitch, cellY: box.y + box.h * .29, cellSize: Math.min(tall ? 6 : 10, pitch * .66), barBase: box.y + box.h * .81, barHeight: box.h * .35, labelY: box.y + box.h * .91 };
}

export function blockCellPoint(value: number, geometry: BlockLayout): Point {
  if (!Number.isInteger(value) || value < 1 || value > 31) throw new RangeError('A displayed doubling block contains one of the integers from one through thirty-one.');

  return { x: geometry.x + (value - .5) * geometry.pitch, y: geometry.cellY };
}

export function completionBox(box: Box, _tall: boolean): Box {
  return { x: box.x + box.w * .03, y: box.y + box.h * .43, w: box.w * .94, h: box.h * .53 };
}

export function densityPlotBox(box: Box, tall: boolean): Box {
  return { x: box.x + (tall ? 19 : 32), y: box.y + box.h * .20, w: box.w - (tall ? 37 : 62), h: box.h * .47 };
}

export function densityPoint(m: number, ratio: number, plot: Box): Point {
  return { x: plot.x + (m - .5) / 12 * plot.w, y: plot.y + (1.2 - ratio) / 1.2 * plot.h };
}

export const text = fittedText(words => /[α-ωΑ-Ωℓ⊥≤≥≡∞√∇−→⇒⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/u.test(words) ? '"Garamond Math", serif' : /[À-ž]/u.test(words) ? '"Alegreya", "Garamond Math", serif' : '"Special Elite", monospace');

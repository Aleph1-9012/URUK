export type Box = { x: number; y: number; w: number; h: number };

export type Point = { x: number; y: number };

export type Point3 = { x: number; y: number; z: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

export type CubeLayout = { center: Point; scale: number; pointRadius: number };

export type TallyLayout = { x: number; y: number; pitch: number; rowGap: number; columns: number; cellSize: number; barHeight: number };

export function cubeLayout(box: Box, tall: boolean): CubeLayout {
  const top = box.y + (tall ? 35 : 42);
  const bottom = box.y + box.h * .70 - (tall ? 14 : 18);
  const height = bottom - top;

  return { center: { x: box.x + box.w / 2, y: (top + bottom) / 2 }, scale: Math.min(box.w / 6.8, height / 6.35), pointRadius: tall ? 1.35 : 1.8 };
}

export function comparisonBoxes(box: Box, amount: number): { grid: Box; random: Box } {
  const width = box.w * .47;

  return { grid: { x: box.x, y: box.y, w: box.w - (box.w - width) * amount, h: box.h }, random: { x: box.x + box.w * .53, y: box.y, w: width, h: box.h } };
}

export function projectPoint(point: Point3, geometry: CubeLayout, angle: number, verticalScale = 1): Point {
  const x = point.x - 2;
  const y = (point.y - 2) * verticalScale;
  const z = point.z - 2;
  const horizontal = Math.cos(angle) * x + Math.sin(angle) * z;
  const depth = -Math.sin(angle) * x + Math.cos(angle) * z;

  return { x: geometry.center.x + horizontal * geometry.scale, y: geometry.center.y + (depth * .48 - y * .88) * geometry.scale };
}

export function tallyLayout(box: Box, tall: boolean): TallyLayout {
  const columns = tall ? 24 : 48;
  const pitch = box.w * .94 / columns;

  return { x: box.x + box.w * .03, y: box.y + box.h * .80, pitch, rowGap: tall ? 32 : 0, columns, cellSize: Math.min(6, pitch * .65), barHeight: tall ? 16 : 24 };
}

export function tallyPoint(squared: number, geometry: TallyLayout): Point {
  if (!Number.isInteger(squared) || squared < 1 || squared > 48) throw new RangeError('The exact grid tally has squared-distance slots from one through forty-eight.');

  return { x: geometry.x + ((squared - 1) % geometry.columns + .5) * geometry.pitch, y: geometry.y + Math.floor((squared - 1) / geometry.columns) * geometry.rowGap };
}

export function ladderBox(box: Box, tall: boolean): Box {
  return { x: box.x + (tall ? 27 : 30), y: box.y + box.h * .11, w: box.w - (tall ? 41 : 46), h: box.h * .48 };
}

export function ladderPoint(exponent: number, plot: Box): Point {
  return { x: plot.x, y: plot.y + ((2 / 3 - exponent) / (2 / 3 - .5)) * plot.h };
}

export function subpolyPoint(plot: Box, tall: boolean): Point {
  return { x: plot.x, y: plot.y + (tall ? 24 : 22) };
}

export function ratioChartBox(box: Box, tall: boolean): Box {
  return { x: box.x + (tall ? 27 : 30), y: box.y + box.h * .70, w: box.w - (tall ? 43 : 46), h: box.h * .20 };
}

export function ratioPoint(t: number, ratio: number, plot: Box): Point {
  return { x: plot.x + (t - 2) / 10 * plot.w, y: plot.y + (1.6 - ratio) / 1.6 * plot.h };
}

export function line(pen: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, amount = 1): void {
  pen.beginPath();
  pen.moveTo(x1, y1);
  pen.lineTo(x1 + (x2 - x1) * amount, y1 + (y2 - y1) * amount);
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

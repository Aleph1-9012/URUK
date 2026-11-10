export type Box = { x: number; y: number; w: number; h: number };

export type Point = { x: number; y: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

export type GraphLayout = { center: Point; radius: number; idOffset: number; paletteY: number; isolateY: readonly [number, number]; fractionY: number };

export type GlyphStyle = { filled: boolean; strokeWidth: number };

export function graphLayout(box: Box, tall: boolean): GraphLayout {
  const paletteY = box.y + box.h * (tall ? .66 : .69);
  const top = box.y + (tall ? 46 : 60);
  const bottom = paletteY - (tall ? 32 : 35);
  const idOffset = tall ? 20 : 24;

  return { center: { x: box.x + box.w / 2, y: (top + bottom) / 2 }, radius: Math.min(box.w * .35, box.h * .24, (bottom - top) / 2 - idOffset), idOffset, paletteY, isolateY: [box.y + box.h * (tall ? .75 : .78), box.y + box.h * (tall ? .81 : .85)], fractionY: box.y + box.h * (tall ? .90 : .94) };
}

export function vertexPoint(position: Point, geometry: GraphLayout): Point {
  return { x: geometry.center.x + (position.x - .5) * geometry.radius / .46, y: geometry.center.y + (position.y - .5) * geometry.radius / .46 };
}

export function growthChartBox(box: Box, tall: boolean): Box {
  return { x: box.x + (tall ? 25 : 30), y: box.y + box.h * (tall ? .29 : .22), w: box.w - (tall ? 55 : 67), h: box.h * (tall ? .40 : .48) };
}

export function growthPoint(n: number, value: number, plot: Box): Point {
  return { x: plot.x + (Math.log10(n) - 3) / 6 * plot.w, y: plot.y + (64 - value) / 64 * plot.h };
}

export function glyphRadius(size: number): number { return size * .425; }

export function glyphStyle(kind: number): GlyphStyle {
  if (kind === 0 || kind === 4) return { filled: true, strokeWidth: .65 };
  if (kind === 1) return { filled: false, strokeWidth: 1.15 };
  if (kind === 2) return { filled: false, strokeWidth: .7 };
  if (kind === 3 || kind === 5) return { filled: false, strokeWidth: 1.1 };

  throw new RangeError('The palette has six computed ink-glyph classes.');
}

export function glyphPath(kind: number, radius: number): string {
  if (!(radius > 0 && Number.isFinite(radius))) throw new RangeError('An ink glyph has a positive finite radius.');

  if (kind === 0 || kind === 1 || kind === 2) return `M${radius},0A${radius},${radius} 0 1 0 ${-radius},0A${radius},${radius} 0 1 0 ${radius},0Z`;

  if (kind === 3) {
    const side = radius * .9;

    return `M${-side},${-side}H${side}V${side}H${-side}Z`;
  }

  if (kind === 4) return `M0,${-radius}L${radius},${radius * .9}L${-radius},${radius * .9}Z`;
  if (kind === 5) return `M0,${-radius}L${radius},0L0,${radius}L${-radius},0Z`;

  throw new RangeError('The palette has six computed ink-glyph classes.');
}

export function hatchPath(radius: number): string {
  let path = '';
  const diagonal = Math.SQRT1_2;

  for (const offset of [-.6 * radius, 0, .6 * radius]) {
    const half = Math.sqrt(radius * radius - offset * offset);
    const a = { x: diagonal * (offset - half), y: diagonal * (offset + half) };
    const b = { x: diagonal * (offset + half), y: diagonal * (offset - half) };
    path += `M${a.x},${a.y}L${b.x},${b.y}`;
  }

  return path;
}

export function drawGlyph(pen: CanvasRenderingContext2D, kind: number, x: number, y: number, size: number, colors: Colors): void {
  if (size <= 0) return;

  const radius = glyphRadius(size);
  const style = glyphStyle(kind);
  const outline = new Path2D(glyphPath(kind, radius));
  pen.save();
  pen.translate(x, y);
  pen.fillStyle = colors.paper;
  pen.beginPath();
  pen.arc(0, 0, radius + 1, 0, Math.PI * 2);
  pen.fill();
  pen.fillStyle = style.filled ? colors.ink : colors.paper;
  pen.fill(outline);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = style.strokeWidth;
  pen.lineJoin = 'round';
  pen.lineCap = 'round';
  pen.stroke(outline);

  if (kind === 2) {
    pen.save();
    pen.clip(outline);
    pen.lineWidth = .85;
    pen.stroke(new Path2D(hatchPath(radius)));
    pen.restore();
  }

  pen.restore();
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

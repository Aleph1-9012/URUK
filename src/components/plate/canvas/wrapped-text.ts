export type FontFamily = 'type' | 'serif' | 'math';

export type TextStyle = {
  size: number;
  color: string;
  family?: FontFamily;
  align?: CanvasTextAlign;
  paper?: string;
};

export type TextBounds = { x: number; y: number; width: number; height: number };

const FONTS = {
  type: '"Special Elite", serif',
  serif: 'Alegreya, serif',
  math: '"Garamond Math", serif',
} as const;

export function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width = 1, dash: readonly number[] = []): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.setLineDash(Array.from(dash));
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

// x,y is the centred text anchor. The returned ink bounds also determine
// paper clearance, including the actual maths-font ascenders and descenders.
export function drawText(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, style: TextStyle): TextBounds {
  ctx.save();
  ctx.font = `${style.size}px ${FONTS[style.family ?? 'type']}`;
  ctx.textAlign = style.align ?? 'center';
  ctx.textBaseline = 'middle';
  const metrics = ctx.measureText(value);
  const bounds = {
    x: x - metrics.actualBoundingBoxLeft,
    y: y - metrics.actualBoundingBoxAscent,
    width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
  };

  if (style.paper && value) {
    ctx.fillStyle = style.paper;
    ctx.fillRect(bounds.x - 2, bounds.y - 2, bounds.width + 4, bounds.height + 4);
  }

  ctx.fillStyle = style.color;
  ctx.fillText(value, x, y);
  ctx.restore();

  return bounds;
}

function linesFor(ctx: CanvasRenderingContext2D, value: string, width: number): string[] {
  const result: string[] = [];

  for (const paragraph of value.split('\n')) {
    let line = '';

    for (const word of paragraph.split(' ')) {
      if (!word) continue;

      const candidate = line ? line + ' ' + word : word;

      if (ctx.measureText(candidate).width <= width) {
        line = candidate;
        continue;
      }

      if (line) result.push(line);

      line = '';

      for (const letter of word) {
        if (line && ctx.measureText(line + letter).width > width) {
          result.push(line);
          line = '';
        }

        line += letter;
      }
    }

    result.push(line);
  }

  return result;
}

export function drawWrappedText(ctx: CanvasRenderingContext2D, value: string, x: number, top: number, width: number, style: TextStyle): TextBounds {
  if (!(width > 0)) throw new RangeError('Wrapped text needs a positive available width.');

  ctx.save();
  ctx.font = `${style.size}px ${FONTS[style.family ?? 'type']}`;
  const lines = linesFor(ctx, value, width);
  ctx.restore();
  let left = Infinity;
  let right = -Infinity;
  let firstTop = top;
  let bottom = top;

  for (const [index, line] of lines.entries()) {
    const y = top + style.size * .6 + index * style.size * 1.3;
    const bounds = drawText(ctx, line, x, y, style);
    left = Math.min(left, bounds.x);
    right = Math.max(right, bounds.x + bounds.width);
    bottom = Math.max(bottom, bounds.y + bounds.height);

    if (index === 0) firstTop = bounds.y;
  }

  return { x: left, y: firstTop, width: right - left, height: bottom - firstTop };
}

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

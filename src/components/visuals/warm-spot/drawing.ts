export type Box = { x: number; y: number; w: number; h: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

function inkHash(value: number): number {
  let hash = Math.imul(value ^ 0x51ed270b, 0x45d9f3b);
  hash = Math.imul(hash ^ hash >>> 16, 0x45d9f3b);

  return (hash ^ hash >>> 16) >>> 0;
}

export function stippleSample(index: number, slot: number): { x: number; y: number; threshold: number; reveal: number } {
  if (!Number.isInteger(index) || index < 0 || (slot !== 0 && slot !== 1)) throw new RangeError('Each cell has two fixed stipple samples.');

  const key = index * 2 + slot;

  return {
    x: (inkHash(key * 4) / 4294967296 - .5) * .85,
    y: (inkHash(key * 4 + 1) / 4294967296 - .5) * .85,
    threshold: inkHash(key * 4 + 2) / 4294967296,
    reveal: inkHash(key * 4 + 3) / 4294967296,
  };
}

export function line(pen: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, amount = 1): void {
  pen.beginPath();
  pen.moveTo(x1, y1);
  pen.lineTo(x1 + (x2 - x1) * amount, y1 + (y2 - y1) * amount);
  pen.stroke();
}

export function text(pen: CanvasRenderingContext2D, words: string, x: number, y: number, size: number, maxWidth: number, colors: Colors, align: CanvasTextAlign = 'center', tone = colors.ink): void {
  const family = /[α-ωΑ-Ωℓ⊥≤≥∞√∇−⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/u.test(words) ? '"Garamond Math", serif' : /[À-ž]/u.test(words) ? '"Alegreya", "Garamond Math", serif' : '"Special Elite", monospace';

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

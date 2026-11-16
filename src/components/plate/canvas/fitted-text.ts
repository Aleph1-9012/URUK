import type { FilmTones } from '../frame';

/**
 * Builds a film's caption writer. Each row is shrunk to fit `maxWidth` and drawn on a paper patch.
 * The film passes the rule that picks a font stack from the words, since films differ in the glyphs they need.
 */
export function fittedText(familyFor: (words: string) => string) {
  return function text(pen: CanvasRenderingContext2D, words: string, x: number, y: number, size: number, maxWidth: number, colors: FilmTones, align: CanvasTextAlign = 'center', tone = colors.ink): void {
    const family = familyFor(words);

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
  };
}

import { expect, test } from 'bun:test';
import { LINE_BUDGET, layOutTyping, struckBy, typedClip, type Glyph } from './typing';

/** Letters ten pixels wide on rows 26 pixels apart, inside a framed box with a 20 pixel padding. */
function paragraph(rows: string[]): Glyph[] {
  return rows.flatMap((row, line) =>
    Array.from(row).flatMap((letter, column) =>
      letter === ' '
        ? []
        : [
            {
              left: 20 + 10 * column,
              right: 30 + 10 * column,
              top: 20 + 26 * line,
              bottom: 40 + 26 * line,
              spaced: row[column - 1] === ' ',
            },
          ],
    ),
  );
}

function corners(clip: string): [number, number][] {
  return Array.from(clip.matchAll(/(-?[\d.]+)px (-?[\d.]+)px/g), (match) => [Number(match[1]), Number(match[2])]);
}

/** Whether a polygon clip with the even-odd rule shows this point. */
function shows(clip: string, x: number, y: number): boolean {
  if (clip === '') return true;

  const outline = corners(clip);
  let inside = false;

  for (const [index, [x1, y1]] of outline.entries()) {
    const [x2, y2] = outline[(index + 1) % outline.length] ?? [x1, y1];

    if (y1 > y !== y2 > y && x < x1 + ((y - y1) * (x2 - x1)) / (y2 - y1)) inside = !inside;
  }

  return inside;
}

const rows = ['read the', 'results now'];
const width = 160;
const height = 86;
// Handed over out of order, as a flex row can lay its items out.
const found = paragraph(rows).reverse();

test('letters strike row by row from the left, the whole line within its budget', () => {
  const typing = layOutTyping(found, width, height);
  const reading = paragraph(rows);

  expect(typing.glyphs).toEqual(reading);
  expect(typing.strikes[0]).toBe(0);

  for (const [index, strike] of typing.strikes.entries()) {
    if (index > 0) expect(strike).toBeGreaterThan(typing.strikes[index - 1] ?? Infinity);
  }

  expect(typing.strikes.at(-1)).toBeLessThanOrEqual(LINE_BUDGET);
  expect(struckBy(typing, -1)).toBe(0);
  expect(struckBy(typing, 0)).toBe(1);
  expect(struckBy(typing, LINE_BUDGET)).toBe(reading.length);
});

test('the clip shows the struck letters and the frame, and nothing that has yet to strike', () => {
  const typing = layOutTyping(found, width, height);

  for (let struck = 0; struck <= typing.glyphs.length; struck += 1) {
    const clip = typedClip(typing, struck);

    for (const [index, glyph] of typing.glyphs.entries()) {
      const middle = { x: (glyph.left + glyph.right) / 2, y: (glyph.top + glyph.bottom) / 2 };

      expect(shows(clip, middle.x, middle.y)).toBe(index < struck);
    }

    if (struck > 0) {
      expect(shows(clip, 0.5, 0.5)).toBe(true);
      expect(shows(clip, width - 0.5, height - 0.5)).toBe(true);
    }
  }
});

test('a line without letters is shown whole', () => {
  const typing = layOutTyping([], width, height);

  expect(typedClip(typing, struckBy(typing, 0))).toBe('');
});

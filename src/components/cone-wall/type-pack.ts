import type { BlankLayout, Letter } from './material';
import type { Band } from './raster';

interface Glyph { vertical: [number, number][]; letter: string; advance: number; x: number; y: number; w: number; h: number; offset: number; ascent: number; descent: number }
export function typePack(metadata: string, alpha: Uint8Array, size: number) {
  const pack: { size: number; glyphs: Glyph[] } = JSON.parse(metadata);
  if (pack.size !== size) throw new Error('Incorrect type size');
  return { alpha, glyphs: new Map(pack.glyphs.map(g => [g.letter, g])) };
}

export function inscription(name: string, layout: BlankLayout, band: { x: number; beat: number }[],
  strip: Band, type: ReturnType<typeof typePack>) {
  const { width, density, fontSize, centre } = layout;
  const spacing = 0.04 * fontSize;
  const letters: Letter[] = [];
  let advance = 0, ascent = 0, descent = 0;
  for (const value of name) {
    const glyph = type.glyphs.get(value);
    if (!glyph) throw new Error('Missing band glyph');
    const w = glyph.advance * fontSize;
    letters.push({ value, x: advance, width: w });
    advance += w + spacing;
    const vertical = glyph.vertical[density - 1];
    ascent = Math.max(ascent, vertical ? vertical[0] * density : glyph.ascent);
    descent = Math.max(descent, vertical ? vertical[1] * density : glyph.descent);
  }
  const left = (width - advance + spacing) / 2;
  const baseline = Math.round(centre * density + (ascent - descent) / 2);
  const x = Math.max(0, Math.floor((left - 5) * density));
  const w = Math.min(strip.width - x, Math.ceil((advance + 10) * density));
  const y = Math.max(strip.y, baseline - Math.ceil(ascent) - 2);
  const h = Math.min(strip.y + strip.height - y, baseline - y + Math.ceil(descent) + 2);
  const alpha = new Uint8Array(w * h);
  for (let row = 0; row < h; row++) {
    const start = (y - strip.y + row) * strip.width + x;
    alpha.set(strip.alpha.subarray(start, start + w), row * w);
  }
  let beat = 0;
  for (const seat of band) if (seat.x >= left - 8 && seat.x < left + advance + 8) beat = Math.max(beat, Math.min(47, seat.beat + 1));
  for (const letter of letters) {
    letter.x += left;
    const glyph = type.glyphs.get(letter.value)!;
    const quarter = Math.round(letter.x * density * 4);
    const gx = Math.floor(quarter / 4) + glyph.x - x;
    const gy = baseline + glyph.y - y;
    const phase = quarter & 3;
    let src = glyph.offset + phase * glyph.w * glyph.h;
    for (let row = 0; row < glyph.h; row++) {
      for (let col = 0; col < glyph.w; col++) {
        const a = type.alpha[src++]!;
        if (!a || gx + col < 0 || gx + col >= w || gy + row < 0 || gy + row >= h) continue;
        const at = (gy + row) * w + gx + col;
        alpha[at] = a + Math.round(alpha[at]! * (255 - a) / 255);
      }
    }
  }

  return {
    layout: { ...layout, letters, baseline: baseline / density },
    strike: { x, y, width: w, height: h, alpha },
    beat,
  };
}

/** Milliseconds between two letters, before the beat varies. */
const BEAT = 9;
/** The typist's pause after a space and at the end of a row. */
const WORD_PAUSE = 14;
const ROW_RETURN = 30;
/** A whole line is typed within this, however long it is. */
export const LINE_BUDGET = 700;
/** Italic letters, accents and tails can reach a little past the box a letter measures. */
const INK_PAD = 4;
/** The clip's outer edge, past anything a line draws around its letters. */
const REACH = 24;
/** Nothing of the line shows before its first letter strikes. */
export const UNTYPED = 'inset(50%)';

/** A letter or an icon, in pixels from the top left of its line's box. */
export interface Glyph {
  left: number;
  right: number;
  top: number;
  bottom: number;
  /** It comes after a space, so the typist pauses before it. */
  spaced: boolean;
}

/** A line ready to type: its letters in the order they strike, and when each one does. */
export interface Typing {
  width: number;
  height: number;
  /** Row by row from the top, each row from the left. */
  glyphs: Glyph[];
  /** The row of each glyph. */
  rows: number[];
  /** Each row's band, split halfway between neighbouring rows. */
  bands: { top: number; bottom: number }[];
  /** Milliseconds after the line starts at which each glyph strikes; the first strikes at once. */
  strikes: number[];
  /** What the letters cover. A frame around them, as on the button, shows as soon as the line starts. */
  ink: { left: number; right: number; bottom: number };
}

/** A beat between 0.6 and 1.4 of the usual one, the same for the same letter on every visit. */
function unevenness(index: number): number {
  const noise = Math.sin(index * 12.9898) * 43758.5453;

  return 0.6 + 0.8 * (noise - Math.floor(noise));
}

/** Rows from the top, each read from the left; a glyph joins a row when its middle is above the row's foot. */
function rowsOf(glyphs: Glyph[]): Glyph[][] {
  const rows: { bottom: number; glyphs: Glyph[] }[] = [];

  for (const glyph of [...glyphs].sort((first, second) => first.top - second.top)) {
    const row = rows.at(-1);

    if (row && (glyph.top + glyph.bottom) / 2 < row.bottom) {
      row.glyphs.push(glyph);
      row.bottom = Math.max(row.bottom, glyph.bottom);
    } else {
      rows.push({ bottom: glyph.bottom, glyphs: [glyph] });
    }
  }

  return rows.map((row) => row.glyphs.sort((first, second) => first.left - second.left));
}

/** Order a line's glyphs as a typist strikes them and time each strike. */
export function layOutTyping(found: Glyph[], width: number, height: number): Typing {
  const rows = rowsOf(found);
  const glyphs = rows.flat();
  const rowOf = rows.flatMap((row, index) => row.map(() => index));
  const strikes: number[] = [];
  let time = 0;

  for (const [index, glyph] of glyphs.entries()) {
    if (index > 0) {
      const returned = rowOf[index] !== rowOf[index - 1];

      time += BEAT * unevenness(index) + (glyph.spaced ? WORD_PAUSE : 0) + (returned ? ROW_RETURN : 0);
    }

    strikes.push(time);
  }

  const fit = time > LINE_BUDGET ? LINE_BUDGET / time : 1;
  const top = Math.min(...glyphs.map((glyph) => glyph.top)) - INK_PAD;
  const bottom = Math.max(...glyphs.map((glyph) => glyph.bottom)) + INK_PAD;
  const splits = rows.slice(1).map((row, index) => {
    const above = Math.max(...(rows[index] ?? []).map((glyph) => glyph.bottom));

    return (above + Math.min(...row.map((glyph) => glyph.top))) / 2;
  });

  return {
    width,
    height,
    glyphs,
    rows: rowOf,
    bands: rows.map((_, index) => ({ top: splits[index - 1] ?? top, bottom: splits[index] ?? bottom })),
    strikes: strikes.map((strike) => strike * fit),
    ink: {
      left: Math.min(...glyphs.map((glyph) => glyph.left)) - INK_PAD,
      right: Math.max(...glyphs.map((glyph) => glyph.right)) + INK_PAD,
      bottom,
    },
  };
}

/** How many glyphs have struck this long after the line started. */
export function struckBy(typing: Typing, elapsed: number): number {
  if (elapsed < 0) return 0;

  const next = typing.strikes.findIndex((strike) => strike > elapsed);

  return next === -1 ? typing.strikes.length : next;
}

function points(corners: [number, number][]): string {
  return corners.map(([x, y]) => `${Math.round(x * 100) / 100}px ${Math.round(y * 100) / 100}px`).join(', ');
}

/**
 * Show the line up to the glyph that strikes next. The unstruck rest of its row and every row below are cut out of a
 * box around the line; the cut joins the box along one edge drawn there and back, which the even-odd rule leaves empty.
 */
export function typedClip(typing: Typing, struck: number): string {
  const glyph = typing.glyphs[struck];
  const band = typing.bands[typing.rows[struck] ?? 0];

  if (!glyph || !band) return '';

  if (struck === 0) return UNTYPED;

  const { width, height, ink } = typing;
  const from = glyph.left;

  return `polygon(evenodd, ${points([
    [-REACH, -REACH],
    [width + REACH, -REACH],
    [width + REACH, height + REACH],
    [-REACH, height + REACH],
    [-REACH, -REACH],
    [from, band.top],
    [ink.right, band.top],
    [ink.right, ink.bottom],
    [ink.left, ink.bottom],
    [ink.left, band.bottom],
    [from, band.bottom],
    [from, band.top],
  ])})`;
}

/** Letters as their own boxes and each icon or image as one, measured where the page has set them. */
export function readGlyphs(line: HTMLElement): Glyph[] {
  const box = line.getBoundingClientRect();
  const range = document.createRange();
  const glyphs: Glyph[] = [];
  let spaced = false;
  // An icon is one glyph, so nothing inside it is read, not even the spaces between its paths.
  const walker = document.createTreeWalker(line, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (node instanceof SVGSVGElement || node instanceof HTMLImageElement) return NodeFilter.FILTER_ACCEPT;

      if (node instanceof SVGElement || node.parentElement instanceof SVGElement) return NodeFilter.FILTER_REJECT;

      return node instanceof Text ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  const add = (rect: DOMRect): void => {
    if (rect.width === 0 || rect.height === 0) return;

    glyphs.push({
      left: rect.left - box.left,
      right: rect.right - box.left,
      top: rect.top - box.top,
      bottom: rect.bottom - box.top,
      spaced: spaced && glyphs.length > 0,
    });
    spaced = false;
  };

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node instanceof Element) {
      add(node.getBoundingClientRect());
      continue;
    }

    if (!(node instanceof Text)) continue;

    for (let index = 0; index < node.data.length; ) {
      const letter = String.fromCodePoint(node.data.codePointAt(index) ?? 32);
      const next = index + letter.length;

      if (/\s/.test(letter)) {
        spaced = true;
      } else {
        range.setStart(node, index);
        range.setEnd(node, next);
        add(range.getBoundingClientRect());
      }

      index = next;
    }
  }

  return glyphs;
}

const EDGE = 'rgb(46 66 88 / 52%)';
const CORE = 'rgb(248 246 240 / 94%)';
/** A film of river water over the engraving, which greys its ink until it drains off. */
const GLAZE = 'rgb(214 224 230 / 34%)';
const SAMPLE_WIDTH = 190;
const GRAVITY = 0.0021;
/** How fast beads run down the art, in CSS pixels per millisecond at full size. */
const FLOW = 0.26;
/** The film's front starts down slowly and speeds up as the water thins, in the art's heights per second. */
const DRAIN_SPEED = 0.16;
const DRAIN_PULL = 0.66;
const DRIP_EVERY = 340;
const SPLASH_EVERY = 420;

export interface RisingArt {
  image: HTMLImageElement;
  /** The art's box at rest, in the runoff canvas's coordinates. */
  left: number;
  top: number;
  width: number;
  height: number;
  /** The water surface the art rises through, in the same coordinates. */
  cut: number;
  /** Water sheets down the whole face of a solid object, but follows the strokes of a lettered one. */
  solid: boolean;
}

interface Stream {
  art: number;
  x: number;
  top: number;
  foot: number;
  width: number;
  /** Length of one bead of water and the gap after it, at full flow. */
  period: number;
  life: number;
  seed: number;
  surfacedAt: number | null;
  nextDrip: number;
  nextSplash: number;
  done: boolean;
}

interface Drop {
  art: number;
  x: number;
  y: number;
  born: number;
  size: number;
}

/** The film of water over a solid art, kept inside the art's outline. */
interface Sheet {
  /** Top of the art in each sampled column, below its resting top; NaN where the column is empty. */
  crest: Float32Array;
  /** Foot of the art in each sampled column, below its resting top. */
  foot: Float32Array;
  /** When each column's crest broke the surface; NaN until it does. */
  surfaced: Float32Array;
  /** Where the film ends in each column on this frame, before its edge is smoothed. */
  fronts: Float32Array;
}

export interface Splash {
  x: number;
  y: number;
  size: number;
}

export interface Runoff {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  density: number;
  stroke: number;
  arts: RisingArt[];
  /** Only a solid art carries a film; letters shed their water in streams alone. */
  sheets: (Sheet | null)[];
  streams: Stream[];
  drops: Drop[];
}

/** Strokes of one art, grouped by line width so that each width is stroked once. */
interface Wet {
  edges: Map<number, Path2D>;
  cores: Map<number, Path2D>;
  film: Path2D;
  front: Path2D;
  drops: Path2D;
  dropCores: Path2D;
}

interface Sample {
  columns: number;
  rows: number;
  inked: (column: number, row: number) => boolean;
}

function noise(seed: number): number {
  const value = Math.sin(seed * 78.233) * 24634.6345;

  return value - Math.floor(value);
}

function pathFor(paths: Map<number, Path2D>, width: number): Path2D {
  const key = Math.max(0.25, Math.round(width * 4) / 4);
  const path = paths.get(key) ?? new Path2D();

  paths.set(key, path);

  return path;
}

function sampleArt(art: RisingArt): Sample | null {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) return null;

  const columns = SAMPLE_WIDTH;
  const rows = Math.max(1, Math.round(columns * art.height / art.width));

  canvas.width = columns;
  canvas.height = rows;
  context.drawImage(art.image, 0, 0, columns, rows);

  const alpha = context.getImageData(0, 0, columns, rows).data;

  return { columns, rows, inked: (column, row) => (alpha[(row * columns + column) * 4 + 3] ?? 0) > 110 };
}

function firstInked(sample: Sample, column: number): number {
  for (let row = 0; row < sample.rows; row += 1) {
    if (sample.inked(column, row)) return row;
  }

  return -1;
}

function lastInked(sample: Sample, column: number): number {
  for (let row = sample.rows - 1; row >= 0; row -= 1) {
    if (sample.inked(column, row)) return row;
  }

  return -1;
}

/** Find, column by column, where water would gather on the art and how far down it can run. */
function findStreams(art: RisingArt, index: number, sample: Sample, spacing: number, stroke: number): Stream[] {
  const { columns, rows, inked } = sample;
  const streams: Stream[] = [];
  const seedBase = index * 101 + 1;
  let position = noise(seedBase) * spacing;

  while (position < art.width) {
    const column = Math.min(columns - 1, Math.floor(position / art.width * columns));
    const seed = seedBase + streams.length * 1.37;
    let first = firstInked(sample, column);

    if (first >= 0) {
      let last = rows - 1;

      if (art.solid) {
        // Some water runs from the crest, some from hollows further down the face.
        if (noise(seed + 6) < 0.45) first += Math.floor((rows - 1 - first) * 0.55 * noise(seed + 7));
      } else {
        last = first;

        // A lettered stroke ends where two clear rows in a row open beneath it.
        while (last + 2 < rows && (inked(column, last + 1) || inked(column, last + 2))) last += 1;
      }

      streams.push({
        art: index,
        x: art.left + position,
        top: art.top + (first + 0.5) / rows * art.height,
        foot: art.top + (last + 1) / rows * art.height,
        width: stroke * (0.8 + 1.4 * noise(seed + 2) ** 2),
        period: stroke * (9 + 10 * noise(seed + 8)),
        life: 900 + 900 * noise(seed + 3),
        seed,
        surfacedAt: null,
        nextDrip: 0,
        nextSplash: 0,
        done: false,
      });
    }

    position += spacing * (0.35 + 1.3 * noise(seedBase + position));
  }

  return streams;
}

function prepareSheet(art: RisingArt, sample: Sample): Sheet {
  const { columns, rows } = sample;
  const crest = new Float32Array(columns);
  const foot = new Float32Array(columns);

  for (let column = 0; column < columns; column += 1) {
    const first = firstInked(sample, column);

    crest[column] = first < 0 ? Number.NaN : first / rows * art.height;
    foot[column] = first < 0 ? Number.NaN : (lastInked(sample, column) + 1) / rows * art.height;
  }

  return { crest, foot, surfaced: new Float32Array(columns).fill(Number.NaN), fronts: new Float32Array(columns) };
}

export function prepareRunoff(canvas: HTMLCanvasElement, arts: RisingArt[], scale: number): Runoff | null {
  const context = canvas.getContext('2d');

  if (!context) return null;

  const bounds = canvas.getBoundingClientRect();
  const density = Math.min(devicePixelRatio, 2);
  const stroke = Math.min(1.5, Math.max(0.75, scale));
  const sheets: (Sheet | null)[] = [];
  const streams: Stream[] = [];

  canvas.width = Math.ceil(bounds.width * density);
  canvas.height = Math.ceil(bounds.height * density);

  for (const [index, art] of arts.entries()) {
    const sample = sampleArt(art);

    if (!sample) return null;

    sheets.push(art.solid ? prepareSheet(art, sample) : null);
    streams.push(...findStreams(art, index, sample, (art.solid ? 21 : 9) * stroke, stroke));
  }

  return { context, width: bounds.width, height: bounds.height, density, stroke, arts, sheets, streams, drops: [] };
}

/**
 * The art comes up wet all over. Each column drains from its crest down, starting when the crest
 * breaks the surface, along a ragged front that leaves the art dry above it.
 */
function addFilm(wet: Wet, art: RisingArt, sheet: Sheet, shift: number, elapsed: number, stroke: number): void {
  const { crest, foot, surfaced, fronts } = sheet;
  const columns = crest.length;
  const span = art.width / columns;
  let wetRun = false;

  for (let column = 0; column < columns; column += 1) {
    const top = art.top + (crest[column] ?? Number.NaN) + shift;

    fronts[column] = art.cut;

    if (Number.isNaN(surfaced[column] ?? Number.NaN) && top < art.cut) surfaced[column] = elapsed;

    const since = elapsed - (surfaced[column] ?? Number.NaN);

    if (since >= 0) {
      const ragged = 5 * stroke * (0.6 * Math.sin(column * 0.37 + art.left) + 0.4 * Math.sin(column * 0.11 + 2 * art.top));
      const seconds = since / 1000;
      const drained = top + art.height * seconds * (DRAIN_SPEED + DRAIN_PULL * seconds) + ragged * Math.min(1, since / 250);

      fronts[column] = Math.max(top, Math.min(art.cut, drained));
    }
  }

  // Water pulls its edge into a curve: each column's front leans on its neighbours'.
  // The film is laid column by column inside the art's outline, and its edge is drawn only where it lies on the art.
  for (let column = 0; column < columns; column += 1) {
    const x = art.left + (column + 0.5) * span;
    const crestTop = art.top + (crest[column] ?? Number.NaN) + shift;
    const footY = Math.min(art.cut, art.top + (foot[column] ?? Number.NaN) + shift);
    let sum = 0;
    let count = 0;

    for (let near = Math.max(0, column - 2); near <= Math.min(columns - 1, column + 2); near += 1) {
      sum += fronts[near] ?? art.cut;
      count += 1;
    }

    const front = sum / count;
    const filmTop = Math.max(front, crestTop);

    // Neighbouring columns overlap a little so that no seam opens between them.
    if (footY > filmTop) wet.film.rect(art.left + column * span - 0.25, filmTop, span + 0.5, footY - filmTop);

    const onArt = front < art.cut - 0.5 && front >= crestTop - 0.5 && front <= footY;

    if (onArt && wetRun) {
      wet.front.lineTo(x, front);
    } else if (onArt) {
      wet.front.moveTo(x, front);
    }

    wetRun = onArt;
  }
}

/**
 * Lay the water of one stream between `upper` and `lower` as beads that run down it.
 * `fill` is the share of each period that is water: a whole sheet at first, then beads further apart.
 */
function addFlow(wet: Wet, stream: Stream, span: { origin: number; upper: number; lower: number }, width: number, fill: number, run: number, stroke: number): void {
  const { origin, upper, lower } = span;
  const wobble = (y: number): number => stream.x + 0.7 * stroke * Math.sin((y - origin) / (9 * stroke) + stream.seed);
  const edge = pathFor(wet.edges, width + 1.2 * stroke);
  const core = pathFor(wet.cores, 0.5 * width);
  const length = stream.period * fill;
  const phase = origin + run % stream.period;

  // The beads ride on the art as it rises and run down it at the same time.
  for (let start = phase + stream.period * Math.floor((upper - phase) / stream.period); start < lower; start += stream.period) {
    const top = Math.max(upper, start);
    const bottom = Math.min(lower, start + length);

    if (bottom - top < 0.6 * stroke) continue;

    const middle = wobble((top + bottom) / 2);
    const lean = 0.08 * (bottom - top) * Math.cos((top - origin) / (9 * stroke) + stream.seed);

    edge.moveTo(middle + 0.35 * stroke - lean, top);
    edge.lineTo(middle + 0.35 * stroke + lean, bottom);
    core.moveTo(middle - 0.2 * stroke - lean, top + 0.3 * stroke);
    core.lineTo(middle - 0.2 * stroke + lean, bottom - 0.3 * stroke);
  }
}

function addDrop(wet: Wet, x: number, y: number, size: number, stroke: number): void {
  wet.drops.moveTo(x + size + 0.6 * stroke, y);
  wet.drops.ellipse(x, y, size + 0.6 * stroke, (size + 0.6 * stroke) * 1.6, 0, 0, Math.PI * 2);
  wet.dropCores.moveTo(x + 0.35 * size, y - 0.3 * size);
  wet.dropCores.ellipse(x - 0.2 * size, y - 0.3 * size, 0.55 * size, 0.9 * size, 0, 0, Math.PI * 2);
}

/** Water heaped against the art's foot while it is still coming up through the surface, spilling off as it clears. */
function addMound(wet: Wet, art: RisingArt, shift: number, elapsed: number, stroke: number): void {
  const bottom = art.top + art.height + shift;
  const out = 1 - (bottom - art.cut) / art.height;

  if (art.top + shift >= art.cut || out >= 1) return;

  const height = Math.min(7 * stroke, 0.035 * art.height) * Math.sin(Math.PI * Math.max(0, out)) ** 0.7;
  const step = 7 * stroke;
  const edge = pathFor(wet.edges, 1.1 * stroke);
  const core = pathFor(wet.cores, 1.2 * stroke);

  for (let x = art.left - 2 * step; x < art.left + art.width + 2 * step; x += step) {
    const across = (x - art.left) / art.width;
    const rise = height * Math.min(1, Math.max(0, Math.min(across + 0.08, 1.08 - across) / 0.12));
    const swell = 0.75 + 0.25 * Math.sin(x / (5 * stroke) - elapsed / 110);

    for (let layer = 0; layer < 3; layer += 1) {
      const y = art.cut - rise * swell * (1 - 0.33 * layer) + 0.6 * stroke * layer;
      const length = step * (0.85 - 0.18 * layer) * (0.7 + 0.3 * noise(x + layer));
      const left = x + (noise(x * 3 + layer) - 0.5) * 0.4 * step;

      if (y >= art.cut - 0.4 * stroke) continue;

      core.moveTo(left, y);
      core.lineTo(left + length, y);
      edge.moveTo(left + 0.1 * length, y + 1.1 * stroke);
      edge.lineTo(left + 0.9 * length, y + 1.1 * stroke);
    }
  }
}

function strokeAll(context: CanvasRenderingContext2D, paths: Map<number, Path2D>, colour: string): void {
  context.strokeStyle = colour;

  for (const [width, path] of paths) {
    context.lineWidth = width;
    context.stroke(path);
  }
}

/** Lay one art's water on the runoff: drops fall freely, but a film and its streams stay on the art. */
function paintWet(runoff: Runoff, art: RisingArt, sheet: Sheet | null, wet: Wet): void {
  const { context, stroke } = runoff;

  // Only what has come out of the water is wet; below the cut the river still covers it.
  context.save();
  context.beginPath();
  context.rect(0, 0, runoff.width, art.cut);
  context.clip();
  context.fillStyle = EDGE;
  context.fill(wet.drops);
  context.fillStyle = CORE;
  context.fill(wet.dropCores);

  if (sheet) {
    context.fillStyle = GLAZE;
    context.fill(wet.film);
    context.translate(0, 1.3 * stroke);
    context.lineWidth = 1.1 * stroke;
    context.strokeStyle = EDGE;
    context.stroke(wet.front);
    context.translate(0, -1.3 * stroke);
    context.lineWidth = 1.4 * stroke;
    context.strokeStyle = CORE;
    context.stroke(wet.front);
  }

  strokeAll(context, wet.edges, EDGE);
  strokeAll(context, wet.cores, CORE);
  context.restore();
}

/**
 * Paint the water running off the risen art. Each art lies `shifts[index]` pixels below its resting place.
 * Returns where water fell back into the river on this frame.
 */
export function paintRunoff(runoff: Runoff, elapsed: number, shifts: number[], dryBy: number): Splash[] {
  const { context, stroke } = runoff;
  const wets: Wet[] = runoff.arts.map(() => ({
    edges: new Map(),
    cores: new Map(),
    film: new Path2D(),
    front: new Path2D(),
    drops: new Path2D(),
    dropCores: new Path2D(),
  }));
  const splashes: Splash[] = [];

  context.setTransform(runoff.density, 0, 0, runoff.density, 0, 0);
  context.clearRect(0, 0, runoff.width, runoff.height);
  context.lineCap = 'round';
  context.lineJoin = 'round';

  for (const stream of runoff.streams) {
    if (stream.done) continue;

    const art = runoff.arts[stream.art];
    const wet = wets[stream.art];

    if (!art || !wet) continue;

    const shift = shifts[stream.art] ?? 0;
    const top = stream.top + shift;

    if (stream.surfacedAt === null) {
      if (top > art.cut - 1) continue;

      stream.surfacedAt = elapsed;
      stream.life = Math.max(240, Math.min(stream.life, dryBy - elapsed));
      stream.nextDrip = elapsed + DRIP_EVERY * noise(stream.seed + 4);
      stream.nextSplash = elapsed + SPLASH_EVERY * noise(stream.seed + 5);
    }

    const time = elapsed - stream.surfacedAt;
    const age = time / stream.life;
    const foot = Math.min(stream.foot + shift, art.cut);
    const reachesWater = stream.foot + shift >= art.cut - 0.5;

    if (age >= 1) {
      stream.done = true;
      splashes.push({ x: stream.x, y: art.cut, size: stream.width * 3 });
      continue;
    }

    // The last of the water lets go of the top and slides down, faster as it falls.
    const letGo = Math.max(0, (age - 0.45) / 0.55) ** 2;
    const upper = top + letGo * (foot - top);
    const gush = 1 + 0.9 * Math.exp(-time / 160);
    const fill = Math.max(0.3, 1 - 0.85 * age ** 0.6);

    if (foot - upper > 0.5) {
      addFlow(wet, stream, { origin: top, upper, lower: foot }, stream.width * gush * (1 - 0.3 * age), fill, FLOW * stroke * time, stroke);
    }

    if (reachesWater && elapsed >= stream.nextSplash) {
      stream.nextSplash = elapsed + SPLASH_EVERY * (0.7 + 0.6 * noise(stream.seed + elapsed));
      splashes.push({ x: stream.x, y: art.cut, size: stream.width * 2 });
    }

    if (!reachesWater && elapsed >= stream.nextDrip) {
      stream.nextDrip = elapsed + DRIP_EVERY * (0.7 + 0.6 * noise(stream.seed + elapsed));
      runoff.drops.push({ art: stream.art, x: stream.x, y: foot, born: elapsed, size: stream.width * 0.7 });
    }
  }

  const falling: Drop[] = [];

  for (const drop of runoff.drops) {
    const time = elapsed - drop.born;
    const y = drop.y + 0.5 * GRAVITY * stroke * time * time;
    const cut = runoff.arts[drop.art]?.cut ?? y;
    const wet = wets[drop.art];

    if (y >= cut || !wet) {
      splashes.push({ x: drop.x, y: cut, size: drop.size * 2.5 });
      continue;
    }

    addDrop(wet, drop.x, y, drop.size, stroke);
    falling.push(drop);
  }

  runoff.drops = falling;

  for (const [index, art] of runoff.arts.entries()) {
    const wet = wets[index];
    const sheet = runoff.sheets[index];
    const shift = shifts[index] ?? 0;

    if (!wet || sheet === undefined) continue;

    if (sheet && elapsed < dryBy) addFilm(wet, art, sheet, shift, elapsed, stroke);

    paintWet(runoff, art, sheet, wet);
  }

  // Letters stand apart, so only a solid object pushes up a mound of water across its whole foot.
  for (const [index, art] of runoff.arts.entries()) {
    if (!art.solid) continue;

    const mound: Wet = { edges: new Map(), cores: new Map(), film: new Path2D(), front: new Path2D(), drops: new Path2D(), dropCores: new Path2D() };

    addMound(mound, art, shifts[index] ?? 0, elapsed, stroke);
    context.save();
    context.beginPath();
    context.rect(0, 0, runoff.width, art.cut);
    context.clip();
    strokeAll(context, mound.edges, EDGE);
    strokeAll(context, mound.cores, CORE);
    context.restore();
  }

  return splashes;
}

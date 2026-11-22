import { waterBreeze } from '../../motion/water/breeze';
import { KEEL, swellHeight, type Pose } from './swell';

const INK = 'rgb(46 66 88 / 66%)';
const GLINT = 'rgb(246 244 238 / 88%)';
const WAKE_LIFE = 2300;
const SLICK_LIFE = 1100;
const KELVIN = Math.tan(19.47 * Math.PI / 180);
const NEAR_SPREAD = 0.34;
const FAR_SPREAD = 0.2;
const TRANSVERSE = 0.45;
const EMIT_STEP = 0.05;
const DRAFT = 0.045;
const REFLECTION_DEPTH = 0.74;

interface Wavelet {
  x: number;
  born: number;
  fromBow: boolean;
  seed: number;
}

export interface Ring {
  x: number;
  y: number;
  born: number;
  life: number;
  /** How far the ring travels outward, in CSS pixels. */
  reach: number;
  /** Half width at birth, for a ring that starts around something already in the water. */
  base: number;
}

export interface River {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  density: number;
  horizon: number;
  waterline: number;
  scale: number;
  stroke: number;
  boatWidth: number;
  boatHeight: number;
  draft: number;
  speed: number;
  hull: HTMLImageElement;
  reflection: HTMLCanvasElement;
  /** Scratch room where the reflection is torn by the breeze before it is tilted with the hull. */
  torn: HTMLCanvasElement;
  ruins: HTMLCanvasElement;
  ruinsLeft: number;
  ruinsWidth: number;
  wavelets: Wavelet[];
  rings: Ring[];
  emittedTo: number;
}

export interface RiverFrame {
  elapsed: number;
  boat: Pose | null;
  /** How far below its resting place the ruins' reflection still lies; null before it surfaces. */
  ruinsDepth: number | null;
  /** Strength of the breeze across the ruins' reflection, from calm (0) upward. */
  stir: number;
}

interface Strokes {
  ink: Map<number, Path2D>;
  glint: Map<number, Path2D>;
}

function noise(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;

  return value - Math.floor(value);
}

function ease(amount: number): number {
  return 1 - (1 - amount) ** 2;
}

/**
 * The hull upside down from its waterline to the masthead, squeezed by the river's depth and fading as it goes down.
 * It is drawn once at the canvas's own pixel size, so each frame only copies bands of it.
 */
function bakeReflection(hull: HTMLImageElement, boatWidth: number, boatHeight: number, density: number): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const aboveWater = 1 - DRAFT * boatWidth / boatHeight;
  const width = Math.ceil(boatWidth * density);
  const height = Math.ceil(boatHeight * aboveWater * REFLECTION_DEPTH * density);

  if (!context || width <= 0 || height <= 0) return null;

  canvas.width = width;
  canvas.height = height;
  context.translate(0, height);
  context.scale(1, -1);
  context.imageSmoothingQuality = 'high';
  context.drawImage(hull, 0, 0, hull.naturalWidth, aboveWater * hull.naturalHeight, 0, 0, width, height);
  context.setTransform(1, 0, 0, 1, 0, 0);

  const mirror = context.getImageData(0, 0, width, height);
  const pixels = mirror.data;

  // Keep the drawn ink in the reflection. The sail's paper takes the colour of the river.
  for (let index = 0; index < pixels.length; index += 4) {
    const ink = Math.max(0, (231 - (pixels[index] ?? 231)) / 203);

    pixels[index] = 54;
    pixels[index + 1] = 74;
    pixels[index + 2] = 96;
    pixels[index + 3] = (pixels[index + 3] ?? 0) * ink;
  }

  context.putImageData(mirror, 0, 0);

  const fade = context.createLinearGradient(0, 0, 0, height);

  for (let stop = 0; stop <= 16; stop += 1) fade.addColorStop(stop / 16, `rgb(0 0 0 / ${0.5 * (1 - stop / 16) ** 1.6})`);

  context.globalCompositeOperation = 'destination-in';
  context.fillStyle = fade;
  context.fillRect(0, 0, width, height);

  return canvas;
}

/** The ruins' reflection at the river canvas's own pixel size, spanning the whole depth of the water. */
function scaleRuins(ruins: HTMLImageElement, width: number, height: number, density: number): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = Math.round(width * density);
  canvas.height = Math.round(height * density);

  if (!context || canvas.width <= 0 || canvas.height <= 0) return null;

  context.imageSmoothingQuality = 'high';
  context.drawImage(ruins, 0, 0, canvas.width, canvas.height);

  return canvas;
}

interface RiverLayout {
  horizon: number;
  waterline: number;
  scale: number;
  boatWidth: number;
  speed: number;
  ruinsLeft: number;
  ruinsWidth: number;
}

export function prepareRiver(
  canvas: HTMLCanvasElement,
  hull: HTMLImageElement,
  ruins: HTMLImageElement,
  layout: RiverLayout,
): River | null {
  const context = canvas.getContext('2d');
  const bounds = canvas.getBoundingClientRect();
  const density = Math.min(devicePixelRatio, 2);
  const boatHeight = layout.boatWidth * hull.naturalHeight / hull.naturalWidth;
  const reflection = bakeReflection(hull, layout.boatWidth, boatHeight, density);
  const ruinsCopy = scaleRuins(ruins, layout.ruinsWidth, bounds.height - layout.horizon, density);
  const torn = document.createElement('canvas');

  if (!context || !reflection || !ruinsCopy) return null;

  canvas.width = Math.ceil(bounds.width * density);
  canvas.height = Math.ceil(bounds.height * density);
  // Room on both sides for the breeze's widest shift.
  torn.width = reflection.width + 2 * (Math.ceil(1.4 * 3 * layout.scale * density) + 1);
  torn.height = reflection.height;

  return {
    ...layout,
    context,
    width: bounds.width,
    height: bounds.height,
    density,
    stroke: Math.min(1.5, Math.max(0.75, layout.scale)),
    boatHeight,
    draft: layout.boatWidth * DRAFT,
    hull,
    reflection,
    torn,
    ruins: ruinsCopy,
    wavelets: [],
    rings: [],
    emittedTo: Number.NEGATIVE_INFINITY,
  };
}

/** Leave wavelets where the bow and stern have passed, at an even spacing along the water. */
export function stirWake(river: River, pose: Pose, elapsed: number): void {
  const step = river.boatWidth * EMIT_STEP;
  const stern = pose.x + KEEL.stern * river.boatWidth;
  const bow = pose.x + KEEL.bow * river.boatWidth;

  if (river.emittedTo === Number.NEGATIVE_INFINITY) river.emittedTo = stern - step;

  while (river.emittedTo + step <= stern) {
    river.emittedTo += step;

    const seed = river.wavelets.length + 1;

    river.wavelets.push(
      { x: river.emittedTo, born: elapsed, fromBow: false, seed },
      { x: river.emittedTo + bow - stern, born: elapsed, fromBow: true, seed: seed + 0.5 },
    );
  }
}

function addDash(
  strokes: Strokes,
  river: River,
  dash: { x: number; y: number; length: number; slant: number; weight: number; pieces: number; seed: number },
): void {
  const { x, y, length, slant, weight, pieces, seed } = dash;
  const width = Math.round(weight * river.stroke * 4) / 4;

  if (width < 0.25 || length < 0.5) return;

  const gap = pieces > 1 ? 0.28 : 0;
  const piece = length / pieces;
  const lift = 0.75 * river.stroke;
  const inkPath = strokes.ink.get(width) ?? new Path2D();
  const glintPath = strokes.glint.get(width) ?? new Path2D();

  for (let index = 0; index < pieces; index += 1) {
    const jitter = (noise(seed + index * 7.1) - 0.5) * piece * 0.35;
    const left = x - length / 2 + index * piece + jitter;
    const right = left + piece * (1 - gap);
    const rise = noise(seed + index * 3.3) - 0.5;

    glintPath.moveTo(left, y - lift + rise);
    glintPath.lineTo(right, y - lift + rise + slant * (right - left));
    inkPath.moveTo(left + 0.1 * piece, y + lift + rise);
    inkPath.lineTo(right + 0.1 * piece, y + lift + rise + slant * (right - left));
  }

  strokes.ink.set(width, inkPath);
  strokes.glint.set(width, glintPath);
}

function flush(context: CanvasRenderingContext2D, strokes: Strokes): void {
  context.lineCap = 'round';

  for (const [width, path] of strokes.glint) {
    context.strokeStyle = GLINT;
    context.lineWidth = width * 0.8;
    context.stroke(path);
  }

  for (const [width, path] of strokes.ink) {
    context.strokeStyle = INK;
    context.lineWidth = width;
    context.stroke(path);
  }

  strokes.ink.clear();
  strokes.glint.clear();
}

/** The two arms of the wake, spreading at the Kelvin angle, with the transverse crests between them. */
function addWake(river: River, elapsed: number, near: Strokes, far: Strokes): void {
  const { boatWidth: width } = river;
  let expired = 0;

  for (const wavelet of river.wavelets) {
    const age = (elapsed - wavelet.born) / WAKE_LIFE;

    if (age >= 1) {
      expired += 1;
      continue;
    }

    const behind = river.speed * (elapsed - wavelet.born);
    const spread = KELVIN * behind;
    const crest = 0.62 + 0.38 * Math.cos(2 * Math.PI * behind / (TRANSVERSE * width));
    const swell = swellHeight(wavelet.x, elapsed, width);
    const weight = (wavelet.fromBow ? 1.6 : 1.2) * (1 - age) ** 0.85 * crest;
    const length = width * (0.035 + 0.085 * ease(age)) * (0.7 + 0.5 * crest);
    const pieces = 1 + Math.floor(age * 3.4 + noise(wavelet.seed) * 0.8);

    addDash(near, river, {
      x: wavelet.x - 0.2 * length,
      y: river.waterline - swell + spread * NEAR_SPREAD,
      length,
      slant: 0.1,
      weight,
      pieces,
      seed: wavelet.seed,
    });
    // Each arm is a band of short crests set en échelon, not a single line.
    addDash(near, river, {
      x: wavelet.x - 0.45 * length,
      y: river.waterline - swell + spread * NEAR_SPREAD * 0.62 + river.stroke,
      length: length * 0.6,
      slant: 0.06,
      weight: weight * 0.55,
      pieces,
      seed: wavelet.seed + 31,
    });
    addDash(far, river, {
      x: wavelet.x - 0.2 * length,
      y: river.waterline - swell - spread * FAR_SPREAD,
      length: length * 0.8,
      slant: -0.07,
      weight: weight * 0.8,
      pieces,
      seed: wavelet.seed + 11,
    });

    // The stern leaves a smooth, short-lived slick along its own track.
    const slick = (elapsed - wavelet.born) / SLICK_LIFE;

    if (!wavelet.fromBow && slick < 1 && noise(wavelet.seed + 5) > 0.35) {
      addDash(near, river, {
        x: wavelet.x - width * 0.05,
        y: river.waterline - swell + 2 * river.stroke + spread * 0.08,
        length: width * (0.05 + 0.05 * slick),
        slant: 0,
        weight: 0.8 * (1 - slick),
        pieces: 1 + Math.floor(slick * 3),
        seed: wavelet.seed + 23,
      });
    }
  }

  // Wavelets are born in order, so the oldest are always at the front.
  if (expired > 0) river.wavelets.splice(0, expired);
}

function addRings(river: River, elapsed: number, strokes: Strokes): void {
  const { context, horizon } = river;
  let expired = 0;

  context.save();
  context.beginPath();
  context.rect(0, horizon, river.width, river.height - horizon);
  context.clip();

  for (const ring of river.rings) {
    const age = (elapsed - ring.born) / ring.life;

    if (age >= 1) {
      expired += 1;
      continue;
    }

    if (age < 0) continue;

    const travel = ring.reach * ease(age);
    const radiusX = ring.base + travel;
    const radiusY = 0.22 * travel + 0.05 * ring.base;
    const weight = (1 - age) ** 0.9 * Math.min(1, 0.6 + ring.reach / (60 * river.stroke));
    const dashes = Math.max(6, Math.round(radiusX / (6 * river.stroke)));

    // Draw the ring as short level strokes, the way the engraving draws water.
    for (let index = 0; index < dashes; index += 1) {
      const angle = Math.PI * 2 * (index + 0.5 * noise(ring.born + index)) / dashes;
      const x = ring.x + radiusX * Math.cos(angle);
      const y = ring.y + radiusY * Math.sin(angle);

      if (y < horizon) continue;

      addDash(strokes, river, {
        x,
        y,
        length: Math.max(2, 2 * Math.PI * radiusX / dashes * (0.75 - 0.3 * age) * Math.abs(Math.sin(angle)) + 1.5),
        slant: -0.22 * Math.cos(angle) * Math.sign(Math.sin(angle)),
        weight,
        pieces: age > 0.55 && index % 2 === 0 ? 2 : 1,
        seed: ring.born + index,
      });
    }
  }

  flush(context, strokes);
  context.restore();

  if (expired > 0) {
    river.rings = river.rings.filter((ring) => (elapsed - ring.born) / ring.life < 1);
  }
}

function surfaceAt(river: River, x: number, elapsed: number): number {
  return river.waterline - swellHeight(x, elapsed, river.boatWidth);
}

function drawHull(river: River, pose: Pose, elapsed: number): void {
  const { context, boatWidth: width, boatHeight: height, draft } = river;
  const pivot = (KEEL.stern + KEEL.bow) / 2;
  const left = pose.x - 0.12 * width;
  const right = pose.x + 1.12 * width;

  context.save();
  context.beginPath();
  context.moveTo(left, 0);
  context.lineTo(right, 0);

  for (let x = right; x >= left; x -= 3) context.lineTo(x, surfaceAt(river, x, elapsed));

  context.lineTo(left, surfaceAt(river, left, elapsed));
  context.closePath();
  context.clip();
  context.translate(pose.x + pivot * width, river.waterline - pose.heave);
  context.rotate(-pose.pitch);
  context.drawImage(river.hull, -pivot * width, draft - height, width, height);
  context.restore();
}

/**
 * Tear the reflection flat, where each band is a plain copy, then tilt the whole of it with the hull in one draw.
 * Tilting every band on its own costs a filtered draw per band.
 */
function drawBoatReflection(river: River, pose: Pose, elapsed: number): void {
  const { context, reflection, torn, density, boatWidth } = river;
  const tearing = torn.getContext('2d');

  if (!tearing) return;

  const pivot = (KEEL.stern + KEEL.bow) / 2;
  const rows = reflection.height;
  const margin = (torn.width - reflection.width) / 2;
  const breeze = waterBreeze(river.scale, elapsed + 1500);
  // The breeze tears the reflection in bands two pixels deep.
  const band = Math.max(1, Math.round(2 * density));
  let start = 0;
  let previous = Number.NaN;

  tearing.clearRect(0, 0, torn.width, torn.height);

  // Copy each run of bands that share a shift at once.
  for (let row = 0; row <= rows; row += 1) {
    const y = Math.floor(row / band) * band / density;
    const shift = 1.4 * breeze(y + river.waterline - river.horizon, 0.3 + y * density / rows);
    const offset = row < rows ? Math.round(shift * density) : Number.NaN;

    if (offset === previous) continue;

    if (row > start) tearing.drawImage(reflection, 0, start, reflection.width, row - start, margin + previous, start, reflection.width, row - start);

    start = row;
    previous = offset;
  }

  context.save();
  context.translate(pose.x + pivot * boatWidth, river.waterline - pose.heave);
  context.rotate(pose.pitch);
  context.drawImage(torn, -margin / density - pivot * boatWidth, 0, torn.width / density, torn.height / density);
  context.restore();
}

/** A white lip where the hull parts the water, larger as the bow comes down into a crest. */
function addWaterline(river: River, pose: Pose, elapsed: number, strokes: Strokes): void {
  const { boatWidth: width } = river;
  const stern = pose.x + KEEL.stern * width;
  const bow = pose.x + KEEL.bow * width;
  const step = width * 0.06;

  // The surface line runs on past both ends of the hull, so the swell the boat rides can be seen.
  for (let x = stern - 0.3 * width; x < bow + 0.28 * width; x += step) {
    const middle = x + step / 2;
    const outside = Math.max(stern - middle, middle - bow, 0) / (0.3 * width);
    const slope = (surfaceAt(river, middle + 1, elapsed) - surfaceAt(river, middle - 1, elapsed)) / 2;

    addDash(strokes, river, {
      x: middle,
      y: surfaceAt(river, middle, elapsed) + 0.6 * river.stroke,
      length: step * (0.9 - 0.35 * outside),
      slant: slope,
      weight: 0.85 * (1 - outside) ** 0.8,
      pieces: outside > 0.4 ? 2 : 1,
      seed: Math.floor(x / step),
    });
  }

  const dip = Math.max(0, -pose.pitch) * 12;
  const splash = 0.45 + Math.min(1, dip);
  const bowY = surfaceAt(river, bow, elapsed);

  for (let index = 0; index < 3; index += 1) {
    addDash(strokes, river, {
      x: bow + width * (0.035 + 0.02 * index) * splash,
      y: bowY + (index - 0.6) * 2.2 * river.stroke,
      length: width * (0.09 - 0.022 * index) * splash,
      slant: 0.16 * (index - 1),
      weight: 1.15 - 0.2 * index,
      pieces: 1,
      seed: index + 40,
    });
  }
}

function drawRuins(river: River, frame: RiverFrame): void {
  const { context, ruins, density, horizon } = river;

  if (frame.ruinsDepth === null) return;

  // Whole device pixels keep every copy one to one with the scaled reflection.
  const sinking = Math.round(frame.ruinsDepth * density) / density;
  const rows = ruins.height;
  const waterHeight = rows / density;
  const breeze = waterBreeze(river.scale, frame.elapsed + 1500);
  let start = 0;
  let previous = Number.NaN;

  // Tear the reflection row by row, as the hero's river does, then draw each run of equal rows at once.
  for (let row = 0; row <= rows; row += 1) {
    const y = row / density;
    const offset = row < rows ? Math.round(frame.stir * breeze(y, y / waterHeight) * density) / density : Number.NaN;

    if (offset === previous) continue;

    // Rows above the reflection's top edge or past its foot show the bare river.
    const top = Math.max(start / density, -sinking);
    const bottom = Math.min(row / density, waterHeight - sinking);

    if (bottom > top) {
      context.drawImage(
        ruins,
        0,
        (top + sinking) * density,
        ruins.width,
        (bottom - top) * density,
        river.ruinsLeft + previous,
        horizon + top,
        ruins.width / density,
        bottom - top,
      );
    }

    start = row;
    previous = offset;
  }
}

export function paintRiver(river: River, frame: RiverFrame): void {
  const { context } = river;
  const near: Strokes = { ink: new Map(), glint: new Map() };
  const far: Strokes = { ink: new Map(), glint: new Map() };

  context.setTransform(river.density, 0, 0, river.density, 0, 0);
  context.clearRect(0, 0, river.width, river.height);
  drawRuins(river, frame);

  if (frame.boat) drawBoatReflection(river, frame.boat, frame.elapsed);

  addRings(river, frame.elapsed, near);
  addWake(river, frame.elapsed, near, far);
  flush(context, far);

  if (frame.boat) {
    drawHull(river, frame.boat, frame.elapsed);
    addWaterline(river, frame.boat, frame.elapsed, near);
  }

  flush(context, near);
}

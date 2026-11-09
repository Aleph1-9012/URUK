import type { Swing } from '../../plate/player';

// The standard map on the torus, the 146 page's Plate I: f(x, y) = (x + y + k sin 2πx, y + k sin 2πx), both mod 1.
// Orbits are sorted by a finite-time stretch rate, as in the Round 61 drawing: orderly ones are drawn long, so their
// curves close up; chaotic ones are drawn short, so they read as dust.
const TAU = 2 * Math.PI;

export const K_MIN = 0;

export const K_MAX = 1;

export const K_START = 0.2;

// The film turns k up from 0 to 1 and back, resting at each end.
export const FILM: Swing = { low: K_MIN, high: K_MAX, travel: 16000, hold: 2000 };

export type Quality = {
  starts: number;
  classifySteps: number;
  // Only every so-many orderly orbits is drawn, or their curves would fill the plate.
  orderlyEvery: number;
  orderlySteps: number;
  chaoticSteps: number;
};

export const fullQuality: Quality = { starts: 2600, classifySteps: 800, orderlyEvery: 9, orderlySteps: 1800, chaoticSteps: 28 };

// While the slider moves: a fifth of the work, enough to follow the change.
export const draftQuality: Quality = { starts: 1300, classifySteps: 200, orderlyEvery: 6, orderlySteps: 700, chaoticSteps: 16 };

// Matches --ink in tokens.css.
const INK = [0x1c, 0x1a, 0x17] as const;

// A fixed seed, so the same k always draws the same picture.
function random(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function wrap(value: number): number {
  return value - Math.floor(value);
}

export function step(x: number, y: number, k: number): [number, number] {
  const speed = wrap(y + k * Math.sin(TAU * x));

  return [wrap(x + speed), speed];
}

// The growth of a tangent vector, per step: near zero on an orderly curve, where it grows only linearly.
export function stretchRate(x: number, y: number, k: number, steps: number): number {
  let px = x;
  let py = y;
  let u = 1;
  let v = 0;
  let growth = 0;
  let product = 1;

  for (let index = 0; index < steps; index += 1) {
    const v2 = v + TAU * k * Math.cos(TAU * px) * u;
    const u2 = u + v2;
    const length = Math.hypot(u2, v2);
    product *= length;
    u = u2 / length;
    v = v2 / length;

    // One logarithm per sixteen steps; sixteen stretches of at most 1 + 2πk stay far from overflow.
    if ((index & 15) === 15) {
      growth += Math.log(product);
      product = 1;
    }

    // The map, written out: this loop runs millions of times per picture.
    py = wrap(py + k * Math.sin(TAU * px));
    px = wrap(px + py);
  }

  return (growth + Math.log(product)) / steps;
}

// Linear growth over n steps gives a rate of about log(n) / n, so the cut-off scales with it.
export function orderlyLimit(steps: number): number {
  return (1.45 * Math.log(steps)) / steps;
}

export type Canvas = { width: number; height: number; dot: number };

// Ink pixels for one picture, ready for putImageData. The y axis is moved by half a turn, so the main island is centred.
export function drawOrbits(k: number, canvas: Canvas, quality: Quality): Uint8ClampedArray<ArrayBuffer> {
  const { width, height, dot } = canvas;
  const pixels = new Uint8ClampedArray(width * height * 4);
  const next = random(146);
  const limit = orderlyLimit(quality.classifySteps);
  let orderly = 0;

  const mark = (x: number, y: number) => {
    const column = Math.min(width - dot, Math.floor(x * (width - dot + 1)));
    const row = Math.min(height - dot, Math.floor(wrap(y + 0.5) * (height - dot + 1)));

    for (let dy = 0; dy < dot; dy += 1) {
      for (let dx = 0; dx < dot; dx += 1) {
        const offset = ((row + dy) * width + column + dx) * 4;
        pixels[offset] = INK[0];
        pixels[offset + 1] = INK[1];
        pixels[offset + 2] = INK[2];
        pixels[offset + 3] = 255;
      }
    }
  };

  for (let index = 0; index < quality.starts; index += 1) {
    let x = next();
    let y = next();
    const isOrderly = stretchRate(x, y, k, quality.classifySteps) < limit;

    if (isOrderly) {
      orderly += 1;

      if ((orderly - 1) % quality.orderlyEvery !== 0) {
        continue;
      }
    }

    const steps = isOrderly ? quality.orderlySteps : quality.chaoticSteps;

    for (let count = 0; count < steps; count += 1) {
      y = wrap(y + k * Math.sin(TAU * x));
      x = wrap(x + y);
      mark(x, y);
    }
  }

  return pixels;
}

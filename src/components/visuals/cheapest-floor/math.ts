// The seed-91 relaxation, rounded comparison table and quadrature data are from 090-checks/lattice.json.
import data from './data.json';

export type Point = { x: number; y: number };

export type Torus = { w: number; h: number };

export type LatticeKind = 'triangular' | 'square' | 'honeycomb';

export type Shell = { norm: number; count: number; radius: number; value: number };

export type MixtureTerm = { alpha: number; weight: number };

export type Pair = { a: number; b: number; dx: number; dy: number; distance: number; weight: number };

export const TRIANGULAR_SPACING = Math.sqrt(2 / Math.sqrt(3));

export const HONEYCOMB_SPACING = Math.sqrt(4 / Math.sqrt(3));

export function gaussian(radius: number, alpha = 1): number {
  return Math.exp(-Math.PI * alpha * radius ** 2);
}

export function latticePoints(kind: LatticeKind, reach = 12): Point[] {
  if (!Number.isInteger(reach) || reach < 1) throw new RangeError('The lattice patch radius must be a positive integer.');

  const points: Point[] = [];

  for (let m = -reach; m <= reach; m++) {
    for (let n = -reach; n <= reach; n++) {
      if (kind === 'square') {
        points.push({ x: m, y: n });

        continue;
      }

      const spacing = kind === 'triangular' ? TRIANGULAR_SPACING : HONEYCOMB_SPACING;
      const point = { x: spacing * (m + n / 2), y: spacing * Math.sqrt(3) * n / 2 };
      points.push(point);

      if (kind === 'honeycomb') points.push({ x: point.x + spacing / 2, y: point.y + spacing / (2 * Math.sqrt(3)) });
    }
  }

  return points;
}

export function latticeEnergy(kind: LatticeKind, alpha = 1, reach = 12): number {
  if (!(alpha > 0)) throw new RangeError('A Gaussian width must be positive.');

  let energy = 0;

  for (const point of latticePoints(kind, reach)) {
    const radiusSquared = point.x ** 2 + point.y ** 2;

    if (radiusSquared > 1e-12) energy += Math.exp(-Math.PI * alpha * radiusSquared);
  }

  return energy;
}

export function triangularShells(maxNorm = 21): Shell[] {
  if (!Number.isInteger(maxNorm) || maxNorm < 1) throw new RangeError('Lattice shells need a positive maximum norm.');

  const norms = new Map<number, number>();
  const reach = Math.ceil(Math.sqrt(maxNorm * 4 / 3));

  for (let m = -reach; m <= reach; m++) {
    for (let n = -reach; n <= reach; n++) {
      const norm = m * m + m * n + n * n;

      if (norm > 0 && norm <= maxNorm) norms.set(norm, (norms.get(norm) ?? 0) + 1);
    }
  }

  return Array.from(norms, ([norm, count]) => {
    const radius = TRIANGULAR_SPACING * Math.sqrt(norm);

    return { norm, count, radius, value: gaussian(radius) };
  }).sort((a, b) => a.norm - b.norm);
}

export function torusDelta(value: number, period: number): number {
  return value - period * Math.round(value / period);
}

export function torusEnergy(points: readonly Point[], torus: Torus, alpha = 1): number {
  if (points.length < 1 || !(torus.w > 0 && torus.h > 0 && alpha > 0)) throw new RangeError('Torus energy needs points, positive periods and a Gaussian width.');

  let sum = 0;

  for (let first = 0; first < points.length; first++) {
    const a = points[first];

    if (!a) throw new Error('The indexed torus point exists.');

    for (let second = first + 1; second < points.length; second++) {
      const b = points[second];

      if (!b) throw new Error('The indexed torus point exists.');

      const dx = torusDelta(b.x - a.x, torus.w);
      const dy = torusDelta(b.y - a.y, torus.h);
      sum += Math.exp(-Math.PI * alpha * (dx ** 2 + dy ** 2));
    }
  }

  return 2 * sum / points.length;
}

export function nearPairs(points: readonly Point[], torus: Torus, cutoff = 1.6): Pair[] {
  const pairs: Pair[] = [];

  for (let first = 0; first < points.length; first++) {
    const a = points[first];

    if (!a) throw new Error('The indexed torus point exists.');

    for (let second = first + 1; second < points.length; second++) {
      const b = points[second];

      if (!b) throw new Error('The indexed torus point exists.');

      const dx = torusDelta(b.x - a.x, torus.w);
      const dy = torusDelta(b.y - a.y, torus.h);
      const distance = Math.hypot(dx, dy);

      if (distance < cutoff) pairs.push({ a: first, b: second, dx, dy, distance, weight: gaussian(distance) });
    }
  }

  return pairs;
}

export function interpolateWrapped(a: Point, b: Point, amount: number, torus: Torus): Point {
  const x = a.x + amount * torusDelta(b.x - a.x, torus.w);
  const y = a.y + amount * torusDelta(b.y - a.y, torus.h);

  return { x: (x % torus.w + torus.w) % torus.w, y: (y % torus.h + torus.h) % torus.h };
}

export function mixtureValue(t: number, terms: readonly MixtureTerm[], count = terms.length): number {
  let sum = 0;

  for (let index = 0; index < Math.min(count, terms.length); index++) {
    const term = terms[index];

    if (!term) throw new Error('The indexed quadrature term exists.');

    sum += term.weight * Math.exp(-Math.PI * term.alpha * t);
  }

  return sum;
}

function pointFromTuple(tuple: readonly number[]): Point {
  const [x, y] = tuple;

  if (x === undefined || y === undefined) throw new Error('Each stored point has two coordinates.');

  return { x, y };
}

function exactReferencePoints(torus: Torus, stored: readonly Point[]): Point[] {
  const columns = 10;
  const rows = 12;
  const rowHeight = TRIANGULAR_SPACING * Math.sqrt(3) / 2;

  if (Math.abs(torus.w - columns * TRIANGULAR_SPACING) > 1e-9 || Math.abs(torus.h - rows * rowHeight) > 1e-9) {
    throw new Error('The reference lattice needs the canonical 10 by 12 torus.');
  }

  const reference: Point[] = [];

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const point = { x: (column + .5 * (row % 2)) * TRIANGULAR_SPACING, y: row * rowHeight };
      const rounded = stored[reference.length];

      if (!rounded || Math.hypot(point.x - rounded.x, point.y - rounded.y) > 1e-5) {
        throw new Error('The exact lattice must agree with the stored rounded reference.');
      }

      reference.push(point);
    }
  }

  if (reference.length !== stored.length) throw new Error('The stored reference contains exactly 120 lattice points.');

  return reference;
}

export function createFloorModel() {
  const [w, h] = data.relax.torus;

  if (w === undefined || h === undefined) throw new Error('The stored torus has two periods.');

  const torus = { w, h };
  const frames = data.relax.frames.map(frame => frame.map(pointFromTuple));
  const perfect = data.relax.perfect.map(pointFromTuple);
  const reference = exactReferencePoints(torus, perfect);
  const first = frames[0];
  const last = frames.at(-1);

  if (!first || !last) throw new Error('The relaxation includes its first and last frames.');

  const mixture = data.mixture.alphas.map((alpha, index) => {
    const weight = data.mixture.weights[index];

    if (weight === undefined) throw new Error('Every Gaussian quadrature term has a weight.');

    return { alpha, weight };
  });

  return {
    torus, frames, frameSteps: data.relax.frame_steps, steps: data.relax.steps,
    energies: data.relax.energy_every_10_steps.map((energy, index) => ({ step: index * 10, energy })),
    byAlpha: data.byAlpha, mixture, perfect, reference,
    shells: triangularShells(), floor: latticeEnergy('triangular'),
    initialEnergy: torusEnergy(first, torus), finalEnergy: torusEnergy(last, torus),
    packingDensity: Math.PI / (2 * Math.sqrt(3)),
  };
}

export type FloorModel = ReturnType<typeof createFloorModel>;

export function relaxAtStep(model: FloorModel, step: number): Point[] {
  const clock = Math.max(0, Math.min(model.steps, step));
  let index = 0;

  for (let candidate = 1; candidate < model.frameSteps.length; candidate++) {
    const at = model.frameSteps[candidate];

    if (at === undefined) throw new Error('Every relaxation frame has an exact step.');
    if (at > clock) break;

    index = candidate;
  }

  index = Math.min(model.frames.length - 2, index);
  const start = model.frameSteps[index];
  const end = model.frameSteps[index + 1];

  if (start === undefined || end === undefined || end <= start) throw new Error('Stored relaxation steps are strictly increasing.');

  const amount = (clock - start) / (end - start);
  const from = model.frames[index];
  const until = model.frames[index + 1];

  if (!from || !until) throw new Error('A relaxation interpolation has two surrounding frames.');

  return from.map((point, i) => {
    const next = until[i];

    if (!next) throw new Error('Point identities persist through every stored frame.');

    return interpolateWrapped(point, next, amount, model.torus);
  });
}

import { modeGradient, modeValue, type Contour, type Mode, type ModeReference, type Point } from './math';

export type GrainTracks = {
  count: number;
  frames: number;
  /** Initial frame plus the bounded descent frames. The remaining frames perform the numerical snap. */
  descentFrames: number;
  ids: Uint16Array;
  times: Float32Array;
  /** Frame-major xy pairs: (frame * count + grain) * 2. */
  positions: Float32Array;
  before: Float32Array;
  after: Float32Array;
  maxSnapDistance: number;
};

export type Projection = { point: Point; segment: number; t: number; distance: number };

export type ModeNumerics = { contour: Contour; tracks: GrainTracks; reference: ModeReference };

export type SilentWorkerMessage =
  | { kind: 'mode'; index: number; modeIndex: number; contour: Contour; tracks: GrainTracks; reference: ModeReference }
  | { kind: 'complete' }
  | { kind: 'error'; message: string };

export const GRAIN_COUNT = 2400;

export const PHONE_GRAIN_COUNT = 900;

export const MODE_PASS_INDICES = [0, 1, 2, 3, 4, 5, 3] as const;

export const GRAIN_PASS_STARTS = [0, 7750, 10000, 12250, 14500, 16750, 56500] as const;

export const DESCENT_STEPS = 40;

export const SNAP_STEPS = 8;

export const MAX_DESCENT_STEP = .035;

export const SNAP_ENERGY_TOLERANCE = 2e-6;

function quantizedPoint(x: number, y: number): Point {
  return { x: Math.fround(Math.max(0, Math.min(1, x))), y: Math.fround(Math.max(0, Math.min(1, y))) };
}

function energy(mode: Mode, point: Point): number {
  return modeValue(mode, point.x, point.y) ** 2;
}

/** Accept only a downhill segment, including quarter points used by linear track playback. */
function downhill(mode: Mode, from: Point, dx: number, dy: number): Point | undefined {
  let previous = energy(mode, from);
  let last = from;

  for (let sample = 1; sample <= 4; sample++) {
    const point = quantizedPoint(from.x + dx * sample / 4, from.y + dy * sample / 4);
    const next = energy(mode, point);

    if (next > previous + 2e-14) return;

    previous = next;
    last = point;
  }

  return last;
}

function descend(mode: Mode, point: Point, id: number): Point {
  const value = modeValue(mode, point.x, point.y);

  if (Math.abs(value) < 1e-7) return point;

  const gradient = modeGradient(mode, point.x, point.y);
  const norm = Math.hypot(gradient.x, gradient.y);

  if (norm > 1e-12) {
    const distance = Math.min(MAX_DESCENT_STEP, .65 * Math.abs(value) / norm);
    const direction = -Math.sign(value) / norm;

    for (let backtrack = 0; backtrack < 14; backtrack++) {
      const step = distance * 2 ** -backtrack;
      const next = downhill(mode, point, direction * gradient.x * step, direction * gradient.y * step);

      if (next && energy(mode, next) < value * value) return next;
    }
  }

  // At a nonzero stationary point, a fixed local probe supplies a downhill direction without reseeding the grain.
  if (value * value > 1e-10) {
    for (let direction = 0; direction < 8; direction++) {
      const angle = id * 2.399963229728653 + direction * Math.PI / 4;

      for (let backtrack = 0; backtrack < 10; backtrack++) {
        const step = MAX_DESCENT_STEP / 4 * 2 ** -backtrack;
        const next = downhill(mode, point, Math.cos(angle) * step, Math.sin(angle) * step);

        if (next && energy(mode, next) < value * value) return next;
      }
    }
  }

  return point;
}

function clipInterval(ax: number, ay: number, bx: number, by: number): readonly [number, number] | undefined {
  let first = 0;
  let last = 1;

  for (const [origin, delta] of [[ax, bx - ax], [ay, by - ay]]) {
    if (origin === undefined || delta === undefined) continue;

    if (delta === 0) {
      if (origin < 0 || origin > 1) return;
      continue;
    }

    const low = (0 - origin) / delta;
    const high = (1 - origin) / delta;
    first = Math.max(first, Math.min(low, high));
    last = Math.min(last, Math.max(low, high));

    if (first > last) return;
  }

  return [first, last];
}

/** Exact segment projection, with a spatial lower bound for stopping the expanding bin search. */
export class ContourProjector {
  private readonly buckets: number[][];
  private readonly clipped: Float64Array;
  private readonly parameters: Float64Array;
  private readonly seen: Uint32Array;
  private generation = 0;

  constructor(contour: Contour, private readonly side = 32) {
    const count = contour.segments.length / 4;
    this.buckets = Array.from({ length: side * side }, (): number[] => []);
    this.clipped = new Float64Array(contour.segments.length);
    this.parameters = new Float64Array(count * 2);
    this.seen = new Uint32Array(count);

    for (let segment = 0; segment < count; segment++) {
      const index = segment * 4;
      const ax = contour.segments[index] ?? 0;
      const ay = contour.segments[index + 1] ?? 0;
      const bx = contour.segments[index + 2] ?? 0;
      const by = contour.segments[index + 3] ?? 0;
      const interval = clipInterval(ax, ay, bx, by);

      if (!interval) continue;

      const [first, last] = interval;
      const x0 = ax + (bx - ax) * first;
      const y0 = ay + (by - ay) * first;
      const x1 = ax + (bx - ax) * last;
      const y1 = ay + (by - ay) * last;
      this.clipped.set([x0, y0, x1, y1], index);
      this.parameters.set([first, last], segment * 2);
      const left = Math.max(0, Math.min(side - 1, Math.floor(Math.min(x0, x1) * side)));
      const right = Math.max(0, Math.min(side - 1, Math.floor(Math.max(x0, x1) * side)));
      const bottom = Math.max(0, Math.min(side - 1, Math.floor(Math.min(y0, y1) * side)));
      const top = Math.max(0, Math.min(side - 1, Math.floor(Math.max(y0, y1) * side)));

      for (let x = left; x <= right; x++) {
        for (let y = bottom; y <= top; y++) this.buckets[x * side + y]?.push(segment);
      }
    }
  }

  nearest(point: Point): Projection {
    this.generation++;
    const generation = this.generation;
    const xCell = Math.max(0, Math.min(this.side - 1, Math.floor(point.x * this.side)));
    const yCell = Math.max(0, Math.min(this.side - 1, Math.floor(point.y * this.side)));
    let bestDistance = Infinity;
    let bestPoint = point;
    let bestSegment = -1;
    let bestT = 0;
    const visit = (x: number, y: number): void => {
      if (x < 0 || y < 0 || x >= this.side || y >= this.side) return;

      for (const segment of this.buckets[x * this.side + y] ?? []) {
        if (this.seen[segment] === generation) continue;

        this.seen[segment] = generation;
        const index = segment * 4;
        const ax = this.clipped[index] ?? 0;
        const ay = this.clipped[index + 1] ?? 0;
        const dx = (this.clipped[index + 2] ?? 0) - ax;
        const dy = (this.clipped[index + 3] ?? 0) - ay;
        const norm = dx * dx + dy * dy;
        const t = norm === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - ax) * dx + (point.y - ay) * dy) / norm));
        const projected = { x: ax + dx * t, y: ay + dy * t };
        const distance = (projected.x - point.x) ** 2 + (projected.y - point.y) ** 2;

        if (distance < bestDistance) {
          bestDistance = distance;
          bestPoint = projected;
          bestSegment = segment;
          const first = this.parameters[segment * 2] ?? 0;
          bestT = first + ((this.parameters[segment * 2 + 1] ?? 1) - first) * t;
        }
      }
    };

    for (let ring = 0; ring < this.side; ring++) {
      const left = xCell - ring;
      const right = xCell + ring;
      const bottom = yCell - ring;
      const top = yCell + ring;

      for (let x = left; x <= right; x++) {
        visit(x, bottom);
        if (top !== bottom) visit(x, top);
      }

      for (let y = bottom + 1; y < top; y++) {
        visit(left, y);
        if (right !== left) visit(right, y);
      }

      const clearance = Math.min(
        left > 0 ? point.x - left / this.side : Infinity,
        right < this.side - 1 ? (right + 1) / this.side - point.x : Infinity,
        bottom > 0 ? point.y - bottom / this.side : Infinity,
        top < this.side - 1 ? (top + 1) / this.side - point.y : Infinity,
      );

      if (bestSegment >= 0 && bestDistance <= clearance * clearance) break;
    }

    if (bestSegment < 0) throw new RangeError('The mode needs a contour segment inside the plate.');

    return { point: bestPoint, segment: bestSegment, t: bestT, distance: Math.sqrt(bestDistance) };
  }
}

export function seedGrains(count = GRAIN_COUNT, seed = 350): Float32Array {
  let state = seed >>> 0;
  const positions = new Float32Array(count * 2);

  for (let index = 0; index < positions.length; index++) {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    positions[index] = (state + .5) / 2 ** 32;
  }

  return positions;
}

export function transportGrains(contour: Contour, before: Float32Array, descentSteps = DESCENT_STEPS, snapSteps = SNAP_STEPS): GrainTracks {
  const count = before.length / 2;

  if (!Number.isInteger(count) || count < 1 || count > 65535 || !Number.isInteger(descentSteps) || !Number.isInteger(snapSteps) || descentSteps < 1 || snapSteps < 1) throw new RangeError('Use xy grain pairs and positive integer descent and snap lengths.');

  const frames = descentSteps + snapSteps + 1;
  const positions = new Float32Array(frames * count * 2);
  const ids = Uint16Array.from({ length: count }, (_, id) => id);
  const times = Float32Array.from({ length: frames }, (_, frame) => frame / (frames - 1));
  positions.set(before);
  let current = before.slice();

  for (let frame = 1; frame <= descentSteps; frame++) {
    const next = new Float32Array(count * 2);

    for (let id = 0; id < count; id++) {
      const point = descend(contour.mode, { x: current[id * 2] ?? 0, y: current[id * 2 + 1] ?? 0 }, id);
      next[id * 2] = point.x;
      next[id * 2 + 1] = point.y;
    }

    positions.set(next, frame * count * 2);
    current = next;
  }

  const after = new Float32Array(count * 2);
  const projector = new ContourProjector(contour);
  let maxSnapDistance = 0;

  for (let id = 0; id < count; id++) {
    const projection = projector.nearest({ x: current[id * 2] ?? 0, y: current[id * 2 + 1] ?? 0 });
    const endpoint = quantizedPoint(projection.point.x, projection.point.y);
    after[id * 2] = endpoint.x;
    after[id * 2 + 1] = endpoint.y;
    maxSnapDistance = Math.max(maxSnapDistance, projection.distance);
  }

  for (let frame = 1; frame <= snapSteps; frame++) {
    const amount = frame / snapSteps;
    const offset = (descentSteps + frame) * count * 2;

    for (let index = 0; index < current.length; index++) positions[offset + index] = (current[index] ?? 0) + ((after[index] ?? 0) - (current[index] ?? 0)) * amount;
  }

  return { count, frames, descentFrames: descentSteps + 1, ids, times, positions, before: before.slice(), after, maxSnapDistance };
}

export function grainAt(tracks: GrainTracks, id: number, phase: number): Point {
  const position = Math.max(0, Math.min(1, phase)) * (tracks.frames - 1);
  const frame = Math.floor(position);
  const next = Math.min(tracks.frames - 1, frame + 1);
  const amount = position - frame;
  const first = (frame * tracks.count + id) * 2;
  const second = (next * tracks.count + id) * 2;

  return {
    x: (tracks.positions[first] ?? 0) + ((tracks.positions[second] ?? 0) - (tracks.positions[first] ?? 0)) * amount,
    y: (tracks.positions[first + 1] ?? 0) + ((tracks.positions[second + 1] ?? 0) - (tracks.positions[first + 1] ?? 0)) * amount,
  };
}

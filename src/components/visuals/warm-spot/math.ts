// Full-precision finite-grid inputs come from 369-checks/hotspots.py.
// Heat evolution preserves every cell; no spectral truncation is used.
import data from './data.json';

export type Point = { x: number; y: number };

export type CellIndex = { row: number; col: number };

export type HeatAtlas = { times: Float64Array<ArrayBuffer>; values: Float64Array<ArrayBuffer>; cellCount: number };

export type Computation = { kind: 'pending' } | { kind: 'ready'; atlas: HeatAtlas } | { kind: 'failed'; reason: string };

export type WarmModel = {
  grid: number;
  h: number;
  cells: Point[];
  cellIndices: CellIndex[];
  lookup: Int32Array;
  neighbors: Int32Array;
  degree: Uint8Array;
  boundary: Point[];
  edgeCells: Uint8Array;
  edgeDistance: Float64Array;
  deepIndices: number[];
  u0: Float64Array;
  phi1: Float64Array;
  mu1: number;
  mu2: number;
  gradientRatio: number;
  computation: Computation;
};

export type FieldSample = {
  kind: 'initial' | 'computed';
  tau: number;
  values: Float64Array;
  interpolated: boolean;
  hot: number;
  cold: number;
  spread: number;
  mean: number;
};

export type ContourSegment = { level: number; a: Point; b: Point };

export type Gradient = { index: number; point: Point; x: number; y: number; magnitude: number };

function numberAt(values: ArrayLike<number>, index: number): number {
  const value = values[index];

  if (value === undefined) throw new RangeError('The numerical vector contains its indexed entry.');

  return value;
}

function pointAt(points: readonly Point[], index: number): Point {
  const point = points[index];

  if (!point) throw new RangeError('The grid contains its indexed cell centre.');

  return point;
}

export function plateRadius(angle: number): number {
  return 1 + .28 * Math.cos(2 * angle) + .12 * Math.sin(3 * angle);
}

export function extrema(values: Float64Array): { hot: number; cold: number; min: number; max: number; spread: number; mean: number } {
  if (values.length === 0) throw new RangeError('A temperature vector has at least one cell.');

  let hot = 0;
  let cold = 0;
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;

  for (const [index, value] of values.entries()) {
    if (!Number.isFinite(value)) throw new RangeError('Every computed temperature is finite.');
    if (value > max) {
      max = value;
      hot = index;
    }

    if (value < min) {
      min = value;
      cold = index;
    }

    sum += value;
  }

  return { hot, cold, min, max, spread: max - min, mean: sum / values.length };
}

export function normalizeField(values: Float64Array): Float64Array {
  const { min, spread } = extrema(values);

  if (!(spread > 0)) throw new RangeError('Contour contrast requires a nonconstant temperature vector.');

  return values.map(value => 2 * (value - min) / spread - 1);
}

export function createWarmModel(): WarmModel {
  const grid = data.grid;
  const h = data.h;

  if (Math.abs(h - 3 / (grid - 1)) > 1e-12) throw new Error('The canonical mesh spans the stated three-unit square.');

  const cells = data.cells.map(pair => {
    const [x, y] = pair;

    if (x === undefined || y === undefined) throw new Error('Each canonical grid cell has two coordinates.');

    return { x, y };
  });
  const cellIndices = data.cell_indices.map(pair => {
    const [row, col] = pair;

    if (row === undefined || col === undefined || !Number.isInteger(row) || !Number.isInteger(col) || row < 0 || row >= grid || col < 0 || col >= grid) throw new Error('Canonical cell indices lie in the square grid.');

    return { row, col };
  });

  if (cells.length !== cellIndices.length || data.u0.length !== cells.length || data.phi1.length !== cells.length) throw new Error('All finite-grid inputs have one entry per active cell.');

  const lookup = new Int32Array(grid * grid).fill(-1);

  for (const [index, cell] of cellIndices.entries()) {
    const slot = cell.row * grid + cell.col;

    if (lookup[slot] !== -1) throw new Error('Canonical active cells have distinct grid indices.');

    lookup[slot] = index;
  }

  const neighbors = new Int32Array(cells.length * 4).fill(-1);
  const degree = new Uint8Array(cells.length);
  const edgeCells = new Uint8Array(cells.length);
  const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;

  for (const [index, cell] of cellIndices.entries()) {
    let count = 0;

    for (const [side, [dy, dx]] of steps.entries()) {
      const row = cell.row + dy;
      const col = cell.col + dx;
      const neighbor = row < 0 || row >= grid || col < 0 || col >= grid ? -1 : numberAt(lookup, row * grid + col);
      neighbors[index * 4 + side] = neighbor;

      if (neighbor >= 0) count++;
    }

    degree[index] = count;
    edgeCells[index] = count < 4 ? 1 : 0;
  }

  const boundaryCells: Point[] = [];

  for (const [index, point] of cells.entries()) {
    if (edgeCells[index]) boundaryCells.push(point);
  }

  const edgeDistance = new Float64Array(cells.length);
  const deepIndices: number[] = [];

  for (const [index, point] of cells.entries()) {
    let distance = Infinity;

    for (const edge of boundaryCells) distance = Math.min(distance, Math.hypot(point.x - edge.x, point.y - edge.y));

    edgeDistance[index] = distance;

    if (distance > 3 * h) deepIndices.push(index);
  }

  const boundary = Array.from({ length: 512 }, (_, index) => {
    const angle = index * 2 * Math.PI / 512;
    const radius = plateRadius(angle);

    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });
  const model: WarmModel = { grid, h, cells, cellIndices, lookup, neighbors, degree, boundary, edgeCells, edgeDistance, deepIndices, u0: Float64Array.from(data.u0), phi1: Float64Array.from(data.phi1), mu1: data.mu1, mu2: data.mu2, gradientRatio: data.gradient_ratio_full, computation: { kind: 'pending' } };
  const magnitudes = gradients(model, model.phi1).map(gradient => gradient.magnitude);
  const ratio = Math.min(...magnitudes) / Math.max(...magnitudes);

  if (Math.abs(ratio - model.gradientRatio) > 1e-10) throw new Error('The live deep-interior gradient agrees with the canonical computation.');

  model.gradientRatio = ratio;

  return model;
}

/** Positive graph Laplacian, with no flux through missing grid neighbors. */
export function laplacian(model: WarmModel, values: Float64Array): Float64Array {
  if (values.length !== model.cells.length) throw new RangeError('The Laplacian uses one value per active cell.');

  const result = new Float64Array(values.length);
  const inverseSquare = 1 / (model.h * model.h);

  for (let cell = 0; cell < values.length; cell++) {
    let sum = 0;
    const centre = numberAt(values, cell);

    for (let side = 0; side < 4; side++) {
      const neighbor = numberAt(model.neighbors, cell * 4 + side);

      if (neighbor >= 0) sum += centre - numberAt(values, neighbor);
    }

    result[cell] = sum * inverseSquare;
  }

  return result;
}

function transition(model: WarmModel, values: Float64Array, result: Float64Array): void {
  for (let cell = 0; cell < values.length; cell++) {
    let sum = (4 - numberAt(model.degree, cell)) * numberAt(values, cell);

    for (let side = 0; side < 4; side++) {
      const neighbor = numberAt(model.neighbors, cell * 4 + side);

      if (neighbor >= 0) sum += numberAt(values, neighbor);
    }

    result[cell] = sum / 4;
  }
}

/** Full-grid heat semigroup, uniformized with nonnegative Poisson weights. */
export function heatAdvance(model: WarmModel, values: Float64Array, elapsed: number): Float64Array<ArrayBuffer> {
  if (values.length !== model.cells.length || !Number.isFinite(elapsed) || elapsed < 0) throw new RangeError('Heat evolution requires the full grid and nonnegative finite elapsed time.');
  if (elapsed === 0) return values.slice();

  const rate = 4 / (model.h * model.h);
  const chunks = Math.ceil(rate * elapsed / 16);
  const mean = rate * elapsed / chunks;
  let current = values.slice();
  let term = new Float64Array(values.length);
  let next = new Float64Array(values.length);
  const sum = new Float64Array(values.length);

  for (let chunk = 0; chunk < chunks; chunk++) {
    term.set(current);
    let weight = Math.exp(-mean);
    let totalWeight = weight;

    for (let cell = 0; cell < values.length; cell++) sum[cell] = numberAt(term, cell) * weight;

    let converged = false;

    for (let order = 1; order <= 256; order++) {
      transition(model, term, next);
      const swap = term;
      term = next;
      next = swap;
      weight *= mean / order;
      totalWeight += weight;

      for (let cell = 0; cell < values.length; cell++) sum[cell] = numberAt(sum, cell) + weight * numberAt(term, cell);

      if (order + 2 > mean) {
        const tail = weight * mean / (order + 1) / (1 - mean / (order + 2));

        if (tail < 2e-17) {
          converged = true;

          break;
        }
      }
    }

    if (!converged) throw new Error('The positive heat-expansion tail did not reach its required accuracy.');

    for (let cell = 0; cell < values.length; cell++) current[cell] = numberAt(sum, cell) / totalWeight;
  }

  return current;
}

export function heatTimes(): Float64Array<ArrayBuffer> {
  const times = new Set<number>([0, .02, .05, .1, .2, .4, .8, 1.6, 3.2]);

  for (const [start, end, count] of [[0, .1, 50], [.1, .4, 40], [.4, 1.6, 48], [1.6, 3.2, 32]] as const) {
    for (let step = 0; step <= count; step++) times.add(Number((start + (end - start) * step / count).toFixed(12)));
  }

  return Float64Array.from(Array.from(times).sort((a, b) => a - b));
}

export function computeHeatAtlas(model: WarmModel): HeatAtlas {
  const times = heatTimes();
  const cellCount = model.cells.length;
  const values = new Float64Array(times.length * cellCount);
  let previous = 0;
  let current = model.u0.slice();

  for (const [frame, tau] of times.entries()) {
    current = heatAdvance(model, current, tau - previous);
    values.set(current, frame * cellCount);
    previous = tau;
  }

  return { times, values, cellCount };
}

export function fieldSample(model: WarmModel, tau: number): FieldSample {
  if (!Number.isFinite(tau) || tau < 0 || tau > 3.2) throw new RangeError('The displayed heat time lies between zero and 3.2.');
  if (model.computation.kind !== 'ready') return { kind: 'initial', tau: 0, values: model.u0, interpolated: false, ...extrema(model.u0) };

  const atlas = model.computation.atlas;

  if (atlas.cellCount !== model.cells.length || atlas.values.length !== atlas.times.length * atlas.cellCount || atlas.times.length < 2) throw new Error('The computed heat atlas has complete frame-major vectors.');

  let upper = 1;

  while (upper < atlas.times.length - 1 && numberAt(atlas.times, upper) < tau) upper++;

  const lower = upper - 1;
  const firstTime = numberAt(atlas.times, lower);
  const secondTime = numberAt(atlas.times, upper);

  if (!(secondTime > firstTime)) throw new Error('The heat atlas times increase strictly.');

  const amount = (tau - firstTime) / (secondTime - firstTime);
  const values = new Float64Array(atlas.cellCount);

  for (let cell = 0; cell < values.length; cell++) {
    const a = numberAt(atlas.values, lower * atlas.cellCount + cell);
    const b = numberAt(atlas.values, upper * atlas.cellCount + cell);
    values[cell] = a + (b - a) * amount;
  }

  return { kind: 'computed', tau, values, interpolated: amount > 0 && amount < 1, ...extrema(values) };
}

export function gradients(model: WarmModel, values: Float64Array, deepOnly = true): Gradient[] {
  if (values.length !== model.cells.length) throw new RangeError('Each gradient uses one value per active cell.');

  const indices = deepOnly ? model.deepIndices : Array.from(values.keys());
  const result: Gradient[] = [];

  for (const index of indices) {
    const up = numberAt(model.neighbors, index * 4);
    const down = numberAt(model.neighbors, index * 4 + 1);
    const right = numberAt(model.neighbors, index * 4 + 2);
    const left = numberAt(model.neighbors, index * 4 + 3);

    if (up < 0 || down < 0 || right < 0 || left < 0) continue;

    const x = (numberAt(values, right) - numberAt(values, left)) / (2 * model.h);
    const y = (numberAt(values, up) - numberAt(values, down)) / (2 * model.h);
    result.push({ index, point: pointAt(model.cells, index), x, y, magnitude: Math.hypot(x, y) });
  }

  return result;
}

/** Marching squares on complete interior cell-centre quads; no boundary extrapolation. */
export function contours(model: WarmModel, values: Float64Array, levels: readonly number[]): ContourSegment[] {
  if (values.length !== model.cells.length || levels.some(level => !Number.isFinite(level))) throw new RangeError('Contours require finite levels and a complete scalar grid.');

  const result: ContourSegment[] = [];

  for (let row = 0; row < model.grid - 1; row++) {
    for (let col = 0; col < model.grid - 1; col++) {
      const corners = [numberAt(model.lookup, row * model.grid + col), numberAt(model.lookup, row * model.grid + col + 1), numberAt(model.lookup, (row + 1) * model.grid + col + 1), numberAt(model.lookup, (row + 1) * model.grid + col)];

      if (corners.some(index => index < 0)) continue;

      for (const level of levels) {
        const crossings: Point[] = [];

        for (let side = 0; side < 4; side++) {
          const a = numberAt(corners, side);
          const b = numberAt(corners, (side + 1) % 4);
          const first = numberAt(values, a);
          const second = numberAt(values, b);

          if ((first >= level) === (second >= level)) continue;

          const p = pointAt(model.cells, a);
          const q = pointAt(model.cells, b);
          const amount = (level - first) / (second - first);
          crossings.push({ x: p.x + (q.x - p.x) * amount, y: p.y + (q.y - p.y) * amount });
        }

        if (crossings.length === 2) {
          result.push({ level, a: pointAt(crossings, 0), b: pointAt(crossings, 1) });
        } else if (crossings.length === 4) {
          const centre = corners.reduce((sum, index) => sum + numberAt(values, index) / 4, 0);
          const first = numberAt(values, numberAt(corners, 0));
          const pairs = (centre >= level) === (first >= level) ? [[0, 1], [2, 3]] : [[0, 3], [1, 2]];

          for (const [a, b] of pairs) {
            if (a === undefined || b === undefined) throw new Error('Each saddle contour pairs two crossings.');

            result.push({ level, a: pointAt(crossings, a), b: pointAt(crossings, b) });
          }
        } else if (crossings.length !== 0) throw new Error('A complete marching square has zero, two or four contour crossings.');
      }
    }
  }

  return result;
}

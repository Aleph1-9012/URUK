export type Point = { x: number; y: number };

export type AffineScore = Point & { offset: number };

export type SectorAngles = [number, number, number, number, number, number];

export type SectorPartition = { angles: SectorAngles; moments: Point[]; value: number; rotation: number };

export type SectorSearchRow = { k: number; angles: number[]; value: number };

export type GridPoint = Point & { weight: number };

export type GaussianGrid = { points: GridPoint[]; step: number; limit: number; mass: number };

export type GridPartition = { moments: Point[]; value: number };

export const PARAMETERS = { cloudSeed: 96, partitionSeed: 97, cloudCount: 600, cutCount: 150, gridStep: .125, gridLimit: 5, referenceHalfWidth: .003 } as const;

const TAU = 2 * Math.PI;

const MOMENT_SCALE = 1 / Math.sqrt(TAU);

function padAngles(input: readonly number[]): SectorAngles {
  if (input.length < 1 || input.length > 6) throw new RangeError('The displayed sector partition has one to six labelled cells.');

  const angles: SectorAngles = [0, 0, 0, 0, 0, 0];
  let total = 0;

  for (const [index, angle] of input.entries()) {
    if (!Number.isFinite(angle) || angle < 0 || angle > 360) throw new RangeError('Sector angles must be finite and between zero and 360 degrees.');

    angles[index] = angle;
    total += angle;
  }

  if (Math.abs(total - 360) > 1e-8) throw new RangeError('Sector angles must partition the full circle, with empty cells allowed.');

  return angles;
}

export function sectorMoment(startDegrees: number, angleDegrees: number): Point {
  if (!Number.isFinite(startDegrees) || !Number.isFinite(angleDegrees) || angleDegrees < 0 || angleDegrees > 360) throw new RangeError('A sector moment needs finite angles and an opening between zero and 360 degrees.');
  if (angleDegrees === 0 || angleDegrees === 360) return { x: 0, y: 0 };

  const bisector = (startDegrees + angleDegrees / 2) * Math.PI / 180;
  const length = Math.sin(angleDegrees * Math.PI / 360) * MOMENT_SCALE;

  return { x: length * Math.cos(bisector), y: length * Math.sin(bisector) };
}

export function sectorPartition(input: readonly number[], rotation = 0): SectorPartition {
  if (!Number.isFinite(rotation)) throw new RangeError('A sector partition needs a finite rotation.');

  const angles = padAngles(input);
  const moments: Point[] = [];
  let start = rotation;
  let value = 0;

  for (const angle of angles) {
    const moment = sectorMoment(start, angle);
    moments.push(moment);
    value += moment.x * moment.x + moment.y * moment.y;
    start += angle;
  }

  return { angles, moments, value, rotation };
}

export function equalAngles(cells: number): SectorAngles {
  if (!Number.isInteger(cells) || cells < 1 || cells > 6) throw new RangeError('The equal-sector illustration uses one to six cells.');

  return padAngles(Array.from({ length: cells }, () => 360 / cells));
}

export function mixAngles(from: readonly number[], to: readonly number[], amount: number): SectorAngles {
  if (!Number.isFinite(amount) || amount < 0 || amount > 1) throw new RangeError('The sector motion needs an amount between zero and one.');

  const a = padAngles(from);
  const b = padAngles(to);
  const result: SectorAngles = [0, 0, 0, 0, 0, 0];

  for (let index = 0; index < 6; index++) {
    const first = a[index];
    const second = b[index];

    if (first === undefined || second === undefined) throw new Error('Each labelled sector needs both endpoint angles.');

    result[index] = first + (second - first) * amount;
  }

  return result;
}

function sectorLabel(point: Point, angles: SectorAngles, rotation: number): number {
  const argument = (Math.atan2(point.y, point.x) * 180 / Math.PI - rotation) % 360;
  const angle = argument < 0 ? argument + 360 : argument;
  let boundary = 0;
  let lastNonempty = 0;

  for (const [index, opening] of angles.entries()) {
    boundary += opening;

    if (opening > 0) lastNonempty = index;
    if (angle < boundary) return index;
  }

  return lastNonempty;
}

export function sectorIndex(point: Point, angles: readonly number[], rotation = 0): number {
  if (!Number.isFinite(rotation)) throw new RangeError('The displayed sector labels need a finite rotation.');

  return sectorLabel(point, padAngles(angles), rotation);
}

export function wholeDegreeSearch(): SectorSearchRow[] {
  const reward = Array.from({ length: 361 }, (_, angle) => Math.sin(angle * Math.PI / 360) ** 2);
  const values = Array.from({ length: 7 }, () => Array.from({ length: 361 }, () => -Infinity));
  const choices = Array.from({ length: 7 }, () => Array.from({ length: 361 }, () => 0));
  const initial = values[0];

  if (!initial) throw new Error('The degree search needs its zero-cell base row.');

  initial[0] = 0;

  for (let cells = 1; cells <= 6; cells++) {
    const previous = values[cells - 1];
    const current = values[cells];
    const choice = choices[cells];

    if (!previous || !current || !choice) throw new Error('Each degree-search row needs its preceding values and backtracking choices.');

    for (let sum = 0; sum <= 360; sum++) {
      let best = -Infinity;

      for (let angle = 0; angle <= sum; angle++) {
        const before = previous[sum - angle];
        const term = reward[angle];

        if (before === undefined || term === undefined) throw new Error('Every candidate degree split needs its previous value and reward.');

        const candidate = before + term;

        if (candidate > best) {
          best = candidate;
          choice[sum] = angle;
        }
      }

      current[sum] = best;
    }
  }

  return [2, 3, 4, 5, 6].map(k => {
    let sum = 360;
    const angles: number[] = [];

    for (let cells = k; cells > 0; cells--) {
      const angle = choices[cells]?.[sum];

      if (angle === undefined) throw new Error('Each optimal sector partition needs its backtracking angle.');

      angles.push(angle);
      sum -= angle;
    }

    angles.reverse();
    const optimum = values[k]?.[360];

    if (sum !== 0 || optimum === undefined || !Number.isFinite(optimum)) throw new Error('The degree search must backtrack to a complete full-circle partition.');

    return { k, angles, value: optimum / TAU };
  });
}

export function parkMiller(seed: number): () => number {
  if (!Number.isInteger(seed) || seed <= 0 || seed >= 2147483647) throw new RangeError('The portable stream needs a nonzero seed below its modulus.');

  let state = seed;

  return () => {
    state = state * 16807 % 2147483647;

    return state / 2147483647;
  };
}

function gaussianRandom(uniform: () => number): () => number {
  let spare: number | undefined;

  return () => {
    if (spare !== undefined) {
      const value = spare;
      spare = undefined;

      return value;
    }

    const radius = Math.sqrt(-2 * Math.log(uniform()));
    const angle = TAU * uniform();
    spare = radius * Math.sin(angle);

    return radius * Math.cos(angle);
  };
}

export function gaussianCloud(count: number = PARAMETERS.cloudCount, seed: number = PARAMETERS.cloudSeed): Point[] {
  if (!Number.isInteger(count) || count < 1) throw new RangeError('The Gaussian cloud needs a positive integer point count.');

  const normal = gaussianRandom(parkMiller(seed));

  return Array.from({ length: count }, () => ({ x: normal(), y: normal() }));
}

export function midpointGrid(step: number = PARAMETERS.gridStep, limit: number = PARAMETERS.gridLimit): GaussianGrid {
  const count = Math.round(2 * limit / step);

  if (!(limit > 0) || !(step > 0) || !Number.isFinite(count) || count < 1 || Math.abs(count * step - 2 * limit) > 1e-9) throw new RangeError('The midpoint grid needs a finite positive width and a step that tiles it.');

  const points: GridPoint[] = [];
  let mass = 0;

  for (let i = 0; i < count; i++) {
    const x = -limit + (i + .5) * step;

    for (let j = 0; j < count; j++) {
      const y = -limit + (j + .5) * step;
      const weight = Math.exp(-(x * x + y * y) / 2) / TAU * step * step;
      points.push({ x, y, weight });
      mass += weight;
    }
  }

  return { points, step, limit, mass };
}

function functional(moments: readonly Point[]): number {
  let value = 0;

  for (const moment of moments) value += moment.x * moment.x + moment.y * moment.y;

  return value;
}

export function scoreIndex(point: Point, scores: readonly AffineScore[]): number {
  if (scores.length === 0) throw new RangeError('An affine-score partition needs at least one cell.');

  let index = 0;
  let largest = -Infinity;

  for (const [candidate, score] of scores.entries()) {
    const value = score.x * point.x + score.y * point.y + score.offset;

    if (value > largest) {
      largest = value;
      index = candidate;
    }
  }

  return index;
}

function gridPartition(grid: GaussianGrid, cells: number, label: (point: Point) => number): GridPartition {
  const moments = Array.from({ length: cells }, () => ({ x: 0, y: 0 }));

  for (const point of grid.points) {
    const moment = moments[label(point)];

    if (!moment) throw new Error('Every midpoint must belong to a declared partition cell.');

    moment.x += point.x * point.weight;
    moment.y += point.y * point.weight;
  }

  return { moments, value: functional(moments) };
}

export function gridSectorPartition(input: readonly number[], grid: GaussianGrid, rotation = 0): GridPartition {
  if (!Number.isFinite(rotation)) throw new RangeError('The midpoint sector partition needs a finite rotation.');

  const angles = padAngles(input);

  return gridPartition(grid, angles.length, point => sectorLabel(point, angles, rotation));
}

export function gridScorePartition(scores: readonly AffineScore[], grid: GaussianGrid): GridPartition {
  if (scores.length === 0 || scores.some(score => !Number.isFinite(score.x) || !Number.isFinite(score.y) || !Number.isFinite(score.offset))) throw new RangeError('The grid partition needs finite affine scores for its cells.');

  return gridPartition(grid, scores.length, point => scoreIndex(point, scores));
}

export function randomScorePartitions(count: number = PARAMETERS.cutCount, seed: number = PARAMETERS.partitionSeed): AffineScore[][] {
  if (!Number.isInteger(count) || count < 1) throw new RangeError('The score sample needs a positive integer trial count.');

  const uniform = parkMiller(seed);
  const normal = gaussianRandom(uniform);

  return Array.from({ length: count }, () => {
    const cells = 2 + Math.floor(5 * uniform());

    return Array.from({ length: cells }, () => ({ x: normal(), y: normal(), offset: .7 * normal() }));
  });
}

export function buildPropellerModel() {
  const grid = midpointGrid();
  const halves = sectorPartition([180, 180]);
  const propeller = sectorPartition([120, 120, 120]);
  const q2 = gridSectorPartition(halves.angles, grid).value;
  const q3 = gridSectorPartition(propeller.angles, grid).value;
  const cuts = randomScorePartitions().map(scores => ({ scores, ...gridScorePartition(scores, grid) }));
  let min = Infinity;
  let max = -Infinity;

  for (const cut of cuts) {
    min = Math.min(min, cut.value);
    max = Math.max(max, cut.value);
  }

  return {
    cloud: gaussianCloud(), uneven: sectorPartition([90, 110, 160]), halves, propeller,
    equalSectors: [2, 3, 4, 5, 6].map(cells => sectorPartition(equalAngles(cells))),
    degreeSearch: wholeDegreeSearch(),
    slider: [0, 10, 20, 30, 40, 50, 60].map(t => ({ t, ...sectorPartition([120 + 2 * t, 120 - t, 120 - t]) })),
    quadrature: { step: grid.step, limit: grid.limit, mass: grid.mass, q2, q3 },
    randomCuts: { cuts, count: cuts.length, min, max },
  };
}

export type PropellerModel = ReturnType<typeof buildPropellerModel>;

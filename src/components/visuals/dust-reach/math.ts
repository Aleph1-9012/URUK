import { DUST_DELTA, DUST_PARAMETERS, LATTICE_N, OPENING_COORDINATES, PATCH_PARAMETERS, RANDOM_COORDINATES } from './data';

export type Point = { x: number; y: number };

export type Pair = { i: number; j: number; distance: number; squared: number };

export type DistanceMetric = 'distance' | 'squared-distance';

function grid(coordinates: readonly number[]): Point[] {
  const points: Point[] = [];

  for (const y of coordinates) {
    for (const x of coordinates) points.push({ x, y });
  }

  return points;
}

export function generateDust(lambda: number, stage: number): Point[] {
  if (!(lambda > 0 && lambda < .5) || !Number.isInteger(stage) || stage < 0) throw new RangeError('A separated product dust uses 0 < lambda < 1/2 and a nonnegative integer stage.');

  const coordinates = [0];

  for (let level = 0; level < stage; level++) {
    const count = coordinates.length;
    const offset = (1 - lambda) * lambda ** level;

    for (let index = 0; index < count; index++) {
      const coordinate = coordinates[index];

      if (coordinate === undefined) throw new Error('Every existing Cantor address must have a coordinate.');

      coordinates.push(coordinate + offset);
    }
  }

  return grid(coordinates);
}

function binIndex(value: number, delta: number): number {
  const ratio = value / delta;
  const nearest = Math.round(ratio);
  // Exact rational boundaries (for example lattice squared distances) can land a
  // few ulps below their integer bin after binary coordinate subtraction.
  const tolerance = 32 * Number.EPSILON * Math.max(1, Math.abs(ratio));

  return Math.floor(Math.abs(ratio - nearest) <= tolerance ? nearest : ratio);
}

export function computeHitBins(points: readonly Point[], delta: number, totalBins: number, metric: DistanceMetric = 'distance'): number[] {
  if (!(delta > 0) || !Number.isFinite(delta) || !Number.isInteger(totalBins) || totalBins <= 0) throw new RangeError('Distance bins need a finite positive width and a positive integer count.');

  const hits = new Uint8Array(totalBins);

  for (let i = 0; i < points.length; i++) {
    const first = points[i];

    if (!first) throw new Error('Every pair endpoint must exist.');

    for (let j = i + 1; j < points.length; j++) {
      const second = points[j];

      if (!second) throw new Error('Every pair endpoint must exist.');

      const dx = first.x - second.x;
      const dy = first.y - second.y;
      const squared = dx * dx + dy * dy;

      if (squared === 0) continue;

      const index = binIndex(metric === 'distance' ? Math.sqrt(squared) : squared, delta);

      if (index >= 0 && index < totalBins) hits[index] = 1;
    }
  }

  const hitBins: number[] = [];

  for (let index = 0; index < totalBins; index++) {
    if (hits[index]) hitBins.push(index);
  }

  return hitBins;
}

function openingPairs(points: readonly Point[]): Pair[] {
  const pairs: Pair[] = [];

  for (const [i, first] of points.entries()) {
    for (let j = i + 1; j < points.length; j++) {
      const second = points[j];

      if (!second) throw new Error('Every opening pair endpoint must exist.');

      const dx = first.x - second.x;
      const dy = first.y - second.y;
      const squared = dx * dx + dy * dy;

      if (squared > 0) pairs.push({ i, j, squared, distance: Math.sqrt(squared) });
    }
  }

  return pairs;
}

export function buildDistanceModel() {
  const openingPoints = OPENING_COORDINATES.map(([x, y]) => ({ x, y }));
  const opening = { points: openingPoints, pairs: openingPairs(openingPoints) };
  const { side, gridSize, delta: patchDelta } = PATCH_PARAMETERS;
  const patchPoints = grid(Array.from({ length: gridSize }, (_, index) => side * index / (gridSize - 1)));
  const maxDistance = side * Math.SQRT2;
  const patchTotal = Math.floor(maxDistance / patchDelta) + 1;
  const patch = { side, gridSize, points: patchPoints, delta: patchDelta, totalBins: patchTotal, hitBins: computeHitBins(patchPoints, patchDelta, patchTotal), maxDistance };
  const dustTotal = Math.floor(Math.SQRT2 / DUST_DELTA) + 1;
  const dusts = DUST_PARAMETERS.map(({ lambda, stage }) => {
    const points = generateDust(lambda, stage);

    return {
      lambda, stage, dimension: Math.log(4) / Math.log(1 / lambda), points, delta: DUST_DELTA,
      totalBins: dustTotal, hitBins: computeHitBins(points, DUST_DELTA, dustTotal),
      previews: [1, 2, 3].map(previewStage => ({ stage: previewStage, points: generateDust(lambda, previewStage) })),
    };
  });

  const latticePoints = grid(Array.from({ length: LATTICE_N + 1 }, (_, index) => index / LATTICE_N));
  const squaredDelta = 1 / (LATTICE_N * LATTICE_N);
  const squaredTotal = 2 * LATTICE_N * LATTICE_N + 1;
  const lattice = { N: LATTICE_N, points: latticePoints, delta: squaredDelta, totalBins: squaredTotal, hitBins: computeHitBins(latticePoints, squaredDelta, squaredTotal, 'squared-distance') };
  const randomPoints = RANDOM_COORDINATES.map(([x, y]) => ({ x, y }));
  const random = { points: randomPoints, delta: squaredDelta, totalBins: squaredTotal, hitBins: computeHitBins(randomPoints, squaredDelta, squaredTotal, 'squared-distance') };

  return { opening, patch, dusts, lattice, random };
}

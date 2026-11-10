// Only seed166's canonical Python random coordinates are shipped.
import data from './data.json';

export type Point3 = { x: number; y: number; z: number };

export type DistancePair = { id: number; a: number; b: number; dx: number; dy: number; dz: number; squared: number; distance: number };

export type DistanceBucket = { squared: number; count: number; pairIds: number[] };

export type GrowthRow = { t: number; n: number; distinct: number; ratio: number; squaredValues: number[] };

export type ExactRandomCertificate = { coordinateDenominator: bigint; squaredDenominator: bigint; distinct: number; smallest: bigint; largest: bigint; minimumGap: bigint };

const COORDINATE_DENOMINATOR = 1n << 51n;

function inputPoint(coordinates: readonly number[]): Point3 {
  const x = coordinates[0];
  const y = coordinates[1];
  const z = coordinates[2];

  if (coordinates.length !== 3 || x === undefined || y === undefined || z === undefined) throw new Error('Each canonical random point has three coordinates.');

  for (const coordinate of [x, y, z]) {
    if (!Number.isFinite(coordinate) || coordinate < 0 || coordinate >= 4) throw new Error('The fixed random sample lies inside the side-four cube.');
  }

  return { x, y, z };
}

export function gridPoints(t: number): Point3[] {
  if (!Number.isInteger(t) || t < 2 || t > 12) throw new RangeError('The illustrated cubic grid has side two through twelve.');

  const points: Point3[] = [];

  for (let x = 0; x < t; x++) {
    for (let y = 0; y < t; y++) {
      for (let z = 0; z < t; z++) points.push({ x, y, z });
    }
  }

  return points;
}

export function pairMetrics(points: readonly Point3[]) {
  if (points.length < 2) throw new RangeError('Positive interpoint distances require at least two distinct points.');

  const pairs: DistancePair[] = [];
  const buckets = new Map<number, number[]>();

  for (let a = 0; a < points.length; a++) {
    const first = points[a];

    if (!first) throw new Error('Each pair has its first point.');

    for (let b = a + 1; b < points.length; b++) {
      const second = points[b];

      if (!second) throw new Error('Each pair has its second point.');

      const dx = second.x - first.x;
      const dy = second.y - first.y;
      const dz = second.z - first.z;
      const squared = dx * dx + dy * dy + dz * dz;

      if (!(squared > 0 && Number.isFinite(squared))) throw new Error('The point set has finite coordinates and distinct points.');

      const id = pairs.length;
      pairs.push({ id, a, b, dx, dy, dz, squared, distance: Math.sqrt(squared) });
      const existing = buckets.get(squared);

      if (existing) existing.push(id);
      else buckets.set(squared, [id]);
    }
  }

  const squaredValues = [...buckets.keys()].sort((a, b) => a - b);
  const histogram: DistanceBucket[] = [];

  for (const squared of squaredValues) {
    const pairIds = buckets.get(squared);

    if (!pairIds) throw new Error('Every distance bucket has its actual unordered pairs.');

    histogram.push({ squared, count: pairIds.length, pairIds });
  }

  return { pairs, pairCount: pairs.length, distinct: squaredValues.length, squaredValues, histogram };
}

/** Absolute integer differences enumerate at most t³ possibilities, not all t⁶ point pairs. */
export function gridSquaredValues(t: number): number[] {
  if (!Number.isInteger(t) || t < 2 || t > 12) throw new RangeError('The finite growth table uses side two through twelve.');

  const values = new Set<number>();

  for (let a = 0; a < t; a++) {
    for (let b = 0; b < t; b++) {
      for (let c = 0; c < t; c++) {
        const squared = a * a + b * b + c * c;

        if (squared > 0) values.add(squared);
      }
    }
  }

  return [...values].sort((a, b) => a - b);
}

export function exactRandomCertificate(points: readonly Point3[]): ExactRandomCertificate {
  const scale = Number(COORDINATE_DENOMINATOR);
  const integers: { x: bigint; y: bigint; z: bigint }[] = [];

  function numerator(coordinate: number): bigint {
    const scaled = coordinate * scale;

    if (!Number.isSafeInteger(scaled)) throw new Error('Each shipped random coordinate is an exact integer divided by 2^51.');

    return BigInt(scaled);
  }

  for (const point of points) integers.push({ x: numerator(point.x), y: numerator(point.y), z: numerator(point.z) });

  const squares = new Set<bigint>();

  for (let a = 0; a < integers.length; a++) {
    const first = integers[a];

    if (!first) throw new Error('Each rational pair has its first point.');

    for (let b = a + 1; b < integers.length; b++) {
      const second = integers[b];

      if (!second) throw new Error('Each rational pair has its second point.');

      const dx = second.x - first.x;
      const dy = second.y - first.y;
      const dz = second.z - first.z;
      squares.add(dx * dx + dy * dy + dz * dz);
    }
  }

  const sorted = [...squares].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  const smallest = sorted[0];
  const largest = sorted.at(-1);

  if (smallest === undefined || largest === undefined || sorted.length < 2) throw new Error('The fixed sample has at least two distinct squared distances.');

  let minimumGap = largest - smallest;

  for (let index = 1; index < sorted.length; index++) {
    const a = sorted[index - 1];
    const b = sorted[index];

    if (a === undefined || b === undefined) throw new Error('Adjacent exact distances have both numerators.');

    if (b - a < minimumGap) minimumGap = b - a;
  }

  return { coordinateDenominator: COORDINATE_DENOMINATOR, squaredDenominator: COORDINATE_DENOMINATOR ** 2n, distinct: sorted.length, smallest, largest, minimumGap };
}

export function createDistanceModel() {
  const side = 5;
  const grid = gridPoints(side);
  const random = data.random_points.map(inputPoint);

  if (random.length !== grid.length) throw new Error('The comparison uses exactly as many random points as grid points.');

  const metrics = pairMetrics(grid);
  const randomMetrics = pairMetrics(random);
  const missing: number[] = [];

  for (let squared = 1; squared <= 3 * (side - 1) ** 2; squared++) {
    if (!metrics.squaredValues.includes(squared)) missing.push(squared);
  }

  let common = metrics.histogram[0];

  if (!common) throw new Error('The nonempty grid tally has a first distance bucket.');

  for (const bucket of metrics.histogram) {
    if (bucket.count > common.count) common = bucket;
  }

  const examples: DistancePair[] = [];

  for (const squared of [1, 2, 5, 48]) {
    const example = metrics.pairs.find(pair => pair.squared === squared);

    if (!example) throw new Error('Every chosen pair example is an actual grid pair.');

    examples.push(example);
  }

  const five = metrics.histogram.find(bucket => bucket.squared === 5);

  if (!five) throw new Error('The repeated-length sample comes from the squared-five bucket.');

  const repeatedFive: number[] = [];

  for (let index = 0; index < 18; index++) {
    const id = five.pairIds[Math.floor(index * five.pairIds.length / 18)];

    if (id === undefined) throw new Error('Every displayed repeated-length line is one of the actual grid pairs.');

    repeatedFive.push(id);
  }

  const planePoints: Point3[] = [];
  const sourceIndices: number[] = [];

  for (const [index, point] of grid.entries()) {
    if (point.y !== (side - 1) / 2) continue;

    planePoints.push(point);
    sourceIndices.push(index);
  }

  const plane = { points: planePoints, sourceIndices, ...pairMetrics(planePoints) };
  const growth: GrowthRow[] = [];

  for (let t = 2; t <= 12; t++) {
    const squaredValues = gridSquaredValues(t);
    growth.push({ t, n: t ** 3, distinct: squaredValues.length, ratio: squaredValues.length / t ** 2, squaredValues });
  }

  const ladder = { half: 1 / 2, apst: 77 / 141, solymosiVu: .5643, threeFifths: 3 / 5, grid: 2 / 3 };

  return { side, grid, random, gridPairs: metrics.pairs, randomPairs: randomMetrics.pairs, pairCount: metrics.pairCount, distinct: metrics.distinct, squaredValues: metrics.squaredValues, histogram: metrics.histogram, missing, common, examples, repeatedFive, plane, growth, ladder, randomDistinct: randomMetrics.distinct, randomCertificate: exactRandomCertificate(random) };
}

export type DistanceModel = ReturnType<typeof createDistanceModel>;

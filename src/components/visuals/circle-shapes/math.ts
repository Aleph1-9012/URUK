export type Rational = { readonly n: bigint; readonly d: bigint };

export type ExactPoint = readonly [Rational, Rational];

export type Point = { readonly x: number; readonly y: number };

export type Circle = { readonly centre: ExactPoint; readonly radiusSquared: Rational };

export type CircleExample = {
  readonly points: readonly ExactPoint[];
  readonly circle: Circle;
  readonly plot: readonly Point[];
  readonly centreText: readonly [string, string];
  readonly radiusSquaredText: string;
};

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;

  while (y) [x, y] = [y, x % y];

  return x;
}

export function rational(n: bigint, d = 1n): Rational {
  if (d === 0n) throw new RangeError('A rational denominator cannot be zero.');

  const divisor = gcd(n, d) * (d < 0n ? -1n : 1n);

  return { n: n / divisor, d: d / divisor };
}

const ZERO = rational(0n);
const ONE = rational(1n);

function add(a: Rational, b: Rational): Rational {
  return rational(a.n * b.d + b.n * a.d, a.d * b.d);
}

function subtract(a: Rational, b: Rational): Rational {
  return rational(a.n * b.d - b.n * a.d, a.d * b.d);
}

function multiply(a: Rational, b: Rational): Rational {
  return rational(a.n * b.n, a.d * b.d);
}

function divide(a: Rational, b: Rational): Rational {
  return rational(a.n * b.d, a.d * b.n);
}

function squared(a: Rational): Rational {
  return multiply(a, a);
}

export function rationalText(value: Rational): string {
  return value.d === 1n ? String(value.n) : `${value.n}/${value.d}`;
}

export function rationalNumber(value: Rational): number {
  const result = Number(value.n) / Number(value.d);

  if (!Number.isFinite(result)) throw new RangeError('The displayed rational must have a finite numerical coordinate.');

  return result;
}

function coordinate(x: bigint, y: bigint, denominator = 1n): ExactPoint {
  return [rational(x, denominator), rational(y, denominator)];
}

function item(values: readonly Rational[], index: number): Rational {
  const value = values[index];

  if (value === undefined) throw new Error('The exact circle system needs every coordinate.');

  return value;
}

function matrixRow(matrix: Rational[][], index: number): Rational[] {
  const row = matrix[index];

  if (!row) throw new Error('The exact circle system needs every row.');

  return row;
}

/** Solve c + l_x x + l_y y + x² + y² = 0 over Q. */
export function circleThrough(points: readonly ExactPoint[]): Circle | null {
  if (points.length < 3) throw new RangeError('A circle check needs at least three points.');

  const matrix = points.map(([x, y]) => [ONE, x, y, subtract(ZERO, add(squared(x), squared(y)))]);
  const pivots: number[] = [];
  let rank = 0;

  for (let column = 0; column < 3; column++) {
    let pivot = rank;

    while (pivot < matrix.length && item(matrixRow(matrix, pivot), column).n === 0n) pivot++;

    if (pivot === matrix.length) continue;

    const source = matrixRow(matrix, pivot);
    matrix[pivot] = matrixRow(matrix, rank);
    const divisor = item(source, column);
    const basis = source.map(value => divide(value, divisor));
    matrix[rank] = basis;

    for (let rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
      if (rowIndex === rank) continue;

      const row = matrixRow(matrix, rowIndex);
      const factor = item(row, column);
      matrix[rowIndex] = row.map((value, index) => subtract(value, multiply(factor, item(basis, index))));
    }

    pivots.push(column);
    rank++;
  }

  for (const row of matrix) {
    if (row.slice(0, 3).every(value => value.n === 0n) && item(row, 3).n !== 0n) return null;
  }

  const solution = [ZERO, ZERO, ZERO];

  for (const [index, column] of pivots.entries()) solution[column] = item(matrixRow(matrix, index), 3);

  const centre: ExactPoint = [divide(item(solution, 1), rational(-2n)), divide(item(solution, 2), rational(-2n))];
  const radiusSquared = subtract(add(squared(centre[0]), squared(centre[1])), item(solution, 0));

  if (radiusSquared.n < 0n) throw new Error('A real point cannot satisfy a negative squared-radius circle.');

  return { centre, radiusSquared };
}

export function circleResidual(circle: Circle, [x, y]: ExactPoint): Rational {
  return subtract(add(squared(subtract(x, circle.centre[0])), squared(subtract(y, circle.centre[1]))), circle.radiusSquared);
}

function toPoint([x, y]: ExactPoint): Point {
  return { x: rationalNumber(x), y: rationalNumber(y) };
}

function example(points: readonly ExactPoint[]): CircleExample {
  const circle = circleThrough(points);

  if (!circle || circle.radiusSquared.n === 0n) throw new Error('A displayed cyclic example needs its nondegenerate exact circle.');

  const centre = toPoint(circle.centre);
  const radius = Math.sqrt(rationalNumber(circle.radiusSquared));
  const plot = points.map(point => ({ x: (rationalNumber(point[0]) - centre.x) / radius, y: (rationalNumber(point[1]) - centre.y) / radius }));

  return { points, circle, plot, centreText: [rationalText(circle.centre[0]), rationalText(circle.centre[1])], radiusSquaredText: rationalText(circle.radiusSquared) };
}

function distanceSquared(a: ExactPoint, b: ExactPoint): Rational {
  return add(squared(subtract(a[0], b[0])), squared(subtract(a[1], b[1])));
}

function decimalRound(value: Rational): Rational {
  const magnitude = value.n < 0n ? -value.n : value.n;
  const hundredths = (magnitude * 200n + value.d) / (2n * value.d);

  return rational(hundredths * (value.n < 0n ? -1n : 1n), 100n);
}

function simplexModel() {
  const dimension = 4;
  const colours = 3;
  const vertices = Array.from({ length: dimension }, (_, index) => Array.from({ length: dimension }, (_, axis) => index === axis ? 1 / Math.sqrt(2) : 0));
  const pairs: { a: number; b: number; squaredDistance: Rational }[] = [];

  for (let a = 0; a < dimension; a++) {
    for (let b = a + 1; b < dimension; b++) {
      let numerator = 0;

      for (let axis = 0; axis < dimension; axis++) numerator += (Number(a === axis) - Number(b === axis)) ** 2;

      pairs.push({ a, b, squaredDistance: rational(BigInt(numerator), 2n) });
    }
  }

  const trials = Array.from({ length: colours ** dimension }, (_, code) => {
    let remainder = code;
    const inks: number[] = [];

    for (let index = 0; index < dimension; index++) {
      inks.unshift(remainder % colours);
      remainder = Math.floor(remainder / colours);
    }

    const sameInkPairs: (readonly [number, number])[] = [];

    for (const pair of pairs) {
      if (inks[pair.a] === inks[pair.b]) sameInkPairs.push([pair.a, pair.b]);
    }

    if (!sameInkPairs.length) throw new Error('A four-point three-colour trial must contain a repeated ink.');

    return { inks, sameInkPairs };
  });

  const representativeTrial = trials.find(trial => new Set(trial.inks).size === colours && trial.sameInkPairs.length === 1);

  if (!representativeTrial) throw new Error('The settled simplex illustration needs all three inks and exactly one same-ink pair.');

  return { dimension, colours, vertices, pairs, trials, representativeTrial };
}

function polygonModel() {
  const count = 12;
  const vertices = Array.from({ length: count }, (_, k) => ({ x: Math.cos(2 * Math.PI * k / count), y: Math.sin(2 * Math.PI * k / count) }));
  const rotations = Array.from({ length: count }, (_, steps) => {
    const angle = 2 * Math.PI * steps / count;
    const permutation: number[] = [];
    let error = 0;

    for (const vertex of vertices) {
      const rotated = { x: vertex.x * Math.cos(angle) - vertex.y * Math.sin(angle), y: vertex.x * Math.sin(angle) + vertex.y * Math.cos(angle) };
      let nearest = -1;
      let distance = Infinity;

      for (const [index, target] of vertices.entries()) {
        const candidate = Math.hypot(rotated.x - target.x, rotated.y - target.y);

        if (candidate < distance) [nearest, distance] = [index, candidate];
      }

      if (distance > 1e-12 || nearest < 0) throw new Error('Every polygon rotation must map onto a computed vertex.');

      permutation.push(nearest);
      error = Math.max(error, distance);
    }

    if (new Set(permutation).size !== count) throw new Error('A polygon rotation must permute all twelve vertices.');

    return { steps, permutation, error };
  });
  const rectangleIndices = [0, 1, 6, 7] as const;
  const rectangle = rectangleIndices.map(index => {
    const vertex = vertices[index];

    if (!vertex) throw new Error('The subtransitive rectangle needs an actual polygon vertex.');

    return vertex;
  });
  const values: number[] = [];

  for (const [index, a] of rectangle.entries()) {
    for (const b of rectangle.slice(index + 1)) {
      const value = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

      if (!values.some(other => Math.abs(other - value) < 1e-12)) values.push(value);
    }
  }

  return { vertices, rotations, rectangleIndices, rectangle, squaredDistances: values.sort((a, b) => a - b) };
}

export function tensorMatrix(circle: Circle): readonly (readonly Rational[])[] {
  const [x, y] = circle.centre;
  const c = subtract(add(squared(x), squared(y)), circle.radiusSquared);

  return [[c, subtract(ZERO, x), subtract(ZERO, y)], [subtract(ZERO, x), ONE, ZERO], [subtract(ZERO, y), ZERO, ONE]];
}

export function evaluateTensor(matrix: readonly (readonly Rational[])[], point: ExactPoint): Rational {
  if (matrix.length !== 3 || matrix.some(row => row.length !== 3)) throw new RangeError('The planar example needs a three-by-three matrix.');

  const p = [ONE, ...point];
  let result = ZERO;

  for (let i = 0; i < 3; i++) {
    const row = matrix[i];

    if (!row) throw new Error('The tensor evaluation needs every matrix row.');

    for (let j = 0; j < 3; j++) result = add(result, multiply(multiply(item(p, i), item(row, j)), item(p, j)));
  }

  return result;
}

export function buildCircleModel() {
  const triangle = example([coordinate(0n, 0n), coordinate(4n, 0n), coordinate(0n, 3n)]);
  const square = example([coordinate(0n, 0n), coordinate(1n, 0n), coordinate(1n, 1n), coordinate(0n, 1n)]);
  const isosceles = example([coordinate(0n, 0n), coordinate(2n, 0n), coordinate(1n, 3n)]);
  const kiteBase = example([coordinate(1n, 0n), coordinate(3n, 4n, 5n), coordinate(-1n, 0n), coordinate(3n, -4n, 5n)]);
  const sideSquares = kiteBase.points.map((point, index) => {
    const next = kiteBase.points[(index + 1) % kiteBase.points.length];

    if (!next) throw new Error('The cyclic kite needs its next vertex.');

    return distanceSquared(point, next);
  });
  const exactPoints = [coordinate(1n, 0n), coordinate(5n, 12n, 13n), coordinate(5n, -12n, 13n), coordinate(-5n, 12n, 13n)];
  const exactCircle = circleThrough(exactPoints);
  const roundedPoints: ExactPoint[] = exactPoints.map(([x, y]) => [decimalRound(x), decimalRound(y)]);
  const roundedCircle = circleThrough(roundedPoints);
  const firstThreeCircle = circleThrough(roundedPoints.slice(0, 3));

  if (!exactCircle || !firstThreeCircle || roundedCircle) throw new Error('The rounding demonstration needs an exact circle and a genuine four-point inconsistency.');

  const residuals = roundedPoints.map(point => circleResidual(firstThreeCircle, point));
  const fourthResidual = residuals[3];

  if (!fourthResidual || fourthResidual.n === 0n) throw new Error('The fourth rounded point must miss the circle forced by the first three.');

  const matrix = tensorMatrix(square.circle);
  const evaluations = square.points.map(point => evaluateTensor(matrix, point));
  const spatialBlock = matrix.slice(1).map(row => row.slice(1));
  const collinearPoints = [coordinate(0n, 0n), coordinate(1n, 0n), coordinate(2n, 0n)];
  const noncyclicPoints = [coordinate(0n, 0n), coordinate(1n, 0n), coordinate(0n, 1n), coordinate(2n, 2n)];
  const collinear = { points: collinearPoints, plot: collinearPoints.map(toPoint), circle: circleThrough(collinearPoints) };
  const noncyclic = { points: noncyclicPoints, plot: noncyclicPoints.map(toPoint), circle: circleThrough(noncyclicPoints) };

  if (collinear.circle || noncyclic.circle || evaluations.some(value => value.n !== 0n)) throw new Error('The live exact-circle checks must agree before drawing.');

  return {
    triangle, square, isosceles, kite: { ...kiteBase, sideSquares }, collinear, noncyclic,
    simplex: simplexModel(), polygon: polygonModel(),
    rounding: { points: exactPoints, plot: exactPoints.map(toPoint), roundedPoints, roundedPlot: roundedPoints.map(toPoint), exactCircle, roundedCircle, firstThreeCircle, residuals, fourthResidual },
    tensor: { matrix, evaluations, spatialBlock },
  };
}

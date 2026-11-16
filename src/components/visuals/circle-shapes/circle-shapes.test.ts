import { expect, test } from 'bun:test';
import { buildCircleModel, circleResidual, circleThrough, evaluateTensor, rational, rationalNumber, rationalText, tensorMatrix, type ExactPoint, type Rational } from './math';

function equalFraction(value: Rational, numerator: bigint, denominator = 1n): void {
  expect(value.n * denominator).toBe(numerator * value.d);
  expect(value.d > 0n).toBe(true);
}

function determinant(matrix: readonly (readonly bigint[])[]): bigint {
  const columns: number[] = [];
  let total = 0n;

  function choose(row: number): void {
    if (row === matrix.length) {
      let product = 1n;
      let inversions = 0;

      for (const [i, column] of columns.entries()) {
        const value = matrix[i]?.[column];

        if (value === undefined) throw new Error('The independent determinant needs a square integer matrix.');

        product *= value;

        for (let j = i + 1; j < columns.length; j++) {
          const next = columns[j];

          if (next === undefined) throw new Error('Each determinant permutation needs its next column.');
          if (column > next) inversions++;
        }
      }

      total += inversions % 2 === 0 ? product : -product;

      return;
    }

    for (let column = 0; column < matrix.length; column++) {
      if (columns.includes(column)) continue;

      columns.push(column);
      choose(row + 1);
      columns.pop();
    }
  }

  choose(0);

  return total;
}

function integerCoordinates(points: readonly ExactPoint[]): readonly (readonly [bigint, bigint])[] {
  let denominator = 1n;

  for (const point of points) {
    for (const value of point) denominator *= value.d;
  }

  return points.map(([x, y]) => [x.n * (denominator / x.d), y.n * (denominator / y.d)]);
}

function circleDeterminant(points: readonly ExactPoint[]): bigint {
  if (points.length !== 4) throw new Error('The independent concyclicity test uses exactly four points.');

  return determinant(integerCoordinates(points).map(([x, y]) => [x * x + y * y, x, y, 1n]));
}

function translatedCircle(dx: bigint, dy: bigint, scale: bigint): ExactPoint[] {
  const base: readonly (readonly [bigint, bigint])[] = [[5n, 0n], [3n, 4n], [-3n, 4n], [-3n, -4n]];

  return base.map(([x, y]) => [rational(dx * 5n + scale * x, 5n), rational(dy * 5n + scale * y, 5n)]);
}

test('172: exact circles agree with an independent concyclicity determinant, including a genuine rounded four-point failure', () => {
  const model = buildCircleModel();
  equalFraction(model.triangle.circle.centre[0], 2n);
  equalFraction(model.triangle.circle.centre[1], 3n, 2n);
  equalFraction(model.triangle.circle.radiusSquared, 25n, 4n);
  equalFraction(model.square.circle.centre[0], 1n, 2n);
  equalFraction(model.square.circle.centre[1], 1n, 2n);
  equalFraction(model.square.circle.radiusSquared, 1n, 2n);
  equalFraction(model.isosceles.circle.centre[0], 1n);
  equalFraction(model.isosceles.circle.centre[1], 4n, 3n);
  equalFraction(model.isosceles.circle.radiusSquared, 25n, 9n);
  expect(model.kite.sideSquares.map(rationalText)).toEqual(['4/5', '16/5', '16/5', '4/5']);

  for (const sample of [model.triangle, model.square, model.isosceles, model.kite]) {
    for (const [index, point] of sample.points.entries()) {
      equalFraction(circleResidual(sample.circle, point), 0n);
      const plotted = sample.plot[index];

      if (!plotted) throw new Error('Every exact cyclic point must have its display coordinate.');

      expect(plotted.x ** 2 + plotted.y ** 2).toBeCloseTo(1, 13);
    }
  }

  for (const dx of [-3n, 0n, 5n]) {
    for (const dy of [-2n, 4n]) {
      for (const scale of [1n, 3n]) {
        const points = translatedCircle(dx, dy, scale);
        expect(circleDeterminant(points)).toBe(0n);
        const circle = circleThrough(points);

        if (!circle) throw new Error('A translated rational circle must still fit exactly.');

        equalFraction(circle.centre[0], dx);
        equalFraction(circle.centre[1], dy);
        equalFraction(circle.radiusSquared, scale * scale);
      }
    }
  }

  expect(model.collinear.circle).toBeNull();
  expect(model.noncyclic.circle).toBeNull();
  expect(circleDeterminant(model.noncyclic.points)).not.toBe(0n);
  expect(circleDeterminant(model.rounding.points)).toBe(0n);
  expect(circleDeterminant(model.rounding.roundedPoints)).not.toBe(0n);
  const firstThree = integerCoordinates(model.rounding.roundedPoints.slice(0, 3));
  expect(determinant(firstThree.map(([x, y]) => [x, y, 1n]))).not.toBe(0n);
  expect(model.rounding.roundedCircle).toBeNull();
  expect(model.rounding.residuals.slice(0, 3).every(value => value.n === 0n)).toBe(true);
  expect(model.rounding.fourthResidual.n).not.toBe(0n);
  expect(model.rounding.roundedPoints.map(point => point.map(rationalText))).toEqual([['1', '0'], ['19/50', '23/25'], ['19/50', '-23/25'], ['-19/50', '23/25']]);
  expect(() => rational(1n, 0n)).toThrow();
  expect(() => circleThrough(model.triangle.points.slice(0, 2))).toThrow();
});

test('172: every one of the 81 simplex colourings supplies an actual unit pair, and all 12 rotations preserve the rectangle’s parent polygon', () => {
  const model = buildCircleModel();
  const simplex = model.simplex;
  expect(simplex.vertices).toHaveLength(4);
  expect(simplex.pairs).toHaveLength(6);
  expect(simplex.trials).toHaveLength(81);
  expect(new Set(simplex.trials.map(trial => trial.inks.join(','))).size).toBe(81);

  for (const pair of simplex.pairs) {
    const a = simplex.vertices[pair.a];
    const b = simplex.vertices[pair.b];

    if (!a || !b) throw new Error('A simplex edge must join actual four-dimensional vertices.');

    let distance = 0;

    for (let axis = 0; axis < 4; axis++) {
      const x = a[axis];
      const y = b[axis];

      if (x === undefined || y === undefined) throw new Error('Each simplex vertex must have all four coordinates.');

      distance += (x - y) ** 2;
    }

    expect(distance).toBeCloseTo(1, 14);
    equalFraction(pair.squaredDistance, 1n);
  }

  for (const trial of simplex.trials) {
    const oracle: (readonly [number, number])[] = [];

    for (let a = 0; a < 4; a++) {
      for (let b = a + 1; b < 4; b++) {
        if (trial.inks[a] === trial.inks[b]) oracle.push([a, b]);
      }
    }

    expect(trial.inks.every(ink => ink >= 0 && ink < 3)).toBe(true);
    expect(trial.sameInkPairs).toEqual(oracle);
    expect(oracle.length).toBeGreaterThan(0);
  }

  expect(new Set(simplex.representativeTrial.inks).size).toBe(3);
  expect(simplex.representativeTrial.sameInkPairs).toHaveLength(1);
  expect(simplex.trials.includes(simplex.representativeTrial)).toBe(true);
  expect(model.polygon.rotations).toHaveLength(12);
  const orbit = new Set<number>();

  for (const rotation of model.polygon.rotations) {
    expect(rotation.error).toBeLessThan(1e-12);
    expect(rotation.permutation).toEqual(Array.from({ length: 12 }, (_, index) => (index + rotation.steps) % 12));
    const image = rotation.permutation[0];

    if (image === undefined) throw new Error('Each rotation must move the first vertex somewhere.');

    orbit.add(image);
  }

  expect(orbit.size).toBe(12);
  expect(model.polygon.squaredDistances[0]).toBeCloseTo(2 - Math.sqrt(3), 13);
  expect(model.polygon.squaredDistances[1]).toBeCloseTo(2 + Math.sqrt(3), 13);
  expect(model.polygon.squaredDistances[2]).toBeCloseTo(4, 13);

  for (let index = 0; index < 4; index++) {
    const point = model.polygon.rectangle[index];
    const previous = model.polygon.rectangle[(index + 3) % 4];
    const next = model.polygon.rectangle[(index + 1) % 4];

    if (!point || !previous || !next) throw new Error('The extracted rectangle needs four cyclic vertices.');

    expect((previous.x - point.x) * (next.x - point.x) + (previous.y - point.y) * (next.y - point.y)).toBeCloseTo(0, 13);
  }
});

test('172: the rational matrix gives the same sphere residual before ordinary Q multiplication, without testing the general classification', () => {
  const model = buildCircleModel();
  expect(model.tensor.matrix.map(row => row.map(rationalText))).toEqual([['0', '-1/2', '-1/2'], ['-1/2', '1', '0'], ['-1/2', '0', '1']]);
  expect(model.tensor.spatialBlock.map(row => row.map(rationalText))).toEqual([['1', '0'], ['0', '1']]);
  expect(model.tensor.evaluations.every(value => value.n === 0n)).toBe(true);

  for (const dx of [-2n, 3n]) {
    const points = translatedCircle(dx, 4n, 3n);
    const circle = circleThrough(points);

    if (!circle) throw new Error('The independent matrix probes need their exact sphere.');

    const matrix = tensorMatrix(circle);

    for (const point of points) equalFraction(evaluateTensor(matrix, point), 0n);

    for (const [x, y] of [[0n, 0n], [1n, 2n], [-3n, 5n]] as const) {
      const point: ExactPoint = [rational(x), rational(y)];
      equalFraction(evaluateTensor(matrix, point), (x - dx) ** 2n + (y - 4n) ** 2n - 9n);
    }
  }

  expect(rationalNumber(model.rounding.fourthResidual)).not.toBe(0);
  const squareCorner = model.square.points[0];

  if (!squareCorner) throw new Error('The malformed-matrix test needs a computed square corner.');

  expect(() => evaluateTensor([[rational(1n)]], squareCorner)).toThrow();
});

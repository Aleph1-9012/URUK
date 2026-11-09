export type Point = { x: number; y: number };

export type Complex = { re: number; im: number };

export type Matrix2 = readonly [Complex, Complex, Complex, Complex];

export type Vector2 = readonly [Complex, Complex];

export function complex(re: number, im = 0): Complex {
  return { re, im };
}

export function add(left: Complex, right: Complex): Complex {
  return { re: left.re + right.re, im: left.im + right.im };
}

export function subtract(left: Complex, right: Complex): Complex {
  return { re: left.re - right.re, im: left.im - right.im };
}

export function multiply(left: Complex, right: Complex): Complex {
  return { re: left.re * right.re - left.im * right.im, im: left.re * right.im + left.im * right.re };
}

export function divide(left: Complex, right: Complex): Complex {
  const square = right.re ** 2 + right.im ** 2;

  return { re: (left.re * right.re + left.im * right.im) / square, im: (left.im * right.re - left.re * right.im) / square };
}

export function conjugate(value: Complex): Complex {
  return { re: value.re, im: -value.im };
}

export function absolute(value: Complex): number {
  return Math.hypot(value.re, value.im);
}

export function realMatrix(a: number, b: number, c: number, d: number): Matrix2 {
  return [complex(a), complex(b), complex(c), complex(d)];
}

export function realEntries(matrix: Matrix2): readonly [number, number, number, number] {
  return [matrix[0].re, matrix[1].re, matrix[2].re, matrix[3].re];
}

export const D = realMatrix(1.5, 0, 0, .6);

export const A = realMatrix(0, 2, 0, 0);

export const E = realMatrix(1, 2, 0, -1);

export const IDENTITY = realMatrix(1, 0, 0, 1);

export const SWAP = realMatrix(0, 1, 1, 0);

export const UPPER = realMatrix(0, 1, 0, 0);

export const LOWER = realMatrix(0, 0, 1, 0);

export const U0 = Math.asinh(1);

export function applyMatrix(matrix: Matrix2, vector: Vector2): Vector2 {
  return [
    add(multiply(matrix[0], vector[0]), multiply(matrix[1], vector[1])),
    add(multiply(matrix[2], vector[0]), multiply(matrix[3], vector[1])),
  ];
}

export function applyRealMatrix(matrix: Matrix2, vector: Point): Point {
  const result = applyMatrix(matrix, [complex(vector.x), complex(vector.y)]);

  return { x: result[0].re, y: result[1].re };
}

export function multiplyMatrix(left: Matrix2, right: Matrix2): Matrix2 {
  return [
    add(multiply(left[0], right[0]), multiply(left[1], right[2])),
    add(multiply(left[0], right[1]), multiply(left[1], right[3])),
    add(multiply(left[2], right[0]), multiply(left[3], right[2])),
    add(multiply(left[2], right[1]), multiply(left[3], right[3])),
  ];
}

export function adjoint(matrix: Matrix2): Matrix2 {
  return [conjugate(matrix[0]), conjugate(matrix[2]), conjugate(matrix[1]), conjugate(matrix[3])];
}

function topHermitian(a: number, d: number, off: Complex): { value: number; vector: Vector2 } {
  const value = (a + d) / 2 + Math.hypot((a - d) / 2, absolute(off));
  const second = value - a;
  const norm = Math.hypot(absolute(off), second);

  if (norm < 1e-14) {
    return { value, vector: a >= d ? [complex(1), complex(0)] : [complex(0), complex(1)] };
  }

  return { value, vector: [complex(off.re / norm, off.im / norm), complex(second / norm)] };
}

export function topSingularPair(matrix: Matrix2): { input: Vector2; output: Vector2; norm: number } {
  const gram = multiplyMatrix(adjoint(matrix), matrix);
  const top = topHermitian(gram[0].re, gram[3].re, gram[1]);
  const norm = Math.sqrt(Math.max(0, top.value));
  const image = applyMatrix(matrix, top.vector);
  const output: Vector2 = norm > 0
    ? [complex(image[0].re / norm, image[0].im / norm), complex(image[1].re / norm, image[1].im / norm)]
    : [complex(1), complex(0)];

  return { input: top.vector, output, norm };
}

export function topSingularPairReal(matrix: Matrix2): { input: Point; output: Point; norm: number } {
  const pair = topSingularPair(matrix);

  return { input: { x: pair.input[0].re, y: pair.input[1].re }, output: { x: pair.output[0].re, y: pair.output[1].re }, norm: pair.norm };
}

export function operatorNorm(matrix: Matrix2): number {
  return topSingularPair(matrix).norm;
}

export function numericalValue(vector: Vector2, matrix: Matrix2): Complex {
  const image = applyMatrix(matrix, vector);

  return add(multiply(conjugate(vector[0]), image[0]), multiply(conjugate(vector[1]), image[1]));
}

// The top eigenvector of Re(e^{-i angle} A) gives a support point of W(A).
// This computes the region from A, including degenerate point/segment cases.
export function numericalRangeBoundary(matrix: Matrix2, count = 240): Point[] {
  const points: Point[] = [];

  for (let index = 0; index < count; index++) {
    const angle = index / count * Math.PI * 2;
    const phase = complex(Math.cos(angle), -Math.sin(angle));
    const upper = multiply(phase, matrix[1]);
    const lower = conjugate(multiply(phase, matrix[2]));
    const off = complex((upper.re + lower.re) / 2, (upper.im + lower.im) / 2);
    const top = topHermitian(multiply(phase, matrix[0]).re, multiply(phase, matrix[3]).re, off);
    const value = numericalValue(top.vector, matrix);
    points.push({ x: value.re, y: value.im });
  }

  return points;
}

export function numericalRadius(matrix: Matrix2): number {
  let radius = 0;

  for (const point of numericalRangeBoundary(matrix)) radius = Math.max(radius, Math.hypot(point.x, point.y));

  return radius;
}

export function openingMatrix(amount: number): Matrix2 {
  return realMatrix(1.5 * (1 - amount), 2 * amount, 0, .6 * (1 - amount));
}

export function ellipseMatrix(amount: number): Matrix2 {
  return realMatrix(amount, 2, 0, -amount);
}

function smooth(time: number, start: number, end: number): number {
  const amount = Math.min(1, Math.max(0, (time - start) / (end - start)));

  return amount * amount * (3 - 2 * amount);
}

export function ellipseParameter(time: number): number {
  return smooth(time, 89500, 92000);
}

export function matrixAt(time: number): Matrix2 {
  return time < 15000 ? openingMatrix(smooth(time, 7000, 15000)) : ellipseMatrix(ellipseParameter(time));
}

export function sweepVector(theta: number, phase: number): Vector2 {
  return [complex(Math.cos(theta)), complex(Math.cos(phase) * Math.sin(theta), Math.sin(phase) * Math.sin(theta))];
}

export function sweepAt(time: number): { theta: number; phi: number; amount: number } {
  const amount = Math.min(1, Math.max(0, (time - 22500) / 7500));

  return { theta: amount * Math.PI / 2, phi: amount * Math.PI * 48, amount };
}

export function sweepMark(amount: number): Point {
  const value = numericalValue(sweepVector(amount * Math.PI / 2, amount * Math.PI * 48), A);

  return { x: value.re, y: value.im };
}

export function confocalPoint(u: number, angle: number): Point {
  return { x: Math.cosh(u) * Math.cos(angle), y: Math.sinh(u) * Math.sin(angle) };
}

export function resolvent(u: number, angle: number): Matrix2 {
  const point = confocalPoint(u, angle);
  const h = complex(point.x, point.y);
  const derivative = complex(Math.sinh(u) * Math.cos(angle), Math.cosh(u) * Math.sin(angle));
  const first = subtract(h, complex(1));
  const second = add(h, complex(1));

  return [divide(derivative, first), divide(complex(2 * derivative.re, 2 * derivative.im), multiply(first, second)), complex(0), divide(derivative, second)];
}

export function positivityAt(u: number, angle: number): number {
  const r = resolvent(u, angle);

  return r[0].re + r[3].re - Math.hypot(r[0].re - r[3].re, absolute(r[1]));
}

export function domainU(time: number): number {
  return U0 + .4 * (1 - smooth(time, 99000, 103400));
}

export function bandData(u: number, count = 180): { angle: number; value: number }[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = index / count * Math.PI * 2;

    return { angle, value: positivityAt(u, angle) };
  });
}

export const BLOCK_SWAP = [
  [0, 0, 0, 2],
  [0, 0, 2, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
] as const;

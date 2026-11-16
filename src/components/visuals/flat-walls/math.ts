import { CIRCLE_RADIUS, CONE_BLOCKS, FINITE_DIFFERENCE_STEP, FLAT_WALL_INPUTS, ODE_ABSCISSA } from './data';

export type Point = { readonly x: number; readonly y: number };

export type Vector4 = readonly [number, number, number, number];

export type Vector8 = readonly [number, number, number, number, number, number, number, number];

export type ScalarField = (point: Point) => number;

export function profile(s: number): number {
  return Math.tanh(s / Math.SQRT2);
}

export function profilePrime(s: number): number {
  const value = profile(s);

  return (1 - value * value) / Math.SQRT2;
}

export function profileSecond(s: number): number {
  const value = profile(s);

  return -value * (1 - value * value);
}

export function direction(theta: number): Point {
  return { x: Math.cos(theta), y: Math.sin(theta) };
}

export function flatValue(point: Point, e: Point, offset: number): number {
  return profile(e.x * point.x + e.y * point.y - offset);
}

export function flatGradient(point: Point, e: Point, offset: number): Point {
  const derivative = profilePrime(e.x * point.x + e.y * point.y - offset);

  return { x: e.x * derivative, y: e.y * derivative };
}

export function flatLaplacian(point: Point, e: Point, offset: number): number {
  const second = profileSecond(e.x * point.x + e.y * point.y - offset);

  return second * (e.x * e.x + e.y * e.y);
}

export function laplacianResidual(field: ScalarField, point: Point, h: number = FINITE_DIFFERENCE_STEP): number {
  if (!(h > 0) || !Number.isFinite(h)) throw new RangeError('The finite-difference step must be finite and positive.');

  const value = field(point);
  const laplacian = (field({ x: point.x + h, y: point.y }) + field({ x: point.x - h, y: point.y }) + field({ x: point.x, y: point.y + h }) + field({ x: point.x, y: point.y - h }) - 4 * value) / (h * h);

  return laplacian - (value * value * value - value);
}

export function odeResidual(s: number, h: number = FINITE_DIFFERENCE_STEP): number {
  if (!(h > 0) || !Number.isFinite(h)) throw new RangeError('The finite-difference step must be finite and positive.');

  const value = profile(s);
  const second = (profile(s + h) - 2 * value + profile(s - h)) / (h * h);

  return second - (value * value * value - value);
}

export function circularValue(point: Point, radius: number = CIRCLE_RADIUS): number {
  if (!(radius > 0) || !Number.isFinite(radius)) throw new RangeError('The illustrative circle must have a finite positive radius.');

  return profile(Math.hypot(point.x, point.y) - radius);
}

export function circularAnalyticResidual(point: Point, radius: number = CIRCLE_RADIUS): number {
  const r = Math.hypot(point.x, point.y);

  if (!(r > 0) || !Number.isFinite(r)) throw new RangeError('The radial residual is defined only away from the nonsmooth origin.');

  return profilePrime(r - radius) / r;
}

export function circularResidual(point: Point, h: number = FINITE_DIFFERENCE_STEP, radius: number = CIRCLE_RADIUS): number {
  if (!(Math.hypot(point.x, point.y) > h)) throw new RangeError('The circular finite-difference stencil must remain away from the nonsmooth origin.');

  return laplacianResidual(sample => circularValue(sample, radius), point, h);
}

export function stippleDensity(value: number): number {
  return (1 - value) / 2;
}

function squaredNorm(values: readonly number[]): number {
  let total = 0;

  for (const value of values) {
    if (!Number.isFinite(value)) throw new RangeError('Each cone coordinate must be finite.');

    total += value * value;
  }

  return total;
}

export function coneNorms(point: Vector8) {
  const firstSquared = squaredNorm([point[0], point[1], point[2], point[3]]);
  const secondSquared = squaredNorm([point[4], point[5], point[6], point[7]]);

  return { rho1: Math.sqrt(firstSquared), rho2: Math.sqrt(secondSquared), equationResidual: firstSquared - secondSquared };
}

export function conePoint(a: Vector4, b: Vector4) {
  const normA = Math.sqrt(squaredNorm(a));
  const normB = Math.sqrt(squaredNorm(b));

  if (!(normA > 0 && normB > 0)) throw new RangeError('Both source blocks must have positive norm before cone normalization.');

  const scaleB = normA / normB;
  const point: Vector8 = [a[0], a[1], a[2], a[3], b[0] * scaleB, b[1] * scaleB, b[2] * scaleB, b[3] * scaleB];

  return { point, ...coneNorms(point), normA, normB, scaleB };
}

function computeFlatWallsModel() {
  const odeSamples = ODE_ABSCISSA.map(s => ({ s, value: profile(s), residual: odeResidual(s) }));
  let odeMaximum = 0;

  for (const row of odeSamples) odeMaximum = Math.max(odeMaximum, Math.abs(row.residual));

  const walls = FLAT_WALL_INPUTS.map(input => {
    const e = direction(input.theta);
    const samples = input.samples.map(([x, y]) => {
      const point = { x, y };

      return { point, value: flatValue(point, e, input.offset), residual: laplacianResidual(sample => flatValue(sample, e, input.offset), point) };
    });
    let maximumResidual = 0;

    for (const sample of samples) maximumResidual = Math.max(maximumResidual, Math.abs(sample.residual));

    return { theta: input.theta, angleDegrees: input.theta * 180 / Math.PI, offset: input.offset, e, samples, maximumResidual };
  });
  const circlePoint = { x: CIRCLE_RADIUS, y: 0 };
  const conePoints = CONE_BLOCKS.map(input => conePoint(input.a, input.b));

  return {
    profile: Array.from({ length: 161 }, (_, index) => {
      const s = -4 + index / 20;

      return { s, value: profile(s), first: profilePrime(s), second: profileSecond(s) };
    }),
    ode: { step: FINITE_DIFFERENCE_STEP, samples: odeSamples, maximumResidual: odeMaximum },
    walls,
    circle: { radius: CIRCLE_RADIUS, point: circlePoint, value: circularValue(circlePoint), finiteDifferenceResidual: circularResidual(circlePoint), analyticResidual: circularAnalyticResidual(circlePoint), wallResidualFormula: 1 / (CIRCLE_RADIUS * Math.SQRT2), nonsmoothOrigin: true },
    cone: { points: conePoints, projection: 'two block norms, not a literal plane slice' },
  };
}

export type FlatWallsModel = ReturnType<typeof computeFlatWallsModel>;

let cachedModel: FlatWallsModel | undefined;

export function buildFlatWallsModel(): FlatWallsModel {
  if (!cachedModel) cachedModel = computeFlatWallsModel();

  return cachedModel;
}

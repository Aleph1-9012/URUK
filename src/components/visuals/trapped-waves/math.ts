export const UNIT_SIDE = 201;

export const STRONG_SIDE = 31;

export const STRONG_STEP = .25;

export const STRONG_FRAMES = 161;

export type { WaveFrame } from './data';

export function besselValues(argument: number, count: number): Float64Array<ArrayBuffer> {
  if (argument === 0) {
    const values = new Float64Array(count);
    values[0] = 1;

    return values;
  }

  const top = count + Math.floor(argument) + 40;
  const work = new Float64Array(top + 2);
  work[top] = 1e-30;

  for (let order = top; order > 0; order--) {
    work[order - 1] = 2 * order / argument * (work[order] ?? 0) - (work[order + 1] ?? 0);

    if (Math.abs(work[order - 1] ?? 0) > 1e250) {
      for (let index = 0; index < work.length; index++) work[index] = (work[index] ?? 0) / 1e250;
    }
  }

  let norm = work[0] ?? 0;

  for (let order = 2; order < work.length; order += 2) norm += 2 * (work[order] ?? 0);

  const values = new Float64Array(count);

  for (let order = 0; order < count; order++) values[order] = (work[order] ?? 0) / norm;

  return values;
}

// This is an unrenormalized crop of the infinite-grid probability distribution.
export function freeWave(time: number, side = 31): Float32Array<ArrayBuffer> {
  const half = Math.floor(side / 2);
  const bessel = besselValues(2 * time, half + 1);
  const probability = new Float32Array(side * side);

  for (let y = 0; y < side; y++) {
    const py = (bessel[Math.abs(y - half)] ?? 0) ** 2;

    for (let x = 0; x < side; x++) probability[y * side + x] = py * (bessel[Math.abs(x - half)] ?? 0) ** 2;
  }

  return probability;
}

export function freeStandingWave(side = 31, k = 3, l = 5): { energy: number; density: Float32Array<ArrayBuffer> } {
  const density = new Float32Array(side * side);
  const factor = 2 / (side + 1);

  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const amplitude = factor * Math.sin(Math.PI * k * (x + 1) / (side + 1)) * Math.sin(Math.PI * l * (y + 1) / (side + 1));
      density[y * side + x] = amplitude * amplitude;
    }
  }

  return { energy: 2 * Math.cos(Math.PI * k / (side + 1)) + 2 * Math.cos(Math.PI * l / (side + 1)), density };
}

export function spectrumBounds(dimension: number, disorder: number): readonly [number, number] {
  return [-2 * dimension - disorder, 2 * dimension + disorder];
}

export function separationCost(ratio: number): number {
  return 2 * Math.PI / Math.log(ratio);
}

export function logProfile(radius: number, inner: number, outer: number): number {
  return Math.max(0, Math.min(1, Math.log(radius / inner) / Math.log(outer / inner)));
}

export function binaryApproximation(unitValue: number, digits: number): number {
  const bins = 2 ** digits;

  return Math.floor((unitValue + 1) / 2 * bins) / bins * 2 - 1;
}

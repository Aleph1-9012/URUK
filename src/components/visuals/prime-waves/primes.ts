// The primes up to 100, the count π(x), the smooth curve Li(x), and Riemann's exact formula that rebuilds π(x) from the zeros of ζ.
import type { Complex } from './zeta/lfunctions';

export const CHART_END = 100;

export function primesUpTo(limit: number): number[] {
  const composite = new Uint8Array(limit + 1);
  const primes: number[] = [];

  for (let n = 2; n <= limit; n += 1) {
    if (composite[n] === 1) continue;

    primes.push(n);

    for (let multiple = n * n; multiple <= limit; multiple += n) {
      composite[multiple] = 1;
    }
  }

  return primes;
}

export const PRIMES = primesUpTo(CHART_END);

// π(x): how many primes are at most x.
export function primeCount(x: number): number {
  let count = 0;

  for (const prime of PRIMES) {
    if (prime > x) break;

    count += 1;
  }

  return count;
}

const EULER_GAMMA = 0.5772156649015329;

// li(x) for real x > 1, by Ramanujan's series:
// γ + log log x + √x Σₙ (−1)ⁿ⁻¹ (log x)ⁿ / (n! 2ⁿ⁻¹) · Σ_{k ≤ (n−1)/2} 1/(2k + 1).
export function li(x: number): number {
  const log = Math.log(x);
  let sum = 0;
  // (log x)ⁿ / (n! 2ⁿ⁻¹), built one factor at a time from its value 2 at n = 0.
  let power = 2;
  let inner = 0;

  for (let n = 1; n <= 200; n += 1) {
    power *= log / (2 * n);

    if (n % 2 === 1) inner += 1 / n;

    const term = (n % 2 === 1 ? power : -power) * inner;
    sum += term;

    if (n > 2 * log && Math.abs(term) < 1e-18) break;
  }

  return EULER_GAMMA + Math.log(log) + Math.sqrt(x) * sum;
}

// The article's smooth curve: Li(x) = ∫₂ˣ dt / log t.
export function offsetLi(x: number): number {
  return li(x) - li(2);
}

const multiply = (a: Complex, b: Complex): Complex => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
const divide = (a: Complex, b: Complex): Complex => {
  const size = b.re * b.re + b.im * b.im;

  return { re: (a.re * b.re + a.im * b.im) / size, im: (a.im * b.re - a.re * b.im) / size };
};

// E₁(w) by its continued fraction (modified Lentz), for |w| of about 5 or more off the negative real axis.
function e1(w: Complex): Complex {
  const tiny = 1e-300;
  let b: Complex = { re: w.re + 1, im: w.im };
  let c: Complex = { re: 1 / tiny, im: 0 };
  let d = divide({ re: 1, im: 0 }, b);
  let h = d;

  for (let step = 1; step < 500; step += 1) {
    const a = -step * step;
    b = { re: b.re + 2, im: b.im };
    d = divide({ re: 1, im: 0 }, { re: a * d.re + b.re, im: a * d.im + b.im });
    c = { re: b.re + a * divide({ re: 1, im: 0 }, c).re, im: b.im + a * divide({ re: 1, im: 0 }, c).im };
    const change = multiply(c, d);
    h = multiply(h, change);

    if (Math.abs(change.re - 1) + Math.abs(change.im) < 1e-15) break;
  }

  const scale = Math.exp(-w.re);

  return multiply(h, { re: scale * Math.cos(-w.im), im: scale * Math.sin(-w.im) });
}

// li(y^ρ) as Riemann's formula reads it: Ei(ρ log y), continued from the upper or lower half-plane.
export function liPower(y: number, rho: Complex): Complex {
  const log = Math.log(y);
  const z = { re: rho.re * log, im: rho.im * log };
  const value = e1({ re: -z.re, im: -z.im });

  return { re: -value.re, im: -value.im + Math.PI * Math.sign(z.im) };
}

// ∫_y^∞ dt / (t (t² − 1) log t), with u = log t, by Simpson's rule.
export function tail(y: number): number {
  const start = Math.log(y);
  const end = start + 24;
  const steps = 600;
  const width = (end - start) / steps;
  let sum = 0;

  for (let step = 0; step <= steps; step += 1) {
    const u = start + step * width;
    const value = 1 / (Math.expm1(2 * u) * u);
    let weight = 2;

    if (step === 0 || step === steps) weight = 1;
    else if (step % 2 === 1) weight = 4;

    sum += weight * value;
  }

  return sum * width / 3;
}

// μ(n) for the few n that matter below 100 (x^{1/n} ≥ 2 needs n ≤ 6).
const MOBIUS = [0, 1, -1, -1, 0, -1, 1] as const;

export const ROOTS = MOBIUS.length - 1;

// Riemann's formula, π(x) = Σₙ μ(n)/n · J(x^{1/n}), with
// J(y) = li(y) − Σ_ρ li(y^ρ) − log 2 + tail(y): the smooth part, and the part each zero adds.
export function smoothPart(x: number): number {
  let sum = 0;

  for (let n = 1; n <= ROOTS; n += 1) {
    const y = x ** (1 / n);
    const mobius = MOBIUS[n] ?? 0;

    if (y < 2 || mobius === 0) continue;

    sum += mobius / n * (li(y) - Math.LN2 + tail(y));
  }

  return sum;
}

// The wave one pair of zeros β ± iγ adds to the count at x.
export function zeroWave(x: number, rho: Complex): number {
  let sum = 0;

  for (let n = 1; n <= ROOTS; n += 1) {
    const y = x ** (1 / n);
    const mobius = MOBIUS[n] ?? 0;

    if (y < 2 || mobius === 0) continue;

    sum -= mobius / n * 2 * liPower(y, rho).re;
  }

  return sum;
}

// The size of that wave: |2 y^ρ / (ρ log y)| at n = 1, about x^β, which the film draws as its envelope.
export function waveSize(x: number, rho: Complex): number {
  return 2 * x ** rho.re / (Math.hypot(rho.re, rho.im) * Math.log(x));
}

// Where the film samples the curve: evenly in log x, so the fastest wave gets several samples per turn even near 2.
export function sampleXs(count: number): Float64Array {
  const xs = new Float64Array(count);
  const start = Math.log(2);
  const end = Math.log(CHART_END);

  for (let index = 0; index < count; index += 1) {
    xs[index] = Math.exp(start + (end - start) * index / (count - 1));
  }

  return xs;
}

// Riemann's formula sampled for the film, so frames only look values up.
// `partial` holds, for k = 0 … zeros, the waves of the first k zeros summed, `count` values per k.
// `dial` holds the first zero's wave moved to each real part from `dialFrom` to `dialTo`, one row per step.
export type WaveTable = {
  xs: Float32Array<ArrayBuffer>;
  smooth: Float32Array<ArrayBuffer>;
  partial: Float32Array<ArrayBuffer>;
  zeros: number;
  dial: Float32Array<ArrayBuffer>;
  dialFrom: number;
  dialTo: number;
  dialRows: number;
};

export type DialPlan = { height: number; from: number; to: number; rows: number };

export function waveTable(heights: readonly number[], count: number, plan: DialPlan): WaveTable {
  const xs = sampleXs(count);
  const smooth = new Float32Array(count);
  const partial = new Float32Array((heights.length + 1) * count);
  const dial = new Float32Array(plan.rows * count);

  for (const [index, x] of xs.entries()) {
    smooth[index] = smoothPart(x);
  }

  for (const [zero, height] of heights.entries()) {
    for (const [index, x] of xs.entries()) {
      const before = partial[zero * count + index] ?? 0;
      partial[(zero + 1) * count + index] = before + zeroWave(x, { re: 0.5, im: height });
    }
  }

  for (let row = 0; row < plan.rows; row += 1) {
    const re = plan.from + (plan.to - plan.from) * row / (plan.rows - 1);

    for (const [index, x] of xs.entries()) {
      dial[row * count + index] = zeroWave(x, { re, im: plan.height });
    }
  }

  return { xs: Float32Array.from(xs), smooth, partial, zeros: heights.length, dial, dialFrom: plan.from, dialTo: plan.to, dialRows: plan.rows };
}

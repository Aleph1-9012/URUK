export type Complex = { re: number; im: number };

export type Butterfly = {
  upper: number;
  lower: number;
  twiddle: Complex;
  beforeUpper: Complex;
  beforeLower: Complex;
  product: Complex;
  afterUpper: Complex;
  afterLower: Complex;
};

export type FourierStage = { level: number; span: number; pairs: Butterfly[]; values: Complex[] };

export type FourierTrace = {
  n: number;
  layers: number;
  perLayer: number;
  butterflies: number;
  naiveProducts: number;
  input: Complex[];
  permutation: number[];
  columns: Complex[][];
  stages: FourierStage[];
  output: Complex[];
};

export type SavingFactor = { lnLnN: number; drop: number; factor: number };

export const FOURIER_CONSTANTS = { m: 10 ** 6, W: 2 ** 71, delta: 6871402692000000 } as const;

// Decimal provenance is checked independently in the archived Python audit.
// Runtime subtraction of this value from one would lose saving precision.
export const THETA_DECIMAL = '0.999999999999789356156995981891655835949630448742784988583936';

export const SAVING_EPSILON = -Math.log1p(-FOURIER_CONSTANTS.delta / (FOURIER_CONSTANTS.W * FOURIER_CONSTANTS.m)) / Math.log(FOURIER_CONSTANTS.m);

export const LOG2_LENGTHS = [10, 20, 64, 1024, 10 ** 6, 2 ** 30, 2 ** 60, 10 ** 100] as const;

function copy(value: Complex): Complex {
  return { re: value.re, im: value.im };
}

function multiply(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}

function reversedIndex(index: number, width: number): number {
  let reversed = 0;
  let rest = index;

  for (let bit = 0; bit < width; bit++) {
    reversed = 2 * reversed + rest % 2;
    rest = Math.floor(rest / 2);
  }

  return reversed;
}

export function sampleSignal(n: number): Complex[] {
  if (!Number.isInteger(n) || n < 1) throw new RangeError('The signal needs a positive integer length.');

  return Array.from({ length: n }, (_, index) => ({ re: (7 * index) % 5 - 2, im: (3 * index) % 4 - 1 }));
}

export function fftTrace(input: readonly Complex[]): FourierTrace {
  const n = input.length;
  const layers = Math.log2(n);

  if (n < 1 || !Number.isInteger(layers)) throw new RangeError('The radix-two trace needs a power-of-two signal length.');
  if (input.some(value => !Number.isFinite(value.re) || !Number.isFinite(value.im))) throw new RangeError('Every Fourier input must have finite real and imaginary parts.');

  const permutation = Array.from({ length: n }, (_, index) => reversedIndex(index, layers));
  const values = permutation.map(index => {
    const value = input[index];

    if (!value) throw new Error('Each bit-reversed rail needs its original input value.');

    return copy(value);
  });
  const columns = [values.map(copy)];
  const stages: FourierStage[] = [];
  let butterflies = 0;

  for (let level = 0; level < layers; level++) {
    const span = 2 ** (level + 1);
    const half = span / 2;
    const pairs: Butterfly[] = [];

    for (let block = 0; block < n; block += span) {
      for (let offset = 0; offset < half; offset++) {
        const upper = block + offset;
        const lower = upper + half;
        const beforeUpper = values[upper];
        const beforeLower = values[lower];

        if (!beforeUpper || !beforeLower) throw new Error('Each butterfly needs its two incoming rail values.');

        // The article uses zeta_n = exp(+2*pi*i/n), without normalization.
        const angle = 2 * Math.PI * offset / span;
        const twiddle = { re: Math.cos(angle), im: Math.sin(angle) };
        const product = multiply(twiddle, beforeLower);
        const afterUpper = { re: beforeUpper.re + product.re, im: beforeUpper.im + product.im };
        const afterLower = { re: beforeUpper.re - product.re, im: beforeUpper.im - product.im };
        values[upper] = afterUpper;
        values[lower] = afterLower;
        pairs.push({ upper, lower, twiddle, beforeUpper, beforeLower, product, afterUpper, afterLower });
        butterflies++;
      }
    }

    const snapshot = values.map(copy);
    stages.push({ level, span, pairs, values: snapshot });
    columns.push(snapshot);
  }

  return { n, layers, perLayer: n === 1 ? 0 : n / 2, butterflies, naiveProducts: n * n, input: input.map(copy), permutation, columns, stages, output: values.map(copy) };
}

export function savingAtLnLn(lnLnN: number): SavingFactor {
  if (!Number.isFinite(lnLnN)) throw new RangeError('The saving factor needs a finite log-log length.');

  const exponent = -SAVING_EPSILON * lnLnN;

  return { lnLnN, drop: -Math.expm1(exponent), factor: Math.exp(exponent) };
}

export function savingAtLog2(log2N: number): SavingFactor {
  if (!(log2N > 0) || !Number.isFinite(log2N)) throw new RangeError('The saving factor needs a finite positive base-two logarithm of the length.');

  return savingAtLnLn(Math.log(log2N) + Math.log(Math.LN2));
}

export function buildFourierModel() {
  const all = [2, 4, 8, 16, 32, 64, 128, 256].map(n => fftTrace(sampleSignal(n)));
  const traces = all.filter(trace => trace.n === 8 || trace.n === 16 || trace.n === 32);
  const counts = all.map(({ n, layers, perLayer, butterflies, naiveProducts }) => ({ n, layers, perLayer, butterflies, naiveProducts }));

  return {
    traces,
    counts,
    epsilon: SAVING_EPSILON,
    thetaDecimal: THETA_DECIMAL,
    factorRows: LOG2_LENGTHS.map(log2N => ({ log2N, ...savingAtLog2(log2N) })),
    halfAtLnLnN: Math.LN2 / SAVING_EPSILON,
  };
}

export type FourierModel = ReturnType<typeof buildFourierModel>;

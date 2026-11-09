// Scaled-integer arithmetic preserves the misses that are too small for double-precision π.
export const PI_DIGITS = 300;

function arctangentReciprocal(divisor: bigint, scale: bigint): bigint {
  const square = divisor * divisor;
  let power = scale / divisor;
  let denominator = 1n;
  let sign = 1n;
  let total = 0n;

  while (power > 0n) {
    total += sign * (power / denominator);
    power /= square;
    denominator += 2n;
    sign = -sign;
  }

  return total;
}

export function scaledPi(digits: number): bigint {
  // Twenty guard digits absorb integer-division losses before the final truncation.
  const guard = 10n ** 20n;
  const scale = 10n ** BigInt(digits) * guard;
  const machin = 16n * arctangentReciprocal(5n, scale) - 4n * arctangentReciprocal(239n, scale);

  return machin / guard;
}

export const PI_SCALE = 10n ** BigInt(PI_DIGITS);

export const PI_SCALED = scaledPi(PI_DIGITS);

export function continuedFraction(value: bigint, scale: bigint, count: number): bigint[] {
  const coefficients: bigint[] = [];
  let numerator = value;
  let denominator = scale;

  while (coefficients.length < count && denominator !== 0n) {
    coefficients.push(numerator / denominator);
    [numerator, denominator] = [denominator, numerator % denominator];
  }

  return coefficients;
}

export type Convergent = {
  numerator: bigint;
  denominator: bigint;
  error: number;
  exponent: number;
  logQ: number;
  halfStepRatio: number;
};

function convergents(): Convergent[] {
  const points: Convergent[] = [];
  let previousNumerator = 1n;
  let previousDenominator = 0n;
  let earlierNumerator = 0n;
  let earlierDenominator = 1n;

  for (const coefficient of continuedFraction(PI_SCALED, PI_SCALE, 23)) {
    const numerator = coefficient * previousNumerator + earlierNumerator;
    const denominator = coefficient * previousDenominator + earlierDenominator;
    earlierNumerator = previousNumerator;
    earlierDenominator = previousDenominator;
    previousNumerator = numerator;
    previousDenominator = denominator;

    // The first convergent is 3/1; log(1) cannot define its achieved exponent.
    if (denominator === 1n) continue;

    const residual = PI_SCALED * denominator - numerator * PI_SCALE;
    const absoluteResidual = residual < 0n ? -residual : residual;
    const q = Number(denominator);
    // Subtract while exact, then divide separately: Number(PI_SCALE * q) would overflow.
    const error = Number(absoluteResidual) / Number(PI_SCALE) / q;
    const logQ = Math.log10(q);

    points.push({
      numerator,
      denominator,
      error,
      exponent: -Math.log10(error) / logQ,
      logQ,
      halfStepRatio: 1 / (2 * q * error),
    });
  }

  return points;
}

export const CONVERGENTS = convergents();

// Rounded records quoted in the article, not inputs to the claimed proof.
export const CEILINGS = [
  { year: 1953, value: 42, name: 'Mahler' },
  { year: 1974, value: 20, name: 'Mignotte' },
  { year: 1993, value: 8.016, name: 'Hata' },
  { year: 2008, value: 7.606, name: 'Salikhov' },
  { year: 2020, value: 7.103, name: 'Zeilberger–Zudilin' },
] as const;

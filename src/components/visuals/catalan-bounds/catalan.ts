// Exact partial sums for the opening walk, and the printed bounds from the paper.
// The determinant diagrams use the bounds; they do not compute determinants.

function catalanValue(): number {
  // Euler's transform: G = Σ Δ^k a₀ / 2^(k+1), aⱼ = 1/(2j+1)².
  // Here Δ^k a₀ = ∏_{j=1}^k 2j/(2j+1) · Σ_{j=0}^k 1/(2j+1).
  // This positive recurrence avoids subtracting nearly equal differences.
  let product = 1;
  let oddReciprocals = 1;
  let weight = 0.5;
  let total = 0;

  for (let index = 0; index < 64; index += 1) {
    total += weight * product * oddReciprocals;
    const next = index + 1;
    product *= 2 * next / (2 * next + 1);
    oddReciprocals += 1 / (2 * next + 1);
    weight /= 2;
  }

  return total;
}

export const CATALAN = catalanValue();

export type PartialSum = {
  numerator: bigint;
  denominator: bigint;
  value: number;
  error: number;
  clearedError: number;
};

function gcd(first: bigint, second: bigint): bigint {
  let a = first < 0n ? -first : first;
  let b = second < 0n ? -second : second;

  while (b !== 0n) {
    [a, b] = [b, a % b];
  }

  return a;
}

export function partialSums(count: number): PartialSum[] {
  const sums: PartialSum[] = [];
  let numerator = 0n;
  let denominator = 1n;

  for (let index = 0; index < count; index += 1) {
    const odd = BigInt(2 * index + 1);
    const square = odd * odd;
    const sign = index % 2 === 0 ? 1n : -1n;
    numerator = numerator * square + sign * denominator;
    denominator *= square;
    const divisor = gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;
    const value = Number(numerator) / Number(denominator);
    const error = Math.abs(CATALAN - value);

    sums.push({ numerator, denominator, value, error, clearedError: error * Number(denominator) });
  }

  return sums;
}

export const SUMS = partialSums(24);

// Only these first six sums have the increasing cleared errors shown in the film.
// Later partial sums need not have a larger cleared error than their predecessor.
export const EXAMPLES = SUMS.slice(0, 6);

export const LOWER_BOUND = -2.29084;

export const UPPER_BOUND = -2.290939875;

export const BOUND_GAP = (-2290840000 - -2290939875) / 1_000_000_000;

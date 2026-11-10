import { FAMILY_EXAMPLES, LARGE_INTERVAL_COUNTS, LARGE_TALLIES } from './data';

export type Gate = { q: number; exponent: number; remainder: number; closed: boolean };

export type Orbit = {
  base: number;
  prime: number;
  residues: number[];
  order: number;
  index: number;
  primitive: boolean;
};

export type PrimeMark = { prime: number; primitive: boolean };

export type Tally = { limit: number; count: number; total: number; share: number };

export type IntervalCount = { x: number; count: number; total: number; share: number };

export type BigGate = { q: bigint; exponent: bigint; remainder: bigint; closed: boolean };

function requirePrime(prime: number): void {
  if (!Number.isSafeInteger(prime) || prime < 2 || prime > Math.sqrt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError('The number clock needs a prime below sqrt(MAX_SAFE_INTEGER).');
  }

  for (let divisor = 2; divisor * divisor <= prime; divisor++) {
    if (prime % divisor === 0) throw new RangeError('The clock modulus must be prime.');
  }
}

// The number path stays below sqrt(MAX_SAFE_INTEGER); larger gates use BigInt.
export function modPow(base: number, exponent: number, modulus: number): number {
  if (!Number.isSafeInteger(base) || !Number.isSafeInteger(exponent) || exponent < 0
    || !Number.isSafeInteger(modulus) || modulus < 2 || modulus > Math.sqrt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError('Exact number powers need integer inputs and a modulus below sqrt(MAX_SAFE_INTEGER).');
  }

  let value = (base % modulus + modulus) % modulus;
  let result = 1;

  while (exponent > 0) {
    if (exponent % 2 === 1) result = result * value % modulus;

    value = value * value % modulus;
    exponent = Math.floor(exponent / 2);
  }

  return result;
}

export function modPowBigInt(base: bigint, exponent: bigint, modulus: bigint): bigint {
  if (exponent < 0n || modulus < 2n) throw new RangeError('Modular powers need a nonnegative exponent and modulus at least two.');

  let value = (base % modulus + modulus) % modulus;
  let result = 1n;

  while (exponent > 0n) {
    if (exponent % 2n === 1n) result = result * value % modulus;

    value = value * value % modulus;
    exponent /= 2n;
  }

  return result;
}

export function primeFactors(value: number): number[] {
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError('Prime factors need a positive integer.');

  const factors: number[] = [];

  for (let divisor = 2; divisor * divisor <= value; divisor++) {
    if (value % divisor !== 0) continue;

    factors.push(divisor);

    while (value % divisor === 0) value /= divisor;
  }

  if (value > 1) factors.push(value);

  return factors;
}

export function orbit(base: number, prime: number): Orbit {
  requirePrime(prime);

  if (!Number.isSafeInteger(base) || base % prime === 0) throw new RangeError('A nonzero clock orbit needs an integer base coprime to its prime.');

  const multiplier = (base % prime + prime) % prime;
  const residues: number[] = [];
  let value = multiplier;

  do {
    residues.push(value);

    if (value === 1) break;

    value = value * multiplier % prime;
  } while (residues.length < prime);

  if (value !== 1) throw new Error('A nonzero orbit modulo a prime must return to one.');

  const order = residues.length;

  return { base, prime, residues, order, index: (prime - 1) / order, primitive: order === prime - 1 };
}

export function gates(base: number, prime: number): Gate[] {
  requirePrime(prime);

  if (!Number.isSafeInteger(base) || base % prime === 0) throw new RangeError('Index gates need an integer base coprime to its prime.');

  return primeFactors(prime - 1).map(q => {
    const exponent = (prime - 1) / q;
    const remainder = modPow(base, exponent, prime);

    return { q, exponent, remainder, closed: remainder === 1 };
  });
}

function sieve(limit: number): { primes: number[]; factors: Uint32Array } {
  if (!Number.isSafeInteger(limit) || limit < 2) throw new RangeError('The sieve needs an integer limit of at least two.');

  const factors = new Uint32Array(limit + 1);
  const primes: number[] = [];

  for (let value = 2; value <= limit; value++) {
    if (factors[value] === 0) {
      factors[value] = value;
      primes.push(value);
    }

    const least = factors[value];

    if (!least) throw new Error('Each visited sieve integer must have a smallest prime factor.');

    for (const q of primes) {
      if (q > least || q * value > limit) break;

      factors[q * value] = q;
    }
  }

  return { primes, factors };
}

export function primesUpTo(limit: number): number[] {
  return sieve(limit).primes;
}

function passesGates(base: number, prime: number, factors: Uint32Array): boolean {
  let value = prime - 1;

  while (value > 1) {
    const q = factors[value];

    if (!q) throw new Error('Every integer in the sieve has a smallest prime factor.');
    if (modPow(base, (prime - 1) / q, prime) === 1) return false;

    while (value % q === 0) value /= q;
  }

  return true;
}

function tally(marks: readonly PrimeMark[], limit: number): Tally {
  let total = 0;
  let count = 0;

  for (const mark of marks) {
    if (mark.prime > limit) break;

    total++;
    count += Number(mark.primitive);
  }

  return { limit, count, total, share: count / total };
}

function intervalCount(marks: readonly PrimeMark[], x: number): IntervalCount {
  let total = 0;
  let count = 0;

  for (const mark of marks) {
    if (mark.prime <= x) continue;
    if (mark.prime > 2 * x) break;

    total++;
    count += Number(mark.primitive);
  }

  return { x, count, total, share: count / total };
}

export function familyGates(prime: string, largeFactor: string): BigGate[] {
  const p = BigInt(prime);
  const Q = BigInt(largeFactor);

  if (p - 1n !== 2n * 11n * 13n * Q) throw new RangeError('The family example needs p − 1 = 2 · 11 · 13 · Q.');

  return [2n, 11n, 13n, Q].map(q => {
    const exponent = (p - 1n) / q;
    const remainder = modPowBigInt(2n, exponent, p);

    return { q, exponent, remainder, closed: remainder === 1n };
  });
}

export function createArtinModel() {
  const { primes, factors } = sieve(100_000);
  const marks: PrimeMark[] = [];

  for (const prime of primes) {
    if (prime !== 2) marks.push({ prime, primitive: passesGates(2, prime, factors) });
  }

  const strip = marks.slice(0, 300);
  const stripTallies = [10, 25, 50, 100, 200, 300].map(total => {
    let count = 0;

    for (let index = 0; index < total; index++) {
      const mark = strip[index];

      if (!mark) throw new Error('The strip tally needs one mark for each counted prime.');

      count += Number(mark.primitive);
    }

    return { primes: total, count, total, share: count / total };
  });
  const tallies = [1_000, 10_000, 100_000].map(limit => tally(marks, limit));

  for (const row of LARGE_TALLIES) tallies.push({ ...row, share: row.count / row.total });

  const intervals = [100, 1_000, 10_000].map(x => intervalCount(marks, x));

  for (const row of LARGE_INTERVAL_COUNTS) intervals.push({ ...row, share: row.count / row.total });

  const partials: { q: number; product: number }[] = [];
  let product = 1;

  for (const q of primes) {
    product *= 1 - 1 / (q * (q - 1));

    if (partials.length < 8) partials.push({ q, product });
  }

  const windowShares = [5, 7, 11, 13, 17, 19, 23, 29].map(q => ({ q, share: 1 / (q * (q - 1)) }));
  const tails = [30, 100, 1_000].map(from => {
    let share = 0;

    for (const q of primes) {
      if (q >= from) share += 1 / (q * (q - 1));
    }

    return { from, share };
  });

  return {
    strip, stripTallies, tallies, intervals, partials, product, productLimit: 100_000,
    windowShares, tails,
    family: {
      open: familyGates(FAMILY_EXAMPLES.open.prime, FAMILY_EXAMPLES.open.largeFactor),
      closed: familyGates(FAMILY_EXAMPLES.closed.prime, FAMILY_EXAMPLES.closed.largeFactor),
    },
  };
}

export type ArtinModel = ReturnType<typeof createArtinModel>;

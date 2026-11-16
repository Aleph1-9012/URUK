export type Histogram = {
  lambda: number;
  terms: number;
  words: number;
  counts: number[];
  occupied: number;
  occupiedFraction: number;
  radius: number;
  finiteRadius: number;
  tailRadius: number;
  relativeTail: number;
  maxCount: number;
};

export type GoldenPair = { a: number; b: number };

export type GoldenAtom = GoldenPair & { multiplicity: number };

export type GoldenRow = { n: number; words: number; maps: number; entropy: number; entropyPerStep: number };

export const TERM_COUNT = 14;

export const BIN_COUNT = 64;

export const GOLDEN_LAMBDA = (Math.sqrt(5) - 1) / 2;

export const LAMBDAS = Array.from({ length: 26 }, (_, index) => (40 + 2 * index) / 100);

function validate(lambda: number, terms: number, bins: number): void {
  if (!Number.isFinite(lambda) || lambda <= 0 || lambda >= 1) throw new RangeError('The contracting parameter must lie strictly between zero and one.');
  if (!Number.isInteger(terms) || terms < 0 || terms > 20) throw new RangeError('The finite sign law uses zero to twenty terms.');
  if (!Number.isInteger(bins) || bins < 1) throw new RangeError('The histogram needs a positive integer bin count.');
}

export function signSums(lambda: number, terms = TERM_COUNT): Float64Array {
  validate(lambda, terms, BIN_COUNT);
  const sums = new Float64Array(2 ** terms);
  let count = 1;

  for (let exponent = 1; exponent <= terms; exponent++) {
    const weight = lambda ** exponent;

    for (let index = 0; index < count; index++) {
      const before = sums[index];

      if (before === undefined) throw new Error('Every sign prefix needs its current sum.');

      sums[index] = before + weight;
      sums[index + count] = before - weight;
    }

    count *= 2;
  }

  return sums;
}

function binOf(value: number, radius: number, bins: number): number {
  return Math.max(0, Math.min(bins - 1, Math.floor((value + radius) / (2 * radius) * bins)));
}

function describeHistogram(lambda: number, terms: number, counts: number[]): Histogram {
  const radius = lambda / (1 - lambda);
  const relativeTail = lambda ** terms;
  let occupied = 0;
  let maxCount = 0;

  for (const count of counts) {
    if (count > 0) occupied++;

    maxCount = Math.max(maxCount, count);
  }

  return { lambda, terms, words: 2 ** terms, counts, occupied, occupiedFraction: occupied / counts.length, radius, finiteRadius: radius * (1 - relativeTail), tailRadius: radius * relativeTail, relativeTail, maxCount };
}

export function histogram(lambda: number, terms = TERM_COUNT, bins = BIN_COUNT): Histogram {
  validate(lambda, terms, bins);
  const radius = lambda / (1 - lambda);
  const counts = Array.from({ length: bins }, () => 0);

  for (const sum of signSums(lambda, terms)) {
    const index = binOf(sum, radius, bins);
    const count = counts[index];

    if (count === undefined) throw new Error('Every finite sum must fall into a declared bin.');

    counts[index] = count + 1;
  }

  return describeHistogram(lambda, terms, counts);
}

export function histogramPieces(lambda: number, terms = TERM_COUNT, bins = BIN_COUNT) {
  validate(lambda, terms, bins);

  if (terms === 0) throw new RangeError('Two contracting copies need at least one target term.');

  const radius = lambda / (1 - lambda);
  const negative = Array.from({ length: bins }, () => 0);
  const positive = Array.from({ length: bins }, () => 0);

  for (const sum of signSums(lambda, terms - 1)) {
    const lower = binOf(lambda * sum - lambda, radius, bins);
    const upper = binOf(lambda * sum + lambda, radius, bins);
    const beforeLower = negative[lower];
    const beforeUpper = positive[upper];

    if (beforeLower === undefined || beforeUpper === undefined) throw new Error('Each contracted copy must fall into the common target bins.');

    negative[lower] = beforeLower + 1;
    positive[upper] = beforeUpper + 1;
  }

  const counts = negative.map((count, index) => {
    const other = positive[index];

    if (other === undefined) throw new Error('Both copies must use the same bin grid.');

    return count + other;
  });

  return { sourceTerms: terms - 1, negative, positive, combined: describeHistogram(lambda, terms, counts) };
}

export function ingredients(lambda: number) {
  validate(lambda, 0, BIN_COUNT);
  const chi = -Math.log(lambda);

  return { chi, symbolEntropy: Math.LN2, conditionalDimension: Math.min(1, Math.LN2 / chi) };
}

export function goldenPairSign(a: number, b: number): -1 | 0 | 1 {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b)) throw new RangeError('Exact golden comparisons need safe integer coefficients.');

  // 2(a+b*lambda) = (2a-b)+b*sqrt(5). Squaring is used only
  // when the two terms have opposite signs, so no sign is discarded.
  const c = 2n * BigInt(a) - BigInt(b);
  const d = BigInt(b);

  if (d === 0n) return c === 0n ? 0 : c > 0n ? 1 : -1;
  if (c >= 0n && d > 0n) return 1;
  if (c <= 0n && d < 0n) return -1;

  const difference = c * c - 5n * d * d;

  return c > 0n ? difference > 0n ? 1 : -1 : difference > 0n ? -1 : 1;
}

function goldenBin(atom: GoldenPair, bins: number): number {
  // The map table uses T=sum(+/-lambda^k), k=0..n-1. The strip uses
  // S=lambda*T, and S/r=lambda^2*T, where r=lambda/(1-lambda).
  const a = 1 + atom.a - atom.b;
  const b = 2 * atom.b - atom.a;
  let index = Math.max(0, Math.min(bins - 1, Math.floor(bins / 2 * (a + b * GOLDEN_LAMBDA))));

  while (index > 0 && goldenPairSign(bins * a - 2 * index, bins * b) < 0) index--;
  while (index < bins - 1 && goldenPairSign(bins * a - 2 * (index + 1), bins * b) >= 0) index++;

  return index;
}

function goldenHistogram(atoms: Iterable<GoldenAtom>, terms: number, bins: number): Histogram {
  const counts = Array.from({ length: bins }, () => 0);

  for (const atom of atoms) {
    const index = goldenBin(atom, bins);
    const before = counts[index];

    if (before === undefined) throw new Error('Every exact golden atom needs a histogram bin.');

    counts[index] = before + atom.multiplicity;
  }

  return describeHistogram(GOLDEN_LAMBDA, terms, counts);
}

export function goldenModel(maxTerms = 20) {
  if (!Number.isInteger(maxTerms) || maxTerms < 1 || maxTerms > 20) throw new RangeError('The exact golden map table uses one to twenty terms.');

  const powers: GoldenPair[] = [{ a: 1, b: 0 }];

  for (let exponent = 1; exponent <= maxTerms; exponent++) {
    const previous = powers[exponent - 1];

    if (!previous) throw new Error('Each exact golden power needs the preceding pair.');

    powers.push({ a: previous.b, b: previous.a - previous.b });
  }

  let boundB = 0;

  for (let index = 0; index < maxTerms; index++) {
    const power = powers[index];

    if (!power) throw new Error('The map-key bound needs every golden power.');

    boundB += Math.abs(power.b);
  }

  // |b1-b2|<stride makes a*stride+b an injective integer-pair key.
  const stride = 2 * boundB + 1;
  let state = new Map<number, GoldenAtom>([[0, { a: 0, b: 0, multiplicity: 1 }]]);
  const rows: GoldenRow[] = [];
  let strip: Histogram | undefined;

  for (let n = 1; n <= maxTerms; n++) {
    const power = powers[n - 1];

    if (!power) throw new Error('Every map-composition step needs its exact golden power.');

    const next = new Map<number, GoldenAtom>();

    for (const atom of state.values()) {
      for (const sign of [1, -1]) {
        const a = atom.a + sign * power.a;
        const b = atom.b + sign * power.b;
        const key = a * stride + b;
        const existing = next.get(key);

        if (existing) existing.multiplicity += atom.multiplicity;
        else next.set(key, { a, b, multiplicity: atom.multiplicity });
      }
    }

    state = next;
    const words = 2 ** n;
    let weightedLog = 0;

    for (const atom of state.values()) weightedLog += atom.multiplicity * Math.log(atom.multiplicity);

    const entropy = Math.log(words) - weightedLog / words;
    rows.push({ n, words, maps: state.size, entropy, entropyPerStep: entropy / n });

    if (n === Math.min(TERM_COUNT, maxTerms)) strip = goldenHistogram(state.values(), n, BIN_COUNT);
  }

  if (!strip) throw new Error('The exact golden map construction must produce its finite histogram.');

  return { lambda: GOLDEN_LAMBDA, chi: -Math.log(GOLDEN_LAMBDA), powers, rows, histogram: strip };
}

export function buildOverlapModel() {
  return { golden: goldenModel(), ingredientRows: LAMBDAS.map(lambda => ({ lambda, ...ingredients(lambda) })) };
}

export type OverlapModel = ReturnType<typeof buildOverlapModel>;

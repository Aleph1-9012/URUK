export type Ink = 0 | 1;

export type SubsetTerm = {
  readonly mask: number;
  readonly indices: readonly number[];
  readonly values: readonly number[];
  readonly sum: number;
  readonly product: number;
};

export type Configuration = {
  readonly inputs: readonly number[];
  readonly terms: readonly SubsetTerm[];
  readonly sums: readonly number[];
  readonly products: readonly number[];
  readonly intersection: readonly number[];
  readonly union: readonly number[];
  readonly colour: Ink | null;
  readonly counts: { readonly sums: number; readonly products: number; readonly shared: number; readonly union: number };
};

export type SpacedConfiguration = Configuration & {
  readonly colour: Ink;
  readonly R: number;
  readonly D: number;
  readonly limit: number;
  readonly trials: number;
};

function positiveInteger(n: number): void {
  if (!Number.isSafeInteger(n) || n < 1) throw new RangeError('The colouring is defined on positive safe integers.');
}

function add(a: number, b: number): number {
  const value = a + b;

  if (!Number.isSafeInteger(value)) throw new RangeError('A displayed subset sum exceeds exact integer arithmetic.');

  return value;
}

function multiply(a: number, b: number): number {
  const value = a * b;

  if (!Number.isSafeInteger(value)) throw new RangeError('A displayed subset product exceeds exact integer arithmetic.');

  return value;
}

export function floorLog2(n: number): number {
  positiveInteger(n);
  let remaining = n;
  let exponent = -1;

  while (remaining >= 1) {
    remaining = Math.floor(remaining / 2);
    exponent++;
  }

  return exponent;
}

export function omega(n: number): number {
  positiveInteger(n);
  let remaining = n;
  let count = 0;

  for (let prime = 2; prime <= remaining / prime; prime += prime === 2 ? 1 : 2) {
    while (remaining % prime === 0) {
      remaining /= prime;
      count++;
    }
  }

  return count + Number(remaining > 1);
}

export function colour(n: number): Ink {
  return (Math.floor(floorLog2(n) / 2) + omega(n)) % 2 === 0 ? 0 : 1;
}

export function subsetTerms(inputs: readonly number[]): SubsetTerm[] {
  if (inputs.length > 12) throw new RangeError('The finite film calculator supports at most twelve inputs.');

  for (const [index, value] of inputs.entries()) {
    positiveInteger(value);
    const previous = inputs[index - 1];

    if (previous !== undefined && value <= previous) throw new RangeError('The finite-set inputs must be strictly increasing.');
  }

  const result: SubsetTerm[] = [];

  for (let mask = 1; mask < 2 ** inputs.length; mask++) {
    const indices: number[] = [];
    const values: number[] = [];
    let sum = 0;
    let product = 1;

    for (const [index, value] of inputs.entries()) {
      if (!(mask & (1 << index))) continue;

      indices.push(index);
      values.push(value);
      sum = add(sum, value);
      product = multiply(product, value);
    }

    result.push({ mask, indices, values, sum, product });
  }

  return result;
}

function sorted(values: Iterable<number>): number[] {
  return Array.from(new Set(values)).sort((a, b) => a - b);
}

export function configuration(inputs: readonly number[]): Configuration {
  const terms = subsetTerms(inputs);
  const sums = sorted(terms.map(term => term.sum));
  const products = sorted(terms.map(term => term.product));
  const productSet = new Set(products);
  const intersection: number[] = [];

  for (const value of sums) {
    if (productSet.has(value)) intersection.push(value);
  }

  const union = sorted([...sums, ...products]);
  const first = union[0];
  const common = first === undefined ? null : colour(first);
  const monochromatic = common !== null && union.every(value => colour(value) === common);

  return {
    inputs: Array.from(inputs), terms, sums, products, intersection, union,
    colour: monochromatic ? common : null,
    counts: { sums: sums.length, products: products.length, shared: intersection.length, union: union.length },
  };
}

export function separationThreshold(inputs: readonly number[], R = 2, D = 1): number {
  if (!Number.isSafeInteger(R) || R < 2 || !Number.isSafeInteger(D) || D < 1) throw new RangeError('The displayed exact spacing search uses integer R >= 2 and D >= 1.');

  if (!inputs.length) return R;

  let sum = 0;
  let product = 1;

  for (const value of inputs) {
    positiveInteger(value);
    sum = add(sum, value);
    product = multiply(product, value);
  }

  const threshold = R * add(sum, product) ** D;

  if (!Number.isSafeInteger(threshold)) throw new RangeError('The spacing threshold exceeds exact integer arithmetic.');

  return threshold;
}

export function searchSpaced(m: number, limit: number, R = 2, D = 1): SpacedConfiguration {
  if (!Number.isInteger(m) || m < 1 || m > 3) throw new RangeError('The drawn bounded search supports one through three inputs.');

  positiveInteger(limit);
  separationThreshold([], R, D);
  let trials = 0;

  function extend(prefix: readonly number[], target: Ink): Configuration | null {
    const lower = separationThreshold(prefix, R, D) + 1;

    for (let candidate = lower; candidate < limit; candidate++) {
      trials++;

      if (colour(candidate) !== target) continue;

      const next = configuration([...prefix, candidate]);

      if (next.colour !== target) continue;
      if (next.inputs.length === m) return next;

      const found = extend(next.inputs, target);

      if (found) return found;
    }

    return null;
  }

  for (const target of [0, 1] as const) {
    const found = extend([], target);

    if (found && found.colour === target) return { ...found, colour: target, R, D, limit, trials };
  }

  throw new RangeError('The specified finite search range contains no qualifying set.');
}

function schurTriple(paint: (n: number) => Ink, limit: number): readonly [number, number, number] {
  for (let sum = 3; sum < limit; sum++) {
    for (let a = 1; a < sum / 2; a++) {
      const b = sum - a;

      if (paint(a) === paint(b) && paint(a) === paint(sum)) return [a, b, sum];
    }
  }

  throw new RangeError('The finite Schur search found no monochromatic triple in its range.');
}

function folkmanPattern() {
  for (let c = 3; c <= 64; c++) {
    for (let a = 1; a < c; a++) {
      for (let b = a + 1; b < c; b++) {
        const terms = subsetTerms([a, b, c]);
        const ink = colour(a);

        if (terms.every(term => colour(term.sum) === ink)) return { inputs: [a, b, c], terms, sums: sorted(terms.map(term => term.sum)), colour: ink };
      }
    }
  }

  throw new RangeError('The finite sum-only search found no monochromatic three-set.');
}

export function logPosition(n: number, maximum: number): number {
  positiveInteger(n);

  if (!Number.isFinite(maximum) || maximum <= 1) throw new RangeError('A logarithmic axis needs an upper extent greater than one.');

  return Math.log(n) / Math.log(maximum);
}

export function buildSharedColourModel() {
  const strip = Array.from({ length: 64 }, (_, index) => ({ n: index + 1, colour: colour(index + 1) }));
  const colourCounts: [number, number] = [0, 0];

  for (const cell of strip) colourCounts[cell.colour]++;

  const triple = schurTriple(colour, 65);
  const exponentTriple = schurTriple(k => colour(2 ** k), 40);
  const m2 = searchSpaced(2, 300);
  const m3 = searchSpaced(3, 3000);
  let scaled: { k: number; inputs: readonly number[]; configuration: Configuration; values: readonly number[]; colours: readonly Ink[] } | undefined;

  for (let k = 2; k < 20; k++) {
    const inputs = m2.inputs.map(value => multiply(k, value));
    const candidate = configuration(inputs);

    if (candidate.colour !== null) continue;

    scaled = { k, inputs, configuration: candidate, values: candidate.union, colours: candidate.union.map(colour) };
    break;
  }

  if (!scaled) throw new Error('The displayed scaling comparison needs a genuine mixed-ink outcome.');

  return {
    strip, colourCounts,
    schur: { inputs: [triple[0], triple[1]], sum: triple[2], values: triple, colour: colour(triple[0]) },
    folkman: folkmanPattern(),
    exponents: {
      triple: exponentTriple,
      powers: exponentTriple.map(k => 2 ** k),
      rows: Array.from({ length: 20 }, (_, index) => ({ k: index + 1, power: 2 ** (index + 1), colour: colour(2 ** (index + 1)) })),
    },
    m2, m3, scaled, R: 2, D: 1,
  };
}

export type SharedColourModel = ReturnType<typeof buildSharedColourModel>;

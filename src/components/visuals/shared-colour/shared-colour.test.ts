import { expect, test } from 'bun:test';
import { buildSharedColourModel, colour, configuration, floorLog2, logPosition, omega, searchSpaced, type Ink } from './math';

const ORACLE_LIMIT = 32768;
const factors = Array<number>(ORACLE_LIMIT + 1).fill(0);

for (let prime = 2; prime <= ORACLE_LIMIT; prime++) {
  if (factors[prime] !== 0) continue;

  for (let multiple = prime; multiple <= ORACLE_LIMIT; multiple += prime) {
    if (factors[multiple] === 0) factors[multiple] = prime;
  }
}

function factorOracle(n: number): number {
  let value = n;
  let count = 0;

  while (value > 1) {
    const prime = factors[value];

    if (!prime) throw new Error('The independent factor sieve needs an in-range integer.');

    value /= prime;
    count++;
  }

  return count;
}

function colourOracle(n: number): Ink {
  const exponent = BigInt(n).toString(2).length - 1;

  return (Math.floor(exponent / 2) + factorOracle(n)) % 2 === 0 ? 0 : 1;
}

function subsetOracle(inputs: readonly number[]) {
  const chosen: bigint[] = [];
  const sums = new Set<bigint>();
  const products = new Set<bigint>();

  function select(index: number): void {
    if (index === inputs.length) {
      if (!chosen.length) return;

      sums.add(chosen.reduce((total, value) => total + value, 0n));
      products.add(chosen.reduce((total, value) => total * value, 1n));

      return;
    }

    select(index + 1);
    const value = inputs[index];

    if (value === undefined) throw new Error('The independent subset oracle needs each input.');

    chosen.push(BigInt(value));
    select(index + 1);
    chosen.pop();
  }

  select(0);
  const toNumbers = (values: Iterable<bigint>) => Array.from(values, Number).sort((a, b) => a - b);
  const common = new Set<bigint>();

  for (const value of sums) {
    if (products.has(value)) common.add(value);
  }

  return { sums: toNumbers(sums), products: toNumbers(products), intersection: toNumbers(common), union: toNumbers(new Set([...sums, ...products])) };
}

test('164: integer logarithm and multiplicity colouring agree with independent binary and prime-sieve oracles', () => {
  for (let n = 1; n <= 4096; n++) {
    expect(omega(n)).toBe(factorOracle(n));
    expect(floorLog2(n)).toBe(BigInt(n).toString(2).length - 1);
    expect(colour(n)).toBe(colourOracle(n));
  }

  for (let exponent = 1; exponent <= 52; exponent++) {
    const power = 2 ** exponent;
    expect(floorLog2(power - 1)).toBe(exponent - 1);
    expect(floorLog2(power)).toBe(exponent);
    expect(floorLog2(power + 1)).toBe(exponent);
    expect(omega(power)).toBe(exponent);
  }

  expect(floorLog2(Number.MAX_SAFE_INTEGER)).toBe(52);

  for (const invalid of [0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
    expect(() => colour(invalid)).toThrow();
    expect(() => omega(invalid)).toThrow();
  }

  const model = buildSharedColourModel();
  expect(model.colourCounts).toEqual([30, 34]);
  expect(model.strip.every(cell => cell.colour === colourOracle(cell.n))).toBe(true);
});

test('164: finite searches return actual monochromatic subset witnesses and the required strict separation', () => {
  const model = buildSharedColourModel();
  expect(model.schur.values).toEqual([2, 4, 6]);
  expect(model.schur.values.every(value => colourOracle(value) === model.schur.colour)).toBe(true);
  expect(model.folkman.inputs).toEqual([3, 6, 14]);
  expect(model.folkman.sums).toEqual(subsetOracle(model.folkman.inputs).sums);
  expect(model.folkman.sums.length).toBe(7);
  expect(model.folkman.sums.every(value => colourOracle(value) === model.folkman.colour)).toBe(true);
  expect(model.exponents.triple).toEqual([1, 5, 6]);
  expect(model.exponents.powers).toEqual([2, 32, 64]);

  for (const row of model.exponents.rows) {
    expect(row.power).toBe(2 ** row.k);
    expect(row.colour).toBe(colour(row.power));
  }

  expect(model.exponents.rows[0]?.colour).not.toBe(colour(1));
  expect(model.m2.inputs).toEqual([5, 21]);
  expect(model.m3.inputs).toEqual([5, 21, 298]);

  for (const found of [model.m2, model.m3]) {
    const oracle = subsetOracle(found.inputs);
    expect(found.sums).toEqual(oracle.sums);
    expect(found.products).toEqual(oracle.products);
    expect(found.intersection).toEqual(oracle.intersection);
    expect(found.union).toEqual(oracle.union);
    expect(found.intersection).toEqual(found.inputs);
    expect(found.sums.length).toBe(2 ** found.inputs.length - 1);
    expect(found.products.length).toBe(2 ** found.inputs.length - 1);
    expect(found.union.length).toBe(2 * (2 ** found.inputs.length - 1) - found.inputs.length);
    expect(found.union.every(value => colourOracle(value) === found.colour)).toBe(true);
    const first = found.inputs[0];

    if (first === undefined) throw new Error('A successful finite search must contain an input.');

    expect(first).toBeGreaterThan(found.R);
    let sum = BigInt(first);
    let product = BigInt(first);

    for (const value of found.inputs.slice(1)) {
      expect(BigInt(value) > BigInt(found.R) * (sum + product) ** BigInt(found.D)).toBe(true);
      sum += BigInt(value);
      product *= BigInt(value);
    }
  }

  expect(model.m3.counts).toEqual({ sums: 7, products: 7, shared: 3, union: 11 });
  expect(() => searchSpaced(3, 20)).toThrow();
  expect(() => searchSpaced(4, 3000)).toThrow();
});

test('164: scaling inputs changes a j-factor product by k to the j-th power, and the log axis retains exact endpoints and ordering', () => {
  const model = buildSharedColourModel();
  const scaled = model.scaled;
  expect(scaled.k).toBe(3);
  expect(scaled.inputs).toEqual([15, 63]);
  expect(scaled.values).toEqual([15, 63, 78, 945]);
  expect(scaled.colours).toEqual([1, 1, 0, 1]);
  expect(scaled.colours).toEqual(scaled.values.map(colourOracle));
  expect(scaled.configuration.colour).toBeNull();
  expect(scaled.values).toEqual(subsetOracle(scaled.inputs).union);
  expect(scaled.values).not.toEqual(model.m2.union.map(value => value * scaled.k));

  for (const term of model.m2.terms) {
    const counterpart = scaled.configuration.terms.find(other => other.mask === term.mask);

    if (!counterpart) throw new Error('Each scaled subset must retain its original selected inputs.');

    expect(counterpart.sum).toBe(scaled.k * term.sum);
    expect(counterpart.product).toBe(scaled.k ** term.indices.length * term.product);
  }

  for (let k = 2; k < scaled.k; k++) {
    expect(configuration(model.m2.inputs.map(value => k * value)).colour).not.toBeNull();
  }

  const maximum = model.m3.union.at(-1);

  if (maximum === undefined) throw new Error('The complete finite example needs its largest mark.');

  expect(logPosition(1, maximum)).toBe(0);
  expect(logPosition(maximum, maximum)).toBe(1);
  expect(logPosition(105, maximum)).toBeCloseTo(logPosition(5, maximum) + logPosition(21, maximum), 14);
  let previous = -1;

  for (const value of model.m3.union) {
    const position = logPosition(value, maximum);
    expect(position).toBeGreaterThan(previous);
    previous = position;
  }

  expect(() => configuration([5, 5])).toThrow();
  expect(() => configuration([0, 5])).toThrow();
  expect(() => logPosition(0, maximum)).toThrow();
  expect(() => logPosition(5, 1)).toThrow();
});

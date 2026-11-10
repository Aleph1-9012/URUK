import { expect, test } from 'bun:test';
import reference from './fixtures/thick-enough.json';
import { createReciprocalModel, isProgression, threeProgressions } from '../src/components/visuals/thick-enough/math';

const model = createReciprocalModel();

function tripleIn(values: readonly number[]): number[] | null {
  for (let i = 0; i < values.length; i++) {
    const a = values[i];

    if (a === undefined) throw new Error('An independent triple has its first element.');

    for (let j = i + 1; j < values.length; j++) {
      const b = values[j];

      if (b === undefined) throw new Error('An independent triple has its second element.');

      for (let k = j + 1; k < values.length; k++) {
        const c = values[k];

        if (c === undefined) throw new Error('An independent triple has its third element.');

        if (a + c === 2 * b) return [a, b, c];
      }
    }
  }

  return null;
}

function subset(mask: number, n: number): number[] {
  const values: number[] = [];

  for (let index = 0; index < n; index++) {
    if (mask & (1 << index)) values.push(index + 1);
  }

  return values;
}

test('159: finite reciprocal gauges agree with independent fsum/rational references and the sieve is complete', () => {
  const factors: number[] = [];

  for (let candidate = 2; candidate <= Math.sqrt(model.gauges.limit); candidate++) {
    let prime = true;

    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) prime = false;
    }

    if (prime) factors.push(candidate);
  }

  let previous = 1;
  const invalid: number[] = [];

  for (const prime of model.primes) {
    if (prime <= previous || prime > model.gauges.limit) invalid.push(prime);

    for (const factor of factors) {
      if (factor * factor > prime) break;

      if (prime % factor === 0) invalid.push(prime);
    }

    previous = prime;
  }

  expect(invalid).toEqual([]);
  const last = reference.gauge_samples.at(-1);

  if (!last) throw new Error('The full finite gauge has its independent reference.');

  // Distinct valid primes plus the independent exact prime count excludes any
  // missing or composite sieve entries over this finite interval.
  expect(model.primes.length).toBe(last.prime_count);
  expect(model.primes64).toEqual(reference.primes_to_64);

  for (const sample of reference.gauge_samples) {
    expect(model.primeSumAt(sample.limit)).toBeCloseTo(sample.prime_sum, 14);
    expect(model.harmonicSumAt(sample.limit)).toBeCloseTo(sample.harmonic_sum, 13);
  }

  for (const sample of reference.power_samples) {
    const exact = Number(BigInt(sample.numerator)) / Number(BigInt(sample.denominator));
    expect(model.powerSumAt(sample.count)).toBe(exact);
    expect(model.powerSumAt(sample.count)).toBeLessThan(2);
  }

  expect(model.gauges.primeSum.toFixed(3)).toBe(reference.gauge.primes_to_1e6.toFixed(3));
  expect(model.gauges.harmonicSum.toFixed(3)).toBe(reference.gauge.all_to_1e6.toFixed(3));
  expect(model.gauges.powerSum.toFixed(6)).toBe(reference.gauge.powers_of_two_to_2e19.toFixed(6));
  expect(model.primeSumAt(4)).toBe(model.primeSumAt(3));
  expect(() => model.primeSumAt(model.gauges.limit + 1)).toThrow(RangeError);
  expect(() => model.harmonicSumAt(3.5)).toThrow(RangeError);
  expect(() => model.powerSumAt(21)).toThrow(RangeError);
  expect(tripleIn(model.powers20)).toBe(null);
  expect(model.powersThreeProgressions).toEqual([]);
  expect(isProgression(model.intro)).toBe(true);
  expect(model.comparison.outerSum).not.toBe(model.comparison.doubleMiddle);
  expect(model.comparison.isProgression).toBe(false);
});

test('159: independent exhaustive subsets certify all six r3 values, while all 2002 nine-sets separately certify the upper bound', () => {
  for (const result of model.r3) {
    const oracle = Object.entries(reference.free_histograms).find(([n]) => Number(n) === result.n)?.[1];

    if (!oracle) throw new Error('Each finite interval has its independent all-subset distribution.');

    const histogram = Array<number>(result.n + 1).fill(0);
    let maximum = 0;

    for (let mask = 0; mask < 1 << result.n; mask++) {
      const values = subset(mask, result.n);

      if (tripleIn(values) !== null) continue;

      const count = histogram[values.length];

      if (count === undefined) throw new Error('A progression-free subset has its cardinality bin.');

      histogram[values.length] = count + 1;
      maximum = Math.max(maximum, values.length);
    }

    expect(histogram).toEqual(oracle);
    expect(result.size).toBe(maximum);
    expect(result.witness.length).toBe(maximum);
    expect(tripleIn(result.witness)).toBe(null);
  }

  expect(model.set14).toEqual(reference.set14);
  expect(tripleIn(model.set14)).toBe(null);
  expect(model.completions.map(completion => completion.added)).toEqual([3, 6, 7, 8, 9, 12]);

  for (const completion of model.completions) {
    const enlarged = [...model.set14, completion.added].sort((a, b) => a - b);
    const oracle = Object.entries(reference.completions).find(([added]) => Number(added) === completion.added)?.[1];

    if (!oracle) throw new Error('Each missing-number insertion has its independent witness.');

    expect([...completion.progression]).toEqual(oracle);
    expect(completion.progression.includes(completion.added)).toBe(true);
    expect(isProgression(completion.progression)).toBe(true);

    for (const value of completion.progression) expect(enlarged.includes(value)).toBe(true);

    const all: number[][] = [];

    for (let i = 0; i < enlarged.length; i++) {
      for (let j = i + 1; j < enlarged.length; j++) {
        for (let k = j + 1; k < enlarged.length; k++) {
          const a = enlarged[i];
          const b = enlarged[j];
          const c = enlarged[k];

          if (a === undefined || b === undefined || c === undefined) throw new Error('Each independent completion triple has its three selected entries.');

          if (a + c === 2 * b) all.push([a, b, c]);
        }
      }
    }

    expect(completion.all.map(witness => [...witness])).toEqual(all);
  }

  const independentlyChosen = new Set<number>();
  const selected: number[] = [];

  function choose(next: number): void {
    if (selected.length === 9) {
      let mask = 0;

      for (const value of selected) mask |= 1 << (value - 1);

      independentlyChosen.add(mask);
      expect(tripleIn(selected)).not.toBe(null);

      return;
    }

    for (let value = next; value <= 14 - (9 - selected.length) + 1; value++) {
      selected.push(value);
      choose(value + 1);
      selected.pop();
    }
  }

  choose(1);
  expect(independentlyChosen.size).toBe(reference.nine_set_count);
  expect(model.nineSetCheck.count).toBe(independentlyChosen.size);
  expect(new Set(model.nineSetCheck.cases.map(entry => entry.mask)).size).toBe(independentlyChosen.size);
  expect(model.nineSetCheck.withProgression).toBe(model.nineSetCheck.count);
  expect(model.nineSetCheck.withoutProgression).toBe(reference.nine_without_ap);
  const oracleByMask = new Map(reference.nine_sets.map(entry => [entry.mask, entry.witness]));

  for (const entry of model.nineSetCheck.cases) {
    const oracle = oracleByMask.get(entry.mask);
    const witness = entry.witness;

    if (!oracle || witness === null) throw new Error('Each of the 2002 nine-sets has its independent three-term witness.');

    expect(independentlyChosen.has(entry.mask)).toBe(true);
    expect(entry.values.length).toBe(9);
    expect([...witness]).toEqual(oracle);
    expect(witness[0]).toBeLessThan(witness[1]);
    expect(witness[1]).toBeLessThan(witness[2]);
    expect(witness[0] + witness[2]).toBe(2 * witness[1]);

    for (const value of witness) expect(entry.values.includes(value)).toBe(true);
  }
});

test('159: dyadic block bounds hold under translation for every free subset of [16] and the 3.75 reading is a finite partial bound', () => {
  expect(model.blocks).toEqual(reference.blocks.map(block => ({ m: block.m, start: 2 ** block.m, end: 2 ** (block.m + 1), r3: block.r3, ratio: block.ratio })));
  expect(model.partialBound).toBe(reference.partial_bound);
  expect(model.initialContribution).toBe(1);
  let checked = 0;

  for (let mask = 0; mask < 1 << 16; mask++) {
    const values = subset(mask, 16);

    if (tripleIn(values) !== null) continue;

    checked++;
    let total = values.includes(1) ? 1 : 0;

    for (const block of model.blocks) {
      const members: number[] = [];
      let reciprocal = 0;

      for (const value of values) {
        if (value < block.start || value >= block.end) continue;

        members.push(value - block.start + 1);
        reciprocal += 1 / value;
      }

      if (tripleIn(members) !== null || members.length > block.r3 || reciprocal > members.length / block.start + 1e-14 || reciprocal > block.ratio + 1e-14) throw new Error('Translation and reciprocal bounds hold for every shown dyadic block.');

      total += reciprocal;
    }

    if (total > model.partialBound + 1e-14) throw new Error('The finite partial bound dominates every checked progression-free example.');
  }

  const oracle = reference.free_histograms['16'];
  expect(checked).toBe(oracle.reduce((sum, count) => sum + count, 0));
  expect(threeProgressions([1, 3, 5, 7])).toEqual([[1, 3, 5], [3, 5, 7]]);
});

// The only shipped input is the article's illustrative eight-element set.
import data from './data.json';

export type AP3 = readonly [number, number, number];

export type R3Result = { n: number; size: number; witness: number[]; visited: number };

export type Completion = { added: number; progression: AP3; all: AP3[] };

export type NineSetCase = { mask: number; values: number[]; witness: AP3 | null };

export type NineSetCheck = { count: number; withProgression: number; withoutProgression: number; cases: NineSetCase[] };

export type DoublingBlock = { m: number; start: number; end: number; r3: number; ratio: number };

const GAUGE_LIMIT = 1000000;

function finitePrefix(limit: number, maximum: number): void {
  if (!Number.isInteger(limit) || limit < 0 || limit > maximum) throw new RangeError('A finite reciprocal gauge queries a computed nonnegative integer prefix.');
}

export function threeProgressions(values: readonly number[]): AP3[] {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  const members = new Set(sorted);
  const result: AP3[] = [];

  for (let first = 0; first < sorted.length; first++) {
    const a = sorted[first];

    if (a === undefined) throw new Error('Each progression has its selected first term.');

    for (let middle = first + 1; middle < sorted.length; middle++) {
      const b = sorted[middle];

      if (b === undefined) throw new Error('Each progression has its selected middle term.');

      const c = 2 * b - a;

      if (members.has(c)) result.push([a, b, c]);
    }
  }

  return result;
}

export function isProgression(values: readonly number[]): boolean {
  const first = values[0];
  const second = values[1];

  if (values.length < 3 || first === undefined || second === undefined || second <= first) return false;

  const gap = second - first;

  for (let index = 2; index < values.length; index++) {
    if (values[index] !== first + index * gap) return false;
  }

  return true;
}

export function r3(n: number): R3Result {
  if (!Number.isInteger(n) || n < 1 || n > 24) throw new RangeError('The illustrative exact progression-free search has one to twenty-four cells.');

  const chosen: number[] = [];
  let witness: number[] = [];
  let visited = 0;

  function visit(next: number): void {
    visited++;

    if (chosen.length + n - next + 1 <= witness.length) return;

    if (next > n) {
      witness = chosen.slice();

      return;
    }

    let allowed = true;

    for (let first = 0; first < chosen.length && allowed; first++) {
      const a = chosen[first];

      if (a === undefined) throw new Error('The partial set has its earlier first term.');

      for (let middle = first + 1; middle < chosen.length; middle++) {
        const b = chosen[middle];

        if (b === undefined) throw new Error('The partial set has its earlier middle term.');

        if (2 * b - a === next) {
          allowed = false;

          break;
        }
      }
    }

    if (allowed) {
      chosen.push(next);
      visit(next + 1);
      chosen.pop();
    }

    visit(next + 1);
  }

  visit(1);

  return { n, size: witness.length, witness, visited };
}

function popcount(value: number): number {
  let count = 0;
  let bits = value;

  while (bits) {
    bits &= bits - 1;
    count++;
  }

  return count;
}

export function checkNineSets(): NineSetCheck {
  const cases: NineSetCase[] = [];
  let withProgression = 0;
  let withoutProgression = 0;

  for (let mask = 0; mask < 1 << 14; mask++) {
    if (popcount(mask) !== 9) continue;

    const values: number[] = [];

    for (let index = 0; index < 14; index++) {
      if (mask & (1 << index)) values.push(index + 1);
    }

    const witness = threeProgressions(values)[0] ?? null;

    if (witness === null) withoutProgression++;
    else withProgression++;

    cases.push({ mask, values, witness });
  }

  return { count: cases.length, withProgression, withoutProgression, cases };
}

function gauges(limit: number) {
  const sieve = new Uint8Array(limit + 1).fill(1);
  sieve[0] = 0;
  sieve[1] = 0;

  for (let prime = 2; prime * prime <= limit; prime++) {
    if (!sieve[prime]) continue;

    for (let multiple = prime * prime; multiple <= limit; multiple += prime) sieve[multiple] = 0;
  }

  let primeCount = 0;

  for (let value = 2; value <= limit; value++) {
    if (sieve[value]) primeCount++;
  }

  const primes = new Int32Array(primeCount);
  const primePrefixes = new Float64Array(primeCount + 1);
  const harmonicPrefixes = new Float64Array(limit + 1);
  let primeSum = 0;
  let primeCorrection = 0;
  let harmonicSum = 0;
  let harmonicCorrection = 0;
  let index = 0;

  for (let value = 1; value <= limit; value++) {
    const reciprocal = 1 / value;
    const harmonicTerm = reciprocal - harmonicCorrection;
    const harmonicNext = harmonicSum + harmonicTerm;
    harmonicCorrection = (harmonicNext - harmonicSum) - harmonicTerm;
    harmonicSum = harmonicNext;
    harmonicPrefixes[value] = harmonicSum;

    if (!sieve[value]) continue;

    primes[index] = value;
    const primeTerm = reciprocal - primeCorrection;
    const primeNext = primeSum + primeTerm;
    primeCorrection = (primeNext - primeSum) - primeTerm;
    primeSum = primeNext;
    primePrefixes[++index] = primeSum;
  }

  return { primes, primePrefixes, harmonicPrefixes, limit, primeCount, primeSum, harmonicSum };
}

export function createReciprocalModel() {
  const set14 = data.set14.slice();

  if (new Set(set14).size !== set14.length || set14.some(value => !Number.isInteger(value) || value < 1 || value > 14) || threeProgressions(set14).length > 0) throw new Error('The illustrative eight-set is a distinct progression-free subset of [14].');

  const finite = gauges(GAUGE_LIMIT);
  const line = Array.from({ length: 64 }, (_, index) => index + 1);
  const intro = [5, 8, 11, 14];
  const primes64: number[] = [];

  for (const prime of finite.primes) {
    if (prime > 64) break;

    primes64.push(prime);
  }

  const powers20 = Array.from({ length: 20 }, (_, exponent) => 2 ** exponent);
  const powers64: number[] = [];
  const powerPrefixes = new Float64Array(powers20.length + 1);
  let powerSum = 0;

  for (const [index, power] of powers20.entries()) {
    powerSum += 1 / power;
    powerPrefixes[index + 1] = powerSum;

    if (power <= 64) powers64.push(power);
  }

  const r3Values = [2, 4, 8, 9, 14, 16].map(r3);
  const r14 = r3Values.find(result => result.n === 14);

  if (!r14) throw new Error('The fourteen-cell scene has its exact search result.');

  const completions: Completion[] = [];

  for (let added = 1; added <= 14; added++) {
    if (set14.includes(added)) continue;

    const all = threeProgressions([...set14, added]);
    const progression = all[0];

    if (!progression) throw new Error('Every missing number completes a progression in this maximal example.');

    completions.push({ added, progression, all });
  }

  const nineSetCheck = checkNineSets();
  const blocks: DoublingBlock[] = [];

  for (let m = 1; m <= 4; m++) {
    const start = 2 ** m;
    const result = r3Values.find(row => row.n === start);

    if (!result) throw new Error('Every displayed dyadic width has its exact extremal search.');

    blocks.push({ m, start, end: start * 2, r3: result.size, ratio: result.size / start });
  }

  const initialContribution = r3(1).size;
  let partialBound = initialContribution;

  for (const block of blocks) partialBound += block.ratio;

  const comparisonValues: AP3 = [4, 8, 16];
  const comparison = { values: comparisonValues, outerSum: comparisonValues[0] + comparisonValues[2], doubleMiddle: 2 * comparisonValues[1], isProgression: isProgression(comparisonValues) };

  function primeSumAt(limit: number): number {
    finitePrefix(limit, finite.limit);
    let low = 0;
    let high = finite.primes.length;

    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      const prime = finite.primes[middle];

      if (prime === undefined) throw new Error('A prime prefix search has its selected prime.');

      if (prime <= limit) low = middle + 1;
      else high = middle;
    }

    const sum = finite.primePrefixes[low];

    if (sum === undefined) throw new Error('Every finite prime count has its exact reciprocal prefix.');

    return sum;
  }

  function harmonicSumAt(limit: number): number {
    finitePrefix(limit, finite.limit);
    const sum = finite.harmonicPrefixes[limit];

    if (sum === undefined) throw new Error('Every finite harmonic limit has its exact reciprocal prefix.');

    return sum;
  }

  function powerSumAt(count: number): number {
    finitePrefix(count, powers20.length);
    const sum = powerPrefixes[count];

    if (sum === undefined) throw new Error('Every finite power count has its exact reciprocal prefix.');

    return sum;
  }

  return { line, intro, set14, primes: finite.primes, primes64, primePrefixes: finite.primePrefixes, harmonicPrefixes: finite.harmonicPrefixes, powers20, powers64, powerPrefixes, gauges: { limit: finite.limit, primeCount: finite.primeCount, primeSum: finite.primeSum, harmonicSum: finite.harmonicSum, powerSum }, r3: r3Values, r14, completions, nineSetCheck, blocks, initialContribution, partialBound, comparison, powersThreeProgressions: threeProgressions(powers20), primeSumAt, harmonicSumAt, powerSumAt };
}

export type ReciprocalModel = ReturnType<typeof createReciprocalModel>;

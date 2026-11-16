import { expect, test } from 'bun:test';
import { buildCoinMatrixModel, cornerAgreement, equalOrOppositePairs, exactDeterminant, integerRank, matrixVectorProduct, normaliseSymmetricSigns, pairAgreement, rowPartialProducts, specifiedEqualRowsProbability, symmetricCopyRows, symmetricSigns, type IntegerMatrix, type SignMatrix } from './math';

/** Independent permutation expansion, not elimination or floating-point rank. */
function permutationDeterminant(matrix: IntegerMatrix): bigint {
  const size = matrix.length;
  let total = 0n;

  function visit(columns: number[]): void {
    if (columns.length < size) {
      for (let next = 0; next < size; next++) {
        if (!columns.includes(next)) visit([...columns, next]);
      }

      return;
    }

    let product = 1n;
    let inversions = 0;

    for (let row = 0; row < size; row++) {
      const column = columns[row];

      if (column === undefined) throw new Error('Each permutation row needs its selected column.');

      const entry = matrix[row]?.[column];

      if (entry === undefined) throw new Error('Each permutation term needs its matrix entry.');

      product *= BigInt(entry);

      for (let other = row + 1; other < size; other++) {
        const next = columns[other];

        if (next === undefined) throw new Error('The permutation needs every later column.');

        inversions += Number(column > next);
      }
    }

    total += inversions % 2 ? -product : product;
  }

  visit([]);

  return total;
}

function signedRowsMatch(matrix: SignMatrix): boolean {
  const codes = new Set<string>();

  for (const row of matrix) {
    const code = row.join(',');
    const opposite = row.map(value => -value).join(',');

    if (codes.has(code) || codes.has(opposite)) return true;

    codes.add(code);
  }

  return false;
}

function specifiedRowProbabilityByEnumeration(size: number, p: number): number {
  let probability = 0;

  for (const matrix of symmetricSigns(size)) {
    const first = matrix[0];
    const second = matrix[1];

    if (!first || !second) throw new Error('The specified-row experiment needs its first two rows.');
    if (!first.every((value, index) => value === second[index])) continue;

    let weight = 1;

    for (let row = 0; row < size; row++) {
      for (let column = row; column < size; column++) weight *= matrix[row]?.[column] === 1 ? p : 1 - p;
    }

    probability += weight;
  }

  return probability;
}

test('239: integer determinants and the normalization fibres agree with independent full enumeration through size4', () => {
  const model = buildCoinMatrixModel();

  for (let size = 1; size <= 4; size++) {
    let total = 0;
    let singular = 0;
    let unpaired = 0;
    const fibres = new Map<string, number>();

    for (const matrix of symmetricSigns(size)) {
      total++;
      const determinant = permutationDeterminant(matrix);
      expect(exactDeterminant(matrix)).toBe(determinant);
      const independentPairs = signedRowsMatch(matrix);
      expect(equalOrOppositePairs(matrix).length > 0).toBe(independentPairs);

      if (determinant === 0n) {
        singular++;

        if (!independentPairs) unpaired++;
      }

      const normalised = normaliseSymmetricSigns(matrix);
      expect(normalised.matrix[0]?.every(value => value === 1)).toBe(true);
      expect(normalised.matrix.every(row => row[0] === 1)).toBe(true);
      expect(permutationDeterminant(normalised.matrix)).toBe(BigInt(normalised.globalSign) ** BigInt(size) * determinant);
      expect(signedRowsMatch(normalised.matrix)).toBe(independentPairs);
      const key = normalised.matrix.map(row => row.join(',')).join(';');
      fibres.set(key, (fibres.get(key) ?? 0) + 1);
    }

    expect(new Set(fibres.values())).toEqual(new Set([2 ** size]));
    const expected = model.counts.find(row => row.n === size);
    const live = model.liveCounts.find(row => row.n === size);

    if (!expected || !live) throw new Error('Each small size needs its canonical and live count record.');

    expect({ total, singular, unpaired }).toEqual({ total: expected.total, singular: expected.singular, unpaired: expected.unpaired });
    expect({ total, singular, unpaired }).toEqual({ total: live.total, singular: live.singular, unpaired: live.unpaired });
  }
});

test('239: the carried matrix has one kernel direction, and the row-copy what-if remains symmetric', () => {
  const model = buildCoinMatrixModel();
  const original = model.matrix.map(row => [...row]);
  const changed = symmetricCopyRows(model.matrix, 0, 1);
  expect(changed[0]).toEqual(changed[1]);
  expect(exactDeterminant(changed)).toBe(0n);
  expect(matrixVectorProduct(changed, model.whatIfKernel)).toEqual([0, 0, 0, 0, 0, 0]);
  expect(equalOrOppositePairs(model.matrix)).toHaveLength(0);

  for (let row = 0; row < 6; row++) {
    for (let column = 0; column < 6; column++) {
      expect(model.matrix[row]?.[column]).toBe(original[row]?.[column]);
      expect(changed[row]?.[column]).toBe(changed[column]?.[row]);

      if (row !== 1 && column !== 1) expect(changed[row]?.[column]).toBe(model.matrix[row]?.[column]);
    }
  }

  const cofactors: number[] = [];

  for (let deleted = 0; deleted < 6; deleted++) {
    const minor: number[][] = [];

    for (let row = 1; row < 6; row++) {
      const values: number[] = [];

      for (let column = 0; column < 6; column++) {
        const value = model.matrix[row]?.[column];

        if (value === undefined) throw new Error('Each cofactor minor needs its retained entry.');
        if (column !== deleted) values.push(value);
      }

      minor.push(values);
    }

    cofactors.push(Number(permutationDeterminant(minor)) * (deleted % 2 ? -1 : 1));
  }

  expect(cofactors.every(value => value !== 0)).toBe(true);
  expect(integerRank(model.matrix)).toBe(5);
  const firstCofactor = cofactors[0];

  if (firstCofactor === undefined) throw new Error('The cofactor certificate needs its first nonzero entry.');

  expect(cofactors.map(value => value / firstCofactor)).toEqual([...model.kernel]);
  const partials = rowPartialProducts(model.matrix, model.kernel);

  for (const [row, values] of partials.entries()) {
    let sum = 0;
    expect(values[0]).toBe(0);

    for (let column = 0; column < 6; column++) {
      const entry = model.matrix[row]?.[column];
      const coordinate = model.kernel[column];

      if (entry === undefined || coordinate === undefined) throw new Error('Each displayed row product needs both integer factors.');

      sum += entry * coordinate;
      expect(values[column + 1]).toBe(sum);
    }

    expect(sum).toBe(0);
  }

  expect(permutationDeterminant(model.cornerSingular)).toBe(0n);
  expect(permutationDeterminant(model.cornerInvertible)).toBe(-2n);
  expect(model.cornerSingularProduct).toEqual([0, 0]);
  expect(model.cornerInvertibleProduct).toEqual([0, 2]);
});

test('239: specified-row probabilities count only independent upper-triangle coins', () => {
  for (const p of [.1, .25, .5, .75, .9]) {
    for (const size of [2, 3, 4]) expect(specifiedEqualRowsProbability(size, p)).toBeCloseTo(specifiedRowProbabilityByEnumeration(size, p), 12);

    let twoAgree = 0;
    let threeAgree = 0;

    for (const first of [-1, 1]) {
      for (const second of [-1, 1]) {
        const pairWeight = (first === 1 ? p : 1 - p) * (second === 1 ? p : 1 - p);

        if (first === second) twoAgree += pairWeight;

        for (const third of [-1, 1]) {
          if (first === second && second === third) threeAgree += pairWeight * (third === 1 ? p : 1 - p);
        }
      }
    }

    expect(pairAgreement(p)).toBeCloseTo(twoAgree, 14);
    expect(cornerAgreement(p)).toBeCloseTo(threeAgree, 14);
  }

  const model = buildCoinMatrixModel();
  expect(model.fair.specifiedRows).toBe(1 / 64);
  expect(model.bias.agreement).toBe(5 / 8);
  expect(() => pairAgreement(-.1)).toThrow();
  expect(() => specifiedEqualRowsProbability(1, .5)).toThrow();
});

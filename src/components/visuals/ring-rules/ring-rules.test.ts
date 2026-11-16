import { expect, test } from 'bun:test';
import { binaryRank, buildRingRulesModel, circulantRows, coefficientCells, cyclicConvolution, polynomialBits, STENCIL_EXPONENTS } from './math';

/** Expand coefficients directly, independently of the model's cyclic bit rotations. */
function polynomialProduct(a: number, b: number, order: number): number {
  const coefficients = Array<number>(order).fill(0);

  for (let i = 0; i < order; i++) {
    for (let j = 0; j < order; j++) {
      const exponent = (i + j) % order;
      const previous = coefficients[exponent];

      if (previous === undefined) throw new Error('Each polynomial coefficient needs its residue class.');

      coefficients[exponent] = (previous + (a >>> i & 1) * (b >>> j & 1)) % 2;
    }
  }

  return coefficients.reduce((bits, value, index) => bits + value * 2 ** index, 0);
}

function rowVectorProduct(vector: readonly number[], matrix: readonly (readonly number[])[]): number[] {
  const columns = matrix[0]?.length ?? 0;

  return Array.from({ length: columns }, (_, column) => {
    let sum = 0;

    for (const [row, value] of vector.entries()) {
      const entry = matrix[row]?.[column];

      if (entry === undefined) throw new Error('The independent matrix product needs every entry.');

      sum += value * entry;
    }

    return sum % 2;
  });
}

function polynomialRemainder(a: number, b: number): number {
  let remainder = a;
  const degree = 31 - Math.clz32(b);

  while (remainder !== 0 && 31 - Math.clz32(remainder) >= degree) {
    remainder ^= b << (31 - Math.clz32(remainder) - degree);
  }

  return remainder;
}

function polynomialGcd(a: number, b: number): number {
  let left = a;
  let right = b;

  while (right !== 0) [left, right] = [right, polynomialRemainder(left, right)];

  return left;
}

test('197: cyclic convolution agrees with coefficient expansion and row-vector circulants, including repeated stencil residues', () => {
  for (let order = 1; order <= 6; order++) {
    for (let a = 0; a < 2 ** order; a++) {
      for (let b = 0; b < 2 ** order; b++) {
        expect(cyclicConvolution(a, b, order)).toBe(polynomialProduct(a, b, order));
      }
    }
  }

  expect(polynomialBits(STENCIL_EXPONENTS, 1)).toBe(1);
  expect(polynomialBits(STENCIL_EXPONENTS, 2)).toBe(2);
  expect(polynomialBits([-1, 1, 3], 2)).toBe(2);
  expect(polynomialBits([0, 2, 4, 1], 2)).toBe(3);
  expect(cyclicConvolution(1 << 29, 2, 30)).toBe(1);
  expect(() => cyclicConvolution(8, 1, 3)).toThrow();
  expect(() => polynomialBits([0], 0)).toThrow();

  for (const order of [3, 4, 5]) {
    const rule = polynomialBits(STENCIL_EXPONENTS, order);
    const rows = circulantRows(rule, order);
    const matrix = rows.map(row => coefficientCells(row, order));

    for (let input = 0; input < 2 ** order; input++) {
      const vector = coefficientCells(input, order);
      const result = rowVectorProduct(vector, matrix);
      expect(result).toEqual(coefficientCells(polynomialProduct(input, rule, order), order));
    }
  }
});

test('197: actual C4 and C3 configurations determine inverse products, image fibres, missing outputs and ranks', () => {
  const model = buildRingRulesModel();
  expect(model.four.inverseBits).toBe(13);
  expect(model.four.abBits).toBe(1);
  expect(model.four.baBits).toBe(1);
  expect(model.four.abRows).toEqual([1, 2, 4, 8]);
  expect(model.four.baRows).toEqual([1, 2, 4, 8]);
  expect(model.four.rank).toBe(4);
  expect(model.three.rank).toBe(1);
  expect(model.three.inverseBits).toBeNull();

  const inverseRows = model.four.inverseRows;

  if (!inverseRows) throw new Error('The independent matrix products need the computed C4 inverse.');

  const inverse = inverseRows.map(row => coefficientCells(row, 4));
  const identity = Array.from({ length: 4 }, (_, row) => Array.from({ length: 4 }, (_, column) => Number(row === column)));
  expect(model.four.matrix.map(row => rowVectorProduct(row, inverse))).toEqual(identity);
  expect(inverse.map(row => rowVectorProduct(row, model.four.matrix))).toEqual(identity);

  for (const action of [model.four, model.three]) {
    const outputs = new Map<number, number[]>();

    for (let input = 0; input < 2 ** action.order; input++) {
      const output = polynomialProduct(input, action.ruleBits, action.order);
      const members = outputs.get(output) ?? [];
      members.push(input);
      outputs.set(output, members);
      const configuration = action.configurations[input];
      expect(configuration?.inputBits).toBe(input);
      expect(configuration?.inputCells).toEqual(coefficientCells(input, action.order));
      expect(configuration?.outputBits).toBe(output);
      expect(configuration?.outputCells).toEqual(coefficientCells(output, action.order));
    }

    expect(action.groups).toHaveLength(outputs.size);
    expect(2 ** action.rank).toBe(outputs.size);

    for (const group of action.groups) {
      expect(group.inputBits).toEqual(outputs.get(group.outputBits) ?? []);
      expect(group.inputCells).toEqual(group.inputBits.map(input => coefficientCells(input, action.order)));
      expect(group.outputCells).toEqual(coefficientCells(group.outputBits, action.order));
    }

    for (let output = 0; output < 2 ** action.order; output++) {
      expect(action.missingOutputs.includes(output)).toBe(!outputs.has(output));
    }

    expect(action.kernel).toEqual(outputs.get(0) ?? []);
  }

  expect(model.four.groups.every(group => group.inputBits.length === 1)).toBe(true);
  expect(model.three.groups.map(group => group.inputBits.length)).toEqual([4, 4]);
  expect(model.three.kernel).toContain(6);
  expect(polynomialProduct(model.three.ruleBits, 6, 3)).toBe(0);

  for (const rows of [[], [3, 5, 6], [1, 2, 4], [7, 7, 0], [1, 1, 6]]) {
    let span = new Set([0]);

    for (const row of rows) span = new Set([...span, ...[...span].map(value => value ^ row)]);

    expect(2 ** binaryRank(rows, 3)).toBe(span.size);
  }
});

test('197: all unit tallies match polynomial gcds and the C21 window preserves signed integer sums', () => {
  const model = buildRingRulesModel();

  for (const row of model.tally) {
    let units = 0;

    for (let polynomial = 0; polynomial < 2 ** row.order; polynomial++) {
      units += Number(polynomialGcd(polynomial, (1 << row.order) | 1) === 1);
    }

    expect(row.units).toBe(units);
    expect(row.injective).toBe(units);
    expect(row.onto).toBe(units);
    expect(row.exceptions).toBe(0);
    expect(row.ruleCount).toBe(2 ** row.order);
  }

  expect(model.tally.map(row => row.units)).toEqual([1, 2, 3, 8, 15, 24, 49, 128]);
  const window = model.window;
  expect(window.integers).toEqual(Array.from({ length: 21 }, (_, index) => index - 10));
  expect(new Set(window.residues).size).toBe(window.integers.length);
  expect(window.injective).toBe(true);
  expect(window.sums).toHaveLength(121);
  expect(new Set(window.sums.map(sum => `${sum.x},${sum.y}`)).size).toBe(121);

  for (const sum of window.sums) {
    expect(sum.x >= -5 && sum.x <= 5 && sum.y >= -5 && sum.y <= 5).toBe(true);
    expect(sum.decoded).toBe(sum.x + sum.y);
    expect(sum.expected).toBe(sum.x + sum.y);
    expect(sum.residue).toBe((sum.decoded + 21) % 21);
    expect(sum.matches).toBe(true);
  }

  for (const translation of window.translations) {
    expect(new Set(translation.permutation).size).toBe(window.order);

    for (let cell = 0; cell < window.order; cell++) {
      expect(translation.permutation[cell]).toBe((cell + translation.shift) % window.order);
    }
  }

  for (const sum of window.sums) {
    const x = window.translations[(sum.x + 21) % 21];
    const y = window.translations[(sum.y + 21) % 21];
    const together = window.translations[sum.residue];

    if (!x || !y || !together) throw new Error('Each window sum needs its three cyclic permutations.');

    expect(x.permutation.map(cell => y.permutation[cell])).toEqual(together.permutation);
  }

  expect(window.errors).toBe(0);
});

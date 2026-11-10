import { expect, test } from 'bun:test';
import reference from './fixtures/digit-square.json';
import { createDigitModel, gapAt, nodeAt, workAt } from '../src/components/visuals/digit-square/math';

const model = createDigitModel();

test('109: all school digit products and decimal carry columns reconstruct the independent exact integer product', () => {
  const expected = BigInt(reference.product);
  expect(model.product).toBe(expected);
  expect(model.schoolProduct).toBe(expected);
  expect(model.school.length).toBe(reference.school_cells.length);
  expect(new Set(model.school.map(cell => cell.id)).size).toBe(model.school.length);
  let weighted = 0n;

  for (const cell of model.school) {
    const row = reference.school[cell.xIndex];
    const value = row?.[cell.yIndex];

    if (value === undefined) throw new Error('Each displayed x/y digit pair has its independent product.');

    expect(cell.value).toBe(value);
    expect(cell.value).toBeGreaterThan(0);
    expect(cell.id).toBe(cell.yIndex * model.n + cell.xIndex);
    weighted += cell.weighted;
  }

  expect(weighted).toBe(expected);
  let reconstructed = 0n;
  let carry = 0n;

  for (const [index, column] of model.diagonals.entries()) {
    const oracle = reference.school_diagonals[index];

    if (!oracle) throw new Error('Every carried decimal column has its independent reference.');

    expect(column.power).toBe(oracle.power);
    expect(column.cellIds).toEqual(oracle.cell_ids);
    expect(column.rawSum).toBe(BigInt(oracle.raw_sum));
    expect(column.carryIn).toBe(carry);
    expect(column.total).toBe(BigInt(oracle.total));
    expect(column.total).toBe(BigInt(column.digit) + 10n * column.carryOut);
    expect(column.digit).toBe(oracle.digit);
    expect(column.carryOut).toBe(BigInt(oracle.carry_out));
    carry = column.carryOut;
    reconstructed += BigInt(column.digit) * 10n ** BigInt(column.power);
  }

  expect(carry).toBe(0n);
  expect(reconstructed).toBe(expected);
});

test('109: every fixed-width Karatsuba node has exact actual operands, three-product reassembly and the carried leaf count', () => {
  expect(model.nodes.length).toBe(reference.karatsuba_nodes.length);
  expect(model.levels.map(level => level.length)).toEqual([1, 3, 9, 27]);
  expect(model.leaves.length).toBe(reference.karatsuba_leaves.length);
  let carried = 0;

  for (const node of model.nodes) {
    const oracle = reference.karatsuba_nodes.find(candidate => candidate.path === node.path);

    if (!oracle) throw new Error('Each recursive path has its independent Python arithmetic record.');

    expect(node.a).toBe(BigInt(oracle.a));
    expect(node.b).toBe(BigInt(oracle.b));
    expect(node.result).toBe(BigInt(oracle.result));
    expect(node.result).toBe(node.a * node.b);
    expect(node.parentPath).toBe(oracle.parent_path);
    expect(node.children).toEqual(oracle.children);

    if (node.split) {
      const split = node.split;
      expect(node.a).toBe(split.aHigh * split.base + split.aLow);
      expect(node.b).toBe(split.bHigh * split.base + split.bLow);
      expect(split.high).toBe(split.aHigh * split.bHigh);
      expect(split.low).toBe(split.aLow * split.bLow);
      expect(split.middle).toBe((split.aHigh + split.aLow) * (split.bHigh + split.bLow));
      expect(split.cross).toBe(split.aHigh * split.bLow + split.aLow * split.bHigh);
      expect(node.result).toBe(split.high * split.base * split.base + split.cross * split.base + split.low);
      const middle = nodeAt(model, split.middlePath);
      expect(middle.a).toBe(split.aHigh + split.aLow);
      expect(middle.b).toBe(split.bHigh + split.bLow);
      expect(middle.parentPath).toBe(node.path);
    } else {
      if (node.a > 9n || node.b > 9n) carried++;

      expect(node.n).toBe(1);
      expect(node.carried).toBe(node.a > 9n || node.b > 9n);
    }
  }

  expect(carried).toBe(13);
  expect(model.carriedCount).toBe(carried);
  const firstMiddle = nodeAt(model, 'M');
  expect(firstMiddle.n).toBe(4);
  expect(firstMiddle.a.toString().length).toBe(5);
  expect(firstMiddle.b.toString().length).toBe(5);
  expect(model.tree.result).toBe(model.schoolProduct);
});

test('109: the butterfly touches all entries at every level and stable fractional gaps agree with high-precision decimal arithmetic', () => {
  expect(model.fftLevels.length).toBe(reference.fft_levels.length);
  let dependencies = Array.from({ length: model.fftSize }, (_, index) => new Set([index]));

  for (const [level, pairs] of model.fftLevels.entries()) {
    const touched = new Set<number>();
    const next = dependencies.slice();

    for (const [a, b] of pairs) {
      expect(a ^ b).toBe(1 << level);
      expect(touched.has(a) || touched.has(b)).toBe(false);
      touched.add(a);
      touched.add(b);
      const first = dependencies[a];
      const second = dependencies[b];

      if (!first || !second) throw new Error('Each butterfly joins two existing dependency sets.');

      const combined = new Set([...first, ...second]);
      next[a] = combined;
      next[b] = combined;
    }

    expect(touched.size).toBe(model.fftSize);
    dependencies = next;
  }

  for (const set of dependencies) expect(set.size).toBe(model.fftSize);

  for (const reading of model.gapReadings) {
    const oracle = Object.entries(reference.gap_decimal).find(([log2n]) => Number(log2n) === reading.log2n)?.[1];

    if (!oracle) throw new Error('Each tiny gap has its independent 150-digit Decimal reference.');

    const expected = Number(oracle);
    expect(reading.relativeGap).toBeGreaterThan(0);
    expect(Math.abs(reading.relativeGap - expected) / expected).toBeLessThan(2e-15);
  }

  for (const kappa of [.25, .125, .0625]) {
    const halfPoint = 2 ** (1 / kappa);
    expect(gapAt(halfPoint, kappa)).toBeCloseTo(.5, 15);
    expect(gapAt(halfPoint / 2, kappa)).toBeLessThan(.5);
    expect(gapAt(halfPoint * 2, kappa)).toBeGreaterThan(.5);
  }

  expect(model.halfSaving.log2Log2N.toString()).toBe(reference.half_saving_log2_log2_n);

  for (const log2n of [8, 12, 16, 64]) {
    const referenceWork = (1n << BigInt(log2n)) * BigInt(log2n);
    expect(workAt(log2n)).toBeCloseTo(Math.log2(Number(referenceWork)), 13);
  }
});

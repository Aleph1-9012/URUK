import { expect, test } from 'bun:test';
import reference from './fixtures/selection-square.json';
import { cellAtRaw, cellAtSorted, chartAt, createSelectionModel } from '../src/components/visuals/selection-square/math';

const model = createSelectionModel();

// Independent full-list construction doubles the list once per number, without using half sums.
const fullSums = [0n];

for (const number of reference.numbers) {
  const previousLength = fullSums.length;

  for (let index = 0; index < previousLength; index++) {
    const previous = fullSums[index];

    if (previous === undefined) throw new Error('The independent selection list has its previous sum.');

    fullSums.push(previous + BigInt(number));
  }
}

function exactSum(mask: number): bigint {
  const sum = fullSums[mask];

  if (sum === undefined) throw new Error('Every full selection mask has its independent exact sum.');

  return sum;
}

test('138: all 4096 half-pair cells preserve full-selection identities through two independent sorting permutations', () => {
  expect(model.numbers).toEqual(reference.numbers);
  expect(model.target).toBe(reference.target);
  expect(model.prime).toBe(reference.prime);
  expect(model.cells.length).toBe(fullSums.length);
  expect(new Set(model.cells.map(cell => cell.id)).size).toBe(fullSums.length);
  expect(new Set(model.cells.map(cell => cell.mask)).size).toBe(fullSums.length);
  expect(model.rows.map(row => row.sum)).toEqual(reference.row_sums);
  expect(model.cols.map(col => col.sum)).toEqual(reference.col_sums);
  expect(model.rowOrder).toEqual(reference.row_order);
  expect(model.colOrder).toEqual(reference.col_order);
  expect(model.rowRank).toEqual(reference.row_rank);
  expect(model.colRank).toEqual(reference.col_rank);
  const hits: number[] = [];

  for (const cell of model.cells) {
    expect(BigInt(cell.sum)).toBe(exactSum(cell.mask));
    expect(cellAtRaw(model, cell.rowMask, cell.colMask)).toBe(cell);
    expect(cellAtSorted(model, cell.sortedRow, cell.sortedCol)).toBe(cell);
    expect(model.rowOrder[cell.sortedRow]).toBe(cell.rowMask);
    expect(model.colOrder[cell.sortedCol]).toBe(cell.colMask);
    expect(cell.id).toBe(cell.rowMask * model.size + cell.colMask);

    if (exactSum(cell.mask) === BigInt(model.target)) hits.push(cell.mask);
  }

  expect(hits).toEqual([reference.hit_identity.mask]);
  expect(model.hit.id).toBe(reference.hit_identity.id);
  expect(model.hit.mask).toBe(reference.hit_identity.mask);
  expect(model.hit.sortedRow).toBe(reference.hit_identity.sorted_row);
  expect(model.hit.sortedCol).toBe(reference.hit_identity.sorted_col);
  expect(model.solution).toEqual(reference.solution);
});

test('138: the staircase makes only justified row/column eliminations and modular aliases retain their true cell identities', () => {
  expect(model.walk.map(step => [step.row, step.col, step.sum])).toEqual(reference.walk);
  expect(new Set(model.walk.map(step => step.cell.id)).size).toBe(model.walk.length);
  expect(model.walk.at(-1)?.cell).toBe(model.hit);
  const eliminated = new Set<number>();

  for (const [index, step] of model.walk.entries()) {
    expect(step.cell).toBe(cellAtSorted(model, step.row, step.col));
    const next = model.walk[index + 1];

    if (step.move === 'down') {
      for (let col = step.col; col < model.size; col++) {
        const removed = cellAtSorted(model, step.row, col);
        expect(exactSum(removed.mask) < BigInt(model.target)).toBe(true);
        eliminated.add(removed.id);
      }

      if (!next) throw new Error('A nonterminal row elimination has its next staircase cell.');

      expect([next.row, next.col]).toEqual([step.row + 1, step.col]);
    } else if (step.move === 'right') {
      for (let row = step.row; row < model.size; row++) {
        const removed = cellAtSorted(model, row, step.col);
        expect(exactSum(removed.mask) > BigInt(model.target)).toBe(true);
        eliminated.add(removed.id);
      }

      if (!next) throw new Error('A nonterminal column elimination has its next staircase cell.');

      expect([next.row, next.col]).toEqual([step.row, step.col + 1]);
    } else {
      expect(step.cell).toBe(model.hit);
      expect(next).toBeUndefined();
    }
  }

  expect(eliminated.has(model.hit.id)).toBe(false);
  expect(model.sameRemainder.map(cell => [cell.rowMask, cell.colMask])).toEqual(reference.same_remainder);
  expect(model.aliases.map(cell => [cell.rowMask, cell.colMask])).toEqual(reference.aliases);
  const independentAliases: number[] = [];

  for (let mask = 0; mask < fullSums.length; mask++) {
    const sum = exactSum(mask);

    if ((sum - BigInt(model.target)) % BigInt(model.prime) === 0n && sum !== BigInt(model.target)) independentAliases.push(mask);
  }

  expect(new Set(model.aliases.map(cell => cell.mask))).toEqual(new Set(independentAliases));
  expect(model.sameRemainder.length - model.aliases.length).toBe(1);
  expect(model.sameRemainder.includes(model.hit)).toBe(true);
  expect(model.aliases.includes(model.hit)).toBe(false);

  for (const cell of model.aliases) {
    expect(cell.alias).toBe(true);
    expect(cell.hit).toBe(false);
    expect(cellAtSorted(model, cell.sortedRow, cell.sortedCol)).toBe(cell);
  }
});

test('138: live opening trials miss, and full-precision exponent data support honest separate gain readouts', () => {
  for (const [index, trial] of model.trials.entries()) {
    const oracle = reference.trials[index];

    if (!oracle) throw new Error('Each opening selection has its independent exact record.');

    expect(trial.mask).toBe(oracle.mask);
    expect(trial.selection).toEqual(oracle.selection);
    expect(BigInt(trial.sum)).toBe(exactSum(trial.mask));
    expect(trial.sum).toBe(oracle.sum);
    expect(trial.comparison).not.toBe('hit');
  }

  for (const [index, reading] of model.chart.entries()) {
    const oracle = reference.chart_exact[index];

    if (!oracle) throw new Error('Each exponent-chart reading has its independent full-precision record.');

    expect(reading.n).toBe(oracle.n);
    expect(reading.brute).toBe(oracle.brute);
    expect(reading.mitm).toBe(oracle.mitm);
    expect(reading.claimed).toBe(oracle.claimed);
    expect(reading.liYe).toBe(oracle.li_ye);
    expect(reading.log2Gain).toBe(oracle.log2_gain);
    expect(reading.gain).toBeCloseTo(oracle.gain, 13);
  }

  for (const oracle of reference.gap_inset) {
    const reading = chartAt(oracle.n);
    expect(reading.mitm - reading.claimed).toBe(oracle.log2_gain);
    expect(reading.gain).toBe(oracle.gain);
  }

  const far = chartAt(200);
  expect(far.mitm - far.liYe).toBeGreaterThan(.00019);
  expect(far.mitm - far.liYe).toBeLessThan(.00021);
  // A 300px-high, 30-log-unit zoom still separates Li–Ye by less than one hundredth pixel.
  expect((far.mitm - far.liYe) / 30 * 300).toBeLessThan(.01);
});

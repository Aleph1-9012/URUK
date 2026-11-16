import { expect, test } from 'bun:test';
import { buildChoicePiecesModel } from './math';

function permute(values: readonly number[]): number[][] {
  if (values.length === 0) return [[]];

  const results: number[][] = [];

  for (const [index, first] of values.entries()) {
    const remaining = values.slice();
    remaining.splice(index, 1);

    for (const tail of permute(remaining)) results.push([first, ...tail]);
  }

  return results;
}

function fallingFactorial(total: number, picks: number): number {
  let result = 1;

  for (let index = 0; index < picks; index++) result *= total - index;

  return result;
}

function binomial(total: number, picks: number): number {
  let result = 1;

  for (let index = 0; index < picks; index++) result *= (total - index) / (index + 1);

  return result;
}

test('244: the board contains every injection exactly once in lexicographic order', () => {
  const model = buildChoicePiecesModel();
  const expected = new Set<string>();

  // Independent construction: choose an unordered three-point subset, then
  // take each bijection from the three pieces to that subset.
  for (let mask = 0; mask < 2 ** model.points; mask++) {
    const subset: number[] = [];

    for (let point = 0; point < model.points; point++) {
      if (mask & 1 << point) subset.push(point);
    }

    if (subset.length !== model.pieces.length) continue;

    for (const assignment of permute(subset)) expected.add(assignment.join(','));
  }

  const observed = new Set(model.assignments.map(assignment => assignment.to.join(',')));
  expect(observed).toEqual(expected);
  expect(observed.size).toBe(model.assignments.length);
  expect(model.counts.injections).toBe(expected.size);

  for (const [index, assignment] of model.assignments.entries()) {
    const available = Array.from({ length: model.points }, (_, point) => point);
    let rank = 0;

    for (const value of assignment.to) {
      const position = available.indexOf(value);
      expect(position).toBeGreaterThanOrEqual(0);
      rank = rank * available.length + position;
      available.splice(position, 1);
    }

    expect(rank).toBe(index);
  }
});

test('244: inside picks obey piece membership and their histogram matches independent constraint counting', () => {
  const model = buildChoicePiecesModel();
  const owner = new Map<number, number>();

  for (const [piece, values] of model.pieces.entries()) {
    for (const point of values) {
      expect(owner.has(point)).toBe(false);
      owner.set(point, piece);
    }
  }

  expect(owner.size).toBe(model.points);
  const internal = new Set<string>();

  for (const first of model.pieces[0]) {
    for (const second of model.pieces[1]) {
      for (const third of model.pieces[2]) internal.add([first, second, third].join(','));
    }
  }

  expect(new Set(model.insideChoices.map(choice => choice.join(',')))).toEqual(internal);
  let outside = 0;

  for (const [index, assignment] of model.assignments.entries()) {
    const membership = assignment.to.map((point, piece) => owner.get(point) === piece);
    expect([...assignment.inside]).toEqual(membership);
    expect(assignment.allInside).toBe(membership.every(value => value));
    expect(model.insideIndices.includes(index)).toBe(internal.has(assignment.to.join(',')));

    if (membership.some(value => !value)) outside++;
  }

  // Binomial moments: count assignments satisfying each subset of inside
  // constraints, then invert to get the number satisfying exactly k of them.
  const moments = Array.from({ length: model.pieces.length + 1 }, () => 0);

  for (let mask = 0; mask < 2 ** model.pieces.length; mask++) {
    let constrained = 0;
    let choices = 1;

    for (const [index, piece] of model.pieces.entries()) {
      if (mask & 1 << index) {
        constrained++;
        choices *= piece.length;
      }
    }

    const before = moments[constrained];

    if (before === undefined) throw new Error('Every constraint subset needs its binomial-moment entry.');

    moments[constrained] = before + choices * fallingFactorial(model.points - constrained, model.pieces.length - constrained);
  }

  const exact = Array.from({ length: moments.length }, () => 0);

  for (let count = exact.length - 1; count >= 0; count--) {
    let value = moments[count];

    if (value === undefined) throw new Error('Each exact inside count needs its corresponding binomial moment.');

    for (let higher = count + 1; higher < exact.length; higher++) {
      const alreadyCounted = exact[higher];

      if (alreadyCounted === undefined) throw new Error('The descending inversion needs its higher inside counts.');

      value -= binomial(higher, count) * alreadyCounted;
    }

    exact[count] = value;
  }

  expect([...model.histogram]).toEqual(exact);
  expect(model.counts.inside).toBe(internal.size);
  expect(model.counts.outside).toBe(outside);
  expect(new Set(model.exampleOutside).size).toBe(model.pieces.length);
  expect(model.exampleOutside.every((point, piece) => owner.get(point) !== piece)).toBe(true);
  expect(model.assignments.some(assignment => assignment.to.every((point, piece) => point === model.exampleOutside[piece]))).toBe(true);
});

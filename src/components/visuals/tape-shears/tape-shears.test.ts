import { expect, test } from 'bun:test';
import { affineStep, buildTapeShearsModel, encodeTape, fraction, fractionNumber, readSymbol, runMachine, symbolicStep, type ControlState, type Fraction, type TapeSymbol } from './math';

function words(length: number): TapeSymbol[][] {
  const result: TapeSymbol[][] = [];

  for (let bits = 0; bits < 2 ** length; bits++) {
    const word: TapeSymbol[] = [];

    for (let index = 0; index < length; index++) word.push(bits & 2 ** (length - index - 1) ? 1 : 0);

    result.push(word);
  }

  return result;
}

function tapeView(tape: Map<number, TapeSymbol>, head: number, direction: -1 | 1): TapeSymbol[] {
  let last = -1;

  for (const [position, value] of tape) {
    const distance = direction === 1 ? position - head : head - 1 - position;

    if (value === 1 && distance >= 0) last = Math.max(last, distance);
  }

  const cells: TapeSymbol[] = [];

  for (let distance = 0; distance <= last; distance++) cells.push(tape.get(direction === 1 ? head + distance : head - 1 - distance) ?? 0);

  return cells;
}

/** Independent finite polynomial plus the infinite blank tail, without the live fraction helpers. */
function expectEncoding(actual: Fraction, cells: readonly TapeSymbol[]): void {
  let numerator = 1n;

  for (let index = 0; index < cells.length; index++) numerator += 4n * BigInt(cells[index] === 1 ? 3 : 1) * 5n ** BigInt(cells.length - index - 1);

  const denominator = 4n * 5n ** BigInt(cells.length);
  expect(actual.n * denominator).toBe(numerator * actual.d);
}

test('376: exact coordinate operations reproduce an independent indexed tape and full machine control, including blank prefixes and left moves', () => {
  for (let length = 0; length <= 4; length++) {
    for (const input of words(length)) {
      for (const name of ['A', 'S'] as const) {
        const tape = new Map<number, TapeSymbol>();
        input.forEach((cell, index) => tape.set(index, cell));
        let head = 0;
        let state: ControlState = 'q0';
        const path = runMachine(name, input, 10);

        for (const frame of path) {
          const left = tapeView(tape, head, -1);
          const right = tapeView(tape, head, 1);
          expect(frame.state).toBe(state);
          expect(frame.left).toEqual(left);
          expect(frame.right).toEqual(right);
          expectEncoding(frame.x, left);
          expectEncoding(frame.y, right);
          expect(readSymbol(frame.y)).toBe(tape.get(head) ?? 0);

          if (state === 'halt') break;

          const read = tape.get(head) ?? 0;
          tape.set(head, 1);

          if (name === 'A') { head++; state = read === 0 ? 'halt' : 'q0'; }
          else if (state === 'q0') { head++; state = 'q1'; }
          else { head--; state = 'q0'; }
        }
      }
    }
  }

  const prefixes = [[], ...words(1), ...words(2)] satisfies TapeSymbol[][];

  for (const left of prefixes) {
    for (const right of prefixes) {
      for (const write of [0, 1] as const) {
        for (const move of ['L', 'R'] as const) {
          const tape = new Map<number, TapeSymbol>();
          left.forEach((cell, index) => tape.set(-index - 1, cell));
          right.forEach((cell, index) => tape.set(index, cell));
          tape.set(0, write);
          const head = move === 'R' ? 1 : -1;
          const expectedLeft = tapeView(tape, head, -1);
          const expectedRight = tapeView(tape, head, 1);
          const point = affineStep({ x: encodeTape(left), y: encodeTape(right) }, write, move);
          const config = symbolicStep({ state: 'q0', left, right }, write, move, 'q1');
          expectEncoding(point.x, expectedLeft);
          expectEncoding(point.y, expectedRight);
          expect(config.left).toEqual(expectedLeft);
          expect(config.right).toEqual(expectedRight);
          expect(config.state).toBe('q1');
        }
      }
    }
  }

  expect(readSymbol(fraction(1n, 4n))).toBe(0);
  expect(readSymbol(fraction(3n, 4n))).toBe(1);
  expect(() => readSymbol(fraction(1n, 2n))).toThrow(RangeError);
});

test('376: centered shear motion preserves area and the history coordinate exactly reverses each overwritten input', () => {
  const model = buildTapeShearsModel();

  for (const family of model.factorizations) {
    const product = family.product;
    expect(product[0][1].n).toBe(0n);
    expect(product[1][0].n).toBe(0n);
    expect(product[0][0].n * family.lambda.d).toBe(family.lambda.n * product[0][0].d);
    expect(product[1][1].n * family.lambda.n).toBe(family.lambda.d * product[1][1].d);
  }

  for (let index = 0; index < model.branch.stages.length; index++) {
    const stage = model.branch.stages[index];

    if (!stage) throw new Error('The branch needs every retained affine stage.');

    const [[a, b], [c, d]] = stage.matrix;
    const ad = a.n * d.n * b.d * c.d;
    const bc = b.n * c.n * a.d * d.d;
    expect(ad - bc).toBe(a.d * d.d * b.d * c.d);
    expect(stage.area.n * 20n).toBe(stage.area.d);
    const previous = model.branch.stages[index - 1];

    if (!previous) continue;

    for (let sample = 0; sample <= 20; sample++) {
      const amount = sample / 20;
      const corners = stage.corners.map((point, cornerIndex) => {
        const start = previous.corners[cornerIndex];

        if (!start) throw new Error('A carried rectangle corner needs its preceding position.');

        return { x: start.x + amount * (point.x - start.x), y: start.y + amount * (point.y - start.y) };
      });
      let twiceArea = 0;

      for (let cornerIndex = 0; cornerIndex < corners.length; cornerIndex++) {
        const point = corners[cornerIndex];
        const next = corners[(cornerIndex + 1) % corners.length];

        if (!point || !next) throw new Error('The displayed polygon needs a closed edge sequence.');

        expect(point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1).toBe(true);
        twiceArea += point.x * next.y - point.y * next.x;
      }

      expect(Math.abs(twiceArea / 2 - fractionNumber(model.branch.area))).toBeLessThan(2e-15);
    }
  }

  for (const point of model.branch.target.corners) {
    expect(point.x >= .65 && point.x <= .75 && point.y >= .25 && point.y <= .75).toBe(true);
  }

  const firstStep = model.machineA.path[1];

  if (!firstStep) throw new Error('The branch marker needs its independently checked first machine step.');

  expect(model.branch.targetMarker).toEqual(firstStep.point);
  const triples = new Set<string>();

  for (const record of model.history.records) {
    const oldDigit = readSymbol(record.h) === 0 ? 1 : 3;
    const restoredY = (oldDigit + record.target.y) / 5;
    const restoredX = 5 * record.target.x - 3;
    expect(Math.abs(restoredX - record.source.x)).toBeLessThan(1e-15);
    expect(Math.abs(restoredY - record.source.y)).toBeLessThan(1e-15);
    expect(oldDigit === 3 ? 1 : 0).toBe(record.input[0] ?? 0);
    triples.add(`${record.exactTarget.x.n}/${record.exactTarget.x.d},${record.exactTarget.y.n}/${record.exactTarget.y.d},${record.h.n}/${record.h.d}`);
  }

  expect(triples.size).toBe(model.history.records.length);

  for (const group of model.history.groups) {
    const first = group.records[0];
    const second = group.records[1];

    if (!first || !second) throw new Error('Every overwritten output needs its two distinct erased symbols.');

    expect(group.records.length).toBe(2);
    expect(first.exactTarget).toEqual(second.exactTarget);
    expect(first.h).not.toEqual(second.h);
    expect(first.input[0]).not.toBe(second.input[0]);
  }
});

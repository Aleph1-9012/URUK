import { expect, test } from 'bun:test';
import { binaryDigits, buildCarryTreeModel, circleRotation, incrementDigits, residueAt, sameDisc, type BinaryDigit } from './math';

test('304: the LSB-first tree has contiguous nested cosets and correct parent/child inclusion', () => {
  const model = buildCarryTreeModel();

  for (const level of model.levels) {
    const observed = new Set(level.map(node => node.residue));
    expect(observed.size).toBe(level.length);

    for (const node of level) {
      const independentDigits = node.residue.toString(2).padStart(node.level, '0').split('').reverse().slice(0, node.level).map((digit): BinaryDigit => digit === '0' ? 0 : 1);
      expect(node.digits).toEqual(independentDigits);
      const lexicographicIndex = Number.parseInt(node.digits.join('') || '0', 2);
      expect(node.order).toBe(lexicographicIndex);

      if (node.level === 0) {
        expect(node.parentResidue).toBeNull();
      } else {
        const parent = model.levels[node.level - 1]?.[Math.floor(node.order / 2)];

        if (!parent) throw new Error('Each nonroot disc needs its actual parent in the preceding level.');

        expect(node.digits.slice(0, -1)).toEqual(parent.digits);
        expect(node.parentResidue).toBe(parent.residue);
        expect(node.parentOrder).toBe(parent.order);
        expect(parent.childResidues).toContain(node.residue);
        expect(parent.childOrders).toContain(node.order);
      }

      for (let value = 0; value < model.windowSize; value++) {
        const prefix = value.toString(2).padStart(node.level, '0').split('').reverse().slice(0, node.level).join('');
        const belongs = prefix === node.digits.join('');
        expect(sameDisc(value, node.residue, node.level)).toBe(belongs);
        expect((value - node.residue) % 2 ** node.level === 0).toBe(belongs);
      }
    }
  }
});

test('304: every finite carry agrees with binary addition and overflow retains the next integer', () => {
  const model = buildCarryTreeModel();

  for (const step of model.odometer) {
    const conventional = step.from.toString(2).padStart(model.maxLevel, '0');
    const trailingOnes = conventional.match(/1*$/)?.[0];

    if (trailingOnes === undefined) throw new Error('The independent binary-word check needs its final run of ones.');

    expect(step.carries).toBe(trailingOnes.length);
    const nextWord = step.nextInteger.toString(2).padStart(model.maxLevel + 1, '0');
    expect(step.liftedDigits).toEqual(nextWord.split('').reverse().map((digit): BinaryDigit => digit === '0' ? 0 : 1));
    expect(step.afterDigits).toEqual(step.liftedDigits.slice(0, model.maxLevel));
    expect(step.overflow).toBe(step.nextInteger >= 2 ** model.maxLevel);
    expect(residueAt(step.nextInteger, model.maxLevel)).toBe(step.to);
  }

  for (let level = 1; level <= model.maxLevel; level++) {
    let digits = binaryDigits(0, level);
    const seen = new Set<string>();

    do {
      const word = digits.join('');
      expect(seen.has(word)).toBe(false);
      seen.add(word);
      digits = incrementDigits(digits).digits;
    } while (digits.some(digit => digit !== 0));

    const displayedLevel = model.levels[level];

    if (!displayedLevel) throw new Error('Each displayed finite level needs its residue list.');

    expect(seen.size).toBe(displayedLevel.length);
  }

  // No positive integer period survives every level: a level whose modulus
  // exceeds the proposed period separates that integer from zero.
  for (let period = 1; period <= 64; period++) {
    const separatingLevel = period.toString(2).length;
    expect(sameDisc(period, 0, separatingLevel)).toBe(false);
  }
});

test('304: the circle action is a homomorphism with the full level-three kernel coset', () => {
  const model = buildCarryTreeModel();

  for (let first = -32; first < 32; first++) {
    for (let second = -32; second < 32; second++) {
      const a = circleRotation(first, model.toyLevel);
      const b = circleRotation(second, model.toyLevel);
      const sum = circleRotation(first + second, model.toyLevel);
      expect((a.turns + b.turns) % 1).toBe(sum.turns);
      expect(a.turns === b.turns).toBe((first - second) % model.modulus === 0);
    }
  }

  const kernelFromDigits: number[] = [];

  for (let value = 0; value < model.windowSize; value++) {
    const word = value.toString(2).padStart(model.toyLevel, '0');

    if (word.endsWith('0'.repeat(model.toyLevel))) kernelFromDigits.push(value);
  }

  expect(model.kernelWindow).toEqual(kernelFromDigits);
  const expectedKernelLeaves: number[] = [];

  for (const leaf of model.leaves) {
    if (model.kernelNode.digits.every((digit, index) => digit === leaf.digits[index])) expectedKernelLeaves.push(leaf.residue);
  }

  expect(model.kernelLeaves.map(leaf => leaf.residue)).toEqual(expectedKernelLeaves);
  expect(model.kernelLeaves.some(leaf => leaf.residue !== 0)).toBe(true);
  expect(new Set(model.rotations.map(rotation => rotation.turns)).size).toBe(model.rotations.length);
  expect(() => residueAt(.5, 3)).toThrow();
});

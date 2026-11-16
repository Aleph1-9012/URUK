export type BinaryDigit = 0 | 1;

export type TreeNode = {
  level: number;
  residue: number;
  digits: BinaryDigit[];
  order: number;
  parentResidue: number | null;
  parentOrder: number | null;
  childResidues: readonly [number, number] | null;
  childOrders: readonly [number, number] | null;
};

function checkLevel(level: number): void {
  if (!Number.isInteger(level) || level < 0 || level > 30) throw new RangeError('A finite binary truncation needs an integer level from zero through thirty.');
}

export function residueAt(value: number, level: number): number {
  checkLevel(level);

  if (!Number.isSafeInteger(value)) throw new RangeError('The finite integer illustration needs safely represented integer inputs.');

  const modulus = 2 ** level;

  return ((value % modulus) + modulus) % modulus;
}

/** The first entry is the least significant digit, matching p-adic prefixes. */
export function binaryDigits(value: number, level: number): BinaryDigit[] {
  const residue = residueAt(value, level);

  return Array.from({ length: level }, (_, index) => Math.floor(residue / 2 ** index) % 2 === 0 ? 0 : 1);
}

export function reverseBits(value: number, level: number): number {
  return binaryDigits(value, level).reduce<number>((order, digit) => 2 * order + digit, 0);
}

export function parentResidue(value: number, level: number): number {
  if (level < 1) throw new RangeError('The root disc has no parent residue.');

  return residueAt(value, level - 1);
}

export function childResidues(value: number, level: number): readonly [number, number] {
  const first = residueAt(value, level);

  return [first, first + 2 ** level];
}

export function sameDisc(first: number, second: number, level: number): boolean {
  return residueAt(first, level) === residueAt(second, level);
}

/** Overflow records a carry beyond the display, never an infinite Z₂ wrap. */
export function incrementDigits(before: readonly BinaryDigit[]) {
  checkLevel(before.length);
  const digits = [...before];
  let carries = 0;
  let overflow = true;

  for (const [index, digit] of before.entries()) {
    if (digit === 0) {
      digits[index] = 1;
      overflow = false;
      break;
    }

    digits[index] = 0;
    carries++;
  }

  return { digits, carries, overflow };
}

function fractionLabel(numerator: number, denominator: number): string {
  if (numerator === 0) return '0';

  let a = numerator;
  let b = denominator;

  while (b !== 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return `${numerator / a}/${denominator / a}`;
}

/** One specified circle action; general quotient actions need not be rotations. */
export function circleRotation(value: number, level = 3) {
  const numerator = residueAt(value, level);
  const denominator = 2 ** level;

  return { residue: numerator, numerator, denominator, turns: numerator / denominator, label: fractionLabel(numerator, denominator) };
}

export function buildCarryTreeModel() {
  const p = 2;
  const maxLevel = 4;
  const toyLevel = 3;
  const modulus = 2 ** toyLevel;
  const windowSize = 64;
  const levels: TreeNode[][] = Array.from({ length: maxLevel + 1 }, (_, level) => Array.from({ length: 2 ** level }, (_, order) => {
    const residue = reverseBits(order, level);

    return {
      level, residue, digits: binaryDigits(residue, level), order,
      parentResidue: level === 0 ? null : parentResidue(residue, level),
      parentOrder: level === 0 ? null : Math.floor(order / 2),
      childResidues: level === maxLevel ? null : childResidues(residue, level),
      childOrders: level === maxLevel ? null : [2 * order, 2 * order + 1],
    };
  }));
  const leaves = levels[maxLevel];
  const kernelNode = levels[toyLevel]?.find(node => node.residue === 0);

  if (!leaves || !kernelNode) throw new Error('The finite display needs its final level and its zero-residue kernel disc.');

  const odometer = Array.from({ length: 2 ** maxLevel }, (_, from) => {
    const beforeDigits = binaryDigits(from, maxLevel);
    const next = incrementDigits(beforeDigits);
    const to = next.digits.reduce<number>((sum, digit, index) => sum + digit * 2 ** index, 0);

    return {
      from, to, carries: next.carries, beforeDigits, afterDigits: next.digits,
      overflow: next.overflow, nextInteger: from + 1, liftedDigits: binaryDigits(from + 1, maxLevel + 1),
    };
  });
  const rotations = Array.from({ length: modulus }, (_, residue) => circleRotation(residue, toyLevel));
  const kernelLeaves: TreeNode[] = [];

  for (const leaf of leaves) {
    if (sameDisc(leaf.residue, 0, toyLevel)) kernelLeaves.push(leaf);
  }

  const window = Array.from({ length: windowSize }, (_, value) => {
    const rotation = circleRotation(value, toyLevel);

    return { value, residue: rotation.residue, turns: rotation.turns, inKernel: rotation.numerator === 0 };
  });
  const kernelWindow: number[] = [];

  for (const item of window) {
    if (item.inKernel) kernelWindow.push(item.value);
  }

  return { p, maxLevel, levels, leaves, odometer, toyLevel, modulus, rotations, kernelNode, kernelLeaves, kernelWindow, windowSize, window };
}

export type CarryTreeModel = ReturnType<typeof buildCarryTreeModel>;

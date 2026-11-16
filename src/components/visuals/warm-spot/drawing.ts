import { fittedText } from '../../plate/canvas/fitted-text';

export type Box = { x: number; y: number; w: number; h: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

function inkHash(value: number): number {
  let hash = Math.imul(value ^ 0x51ed270b, 0x45d9f3b);
  hash = Math.imul(hash ^ hash >>> 16, 0x45d9f3b);

  return (hash ^ hash >>> 16) >>> 0;
}

export function stippleSample(index: number, slot: number): { x: number; y: number; threshold: number; reveal: number } {
  if (!Number.isInteger(index) || index < 0 || (slot !== 0 && slot !== 1)) throw new RangeError('Each cell has two fixed stipple samples.');

  const key = index * 2 + slot;

  return {
    x: (inkHash(key * 4) / 4294967296 - .5) * .85,
    y: (inkHash(key * 4 + 1) / 4294967296 - .5) * .85,
    threshold: inkHash(key * 4 + 2) / 4294967296,
    reveal: inkHash(key * 4 + 3) / 4294967296,
  };
}

export const text = fittedText(words => /[α-ωΑ-Ωℓ⊥≤≥∞√∇−⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/u.test(words) ? '"Garamond Math", serif' : /[À-ž]/u.test(words) ? '"Alegreya", "Garamond Math", serif' : '"Special Elite", monospace');

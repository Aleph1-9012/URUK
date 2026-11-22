import { fittedText } from '../../plate/canvas/fitted-text';

export type Box = { x: number; y: number; w: number; h: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export const text = fittedText(words => /[À-ž]/u.test(words) ? '"Alegreya", "Garamond Math", serif' : /[α-ωΑ-Ωℓ⊥≤≥∞⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/u.test(words) ? '"Garamond Math", serif' : '"Special Elite", monospace');

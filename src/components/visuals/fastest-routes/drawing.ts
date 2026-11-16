import { fittedText } from '../../plate/canvas/fitted-text';

export type Box = { x: number; y: number; w: number; h: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

export const text = fittedText(words => /[α-ωΑ-Ωℓ⊥≤≥∞√∇−⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/u.test(words) ? '"Garamond Math", serif' : /[À-ž]/u.test(words) ? '"Alegreya", "Garamond Math", serif' : '"Special Elite", monospace');

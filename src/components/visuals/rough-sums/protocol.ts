import type { RoughSumsData } from './math';

export type CalculationRequest = { kind: 'calculate' };

export type CalculationResult =
  | { kind: 'ready'; data: RoughSumsData }
  | { kind: 'failed'; message: string };

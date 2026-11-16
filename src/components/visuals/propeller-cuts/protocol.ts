import type { PropellerModel } from './math';

export type CalculationRequest = { kind: 'calculate' };

export type CalculationResult =
  | { kind: 'ready'; data: PropellerModel }
  | { kind: 'failed'; message: string };

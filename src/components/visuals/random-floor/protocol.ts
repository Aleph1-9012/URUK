import type { RandomFloorModel } from './math';

export type CalculationRequest = { kind: 'calculate' };

export type CalculationResult =
  | { kind: 'ready'; data: RandomFloorModel }
  | { kind: 'failed'; message: string };

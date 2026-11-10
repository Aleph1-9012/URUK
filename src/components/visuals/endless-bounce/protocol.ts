import type { BounceExperiment } from './math';

export type BounceRequest = { kind: 'compute' };

export type BounceResult = { kind: 'computed'; cases: BounceExperiment } | { kind: 'failed'; reason: string };

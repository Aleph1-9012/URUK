import type { HeatAtlas } from './math';

export type HeatRequest = { kind: 'compute' };

export type HeatResult = { kind: 'computed'; atlas: HeatAtlas } | { kind: 'failed'; reason: string };

import type { RouteResult } from './math';

export type RouteRequest = { kind: 'compute' };

export type RouteResponse = { kind: 'computed'; result: RouteResult } | { kind: 'failed'; reason: string };

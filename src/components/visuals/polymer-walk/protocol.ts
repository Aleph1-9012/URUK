export type CountsRequest = { kind: 'counts'; maxLength: number };

export type CountsResult = { kind: 'counts'; counts: number[] };

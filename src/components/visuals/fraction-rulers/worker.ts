import { computeSeries, type SeriesData } from './series';

export type SeriesMessage = { kind: 'series'; data: SeriesData };

const data = computeSeries();

postMessage({ kind: 'series', data } satisfies SeriesMessage, { transfer: [data.indices.buffer, data.totals.buffer] });

import { computeMap, type MapData } from './zeta/maps';
import { zeroHeights } from './zeta/zeros';
import { waveTable, type WaveTable } from './primes';
import { DIAL_FROM, DIAL_TO, FIRST_HEIGHT } from './story';

export type FilmMessage = { kind: 'map'; map: MapData } | { kind: 'waves'; table: WaveTable };

// Evenly in log x: about eight samples to each turn of the hundredth zero's wave, the fastest.
const SAMPLES = 1200;

const DIAL_ROWS = 46;

function sendMap(map: MapData): void {
  const transfer = [map.rings.points.buffer, map.rings.starts.buffer, ...map.bands.flatMap((band) => [band.points.buffer, band.starts.buffer])];

  postMessage({ kind: 'map', map } satisfies FilmMessage, { transfer });
}

sendMap(computeMap('zeta'));

const table = waveTable(zeroHeights, SAMPLES, { height: FIRST_HEIGHT, from: DIAL_FROM, to: DIAL_TO, rows: DIAL_ROWS });

postMessage({ kind: 'waves', table } satisfies FilmMessage, { transfer: [table.xs.buffer, table.smooth.buffer, table.partial.buffer, table.dial.buffer] });
sendMap(computeMap('minus-four'));

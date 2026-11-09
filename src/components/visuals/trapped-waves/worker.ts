import { WaveSimulation } from './simulation';
import type { WaveWorkerMessage } from './data';

export type { WaveWorkerMessage } from './data';

async function readArray(url: URL, bytes: number): Promise<ArrayBuffer> {
  const response = await fetch(url);

  if (!response.ok) throw new Error('The precomputed wave data could not be loaded.');

  const buffer = await response.arrayBuffer();

  if (buffer.byteLength !== bytes) throw new Error('The wave data has an unexpected length.');

  return buffer;
}

async function compute(): Promise<void> {
  const [unitBuffer, strongBuffer] = await Promise.all([
    readArray(new URL('./unit.f64', import.meta.url), 201 * 201 * 8),
    readArray(new URL('./strong.f32', import.meta.url), 161 * 31 * 31 * 4),
  ]);
  const unit = new Float64Array(unitBuffer);
  const visibleUnit = unit.slice();
  const strong = new Float32Array(strongBuffer);
  postMessage({ kind: 'initial', unit: visibleUnit, strong } satisfies WaveWorkerMessage, { transfer: [visibleUnit.buffer, strong.buffer] });

  for (const disorder of [5, 2] as const) {
    const simulation = new WaveSimulation(unit, disorder);
    const step = disorder === 5 ? 2.5 : 5;
    const cropSide = disorder === 5 ? 31 : 201;

    for (let index = 0; index <= 80; index++) {
      if (index > 0) simulation.advance(step);

      const frame = simulation.frame(cropSide);
      postMessage({ kind: 'frame', disorder, index, frame } satisfies WaveWorkerMessage, { transfer: [frame.density.buffer] });
    }
  }

  postMessage({ kind: 'complete' } satisfies WaveWorkerMessage);
}

void compute().catch((cause: Error) => {
  postMessage({ kind: 'error', message: cause.message } satisfies WaveWorkerMessage);
});

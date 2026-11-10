import { computeHeatAtlas, createWarmModel } from './math';
import type { HeatRequest, HeatResult } from './protocol';

self.addEventListener('message', (event: MessageEvent<HeatRequest>) => {
  if (event.data.kind !== 'compute') throw new Error('The heat worker accepts only the complete grid calculation.');

  try {
    const atlas = computeHeatAtlas(createWarmModel());
    const result: HeatResult = { kind: 'computed', atlas };
    self.postMessage(result, { transfer: [atlas.times.buffer, atlas.values.buffer] });
  } catch (cause) {
    const result: HeatResult = { kind: 'failed', reason: cause instanceof Error ? cause.message : String(cause) };
    self.postMessage(result);
  }
});

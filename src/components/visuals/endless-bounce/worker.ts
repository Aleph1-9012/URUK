import { computeBounceExperiment, experimentBuffers } from './math';
import type { BounceRequest, BounceResult } from './protocol';

self.addEventListener('message', (event: MessageEvent<BounceRequest>) => {
  if (event.data.kind !== 'compute') throw new Error('The billiards worker accepts only the full experiment request.');

  try {
    const cases = computeBounceExperiment();
    const result: BounceResult = { kind: 'computed', cases };
    self.postMessage(result, { transfer: experimentBuffers(cases) });
  } catch (cause) {
    const result: BounceResult = { kind: 'failed', reason: cause instanceof Error ? cause.message : String(cause) };
    self.postMessage(result);
  }
});

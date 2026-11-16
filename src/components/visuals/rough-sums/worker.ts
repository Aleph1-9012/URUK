/// <reference lib="webworker" />
import { buildRoughSumsData } from './math';
import type { CalculationRequest, CalculationResult } from './protocol';

declare const self: DedicatedWorkerGlobalScope;

self.addEventListener('message', (event: MessageEvent<CalculationRequest>) => {
  if (event.data.kind !== 'calculate') throw new Error('The Fourier worker received an unsupported calculation request.');

  try {
    const result: CalculationResult = { kind: 'ready', data: buildRoughSumsData() };
    self.postMessage(result);
  } catch (cause) {
    const result: CalculationResult = { kind: 'failed', message: cause instanceof Error ? cause.message : 'The live Fourier calculation could not finish.' };
    self.postMessage(result);
  }
});

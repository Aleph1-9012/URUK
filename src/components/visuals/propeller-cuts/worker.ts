/// <reference lib="webworker" />
import { buildPropellerModel } from './math';
import type { CalculationRequest, CalculationResult } from './protocol';

declare const self: DedicatedWorkerGlobalScope;

self.addEventListener('message', (event: MessageEvent<CalculationRequest>) => {
  if (event.data.kind !== 'calculate') throw new Error('The propeller worker received an unsupported calculation request.');

  try {
    const result: CalculationResult = { kind: 'ready', data: buildPropellerModel() };
    self.postMessage(result);
  } catch (cause) {
    const result: CalculationResult = { kind: 'failed', message: cause instanceof Error ? cause.message : String(cause) };
    self.postMessage(result);
  }
});

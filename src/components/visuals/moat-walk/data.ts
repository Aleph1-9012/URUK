import type { DensitySample, DiskLoop, Flood, IslandData, SieveData } from './math';

export type { DensitySample, DiskLoop, Flood, IslandData, SieveData } from './math';

export type InitialMoatData = {
  smallPrimeCoords: Int16Array<ArrayBuffer>;
  axisPrimes: number[];
  loop: DiskLoop;
  islands: IslandData;
  sieve: SieveData;
  density: DensitySample[];
};

export type MoatWorkerMessage =
  | { kind: 'initial'; data: InitialMoatData }
  | { kind: 'flood'; flood: Flood }
  | { kind: 'complete' }
  | { kind: 'error'; message: string };

export type MoatData = { initial: InitialMoatData | null; floods: Map<number, Flood>; complete: boolean; error: string | null };

export function createMoatData(): MoatData {
  return { initial: null, floods: new Map(), complete: false, error: null };
}

export function applyMoatMessage(data: MoatData, message: MoatWorkerMessage): void {
  switch (message.kind) {
    case 'initial': data.initial = message.data; break;
    case 'flood': data.floods.set(message.flood.stepSquared, message.flood); break;
    case 'complete': data.complete = true; break;
    case 'error': data.error = message.message; break;
  }
}

import type { OrbitData, PeriodicFamily, PeriodicQ, PhasePortrait, TableKind } from './math';

export type { OrbitData, PeriodicFamily, PeriodicQ, PhasePortrait, TableKind } from './math';

export type CausticWorkerMessage =
  | { kind: 'launches'; table: TableKind; orbits: OrbitData[] }
  | { kind: 'portrait'; table: TableKind; portrait: PhasePortrait }
  | { kind: 'periodic'; table: TableKind; families: PeriodicFamily[] }
  | { kind: 'complete' }
  | { kind: 'error'; message: string };

export type CausticData = {
  portraits: Map<TableKind, PhasePortrait>;
  launches: Map<TableKind, Map<number, OrbitData>>;
  families: Map<TableKind, Map<PeriodicQ, PeriodicFamily>>;
  complete: boolean;
  error: string | null;
};

export function createCausticData(): CausticData {
  return { portraits: new Map(), launches: new Map(), families: new Map(), complete: false, error: null };
}

export function applyCausticMessage(data: CausticData, message: CausticWorkerMessage): void {
  switch (message.kind) {
    case 'launches': data.launches.set(message.table, new Map(message.orbits.map(orbit => [orbit.launchDelta, orbit]))); break;
    case 'portrait': data.portraits.set(message.table, message.portrait); break;
    case 'periodic': data.families.set(message.table, new Map(message.families.map(family => [family.q, family]))); break;
    case 'complete': data.complete = true; break;
    case 'error': data.error = message.message; break;
  }
}

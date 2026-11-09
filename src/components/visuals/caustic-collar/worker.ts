import { BilliardTable, LAUNCH_DELTAS, computePeriodicFamily, computePortrait, traceOrbit, type PeriodicQ } from './math';
import type { CausticWorkerMessage } from './data';

function compute(): void {
  for (const kind of ['ellipse', 'wobble'] as const) {
    const table = new BilliardTable(kind === 'ellipse' ? 0 : .01);
    const orbits = LAUNCH_DELTAS.map(delta => traceOrbit(table, .3, delta, 400));
    const orbitBuffers: ArrayBuffer[] = [];

    for (const orbit of orbits) orbitBuffers.push(orbit.coords.buffer, orbit.phase.buffer, orbit.parameters.buffer, orbit.deltas.buffer);

    postMessage({ kind: 'launches', table: kind, orbits } satisfies CausticWorkerMessage, { transfer: orbitBuffers });
    const portrait = computePortrait(table);
    postMessage({ kind: 'portrait', table: kind, portrait } satisfies CausticWorkerMessage, { transfer: [portrait.points.buffer, portrait.orbitOffsets.buffer, portrait.launches.buffer] });
  }

  for (const kind of ['ellipse', 'wobble'] as const) {
    const table = new BilliardTable(kind === 'ellipse' ? 0 : .01);
    const orders: PeriodicQ[] = [3, 4, 5];
    const families = orders.map(q => computePeriodicFamily(table, q));
    const buffers: ArrayBuffer[] = [];

    for (const family of families) buffers.push(family.parameters.buffer, family.coords.buffer, family.lengths.buffer, family.startResiduals.buffer);

    postMessage({ kind: 'periodic', table: kind, families } satisfies CausticWorkerMessage, { transfer: buffers });
  }

  postMessage({ kind: 'complete' } satisfies CausticWorkerMessage);
}

try {
  compute();
} catch (cause) {
  const message = cause instanceof Error ? cause.message : 'The billiard computation could not finish.';
  postMessage({ kind: 'error', message } satisfies CausticWorkerMessage);
}

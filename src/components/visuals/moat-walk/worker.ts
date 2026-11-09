import { axisPrimes, createPrimeField, densitySamples, diskLoop, gaussianFlood, gaussianPrimeCoords, nearbyClusters, periodicSieve, type FloodSeed } from './math';
import type { InitialMoatData, MoatWorkerMessage } from './data';

function compute(): void {
  const field = createPrimeField(1600);
  const data: InitialMoatData = {
    smallPrimeCoords: gaussianPrimeCoords(150, field), axisPrimes: axisPrimes(130, field),
    loop: diskLoop(field), islands: nearbyClusters(100, 150, field), sieve: periodicSieve(), density: densitySamples(field),
  };
  const islands = data.islands;
  const sieve = data.sieve;
  postMessage({ kind: 'initial', data } satisfies MoatWorkerMessage, { transfer: [
    data.smallPrimeCoords.buffer, data.loop.coords.buffer, islands.coords.buffer, islands.parents.buffer, islands.component.buffer,
    islands.offsets.buffer, islands.sizes.buffer, sieve.keep.buffer, sieve.component.buffer, sieve.liftCoords.buffer,
    sieve.parents.buffer, sieve.order.buffer, sieve.offsets.buffer, sieve.sizes.buffer,
  ] });
  let previous: FloodSeed | null = null;

  for (const stepSquared of [2, 4, 8, 10]) {
    const flood = gaussianFlood(stepSquared, 1100, previous, field);
    previous = { count: flood.count, coords: flood.coords.slice() };
    postMessage({ kind: 'flood', flood } satisfies MoatWorkerMessage, { transfer: [
      flood.coords.buffer, flood.parents.buffer, flood.depth.buffer, flood.layerOffsets.buffer,
      flood.resumeOrder.buffer, flood.resumeParents.buffer, flood.resumeDepth.buffer, flood.resumeOffsets.buffer,
    ] });
  }

  postMessage({ kind: 'complete' } satisfies MoatWorkerMessage);
}

try {
  compute();
} catch (cause) {
  const error = cause instanceof Error ? cause.message : 'The Gaussian-prime computation could not finish.';
  postMessage({ kind: 'error', message: error } satisfies MoatWorkerMessage);
}

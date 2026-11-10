import { decodeWeights, solveRoutes } from './math';
import type { RouteRequest, RouteResponse } from './protocol';

async function compute(): Promise<void> {
  try {
    const response = await fetch(new URL('./weights.f64', import.meta.url));

    if (!response.ok) throw new Error(`The shipped edge times could not load (HTTP ${response.status}).`);

    const result = solveRoutes(decodeWeights(await response.arrayBuffer()));
    const message: RouteResponse = { kind: 'computed', result };
    const buffers = [result.centre.distances.buffer, result.centre.predecessors.buffer, result.targets.buffer, result.tree.offsets.buffer, result.tree.vertices.buffer];

    for (const hunt of result.hunts) buffers.push(hunt.vertices.buffer);

    self.postMessage(message, { transfer: buffers });
  } catch (cause) {
    const message: RouteResponse = { kind: 'failed', reason: cause instanceof Error ? cause.message : String(cause) };
    self.postMessage(message);
  }
}

self.addEventListener('message', (event: MessageEvent<RouteRequest>) => {
  if (event.data.kind !== 'compute') throw new Error('The routes worker accepts only the full-grid calculation.');

  void compute();
});

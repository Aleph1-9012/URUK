import { exactCounts } from './math';
import type { CountsRequest, CountsResult } from './protocol';

self.addEventListener('message', (event: MessageEvent<CountsRequest>) => {
  const result: CountsResult = { kind: 'counts', counts: exactCounts(event.data.maxLength) };
  self.postMessage(result);
});

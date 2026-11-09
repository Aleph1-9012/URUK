/// <reference lib="webworker" />
import { DRAWN_MODES } from './data';
import { computeContour, referenceFor, type Contour } from './math';
import { MODE_PASS_INDICES, seedGrains, transportGrains, type SilentWorkerMessage } from './transport';

declare const self: DedicatedWorkerGlobalScope;

try {
  let before = seedGrains();
  let returnContour: Contour | undefined;

  for (const [index, modeIndex] of MODE_PASS_INDICES.entries()) {
    const mode = DRAWN_MODES[modeIndex];

    if (!mode) throw new RangeError('Every transport pass has a drawn mode.');

    const contour = index === 6 && returnContour ? returnContour : computeContour(mode);
    const measured = referenceFor(mode, contour);
    const reference = { ...measured, growth: measured.growth.slice(), perSquareLength: measured.perSquareLength.slice() };

    if (index === 3) returnContour = { mode: contour.mode, grid: contour.grid, length: contour.length, segments: contour.segments.slice(), paths: contour.paths.map(path => path.slice()) };

    const tracks = transportGrains(contour, before);
    before = tracks.after.slice();
    const buffers = [contour.segments.buffer, ...contour.paths.map(path => path.buffer), tracks.ids.buffer, tracks.times.buffer, tracks.positions.buffer, tracks.before.buffer, tracks.after.buffer, reference.growth.buffer, reference.perSquareLength.buffer];
    // SAFETY: Every buffer is allocated by the contour/transport constructors in this worker, never SharedArrayBuffer.
    const transfer = buffers as ArrayBuffer[];
    const message: SilentWorkerMessage = { kind: 'mode', index, modeIndex, contour, tracks, reference };
    self.postMessage(message, transfer);
  }

  const complete: SilentWorkerMessage = { kind: 'complete' };
  self.postMessage(complete);
} catch (cause) {
  const message: SilentWorkerMessage = { kind: 'error', message: cause instanceof Error ? cause.message : String(cause) };
  self.postMessage(message);
}

import { expect, test } from 'bun:test';
import { breezeOffsets } from '../src/motion/water/breeze';

const cases = [
  { scale: 1, pixelRatio: 2 },
  { scale: 0.46, pixelRatio: 3 },
] as const;
const elapsedTimes = [2000, 5000, 12345] as const;

test('breeze begins at the approved still', () => {
  const offsets = breezeOffsets({
    rows: 650,
    pixelRatio: 2,
    scale: 1,
    elapsedMs: 0,
  });

  expect(offsets.every((offset) => offset === 0)).toBe(true);
});

test('breeze offsets stay integral and within the scale bound', () => {
  for (const input of cases) {
    for (const elapsedMs of elapsedTimes) {
      const offsets = breezeOffsets({
        rows: 650,
        pixelRatio: input.pixelRatio,
        scale: input.scale,
        elapsedMs,
      });
      const limit = Math.ceil(3 * input.scale * input.pixelRatio);

      for (const offset of offsets) {
        expect(Number.isInteger(offset)).toBe(true);
        expect(Math.abs(offset)).toBeLessThanOrEqual(limit);
      }
    }
  }
});

test('the waterline row never moves', () => {
  for (const input of cases) {
    for (const elapsedMs of elapsedTimes) {
      const offsets = breezeOffsets({
        rows: 650,
        pixelRatio: input.pixelRatio,
        scale: input.scale,
        elapsedMs,
      });

      expect(offsets[0]).toBe(0);
    }
  }
});

test('breeze offsets are not all zero after the ramp', () => {
  const offsets = breezeOffsets({
    rows: 650,
    pixelRatio: 2,
    scale: 1,
    elapsedMs: 5000,
  });

  expect(offsets.some((offset) => offset !== 0)).toBe(true);
});

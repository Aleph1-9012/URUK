import { mix, smooth } from '../../../lib/animation';

export function openingShift(time: number): { shift: number; position: number; settled: boolean } {
  if (time < 1200) return { shift: 0, position: 0, settled: true };

  const fast = time >= 7500;
  const index = fast ? Math.min(8, Math.floor((time - 7500) / 780)) : Math.min(2, Math.floor((time - 1200) / 2100));
  const shift = fast ? index + 4 : index + 1;
  const start = fast ? 7500 + index * 780 : 1200 + index * 2100;
  const end = start + (fast ? 240 : 350);

  return { shift, position: mix(shift - 1, shift, smooth(time, start, end)), settled: time >= end };
}

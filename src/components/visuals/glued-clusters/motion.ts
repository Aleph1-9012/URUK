import { mix, smooth } from '../../../lib/animation';

const SAMPLE_STOPS = [
  [6750, .30], [7700, .40], [8600, .45], [9500, .50],
  [10400, .55], [11300, .60], [12300, .70], [14500, .50],
] as const;

export function pAt(time: number): number {
  if (time < 6750) return .30 * smooth(time, 0, 6400);

  if (time < 14500) {
    for (let index = 0; index < SAMPLE_STOPS.length - 1; index++) {
      const from = SAMPLE_STOPS[index];
      const to = SAMPLE_STOPS[index + 1];

      if (from && to && time < to[0]) return mix(from[1], to[1], smooth(time, from[0], to[0]));
    }
  }

  if (time >= 69250 && time < 76250) return mix(.5, .75, smooth(time, 69250, 70250));
  if (time >= 76250 && time < 77500) return mix(.75, .5, smooth(time, 76250, 77500));
  if (time >= 91500 && time < 111750) return mix(.5, .49, smooth(time, 91500, 92500));

  return .5;
}

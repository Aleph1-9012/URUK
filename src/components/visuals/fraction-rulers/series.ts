export type SeriesData = {
  indices: Uint32Array<ArrayBuffer>;
  totals: Float64Array<ArrayBuffer>;
  beforeJump: number;
  afterJump: number;
  throughTenThousand: number;
  total: number;
};

// Run in a worker. Angles are radians; checkpoint terms survive the logarithmic sampling.
export function computeSeries(last = 2_000_000, count = 2000): SeriesData {
  if (!Number.isSafeInteger(last) || last < 10000 || last > 0xffff_ffff) {
    throw new RangeError('The series endpoint must be an integer from 10,000 to 4,294,967,295.');
  }

  if (!Number.isSafeInteger(count) || count < 2) {
    throw new RangeError('The series needs at least two logarithmic samples.');
  }

  const samples = new Set([1, 354, 355, 10000, last]);
  const logLast = Math.log(last);

  for (let index = 0; index < count; index += 1) {
    samples.add(Math.min(last, Math.round(Math.exp(logLast * index / (count - 1)))));
  }

  const indices = Uint32Array.from([...samples].sort((a, b) => a - b));
  const totals = new Float64Array(indices.length);
  let total = 0;
  let correction = 0;
  let nextSample = 0;
  let beforeJump = 0;
  let afterJump = 0;
  let throughTenThousand = 0;

  for (let n = 1; n <= last; n += 1) {
    const sine = Math.sin(n);
    const term = 1 / (n * n * n * sine * sine);
    const corrected = term - correction;
    const updated = total + corrected;
    correction = updated - total - corrected;
    total = updated;

    if (n === 354) beforeJump = total;
    if (n === 355) afterJump = total;
    if (n === 10000) throughTenThousand = total;

    if (n === indices[nextSample]) {
      totals[nextSample] = total;
      nextSample += 1;
    }
  }

  return { indices, totals, beforeJump, afterJump, throughTenThousand, total };
}

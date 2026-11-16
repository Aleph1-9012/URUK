export type SpeedRow = { readonly n: number; readonly momentum: number; readonly velocity: number; readonly oneMinusVelocity: number };

export type GapRow = { readonly n: number; readonly gap: number };

export type SumCheckpoint = { readonly n: number; readonly time: number };

export type HorizonCrossing = SumCheckpoint & { readonly horizon: number };

/** A read-only numeric view; mutation methods of the backing typed array stay private. */
export type PartialSums = { readonly [index: number]: number; readonly length: number };

export function gapAt(n: number): number {
  if (!Number.isSafeInteger(n) || n < 1) throw new RangeError('A doubling gap needs a positive integer rung.');

  return 1 / (n * Math.LN2 + Math.log(1024 + 2 ** (1 - n)));
}

export function lowerHarmonicGap(n: number): number {
  if (!Number.isSafeInteger(n) || n < 1) throw new RangeError('The harmonic comparison starts at rung one.');

  return 1 / ((n + 11) * Math.LN2);
}

function computeDoublingClockModel() {
  const limit = 100000;
  const speeds: SpeedRow[] = [];
  const gaps: GapRow[] = [];
  const partialSums = new Float64Array(limit + 1);
  const checkpoints: SumCheckpoint[] = [];
  const crossings: HorizonCrossing[] = [];
  let time = 0;
  let target = 1;

  for (let n = 0; n <= 12; n++) {
    const momentum = 2 ** n;
    const energy = Math.hypot(1, momentum);
    const oneMinusVelocity = 1 / (energy * (energy + momentum));
    speeds.push(Object.freeze({ n, momentum, velocity: 1 - oneMinusVelocity, oneMinusVelocity }));
  }

  for (let n = 1; n <= limit; n++) {
    const gap = gapAt(n);
    time += gap;
    partialSums[n] = time;

    if (n <= 12) gaps.push(Object.freeze({ n, gap }));

    while (target <= 8 && time > target) {
      crossings.push(Object.freeze({ horizon: target, n, time }));
      target++;
    }

    if (n === 10 || n === 100 || n === 1000 || n === 10000 || n === limit) checkpoints.push(Object.freeze({ n, time }));
  }

  const sums: PartialSums = partialSums;

  return Object.freeze({
    speeds: Object.freeze(speeds),
    gaps: Object.freeze(gaps),
    partialSums: sums,
    checkpoints: Object.freeze(checkpoints),
    crossings: Object.freeze(crossings),
    limit,
  });
}

export type DoublingClockModel = ReturnType<typeof computeDoublingClockModel>;

let cachedModel: DoublingClockModel | undefined;

export function buildDoublingClockModel(): DoublingClockModel {
  if (!cachedModel) cachedModel = computeDoublingClockModel();

  return cachedModel;
}

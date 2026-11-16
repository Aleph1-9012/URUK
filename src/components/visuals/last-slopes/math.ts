export type PrimitiveSlope = { p: number; q: number };

export type SlopeMark = PrimitiveSlope & { label: string; angle: number; x: number; y: number };

export type WindowSlope = SlopeMark & { niWu: boolean; hanselman: boolean; dlme: boolean; oppositeIndex: number };

export type TorusCurvePoint = { t: number; longitude: number; meridian: number; x: number; y: number; z: number };

export function normalizeSlope(p: number, q: number): PrimitiveSlope {
  if (!Number.isSafeInteger(p) || !Number.isSafeInteger(q) || (p === 0 && q === 0)) throw new RangeError('A slope needs two safe integer coefficients, not both zero.');

  if (q === 0) return { p: 1, q: 0 };
  if (p === 0) return { p: 0, q: 1 };

  let first = Math.abs(p);
  let second = Math.abs(q);

  while (second !== 0) {
    const remainder = first % second;
    first = second;
    second = remainder;
  }

  return { p: (q < 0 ? -p : p) / first, q: Math.abs(q) / first };
}

export function slopeMark(input: PrimitiveSlope): SlopeMark {
  const { p, q } = normalizeSlope(input.p, input.q);
  const angle = 2 * Math.atan2(p, q);

  return {
    p,
    q,
    label: q === 0 ? '∞' : q === 1 ? String(p) : `${p}/${q}`,
    angle,
    x: q === 0 || p === 0 ? 0 : Math.sin(angle),
    y: q === 0 ? -1 : p === 0 ? 1 : Math.cos(angle),
  };
}

/** Primitive endpoint curve only. Marker travel does not interpolate p or q. */
export function torusCurve(input: PrimitiveSlope, steps = 384) {
  const slope = normalizeSlope(input.p, input.q);

  if (slope.p !== input.p || slope.q !== input.q) throw new RangeError('Draw the normalized primitive representative as one closed boundary curve.');
  if (!Number.isSafeInteger(steps) || steps < 4 * Math.max(Math.abs(slope.p), slope.q, 1)) throw new RangeError('The curve sampling must resolve both integer windings.');

  const majorRadius = 1;
  const minorRadius = .32;
  const points: TorusCurvePoint[] = [];

  for (let index = 0; index <= steps; index++) {
    const t = index / steps;
    const longitude = slope.q * t;
    const meridian = slope.p * t;
    const theta = index === steps ? 0 : 2 * Math.PI * longitude;
    const phi = index === steps ? 0 : 2 * Math.PI * meridian;
    const radial = majorRadius + minorRadius * Math.cos(phi);
    points.push({ t, longitude, meridian, x: radial * Math.cos(theta), y: radial * Math.sin(theta), z: minorRadius * Math.sin(phi) });
  }

  return {
    slope,
    majorRadius,
    minorRadius,
    points,
    liftedEndpoint: { longitude: slope.q, meridian: slope.p },
    windingCounts: { longitude: slope.q, meridian: Math.abs(slope.p) },
    intersections: { withMeridian: slope.q, withLongitude: Math.abs(slope.p) },
  };
}

export function buildLastSlopesModel() {
  const bound = 13;
  const window: WindowSlope[] = [];
  const stages: Record<'window' | 'niWu' | 'hanselman' | 'dlme', number[]> = { window: [], niWu: [], hanselman: [], dlme: [] };
  const oppositePairs: { positiveIndex: number; negativeIndex: number }[] = [];

  for (let p = 1; p <= bound; p++) {
    for (let q = 1; q <= bound; q++) {
      const reduced = normalizeSlope(p, q);

      if (reduced.p !== p || reduced.q !== q) continue;

      const positiveIndex = window.length;
      const negativeIndex = positiveIndex + 1;
      const niWu = (q * q + 1) % p === 0;
      const hanselman = niWu && (p === 1 || (p === 2 && q === 1));
      const dlme = hanselman && p === 2;

      for (const sign of [1, -1]) {
        const index = window.length;
        window.push({ ...slopeMark({ p: sign * p, q }), niWu, hanselman, dlme, oppositeIndex: sign === 1 ? negativeIndex : positiveIndex });
        stages.window.push(index);

        if (niWu) stages.niWu.push(index);
        if (hanselman) stages.hanselman.push(index);
        if (dlme) stages.dlme.push(index);
      }

      oppositePairs.push({ positiveIndex, negativeIndex });
    }
  }

  const lastSlopes = stages.dlme.map(index => {
    const entry = window[index];

    if (!entry) throw new Error('Each last toy-window slope must remain in the generated window.');

    return { p: entry.p, q: entry.q };
  });
  lastSlopes.sort((a, b) => a.p - b.p);

  return {
    bound,
    window,
    stages,
    counts: { window: stages.window.length, niWu: stages.niWu.length, hanselman: stages.hanselman.length, daemiLidmanMillerEismeier: stages.dlme.length },
    oppositePairs,
    lastSlopes,
    special: { zero: slopeMark({ p: 0, q: 1 }), infinity: slopeMark({ p: 1, q: 0 }) },
    examples: { one: slopeMark({ p: 1, q: 1 }), two: slopeMark({ p: 2, q: 1 }), half: slopeMark({ p: 1, q: 2 }), negativeTwo: slopeMark({ p: -2, q: 1 }) },
  };
}

export type LastSlopesModel = ReturnType<typeof buildLastSlopesModel>;

export type BoundaryCurve = ReturnType<typeof torusCurve>;

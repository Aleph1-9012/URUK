export type CandidateKind = 'ball' | 'tube' | 'slab';

export type SectionPoint = { x: number; y: number };

export type CandidateProfile = {
  volume: number;
  reducedVolume: number;
  complement: boolean;
  graphExtension: boolean;
  ballArea: number;
  tubeArea: number;
  slabArea: number;
  ballRadius: number;
  tubeRadius: number;
  slabWidth: number;
  candidate: CandidateKind | null;
  tiedCandidates: CandidateKind[];
  area: number;
};

export type CandidateTransition = { volume: number; area: number; from: CandidateKind; to: CandidateKind };

export function profileAt(volume: number): CandidateProfile {
  if (!Number.isFinite(volume) || volume < 0 || volume > 1) throw new RangeError('The unit-torus volume must lie between zero and one.');

  const reducedVolume = Math.min(volume, 1 - volume);
  const ballRadius = Math.cbrt(3 * reducedVolume / (4 * Math.PI));
  const tubeRadius = Math.sqrt(reducedVolume / Math.PI);
  const ballArea = (36 * Math.PI) ** (1 / 3) * reducedVolume ** (2 / 3);
  const tubeArea = 2 * Math.sqrt(Math.PI * reducedVolume);
  const slabArea = 2;
  const area = Math.min(ballArea, tubeArea, slabArea);
  const graphExtension = volume === 0 || volume === 1;
  let candidate: CandidateKind | null = null;
  const tiedCandidates: CandidateKind[] = [];

  if (!graphExtension) {
    // This tolerance identifies numerical ties of the candidate formulas only.
    for (const [kind, value] of [['ball', ballArea], ['tube', tubeArea], ['slab', slabArea]] as const) {
      if (Math.abs(value - area) <= 1e-12 * Math.max(value, area)) tiedCandidates.push(kind);
    }

    candidate = tiedCandidates[0] ?? null;
  }

  return {
    volume,
    reducedVolume,
    complement: volume > .5,
    graphExtension,
    ballArea,
    tubeArea,
    slabArea,
    ballRadius,
    tubeRadius,
    slabWidth: reducedVolume,
    candidate,
    tiedCandidates,
    area,
  };
}

function candidateArea(kind: CandidateKind, volume: number): number {
  const point = profileAt(volume);

  switch (kind) {
    case 'ball': return point.ballArea;
    case 'tube': return point.tubeArea;
    case 'slab': return point.slabArea;
  }
}

function intersection(first: CandidateKind, second: CandidateKind, low: number, high: number): number {
  let left = low;
  let right = high;
  let leftDifference = candidateArea(first, left) - candidateArea(second, left);
  const rightDifference = candidateArea(first, right) - candidateArea(second, right);

  if (leftDifference * rightDifference >= 0) throw new Error('The positive candidate intersection needs a strict sign-changing bracket.');

  for (let iteration = 0; iteration < 64; iteration++) {
    const middle = (left + right) / 2;
    const difference = candidateArea(first, middle) - candidateArea(second, middle);

    if (difference === 0) return middle;

    if (leftDifference * difference < 0) right = middle;
    else {
      left = middle;
      leftDifference = difference;
    }
  }

  return (left + right) / 2;
}

/** Distance in one unit periodic coordinate, independent of the chosen lift. */
export function periodicDistance(first: number, second: number): number {
  if (!Number.isFinite(first) || !Number.isFinite(second)) throw new RangeError('Periodic coordinates must be finite.');

  const offset = ((first - second) % 1 + 1) % 1;

  return Math.min(offset, 1 - offset);
}

/** Euclidean ball section at a signed offset from its centre, not a volume. */
export function ballSectionRadius(radius: number, offset: number): number {
  if (!Number.isFinite(radius) || radius < 0 || radius >= .5 || !Number.isFinite(offset)) throw new RangeError('This section helper covers embedded balls of radius less than one half.');

  return Math.sqrt(Math.max(0, radius * radius - offset * offset));
}

/** Lifted discs that meet the unit square; the renderer clips each at its sides. */
export function periodicDiscCopies(center: SectionPoint, radius: number): SectionPoint[] {
  if (!Number.isFinite(center.x) || !Number.isFinite(center.y) || !Number.isFinite(radius) || radius < 0 || radius >= .5) throw new RangeError('Periodic sections need finite centres and embedded disc radii below one half.');

  if (radius === 0) return [];

  const x = ((center.x % 1) + 1) % 1;
  const y = ((center.y % 1) + 1) % 1;
  const copies: SectionPoint[] = [];

  for (const dx of [-1, 0, 1]) {
    for (const dy of [-1, 0, 1]) {
      const point = { x: x + dx, y: y + dy };
      const gapX = Math.max(0, -point.x, point.x - 1);
      const gapY = Math.max(0, -point.y, point.y - 1);

      if (gapX * gapX + gapY * gapY < radius * radius) copies.push(point);
    }
  }

  return copies;
}

export function buildBallTubeSlabModel() {
  const firstVolume = intersection('ball', 'tube', .01, .5);
  const secondVolume = intersection('tube', 'slab', .2, .5);
  const otherVolume = intersection('ball', 'slab', .1, .5);
  const firstPoint = profileAt(firstVolume);
  const secondPoint = profileAt(secondVolume);
  const otherPoint = profileAt(otherVolume);
  const transitions: CandidateTransition[] = [
    { volume: firstVolume, area: firstPoint.area, from: 'ball', to: 'tube' },
    { volume: secondVolume, area: secondPoint.area, from: 'tube', to: 'slab' },
  ];
  const volumes = Array.from({ length: 501 }, (_, index) => index / 1000);
  volumes.push(firstVolume, secondVolume, otherVolume);
  volumes.sort((a, b) => a - b);
  const curve = volumes.map(profileAt);
  const branchOrder: CandidateKind[] = [];

  for (const point of curve) {
    if (point.candidate && point.candidate !== branchOrder.at(-1)) branchOrder.push(point.candidate);
  }

  return {
    curve,
    transitions,
    otherIntersection: { volume: otherVolume, area: otherPoint.ballArea, lowerCandidate: 'tube' as const, lowerArea: otherPoint.tubeArea },
    first: {
      volume: firstVolume,
      area: firstPoint.area,
      ballRadius: firstPoint.ballRadius,
      tubeRadius: firstPoint.tubeRadius,
      ballVolume: 4 * Math.PI * firstPoint.ballRadius ** 3 / 3,
      tubeVolume: Math.PI * firstPoint.tubeRadius ** 2,
    },
    second: { volume: secondVolume, area: secondPoint.area, tubeRadius: secondPoint.tubeRadius, slabWidth: secondPoint.slabWidth },
    branchOrder,
  };
}

export type BallTubeSlabModel = ReturnType<typeof buildBallTubeSlabModel>;

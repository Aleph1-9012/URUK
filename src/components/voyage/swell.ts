export interface Course {
  start: number;
  distance: number;
  duration: number;
  boatWidth: number;
}

export interface Pose {
  /** Left edge of the hull, in CSS pixels. */
  x: number;
  /** Rise of the waterline above the calm river, in CSS pixels. */
  heave: number;
  /** Bow-up angle, in radians. */
  pitch: number;
}

/** The boat's width, and the depth of its lane below the horizon, as fractions of the plate's width. */
export const BOAT_SCALE = 0.42;
export const WATERLINE = 0.22;

/** Where the hull meets the water, as fractions of the boat's width from its stern. */
export const KEEL = { stern: 0.08, bow: 0.84 } as const;

/** Crest height and wavelength in boat widths, period in milliseconds, and starting phase. */
const SWELL = [
  { height: 0.026, length: 1.55, period: 1700, phase: 0 },
  { height: 0.012, length: 0.72, period: 1150, phase: 1.9 },
  { height: 0.005, length: 0.31, period: 820, phase: 4.1 },
] as const;

const SURGE = 2.2;
const KEEL_SAMPLES = 9;

function swellPhase(
  train: (typeof SWELL)[number],
  x: number,
  elapsed: number,
  boatWidth: number,
): number {
  return 2 * Math.PI * (x / (train.length * boatWidth) - elapsed / train.period) + train.phase;
}

/** Height of the river surface above calm water at a point along the boat's lane. */
export function swellHeight(x: number, elapsed: number, boatWidth: number): number {
  let height = 0;

  for (const train of SWELL) {
    height += train.height * boatWidth * Math.cos(swellPhase(train, x, elapsed, boatWidth));
  }

  return height;
}

/** Forward drift of the long swell's water, which carries the boat on and holds it back in the troughs. */
function swellDrift(x: number, elapsed: number, boatWidth: number): number {
  const [train] = SWELL;

  return train.height * boatWidth * Math.sin(swellPhase(train, x, elapsed, boatWidth));
}

/** The hull's position and the straight waterline that best fits the swell beneath its keel. */
export function boatPose(course: Course, elapsed: number): Pose {
  const { start, distance, duration, boatWidth } = course;
  const progress = Math.min(1, Math.max(0, elapsed / duration));
  const track = start + distance * progress;
  const middle = (KEEL.stern + KEEL.bow) / 2;
  const x = track + SURGE * swellDrift(track + middle * boatWidth, elapsed, boatWidth);
  const centre = x + middle * boatWidth;
  let sum = 0;
  let moment = 0;
  let spread = 0;

  for (let index = 0; index < KEEL_SAMPLES; index += 1) {
    const along = KEEL.stern + (KEEL.bow - KEEL.stern) * index / (KEEL_SAMPLES - 1);
    const offset = (along - middle) * boatWidth;
    const height = swellHeight(centre + offset, elapsed, boatWidth);

    sum += height;
    moment += offset * height;
    spread += offset * offset;
  }

  return { x, heave: sum / KEEL_SAMPLES, pitch: Math.atan(moment / spread) };
}

export type Point = { x: number; y: number };

export type Edge = readonly [number, number];

export type Segment = { from: Point; to: Point };

export type LinkClass = { direction: Point; segments: Segment[] };

export type Complex = { re: number; im: number };

export const OPENING = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: .5, y: Math.sqrt(3) / 2 },
  { x: 2.3, y: .4 },
  { x: 1.7, y: 1.9 },
  { x: -.9, y: 1.4 },
  { x: .2, y: 2.6 },
  { x: 2.9, y: 2.2 },
] as const;

export const SQUARE = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
] as const;

export const DOUBLE_TRIANGLE = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1.5, y: Math.sqrt(3) / 2 },
  { x: .5, y: Math.sqrt(3) / 2 },
] as const;

export function unitPairs(points: readonly Point[]): Edge[] {
  const pairs: Edge[] = [];

  for (let a = 0; a < points.length; a++) {
    const from = points[a];

    if (!from) continue;

    for (let b = a + 1; b < points.length; b++) {
      const to = points[b];

      if (!to) continue;

      const squared = (to.x - from.x) ** 2 + (to.y - from.y) ** 2;

      if (Math.abs(squared - 1) < 1e-10) pairs.push([a, b]);
    }
  }

  return pairs;
}

export function shearGrid(side: number, angle: number): Point[] {
  const points: Point[] = [];
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) points.push({ x: x + y * cosine, y: y * sine });
  }

  return points;
}

// These are grid-index offsets. The diagonal is a unit link only once the
// second basis vector reaches 60 degrees; the two basis links stay unit length.
export function shearDirections(angle: number): Point[] {
  const directions = [{ x: 1, y: 0 }, { x: 0, y: 1 }];

  if (Math.abs(angle - Math.PI / 3) < 1e-12) directions.push({ x: -1, y: 1 });

  return directions;
}

export function integerDirections(squaredRadius: number): Point[] {
  const extent = Math.floor(Math.sqrt(squaredRadius));
  const directions: Point[] = [];

  for (let x = -extent; x <= extent; x++) {
    const squaredY = squaredRadius - x * x;
    const y = Math.floor(Math.sqrt(squaredY));

    if (y * y !== squaredY) continue;

    directions.push({ x, y });

    if (y > 0) directions.push({ x, y: -y });
  }

  return directions;
}

export function directionClasses(squaredRadius: number): Point[] {
  const classes: Point[] = [];

  for (const direction of integerDirections(squaredRadius)) {
    if (direction.x > 0 || (direction.x === 0 && direction.y > 0)) classes.push(direction);
  }

  return classes;
}

export function circlePoints(squaredRadius: number): Point[] {
  return integerDirections(squaredRadius);
}

export function latticeLinkClasses(side: number, squaredRadius: number): LinkClass[] {
  const classes: LinkClass[] = [];

  for (const direction of directionClasses(squaredRadius)) {
    const segments: Segment[] = [];

    for (let y = Math.max(0, -direction.y); y < Math.min(side, side - direction.y); y++) {
      for (let x = Math.max(0, -direction.x); x < Math.min(side, side - direction.x); x++) {
        segments.push({ from: { x, y }, to: { x: x + direction.x, y: y + direction.y } });
      }
    }

    classes.push({ direction, segments });
  }

  return classes;
}

export function latticeLinkCount(side: number, squaredRadius: number): number {
  let count = 0;

  for (const direction of directionClasses(squaredRadius)) {
    count += Math.max(0, side - Math.abs(direction.x)) * Math.max(0, side - Math.abs(direction.y));
  }

  return count;
}

export function bestLatticeDistance(side: number): { squaredRadius: number; count: number } {
  const counts = new Map<number, number>();

  for (let x = 0; x < side; x++) {
    for (let y = x === 0 ? 1 : 1 - side; y < side; y++) {
      const squaredRadius = x * x + y * y;
      const count = (side - x) * (side - Math.abs(y));
      counts.set(squaredRadius, (counts.get(squaredRadius) ?? 0) + count);
    }
  }

  let best = { squaredRadius: 0, count: 0 };

  for (const [squaredRadius, count] of counts) {
    if (count > best.count || (count === best.count && squaredRadius < best.squaredRadius)) {
      best = { squaredRadius, count };
    }
  }

  return best;
}

export function multiply(left: Complex, right: Complex): Complex {
  return { re: left.re * right.re - left.im * right.im, im: left.re * right.im + left.im * right.re };
}

export function divide(left: Complex, right: Complex): Complex {
  const denominator = right.re ** 2 + right.im ** 2;

  return {
    re: (left.re * right.re + left.im * right.im) / denominator,
    im: (left.im * right.re - left.re * right.im) / denominator,
  };
}

export const UNIT_JUMPS = integerDirections(25).map(point => ({ x: point.x / 5, y: point.y / 5 }));

export const EXAMPLE_JUMP = { re: 3 / 5, im: 4 / 5 } as const;

export const RECIPROCAL_JUMP = { re: 3 / 5, im: -4 / 5 } as const;

export const SECOND_JUMP = { re: 4 / 5, im: 3 / 5 } as const;

export const EXAMPLE_RATIO = divide(EXAMPLE_JUMP, SECOND_JUMP);

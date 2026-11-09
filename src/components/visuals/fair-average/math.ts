export type Point = { x: number; y: number };

export type Interval = { start: number; end: number };

export type PiecewiseMap = readonly Point[];

const X0 = [{ x: 0, y: 0 }, { x: .5, y: .25 }, { x: .75, y: .5 }, { x: 1, y: 1 }] as const;

const X1 = [{ x: 0, y: 0 }, { x: .5, y: .5 }, { x: .75, y: .625 }, { x: .875, y: .75 }, { x: 1, y: 1 }] as const;

export function mapValue(map: PiecewiseMap, x: number): number {
  for (let index = 1; index < map.length; index++) {
    const from = map[index - 1];
    const to = map[index];

    if (from && to && x <= to.x) return from.y + (to.y - from.y) * (x - from.x) / (to.x - from.x);
  }

  return map[map.length - 1]?.y ?? 0;
}

export function invertMap(map: PiecewiseMap): Point[] {
  return map.map((point) => ({ x: point.y, y: point.x }));
}

export function composeMaps(outer: PiecewiseMap, inner: PiecewiseMap): Point[] {
  const inverse = invertMap(inner);
  const breaks = new Set<number>();

  for (const point of inner) breaks.add(point.x);
  for (const point of outer) breaks.add(mapValue(inverse, point.x));

  const result: Point[] = [];

  for (const x of Array.from(breaks).sort((left, right) => left - right)) {
    const point = { x, y: mapValue(outer, mapValue(inner, x)) };
    const previous = result[result.length - 1];
    const before = result[result.length - 2];

    if (previous && before && Math.abs((previous.y - before.y) * (point.x - previous.x) - (point.y - previous.y) * (previous.x - before.x)) < 1e-14) result.pop();

    result.push(point);
  }

  return result;
}

export const MAPS = {
  x0: X0,
  x1: X1,
  composite: composeMaps(X0, X1),
  inverse: invertMap(X0),
  transport: [{ x: 0, y: 0 }, { x: .125, y: .25 }, { x: .25, y: .375 }, { x: .5, y: .625 }, { x: .75, y: .75 }, { x: 1, y: 1 }],
} as const;

export type MapName = keyof typeof MAPS;

export function mapSlopes(map: PiecewiseMap): number[] {
  const slopes: number[] = [];

  for (let index = 1; index < map.length; index++) {
    const from = map[index - 1];
    const to = map[index];

    if (from && to) slopes.push((to.y - from.y) / (to.x - from.x));
  }

  return slopes;
}

export const PARENTS = [{ start: .25, end: .375 }, { start: .625, end: .75 }, { start: .875, end: .9375 }] as const;

export const DESCENDANTS = PARENTS.map((parent) => PARENTS.map((child) => ({
  start: parent.start + (parent.end - parent.start) * child.start,
  end: parent.start + (parent.end - parent.start) * child.end,
})));

export const CUTTINGS = [
  [0, .25, .375, .5, .75, 1],
  [0, .125, .25, .5, .75, .875, 1],
  [0, .5, .625, .75, 1],
] as const;

export const TRANSPORT_SOURCES = [{ start: .125, end: .25 }, { start: .5, end: .75 }] as const;

export const TRANSPORT_TARGETS = [PARENTS[0], PARENTS[1]] as const;

export type Move = 'a' | 'A' | 'b' | 'B';

const INVERSE: Record<Move, Move> = { a: 'A', A: 'a', b: 'B', B: 'b' };

const LETTERS = ['a', 'A', 'b', 'B'] as const;

export function leftMultiply(letter: Move, word: string): string {
  return word.startsWith(INVERSE[letter]) ? word.slice(1) : letter + word;
}

export function freeBall(radius: number): readonly string[] {
  const ball: string[] = [''];

  for (let index = 0; index < ball.length; index++) {
    const word = ball[index];

    if (word === undefined || word.length >= radius) continue;

    for (const letter of LETTERS) {
      if (!word.endsWith(INVERSE[letter])) ball.push(word + letter);
    }
  }

  return ball;
}

export function freeBallSize(radius: number): number {
  return 2 * 3 ** radius - 1;
}

export function integerShare(length: number): number {
  return 2 / length;
}

export function freeShare(radius: number): number {
  return 2 * 3 ** radius / freeBallSize(radius);
}

export const FREE_BALLS = [2, 4, 6, 8].map((radius) => ({ radius, size: freeBallSize(radius), changed: 2 * 3 ** radius, share: freeShare(radius) }));

export const WHOLE_RUNS = [5, 10, 20, 40].map((length) => ({ length, changed: 2, share: integerShare(length) }));

// This continuous affine map sends the unit disk into the radius-.5 disk about
// (.4,0), and therefore into the unit disk. Its fixed point is exact in decimals.
export function diskMap(point: Point): Point {
  return { x: .4 - .5 * point.y, y: .5 * point.x };
}

export const FIXED_POINT = { x: .32, y: .16 } as const;

export const DISPLACEMENT = .5;

// No numerical L is supplied by the article, so the film must not turn this
// expression into a numerical floor. Its drawn height is explicitly schematic.
export const FLOOR_FORMULA = String.raw`\frac{\delta^2/L^2-4/D}{4(1-1/D)}>0`;

export const DIMENSION_CONDITION = String.raw`D>16L^2`;

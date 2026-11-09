// Thompson's maps, the 248 page's Plate I. A map is given by its breakpoints: `from[i]` goes to `to[i]`, straight in between.
export type ThompsonMap = {
  name: string;
  spoken: string;
  from: readonly number[];
  to: readonly number[];
};

// x₀ squeezes [0, 1/2] onto [0, 1/4] and stretches the rest to make up; x₁ does the same inside [1/2, 1].
export const x0: ThompsonMap = { name: 'x₀', spoken: 'x nought', from: [0, 1 / 2, 3 / 4, 1], to: [0, 1 / 4, 1 / 2, 1] };

export const x1: ThompsonMap = { name: 'x₁', spoken: 'x one', from: [0, 1 / 2, 3 / 4, 7 / 8, 1], to: [0, 1 / 2, 5 / 8, 3 / 4, 1] };

export const x0Inverse: ThompsonMap = { name: 'x₀⁻¹', spoken: 'x nought inverse', from: x0.to, to: x0.from };

// One band per map, top to bottom, as in the approved 62b plate.
export const bandMaps = [x0, x1, x0, x1, x0Inverse, x1, x0, x1] as const;

export const BAND_COUNT = bandMaps.length;

// The drawing's frame, in the plate's 760 × 560 units.
export const VIEW = { width: 760, height: 560 } as const;

const LEFT = 30;
const RIGHT = 730;
const TOP = 40;
export const BAND_HEIGHT = 60;
// The top line is marked at every 1/32, so each band shows how the maps move 32 equal pieces.
const TICK_COUNT = 33;

export function apply(map: ThompsonMap, t: number): number {
  for (let index = 1; index < map.from.length; index += 1) {
    const start = map.from[index - 1];
    const end = map.from[index];
    const image = map.to[index - 1];
    const imageEnd = map.to[index];

    if (start === undefined || end === undefined || image === undefined || imageEnd === undefined) {
      break;
    }

    if (t <= end) {
      return image + ((t - start) * (imageEnd - image)) / (end - start);
    }
  }

  throw new RangeError(`${map.name} is defined on [0, 1], not at ${t}.`);
}

export function trackLines(): number[][] {
  const lines = [Array.from({ length: TICK_COUNT }, (_, index) => index / (TICK_COUNT - 1))];

  for (const map of bandMaps) {
    const previous = lines.at(-1) ?? [];
    lines.push(previous.map((t) => apply(map, t)));
  }

  return lines;
}

function x(t: number): number {
  return LEFT + t * (RIGHT - LEFT);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export type Band = {
  map: ThompsonMap;
  pieces: string[];
  strands: string[];
};

export function bands(): Band[] {
  const lines = trackLines();

  return bandMaps.map((map, row) => {
    const top = TOP + row * BAND_HEIGHT;
    const bottom = top + BAND_HEIGHT;
    const above = lines[row] ?? [];
    const below = lines[row + 1] ?? [];
    const pieces: string[] = [];
    const strands: string[] = [];

    for (let index = 0; index < above.length; index += 1) {
      const a = above[index];
      const b = below[index];

      if (a === undefined || b === undefined) {
        continue;
      }

      strands.push(`M${round(x(a))} ${top}L${round(x(b))} ${bottom}`);

      const nextA = above[index + 1];
      const nextB = below[index + 1];

      if (index % 2 === 0 && nextA !== undefined && nextB !== undefined) {
        pieces.push(`${round(x(a))},${top} ${round(x(nextA))},${top} ${round(x(nextB))},${bottom} ${round(x(b))},${bottom}`);
      }
    }

    return { map, pieces, strands };
  });
}

export function ruleY(line: number): number {
  return TOP + line * BAND_HEIGHT;
}

export const RULE_LEFT = LEFT;

export const RULE_RIGHT = RIGHT;

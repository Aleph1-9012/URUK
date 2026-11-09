// Ink lines of a complex function on a rectangle of the plane, by marching squares on a sampled grid.
// Phase lines: where the value points in one of a few fixed directions. Size lines: where |value| is one of a few fixed sizes.
// The pieces from each cell are joined into polylines and thinned, in the plane's own coordinates.
import type { Complex } from './lfunctions';

export type Grid = { left: number; right: number; bottom: number; top: number; columns: number; rows: number };

// Polylines: x, y pairs, and the index of each line's first point. A line runs to the next one's first point.
export type Lines = { points: Float32Array<ArrayBuffer>; starts: Uint32Array<ArrayBuffer> };

// How far a thinned line may stray from the computed one, as a share of a cell: under a third of a pixel at the closest view.
const TOLERANCE = 0.05;

// Values at the (columns + 1) × (rows + 1) nodes, row by row from the bottom, real and imaginary parts interleaved.
export type Samples = Float64Array<ArrayBuffer>;

export function sample(grid: Grid, evaluate: (real: number, imaginary: number) => Complex): Samples {
  const width = grid.columns + 1;
  const values = new Float64Array(width * (grid.rows + 1) * 2);

  for (let row = 0; row <= grid.rows; row += 1) {
    const imaginary = grid.bottom + (grid.top - grid.bottom) * row / grid.rows;

    for (let column = 0; column <= grid.columns; column += 1) {
      const value = evaluate(grid.left + (grid.right - grid.left) * column / grid.columns, imaginary);
      const at = (row * width + column) * 2;
      values[at] = value.re;
      values[at + 1] = value.im;
    }
  }

  return values;
}

// The zero line of one real field given at the nodes.
function march(grid: Grid, field: Float64Array, out: number[]): void {
  const width = grid.columns + 1;
  const stepX = (grid.right - grid.left) / grid.columns;
  const stepY = (grid.top - grid.bottom) / grid.rows;
  const crossings: number[] = [];

  for (let row = 0; row < grid.rows; row += 1) {
    const y = grid.bottom + row * stepY;

    for (let column = 0; column < grid.columns; column += 1) {
      const x = grid.left + column * stepX;
      const corner = row * width + column;
      // Counter-clockwise from the bottom left.
      const a = field[corner] ?? 0;
      const b = field[corner + 1] ?? 0;
      const c = field[corner + width + 1] ?? 0;
      const d = field[corner + width] ?? 0;

      if ((a > 0) === (b > 0) && (b > 0) === (c > 0) && (c > 0) === (d > 0)) continue;

      crossings.length = 0;

      if ((a > 0) !== (b > 0)) crossings.push(x + stepX * a / (a - b), y);
      if ((b > 0) !== (c > 0)) crossings.push(x + stepX, y + stepY * b / (b - c));
      if ((c > 0) !== (d > 0)) crossings.push(x + stepX * d / (d - c), y + stepY);
      if ((d > 0) !== (a > 0)) crossings.push(x, y + stepY * a / (a - d));

      if (crossings.length === 8) {
        // Four crossings, a saddle: the centre's sign decides which pairs join.
        const centreAgreesWithA = (a + b + c + d > 0) === (a > 0);
        const order = centreAgreesWithA ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 1, 6, 7, 2, 3, 4, 5];

        for (const index of order) {
          out.push(crossings[index] ?? 0);
        }
      } else {
        out.push(...crossings);
      }
    }
  }
}

// A crossing's place on its cell edge, as one number. The two cells beside an edge compute the same crossing.
function endKey(x: number, y: number): number {
  return Math.round(x * 1e6) * 2e8 + Math.round(y * 1e6);
}

function join(segments: readonly number[]): number[][] {
  const count = segments.length / 4;
  const ends = new Map<number, number[]>();

  for (let piece = 0; piece < count; piece += 1) {
    for (let side = 0; side < 2; side += 1) {
      const key = endKey(segments[4 * piece + 2 * side] ?? 0, segments[4 * piece + 2 * side + 1] ?? 0);
      const pieces = ends.get(key);

      if (pieces) pieces.push(piece);
      else ends.set(key, [piece]);
    }
  }

  const used = new Uint8Array(count);
  const follow = (x: number, y: number, out: number[]) => {
    let key = endKey(x, y);

    for (;;) {
      const piece = ends.get(key)?.find((candidate) => used[candidate] === 0);

      if (piece === undefined) return;

      used[piece] = 1;
      const base = 4 * piece;
      const forward = endKey(segments[base] ?? 0, segments[base + 1] ?? 0) === key;
      const nextX = (forward ? segments[base + 2] : segments[base]) ?? 0;
      const nextY = (forward ? segments[base + 3] : segments[base + 1]) ?? 0;
      out.push(nextX, nextY);
      key = endKey(nextX, nextY);
    }
  };
  const lines: number[][] = [];

  for (let piece = 0; piece < count; piece += 1) {
    if (used[piece] === 1) continue;

    used[piece] = 1;
    const base = 4 * piece;
    const ahead = [segments[base] ?? 0, segments[base + 1] ?? 0, segments[base + 2] ?? 0, segments[base + 3] ?? 0];
    const behind: number[] = [];
    follow(ahead[2] ?? 0, ahead[3] ?? 0, ahead);
    follow(ahead[0] ?? 0, ahead[1] ?? 0, behind);
    const line: number[] = [];

    for (let index = behind.length - 2; index >= 0; index -= 2) {
      line.push(behind[index] ?? 0, behind[index + 1] ?? 0);
    }

    for (const value of ahead) {
      line.push(value);
    }

    lines.push(line);
  }

  return lines;
}

// Ramer–Douglas–Peucker: drops points while the line stays within TOLERANCE of a cell of where it was.
function thin(line: readonly number[], cellX: number, cellY: number): number[] {
  const count = line.length / 2;

  if (count <= 2) return [...line];

  const keep = new Uint8Array(count);
  keep[0] = 1;
  keep[count - 1] = 1;
  const stack = [0, count - 1];

  while (stack.length > 0) {
    const last = stack.pop() ?? 0;
    const first = stack.pop() ?? 0;
    const startX = (line[2 * first] ?? 0) / cellX;
    const startY = (line[2 * first + 1] ?? 0) / cellY;
    const runX = (line[2 * last] ?? 0) / cellX - startX;
    const runY = (line[2 * last + 1] ?? 0) / cellY - startY;
    const run = Math.hypot(runX, runY);
    let farthest = -1;
    let distance = TOLERANCE;

    for (let index = first + 1; index < last; index += 1) {
      const offsetX = (line[2 * index] ?? 0) / cellX - startX;
      const offsetY = (line[2 * index + 1] ?? 0) / cellY - startY;
      const away = run > 0 ? Math.abs(offsetX * runY - offsetY * runX) / run : Math.hypot(offsetX, offsetY);

      if (away > distance) {
        distance = away;
        farthest = index;
      }
    }

    if (farthest >= 0) {
      keep[farthest] = 1;
      stack.push(first, farthest, farthest, last);
    }
  }

  const kept: number[] = [];

  for (let index = 0; index < count; index += 1) {
    if (keep[index] === 1) kept.push(line[2 * index] ?? 0, line[2 * index + 1] ?? 0);
  }

  return kept;
}

function trace(grid: Grid, field: Float64Array, lines: number[][]): void {
  const segments: number[] = [];
  march(grid, field, segments);

  for (const line of join(segments)) {
    lines.push(thin(line, (grid.right - grid.left) / grid.columns, (grid.top - grid.bottom) / grid.rows));
  }
}

export function pack(lines: readonly (readonly number[])[]): Lines {
  let total = 0;

  for (const line of lines) {
    total += line.length;
  }

  const points = new Float32Array(total);
  const starts = new Uint32Array(lines.length);
  let at = 0;

  for (const [index, line] of lines.entries()) {
    starts[index] = at / 2;
    points.set(line, at);
    at += line.length;
  }

  return { points, starts };
}

// Lines where the value points along one of `directions` evenly spaced angles in [0, π) or the opposite way.
// Two lines per direction meet at every simple zero and at a simple pole.
export function phaseLines(grid: Grid, values: Samples, directions: number): Lines {
  const count = values.length / 2;
  const field = new Float64Array(count);
  const lines: number[][] = [];

  for (let direction = 0; direction < directions; direction += 1) {
    const angle = Math.PI * direction / directions;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    for (let node = 0; node < count; node += 1) {
      field[node] = (values[2 * node + 1] ?? 0) * cos - (values[2 * node] ?? 0) * sin;
    }

    trace(grid, field, lines);
  }

  return pack(lines);
}

// Lines where log |value| equals each level; rings close in on zeros and on poles.
export function sizeLines(grid: Grid, values: Samples, levels: readonly number[]): Lines {
  const count = values.length / 2;
  const logarithms = new Float64Array(count);
  const field = new Float64Array(count);
  const lines: number[][] = [];

  for (let node = 0; node < count; node += 1) {
    logarithms[node] = Math.max(-40, Math.log(Math.hypot(values[2 * node] ?? 0, values[2 * node + 1] ?? 0)));
  }

  for (const level of levels) {
    for (let node = 0; node < count; node += 1) {
      field[node] = (logarithms[node] ?? 0) - level;
    }

    trace(grid, field, lines);
  }

  return pack(lines);
}

import catalog from './data/heads.json';

type Pattern = keyof typeof catalog;
export interface Head { x: number; y: number; sx: number; sy: number; width: number; height: number }

interface Course { pattern: Pattern; top: number; height: number; phase: number }
const coursesOutward = [
  { pattern: 'slant', height: 44 },
  { pattern: 'zigzag', height: 87 },
  { pattern: 'lozenge', height: 147 },
  { pattern: 'zigzag', height: 64 },
] as const;

/** Repeatable variation for this destination, including each cone's strike and release. */
export function destinationSeed(path: string): number {
  let seed = 2166136261;
  for (const letter of path) seed = Math.imul(seed ^ letter.charCodeAt(0), 16777619);
  return seed >>> 0;
}

export function noise(x: number, y: number, seed: number): number {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + seed;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function offset(course: Course, x: number): number {
  // Between the staggered rows of diamonds: high over one column and low over its neighbour.
  if (course.pattern === 'lozenge') return 18 * Math.cos(2 * Math.PI * ((x - course.phase) * 3 - 8) / catalog.lozenge.width);
  return 3.5 * Math.cos((x - course.phase) / 9) + 1.5 * Math.sin(x / 17);
}

export function* printedHeads(width: number, height: number, band: number, seed: number, minY = 0): Generator<Head> {
  const middle = Math.round(height / 2);
  for (const direction of [-1, 1]) {
    const courses: Course[] = [];
    let edge = middle + direction * band / 2;
    for (let i = 0; direction < 0 ? edge > -24 : edge < height + 24; i++) {
      const index = (i + (direction > 0 ? 1 : 0)) % coursesOutward.length;
      const course = coursesOutward[index];
      if (!course) break;
      courses.push({
        ...course, top: direction < 0 ? edge - course.height : edge, phase: Math.floor(noise(i, direction, seed) * 120),
      });
      edge += direction * course.height;
    }
    courses.sort((a, b) => a.top - b.top);
    for (const [index, course] of courses.entries()) {
      if (course.top + course.height + 24 < minY) continue;
      const tile = catalog[course.pattern];
      const w = tile.width / 3;
      const h = tile.height / 3;
      const before = courses[index - 1];
      const after = courses[index + 1];
      const upperEdge = before?.pattern === 'lozenge' ? before : course;
      const lowerEdge = course.pattern === 'lozenge' ? course : after ?? course;
      const nearestTop = !before && direction === 1;
      const nearestBottom = !after && direction === -1;
      const phaseY = course.pattern === 'lozenge' ? -6 : 0;
      // The vertical repeat is identical in every column. Only heads close to a band edge
      // need its scalloped boundary evaluated at their horizontal position.
      const rows = [];
      const upperRange = upperEdge.pattern === 'lozenge' ? 18 : 5;
      const lowerRange = lowerEdge.pattern === 'lozenge' ? 18 : 5;
      const top = course.top + 1.5;
      const bottom = course.top + course.height - 1.5;
      for (let row = -1; row <= Math.ceil(course.height / h); row++) {
        for (const [left, tileY, sx, sy, sw, sh] of tile.heads) {
          if (left === undefined || tileY === undefined || sx === undefined || sy === undefined || !sw || !sh) continue;
          const y = course.top + phaseY + row * h + tileY / 3;
          const cy = y + sh / 6;
          if (y + sh / 3 <= minY || y >= height || cy < top - upperRange || cy >= bottom + lowerRange) continue;
          rows.push({ left, y, cy, sx, sy, sw, sh });
        }
      }
      for (let col = Math.floor(-course.phase / w) - 1; col < (width - course.phase) / w + 1; col++) {
        const base = course.phase + col * w;
        for (const { left, y, cy, sx, sy, sw, sh } of rows) {
          const x = base + left / 3;
          if (x + sw / 3 <= 0 || x >= width) continue;
          const cx = x + sw / 6;
          if (cy < top + upperRange) {
            const upper = offset(upperEdge, cx);
            if (cy < course.top + (nearestTop ? Math.abs(upper) : upper) + 1.5) continue;
          }
          if (cy >= bottom - lowerRange) {
            const lower = offset(lowerEdge, cx);
            if (cy >= course.top + course.height + (nearestBottom ? -Math.abs(lower) : lower) - 1.5) continue;
          }
          yield { x, y, sx, sy, width: sw, height: sh };
        }
      }
    }
  }
}

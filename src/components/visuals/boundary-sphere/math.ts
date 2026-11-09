export type Point = { x: number; y: number };

export type Geodesic =
  | { kind: 'circle'; center: Point; radius: number; start: number; sweep: number }
  | { kind: 'diameter'; from: Point; to: Point };

const TAU = 2 * Math.PI;

export const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;

export const PENTAGON_RADIUS = Math.tanh(Math.acosh(1 / Math.tan(Math.PI / 5)) / 2);

export const SIDE_LENGTH = Math.acosh(GOLDEN_RATIO);

export const CENTRAL_PENTAGON = Array.from({ length: 5 }, (_, index) => {
  const angle = -Math.PI / 2 + index * TAU / 5;

  return { x: PENTAGON_RADIUS * Math.cos(angle), y: PENTAGON_RADIUS * Math.sin(angle) };
});

export function normSquared(point: Point): number {
  return point.x * point.x + point.y * point.y;
}

function multiply(left: Point, right: Point): Point {
  return { x: left.x * right.x - left.y * right.y, y: left.x * right.y + left.y * right.x };
}

function divide(numerator: Point, denominator: Point): Point {
  const divisor = normSquared(denominator);

  return {
    x: (numerator.x * denominator.x + numerator.y * denominator.y) / divisor,
    y: (numerator.y * denominator.x - numerator.x * denominator.y) / divisor,
  };
}

export function hyperbolicDistance(left: Point, right: Point): number {
  const dx = left.x - right.x;
  const dy = left.y - right.y;

  return Math.acosh(1 + 2 * (dx * dx + dy * dy) / ((1 - normSquared(left)) * (1 - normSquared(right))));
}

export function geodesic(from: Point, to: Point): Geodesic {
  const determinant = from.x * to.y - from.y * to.x;

  if (Math.abs(determinant) < 1e-12) return { kind: 'diameter', from, to };

  const first = (1 + normSquared(from)) / 2;
  const second = (1 + normSquared(to)) / 2;
  const center = {
    x: (first * to.y - second * from.y) / determinant,
    y: (second * from.x - first * to.x) / determinant,
  };
  const radius = Math.sqrt(Math.max(0, normSquared(center) - 1));
  const start = Math.atan2(from.y - center.y, from.x - center.x);
  let sweep = Math.atan2(to.y - center.y, to.x - center.x) - start;

  if (sweep > Math.PI) sweep -= TAU;
  if (sweep < -Math.PI) sweep += TAU;

  return { kind: 'circle', center, radius, start, sweep };
}

export function geodesicPoints(from: Point, to: Point, segments = 12): Point[] {
  const edge = geodesic(from, to);

  return Array.from({ length: segments + 1 }, (_, index) => {
    const progress = index / segments;

    if (edge.kind === 'diameter') {
      return { x: from.x + progress * (to.x - from.x), y: from.y + progress * (to.y - from.y) };
    }

    const angle = edge.start + edge.sweep * progress;

    return { x: edge.center.x + edge.radius * Math.cos(angle), y: edge.center.y + edge.radius * Math.sin(angle) };
  });
}

export function reflect(point: Point, edge: Geodesic): Point {
  if (edge.kind === 'diameter') {
    const dx = edge.to.x - edge.from.x;
    const dy = edge.to.y - edge.from.y;
    const scalar = (point.x * dx + point.y * dy) / (dx * dx + dy * dy);

    return { x: 2 * scalar * dx - point.x, y: 2 * scalar * dy - point.y };
  }

  const dx = point.x - edge.center.x;
  const dy = point.y - edge.center.y;
  const scalar = edge.radius * edge.radius / (dx * dx + dy * dy);

  return { x: edge.center.x + scalar * dx, y: edge.center.y + scalar * dy };
}

export type Tile = { center: Point; corners: readonly Point[]; depth: number };

function pointKey(point: Point): string {
  return `${Math.round(point.x * 1e8)},${Math.round(point.y * 1e8)}`;
}

export function makeTiling(depth = 4): Tile[] {
  const tiles: Tile[] = [{ center: { x: 0, y: 0 }, corners: CENTRAL_PENTAGON, depth: 0 }];
  const centers = new Set<string>(['0,0']);

  for (let index = 0; index < tiles.length; index++) {
    const tile = tiles[index];

    if (!tile || tile.depth === depth) continue;

    for (let side = 0; side < 5; side++) {
      const from = tile.corners[side];
      const to = tile.corners[(side + 1) % 5];

      if (!from || !to) continue;

      const edge = geodesic(from, to);
      const center = reflect(tile.center, edge);
      const key = pointKey(center);

      if (centers.has(key)) continue;

      centers.add(key);
      tiles.push({ center, corners: tile.corners.map((corner) => reflect(corner, edge)), depth: tile.depth + 1 });
    }
  }

  return tiles;
}

export const TILES = makeTiling();

export const TILING_VERTICES: Point[] = [];

const vertexKeys = new Set<string>();

for (const tile of TILES) {
  for (const corner of tile.corners) {
    const key = pointKey(corner);

    if (!vertexKeys.has(key)) {
      vertexKeys.add(key);
      TILING_VERTICES.push(corner);
    }
  }
}

export type TilingEdge = { from: Point; to: Point; points: readonly Point[]; depth: number };

export const TILING_EDGES: TilingEdge[] = [];

const edgeKeys = new Set<string>();

for (const tile of TILES) {
  for (let side = 0; side < 5; side++) {
    const from = tile.corners[side];
    const to = tile.corners[(side + 1) % 5];

    if (!from || !to) continue;

    const keys = [pointKey(from), pointKey(to)].sort();
    const key = `${keys[0]}:${keys[1]}`;

    if (!edgeKeys.has(key)) {
      edgeKeys.add(key);
      TILING_EDGES.push({ from, to, points: geodesicPoints(from, to), depth: tile.depth });
    }
  }
}

// An exact disk isometry. Which element of the abstract group realizes this map
// in the proof is schematic; the displayed pentagon group is only a 2D illustration.
function horizontalOffset(point: Point, offset: number): Point {
  return divide({ x: point.x + offset, y: point.y }, { x: 1 + offset * point.x, y: offset * point.y });
}

export function horizontalTranslation(point: Point, distance: number): Point {
  return horizontalOffset(point, Math.tanh(distance / 2));
}

function toOrigin(point: Point, origin: Point): Point {
  return divide(
    { x: point.x - origin.x, y: point.y - origin.y },
    { x: 1 - origin.x * point.x - origin.y * point.y, y: origin.y * point.x - origin.x * point.y },
  );
}

function fromOrigin(point: Point, origin: Point): Point {
  return divide(
    { x: point.x + origin.x, y: point.y + origin.y },
    { x: 1 + origin.x * point.x + origin.y * point.y, y: origin.x * point.y - origin.y * point.x },
  );
}

export type DiskMap = (point: Point) => Point;

// Build once per frame, then apply to cached vertices or sampled edges. At
// distance 2 SIDE_LENGTH this product of reflections preserves the infinite tiling.
export function tilingMap(distance: number): DiskMap {
  const origin = CENTRAL_PENTAGON[0];
  const next = CENTRAL_PENTAGON[1];

  if (!origin || !next) throw new Error('A side requires two central-pentagon corners.');

  const axis = toOrigin(next, origin);
  const length = Math.hypot(axis.x, axis.y);
  const direction = { x: axis.x / length, y: axis.y / length };
  const inverseDirection = { x: direction.x, y: -direction.y };
  const offset = Math.tanh(distance / 2);

  return (point) => {
    const rotated = multiply(toOrigin(point, origin), inverseDirection);
    const translated = horizontalOffset(rotated, offset);

    return fromOrigin(multiply(translated, direction), origin);
  };
}

export function tilingTranslation(point: Point, distance: number): Point {
  return tilingMap(distance)(point);
}

export const MAGNIFICATION = 400;

export const SMALL_ARC_HALF_WIDTH = .1;

export function magnifiedHalfWidth(halfWidth: number, distance: number): number {
  return 2 * Math.atan(Math.exp(distance) * Math.tan(halfWidth / 2));
}

export function smallBoundaryArc(samples = 48): Point[] {
  return Array.from({ length: samples + 1 }, (_, index) => {
    const angle = Math.PI - SMALL_ARC_HALF_WIDTH + 2 * SMALL_ARC_HALF_WIDTH * index / samples;

    return { x: Math.cos(angle), y: Math.sin(angle) };
  });
}

export const BOUNDARY_ARC = smallBoundaryArc();

export type TreeNode = {
  parent: number;
  depth: number;
  word: string;
  move: number;
  angle: number;
  sectorWidth: number;
  point: Point;
  boundary: Point;
};

const MOVES = ['a', 'A', 'b', 'B'] as const;

// Gaps keep the finite endpoint samples visibly Cantor-like. Only the topology
// and common-prefix ordering matter; this angular embedding is illustrative.
export function makeTree(depth = 5): TreeNode[] {
  const nodes: TreeNode[] = [{ parent: -1, depth: 0, word: '', move: -1, angle: 0, sectorWidth: TAU, point: { x: 0, y: 0 }, boundary: { x: 1, y: 0 } }];

  for (let index = 0; index < nodes.length; index++) {
    const parent = nodes[index];

    if (!parent || parent.depth === depth) continue;

    const choices: number[] = [];

    for (let move = 0; move < 4; move++) {
      if (parent.depth === 0 || move !== (parent.move ^ 1)) choices.push(move);
    }

    for (const [position, move] of choices.entries()) {
      const portion = parent.sectorWidth / choices.length;
      const angle = parent.angle - parent.sectorWidth / 2 + portion * (position + .5);
      const sectorWidth = portion * (parent.depth === 0 ? .8 : .7);
      const radius = Math.tanh(.6 * (parent.depth + 1));
      nodes.push({
        parent: index,
        depth: parent.depth + 1,
        word: parent.word + MOVES[move],
        move,
        angle,
        sectorWidth,
        point: { x: radius * Math.cos(angle), y: radius * Math.sin(angle) },
        boundary: { x: Math.cos(angle), y: Math.sin(angle) },
      });
    }
  }

  return nodes;
}

export const TREE = makeTree();

export function treePath(index: number): number[] {
  const path: number[] = [];
  let at = index;

  while (at >= 0) {
    path.push(at);
    at = TREE[at]?.parent ?? -1;
  }

  path.reverse();

  return path;
}

export function gridCost(cellsPerSide: number): number {
  return cellsPerSide * cellsPerSide * (1 / cellsPerSide) ** 2;
}

export function crossingWeight(cellsPerSide: number, distinctCells: number): number {
  return distinctCells / cellsPerSide;
}

export function exponentialCost(n: number): number {
  return 2 ** (.5 * n);
}

export function quadraticCost(n: number): number {
  return 50 * (5 + 4 * n) ** 2;
}

export const FIRST_IMPOSSIBLE_N = 41;

// Standard level-three Koch outline, with outward bumps. The initial triangle
// and all segments are counterclockwise; the -60 degree bump is on its outside.
export function kochOutline(level = 3): Point[] {
  let points = Array.from({ length: 3 }, (_, index) => {
    const angle = -Math.PI / 2 + index * TAU / 3;

    return { x: Math.cos(angle), y: Math.sin(angle) };
  });

  for (let generation = 0; generation < level; generation++) {
    const next: Point[] = [];

    for (const [index, from] of points.entries()) {
      const to = points[(index + 1) % points.length];

      if (!to) continue;

      const dx = (to.x - from.x) / 3;
      const dy = (to.y - from.y) / 3;
      const first = { x: from.x + dx, y: from.y + dy };
      next.push(from, first, { x: first.x + dx / 2 + dy * Math.sqrt(3) / 2, y: first.y - dx * Math.sqrt(3) / 2 + dy / 2 }, { x: from.x + 2 * dx, y: from.y + 2 * dy });
    }

    points = next;
  }

  return points;
}

export const KOCH = kochOutline();

export function crumple(amount: number): Point[] {
  return KOCH.map((point, index) => {
    const angle = -Math.PI / 2 + index * TAU / KOCH.length;

    return { x: Math.cos(angle) * (1 - amount) + point.x * amount, y: Math.sin(angle) * (1 - amount) + point.y * amount };
  });
}

import { EXAMPLE_CHAIN, EXAMPLE_SITES, EXTENSION_SITES, STORED_CARDY, TOY_METADATA, TOY_OUTCOMES } from './data';

export type Point = { x: number; y: number };

export type Site = Point & { id: number; black: boolean };

export type ClippedCell = { site: Site; polygon: Point[] };

export type Side = 'left' | 'right' | 'bottom' | 'top';

export type CrossingAxis = 'leftRight' | 'topBottom';

export type VoronoiCell = ClippedCell & {
  neighbors: number[];
  touches: { left: boolean; right: boolean; bottom: boolean; top: boolean };
};

export type Mosaic = {
  width: number;
  height: number;
  sites: readonly Site[];
  cells: VoronoiCell[];
  blackCount: number;
  leftRightChain: number[] | null;
  topBottomChain: number[] | null;
  leftLayers: number[][];
};

const EPSILON = 1e-10;

function assertWindow(width: number, height: number): void {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new RangeError('A mosaic window needs two positive finite dimensions.');
}

function assertSites(sites: readonly Site[]): void {
  if (sites.length === 0) throw new RangeError('A Voronoi mosaic needs at least one site.');

  const ids = new Set<number>();
  const coordinates = new Set<string>();

  for (const site of sites) {
    if (!Number.isFinite(site.x) || !Number.isFinite(site.y) || !Number.isInteger(site.id) || site.id < 0) throw new RangeError('Every site needs finite coordinates and a nonnegative integer ID.');

    const key = `${site.x},${site.y}`;

    if (ids.has(site.id) || coordinates.has(key)) throw new RangeError('Sites need distinct IDs and positions.');

    ids.add(site.id);
    coordinates.add(key);
  }
}

function clippedHalfPlane(polygon: Point[], a: number, b: number, c: number): Point[] {
  let outside = false;
  let inside = false;

  for (const point of polygon) {
    if (a * point.x + b * point.y - c > 1e-12) outside = true;
    else inside = true;
  }

  if (!outside) return polygon;
  if (!inside) return [];

  const clipped: Point[] = [];

  for (let index = 0; index < polygon.length; index++) {
    const first = polygon[index];
    const second = polygon[(index + 1) % polygon.length];

    if (!first || !second) throw new Error('Each clipping edge needs its two polygon vertices.');

    const u = a * first.x + b * first.y - c;
    const v = a * second.x + b * second.y - c;
    const firstInside = u <= 1e-12;
    const secondInside = v <= 1e-12;

    if (firstInside) clipped.push(first);

    if (firstInside !== secondInside) {
      const fraction = Math.max(0, Math.min(1, u / (u - v)));
      clipped.push({ x: first.x + fraction * (second.x - first.x), y: first.y + fraction * (second.y - first.y) });
    }
  }

  return clipped;
}

/** Sites may be outside the window; their clipped cells may then be empty. */
export function clippedCells(width: number, height: number, sites: readonly Site[]): ClippedCell[] {
  assertWindow(width, height);
  assertSites(sites);

  return sites.map(site => {
    let polygon: Point[] = [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }];

    for (const other of sites) {
      if (site.id === other.id) continue;

      const a = 2 * (other.x - site.x);
      const b = 2 * (other.y - site.y);
      const c = other.x * other.x + other.y * other.y - site.x * site.x - site.y * site.y;
      polygon = clippedHalfPlane(polygon, a, b, c);

      if (polygon.length === 0) break;
    }

    return { site, polygon };
  });
}

function farthestPair(points: readonly Point[]): readonly [Point, Point] | null {
  let pair: readonly [Point, Point] | null = null;
  let distance = EPSILON * EPSILON;

  for (const first of points) {
    for (const second of points) {
      const squared = (first.x - second.x) ** 2 + (first.y - second.y) ** 2;

      if (squared > distance) {
        distance = squared;
        pair = [first, second];
      }
    }
  }

  return pair;
}

function sharedEdge(first: ClippedCell, second: ClippedCell): readonly [Point, Point] | null {
  const a = 2 * (second.site.x - first.site.x);
  const b = 2 * (second.site.y - first.site.y);
  const c = second.site.x ** 2 + second.site.y ** 2 - first.site.x ** 2 - first.site.y ** 2;
  const on: Point[] = [];

  for (const point of first.polygon) {
    if (Math.abs(a * point.x + b * point.y - c) < 1e-9) on.push(point);
  }

  return farthestPair(on);
}

function crossing(cells: readonly VoronoiCell[], axis: CrossingAxis) {
  const firstSide = axis === 'leftRight' ? 'left' : 'bottom';
  const lastSide = axis === 'leftRight' ? 'right' : 'top';
  const byId = new Map(cells.map(cell => [cell.site.id, cell]));
  const previous = new Map<number, number | null>();
  const depths = new Map<number, number>();
  const queue: number[] = [];
  const layers: number[][] = [];
  let reached: number | null = null;

  for (const cell of cells) {
    if (cell.site.black && cell.touches[firstSide]) {
      queue.push(cell.site.id);
      previous.set(cell.site.id, null);
      depths.set(cell.site.id, 0);
    }
  }

  for (const id of queue) {
    const cell = byId.get(id);
    const depth = depths.get(id);

    if (!cell || depth === undefined) throw new Error('The crossing search needs its current cell and BFS depth.');

    if (!layers[depth]) layers[depth] = [];
    layers[depth]?.push(id);

    if (cell.touches[lastSide] && reached === null) reached = id;

    for (const other of cell.neighbors) {
      const next = byId.get(other);

      if (!next) throw new Error('Every neighboring cell ID must exist in the mosaic.');

      if (next.site.black && !previous.has(other)) {
        previous.set(other, id);
        depths.set(other, depth + 1);
        queue.push(other);
      }
    }
  }

  const chain: number[] = [];
  let at = reached;

  while (at !== null) {
    chain.push(at);
    const before = previous.get(at);

    if (before === undefined) throw new Error('Each reached black cell needs its BFS predecessor.');

    at = before;
  }

  chain.reverse();

  return { chain: reached === null ? null : chain, layers };
}

export function buildMosaic(width: number, height: number, sites: readonly Site[]): Mosaic {
  if (sites.some(site => site.x < 0 || site.x > width || site.y < 0 || site.y > height)) throw new RangeError('A graph mosaic uses sites inside its window; render-only clipping also supports outside sites.');

  const outlines = clippedCells(width, height, sites);
  const cells: VoronoiCell[] = outlines.map(cell => ({
    ...cell,
    neighbors: [],
    touches: {
      left: cell.polygon.some(point => Math.abs(point.x) < EPSILON),
      right: cell.polygon.some(point => Math.abs(point.x - width) < EPSILON),
      bottom: cell.polygon.some(point => Math.abs(point.y) < EPSILON),
      top: cell.polygon.some(point => Math.abs(point.y - height) < EPSILON),
    },
  }));

  for (let first = 0; first < cells.length; first++) {
    for (let second = first + 1; second < cells.length; second++) {
      const a = cells[first];
      const b = cells[second];

      if (!a || !b) throw new Error('The adjacency search needs both Voronoi cells.');

      if (sharedEdge(a, b)) {
        a.neighbors.push(b.site.id);
        b.neighbors.push(a.site.id);
      }
    }
  }

  for (const cell of cells) cell.neighbors.sort((a, b) => a - b);

  const leftRight = crossing(cells, 'leftRight');
  const topBottom = crossing(cells, 'topBottom');

  const blackCount = sites.reduce((count, site) => count + Number(site.black), 0);

  return { width, height, sites, cells, blackCount, leftRightChain: leftRight.chain, topBottomChain: topBottom.chain, leftLayers: leftRight.layers };
}

export function rotateMosaic(mosaic: Mosaic): Mosaic {
  const sites = mosaic.sites.map(site => ({ ...site, x: mosaic.height - site.y, y: site.x }));
  const rotated = buildMosaic(mosaic.height, mosaic.width, sites);

  // Carry the same path, rather than choose a different equally short BFS path.
  rotated.leftRightChain = mosaic.topBottomChain ? [...mosaic.topBottomChain].reverse() : null;
  rotated.topBottomChain = mosaic.leftRightChain ? [...mosaic.leftRightChain] : null;

  return rotated;
}

function boundaryMidpoint(cell: VoronoiCell, side: Side, width: number, height: number): Point {
  const on: Point[] = [];

  for (const point of cell.polygon) {
    const coordinate = side === 'left' || side === 'right' ? point.x : point.y;
    const boundary = side === 'right' ? width : side === 'top' ? height : 0;

    if (Math.abs(coordinate - boundary) < EPSILON) on.push(point);
  }

  const edge = farthestPair(on);

  if (!edge) throw new Error('A crossing endpoint must meet its window side along a genuine cell edge.');

  return { x: (edge[0].x + edge[1].x) / 2, y: (edge[0].y + edge[1].y) / 2 };
}

/** Centre-to-shared-edge pieces stay inside their respective convex black cells. */
export function chainPath(mosaic: Mosaic, chain: readonly number[], axis: CrossingAxis): Point[] {
  const byId = new Map(mosaic.cells.map(cell => [cell.site.id, cell]));
  const first = byId.get(chain[0] ?? -1);
  const last = byId.get(chain.at(-1) ?? -1);

  if (!first || !last || !first.site.black || !last.site.black) throw new RangeError('A crossing path needs a nonempty list of existing black cells.');

  const path = [boundaryMidpoint(first, axis === 'leftRight' ? 'left' : 'bottom', mosaic.width, mosaic.height), { x: first.site.x, y: first.site.y }];

  for (let index = 1; index < chain.length; index++) {
    const a = byId.get(chain[index - 1] ?? -1);
    const b = byId.get(chain[index] ?? -1);

    if (!a || !b || !a.site.black || !b.site.black) throw new Error('A crossing can use only existing black cells.');

    const edge = sharedEdge(a, b);

    if (!edge) throw new Error('Consecutive crossing cells must share an actual Voronoi edge.');

    path.push({ x: (edge[0].x + edge[1].x) / 2, y: (edge[0].y + edge[1].y) / 2 }, { x: b.site.x, y: b.site.y });
  }

  path.push(boundaryMidpoint(last, axis === 'leftRight' ? 'right' : 'top', mosaic.width, mosaic.height));

  return path;
}

function simpsonIntegral(limit: number): number {
  const steps = 512;
  const step = Math.cbrt(limit) / steps;
  let sum = 3 + 3 * (1 - limit) ** (-2 / 3);

  for (let index = 1; index < steps; index++) {
    const t = index * step;
    sum += (index % 2 ? 4 : 2) * 3 * (1 - t ** 3) ** (-2 / 3);
  }

  return sum * step / 3;
}

const CARDY_DENOMINATOR = 2 * simpsonIntegral(.5);

export function cardy(x: number): number {
  if (!Number.isFinite(x) || x < 0 || x > 1) throw new RangeError('Cardy’s cross-ratio is between zero and one.');
  if (x === 0 || x === 1) return x;

  return x <= .5 ? simpsonIntegral(x) / CARDY_DENOMINATOR : 1 - simpsonIntegral(1 - x) / CARDY_DENOMINATOR;
}

function arithmeticGeometricMean(first: number, second: number): number {
  let a = first;
  let b = second;

  for (let iteration = 0; iteration < 40; iteration++) {
    if (Math.abs(a - b) < 1e-15) return (a + b) / 2;

    const next = (a + b) / 2;
    b = Math.sqrt(a * b);
    a = next;
  }

  throw new Error('The elliptic-integral AGM did not converge.');
}

export function rectangleCrossRatio(aspect: number): number {
  if (!Number.isFinite(aspect) || aspect < .25 || aspect > 4) throw new RangeError('This finite rectangle plot covers aspect ratios from 1:4 to 4:1.');

  let low = 1e-10;
  let high = 1 - 1e-10;

  for (let iteration = 0; iteration < 70; iteration++) {
    const k = (low + high) / 2;
    const ratio = 2 * arithmeticGeometricMean(1, k) / arithmeticGeometricMean(1, Math.sqrt(1 - k * k));

    if (ratio < aspect) low = k;
    else high = k;
  }

  const k = (low + high) / 2;

  return ((1 - k) / (1 + k)) ** 2;
}

export function interpolatePoint(from: Point, to: Point, amount: number): Point {
  if (!Number.isFinite(amount) || amount < 0 || amount > 1) throw new RangeError('A carried point must stay between its two defined states.');

  return { x: from.x + amount * (to.x - from.x), y: from.y + amount * (to.y - from.y) };
}

function measuredShare(outcomes: string): number {
  if (outcomes.length !== TOY_METADATA.samples || /[^01]/.test(outcomes)) throw new Error('Each stored raster experiment needs exactly 400 binary outcomes.');

  let count = 0;

  for (const value of outcomes) count += Number(value === '1');

  return count / outcomes.length;
}

export function buildRandomMosaicModel() {
  const square = buildMosaic(1, 1, EXAMPLE_SITES);
  const extensionSites = EXTENSION_SITES;
  const wide = buildMosaic(2, 1, [...EXAMPLE_SITES, ...extensionSites]);
  const tall = rotateMosaic(wide);
  const originalChain = [...EXAMPLE_CHAIN];
  const cardyCurve = Array.from({ length: 129 }, (_, index) => {
    const x = index / 128;

    return { x, F: cardy(x) };
  });
  const targets = STORED_CARDY.map(stored => {
    const x = rectangleCrossRatio(stored.aspect);
    const outcomes = stored.name === 'square' ? TOY_OUTCOMES.square.leftRight : stored.name === 'wide' ? TOY_OUTCOMES.wide.leftRight : TOY_OUTCOMES.wide.topBottom;

    return { name: stored.name, aspect: stored.aspect, x, F: cardy(x), measured: measuredShare(outcomes), storedX: stored.x, storedF: stored.F, outcomes };
  });

  chainPath(square, originalChain, 'leftRight');

  if (wide.leftRightChain || !wide.topBottomChain || !tall.leftRightChain || tall.topBottomChain) throw new Error('The fixed illustration must have wide top-bottom and rotated tall left-right crossings only.');

  return { square, wide, tall, extensionSites, originalChain, cardyCurve, targets, outcomes: TOY_OUTCOMES, standardError: Math.sqrt(.25 / TOY_METADATA.samples), samples: TOY_METADATA.samples };
}

export type RandomMosaicModel = ReturnType<typeof buildRandomMosaicModel>;

/** The added sites approach from outside; no geometry is regenerated randomly. */
export function illustrationAt(model: Pick<RandomMosaicModel, 'square' | 'extensionSites'>, wideAmount: number, turnAmount: number) {
  if (![wideAmount, turnAmount].every(amount => Number.isFinite(amount) && amount >= 0 && amount <= 1)) throw new RangeError('The finite illustration has two bounded construction moves.');

  const baseWidth = 1 + wideAmount;
  const sites: Site[] = [];

  for (const site of [...model.square.sites, ...model.extensionSites]) {
    const first = { x: site.x + (site.id >= model.square.sites.length ? 3 * (1 - wideAmount) : 0), y: site.y };
    const turned = { x: 1 - first.y, y: first.x };
    const position = interpolatePoint(first, turned, turnAmount);
    sites.push({ id: site.id, black: site.black, x: position.x, y: position.y });
  }

  const width = baseWidth + turnAmount * (1 - baseWidth);
  const height = 1 + turnAmount * (baseWidth - 1);

  return { width, height, sites, cells: clippedCells(width, height, sites) };
}

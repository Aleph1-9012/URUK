import { expect, test } from 'bun:test';
import { buildMosaic, buildRandomMosaicModel, cardy, chainPath, clippedCells, illustrationAt, rectangleCrossRatio, type Point, type Site } from './math';

function area(polygon: readonly Point[]): number {
  let sum = 0;

  for (let index = 0; index < polygon.length; index++) {
    const a = polygon[index];
    const b = polygon[(index + 1) % polygon.length];

    if (!a || !b) throw new Error('The independent polygon-area sum needs two vertices.');

    sum += a.x * b.y - b.x * a.y;
  }

  return sum / 2;
}

/** Intersect the pair's entire bisector with distance and window inequalities.
 * This does not inspect clipped polygon vertices or renderer adjacency. */
function bisectorLength(first: Site, second: Site, sites: readonly Site[], width: number, height: number): number {
  const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
  const distance = Math.hypot(first.x - second.x, first.y - second.y);
  const direction = { x: (first.y - second.y) / distance, y: (second.x - first.x) / distance };
  const constraints = [
    { a: -direction.x, b: midpoint.x }, { a: direction.x, b: width - midpoint.x },
    { a: -direction.y, b: midpoint.y }, { a: direction.y, b: height - midpoint.y },
  ];

  for (const site of sites) {
    if (site.id === first.id || site.id === second.id) continue;

    const dx = site.x - first.x;
    const dy = site.y - first.y;
    constraints.push({ a: 2 * (dx * direction.x + dy * direction.y), b: site.x ** 2 + site.y ** 2 - first.x ** 2 - first.y ** 2 - 2 * (dx * midpoint.x + dy * midpoint.y) });
  }

  let low = -Infinity;
  let high = Infinity;

  for (const constraint of constraints) {
    if (Math.abs(constraint.a) < 1e-14) {
      if (constraint.b < -1e-12) return 0;
    } else if (constraint.a > 0) high = Math.min(high, constraint.b / constraint.a);
    else low = Math.max(low, constraint.b / constraint.a);
  }

  return Math.max(0, high - low);
}

function inBlackUnion(point: Point, sites: readonly Site[]): boolean {
  let nearestBlack = Infinity;
  let nearestWhite = Infinity;

  for (const site of sites) {
    const distance = (point.x - site.x) ** 2 + (point.y - site.y) ** 2;

    if (site.black) nearestBlack = Math.min(nearestBlack, distance);
    else nearestWhite = Math.min(nearestWhite, distance);
  }

  return nearestBlack <= nearestWhite + 1e-10;
}

function seriesIntegral(x: number): number {
  let coefficient = 1;
  let sum = 3;
  let power = 1;

  for (let index = 1; index < 160; index++) {
    coefficient *= (index - 1 + 2 / 3) / index;
    power *= x;
    sum += coefficient * power / (index + 1 / 3);
  }

  return Math.cbrt(x) * sum;
}

function seriesCardy(x: number): number {
  const denominator = 2 * seriesIntegral(.5);

  return x <= .5 ? seriesIntegral(x) / denominator : 1 - seriesIntegral(1 - x) / denominator;
}

/** Direct elliptic quadrature, independent of the production AGM. */
function ellipticQuadrature(k: number): number {
  const steps = 4096;
  const width = Math.PI / (2 * steps);
  let sum = 1 + 1 / Math.sqrt(1 - k * k);

  for (let index = 1; index < steps; index++) {
    sum += (index % 2 ? 4 : 2) / Math.sqrt(1 - k * k * Math.sin(index * width) ** 2);
  }

  return sum * width / 3;
}

test('224: the exact clipped square tiles its window and the corrected crossing stays in black cells', () => {
  const model = buildRandomMosaicModel();
  const square = model.square;
  expect(square.sites).toHaveLength(87);
  expect(square.blackCount).toBe(46);
  expect(square.cells.reduce((sum, cell) => sum + area(cell.polygon), 0)).toBeCloseTo(1, 11);

  for (const cell of square.cells) {
    expect(area(cell.polygon)).toBeGreaterThan(0);

    for (const point of cell.polygon) {
      const own = (point.x - cell.site.x) ** 2 + (point.y - cell.site.y) ** 2;

      for (const site of square.sites) {
        expect(own - ((point.x - site.x) ** 2 + (point.y - site.y) ** 2)).toBeLessThan(1e-10);
      }
    }

    for (const other of square.cells) {
      if (other.site.id <= cell.site.id) continue;

      expect(cell.neighbors.includes(other.site.id)).toBe(bisectorLength(cell.site, other.site, square.sites, 1, 1) > 1e-8);
    }
  }

  const path = chainPath(square, model.originalChain, 'leftRight');
  expect(path[0]?.x).toBeCloseTo(0, 12);
  expect(path.at(-1)?.x).toBeCloseTo(1, 12);

  for (let index = 1; index < path.length; index++) {
    const a = path[index - 1];
    const b = path[index];

    if (!a || !b) throw new Error('The crossing path needs both segment endpoints.');

    for (let step = 0; step <= 8; step++) {
      const t = step / 8;
      expect(inBlackUnion({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) }, square.sites)).toBe(true);
    }
  }

  // The old raster sequence skips a real intervening cell at this step.
  const oldFirst = square.sites[53];
  const oldSecond = square.sites[38];

  if (!oldFirst || !oldSecond) throw new Error('The historical raster comparison needs its retained sites.');

  expect(bisectorLength(oldFirst, oldSecond, square.sites, 1, 1)).toBe(0);
  expect(() => chainPath(square, [53, 38], 'leftRight')).toThrow();
});

test('224: right-half extension and quarter-turn preserve the sites and give the stated crossing orientation', () => {
  const model = buildRandomMosaicModel();
  expect(model.wide.leftRightChain).toBeNull();
  expect(model.wide.topBottomChain).not.toBeNull();
  expect(model.tall.leftRightChain).toEqual([...model.wide.topBottomChain ?? []].reverse());
  expect(model.tall.topBottomChain).toBeNull();
  expect(model.wide.cells.reduce((sum, cell) => sum + area(cell.polygon), 0)).toBeCloseTo(2, 11);
  expect(model.tall.cells.reduce((sum, cell) => sum + area(cell.polygon), 0)).toBeCloseTo(2, 11);

  for (const site of model.extensionSites) expect(site.x >= 1 && site.x <= 2 && site.y >= 0 && site.y <= 1).toBe(true);

  for (const site of model.square.sites) expect(model.wide.sites[site.id]).toEqual(site);

  for (const site of model.wide.sites) {
    const turned = model.tall.sites[site.id];
    expect(turned).toEqual({ ...site, x: 1 - site.y, y: site.x });
  }

  const opening = illustrationAt(model, 0, 0);
  expect(opening.cells.reduce((sum, cell) => sum + area(cell.polygon), 0)).toBeCloseTo(1, 11);

  for (let index = 0; index < model.square.cells.length; index++) expect(opening.cells[index]?.polygon).toEqual(model.square.cells[index]?.polygon);

  for (const [wide, turn] of [[.25, 0], [.75, 0], [1, .25], [1, .75]] as const) {
    const frame = illustrationAt(model, wide, turn);
    expect(frame.cells.reduce((sum, cell) => sum + area(cell.polygon), 0)).toBeCloseTo(frame.width * frame.height, 10);

    for (const cell of frame.cells) {
      for (const point of cell.polygon) expect(point.x >= -1e-10 && point.x <= frame.width + 1e-10 && point.y >= -1e-10 && point.y <= frame.height + 1e-10).toBe(true);
    }
  }

  const tiny = clippedCells(1, 1, [{ id: 0, x: .5, y: .5, black: true }, { id: 1, x: 5, y: .5, black: false }]);
  expect(tiny[1]?.polygon).toHaveLength(0);
  expect(() => buildMosaic(1, 1, [{ id: 0, x: .5, y: .5, black: true }, { id: 1, x: .5, y: .5, black: false }])).toThrow();
});

test('224: Cardy quadrature matches a power-series integral and rectangle moduli match direct elliptic quadrature', () => {
  for (const x of [.00001, .01, .0294372515, .1, .25, .5, .75, .9705627485, .99, .99999]) {
    expect(cardy(x)).toBeCloseTo(seriesCardy(x), 10);
    expect(cardy(x) + cardy(1 - x)).toBeCloseTo(1, 12);
  }

  const model = buildRandomMosaicModel();

  for (const target of model.targets) {
    const root = Math.sqrt(target.x);
    const k = (1 - root) / (1 + root);
    const aspect = 2 * ellipticQuadrature(k) / ellipticQuadrature(Math.sqrt(1 - k * k));
    expect(aspect).toBeCloseTo(target.aspect, 7);
    expect(Number(target.x.toFixed(4))).toBe(target.storedX);
    expect(Number(target.F.toFixed(4))).toBe(target.storedF);
    expect(target.outcomes).toHaveLength(400);
    expect(target.outcomes.split('1').length - 1).toBeCloseTo(target.measured * 400, 12);
  }

  expect(model.targets.map(target => target.measured)).toEqual([.445, .1875, .78]);
  expect(rectangleCrossRatio(1)).toBeCloseTo(.5, 12);
  expect(cardy(0)).toBe(0);
  expect(cardy(1)).toBe(1);
  expect(() => cardy(-.1)).toThrow();
});

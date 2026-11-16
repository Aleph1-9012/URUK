import { expect, test } from 'bun:test';
import reference from './test-fixture.json';
import { area, buildPolarModel, cornerCut, linearMap, mixPolygons, parkMiller, polar, product, regularPolygon, type Matrix2, type Point, type Polygon } from './math';

const model = buildPolarModel();

function support(polygon: Polygon, direction: Point): number {
  let value = -Infinity;

  for (const point of polygon) value = Math.max(value, point.x * direction.x + point.y * direction.y);

  return value;
}

function clip(polygon: Polygon, normal: Point): Polygon {
  const result: Polygon = [];

  for (const [index, a] of polygon.entries()) {
    const b = polygon[(index + 1) % polygon.length];

    if (!b) throw new Error('Each clipped segment needs its second endpoint.');

    const first = a.x * normal.x + a.y * normal.y;
    const second = b.x * normal.x + b.y * normal.y;

    if (first <= 1) result.push(a);

    if ((first < 1 && second > 1) || (first > 1 && second < 1)) {
      const along = (1 - first) / (second - first);
      result.push({ x: a.x + along * (b.x - a.x), y: a.y + along * (b.y - a.y) });
    }
  }

  return result;
}

function halfspacePolar(polygon: Polygon): Polygon {
  let intersection = [{ x: -50, y: -50 }, { x: 50, y: -50 }, { x: 50, y: 50 }, { x: -50, y: 50 }];

  for (const vertex of polygon) intersection = clip(intersection, vertex);

  return intersection;
}

test('087: edge polars equal independent halfspace intersections, double polarity and inverse-transpose linear covariance', () => {
  const rotation = .37;
  const matrices: Matrix2[] = [
    [2, .7, .2, .9], [1, .7, 0, .6], [-1, .4, 0, .8],
    [Math.cos(rotation), -Math.sin(rotation), Math.sin(rotation), Math.cos(rotation)],
  ];

  for (const matrix of matrices) {
    const [a, b, c, d] = matrix;
    const determinant = a * d - b * c;
    const K = linearMap(model.spine, matrix);
    const dual = polar(K);
    const independent = halfspacePolar(K);
    const twice = polar(dual);
    const expected = linearMap(polar(model.spine), [d / determinant, -c / determinant, -b / determinant, a / determinant]);
    expect(area(K)).toBeCloseTo(Math.abs(determinant) * area(model.spine), 11);
    expect(product(K)).toBeCloseTo(reference.spine_product, 10);
    expect(area(dual)).toBeCloseTo(area(independent), 10);

    for (let index = 0; index < 72; index++) {
      const angle = 2 * Math.PI * index / 72;
      const direction = { x: Math.cos(angle), y: Math.sin(angle) };
      expect(support(dual, direction)).toBeCloseTo(support(independent, direction), 10);
      expect(support(dual, direction)).toBeCloseTo(support(expected, direction), 10);
      expect(support(twice, direction)).toBeCloseTo(support(K, direction), 10);
    }

    for (const vertex of dual) {
      let active = 0;

      for (const point of K) {
        const value = vertex.x * point.x + vertex.y * point.y;
        expect(value).toBeLessThanOrEqual(1 + 1e-11);

        if (Math.abs(value - 1) < 1e-10) active++;
      }

      expect(active).toBeGreaterThanOrEqual(2);
    }
  }

  const R: Matrix2 = [Math.cos(rotation), -Math.sin(rotation), Math.sin(rotation), Math.cos(rotation)];
  const rotated = polar(linearMap(model.spine, R));
  const sameDirection = linearMap(polar(model.spine), R);
  expect(support(rotated, { x: 1, y: 0 })).toBeCloseTo(support(sameDirection, { x: 1, y: 0 }), 12);
});

test('087: Minkowski morphs preserve the weighted support function, symmetry, convexity and the exact current polar', () => {
  const path = [model.spine, model.disk1000, model.hexagon, model.square, cornerCut(1)];

  for (let index = 0; index < path.length - 1; index++) {
    const from = path[index];
    const to = path[index + 1];

    if (!from || !to) throw new Error('Every carried body needs both endpoints.');

    expect(mixPolygons(from, to, 0)).toEqual(from);
    expect(mixPolygons(from, to, 1)).toEqual(to);

    for (const amount of [.000001, .125, .5, .875, .999999]) {
      const current = mixPolygons(from, to, amount);
      const dual = polar(current);

      for (let sample = 0; sample < 48; sample++) {
        const angle = 2 * Math.PI * (sample + .13) / 48;
        const direction = { x: Math.cos(angle), y: Math.sin(angle) };
        const opposite = { x: -direction.x, y: -direction.y };
        const expected = (1 - amount) * support(from, direction) + amount * support(to, direction);
        expect(support(current, direction)).toBeCloseTo(expected, 10);
        expect(support(current, direction)).toBeCloseTo(support(current, opposite), 10);
      }

      let largestConstraint = -Infinity;

      for (const vertex of dual) {
        for (const point of current) largestConstraint = Math.max(largestConstraint, vertex.x * point.x + vertex.y * point.y);
      }

      expect(largestConstraint).toBeLessThanOrEqual(1 + 1e-7);
      expect(area(current) * area(dual)).toBeGreaterThanOrEqual(8 - 1e-7);

      for (const [vertexIndex, a] of current.entries()) {
        const b = current[(vertexIndex + 1) % current.length];
        const c = current[(vertexIndex + 2) % current.length];

        if (!b || !c) throw new Error('Every current convex turn needs three vertices.');

        expect((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x)).toBeGreaterThanOrEqual(-1e-12);
      }
    }
  }
});

test('087: corner cuts match analytic intersection areas and named regular bodies match their trigonometric products', () => {
  for (let index = 0; index <= 100; index++) {
    const c = 1 + index / 100;
    const K = cornerCut(c);
    const expectedArea = 4 - 2 * (2 - c) ** 2;
    expect(area(K)).toBeCloseTo(expectedArea, 12);
    expect(area(polar(K))).toBeCloseTo(4 / c, 12);
    expect(product(K)).toBeCloseTo(expectedArea * 4 / c, 11);

    for (const point of K) {
      expect(Math.abs(point.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(point.y)).toBeLessThanOrEqual(1);
      expect(Math.abs(point.x) + Math.abs(point.y)).toBeLessThanOrEqual(c + 1e-14);
    }
  }

  for (const sides of [4, 6, 8, 1000]) {
    const K = regularPolygon(sides);
    expect(product(K)).toBeCloseTo(sides ** 2 * Math.sin(Math.PI / sides) ** 2, 10);
  }

  expect(product(cornerCut(Math.SQRT2))).toBeCloseTo(32 - 16 * Math.SQRT2, 11);
});

test('087: the portable live cloud matches the independent stream and geometry oracle, while dimension rows retain the known cube volumes', () => {
  const stream = parkMiller(1);
  let state = 0;

  for (let index = 0; index < 10000; index++) state = stream() * 2147483647;

  expect(state).toBe(1043618065);
  expect(model.cloud.trials).toBe(reference.cloud.trials);
  expect(model.cloud.parallelograms).toBe(reference.cloud.parallelograms);
  expect(model.cloud.vertexCounts).toEqual(reference.cloud.vertices);

  for (const [index, value] of model.cloud.products.entries()) {
    const oracle = reference.cloud.products[index];
    const vertices = model.cloud.vertexCounts[index];

    if (oracle === undefined || vertices === undefined) throw new Error('Every portable cloud trial needs its independent oracle.');

    expect(Math.abs(value - oracle)).toBeLessThan(1e-9);
    expect(value).toBeGreaterThanOrEqual(8 - 1e-9);

    if (vertices === 4) expect(value).toBeCloseTo(8, 8);
    else expect(value).toBeGreaterThan(8 + 1e-6);
  }

  for (const row of model.dimensionTable) {
    const oracle = reference.dimensions.find(expected => expected.n === row.n);

    if (!oracle) throw new Error('Every dimension row has an exact rational volume oracle.');

    expect(row.cube).toBe(oracle.cube);
    expect(row.product).toBeCloseTo(oracle.decimal, 12);
    expect(row.productFraction).toBe(oracle.product);
    expect(row.cube * row.crossPolytope).toBeCloseTo(oracle.decimal, 12);
    expect(row.known).toBe(row.n <= 3);
  }
});

import { expect, test } from 'bun:test';
import { angleBetweenLines, buildProjectorModel, discCut, frobeniusDistance, lineDistance, projector, projectorCirclePoint, RIM_POINTS, RING_ANGLES, sectorDiameter, traceOneDimension, type Matrix, type Point } from './math';

function squaredDistance(a: Point, b: Point): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

function rank(rows: number[][]): number {
  const work = rows.map(row => Array.from(row));
  let pivotRow = 0;
  const columns = work[0]?.length;

  if (columns === undefined) return 0;

  for (let column = 0; column < columns && pivotRow < work.length; column++) {
    const selected = work.findIndex((row, index) => {
      const value = row[column];

      if (value === undefined) throw new Error('Independent matrix rank needs equal-length rows.');

      return index >= pivotRow && Math.abs(value) > 1e-10;
    });

    if (selected < 0) continue;

    const candidate = work[selected];
    const before = work[pivotRow];

    if (!candidate || !before) throw new Error('Every independent matrix rank pivot needs its two rows.');

    work[pivotRow] = candidate;
    work[selected] = before;
    const divisor = candidate[column];

    if (divisor === undefined) throw new Error('Each matrix-rank pivot needs its selected entry.');

    for (let row = pivotRow + 1; row < work.length; row++) {
      const target = work[row];
      const entry = target?.[column];

      if (!target || entry === undefined) throw new Error('Each elimination target needs its pivot column.');

      const multiplier = entry / divisor;

      for (let next = column; next < columns; next++) {
        const current = target[next];
        const pivot = candidate[next];

        if (current === undefined || pivot === undefined) throw new Error('Independent rank elimination needs matching finite rows.');

        target[next] = current - multiplier * pivot;
      }
    }

    pivotRow++;
  }

  return pivotRow;
}

function upperTriangle(matrix: Matrix): number[] {
  const values: number[] = [];

  for (let row = 0; row < matrix.length; row++) {
    for (let column = row; column < matrix.length; column++) {
      const value = matrix[row]?.[column];

      if (value === undefined) throw new Error('Every symmetric matrix coordinate needs its upper-triangle entry.');

      values.push(row === column ? value : Math.SQRT2 * value);
    }
  }

  return values;
}

test('156: rank-one projector metrics, sign invariance and doubled-angle circle agree independently', () => {
  for (let index = 0; index < 160; index++) {
    const u = [1, index % 7 - 3, index % 11 - 5, index % 5 - 2];
    const v = [index % 3 - 1, 1, index % 13 - 6, index % 17 - 8];
    const p = projector(u);
    const q = projector(v);
    const negative = projector(u.map(value => -7 * value));
    const normU = Math.sqrt(u.reduce((sum, value) => sum + value * value, 0));
    const normV = Math.sqrt(v.reduce((sum, value) => sum + value * value, 0));
    let product = 0;
    let trace = 0;

    for (let row = 0; row < 4; row++) {
      const a = u[row];
      const b = v[row];
      const diagonal = p[row]?.[row];

      if (a === undefined || b === undefined || diagonal === undefined) throw new Error('Every independent projector identity needs all four coordinates.');

      product += a * b;
      trace += diagonal;

      for (let column = 0; column < 4; column++) {
        const original = p[row]?.[column];
        const reversed = negative[row]?.[column];
        const symmetric = p[column]?.[row];

        if (original === undefined || reversed === undefined || symmetric === undefined) throw new Error('Each projector entry needs its symmetric and sign-reversed counterpart.');

        expect(original).toBeCloseTo(reversed, 14);
        expect(original).toBe(symmetric);
        let square = 0;

        for (let inner = 0; inner < 4; inner++) {
          const left = p[row]?.[inner];
          const right = p[inner]?.[column];

          if (left === undefined || right === undefined) throw new Error('Projector idempotence needs both factors.');

          square += left * right;
        }

        expect(square).toBeCloseTo(original, 13);
      }
    }

    expect(trace).toBeCloseTo(1, 14);
    const cosine = product / (normU * normV);
    expect(frobeniusDistance(p, q) ** 2).toBeCloseTo(2 * (1 - cosine ** 2), 13);
    expect(lineDistance(angleBetweenLines(u, v))).toBeCloseTo(frobeniusDistance(p, q), 13);
  }

  for (const theta of RING_ANGLES) {
    const point = projectorCirclePoint(theta);
    const sameLine = projectorCirclePoint(theta + Math.PI);
    expect(Math.hypot(point.x, point.y)).toBeCloseTo(1 / Math.SQRT2, 14);
    expect(squaredDistance(point, sameLine)).toBeCloseTo(0, 14);

    for (const other of RING_ANGLES) {
      const target = projectorCirclePoint(other);
      const p = projector([Math.cos(theta), Math.sin(theta), 0, 0]);
      const q = projector([Math.cos(other), Math.sin(other), 0, 0]);
      expect(squaredDistance(point, target)).toBeCloseTo(frobeniusDistance(p, q) ** 2, 13);
    }
  }
});

test('156: offset cuts have honest diameter witnesses and three closed sectors have strictly smaller diameter', () => {
  for (let index = 0; index < 360; index++) {
    const phi = 2 * Math.PI * index / 360;

    for (const offset of [-.9, -.5, -.15, 0, .15, .35, .55, .9]) {
      const cut = discCut(phi, offset);
      const { a, b, side, rimIndices } = cut.witness;
      expect(squaredDistance(a, b)).toBeCloseTo(4, 14);

      for (const point of [a, b]) {
        expect(Math.hypot(point.x, point.y)).toBeCloseTo(1, 14);
        const projection = point.x * cut.normal.x + point.y * cut.normal.y;

        if (side === 'lower') expect(projection).toBeLessThanOrEqual(offset + 1e-14);
        else expect(projection).toBeGreaterThanOrEqual(offset - 1e-14);
      }

      for (const endpoint of cut.chord) {
        expect(Math.hypot(endpoint.x, endpoint.y)).toBeCloseTo(1, 14);
        expect(endpoint.x * cut.normal.x + endpoint.y * cut.normal.y).toBeCloseTo(offset, 14);
      }

      if (Math.abs(offset) >= .15) {
        if (!rimIndices) throw new Error('The displayed offsets must have a valid pair among the24 carried rim dots.');

        const carriedA = RIM_POINTS[rimIndices[0]];
        const carriedB = RIM_POINTS[rimIndices[1]];

        if (!carriedA || !carriedB) throw new Error('Both witness indices must select actual carried rim dots.');

        expect(a).toEqual(carriedA);
        expect(b).toEqual(carriedB);
        expect(cut.witness.margin).toBeGreaterThan(0);
      }
    }
  }

  for (const opening of [0, Math.PI / 6, Math.PI / 3, 2 * Math.PI / 3, Math.PI, 1.3 * Math.PI, 2 * Math.PI]) {
    const points: Point[] = [{ x: 0, y: 0 }];

    for (let step = 0; step <= 180; step++) points.push({ x: Math.cos(opening * step / 180), y: Math.sin(opening * step / 180) });

    if (opening >= Math.PI) points.push({ x: -1, y: 0 });

    let widest = 0;

    for (const a of points) {
      for (const b of points) widest = Math.max(widest, Math.sqrt(squaredDistance(a, b)));
    }

    expect(sectorDiameter(opening)).toBeCloseTo(widest, 13);
  }

  expect(sectorDiameter(2 * Math.PI / 3)).toBeLessThan(2);
});

test('156: four orthogonal projectors form a regular simplex while the full projector set spans the nine-dimensional trace-one affine space', () => {
  const model = buildProjectorModel();
  const simplex = model.simplex;
  expect(simplex.edges).toHaveLength(6);

  for (const edge of simplex.edges) {
    const a = simplex.vertices[edge.a];
    const b = simplex.vertices[edge.b];

    if (!a || !b) throw new Error('Every orthogonal-simplex edge needs its isometric three-dimensional vertices.');

    expect(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)).toBeCloseTo(edge.distance, 14);
    expect(edge.distance).toBeCloseTo(Math.SQRT2, 14);
  }

  for (const k of [2, 3, 4]) {
    const vectors: number[][] = [];

    for (let i = 0; i < k; i++) vectors.push(Array.from({ length: k }, (_, coordinate) => coordinate === i ? 1 : 0));

    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) vectors.push(Array.from({ length: k }, (_, coordinate) => coordinate === i || coordinate === j ? 1 : 0));
    }

    const coordinates = vectors.map(vector => upperTriangle(projector(vector)));
    const base = coordinates[0];

    if (!base) throw new Error('The affine-span check needs its first rank-one projector.');

    const differences = coordinates.slice(1).map(row => row.map((value, column) => {
      const origin = base[column];

      if (origin === undefined) throw new Error('Affine differences need matching symmetric coordinates.');

      return value - origin;
    }));
    expect(rank(differences)).toBe(traceOneDimension(k));
  }

  expect(() => projector([0, 0, 0, 0])).toThrow();
  expect(() => discCut(0, 2)).toThrow();
});

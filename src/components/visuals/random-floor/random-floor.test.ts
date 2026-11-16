import { expect, test } from 'bun:test';
import { buildRandomFloorModel, createGraph, homCounts, PATTERN_KEYS, type Edge, type Graph, type PatternKey } from './math';

function directHom(pattern: Graph, host: Graph): number {
  const images: number[] = [];
  let total = 0;

  function visit(vertex: number): void {
    if (vertex === pattern.vertexCount) {
      total++;

      return;
    }

    for (let target = 0; target < host.vertexCount; target++) {
      let valid = true;

      for (const [a, b] of pattern.edges) {
        const other = a === vertex ? b : b === vertex ? a : -1;

        if (other < 0 || other >= vertex) continue;

        const image = images[other];

        if (image === undefined) throw new Error('A direct map enumeration needs its previously assigned image.');

        if (!host.edges.some(([u, v]) => (u === target && v === image) || (v === target && u === image))) {
          valid = false;

          break;
        }
      }

      if (valid) {
        images[vertex] = target;
        visit(vertex + 1);
      }
    }
  }

  visit(0);

  return total;
}

test('161: bitset hom counts match independent repeated-map enumeration, and the four triples really form a cube', () => {
  const model = buildRandomFloorModel();

  for (const host of model.hosts) {
    for (const key of PATTERN_KEYS) {
      expect(host.byPattern[key].hom).toBe(directHom(model.patterns[key], host.graph));
      expect(host.byPattern[key].t).toBe(host.byPattern[key].hom / host.graph.vertexCount ** model.patterns[key].vertexCount);
    }
  }

  const maps = model.cherryMaps;
  const distinctMaps = new Set(maps.map(map => map.images.join(',')));
  let successes = 0;
  let repeatedSuccesses = 0;

  for (const map of maps) {
    const [a, b, c] = map.images;
    const succeeds = model.primary.graph.edges.some(([u, v]) => (a === u && b === v) || (a === v && b === u)) && model.primary.graph.edges.some(([u, v]) => (b === u && c === v) || (b === v && c === u));
    expect(map.succeeds).toBe(succeeds);
    expect(map.repeated).toBe(new Set(map.images).size < 3);

    if (succeeds) {
      successes++;
      if (map.repeated) repeatedSuccesses++;
    }
  }

  expect(distinctMaps.size).toBe(model.primary.graph.vertexCount ** model.patterns.cherry.vertexCount);
  expect(successes).toBe(directHom(model.patterns.cherry, model.primary.graph));
  expect(repeatedSuccesses).toBeGreaterThan(0);
  expect(model.repeatedExample.succeeds && model.repeatedExample.repeated).toBe(true);
  expect(model.repeatedExample.images).toEqual([0, 3, 0]);

  for (const pair of model.incidence.pairs) {
    const actual = model.incidence.triples.flatMap((triple, index) => triple.includes(pair.points[0]) && triple.includes(pair.points[1]) ? [index] : []);
    expect(pair.tripleIndices).toEqual(actual);
    expect(actual.length).toBe(2);
  }

  // This independent binary-coordinate witness identifies the incidence graph
  // with Q3: adjacent vertices differ in exactly one coordinate.
  const cubeLabels = [0b000, 0b011, 0b101, 0b110, 0b001, 0b010, 0b100, 0b111];
  const incidenceDegrees = Array<number>(8).fill(0);

  for (let a = 0; a < 8; a++) {
    for (let b = a + 1; b < 8; b++) {
      const u = cubeLabels[a];
      const v = cubeLabels[b];

      if (u === undefined || v === undefined) throw new Error('Every cube vertex needs its binary label.');

      const difference = u ^ v;
      const binaryEdge = difference !== 0 && (difference & (difference - 1)) === 0;
      const incidenceEdge = model.incidence.graph.edges.some(([x, y]) => x === a && y === b);
      expect(incidenceEdge).toBe(binaryEdge);

      if (incidenceEdge) {
        const da = incidenceDegrees[a];
        const db = incidenceDegrees[b];

        if (da === undefined || db === undefined) throw new Error('Every cube vertex needs its degree accumulator.');

        incidenceDegrees[a] = da + 1;
        incidenceDegrees[b] = db + 1;
      }
    }
  }

  expect(incidenceDegrees.every(degree => degree === 3)).toBe(true);
  expect(homCounts(createGraph(4, []))).toEqual({ cherry: 0, 'four-cycle': 0, cube: 0 });
});

test('161: all 1,023 five-vertex hosts pass an independent exact rational comparison and give the reported minima', () => {
  const model = buildRandomFloorModel();
  const slots: Edge[] = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]];
  const best: Record<PatternKey, { numerator: bigint; denominator: bigint } | undefined> = { cherry: undefined, 'four-cycle': undefined, cube: undefined };
  const masks = new Set<number>();

  for (const row of model.sweep.rows) {
    const edges: Edge[] = [];

    for (const [index, edge] of slots.entries()) {
      if ((row.mask & (2 ** index)) !== 0) edges.push(edge);
    }

    const host = createGraph(5, edges);
    masks.add(row.mask);
    expect(row.edgeCount).toBe(edges.length);

    for (const key of PATTERN_KEYS) {
      const pattern = model.patterns[key];
      const hom = directHom(pattern, host);
      expect(row.hom[key]).toBe(hom);
      const numerator = BigInt(hom) * 5n ** BigInt(2 * pattern.edges.length - pattern.vertexCount);
      const denominator = BigInt(2 * edges.length) ** BigInt(pattern.edges.length);
      expect(numerator >= denominator).toBe(true);
      const previous = best[key];

      if (!previous || numerator * previous.denominator < previous.numerator * denominator) best[key] = { numerator, denominator };
    }
  }

  expect(masks.size).toBe(2 ** slots.length - 1);
  expect(Math.min(...masks)).toBe(1);
  expect(Math.max(...masks)).toBe(2 ** slots.length - 1);

  for (const key of PATTERN_KEYS) {
    const actual = model.sweep.minima[key];
    const expected = best[key];

    if (!expected) throw new Error('The nonempty sweep must produce an exact minimum for every toy pattern.');

    expect(actual.density.exactRatio.numerator * expected.denominator).toBe(expected.numerator * actual.density.exactRatio.denominator);
    expect(actual.density.hom).toBe(directHom(model.patterns[key], actual.graph));
    expect(actual.tiedMasks).toContain(actual.mask);
    expect(actual.density.ratio).toBe(Number(expected.numerator) / Number(expected.denominator));
  }
});

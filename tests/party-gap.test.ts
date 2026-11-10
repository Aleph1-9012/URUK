import { expect, test } from 'bun:test';
import { createPartyModel, incident, monochromaticTriangles, pairs, type Graph } from '../src/components/visuals/party-gap/math';

const model = createPartyModel();

function permutations(values: number[]): number[][] {
  if (values.length === 0) return [[]];

  const result: number[][] = [];

  for (const [index, value] of values.entries()) {
    const rest = values.slice(0, index).concat(values.slice(index + 1));

    for (const tail of permutations(rest)) result.push([value, ...tail]);
  }

  return result;
}

function exhaustiveIndependence(graph: Graph): number {
  const valid = new Uint8Array(1 << graph.order);
  const sizes = new Uint8Array(valid.length);
  valid[0] = 1;
  let largest = 0;

  for (let mask = 1; mask < valid.length; mask++) {
    const bit = mask & -mask;
    const vertex = Math.log2(bit);
    const rest = mask ^ bit;
    const neighbors = graph.neighbors[vertex];

    if (neighbors === undefined) throw new Error('The selected bit has a neighborhood.');
    if (!valid[rest] || (neighbors & rest)) continue;

    const restSize = sizes[rest];

    if (restSize === undefined) throw new Error('The smaller subset has an initialized size.');

    valid[mask] = 1;
    sizes[mask] = restSize + 1;
    largest = Math.max(largest, restSize + 1);
  }

  return largest;
}

test('170: the exhaustive party census gives all six-party colourings and precisely the twelve labelled five-cycles', () => {
  expect(model.party.six.total).toBe(32768);
  expect(model.party.six.without).toBe(0);
  expect(model.party.five.total).toBe(1024);
  expect(model.party.five.without).toBe(12);
  const cycleCodes = new Set<number>();
  const fivePairs = pairs(5);

  for (const order of permutations([1, 2, 3, 4])) {
    const cycle = [0, ...order, 0];
    const cycleEdges = new Set<string>();

    for (let i = 0; i < cycle.length - 1; i++) {
      const a = cycle[i];
      const b = cycle[i + 1];

      if (a === undefined || b === undefined) throw new Error('A cycle has consecutive vertices.');

      cycleEdges.add(`${Math.min(a, b)},${Math.max(a, b)}`);
    }

    let code = 0;

    for (const [index, edge] of fivePairs.entries()) {
      if (cycleEdges.has(edge.join(','))) code |= 1 << index;
    }

    cycleCodes.add(code);
  }

  expect(cycleCodes).toEqual(new Set(model.party.five.triangleFreeCodes));
  expect(monochromaticTriangles(5, model.party.pentagon)).toEqual([]);
  expect(model.party.triangles).toEqual([{ vertices: [0, 3, 4], acquainted: true }, { vertices: [1, 2, 5], acquainted: true }]);
});

test('170: the projective plane has thirteen points and fifty-two flags, and no ordered triple of flags forms a triangle', () => {
  const points = model.toy.points;
  const flags = model.toy.allFlags;
  expect(points.length).toBe(13);
  expect(flags.length).toBe(52);
  expect(new Set(points.map(point => point.join(','))).size).toBe(13);

  for (const a of points) {
    let lines = 0;

    for (const b of points) lines += Number(incident(a, b));

    expect(lines).toBe(4);
  }

  const directed = new Uint8Array(flags.length * flags.length);

  for (const [i, first] of flags.entries()) {
    const a = points[first.point];
    const b = points[first.line];

    if (!a || !b) throw new Error('The flag has a projective point and line.');

    for (const [j, second] of flags.entries()) {
      const c = points[second.point];
      const d = points[second.line];

      if (!c || !d) throw new Error('The flag has a projective point and line.');

      directed[i * flags.length + j] = Number(incident(a, d) && !incident(c, b));
    }
  }

  let triangles = 0;

  for (let i = 0; i < flags.length; i++) {
    for (let j = 0; j < flags.length; j++) {
      if (!directed[i * flags.length + j]) continue;

      for (let k = 0; k < flags.length; k++) triangles += Number(Boolean(directed[i * flags.length + k] && directed[j * flags.length + k]));
    }
  }

  expect(triangles).toBe(0);
  expect(model.toy.graph.edges.length).toBe(31);
  expect(model.toy.triangles).toEqual([]);
});

test('170: the highlighted toy stranger group is the lexicographically first maximum independent set', () => {
  expect(model.toy.independent).toEqual([1, 2, 3, 5, 6, 8, 9, 13, 16, 18]);
  expect(exhaustiveIndependence(model.toy.graph)).toBe(model.toy.independent.length);
  let mask = 0;

  for (const vertex of model.toy.independent) mask |= 1 << vertex;

  for (const vertex of model.toy.independent) {
    const neighbors = model.toy.graph.neighbors[vertex];

    if (neighbors === undefined) throw new Error('The independent-set position exists in the graph.');

    expect(neighbors & mask).toBe(0);
  }
});

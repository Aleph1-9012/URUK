// Only the seeded colouring, flag stream and article exponents are stored from 170-checks/ramsey.json.
import data from './data.json';

export type Edge = readonly [number, number];

export type Triple = readonly [number, number, number];

export type ColoredTriangle = { vertices: Triple; acquainted: boolean };

export type ProjectivePoint = readonly [number, number, number];

export type Flag = { point: number; line: number };

export type Graph = { order: number; edges: Edge[]; neighbors: Uint32Array };

export type CurveKind = 'classical' | 'aks' | 'bradac' | 'spencer' | 'claim';

export function pairs(people: number): Edge[] {
  const edges: Edge[] = [];

  for (let first = 0; first < people; first++) {
    for (let second = first + 1; second < people; second++) edges.push([first, second]);
  }

  return edges;
}

export function triples(people: number): Triple[] {
  const result: Triple[] = [];

  for (let first = 0; first < people; first++) {
    for (let second = first + 1; second < people; second++) {
      for (let third = second + 1; third < people; third++) result.push([first, second, third]);
    }
  }

  return result;
}

function pairIndex(people: number, a: number, b: number): number {
  return a * (2 * people - a - 1) / 2 + b - a - 1;
}

export function monochromaticTriangles(people: number, colors: readonly boolean[]): ColoredTriangle[] {
  if (colors.length !== people * (people - 1) / 2) throw new RangeError('The colouring must specify every pair.');

  const result: ColoredTriangle[] = [];

  for (const vertices of triples(people)) {
    const [a, b, c] = vertices;
    const first = colors[pairIndex(people, a, b)];
    const second = colors[pairIndex(people, a, c)];
    const third = colors[pairIndex(people, b, c)];

    if (first === undefined || second === undefined || third === undefined) throw new Error('Each triangle has three colored pairs.');
    if (first === second && second === third) result.push({ vertices, acquainted: first });
  }

  return result;
}

export function coloringCensus(people: number) {
  if (!Number.isInteger(people) || people < 3 || people > 6) throw new RangeError('The exhaustive party census supports three through six people.');

  const edgeCount = people * (people - 1) / 2;
  const total = 2 ** edgeCount;
  const triangleMasks = triples(people).map(([a, b, c]) => (1 << pairIndex(people, a, b)) | (1 << pairIndex(people, a, c)) | (1 << pairIndex(people, b, c)));
  const triangleFreeCodes: number[] = [];

  for (let code = 0; code < total; code++) {
    let triangle = false;

    for (const mask of triangleMasks) {
      const selected = code & mask;

      if (selected === 0 || selected === mask) {
        triangle = true;
        break;
      }
    }

    if (!triangle) triangleFreeCodes.push(code);
  }

  return { people, total, without: triangleFreeCodes.length, withTriangle: total - triangleFreeCodes.length, triangleFreeCodes };
}

export function projectivePoints(): ProjectivePoint[] {
  const result: ProjectivePoint[] = [];
  const seen = new Set<string>();

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        const first = x || y || z;

        if (first === 0) continue;

        const inverse = first === 1 ? 1 : 2;
        const point: ProjectivePoint = [x * inverse % 3, y * inverse % 3, z * inverse % 3];
        const key = point.join(',');

        if (seen.has(key)) continue;

        seen.add(key);
        result.push(point);
      }
    }
  }

  return result;
}

export function incident(point: ProjectivePoint, line: ProjectivePoint): boolean {
  return (point[0] * line[0] + point[1] * line[1] + point[2] * line[2]) % 3 === 0;
}

export function allFlags(points: readonly ProjectivePoint[]): Flag[] {
  const flags: Flag[] = [];

  for (const [point, a] of points.entries()) {
    for (const [line, b] of points.entries()) {
      if (incident(a, b)) flags.push({ point, line });
    }
  }

  return flags;
}

export function graphFromEdges(order: number, edges: Edge[]): Graph {
  if (!Number.isInteger(order) || order < 1 || order > 30) throw new RangeError('The exact bit-mask graph supports one through thirty vertices.');

  const neighbors = new Uint32Array(order);

  for (const [a, b] of edges) {
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b >= order || a >= b) throw new RangeError('Each graph edge joins two ordered distinct positions.');

    const first = neighbors[a];
    const second = neighbors[b];

    if (first === undefined || second === undefined) throw new Error('Every graph position has an initialized neighborhood.');

    neighbors[a] = first | (1 << b);
    neighbors[b] = second | (1 << a);
  }

  return { order, edges, neighbors };
}

export function flagGraph(flags: readonly Flag[], points: readonly ProjectivePoint[] = projectivePoints()): Graph {
  const edges: Edge[] = [];

  for (let i = 0; i < flags.length; i++) {
    const first = flags[i];

    if (!first) throw new Error('Every ordered flag position exists.');

    const a = points[first.point];
    const b = points[first.line];

    if (!a || !b || !incident(a, b)) throw new Error('Every stream flag consists of an incident point and line.');

    for (let j = i + 1; j < flags.length; j++) {
      const second = flags[j];

      if (!second) throw new Error('Every ordered flag position exists.');

      const c = points[second.point];
      const d = points[second.line];

      if (!c || !d || !incident(c, d)) throw new Error('Every stream flag consists of an incident point and line.');
      if (incident(a, d) && !incident(c, b)) edges.push([i, j]);
    }
  }

  return graphFromEdges(flags.length, edges);
}

export function graphTriangles(graph: Graph): Triple[] {
  const triangles: Triple[] = [];

  for (const [a, b, c] of triples(graph.order)) {
    const first = graph.neighbors[a];
    const second = graph.neighbors[b];

    if (first === undefined || second === undefined) throw new Error('The graph has every requested neighborhood.');
    if ((first & (1 << b)) && (first & (1 << c)) && (second & (1 << c))) triangles.push([a, b, c]);
  }

  return triangles;
}

export function popcount(value: number): number {
  let count = 0;

  while (value) {
    value &= value - 1;
    count++;
  }

  return count;
}

export function maximumIndependentSet(graph: Graph): number[] {
  let best: number[] = [];
  const selected: number[] = [];

  function grow(candidates: number): void {
    if (selected.length + popcount(candidates) <= best.length) return;

    if (candidates === 0) {
      best = selected.slice();

      return;
    }

    const bit = candidates & -candidates;
    const vertex = Math.log2(bit);
    const neighbors = graph.neighbors[vertex];

    if (neighbors === undefined) throw new Error('The selected bit identifies an existing graph position.');

    selected.push(vertex);
    grow(candidates & ~neighbors & ~bit);
    selected.pop();
    grow(candidates & ~bit);
  }

  grow((1 << graph.order) - 1);

  return best;
}

export function curveValue(kind: CurveKind, t: number, epsilon = .08): number {
  if (!(t > 1)) throw new RangeError('The schematic asymptotic curves use t > 1.');

  const log = Math.log(t);

  switch (kind) {
    case 'classical': return t ** 4;
    case 'aks': return t ** 4 / log ** 3;
    case 'bradac': return t ** 4 / log ** 6;
    case 'spencer': return (t / log) ** 3;
    case 'claim': return t ** 4 / log ** (3 + epsilon);
  }
}

export function createPartyModel() {
  const points = projectivePoints();
  const flags = data.flags.map(tuple => {
    const [point, line] = tuple;

    if (point === undefined || line === undefined) throw new Error('Every stored flag has a point and a line index.');

    return { point, line };
  });
  const graph = flagGraph(flags, points);

  return {
    party: {
      colors: data.hunt, pairs: pairs(6), triangles: monochromaticTriangles(6, data.hunt),
      six: coloringCensus(6), five: coloringCensus(5),
      pentagon: pairs(5).map(([a, b]) => b - a === 1 || b - a === 4), huntSeed: data.huntSeed,
    },
    toy: { points, allFlags: allFlags(points), flags, graph, independent: maximumIndependentSet(graph), triangles: graphTriangles(graph), streamsChecked: data.streamsChecked },
    ladder: data.ladder,
  };
}

export type PartyModel = ReturnType<typeof createPartyModel>;

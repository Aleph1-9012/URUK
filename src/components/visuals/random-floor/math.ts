export type Edge = readonly [number, number];

export type Triple = readonly [number, number, number];

export type Graph = {
  readonly vertexCount: number;
  readonly edges: readonly Edge[];
  readonly adjacency: readonly number[];
};

export const PATTERN_KEYS = ['cherry', 'four-cycle', 'cube'] as const;

export type PatternKey = typeof PATTERN_KEYS[number];

export type Rational = { readonly numerator: bigint; readonly denominator: bigint };

export type Density = {
  readonly hom: number;
  readonly t: number;
  readonly pPower: number;
  readonly ratio: number;
  readonly exactRatio: Rational;
};

export type HostKey = 'star' | 'bipartite' | 'cycle' | 'triangles';

export type HostResult = {
  readonly key: HostKey;
  readonly name: string;
  readonly graph: Graph;
  readonly p: number;
  readonly byPattern: Readonly<Record<PatternKey, Density>>;
};

export type CherryMap = {
  readonly images: readonly [number, number, number];
  readonly succeeds: boolean;
  readonly repeated: boolean;
};

export function createGraph(vertexCount: number, sourceEdges: readonly Edge[]): Graph {
  if (!Number.isInteger(vertexCount) || vertexCount < 1 || vertexCount > 30) throw new RangeError('A toy graph needs one to thirty vertices for its adjacency bitsets.');

  const adjacency = Array<number>(vertexCount).fill(0);
  const edges: Edge[] = [];
  const seen = new Set<number>();

  for (const [u, v] of sourceEdges) {
    if (!Number.isInteger(u) || !Number.isInteger(v) || u < 0 || v < 0 || u >= vertexCount || v >= vertexCount || u === v) throw new RangeError('Toy host edges must join two distinct vertices of the graph.');

    const a = Math.min(u, v);
    const b = Math.max(u, v);
    const key = a * vertexCount + b;

    if (seen.has(key)) throw new Error('A simple toy graph cannot contain a repeated edge.');

    const neighborsA = adjacency[a];
    const neighborsB = adjacency[b];

    if (neighborsA === undefined || neighborsB === undefined) throw new Error('Every toy vertex needs an initialized adjacency bitset.');

    seen.add(key);
    edges.push([a, b]);
    adjacency[a] = neighborsA | (1 << b);
    adjacency[b] = neighborsB | (1 << a);
  }

  return { vertexCount, edges, adjacency };
}

function bitCount(bits: number): number {
  let count = 0;

  while (bits !== 0) {
    bits &= bits - 1;
    count++;
  }

  return count;
}

function adjacencyAt(graph: Graph, vertex: number): number {
  const row = graph.adjacency[vertex];

  if (row === undefined) throw new RangeError('A homomorphism image must be a vertex of its host.');

  return row;
}

export function homCounts(graph: Graph): Record<PatternKey, number> {
  const n = graph.vertexCount;
  const tripleCounts = new Uint8Array(n * n * n);
  let cherry = 0;
  let fourCycle = 0;

  for (let a = 0; a < n; a++) {
    const neighborsA = adjacencyAt(graph, a);
    const degree = bitCount(neighborsA);
    cherry += degree * degree;

    for (let b = 0; b < n; b++) {
      const common = neighborsA & adjacencyAt(graph, b);
      const count = bitCount(common);
      fourCycle += count * count;

      for (let c = 0; c < n; c++) tripleCounts[(a * n + b) * n + c] = bitCount(common & adjacencyAt(graph, c));
    }
  }

  let cube = 0;

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      for (let c = 0; c < n; c++) {
        const abc = tripleCounts[(a * n + b) * n + c];

        if (abc === undefined) throw new Error('Every triple of host images needs its common-neighbor count.');
        if (abc === 0) continue;

        for (let d = 0; d < n; d++) {
          const abd = tripleCounts[(a * n + b) * n + d];
          const acd = tripleCounts[(a * n + c) * n + d];
          const bcd = tripleCounts[(b * n + c) * n + d];

          if (abd === undefined || acd === undefined || bcd === undefined) throw new Error('All four incidence triples need their common-neighbor counts.');

          cube += abc * abd * acd * bcd;
        }
      }
    }
  }

  return { cherry, 'four-cycle': fourCycle, cube };
}

function rational(numerator: bigint, denominator: bigint): Rational {
  if (denominator <= 0n) throw new RangeError('An exact density ratio needs a positive denominator.');

  let a = numerator < 0n ? -numerator : numerator;
  let b = denominator;

  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return { numerator: numerator / a, denominator: denominator / a };
}

export function compareRationals(a: Rational, b: Rational): -1 | 0 | 1 {
  const difference = a.numerator * b.denominator - b.numerator * a.denominator;

  return difference < 0n ? -1 : difference > 0n ? 1 : 0;
}

export function toyIncidence() {
  const triples: Triple[] = [];
  const pairs: { points: Edge; tripleIndices: number[] }[] = [];
  const edges: Edge[] = [];

  for (let a = 0; a < 4; a++) {
    for (let b = a + 1; b < 4; b++) {
      for (let c = b + 1; c < 4; c++) triples.push([a, b, c]);
    }
  }

  for (const [index, triple] of triples.entries()) {
    for (const point of triple) edges.push([point, 4 + index]);
  }

  for (let a = 0; a < 4; a++) {
    for (let b = a + 1; b < 4; b++) {
      const tripleIndices: number[] = [];

      for (const [index, triple] of triples.entries()) {
        if (triple.includes(a) && triple.includes(b)) tripleIndices.push(index);
      }

      pairs.push({ points: [a, b], tripleIndices });
    }
  }

  return { triples, pairs, graph: createGraph(8, edges) };
}

function patternGraphs(): Record<PatternKey, Graph> {
  return {
    cherry: createGraph(3, [[0, 1], [1, 2]]),
    'four-cycle': createGraph(4, [[0, 1], [1, 2], [2, 3], [3, 0]]),
    cube: toyIncidence().graph,
  };
}

function density(graph: Graph, pattern: Graph, hom: number): Density {
  if (graph.edges.length === 0) throw new RangeError('The ratio to the random floor is shown only for hosts with an edge.');

  const n = BigInt(graph.vertexCount);
  const twiceEdges = 2n * BigInt(graph.edges.length);
  const vertices = BigInt(pattern.vertexCount);
  const edges = BigInt(pattern.edges.length);
  const exactRatio = rational(BigInt(hom) * n ** (2n * edges - vertices), twiceEdges ** edges);
  const p = 2 * graph.edges.length / graph.vertexCount ** 2;

  return { hom, t: hom / graph.vertexCount ** pattern.vertexCount, pPower: p ** pattern.edges.length, ratio: Number(exactRatio.numerator) / Number(exactRatio.denominator), exactRatio };
}

function densityRows(graph: Graph, patterns: Readonly<Record<PatternKey, Graph>>, hom: Readonly<Record<PatternKey, number>>): Record<PatternKey, Density> {
  return {
    cherry: density(graph, patterns.cherry, hom.cherry),
    'four-cycle': density(graph, patterns['four-cycle'], hom['four-cycle']),
    cube: density(graph, patterns.cube, hom.cube),
  };
}

function graphFromMask(mask: number): Graph {
  const edges: Edge[] = [];
  let index = 0;

  for (let a = 0; a < 5; a++) {
    for (let b = a + 1; b < 5; b++) {
      if ((mask & (1 << index)) !== 0) edges.push([a, b]);

      index++;
    }
  }

  return createGraph(5, edges);
}

function sweepGraphs(patterns: Readonly<Record<PatternKey, Graph>>) {
  const firstGraph = graphFromMask(1);
  const firstRows = densityRows(firstGraph, patterns, homCounts(firstGraph));
  const minima: Record<PatternKey, { mask: number; graph: Graph; density: Density; tiedMasks: number[] }> = {
    cherry: { mask: 1, graph: firstGraph, density: firstRows.cherry, tiedMasks: [] },
    'four-cycle': { mask: 1, graph: firstGraph, density: firstRows['four-cycle'], tiedMasks: [] },
    cube: { mask: 1, graph: firstGraph, density: firstRows.cube, tiedMasks: [] },
  };
  const rows: { mask: number; edgeCount: number; hom: Record<PatternKey, number> }[] = [];

  for (let mask = 1; mask < 1024; mask++) {
    const graph = graphFromMask(mask);
    const hom = homCounts(graph);
    const counts = densityRows(graph, patterns, hom);
    rows.push({ mask, edgeCount: graph.edges.length, hom });

    for (const key of PATTERN_KEYS) {
      const result = counts[key];
      const comparison = compareRationals(result.exactRatio, minima[key].density.exactRatio);

      if (comparison < 0) {
        minima[key] = { mask, graph, density: result, tiedMasks: [mask] };
      } else if (comparison === 0) {
        minima[key].tiedMasks.push(mask);
      }
    }
  }

  return { vertexCount: 5, graphCount: rows.length, rows, minima };
}

function cherryMaps(graph: Graph): CherryMap[] {
  const maps: CherryMap[] = [];

  for (let a = 0; a < graph.vertexCount; a++) {
    for (let b = 0; b < graph.vertexCount; b++) {
      for (let c = 0; c < graph.vertexCount; c++) {
        const succeeds = (adjacencyAt(graph, a) & (1 << b)) !== 0 && (adjacencyAt(graph, b) & (1 << c)) !== 0;
        maps.push({ images: [a, b, c], succeeds, repeated: a === b || a === c || b === c });
      }
    }
  }

  return maps;
}

function computeRandomFloorModel() {
  const patterns = patternGraphs();
  const completeBipartite: Edge[] = [];

  for (let a = 0; a < 3; a++) {
    for (let b = 3; b < 6; b++) completeBipartite.push([a, b]);
  }

  const sources: { key: HostKey; name: string; graph: Graph }[] = [
    { key: 'star', name: 'star K1,5', graph: createGraph(6, [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]]) },
    { key: 'bipartite', name: 'complete bipartite K3,3', graph: createGraph(6, completeBipartite) },
    { key: 'cycle', name: '6-cycle', graph: createGraph(6, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]]) },
    { key: 'triangles', name: 'two triangles', graph: createGraph(6, [[0, 1], [1, 2], [0, 2], [3, 4], [4, 5], [3, 5]]) },
  ];
  const hosts: HostResult[] = sources.map(source => ({ ...source, p: 2 * source.graph.edges.length / source.graph.vertexCount ** 2, byPattern: densityRows(source.graph, patterns, homCounts(source.graph)) }));
  const primary = hosts.find(host => host.key === 'bipartite');

  if (!primary) throw new Error('The carried host must be the complete bipartite graph K3,3.');

  const maps = cherryMaps(primary.graph);
  const repeatedExample = maps.find(map => map.images[0] === 0 && map.images[1] === 3 && map.images[2] === 0);

  if (!repeatedExample || !repeatedExample.succeeds || !repeatedExample.repeated) throw new Error('The carried cherry needs the valid repeated map 0,3,0.');

  return {
    patterns,
    hosts,
    primary,
    cherryMaps: maps,
    repeatedExample,
    incidence: toyIncidence(),
    sweep: sweepGraphs(patterns),
    paperCounts: { points: 13, triples: 22, vertices: 35, edges: 66, pairs: 33, eachPairInFaces: 2 },
  };
}

export type RandomFloorModel = ReturnType<typeof computeRandomFloorModel>;

let cachedModel: RandomFloorModel | undefined;

export function buildRandomFloorModel(): RandomFloorModel {
  if (!cachedModel) cachedModel = computeRandomFloorModel();

  return cachedModel;
}

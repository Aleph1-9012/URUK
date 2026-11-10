// Labels, rounded prism positions and chosen tours are from 180-checks/barnette.json.
// Adjacent-position swaps embed as the inverse permutations of (0,1,2,3).
import data from './data.json';

export type Point = { x: number; y: number };

export type Point3 = Point & { z: number };

export type Edge = readonly [number, number];

export type SolidKey = 'cube' | 'hexagonal_prism' | 'truncated_octahedron';

export type Face = { vertices: number[]; centre: Point; outer: boolean };

export type Embedding = { positions: Point[]; edges: Edge[]; adjacency: number[][]; faces: Face[]; outerFace: number };

export type DualLink = { a: number; b: number; edge: Edge; route: Point[] };

export type FaceSplit = { inside: number[]; outside: number[]; links: DualLink[]; insideLinks: DualLink[]; outsideLinks: DualLink[] };

export type CornerCorrespondence = {
  starts: Point[];
  ends: Point[];
  matched: { old: number; target: number }[];
  addedTargets: number[];
  departingOld: number[];
};

export type Solid = Embedding & {
  key: SolidKey;
  spatial: Point3[];
  colors: number[];
  tours: number[][];
  firstTour: number[];
  split: FaceSplit;
  avoided: { edge: Edge; tour: number[] }[];
};

function pointAt(positions: readonly Point[], index: number): Point {
  const point = positions[index];

  if (!point) throw new Error('The indexed diagram vertex exists.');

  return point;
}

export function edgeKey(a: number, b: number): string {
  return `${Math.min(a, b)},${Math.max(a, b)}`;
}

export function tourEdges(tour: readonly number[]): Set<string> {
  const edges = new Set<string>();

  for (const [index, a] of tour.entries()) {
    const b = tour[(index + 1) % tour.length];

    if (b === undefined) throw new Error('A tour edge has its next corner.');

    edges.add(edgeKey(a, b));
  }

  return edges;
}

/** Progress is the fraction of the complete closed tour's Euclidean length. */
export function sampleTour(positions: readonly Point[], tour: readonly number[], progress: number): { point: Point; visited: number[]; trail: Point[] } {
  if (!Number.isFinite(progress) || tour.length < 3) throw new RangeError('A tour sample needs finite progress and at least three corners.');

  const first = tour[0];

  if (first === undefined) throw new Error('The sampled tour has its first corner.');

  const lengths: number[] = [];
  let total = 0;

  for (const [index, a] of tour.entries()) {
    const b = tour[(index + 1) % tour.length];

    if (b === undefined) throw new Error('The sampled tour has every closing endpoint.');

    const p = pointAt(positions, a);
    const q = pointAt(positions, b);
    const length = Math.hypot(p.x - q.x, p.y - q.y);

    if (!(length > 0)) throw new Error('Every tour edge has positive length.');

    lengths.push(length);
    total += length;
  }

  const amount = Math.max(0, Math.min(1, progress));

  if (amount === 1) return { point: pointAt(positions, first), visited: tour.slice(), trail: [...tour.map(vertex => pointAt(positions, vertex)), pointAt(positions, first)] };

  let remaining = amount * total;
  const visited = [first];
  const trail = [pointAt(positions, first)];

  for (const [index, a] of tour.entries()) {
    const b = tour[(index + 1) % tour.length];
    const length = lengths[index];

    if (b === undefined || length === undefined) throw new Error('The tour sample has its next corner and edge length.');

    const p = pointAt(positions, a);
    const q = pointAt(positions, b);

    if (remaining >= length) {
      remaining -= length;
      trail.push(q);

      if (index + 1 < tour.length) visited.push(b);

      continue;
    }

    const fraction = remaining / length;
    const point = { x: p.x + (q.x - p.x) * fraction, y: p.y + (q.y - p.y) * fraction };

    if (remaining > 0) trail.push(point);

    return { point, visited, trail };
  }

  return { point: pointAt(positions, first), visited, trail };
}

/** Vertex zero is pinned. Other pairs match nearest-free; extras split or merge at the nearest corner. */
export function cornerCorrespondence(oldPositions: readonly Point[], targetPositions: readonly Point[]): CornerCorrespondence {
  const oldZero = pointAt(oldPositions, 0);
  const targetZero = pointAt(targetPositions, 0);
  const availableOld = new Set(oldPositions.keys());
  const availableTarget = new Set(targetPositions.keys());
  const matched = [{ old: 0, target: 0 }];
  const starts = targetPositions.map(() => oldZero);
  const ends = oldPositions.map(() => targetZero);
  availableOld.delete(0);
  availableTarget.delete(0);

  while (availableOld.size && availableTarget.size) {
    let nearestOld = -1;
    let nearestTarget = -1;
    let distance = Infinity;

    for (const old of availableOld) {
      const a = pointAt(oldPositions, old);

      for (const target of availableTarget) {
        const b = pointAt(targetPositions, target);
        const squared = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

        if (squared < distance) {
          nearestOld = old;
          nearestTarget = target;
          distance = squared;
        }
      }
    }

    if (nearestOld < 0 || nearestTarget < 0) throw new Error('A nonempty pair of corner sets has a nearest match.');

    matched.push({ old: nearestOld, target: nearestTarget });
    starts[nearestTarget] = pointAt(oldPositions, nearestOld);
    ends[nearestOld] = pointAt(targetPositions, nearestTarget);
    availableOld.delete(nearestOld);
    availableTarget.delete(nearestTarget);
  }

  for (const target of availableTarget) {
    const point = pointAt(targetPositions, target);
    let nearest = oldZero;
    let distance = Infinity;

    for (const old of oldPositions) {
      const squared = (point.x - old.x) ** 2 + (point.y - old.y) ** 2;

      if (squared < distance) {
        nearest = old;
        distance = squared;
      }
    }

    starts[target] = nearest;
  }

  for (const old of availableOld) {
    const point = pointAt(oldPositions, old);
    let nearest = targetZero;
    let distance = Infinity;

    for (const target of targetPositions) {
      const squared = (point.x - target.x) ** 2 + (point.y - target.y) ** 2;

      if (squared < distance) {
        nearest = target;
        distance = squared;
      }
    }

    ends[old] = nearest;
  }

  return { starts, ends, matched, addedTargets: [...availableTarget], departingOld: [...availableOld] };
}

export function adjacencyFor(order: number, edges: readonly Edge[]): number[][] {
  const adjacency: number[][] = Array.from({ length: order }, () => []);

  for (const [a, b] of edges) {
    const first = adjacency[a];
    const second = adjacency[b];

    if (!first || !second || a === b) throw new Error('Each polyhedron edge has two distinct vertices.');

    first.push(b);
    second.push(a);
  }

  for (const neighbors of adjacency) neighbors.sort((a, b) => a - b);

  return adjacency;
}

export function validTour(adjacency: readonly number[][], tour: readonly number[]): boolean {
  if (tour.length !== adjacency.length || new Set(tour).size !== adjacency.length) return false;

  for (const [index, a] of tour.entries()) {
    const b = tour[(index + 1) % tour.length];

    if (b === undefined || !adjacency[a]?.includes(b)) return false;
  }

  return true;
}

export function hamiltonTours(adjacency: readonly number[][]): number[][] {
  if (adjacency.length < 3 || adjacency.some(neighbors => neighbors.length !== 3)) throw new RangeError('The tour search needs a cubic graph.');

  const tours: number[][] = [];
  const path = [0];
  const seen = new Uint8Array(adjacency.length);
  seen[0] = 1;

  function visit(vertex: number): void {
    const neighbors = adjacency[vertex];

    if (!neighbors) throw new Error('The current tour vertex has its neighbors.');

    if (path.length === adjacency.length) {
      const second = path[1];

      if (second === undefined) throw new Error('A complete tour has a second corner.');
      if (neighbors.includes(0) && second < vertex) tours.push(path.slice());

      return;
    }

    for (const next of neighbors) {
      if (seen[next]) continue;

      seen[next] = 1;
      path.push(next);
      visit(next);
      path.pop();
      seen[next] = 0;
    }
  }

  visit(0);

  return tours;
}

export function bipartiteColors(adjacency: readonly number[][]): number[] {
  const colors = new Array<number>(adjacency.length).fill(-1);
  const queue = [0];
  colors[0] = 0;

  for (let index = 0; index < queue.length; index++) {
    const vertex = queue[index];

    if (vertex === undefined) throw new Error('The bipartite queue has its current vertex.');

    const neighbors = adjacency[vertex];
    const color = colors[vertex];

    if (!neighbors || color === undefined) throw new Error('The current vertex has a color and neighbors.');

    for (const next of neighbors) {
      if (colors[next] === -1) {
        colors[next] = 1 - color;
        queue.push(next);
      } else if (colors[next] === color) throw new Error('Every polyhedron edge must join opposite corner kinds.');
    }
  }

  if (colors.includes(-1)) throw new Error('The polyhedron graph is connected.');

  return colors;
}

export function signedArea(vertices: readonly number[], positions: readonly Point[]): number {
  let twice = 0;

  for (const [index, vertex] of vertices.entries()) {
    const next = vertices[(index + 1) % vertices.length];

    if (next === undefined) throw new Error('A face boundary closes at its next vertex.');

    const a = pointAt(positions, vertex);
    const b = pointAt(positions, next);
    twice += a.x * b.y - a.y * b.x;
  }

  return twice / 2;
}

export function extractFaces(positions: Point[], edges: Edge[], adjacency = adjacencyFor(positions.length, edges)): { faces: Face[]; outerFace: number } {
  const angular = adjacency.map((neighbors, vertex) => {
    const origin = pointAt(positions, vertex);

    return neighbors.slice().sort((first, second) => {
      const a = pointAt(positions, first);
      const b = pointAt(positions, second);

      return Math.atan2(a.y - origin.y, a.x - origin.x) - Math.atan2(b.y - origin.y, b.x - origin.x);
    });
  });
  const visited = new Set<string>();
  const faces: Face[] = [];
  let outerFace = -1;
  const radius = Math.max(...positions.map(point => Math.hypot(point.x, point.y)));

  for (const [startA, startB] of edges.flatMap(([a, b]): Edge[] => [[a, b], [b, a]])) {
    if (visited.has(`${startA},${startB}`)) continue;

    const vertices: number[] = [];
    let a = startA;
    let b = startB;

    for (let steps = 0; ; steps++) {
      if (steps > 2 * edges.length || visited.has(`${a},${b}`)) throw new Error('A planar face walk closes without revisiting another half-edge.');

      visited.add(`${a},${b}`);
      vertices.push(a);
      const neighbors = angular[b];

      if (!neighbors) throw new Error('A face walk reaches a vertex with angularly ordered neighbors.');

      const incoming = neighbors.indexOf(a);
      const next = neighbors[(incoming + neighbors.length - 1) % neighbors.length];

      if (incoming < 0 || next === undefined) throw new Error('A face walk continues across an incident half-edge.');

      a = b;
      b = next;

      if (a === startA && b === startB) break;
    }

    const outer = signedArea(vertices, positions) < 0;
    const centre = outer ? { x: 0, y: radius * 1.35 } : vertices.reduce((sum, vertex) => {
      const point = pointAt(positions, vertex);
      sum.x += point.x / vertices.length;
      sum.y += point.y / vertices.length;

      return sum;
    }, { x: 0, y: 0 });

    if (outer) {
      if (outerFace >= 0) throw new Error('The plane diagram has exactly one outer face.');

      outerFace = faces.length;
    }

    faces.push({ vertices, centre, outer });
  }

  if (outerFace < 0 || positions.length - edges.length + faces.length !== 2) throw new Error('The extracted planar faces satisfy Euler’s formula including the outer face.');

  return { faces, outerFace };
}

export function insidePolygon(point: Point, polygon: readonly Point[]): boolean {
  let inside = false;

  for (const [index, a] of polygon.entries()) {
    const b = polygon[(index + 1) % polygon.length];

    if (!b) throw new Error('The polygon has its next boundary point.');
    if ((a.y > point.y) !== (b.y > point.y) && point.x < a.x + (point.y - a.y) * (b.x - a.x) / (b.y - a.y)) inside = !inside;
  }

  return inside;
}

function dualRoute(embedding: Embedding, a: number, b: number, edge: Edge): Point[] {
  const first = embedding.faces[a];
  const second = embedding.faces[b];

  if (!first || !second) throw new Error('A dual link joins two plane faces.');
  if (first.outer) return dualRoute(embedding, b, a, edge).reverse();

  const p = pointAt(embedding.positions, edge[0]);
  const q = pointAt(embedding.positions, edge[1]);
  const middle = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };

  if (!second.outer) return [first.centre, middle, second.centre];

  const radius = Math.hypot(second.centre.x, second.centre.y);
  const angle = Math.atan2(middle.y, middle.x);
  let turn = Math.PI / 2 - angle;

  if (turn > Math.PI) turn -= 2 * Math.PI;
  if (turn < -Math.PI) turn += 2 * Math.PI;

  const route = [first.centre, middle, { x: radius * Math.cos(angle), y: radius * Math.sin(angle) }];
  const steps = Math.ceil(Math.abs(turn) / (Math.PI / 18));

  for (let step = 1; step < steps; step++) {
    const at = angle + turn * step / steps;
    route.push({ x: radius * Math.cos(at), y: radius * Math.sin(at) });
  }

  route.push(second.centre);

  return route;
}

export function faceSplit(embedding: Embedding, tour: readonly number[]): FaceSplit {
  if (!validTour(embedding.adjacency, tour)) throw new Error('The face split needs a Hamiltonian cycle.');

  const polygon = tour.map(vertex => pointAt(embedding.positions, vertex));
  const inside: number[] = [];
  const outside: number[] = [];
  const edgeFaces = new Map<string, number[]>();

  for (const [index, face] of embedding.faces.entries()) {
    if (!face.outer && insidePolygon(face.centre, polygon)) inside.push(index);
    else outside.push(index);

    for (const edge of tourEdges(face.vertices)) {
      const incident = edgeFaces.get(edge);

      if (incident) incident.push(index);
      else edgeFaces.set(edge, [index]);
    }
  }

  const boundary = tourEdges(tour);
  const insideSet = new Set(inside);
  const links: DualLink[] = [];
  const insideLinks: DualLink[] = [];
  const outsideLinks: DualLink[] = [];

  for (const edge of embedding.edges) {
    const key = edgeKey(...edge);

    if (boundary.has(key)) continue;

    const incident = edgeFaces.get(key);

    if (!incident || incident.length !== 2) throw new Error('Each dual link crosses an edge incident to exactly two faces.');

    const [a, b] = incident;

    if (a === undefined || b === undefined || insideSet.has(a) !== insideSet.has(b)) throw new Error('A non-tour edge joins faces on the same side of the cycle.');

    const link = { a, b, edge, route: dualRoute(embedding, a, b, edge) };
    links.push(link);

    if (insideSet.has(a)) insideLinks.push(link);
    else outsideLinks.push(link);
  }

  return { inside, outside, links, insideLinks, outsideLinks };
}

function prismGraph(sides: number): { positions: Point[]; spatial: Point3[]; edges: Edge[] } {
  const positions: Point[] = [];
  const spatial: Point3[] = [];
  const edges: Edge[] = [];

  for (let layer = 0; layer < 2; layer++) {
    for (let vertex = 0; vertex < sides; vertex++) {
      const angle = Math.PI / 2 + 2 * Math.PI * vertex / sides;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      positions.push({ x: x * (layer === 0 ? 1 : .5), y: y * (layer === 0 ? 1 : .5) });
      spatial.push({ x, y, z: (layer === 0 ? 1 : -1) * Math.sin(Math.PI / sides) });
      const a = layer * sides + vertex;
      const b = layer * sides + (vertex + 1) % sides;
      edges.push([Math.min(a, b), Math.max(a, b)]);

      if (layer === 0) edges.push([vertex, sides + vertex]);
    }
  }

  return { positions, spatial, edges: edges.sort(([a, b], [c, d]) => a - c || b - d) };
}

export function inversePermutation(permutation: readonly number[]): number[] {
  const inverse = new Array<number>(permutation.length).fill(-1);

  for (const [index, value] of permutation.entries()) {
    if (!Number.isInteger(value) || value < 0 || value >= permutation.length || inverse[value] !== -1) throw new Error('Each permutation contains every coordinate exactly once.');

    inverse[value] = index;
  }

  return inverse;
}

export function schlegelPositions(permutations: readonly number[][]): Point[] {
  const raw = permutations.map(permutation => {
    const [a, b, c, d] = inversePermutation(permutation);

    if (a === undefined || b === undefined || c === undefined || d === undefined || permutation.length !== 4) throw new Error('The truncated octahedron uses permutations of four coordinates.');

    const perspective = 1 / (a + 1);

    return { x: perspective * (b - c) / 2, y: perspective * (b + c - 2 * d) / Math.sqrt(12) };
  });
  const first = raw[0];

  if (!first) throw new Error('The Schlegel diagram has a first vertex.');

  const rotation = Math.PI / 2 - Math.atan2(first.y, first.x);

  return raw.map(point => ({ x: point.x * Math.cos(rotation) - point.y * Math.sin(rotation), y: point.x * Math.sin(rotation) + point.y * Math.cos(rotation) }));
}

function truncatedGraph(): { positions: Point[]; spatial: Point3[]; edges: Edge[] } {
  const permutations = data.truncated_octahedron.permutations;
  const indices = new Map(permutations.map((permutation, index) => [permutation.join(','), index]));
  const edges: Edge[] = [];
  const spatial = permutations.map(permutation => {
    const [a, b, c, d] = inversePermutation(permutation);

    if (a === undefined || b === undefined || c === undefined || d === undefined) throw new Error('The solid has four permutation coordinates.');

    return { x: (a - b) / Math.sqrt(10), y: (a + b - 2 * c) / Math.sqrt(30), z: (a + b + c - 3 * d) / Math.sqrt(60) };
  });

  for (const [vertex, permutation] of permutations.entries()) {
    for (let swap = 0; swap < 3; swap++) {
      const next = permutation.slice();
      const a = next[swap];
      const b = next[swap + 1];

      if (a === undefined || b === undefined) throw new Error('An adjacent transposition has two coordinates.');

      next[swap] = b;
      next[swap + 1] = a;
      const target = indices.get(next.join(','));

      if (target === undefined) throw new Error('An adjacent transposition is another solid vertex.');
      if (vertex < target) edges.push([vertex, target]);
    }
  }

  const positions = schlegelPositions(permutations);

  for (const [index, point] of positions.entries()) {
    const stored = data.truncated_octahedron.positions[index];
    const x = stored?.[0];
    const y = stored?.[1];

    if (x === undefined || y === undefined || Math.hypot(point.x - x, point.y - y) > 1e-6) throw new Error('The live inverse-permutation projection agrees with the canonical Schlegel coordinates.');
  }

  return { positions, spatial, edges: edges.sort(([a, b], [c, d]) => a - c || b - d) };
}

function buildSolid(key: SolidKey, graph: ReturnType<typeof prismGraph>, firstTour: number[]): Solid {
  const adjacency = adjacencyFor(graph.positions.length, graph.edges);
  const embedding = { positions: graph.positions, edges: graph.edges, adjacency, ...extractFaces(graph.positions, graph.edges, adjacency) };
  const tours = hamiltonTours(adjacency);

  if (!tours.some(tour => tour.length === firstTour.length && tour.every((vertex, index) => vertex === firstTour[index]))) throw new Error('The canonical chosen tour is one of the live exhaustive tours.');

  const boundaries = tours.map(tourEdges);
  const avoided = graph.edges.map(edge => {
    const index = boundaries.findIndex(boundary => !boundary.has(edgeKey(...edge)));
    const tour = tours[index];

    if (!tour) throw new Error('Every edge of the shown solid is avoided by an actual tour.');

    return { edge, tour };
  });

  return { key, ...embedding, spatial: graph.spatial, colors: bipartiteColors(adjacency), tours, firstTour, split: faceSplit(embedding, firstTour), avoided };
}

export function avoidTour(solid: Solid, edge: Edge): number[] {
  const result = solid.avoided.find(candidate => edgeKey(...candidate.edge) === edgeKey(...edge));

  if (!result) throw new Error('The prescribed edge belongs to the solid.');

  return result.tour;
}

export function createCornerModel() {
  return {
    solids: {
      cube: buildSolid('cube', prismGraph(4), data.cube.firstTour),
      hexagonal_prism: buildSolid('hexagonal_prism', prismGraph(6), data.hexagonal_prism.firstTour),
      truncated_octahedron: buildSolid('truncated_octahedron', truncatedGraph(), data.truncated_octahedron.firstTour),
    },
  };
}

export type CornerModel = ReturnType<typeof createCornerModel>;

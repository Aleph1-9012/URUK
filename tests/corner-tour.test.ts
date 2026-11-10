import { expect, test } from 'bun:test';
import reference from './fixtures/corner-tour.json';
import { cornerCorrespondence, createCornerModel, edgeKey, faceSplit, inversePermutation, sampleTour, tourEdges, validTour, type Point, type Solid } from '../src/components/visuals/corner-tour/math';

const model = createCornerModel();

const KEYS = ['cube', 'hexagonal_prism', 'truncated_octahedron'] as const;

function connectedWithout(solid: Solid, removed: ReadonlySet<number>): number {
  let start = 0;

  while (removed.has(start)) start++;

  const seen = new Set([start]);
  const queue = [start];

  for (const vertex of queue) {
    const neighbors = solid.adjacency[vertex];

    if (!neighbors) throw new Error('Every reachable vertex has its neighbors.');

    for (const next of neighbors) {
      if (removed.has(next) || seen.has(next)) continue;

      seen.add(next);
      queue.push(next);
    }
  }

  return seen.size;
}

function matchingTourCount(solid: Solid): number {
  const partner = new Array<number>(solid.positions.length).fill(-1);
  let count = 0;

  function extend(): void {
    const vertex = partner.indexOf(-1);

    if (vertex < 0) {
      const seen = new Set([0]);
      const queue = [0];

      for (const current of queue) {
        const neighbors = solid.adjacency[current];

        if (!neighbors) throw new Error('The matching complement has every neighborhood.');

        for (const next of neighbors) {
          if (partner[current] === next || seen.has(next)) continue;

          seen.add(next);
          queue.push(next);
        }
      }

      if (seen.size === partner.length) count++;

      return;
    }

    const neighbors = solid.adjacency[vertex];

    if (!neighbors) throw new Error('An unmatched corner has three possible partners.');

    for (const next of neighbors) {
      if (partner[next] !== -1) continue;

      partner[vertex] = next;
      partner[next] = vertex;
      extend();
      partner[vertex] = -1;
      partner[next] = -1;
    }
  }

  extend();

  return count;
}

function orientation(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function crosses(a: Point, b: Point, c: Point, d: Point): boolean {
  return orientation(a, b, c) * orientation(a, b, d) < -1e-14 && orientation(c, d, a) * orientation(c, d, b) < -1e-14;
}

function windingInside(point: Point, polygon: readonly Point[]): boolean {
  let turn = 0;

  for (const [index, a] of polygon.entries()) {
    const b = polygon[(index + 1) % polygon.length];

    if (!b) throw new Error('The winding boundary has its next point.');

    const ax = a.x - point.x;
    const ay = a.y - point.y;
    const bx = b.x - point.x;
    const by = b.y - point.y;
    turn += Math.atan2(ax * by - ay * bx, ax * bx + ay * by);
  }

  return Math.abs(turn) > Math.PI;
}

test('180: independent perfect-matching complements count the tours of three cubic bipartite 3-connected plane graphs', () => {
  for (const key of KEYS) {
    const solid = model.solids[key];
    expect(solid.tours.length).toBe(reference[key].tours);
    expect(matchingTourCount(solid)).toBe(solid.tours.length);
    expect(solid.edges.map(([a, b]) => [a, b])).toEqual(reference[key].edges);
    expect(solid.firstTour).toEqual(reference[key].first_tour);
    expect(solid.positions.length - solid.edges.length + solid.faces.length).toBe(2);

    for (const neighbors of solid.adjacency) expect(neighbors.length).toBe(3);
    for (const [a, b] of solid.edges) expect(solid.colors[a]).not.toBe(solid.colors[b]);
    for (const face of solid.faces) expect(face.vertices.length % 2).toBe(0);

    for (let a = 0; a < solid.positions.length; a++) {
      for (let b = a + 1; b < solid.positions.length; b++) expect(connectedWithout(solid, new Set([a, b]))).toBe(solid.positions.length - 2);
    }

    for (const [i, [a, b]] of solid.edges.entries()) {
      for (const [c, d] of solid.edges.slice(i + 1)) {
        if (a === c || a === d || b === c || b === d) continue;

        const p = solid.positions[a];
        const q = solid.positions[b];
        const r = solid.positions[c];
        const s = solid.positions[d];

        if (!p || !q || !r || !s) throw new Error('The planarity check has four distinct endpoints.');

        expect(crosses(p, q, r, s)).toBe(false);
      }
    }
  }

  const truncated = model.solids.truncated_octahedron;
  expect(truncated.faces.filter(face => face.vertices.length === 4).length).toBe(6);
  expect(truncated.faces.filter(face => face.vertices.length === 6).length).toBe(8);

  for (const [a, b] of truncated.edges) {
    const first = reference.truncated_octahedron.vertices[a];
    const second = reference.truncated_octahedron.vertices[b];

    if (!first || !second) throw new Error('The labeled solid has both permutation vectors.');

    const p = inversePermutation(first);
    const q = inversePermutation(second);
    let squared = 0;

    for (const [index, coordinate] of p.entries()) {
      const other = q[index];

      if (other === undefined) throw new Error('The two inverse permutations have equal dimensions.');

      squared += (coordinate - other) ** 2;
    }

    expect(squared).toBe(2);
  }
});

test('180: every live Hamiltonian tour splits all faces, including the outer face, into two induced dual trees', () => {
  for (const key of KEYS) {
    const solid = model.solids[key];

    for (const tour of solid.tours) {
      expect(validTour(solid.adjacency, tour)).toBe(true);
      const split = faceSplit(solid, tour);
      const polygon = tour.map(vertex => {
        const point = solid.positions[vertex];

        if (!point) throw new Error('Every Hamiltonian corner has a diagram position.');

        return point;
      });
      expect(split.inside.length + split.outside.length).toBe(solid.faces.length);
      expect(split.outside.includes(solid.outerFace)).toBe(true);

      for (const [index, face] of solid.faces.entries()) expect(split.inside.includes(index)).toBe(!face.outer && windingInside(face.centre, polygon));

      for (const group of [split.inside, split.outside]) {
        const members = new Set(group);
        const dual: number[][] = Array.from({ length: solid.faces.length }, () => []);
        let edgeCount = 0;

        for (let a = 0; a < solid.faces.length; a++) {
          if (!members.has(a)) continue;

          const first = solid.faces[a];

          if (!first) throw new Error('The dual tree has its first face.');

          const firstEdges = tourEdges(first.vertices);

          for (let b = a + 1; b < solid.faces.length; b++) {
            if (!members.has(b)) continue;

            const second = solid.faces[b];

            if (!second) throw new Error('The dual tree has its second face.');
            if (![...tourEdges(second.vertices)].some(edge => firstEdges.has(edge))) continue;

            const firstNeighbors = dual[a];
            const secondNeighbors = dual[b];

            if (!firstNeighbors || !secondNeighbors) throw new Error('Every dual vertex has its neighbor list.');

            firstNeighbors.push(b);
            secondNeighbors.push(a);
            edgeCount++;
          }
        }

        const start = group[0];

        if (start === undefined) throw new Error('Both sides contain at least one face.');

        const reached = new Set([start]);
        const queue = [start];

        for (const vertex of queue) {
          const neighbors = dual[vertex];

          if (!neighbors) throw new Error('The induced dual graph has every neighbor list.');

          for (const next of neighbors) {
            if (reached.has(next)) continue;

            reached.add(next);
            queue.push(next);
          }
        }

        expect(edgeCount).toBe(group.length - 1);
        expect(reached.size).toBe(group.length);
      }
    }
  }

  expect([model.solids.cube.split.inside.length, model.solids.cube.split.outside.length]).toEqual([3, 3]);
  expect([model.solids.hexagonal_prism.split.inside.length, model.solids.hexagonal_prism.split.outside.length]).toEqual([5, 3]);
});

test('180: avoiding tours, routed dual edges and carried tour samples preserve their graph geometry', () => {
  for (const key of KEYS) {
    const solid = model.solids[key];

    for (const { edge, tour } of solid.avoided) {
      expect(validTour(solid.adjacency, tour)).toBe(true);
      expect(tourEdges(tour).has(edgeKey(...edge))).toBe(false);
    }

    const boundary = tourEdges(solid.firstTour);

    for (const link of solid.split.links) {
      expect(boundary.has(edgeKey(...link.edge))).toBe(false);
      const a = solid.positions[link.edge[0]];
      const b = solid.positions[link.edge[1]];

      if (!a || !b) throw new Error('The dual route crosses one complete primal edge.');

      const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      expect(link.route.some(point => Math.hypot(point.x - middle.x, point.y - middle.y) < 1e-12)).toBe(true);

      for (let segment = 0; segment < link.route.length - 1; segment++) {
        const from = link.route[segment];
        const until = link.route[segment + 1];

        if (!from || !until) throw new Error('The dual route has consecutive points.');

        for (const edge of solid.edges) {
          if (edgeKey(...edge) === edgeKey(...link.edge)) continue;

          const first = solid.positions[edge[0]];
          const second = solid.positions[edge[1]];

          if (!first || !second) throw new Error('The diagram has both edge endpoints.');

          expect(crosses(from, until, first, second)).toBe(false);
        }
      }
    }
  }

  const origin = { x: 0, y: 0 };
  const rectangle = [origin, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 0, y: 1 }];
  const tour = [0, 1, 2, 3];
  expect(sampleTour(rectangle, tour, .25).point).toEqual({ x: 1.5, y: 0 });
  const closing = sampleTour(rectangle, tour, .9);
  expect(closing.point.x).toBe(0);
  expect(closing.point.y).toBeCloseTo(.6, 12);
  expect(closing.visited).toEqual(tour);
  const complete = sampleTour(rectangle, tour, 1);
  expect(complete.point).toEqual(origin);
  expect(complete.trail).toEqual([...rectangle, origin]);
  expect(sampleTour(rectangle, tour, -1).visited).toEqual([0]);

  for (const [from, to] of [['cube', 'hexagonal_prism'], ['hexagonal_prism', 'truncated_octahedron'], ['truncated_octahedron', 'cube']] as const) {
    const oldPositions = model.solids[from].positions;
    const targets = model.solids[to].positions;
    const correspondence = cornerCorrespondence(oldPositions, targets);
    expect(correspondence.starts[0]).toEqual(oldPositions[0]);
    expect(correspondence.ends[0]).toEqual(targets[0]);
    expect(new Set(correspondence.matched.map(pair => pair.old)).size).toBe(Math.min(oldPositions.length, targets.length));
    expect(new Set(correspondence.matched.map(pair => pair.target)).size).toBe(Math.min(oldPositions.length, targets.length));
    expect(correspondence.addedTargets.length).toBe(Math.max(0, targets.length - oldPositions.length));
    expect(correspondence.departingOld.length).toBe(Math.max(0, oldPositions.length - targets.length));

    for (const pair of correspondence.matched) {
      expect(correspondence.starts[pair.target]).toEqual(oldPositions[pair.old]);
      expect(correspondence.ends[pair.old]).toEqual(targets[pair.target]);
    }
  }
});

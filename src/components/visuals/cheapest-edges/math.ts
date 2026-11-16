export type Point = { readonly x: number; readonly y: number };

export type EnergySolution = {
  readonly u: Float64Array;
  readonly roughness: number;
  readonly length: number;
  readonly distance: number;
  readonly total: number;
  readonly cut: number | null;
};

function cell(values: ArrayLike<number>, index: number): number {
  const value = values[index];

  if (value === undefined) throw new RangeError('Each finite-difference row needs its actual indexed value.');

  return value;
}

export function solveSegment(image: ArrayLike<number>, h: number): { u: Float64Array; roughness: number; distance: number } {
  const n = image.length;

  if (!Number.isSafeInteger(n) || n < 1 || !(h > 0) || !Number.isFinite(h)) throw new RangeError('A finite segment needs cells and a positive finite cell width.');

  const diagonal = new Float64Array(n);
  const right = new Float64Array(n);
  const off = -1 / h;

  for (let index = 0; index < n; index++) {
    const value = image[index];

    if (value === undefined || !Number.isFinite(value)) throw new RangeError('Every image cell needs a finite intensity.');

    const neighbours = (index > 0 ? 1 : 0) + (index + 1 < n ? 1 : 0);
    diagonal[index] = h + neighbours / h;
    right[index] = h * value;
  }

  for (let index = 1; index < n; index++) {
    const previousPivot = cell(diagonal, index - 1);

    if (!(previousPivot > 0)) throw new Error('The strictly positive energy system lost its positive pivot.');

    const multiplier = off / previousPivot;
    diagonal[index] = cell(diagonal, index) - multiplier * off;
    right[index] = cell(right, index) - multiplier * cell(right, index - 1);
  }

  const u = new Float64Array(n);
  u[n - 1] = cell(right, n - 1) / cell(diagonal, n - 1);

  for (let index = n - 2; index >= 0; index--) u[index] = (cell(right, index) - off * cell(u, index + 1)) / cell(diagonal, index);

  let roughness = 0;
  let distance = 0;

  for (let index = 0; index < n; index++) {
    const value = image[index];

    if (value === undefined) throw new Error('Every solved image cell needs its original intensity.');

    distance += h * (cell(u, index) - value) ** 2;

    if (index + 1 < n) roughness += (cell(u, index + 1) - cell(u, index)) ** 2 / h;
  }

  return { u, roughness, distance };
}

export function solveEnergyToy(cells: number, cut: number | null = null): EnergySolution {
  if (!Number.isSafeInteger(cells) || cells < 2) throw new RangeError('The finite-difference toy needs at least two cells.');
  if (cut !== null && (!Number.isSafeInteger(cut) || cut < 1 || cut >= cells)) throw new RangeError('A toy edge must lie between two cells.');

  const h = 1 / cells;
  const image = Float64Array.from({ length: cells }, (_, index) => (index + .5) * h < .5 ? 0 : 4);

  if (cut === null) {
    const solution = solveSegment(image, h);

    return { ...solution, length: 0, total: solution.roughness + solution.distance, cut };
  }

  const left = solveSegment(image.subarray(0, cut), h);
  const right = solveSegment(image.subarray(cut), h);
  const u = new Float64Array(cells);
  u.set(left.u);
  u.set(right.u, cut);
  const roughness = left.roughness + right.roughness;
  const distance = left.distance + right.distance;

  return { u, roughness, length: 1, distance, total: roughness + 1 + distance, cut };
}

export function steinerNetwork(terminals: readonly [Point, Point, Point]) {
  for (let index = 0; index < terminals.length; index++) {
    const a = terminals[index];
    const b = terminals[(index + 1) % 3];
    const c = terminals[(index + 2) % 3];

    if (!a || !b || !c) throw new Error('The Fermat network needs all three terminals.');

    const ux = b.x - a.x;
    const uy = b.y - a.y;
    const vx = c.x - a.x;
    const vy = c.y - a.y;
    const denominator = Math.hypot(ux, uy) * Math.hypot(vx, vy);

    if (!(denominator > 0) || !Number.isFinite(denominator) || (ux * vx + uy * vy) / denominator <= -.5) throw new RangeError('This interior Fermat network requires three distinct terminals with every angle below 120 degrees.');
  }

  let x = (terminals[0].x + terminals[1].x + terminals[2].x) / 3;
  let y = (terminals[0].y + terminals[1].y + terminals[2].y) / 3;
  const centroid = { x, y };

  for (let iteration = 0; iteration < 200; iteration++) {
    let weight = 0;
    let nextX = 0;
    let nextY = 0;

    for (const terminal of terminals) {
      const distance = Math.hypot(x - terminal.x, y - terminal.y);

      if (distance === 0) throw new Error('This interior Fermat-point iteration cannot start or land on a terminal.');

      const inverse = 1 / distance;
      weight += inverse;
      nextX += inverse * terminal.x;
      nextY += inverse * terminal.y;
    }

    x = nextX / weight;
    y = nextY / weight;
  }

  const junction = { x, y };
  const legs = terminals.map(point => ({ x: point.x - x, y: point.y - y }));
  const angles: number[] = [];

  for (let index = 0; index < 3; index++) {
    const a = legs[index];
    const b = legs[(index + 1) % 3];

    if (!a || !b) throw new Error('Each junction angle needs two terminal rays.');

    const cosine = (a.x * b.x + a.y * b.y) / (Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y));
    angles.push(Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI);
  }

  const sideLengths = [Math.hypot(terminals[0].x - terminals[1].x, terminals[0].y - terminals[1].y), Math.hypot(terminals[1].x - terminals[2].x, terminals[1].y - terminals[2].y), Math.hypot(terminals[2].x - terminals[0].x, terminals[2].y - terminals[0].y)].sort((a, b) => a - b);
  const shortest = sideLengths[0];
  const next = sideLengths[1];

  if (shortest === undefined || next === undefined) throw new Error('The triangle comparison needs its two shortest sides.');

  let networkLength = 0;
  let centroidLength = 0;

  for (const terminal of terminals) {
    networkLength += Math.hypot(terminal.x - x, terminal.y - y);
    centroidLength += Math.hypot(terminal.x - centroid.x, terminal.y - centroid.y);
  }

  return { terminals, junction, legs, angles, networkLength, centroid, centroidLength, twoSidesLength: shortest + next };
}

export function tipField(x: number, y: number) {
  const r = Math.hypot(x, y);

  if (!(r > 0) || !Number.isFinite(r)) throw new RangeError('The illustrative crack-tip field is defined away from its singular origin.');

  const theta = Math.atan2(y, x);
  const magnitude = .5 / Math.sqrt(r);

  return { r, theta, u: Math.sqrt(r) * Math.sin(theta / 2), gradient: { x: -magnitude * Math.sin(theta / 2), y: magnitude * Math.cos(theta / 2) }, magnitude };
}

export function annulusIntegral(power: number, epsilon: number, outer = 1): number {
  if (!(power > 0) || !Number.isFinite(power) || !(epsilon > 0 && epsilon < outer) || !Number.isFinite(outer)) throw new RangeError('The crack-tip integral needs a positive power and finite positive annular radii.');

  const exponent = 2 - power / 2;
  const radial = exponent === 0 ? Math.log(outer / epsilon) : outer ** exponent * -Math.expm1(exponent * Math.log(epsilon / outer)) / exponent;

  return 2 * Math.PI * .5 ** power * radial;
}

function computeCheapestEdgesModel() {
  const cells = 400;
  const h = 1 / cells;
  const positions = Float64Array.from({ length: cells }, (_, index) => (index + .5) * h);
  const image = Float64Array.from(positions, x => x < .5 ? 0 : 4);
  const noEdge = solveEnergyToy(cells);
  const scan: (EnergySolution & { edgeAt: number })[] = [];

  for (let cut = cells / 20; cut <= cells - cells / 20; cut += cells / 20) scan.push({ ...solveEnergyToy(cells, cut), edgeAt: cut / cells });

  const midpoint = scan.find(solution => solution.cut === cells / 2);
  const misplaced = scan[0];
  let best = misplaced;

  if (!midpoint || !misplaced) throw new Error('The scan needs its midpoint and misplaced-edge examples.');

  for (const solution of scan) {
    if (!best || solution.total < best.total) best = solution;
  }

  if (!best) throw new Error('The finite scan needs a best sampled edge.');

  const terminals = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: .35, y: .8 }] as const;
  const epsilons = [1e-2, 1e-4, 1e-6] as const;
  const rows = [3, 4].map(power => ({ power, values: epsilons.map(epsilon => annulusIntegral(power, epsilon)) }));

  return { toy: { cells, h, positions, image, noEdge, midpoint, misplaced, scan, best }, triple: steinerNetwork(terminals), tip: { epsilons, rows, amplitude: 1, cut: 'negative x-axis' } };
}

export type CheapestEdgesModel = ReturnType<typeof computeCheapestEdgesModel>;

let cachedModel: CheapestEdgesModel | undefined;

export function buildCheapestEdgesModel(): CheapestEdgesModel {
  if (!cachedModel) cachedModel = computeCheapestEdgesModel();

  return cachedModel;
}

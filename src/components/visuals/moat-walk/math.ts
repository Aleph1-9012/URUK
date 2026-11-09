export type Point = { x: number; y: number };

export type PrimeField = { radius: number; sieve: Uint8Array<ArrayBuffer> };

export type Flood = {
  stepSquared: number;
  coords: Int16Array<ArrayBuffer>;
  parents: Int32Array<ArrayBuffer>;
  depth: Uint16Array<ArrayBuffer>;
  layerOffsets: Uint32Array<ArrayBuffer>;
  count: number;
  maxDepth: number;
  maxRadiusSquared: number;
  closed: boolean;
  resumeOrder: Uint32Array<ArrayBuffer>;
  resumeParents: Int32Array<ArrayBuffer>;
  resumeDepth: Uint16Array<ArrayBuffer>;
  resumeOffsets: Uint32Array<ArrayBuffer>;
};

export type FloodSeed = Pick<Flood, 'coords' | 'count'>;

export type IslandData = {
  coords: Int16Array<ArrayBuffer>;
  parents: Int32Array<ArrayBuffer>;
  component: Uint16Array<ArrayBuffer>;
  offsets: Uint32Array<ArrayBuffer>;
  sizes: Uint32Array<ArrayBuffer>;
  count: number;
  maxRadiusSquared: number;
};

export type SieveData = {
  period: number;
  keep: Uint8Array<ArrayBuffer>;
  component: Int16Array<ArrayBuffer>;
  liftCoords: Int16Array<ArrayBuffer>;
  parents: Int32Array<ArrayBuffer>;
  order: Uint16Array<ArrayBuffer>;
  offsets: Uint32Array<ArrayBuffer>;
  sizes: Uint16Array<ArrayBuffer>;
  finite: boolean;
  largest: number;
  largestComponent: number;
};

export type DiskLoop = { coords: Int16Array<ArrayBuffer>; winding: number };

export type DensitySample = { radius: number; share: number; count: number; total: number };

export function createPrimeField(radius: number): PrimeField {
  const limit = 2 * (radius + 4) ** 2;
  const sieve = new Uint8Array(limit + 1);
  sieve.fill(1, 2);

  for (let prime = 2; prime * prime <= limit; prime++) {
    if (!sieve[prime]) continue;

    for (let multiple = prime * prime; multiple <= limit; multiple += prime) sieve[multiple] = 0;
  }

  return { radius, sieve };
}

export function isGaussianPrime(field: PrimeField, x: number, y: number): boolean {
  if (x === 0 || y === 0) {
    const value = Math.abs(x || y);

    return value % 4 === 3 && field.sieve[value] === 1;
  }

  return field.sieve[x * x + y * y] === 1;
}

export function gaussianPrimeCoords(radius: number, field = createPrimeField(radius)): Int16Array<ArrayBuffer> {
  const coords: number[] = [];

  for (let x = -radius; x <= radius; x++) {
    const height = Math.floor(Math.sqrt(radius * radius - x * x));

    for (let y = -height; y <= height; y++) {
      if (isGaussianPrime(field, x, y)) coords.push(x, y);
    }
  }

  return new Int16Array(coords);
}

export function axisPrimes(radius: number, field = createPrimeField(radius)): number[] {
  const primes: number[] = [];

  for (let x = 2; x <= radius; x++) {
    if (isGaussianPrime(field, x, 0)) primes.push(x);
  }

  return primes;
}

export function stepVectors(squaredDistance: number, includeZero = true): Point[] {
  const extent = Math.floor(Math.sqrt(squaredDistance));
  const vectors: Point[] = [];

  for (let x = -extent; x <= extent; x++) {
    for (let y = -extent; y <= extent; y++) {
      if ((!includeZero && x === 0 && y === 0) || x * x + y * y > squaredDistance) continue;

      vectors.push({ x, y });
    }
  }

  return vectors;
}

function offsetsFor(order: readonly number[], depth: ArrayLike<number>): Uint32Array<ArrayBuffer> {
  const offsets = [0];
  let layer = 0;

  for (const [position, index] of order.entries()) {
    const value = depth[index] ?? 0;

    while (layer < value) {
      offsets.push(position);
      layer++;
    }
  }

  offsets.push(order.length);

  return new Uint32Array(offsets);
}

export function gaussianFlood(stepSquared: number, radius = 1100, previous: FloodSeed | null = null, field = createPrimeField(radius)): Flood {
  const side = radius * 2 + 1;
  const visited = new Int32Array(side * side);
  const key = (x: number, y: number) => (y + radius) * side + x + radius;
  const moves = stepVectors(stepSquared, false);
  const coords = [1, 1];
  const parents = [-1];
  const depth = [0];
  visited[key(1, 1)] = 1;
  let closed = true;
  let maxRadiusSquared = 2;

  for (let head = 0; head < parents.length; head++) {
    const x = coords[head * 2] ?? 0;
    const y = coords[head * 2 + 1] ?? 0;

    for (const move of moves) {
      const nextX = x + move.x;
      const nextY = y + move.y;
      const squared = nextX * nextX + nextY * nextY;

      if (!isGaussianPrime(field, nextX, nextY)) continue;

      if (squared > radius * radius) {
        closed = false;
        continue;
      }

      const position = key(nextX, nextY);

      if (visited[position]) continue;

      visited[position] = parents.length + 1;
      coords.push(nextX, nextY);
      parents.push(head);
      depth.push((depth[head] ?? 0) + 1);
      maxRadiusSquared = Math.max(maxRadiusSquared, squared);
    }
  }

  const count = parents.length;
  const resumeDepth = new Uint16Array(count);
  resumeDepth.fill(65535);
  const resumeParents = new Int32Array(count);
  resumeParents.fill(-1);
  const resumeOrder: number[] = [];

  if (previous) {
    for (let index = 0; index < previous.count; index++) {
      const x = previous.coords[index * 2] ?? 0;
      const y = previous.coords[index * 2 + 1] ?? 0;
      const node = (visited[key(x, y)] ?? 0) - 1;

      if (node < 0 || resumeDepth[node] === 0) continue;

      resumeDepth[node] = 0;
      resumeOrder.push(node);
    }
  } else {
    resumeDepth[0] = 0;
    resumeOrder.push(0);
  }

  for (let head = 0; head < resumeOrder.length; head++) {
    const node = resumeOrder[head] ?? 0;
    const x = coords[node * 2] ?? 0;
    const y = coords[node * 2 + 1] ?? 0;

    for (const move of moves) {
      const nextX = x + move.x;
      const nextY = y + move.y;

      if (Math.abs(nextX) > radius || Math.abs(nextY) > radius) continue;

      const target = (visited[key(nextX, nextY)] ?? 0) - 1;

      if (target < 0 || resumeDepth[target] !== 65535) continue;

      resumeDepth[target] = (resumeDepth[node] ?? 0) + 1;
      resumeParents[target] = node;
      resumeOrder.push(target);
    }
  }

  return {
    stepSquared, coords: new Int16Array(coords), parents: new Int32Array(parents), depth: new Uint16Array(depth),
    layerOffsets: offsetsFor(Array.from({ length: count }, (_, index) => index), depth), count,
    maxDepth: depth[count - 1] ?? 0, maxRadiusSquared, closed,
    resumeOrder: new Uint32Array(resumeOrder), resumeParents, resumeDepth, resumeOffsets: offsetsFor(resumeOrder, resumeDepth),
  };
}

export function nearbyClusters(meetRadius = 100, searchRadius = 150, field = createPrimeField(searchRadius)): IslandData {
  const primeCoords = gaussianPrimeCoords(searchRadius, field);
  const side = searchRadius * 2 + 1;
  const key = (x: number, y: number) => (y + searchRadius) * side + x + searchRadius;
  const available = new Uint8Array(side * side);

  for (let index = 0; index < primeCoords.length; index += 2) available[key(primeCoords[index] ?? 0, primeCoords[index + 1] ?? 0)] = 1;

  const coords: number[] = [];
  const parents: number[] = [];
  const component: number[] = [];
  const offsets = [0];
  const sizes: number[] = [];
  const moves = stepVectors(4, false);
  let maxRadiusSquared = 0;

  for (let index = 0; index < primeCoords.length; index += 2) {
    const startX = primeCoords[index] ?? 0;
    const startY = primeCoords[index + 1] ?? 0;

    if (startX * startX + startY * startY > meetRadius * meetRadius || !available[key(startX, startY)]) continue;

    const first = parents.length;
    coords.push(startX, startY);
    parents.push(-1);
    component.push(sizes.length);
    available[key(startX, startY)] = 0;

    for (let head = first; head < parents.length; head++) {
      const x = coords[head * 2] ?? 0;
      const y = coords[head * 2 + 1] ?? 0;
      maxRadiusSquared = Math.max(maxRadiusSquared, x * x + y * y);

      for (const move of moves) {
        const nextX = x + move.x;
        const nextY = y + move.y;

        if (Math.abs(nextX) > searchRadius || Math.abs(nextY) > searchRadius) continue;

        const target = key(nextX, nextY);

        if (!available[target]) continue;

        available[target] = 0;
        coords.push(nextX, nextY);
        parents.push(head);
        component.push(sizes.length);
      }
    }

    sizes.push(parents.length - first);
    offsets.push(parents.length);
  }

  return { coords: new Int16Array(coords), parents: new Int32Array(parents), component: new Uint16Array(component), offsets: new Uint32Array(offsets), sizes: new Uint32Array(sizes), count: sizes.length, maxRadiusSquared };
}

export function windingNumber(coords: ArrayLike<number>, center: Point): number {
  let turn = 0;

  for (let index = 0; index < coords.length - 2; index += 2) {
    const a = Math.atan2((coords[index + 1] ?? 0) - center.y, (coords[index] ?? 0) - center.x);
    const b = Math.atan2((coords[index + 3] ?? 0) - center.y, (coords[index + 2] ?? 0) - center.x);
    turn += Math.atan2(Math.sin(b - a), Math.cos(b - a));
  }

  return turn / (Math.PI * 2);
}

export function diskLoop(field = createPrimeField(100)): DiskLoop {
  const center = { x: 45, y: 45 };
  const points: Point[] = [];
  const indexByKey = new Map<string, number>();
  const outerSquared = (Math.sqrt(13) + 6) ** 2;

  for (let x = 35; x <= 55; x++) {
    for (let y = 35; y <= 55; y++) {
      const squared = (x - center.x) ** 2 + (y - center.y) ** 2;

      if (squared < 13 || squared >= outerSquared || !isGaussianPrime(field, x, y)) continue;

      indexByKey.set(`${x},${y}`, points.length);
      points.push({ x, y });
    }
  }

  const angle = new Float64Array(points.length);
  angle.fill(NaN);
  const parent = new Int32Array(points.length);
  parent.fill(-1);
  const moves = stepVectors(8, false);

  for (const [start, point] of points.entries()) {
    if (!Number.isNaN(angle[start])) continue;

    angle[start] = Math.atan2(point.y - center.y, point.x - center.x);
    const queue = [start];

    for (let head = 0; head < queue.length; head++) {
      const node = queue[head] ?? 0;
      const from = points[node];

      if (!from) continue;

      for (const move of moves) {
        const target = indexByKey.get(`${from.x + move.x},${from.y + move.y}`);
        const to = target === undefined ? undefined : points[target];

        if (target === undefined || !to) continue;

        const fromAngle = Math.atan2(from.y - center.y, from.x - center.x);
        const toAngle = Math.atan2(to.y - center.y, to.x - center.x);
        const turn = Math.atan2(Math.sin(toAngle - fromAngle), Math.cos(toAngle - fromAngle));
        const reached = (angle[node] ?? 0) + turn;

        if (Number.isNaN(angle[target])) {
          angle[target] = reached;
          parent[target] = node;
          queue.push(target);
        } else if (Math.abs(reached - (angle[target] ?? 0)) > Math.PI) {
          const first: number[] = [];
          const second: number[] = [];

          for (let value = node; value >= 0; value = parent[value] ?? -1) first.push(value);
          for (let value = target; value >= 0; value = parent[value] ?? -1) second.push(value);

          let a = first.length - 1;
          let b = second.length - 1;

          while (a >= 0 && b >= 0 && first[a] === second[b]) { a--; b--; }

          const cycle = first.slice(0, a + 2);

          for (let position = b; position >= 0; position--) cycle.push(second[position] ?? 0);

          cycle.push(node);
          const coords: number[] = [];

          for (const member of cycle) {
            const location = points[member];

            if (location) coords.push(location.x, location.y);
          }

          if (windingNumber(coords, center) < 0) {
            const reversed: number[] = [];

            for (let position = coords.length - 2; position >= 0; position -= 2) reversed.push(coords[position] ?? 0, coords[position + 1] ?? 0);

            return { coords: new Int16Array(reversed), winding: windingNumber(reversed, center) };
          }

          return { coords: new Int16Array(coords), winding: windingNumber(coords, center) };
        }
      }
    }
  }

  throw new Error('The computed prime ring must contain a loop around 45+45i.');
}

export function periodicSieve(): SieveData {
  const period = 65;
  const keep = new Uint8Array(period * period);
  const component = new Int16Array(period * period);
  component.fill(-1);
  const liftCoords = new Int16Array(period * period * 2);
  const parents = new Int32Array(period * period);
  parents.fill(-1);

  for (let y = 0; y < period; y++) {
    for (let x = 0; x < period; x++) {
      keep[y * period + x] = (2 * x + y) % 5 !== 0 && (2 * x - y) % 5 !== 0 && (3 * x + 2 * y) % 13 !== 0 && (3 * x - 2 * y) % 13 !== 0 ? 1 : 0;
    }
  }

  const order: number[] = [];
  const offsets = [0];
  const sizes: number[] = [];
  const moves = stepVectors(1, false);
  let finite = true;
  let largest = 0;
  let largestComponent = 0;

  for (let node = 0; node < keep.length; node++) {
    if (!keep[node] || component[node] !== -1) continue;

    const start = order.length;
    component[node] = sizes.length;
    liftCoords[node * 2] = node % period;
    liftCoords[node * 2 + 1] = Math.floor(node / period);
    order.push(node);

    for (let head = start; head < order.length; head++) {
      const current = order[head] ?? 0;
      const x = liftCoords[current * 2] ?? 0;
      const y = liftCoords[current * 2 + 1] ?? 0;

      for (const move of moves) {
        const nextX = x + move.x;
        const nextY = y + move.y;
        const target = ((nextY % period + period) % period) * period + (nextX % period + period) % period;

        if (!keep[target]) continue;

        if (component[target] === -1) {
          component[target] = sizes.length;
          liftCoords[target * 2] = nextX;
          liftCoords[target * 2 + 1] = nextY;
          parents[target] = current;
          order.push(target);
        } else if (liftCoords[target * 2] !== nextX || liftCoords[target * 2 + 1] !== nextY) finite = false;
      }
    }

    const size = order.length - start;
    sizes.push(size);
    offsets.push(order.length);

    if (size > largest) { largest = size; largestComponent = sizes.length - 1; }
  }

  return { period, keep, component, liftCoords, parents, order: new Uint16Array(order), offsets: new Uint32Array(offsets), sizes: new Uint16Array(sizes), finite, largest, largestComponent };
}

export function densitySamples(field = createPrimeField(1600)): DensitySample[] {
  const samples: DensitySample[] = [];

  for (let lower = 0; lower < 1600; lower += 100) {
    const upper = lower + 100;
    let count = 0;
    let total = 0;

    for (let x = 1; x <= upper; x++) {
      const firstY = Math.max(1, Math.floor(Math.sqrt(Math.max(0, lower * lower - x * x))) + 1);
      const lastY = Math.floor(Math.sqrt(upper * upper - x * x));

      for (let y = firstY; y <= lastY; y++) {
        total++;
        count += field.sieve[x * x + y * y] ?? 0;
      }
    }

    samples.push({ radius: (lower + upper) / 2, share: count / total, count, total });
  }

  return samples;
}

export const UNIT_SIEVE_BOUND = 16 + 4 * 16 * 65 ** 2;

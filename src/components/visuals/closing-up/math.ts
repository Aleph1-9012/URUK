export type Vec3 = readonly [number, number, number];

export type Path = { positions: Vec3[]; velocities: Vec3[]; length: number; step: number };

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function norm(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2]);
}

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function scaled(a: Vec3, factor: number): Vec3 {
  return [a[0] * factor, a[1] * factor, a[2] * factor];
}

function addScaled(a: Vec3, b: Vec3, factor: number): Vec3 {
  return [a[0] + factor * b[0], a[1] + factor * b[1], a[2] + factor * b[2]];
}

function unit(a: Vec3): Vec3 {
  const length = norm(a);

  if (!(length > 0) || !Number.isFinite(length)) throw new RangeError('A geodesic direction needs a finite nonzero vector.');

  return scaled(a, 1 / length);
}

function acceleration(d: Vec3, x: Vec3, v: Vec3): Vec3 {
  const numerator = d[0] * v[0] ** 2 + d[1] * v[1] ** 2 + d[2] * v[2] ** 2;
  const denominator = (d[0] * x[0]) ** 2 + (d[1] * x[1]) ** 2 + (d[2] * x[2]) ** 2;
  const multiplier = -numerator / denominator;

  return [multiplier * d[0] * x[0], multiplier * d[1] * x[1], multiplier * d[2] * x[2]];
}

/** RK4 at nominal unit arc-length steps, with the canonical speed renormalization. */
export function integrateGeodesic(axes: Vec3, start: Vec3, tangent: Vec3, length: number, steps: number): Path {
  if (axes.some(axis => !Number.isFinite(axis) || axis <= 0) || !Number.isFinite(length) || length <= 0 || !Number.isSafeInteger(steps) || steps < 1) throw new RangeError('Geodesic integration needs positive axes, length and an integer step count.');

  const d: Vec3 = [axes[0] ** -2, axes[1] ** -2, axes[2] ** -2];
  const normal: Vec3 = [d[0] * start[0], d[1] * start[1], d[2] * start[2]];

  if (Math.abs(dot(start, normal) - 1) > 1e-10 || Math.abs(dot(tangent, normal)) > 1e-10) throw new RangeError('The initial point must lie on the ellipsoid and its direction must be tangent.');

  const h = length / steps;
  let x = start;
  let v = unit(tangent);
  const positions: Vec3[] = [x];
  const velocities: Vec3[] = [v];

  for (let index = 0; index < steps; index++) {
    const k1x = v;
    const k1v = acceleration(d, x, v);
    const k2x = addScaled(v, k1v, h / 2);
    const k2v = acceleration(d, addScaled(x, k1x, h / 2), k2x);
    const k3x = addScaled(v, k2v, h / 2);
    const k3v = acceleration(d, addScaled(x, k2x, h / 2), k3x);
    const k4x = addScaled(v, k3v, h);
    const k4v = acceleration(d, addScaled(x, k3x, h), k4x);
    x = [
      x[0] + h / 6 * (k1x[0] + 2 * k2x[0] + 2 * k3x[0] + k4x[0]),
      x[1] + h / 6 * (k1x[1] + 2 * k2x[1] + 2 * k3x[1] + k4x[1]),
      x[2] + h / 6 * (k1x[2] + 2 * k2x[2] + 2 * k3x[2] + k4x[2]),
    ];
    v = unit([
      v[0] + h / 6 * (k1v[0] + 2 * k2v[0] + 2 * k3v[0] + k4v[0]),
      v[1] + h / 6 * (k1v[1] + 2 * k2v[1] + 2 * k3v[1] + k4v[1]),
      v[2] + h / 6 * (k1v[2] + 2 * k2v[2] + 2 * k3v[2] + k4v[2]),
    ]);
    positions.push(x);
    velocities.push(v);
  }

  return { positions, velocities, length, step: h };
}

export function pointAtArcLength(path: Path, length: number): Vec3 {
  if (!Number.isFinite(length) || length < 0 || length > path.length) throw new RangeError('The drawn position must lie inside the stored finite trace.');

  const clock = length / path.step;
  const index = Math.min(Math.floor(clock), path.positions.length - 1);
  const first = path.positions[index];
  const second = path.positions[Math.min(index + 1, path.positions.length - 1)];

  if (!first || !second) throw new Error('Arc-length interpolation needs its two numerical samples.');

  return addScaled(first, [second[0] - first[0], second[1] - first[1], second[2] - first[2]], clock - index);
}

function ellipsePerimeter(first: number, second: number): number {
  const steps = 8192;
  let sum = 0;

  for (let index = 0; index < steps; index++) {
    const angle = 2 * Math.PI * (index + .5) / steps;
    sum += Math.hypot(first * Math.sin(angle), second * Math.cos(angle));
  }

  return sum * 2 * Math.PI / steps;
}

function closure(path: Path, index: number) {
  const first = path.positions[0];
  const last = path.positions[index];
  const initial = path.velocities[0];
  const final = path.velocities[index];

  if (!first || !last || !initial || !final) throw new Error('A numerical closure check needs both position and direction.');

  return { position: distance(first, last), direction: distance(initial, final) };
}

function roundCircle(first: Vec3, second: Vec3): Path {
  const u = unit(first);
  const v = unit(second);
  const steps = 512;
  const positions: Vec3[] = [];
  const velocities: Vec3[] = [];

  for (let index = 0; index <= steps; index++) {
    const angle = index === steps ? 0 : 2 * Math.PI * index / steps;
    positions.push(addScaled(scaled(u, Math.cos(angle)), v, Math.sin(angle)));
    velocities.push(addScaled(scaled(u, -Math.sin(angle)), v, Math.cos(angle)));
  }

  return { positions, velocities, length: 2 * Math.PI, step: 2 * Math.PI / steps };
}

function computeClosingUpModel() {
  const axes: Vec3 = [1, .8, .6];
  const configurations: { name: 'xy' | 'xz' | 'yz'; start: Vec3; tangent: Vec3; radii: readonly [number, number] }[] = [
    { name: 'xy', start: [axes[0], 0, 0], tangent: [0, 1, 0], radii: [axes[0], axes[1]] },
    { name: 'xz', start: [axes[0], 0, 0], tangent: [0, 0, 1], radii: [axes[0], axes[2]] },
    { name: 'yz', start: [0, axes[1], 0], tangent: [0, 0, 1], radii: [axes[1], axes[2]] },
  ];
  const principal = configurations.map(config => {
    const perimeter = ellipsePerimeter(config.radii[0], config.radii[1]);
    const path = integrateGeodesic(axes, config.start, config.tangent, perimeter, 4000);
    const error = closure(path, path.positions.length - 1);

    return { name: config.name, perimeter, path, closurePosition: error.position, closureDirection: error.direction };
  });
  const longestPerimeter = Math.max(...principal.map(entry => entry.perimeter));
  const start: Vec3 = [.6, .5, axes[2] * Math.sqrt(1 - .36 - .25 / axes[1] ** 2)];
  const normal: Vec3 = [start[0] / axes[0] ** 2, start[1] / axes[1] ** 2, start[2] / axes[2] ** 2];
  const raw: Vec3 = [.3, -1, .7];
  const tangent = unit(addScaled(raw, normal, -dot(normal, raw) / dot(normal, normal)));
  const path = integrateGeodesic(axes, start, tangent, 5 * longestPerimeter, 20000);
  const exclusionLength = .3 * longestPerimeter;
  let closestReturn = Infinity;
  let closestReturnLength = 0;
  let maxSurfaceError = 0;
  let maxSpeedError = 0;

  for (const [index, point] of path.positions.entries()) {
    const speed = path.velocities[index];

    if (!speed) throw new Error('Each numerical position needs its actual numerical velocity.');

    const length = index * path.step;
    const error = distance(point, start);

    if (length > exclusionLength && error < closestReturn) {
      closestReturn = error;
      closestReturnLength = length;
    }

    maxSurfaceError = Math.max(maxSurfaceError, Math.abs((point[0] / axes[0]) ** 2 + (point[1] / axes[1]) ** 2 + (point[2] / axes[2]) ** 2 - 1));
    maxSpeedError = Math.max(maxSpeedError, Math.abs(norm(speed) - 1));
  }

  const xy = principal[0];

  if (!xy) throw new Error('The repeated-image example needs the computed xy ellipse.');

  const repeated = integrateGeodesic(axes, [axes[0], 0, 0], [0, 1, 0], 2 * xy.perimeter, 8000);

  return {
    axes,
    principal,
    longestPerimeter,
    generic: { path, start, tangent, exclusionLength, closestReturn, closestReturnLength, maxSurfaceError, maxSpeedError },
    sameImage: { path: repeated, period: xy.perimeter, oneLapClosure: closure(repeated, 4000), twoLapClosure: closure(repeated, 8000) },
    roundCircles: [
      roundCircle([1, 0, 0], [0, 1, 0]),
      roundCircle([1, 0, 0], [0, 0, 1]),
      roundCircle([0, 1, 0], [0, 0, 1]),
      roundCircle([1, 1, 0], [-1, 1, 2]),
      roundCircle([1, 0, 1], [-1, 2, 1]),
      roundCircle([0, 1, 1], [1, 1, -1]),
    ],
  };
}

export type ClosingUpModel = ReturnType<typeof computeClosingUpModel>;

let cachedModel: ClosingUpModel | undefined;

export function buildClosingUpModel(): ClosingUpModel {
  if (!cachedModel) cachedModel = computeClosingUpModel();

  return cachedModel;
}

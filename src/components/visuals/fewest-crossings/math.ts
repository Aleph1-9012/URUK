export type Point = { x: number; y: number };

export type Vertex = Point & { id: number; kind: 'kiln' | 'yard' | 'dot' };

type Warp = { amplitude: number; phase: number };

type EdgeBase = { id: number; a: number; b: number; visible: number; reverse: boolean; warp: Warp };

export type Edge = EdgeBase & (
  | { kind: 'segment'; from: Point; to: Point }
  | { kind: 'arc'; center: number; radius: number; height: number }
  | { kind: 'polyline'; points: Point[] }
);

export type Crossing = Point & { id: string; first: number; second: number; tFirst: number; tSecond: number; sign: number };

export type GraphState = {
  kind: 'rows' | 'cross' | 'route' | 'k4' | 'k5' | 'utilities' | 'book' | 'drift' | 'cycles' | 'dimension';
  vertices: Vertex[];
  edges: Edge[];
  intersections: Crossing[];
  count: number;
  n: number;
  complete: boolean;
  signed: Crossing[];
};

const IDENTITY_WARP = { amplitude: 0, phase: 0 };

const EPSILON = 1e-8;

const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;

function span(time: number, start: number, end: number): number {
  return Math.min(1, Math.max(0, (time - start) / (end - start)));
}

function smooth(time: number, start: number, end: number): number {
  const amount = span(time, start, end);

  return amount * amount * (3 - 2 * amount);
}

function warpPoint(point: Point, warp: Warp): Point {
  return { x: point.x, y: point.y + warp.amplitude * Math.sin(point.x * 1.37 + warp.phase) };
}

export function Z(n: number): number {
  return Math.floor(n / 2) * Math.floor((n - 1) / 2) * Math.floor((n - 2) / 2) * Math.floor((n - 3) / 2) / 4;
}

export function d(n: number): number {
  return Math.floor(n / 2) * Math.floor((n - 1) / 2);
}

export function dimensionBasis(s: number): readonly [number, number][] {
  const basis: [number, number][] = [];

  for (let b = 0; b <= s - 2; b++) {
    for (let a = 0; a <= b; a++) basis.push([a, b]);
  }

  return basis;
}

export function bookPage(a: number, b: number, n: number): 1 | -1 {
  return (a + b) % n < Math.floor(n / 2) ? 1 : -1;
}

export function spinePosition(index: number, n: number): number {
  return index + .017 * index * index / n + .006 * Math.sin(index * 1.7);
}

function basePoint(edge: Edge, t: number): Point {
  if (edge.kind === 'segment') return { x: mix(edge.from.x, edge.to.x, t), y: mix(edge.from.y, edge.to.y, t) };

  if (edge.kind === 'arc') return { x: edge.center - edge.radius * Math.cos(Math.PI * t), y: edge.height * edge.radius * Math.sin(Math.PI * t) };

  const position = Math.max(0, Math.min(edge.points.length - 1, t * (edge.points.length - 1)));
  const index = Math.min(edge.points.length - 2, Math.floor(position));
  const from = edge.points[index] ?? { x: 0, y: 0 };
  const to = edge.points[index + 1] ?? from;

  return { x: mix(from.x, to.x, position - index), y: mix(from.y, to.y, position - index) };
}

export function pointOnEdge(edge: Edge, t: number): Point {
  return warpPoint(basePoint(edge, t), edge.warp);
}

function tangent(edge: Edge, t: number): Point {
  if (edge.kind === 'segment') return { x: edge.to.x - edge.from.x, y: edge.to.y - edge.from.y };

  if (edge.kind === 'arc') return { x: Math.PI * edge.radius * Math.sin(Math.PI * t), y: Math.PI * edge.height * edge.radius * Math.cos(Math.PI * t) };

  const index = Math.min(edge.points.length - 2, Math.floor(t * (edge.points.length - 1)));
  const from = edge.points[index] ?? { x: 0, y: 0 };
  const to = edge.points[index + 1] ?? from;

  return { x: to.x - from.x, y: to.y - from.y };
}

type Hit = { point: Point; first: number; second: number };

function roots(a: number, b: number, c: number): number[] {
  if (Math.abs(a) < 1e-12) return Math.abs(b) < 1e-12 ? [] : [-c / b];

  const discriminant = b * b - 4 * a * c;

  if (discriminant <= 1e-12) return [];

  const square = Math.sqrt(discriminant);

  return [(-b - square) / (2 * a), (-b + square) / (2 * a)];
}

function segmentHit(a: Point, b: Point, c: Point, e: Point): Hit[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const ex = e.x - c.x;
  const ey = e.y - c.y;
  const determinant = dx * ey - dy * ex;

  if (Math.abs(determinant) < 1e-12) return [];

  const first = ((c.x - a.x) * ey - (c.y - a.y) * ex) / determinant;
  const second = ((c.x - a.x) * dy - (c.y - a.y) * dx) / determinant;

  if (first <= EPSILON || first >= 1 - EPSILON || second <= EPSILON || second >= 1 - EPSILON) return [];

  return [{ point: { x: a.x + first * dx, y: a.y + first * dy }, first, second }];
}

function arcSegment(arc: Extract<Edge, { kind: 'arc' }>, from: Point, to: Point): Hit[] {
  if (Math.abs(arc.height) < 1e-10) return segmentHit({ x: arc.center - arc.radius, y: 0 }, { x: arc.center + arc.radius, y: 0 }, from, to);

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const x = from.x - arc.center;
  const h2 = arc.height * arc.height;
  const candidates = roots(dx * dx + dy * dy / h2, 2 * (x * dx + from.y * dy / h2), x * x + from.y * from.y / h2 - arc.radius * arc.radius);
  const hits: Hit[] = [];

  for (const second of candidates) {
    if (second <= EPSILON || second >= 1 - EPSILON) continue;

    const point = { x: from.x + dx * second, y: from.y + dy * second };

    if (point.y * arc.height <= EPSILON) continue;

    const first = Math.acos(Math.max(-1, Math.min(1, (arc.center - point.x) / arc.radius))) / Math.PI;

    if (first > EPSILON && first < 1 - EPSILON) hits.push({ point, first, second });
  }

  return hits;
}

function arcHits(first: Extract<Edge, { kind: 'arc' }>, second: Extract<Edge, { kind: 'arc' }>): Hit[] {
  if (first.height * second.height <= 0) return [];

  const f2 = first.height * first.height;
  const s2 = second.height * second.height;
  const a = first.center - first.radius;
  const b = first.center + first.radius;
  const c = second.center - second.radius;
  const e = second.center + second.radius;
  const candidates = roots(s2 - f2, f2 * (a + b) - s2 * (c + e), s2 * c * e - f2 * a * b);
  const hits: Hit[] = [];

  for (const x of candidates) {
    if (x <= Math.max(a, c) + EPSILON || x >= Math.min(b, e) - EPSILON) continue;

    const y = first.height * Math.sqrt(Math.max(0, (x - a) * (b - x)));
    const tFirst = Math.acos(Math.max(-1, Math.min(1, (first.center - x) / first.radius))) / Math.PI;
    const tSecond = Math.acos(Math.max(-1, Math.min(1, (second.center - x) / second.radius))) / Math.PI;
    hits.push({ point: { x, y }, first: tFirst, second: tSecond });
  }

  return hits;
}

function pieces(edge: Exclude<Edge, { kind: 'arc' }>): Point[] {
  return edge.kind === 'segment' ? [edge.from, edge.to] : edge.points;
}

function edgeHits(first: Edge, second: Edge): Hit[] {
  if (first.kind === 'arc' && second.kind === 'arc') return arcHits(first, second);

  const hits: Hit[] = [];

  if (first.kind === 'arc' || second.kind === 'arc') {
    const arc = first.kind === 'arc' ? first : second;
    const other = first.kind === 'arc' ? second : first;

    if (arc.kind !== 'arc' || other.kind === 'arc') return hits;

    const vertices = pieces(other);

    for (let index = 0; index < vertices.length - 1; index++) {
      const from = vertices[index];
      const to = vertices[index + 1];

      if (!from || !to) continue;

      for (const hit of arcSegment(arc, from, to)) {
        const t = (index + hit.second) / (vertices.length - 1);
        hits.push(first.kind === 'arc' ? { point: hit.point, first: hit.first, second: t } : { point: hit.point, first: t, second: hit.first });
      }
    }

    return hits;
  }

  const a = pieces(first);
  const b = pieces(second);

  for (let i = 0; i < a.length - 1; i++) {
    const from = a[i];
    const to = a[i + 1];

    if (!from || !to) continue;

    for (let j = 0; j < b.length - 1; j++) {
      const start = b[j];
      const end = b[j + 1];

      if (!start || !end || Math.max(from.x, to.x) <= Math.min(start.x, end.x) || Math.max(start.x, end.x) <= Math.min(from.x, to.x) || Math.max(from.y, to.y) <= Math.min(start.y, end.y) || Math.max(start.y, end.y) <= Math.min(from.y, to.y)) continue;

      for (const hit of segmentHit(from, to, start, end)) hits.push({ point: hit.point, first: (i + hit.first) / (a.length - 1), second: (j + hit.second) / (b.length - 1) });
    }
  }

  return hits;
}

function isVisible(edge: Edge, t: number): boolean {
  return edge.reverse ? t >= 1 - edge.visible - EPSILON : t <= edge.visible + EPSILON;
}

export function crossings(edges: readonly Edge[]): Crossing[] {
  const result: Crossing[] = [];

  for (let a = 0; a < edges.length; a++) {
    const first = edges[a];

    if (!first || first.visible <= 0) continue;

    for (let b = a + 1; b < edges.length; b++) {
      const second = edges[b];

      if (!second || second.visible <= 0) continue;

      const hits = edgeHits(first, second).sort((p, q) => p.first - q.first);

      for (const [index, hit] of hits.entries()) {
        if (!isVisible(first, hit.first) || !isVisible(second, hit.second)) continue;

        const p = tangent(first, hit.first);
        const q = tangent(second, hit.second);
        const determinant = p.x * q.y - p.y * q.x;

        if (Math.abs(determinant) < 1e-9) continue;

        const point = warpPoint(hit.point, first.warp);

        if (result.some(old => Math.hypot(old.x - point.x, old.y - point.y) < 1e-7)) continue;

        result.push({ ...point, id: `${first.a}-${first.b}:${second.a}-${second.b}:${index}`, first: first.id, second: second.id, tFirst: hit.first, tSecond: hit.second, sign: determinant > 0 ? 1 : -1 });
      }
    }
  }

  return result;
}

function state(kind: GraphState['kind'], vertices: Vertex[], edges: Edge[], complete = false): GraphState {
  const intersections = crossings(edges);

  return { kind, vertices, edges, intersections, count: intersections.length, n: vertices.length, complete, signed: [] };
}

function split(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index < Math.ceil(count / 2) ? -Math.ceil(count / 2) + index : index - Math.ceil(count / 2) + 1);
}

export function brickyard(m = 3, n = 4, slide = 1, visible = 1): GraphState {
  const vertices: Vertex[] = [];
  const kiln = split(m);
  const yard = split(n);

  for (let index = 0; index < m + n; index++) {
    const upper = index < m;
    const i = upper ? index : index - m;
    const rowX = upper ? (i - (m - 1) / 2) * 2.1 + .037 * i * i : (i - (n - 1) / 2) * 1.73 + .019 * i * i * i + .143;
    const target = upper ? { x: kiln[i] ?? 0, y: 0 } : { x: 0, y: yard[i] ?? 0 };
    vertices.push({ id: index, kind: upper ? 'kiln' : 'yard', x: mix(rowX, target.x, slide), y: mix(upper ? 2 : -2, target.y, slide) });
  }

  const edges: Edge[] = [];

  for (let a = 0; a < m; a++) {
    for (let b = m; b < m + n; b++) {
      const from = vertices[a];
      const to = vertices[b];

      if (from && to) edges.push({ id: a * (m + n) + b, a, b, kind: 'segment', from, to, visible, reverse: false, warp: IDENTITY_WARP });
    }
  }

  return state(slide === 0 ? 'rows' : 'cross', vertices, edges);
}

function smallComplete(n: 4 | 5): GraphState {
  const points = [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 3, y: 5 }, { x: 1, y: 1 }, { x: 2, y: 1 }];
  const vertices: Vertex[] = points.slice(0, n).map((point, id) => ({ ...point, id, kind: 'dot' }));
  const edges: Edge[] = [];

  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const from = vertices[a];
      const to = vertices[b];

      if (from && to) edges.push({ id: a * 20 + b, a, b, kind: 'segment', from, to, visible: 1, reverse: false, warp: IDENTITY_WARP });
    }
  }

  return state(n === 4 ? 'k4' : 'k5', vertices, edges, true);
}

export function bookDrawing(n: number, warp: Warp = IDENTITY_WARP): GraphState {
  const vertices: Vertex[] = Array.from({ length: n }, (_, id) => ({ ...warpPoint({ x: spinePosition(id, n), y: 0 }, warp), id, kind: 'dot' }));
  const edges: Edge[] = [];

  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const first = vertices[a];
      const second = vertices[b];

      if (first && second) edges.push({ id: a * 20 + b, a, b, kind: 'arc', center: (first.x + second.x) / 2, radius: (second.x - first.x) / 2, height: bookPage(a, b, n), visible: 1, reverse: false, warp });
    }
  }

  return state('book', vertices, edges, true);
}

export function cycleCrossings(drawing: GraphState): Crossing[] {
  const first = [1, 2, 5];
  const second = [0, 3, 6, 4];
  const result: Crossing[] = [];

  for (let a = 0; a < first.length; a++) {
    const fromA = first[a] ?? 0;
    const toA = first[(a + 1) % first.length] ?? 0;
    const edgeA = drawing.edges.find(edge => edge.a === Math.min(fromA, toA) && edge.b === Math.max(fromA, toA));

    if (!edgeA) continue;

    for (let b = 0; b < second.length; b++) {
      const fromB = second[b] ?? 0;
      const toB = second[(b + 1) % second.length] ?? 0;
      const edgeB = drawing.edges.find(edge => edge.a === Math.min(fromB, toB) && edge.b === Math.max(fromB, toB));

      if (!edgeB) continue;

      for (const hit of edgeHits(edgeA, edgeB)) {
        const p = tangent(edgeA, hit.first);
        const q = tangent(edgeB, hit.second);
        const direction = (fromA < toA ? 1 : -1) * (fromB < toB ? 1 : -1);
        result.push({ ...warpPoint(hit.point, edgeA.warp), id: `cycle-${a}-${b}`, first: edgeA.id, second: edgeB.id, tFirst: hit.first, tSecond: hit.second, sign: (p.x * q.y - p.y * q.x) * direction > 0 ? 1 : -1 });
      }
    }
  }

  return result;
}

function routeDrawing(time: number): GraphState {
  const drawing = brickyard();
  const amount = Math.sin(span(time, 23000, 30500) * Math.PI);
  const edge = drawing.edges[0];

  if (edge?.kind === 'segment') {
    const controls = [edge.from, { x: -2.5, y: 1.6 }, { x: .8, y: .7 }, { x: -1.2, y: -.7 }, edge.to];
    drawing.edges[0] = { ...edge, kind: 'polyline', points: controls.map((point, index) => ({ x: mix(mix(edge.from.x, edge.to.x, index / 4), point.x, amount), y: mix(mix(edge.from.y, edge.to.y, index / 4), point.y, amount) })) };
  }

  return state('route', drawing.vertices, drawing.edges);
}

function growingBook(time: number): GraphState {
  const position = Math.max(0, Math.min(7, Math.floor((time - 44000) / 800)));
  const n = 5 + position;
  const drawing = bookDrawing(n);

  if (position === 0) return drawing;

  const start = 44000 + position * 800;
  const progress = smooth(time, start, start + 620);

  for (const [index, edge] of drawing.edges.entries()) {
    if (edge.kind !== 'arc') continue;

    if (edge.b === n - 1) drawing.edges[index] = { ...edge, visible: progress, reverse: true };
    else if (bookPage(edge.a, edge.b, n - 1) !== edge.height && progress < 1) {
      const height = mix(bookPage(edge.a, edge.b, n - 1), edge.height, progress);
      const points = Array.from({ length: 25 }, (_, step) => {
        const t = step / 24;

        return { x: edge.center - edge.radius * Math.cos(Math.PI * t), y: height * edge.radius * Math.sin(Math.PI * t) + .04 * Math.sin(Math.PI * progress) * Math.sin(t * Math.PI * 2) * (1 + index * .01) };
      });
      drawing.edges[index] = { ...edge, kind: 'polyline', points };
    }
  }

  return state('book', drawing.vertices, drawing.edges, progress === 1);
}

export function graphState(time: number): GraphState {
  if (time < 15000) {
    const drawing = brickyard(3, 4, smooth(time, 8500, 14000));

    for (const [index, edge] of drawing.edges.entries()) edge.visible = smooth(time, index * 250, 1800 + index * 250);

    return state(time < 8500 ? 'rows' : 'cross', drawing.vertices, drawing.edges);
  }

  if (time < 23000) return brickyard();
  if (time < 30500) return routeDrawing(time);
  if (time < 33300) return smallComplete(4);
  if (time < 35500) return smallComplete(5);

  if (time < 37500) {
    const drawing = brickyard(3, 3);
    drawing.kind = 'utilities';

    return drawing;
  }

  if (time < 44000) {
    const drawing = bookDrawing(5);

    for (const [index, edge] of drawing.edges.entries()) edge.visible = smooth(time, 37500 + index * 200, 40000 + index * 200);

    return state('book', drawing.vertices, drawing.edges, time >= 41800);
  }

  if (time < 51000) return growingBook(time);
  if (time < 66000) return bookDrawing(12);

  if (time < 82000) {
    const amplitude = .55 * smooth(time, 66000, 69000);
    const phase = (time - 69000) / 2200;
    const drawing = bookDrawing(9, { amplitude, phase });
    drawing.kind = 'drift';

    return drawing;
  }

  const drawing = bookDrawing(7);
  drawing.kind = time < 89000 ? 'cycles' : 'dimension';
  drawing.signed = cycleCrossings(drawing);

  return drawing;
}

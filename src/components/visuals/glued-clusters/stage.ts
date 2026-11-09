import { mix, progress, smooth } from '../../../lib/animation';
import type { FilmLabels } from '../../plate/labels';
import { FINITE_EVENTS, SAMPLE_SPANNING, SAMPLE_UNIFORMS } from './data';
import { gridPoint, interiorFence, SAMPLE_EDGES, sampleAt, SMALL_EDGES, type Point, type SampleState } from './math';
import { pAt } from './motion';
import type { Box } from './story';

type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

type Drawing = { state: SampleState; thin: Path2D; largest: Path2D; fenced: Path2D };

const FENCE = interiorFence();
const MEMBER = new Set(FENCE.members);
const WEIGHTS = [...SAMPLE_UNIFORMS].sort((a, b) => a - b);
const DRAWINGS = new Map<number, Drawing>();
const LIMITS = FENCE.members.map(vertex => gridPoint(vertex));
const LEFT = Math.min(...LIMITS.map(point => point.x)) - 3;
const BOTTOM = Math.min(...LIMITS.map(point => point.y)) - 3;
const SPAN = Math.max(Math.max(...LIMITS.map(point => point.x)) - LEFT, Math.max(...LIMITS.map(point => point.y)) - BOTTOM) + 3;

function pivotalPath(weight: number, vertical: boolean): Point[] {
  const state = sampleAt(weight + Number.EPSILON);
  const neighbours = Array.from({ length: 1024 }, (): number[] => []);

  for (const [index, [a, b]] of state.edges.entries()) {
    if (!state.open[index]) continue;

    neighbours[a]?.push(b);
    neighbours[b]?.push(a);
  }

  const previous = new Int16Array(1024).fill(-2);
  const queue: number[] = [];

  for (let vertex = 0; vertex < 1024; vertex++) {
    const point = gridPoint(vertex);

    if ((vertical ? point.y : point.x) === 0) {
      queue.push(vertex);
      previous[vertex] = -1;
    }
  }

  for (let cursor = 0; cursor < queue.length; cursor++) {
    const vertex = queue[cursor];

    if (vertex === undefined) continue;

    const point = gridPoint(vertex);

    if ((vertical ? point.y : point.x) === 31) {
      const path: Point[] = [];
      let back = vertex;

      while (back >= 0) {
        path.push(gridPoint(back));
        back = previous[back] ?? -1;
      }

      return path.reverse();
    }

    for (const next of neighbours[vertex] ?? []) {
      if (previous[next] !== -2) continue;

      previous[next] = vertex;
      queue.push(next);
    }
  }

  return [];
}

const FIRST_PATHS = [
  { weight: SAMPLE_SPANNING.vertical, points: pivotalPath(SAMPLE_SPANNING.vertical, true) },
  { weight: SAMPLE_SPANNING.horizontal, points: pivotalPath(SAMPLE_SPANNING.horizontal, false) },
];

function tag(pen: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, colors: Colors, maxWidth: number): void {
  pen.font = `${size}px "Special Elite", monospace`;
  const measured = pen.measureText(text).width;

  if (measured > maxWidth) pen.font = `${Math.max(9, size * maxWidth / measured)}px "Special Elite", monospace`;

  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  const width = pen.measureText(text).width;
  pen.fillStyle = colors.paper;
  pen.fillRect(x - width / 2 - 2, y - size * .65, width + 4, size * 1.3);
  pen.fillStyle = colors.ink;
  pen.fillText(text, x, y);
}

function edgeCount(p: number): number {
  let low = 0;
  let high = WEIGHTS.length;

  while (low < high) {
    const middle = (low + high) >>> 1;

    if ((WEIGHTS[middle] ?? 1) < p) low = middle + 1;
    else high = middle;
  }

  return low;
}

function drawingAt(p: number): Drawing {
  const key = edgeCount(p);
  const previous = DRAWINGS.get(key);

  if (previous) return previous;

  const state = sampleAt(p);
  const thin = new Path2D();
  const largest = new Path2D();
  const fenced = new Path2D();

  for (const [index, [a, b]] of SAMPLE_EDGES.entries()) {
    if (!state.open[index]) continue;

    const first = gridPoint(a);
    const second = gridPoint(b);
    const path = state.componentOf[a] === state.largestId ? largest : thin;
    path.moveTo(first.x, first.y);
    path.lineTo(second.x, second.y);

    if (MEMBER.has(a) && MEMBER.has(b)) {
      fenced.moveTo(first.x, first.y);
      fenced.lineTo(second.x, second.y);
    }
  }

  const result = { state, thin, largest, fenced };
  DRAWINGS.set(key, result);

  if (DRAWINGS.size > 12) DRAWINGS.delete(DRAWINGS.keys().next().value ?? key);

  return result;
}

function sample(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: FilmLabels['place'], closing = false): void {
  const p = pAt(time);
  const drawing = drawingAt(p);
  const fenced = closing || time >= 22750 && time < 30250;
  const zoom = closing ? 1 : smooth(time, 22750, 24400);
  const amount = fenced ? zoom : 0;
  const span = mix(33, SPAN, amount);
  const left = mix(-1, LEFT, amount);
  const bottom = mix(-1, BOTTOM, amount);
  const thresholdScene = time >= 14500 && time < 22750;
  const side = Math.min(box.w - 3, box.h - (thresholdScene ? 81 : 43));
  const scale = side / span;
  const x = box.x + (box.w - side) / 2;
  const y = box.y + (thresholdScene ? 38 : 22);
  const density = devicePixelRatio || 1;
  pen.save();
  pen.beginPath();
  pen.rect(x - 2, y - 2, side + 4, side + 4);
  pen.clip();

  if (time < 2100) {
    pen.beginPath();
    pen.arc(x + side / 2, y + side / 2, side * .75 * progress(time, 0, 2100), 0, Math.PI * 2);
    pen.clip();
  }

  pen.translate(x, y + side);
  pen.scale(scale, -scale);
  pen.translate(-left, -bottom);
  pen.strokeStyle = colors.muted;
  pen.lineWidth = 1 / density / scale;
  pen.stroke(drawing.thin);
  pen.stroke(drawing.largest);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.45 / scale;
  pen.stroke(fenced ? drawing.fenced : drawing.largest);
  pen.fillStyle = colors.ink;
  pen.beginPath();

  for (let vertex = 0; vertex < 1024; vertex++) {
    const point = gridPoint(vertex);
    const radius = (fenced && MEMBER.has(vertex) ? 1.2 : .58) / scale;
    pen.moveTo(point.x + radius, point.y);
    pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
  }

  pen.fill();

  if (time >= 6750 && time < 14500) {
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 2.8 / scale;

    for (const { weight, points } of FIRST_PATHS) {
      const length = progress(p, weight, weight + .012) * (points.length - 1);
      const first = points[0];

      if (!first || length <= 0) continue;

      pen.beginPath();
      pen.moveTo(first.x, first.y);

      for (let index = 1; index <= Math.ceil(length); index++) {
        const from = points[index - 1];
        const to = points[index];

        if (from && to) pen.lineTo(mix(from.x, to.x, Math.min(1, length - index + 1)), mix(from.y, to.y, Math.min(1, length - index + 1)));
      }

      pen.stroke();
    }
  }

  if (fenced) {
    const centre = gridPoint(FENCE.centre);
    pen.lineWidth = 1.1 / scale;
    pen.beginPath();
    pen.arc(centre.x, centre.y, 4 / scale, 0, Math.PI * 2);
    pen.stroke();
    pen.lineWidth = 2 / scale;
    const length = (FENCE.orderedLoop.length - 1) * (closing ? 1 : progress(time, 23750, 28800));
    pen.beginPath();
    const first = FENCE.orderedLoop[0];

    if (first) pen.moveTo(first.x, first.y);

    for (let index = 1; index <= Math.ceil(length); index++) {
      const from = FENCE.orderedLoop[index - 1];
      const to = FENCE.orderedLoop[index];

      if (from && to) pen.lineTo(mix(from.x, to.x, Math.min(1, length - index + 1)), mix(from.y, to.y, Math.min(1, length - index + 1)));
    }

    pen.stroke();
  }

  pen.restore();
  tag(pen, closing ? 'UNREVIEWED · ONE FINITE BOX' : fenced ? '37-POINT INTERIOR CLUSTER' : thresholdScene ? 'FINITE BOX CANNOT SHOW INFINITY' : 'ONE FIXED SAMPLE · 32 × 32 POINTS', box.x + box.w / 2, box.y + 6, 11, colors, box.w);

  if (thresholdScene) tag(pen, 'CUBIC: 0.2485 TO 0.2490 · BOND [16]', box.x + box.w / 2, box.y + 21, 10, colors, box.w);

  if (fenced) {
    tag(pen, '34 MISSING LINKS · ONE CLOSED LOOP', box.x + box.w / 2, y + side + 15, 10.5, colors, box.w);
  } else if (time > 2100) {
    const largest = drawing.state.components[drawing.state.largestId]?.size ?? 0;
    tag(pen, `LARGEST ${largest}/1,024 · ${drawing.state.components.length} CLUSTERS`, box.x + box.w / 2, y + side + 15, 10, colors, box.w);
  }

  if (time >= 14500 && time < 22750) place('pc', box.x + box.w / 2, y + side + 33);
}

function star(pen: CanvasRenderingContext2D, point: Point, radius: number): void {
  pen.beginPath();

  for (let index = 0; index < 10; index++) {
    const angle = -Math.PI / 2 + index * Math.PI / 5;
    const length = index % 2 === 0 ? radius : radius * .43;
    const x = point.x + Math.cos(angle) * length;
    const y = point.y + Math.sin(angle) * length;

    if (index === 0) pen.moveTo(x, y);
    else pen.lineTo(x, y);
  }

  pen.closePath();
  pen.stroke();
}

function smallPanel(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const step = Math.min(box.w / 4.3, (box.h - 32) / 3);
  const x = box.x + (box.w - step * 3) / 2;
  const y = box.y + 25 + step * 2;
  const pointAt = (vertex: number): Point => {
    const point = gridPoint(vertex, 4);

    return { x: x + point.x * step, y: y - point.y * step };
  };
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .9;

  for (const [a, b] of SMALL_EDGES) {
    const from = pointAt(a);
    const to = pointAt(b);
    pen.beginPath();
    pen.moveTo(from.x, from.y);
    pen.lineTo(mix(from.x, to.x, progress(time, 60000, 61200)), mix(from.y, to.y, progress(time, 60000, 61200)));
    pen.stroke();
  }

  pen.strokeStyle = colors.ink;
  pen.fillStyle = colors.ink;
  pen.lineWidth = 1.25;

  for (let vertex = 0; vertex < 12; vertex++) {
    const point = pointAt(vertex);

    if (vertex === FINITE_EVENTS.origin) {
      pen.beginPath();
      pen.arc(point.x, point.y, 5, 0, Math.PI * 2);
      pen.stroke();
      tag(pen, 'o', point.x - 14, point.y, 13, colors, 20);
    } else if (FINITE_EVENTS.relays.some(value => value === vertex)) {
      pen.strokeRect(point.x - 4, point.y - 4, 8, 8);
      tag(pen, 'A', point.x, point.y + 14, 11, colors, 20);
    } else if (FINITE_EVENTS.target.some(value => value === vertex)) {
      star(pen, point, 6);
      tag(pen, 'T', point.x + 15, point.y, 11, colors, 20);
    } else {
      pen.beginPath();
      pen.arc(point.x, point.y, 1.8, 0, Math.PI * 2);
      pen.fill();
    }
  }

  tag(pen, '4 × 3 GRID · 17 POSSIBLE LINKS', box.x + box.w / 2, box.y + 6, 11, colors, box.w);
}

function projected(box: Box, x: number, y: number, z: number): Point {
  const unit = Math.min(box.w * .60, box.h * .62);

  return { x: box.x + box.w * .15 + unit * (x + .42 * z), y: box.y + box.h * .84 - unit * (y + .26 * z) };
}

function segment(pen: CanvasRenderingContext2D, from: Point, to: Point, amount = 1): void {
  pen.beginPath();
  pen.moveTo(from.x, from.y);
  pen.lineTo(mix(from.x, to.x, amount), mix(from.y, to.y, amount));
  pen.stroke();
}

function wireCube(pen: CanvasRenderingContext2D, box: Box, amount: number, colors: Colors): void {
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .8;

  for (let vertex = 0; vertex < 8; vertex++) {
    for (let axis = 0; axis < 3; axis++) {
      if (vertex & 1 << axis) continue;

      const other = vertex ^ 1 << axis;
      segment(pen, projected(box, vertex & 1, vertex >> 1 & 1, vertex >> 2 & 1), projected(box, other & 1, other >> 1 & 1, other >> 2 & 1), amount);
    }
  }
}

function sheetBypass(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  wireCube(pen, box, progress(time, 30250, 31250), colors);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  const sheet = [[.48, 0, 0], [.48, 1, 0], [.48, 1, .72], [.48, 0, .72]] as const;
  pen.beginPath();

  for (const [index, [x, y, z]] of sheet.entries()) {
    const point = projected(box, x, y, z);

    if (index === 0) pen.moveTo(point.x, point.y);
    else pen.lineTo(point.x, point.y);
  }

  pen.closePath();
  pen.stroke();
  pen.lineWidth = 1.9;
  const path = [[.1, .4, .4], [.30, .4, .4], [.30, .4, .9], [.67, .4, .9], [.90, .4, .4]] as const;
  const length = progress(time, 31300, 33800) * (path.length - 1);

  for (let index = 1; index <= Math.ceil(length); index++) {
    const from = path[index - 1];
    const to = path[index];

    if (from && to) segment(pen, projected(box, from[0], from[1], from[2]), projected(box, to[0], to[1], to[2]), Math.min(1, length - index + 1));
  }

  tag(pen, 'A PATH GOES ROUND THE SHEET · SCHEMATIC', box.x + box.w / 2, box.y + 6, 11, colors, box.w);
}

function contradiction(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: FilmLabels['place']): void {
  const side = Math.min(box.w * .76, box.h * .70);
  const x = box.x + (box.w - side) / 2;
  const y = box.y + (box.h - side) / 2 + 5;
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .8;
  pen.strokeRect(x, y, side, side);
  pen.strokeStyle = colors.ink;
  pen.strokeRect(x + side * .34, y + side * .34, side * .32, side * .32);
  const count = 12;

  for (let index = 0; index < count; index++) {
    const angle = index * Math.PI * 2 / count;
    const start = { x: x + side * (.5 + .16 * Math.cos(angle)), y: y + side * (.5 + .16 * Math.sin(angle)) };
    const end = { x: x + side * (.5 + .50 * Math.cos(angle)), y: y + side * (.5 + .50 * Math.sin(angle)) };
    segment(pen, start, end, progress(time, 76600 + index * 90, 78300 + index * 90));
  }

  if (time < 91500) tag(pen, 'SUPPOSE AN INFINITE CLUSTER · SCHEMATIC', box.x + box.w / 2, box.y + 6, 10.5, colors, box.w);
  else place('below-critical', box.x + box.w / 2, box.y + 6);

  if (time >= 92500) tag(pen, 'CONTRADICTION', box.x + box.w / 2, box.y + box.h * .92, 13, colors, box.w);
}

function quarterFaces(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const collapse = smooth(time, 102200, 104000);
  const cube = { x: mix(box.x, box.x + box.w * .43, collapse), y: mix(box.y, box.y + box.h * .30, collapse), w: mix(box.w, box.w * .17, collapse), h: mix(box.h, box.h * .24, collapse) };
  wireCube(pen, cube, progress(time, 98250, 99100), colors);
  const centre = projected(cube, .5, .5, .5);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  let index = 0;

  for (let axis = 0; axis < 3; axis++) {
    for (const face of [0, 1]) {
      const facePoint = (u: number, v: number): Point => axis === 0 ? projected(cube, face, u, v) : axis === 1 ? projected(cube, u, face, v) : projected(cube, u, v, face);
      pen.strokeStyle = colors.muted;
      pen.lineWidth = .7;
      segment(pen, facePoint(.5, 0), facePoint(.5, 1), progress(time, 98750, 99800));
      segment(pen, facePoint(0, .5), facePoint(1, .5), progress(time, 98750, 99800));
      pen.strokeStyle = colors.ink;
      pen.lineWidth = 1;

      for (const a of [.25, .75]) {
        for (const b of [.25, .75]) {
          const target = axis === 0 ? projected(cube, face, a, b) : axis === 1 ? projected(cube, a, face, b) : projected(cube, a, b, face);
          segment(pen, centre, target, progress(time, 99100 + index * 55, 99550 + index * 55));
          index++;
        }
      }
    }
  }

  for (let vertex = 0; vertex < 8; vertex++) {
    for (let axis = 0; axis < 3; axis++) {
      if (vertex & 1 << axis) continue;

      const other = vertex ^ 1 << axis;
      const from = projected(cube, .42 + .16 * (vertex & 1), .42 + .16 * (vertex >> 1 & 1), .42 + .16 * (vertex >> 2 & 1));
      const to = projected(cube, .42 + .16 * (other & 1), .42 + .16 * (other >> 1 & 1), .42 + .16 * (other >> 2 & 1));
      segment(pen, from, to, progress(time, 98500, 99300));
    }
  }

  if (collapse > 0) {
    const step = Math.min(box.w / 6.5, box.h / 4.5);
    const x = box.x + box.w * .14;
    const y = box.y + box.h * .35;
    const shown = progress(time, 103000, 106700) * 15;
    let previous: Point | undefined;

    for (let index = 0; index < Math.ceil(shown); index++) {
      const row = Math.floor(index / 5);
      const column = row % 2 === 0 ? index % 5 : 4 - index % 5;
      const point = { x: x + column * step, y: y + row * step };
      pen.strokeStyle = colors.ink;
      pen.strokeRect(point.x - step * .28, point.y - step * .28, step * .56, step * .56);

      if (previous) segment(pen, previous, point);

      previous = point;
    }
  }

  tag(pen, collapse < .5 ? '24 QUARTER-FACES · SCHEMATIC' : 'COARSE CUBES INDEXED BY A PLANE · SCHEMATIC', box.x + box.w / 2, box.y + 6, 10.5, colors, box.w);
}

export function drawStage(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: FilmLabels['place']): void {
  if (time < 30250 || time >= 111750) sample(pen, box, time, colors, place, time >= 111750);
  else if (time < 35500) sheetBypass(pen, box, time, colors);
  else if (time < 60000) sample(pen, box, time, colors, place);
  else if (time < 76250) smallPanel(pen, box, time, colors);
  else if (time < 98250) contradiction(pen, box, time, colors, place);
  else if (time < 107250) quarterFaces(pen, box, time, colors);
}

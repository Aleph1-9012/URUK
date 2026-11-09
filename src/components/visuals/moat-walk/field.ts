import { smooth, progress as span } from '../../../lib/animation';
import type { Flood, MoatData } from './data';
import { layout, type Box } from './story';

export type FieldColors = { ink: string; blue: string; muted: string; paper: string };

export type FieldPoint = { x: number; y: number };

export type FieldLabel = (id: string, x: number, y: number, opacity?: number) => void;

type DenseCache = { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D; extent: number; side: number; arrival: Uint32Array; color: string; pixelColor: number; image: ImageData };

const denseCaches = new WeakMap<Flood, DenseCache>();

const linkCaches = new WeakMap<Flood, Path2D[]>();

const mix = (a: number, b: number, p: number) => a + (b - a) * p;

function camera(time: number): { x: number; y: number; radius: number } {
  if (time < 8500) return { x: 0, y: 0, radius: 43 };
  if (time < 11000) return { x: 0, y: 0, radius: mix(43, 6, smooth(time, 8500, 9800)) };
  if (time < 13500) return { x: 0, y: 0, radius: mix(6, 43, smooth(time, 11000, 11900)) };
  if (time < 16500) return { x: 0, y: 0, radius: mix(43, 6, smooth(time, 13500, 14500)) };
  if (time < 24500) return { x: 0, y: 0, radius: mix(6, 14, smooth(time, 16500, 17800)) };
  if (time < 31000) {
    const move = smooth(time, 24500, 26300);

    return { x: 65 * move, y: 0, radius: mix(14, 72, move) };
  }

  if (time < 38500) {
    const move = smooth(time, 31000, 32500);

    return { x: mix(65, 45, move), y: 45 * move, radius: mix(72, 11.5, move) };
  }

  if (time < 41500) {
    const move = smooth(time, 38500, 39700);

    return { x: 45 * (1 - move), y: 45 * (1 - move), radius: mix(11.5, 14, move) };
  }

  if (time < 44500) return { x: 0, y: 0, radius: mix(14, 50, smooth(time, 41500, 43500)) };
  if (time < 47500) return { x: 0, y: 0, radius: mix(50, 102, smooth(time, 44500, 46500)) };
  if (time < 52500) return { x: 0, y: 0, radius: mix(102, 1100, smooth(time, 47500, 51300)) };
  if (time < 83000) return { x: 0, y: 0, radius: mix(1100, 105, smooth(time, 52500, 54800)) };
  if (time < 97500) {
    const dive = smooth(time, 83000, 85000);
    const pull = smooth(time, 85500, 88500);

    return { x: 32.5 * dive, y: 32.5 * dive, radius: mix(mix(105, 18, dive), 87, pull) };
  }

  if (time < 99500) {
    const move = smooth(time, 97500, 99500);

    return { x: 32.5 * (1 - move), y: 32.5 * (1 - move), radius: mix(87, 105, move) };
  }

  return { x: 0, y: 0, radius: 105 };
}

export function fieldView(width: number, height: number, time: number): { box: Box; area: Box; tall: boolean; scale: number; map: (point: FieldPoint) => FieldPoint } {
  const { field: box, tall } = layout(width, height);
  const area = { x: box.x + 8, y: box.y + 27, w: box.w - 16, h: box.h - (tall ? 62 : 86) };
  const view = camera(time);
  const scale = Math.min(area.w, area.h) / (2 * view.radius);
  const map = (point: FieldPoint): FieldPoint => ({ x: area.x + area.w / 2 + (point.x - view.x) * scale, y: area.y + area.h / 2 - (point.y - view.y) * scale });

  return { box, area, tall, scale, map };
}

export function fieldWords(pen: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, colors: FieldColors, size = 10, tone: keyof FieldColors = 'ink'): void {
  pen.font = `${size}px "Special Elite", monospace`;
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  const lines: string[] = [];

  for (const paragraph of text.split('\n')) {
    let current = '';

    for (const word of paragraph.split(' ')) {
      const next = current ? `${current} ${word}` : word;

      if (current && pen.measureText(next).width > maxWidth - 4) {
        lines.push(current);
        current = word;
      } else current = next;
    }

    lines.push(current);
  }

  for (const [index, line] of lines.entries()) {
    const row = y + (index - (lines.length - 1) / 2) * (size + 3);
    const extent = pen.measureText(line).width;
    pen.fillStyle = colors.paper;
    pen.fillRect(x - extent / 2 - 2, row - size / 2 - 2, extent + 4, size + 4);
    pen.fillStyle = colors[tone];
    pen.fillText(line, x, row);
  }
}

export function fieldLine(pen: CanvasRenderingContext2D, from: FieldPoint, to: FieldPoint, color: string, weight = .8, progress = 1): void {
  if (progress <= 0) return;

  pen.strokeStyle = color;
  pen.lineWidth = weight;
  pen.beginPath();
  pen.moveTo(from.x, from.y);
  pen.lineTo(mix(from.x, to.x, progress), mix(from.y, to.y, progress));
  pen.stroke();
}

function dot(pen: CanvasRenderingContext2D, point: FieldPoint, color: string, radius = 1.5): void {
  pen.fillStyle = color;
  pen.beginPath();
  pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
  pen.fill();
}

function denseFlood(pen: CanvasRenderingContext2D, flood: Flood, count: number, map: (point: FieldPoint) => FieldPoint, scale: number, color: string, area: Box): void {
  let cache = denseCaches.get(flood);

  if (!cache) {
    const extent = Math.ceil(Math.sqrt(flood.maxRadiusSquared));
    const side = extent * 2 + 1;
    const arrival = new Uint32Array(side * side);

    for (let at = 0; at < flood.count; at++) {
      const index = flood.resumeOrder[at] ?? 0;
      const x = (flood.coords[index * 2] ?? 0) + extent;
      const y = extent - (flood.coords[index * 2 + 1] ?? 0);
      arrival[y * side + x] = at + 1;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) return;

    cache = { canvas, context, extent, side, arrival, color: '', pixelColor: 0, image: context.createImageData(1, 1) };
    denseCaches.set(flood, cache);
  }

  if (color !== cache.color) {
    cache.context.fillStyle = color;
    cache.context.fillRect(0, 0, 1, 1);
    const sample = cache.context.getImageData(0, 0, 1, 1).data;
    cache.pixelColor = new Uint32Array(sample.buffer, sample.byteOffset, 1)[0] ?? 0;
    cache.color = color;
  }

  const density = pen.getTransform().a;
  const pixelsWide = Math.ceil(area.w * density);
  const pixelsHigh = Math.ceil(area.h * density);

  if (cache.canvas.width !== pixelsWide || cache.canvas.height !== pixelsHigh) {
    cache.canvas.width = pixelsWide;
    cache.canvas.height = pixelsHigh;
    cache.image = cache.context.createImageData(pixelsWide, pixelsHigh);
  }

  const left = Math.round(area.x * density) / density;
  const top = Math.round(area.y * density) / density;
  const origin = map({ x: 0, y: 0 });
  const columns = new Int32Array(pixelsWide);

  for (let column = 0; column < pixelsWide; column++) {
    columns[column] = Math.round((left + (column + .5) / density - origin.x) / scale) + cache.extent;
  }

  const pixels = new Uint32Array(cache.image.data.buffer, cache.image.data.byteOffset, pixelsWide * pixelsHigh);
  pixels.fill(0);

  for (let row = 0; row < pixelsHigh; row++) {
    const sourceY = cache.extent + Math.round((top + (row + .5) / density - origin.y) / scale);

    if (sourceY < 0 || sourceY >= cache.side) continue;

    const sourceRow = sourceY * cache.side;
    const targetRow = row * pixelsWide;

    for (let column = 0; column < pixelsWide; column++) {
      const sourceX = columns[column] ?? -1;

      if (sourceX < 0 || sourceX >= cache.side) continue;

      const arrived = cache.arrival[sourceRow + sourceX] ?? 0;

      if (arrived > 0 && arrived <= count) pixels[targetRow + column] = cache.pixelColor;
    }
  }

  cache.context.putImageData(cache.image, 0, 0);
  pen.imageSmoothingEnabled = false;
  pen.drawImage(cache.canvas, left, top, pixelsWide / density, pixelsHigh / density);
}

function floodPaths(flood: Flood): Path2D[] {
  const existing = linkCaches.get(flood);

  if (existing) return existing;

  const paths: Path2D[] = [];

  for (let layer = 0; layer < flood.resumeOffsets.length - 1; layer++) {
    const path = new Path2D();
    const start = flood.resumeOffsets[layer] ?? 0;
    const end = flood.resumeOffsets[layer + 1] ?? start;

    for (let at = start; at < end; at++) {
      const index = flood.resumeOrder[at] ?? 0;
      const parent = flood.resumeParents[index] ?? -1;

      if (parent < 0) continue;

      path.moveTo(flood.coords[parent * 2] ?? 0, flood.coords[parent * 2 + 1] ?? 0);
      path.lineTo(flood.coords[index * 2] ?? 0, flood.coords[index * 2 + 1] ?? 0);
    }

    paths.push(path);
  }

  linkCaches.set(flood, paths);

  return paths;
}

function drawFlood(pen: CanvasRenderingContext2D, flood: Flood, progress: number, view: ReturnType<typeof fieldView>, colors: FieldColors): void {
  const lastLayer = flood.resumeOffsets.length - 2;
  const layer = Math.min(lastLayer, Math.floor(progress * (lastLayer + 1)));
  const count = flood.resumeOffsets[layer + 1] ?? flood.count;

  if (flood.count > 10000) {
    denseFlood(pen, flood, count, view.map, view.scale, colors.ink, view.area);

    return;
  }

  const origin = view.map({ x: 0, y: 0 });
  pen.save();
  pen.transform(view.scale, 0, 0, -view.scale, origin.x, origin.y);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .7 / view.scale;
  const paths = floodPaths(flood);

  for (let index = 0; index <= layer; index++) {
    const path = paths[index];

    if (path) pen.stroke(path);
  }

  pen.restore();
  pen.beginPath();

  for (let at = 0; at < count; at++) {
    const index = flood.resumeOrder[at] ?? 0;
    const point = view.map({ x: flood.coords[index * 2] ?? 0, y: flood.coords[index * 2 + 1] ?? 0 });
    const radius = view.tall ? .9 : 1.2;
    pen.moveTo(point.x + radius, point.y);
    pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
  }

  pen.fillStyle = colors.ink;
  pen.fill();
}

function islands(pen: CanvasRenderingContext2D, data: MoatData, view: ReturnType<typeof fieldView>, colors: FieldColors): void {
  const field = data.initial?.islands;

  if (!field) return;

  pen.beginPath();

  for (let index = 0; index < field.coords.length / 2; index++) {
    const parent = field.parents[index] ?? -1;
    const point = view.map({ x: field.coords[index * 2] ?? 0, y: field.coords[index * 2 + 1] ?? 0 });

    if (parent >= 0) {
      const from = view.map({ x: field.coords[parent * 2] ?? 0, y: field.coords[parent * 2 + 1] ?? 0 });
      pen.moveTo(from.x, from.y);
      pen.lineTo(point.x, point.y);
    }
  }

  pen.strokeStyle = colors.ink;
  pen.lineWidth = view.tall ? .45 : .7;
  pen.stroke();
  pen.beginPath();

  for (let index = 0; index < field.coords.length; index += 2) {
    const point = view.map({ x: field.coords[index] ?? 0, y: field.coords[index + 1] ?? 0 });
    const radius = view.tall ? .65 : .9;
    pen.moveTo(point.x + radius, point.y);
    pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
  }

  pen.fillStyle = colors.ink;
  pen.fill();
}

export function drawField(pen: CanvasRenderingContext2D, width: number, height: number, _density: number, time: number, colors: FieldColors, label: FieldLabel, data: MoatData): void {
  if (time >= 85000 && time < 106000) return;

  const view = fieldView(width, height, time);
  const { box, area, map, tall } = view;
  const initial = data.initial;
  const words = (text: string, y: number, muted = false) => fieldWords(pen, text, box.x + box.w / 2, y, box.w, colors, tall ? 8 : 11, muted ? 'muted' : 'ink');
  words('A WALK ON THE GAUSSIAN PRIMES', box.y + 7);
  pen.save();
  pen.beginPath();
  pen.rect(area.x, area.y, area.w, area.h);
  pen.clip();
  const origin = map({ x: 0, y: 0 });
  fieldLine(pen, { x: area.x, y: origin.y }, { x: area.x + area.w, y: origin.y }, colors.muted, .5);
  fieldLine(pen, { x: origin.x, y: area.y }, { x: origin.x, y: area.y + area.h }, colors.muted, .5);

  if (initial && time < 38500) {
    pen.beginPath();
    const front = 40 * smooth(time, 0, 5800);

    for (let index = 0; index < initial.smallPrimeCoords.length; index += 2) {
      const x = initial.smallPrimeCoords[index] ?? 0;
      const y = initial.smallPrimeCoords[index + 1] ?? 0;

      if (time < 8500 && x * x + y * y > front * front) continue;
      if (time >= 8500 && time < 16500 && x * x + y * y > 1600) continue;
      if (time >= 24500 && time < 31000 && y !== 0) continue;

      const point = map({ x, y });

      if (point.x < area.x || point.x > area.x + area.w || point.y < area.y || point.y > area.y + area.h) continue;

      const radius = tall ? view.scale > 3 ? 1.1 : .65 : 1.3;
      pen.moveTo(point.x + radius, point.y);
      pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    }

    pen.fillStyle = colors.ink;
    pen.fill();

    if (time < 8500) {
      fieldLine(pen, map({ x: -40, y: -40 }), map({ x: 40, y: 40 }), colors.muted, .45, smooth(time, 5500, 6800));
      fieldLine(pen, map({ x: -40, y: 40 }), map({ x: 40, y: -40 }), colors.muted, .45, smooth(time, 6000, 7300));
    }

    if (time >= 8500 && time < 16500) {
      for (let index = 0; index < initial.smallPrimeCoords.length; index += 2) {
        const x = initial.smallPrimeCoords[index] ?? 0;
        const y = initial.smallPrimeCoords[index + 1] ?? 0;
        const norm = x * x + y * y;

        if (norm > 1600) continue;

        const highlight = time < 11000 ? norm === 2 : time < 13500 ? x === 0 || y === 0 : norm === 5 || norm === 13;

        if (highlight) dot(pen, map({ x, y }), colors.ink, tall ? 2.3 : 3.1);
      }

      if (time >= 13500) {
        for (const radius of [Math.sqrt(5), Math.sqrt(13)]) {
          pen.beginPath();
          pen.arc(origin.x, origin.y, radius * view.scale, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * smooth(time, 13700, 14900));
          pen.strokeStyle = colors.ink;
          pen.lineWidth = .7;
          pen.stroke();
        }
      }
    }

    if (time >= 16500 && time < 24500) {
      const flood = data.floods.get(2);
      const route: FieldPoint[] = [{ x: 0, y: 0 }];

      if (flood) {
        let index = Math.max(0, flood.depth.findIndex(depth => depth === 4));
        const reverse: FieldPoint[] = [];

        while (index >= 0) {
          reverse.push({ x: flood.coords[index * 2] ?? 0, y: flood.coords[index * 2 + 1] ?? 0 });
          index = flood.parents[index] ?? -1;
        }

        route.push(...reverse.reverse());
      }

      const move = span(time, 17800, 22200) * (route.length - 1);

      for (let index = 1; index < route.length; index++) {
        const from = route[index - 1];
        const to = route[index];

        if (from && to) fieldLine(pen, map(from), map(to), colors.ink, 1.6, Math.max(0, Math.min(1, move - index + 1)));
      }

      const from = route[Math.min(route.length - 1, Math.floor(move))];
      const to = route[Math.min(route.length - 1, Math.floor(move) + 1)];

      if (from && to) dot(pen, map({ x: mix(from.x, to.x, move % 1), y: mix(from.y, to.y, move % 1) }), colors.ink, 2.7);
    }

    if (time >= 24500 && time < 31000) {
      for (const prime of initial.axisPrimes) dot(pen, map({ x: prime, y: 0 }), colors.ink, tall ? 2 : 2.5);

      const left = map({ x: 108, y: 0 });
      const right = map({ x: 126, y: 0 });
      fieldLine(pen, { x: left.x, y: left.y + 10 }, { x: right.x, y: right.y + 10 }, colors.ink, 1);

      for (let value = 122; value <= 125; value++) {
        const point = map({ x: value, y: 0 });
        fieldLine(pen, { x: point.x, y: point.y + 6 }, { x: point.x, y: point.y + 14 }, colors.ink, .7);
      }
    }

    if (time >= 31000) {
      const center = map({ x: 45, y: 45 });
      pen.beginPath();
      pen.arc(center.x, center.y, Math.sqrt(13) * view.scale, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * smooth(time, 32200, 33400));
      pen.strokeStyle = colors.ink;
      pen.lineWidth = 1;
      pen.stroke();
      const coords = initial.loop.coords;
      const count = coords.length / 2;
      const walk = span(time, 33100, 37700) * Math.max(0, count - 1);

      for (let index = 1; index < count; index++) {
        fieldLine(pen, map({ x: coords[(index - 1) * 2] ?? 0, y: coords[(index - 1) * 2 + 1] ?? 0 }), map({ x: coords[index * 2] ?? 0, y: coords[index * 2 + 1] ?? 0 }), colors.ink, 1.4, Math.max(0, Math.min(1, walk - index + 1)));
      }

      const at = Math.min(count - 1, Math.floor(walk));
      const next = Math.min(count - 1, at + 1);
      dot(pen, map({ x: mix(coords[at * 2] ?? 0, coords[next * 2] ?? 0, walk % 1), y: mix(coords[at * 2 + 1] ?? 0, coords[next * 2 + 1] ?? 0, walk % 1) }), colors.ink, 2.7);
    }
  } else if (time < 52500) {
    const stage = time < 41500 ? 2 : time < 44500 ? 4 : time < 47500 ? 8 : 10;
    const start = stage === 2 ? 38500 : stage === 4 ? 41500 : stage === 8 ? 44500 : 47500;
    const end = stage === 10 ? 51600 : start + 2200;
    const flood = data.floods.get(stage);
    const prior = data.floods.get(stage === 4 ? 2 : stage === 8 ? 4 : stage === 10 ? 8 : -1);

    if (initial && stage < 10) {
      pen.beginPath();

      for (let index = 0; index < initial.smallPrimeCoords.length; index += 2) {
        const point = map({ x: initial.smallPrimeCoords[index] ?? 0, y: initial.smallPrimeCoords[index + 1] ?? 0 });
        pen.moveTo(point.x + .65, point.y);
        pen.arc(point.x, point.y, .65, 0, Math.PI * 2);
      }

      pen.globalAlpha = .26;
      pen.fillStyle = colors.ink;
      pen.fill();
      pen.globalAlpha = 1;
    }

    if (prior && stage < 10) drawFlood(pen, prior, 1, view, colors);
    if (flood) drawFlood(pen, flood, smooth(time, start, end), view, colors);
  } else islands(pen, data, view, colors);

  if (origin.y >= area.y && origin.y < area.y + area.h - 10) {
    fieldWords(pen, 'REAL', area.x + area.w - 15, origin.y + 9, 35, colors, tall ? 6 : 8, 'muted');
  }

  if (origin.x >= area.x + 10 && origin.x < area.x + area.w - 40) {
    fieldWords(pen, 'IMAGINARY', origin.x + 25, area.y + 7, 65, colors, tall ? 6 : 8, 'muted');
  }

  pen.restore();

  if (!initial) words(data.error ? 'COMPUTATION FAILED · SEE TRANSCRIPT' : 'COMPUTING THE PRIME FIELD', box.y + box.h - 15, true);
  else if (time < 8500) words(time < 5800 ? 'THE PRIMES APPEAR OUTWARDS' : '980 WITHIN RADIUS 40 · EIGHTFOLD SYMMETRY', box.y + box.h - 15);
  else if (time < 11000) label('gaussian-one', box.x + box.w / 2, box.y + box.h - 15);
  else if (time < 13500) words('24 AXIS PRIMES · 3, 7, 11, 19, 23, 31', box.y + box.h - 15);
  else if (time < 16500) {
    label(time < 15000 ? 'gaussian-factors5' : 'gaussian-factors13', box.x + box.w / 2, box.y + box.h - 30);
    words('952 OF THE 980 ARE OF THIS KIND', box.y + box.h - 10, true);
  } else if (time < 24500) words('GORDON, 1962 · A WALK TO INFINITY?', box.y + box.h - 15);
  else if (time < 31000) {
    label('factorial-gap', box.x + box.w / 2, box.y + box.h - 31);
    words('122 TO 125: ALL COMPOSITE', box.y + box.h - 11);
  } else if (time < 38500) {
    words('45 + 45i · NO PRIME INSIDE RADIUS √13', box.y + box.h - 29);
    words('A TRUE PRIME LOOP · STEPS AT MOST √8', box.y + box.h - 10, true);
  }
  else if (time < 52500) {
    const stage = time < 41500 ? 2 : time < 44500 ? 4 : time < 47500 ? 8 : 10;
    const flood = data.floods.get(stage);
    words(flood ? `BREADTH-FIRST FLOOD · ${stage === 10 ? '249,508' : flood.count.toLocaleString()} PRIMES WHEN COMPLETE` : 'COMPUTING THIS FLOOD', box.y + box.h - 29);
    const settled = time >= (stage === 10 ? 51600 : (stage === 2 ? 38500 : stage === 4 ? 41500 : 44500) + 2200);
    words(settled ? 'THE CLUSTER STOPS · NO ALLOWED STEP LEAVES' : 'FOLLOWING REAL BFS LAYERS FROM THE OLD EDGE', box.y + box.h - 10, true);
  } else if (time < 69000) words(time < 61000 ? '833 CLUSTERS MEET RADIUS 100 · COMPUTED' : 'THE WALK CHOOSES WHERE TO GO', box.y + box.h - 15);
  else if (time < 83000) words(time < 77000 ? 'NO WALK TO INFINITY · CLAIMED' : 'THE UNIFORM BOUND IS NOT GIVEN', box.y + box.h - 15);
  else if (time >= 106000) words('UNREVIEWED · A KERNEL CHECK IS NOT A READING', box.y + box.h - 15);
}

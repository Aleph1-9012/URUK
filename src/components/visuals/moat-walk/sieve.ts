import type { MoatData, SieveData } from './data';
import { UNIT_SIEVE_BOUND } from './math';
import { fieldView, fieldWords, fieldLine, type FieldColors, type FieldLabel, type FieldPoint } from './field';
import { smooth } from './story';

type SievePaths = { all: Path2D; largest: Path2D };

const caches = new WeakMap<SieveData, SievePaths>();

function pathsFor(sieve: SieveData): SievePaths {
  const cached = caches.get(sieve);

  if (cached) return cached;

  const all = new Path2D();
  const largest = new Path2D();

  for (let id = 0; id < sieve.keep.length; id++) {
    const parent = sieve.parents[id] ?? -1;

    if (parent < 0) continue;

    const x = sieve.liftCoords[id * 2] ?? 0;
    const y = sieve.liftCoords[id * 2 + 1] ?? 0;
    const px = sieve.liftCoords[parent * 2] ?? 0;
    const py = sieve.liftCoords[parent * 2 + 1] ?? 0;
    all.moveTo(px, py);
    all.lineTo(x, y);

    if (sieve.component[id] === sieve.largestComponent) {
      largest.moveTo(px, py);
      largest.lineTo(x, y);
    }
  }

  const paths = { all, largest };
  caches.set(sieve, paths);

  return paths;
}

type SieveRaster = { key: string; patterns: CanvasPattern[]; canvas: HTMLCanvasElement };

const rasters = new WeakMap<SieveData, SieveRaster>();

function rasterFor(pen: CanvasRenderingContext2D, sieve: SieveData, width: number, height: number, density: number, colors: FieldColors): SieveRaster | undefined {
  const key = `${width}:${height}:${density}:${colors.ink}:${colors.muted}`;
  const cached = rasters.get(sieve);

  if (cached?.key === key) return cached;

  const patterns: CanvasPattern[] = [];
  const periodPixels = sieve.period * 4;

  for (let stage = 0; stage < 4; stage++) {
    const tile = document.createElement('canvas');
    tile.width = tile.height = periodPixels;
    const context = tile.getContext('2d');

    if (!context) return;

    context.fillStyle = colors.ink;
    context.strokeStyle = colors.muted;
    context.lineWidth = 1;

    for (let y = 0; y <= sieve.period; y++) {
      for (let x = 0; x <= sieve.period; x++) {
        const five = (2 * x + y) % 5 === 0 || (2 * x - y) % 5 === 0;
        const thirteen = (3 * x + 2 * y) % 13 === 0 || (3 * x - 2 * y) % 13 === 0;
        const removed = stage >= 1 && five || stage >= 2 && thirteen;

        if (!removed) {
          context.beginPath();
          context.arc(x * 4, y * 4, .84, 0, Math.PI * 2);
          context.fill();
        } else if (stage < 3) {
          context.beginPath();
          context.moveTo(x * 4 - 1.3, y * 4 + 1.3);
          context.lineTo(x * 4 + 1.3, y * 4 - 1.3);
          context.stroke();
        }
      }
    }

    const pattern = pen.createPattern(tile, 'repeat');

    if (!pattern) return;

    pattern.setTransform(new DOMMatrix([.25, 0, 0, .25, 0, 0]));
    patterns.push(pattern);
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * density);
  canvas.height = Math.round(height * density);
  const context = canvas.getContext('2d');

  if (!context) return;

  const fixed = fieldView(width, height, 93000);
  const origin = fixed.map({ x: 0, y: 0 });
  context.setTransform(density, 0, 0, density, 0, 0);
  context.beginPath();
  context.rect(fixed.area.x, fixed.area.y, fixed.area.w, fixed.area.h);
  context.clip();
  context.transform(fixed.scale, 0, 0, -fixed.scale, origin.x, origin.y);
  context.strokeStyle = colors.muted;
  context.lineWidth = .45 / fixed.scale;
  const paths = pathsFor(sieve);

  for (const dx of [-130, -65, 0, 65, 130]) {
    for (const dy of [-130, -65, 0, 65, 130]) {
      context.save();
      context.translate(dx, dy);
      context.stroke(paths.all);
      context.restore();
    }
  }

  const raster = { key, patterns, canvas };
  rasters.set(sieve, raster);

  return raster;
}

function budgetWalk(pen: CanvasRenderingContext2D, view: ReturnType<typeof fieldView>, time: number, colors: FieldColors, label: FieldLabel): void {
  const { area, box, tall } = view;
  fieldWords(pen, 'THE COST OF A FIXED WALK', box.x + box.w / 2, box.y + 8, box.w, colors, tall ? 9 : 12);
  const points: FieldPoint[] = [];
  const progress = smooth(time, 97500, 100000);
  const count = Math.floor(progress * 48);

  for (let index = 0; index <= 48; index++) {
    points.push({ x: area.x + area.w * (.05 + .9 * index / 48), y: area.y + area.h * (.39 + .20 * Math.sin(index * .87) + .07 * Math.sin(index * 2.1)) });
  }

  for (let index = 1; index <= count; index++) {
    const from = points[index - 1];
    const to = points[index];

    if (from && to) fieldLine(pen, from, to, colors.ink, 1.1);
  }

  for (const index of [7, 17, 28, 40]) {
    const point = points[index];

    if (point && count >= index) {
      fieldLine(pen, { x: point.x, y: point.y - 8 }, { x: point.x, y: point.y + 8 }, colors.ink, 1.2);
    }
  }

  if (time < 106000) label('scale-cost', box.x + box.w * .54, area.y + area.h * .86);
  fieldWords(pen, 'SAMPLED TIMES ON ONE FIXED WALK', box.x + box.w / 2, box.y + box.h - 31, box.w, colors, tall ? 8 : 10);
  fieldWords(pen, 'SCHEMATIC · NO CONSTANTS GIVEN', box.x + box.w / 2, box.y + box.h - 11, box.w, colors, tall ? 8 : 10, 'muted');
}

export function drawSieve(pen: CanvasRenderingContext2D, width: number, height: number, density: number, time: number, colors: FieldColors, label: FieldLabel, data: MoatData): void {
  if (time < 83000 || time >= 108000) return;

  const view = fieldView(width, height, time);
  const { area, box, scale, tall, map } = view;

  if (time >= 106000) {
    pen.save();
    pen.translate(0, -height * smooth(time, 106000, 108000));
    budgetWalk(pen, view, time, colors, label);
    pen.restore();

    return;
  }

  if (time >= 97500) {
    const prior = data.initial?.sieve;

    if (prior && time < 99500) {
      const origin = view.map({ x: 0, y: 0 });
      pen.save();
      pen.transform(view.scale, 0, 0, -view.scale, origin.x, origin.y);
      pen.globalAlpha = .2 * (1 - smooth(time, 97500, 99500));
      pen.lineWidth = .5 / view.scale;
      pen.strokeStyle = colors.ink;
      pen.stroke(pathsFor(prior).all);
      pen.restore();
    }

    budgetWalk(pen, view, time, colors, label);

    return;
  }

  const sieve = data.initial?.sieve;

  if (!sieve) return;

  fieldWords(pen, 'THE SIEVE · COMPUTED FOR UNIT STEPS', box.x + box.w / 2, box.y + 8, box.w, colors, tall ? 8 : 12);
  const origin = map({ x: 0, y: 0 });
  const left = Math.floor((area.x - origin.x) / scale);
  const right = Math.ceil((area.x + area.w - origin.x) / scale);
  const bottom = Math.floor((origin.y - area.y - area.h) / scale);
  const top = Math.ceil((origin.y - area.y) / scale);
  pen.save();
  pen.beginPath();
  pen.rect(area.x, area.y, area.w, area.h);
  pen.clip();
  const raster = rasterFor(pen, sieve, width, height, density, colors);
  const paintPattern = (stage: number, reveal = 1): void => {
    const pattern = raster?.patterns[stage];

    if (!pattern || reveal <= 0) return;

    pen.save();
    pen.beginPath();
    pen.rect(area.x, area.y, area.w * reveal, area.h);
    pen.clip();
    pen.transform(scale, 0, 0, -scale, origin.x, origin.y);
    pen.imageSmoothingEnabled = true;
    pen.fillStyle = pattern;
    pen.fillRect(left, bottom, right - left, top - bottom);
    pen.restore();
  };

  if (time < 84600) {
    pen.save();
    const front = map({ x: 32.5, y: 32.5 });
    pen.beginPath();
    pen.arc(front.x, front.y, 140 * smooth(time, 83000, 84200) * scale, 0, Math.PI * 2);
    pen.clip();
    paintPattern(0);
    pen.restore();
  } else if (time < 86000) {
    paintPattern(0);
    paintPattern(1, smooth(time, 84600, 86000));
  } else if (time < 86500) paintPattern(1);
  else if (time < 87500) {
    paintPattern(1);
    paintPattern(2, smooth(time, 86500, 87500));
  } else paintPattern(3);

  if (time >= 88000) {
    const a = map({ x: 0, y: 0 });
    const b = map({ x: 65, y: 65 });
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .6;
    pen.strokeRect(a.x, b.y, b.x - a.x, a.y - b.y);
    fieldWords(pen, 'ONE PERIOD', (a.x + b.x) / 2, b.y + 8, Math.max(65, b.x - a.x), colors, tall ? 7 : 9, 'muted');
  }

  if (time >= 90500) {
    const paths = pathsFor(sieve);
    pen.save();
    pen.transform(scale, 0, 0, -scale, origin.x, origin.y);
    pen.restore();

    if (raster) pen.drawImage(raster.canvas, 0, 0, width, height);

    pen.save();
    pen.transform(scale, 0, 0, -scale, origin.x, origin.y);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = (tall ? 1 : 1.3) / scale;
    const shift = smooth(time, 91200, 93000);

    for (const [dx, dy] of [[0, 0], [65 * shift, 0], [0, 65 * shift]] as const) {
      pen.save();
      pen.translate(dx, dy);
      pen.stroke(paths.largest);
      pen.restore();
    }

    pen.restore();

    if (time >= 94400) {
      for (const [a, b] of [[2, 1], [3, 2]] as const) {
        for (const sx of [-1, 1]) {
          for (const sy of [-1, 1]) {
            for (const point of [{ x: a * sx, y: b * sy }, { x: b * sx, y: a * sy }]) {
              const p = map(point);
              pen.beginPath();
              pen.arc(p.x, p.y, tall ? 1.7 : 2.5, 0, Math.PI * 2);
              pen.fillStyle = colors.ink;
              pen.fill();
            }
          }
        }
      }
    }
  }

  pen.restore();

  if (time < 90500) {
    label('period-q', box.x + box.w / 2, box.y + box.h - 30);
    fieldWords(pen, time < 86500 ? 'STRIKE THE ZERO CLASSES OF 5' : 'THEN 13 · 2,304/4,225 STAY · 54.5%', box.x + box.w / 2, box.y + box.h - 10, box.w, colors, tall ? 8 : 10);
  } else if (time < 94400) {
    label('period-bound', box.x + box.w / 2, box.y + box.h - 30);
    fieldWords(pen, '243 CLUSTERS PER TILE · LARGEST: 580', box.x + box.w / 2, box.y + box.h - 10, box.w, colors, tall ? 8 : 11);
  } else {
    fieldWords(pen, `ADD BACK 16 PRIMES · BOUND: ${UNIT_SIEVE_BOUND.toLocaleString()}`, box.x + box.w / 2, box.y + box.h - 30, box.w, colors, tall ? 8 : 11);
    fieldWords(pen, 'UNIT STEPS ONLY · TRUE LARGEST: 3', box.x + box.w / 2, box.y + box.h - 10, box.w, colors, tall ? 8 : 10, 'muted');
  }
}

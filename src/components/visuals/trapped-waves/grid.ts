import { binaryApproximation, freeStandingWave, freeWave, separationCost } from './math';
import { EIGENVALUES, LOCALIZED_STATES, STRONG_STATS, type WaveData, type WaveFrame } from './data';

type Point = { x: number; y: number };

type Ink = { ink: string; blue: string; muted: string; paper: string };

type Label = (id: string, x: number, y: number, opacity?: number) => void;

type Probability = Float32Array<ArrayBuffer> | readonly number[];

type Sample = { key: string; side: number; density: Probability; time: number; rms: number; within3: number; ready: boolean };

type Painted = { key: string; canvas: HTMLCanvasElement; pixels: number };

type DrawingCache = { first: Painted; second: Painted; mixed: HTMLCanvasElement };

const cacheByContext = new WeakMap<CanvasRenderingContext2D, DrawingCache>();

const STANDING = freeStandingWave();

function ease(time: number, start: number, end: number): number {
  const progress = Math.max(0, Math.min(1, (time - start) / (end - start)));

  return progress * progress * (3 - 2 * progress);
}

function cacheFor(context: CanvasRenderingContext2D): DrawingCache {
  const stored = cacheByContext.get(context);

  if (stored) return stored;

  const cache = {
    first: { key: '', canvas: document.createElement('canvas'), pixels: 8 },
    second: { key: '', canvas: document.createElement('canvas'), pixels: 8 },
    mixed: document.createElement('canvas'),
  };
  cacheByContext.set(context, cache);

  return cache;
}

function paint(target: Painted, sample: Sample, color: string): void {
  if (target.key === sample.key) return;

  target.key = sample.key;
  target.pixels = sample.side === 201 ? 1 : 8;
  const size = sample.side * target.pixels;
  target.canvas.width = size;
  target.canvas.height = size;
  const context = target.canvas.getContext('2d');

  if (!context) return;

  let peak = 0;

  for (const value of sample.density) peak = Math.max(peak, value);

  context.fillStyle = color;

  if (sample.side === 201) {
    context.fillRect(0, 0, 1, 1);
    const ink = context.getImageData(0, 0, 1, 1).data;
    const image = context.createImageData(size, size);
    const denominator = Math.log1p(peak * 1e5) || 1;

    for (let i = 0; i < sample.density.length; i++) {
      image.data[4 * i] = ink[0] ?? 0;
      image.data[4 * i + 1] = ink[1] ?? 0;
      image.data[4 * i + 2] = ink[2] ?? 0;
      image.data[4 * i + 3] = Math.round(255 * Math.log1p((sample.density[i] ?? 0) * 1e5) / denominator);
    }

    context.putImageData(image, 0, 0);
  } else {
    for (let row = 0; row < sample.side; row++) {
      for (let col = 0; col < sample.side; col++) {
        const probability = sample.density[row * sample.side + col] ?? 0;

        if (probability <= 0 || peak <= 0) continue;

        context.beginPath();
        context.arc((col + .5) * 8, (row + .5) * 8, 3.35 * Math.sqrt(probability / peak), 0, 2 * Math.PI);
        context.fill();
      }
    }
  }
}

function strongSample(data: WaveData, index: number): Sample {
  const selected = Math.max(0, Math.min(160, index));
  const stats = STRONG_STATS[selected];
  const density = data.strong?.subarray(selected * 961, (selected + 1) * 961) ?? freeWave(0);

  return { key: data.strong ? `strong-${selected}` : 'waiting', side: 31, density, time: data.strong ? selected * .25 : 0, rms: stats?.rms ?? 0, within3: stats?.within3 ?? 1, ready: data.strong !== null };
}

function computedSample(frames: Map<number, WaveFrame>, index: number, name: string): Sample {
  const requested = Math.max(0, Math.min(80, index));
  const available = Math.min(requested, frames.size - 1);
  const frame = frames.get(available);

  if (!frame) return { key: 'waiting', side: 31, density: freeWave(0), time: 0, rms: 0, within3: 1, ready: false };

  return { key: `${name}-${available}`, side: frame.side, density: frame.density, time: frame.time, rms: frame.rms, within3: frame.within3, ready: available === requested };
}

function samplePair(time: number, tall: boolean, data: WaveData): { first: Sample; second: Sample; mix: number; disorder: number; view: number; tag: string } {
  const view = tall ? 21 : 31;

  if (time < 11000) {
    const forward = Math.max(0, Math.min(tall ? 4.5 : 7, (time - 2000) * (tall ? 4.5 / 7000 : 1 / 1000)));
    const model = forward * (1 - ease(time, 9500, 11000));
    const index = Math.floor(model * 20);
    const sample = (i: number): Sample => ({ key: `free-${i}`, side: 31, density: freeWave(i / 20), time: i / 20, rms: i / 10, within3: 0, ready: true });

    return { first: sample(index), second: sample(index + 1), mix: model * 20 - index, disorder: 8 * ease(time, 9500, 11000), view, tag: time < 9500 ? 'NO IMPURITIES · THE WAVE SPREADS' : 'RANDOM ENERGIES · SAME GRID' };
  }

  if (time >= 44500 && time < 52500) {
    const index = Math.min(3, Math.floor((time - 44500) / 1850));
    const state = LOCALIZED_STATES[index] ?? LOCALIZED_STATES[0];
    const sample: Sample = { key: `eigen-${index}`, side: 31, density: state?.density ?? [], time: 0, rms: 0, within3: state?.within3 ?? 0, ready: true };

    return { first: sample, second: sample, mix: 0, disorder: 8, view, tag: 'ONE TRAPPED STATE · ONE SHARP ENERGY' };
  }

  if (time >= 52500 && time < 59500) {
    const sample: Sample = { key: 'standing', side: 31, density: STANDING.density, time: 0, rms: 0, within3: 0, ready: true };

    return { first: sample, second: sample, mix: 0, disorder: 8 * (1 - ease(time, 52500, 54000)), view, tag: 'FREE STANDING WAVE · EXTENDED IN THE BOX' };
  }

  if (time >= 59500 && time < 61500) {
    const frame = (time - 59500) / 2000 * 80;
    const index = Math.floor(frame);

    return { first: computedSample(data.medium, index, 'medium'), second: computedSample(data.medium, index + 1, 'medium'), mix: frame - index, disorder: 8 - 3 * ease(time, 59500, 60000), view, tag: 'h = 5 · A BIGGER TRAP' };
  }

  if (time >= 61500 && time < 84000) {
    const frame = Math.min(80, (time - 61500) / 4500 * 80);
    const index = Math.floor(frame);

    return { first: computedSample(data.weak, index, 'weak'), second: computedSample(data.weak, index + 1, 'weak'), mix: frame - index, disorder: 5 - 3 * ease(time, 61500, 62000), view: view + (201 - view) * ease(time, 62200, 65100), tag: 'h = 2 · STILL SPREADING · LOG DENSITY' };
  }

  const frame = time < 18000 ? Math.max(0, (time - 11000) / 7000 * 160) : 160;
  const index = Math.floor(frame);

  return { first: strongSample(data, index), second: strongSample(data, index + 1), mix: frame - index, disorder: 8, view, tag: 'h = 8 · STRONG DISORDER' };
}

export function drawWaveGrid(pen: CanvasRenderingContext2D, width: number, height: number, time: number, colors: Ink, data: WaveData, label: Label): void {
  const tall = height > width;
  const size = Math.min(width * (tall ? .78 : .43), height * (tall ? .33 : .66));
  const left = width * (tall ? .5 : .265) - size / 2;
  const top = height * (tall ? .065 : .12);
  const center = { x: left + size / 2, y: top + size / 2 };
  const pair = samplePair(time, tall, data);
  const boxScale = 1 - (time >= 99000 && time < 101000 ? ease(time, 99000, 100800) * 2 / 3 : 0);
  const cell = size / pair.view * boxScale;
  const energyY = height * (tall ? .46 : .88);
  const available = pair.first.ready && pair.second.ready;
  const readyText = data.error ? 'WAVE DATA UNAVAILABLE' : 'COMPUTING THIS WAVE…';
  const text = (words: string, x: number, y: number, maxWidth: number, tone = colors.ink, large = false): void => {
    const font = large ? (tall ? 13 : 16) : (tall ? 9 : 11);
    pen.font = large ? `italic ${font}px Alegreya, serif` : `${font}px "Special Elite", monospace`;
    pen.textAlign = 'center';
    pen.textBaseline = 'middle';
    const lines: string[] = [];
    let line = '';

    for (const word of words.split(' ')) {
      const next = line ? `${line} ${word}` : word;

      if (line && pen.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else line = next;
    }

    lines.push(line);

    for (const [index, content] of lines.entries()) {
      const extent = pen.measureText(content).width;
      const px = Math.max(extent / 2 + 5, Math.min(width - extent / 2 - 5, x));
      const py = y + (index - (lines.length - 1) / 2) * (font + 3);
      pen.fillStyle = colors.paper;
      pen.fillRect(px - extent / 2 - 2, py - font / 2 - 2, extent + 4, font + 4);
      pen.fillStyle = tone;
      pen.fillText(content, px, py);
    }
  };
  const stroke = (points: readonly Point[], tone = colors.ink, opacity = 1, weight = 1): void => {
    if (points.length < 2 || opacity < .005) return;

    pen.beginPath();

    for (const [index, p] of points.entries()) {
      if (index === 0) pen.moveTo(p.x, p.y);
      else pen.lineTo(p.x, p.y);
    }

    pen.globalAlpha = opacity;
    pen.strokeStyle = tone;
    pen.lineWidth = weight;
    pen.stroke();
    pen.globalAlpha = 1;
  };
  const site = (x: number, y: number): Point => ({ x: center.x + x * cell, y: center.y + y * cell });
  const proof = time >= 84000 && time < 111000;
  const reveal = ease(time, 0, 1800);
  const half = Math.floor(Math.min(pair.view, 31) / 2);
  const gridAlpha = pair.view > 50 ? 0 : proof ? .2 : .12;

  for (let row = -half; row <= half; row++) {
    const extent = size / 2 * reveal * boxScale;
    stroke([{ x: center.x - extent, y: center.y + row * cell }, { x: center.x + extent, y: center.y + row * cell }], colors.muted, gridAlpha, .5);
    stroke([{ x: center.x + row * cell, y: center.y - extent }, { x: center.x + row * cell, y: center.y + extent }], colors.muted, gridAlpha, .5);
  }

  if (!proof) {
    const cache = cacheFor(pen);

    if (cache.first.key !== pair.first.key && cache.second.key === pair.first.key) {
      [cache.first, cache.second] = [cache.second, cache.first];
    }

    paint(cache.first, pair.first, colors.ink);
    paint(cache.second, pair.second, colors.ink);
    const pixelSize = cache.first.canvas.width;

    if (cache.mixed.width !== pixelSize) {
      cache.mixed.width = pixelSize;
      cache.mixed.height = pixelSize;
    }

    const mixed = cache.mixed.getContext('2d');

    if (mixed) {
      mixed.clearRect(0, 0, pixelSize, pixelSize);
      mixed.globalCompositeOperation = 'source-over';
      mixed.globalAlpha = 1 - pair.mix;
      mixed.drawImage(cache.first.canvas, 0, 0);
      mixed.globalCompositeOperation = 'lighter';
      mixed.globalAlpha = pair.mix;
      mixed.drawImage(cache.second.canvas, 0, 0);
      mixed.globalCompositeOperation = 'source-over';
      mixed.globalAlpha = 1;
      const sourceSize = Math.min(pair.view, pair.first.side) * cache.first.pixels;
      const offset = (pixelSize - sourceSize) / 2;
      pen.globalAlpha = time >= 27000 && time < 35500 ? .22 : 1;
      pen.imageSmoothingEnabled = pair.first.side !== 201;
      pen.drawImage(cache.mixed, offset, offset, sourceSize, sourceSize, left, top, size, size);
      pen.globalAlpha = 1;
      pen.imageSmoothingEnabled = true;
    }
  }

  if (pair.disorder > 0 && pair.view < 50 && data.unit && !proof) {
    for (let y = -half; y <= half; y++) {
      for (let x = -half; x <= half; x++) {
        const value = data.unit[(100 + y) * 201 + 100 + x] ?? 0;
        const p = site(x, y);
        stroke([p, { x: p.x, y: p.y - value * cell * .40 * pair.disorder / 8 }], colors.muted, .35, .6);
      }
    }
  }

  if (time >= 27000 && time < 35500) {
    const scale = (1 - ease(time, 33000, 35000)) * size * .25;
    const levels = Math.min(4, Math.max(0, (time - 27000) / 850));
    const branch = (p: Point, angle: number, spread: number, depth: number, root: boolean): void => {
      if (depth > 4 || depth > levels + 1) return;

      const children = root ? 3 : 2;

      for (let i = 0; i < children; i++) {
        const direction = angle + (i - (children - 1) / 2) * spread;
        const length = scale * .55 ** (depth - 1) * Math.max(0, Math.min(1, levels - depth + 1));
        const q = { x: p.x + Math.cos(direction) * length, y: p.y + Math.sin(direction) * length };
        stroke([p, q], colors.ink, 1, 1.1);
        branch(q, direction, spread * .6, depth + 1, false);
      }
    };
    branch(center, -Math.PI / 2, 2 * Math.PI / 3, 1, true);
    const loop = ease(time, 33500, 35000);
    const a = site(-2, -2);
    const b = site(2, 2);
    stroke([a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }, a], colors.blue, loop, 1.7);
    text(time < 33000 ? 'A TREE WITHOUT LOOPS · DEGREE 3' : 'A GRID HAS LOOPS', center.x, top - 14, width * (tall ? .9 : .47));
  } else if (time >= 92500 && time < 101000) {
    if (!data.unit) {
      text(readyText, center.x, center.y, width * (tall ? .9 : .47), colors.blue);

      return;
    }

    const digits = Math.min(6, Math.max(0, Math.floor((time - 93000) / 900)));
    const h = 1;
    const cleared = digits === 6 && time >= 98500;

    for (let y = -half; y <= half; y++) {
      for (let x = -half; x <= half; x++) {
        const value = data.unit?.[(100 + y) * 201 + 100 + x] ?? 0;
        const low = (cleared ? value : binaryApproximation(value, digits)) * h;
        const high = cleared ? low : low + 2 * h / 2 ** digits;
        const p = site(x, y);

        if ((x + y) % 2 === 0 && digits < 6) {
          pen.beginPath();
          pen.arc(p.x, p.y, cell * .45, 0, 2 * Math.PI);
          pen.fillStyle = colors.blue;
          pen.globalAlpha = .09 * (1 - digits / 6);
          pen.fill();
          pen.globalAlpha = 1;
        }

        stroke([{ x: p.x, y: p.y - low * cell * .4 }, { x: p.x, y: p.y - high * cell * .4 }], colors.muted, .22, 2);
        stroke([p, { x: p.x, y: p.y - low * cell * .4 }], colors.ink, .7, .7);
      }
    }

    for (const horizontal of [true, false]) {
      const p = horizontal ? { x: left, y: center.y } : { x: center.x, y: top };
      const q = horizontal ? { x: left + size, y: center.y } : { x: center.x, y: top + size };
      stroke([{ x: p.x - 4, y: p.y - 4 }, p, { x: p.x + 4, y: p.y + 4 }], colors.blue, .7);
      stroke([{ x: q.x - 4, y: q.y - 4 }, q, { x: q.x + 4, y: q.y + 4 }], colors.blue, .7);
    }

    const pending = time > 96000 && time < 98500;
    const failed = [site(3, -4), site(8, -4), site(8, 1), site(3, 1), site(3, -4)];

    if (pending) {
      stroke(failed, colors.blue, .8);
      stroke([site(3, -4), site(8, 1)], colors.blue, .8);
    }

    if (time >= 99000) {
      const tile = size * boxScale;
      pen.save();
      pen.beginPath();
      pen.rect(left, top, size, size);
      pen.clip();

      for (let copyY = -1; copyY <= 1; copyY++) {
        for (let copyX = -1; copyX <= 1; copyX++) {
          if (copyX === 0 && copyY === 0) continue;

          const cx = center.x + copyX * tile;
          const cy = center.y + copyY * tile;

          for (let row = -half; row <= half; row += 2) {
            stroke([{ x: cx - tile / 2, y: cy + row * cell }, { x: cx + tile / 2, y: cy + row * cell }], colors.muted, .3, .5);
            stroke([{ x: cx + row * cell, y: cy - tile / 2 }, { x: cx + row * cell, y: cy + tile / 2 }], colors.muted, .3, .5);
          }
        }
      }

      pen.restore();
    }

    text('PERIODIC BOX · DRAWN AS A SLICE' , center.x, top - 14, width * (tall ? .9 : .47));
    text(pending ? 'TRIAL ROLLED BACK · PENDING' : digits < 6 ? `DAMPING · ${digits} OF 6 BINARY DIGITS` : time > 99500 ? 'TRUE VALUES · TO THE INFINITE GRID' : 'TRUE VALUES · CLEARED', center.x, top + size + (tall ? 7 : 17), width * (tall ? .9 : .45), colors.blue);
  } else if (time >= 101000 && time < 111000) {
    const progress = ease(time, 101000, 109000);
    const ratio = 2 ** (1 + 7 * progress);
    const outer = size * .46;
    const inner = outer / ratio;

    for (const level of [0, .2, .4, .6, .8, 1]) {
      const radius = inner * ratio ** level;
      const segments: Point[] = [];
      const turn = Math.max(0, Math.min(1, (time - 101000 - level * 1000) / 1000));

      for (let i = 0; i <= Math.ceil(100 * turn); i++) {
        const angle = Math.PI * 2 * i / 100;
        segments.push({ x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) });
      }

      stroke(segments, level === 1 ? colors.blue : colors.ink, level === 1 ? 1 : .55, .7);
    }

    for (let port = 0; port < 6; port++) {
      const angle = port * Math.PI / 3;
      const p = { x: center.x + inner * Math.cos(angle), y: center.y + inner * Math.sin(angle) };
      stroke([{ x: p.x - 1, y: p.y }, { x: p.x + 1, y: p.y }], colors.ink, 1, 2);
    }

    text('PORTS INSIDE · WEAK PROBES OUTSIDE', center.x, top - 14, width * (tall ? .92 : .47));
    text(`R/r₀ = ${ratio.toFixed(ratio < 10 ? 1 : 0)} · COST ${separationCost(ratio).toFixed(2)} → 0`, center.x, top + size + (tall ? 7 : 17), width * (tall ? .94 : .47), colors.blue);
    label('profile', center.x, energyY + (tall ? 9 : 0));
  } else if (time >= 84000 && time < 92500) {
    text('FROM THE WAVE TO A RESOLVENT', center.x, top - 14, width * (tall ? .9 : .47));
    text('THE SAME SITES · NOW A FINITE BOX', center.x, top + size + (tall ? 7 : 17), width * (tall ? .9 : .47), colors.muted);
  } else {
    text(pair.tag, center.x, top - 14, width * (tall ? .94 : .48));

    if (!available) text(readyText, center.x, top + size + (tall ? 7 : 17), width * (tall ? .94 : .47), colors.blue);
    else if (time >= 11000 && (time < 44500 || time >= 111000)) {
      const share = pair.first.within3 * (1 - pair.mix) + pair.second.within3 * pair.mix;
      text(`WITHIN 3 SITES: ${(share * 100).toFixed(0)}%`, center.x, top + size + (tall ? 7 : 17), width * (tall ? .9 : .43), colors.ink);
    } else if (time >= 59500 && time < 84000) {
      const rms = pair.first.rms * (1 - pair.mix) + pair.second.rms * pair.mix;
      const modelTime = pair.first.time * (1 - pair.mix) + pair.second.time * pair.mix;
      text(`TYPICAL DISTANCE: ${rms.toFixed(1)} SITES · t = ${modelTime.toFixed(0)}`, center.x, top + size + (tall ? 7 : 17), width * (tall ? .94 : .47), colors.ink);
    }
  }

  if (time < 101000 || time >= 111000) {
    const axisLeft = left;
    const axisRight = left + size;
    const energyX = (energy: number) => axisLeft + (energy + 14) / 28 * (axisRight - axisLeft);
    stroke([{ x: axisLeft, y: energyY }, { x: axisRight, y: energyY }], colors.muted, .7, .7);

    for (const energy of [-12, 0, 12]) {
      const x = energyX(energy);
      stroke([{ x, y: energyY - 3 }, { x, y: energyY + 3 }], colors.muted, .7);
      text(String(energy), x, energyY + 12, 30, colors.muted);
    }

    if (time >= 44500 && time < 52500) {
      const count = Math.min(4, Math.floor((time - 44500) / 1850) + 1);

      for (const state of LOCALIZED_STATES.slice(0, count)) stroke([{ x: energyX(state.energy), y: energyY - 10 }, { x: energyX(state.energy), y: energyY }], colors.ink, 1, 1.5);

      const many = ease(time, 51000, 52500);

      for (const energy of EIGENVALUES) stroke([{ x: energyX(energy), y: energyY - 5 }, { x: energyX(energy), y: energyY }], colors.ink, many * .16, .5);
    } else if (time >= 52500 && time < 59500) {
      stroke([{ x: energyX(-4), y: energyY - 4 }, { x: energyX(4), y: energyY - 4 }], colors.blue, 1, 6);
    }

    if (!tall) text('ENERGY', center.x, energyY + 27, size, colors.muted);
  }
}

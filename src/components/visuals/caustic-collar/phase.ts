import { smooth } from '../../../lib/animation';
import { shotAt, type PhasePortrait } from './math';
import type { CausticData, TableKind } from './data';
import { layout } from './story';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type Label = (id: string, x: number, y: number, opacity?: number) => void;

type Raster = { canvas: HTMLCanvasElement; pen: CanvasRenderingContext2D; key: string; count: number };

const rasters = new WeakMap<PhasePortrait, Raster>();

function words(pen: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, colors: Colors, size: number): void {
  pen.font = `${size}px "Special Elite", monospace`;
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  const lines: string[] = [];

  for (const paragraph of text.split('\n')) {
    let line = '';

    for (const word of paragraph.split(' ')) {
      const next = line ? `${line} ${word}` : word;

      if (line && pen.measureText(next).width > width) {
        lines.push(line);
        line = word;
      } else line = next;
    }

    lines.push(line);
  }

  for (const [index, line] of lines.entries()) {
    const row = y + (index - (lines.length - 1) / 2) * (size + 3);
    const extent = pen.measureText(line).width;
    pen.fillStyle = colors.paper;
    pen.fillRect(x - extent / 2 - 2, row - size * .65, extent + 4, size * 1.3);
    pen.fillStyle = colors.ink;
    pen.fillText(line, x, row);
  }
}

function portraitImage(portrait: PhasePortrait, width: number, height: number, density: number, count: number, ink: string): HTMLCanvasElement | null {
  const pixelsWide = Math.max(1, Math.round(width * density));
  const pixelsHigh = Math.max(1, Math.round(height * density));
  const key = `${pixelsWide}:${pixelsHigh}:${ink}`;
  let cache = rasters.get(portrait);

  if (!cache) {
    const canvas = document.createElement('canvas');
    const pen = canvas.getContext('2d');

    if (!pen) return null;

    cache = { canvas, pen, key: '', count: 0 };
    rasters.set(portrait, cache);
  }

  if (cache.key !== key || count < cache.count) {
    cache.canvas.width = pixelsWide;
    cache.canvas.height = pixelsHigh;
    cache.key = key;
    cache.count = 0;
  }

  cache.pen.fillStyle = ink;

  for (let index = cache.count; index < count; index++) {
    const position = portrait.points[index * 2] ?? 0;
    const angle = portrait.points[index * 2 + 1] ?? 0;
    const x = Math.max(0, Math.min(pixelsWide - 1, Math.round(position * (pixelsWide - 1))));
    const y = Math.max(0, Math.min(pixelsHigh - 1, Math.round((1 - angle / Math.PI) * (pixelsHigh - 1))));
    cache.pen.fillRect(x, y, 1, 1);
    cache.pen.fillRect(x, pixelsHigh - 1 - y, 1, 1);
  }

  cache.count = count;

  return cache.canvas;
}

function portraitKind(time: number): TableKind {
  if (time < 40500) return 'ellipse';
  if (time < 81000) return 'wobble';
  if (time < 86800) return 'ellipse';
  if (time < 90200) return 'wobble';

  return 'ellipse';
}

export function drawPhase(pen: CanvasRenderingContext2D, width: number, height: number, density: number, time: number, colors: Colors, _label: Label, data: CausticData): void {
  const { phase: box, tall } = layout(width, height);
  const plot = { x: box.x + (tall ? 24 : 35), y: box.y + (tall ? 18 : 37), w: box.w - (tall ? 28 : 43), h: box.h - (tall ? 39 : 73) };
  const kind = portraitKind(time);
  const name = kind === 'ellipse' ? 'ELLIPSE' : '1% WOBBLE';
  const size = tall ? 7 : 10;
  const visible = smooth(time, 15500, 16800);
  const title = time < 15500 ? 'EVERY BOUNCE WILL LEAVE A DOT' : time >= 22500 && time < 38000 ? 'ELLIPSE · OVALS DO NOT GO ROUND' : `${name} · THE PHASE CYLINDER`;
  words(pen, title, box.x + box.w / 2, box.y + 5, box.w, colors, tall ? 8 : 12);

  if (time < 15500) return;

  pen.strokeStyle = colors.muted;
  pen.lineWidth = .6;
  pen.beginPath();
  pen.moveTo(plot.x, plot.y);
  pen.lineTo(plot.x, plot.y + plot.h);
  pen.lineTo(plot.x + plot.w * visible, plot.y + plot.h);
  pen.stroke();
  pen.setLineDash([2, 3]);
  pen.beginPath();
  pen.moveTo(plot.x + plot.w, plot.y);
  pen.lineTo(plot.x + plot.w, plot.y + plot.h);
  pen.stroke();
  pen.setLineDash([]);
  words(pen, 'ANGLE ↑', plot.x + 13, plot.y - 5, 65, colors, tall ? 6 : 8);
  words(pen, 'RIM POSITION → · 0 AND 1 JOIN', box.x + box.w / 2, box.y + box.h - 5, box.w, colors, size);

  for (const [fraction, text] of [[0, '0'], [.5, 'π/2'], [1, 'π']] as const) {
    words(pen, text, plot.x - (tall ? 13 : 19), plot.y + plot.h * (1 - fraction), 28, colors, size);
  }

  for (const fraction of [0, .5, 1]) words(pen, String(fraction), plot.x + plot.w * fraction, plot.y + plot.h + 9, 25, colors, size);

  if (time < 22500) {
    const orbit = data.launches.get('ellipse')?.get(.45);
    const shot = shotAt(time);

    if (orbit) {
      const count = Math.min(orbit.phase.length / 2, Math.floor(shot.impact) + 1);
      pen.fillStyle = colors.ink;

      for (let index = 0; index < count; index++) {
        const s = orbit.phase[index * 2] ?? 0;
        const angle = orbit.phase[index * 2 + 1] ?? 0;
        const x = plot.x + s * plot.w;
        const y = plot.y + (1 - angle / Math.PI) * plot.h;
        pen.fillRect(Math.round(x * density) / density, Math.round(y * density) / density, 1 / density, 1 / density);
      }
    }
  } else {
    const portrait = data.portraits.get(kind);

    if (portrait) {
      const start = kind === 'wobble' && time < 80000 ? 40500 : time < 38000 ? 22500 : 0;
      const progress = start ? smooth(time, start, start + (kind === 'wobble' ? 4200 : 6200)) : 1;
      const count = Math.floor(portrait.points.length / 2 * progress);
      const image = portraitImage(portrait, plot.w, plot.h, density, count, colors.ink);

      if (image) {
        pen.imageSmoothingEnabled = false;
        const x = Math.round(plot.x * density) / density;
        const y = Math.round(plot.y * density) / density;
        pen.drawImage(image, x, y, image.width / density, image.height / density);
      }
    } else words(pen, data.error ? 'COMPUTATION FAILED' : 'COMPUTING REFLECTIONS', box.x + box.w / 2, plot.y + plot.h / 2, plot.w, colors, size);
  }

  if (time >= 58500 && time < 80000) {
    const band = plot.h * (.20 - .15 * smooth(time, 58500, 65000));
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .7;
    pen.beginPath();
    pen.moveTo(plot.x + plot.w - 5, plot.y + plot.h - band);
    pen.lineTo(plot.x + plot.w + 4, plot.y + plot.h - band);
    pen.lineTo(plot.x + plot.w + 4, plot.y + plot.h);
    pen.lineTo(plot.x + plot.w - 5, plot.y + plot.h);
    pen.stroke();

    if (!tall) words(pen, 'ASSUMED GAP-FREE BAND · SCHEMATIC', plot.x + plot.w / 2, plot.y + plot.h - band - 13, plot.w, colors, 9);
  }

  if (!tall && time >= 22500 && time < 38000) {
    words(pen, 'OVALS DO NOT GO ROUND · HYPERBOLIC CAUSTICS', box.x + box.w / 2, box.y + box.h + 13, box.w, colors, 9);
  }
}

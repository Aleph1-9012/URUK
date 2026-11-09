import { mix, progress, smooth } from '../../../lib/animation';
import { COUNTING_THRESHOLDS, DECK_LAW, ENERGY, ONE_CARD_TV, PERMUTATION_COUNT } from './data';
import { gridStepAt } from './motion';
import type { Box } from './story';

type Tone = 'ink' | 'blue' | 'muted' | 'paper';

type Colors = Record<Tone, string>;

type Place = (id: string, x: number, y: number, opacity?: number) => void;

type Point = { x: number; y: number };

const supportImages = new Map<string, HTMLCanvasElement>();

function text(pen: CanvasRenderingContext2D, words: string, x: number, y: number, size: number, colors: Colors, maxWidth: number, tone: Tone = 'ink', align: CanvasTextAlign = 'center'): void {
  pen.font = `${size}px "Special Elite"`;
  pen.textAlign = align;
  pen.textBaseline = 'middle';
  const lines: string[] = [];

  for (const supplied of words.split('\n')) {
    let line = '';

    for (const word of supplied.split(' ')) {
      const next = line ? `${line} ${word}` : word;

      if (line && pen.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }

    lines.push(line);
  }

  for (const [index, line] of lines.entries()) {
    const width = pen.measureText(line).width;
    const top = y + index * (size + 3);
    const left = align === 'left' ? x : align === 'right' ? x - width : x - width / 2;
    pen.fillStyle = colors.paper;
    pen.fillRect(left - 2, top - size / 2 - 1, width + 4, size + 2);
    pen.fillStyle = colors[tone];
    pen.fillText(line, x, top);
  }
}

function claimed(pen: CanvasRenderingContext2D, before: string, after: string, x: number, y: number, size: number, colors: Colors): void {
  pen.font = `${size}px "Special Elite"`;
  const first = pen.measureText(before).width;
  const middle = pen.measureText('CLAIMED').width;
  const last = pen.measureText(after).width;
  const left = x - (first + middle + last) / 2;
  text(pen, before, left, y, size, colors, first, 'ink', 'left');
  text(pen, 'CLAIMED', left + first, y, size, colors, middle, 'blue', 'left');
  const gap = pen.measureText(after.slice(0, after.length - after.trimStart().length)).width;
  if (after) text(pen, after.trimStart(), left + first + middle + gap, y, size, colors, last, 'ink', 'left');
}

function line(pen: CanvasRenderingContext2D, start: Point, end: Point, amount = 1): void {
  pen.beginPath();
  pen.moveTo(start.x, start.y);
  pen.lineTo(mix(start.x, end.x, amount), mix(start.y, end.y, amount));
  pen.stroke();
}

function curve(pen: CanvasRenderingContext2D, points: readonly Point[], shown: number): void {
  const first = points[0];

  if (!first) return;

  pen.beginPath();
  pen.moveTo(first.x, first.y);

  for (let index = 1; index < points.length; index++) {
    const previous = points[index - 1];
    const point = points[index];

    if (!point || !previous) continue;

    const amount = Math.max(0, Math.min(1, shown - index + 1));
    pen.lineTo(mix(previous.x, point.x, amount), mix(previous.y, point.y, amount));

    if (amount < 1) break;
  }

  pen.stroke();
}

function distance(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, labels = true): void {
  const small = box.h < 150;
  const plot = { x: box.x + (labels ? 27 : 2), y: box.y + (labels ? 14 : 3), w: box.w - (labels ? 40 : 5), h: box.h - (labels ? 33 : 7) };
  const point = (t: number, value: number): Point => ({ x: plot.x + t / 12 * plot.w, y: plot.y + (1 - value) * plot.h });
  const shown = time < 28250 ? progress(time, 21000, 27000) * 12 : 12;
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .6;
  line(pen, point(0, 1), point(0, 0));
  line(pen, point(0, 0), point(12, 0));
  pen.setLineDash([3, 3]);
  line(pen, point(0, .25), point(12, .25));
  pen.setLineDash([]);
  const whole = DECK_LAW.map(({ t, tv }) => point(t, tv));
  const one = ONE_CARD_TV.map((value, t) => point(t, value));
  const bound = DECK_LAW.map(({ t, countingBound }) => point(t, countingBound));
  pen.strokeStyle = colors.ink;
  pen.lineWidth = labels ? 1.6 : .8;
  curve(pen, whole, shown);
  pen.lineWidth = 1;
  pen.setLineDash([4, 3]);
  curve(pen, one, shown);
  pen.setLineDash([]);

  if (time >= 35750) {
    pen.lineWidth = .9;
    pen.setLineDash([1, 3]);
    curve(pen, bound, shown);
    pen.setLineDash([]);
  }

  if (!labels) return;

  text(pen, 'DISTANCE FROM UNIFORM · 8 CARDS', box.x + box.w / 2, box.y - 3, small ? 10 : 12, colors, box.w);

  for (const value of [0, .25, 1]) {
    const at = point(0, value);
    text(pen, value === .25 ? '¼' : String(value), at.x - 7, at.y, 10, colors, 25, 'ink', 'right');
  }

  for (const t of [0, 3, 6, 9, 12]) {
    const at = point(t, 0);
    text(pen, String(t), at.x, at.y + 11, 10, colors, 22);
  }

  text(pen, 'SHUFFLES', box.x + box.w / 2, box.y + box.h - 1, 10, colors, box.w);
  text(pen, '40,320 ORDERS\nEXACT', plot.x + plot.w * .78, plot.y + plot.h * .25, 10, colors, plot.w * .48);
  const y = box.y + box.h + 12;
  const center = box.x + box.w / 2;
  pen.lineWidth = 1.6;
  line(pen, { x: center - 110, y }, { x: center - 94, y });
  text(pen, 'DECK', center - 73, y, 10, colors, 45);
  pen.lineWidth = 1;
  pen.setLineDash([4, 3]);
  line(pen, { x: center - 43, y }, { x: center - 27, y });
  pen.setLineDash([]);
  text(pen, 'ONE CARD', center + 5, y, 10, colors, 65);

  if (time >= 35750) {
    pen.setLineDash([1, 3]);
    line(pen, { x: center + 48, y }, { x: center + 62, y });
    pen.setLineDash([]);
    text(pen, 'BOUND', center + 88, y, 10, colors, 45);
  }
}

function supportImage(support: number, colors: Colors): HTMLCanvasElement {
  const key = `${support}|${colors.ink}|${colors.paper}`;
  const cached = supportImages.get(key);

  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 210;
  const pen = canvas.getContext('2d');

  if (pen) {
    pen.fillStyle = colors.paper;
    pen.fillRect(0, 0, 192, 210);
    pen.fillStyle = colors.ink;
    const rows = Math.floor(support / 192);
    pen.fillRect(0, 0, 192, rows);
    pen.fillRect(0, rows, support % 192, 1);
  }

  supportImages.set(key, canvas);

  return canvas;
}

function supportGrid(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, labels = true): void {
  const t = gridStepAt(time);
  const row = DECK_LAW[t];

  if (!row) return;

  const scale = Math.min(box.w / 192, box.h / 210, 1);
  const width = 192 * scale;
  const height = 210 * scale;
  const x = box.x + (box.w - width) / 2;
  const y = box.y + (box.h - height) / 2;
  pen.imageSmoothingEnabled = false;
  pen.drawImage(supportImage(row.support, colors), x, y, width, height);
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  pen.strokeRect(x, y, width, height);

  if (labels) {
    text(pen, `t = ${t} · ONE CELL PER ORDER`, box.x + box.w / 2, y - 11, box.w < 220 ? 10 : 11, colors, Math.max(box.w, 205));
    const label = row.support === PERMUTATION_COUNT ? 'ALL REACHABLE · UNEQUAL CHANCES' : `${row.support.toLocaleString('en-US')} / 40,320 REACHABLE`;
    text(pen, label, box.x + box.w / 2, y + height + 12, box.w < 220 ? 10 : 11, colors, Math.max(box.w, 205));
  }
}

function thresholds(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, labels = true): void {
  const plot = { x: box.x + 28, y: box.y + 14, w: box.w - 40, h: box.h - 49 };
  const point = (d: number, t: number): Point => ({ x: plot.x + d / 20 * plot.w, y: plot.y + (1 - t / 40) * plot.h });
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .6;
  line(pen, point(0, 40), point(0, 0));
  line(pen, point(0, 0), point(20, 0));
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  line(pen, point(3, 4), point(20, 38), progress(time, 42000, 43700));
  const revealed = progress(time, 41500, 43800) * COUNTING_THRESHOLDS.length;

  for (const [index, threshold] of COUNTING_THRESHOLDS.entries()) {
    if (index > revealed) continue;

    const at = point(index + 1, threshold);
    pen.fillStyle = colors.ink;
    pen.beginPath();
    pen.arc(at.x, at.y, 1.7, 0, Math.PI * 2);
    pen.fill();
  }

  if (time >= 52000) {
    pen.strokeStyle = colors.blue;
    pen.lineWidth = 1.6;
    pen.setLineDash([4, 3]);
    line(pen, point(0, 0), point(40 / 1600, 40), progress(time, 52000, 53100));
    pen.setLineDash([]);

    if (labels) {
      text(pen, '1600d', plot.x + 9, plot.y + 6, 11, colors, 70, 'ink', 'left');

      if (box.w >= 220) text(pen, 'CLAIMED', plot.x + 9, plot.y + 21, 10, colors, 70, 'blue', 'left');
    }
  }

  if (!labels) return;

  text(pen, 'COUNTING: t ≥ 2d − 2', box.x + box.w / 2, box.y - 3, box.h < 150 ? 11 : 13, colors, box.w);
  text(pen, 't', box.x + 3, plot.y + plot.h / 2, 11, colors, 16);

  for (const t of [0, 20, 40]) {
    const at = point(0, t);
    text(pen, String(t), at.x - 6, at.y + 1, 10, colors, 25, 'ink', 'right');
  }

  for (const d of [0, 5, 10, 15, 20]) {
    const at = point(d, 0);
    text(pen, String(d), at.x, at.y + 11, 10, colors, 24, 'ink', d === 20 ? 'right' : 'center');
  }

  text(pen, 'd', box.x + box.w - 2, plot.y + plot.h + 11, 11, colors, 16, 'ink', 'right');

  if (box.w >= 220 && time >= 52000 && time < 59500) text(pen, 'ONLY DECKS OF 2ᵈ CARDS', box.x + box.w / 2, box.y + box.h - 2, 10, colors, box.w);
}

function countingPanel(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  if (box.h < 150) {
    const thumbnail = { x: box.x, y: box.y + 16, w: box.w * .30, h: box.h * .50 };
    distance(pen, thumbnail, time, colors, false);
    text(pen, 'WHOLE DECK', thumbnail.x + thumbnail.w / 2, box.y + 4, 10, colors, box.w * .3);
    thresholds(pen, { x: box.x + box.w * .35, y: box.y, w: box.w * .65, h: box.h }, time, colors);

    if (time >= 52000) claimed(pen, '', ' · ONLY DECKS OF 2ᵈ CARDS', box.x + box.w / 2, box.y + box.h - 2, 9, colors);

    return;
  }

  distance(pen, { x: box.x, y: box.y, w: box.w, h: box.h * .46 }, time, colors);
  thresholds(pen, { x: box.x, y: box.y + box.h * .58, w: box.w, h: box.h * .42 }, time, colors);
}

function energy(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const plot = { x: box.x + 39, y: box.y + 14, w: box.w - 51, h: box.h - 32 };
  const point = (t: number, value: number): Point => ({ x: plot.x + t / 9 * plot.w, y: plot.y - Math.log10(value) / 5 * plot.h });
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .6;
  line(pen, { x: plot.x, y: plot.y }, { x: plot.x, y: plot.y + plot.h });
  line(pen, { x: plot.x, y: plot.y + plot.h }, { x: plot.x + plot.w, y: plot.y + plot.h });

  for (const exponent of [0, 1, 3, 5]) {
    const y = plot.y + exponent / 5 * plot.h;
    pen.setLineDash([1, 4]);
    line(pen, { x: plot.x, y }, { x: plot.x + plot.w, y });
    pen.setLineDash([]);
    text(pen, exponent === 0 ? '1' : exponent === 1 ? '10⁻¹' : exponent === 3 ? '10⁻³' : '10⁻⁵', plot.x - (exponent === 0 ? 32 : 6), y, 10, colors, 35, 'ink', 'right');
  }

  const points = ENERGY.map((value, t) => point(t, value));
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.7;
  const shown = progress(time, 94250, 98800) * 9;
  curve(pen, points, shown);

  for (const [index, at] of points.entries()) {
    if (index > shown) continue;

    pen.fillStyle = colors.ink;
    pen.beginPath();
    pen.arc(at.x, at.y, 1.8, 0, Math.PI * 2);
    pen.fill();
  }

  text(pen, 'ENERGY · 8 CARDS, ONE EXPOSED · EXACT', box.x + box.w / 2, box.y - 3, box.h < 150 ? 10 : 12, colors, box.w + 10);

  for (const t of [0, 3, 6, 9]) {
    const at = point(t, 1e-5);
    text(pen, String(t), at.x, plot.y + plot.h + 11, 10, colors, 22);
  }

  text(pen, 'SHUFFLES', box.x + box.w / 2, box.y + box.h + 8, 10, colors, box.w);
}

export function drawChart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place): void {
  if (time < 21000) return;

  pen.save();

  if (time < 35750) {
    distance(pen, box, time, colors);
  } else if (time < 41500) {
    supportGrid(pen, box, time, colors);
  } else if (time < 59500) {
    const change = smooth(time, 41500, 43000);

    if (change < 1) {
      supportGrid(pen, { x: mix(box.x, box.x + box.w - 18, change), y: mix(box.y, box.y - 19, change), w: mix(box.w, 18, change), h: mix(box.h, 20, change) }, time, colors, false);
    }

    if (time >= 43000) {
      const formulaRoom = 24 * (1 - smooth(time, 44000, 44600));
      countingPanel(pen, { ...box, h: box.h - formulaRoom }, time, colors);

      if (time < 44000) place('counting', box.x + box.w / 2, box.y + box.h - 3);
    }
  } else if (time < 94250) {
    const residuals = time >= 85750;
    const thumbnail = { x: box.x + box.w * .58, y: box.y + box.h * (residuals ? .12 : .13), w: box.w * .40, h: box.h * (residuals ? .40 : .62) };
    distance(pen, thumbnail, time, colors, false);

    if (residuals) {
      text(pen, '111: +3/28\nOTHER 6: −1/56', box.x + box.w * .25, box.y + box.h * .17, 11, colors, box.w * .5);
      place('energy', box.x + box.w * .50, box.y + box.h * .80);
    } else {
      if (time < 76000) text(pen, 'WHOLE DECK', thumbnail.x + thumbnail.w / 2, thumbnail.y - 7, 10, colors, box.w);
      text(pen, 'EXACT LAW\nn = 8, d = 3', box.x + box.w * .25, box.y + box.h * .30, 11, colors, box.w * .5);
    }
  } else {
    energy(pen, box, time, colors);
  }

  pen.restore();
}

function exponentLedger(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const small = box.w < 400;
  const plot = { x: box.x + box.w * .08, y: box.y + box.h * .53, w: box.w * .84 };
  const at = (exponent: number): number => plot.x + (exponent - 1) / 43 * plot.w;
  const pointer = time < 30600 ? 44 : time < 33200 ? mix(44, 29, smooth(time, 30600, 32200)) : mix(29, 3, smooth(time, 33200, 35100));
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .8;
  line(pen, { x: plot.x, y: plot.y }, { x: plot.x + plot.w, y: plot.y }, progress(time, 28250, 29600));
  text(pen, time < 44000 ? 'KNOWN UPPER BOUNDS: POWER OF d' : 'POWER OF d: KNOWN AND CLAIMED', box.x + box.w / 2, box.y + 5, small ? 10 : 12, colors, box.w);

  for (const exponent of [1, 3, 29, 44]) {
    const x = at(exponent);
    line(pen, { x, y: plot.y - 3 }, { x, y: plot.y + 4 });
    text(pen, exponent === 1 && time < 44000 ? '1 ?' : String(exponent), x, plot.y + (exponent === 1 ? 15 : -12), small ? 11 : 13, colors, 30);
  }

  text(pen, '2005', at(44), plot.y + 15, 10, colors, 35);
  pen.strokeStyle = colors.muted;
  line(pen, { x: at(3), y: plot.y + 5 }, { x: at(3) + 23, y: plot.y + 9 });
  text(pen, '2013', at(3) + 23, plot.y + 15, 10, colors, 35);
  const x = at(time >= 44000 ? mix(3, 1, smooth(time, 44000, 45400)) : pointer);
  pen.strokeStyle = colors.ink;
  pen.fillStyle = colors.paper;
  pen.lineWidth = 1.2;
  pen.beginPath();
  pen.moveTo(x, plot.y - 5);
  pen.lineTo(x + 4, plot.y);
  pen.lineTo(x, plot.y + 5);
  pen.lineTo(x - 4, plot.y);
  pen.closePath();
  pen.fill();
  pen.stroke();

  if (time >= 44000) {
    pen.strokeStyle = colors.blue;
    pen.lineWidth = 1.2;
    pen.setLineDash([4, 3]);
    line(pen, { x: at(1), y: plot.y - 5 }, { x: at(1), y: plot.y + 6 }, progress(time, 44000, 45300));
    pen.setLineDash([]);
    claimed(pen, 'Θ(d) · ', ' · 12 PAPERS', box.x + box.w / 2, box.y + box.h - 1, small ? 10 : 12, colors);
  }
}

function blocksLedger(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const small = box.w < 400;
  const start = box.x + 5;
  const width = box.w - 10;
  const y = box.y + box.h * .46;
  const shown = progress(time, 101000, 106700) * 8;
  text(pen, 'EIGHT BLOCKS · SCHEMATIC', box.x + box.w / 2, box.y + 5, small ? 11 : 13, colors, box.w);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;

  for (let block = 0; block < 8; block++) {
    const part = Math.max(0, Math.min(1, shown - block));
    const from = start + block / 8 * width;
    const to = start + (block + 1) / 8 * width;
    line(pen, { x: from, y }, { x: to, y }, part);

    if (part <= 0) continue;

    line(pen, { x: from, y: y - 3 }, { x: from, y: y + 4 });
    text(pen, '200d', (from + to) / 2, y + (block % 2 === 0 ? -11 : 14), small ? 10 : 12, colors, width / 8);
  }

  if (shown >= 8) {
    line(pen, { x: start + width, y: y - 3 }, { x: start + width, y: y + 4 });
    claimed(pen, '8 × 200d = 1600d · ', '', box.x + box.w / 2, box.y + box.h - 3, small ? 11 : 13, colors);
  }
}

function finalLedger(pen: CanvasRenderingContext2D, box: Box, colors: Colors): void {
  const small = box.w < 400;

  if (small) {
    text(pen, 'LOWER 2d − O(1)', box.x + box.w / 2, box.y + 7, 11, colors, box.w);
    claimed(pen, 'UPPER 1600d · ', '', box.x + box.w / 2, box.y + 25, 11, colors);
    text(pen, 'UNREVIEWED', box.x + box.w / 2, box.y + 44, 11, colors, box.w);
  } else {
    claimed(pen, 'LOWER 2d − O(1) · UPPER 1600d ', ' · UNREVIEWED', box.x + box.w / 2, box.y + box.h * .6, 13, colors);
  }
}

export function drawLedger(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  if (time < 28250) return;

  pen.save();

  if (time < 101000) {
    exponentLedger(pen, box, time, colors);
  } else if (time < 108000) {
    blocksLedger(pen, box, time, colors);
  } else {
    finalLedger(pen, box, colors);
  }

  pen.restore();
}

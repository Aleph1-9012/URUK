import { mix, smooth } from '../../../lib/animation';
import { type Box, type Colors, type Place, type Point, RECORDS, butterflyBox, historyChartBox, leafDestination, line, recordPoint, runtimeChartBox, runtimePoint, text } from './drawing';
import type { DigitModel } from './math';
import { butterflyProgress, claimProgress, historyProgress, modernProgress, recursionLevel, tapeProgress, zoomProgress } from './story';

function earlyStatus(model: DigitModel, time: number): { title: string; caption: string; note?: string } {
  if (time < 10000) return { title: '64 DIGIT PRODUCTS', caption: 'EVERY DIGIT MEETS EVERY OTHER DIGIT', note: 'THE SAME DECIMAL PRODUCT' };
  if (time < 20250) return { title: 'KOLMOGOROV 1960: NOTHING FASTER?', caption: 'KARATSUBA FOUND A WAY WITHIN A WEEK', note: 'SPLIT BOTH NUMBERS IN HALF' };
  if (time < 23000) return { title: 'THREE INSTEAD OF FOUR', caption: 'THE MIDDLE PRODUCT USES THE SUMS', note: 'SUBTRACT THE TWO OUTSIDE PRODUCTS' };

  const clock = recursionLevel(time);
  const level = Math.min(2, Math.floor(clock));
  const count = 3 ** (level + 1);

  if (clock > level && clock < 2) return { title: `${count} PRODUCTS BECOME ${count * 3}`, caption: 'SPLIT EACH MULTIPLICATION AGAIN', note: 'SMALL PRODUCTS · CARRIED SUMS INCLUDED' };

  return { title: `${count} SMALL PRODUCTS`, caption: count === model.leaves.length ? `${model.carriedCount} WITH A CARRIED DIGIT · THE SAME PRODUCT` : 'SPLIT EACH MULTIPLICATION AGAIN', note: 'SMALL PRODUCTS · CARRIED SUMS INCLUDED' };
}

function historicalPoint(box: Box, year: number, time: number, tall: boolean): Point {
  const point = recordPoint(box, year, tall);
  const origin = recordPoint(box, 1962, tall);
  const destination = leafDestination(box, time, tall);
  const amount = zoomProgress(time);
  const scale = mix(1, tall ? .15 : .30, amount);

  return { x: destination.x + (point.x - origin.x) * scale, y: destination.y + (point.y - origin.y) * scale };
}

function recordLabel(pen: CanvasRenderingContext2D, box: Box, year: number, colors: Colors, place: Place, tall: boolean): void {
  const point = recordPoint(box, year, tall);
  const plot = historyChartBox(box, tall);
  const size = tall ? 9 : 12;
  const yearX = point.x + (year >= 2007 ? -34 : 24);
  const boundX = point.x + (year >= 2007 ? -80 : tall ? 85 : 125);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .5;
  line(pen, point.x + (year >= 2007 ? -3 : 3), point.y, yearX + (year >= 2007 ? 17 : -17), point.y);
  text(pen, `${year}`, yearX, point.y, size, 36, colors);

  if (year === 1960) place('school-bound', boundX, point.y);
  if (year === 1962) place('karatsuba-bound', boundX, point.y);
  if (year === 1963) text(pen, 'TOOM–COOK', point.x + (tall ? 87 : 139), point.y, tall ? 8.5 : 12, plot.w * .58, colors);
  if (year === 1971) place('ss-bound', point.x + (tall ? 100 : 165), point.y);
  if (year === 2007) text(pen, 'FÜRER', boundX, point.y, tall ? 8.5 : 12, 62, colors);
  if (year === 2019) place('hv-bound', boundX, point.y);
}

function history(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, tall: boolean): void {
  const maximum = time < 42750 ? historyProgress(time) * 3 : 3 + modernProgress(time) * 2;
  const zoom = zoomProgress(time);
  const plot = historyChartBox(box, tall);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = tall ? 1 : 1.4;

  for (let index = 0; index < RECORDS.length; index++) {
    const record = RECORDS[index];

    if (!record || index > Math.ceil(maximum)) continue;

    const point = historicalPoint(box, record.year, time, tall);

    if (index > 0) {
      const previous = RECORDS[index - 1];

      if (!previous) throw new Error('Each historical step has its preceding record.');

      const start = historicalPoint(box, previous.year, time, tall);
      const amount = Math.min(1, Math.max(0, maximum - index + 1));
      line(pen, start.x, start.y, point.x, start.y, Math.min(1, amount * 2));

      if (amount > .5) line(pen, point.x, start.y, point.x, point.y, (amount - .5) * 2);
    }

    if (index <= Math.floor(maximum)) {
      pen.fillStyle = colors.ink;
      pen.beginPath();
      pen.arc(point.x, point.y, tall ? 1.4 : 2, 0, Math.PI * 2);
      pen.fill();

      if (zoom === 0) recordLabel(pen, box, record.year, colors, place, tall);
    }
  }

  if (zoom === 0) text(pen, 'STEP HEIGHTS SCHEMATIC · YEARS TO SCALE', plot.x + plot.w / 2, plot.y + plot.h + (tall ? 16 : 24), tall ? 8 : 11, box.w - 6, colors);

  if (zoom > 0) {
    const destination = leafDestination(box, time, tall);
    text(pen, '1962', destination.x, destination.y - (tall ? 17 : 23), tall ? 9 : 12, 42, colors);
    text(pen, '27 PRODUCTS', destination.x, destination.y + (tall ? 18 : 25), tall ? 8 : 11, tall ? 80 : 110, colors);
  }
}

function runtime(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, tall: boolean): void {
  const amount = zoomProgress(time);

  if (amount === 0) return;

  const finalPlot = runtimeChartBox(box, tall);
  const seed = historicalPoint(box, 2019, time, tall);
  const plot = { x: mix(seed.x, finalPlot.x, amount), y: mix(seed.y, finalPlot.y, amount), w: finalPlot.w * amount, h: finalPlot.h * amount };
  const baseline = runtimePoint(8, 1, plot);
  const end = runtimePoint(64, 1, plot);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .6;
  line(pen, plot.x, plot.y, plot.x, plot.y + plot.h);
  line(pen, plot.x, plot.y + plot.h, plot.x + plot.w, plot.y + plot.h);
  pen.lineWidth = tall ? 1.2 : 1.6;
  line(pen, baseline.x, baseline.y, end.x, end.y);

  if (time >= 58000) {
    // The exact saving is below representable canvas precision. The stable gap is reported separately.
    pen.strokeStyle = colors.blue;
    pen.lineWidth = tall ? 1.8 : 2.3;
    pen.setLineDash(tall ? [4, 3] : [6, 4]);
    line(pen, baseline.x, baseline.y, end.x, end.y, claimProgress(time));
    pen.setLineDash([]);
  }

  if (amount !== 1) return;

  pen.strokeStyle = colors.ink;
  pen.lineWidth = .6;

  for (const ratio of [.98, 1, 1.02]) {
    const point = runtimePoint(8, ratio, plot);
    line(pen, plot.x - 3, point.y, plot.x, point.y);
    text(pen, ratio === 1 ? '1' : ratio.toFixed(2), plot.x - 6, point.y, tall ? 8.5 : 11, 29, colors, 'right');
  }

  for (const log2n of [8, 32, 64]) {
    const point = runtimePoint(log2n, .98, plot);
    line(pen, point.x, point.y, point.x, point.y + 3);
    text(pen, `${log2n}`, point.x, point.y + (tall ? 12 : 17), tall ? 8.5 : 11, 25, colors);
  }

  place('ratio-bound', plot.x + plot.w / 2, plot.y - (tall ? 15 : 22));

  if (tall || box.h < 460) {
    line(pen, plot.x + plot.w - 9, plot.y + plot.h - 6, plot.x + plot.w, plot.y + plot.h);
    place('ratio-axis', plot.x + plot.w - (tall ? 22 : 30), plot.y + plot.h - (tall ? 14 : 15));
  } else place('ratio-axis', plot.x + plot.w + 8, plot.y + plot.h + 35);

  const legendY = plot.y + plot.h + (tall ? 24 : box.h < 460 ? 38 : 42);
  place('hv-bound', box.x + box.w * .20, legendY);
  place('claim-bound', box.x + box.w * .68, legendY);
}

function butterfly(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: DigitModel, tall: boolean): void {
  if (time < 42750) return;

  const plot = butterflyBox(box, tall);
  const maximum = butterflyProgress(time) * model.fftLevels.length;
  const current = Math.min(model.fftLevels.length - 1, Math.floor(maximum));
  const point = (column: number, entry: number): Point => ({ x: plot.x + column / model.fftLevels.length * plot.w, y: plot.y + entry / (model.fftSize - 1) * plot.h });
  text(pen, 'A 16-POINT FOURIER TRANSFORM', plot.x + plot.w / 2, plot.y - (tall ? 14 : 23), tall ? 9 : 14, box.w - 6, colors);
  pen.strokeStyle = colors.ink;

  for (let level = 0; level < model.fftLevels.length; level++) {
    const pairs = model.fftLevels[level];
    const amount = Math.min(1, Math.max(0, maximum - level));

    if (!pairs || amount === 0) continue;

    pen.lineWidth = level === current ? tall ? .9 : 1.4 : tall ? .35 : .6;

    for (const [first, second] of pairs) {
      const a = point(level, first);
      const b = point(level, second);
      const c = point(level + 1, first);
      const d = point(level + 1, second);
      line(pen, a.x, a.y, c.x, c.y, amount);
      line(pen, b.x, b.y, d.x, d.y, amount);
      line(pen, a.x, a.y, d.x, d.y, amount);
      line(pen, b.x, b.y, c.x, c.y, amount);
    }
  }

  for (let column = 0; column <= Math.min(model.fftLevels.length, Math.floor(maximum)); column++) {
    for (let entry = 0; entry < model.fftSize; entry++) {
      const dot = point(column, entry);
      pen.fillStyle = colors.ink;
      pen.beginPath();
      pen.arc(dot.x, dot.y, tall ? .7 : 1.1, 0, Math.PI * 2);
      pen.fill();
    }
  }

  const y = plot.y + plot.h + (tall ? 14 : 23);

  if (maximum < model.fftLevels.length) text(pen, `LEVEL ${current + 1} OF ${model.fftLevels.length} · ALL ${model.fftSize} ENTRIES`, plot.x + plot.w / 2, y, tall ? 8.5 : 12, box.w - 6, colors);
  else {
    text(pen, 'WORK ON EVERY LEVEL:', plot.x + plot.w * .39, y, tall ? 8.5 : 12, plot.w * .75, colors);
    place('fft-work', plot.x + plot.w * .85, y);
  }
}

function tape(pen: CanvasRenderingContext2D, stage: Box, time: number, colors: Colors, tall: boolean): void {
  if (time < 63500) return;

  const compact = smooth(time, 72750, 74000);
  const reveal = tapeProgress(time);
  const cell = Math.min(tall ? 18 : 27, stage.w / 11);
  const count = 9;
  const left = stage.x + (stage.w - count * cell) / 2;
  const y = stage.y + mix(tall ? 132 : 228, stage.h - (tall ? 14 : 25), compact);
  const sequence = '101101001';
  const visible = reveal * count;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .7;

  for (let index = 0; index < count; index++) {
    const amount = Math.min(1, Math.max(0, visible - index));

    if (amount === 0) continue;

    pen.strokeRect(left + index * cell, y, cell * amount, cell);

    if (amount === 1) text(pen, sequence[index] ?? '', left + (index + .5) * cell, y + cell / 2, tall ? 9 : 14, cell - 3, colors);
  }

  if (reveal === 1) {
    const beat = Math.max(0, Math.floor((time - 66000) / 450));
    const phase = beat % (2 * (count - 1));
    const index = phase < count ? phase : 2 * (count - 1) - phase;
    const x = left + (index + .5) * cell;
    pen.fillStyle = colors.ink;
    pen.beginPath();
    pen.moveTo(x, y - 2);
    pen.lineTo(x - 3, y - 8);
    pen.lineTo(x + 3, y - 8);
    pen.closePath();
    pen.fill();
  }

  if (compact === 0) {
    const x = stage.x + stage.w / 2;
    text(pen, 'FIXED TAPES · ONE CELL PER STEP', x, y - (tall ? 22 : 32), tall ? 10 : 16, stage.w - 8, colors);
    text(pen, 'ONE TAPE SHOWN · SCHEMATIC', x, y + cell + (tall ? 20 : 29), tall ? 9 : 13, stage.w - 8, colors);
    text(pen, 'RANDOM ACCESS IS ANOTHER MODEL', x, y + cell + (tall ? 42 : 58), tall ? 9 : 13, stage.w - 8, colors);
  }

  if (compact === 1) text(pen, 'FIXED TAPES · SCHEMATIC', stage.x + stage.w / 2, y - (tall ? 15 : 20), tall ? 8.5 : 12, stage.w - 8, colors);
}

function gapReadouts(pen: CanvasRenderingContext2D, stage: Box, time: number, colors: Colors, place: Place, tall: boolean): void {
  if (time < 74000) return;

  const x = stage.x + stage.w / 2;
  const compact = tall || stage.h < 450;
  const start = stage.y + (compact ? 118 : 198);
  text(pen, 'RELATIVE SAVING FROM THE CLAIMED BOUND', x, start, tall ? 10 : 16, stage.w - 8, colors);
  place('gap-first', x, start + (compact ? 25 : 37));
  place('gap-second', x, start + (compact ? 51 : 76));
  text(pen, 'HALF AS MUCH WORK ONLY WHEN', x, start + (compact ? 82 : 120), tall ? 9 : 14, stage.w - 8, colors);
  place('half-scale', x, start + (compact ? 108 : 158));
  text(pen, "CONSTANTS 1 · THE PAPER'S ARE EXTREMELY LARGE", x, start + (compact ? 138 : 201), tall ? 8.5 : 12, stage.w - 8, colors);
}

export function drawPanels(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: DigitModel, tall: boolean, stage: Box): void {
  pen.setLineDash([]);
  const x = box.x + box.w / 2;

  if (time < 32250) {
    const words = earlyStatus(model, time);
    text(pen, words.title, x, box.y + (tall ? 43 : 105), tall ? 21 : 28, box.w - 6, colors);
    text(pen, words.caption, x, box.y + (tall ? 93 : 165), tall ? 11 : 16, box.w - 6, colors);

    if (words.note) text(pen, words.note, x, box.y + (tall ? 129 : 216), tall ? 10 : 14, box.w - 6, colors);

    return;
  }

  const zoom = zoomProgress(time);
  text(pen, time >= 83500 ? 'UNREVIEWED · NO LEAN' : 'STEPS TO MULTIPLY', x, box.y + (tall ? 6 : 15), tall ? 12 : 19, box.w - 6, colors);
  text(pen, zoom > 0 ? 'MULTITAPE TURING MACHINE · CONSTANTS 1' : 'MULTITAPE TURING MACHINE', x, box.y + (tall ? 27 : 45), tall ? 8.5 : 12, box.w - 6, colors);
  history(pen, box, time, colors, place, tall);

  if (zoom > 0) {
    const compact = !tall && box.h < 460;
    text(pen, 'CLAIMED', box.x + box.w * .67, box.y + (tall ? 54 : compact ? 63 : 78), tall ? 9 : 13, box.w * .5, colors);
    place('kappa-bound', box.x + box.w * .67, box.y + (tall ? 75 : compact ? 85 : 105));
    runtime(pen, box, time, colors, place, tall);
  }

  butterfly(pen, box, time, colors, place, model, tall);
  tape(pen, stage, time, colors, tall);
  gapReadouts(pen, stage, time, colors, place, tall);
}

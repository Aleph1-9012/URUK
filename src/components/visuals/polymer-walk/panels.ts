import { progress, smooth } from '../../../lib/animation';
import { type Box, type Colors, type Place, hatch, line, text } from './drawing';
import type { PolymerModel } from './math';

type Plot = Box & { left: number; right: number; top: number; bottom: number };

function plot(box: Box, tall: boolean, bottom = 54): Plot {
  const left = box.x + (tall ? 31 : 43);
  const right = box.x + box.w - (tall ? 32 : 40);
  const top = box.y + (tall ? 30 : 40);
  const end = box.y + box.h - bottom;

  return { ...box, left, right, top, bottom: end };
}

function dot(pen: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
  pen.moveTo(x + radius, y);
  pen.arc(x, y, radius, 0, 2 * Math.PI);
}

function axes(pen: CanvasRenderingContext2D, chart: Plot, colors: Colors): void {
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  line(pen, chart.left, chart.top, chart.left, chart.bottom);
  line(pen, chart.left, chart.bottom, chart.right, chart.bottom);
}

function polyline(pen: CanvasRenderingContext2D, points: readonly { x: number; y: number }[], amount = 1): void {
  const first = points[0];

  if (!first) return;

  const length = (points.length - 1) * amount;
  pen.beginPath();
  pen.moveTo(first.x, first.y);

  for (let index = 1; index <= Math.ceil(length); index++) {
    const previous = points[index - 1];
    const current = points[index];

    if (!previous || !current) break;

    const part = Math.min(1, length - index + 1);
    pen.lineTo(previous.x + (current.x - previous.x) * part, previous.y + (current.y - previous.y) * part);
  }

  pen.stroke();
}

function slopeLedger(pen: CanvasRenderingContext2D, box: Box, colors: Colors, tall: boolean): void {
  text(pen, 'DIAMETER SLOPES: ROD 1 · ORDINARY ½ · SAW ¾', box.x + box.w / 2, box.y + box.h - 2, tall ? 8.5 : 11, box.w - 6, colors);
}

function countChart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, model: PolymerModel, tall: boolean): void {
  const chart = plot(box, tall, 47);
  const maximum = model.counts.length - 1;
  const count = Math.min(maximum, Math.max(1, Math.ceil(progress(time, 6700, 15100) * maximum)));
  const width = (chart.right - chart.left) / maximum;
  text(pen, 'NO FORMULA · COUNTED BY COMPUTER', box.x + box.w / 2, box.y + 9, tall ? 10 : 14, box.w - 6, colors);
  axes(pen, chart, colors);
  pen.fillStyle = colors.ink;

  for (let n = 1; n <= count; n++) {
    const value = model.counts[n];

    if (value === undefined) throw new Error('Every counted length has a computed tally.');

    const height = Math.log10(value) / 5.4 * (chart.bottom - chart.top);
    pen.fillRect(chart.left + (n - 1) * width + 1, chart.bottom - height, Math.max(1, width - 2), height);
  }

  for (const n of [1, 6, 12, 18]) {
    if (n > maximum) continue;

    text(pen, String(n), chart.left + (n - .5) * width, chart.bottom + 11, tall ? 9 : 12, 25, colors);
  }

  text(pen, 'n', chart.right + 24, chart.bottom + 11, tall ? 11 : 14, 15, colors);
  text(pen, `n = ${count} · ${model.counts[count]?.toLocaleString('en-US')} WALKS`, box.x + box.w / 2, box.y + box.h - 9, tall ? 12 : 17, box.w - 6, colors);
  text(pen, 'LOG COUNT', chart.left - 6, chart.top - 10, tall ? 8 : 10, 60, colors, 'left');
}

function diameterChart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: PolymerModel, tall: boolean, compact = false): void {
  const chart = plot(box, tall, compact ? 34 : (time >= 63000 && tall ? 72 : tall ? 60 : 72));
  const xMap = (length: number) => chart.left + Math.log2(length / 32) / 5 * (chart.right - chart.left);
  const yMap = (value: number) => chart.bottom - Math.log(value / 4) / Math.log(1200 / 4) * (chart.bottom - chart.top);
  const x = box.x + box.w / 2;
  const first = model.chart[0];

  if (!first) throw new Error('The diameter chart has sampled lengths.');

  const ordinary = (n: number) => first.ordinary * (n / first.length) ** .5;
  const saw = (n: number) => first.saw * (n / first.length) ** .75;
  const rod = (n: number) => Math.sqrt(3) / 2 * n;
  const samples = Array.from({ length: 81 }, (_, index) => 32 * 2 ** (index / 80 * 5));
  const curve = (fn: (n: number) => number) => samples.map(n => ({ x: xMap(n), y: yMap(fn(n)) }));
  const sawVisible = time >= 22750;
  const band = time >= 63000;
  const previousBound = time >= 45500 && time < 63000;
  const amount = smooth(time, 16250, 20500);
  text(pen, compact ? 'DIAMETER · THREE SLOPES' : 'DIAMETER AGAINST LENGTH · LOG AXES', x, box.y + 9, tall ? 10 : 14, box.w - 5, colors);
  axes(pen, chart, colors);

  for (const [n, label] of [[32, '32'], [128, '128'], [1024, '1024']] as const) {
    const px = xMap(n);
    line(pen, px, chart.bottom, px, chart.bottom + 3);
    text(pen, label, px, chart.bottom + 12, tall ? 9 : 12, 36, colors);
  }

  text(pen, 'n', chart.right + 29, chart.bottom + 12, tall ? 11 : 14, 15, colors);

  for (const value of [10, 100, 1000]) {
    const py = yMap(value);
    line(pen, chart.left - 3, py, chart.left, py);
    text(pen, String(value), chart.left - 6, py, tall ? 9 : 12, 30, colors, 'right');
  }

  if (previousBound) {
    pen.save();
    pen.beginPath();

    for (const [index, n] of samples.entries()) {
      const px = xMap(n);
      const py = yMap(2 * n / Math.log(n));

      if (index === 0) pen.moveTo(px, py);
      else pen.lineTo(px, py);
    }

    for (const n of [...samples].reverse()) pen.lineTo(xMap(n), yMap(saw(n)));

    pen.closePath();
    pen.clip();
    hatch(pen, { x: chart.left, y: chart.top, w: chart.right - chart.left, h: chart.bottom - chart.top }, colors);
    pen.restore();
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1;
    polyline(pen, curve(n => 2 * n / Math.log(n)), smooth(time, 45500, 48200));
    text(pen, 'OPEN', xMap(192), yMap((saw(192) + 2 * 192 / Math.log(192)) / 2), tall ? 9 : 13, 60, colors);
  }

  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  polyline(pen, curve(rod), amount);
  pen.setLineDash([2, 3]);
  polyline(pen, curve(ordinary), amount);
  pen.setLineDash([]);

  if (sawVisible) {
    pen.lineWidth = 1.5;
    polyline(pen, curve(saw), smooth(time, 22750, 26400));
  }

  if (band) {
    const delta = .075;
    const reveal = smooth(time, 63000, 66500);
    pen.strokeStyle = colors.blue;
    pen.lineWidth = 1.6;
    pen.setLineDash([5, 4]);
    polyline(pen, curve(n => saw(n) * (n / 32) ** delta), reveal);
    polyline(pen, curve(n => saw(n) * (n / 32) ** -delta), reveal);
    pen.setLineDash([]);
  }

  pen.fillStyle = colors.ink;
  pen.beginPath();

  for (const row of model.chart) {
    if (Math.log2(row.length / 32) / 5 > amount + .001) continue;

    dot(pen, xMap(row.length), yMap(row.ordinary), tall ? 2 : 2.8);

    if (sawVisible && Math.log2(row.length / 32) / 5 <= smooth(time, 22750, 27400) + .001) dot(pen, xMap(row.length), yMap(row.saw), tall ? 2.5 : 3.5);
  }

  pen.fill();
  place('rod', chart.right + 17, yMap(rod(1024)));
  place('ordinary', chart.right + 19, yMap(ordinary(1024)));

  if (sawVisible) place('saw', chart.right + 20, yMap(saw(1024)));

  if (compact) return;

  if (sawVisible && !band && !previousBound) text(pen, 'FITS: SAW 0.752 · ORDINARY 0.521', chart.left + 4, chart.top + 4, tall ? 8.5 : 11, chart.right - chart.left - 6, colors, 'left');

  if (previousBound) {
    text(pen, 'PROVED 2023: BELOW n BY A LOG', x, box.y + box.h - 24, tall ? 9 : 12, box.w - 5, colors);
    text(pen, 'CURVE HEIGHT SCHEMATIC', x, box.y + box.h - 7, tall ? 9 : 12, box.w - 5, colors);
  } else if (band) {
    place('diameter-claim', x, box.y + box.h - (tall ? 37 : 32));
    text(pen, tall ? 'EVERY LARGE n · PROBABILITY ERROR\nBELOW ANY POWER · WIDTH SCHEMATIC' : 'EVERY LARGE n · EXCEPT PROBABILITY BELOW ANY POWER · WIDTH SCHEMATIC', x, box.y + box.h - (tall ? 18 : 9), tall ? 8.5 : 11, box.w - 4, colors, 'center', colors.blue);
  } else if (sawVisible) {
    text(pen, 'PIVOT-SAMPLED · 200 WALKS PER LENGTH', x, box.y + box.h - 25, tall ? 9 : 12, box.w - 6, colors);
    text(pen, 'FLORY 1949 · NIENHUIS 1982 · PREDICTED', x, box.y + box.h - 8, tall ? 9 : 12, box.w - 6, colors);
  } else {
    text(pen, 'ORDINARY WALK · FITTED SLOPE 0.521', x, box.y + box.h - 12, tall ? 10 : 13, box.w - 6, colors);
  }
}

function ballChart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: PolymerModel, tall: boolean): void {
  const claimed = time >= 71750;
  const chart = plot(box, tall, claimed ? 61 : 48);
  const xMap = (radius: number) => chart.left + Math.log2(radius / 2) / 4 * (chart.right - chart.left);
  const yMap = (mass: number) => chart.bottom - Math.log(mass) / Math.log(600) * (chart.bottom - chart.top);
  const x = box.x + box.w / 2;
  const first = model.ballAverages[0];

  if (!first) throw new Error('The ball chart has measured radii.');

  const guide = (radius: number) => first.mass * (radius / first.radius) ** (4 / 3);
  text(pen, 'POINTS IN A BALL · SAMPLE MEANS', x, box.y + 9, tall ? 10 : 13, box.w - 6, colors);
  axes(pen, chart, colors);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  polyline(pen, [2, 4, 8, 16, 32].map(radius => ({ x: xMap(radius), y: yMap(guide(radius)) })));

  if (claimed) {
    const slack = 1024 ** .2;
    pen.save();
    pen.beginPath();
    pen.rect(chart.left, chart.top, chart.right - chart.left, chart.bottom - chart.top);
    pen.clip();
    pen.strokeStyle = colors.blue;
    pen.lineWidth = 1.5;
    pen.setLineDash([5, 4]);

    for (const scale of [slack, 1 / slack]) {
      polyline(pen, [2, 4, 8, 16, 32].map(radius => ({ x: xMap(radius), y: yMap(Math.min(1024, radius ** (4 / 3)) * scale) })), smooth(time, 71750, 74000));
    }

    pen.setLineDash([]);
    pen.restore();
  }

  pen.fillStyle = colors.ink;
  pen.beginPath();

  for (const row of model.ballAverages) dot(pen, xMap(row.radius), yMap(row.mass), tall ? 2.5 : 3.2);

  pen.fill();

  for (const radius of [2, 8, 32]) text(pen, String(radius), xMap(radius), chart.bottom + 12, tall ? 9 : 12, 25, colors);

  for (const value of [10, 100]) text(pen, String(value), chart.left - 6, yMap(value), tall ? 9 : 12, 28, colors, 'right');

  text(pen, 's', chart.right + 25, chart.bottom + 12, tall ? 11 : 14, 15, colors);
  place('ball', chart.right + 19, yMap(guide(32)));
  text(pen, 'GUIDE SLOPE 4/3 · FITTED DATA SLOPE 1.28', x, box.y + box.h - (claimed ? 41 : 24), tall ? 9 : 12, box.w - 4, colors);

  if (claimed) place('ball-claim', x, box.y + box.h - 19);
  else text(pen, '20 SAMPLED WALKS · 100 CENTRES EACH', x, box.y + box.h - 7, tall ? 9 : 12, box.w - 4, colors);
}

function ratioChart(pen: CanvasRenderingContext2D, box: Box, colors: Colors, place: Place, model: PolymerModel, tall: boolean): void {
  const chart = plot(box, tall, 60);
  const maximum = model.counts.length - 1;
  const xMap = (n: number) => chart.left + (n - 1) / (maximum - 1) * (chart.right - chart.left);
  const yMap = (ratio: number) => chart.bottom - (ratio - 1.7) / 1.4 * (chart.bottom - chart.top);
  const x = box.x + box.w / 2;
  text(pen, 'THE TALLY BECOMES COUNTS PER STEP', x, box.y + 9, tall ? 10 : 13, box.w - 6, colors);
  axes(pen, chart, colors);
  const points: { x: number; y: number }[] = [];

  for (let n = 1; n <= maximum; n++) {
    const count = model.counts[n];
    const previous = model.counts[n - 1];

    if (count === undefined || previous === undefined) throw new Error('Ratios use two computed consecutive tallies.');

    points.push({ x: xMap(n), y: yMap(count / previous) });
  }

  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.2;
  polyline(pen, points);
  pen.fillStyle = colors.ink;
  pen.beginPath();

  for (const point of points) dot(pen, point.x, point.y, tall ? 1.8 : 2.5);

  pen.fill();
  pen.setLineDash([4, 3]);
  line(pen, chart.left, yMap(model.mu), chart.right, yMap(model.mu));
  pen.setLineDash([]);

  for (const n of [1, 6, 12, 18]) {
    if (n <= maximum) text(pen, String(n), xMap(n), chart.bottom + 12, tall ? 9 : 12, 24, colors);
  }

  text(pen, 'n', chart.right + 25, chart.bottom + 12, tall ? 11 : 14, 15, colors);
  text(pen, '3', chart.left - 6, yMap(3), tall ? 10 : 12, 20, colors, 'right');
  text(pen, '2', chart.left - 6, yMap(2), tall ? 10 : 12, 20, colors, 'right');
  place('mu', x, box.y + box.h - 26);
  text(pen, 'DUMINIL-COPIN · SMIRNOV · PROVED 2012', x, box.y + box.h - 7, tall ? 9 : 12, box.w - 4, colors);
}

function weighted(pen: CanvasRenderingContext2D, box: Box, colors: Colors, place: Place, model: PolymerModel, tall: boolean): void {
  const x = box.x + box.w / 2;
  text(pen, 'CRITICAL WEIGHT OF EACH PIECE', x, box.y + 11, tall ? 10 : 14, box.w - 5, colors);
  place('rho', x, box.y + 36);
  const columns = [5, 10, 20];

  for (const [index, length] of columns.entries()) {
    const px = box.x + box.w * (index + .5) / 3;
    const weight = model.rho ** length;
    const words = length === 20 ? '4.65 × 10⁻⁶' : weight.toPrecision(3);
    text(pen, `ℓ = ${length}`, px, box.y + box.h * .50, tall ? 13 : 18, box.w / 3 - 5, colors);
    text(pen, words, px, box.y + box.h * .70, tall ? 13 : 19, box.w / 3 - 5, colors);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = Math.max(.5, weight ** .2 * 4);
    line(pen, px - 17, box.y + box.h * .83, px + 17, box.y + box.h * .83);
  }
}

function bridge(pen: CanvasRenderingContext2D, box: Box, colors: Colors, place: Place, tall: boolean): void {
  const chart = plot(box, tall, 48);
  const xMap = (n: number) => chart.left + Math.log2(n / 4) / 5 * (chart.right - chart.left);
  const yMap = (mass: number) => chart.bottom - (mass - .2) / .55 * (chart.bottom - chart.top);
  const x = box.x + box.w / 2;
  text(pen, 'CROSSING MASS · IMPORTED, CITED', x, box.y + 10, tall ? 10 : 14, box.w - 6, colors);
  axes(pen, chart, colors);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.3;
  const points = Array.from({ length: 61 }, (_, index) => {
    const n = 4 * 2 ** (index / 60 * 5);

    return { x: xMap(n), y: yMap(n ** -.25) };
  });
  polyline(pen, points);

  for (const n of [4, 16, 128]) text(pen, String(n), xMap(n), chart.bottom + 12, tall ? 9 : 12, 30, colors);

  text(pen, 'N', chart.right + 25, chart.bottom + 12, tall ? 11 : 14, 18, colors);
  place('bridge', chart.right - 8, yMap(128 ** -.25) - 16);
  text(pen, 'LAW AND HEIGHT SCHEMATIC', x, box.y + box.h - 10, tall ? 9 : 12, box.w - 6, colors);
}

function subwalkChart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: PolymerModel, tall: boolean): void {
  const chart = plot(box, tall, 64);
  const xMap = (diameter: number) => chart.left + Math.log(1 + diameter) / Math.log(240) * (chart.right - chart.left);
  const yMap = (length: number) => chart.bottom - Math.log(length) / Math.log(1200) * (chart.bottom - chart.top);
  const x = box.x + box.w / 2;
  text(pen, 'THIS WALK · 400 SUBWALKS', x, box.y + 10, tall ? 11 : 15, box.w - 6, colors);
  axes(pen, chart, colors);
  pen.fillStyle = colors.ink;
  pen.beginPath();

  for (const row of model.subwalks) dot(pen, xMap(row.diameter), yMap(row.length), 1.5);

  pen.fill();
  const selected = model.subwalks[Math.min(399, Math.floor(progress(time, 91000, 97400) * 12))];

  if (selected) {
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 2;
    pen.beginPath();
    pen.arc(xMap(selected.diameter), yMap(selected.length), 4.5, 0, 2 * Math.PI);
    pen.stroke();
  }

  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.3;
  const points = Array.from({ length: 61 }, (_, index) => {
    const diameter = 1200 ** (3 / 4 * index / 60) - 1;

    return { x: xMap(diameter), y: yMap((1 + diameter) ** (4 / 3)) };
  });
  polyline(pen, points);

  for (const value of [1, 10, 100]) {
    text(pen, String(value), xMap(value), chart.bottom + 12, tall ? 9 : 12, 28, colors);
    text(pen, String(value), chart.left - 6, yMap(value), tall ? 9 : 12, 28, colors, 'right');
  }

  place('subwalk', x, box.y + box.h - 27);
  text(pen, 'LENGTH / GUIDE = 0.50 TO 1.51 · THIS SAMPLE', x, box.y + box.h - 7, tall ? 9 : 12, box.w - 4, colors);
}

function critical(pen: CanvasRenderingContext2D, box: Box, colors: Colors, place: Place, model: PolymerModel, tall: boolean): void {
  const chart = plot(box, tall, 82);
  const maximum = model.counts.length - 1;
  const step = (chart.right - chart.left) / maximum;
  const yMap = (value: number) => chart.bottom - value / 3.4 * (chart.bottom - chart.top);
  const x = box.x + box.w / 2;
  place('critical', x, box.y + 10);
  axes(pen, chart, colors);
  pen.fillStyle = colors.ink;

  for (let n = 1; n <= maximum; n++) {
    const count = model.counts[n];

    if (count === undefined) throw new Error('Critical bars use computed counts.');

    const top = yMap(count * model.rho ** n);
    pen.fillRect(chart.left + (n - 1) * step + 1, top, Math.max(1, step - 2), chart.bottom - top);
  }

  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  pen.setLineDash([4, 3]);
  line(pen, chart.left, yMap(1), chart.right, yMap(1));
  pen.setLineDash([]);
  text(pen, '1', chart.left - 7, yMap(1), tall ? 11 : 14, 18, colors, 'right');

  for (const n of [1, 6, 12, 18]) {
    if (n <= maximum) text(pen, String(n), chart.left + (n - .5) * step, chart.bottom + 11, tall ? 9 : 12, 25, colors);
  }

  text(pen, `CHECKED TO n = ${maximum} · SECTION 9`, x, box.y + box.h - 54, tall ? 9 : 12, box.w - 5, colors);
  place('division', x, box.y + box.h - 29);
  text(pen, 'DIVISION STEP SCHEMATIC · EVERY BAR ABOVE 1', x, box.y + box.h - 8, tall ? 9 : 12, box.w - 4, colors);
}

function closing(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: PolymerModel, tall: boolean): void {
  const chart = { x: box.x, y: box.y, w: box.w, h: box.h * (tall ? .57 : .61) };
  diameterChart(pen, chart, time, colors, place, model, tall, true);
  const y = box.y + box.h * (tall ? .63 : .67);
  const x = box.x + box.w / 2;
  text(pen, 'UNREVIEWED', x, y, tall ? 17 : 25, box.w - 6, colors);
  text(pen, 'OSVERIFY: ONE MAJOR ISSUE · REPAIR PROPOSED', x, y + (tall ? 20 : 28), tall ? 9 : 12, box.w - 6, colors);
  text(pen, 'NESTING PAPER · LEMMA 3.9', x, y + (tall ? 37 : 48), tall ? 9 : 12, box.w - 6, colors);
  text(pen, 'LEAN: SUPPORTING STATEMENTS ONLY', x, box.y + box.h - 7, tall ? 9 : 13, box.w - 5, colors);
}

export function drawCharts(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: PolymerModel, tall: boolean): void {
  pen.strokeStyle = colors.ink;
  pen.fillStyle = colors.ink;
  pen.lineWidth = 1;
  pen.setLineDash([]);

  if (time < 6500) return;

  if (time < 16250) {
    countChart(pen, box, time, colors, model, tall);

    return;
  }

  if (time >= 110750) {
    closing(pen, box, time, colors, place, model, tall);

    return;
  }

  const ball = time >= 31750 && time < 38500 || time >= 71750 && time < 78500;
  const ratios = time >= 38500 && time < 45500;
  const weights = time >= 78500 && time < 84500;
  const crossing = time >= 84500 && time < 91000;
  const subwalks = time >= 91000 && time < 97500;
  const mass = time >= 97500 && time < 104500;
  const inset = ball || ratios || weights || crossing || mass;

  if (!inset && !subwalks) {
    diameterChart(pen, box, time, colors, place, model, tall);

    return;
  }

  let active = box;

  if (inset && !tall) {
    diameterChart(pen, { x: box.x, y: box.y, w: box.w, h: box.h * .48 }, time, colors, place, model, false, true);
    active = { x: box.x, y: box.y + box.h * .53, w: box.w, h: box.h * .47 };
  } else if (tall) {
    active = { x: box.x, y: box.y, w: box.w, h: box.h - 17 };
    slopeLedger(pen, box, colors, true);
  }

  if (ball) ballChart(pen, active, time, colors, place, model, tall);
  else if (ratios) ratioChart(pen, active, colors, place, model, tall);
  else if (weights) weighted(pen, active, colors, place, model, tall);
  else if (crossing) bridge(pen, active, colors, place, tall);
  else if (subwalks) subwalkChart(pen, active, time, colors, place, model, tall);
  else if (mass) critical(pen, active, colors, place, model, tall);
}

import { mix, progress, smooth } from '../../../lib/animation';
import { FAMILY_EXAMPLES, FOOTNOTE_FIRST, FOOTNOTE_TOTAL, MEASURED_GATE_SHARES } from './data';
import { type Box, type Colors, type Place, hatch, line, text } from './drawing';
import type { ArtinModel } from './math';

const BASES = [2, 3, 5, 6, 7, 8, 10];

function dot(pen: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
  pen.beginPath();
  pen.arc(x, y, radius, 0, 2 * Math.PI);
  pen.fill();
}

function brace(pen: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
  pen.beginPath();
  pen.moveTo(x, y + height);
  pen.lineTo(x, y);
  pen.lineTo(x + width * .46, y);
  pen.lineTo(x + width * .5, y - height * .5);
  pen.lineTo(x + width * .54, y);
  pen.lineTo(x + width, y);
  pen.lineTo(x + width, y + height);
  pen.stroke();
}

function tick(pen: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  pen.beginPath();
  pen.moveTo(x - size * .5, y);
  pen.lineTo(x - size * .1, y + size * .4);
  pen.lineTo(x + size * .65, y - size * .65);
  pen.stroke();
}

function arithmetic(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, phone: boolean): void {
  const x = box.x + box.w / 2;
  const y = box.y + box.h * .20;
  const size = phone ? 17 : 24;
  text(pen, 'DOUBLE THE NUMBER', x, y, phone ? 12 : 15, box.w - 10, colors);
  text(pen, '8 × 2 = 16', x, y + 30, size, box.w - 12, colors);
  text(pen, '16 = 11 + 5', x, y + 61, size, box.w - 12, colors);
  line(pen, x - 35, y + 82, x + 35, y + 82, smooth(time, 1800, 3000));
  text(pen, 'KEEP THE REMAINDER: 5', x, y + 106, phone ? 12 : 16, box.w - 10, colors);

  if (time >= 6500) {
    text(pen, 'ALL TEN NONZERO TICKS', x, box.y + box.h - 29, phone ? 12 : 15, box.w - 10, colors);
  }
}

function bases(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, phone: boolean): void {
  const claimed = time >= 67000;
  const footnote = time >= 61000 && time < 67000;
  const x = box.x + box.w / 2;

  if (footnote) {
    text(pen, 'p = 4q + 1 · q PRIME', x, box.y + 12, phone ? 12 : 17, box.w - 8, colors);
    text(pen, '13 = 4 × 3 + 1', x, box.y + box.h * .29, phone ? 19 : 30, box.w - 10, colors);
    text(pen, FOOTNOTE_FIRST.slice(0, 5).join(', ') + ' …', x, box.y + box.h * .46, phone ? 12 : 17, box.w - 8, colors);
    text(pen, `${FOOTNOTE_TOTAL.toLocaleString('en-US')} BELOW TEN MILLION`, x, box.y + box.h * .61, phone ? 11 : 14, box.w - 8, colors);
    text(pen, '2 WORKS FOR EVERY ONE', x, box.y + box.h * .75, phone ? 12 : 16, box.w - 8, colors);
    text(pen, 'INFINITELY MANY SUCH p: ALSO OPEN', x, box.y + box.h - 10, phone ? 9 : 13, box.w - 8, colors);

    return;
  }

  const step = Math.min(phone ? 34 : 51, box.w / 8);
  const start = x - step * 3;
  const row = box.y + (phone ? 74 : 110);
  const title = claimed ? 'OPENAI · 4 OCTOBER 2026 · 92 PAGES' : time >= 54000 ? 'HEATH-BROWN 1986' : 'ARTIN TO HASSE · 27 SEPTEMBER 1927';
  text(pen, title, x, box.y + 13, phone ? 10 : 13, box.w - 5, colors);
  text(pen, claimed ? 'CLAIMED: EVERY ADMISSIBLE BASE' : time >= 54000 ? 'AT LEAST ONE · UNNAMED' : 'EVERY ADMISSIBLE BASE?', x, box.y + 35, phone ? 11 : 15, box.w - 6, colors, 'center', claimed ? colors.blue : colors.ink);
  pen.lineWidth = 1.3;
  pen.strokeStyle = colors.ink;

  if (time >= 54000) {
    const opening = smooth(time, 67000, 68500);
    brace(pen, start - 12, row - 28 - opening * 9, 2 * step + 24, 7 * (1 - opening));
  }

  for (const [index, base] of BASES.entries()) {
    const px = start + index * step;
    text(pen, String(base), px, row, phone ? 23 : 33, step - 4, colors);

    if (claimed) {
      pen.strokeStyle = colors.blue;
      pen.lineWidth = 2.5;
      const growth = smooth(time, 67000 + index * 130, 68100 + index * 130);

      if (growth > 0) tick(pen, px, row + 28, 10 * growth);
    }
  }

  text(pen, 'NOT: −1, AND SQUARES 1, 4, 9, 16 …', x, row + (phone ? 68 : 106), phone ? 10 : 13, box.w - 8, colors);

  if (!claimed && time < 54000) text(pen, '4 = 2²: ORDER 5 OF 10', x, box.y + box.h - 24, phone ? 12 : 15, box.w - 8, colors);
}

function strip(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, model: ArtinModel, phone: boolean, closing = false): void {
  const x = box.x + 10;
  const width = box.w - 20;
  const columns = phone ? 20 : 30;
  const rows = 300 / columns;
  const cellW = width / columns;
  const cellH = Math.min(phone ? 5 : 10, (box.h * .34) / rows);
  const gridY = box.y + 30;
  const amount = closing ? 300 : Math.ceil(300 * progress(time, 30000, 32300));
  text(pen, '300 ODD PRIMES · 116 FILLED', x + width / 2, box.y + 11, phone ? 11 : 14, width, colors);
  pen.lineWidth = .55;

  for (const [index, mark] of model.strip.entries()) {
    const px = x + index % columns * cellW;
    const py = gridY + Math.floor(index / columns) * cellH;
    pen.strokeStyle = colors.muted;
    pen.strokeRect(px + 1, py + .6, cellW - 2, cellH - 1.2);

    if (index < amount && mark.primitive) {
      pen.fillStyle = colors.ink;
      pen.fillRect(px + 1, py + .6, cellW - 2, cellH - 1.2);
    }
  }

  const chartTop = gridY + rows * cellH + (phone ? 19 : 32);
  const chartBottom = box.y + box.h - 42;
  const chartHeight = Math.max(35, chartBottom - chartTop);
  const logStage = closing || time >= 34500;
  const points = logStage ? model.tallies : model.stripTallies;
  const chartX = x + 27;
  const chartW = width - 37;
  const py = (share: number) => chartTop + chartHeight * (1 - (share - .3) / .35);
  const predictionY = py(model.product);
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  line(pen, chartX, chartTop, chartX, chartBottom);
  line(pen, chartX, chartBottom, chartX + chartW, chartBottom);
  pen.setLineDash([4, 4]);
  line(pen, chartX, predictionY, chartX + chartW, predictionY);
  pen.setLineDash([]);
  text(pen, '37.4%', x + 17, predictionY - 2, phone ? 9 : 11, 34, colors);
  const reveal = closing ? 1 : progress(time, logStage ? 34500 : 31600, logStage ? 37400 : 34100);
  const pointX = (index: number, total: number) => chartX + chartW * (logStage ? index / (points.length - 1) : total / 300);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.7;
  pen.beginPath();

  for (const [index, point] of points.entries()) {
    const px = pointX(index, point.total);
    const y = py(point.share);

    if (index > reveal * (points.length - 1) + .1) break;

    if (index === 0) pen.moveTo(px, y);
    else pen.lineTo(px, y);
  }

  pen.stroke();
  pen.fillStyle = colors.ink;

  for (const [index, point] of points.entries()) {
    if (index > reveal * (points.length - 1) + .1) break;

    const px = pointX(index, point.total);
    dot(pen, px, py(point.share), 2.2);
    if (logStage) text(pen, `10${['³', '⁴', '⁵', '⁶', '⁷'][index]}`, px, chartBottom + 12, phone ? 10 : 12, chartW / points.length, colors);
  }

  if (!logStage) {
    for (const total of [0, 100, 200, 300]) text(pen, String(total), pointX(0, total), chartBottom + 12, phone ? 10 : 12, chartW / 4, colors);
  }

  const current = points[Math.min(points.length - 1, Math.floor(reveal * (points.length - 1)))];

  if (current) text(pen, `${current.count.toLocaleString('en-US')} / ${current.total.toLocaleString('en-US')} = ${current.share.toFixed(4)}`, box.x + box.w / 2, box.y + box.h - 8, phone ? 11 : 14, box.w - 5, colors);
}

function index(pen: CanvasRenderingContext2D, box: Box, colors: Colors, place: Place, phone: boolean): void {
  const x = box.x + box.w / 2;
  const columns = phone ? 6 : 5;
  const rows = phone ? 5 : 6;
  const cell = Math.min(phone ? 25 : 39, box.w / 7);
  const left = x - cell * columns / 2;
  const top = box.y + (phone ? 80 : 115);
  const rowStep = phone ? Math.min(12, (box.h - 128) / 4) : 24;
  place('gate', x, box.y + (phone ? 14 : 20));
  text(pen, '30 = 2 · 3 · 5', x, box.y + (phone ? 40 : 56), phone ? 14 : 20, box.w - 8, colors);
  text(pen, '30 AVAILABLE · 5 VISITED', x, box.y + (phone ? 58 : 84), phone ? 10 : 13, box.w - 8, colors);
  pen.fillStyle = colors.ink;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .8;

  for (let group = 0; group < rows; group++) {
    for (let column = 0; column < columns; column++) {
      const px = left + column * cell + cell * .5;
      const py = top + group * rowStep;
      pen.beginPath();
      pen.arc(px, py, phone ? 1.8 : 3.5, 0, 2 * Math.PI);

      if (phone ? column === 0 : group === 0) pen.fill();
      else pen.stroke();
    }
  }

  text(pen, 'INDEX = 30 / 5 = 6 = 2 × 3', x, box.y + box.h - (phone ? 31 : 35), phone ? 12 : 17, box.w - 8, colors);
  text(pen, 'GATES 2 AND 3 ARE SHUT', x, box.y + box.h - (phone ? 10 : 12), phone ? 11 : 14, box.w - 8, colors);
}

function sieve(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: ArtinModel, phone: boolean): void {
  const carry = smooth(time, 45750, 46750);
  const x = box.x + mix(37, 9, carry);
  const width = box.w - mix(55, 18, carry);
  const y = box.y + mix(box.h * .74, phone ? 50 : 87, carry);
  const height = mix(1, phone ? 24 : 39, carry);
  const elapsed = progress(time, 45750, 52000) * 9;
  const index = Math.min(7, Math.floor(elapsed));
  const previous = index === 0 ? 1 : model.partials[index - 1]?.product ?? 1;
  const partial = model.partials[index];
  const target = partial?.product ?? model.product;
  const product = elapsed >= 8 ? mix(target, model.product, Math.min(1, elapsed - 8)) : mix(previous, target, elapsed - index);
  text(pen, 'HOOLEY 1967 · ASSUMING GRH', x + width / 2, box.y + 11, phone ? 11 : 14, width, colors);
  text(pen, 'ALL PRIMES = 1', x + width / 2, y - 19, phone ? 10 : 13, width, colors);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .9;
  pen.strokeRect(x, y, width, height);
  hatch(pen, { x: x + width * product, y, w: width * (1 - product), h: height }, colors);
  pen.fillStyle = colors.ink;
  pen.fillRect(x, y, width * product, height);
  pen.setLineDash([4, 3]);
  line(pen, x + width * model.product, y - 5, x + width * model.product, y + height + 11);
  pen.setLineDash([]);
  text(pen, product.toFixed(5), x + width * product, y + height + 23, phone ? 17 : 23, width * .5, colors);
  const activePrime = elapsed >= 9 ? `PRIMES TO ${model.productLimit.toLocaleString('en-US')}` : elapsed >= 8 ? 'FINISHING PRODUCT' : `THROUGH q = ${partial?.q ?? 2}`;
  text(pen, activePrime, x + width * .77, y + height + 23, phone ? 10 : 13, width * .43, colors);
  place('product', x + width / 2, y + height + (phone ? 53 : 74));
  const rowY = box.y + box.h - (phone ? 36 : 64);
  const fractions = ['1/2', '1/6', '1/20', '1/42'];

  for (let item = 0; item < 4; item++) {
    const measured = MEASURED_GATE_SHARES[item];

    if (!measured) continue;

    const px = x + width * (item + .5) / 4;
    text(pen, `q=${measured.q}: ${fractions[item]}`, px, rowY, phone ? 10 : 13, width / 4 - 4, colors);
    text(pen, measured.share.toFixed(5), px, rowY + 17, phone ? 11 : 14, width / 4 - 4, colors);
  }

  text(pen, 'MEASURED THROUGH TEN MILLION', x + width / 2, box.y + box.h - 3, phone ? 9 : 11, width, colors);
}

function countChart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: ArtinModel, phone: boolean): void {
  const chart = { x: box.x + (phone ? 30 : 47), y: box.y + 43, w: box.w - (phone ? 44 : 72), h: box.h - (phone ? 128 : 158) };
  const xMap = (x: number) => chart.x + (Math.log10(x) - 2) / (Math.log10(5_000_000) - 2) * chart.w;
  const yMap = (value: number) => chart.y + chart.h * (1 - Math.log10(value) / 5.2);
  const amount = progress(time, 76100, 79800);
  text(pen, 'PRIMES IN (x, 2x] WHERE 2 WORKS', box.x + box.w / 2, box.y + 12, phone ? 10 : 13, box.w - 8, colors);
  const current = model.intervals[Math.min(5, Math.floor(amount * 5))];

  if (current) text(pen, `OBSERVED: ${current.count.toLocaleString('en-US')}`, box.x + box.w / 2, box.y + 30, phone ? 11 : 14, box.w - 8, colors);
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  line(pen, chart.x, chart.y, chart.x, chart.y + chart.h);
  line(pen, chart.x, chart.y + chart.h, chart.x + chart.w, chart.y + chart.h);

  for (const power of [1, 3, 5]) {
    const py = yMap(10 ** power);
    line(pen, chart.x - 3, py, chart.x, py);
    text(pen, `10${['', '¹', '', '³', '', '⁵'][power]}`, chart.x - 8, py, phone ? 10 : 12, 35, colors, 'right');
  }

  for (const [value, label] of [[100, '10²'], [10000, '10⁴'], [1000000, '10⁶']] as const) {
    const px = xMap(value);
    line(pen, px, chart.y + chart.h, px, chart.y + chart.h + 3);
    text(pen, label, px, chart.y + chart.h + 13, phone ? 10 : 12, 40, colors);
  }

  text(pen, 'x', chart.x + chart.w + 9, chart.y + chart.h + 12, 12, 15, colors);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.2;
  pen.beginPath();

  for (const [index, point] of model.intervals.entries()) {
    const px = xMap(point.x);
    const py = yMap(.374 * point.total);

    if (index === 0) pen.moveTo(px, py);
    else pen.lineTo(px, py);
  }

  pen.stroke();
  pen.fillStyle = colors.ink;

  for (const [index, point] of model.intervals.entries()) {
    if (index > amount * 5 + .1) break;

    dot(pen, xMap(point.x), yMap(point.count), phone ? 2.8 : 3.7);
  }

  pen.strokeStyle = colors.blue;
  pen.lineWidth = 1.8;
  pen.setLineDash([5, 4]);
  pen.beginPath();

  for (let sample = 0; sample <= 90 * amount; sample++) {
    const value = 10 ** (2 + (Math.log10(5_000_000) - 2) * sample / 90);
    const px = xMap(value);
    const py = yMap(value / Math.log(value) ** 2);

    if (sample === 0) pen.moveTo(px, py);
    else pen.lineTo(px, py);
  }

  pen.stroke();
  pen.setLineDash([]);
  text(pen, 'ARTIN’S PREDICTION', chart.x + chart.w * .36, chart.y + chart.h * .15, phone ? 10 : 12, chart.w * .7, colors);
  text(pen, 'CLAIMED FLOOR · CONSTANT NOT EXPLICIT\nHEIGHT SCHEMATIC', box.x + box.w / 2, chart.y + chart.h + 32, phone ? 9 : 12, box.w - 8, colors, 'center', colors.blue);
  place('lower', box.x + box.w / 2, chart.y + chart.h + 64);
  text(pen, '1/log x: 0.217 → 0.065 · A LOGARITHM SHORT', box.x + box.w / 2, box.y + box.h - 4, phone ? 9 : 12, box.w - 8, colors);
}

function grouped(value: string, split: boolean): string {
  const groups = value.replace(/\B(?=(\d{3})+(?!\d))/gu, ',').split(',');

  if (!split) return groups.join(',');

  const middle = Math.ceil(groups.length / 2);

  return `${groups.slice(0, middle).join(',')},\n${groups.slice(middle).join(',')}`;
}

function family(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, phone: boolean): void {
  const center = box.x + box.w / 2;
  const x = box.x + 13;
  const width = box.w - 26;
  const barY = box.y + (phone ? 40 : 44);
  const barH = phone ? 14 : 26;
  const amount = smooth(time, 84250, 85750);
  const oldLogs = [Math.log(2), Math.log(3), Math.log(5), 0];
  const newLogs = [Math.log(2), Math.log(11), Math.log(13), Math.log(Number(FAMILY_EXAMPLES.open.largeFactor))];
  const oldSum = Math.log(30);
  const newSum = newLogs.reduce((sum, value) => sum + value, 0);
  let left = x;
  place('family', center, box.y + 9);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .9;

  for (let item = 0; item < 4; item++) {
    const part = mix((oldLogs[item] ?? 0) / oldSum, (newLogs[item] ?? 0) / newSum, amount) * width;
    const mid = left + part / 2;
    pen.strokeRect(left, barY, part, barH);

    if (item < 3) {
      const tagX = x + 12 + item * (phone ? 35 : 47);
      line(pen, mid, barY, tagX, barY - 12);
      text(pen, String([2, 11, 13][item]), tagX, barY - 16, phone ? 12 : 15, 31, colors);
    } else if (part > 8) {
      text(pen, 'Q', mid, barY + barH / 2 + 1, phone ? 13 : 19, part - 5, colors);
    }

    left += part;
  }

  const startY = barY + barH + (phone ? 14 : 28);
  const textSize = phone ? 11 : 16;
  const rowGap = phone ? 37 : 65;
  text(pen, `Q = ${grouped(FAMILY_EXAMPLES.open.largeFactor, phone)}`, center, startY, textSize, width, colors);
  text(pen, `p = ${grouped(FAMILY_EXAMPLES.open.prime, phone)}`, center, startY + rowGap, textSize, width, colors);
  text(pen, 'ALL GATES OPEN · 2 IS A PRIMITIVE ROOT', center, startY + rowGap + (phone ? 32 : 27), phone ? 9 : 12, width, colors);
  const secondPrimeY = startY + rowGap * 2 + (phone ? 8 : 0);
  text(pen, `p = ${grouped(FAMILY_EXAMPLES.closed.prime, phone)}`, center, secondPrimeY, textSize, width, colors);
  const secondTagY = secondPrimeY + (phone ? 32 : 27);
  const noteY = secondTagY + (phone ? 16 : 30);
  text(pen, 'SECOND PRIME · GATE 11 SHUT', center, secondTagY, phone ? 10 : 13, width, colors);
  text(pen, '(2/p) = −1 · p ≡ 3 MOD 8: GATE 2 HELD OPEN', center, noteY, phone ? 9 : 12, width, colors);
  text(pen, 'REAL PRIMES OF THE FAMILY’S SHAPE', center, noteY + (phone ? 14 : 19), phone ? 9 : 12, width, colors);
  text(pen, 'WINDOW (4.48, 29.17) AT x = 10²⁵ · THRESHOLD NOT EXPLICIT', center, noteY + (phone ? 28 : 39), phone ? 8 : 11, width, colors);
}

function fences(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, phone: boolean): void {
  const x = box.x + 10;
  const width = box.w - 20;
  const startY = box.y + 43;
  const rowH = (box.h - 110) / 3;
  const edgeX = x + width * .89;
  const claimedX = edgeX - width * .17;
  const growth = progress(time, 94100, 98200);
  text(pen, 'STANDARD REGIONS SHRINK WITH THE FIELD', x + width / 2, box.y + 10, phone ? 10 : 13, width, colors);

  for (const [index, regionWidth] of [.32, .22, .10].entries()) {
    const y = startY + index * rowH;
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .7;
    line(pen, x + width * .44, y + rowH - 7, edgeX + 14, y + rowH - 7);
    line(pen, edgeX, y, edgeX, y + rowH - 7);
    pen.setLineDash([2, 4]);
    line(pen, edgeX - width * regionWidth, y, edgeX - width * regionWidth, y + rowH - 7);
    pen.setLineDash([]);
    text(pen, `FIELD ${index + 1} ⊇ μ₁₂`, x + width * .2, y + rowH * .4, phone ? 12 : 16, width * .39, colors);
    text(pen, '1', edgeX, y + rowH + 4, phone ? 11 : 13, 20, colors);
  }

  pen.strokeStyle = colors.blue;
  pen.lineWidth = 2;
  pen.setLineDash([5, 4]);
  line(pen, claimedX, startY - 3, claimedX, startY + 3 * rowH - 6, growth);
  pen.setLineDash([]);
  text(pen, 'CLAIMED: ONE WIDTH FOR EVERY FIELD', x + width / 2, box.y + box.h - 43, phone ? 10 : 13, width, colors, 'center', colors.blue);
  place('fence', x + width / 2, box.y + box.h - 23);
  text(pen, 'DRAWN MAGNIFIED · SCHEMATIC', x + width / 2, box.y + box.h - 3, phone ? 10 : 12, width, colors);
}

function shares(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: ArtinModel, phone: boolean): void {
  const x = box.x + 9;
  const width = box.w - 18;
  const chartY = box.y + 51;
  const chartH = box.h - 131;
  const stage = Math.min(3, Math.floor(progress(time, 106000, 109800) * 3.99));
  const entering = progress(time, 102000, 104200);
  const columnW = width / 8;
  const sum = model.windowShares.reduce((total, row) => total + row.share, 0);
  text(pen, stage ? 'MOVE THE WINDOW TO LARGER PRIMES' : 'THE WINDOW: PRIMES 5 TO 29', x + width / 2, box.y + 10, phone ? 10 : 14, width, colors);
  place('shares', x + width / 2, box.y + 31);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .7;
  line(pen, x, chartY + chartH, x + width, chartY + chartH);

  if (stage === 0) {
    for (const [index, row] of model.windowShares.entries()) {
      const height = row.share / .05 * chartH * entering;
      const px = x + index * columnW;
      hatch(pen, { x: px + 3, y: chartY + chartH - height, w: columnW - 6, h: height }, colors);
      pen.strokeRect(px + 3, chartY + chartH - height, columnW - 6, height);
      text(pen, row.share.toFixed(4), px + columnW / 2, chartY + chartH - height - 9, phone ? 8 : 11, columnW - 2, colors);
      text(pen, String(row.q), px + columnW / 2, chartY + chartH + 12, phone ? 11 : 14, columnW - 2, colors);
    }

    text(pen, `SUM = ${sum.toFixed(4)}`, x + width / 2, chartY + chartH + 36, phone ? 13 : 17, width, colors);
  } else {
    const tail = model.tails[stage - 1];

    if (tail) {
      text(pen, `q ≥ ${tail.from}`, x + width * .23, chartY + chartH * .25, phone ? 16 : 24, width * .45, colors);
      text(pen, `SUM ≈ ${tail.share.toFixed(4)}`, x + width * .66, chartY + chartH * .25, phone ? 16 : 24, width * .6, colors);
      const bar = { x, y: chartY + chartH * .66, w: width, h: phone ? 17 : 27 };
      pen.strokeRect(bar.x, bar.y, bar.w, bar.h);
      hatch(pen, { x: bar.x + bar.w * (1 - tail.share), y: bar.y, w: bar.w * tail.share, h: bar.h }, colors);
      text(pen, 'A POSITIVE PROPORTION REMAINS', x + width / 2, chartY + chartH + 35, phone ? 11 : 15, width, colors);
    }
  }

  text(pen, 'PROPOSITION 2.2’S CONSTANT NOT DRAWN', x + width / 2, box.y + box.h - 5, phone ? 9 : 12, width, colors);
}

function close(pen: CanvasRenderingContext2D, box: Box, colors: Colors, model: ArtinModel, phone: boolean): void {
  const x = box.x + box.w / 2;
  text(pen, 'UNREVIEWED', x, box.y + 13, phone ? 22 : 31, box.w - 10, colors);
  text(pen, 'IMPORTS THEOREM 3.1 OF AN\nUNREVIEWED RELEASE PAPER', x, box.y + 46, phone ? 11 : 16, box.w - 8, colors);
  text(pen, 'ADAPTS FAMILY 003 · NO LEAN', x, box.y + (phone ? 88 : 104), phone ? 11 : 15, box.w - 8, colors);
  const chartTop = box.y + box.h * .52;
  const chartHeight = box.h * .16;
  const chartX = box.x + 15;
  const chartWidth = box.w - 30;
  const yMap = (share: number) => chartTop + chartHeight * (1 - (share - .37) / .04);
  const lineY = yMap(model.product);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  pen.setLineDash([4, 4]);
  line(pen, chartX, lineY, chartX + chartWidth, lineY);
  pen.setLineDash([]);
  pen.lineWidth = 1.6;
  pen.beginPath();

  for (const [index, row] of model.tallies.entries()) {
    const px = chartX + chartWidth * index / (model.tallies.length - 1);
    const py = yMap(row.share);

    if (index === 0) pen.moveTo(px, py);
    else pen.lineTo(px, py);
  }

  pen.stroke();
  const last = model.tallies.at(-1);

  if (last) {
    pen.fillStyle = colors.ink;
    dot(pen, chartX + chartWidth, yMap(last.share), phone ? 3 : 4);
    text(pen, last.share.toFixed(4), chartX + chartWidth - 4, yMap(last.share) - 12, phone ? 10 : 13, 70, colors, 'right');
  }

  text(pen, `ARTIN: ${(100 * model.product).toFixed(1)}% · STILL A PREDICTION`, x, box.y + box.h * .68 + 11, phone ? 10 : 14, box.w - 8, colors);
  const step = Math.min(phone ? 33 : 49, box.w / 8);

  for (const [index, base] of BASES.entries()) {
    const px = x + (index - 3) * step;
    const py = box.y + box.h - 14;
    text(pen, String(base), px, py, phone ? 17 : 23, step - 3, colors);
    pen.strokeStyle = colors.blue;
    pen.lineWidth = 2.3;
    tick(pen, px, py - 18, phone ? 7 : 10);
  }
}

export function drawPanel(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: ArtinModel, tall: boolean): void {
  pen.strokeStyle = colors.ink;
  pen.fillStyle = colors.ink;
  pen.lineWidth = 1;

  if (time < 14000) arithmetic(pen, box, time, colors, tall);
  else if (time < 19500) {
    const x = box.x + box.w / 2;
    text(pen, '2 → 4 → 1', x, box.y + box.h * .35, tall ? 26 : 42, box.w - 12, colors);
    text(pen, 'THREE VISITED · SIX AVAILABLE', x, box.y + box.h * .62, tall ? 12 : 17, box.w - 12, colors);
    text(pen, 'CLOSES EARLY', x, box.y + box.h * .82, tall ? 13 : 19, box.w - 12, colors);
  } else if (time < 29750) bases(pen, box, time, colors, tall);
  else if (time < 38250) strip(pen, box, time, colors, model, tall);
  else if (time < 45750) index(pen, box, colors, place, tall);
  else if (time < 54000) sieve(pen, box, time, colors, place, model, tall);
  else if (time < 76000) bases(pen, box, time, colors, tall);
  else if (time < 84250) countChart(pen, box, time, colors, place, model, tall);
  else if (time < 93250) family(pen, box, time, colors, place, tall);
  else if (time < 102000) fences(pen, box, time, colors, place, tall);
  else if (time < 110250) shares(pen, box, time, colors, place, model, tall);
  else close(pen, box, colors, model, tall);
}

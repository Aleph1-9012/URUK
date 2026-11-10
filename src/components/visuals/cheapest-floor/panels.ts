import { mix, progress, smooth } from '../../../lib/animation';
import { type Box, type Colors, type Place, hatch, line, text } from './drawing';
import { gaussian, mixtureValue, type FloorModel, type Point } from './math';
import { CONTACT_ARRIVALS, relaxationStepAt } from './story';

type Plot = { left: number; right: number; top: number; bottom: number };

export { relaxationStepAt } from './story';

function dot(pen: CanvasRenderingContext2D, point: Point, radius: number, filled = true): void {
  pen.beginPath();
  pen.arc(point.x, point.y, radius, 0, 2 * Math.PI);

  if (filled) pen.fill();

  pen.stroke();
}

function curve(pen: CanvasRenderingContext2D, chart: Plot, fn: (value: number) => number, xMin: number, xMax: number, yMin: number, yMax: number, amount = 1): void {
  pen.beginPath();

  for (let index = 0; index <= 100 * amount; index++) {
    const value = xMin + (xMax - xMin) * index / 100;
    const x = chart.left + index / 100 * (chart.right - chart.left);
    const y = chart.bottom - (fn(value) - yMin) / (yMax - yMin) * (chart.bottom - chart.top);

    if (index === 0) pen.moveTo(x, y);
    else pen.lineTo(x, y);
  }

  pen.stroke();
}

function axes(pen: CanvasRenderingContext2D, chart: Plot, colors: Colors, zeroY = chart.bottom): void {
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  line(pen, chart.left, chart.top, chart.left, chart.bottom);
  line(pen, chart.left, zeroY, chart.right, zeroY);
}

function energyValue(model: FloorModel, step: number): number {
  const index = Math.min(model.energies.length - 2, Math.floor(step / 10));
  const first = model.energies[index];
  const second = model.energies[index + 1];

  if (!first || !second) throw new Error('The recorded energy curve brackets the displayed step.');

  return mix(first.energy, second.energy, (step - first.step) / (second.step - first.step));
}

function claimRing(pen: CanvasRenderingContext2D, box: Box, colors: Colors, tall: boolean): void {
  const x = box.x + box.w - (tall ? 23 : 29);
  const y = box.y + 10;
  pen.strokeStyle = colors.blue;
  pen.fillStyle = colors.blue;
  pen.lineWidth = 1.5;
  dot(pen, { x, y }, tall ? 3.5 : 4.5);
  text(pen, '2', x + 12, y, tall ? 12 : 16, 16, colors, 'center', colors.blue);
}

function energyChart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, model: FloorModel, tall: boolean, compact = false): void {
  const claimed = time >= 60750;
  const step = relaxationStepAt(time);
  const xMax = Math.max(50, step);
  const chart = { left: box.x + (tall ? 33 : 43), right: box.x + box.w - 14, top: box.y + 26, bottom: box.y + box.h - (compact ? 60 : 82) };
  const xMap = (n: number) => chart.left + n / xMax * (chart.right - chart.left);
  const yMap = (energy: number) => chart.bottom - energy / 1.05 * (chart.bottom - chart.top);
  const x = box.x + box.w / 2;
  text(pen, 'RECORDED ENERGY PER POINT', x - (claimed ? 15 : 0), box.y + 10, tall ? 10 : 14, box.w - (claimed ? 46 : 6), colors);

  if (claimed) claimRing(pen, box, colors, tall);

  axes(pen, chart, colors);

  for (const value of [0, .5, 1]) text(pen, String(value), chart.left - 6, yMap(value), tall ? 9 : 12, 30, colors, 'right');

  const ticks = xMax <= 50 ? [0, 25, 50] : [0, Math.round(xMax / 2 / 10) * 10, Math.round(xMax)];

  for (const n of ticks) text(pen, String(n), xMap(n), chart.bottom + 12, tall ? 9 : 12, 45, colors);

  text(pen, 'STEPS', x, chart.bottom + 27, tall ? 9 : 12, box.w - 5, colors);

  if (time >= 15000) {
    pen.strokeStyle = claimed ? colors.blue : colors.ink;
    pen.lineWidth = claimed ? 2.2 : 1;
    pen.setLineDash(claimed ? [5, 4] : [3, 3]);
    line(pen, chart.left, yMap(model.floor), chart.right, yMap(model.floor), smooth(time, 15000, 16800));
    pen.setLineDash([]);
  }

  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.4;
  pen.beginPath();

  for (const [index, row] of model.energies.entries()) {
    if (row.step > step) break;

    if (index === 0) pen.moveTo(xMap(row.step), yMap(row.energy));
    else pen.lineTo(xMap(row.step), yMap(row.energy));
  }

  const energy = energyValue(model, step);
  const current = { x: xMap(step), y: yMap(energy) };
  pen.lineTo(current.x, current.y);
  pen.stroke();
  pen.fillStyle = colors.ink;
  dot(pen, current, tall ? 2.8 : 3.8);
  const labelX = Math.min(chart.right - 25, Math.max(chart.left + 27, current.x));
  const labelY = current.y - 20 < chart.top + 6 ? current.y + 18 : current.y - 20;
  line(pen, current.x, current.y, labelX, labelY + (labelY < current.y ? 4 : -4));
  text(pen, energy.toFixed(step >= 2100 ? 5 : 3), labelX, labelY, tall ? 11 : 15, 75, colors);

  if (time >= 15000) {
    text(pen, `TRIANGULAR FLOOR ${model.floor.toFixed(5)}`, x, box.y + box.h - (compact ? 8 : 29), tall ? 10 : 13, box.w - 4, colors, 'center', claimed ? colors.blue : colors.ink);
  }

  if (!compact) {
    const footer = claimed ? 'CLAIMED: NOTHING BELOW · EVERY COMPLETELY MONOTONE g' : time >= 32250 ? 'PROVED FOR LATTICES · IRREGULAR CONFIGURATIONS: OPEN' : 'ONE SEEDED RUN · WRAPPED PATCH';
    text(pen, footer, x, box.y + box.h - 9, tall ? 8.5 : 11, box.w - 4, colors, 'center', claimed ? colors.blue : colors.ink);
  }
}

function ratioStrip(pen: CanvasRenderingContext2D, box: Box, colors: Colors, model: FloorModel, tall: boolean): void {
  const x = box.x + box.w / 2;
  const chart = { left: box.x + 12, right: box.x + box.w - 11, top: box.y + 35, bottom: box.y + box.h - 68 };
  const yMap = (ratio: number) => chart.bottom - Math.log(ratio) / Math.log(70) * (chart.bottom - chart.top);
  const column = (chart.right - chart.left) / model.byAlpha.length;
  text(pen, 'COST ÷ TRIANGULAR · LOG SCALE', x, box.y + 10, tall ? 10 : 14, box.w - 4, colors);
  text(pen, 'SQUARE / HONEYCOMB CORNERS', x, box.y + 25, tall ? 8.5 : 11, box.w - 4, colors);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .8;
  line(pen, chart.left, chart.bottom, chart.right, chart.bottom);
  text(pen, '1', chart.left - 4, chart.bottom, tall ? 10 : 13, 16, colors, 'right');
  text(pen, '63', chart.left - 4, yMap(63), tall ? 9 : 12, 22, colors, 'right');

  for (const [index, row] of model.byAlpha.entries()) {
    const cx = chart.left + column * (index + .5);
    const square = row.square / row.triangular;
    const honeycomb = row.honeycomb / row.triangular;
    const width = Math.max(3, column * .23);
    const firstX = cx - width - 1;
    const secondX = cx + 1;
    pen.fillStyle = colors.ink;
    pen.fillRect(firstX, yMap(square), width, chart.bottom - yMap(square));
    hatch(pen, { x: secondX, y: yMap(honeycomb), w: width, h: chart.bottom - yMap(honeycomb) }, colors);
    pen.strokeRect(secondX, yMap(honeycomb), width, chart.bottom - yMap(honeycomb));
    dot(pen, { x: firstX + width / 2, y: yMap(square) }, 1.5);
    text(pen, String(row.alpha), cx, chart.bottom + 12, tall ? 9 : 12, column - 2, colors);
    text(pen, square < 1.001 ? square.toFixed(5) : square < 2 ? square.toFixed(3) : square.toFixed(2), cx, box.y + box.h - 36, tall ? 9 : 12, column - 2, colors);
    text(pen, honeycomb < 2 ? honeycomb.toFixed(3) : honeycomb.toFixed(1), cx, box.y + box.h - 21, tall ? 9 : 12, column - 2, colors);
  }

  text(pen, 'α', chart.right + 3, chart.bottom + 12, tall ? 12 : 16, 16, colors);
  text(pen, 'COMPUTED COMPARISONS · AMONG LATTICES: PROVED', x, box.y + box.h - 4, tall ? 8.5 : 11, box.w - 3, colors);
}

function pushFamily(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, tall: boolean): void {
  const chart = { left: box.x + 23, right: box.x + box.w - 20, top: box.y + 29, bottom: box.y + box.h - 44 };
  const amount = smooth(time, 40250, 43500);
  const x = box.x + box.w / 2;
  text(pen, 'ONE PATTERN FOR EVERY PUSH', x, box.y + 10, tall ? 11 : 15, box.w - 5, colors);
  axes(pen, chart, colors);
  const alphas = [.5, 1, 2];
  pen.strokeStyle = colors.ink;

  for (const [index, alpha] of alphas.entries()) {
    pen.lineWidth = index === 1 ? 1.6 : .85;
    pen.setLineDash(index === 0 ? [3, 3] : []);
    curve(pen, chart, t => gaussian(Math.sqrt(t), alpha), .3, 3, 0, 3.5, amount);
    const t = .35 + index * .48;
    text(pen, `α = ${alpha}`, chart.left + (t - .3) / 2.7 * (chart.right - chart.left) + 18, chart.bottom - gaussian(Math.sqrt(t), alpha) / 3.5 * (chart.bottom - chart.top) - 12, tall ? 11 : 15, 65, colors);
  }

  pen.setLineDash([5, 3]);
  curve(pen, chart, t => 1 / t, .3, 3, 0, 3.5, amount);
  pen.setLineDash([]);
  place('inverse', chart.right - 12, chart.bottom - (1 / 3) / 3.5 * (chart.bottom - chart.top) - 16);
  text(pen, 'SQUARED DISTANCE t', x, chart.bottom + 14, tall ? 9 : 12, box.w - 6, colors);
  text(pen, 'COHN–KUMAR 2007 · CONJECTURE 9.4', x, box.y + box.h - 8, tall ? 9 : 12, box.w - 6, colors);
}

function dimensionLedger(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: FloorModel, tall: boolean): void {
  const claimed = time >= 60750;
  const x = box.x + box.w / 2;
  const step = tall ? 28 : 37;
  const start = box.y + 18;
  const ringX = box.x + box.w - (tall ? 15 : 22);
  const rows = ['DIMENSION 8 · EIGHT-DIMENSIONAL E₈', 'DIMENSION 24 · LEECH · PROVED 2022', claimed ? 'DIMENSION 2 · TRIANGULAR · CLAIMED' : 'DIMENSION 2 · TRIANGULAR · OPEN'];

  for (const [index, words] of rows.entries()) {
    const y = start + index * step;
    text(pen, index === 0 ? 'DIMENSION 8 · PROVED 2022' : words, index === 0 ? box.x + box.w * .43 : x - 12, y, tall ? 10 : 14, index === 0 ? box.w * .76 : box.w - 34, colors, 'center', index === 2 && claimed ? colors.blue : colors.ink);
    pen.strokeStyle = index === 2 && claimed ? colors.blue : colors.ink;
    pen.fillStyle = pen.strokeStyle;
    pen.lineWidth = index === 2 && claimed ? 1.8 : 1;
    dot(pen, { x: ringX, y }, tall ? 3.5 : 4.5, index < 2 || claimed);
  }

  place('e8', box.x + box.w * .83, start);

  if (claimed) {
    const y = start + step * 2 + (tall ? 24 : 33);
    text(pen, `PACKING: π/(2√3) = ${model.packingDensity.toFixed(4)} IS EXACT`, x, y, tall ? 9 : 12, box.w - 5, colors);
    text(pen, 'COULOMB GAS · SANDIER–SERFATY', x, y + (tall ? 17 : 23), tall ? 9 : 12, box.w - 5, colors);
    text(pen, 'SPHERE · BRAUCHART–HARDIN–SAFF', x, y + (tall ? 34 : 46), tall ? 9 : 12, box.w - 5, colors);
    text(pen, 'INFINITE ENERGIES INCLUDED', x, box.y + box.h - 4, tall ? 9 : 12, box.w - 5, colors, 'center', colors.blue);
  } else {
    text(pen, 'COHN · KUMAR · MILLER · RADCHENKO · VIAZOVSKA', x, box.y + box.h - 26, tall ? 8.5 : 11, box.w - 6, colors);
    text(pen, 'THE PLANE STAYED OPEN', x, box.y + box.h - 7, tall ? 11 : 15, box.w - 6, colors);
  }
}

function lowerBox(panel: Box): Box {
  return { x: panel.x, y: panel.y + panel.h * .50, w: panel.w, h: panel.h * .50 };
}

function phoneCertificateBox(panel: Box): Box {
  return { x: panel.x, y: panel.y + 18, w: panel.w, h: panel.h - 18 };
}

function carriedClaim(pen: CanvasRenderingContext2D, box: Box, colors: Colors, model: FloorModel): void {
  const y = box.y + 6;
  pen.strokeStyle = colors.blue;
  pen.fillStyle = colors.blue;
  pen.lineWidth = 1.6;
  pen.setLineDash([3, 3]);
  line(pen, box.x + 4, y, box.x + 24, y);
  pen.setLineDash([]);
  text(pen, `CLAIMED FLOOR ${model.floor.toFixed(4)}`, box.x + box.w * .44, y, 9, box.w - 62, colors, 'center', colors.blue);
  dot(pen, { x: box.x + box.w - 22, y }, 3.4);
  text(pen, '2', box.x + box.w - 10, y, 11, 14, colors, 'center', colors.blue);
}

function certificatePlot(box: Box, tall: boolean): Plot {
  const top = box.y + (tall ? 23 : 25);

  return { left: box.x + 12, right: box.x + box.w - 15, top, bottom: top + (tall ? 30 : 40) };
}

function certificatePoint(chart: Plot, radius: number, value: number): Point {
  return { x: chart.left + radius / 2.4 * (chart.right - chart.left), y: chart.bottom - (value + .18) / 1.23 * (chart.bottom - chart.top) };
}

export function contactTargets(panelBox: Box, model: FloorModel, tall: boolean): Point[] {
  const box = tall ? phoneCertificateBox(panelBox) : lowerBox(panelBox);
  const chart = certificatePlot(box, tall);

  return model.shells.slice(0, 3).map(shell => certificatePoint(chart, shell.radius, shell.value));
}

function schematicAuxiliary(radius: number, radii: readonly number[]): number {
  let left = 0;
  let right = 2.4;

  for (const contact of radii) {
    if (radius <= contact) {
      right = contact;
      break;
    }

    left = contact;
  }

  const dip = .12 * Math.sin(Math.PI * (radius - left) / (right - left)) ** 2;

  return gaussian(radius) - dip;
}

function contactValues(pen: CanvasRenderingContext2D, box: Box, chart: Plot, time: number, colors: Colors, model: FloorModel, tall: boolean): number {
  const start = chart.bottom + (tall ? 10 : 13);
  const step = tall ? 13 : 18;
  const values = ['0.02658', '1.88 × 10⁻⁵', '4.99 × 10⁻⁷'];

  for (const [index, shell] of model.shells.slice(0, 3).entries()) {
    const arrival = CONTACT_ARRIVALS[index];

    if (arrival === undefined) throw new Error('Each of the three contact shells has an arrival time.');
    if (time < arrival) continue;

    const target = certificatePoint(chart, shell.radius, shell.value);
    const y = start + index * step;
    const labelX = box.x + box.w / 2;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .8;
    line(pen, target.x, target.y, labelX + (index - 1) * 32, y - 7);
    pen.fillStyle = colors.ink;
    dot(pen, target, tall ? 2.2 : 3);
  }

  for (const [index, shell] of model.shells.slice(0, 3).entries()) {
    const arrival = CONTACT_ARRIVALS[index];

    if (arrival === undefined) throw new Error('Each of the three contact shells has an arrival time.');
    if (time < arrival) continue;

    text(pen, `r = ${shell.radius.toFixed(4)} · G = ${values[index]} · ${shell.count} POINTS`, box.x + box.w / 2, start + index * step, tall ? 9.5 : 12, box.w - 5, colors);
  }

  return start + 2 * step;
}

function certificate(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: FloorModel, tall: boolean, close = false): void {
  const x = box.x + box.w / 2;
  const chart = certificatePlot(box, tall);
  const zeroY = certificatePoint(chart, 0, 0).y;
  const radii = model.shells.slice(0, 3).map(shell => shell.radius);
  place('gaussian', box.x + box.w * .65, box.y + 9);
  text(pen, 'r: 0 TO 2.4', chart.left, box.y + 9, tall ? 8.5 : 11, box.w * .36, colors, 'left');
  axes(pen, chart, colors, zeroY);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.1;
  curve(pen, chart, radius => gaussian(radius), 0, 2.4, -.18, 1.05);

  if (!close) {
    pen.setLineDash([3, 3]);
    curve(pen, chart, radius => schematicAuxiliary(radius, radii), 0, 2.4, -.18, 1.05, smooth(time, 70750, 74800));
    pen.setLineDash([]);
    text(pen, 'f', certificatePoint(chart, .56, gaussian(.56) - .08).x, certificatePoint(chart, .56, gaussian(.56) - .08).y + 9, tall ? 12 : 17, 20, colors);
  }

  text(pen, 'r', chart.right + 9, zeroY, tall ? 12 : 16, 15, colors);
  const labelsEnd = contactValues(pen, box, chart, time, colors, model, tall);

  if (close) return;

  const fourier = { left: chart.left, right: chart.right, top: labelsEnd + (tall ? 28 : 33), bottom: box.y + box.h - (tall ? 68 : 82) };
  text(pen, 'FOURIER TRANSFORM: NEVER BELOW 0', x, labelsEnd + (tall ? 17 : 20), tall ? 9 : 12, box.w - 5, colors);
  axes(pen, fourier, colors);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.2;
  curve(pen, fourier, radius => {
    let value = 1.1596 * Math.exp(-radius * radius);

    for (const contact of radii) value *= (radius - contact) ** 2 / contact ** 2;

    return value;
  }, 0, 2.4, 0, 1.3, smooth(time, 74900, 80400));

  for (const shell of model.shells.slice(0, 3)) dot(pen, { x: fourier.left + shell.radius / 2.4 * (fourier.right - fourier.left), y: fourier.bottom }, tall ? 2 : 2.6, false);

  place('bound', x, box.y + box.h - (tall ? 40 : 47));
  text(pen, 'f AND SPECTRUM SCHEMATIC · CONTACTS EXACT', x, box.y + box.h - 4, tall ? 8.5 : 11, box.w - 5, colors);
}

function mixture(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: FloorModel, tall: boolean): void {
  const x = box.x + box.w / 2;
  const chart = { left: box.x + 24, right: box.x + box.w - 18, top: box.y + 30, bottom: box.y + box.h - 63 };
  const clock = progress(time, 85000, 93100) * model.mixture.length;
  const terms = Math.min(model.mixture.length, Math.floor(clock));
  const incoming = Math.min(1, clock - terms);
  text(pen, 'ASSEMBLE 1/t FROM GAUSSIANS', x, box.y + 10, tall ? 11 : 15, box.w - 5, colors);
  axes(pen, chart, colors);
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .65;

  for (let count = 1; count <= terms; count++) curve(pen, chart, t => mixtureValue(t, model.mixture, count), .3, 3, 0, 3.5);

  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.8;
  curve(pen, chart, t => {
    const next = model.mixture[terms];
    const addition = next ? incoming * next.weight * Math.exp(-Math.PI * next.alpha * t) : 0;

    return mixtureValue(t, model.mixture, terms) + addition;
  }, .3, 3, 0, 3.5);
  pen.setLineDash([4, 4]);
  pen.lineWidth = 1;
  curve(pen, chart, t => 1 / t, .3, 3, 0, 3.5);
  pen.setLineDash([]);
  place('inverse', chart.right - 5, chart.bottom - (1 / 3) / 3.5 * (chart.bottom - chart.top) - 15);
  text(pen, '.3', chart.left, chart.bottom + 12, tall ? 10 : 13, 30, colors);
  text(pen, '3', chart.right, chart.bottom + 12, tall ? 10 : 13, 25, colors);
  text(pen, 't', chart.right + 10, chart.bottom + 12, tall ? 12 : 16, 15, colors);
  const active = model.mixture[Math.min(model.mixture.length - 1, terms)];

  if (active) text(pen, `α = ${active.alpha.toPrecision(3)} · WEIGHT ${active.weight.toPrecision(3)}`, x, box.y + box.h - 34, tall ? 10 : 14, box.w - 4, colors);

  text(pen, terms >= model.mixture.length ? '12 BELLS · WITHIN 0.4 % ON [.3, 3]' : `ADDING BELL ${Math.min(12, terms + 1)} OF 12`, x, box.y + box.h - 12, tall ? 11 : 15, box.w - 5, colors);
}

function blocks(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, tall: boolean): void {
  const x = box.x + box.w / 2;
  const size = Math.min(box.w * .37, box.h * .43);
  const step = size / 20;
  const gap = box.w * .075;
  const left = x - size - gap / 2;
  const top = box.y + 24;
  const amount = smooth(time, 94000, 97800);
  text(pen, 'TWO FINITE 20 × 20 BLOCKS', x, box.y + 10, tall ? 11 : 15, box.w - 5, colors);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .55;
  pen.beginPath();

  for (const offset of [0, size + gap]) {
    for (let index = 0; index <= 20 * amount; index++) {
      const at = index * step;
      pen.moveTo(left + offset + at, top);
      pen.lineTo(left + offset + at, top + size);
      pen.moveTo(left + offset, top + at);
      pen.lineTo(left + offset + size, top + at);
    }
  }

  pen.stroke();
  const tailY = top + size + 14;
  const tailLeft = left;

  for (let index = 0; index < 16; index++) {
    const width = size * .16 * .88 ** index;
    const px = tailLeft + index * size * .095;
    pen.strokeRect(px, tailY, width, Math.max(1, width * .7));
  }

  text(pen, 'ABSOLUTELY SUMMABLE TAIL', x, box.y + box.h - 37, tall ? 10 : 14, box.w - 4, colors);
  text(pen, 'DATA AND CHECKERS SHIP WITH THE PAPER', x, box.y + box.h - 20, tall ? 9 : 12, box.w - 4, colors);
  text(pen, 'SCHEMATIC · NOT RUN BY URUK', x, box.y + box.h - 3, tall ? 9 : 12, box.w - 4, colors);
}

function caveats(pen: CanvasRenderingContext2D, box: Box, colors: Colors, tall: boolean): void {
  const x = box.x + box.w / 2;
  text(pen, 'MINIMUM VALUE: CLAIMED', x, box.y + box.h * .23, tall ? 14 : 20, box.w - 5, colors, 'center', colors.blue);
  text(pen, 'EVERY MINIMIZER: NOT CLAIMED', x, box.y + box.h * .46, tall ? 12 : 17, box.w - 5, colors);
  text(pen, 'ONE f PER MIXED POTENTIAL:\nNOT CLAIMED', x, box.y + box.h * .68, tall ? 12 : 17, box.w - 5, colors);
}

function closingLedger(pen: CanvasRenderingContext2D, box: Box, colors: Colors, tall: boolean): void {
  const x = box.x + box.w / 2;
  text(pen, 'UNREVIEWED', x, box.y + 14, tall ? 18 : 26, box.w - 5, colors);
  text(pen, 'LEAN: FOUR COMPARATOR STATEMENTS\nNONE CATALOGUED', x, box.y + (tall ? 40 : 49), tall ? 10 : 14, box.w - 4, colors);
  text(pen, 'CERTIFICATES SHIPPED · NOT RUN BY URUK', x, box.y + box.h - 5, tall ? 9 : 12, box.w - 4, colors);
}

export function drawCharts(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: FloorModel, tall: boolean): void {
  pen.strokeStyle = colors.ink;
  pen.fillStyle = colors.ink;
  pen.lineWidth = 1;
  pen.setLineDash([]);

  if (time < 9000) {
    const chart = { left: box.x + 24, right: box.x + box.w - 21, top: box.y + 35, bottom: box.y + box.h - 32 };
    place('gaussian', box.x + box.w / 2, box.y + 10);
    axes(pen, chart, colors);
    pen.strokeStyle = colors.ink;
    curve(pen, chart, radius => gaussian(radius), 0, 2.4, 0, 1.05, smooth(time, 0, 2100));
    text(pen, 'DISTANCE r', box.x + box.w / 2, chart.bottom + 15, tall ? 10 : 14, box.w - 5, colors);

    return;
  }

  if (time >= 110000) {
    if (tall) {
      energyChart(pen, { x: box.x, y: box.y, w: box.w, h: box.h * .57 }, time, colors, model, true, true);
      closingLedger(pen, { x: box.x, y: box.y + box.h * .62, w: box.w, h: box.h * .38 }, colors, true);
    } else {
      energyChart(pen, { x: box.x, y: box.y, w: box.w, h: box.h * .40 }, time, colors, model, false, true);
      certificate(pen, { x: box.x, y: box.y + box.h * .43, w: box.w, h: box.h * .35 }, time, colors, place, model, false, true);
      closingLedger(pen, { x: box.x, y: box.y + box.h * .80, w: box.w, h: box.h * .20 }, colors, false);
    }

    return;
  }

  const ratios = time >= 25250 && time < 32250;

  if (tall) {
    const preserveClaim = time >= 69750 && time < 101250;
    const active = preserveClaim ? phoneCertificateBox(box) : box;

    if (preserveClaim) carriedClaim(pen, box, colors, model);

    if (ratios) ratioStrip(pen, box, colors, model, true);
    else if (time < 40250) energyChart(pen, box, time, colors, model, true);
    else if (time < 51000) pushFamily(pen, box, time, colors, place, true);
    else if (time < 69750) dimensionLedger(pen, box, time, colors, place, model, true);
    else if (time < 85000) certificate(pen, active, time, colors, place, model, true);
    else if (time < 94000) mixture(pen, active, time, colors, place, model, true);
    else if (time < 101250) blocks(pen, active, time, colors, true);
    else {
      energyChart(pen, { x: box.x, y: box.y, w: box.w, h: box.h * .60 }, time, colors, model, true, true);
      caveats(pen, { x: box.x, y: box.y + box.h * .63, w: box.w, h: box.h * .37 }, colors, true);
    }

    return;
  }

  let split = 0;

  if (ratios) split = smooth(time, 25250, 26100);
  else if (time >= 32250 && time < 33100) split = 1 - smooth(time, 32250, 33100);
  else if (time >= 40250) split = smooth(time, 40250, 41100);

  energyChart(pen, { x: box.x, y: box.y, w: box.w, h: mix(box.h, box.h * .46, split) }, time, colors, model, false, split > 0);

  if (split === 0) return;

  const lower = { x: box.x, y: mix(box.y + box.h + 12, box.y + box.h * .50, split), w: box.w, h: box.h * .50 };

  if (ratios) ratioStrip(pen, lower, colors, model, false);
  else if (time >= 40250 && time < 51000) pushFamily(pen, lower, time, colors, place, false);
  else if (time >= 51000 && time < 69750) dimensionLedger(pen, lower, time, colors, place, model, false);
  else if (time >= 69750 && time < 85000) certificate(pen, lower, time, colors, place, model, false);
  else if (time >= 85000 && time < 94000) mixture(pen, lower, time, colors, place, model, false);
  else if (time >= 94000 && time < 101250) blocks(pen, lower, time, colors, false);
  else if (time >= 101250) caveats(pen, lower, colors, false);
}

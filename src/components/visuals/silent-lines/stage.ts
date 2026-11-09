import { SELECTED_HIGH_CELL, SELECTED_LOW_CELL } from './data';
import { frequency, growthCell, referenceFor, type Contour, type Mode, type Point } from './math';
import { GRAIN_COUNT, GRAIN_PASS_STARTS, PHONE_GRAIN_COUNT, grainAt, seedGrains, type ModeNumerics } from './transport';

export type Box = { x: number; y: number; w: number; h: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

export type PlateGeometry = { x: number; y: number; size: number };

const INITIAL_GRAINS = seedGrains();

function progress(time: number, start: number, end: number): number {
  return Math.max(0, Math.min(1, (time - start) / (end - start)));
}

function smooth(time: number, start: number, end: number): number {
  const amount = progress(time, start, end);

  return amount * amount * (3 - 2 * amount);
}

export function plateGeometry(box: Box): PlateGeometry {
  const size = Math.min(box.w - 12, box.h - 36);

  return { x: box.x + (box.w - size) / 2, y: box.y + 17, size };
}

export function grainCountFor(box: Box): number {
  return box.w < 400 ? PHONE_GRAIN_COUNT : GRAIN_COUNT;
}

function text(pen: CanvasRenderingContext2D, words: string, x: number, y: number, size: number, width: number, colors: Colors): void {
  const family = /[λβηξε]/u.test(words) ? '"Garamond Math", "Alegreya", serif' : '"Special Elite", monospace';
  pen.font = `${size}px ${family}`;
  const measured = pen.measureText(words).width;

  if (measured > width) pen.font = `${Math.max(8, size * width / measured)}px ${family}`;

  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  const actualWidth = pen.measureText(words).width;
  pen.fillStyle = colors.paper;
  pen.fillRect(x - actualWidth / 2 - 2, y - size * .62, actualWidth + 4, size * 1.24);
  pen.fillStyle = colors.ink;
  pen.fillText(words, x, y);
}

function screen(plate: PlateGeometry, point: Point): Point {
  return { x: plate.x + point.x * plate.size, y: plate.y + (1 - point.y) * plate.size };
}

function partialRectangle(pen: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, amount: number): void {
  const corners = [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }, { x, y }];
  pen.beginPath();

  for (let side = 0; side < 4; side++) {
    const from = corners[side];
    const to = corners[side + 1];
    const length = Math.min(1, Math.max(0, amount * 4 - side));

    if (!from || !to || length === 0) continue;

    pen.moveTo(from.x, from.y);
    pen.lineTo(from.x + (to.x - from.x) * length, from.y + (to.y - from.y) * length);
  }

  pen.stroke();
}

function passAt(time: number): number {
  let pass = 0;

  for (const [index, start] of GRAIN_PASS_STARTS.entries()) {
    if (time >= start) pass = index;
  }

  return pass;
}

function drawPaths(pen: CanvasRenderingContext2D, contour: Contour, plate: PlateGeometry, reveal: number, reflectedX = false, reflectedY = false): void {
  let remaining = contour.segments.length / 4 * reveal;
  pen.beginPath();

  for (const path of contour.paths) {
    if (remaining <= 0) break;

    const point = (index: number): Point => screen(plate, { x: reflectedX ? 1 - (path[index] ?? 0) : path[index] ?? 0, y: reflectedY ? 1 - (path[index + 1] ?? 0) : path[index + 1] ?? 0 });
    const first = point(0);
    pen.moveTo(first.x, first.y);

    for (let index = 2; index < path.length && remaining > 0; index += 2) {
      const target = point(index);

      if (remaining >= 1) pen.lineTo(target.x, target.y);
      else {
        const from = point(index - 2);
        pen.lineTo(from.x + (target.x - from.x) * remaining, from.y + (target.y - from.y) * remaining);
      }

      remaining--;
    }
  }

  pen.stroke();
}

function drawGrains(pen: CanvasRenderingContext2D, plate: PlateGeometry, box: Box, data: ModeNumerics | undefined, phase: number, time: number, colors: Colors): void {
  const count = Math.min(grainCountFor(box), data?.tracks.count ?? GRAIN_COUNT);
  const size = box.w < 400 ? 1 : 1.1;
  pen.fillStyle = colors.ink;
  pen.beginPath();

  for (let id = 0; id < count; id++) {
    const point = data ? grainAt(data.tracks, id, phase) : { x: INITIAL_GRAINS[id * 2] ?? 0, y: INITIAL_GRAINS[id * 2 + 1] ?? 0 };
    const position = screen(plate, point);
    const fall = time < 700 ? (1 - smooth(time, id % 7 * 30, 490 + id % 7 * 30)) * plate.size * .08 : 0;
    pen.rect(position.x - size / 2, position.y - size / 2 - fall, size, size);
  }

  pen.fill();
}

function drawBow(pen: CanvasRenderingContext2D, plate: PlateGeometry, time: number, colors: Colors): void {
  if (time >= 2400) return;

  const touch = smooth(time, 350, 1000) * (1 - smooth(time, 1500, 2400));
  const x = plate.x - 3 - (1 - touch) * plate.size * .3;
  const y = plate.y + plate.size * .52;
  const reach = plate.size * .17;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.1;
  pen.beginPath();
  pen.moveTo(x, y - reach);
  pen.quadraticCurveTo(x - 16, y, x, y + reach);
  pen.lineTo(x, y - reach);
  pen.stroke();
}

function drawGrid(pen: CanvasRenderingContext2D, plate: PlateGeometry, q: number, time: number, colors: Colors): void {
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .45;
  pen.beginPath();

  for (let index = 0; index <= q; index++) {
    const amount = smooth(time, 57100 + index * 38, 58000 + index * 38);
    const x = plate.x + index / q * plate.size;
    const y = plate.y + index / q * plate.size;
    pen.moveTo(x, plate.y);
    pen.lineTo(x, plate.y + plate.size * amount);
    pen.moveTo(plate.x, y);
    pen.lineTo(plate.x + plate.size * amount, y);
  }

  pen.stroke();
}

function growthShade(pen: CanvasRenderingContext2D, plate: PlateGeometry, mode: Mode, time: number, colors: Colors): void {
  if (time < 69000) return;

  const reference = referenceFor(mode);
  const count = Math.floor(progress(time, 69000, 70600) * reference.q ** 2);
  const side = plate.size / reference.q;
  pen.save();
  pen.fillStyle = colors.ink;

  for (let index = 0; index < count; index++) {
    const E = reference.growth[index] ?? 0;
    const level = Math.min(4, Math.max(0, Math.floor((E - .7) / (3.3 - .7) * 5)));
    pen.globalAlpha = [.035, .07, .11, .15, .2][level] ?? .2;
    pen.fillRect(plate.x + Math.floor(index / reference.q) * side, plate.y + (reference.q - 1 - index % reference.q) * side, side, side);
  }

  pen.restore();
}

function growthFocus(pen: CanvasRenderingContext2D, plate: PlateGeometry, box: Box, mode: Mode, time: number, colors: Colors): void {
  if (time < 64000 || time >= 72000) return;

  const reference = referenceFor(mode);
  const move = smooth(time, 66500, 67250);
  const high = growthCell(mode, ...SELECTED_HIGH_CELL);
  const low = growthCell(mode, ...SELECTED_LOW_CELL);
  const centre = { x: high.centre.x + (low.centre.x - high.centre.x) * move, y: high.centre.y + (low.centre.y - high.centre.y) * move };
  const point = screen(plate, centre);
  const radius = plate.size / reference.q;
  const disks = smooth(time, 64000, 64800) * (1 - smooth(time, 69000, 69900));
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .8;

  for (const factor of [1, 4]) {
    pen.beginPath();
    pen.arc(point.x, point.y, radius * factor * disks, 0, Math.PI * 2);
    pen.stroke();
  }

  if (disks > 0) {
    pen.lineWidth = 1.35;
    pen.strokeRect(point.x - radius / 2, point.y - radius / 2, radius, radius);
  }

  const footerY = plate.y + plate.size + 11;

  if (move > 0 && move < 1) text(pen, 'MOVING TO SQUARE (7,7)', plate.x + plate.size / 2, footerY, 9.5, box.w, colors);
  else if (time < 69900) {
    const cell = move === 0 ? high : low;
    const label = move === 0 ? '(4,9)' : '(7,7)';
    text(pen, `${label}: E ≈ ${cell.E.toFixed(2)} · L ≈ ${cell.length.toFixed(3)}`, plate.x + plate.size / 2, footerY, 9.5, box.w, colors);
  } else text(pen, 'EVERY SQUARE: L ≤ 0.47s(1+E)', plate.x + plate.size / 2, footerY, 9.5, box.w, colors);

  if (time < 69000) text(pen, 's', point.x + radius * .65, point.y - 3, 9, 18, colors);
  if (time < 69000) text(pen, '4s', point.x + radius * 3.4, point.y - 6, 9, 22, colors);
}

function highGrowthSquares(pen: CanvasRenderingContext2D, plate: PlateGeometry, mode: Mode, time: number, colors: Colors): void {
  if (time < 78250) return;

  const reference = referenceFor(mode);
  const side = plate.size / reference.q;
  let order = 0;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.3;

  for (const [index, E] of reference.growth.entries()) {
    if (E <= reference.growthMean + 1) continue;

    const amount = smooth(time, 78250 + order * 90, 78800 + order * 90);
    const x = Math.floor(index / reference.q);
    const y = index % reference.q;
    partialRectangle(pen, plate.x + x * side, plate.y + (reference.q - 1 - y) * side, side, side, amount);
    order++;
  }
}

function footer(pen: CanvasRenderingContext2D, box: Box, plate: PlateGeometry, mode: Mode, length: number | undefined, time: number, mirror: number, colors: Colors): void {
  if (time >= 64000 && time < 72000) return;

  let words = `√λ = ${frequency(mode).toFixed(2)}`;

  if (length !== undefined) words += ` · LENGTH ≈ ${length.toFixed(2)}`;

  if (mirror > .02 && length !== undefined) words = `PLATE ${length.toFixed(2)} · TORUS ${(length * 4).toFixed(2)}`;
  if (time >= 56500 && time < 64000) words = `FLAT PLATE: p = 1 · k = ${frequency(mode).toFixed(2)} · s = 1/${Math.ceil(frequency(mode))}`;
  if (time >= 72000 && time < 78250) {
    const reference = referenceFor(mode);
    words = `${reference.q ** 2} SQUARES · MEAN E ≈ ${reference.growthMean.toFixed(2)}`;
  }
  if (time >= 78250 && time < 85250) words = `${referenceFor(mode).highSquares} SQUARES ABOVE MEAN + 1`;

  text(pen, words, plate.x + plate.size / 2, plate.y + plate.size + 11, box.w < 400 ? 9.5 : 11, box.w, colors);
}

/** Plate only. Counterexample drawing owns the middle interval and the closing grain carry. */
export function drawStage(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, numerics: readonly (ModeNumerics | undefined)[]): void {
  if (time >= 85250 && time < 109500) return;

  const plate = plateGeometry(box);
  const requested = time >= 109500 ? 6 : passAt(time);
  const data = numerics[requested];

  if (!data) {
    pen.save();
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1.05;
    partialRectangle(pen, plate.x, plate.y, plate.size, plate.size, 1);
    pen.save();
    pen.beginPath();
    pen.rect(plate.x, plate.y, plate.size, plate.size);
    pen.clip();
    drawGrains(pen, plate, box, undefined, 0, time, colors);
    pen.restore();
    text(pen, 'CALCULATING THIS NOTE', box.x + box.w / 2, box.y + 5, 11, box.w, colors);
    pen.restore();

    return;
  }

  const mode = data.contour.mode;
  const pass = requested;
  const start = GRAIN_PASS_STARTS[pass] ?? 0;
  const phase = time >= 109500 ? 1 : smooth(time, start + (pass === 0 ? 700 : 0), start + (pass === 0 ? 2600 : 1800));
  const mirror = smooth(time, 20000, 21000) * (1 - smooth(time, 22000, 24000));
  const tile = plate.size / (1 + mirror);
  const original = { x: plate.x, y: plate.y + plate.size - tile, size: tile };
  const returning = time >= 109500;
  const boundary = returning ? progress(time, 109500, 110600) : Math.max(.02, smooth(time, 0, 850));
  pen.save();
  pen.beginPath();
  pen.rect(box.x - 2, box.y - 2, box.w + 4, box.h + 4);
  pen.clip();
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.05;
  partialRectangle(pen, plate.x, plate.y, plate.size, plate.size, boundary);
  pen.save();
  pen.beginPath();
  pen.rect(plate.x, plate.y, plate.size, plate.size);
  pen.clip();
  const growing = pass === 6 && time >= 56500 && time < 85250;

  if (growing) growthShade(pen, plate, mode, time, colors);

  if (data) {
    const reveal = returning ? progress(time, 109500, 110600) : smooth(time, start, start + 500);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .85;
    drawPaths(pen, data.contour, original, reveal);

    if (mirror > 0) {
      drawPaths(pen, data.contour, { x: original.x + tile, y: original.y, size: tile }, reveal, true, false);
      drawPaths(pen, data.contour, { x: original.x, y: original.y - tile, size: tile }, reveal, false, true);
      drawPaths(pen, data.contour, { x: original.x + tile, y: original.y - tile, size: tile }, reveal, true, true);
      pen.strokeStyle = colors.ink;
      pen.lineWidth = .6;
      partialRectangle(pen, original.x, original.y, tile, tile, 1);
    }
  }

  if (growing) drawGrid(pen, plate, 19, time, colors);

  if (!(time >= 109500 && time < 110600)) drawGrains(pen, original, box, data, phase, time, colors);

  if (growing) highGrowthSquares(pen, plate, mode, time, colors);

  pen.restore();
  drawBow(pen, plate, time, colors);

  if (growing) growthFocus(pen, plate, box, mode, time, colors);

  let title = time < 7750 ? 'LAPLACE MODES OF A SQUARE WITH FREE EDGES' : 'HIGHER NOTES · FINER SILENT LINES';

  if (mirror > .02) title = 'FREE PLATE = FLAT TORUS FOLDED IN FOUR · CLOSED';
  if (time >= 31500 && time < 56500) title = "THIS FLAT PLATE IS ANALYTIC · ITS CASE IS 1988'S";
  if (time >= 56500 && time < 64000) title = '';
  if (time >= 64000 && time < 78250) title = time < 72000 ? 'R = 4 HERE · LOCAL GROWTH' : 'A BOUNDED AVERAGE CONTROLS THE SUM';
  if (time >= 78250 && time < 85250) title = 'MEAN NEAR 1.6 · LARGE VALUES IN A FEW SQUARES';
  if (returning) title = 'THE FLAT PLATE · ILLUSTRATION';

  if (title) text(pen, title, box.x + box.w / 2, box.y + 5, box.w < 400 ? 9.5 : 11.5, box.w, colors);

  if (time >= 56500 && time < 64000) place('local-equation', box.x + box.w / 2, box.y + 4);

  footer(pen, box, plate, mode, data.contour.length, time, mirror, colors);
  pen.restore();
}

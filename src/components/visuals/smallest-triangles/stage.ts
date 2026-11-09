import { COLUMN_FIXTURE } from './data';
import { columnArea, triangleDeterminant, type Point } from './math';
import { motionAt, progress, smooth, trayShiftAt, type Minimum, type MovingPoint, type StageState } from './motion';

export type Box = { x: number; y: number; w: number; h: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

type Plot = { x: number; y: number; size: number };

type MatrixLayout = { x: number; y: number; stepX: number; stepY: number; font: number };

const COLUMN_AREA = columnArea();

function text(pen: CanvasRenderingContext2D, words: string, x: number, y: number, size: number, maxWidth: number, colors: Colors, align: CanvasTextAlign = 'center'): void {
  const family = /ξ/u.test(words) ? '"Garamond Math", serif' : /[Őő⁴¹]/u.test(words) ? '"Alegreya", serif' : '"Special Elite", monospace';
  pen.font = `${size}px ${family}`;
  const measured = pen.measureText(words).width;

  if (measured > maxWidth) pen.font = `${Math.max(8, size * maxWidth / measured)}px ${family}`;

  pen.textAlign = align;
  pen.textBaseline = 'middle';
  const width = pen.measureText(words).width;
  const left = align === 'left' ? x : align === 'right' ? x - width : x - width / 2;
  pen.fillStyle = colors.paper;
  pen.fillRect(left - 2, y - size * .62, width + 4, size * 1.24);
  pen.fillStyle = colors.ink;
  pen.fillText(words, x, y);
}

function plotFor(box: Box): Plot {
  const size = Math.min(box.h - 47, (box.w - 18) / 1.35);

  return { x: box.x + (box.w - size * 1.35) / 2, y: box.y + 23, size };
}

function screen(plot: Plot, point: Point): Point {
  return { x: plot.x + point.x * plot.size, y: plot.y + (1 - point.y) * plot.size };
}

function matrixFor(box: Box): MatrixLayout {
  const compact = box.h < 150;

  return compact
    ? { x: box.x + 20, y: box.y + 14, stepX: 25, stepY: 15, font: 13 }
    : { x: box.x + box.w * .27, y: box.y + box.h * .17, stepX: Math.min(42, box.w * .19), stepY: 31, font: 19 };
}

function line(pen: CanvasRenderingContext2D, from: Point, to: Point, amount = 1): void {
  pen.beginPath();
  pen.moveTo(from.x, from.y);
  pen.lineTo(from.x + (to.x - from.x) * amount, from.y + (to.y - from.y) * amount);
  pen.stroke();
}

function square(pen: CanvasRenderingContext2D, plot: Plot, time: number, colors: Colors): void {
  const amount = Math.max(.025, smooth(time, 0, 850)) * 4;
  const corners = [
    { x: plot.x, y: plot.y + plot.size },
    { x: plot.x + plot.size, y: plot.y + plot.size },
    { x: plot.x + plot.size, y: plot.y },
    { x: plot.x, y: plot.y },
    { x: plot.x, y: plot.y + plot.size },
  ];
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.05;

  for (let edge = 0; edge < 4; edge++) {
    const a = corners[edge];
    const b = corners[edge + 1];

    if (a && b && amount > edge) line(pen, a, b, Math.min(1, amount - edge));
  }

  text(pen, '0', plot.x - 5, plot.y + plot.size + 9, 9, 16, colors);
  text(pen, '1', plot.x + plot.size + 1, plot.y + plot.size + 9, 9, 16, colors);
}

function trianglePath(pen: CanvasRenderingContext2D, points: readonly Point[]): void {
  const first = points[0];

  if (!first) return;

  pen.beginPath();
  pen.moveTo(first.x, first.y);

  for (let index = 1; index < points.length; index++) {
    const point = points[index];

    if (point) pen.lineTo(point.x, point.y);
  }

  pen.closePath();
}

function hatchMinimum(pen: CanvasRenderingContext2D, plot: Plot, minimum: Minimum, colors: Colors): void {
  const points = minimum.points.map(point => screen(plot, point));
  const minX = Math.min(...points.map(point => point.x));
  const minY = Math.min(...points.map(point => point.y));
  const maxX = Math.max(...points.map(point => point.x));
  const maxY = Math.max(...points.map(point => point.y));
  pen.save();
  trianglePath(pen, points);
  pen.clip();
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .55;

  for (let x = minX - (maxY - minY) - 3; x <= maxX + 3; x += 3) line(pen, { x, y: maxY + 2 }, { x: x + maxY - minY + 4, y: minY - 2 });

  pen.restore();
  trianglePath(pen, points);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.25;
  pen.stroke();
}

function drawBadTriangles(pen: CanvasRenderingContext2D, plot: Plot, frame: StageState, colors: Colors): void {
  if (!frame.flash) return;

  const byId = new Map(frame.points.map(point => [point.id, point]));
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .45;
  pen.beginPath();

  for (const triple of frame.badTriangles) {
    const a = byId.get(triple[0]);
    const b = byId.get(triple[1]);
    const c = byId.get(triple[2]);

    if (!a || !b || !c) continue;

    const first = screen(plot, a);
    const second = screen(plot, b);
    const third = screen(plot, c);
    pen.moveTo(first.x, first.y);
    pen.lineTo(second.x, second.y);
    pen.lineTo(third.x, third.y);
    pen.closePath();
  }

  pen.stroke();
}

function drawTray(pen: CanvasRenderingContext2D, plot: Plot, time: number, colors: Colors): void {
  if (time < 19000) return;

  const left = 1.055 + trayShiftAt(time) * .9;
  const a = screen(plot, { x: left, y: .99 });
  const b = screen(plot, { x: left + .29, y: .13 });
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  pen.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
  text(pen, 'TRAY', (a.x + b.x) / 2, a.y - 9, 9, b.x - a.x, colors);
}

function pointDot(pen: CanvasRenderingContext2D, point: Point, radius: number, selected: boolean, colors: Colors): void {
  if (selected) {
    pen.strokeStyle = colors.ink;
    pen.fillStyle = colors.paper;
    pen.lineWidth = .9;
    pen.beginPath();
    pen.arc(point.x, point.y, radius + 2, 0, Math.PI * 2);
    pen.fill();
    pen.stroke();
  }

  pen.fillStyle = colors.ink;
  pen.beginPath();
  pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
  pen.fill();
}

function stageTitle(frame: StageState, time: number): string {
  if (frame.scene === 'random') return 'THIRTEEN SEEDED POINTS';
  if (frame.scene === 'grid') return time < 11900 ? 'CARRY THE POINTS TO THE GRID' : 'THREE IN A LINE · AREA ZERO';
  if (frame.scene === 'alteration') return frame.flash ? '78 TRIANGLES BELOW THE THRESHOLD' : time < 19000 ? 'THE SAME 13 + THIRTEEN MORE' : '26 → 13 · DELETE THE SMALL TRIANGLES';
  if (frame.scene === 'columns') return time < 80000 ? 'INTEGER COLUMNS BECOME POINTS' : 'RETURN TO THE PARABOLA';
  if (frame.scene === 'field') return 'DISTINCT FIELD LABELS · NONZERO DET';
  if (frame.scene === 'second-prime') return 'THE COLLINEAR CASE · A SECOND PRIME';
  if (frame.scene === 'replay') return 'THE SAME DELETION STEP';

  return 'ERDŐS’S PARABOLA · p = 13';
}

function regularReadout(pen: CanvasRenderingContext2D, box: Box, frame: StageState, colors: Colors): Point {
  const compact = box.h < 150;
  const centre = box.x + box.w / 2;
  const areaY = box.y + box.h * (compact ? .35 : .24);
  const exact = frame.minimum?.exact;
  const area = frame.minimum?.area;
  const words = exact === 'parabola' ? 'Δ = 1/338' : exact === 'grid' ? 'Δ = 0' : area === undefined ? 'PLACING THE POINTS' : `Δ ≈ ${area.toFixed(6)}`;
  const title = frame.scene === 'replay' || frame.scene === 'alteration' ? 'SMALLEST SURVIVING TRIANGLE' : 'SMALLEST TRIANGLE IN THE SQUARE';
  text(pen, title, centre, box.y + (compact ? 5 : 9), compact ? 9.5 : 11, box.w, colors);
  text(pen, words, centre, areaY, compact ? 18 : 25, box.w, colors);
  const selection = frame.minimum?.exact === 'parabola' ? 'MINIMUM: 0, 1, 4' : frame.minimum ? `MINIMUM: ${frame.minimum.ids.join(', ')}` : '';
  const countY = box.y + box.h * (compact ? .64 : .44);
  const countWords = compact && exact === 'parabola' ? '|DET| = 1 TO 139 · NEVER 0' : `${frame.active.length} POINTS${selection ? ` · ${selection}` : ''}`;
  text(pen, countWords, centre, countY, compact ? 9.5 : 12, box.w, colors);

  if (frame.scene === 'alteration' || frame.scene === 'replay') {
    text(pen, `THRESHOLD 1/338 · ${frame.deletedCount} REMOVED`, centre, box.y + box.h * (compact ? .9 : .59), compact ? 9.5 : 12, box.w, colors);
  } else if (exact === 'parabola') {
    text(pen, '1/(2·13²) ≈ 0.002959', centre, box.y + box.h * (compact ? .91 : .59), compact ? 10 : 14, box.w, colors);

    if (!compact) text(pen, '|DET| = 1 TO 139 · NEVER 0', centre, box.y + box.h * .75, 12, box.w, colors);
  } else if (frame.scene === 'grid') {
    text(pen, 'COLLINEAR TRIPLES WASTE POINTS', centre, box.y + box.h * (compact ? .9 : .6), compact ? 9 : 11, box.w, colors);
  } else {
    text(pen, 'ONE SEEDED PLACEMENT', centre, box.y + box.h * (compact ? .9 : .6), compact ? 9.5 : 12, box.w, colors);
  }

  return { x: centre, y: areaY - (compact ? 12 : 17) };
}

function drawMatrix(pen: CanvasRenderingContext2D, box: Box, time: number, frame: StageState, colors: Colors, place: Place): void {
  const compact = box.h < 150;
  const matrix = matrixFor(box);
  const drawn = progress(time, 71750, 72900);

  for (let column = 0; column < 3; column++) {
    if (drawn * 3 < column) continue;

    const values = COLUMN_FIXTURE[column];

    if (!values) continue;

    for (const [row, value] of values.entries()) text(pen, String(value), matrix.x + column * matrix.stepX, matrix.y + row * matrix.stepY, matrix.font, matrix.stepX, colors);
  }

  pen.strokeStyle = colors.ink;
  pen.lineWidth = .8;
  const left = matrix.x - matrix.stepX * .55;
  const right = matrix.x + matrix.stepX * 2.55;
  const top = matrix.y - matrix.stepY * .6;
  const bottom = matrix.y + matrix.stepY * 2.6;
  pen.beginPath();
  pen.moveTo(left + 5, top);
  pen.lineTo(left, top);
  pen.lineTo(left, bottom);
  pen.lineTo(left + 5, bottom);
  pen.moveTo(right - 5, top);
  pen.lineTo(right, top);
  pen.lineTo(right, bottom);
  pen.lineTo(right - 5, bottom);
  pen.stroke();
  const x = compact ? box.x + box.w * .68 : box.x + box.w / 2;
  const detY = compact ? box.y + 9 : box.y + box.h * .5;
  text(pen, `det A = ${COLUMN_AREA.determinant}`, x, detY, compact ? 13 : 20, compact ? box.w * .6 : box.w, colors);
  const areaY = compact ? box.y + 30 : box.y + box.h * .64;
  const settled = frame.minimum?.exact === 'columns';
  text(pen, settled ? 'AREA = 33/680' : frame.minimum ? `LIVE Δ ≈ ${frame.minimum.area.toFixed(6)}` : 'POINTS IN TRANSIT', x, areaY, compact ? 12 : 17, compact ? box.w * .6 : box.w, colors);
  text(pen, compact ? 'N = 13 · ROW 13,17,20' : 'THIRD ROW BETWEEN N AND 2N · N = 13', compact ? x : box.x + box.w / 2, box.y + box.h * (compact ? .7 : .79), compact ? 9 : 11, compact ? box.w * .6 : box.w, colors);

  if (time >= 75440 && time < 80000) place('column-area', box.x + box.w / 2, box.y + box.h * .92);
}

function fieldReadout(pen: CanvasRenderingContext2D, box: Box, colors: Colors): void {
  const compact = box.h < 150;
  const centre = box.x + box.w / 2;
  text(pen, 'LABELS 0, 1, 4 · FIELD OF 13', centre, box.y + (compact ? 5 : 9), compact ? 10 : 12, box.w, colors);

  if (!compact) {
    for (const [column, label] of [0, 1, 4].entries()) {
      const values = [1, label, label * label % 13];

      for (const [row, value] of values.entries()) text(pen, String(value), box.x + box.w * (.25 + column * .25), box.y + box.h * .19 + row * 25, 18, box.w * .2, colors);
    }
  }

  text(pen, 'det = −1', centre, box.y + box.h * (compact ? .27 : .52), compact ? 14 : 19, box.w, colors);
  text(pen, '(1−0)(4−0)(4−1) = 12', centre, box.y + box.h * (compact ? .49 : .62), compact ? 11 : 15, box.w, colors);
  text(pen, '−1 ≡ 12 (mod 13)', centre, box.y + box.h * (compact ? .72 : .75), compact ? 14 : 20, box.w, colors);
  text(pen, 'PAPER: FIELD OF r⁴¹', centre, box.y + box.h * (compact ? .95 : .90), compact ? 9.5 : 12, box.w, colors);
}

function collinearReadout(pen: CanvasRenderingContext2D, box: Box, colors: Colors): void {
  const compact = box.h < 150;
  const centre = box.x + box.w / 2;
  text(pen, 'THE GRID’S COLLINEAR TRIPLE', centre, box.y + (compact ? 5 : 9), compact ? 10 : 12, box.w, colors);
  const y = box.y + box.h * (compact ? .34 : .29);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  line(pen, { x: box.x + box.w * .19, y }, { x: box.x + box.w * .81, y });

  for (const part of [.25, .5, .75]) pointDot(pen, { x: box.x + box.w * part, y }, compact ? 2.4 : 3.2, false, colors);

  text(pen, 'DET = 0 · A SECOND PRIME q', centre, box.y + box.h * (compact ? .64 : .54), compact ? 11 : 16, box.w, colors);
  text(pen, 'SCHEMATIC', centre, box.y + box.h * (compact ? .92 : .77), compact ? 9.5 : 12, box.w, colors);
}

function repeatedReadout(pen: CanvasRenderingContext2D, box: Box, colors: Colors): void {
  const compact = box.h < 150;
  const centre = box.x + box.w / 2;
  const rowStep = compact ? 14 : 26;
  const y = box.y + (compact ? 12 : box.h * .2);

  for (const x of [box.x + box.w * .15, box.x + box.w * .36]) {
    for (const [row, value] of ['1', 'ξ', 'ξ²'].entries()) text(pen, value, x, y + row * rowStep, compact ? 12 : 19, box.w * .16, colors);
  }

  pen.strokeStyle = colors.ink;
  pen.lineWidth = .9;
  line(pen, { x: box.x + box.w * .2, y: y + rowStep }, { x: box.x + box.w * .31, y: y + rowStep });
  text(pen, 'REPEATED ξ', box.x + box.w * .74, y + rowStep * .35, compact ? 12 : 17, box.w * .47, colors);
  text(pen, 'SCHEMATIC', box.x + box.w * .74, y + rowStep * 1.55, compact ? 9.5 : 12, box.w * .47, colors);
  text(pen, 'BAD TRIANGLES NEED A REPEATED LABEL', centre, box.y + box.h * (compact ? .73 : .60), compact ? 9 : 11, box.w, colors);
  text(pen, 'THE PAPER SAMPLES ARITHMETICALLY', centre, box.y + box.h * (compact ? .94 : .79), compact ? 9 : 11, box.w, colors);
}

function readout(pen: CanvasRenderingContext2D, box: Box, time: number, frame: StageState, colors: Colors, place: Place): Point | undefined {
  if (time >= 105750) {
    const centre = box.x + box.w / 2;
    const compact = box.h < 150;
    text(pen, 'UNREVIEWED', centre, box.y + 5, compact ? 11 : 15, box.w, colors);
    text(pen, 'Δ = 1/338', centre, box.y + box.h * .34, compact ? 18 : 25, box.w, colors);
    text(pen, 'LEAN: UNBOUNDED SEQUENCE OF n', centre, box.y + box.h * .67, compact ? 9.5 : 12, box.w, colors);
    text(pen, 'NOT IN RELEASE CATALOGUE', centre, box.y + box.h * .93, compact ? 9.5 : 12, box.w, colors);

    return;
  }

  if (frame.scene === 'columns' && time < 81200) {
    drawMatrix(pen, box, time, frame, colors, place);
    return;
  }

  if (frame.scene === 'field') {
    fieldReadout(pen, box, colors);
    return;
  }

  if (frame.scene === 'second-prime') {
    collinearReadout(pen, box, colors);
    return;
  }

  if (frame.scene === 'replay') {
    repeatedReadout(pen, box, colors);
    return;
  }

  return regularReadout(pen, box, frame, colors);
}

function labelPoint(pen: CanvasRenderingContext2D, plot: Plot, point: MovingPoint, time: number, colors: Colors): void {
  const position = screen(plot, point);
  const label = point.label ?? point.id;
  const early = time < 9500;
  const dx = early && point.id === 0 ? -13 : early && point.id === 12 ? 14 : label === 0 ? -10 : 10;
  const dy = early && point.id === 10 ? 12 : early && point.id === 0 ? -10 : -9;
  text(pen, String(label), position.x + dx, position.y + dy, 9, 22, colors);
}

function flyingColumns(pen: CanvasRenderingContext2D, plot: Plot, matrix: MatrixLayout, frame: StageState, colors: Colors): void {
  for (const point of frame.points) {
    if (point.column === undefined) continue;

    const amount = frame.columnProgress[point.column] ?? 0;

    if (amount === 0) continue;

    const position = screen(plot, point);
    const values = COLUMN_FIXTURE[point.column];

    if (!values) continue;

    if (amount < .98) {
      pen.save();
      pen.translate(position.x, position.y);
      pen.scale(Math.max(.08, 1 - amount), Math.max(.08, 1 - amount));

      for (const [row, value] of values.entries()) text(pen, String(value), 0, (row - 1) * matrix.stepY, matrix.font, matrix.stepX, colors);

      pen.restore();
    }

    pointDot(pen, position, 2.4 * Math.min(1, amount / .2), false, colors);
  }
}

/** Draw the square and readout together so column copies begin at their actual matrix positions. */
export function drawStage(pen: CanvasRenderingContext2D, box: Box, readoutBox: Box, time: number, colors: Colors, place: Place): void {
  const plot = plotFor(box);
  const matrix = matrixFor(readoutBox);
  const starts = [0, 1, 2].map(column => ({ x: (matrix.x + column * matrix.stepX - plot.x) / plot.size, y: 1 - (matrix.y + matrix.stepY - plot.y) / plot.size }));
  const frame = motionAt(time, starts);
  pen.save();
  pen.beginPath();
  pen.rect(box.x - 2, box.y - 2, box.w + 4, box.h + 4);
  pen.clip();
  square(pen, plot, time, colors);
  drawBadTriangles(pen, plot, frame, colors);
  drawTray(pen, plot, time, colors);

  if (frame.minimum) hatchMinimum(pen, plot, frame.minimum, colors);

  for (const point of frame.points) {
    if (point.column !== undefined) continue;

    const selected = frame.minimum?.ids.includes(point.id) ?? false;
    pointDot(pen, screen(plot, point), box.w < 400 ? 2.1 : 2.6, selected, colors);

    if (selected && (time < 9500 || frame.exactParabola)) labelPoint(pen, plot, point, time, colors);

    if (point.id < 26 && point.x > 1.07 && point.x < 1.4) {
      const position = screen(plot, point);
      text(pen, String(point.id), position.x + 7, position.y + 7, 8, 18, colors);
    }
  }

  text(pen, stageTitle(frame, time), box.x + box.w / 2, box.y + 5, box.w < 400 ? 10 : 12, box.w, colors);
  const footer = frame.exactParabola ? '13 POINTS · Δ = 1/338' : frame.scene === 'columns' ? 'N = 13 · POSITIVE THIRD COORDINATES' : frame.scene === 'replay' && frame.minimum ? `n = ${frame.active.length} · Δ ≈ ${frame.minimum.area.toFixed(6)}` : 'UNIT SQUARE';
  text(pen, footer, plot.x + plot.size / 2, plot.y + plot.size + 16, 9.5, plot.size, colors);
  pen.restore();
  const detail = time >= 52000 && time < 54800 || time >= 63750 && time < 71750;
  const anchor = detail ? undefined : readout(pen, readoutBox, time, frame, colors, place);

  if (anchor && frame.minimum && !frame.flash) {
    const centre = {
      x: frame.minimum.points.reduce((sum, point) => sum + point.x, 0) / 3,
      y: frame.minimum.points.reduce((sum, point) => sum + point.y, 0) / 3,
    };
    const start = screen(plot, centre);
    const elbow = { x: plot.x + plot.size + 7, y: start.y };
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .65;
    pen.beginPath();
    pen.moveTo(start.x, start.y);
    pen.lineTo(elbow.x, elbow.y);
    pen.lineTo(anchor.x, anchor.y);
    pen.stroke();
  }

  flyingColumns(pen, plot, matrix, frame, colors);

  if (frame.scene === 'field' && frame.minimum) {
    const [a, b, c] = frame.minimum.points;
    const determinant = Math.round(triangleDeterminant(a, b, c) * 13 ** 2);
    text(pen, `Δ = 1/338 · INTEGER DET = ${determinant}`, plot.x + plot.size * .5, plot.y + plot.size + 16, 9.5, plot.size, colors);
  }
}

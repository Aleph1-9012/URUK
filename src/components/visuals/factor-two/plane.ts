import { smooth } from '../../../lib/animation';
import {
  E, U0, bandData, confocalPoint, ellipseParameter, matrixAt, numericalRangeBoundary,
  realEntries, sweepAt, sweepMark, type Point,
} from './math';
import { layout, type Box } from './story';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type Label = (id: string, x: number, y: number, opacity?: number) => void;

const TAU = Math.PI * 2;

const SPIRAL = Array.from({ length: 1441 }, (_, index) => sweepMark(index / 1440));

const DISK = numericalRangeBoundary(matrixAt(30000));

const ELLIPSE = numericalRangeBoundary(E);

function words(pen: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, colors: Colors, size = 10, muted = false): void {
  pen.font = `${size}px "Special Elite", monospace`;
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  const lines: string[] = [];

  for (const paragraph of text.split('\n')) {
    let current = '';

    for (const word of paragraph.split(' ')) {
      const next = current ? `${current} ${word}` : word;

      if (current && pen.measureText(next).width > maxWidth - 8) {
        lines.push(current);
        current = word;
      } else current = next;
    }

    lines.push(current);
  }

  for (const [index, line] of lines.entries()) {
    const row = y + (index - (lines.length - 1) / 2) * (size + 3);
    const extent = pen.measureText(line).width;
    pen.fillStyle = colors.paper;
    pen.fillRect(x - extent / 2 - 3, row - size / 2 - 2, extent + 6, size + 4);
    pen.fillStyle = muted ? colors.muted : colors.ink;
    pen.fillText(line, x, row);
  }
}

function line(pen: CanvasRenderingContext2D, from: Point, to: Point, color: string, width = .8): void {
  pen.strokeStyle = color;
  pen.lineWidth = width;
  pen.beginPath();
  pen.moveTo(from.x, from.y);
  pen.lineTo(to.x, to.y);
  pen.stroke();
}

function dot(pen: CanvasRenderingContext2D, point: Point, color: string, radius = 2.3): void {
  pen.fillStyle = color;
  pen.beginPath();
  pen.arc(point.x, point.y, radius, 0, TAU);
  pen.fill();
}

function curve(pen: CanvasRenderingContext2D, points: readonly Point[], map: (point: Point) => Point, progress = 1): void {
  const count = Math.max(1, Math.floor(points.length * progress));
  pen.beginPath();

  for (let index = 0; index <= count; index++) {
    const point = points[index % points.length];

    if (!point) continue;

    const position = map(point);

    if (index === 0) pen.moveTo(position.x, position.y);
    else pen.lineTo(position.x, position.y);
  }
}

function circle(pen: CanvasRenderingContext2D, center: Point, radius: number, color: string, progress = 1, width = .8): void {
  if (radius <= 0 || progress <= 0) return;

  pen.strokeStyle = color;
  pen.lineWidth = width;
  pen.beginPath();
  pen.arc(center.x, center.y, radius, -Math.PI / 2, -Math.PI / 2 + TAU * progress);
  pen.stroke();
}

function domainPoints(u: number): Point[] {
  return Array.from({ length: 240 }, (_, index) => confocalPoint(u, index / 240 * TAU));
}

function drawDomain(pen: CanvasRenderingContext2D, box: Box, center: Point, scale: number, time: number, colors: Colors, label: Label, tall: boolean): void {
  const enter = smooth(time, 92000, 94400);
  const shrink = smooth(time, 99000, 103400);
  const u = U0 + .4 * enter * (1 - shrink);
  const map = (point: Point): Point => ({ x: center.x + point.x * scale, y: center.y - point.y * scale });
  const omega = domainPoints(u);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .85;
  pen.setLineDash([3, 3]);
  curve(pen, omega, map, smooth(time, 92000, 93400));
  pen.stroke();
  pen.setLineDash([]);

  if (time < 97000) {
    const right = map(confocalPoint(u, .55));
    const note = tall ? { x: box.x + box.w * .70, y: box.y + box.h - 36 } : { x: right.x - 20, y: right.y - 12 };
    words(pen, 'Ω: SMOOTH, CONVEX', note.x, note.y, box.w * .58, colors, tall ? 8 : 10);
  }

  const dial = { x: box.x + box.w * (tall ? .105 : .15), y: box.y + box.h - (tall ? 26 : 55) };
  const radius = tall ? 13 : 25;
  const input = smooth(time, 93000, 94500);
  circle(pen, dial, radius, colors.ink, input);
  const angle = (time - 93000) / 1000 * .75;
  const source = { x: dial.x + Math.cos(angle) * radius, y: dial.y - Math.sin(angle) * radius };
  const target = map(confocalPoint(u, angle));

  if (time >= 93500 && time < 97000) {
    dot(pen, source, colors.ink, 1.8);
    dot(pen, target, colors.ink, 2.3);
    pen.setLineDash([2, 3]);
    line(pen, source, target, colors.muted, .6);
    pen.setLineDash([]);
    const carry = ((time - 93500) % 1500) / 1500;
    dot(pen, { x: source.x + (target.x - source.x) * carry, y: source.y + (target.y - source.y) * carry }, colors.ink, 1.8);
    label('h-map', box.x + box.w * .6, box.y + box.h - (tall ? 14 : 24));
  }

  if (time >= 97000) {
    const data = bandData(u);
    const growth = smooth(time, 97000, 98400);
    const count = Math.floor(data.length * growth);
    let minimum = Infinity;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .65;
    pen.beginPath();

    for (const [index, sample] of data.entries()) {
      minimum = Math.min(minimum, sample.value);

      if (index > count) continue;

      const extent = radius + Math.max(0, sample.value) * (tall ? 8 : 14);
      const point = { x: dial.x + Math.cos(sample.angle) * extent, y: dial.y - Math.sin(sample.angle) * extent };

      if (index === 0) pen.moveTo(point.x, point.y);
      else pen.lineTo(point.x, point.y);
    }

    if (growth === 1) pen.closePath();

    pen.stroke();
    words(pen, 'ZERO', dial.x, dial.y, radius * 2, colors, tall ? 6 : 8, true);
    label('positivity', box.x + box.w * .64, box.y + box.h - (tall ? 35 : 43));
    const value = Math.abs(minimum) < 5e-10 ? 0 : minimum;
    const readout = tall ? `WIDTH = LEAST EIGENVALUE: ${value.toFixed(3)}` : `LEAST: ${value.toFixed(3)}`;
    words(pen, readout, box.x + box.w * .64, box.y + box.h - (tall ? 12 : 23), box.w * .68, colors, tall ? 6.5 : 10);

    if (!tall) words(pen, 'BAND WIDTH: LEAST EIGENVALUE', box.x + box.w / 2, box.y + box.h - 4, box.w, colors, 9, true);
  }
}

export function drawPlane(pen: CanvasRenderingContext2D, width: number, height: number, time: number, colors: Colors, label: Label): void {
  const view = layout(width, height);
  const box = view.plane;
  const tall = view.tall;
  const plot = { x: box.x + (tall ? 20 : 35), y: box.y + (tall ? 29 : 48), w: box.w - (tall ? 40 : 70), h: box.h - (tall ? 58 : 112) };
  const center = { x: plot.x + plot.w / 2, y: plot.y + plot.h / 2 };
  const diskView = smooth(time, 21000, 22500) * (1 - smooth(time, 92000, 94400));
  const extent = tall ? 3.35 - 1.2 * diskView : 3.65;
  const scale = Math.min(plot.w / 4.4, plot.h / extent);
  const map = (point: Point): Point => ({ x: center.x + point.x * scale, y: center.y - point.y * scale });
  words(pen, 'THE COMPLEX PLANE', box.x + box.w / 2, box.y + 8, box.w, colors, tall ? 9 : 12);
  line(pen, { x: plot.x, y: center.y }, { x: plot.x + plot.w, y: center.y }, colors.muted, .55);
  line(pen, { x: center.x, y: plot.y }, { x: center.x, y: plot.y + plot.h }, colors.muted, .55);

  for (const value of [-1, 1]) {
    const point = map({ x: value, y: 0 });
    line(pen, { x: point.x, y: point.y - 2 }, { x: point.x, y: point.y + 2 }, colors.muted, .6);
    words(pen, String(value), point.x, point.y + (tall ? 10 : 14), 25, colors, tall ? 7 : 9, true);
  }

  words(pen, 'REAL', plot.x + plot.w - 8, center.y + (tall ? 10 : 15), 46, colors, tall ? 7 : 9, true);

  words(pen, 'IMAGINARY', tall ? plot.x + 25 : center.x, tall ? plot.y + 5 : plot.y - 10, tall ? 60 : 95, colors, tall ? 7 : 9, true);

  if (time >= 7000 && time < 22500) {
    const entries = realEntries(matrixAt(time));
    const eigenvalues = [entries[0], entries[3]];
    const grow = smooth(time, 7000, 7800);
    const outer = Math.max(Math.abs(entries[0]), Math.abs(entries[3]));
    circle(pen, center, outer * scale, colors.muted, grow);

    for (const eigenvalue of eigenvalues) dot(pen, map({ x: eigenvalue, y: 0 }), colors.ink, tall ? 2.5 : 3.5);

    words(pen, time < 8200 ? 'EIGENVALUES' : time < 15000 ? 'THE EIGENVALUES MOVE TO ZERO' : 'BOTH EIGENVALUES: 0', box.x + box.w / 2, box.y + box.h - 12, box.w, colors, tall ? 8 : 11);
  }

  if (time >= 22500) {
    const sweep = sweepAt(time);
    const stop = Math.floor(sweep.amount * (SPIRAL.length - 1));

    if (time < 89500) {
      pen.strokeStyle = time < 30000 ? colors.ink : colors.muted;
      pen.lineWidth = time < 30000 ? .8 : .45;
      pen.beginPath();

      for (let index = 0; index <= stop; index++) {
        const point = SPIRAL[index];

        if (!point) continue;

        const position = map(point);

        if (index === 0) pen.moveTo(position.x, position.y);
        else pen.lineTo(position.x, position.y);
      }

      pen.stroke();
    }

    if (time < 30000) {
      const point = map(sweepMark(sweep.amount));
      dot(pen, point, colors.ink, 2);
      label('quadratic', point.x + (tall ? 25 : 36), point.y - 12);
      label('sweep-vector', box.x + box.w / 2, box.y + box.h - 12);
    } else {
      const parameter = ellipseParameter(time);
      const boundary = parameter === 0 ? DISK : parameter === 1 ? ELLIPSE : numericalRangeBoundary(matrixAt(time));
      pen.strokeStyle = colors.ink;
      pen.lineWidth = tall ? 1 : 1.3;
      curve(pen, boundary, map, smooth(time, 30000, 31400));
      pen.stroke();

      for (const eigenvalue of [-parameter, parameter]) dot(pen, map({ x: eigenvalue, y: 0 }), colors.ink, tall ? 2.5 : 3.5);

      if (time < 89500) {
        label('range', box.x + box.w * (tall ? .82 : .5), box.y + 27);

        const reservedFormula = time >= 37000 && time < 44500 || time >= 50500 && time < 58500;

        if (!tall || !reservedFormula) {
          words(pen, time < 37000 ? 'CLOSED UNIT DISK · RADIUS 1' : time < 44500 ? 'THE REGION FOR EVERY POLYNOMIAL' : time < 50500 ? 'LARGEST |z| ON THE RIM: 1' : 'ONE REGION, FOR EVERY COEFFICIENT SIZE', box.x + box.w / 2, box.y + box.h - 12, box.w, colors, tall ? 8 : 11);
        }
      } else {
        label('ellipse-range', box.x + box.w * (tall ? .82 : .5), box.y + 28);

        if (time < 93000) words(pen, 'EIGENVALUES BECOME THE FOCI', box.x + box.w / 2, box.y + box.h - 12, box.w, colors, tall ? 8 : 11);
      }
    }
  }

  if (time >= 92000) drawDomain(pen, box, center, scale, time, colors, label, tall);

  if (time >= 104000 && !tall) words(pen, 'DRAWN ON A 2 × 2 CASE, KNOWN SINCE 2006', box.x + box.w / 2, box.y + 48, box.w, colors, 10, true);
}

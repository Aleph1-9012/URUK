import { CURVES, CURVE_SEGMENTS, PINS, PLANE_BOUND, curveRun, evaluate, gradient, growthRuns, pinchBranches, type CurveRun, type Point } from './math';
import { fade, smooth } from './story';

export type PlaneColors = { ink: string; blue: string; muted: string; paper: string };

export type PlaneLabel = (id: string, x: number, y: number, opacity?: number) => void;

const paths = new Map<keyof typeof CURVE_SEGMENTS, Path2D>();

function curvePath(name: keyof typeof CURVE_SEGMENTS): Path2D {
  const cached = paths.get(name);

  if (cached) return cached;

  const path = new Path2D();

  for (const segment of CURVE_SEGMENTS[name]) {
    path.moveTo(segment.from.x, segment.from.y);
    path.lineTo(segment.to.x, segment.to.y);
  }

  paths.set(name, path);

  return path;
}

function onCubic(x: number, startingY: number): Point {
  let y = startingY;

  for (let iteration = 0; iteration < 10; iteration++) {
    y -= evaluate(CURVES.cubic, x, y) / gradient(CURVES.cubic, x, y).y;
  }

  return { x, y };
}

const TENTH_TARGET = onCubic(-.329, .192);

const GROWTH = {
  conic: growthRuns(CURVE_SEGMENTS.conic, PINS),
  cubic: growthRuns(CURVE_SEGMENTS.cubic, PINS),
  nodal: growthRuns(CURVE_SEGMENTS.nodal, PINS),
};

// Each time a curve comes on: [starts drawing, fully drawn, starts to fade, gone].
const SHOWINGS = {
  conic: [[800, 3300, 4000, 4700], [7500, 9000, 10500, 11200]],
  cubic: [[4000, 5600, 7500, 8300], [10500, 12000, 14500, 15500], [36000, 37800, 43000, 44000], [74000, 75800, 78000, 79500], [97000, 98800, Infinity, Infinity]],
  nodal: [[14500, 16300, 21500, 22500]],
  model: [[78000, 79800, 97000, 98500]],
} as const;

function showing(time: number, windows: ReadonlyArray<readonly [number, number, number, number]>): { grown: number; opacity: number } {
  for (const [start, drawn, fadeStart, fadeEnd] of windows) {
    if (time >= start && time < fadeEnd) return { grown: smooth(time, start, drawn), opacity: fadeEnd === Infinity ? 1 : 1 - smooth(time, fadeStart, fadeEnd) };
  }

  return { grown: 0, opacity: 0 };
}

// Strokes a run from its start as far as the given length along it.
function traceRun(pen: CanvasRenderingContext2D, run: CurveRun, length: number, place: (point: Point) => Point = (point) => point): void {
  const first = run.points[0];

  if (!first || length <= 0) return;

  const start = place(first);
  pen.beginPath();
  pen.moveTo(start.x, start.y);

  for (let index = 1; index < run.points.length; index++) {
    const before = run.points[index - 1];
    const point = run.points[index];
    const from = run.lengths[index - 1] ?? 0;
    const to = run.lengths[index] ?? 0;

    if (!before || !point) break;

    const part = Math.min(1, (length - from) / (to - from || 1));
    const at = place({ x: before.x + (point.x - before.x) * part, y: before.y + (point.y - before.y) * part });
    pen.lineTo(at.x, at.y);

    if (part < 1) break;
  }

  pen.stroke();
}

// Every piece of a curve finishes together; the runs of one piece grow at the same speed.
function growPieces(pen: CanvasRenderingContext2D, pieces: ReadonlyArray<readonly CurveRun[]>, grown: number, place?: (point: Point) => Point): void {
  for (const runs of pieces) {
    let longest = 0;

    for (const run of runs) longest = Math.max(longest, run.lengths[run.lengths.length - 1] ?? 0);

    for (const run of runs) traceRun(pen, run, longest * grown, place);
  }
}

export function drawCurvePlane(
  pen: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: PlaneColors,
  _labelCallback: PlaneLabel,
): void {
  const tall = height > width;
  const size = Math.min(width * (tall ? .8 : .41), height * (tall ? .30 : .68));
  const center = { x: width * (tall ? .5 : .255), y: height * (tall ? .20 : .44) };
  const scale = size / (2 * PLANE_BOUND);
  const left = center.x - size / 2;
  const top = center.y - size / 2;
  const screen = (point: Point): Point => ({ x: center.x + point.x * scale, y: center.y - point.y * scale });
  const model = fade(time, 78000, 79500, 97000, 98500);
  const conic = Math.max(fade(time, 800, 3300, 4000, 4700), fade(time, 7500, 8300, 10500, 11200));
  const cubic = Math.max(fade(time, 4000, 4800, 7500, 8300), fade(time, 10500, 11200, 14500, 15500), fade(time, 36000, 37500, 43000, 44000), fade(time, 74000, 75500, 78000, 79500), smooth(time, 97000, 98500));
  const nodal = fade(time, 14500, 15700, 21500, 22500);
  const text = (value: string, x: number, y: number, maxWidth: number, opacity = 1, color = colors.ink): void => {
    if (opacity < .005) return;

    const fontSize = tall ? 10 : 11;
    pen.font = `${fontSize}px "Special Elite", monospace`;
    pen.textAlign = 'center';
    pen.textBaseline = 'middle';
    const lines: string[] = [];
    let line = '';

    for (const word of value.split(' ')) {
      const next = line ? `${line} ${word}` : word;

      if (line && pen.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else line = next;
    }

    lines.push(line);
    pen.globalAlpha = opacity;

    for (const [index, content] of lines.entries()) {
      const extent = pen.measureText(content).width;
      const atY = y + (index - (lines.length - 1) / 2) * 14;
      pen.fillStyle = colors.paper;
      pen.fillRect(x - extent / 2 - 2, atY - 7, extent + 4, 14);
      pen.fillStyle = color;
      pen.fillText(content, x, atY);
    }

    pen.globalAlpha = 1;
  };

  pen.save();
  pen.beginPath();
  pen.rect(left, top, size, size);
  pen.clip();
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .6;
  pen.globalAlpha = .25;
  pen.beginPath();
  pen.moveTo(left, center.y);
  pen.lineTo(left + size, center.y);
  pen.moveTo(center.x, top);
  pen.lineTo(center.x, top + size);
  pen.stroke();
  pen.globalAlpha = 1;

  // A curve comes on by being drawn: it starts at a point and the line runs along the curve until it is whole.
  const drawCurve = (name: keyof typeof CURVE_SEGMENTS): void => {
    const { grown, opacity } = showing(time, SHOWINGS[name]);

    if (opacity < .005 || grown <= 0) return;

    pen.save();
    pen.translate(center.x, center.y);
    pen.scale(scale, -scale);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = (tall ? 1.2 : 1.45) / scale;
    pen.globalAlpha = opacity;

    if (grown >= 1) pen.stroke(curvePath(name));
    else growPieces(pen, GROWTH[name], grown);

    pen.restore();
  };

  drawCurve('conic');
  drawCurve('cubic');
  drawCurve('nodal');
  const pinched = showing(time, SHOWINGS.model);

  if (pinched.opacity > .005 && pinched.grown > 0) {
    const branches = pinchBranches(smooth(time, 78500, 81500));
    pen.strokeStyle = colors.ink;
    pen.lineWidth = tall ? 1.3 : 1.5;
    pen.globalAlpha = pinched.opacity;
    const place = (point: Point) => screen({ x: point.x * .9, y: point.y * .9 });
    growPieces(pen, [[curveRun(branches.oval)], [curveRun(branches.upper)], [curveRun(branches.lower)]], pinched.grown, place);
    pen.globalAlpha = 1;
  }

  const pinOpacity = 1 - model;
  const moveTenth = fade(time, 74000, 78000, 97000, 98500);

  for (const [index, pin] of PINS.entries()) {
    const point = index === 9 ? { x: pin.x + (TENTH_TARGET.x - pin.x) * moveTenth, y: pin.y + (TENTH_TARGET.y - pin.y) * moveTenth } : pin;
    const at = screen(point);
    const throughFive = time < 4000 || time >= 7500 && time < 10500;
    const throughNode = time >= 14500 && time < 21500;
    const throughNine = time >= 4000 && time < 7500 || time >= 10500 && time < 14500 || time >= 36000 && time < 43000 || time >= 74000;
    const chosen = time >= 800 && (throughFive ? index < 5 : throughNode ? [0, 2, 3, 4, 5, 6, 7].includes(index) : throughNine ? index < 9 : true);
    const ninePoints = fade(time, 36000, 37000, 43000, 44000);
    pen.globalAlpha = pinOpacity * (index === 9 ? 1 - .75 * ninePoints : 1);
    pen.fillStyle = chosen ? colors.ink : colors.paper;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1;
    pen.beginPath();
    pen.arc(at.x, at.y, tall ? 3 : 3.8, 0, 2 * Math.PI);
    pen.fill();
    pen.stroke();

    if (index === 7 && nodal > .005) {
      pen.globalAlpha = nodal;
      pen.beginPath();
      pen.arc(at.x, at.y, tall ? 8 : 10, 0, 2 * Math.PI);
      pen.strokeStyle = colors.blue;
      pen.stroke();
    }

    if (!tall) text(String(index + 1), at.x + (pin.x > .7 ? -11 : 11), at.y - 12, 24, pinOpacity, colors.muted);
  }

  pen.restore();
  pen.globalAlpha = 1;
  let heading = 'TEN FIXED PINS';
  let note = 'THE PLANE';

  if (conic > .5) {
    heading = 'CONIC · DEGREE 2';
    note = 'THROUGH FIVE PINS';
  } else if (nodal > .5) {
    heading = 'NODE · TWICE THROUGH PIN 8';
    note = '3 CONDITIONS AT THE NODE + 6 OTHERS';
  } else if (cubic > .5) {
    heading = 'CUBIC · DEGREE 3';
    note = 'THROUGH NINE PINS';
  }

  if (model > .5) {
    heading = tall ? 'PINCHED CUBIC · SCHEMATIC' : 'A CUBIC PINCHED TO A NODE';
    note = 'SCHEMATIC DEGENERATION';
  } else if (time >= 43000 && time < 52000) {
    const m = Math.min(8, 1 + Math.floor((time - 44000) / 900));
    heading = `SOLVING AT THESE PINS · m = ${Math.max(1, m)}`;
    note = 'A FINITE CHECK, THROUGH m = 8';
  } else if (time >= 74000 && time < 78000) note = 'THE OTHER POINT MOVES ONTO THE CUBIC';

  text(heading, center.x, Math.max(13, top - (tall ? 10 : 23)), width * (tall ? .9 : .45));
  text(note, center.x, top + size + (tall ? height * .025 : 24), width * (tall ? .92 : .46), tall && model > .5 ? 1 - fade(time, 81500, 82500, 98500, 99000) : 1, colors.muted);
}

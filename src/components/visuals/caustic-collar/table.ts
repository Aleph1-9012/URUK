import { smooth, progress as span } from '../../../lib/animation';
import { BilliardTable, causticParameter, periodicPath, shotAt, traceOrbit, type OrbitData, type PeriodicQ, type Point } from './math';
import type { CausticData, TableKind } from './data';
import { layout } from './story';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type Label = (id: string, x: number, y: number, opacity?: number) => void;

const TAU = Math.PI * 2;

const ellipse = new BilliardTable(0);

const wobble = new BilliardTable(.01);

const caustics = new Map<number, number>();

const contactAngles = new Map<number, number>();

let movingTable: BilliardTable | null = null;

let movingEpsilon = -1;

let movingOrbit: OrbitData | null = null;

let movingDelta = -1;

export function tableState(time: number): { epsilon: number; kind: TableKind; periodicQ: PeriodicQ | null; startFraction: number } {
  let epsilon = .01 * smooth(time, 38000, 40500);

  if (time >= 80000 && time < 86300) epsilon = .01 * (1 - smooth(time, 80000, 81000));
  if (time >= 86300 && time < 88500) epsilon = .01 * smooth(time, 86300, 86800);
  if (time >= 88500) epsilon = .01 * (1 - smooth(time, 88500, 90200));

  epsilon = Math.round(epsilon * 100000) / 100000;
  const periodicQ = time >= 81000 && time < 83000 ? 3 : time >= 83000 && time < 85000 ? 4 : time >= 85000 && time < 86300 ? 5 : time >= 86800 && time < 88500 ? 3 : null;
  const start = time < 83000 ? 81000 : time < 85000 ? 83000 : time < 86300 ? 85000 : 86800;
  const end = time < 83000 ? 83000 : time < 85000 ? 85000 : time < 86300 ? 86300 : 88500;

  return { epsilon, kind: epsilon < .005 ? 'ellipse' : 'wobble', periodicQ, startFraction: periodicQ ? span(time, start, end) : 0 };
}

function tableFor(epsilon: number): BilliardTable {
  if (epsilon === 0) return ellipse;
  if (epsilon === .01) return wobble;

  if (movingTable === null || movingEpsilon !== epsilon) {
    movingTable = new BilliardTable(epsilon);
    movingEpsilon = epsilon;
    movingOrbit = null;
  }

  return movingTable;
}

function orbitFor(data: CausticData, epsilon: number, delta: number): OrbitData | null {
  if (epsilon === 0 || epsilon === .01) return data.launches.get(epsilon === 0 ? 'ellipse' : 'wobble')?.get(delta) ?? null;

  const table = tableFor(epsilon);

  if (movingOrbit === null || movingDelta !== delta) {
    movingOrbit = traceOrbit(table, .3, delta, 80);
    movingDelta = delta;
  }

  return movingOrbit;
}

function lambdaFor(delta: number): number {
  const known = caustics.get(delta);

  if (known !== undefined) return known;

  const orbit = traceOrbit(ellipse, .3, delta, 2);
  const first = { x: orbit.coords[0] ?? 0, y: orbit.coords[1] ?? 0 };
  const second = { x: orbit.coords[2] ?? 0, y: orbit.coords[3] ?? 0 };
  const value = causticParameter(first, second);
  caustics.set(delta, value);

  return value;
}

function words(pen: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, colors: Colors, size: number, muted = false): void {
  pen.font = `${size}px "Special Elite", monospace`;
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  const lines: string[] = [];

  for (const paragraph of text.split('\n')) {
    let current = '';

    for (const word of paragraph.split(' ')) {
      const next = current ? `${current} ${word}` : word;

      if (current && pen.measureText(next).width > maxWidth - 8) { lines.push(current); current = word; }
      else current = next;
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

function dot(pen: CanvasRenderingContext2D, point: Point, color: string, radius: number): void {
  pen.beginPath();
  pen.arc(point.x, point.y, radius, 0, TAU);
  pen.fillStyle = color;
  pen.fill();
}

function line(pen: CanvasRenderingContext2D, from: Point, to: Point, colors: Colors, width = .7): void {
  pen.beginPath();
  pen.moveTo(from.x, from.y);
  pen.lineTo(to.x, to.y);
  pen.lineWidth = width;
  pen.strokeStyle = colors.ink;
  pen.stroke();
}

function drawOrbit(pen: CanvasRenderingContext2D, orbit: OrbitData, impact: number, map: (point: Point) => Point, colors: Colors, density: number, ball: boolean, muted = false): void {
  const end = Math.max(0, Math.min(orbit.coords.length / 2 - 1, impact));
  const whole = Math.floor(end);
  pen.beginPath();

  for (let index = 0; index <= whole; index++) {
    const point = map({ x: orbit.coords[index * 2] ?? 0, y: orbit.coords[index * 2 + 1] ?? 0 });

    if (index === 0) pen.moveTo(point.x, point.y);
    else pen.lineTo(point.x, point.y);
  }

  const from = { x: orbit.coords[whole * 2] ?? 0, y: orbit.coords[whole * 2 + 1] ?? 0 };
  const next = Math.min(whole + 1, orbit.coords.length / 2 - 1);
  const to = { x: orbit.coords[next * 2] ?? from.x, y: orbit.coords[next * 2 + 1] ?? from.y };
  const point = map({ x: from.x + (to.x - from.x) * (end - whole), y: from.y + (to.y - from.y) * (end - whole) });
  pen.lineTo(point.x, point.y);
  pen.lineWidth = muted ? Math.min(.45, 1 / density) : .85;
  pen.strokeStyle = muted ? colors.muted : colors.ink;
  pen.stroke();

  if (ball) dot(pen, point, colors.ink, 2.2);
}

function caustic(pen: CanvasRenderingContext2D, delta: number, map: (point: Point) => Point, colors: Colors, density: number, progress = 1): void {
  const lambda = lambdaFor(delta);
  const a = Math.sqrt(1.96 - lambda);
  const b = Math.sqrt(1 - lambda);
  let start = contactAngles.get(delta);

  if (start === undefined) {
    const orbit = traceOrbit(ellipse, .3, delta, 2);
    const nx = (orbit.coords[3] ?? 0) - (orbit.coords[1] ?? 0);
    const ny = (orbit.coords[0] ?? 0) - (orbit.coords[2] ?? 0);
    const c = nx * (orbit.coords[0] ?? 0) + ny * (orbit.coords[1] ?? 0);
    start = Math.atan2(b * ny / c, a * nx / c);
    contactAngles.set(delta, start);
  }

  pen.beginPath();

  for (let index = 0; index <= 240; index++) {
    const angle = start + index / 240 * TAU * progress;
    const point = map({ x: a * Math.cos(angle), y: b * Math.sin(angle) });

    if (index === 0) pen.moveTo(point.x, point.y);
    else pen.lineTo(point.x, point.y);
  }

  pen.strokeStyle = colors.ink;
  pen.lineWidth = Math.min(.7, 1 / density);
  pen.stroke();
}

export function drawTable(pen: CanvasRenderingContext2D, width: number, height: number, density: number, time: number, colors: Colors, label: Label, data: CausticData): void {
  const { table: box, tall } = layout(width, height);
  const state = tableState(time);
  const table = tableFor(state.epsilon);
  const continuation = time >= 88500 && time < 97000;
  const area = {
    x: box.x + 8,
    y: box.y + (continuation ? tall ? 35 : 55 : tall ? 24 : 27),
    w: box.w - 16,
    h: box.h - (continuation ? tall ? 62 : 100 : tall ? 51 : 90),
  };
  const scale = Math.min(area.w / 3.15, area.h / 2.35);
  const center = { x: area.x + area.w / 2, y: area.y + area.h / 2 };
  const map = (point: Point): Point => ({ x: center.x + point.x * scale, y: center.y - point.y * scale });
  const textSize = tall ? 8 : 11;
  const heading = continuation && tall ? 'COMPLEX CONTINUATION · SCHEMATIC' : state.epsilon === 0 ? 'AN ELLIPTICAL BILLIARD TABLE' : 'THE SAME TABLE · A 1% WOBBLE';
  words(pen, heading, box.x + box.w / 2, box.y + 7, box.w, colors, tall ? 9 : 12);
  const rimProgress = smooth(time, 0, 1400);
  pen.beginPath();

  for (let index = 0; index <= 360; index++) {
    const point = map(table.point(.3 + index / 360 * TAU * rimProgress));

    if (index === 0) pen.moveTo(point.x, point.y);
    else pen.lineTo(point.x, point.y);
  }

  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.2;
  pen.stroke();

  if (state.epsilon === 0 && time < 38000 || time >= 90200) {
    const f = Math.sqrt(.96);

    for (const x of [-f, f]) {
      const point = map({ x, y: 0 });
      line(pen, { x: point.x - 3, y: point.y }, { x: point.x + 3, y: point.y }, colors, .7);
      line(pen, { x: point.x, y: point.y - 3 }, { x: point.x, y: point.y + 3 }, colors, .7);
    }

    if (time < 11300 || time >= 97000) words(pen, 'TWO FOCI', center.x, center.y + 12, area.w * .6, colors, tall ? 7 : 10, true);
  }

  if (state.periodicQ !== null) {
    const family = data.families.get(state.kind)?.get(state.periodicQ);

    if (family) {
      const path = periodicPath(family, state.startFraction);
      const growth = smooth(time, time < 83000 ? 81000 : time < 85000 ? 83000 : time < 86300 ? 85000 : 86800, time < 83000 ? 81400 : time < 85000 ? 83400 : time < 86300 ? 85400 : 87200);
      const edges = state.periodicQ * growth;
      pen.beginPath();

      for (let index = 0; index <= Math.floor(edges); index++) {
        const point = map({ x: path.coords[(index % state.periodicQ) * 2] ?? 0, y: path.coords[(index % state.periodicQ) * 2 + 1] ?? 0 });

        if (index === 0) pen.moveTo(point.x, point.y);
        else pen.lineTo(point.x, point.y);
      }

      if (edges < state.periodicQ) {
        const at = Math.floor(edges);
        const next = (at + 1) % state.periodicQ;
        const first = { x: path.coords[at * 2] ?? 0, y: path.coords[at * 2 + 1] ?? 0 };
        const second = { x: path.coords[next * 2] ?? 0, y: path.coords[next * 2 + 1] ?? 0 };
        const point = map({ x: first.x + (second.x - first.x) * (edges - at), y: first.y + (second.y - first.y) * (edges - at) });
        pen.lineTo(point.x, point.y);
      }

      pen.strokeStyle = colors.ink;
      pen.lineWidth = 1.25;
      pen.stroke();
      dot(pen, map({ x: path.coords[0] ?? 0, y: path.coords[1] ?? 0 }), colors.ink, 2.4);
      words(pen, `LENGTH ${path.length.toFixed(6)}`, box.x + box.w / 2, box.y + box.h - (tall ? 19 : 29), box.w, colors, tall ? 10 : 13);
      words(pen, state.kind === 'ellipse' ? `${state.periodicQ} BOUNCES · PERIODIC FROM EVERY START` : 'LONGEST CLOSED POLYGON · FAMILY BROKEN', box.x + box.w / 2, box.y + box.h - (tall ? 0 : 10), box.w, colors, textSize);
    }

    return;
  }

  const shot = shotAt(time);
  const active = orbitFor(data, state.epsilon, shot.delta);

  if (active) {
    const impact = time < 22500 ? shot.impact : 40;

    if (state.epsilon === 0 && time >= 11300 && time < 15500) {
      const old = orbitFor(data, 0, .45);

      if (old) drawOrbit(pen, old, 40, map, colors, density, false, true);

      if (time >= 13300) {
        const middle = orbitFor(data, 0, .25);

        if (middle) drawOrbit(pen, middle, 40, map, colors, density, false, true);
      }
    }

    drawOrbit(pen, active, impact, map, colors, density, time < 22500 || time >= 38000 && time < 40500);
  }

  if (state.epsilon === 0 && time >= 8500) {
    caustic(pen, .45, map, colors, density, smooth(time, 8500, 9700));

    if (time >= 11300) caustic(pen, .25, map, colors, density, smooth(time, 11300, 12500));
    if (time >= 13300) caustic(pen, .12, map, colors, density, smooth(time, 13300, 14500));

    if (time >= 22500) {
      const deltas = [.04, .08, .18, .34, .55, .65, .75];

      for (const [index, delta] of deltas.entries()) caustic(pen, delta, map, colors, density, time >= 90200 ? 1 : smooth(time, 22500 + index * 450, 23800 + index * 450));
    }

    if (time >= 8500 && time < 11300) label('caustic-equation', box.x + box.w / 2, box.y + box.h - 14);

    if (time >= 13300 && time < 15500) {
      const lambda = lambdaFor(.12);
      const point = map({ x: Math.sqrt(1.96 - lambda) * Math.cos(2.4), y: Math.sqrt(1 - lambda) * Math.sin(2.4) });
      const anchor = { x: box.x + box.w * .23, y: box.y + box.h - 27 };
      line(pen, point, anchor, colors, .5);
      words(pen, 'CLOSER TO THE RIM', anchor.x, anchor.y + 12, box.w * .48, colors, textSize);
    }
  }

  if (time >= 58500 && time < 80000) {
    const thickness = .11 - .085 * smooth(time, 58500, 65000);
    pen.beginPath();

    for (let index = 0; index <= 240; index++) {
      const point = table.point(index / 240 * TAU);
      const outer = map(point);
      const inner = map({ x: point.x * (1 - thickness), y: point.y * (1 - thickness) });

      if (index % 3 === 0) { pen.moveTo(outer.x, outer.y); pen.lineTo(inner.x, inner.y); }
    }

    pen.strokeStyle = colors.muted;
    pen.lineWidth = .5;
    pen.stroke();
    words(pen, 'ASSUMED GAP-FREE BAND · SCHEMATIC', box.x + box.w / 2, box.y + box.h - 12, box.w, colors, textSize);
  } else if (continuation) {
    const cases = ['SLOW GROWTH', 'FAST GROWTH', 'ENTIRE', 'CRITICAL'];
    const index = Math.min(3, Math.floor((time - 89500) / 1400));
    if (!tall) words(pen, 'COMPLEX CONTINUATION · SCHEMATIC', box.x + box.w / 2, box.y + 28, box.w, colors, textSize);
    const name = cases[Math.max(0, index)] ?? 'CRITICAL';
    const caseY = box.y + (tall ? 24 : 44);
    words(pen, name, box.x + box.w / 2, caseY, box.w, colors, textSize);

    if (time > 89500 + Math.max(0, index) * 1400 + 700) line(pen, { x: box.x + box.w * .30, y: caseY + 5 }, { x: box.x + box.w * .70, y: caseY - 5 }, colors, .9);

    words(pen, 'A ZERO OR POLE OF THE NORMAL → ELLIPSE', box.x + box.w / 2, box.y + box.h - 12, box.w, colors, textSize);
  } else if (time >= 38000 && time < 45500) {
    if (time < 42500) label('wobble-equation', box.x + box.w / 2, box.y + box.h - 14);
    else words(pen, 'COMPUTED · ORDERLY NEAR THE RIM', box.x + box.w / 2, box.y + box.h - 12, box.w, colors, textSize);
  } else if (time < 8500) words(pen, 'A SHALLOW SHOT · 0.45 RADIANS', box.x + box.w / 2, box.y + box.h - 12, box.w, colors, textSize);
  else if (time >= 15500 && time < 22500) words(pen, 'EACH IMPACT DROPS A PHASE DOT', box.x + box.w / 2, box.y + box.h - 12, box.w, colors, textSize);
  else if (time >= 22500 && time < 38000 || time >= 97000) words(pen, 'NESTED CAUSTICS · SAME TWO FOCI', box.x + box.w / 2, box.y + box.h - 12, box.w, colors, textSize);
}

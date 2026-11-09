import { dimensionBasis, graphState, pointOnEdge, type Edge, type GraphState, type Point } from './math';
import { tallyTarget } from './gauge';
import { layout, smooth } from './story';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type Label = (id: string, x: number, y: number, opacity?: number) => void;

const history = new Map<number, GraphState>();

function historyAt(time: number): GraphState {
  const known = history.get(time);

  if (known) return known;

  const snapshot = graphState(time);
  history.set(time, snapshot);

  if (history.size > 64) {
    const oldest = history.keys().next().value;

    if (oldest !== undefined) history.delete(oldest);
  }

  return snapshot;
}

function words(pen: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, colors: Colors, size: number, muted = false): void {
  pen.font = `${size}px "Special Elite", monospace`;
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  const lines: string[] = [];

  for (const paragraph of text.split('\n')) {
    let line = '';

    for (const word of paragraph.split(' ')) {
      const next = line ? `${line} ${word}` : word;

      if (line && pen.measureText(next).width > maxWidth - 6) { lines.push(line); line = word; }
      else line = next;
    }

    lines.push(line);
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

function ring(pen: CanvasRenderingContext2D, point: Point, colors: Colors, radius: number, weight = .8): void {
  pen.beginPath();
  pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
  pen.lineWidth = weight;
  pen.strokeStyle = colors.ink;
  pen.stroke();
}

function edgePath(pen: CanvasRenderingContext2D, edge: Edge, map: (point: Point) => Point, progress = edge.visible): void {
  if (progress <= 0) return;

  const samples = edge.kind === 'segment' ? 1 : edge.kind === 'polyline' ? (edge.points.length - 1) * 3 : 100;
  pen.beginPath();

  for (let index = 0; index <= samples; index++) {
    const t = edge.reverse ? 1 - progress * index / samples : progress * index / samples;
    const point = map(pointOnEdge(edge, t));

    if (index === 0) pen.moveTo(point.x, point.y);
    else pen.lineTo(point.x, point.y);
  }
}

function onCycle(edge: Edge, cycle: readonly number[]): boolean {
  for (let index = 0; index < cycle.length; index++) {
    const a = cycle[index] ?? 0;
    const b = cycle[(index + 1) % cycle.length] ?? 0;

    if (edge.a === Math.min(a, b) && edge.b === Math.max(a, b)) return true;
  }

  return false;
}

export function drawGraph(pen: CanvasRenderingContext2D, width: number, height: number, time: number, colors: Colors, label: Label, state: GraphState): void {
  const { sheet: box, tall } = layout(width, height);
  const dimension = smooth(time, 89000, 91000);
  const area = { x: box.x + 10, y: box.y + 28, w: (box.w - 20) * (1 - .25 * dimension), h: box.h - (tall ? 69 : 94) };
  const bounds = { left: Infinity, right: -Infinity, bottom: Infinity, top: -Infinity };

  for (const edge of state.edges) {
    for (let index = 0; index <= 24; index++) {
      const point = pointOnEdge(edge, index / 24);
      bounds.left = Math.min(bounds.left, point.x);
      bounds.right = Math.max(bounds.right, point.x);
      bounds.bottom = Math.min(bounds.bottom, point.y);
      bounds.top = Math.max(bounds.top, point.y);
    }
  }

  const rangeX = Math.max(1, bounds.right - bounds.left);
  const rangeY = Math.max(1, bounds.top - bounds.bottom);
  const scaleX = (area.w - 14) / rangeX;
  const scaleY = (area.h - 12) / rangeY;
  const center = { x: (bounds.left + bounds.right) / 2, y: (bounds.bottom + bounds.top) / 2 };
  const map = (point: Point): Point => ({ x: area.x + area.w / 2 + (point.x - center.x) * scaleX, y: area.y + area.h / 2 - (point.y - center.y) * scaleY });
  const size = tall ? 8 : 11;
  const completeGraph = state.kind === 'book' || state.kind === 'drift' || state.kind === 'cycles' || state.kind === 'dimension';
  words(pen, completeGraph ? 'EVERY DOT JOINED TO EVERY OTHER' : 'KILNS, YARDS AND THE CROSSINGS', box.x + box.w / 2, box.y + 7, box.w, colors, tall ? 9 : 12);

  if (state.kind === 'book' || state.kind === 'cycles' || state.kind === 'dimension') {
    const first = state.vertices[0];
    const last = state.vertices[state.vertices.length - 1];

    if (first && last) {
      pen.beginPath();
      const a = map(first);
      const b = map(last);
      pen.moveTo(a.x - 5, a.y);
      pen.lineTo(b.x + 5, b.y);
      pen.strokeStyle = colors.muted;
      pen.lineWidth = .5;
      pen.stroke();
    }
  }

  for (const edge of state.edges) {
    edgePath(pen, edge, map);
    pen.strokeStyle = time >= 82000 ? colors.muted : colors.ink;
    pen.lineWidth = completeGraph ? (tall ? .48 : .7) : (tall ? .8 : 1);
    pen.stroke();
  }

  if (time >= 82000 && time < 89000) {
    for (const [cycleIndex, cycle] of [[1, 2, 5], [0, 3, 6, 4]].entries()) {
      const progress = smooth(time, 82000 + cycleIndex * 500, 83500 + cycleIndex * 500);

      for (let index = 0; index < cycle.length; index++) {
        const a = cycle[index] ?? 0;
        const b = cycle[(index + 1) % cycle.length] ?? 0;
        const edge = state.edges.find(candidate => candidate.a === Math.min(a, b) && candidate.b === Math.max(a, b));

        if (!edge || !onCycle(edge, cycle)) continue;

        edgePath(pen, edge, map, progress);
        pen.strokeStyle = colors.ink;
        pen.lineWidth = cycleIndex === 0 ? (tall ? 1.5 : 2) : (tall ? 1.1 : 1.5);
        pen.stroke();
        const t = a < b ? .42 : .58;
        const from = map(pointOnEdge(edge, t - (a < b ? .02 : -.02)));
        const to = map(pointOnEdge(edge, t + (a < b ? .02 : -.02)));
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        pen.beginPath();
        pen.moveTo(to.x - 4 * Math.cos(angle - .5), to.y - 4 * Math.sin(angle - .5));
        pen.lineTo(to.x, to.y);
        pen.lineTo(to.x - 4 * Math.cos(angle + .5), to.y - 4 * Math.sin(angle + .5));
        pen.stroke();
      }
    }
  }

  for (const crossing of state.intersections) ring(pen, map(crossing), colors, tall ? 1.5 : 2.2, tall ? .65 : .85);

  for (const vertex of state.vertices) {
    const point = map(vertex);
    pen.fillStyle = vertex.kind === 'yard' ? colors.paper : colors.ink;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .9;

    if (vertex.kind === 'dot') {
      pen.beginPath();
      pen.arc(point.x, point.y, tall ? 2 : 2.8, 0, Math.PI * 2);
      pen.fill();
    } else {
      const extent = tall ? 4.5 : 6;
      pen.fillRect(point.x - extent / 2, point.y - extent / 2, extent, extent);
      pen.strokeRect(point.x - extent / 2, point.y - extent / 2, extent, extent);
    }

    if (time >= 82000) words(pen, String(vertex.id), point.x, point.y + (tall ? 10 : 14), 20, colors, tall ? 7 : 9);
  }

  if (time >= 83500 && time < 89000) {
    for (const [index, crossing] of state.signed.entries()) {
      if (time < 83500 + index * 1100) continue;

      const point = map(crossing);
      const spineY = map({ x: crossing.x, y: 0 }).y;
      const anchor = { x: point.x, y: point.y + (point.y > spineY ? 12 : -12) };
      pen.beginPath();
      pen.moveTo(point.x, point.y);
      pen.lineTo(anchor.x, anchor.y);
      pen.strokeStyle = colors.muted;
      pen.lineWidth = .4;
      pen.stroke();
      words(pen, crossing.sign > 0 ? '+' : '−', anchor.x, anchor.y, 24, colors, tall ? 12 : 16);
    }
  }

  if (time < 8500 && time > 4200) {
    const edge = state.edges[5];

    if (edge) {
      const t = (time - 4200) / 4300;
      const point = map(pointOnEdge(edge, t));
      let hop = 0;

      for (const crossing of state.intersections) {
        const at = crossing.first === edge.id ? crossing.tFirst : crossing.second === edge.id ? crossing.tSecond : -1;

        if (at >= 0) hop += Math.max(0, 1 - Math.abs(t - at) / .04) * (tall ? 3 : 5);
      }

      pen.fillStyle = colors.paper;
      pen.strokeStyle = colors.ink;
      pen.lineWidth = .8;
      pen.fillRect(point.x - 4, point.y - 6 - hop, 8, 5);
      pen.strokeRect(point.x - 4, point.y - 6 - hop, 8, 5);
      ring(pen, { x: point.x - 2.5, y: point.y - .5 - hop }, colors, 1);
      ring(pen, { x: point.x + 2.5, y: point.y - .5 - hop }, colors, 1);
    }
  }

  if (dimension > 0) {
    const basis = dimensionBasis(3);
    const cell = Math.min(tall ? 15 : 27, box.w * .07);
    const left = box.x + box.w * .78;
    const top = box.y + box.h * .30;
    const cells = Math.floor(smooth(time, 89000, 91900) * 9);

    for (let index = 0; index < cells; index++) {
      const row = Math.floor(index / 3);
      const column = index % 3;
      const x = left + column * cell;
      const y = top + row * cell;
      pen.strokeStyle = colors.ink;
      pen.lineWidth = .7;
      pen.strokeRect(x, y, cell, cell);
      const a = basis[row];
      const b = basis[column];

      if (!tall && a && b) words(pen, `${a[0]}${a[1]}|${b[0]}${b[1]}`, x + cell / 2, y + cell / 2, cell - 2, colors, 7);

      const crossing = state.intersections[index];

      if (crossing && time >= 92000) {
        const to = map(crossing);
        pen.setLineDash([2, 3]);
        pen.beginPath();
        pen.moveTo(x + cell / 2, y + cell / 2);
        pen.lineTo(to.x, to.y);
        pen.lineWidth = .4;
        pen.strokeStyle = colors.muted;
        pen.stroke();
        pen.setLineDash([]);
      }
    }

    words(pen, 'BASIS', left + cell * 1.5, top - 12, cell * 3.5, colors, tall ? 7 : 10);
    label('dimension-count', box.x + box.w / 2, box.y + box.h - 30);
  }

  const target = tallyTarget(width, height);
  const end = Math.floor(time / 600) * 600;

  if (time < 82000 && end >= 600) {
    const before = historyAt(end - 600);
    const after = historyAt(end);
    const oldIds = new Set(before.intersections.map(crossing => crossing.id));
    const newIds = new Set(after.intersections.map(crossing => crossing.id));
    const amount = (time - end) / 600;

    for (const crossing of after.intersections) {
      if (oldIds.has(crossing.id)) continue;

      const from = map(crossing);
      ring(pen, { x: from.x + (target.x - from.x) * amount, y: from.y + (target.y - from.y) * amount - Math.sin(amount * Math.PI) * 12 }, colors, tall ? 1.5 : 2);
    }

    for (const crossing of before.intersections) {
      if (newIds.has(crossing.id)) continue;

      const to = map(crossing);
      ring(pen, { x: target.x + (to.x - target.x) * amount, y: target.y + (to.y - target.y) * amount + Math.sin(amount * Math.PI) * 14 }, colors, (tall ? 1.5 : 2) * (1 - amount));
    }
  }

  if (state.kind === 'k4' || state.kind === 'k5' || state.kind === 'utilities') label(state.kind === 'k4' ? 'graph-k4' : state.kind === 'k5' ? 'graph-k5' : 'graph-k33', box.x + box.w / 2, box.y + box.h - 23);
  else if (time < 8500) words(pen, '3 KILNS · 4 YARDS · EVERY RAIL', box.x + box.w / 2, box.y + box.h - 19, box.w, colors, size);
  else if (time < 23000) words(pen, 'ZARANKIEWICZ’S CROSS · STRAIGHT RAILS', box.x + box.w / 2, box.y + box.h - 19, box.w, colors, size);
  else if (time < 30500) words(pen, 'ANY CURVE · COUNT EACH CROSSING POINT', box.x + box.w / 2, box.y + box.h - 19, box.w, colors, size);
  else if (time < 66000) words(pen, state.complete ? 'TWO PAGES · THE FORMULA IS REACHED' : 'THE ARCS DRAW AND CHANGE PAGES', box.x + box.w / 2, box.y + box.h - 19, box.w, colors, size);
  else if (time < 82000) words(pen, 'FREE CURVES · AN INVERTIBLE SHEAR · SCHEMATIC', box.x + box.w / 2, box.y + box.h - 19, box.w, colors, size);
  else if (time < 89000) words(pen, 'TWO CLOSED CYCLES · SIGNED INTERSECTIONS', box.x + box.w / 2, box.y + box.h - 19, box.w, colors, size);
  else words(pen, 'DIMENSION ≤ HALF THE ORDERED PAIRS ≤ CROSSINGS', box.x + box.w / 2, box.y + box.h - 10, box.w, colors, size);
}

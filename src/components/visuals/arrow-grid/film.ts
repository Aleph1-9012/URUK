import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { buildArrowGridModel, interpolateFields, periodicPlaquettes } from './math';
import { drawArrowGridPanels } from './panels';
import { AXIS_CARRY_GRID_INSET, motionAt, SCENE_TIMES } from './story';

type Point = { x: number; y: number };

type Rect = { left: number; right: number; top: number; bottom: number };

type Motion = ReturnType<typeof motionAt>;

function between(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

function betweenRects(a: Rect, b: Rect, amount: number): Rect {
  return { left: mix(a.left, b.left, amount), right: mix(a.right, b.right, amount), top: mix(a.top, b.top, amount), bottom: mix(a.bottom, b.bottom, amount) };
}

class ArrowGridFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly model = buildArrowGridModel();
  private readonly horizontalField = Array.from({ length: this.model.size }, () => Array.from({ length: this.model.size }, () => 0));

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 5 });
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.tones = tones;
    this.labels.resize(width, height);
  }

  private get phone(): boolean {
    return this.width < PHONE_STAGE_WIDTH;
  }

  private text(value: string, point: Point, size: number, math = false, blue = false): void {
    drawText(this.pen, value, point.x, point.y, { size, family: math ? 'math' : 'type', color: blue ? this.tones.blue : this.tones.ink, paper: this.tones.paper });
  }

  private gridBounds(inset: number): Rect {
    const { width: w, height: h } = this;
    const size = Math.min(w * (this.phone ? .88 : .43), h * (this.phone ? .43 : .74));
    const center = { x: w * (this.phone ? .5 : .27), y: h * (this.phone ? .27 : .43) };
    const large = { left: center.x - size / 2, right: center.x + size / 2, top: center.y - size / 2, bottom: center.y + size / 2 };
    const small = Math.min(w * (this.phone ? .22 : .12), h * .16);
    const corner = { x: w * (this.phone ? .18 : .12), y: h * .12 };

    return betweenRects(large, { left: corner.x - small / 2, right: corner.x + small / 2, top: corner.y - small / 2, bottom: corner.y + small / 2 }, inset);
  }

  private site(i: number, j: number, bounds: Rect): Point {
    const spacing = (bounds.right - bounds.left) / this.model.size;

    return { x: bounds.left + i * spacing, y: bounds.bottom - j * spacing };
  }

  private correlationBounds(split: number): Rect {
    const { width: w, height: h } = this;
    const full = { left: w * (this.phone ? .13 : .12), right: w * (this.phone ? .93 : .56), top: h * .29, bottom: h * .63 };
    const small = { left: w * (this.phone ? .13 : .09), right: w * (this.phone ? .93 : .46), top: h * (this.phone ? .25 : .31), bottom: h * (this.phone ? .43 : .64) };

    return betweenRects(full, small, split);
  }

  private lengthBounds(): Rect {
    const { width: w, height: h } = this;

    return { left: w * (this.phone ? .13 : .59), right: w * .93, top: h * (this.phone ? .59 : .31), bottom: h * (this.phone ? .78 : .64) };
  }

  private correlationPoint(logR: number, logC: number, bounds: Rect): Point {
    return { x: mix(bounds.left, bounds.right, (logR - Math.log(10)) / Math.log(1e7)), y: mix(bounds.top, bounds.bottom, -logC / 5.1) };
  }

  private lengthPoint(b: number, logXi: number, bounds: Rect): Point {
    return { x: mix(bounds.left, bounds.right, (b - .5) / .6), y: mix(bounds.bottom, bounds.top, logXi / 110) };
  }

  private arrow(point: Point, angle: number, length: number): void {
    if (length <= 0) return;

    const { pen } = this;
    const direction = { x: Math.cos(angle), y: -Math.sin(angle) };
    const start = { x: point.x - direction.x * length / 2, y: point.y - direction.y * length / 2 };
    const end = { x: point.x + direction.x * length / 2, y: point.y + direction.y * length / 2 };
    const head = Math.min(3, length * .35);
    pen.moveTo(start.x, start.y);
    pen.lineTo(end.x, end.y);

    if (length < 2) return;

    pen.moveTo(end.x - head * direction.x - head * .55 * direction.y, end.y - head * direction.y + head * .55 * direction.x);
    pen.lineTo(end.x, end.y);
    pen.lineTo(end.x - head * direction.x + head * .55 * direction.y, end.y - head * direction.y - head * .55 * direction.x);
  }

  draw(time: number): void {
    const { pen, width: w, height: h, model } = this;
    const motion = motionAt(time);
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();
    let angles = interpolateFields(this.horizontalField, model.middle.angles, motion.align);
    angles = interpolateFields(angles, model.cold.angles, motion.cold);
    angles = interpolateFields(angles, model.middle.angles, motion.warm);
    angles = interpolateFields(angles, model.hot.angles, motion.hot);
    this.grid(angles, motion);

    if (time >= SCENE_TIMES.noOrder && time < SCENE_TIMES.memory) this.variation(motion);
    if (time >= SCENE_TIMES.memory && time < SCENE_TIMES.vortices) this.memory(motion);
    if (time >= SCENE_TIMES.vortices) this.vortices(angles, motion);
    if (time >= SCENE_TIMES.correlation) this.correlation(motion);
    if (time >= SCENE_TIMES.length) this.length(motion);

    drawArrowGridPanels(pen, w, h, time, this.tones, this.labels, model);
    this.labels.endFrame();
  }

  private grid(angles: readonly (readonly number[])[], motion: Motion): void {
    const { pen, tones, model } = this;
    const bounds = this.gridBounds(motion.gridInset);
    const departure = this.gridBounds(AXIS_CARRY_GRID_INSET);
    const spacing = (bounds.right - bounds.left) / model.size;
    const length = Math.min(this.phone ? 9 : 14, spacing * .82);
    const destination = betweenRects(this.correlationBounds(0), this.lengthBounds(), motion.lengthAxis);
    pen.beginPath();

    for (let i = 0; i < model.size; i++) {
      for (let j = 0; j < model.size; j++) {
        const value = angles[i]?.[j];

        if (value === undefined) throw new Error('Each arrow needs its actual sampled or interpolated angle.');

        const visible = Math.max(0, Math.min(1, motion.populate * model.size ** 2 - i * model.size - j));
        let point = this.site(i, j, bounds);
        let arrowLength = length * visible;

        if (j === 0 && motion.axisCarry > 0) {
          const start = this.site(i, j, departure);
          const end = { x: mix(destination.left, destination.right, i / (model.size - 1)), y: destination.bottom };
          point = between(start, end, motion.axisCarry);
          arrowLength *= 1 - motion.axisCarry;
          pen.moveTo(point.x, point.y);
          pen.lineTo(point.x, point.y + 3 * motion.axisCarry);
        }

        this.arrow(point, value, arrowLength);
      }
    }

    pen.strokeStyle = tones.ink;
    pen.lineWidth = mix(this.phone ? .8 : .9, .5, motion.gridInset);
    pen.stroke();

    if (motion.gridInset === 0 && motion.align === 1 && motion.cold === 0) {
      const a = this.site(8, 10, bounds);
      const b = this.site(9, 10, bounds);
      drawLine(pen, a.x, a.y + spacing * .45, b.x, b.y + spacing * .45, tones.ink, 2);
    }
  }

  private variation(motion: Motion): void {
    const bounds = this.gridBounds(0);
    const point = this.site(10, 10, bounds);
    this.pen.beginPath();
    this.pen.arc(point.x, point.y, (bounds.right - bounds.left) * .19, -.6, -.6 + 2 * Math.PI * motion.noOrder);
    this.pen.strokeStyle = this.tones.ink;
    this.pen.lineWidth = .65;
    this.pen.setLineDash([2, 4]);
    this.pen.stroke();
    this.pen.setLineDash([]);
  }

  private memory(motion: Motion): void {
    const bounds = this.gridBounds(0);
    const a = this.site(2, 4, bounds);
    const b = this.site(17, 15, bounds);
    const end = between(a, b, motion.memoryThread);
    drawLine(this.pen, a.x, a.y, end.x, end.y, this.tones.ink, .55, [2, 3]);
    const { width: w, height: h } = this;
    const chart = { left: w * (this.phone ? .60 : .64), right: w * (this.phone ? .90 : .90), top: h * (this.phone ? .65 : .58), bottom: h * (this.phone ? .77 : .78) };

    if (motion.memoryInset <= 0) return;

    drawLine(this.pen, chart.left, chart.top, chart.left, chart.bottom, this.tones.ink, .6);
    drawLine(this.pen, chart.left, chart.bottom, chart.right, chart.bottom, this.tones.ink, .6);
    const first = { x: chart.left, y: chart.top + 5 };
    const last = { x: chart.right, y: chart.bottom - 8 };
    const partial = between(first, last, motion.memoryInset);
    drawLine(this.pen, first.x, first.y, partial.x, partial.y, this.tones.ink, 1.1);
    this.text('SCHEMATIC', { x: (chart.left + chart.right) / 2, y: chart.bottom + 14 }, this.phone ? 7.5 : 10);
  }

  private vortices(angles: readonly (readonly number[])[], motion: Motion): void {
    if ((motion.warm > 0 && motion.warm < 1) || (motion.hot > 0 && motion.hot < 1)) return;

    const { pen, model, tones } = this;
    const bounds = this.gridBounds(motion.gridInset);
    const spacing = (bounds.right - bounds.left) / model.size;
    const radius = mix(Math.min(4, spacing * .31), .65, motion.gridInset);

    for (const vortex of periodicPlaquettes(angles)) {
      if (vortex.charge === 0) continue;

      const point = this.site(vortex.i + .5, vortex.j + .5, bounds);
      pen.beginPath();
      pen.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      pen.fillStyle = vortex.charge > 0 ? tones.ink : tones.paper;
      pen.strokeStyle = tones.ink;
      pen.lineWidth = .8;
      pen.fill();
      pen.stroke();
    }

    if (motion.vortexZoom > 0 && motion.gridInset < 1) this.vortexLens(motion);
  }

  private vortexLens(motion: Motion): void {
    const { width: w, height: h, model, pen, tones } = this;
    const actual = model.windingExample;
    const bounds = this.gridBounds(motion.gridInset);
    const original = this.site(actual.i + .5, actual.j + .5, bounds);
    const center = { x: w * (this.phone ? .5 : .77), y: h * (this.phone ? .68 : .48) };
    const zoom = motion.vortexZoom * (1 - motion.gridInset);
    const carried = between(original, center, zoom);
    const spacing = mix((bounds.right - bounds.left) / model.size, this.phone ? 42 : 66, zoom);
    const corners = [[-1, 1], [1, 1], [1, -1], [-1, -1]] as const;
    pen.beginPath();

    for (const [index, corner] of corners.entries()) {
      const angle = actual.angles[index];

      if (angle === undefined) throw new Error('The vortex lens uses all four actual plaquette angles.');

      this.arrow({ x: carried.x + corner[0] * spacing / 2, y: carried.y + corner[1] * spacing / 2 }, angle, Math.min(24, spacing * .45));
    }

    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.2;
    pen.stroke();
    pen.beginPath();
    pen.arc(carried.x, carried.y, spacing * .23, 0, 2 * Math.PI);
    pen.lineWidth = .8;
    pen.fillStyle = tones.ink;
    pen.fill();
    pen.stroke();
    drawText(pen, '+1', carried.x, carried.y, { size: (this.phone ? 10 : 12) * zoom, family: 'math', color: tones.paper });

    if (zoom === 1) this.text('ACTUAL FOUR ARROWS · WINDING +1', { x: center.x, y: center.y + spacing / 2 + 23 }, this.phone ? 8 : 10);
  }

  private axes(bounds: Rect, horizontal: string, vertical: string): void {
    const { pen, tones } = this;
    drawLine(pen, bounds.left, bounds.top, bounds.left, bounds.bottom, tones.ink, .7);
    drawLine(pen, bounds.left, bounds.bottom, bounds.right, bounds.bottom, tones.ink, .7);
    this.text(horizontal, { x: bounds.right + 8, y: bounds.bottom + 30 }, this.phone ? 11 : 14, true);
    this.text(vertical, { x: bounds.left, y: bounds.top - 17 }, this.phone ? 11 : 14, true);
  }

  private correlation(motion: Motion): void {
    if (motion.axisCarry < 1) return;

    const { pen, tones, model } = this;
    const bounds = this.correlationBounds(motion.lengthAxis);
    this.axes(bounds, 'r', 'C(r)');

    for (const r of [10, 100, 10000, 1e8]) {
      const point = this.correlationPoint(Math.log(r), -5.1, bounds);
      drawLine(pen, point.x, point.y, point.x, point.y + 4, tones.ink, .6);
      const value = r === 10 ? '10' : r === 100 ? '10²' : r === 10000 ? '10⁴' : '10⁸';
      this.text(value, { x: point.x, y: point.y + 15 }, this.phone ? 9 : 11, true);
    }

    for (const c of [1, .1, .01]) {
      const point = this.correlationPoint(Math.log(10), Math.log(c), bounds);
      drawLine(pen, point.x - 4, point.y, point.x, point.y, tones.ink, .6);
      this.text(String(c), { x: point.x - 15, y: point.y + 2 }, this.phone ? 9 : 11, true);
    }

    for (const trace of [{ amount: motion.pureCurve, corrected: false }, { amount: motion.correctedCurve, corrected: true }]) {
      pen.beginPath();
      const limit = Math.floor(trace.amount * model.correlation.length);

      for (let index = 0; index < limit; index++) {
        const row = model.correlation[index];

        if (!row) throw new Error('Each formula-curve point needs its computed values.');

        const point = this.correlationPoint(row.logR, trace.corrected ? row.logCorrected : row.logPure, bounds);

        if (index === 0) pen.moveTo(point.x, point.y);
        else pen.lineTo(point.x, point.y);
      }

      pen.strokeStyle = tones.ink;
      pen.lineWidth = trace.corrected ? 1.6 : .8;
      pen.stroke();
    }

    if (motion.knownPhase > 0) {
      const endpoint = this.correlationPoint(Math.log(1e8), -.25 * Math.log(1e8), bounds);
      this.predictionRing(endpoint, motion.knownPhase);
    }

    if (motion.claimMarks > 0) {
      const row = model.correlationReadouts[2];

      if (!row) throw new Error('The claim bend mark needs its actual formula point.');

      const point = this.correlationPoint(row.logR, row.logCorrected, bounds);
      drawLine(pen, point.x, point.y - 7, point.x, point.y + 7, tones.blue, 2);
      const endpoint = this.correlationPoint(Math.log(1e8), -.25 * Math.log(1e8), bounds);
      pen.beginPath();
      pen.arc(endpoint.x, endpoint.y, 7, 0, 2 * Math.PI * motion.claimMarks);
      pen.strokeStyle = tones.blue;
      pen.lineWidth = 2;
      pen.stroke();
    }
  }

  private length(motion: Motion): void {
    const { pen, model, tones } = this;
    const bounds = betweenRects(this.correlationBounds(0), this.lengthBounds(), motion.lengthAxis);

    if (motion.lengthAxis < 1) {
      drawLine(pen, bounds.left, bounds.bottom, bounds.right, bounds.bottom, tones.ink, .7);

      return;
    }

    this.axes(bounds, 'b', 'ln ξ');

    for (const b of [.5, .9, 1, 1.1]) {
      const point = this.lengthPoint(b, 0, bounds);
      drawLine(pen, point.x, point.y, point.x, point.y + 4, tones.ink, .6);
      this.text(String(b), { x: point.x, y: point.y + 15 }, this.phone ? 9 : 11, true);
    }

    for (const value of [10, 50, 100]) {
      const point = this.lengthPoint(.5, value, bounds);
      drawLine(pen, point.x - 4, point.y, point.x, point.y, tones.ink, .6);
      this.text(String(value), { x: point.x - 14, y: point.y + 2 }, this.phone ? 9 : 11, true);
    }

    pen.beginPath();
    const limit = Math.floor(motion.lengthCurve * model.length.length);

    for (let index = 0; index < limit; index++) {
      const row = model.length[index];

      if (!row) throw new Error('Each length-curve point needs its actual formula value.');

      const point = this.lengthPoint(row.illustrativeB, row.logXi, bounds);

      if (index === 0) pen.moveTo(point.x, point.y);
      else pen.lineTo(point.x, point.y);
    }

    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.5;
    pen.stroke();

    if (motion.knownPhase > 0) {
      const a = this.lengthPoint(1.01, 0, bounds);
      const b = this.lengthPoint(mix(1.01, 1.1, motion.knownPhase), 0, bounds);
      drawLine(pen, a.x, a.y + 26, b.x, b.y + 26, tones.ink, 2.5);
      this.predictionRing(this.lengthPoint(.9999, 100, bounds), motion.knownPhase);

      if (motion.knownPhase === 1) this.text('1981', { x: (a.x + b.x) / 2, y: a.y + 40 }, this.phone ? 8 : 10, true);
    }

    if (motion.claimMarks > 0) {
      const point = this.lengthPoint(.9999, 100, bounds);
      pen.beginPath();
      pen.arc(point.x, point.y, 7, 0, 2 * Math.PI * motion.claimMarks);
      pen.strokeStyle = tones.blue;
      pen.lineWidth = 2;
      pen.stroke();
    }
  }

  private predictionRing(point: Point, progress: number): void {
    this.pen.beginPath();
    this.pen.arc(point.x, point.y, 11, 0, 2 * Math.PI * progress);
    this.pen.strokeStyle = this.tones.ink;
    this.pen.lineWidth = .8;
    this.pen.setLineDash([3, 4]);
    this.pen.stroke();
    this.pen.setLineDash([]);
  }
}

export function createArrowGridFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new ArrowGridFilm(root, context);
}

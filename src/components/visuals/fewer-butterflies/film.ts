import { mix, progress, smooth } from '../../../lib/animation';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import type { FilmDrawing } from '../../plate/controller';
import { drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';
import { buildFourierModel, type FourierTrace } from './math';
import { drawLedger, drawPlot, plotLayout } from './panels';

type Point = { x: number; y: number };

type Tones = { ink: string; muted: string; paper: string; blue: string };

function interpolate(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

class ButterflyFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly model = buildFourierModel();
  private tones: Tones = PAGE_TONES;

  constructor(private readonly pen: CanvasRenderingContext2D) {}

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.tones = tones;
  }

  draw(time: number): void {
    const { width: w, height: h, pen, tones } = this;
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);

    if (time < 8500) this.definition(time);
    else if (time < 11000) this.factorization(time);
    else if (time < 25000) this.butterflies(time);
    else if (time < 28500) this.fold(time);
    else this.miniature();

    drawPlot(pen, w, h, time, tones, this.model);
    drawLedger(pen, w, h, time, tones);
  }

  private text(value: string, x: number, y: number, size: number, math = false): void {
    drawText(this.pen, value, x, y, { size, color: this.tones.ink, family: math ? 'math' : 'type', paper: this.tones.paper });
  }

  private note(value: string, x: number, top: number, width: number, size: number): void {
    drawWrappedText(this.pen, value, x, top, width, { size, color: this.tones.ink, paper: this.tones.paper });
  }

  private trace(index: number): FourierTrace {
    const trace = this.model.traces[index];

    if (!trace) throw new Error('Every drawn rail stack needs its computed Fourier trace.');

    return trace;
  }

  private rail(trace: FourierTrace, column: number, row: number, small = false): Point {
    const { width: w, height: h } = this;
    const tall = w < PHONE_STAGE_WIDTH;

    if (small) {
      const left = w * (tall ? .19 : .10);
      const right = w * (tall ? .81 : .42);
      const pitch = Math.min(tall ? 8.5 : 17, h * (tall ? .018 : .030));
      const top = h * (tall ? .105 : .20);

      return { x: mix(left, right, column / trace.layers), y: top + row * pitch };
    }

    const pitch = trace.n === 8 ? Math.min(22, h * .055) : trace.n === 16 ? Math.min(13, h * .033) : Math.max(6, Math.min(8, h * .018));
    const top = h * (trace.n === 8 ? .20 : trace.n === 16 ? .17 : .12);

    return { x: mix(w * .13, w * .89, column / trace.layers), y: top + row * pitch };
  }

  private dot(point: Point, radius = 2.3): void {
    this.pen.beginPath();
    this.pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    this.pen.fillStyle = this.tones.ink;
    this.pen.fill();
  }

  private definition(time: number): void {
    const { pen, width: w, height: h, tones } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const trace = this.trace(0);
    const reveal = progress(time, 0, 2200);
    pen.strokeStyle = tones.ink;
    pen.lineWidth = Math.min(.8, 1 / this.density);
    pen.beginPath();

    for (let row = 0; row < trace.n; row++) {
      const a = this.rail(trace, 0, row);
      const b = this.rail(trace, trace.layers, row);
      const end = interpolate(a, b, reveal);
      pen.moveTo(a.x, a.y);
      pen.lineTo(end.x, end.y);
    }

    pen.stroke();

    if (time >= 5000) {
      const count = Math.floor(trace.naiveProducts * progress(time, 5000, 7000));
      pen.beginPath();
      pen.strokeStyle = tones.muted;

      for (let index = 0; index < count; index++) {
        const a = this.rail(trace, 0, Math.floor(index / trace.n));
        const b = this.rail(trace, trace.layers, index % trace.n);
        pen.moveTo(a.x, a.y);
        pen.lineTo(b.x, b.y);
      }

      pen.stroke();
      this.text(`BY THE DEFINITION: ${count} PRODUCTS`, w * .5, h * .76, tall ? 10 : 15);
      this.text('EACH INPUT CONTRIBUTES TO EACH OUTPUT', w * .5, h * .82, tall ? 8.5 : 11);
    }

    for (let row = 0; row < trace.n; row++) {
      const input = this.rail(trace, 0, row);
      const output = this.rail(trace, trace.layers, row);
      this.dot(input, smooth(time, row * 80, row * 80 + 600) * (tall ? 3 : 4));
      this.text(String(row), input.x - (tall ? 12 : 20), input.y, tall ? 11 : 15, true);

      if (time >= 5000) this.dot(output, 2.5);
    }

    this.text('n = 8 VALUES', w * .5, h * .055, tall ? 13 : 19, true);
    this.text('INPUT', w * .13, h * .14, tall ? 9 : 12);
    this.text('FREQUENCIES', w * .83, h * .14, tall ? 9 : 12);
  }

  private factorization(time: number): void {
    const { pen, width: w, height: h, tones } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const trace = this.trace(0);
    const amount = smooth(time, 8500, 11000);
    const pairs = trace.stages.flatMap(stage => stage.pairs.map(pair => ({ level: stage.level, pair })));
    pen.beginPath();
    pen.strokeStyle = tones.muted;
    pen.lineWidth = Math.min(.8, 1 / this.density);

    for (let index = 0; index < trace.naiveProducts; index++) {
      const entry = pairs[Math.floor(index / 4) % pairs.length];

      if (!entry) throw new Error('The factorization needs its twelve computed pair updates.');

      const from = index % 4 < 2 ? entry.pair.upper : entry.pair.lower;
      const to = index % 2 ? entry.pair.lower : entry.pair.upper;
      const a = interpolate(this.rail(trace, 0, Math.floor(index / trace.n)), this.rail(trace, entry.level, from), amount);
      const b = interpolate(this.rail(trace, trace.layers, index % trace.n), this.rail(trace, entry.level + 1, to), amount);
      pen.moveTo(a.x, a.y);
      pen.lineTo(b.x, b.y);
    }

    pen.stroke();

    for (let column = 0; column <= trace.layers; column++) {
      for (let row = 0; row < trace.n; row++) {
        const originalIndex = trace.permutation[row];

        if (originalIndex === undefined) throw new Error('Every reordered input needs its original index.');

        const source = this.rail(trace, column < 2 ? 0 : trace.layers, column < 2 ? originalIndex : row);
        const position = interpolate(source, this.rail(trace, column, row), amount);
        this.dot(position, 2.5);

        if (column === 0 && (amount < .05 || amount > .95)) this.text(String(originalIndex), position.x - (tall ? 12 : 20), position.y, tall ? 11 : 15, true);
      }
    }

    this.text('FACTOR THE SAME TRANSFORM', w * .5, h * .055, tall ? 10 : 15);
    this.text('BIT-REVERSE THE INPUT ORDER', w * .5, h * .10, tall ? 8.5 : 11);
    this.text('64 PRODUCTS → A DIFFERENT NETWORK', w * .5, h * .76, tall ? 9 : 13);
    this.text('DIAGRAM MORPH · NOT A GATE-BY-GATE IDENTITY', w * .5, h * .82, tall ? 8 : 11);
  }

  private doubling(time: number): { trace: FourierTrace; previous: FourierTrace; amount: number } {
    if (time < 16000) return { trace: this.trace(0), previous: this.trace(0), amount: 1 };
    if (time < 20500) return { trace: this.trace(1), previous: this.trace(0), amount: smooth(time, 16000, 18500) };

    return { trace: this.trace(2), previous: this.trace(1), amount: smooth(time, 20500, 23500) };
  }

  private growingPoint(trace: FourierTrace, previous: FourierTrace, column: number, row: number, amount: number): Point {
    const end = this.rail(trace, column, row);

    if (trace.n === previous.n) return end;

    const oldColumn = Math.max(0, column - 1);
    const source = row % 2 === 0 ? this.rail(previous, oldColumn, row / 2) : this.rail(previous, previous.layers, Math.floor(row / 2));

    return interpolate(source, end, amount);
  }

  private network(trace: FourierTrace, point: (column: number, row: number) => Point, growth: number, time: number): void {
    const { pen, tones } = this;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = Math.min(.85, 1 / this.density);
    pen.beginPath();

    for (const stage of trace.stages) {
      for (const pair of stage.pairs) {
        const inherited = growth === 1 || (stage.level > 0 && pair.upper % 2 === 0 && pair.lower % 2 === 0);
        const amount = inherited ? 1 : growth;

        for (const from of [pair.upper, pair.lower]) {
          for (const to of [pair.upper, pair.lower]) {
            const a = point(stage.level, from);
            const b = interpolate(a, point(stage.level + 1, to), amount);
            pen.moveTo(a.x, a.y);
            pen.lineTo(b.x, b.y);
          }
        }
      }
    }

    pen.stroke();

    for (let column = 0; column <= trace.layers; column++) {
      for (let row = 0; row < trace.n; row++) this.dot(point(column, row), trace.n > 16 ? 1.5 : 2.2);
    }

    if (time < 16000) {
      const clock = 3 * progress(time, 11000, 15000);
      const level = Math.min(2, Math.floor(clock));
      const stage = trace.stages[level];

      if (!stage) throw new Error('A moving butterfly layer needs its computed pairs.');

      const travel = Math.min(1, clock - level);

      for (const pair of stage.pairs) {
        const a = point(level, pair.upper);
        const b = point(level + 1, pair.lower);
        const c = point(level, pair.lower);
        const d = point(level + 1, pair.upper);
        this.dot(interpolate(a, b, travel), 3.5);
        this.dot(interpolate(c, d, travel), 3.5);
      }
    }
  }

  private butterflies(time: number): void {
    const { width: w, height: h } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const { trace, previous, amount } = this.doubling(time);
    this.network(trace, (column, row) => this.growingPoint(trace, previous, column, row, amount), amount, time);
    this.text(amount < 1 ? `DOUBLING TO n = ${trace.n}` : `n = ${trace.n} · CLASSICAL RADIX-2 FFT`, w * .5, h * .045, tall ? 10 : 16, true);

    if (time >= 16000) this.text('1805 · GAUSS          1965 · COOLEY–TUKEY', w * .5, h * .09, tall ? 8.5 : 12);
    else this.text('BIT-REVERSED INPUT · POSITIVE ROOT', w * .5, h * .09, tall ? 8.5 : 12);

    if (amount === 1) {
      this.text(`${trace.layers} LAYERS × ${trace.perLayer} BUTTERFLIES = ${trace.butterflies}`, w * .5, h * .76, tall ? 10 : 15, true);
      this.text('PAIR UPDATE: u + wv, u − wv', w * .5, h * .82, tall ? 12 : 17, true);
      this.text('A BUTTERFLY IS NOT ONE SCALAR OPERATION', w * .5, h * .89, tall ? 8.5 : 11);
    } else {
      this.text('OLD INPUTS MOVE TO EVEN RAILS', w * .5, h * .80, tall ? 9 : 13);
      this.text('NEW INPUTS ENTER THE ODD RAILS', w * .5, h * .86, tall ? 9 : 13);
    }
  }

  private foldedPoint(column: number, row: number, time: number): Point {
    const original = this.trace(2);
    const source = this.rail(original, column, row);
    const amount = smooth(time, 25000, 28500);
    let target: Point;

    if (row % 4 === 0) {
      target = this.rail(this.trace(0), Math.max(0, column - 2), row / 4, true);
    } else {
      const layout = plotLayout(this.width, this.height);
      target = { x: mix(layout.left, layout.right, column / original.layers), y: layout.referenceY };
    }

    return interpolate(source, target, amount);
  }

  private fold(time: number): void {
    const trace = this.trace(2);
    const small = this.trace(0);
    const amount = smooth(time, 25000, 28500);
    const layout = plotLayout(this.width, this.height);
    const { pen, tones, width: w, height: h } = this;
    pen.beginPath();
    pen.strokeStyle = tones.ink;
    pen.lineWidth = Math.min(.85, 1 / this.density);

    for (const stage of trace.stages) {
      for (const pair of stage.pairs) {
        const inherited = stage.level >= 2 && pair.upper % 4 === 0 && pair.lower % 4 === 0;

        for (const from of [pair.upper, pair.lower]) {
          for (const to of [pair.upper, pair.lower]) {
            const a = this.rail(trace, stage.level, from);
            const b = this.rail(trace, stage.level + 1, to);
            const targetA = inherited ? this.rail(small, stage.level - 2, from / 4, true) : { x: mix(layout.left, layout.right, stage.level / trace.layers), y: layout.referenceY };
            const targetB = inherited ? this.rail(small, stage.level - 1, to / 4, true) : { x: mix(layout.left, layout.right, (stage.level + 1) / trace.layers), y: layout.referenceY };
            const start = interpolate(a, targetA, amount);
            const end = interpolate(b, targetB, amount);
            pen.moveTo(start.x, start.y);
            pen.lineTo(end.x, end.y);
          }
        }
      }
    }

    pen.stroke();

    for (let column = 0; column <= trace.layers; column++) {
      for (let row = 0; row < trace.n; row++) {
        const radius = row % 4 === 0 ? mix(1.5, 2.2, amount) : 1.5 * (1 - amount);
        this.dot(this.foldedPoint(column, row, time), radius);
      }
    }

    this.note('LAYOUT CARRY · SCHEMATIC REFERENCE\nNOT AN OPERATION COUNT', w * .5, h * .025, w * .9, w < PHONE_STAGE_WIDTH ? 8.5 : 11);
  }

  private miniature(): void {
    const { width: w, height: h } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const trace = this.trace(0);
    this.network(trace, (column, row) => this.rail(trace, column, row, true), 1, 30000);
    const cx = w * (tall ? .5 : .26);
    this.text('CLASSICAL FFT · n = 8', cx, h * (tall ? .045 : .095), tall ? 9 : 14, true);
    this.text('3 LAYERS × 4 = 12 BUTTERFLIES', cx, h * (tall ? .26 : .49), tall ? 9 : 12, true);

    if (!tall) {
      this.note('A PAIR UPDATE USES MULTIPLE SCALAR OPERATIONS', cx, h * .54, w * .37, 11);
      this.note('8 → 12     16 → 32     32 → 80\nVALUES → BUTTERFLIES', cx, h * .64, w * .37, 11);
    }
  }
}

export function createButterflyFilm(context: CanvasRenderingContext2D): FilmDrawing {
  return new ButterflyFilm(context);
}

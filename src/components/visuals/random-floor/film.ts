import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';
import type { Graph, PatternKey, RandomFloorModel } from './math';
import { drawRandomFloorPanels, layout } from './panels';
import { motionAt } from './story';

type Point = { x: number; y: number };
type Box = { cx: number; cy: number; w: number; h: number };
type Motion = ReturnType<typeof motionAt>;

// Cube face 0–4–1–5 carries the old square. Its opposite face
// splits the same four vertices before the connecting edges open.
const CYCLE_TO_CUBE = [0, 2, 1, 3, 1, 3, 0, 2] as const;

function between(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

function pointAt(points: readonly Point[], index: number): Point {
  const point = points[index];

  if (!point) throw new Error('Every graph vertex needs its drawn position.');

  return point;
}

function patternPositions(key: PatternKey): Point[] {
  if (key === 'cherry') return [{ x: -.4, y: -.4 }, { x: .4, y: 0 }, { x: -.4, y: .4 }];
  if (key === 'four-cycle') return [{ x: -.4, y: -.4 }, { x: .4, y: -.4 }, { x: .4, y: .4 }, { x: -.4, y: .4 }];

  return [0, 3, 5, 6, 1, 2, 4, 7].map(bits => ({
    x: ((bits & 1) - .5) * .65 + (((bits >> 2) & 1) - .5) * .3,
    y: (((bits >> 1) & 1) - .5) * .65 - (((bits >> 2) & 1) - .5) * .3,
  }));
}

export class RandomFloorFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private page = layout(1, 1);
  private readonly labels: FilmLabels;
  private data: RandomFloorModel | undefined;
  private error: string | undefined;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 4, vertical: 4 });
  }

  setData(data: RandomFloorModel): void {
    this.data = data;
    this.error = undefined;
  }

  setError(reason: string): void {
    this.data = undefined;
    this.error = reason;
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.tones = tones;
    this.page = layout(width, height);
    this.labels.resize(width, height);
  }

  private text(value: string, x: number, y: number, size = this.page.phone ? 9 : 12, math = false): void {
    drawText(this.pen, value, x, y, { size, family: math ? 'math' : 'type', color: this.tones.ink, paper: this.tones.paper });
  }

  private line(a: Point, b: Point, weight = .8, blue = false, dash: readonly number[] = []): void {
    drawLine(this.pen, a.x, a.y, b.x, b.y, blue ? this.tones.blue : this.tones.ink, weight, dash);
  }

  private dot(point: Point, radius: number, hollow = false): void {
    if (radius <= 0) return;

    this.pen.beginPath();
    this.pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    this.pen.fillStyle = hollow ? this.tones.paper : this.tones.ink;
    this.pen.fill();
    this.pen.lineWidth = .8;
    this.pen.strokeStyle = this.tones.ink;
    this.pen.stroke();
  }

  private inBox(box: Box, point: Point): Point {
    return { x: box.cx + point.x * box.w, y: box.cy + point.y * box.h };
  }

  private hostPositions(box: Box): Point[] {
    return Array.from({ length: 6 }, (_, index) => this.inBox(box, { x: index < 3 ? -.38 : .38, y: ((index % 3) - 1) * .4 }));
  }

  private host(model: RandomFloorModel, motion: Motion): void {
    const contraction = (1 - motion.paper) * (1 - motion.triples);

    if (contraction === 0) return;

    const box = { ...this.page.host, w: this.page.host.w * contraction, h: this.page.host.h * contraction };
    const positions = this.hostPositions(box);
    const kernel = motion.benchmark * (1 - motion.benchmarkOut);

    for (let a = 0; a < 6; a++) {
      for (let b = a + 1; b < 6; b++) {
        const existing = model.primary.graph.edges.some(([u, v]) => u === a && v === b);
        const amount = existing ? motion.host : kernel;

        if (amount === 0) continue;

        const first = pointAt(positions, a);
        const second = pointAt(positions, b);
        this.line(first, between(first, second, amount), existing ? mix(1, .7, kernel) : .7);
      }

      if (kernel > 0) {
        const position = pointAt(positions, a);
        const radius = (this.page.phone ? 7 : 10) * contraction;
        this.pen.beginPath();
        this.pen.arc(position.x, position.y - radius, radius, Math.PI / 2, Math.PI / 2 + Math.PI * 2 * kernel);
        this.pen.strokeStyle = this.tones.ink;
        this.pen.lineWidth = .7;
        this.pen.stroke();
      }
    }

    for (const [index, position] of positions.entries()) {
      this.dot(position, (this.page.phone ? 3 : 4) * contraction * motion.host);

      if (this.page.compact && motion.host === 1 && contraction === 1) this.text(String(index + 1), position.x + (index < 3 ? -12 : 12), position.y, 14, true);
    }
  }

  private hostNumbers(motion: Motion): void {
    const contraction = (1 - motion.paper) * (1 - motion.triples);

    if (this.page.compact || motion.host !== 1 || contraction !== 1) return;

    const offset = this.page.phone ? 24 : 16;

    for (const [index, position] of this.hostPositions(this.page.host).entries()) {
      this.text(String(index + 1), position.x + (index < 3 ? -offset : offset), position.y, this.page.phone ? 10 : 14, true);
    }
  }

  private morphGraph(source: Graph, target: Graph, sourcePositions: readonly Point[], targetPositions: readonly Point[], sourceMap: readonly number[], amount: number): void {
    const points = targetPositions.map((targetPoint, index) => {
      const sourceIndex = sourceMap[index];

      if (sourceIndex === undefined) throw new Error('Each split vertex needs its explicit source vertex.');

      return between(pointAt(sourcePositions, sourceIndex), targetPoint, amount);
    });

    for (const [aIndex, bIndex] of target.edges) {
      const sourceA = sourceMap[aIndex];
      const sourceB = sourceMap[bIndex];

      if (sourceA === undefined || sourceB === undefined) throw new Error('Both edge endpoints need their split-vertex sources.');

      const inherited = source.edges.some(([a, b]) => (a === sourceA && b === sourceB) || (a === sourceB && b === sourceA));
      const a = pointAt(points, aIndex);
      const b = pointAt(points, bIndex);
      this.line(a, between(a, b, inherited || sourceA === sourceB ? 1 : amount), 1.1);
    }

    for (const point of points) this.dot(point, this.page.phone ? 3.5 : 4.5);
  }

  private pattern(model: RandomFloorModel, motion: Motion): void {
    const contraction = (1 - motion.triples) * (1 - motion.paper);

    if (contraction === 0) return;

    const box = { ...this.page.pattern, w: this.page.pattern.w * contraction, h: this.page.pattern.h * contraction };
    const positions = (key: PatternKey): Point[] => patternPositions(key).map(p => this.inBox(box, p));
    const cherry = positions('cherry');
    const drop = motion.drop * (1 - motion.maps);
    const host = this.hostPositions(this.page.host);

    for (let index = 0; index < cherry.length; index++) {
      const image = model.repeatedExample.images[index];

      if (image === undefined) throw new Error('Each cherry vertex needs its carried host image.');

      cherry[index] = between(pointAt(cherry, index), pointAt(host, image), drop);
    }

    if (motion.cube > 0) {
      this.morphGraph(model.patterns['four-cycle'], model.patterns.cube, positions('four-cycle'), positions('cube'), CYCLE_TO_CUBE, motion.cube);
    } else if (motion.cycle > 0) {
      this.morphGraph(model.patterns.cherry, model.patterns['four-cycle'], cherry, positions('four-cycle'), [0, 1, 2, 0], motion.cycle);
    } else {
      for (const [a, b] of model.patterns.cherry.edges) this.line(pointAt(cherry, a), between(pointAt(cherry, a), pointAt(cherry, b), motion.pattern), 1.8);
      for (const point of cherry) this.dot(point, (this.page.phone ? 4 : 5) * motion.pattern, true);

      if (drop > .95) {
        const shared = pointAt(cherry, 0);
        this.pen.beginPath();
        this.pen.arc(shared.x, shared.y, this.page.phone ? 7 : 9, 0, Math.PI * 2);
        this.pen.lineWidth = 1;
        this.pen.strokeStyle = this.tones.ink;
        this.pen.stroke();
      }
    }
  }

  private maps(model: RandomFloorModel, motion: Motion): void {
    if (motion.maps === 0 || motion.benchmark === 1) return;

    const box = this.page.sweep;
    const columns = 36;
    const rows = 6;
    const fold = motion.benchmark;
    const target = { x: (this.page.gauge.left + this.page.gauge.right) / 2, y: this.page.gauge.top };

    for (let index = 0; index < Math.floor(model.cherryMaps.length * motion.maps); index++) {
      const map = model.cherryMaps[index];

      if (!map) throw new Error('The 216-map display must use the enumerated mappings.');

      const source = { x: mix(box.left, box.right, ((index % columns) + .5) / columns), y: mix(box.top, box.bottom, (Math.floor(index / columns) + .5) / rows) };
      const point = between(source, target, fold);
      this.dot(point, (this.page.phone ? .9 : 1.2) * (1 - fold), !map.succeeds);
    }
  }

  private gauge(model: RandomFloorModel, motion: Motion): void {
    const box = this.page.gauge;
    const schematic = motion.paper === 1;
    const retire = 1 - motion.paper;
    const maximum = mix(.30, .01, motion.cube);
    const cycle = model.primary.byPattern['four-cycle'];
    const cherry = model.primary.byPattern.cherry;
    const cube = model.primary.byPattern.cube;
    const countValue = motion.cube > 0 ? mix(cycle.t, cube.t, motion.cube) : mix(cherry.t, cycle.t, motion.cycle);
    const floorValue = motion.cube > 0 ? mix(cycle.pPower, cube.pPower, motion.cube) : mix(cherry.pPower, cycle.pPower, motion.cycle);
    const measured = countValue / maximum * motion.density * retire;
    const benchmark = floorValue / maximum * (motion.benchmark > 0 || motion.cycle > 0 ? 1 : 0) * retire;
    const actual = schematic ? .55 * motion.claimGauge : measured;
    const floor = schematic ? .75 * motion.claimGauge : benchmark;
    const { pen } = this;
    const densityLabel = motion.benchmark === 1 && motion.benchmarkOut === 0 ? 'gauge-kernel-density' : 'gauge-density';

    if (box.horizontal) {
      const ys = [mix(box.top, box.bottom, .28), mix(box.top, box.bottom, .78)];

      for (const [index, length] of [actual, floor].entries()) {
        const y = ys[index];

        if (y === undefined) throw new Error('Each horizontal gauge bar needs its row.');

        this.line({ x: box.left, y }, { x: box.right, y }, .45);
        pen.fillStyle = this.tones.ink;
        pen.fillRect(box.left, y - 2, (box.right - box.left) * length, 4);
      }

      if ((motion.paper === 0 && motion.scene !== 'paper') || motion.claimGauge > 0) {
        const firstY = ys[0];
        const secondY = ys[1];

        if (firstY === undefined || secondY === undefined) throw new Error('Both bar labels need their rows.');

        this.labels.place(densityLabel, box.right + 16, firstY);

        if (motion.benchmark > 0 || motion.cycle > 0 || motion.claimGauge > 0) this.labels.place('gauge-benchmark', box.right + 16, secondY);
      }
    } else {
      const xs = [mix(box.left, box.right, .3), mix(box.left, box.right, .75)];
      this.line({ x: box.left, y: box.bottom }, { x: box.right, y: box.bottom }, .6);

      for (const [index, length] of [actual, floor].entries()) {
        const x = xs[index];

        if (x === undefined) throw new Error('Each vertical gauge bar needs its column.');

        pen.fillStyle = this.tones.ink;
        pen.fillRect(x - 5, box.bottom - length * (box.bottom - box.top), 10, length * (box.bottom - box.top));
      }

      if ((motion.paper === 0 && motion.scene !== 'paper') || motion.claimGauge > 0) {
        const firstX = xs[0];
        const secondX = xs[1];

        if (firstX === undefined || secondX === undefined) throw new Error('Both bar labels need their columns.');

        this.labels.place(densityLabel, firstX, box.bottom + 23);

        if (motion.benchmark > 0 || motion.cycle > 0 || motion.claimGauge > 0) this.labels.place('gauge-benchmark', secondX, box.bottom + 23);
      }
    }

    if (motion.paper === 0 && motion.scene !== 'paper' && motion.density > 0) this.text('SAME SCALE', (box.left + box.right) / 2, this.page.phone ? this.height * .405 : box.top - 14, this.page.phone ? 8 : 10);
  }

  private triples(model: RandomFloorModel, motion: Motion): void {
    if (motion.triples === 0 || motion.paper === 1) return;

    const box = this.page.triples;
    const columns = 2;
    const cardWidth = (box.right - box.left) / columns;
    const cardHeight = (box.bottom - box.top) / 2;
    const active = model.incidence.pairs[Math.min(model.incidence.pairs.length - 1, Math.floor(motion.pair * model.incidence.pairs.length))];

    if (!active) throw new Error('Every pair demonstration needs its checked two triple occurrences.');

    for (const [index, triple] of model.incidence.triples.entries()) {
      const cx = box.left + cardWidth * ((index % columns) + .5);
      const cy = box.top + cardHeight * (Math.floor(index / columns) + .5);
      const radius = Math.min(cardWidth * .32, cardHeight * .33) * motion.triples * (1 - motion.paper);
      const points = [0, 1, 2].map(i => ({ x: cx + radius * Math.cos(-Math.PI / 2 + i * Math.PI * 2 / 3), y: cy + radius * Math.sin(-Math.PI / 2 + i * Math.PI * 2 / 3) }));
      const selected = active.tripleIndices.includes(index) && motion.pair > 0;

      for (let edge = 0; edge < 3; edge++) {
        const a = pointAt(points, edge);
        const b = pointAt(points, (edge + 1) % 3);
        const first = triple[edge];
        const second = triple[(edge + 1) % 3];
        const paired = selected && first !== undefined && second !== undefined && active.points.includes(first) && active.points.includes(second);
        this.line(a, b, paired ? 2.5 : .6);
      }

      if (motion.scene === 'pairs' && motion.triples === 1) {
        for (const [vertex, value] of triple.entries()) {
          const point = pointAt(points, vertex);
          this.dot(point, this.page.phone ? 2 : 3);
          this.text(String(value + 1), point.x + (point.x < cx ? -9 : 9), point.y, this.page.phone ? 10 : 14, true);
        }
      }
    }

    if (motion.scene === 'pairs' && motion.triples === 1) this.text(`PAIR ${active.points[0] + 1}, ${active.points[1] + 1}: TWO TRIPLES`, (box.left + box.right) / 2, box.bottom + (this.page.phone ? 4 : 20), this.page.phone ? 8 : 10);
  }

  private paper(model: RandomFloorModel, motion: Motion): void {
    if (motion.paper === 0) return;

    const box = this.page.paper;
    const counts = [model.paperCounts.points, model.paperCounts.triples];

    for (const [part, count] of counts.entries()) {
      for (let index = 0; index < count; index++) {
        const point = this.page.phone
          ? { x: mix(box.left, box.right, (index + .5) / count), y: mix(box.top, box.bottom, part === 0 ? .23 : .82) }
          : { x: mix(box.left, box.right, part === 0 ? .25 : .8), y: mix(box.top, box.bottom, (index + .5) / count) };
        const source = { x: this.page.pattern.cx, y: this.page.pattern.cy };
        this.dot(between(source, point, motion.paper), (this.page.phone ? 2 : 2.5) * motion.paper, true);
      }
    }

    const frame = this.page.hostFrame;
    const blue = motion.hostOutline > 0;
    const growth = motion.paper;
    this.line({ x: frame.left, y: frame.top }, { x: mix(frame.left, frame.right, growth), y: frame.top }, blue ? 1.8 : .6, blue, [5, 4]);
    this.line({ x: frame.right, y: frame.top }, { x: frame.right, y: mix(frame.top, frame.bottom, growth) }, blue ? 1.8 : .6, blue, [5, 4]);
    this.line({ x: frame.right, y: frame.bottom }, { x: mix(frame.right, frame.left, growth), y: frame.bottom }, blue ? 1.8 : .6, blue, [5, 4]);
    this.line({ x: frame.left, y: frame.bottom }, { x: frame.left, y: mix(frame.bottom, frame.top, growth) }, blue ? 1.8 : .6, blue, [5, 4]);
  }

  draw(time: number): void {
    const { pen, width, height } = this;
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, width, height);
    pen.setLineDash([]);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    this.labels.beginFrame();

    if (!this.data) {
      drawWrappedText(pen, this.error ? 'TOY COUNTS UNAVAILABLE' : 'COUNTING THE TOY MAPS', width / 2, height * .35, width * .84, { size: this.page.phone ? 12 : 18, color: this.tones.ink, paper: this.tones.paper });

      if (this.error) drawWrappedText(pen, this.error, width / 2, height * .47, width * .84, { size: this.page.phone ? 9 : 12, color: this.tones.ink, paper: this.tones.paper });

      this.labels.endFrame();

      return;
    }

    const model = this.data;
    const motion = motionAt(time);
    const key: PatternKey = motion.cube === 1 ? 'cube' : motion.cycle === 1 ? 'four-cycle' : 'cherry';
    const row = model.primary.byPattern[key];
    this.host(model, motion);
    this.pattern(model, motion);
    this.hostNumbers(motion);
    this.maps(model, motion);
    this.triples(model, motion);
    this.paper(model, motion);
    this.gauge(model, motion);
    drawRandomFloorPanels(pen, width, height, time, this.tones, this.labels, { ...row, totalMaps: model.primary.graph.vertexCount ** model.patterns[key].vertexCount, minima: { cherry: model.sweep.minima.cherry.density.ratio, fourCycle: model.sweep.minima['four-cycle'].density.ratio, cube: model.sweep.minima.cube.density.ratio } });
    this.labels.endFrame();
  }
}

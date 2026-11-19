import { mix, smooth } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { buildTapeShearsModel, fractionText, type MachineFrame } from './math';
import { drawTapeShearsPanels, layout } from './panels';
import { motionAt } from './story';

type Point = { x: number; y: number };

type Motion = ReturnType<typeof motionAt>;

function between(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

class TapeShearsFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private page = layout(1, 1);
  private readonly labels: FilmLabels;
  private readonly model = buildTapeShearsModel();

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 4, vertical: 4 });
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.tones = tones;
    this.page = layout(width, height);
    this.labels.resize(width, height);
  }

  private text(value: string, point: Point, size = this.page.phone ? 8 : 11, math = false, blue = false): void {
    drawText(this.pen, value, point.x, point.y, { size, family: math ? 'math' : 'type', color: blue ? this.tones.blue : this.tones.ink, paper: this.tones.paper });
  }

  private sheet(point: Point): Point {
    const { x, y, size } = this.page.sheet;

    return { x: x + size * point.x, y: y + size * (1 - point.y) };
  }

  private cube(x: number, y: number, z: number, amount = 1): Point {
    const sheet = this.sheet({ x, y });
    const { x: left, y: top, size } = this.page.sheet;
    const target = { x: left + size * (.07 + .78 * x + .15 * z), y: top + size * (.15 + .78 * (1 - y) - .15 * z) };

    return between(sheet, target, amount);
  }

  private ring(point: Point, clear = true): void {
    const { pen, tones } = this;
    pen.fillStyle = tones.paper;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.25;
    pen.beginPath();
    pen.arc(point.x, point.y, 4.5, 0, Math.PI * 2);
    if (clear) pen.fill();
    pen.stroke();
    pen.fillStyle = tones.ink;
    pen.beginPath();
    pen.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
    pen.fill();
  }

  private line(a: Point, b: Point, blue = false, weight = .8, dash: readonly number[] = []): void {
    drawLine(this.pen, a.x, a.y, b.x, b.y, blue ? this.tones.blue : this.tones.ink, weight, dash);
  }

  private polygon(points: readonly Point[], blue = false, weight = 1): void {
    const first = points[0];

    if (!first) throw new Error('A moving polygon needs its first corner.');

    const { pen } = this;
    pen.beginPath();
    pen.moveTo(first.x, first.y);

    for (let index = 1; index < points.length; index++) {
      const point = points[index];

      if (!point) throw new Error('Every polygon corner must be present.');

      pen.lineTo(point.x, point.y);
    }

    pen.closePath();
    pen.strokeStyle = blue ? this.tones.blue : this.tones.ink;
    pen.lineWidth = weight;
    pen.stroke();
  }

  private box(depth: number): void {
    for (const z of [0, 1]) {
      const points = [this.cube(0, 0, z, depth), this.cube(1, 0, z, depth), this.cube(1, 1, z, depth), this.cube(0, 1, z, depth)];
      this.polygon(points, false, .65);
    }

    if (depth > 0) {
      for (const x of [0, 1]) {
        for (const y of [0, 1]) this.line(this.cube(x, y, 0, depth), this.cube(x, y, 1, depth), false, .65);
      }
    }
  }

  private detector(depth: number, amount: number, blue: boolean): void {
    if (amount === 0) return;

    for (const x of [.5, 1]) {
      const a = this.cube(x, 0, 0, depth);
      const b = this.cube(x, amount, 0, depth);
      this.line(a, b, blue, blue ? 1.6 : .85, [4, 3]);

      if (depth === 1) {
        this.line(this.cube(x, 0, 1), this.cube(x, amount, 1), blue, 1, [4, 3]);
        this.line(a, this.cube(x, 0, amount), blue, 1, [4, 3]);
        this.line(this.cube(x, 1, 0), this.cube(x, 1, amount), blue, 1, [4, 3]);
      }
    }

    if (amount === 1) {
      if (this.page.phone) {
        const anchor = this.cube(1, .8, .5, depth);
        const point = { x: this.page.sheet.x + this.page.sheet.size + 13, y: anchor.y };
        this.line(anchor, { x: point.x - 10, y: point.y }, blue, .65);
        this.text('O', point, 13, true, blue);
      } else this.text('O', this.cube(.77, .95, .5, depth), 18, true, blue);
    }
  }

  private fluid(time: number): void {
    const loader = smooth(time, 14000, 17500);

    if (time >= 17500) return;

    this.box(0);
    const withdrawal = 1 - loader;

    for (let row = 0; row < 7; row++) {
      const y = .12 + row * .12;
      const a = this.sheet({ x: .06, y });
      const b = this.sheet({ x: .06 + .88 * withdrawal, y });
      this.line(a, b, false, .45);

      if (time >= 6000 && withdrawal > 0 && row % 2 === 0) {
        const arrow = smooth(time, 6000, 8000) * .16 * withdrawal;
        const start = this.sheet({ x: .12, y });
        const tip = this.sheet({ x: .12 + arrow, y });
        this.line(start, tip);
        this.line(tip, { x: tip.x - 4, y: tip.y - 3 });
        this.line(tip, { x: tip.x - 4, y: tip.y + 3 });
      }
    }

    if (time >= 6000 && time < 14000) {
      const amount = smooth(time, 6000, 8000);
      const a = this.sheet({ x: mix(0, .07, amount), y: -.25 });
      const { size } = this.page.sheet;
      this.pen.fillStyle = this.tones.paper;
      this.pen.fillRect(a.x, a.y - size * .17, size * .24, size * .17);
      this.pen.strokeStyle = this.tones.ink;
      this.pen.lineWidth = .7;
      this.pen.strokeRect(a.x, a.y - size * .17, size * .24, size * .17);

      for (let row = 0; row < 3; row++) this.line({ x: a.x + size * .035, y: a.y - size * (.13 - row * .045) }, { x: a.x + size * .20, y: a.y - size * (.13 - row * .045) }, false, .5);
    }

    if (time < 14000) this.detector(0, smooth(time, 4000, 6000) * (1 - smooth(time, 13500, 14000)), false);

    const initial = { x: .125, y: .375 };
    const questioning = { x: mix(initial.x, .44, smooth(time, 9000, 12500)), y: initial.y };
    const encoded = this.model.machineA.path[0];

    if (!encoded) throw new Error('The schematic loader needs its exact input code.');

    const point = between(questioning, encoded.point, loader);

    if (time >= 2000) this.ring(this.sheet(point));
    if (time >= 12500 && time < 14000) this.text('?', this.sheet({ x: .5, y: .6 }), this.page.phone ? 17 : 24, true);
  }

  private sheetAxes(time: number): void {
    const { x, y, size } = this.page.sheet;
    this.box(0);

    if (time < 17500 || time >= 56000) return;

    this.text('LEFT TAPE', { x: x + size / 2, y: y + size + 18 }, this.page.phone ? 8 : 11);
    this.text('RIGHT TAPE', { x: x + size / 2, y: y - 13 }, this.page.phone ? 8 : 11);

    for (const tick of [0, 1]) {
      this.text(String(tick), { x: x + tick * size, y: y + size + 5 }, this.page.phone ? 8 : 11, true);
      this.text(String(tick), { x: x - 10, y: y + (1 - tick) * size }, this.page.phone ? 8 : 11, true);
    }
  }

  private bands(time: number): void {
    if (time < 21500 || time >= 46000) return;

    const grow = smooth(time, 21500, 24000);
    const { x, size } = this.page.sheet;

    for (const band of this.model.bands) {
      for (const y of [band.lower, band.upper]) {
        const point = this.sheet({ x: 0, y });
        this.line(point, this.sheet({ x: grow, y }), false, .5, [2, 3]);
      }
    }

    for (let index = 0; index < 14 * grow; index++) {
      const yy = this.model.gap.lower + (this.model.gap.upper - this.model.gap.lower) * (index + .5) / 14;
      const point = this.sheet({ x: .02, y: yy });
      this.line(point, this.sheet({ x: Math.min(grow, .10), y: yy + .02 }), false, .45);
    }

    if (grow === 1) {
      for (const band of this.model.bands) this.text(String(band.digit), { x: x - 13, y: this.sheet({ x: 0, y: (band.lower + band.upper) / 2 }).y }, this.page.phone ? 11 : 15, true);
      this.text('GAP', { x: x + size * .87, y: this.sheet({ x: 0, y: .50 }).y }, this.page.phone ? 8 : 10);
    }
  }

  private pathPoint(path: readonly MachineFrame[], position: number): Point {
    const lower = Math.min(path.length - 1, Math.floor(position));
    const a = path[lower];
    const b = path[Math.min(path.length - 1, lower + 1)];

    if (!a || !b) throw new Error('The carried marker needs both exact machine frames.');

    return between(a.point, b.point, position - lower);
  }

  private tapeRuns(time: number, motion: Motion): void {
    if (time < 17500 || time >= 37000) return;

    const initial = this.model.machineA.path[0];

    if (!initial) throw new Error('The carried tape marker needs its initial state.');

    let point = initial.point;
    let path = this.model.machineA.path;
    let position = 4 * motion.aRun;

    if (time >= 32000) {
      path = this.model.machineS.path;
      position = 6 * motion.sRun;
      point = this.pathPoint(path, position);
    } else if (time >= 30500) point = between(this.pathPoint(path, 4), initial.point, motion.aReturn);
    else if (time >= 25000) point = this.pathPoint(path, position);

    if (time >= 25000) {
      const segmentLimit = time >= 30500 && time < 32000 ? 4 : position;

      for (let index = 0; index < Math.min(path.length - 1, Math.ceil(segmentLimit)); index++) {
        const a = path[index];
        const b = path[index + 1];

        if (!a || !b) throw new Error('Every displayed machine hop needs its exact endpoints.');

        const amount = Math.min(1, segmentLimit - index);
        this.line(this.sheet(a.point), this.sheet(between(a.point, b.point, amount)), false, 1.2);
      }

      for (let index = 0; index <= Math.floor(segmentLimit); index++) {
        const frame = path[index];

        if (!frame) throw new Error('The displayed step needs its actual frame.');

        const dot = this.sheet(frame.point);
        this.pen.fillStyle = this.tones.ink;
        this.pen.beginPath();
        this.pen.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
        this.pen.fill();
      }
    }

    this.ring(this.sheet(point));
  }

  private shears(time: number, motion: Motion): void {
    if (time < 37000 || time >= 46000) return;

    const phases = [motion.shearSource, motion.shearOne, motion.shearTwo, motion.shearThree, motion.shearFour, motion.translate];
    let index = phases.findIndex(value => value < 1);

    if (index === -1) index = phases.length - 1;

    const from = this.model.branch.stages[index];
    const to = this.model.branch.stages[index + 1];
    const amount = phases[index];

    if (!from || !to || amount === undefined) throw new Error('Each affine phase needs its exact adjacent stages.');

    const points: Point[] = [];

    for (let corner = 0; corner < from.corners.length; corner++) {
      const a = from.corners[corner];
      const b = to.corners[corner];

      if (!a || !b) throw new Error('Every moving corner needs its source and target.');

      points.push(this.sheet(between(a, b, amount)));
    }

    this.polygon(points, false, 1.7);
    this.ring(this.sheet(between(from.marker, to.marker, amount)));
    const stage = amount === 1 ? to : from;
    this.text(amount === 0 ? stage.label : to.label, { x: this.page.sheet.x + this.page.sheet.size / 2, y: this.page.sheet.y + this.page.sheet.size * .90 }, this.page.phone ? 8 : 11, true);
  }

  private history(time: number, motion: Motion): void {
    if (time < 46000 || time >= 56000) return;

    const { phone } = this.page;
    const center = this.width * this.page.panel.center;
    const { left, right, top, bottom, labelX } = this.historyLayout();
    const marker = this.model.branch.targetMarker;

    for (const record of this.model.history.records) {
      const seed = between(marker, record.source, motion.historyInputs);
      const target = between(seed, record.target, motion.overwrite);
      const facet = { x: mix(left, right, (record.history - .25) / .4), y: mix(top, bottom, record.group / 3) };
      const source = this.sheet(target);
      const corridorX = this.width * (this.page.stacked ? .025 : .57);
      const entrance = { x: corridorX, y: source.y };
      const exit = { x: corridorX, y: facet.y };
      const lift = motion.historyLift;
      const point = lift < .3 ? between(source, entrance, lift / .3) : lift < .7 ? between(entrance, exit, (lift - .3) / .4) : between(exit, facet, (lift - .7) / .3);

      if (record.input.every(value => value === 1)) this.ring(point, lift > 0);
      else {
        this.pen.fillStyle = this.tones.ink;
        this.pen.beginPath();
        this.pen.arc(point.x, point.y, lift > 0 ? 2 : 1.2, 0, Math.PI * 2);
        this.pen.fill();
      }
    }

    if (motion.historyLift > 0) {
      for (let group = 0; group < this.model.history.groups.length; group++) {
        const row = this.model.history.groups[group];

        if (!row) throw new Error('Each history facet needs its actual xy output.');

        const y = mix(top, bottom, group / 3);
        this.line({ x: left, y }, { x: mix(left, right, motion.historyLift), y }, false, .6);

        if (motion.historyLift === 1) this.text(`y=${fractionText(row.exactTarget.y)}`, { x: labelX, y }, phone ? 8 : 11, true);
      }

      if (motion.historyLift === 1) {
        this.text('h=1/4', { x: left, y: top - 18 }, phone ? 9 : 12, true);
        this.text('h=13/20', { x: right, y: top - 18 }, phone ? 9 : 12, true);
        this.text('HISTORY · x=13/20 ON ALL FOUR ROWS', { x: center, y: bottom + 18 }, phone ? 7.5 : 10, true);
      }
    }
  }

  private historyLayout(page = this.page) {
    const { phone, stacked } = page;
    const center = this.width * page.panel.center;
    const span = this.width * page.panel.width * .72;
    const left = stacked ? this.width * .32 : center - span / 2;
    const right = stacked ? this.width * .86 : center + span / 2;

    return {
      left,
      right,
      labelX: stacked ? this.width * .15 : left - 42,
      top: this.height * (phone ? .74 : stacked ? .70 : .55),
      bottom: this.height * (phone ? .865 : stacked ? .87 : .81),
    };
  }

  private claimCube(time: number, motion: Motion): void {
    if (time < 56000) return;

    const depth = motion.overviewReturn;
    this.box(depth);
    const initial = this.cube(.125, .375, .5, depth);
    const record = this.model.history.records[this.model.history.records.length - 1];

    if (!record) throw new Error('The overview return needs its last carried history point.');

    const history = this.historyLayout(layout(this.width, this.height));
    const lastFacet = { x: history.right, y: history.bottom };
    let point = between(lastFacet, initial, depth);

    if (motion.smooth > 0) {
      let previous = initial;

      for (let index = 1; index <= 100 * motion.smooth; index++) {
        const angle = 2 * Math.PI * index / 100;
        const next = this.cube(.125 + .10 * Math.sin(angle), .375 + .12 * (1 - Math.cos(angle)), .5);
        this.line(previous, next, false, 1);
        previous = next;
      }

      point = previous;
    }

    if (time >= 58500) this.detector(depth, motion.claim, true);

    this.ring(point);

    if (depth === 1) {
      const { x, y, size } = this.page.sheet;
      const labelY = y + size + 20;
      this.labels.place('material-label', x + size / 2, labelY);
      this.labels.place('detector-strip', x + size / 2, labelY + (this.page.phone ? 23 : 32));
      this.labels.place('torus', this.page.phone ? x - 17 : x + size * .08, y + size * (this.page.phone ? .15 : .08));
      this.line({ x: initial.x + 6, y: initial.y + 6 }, { x: x + size + 4, y: initial.y + 16 }, false, .5);
      this.text('INITIAL LABEL', { x: x + size + (this.page.phone ? 32 : 45), y: initial.y + 16 }, this.page.phone ? 7 : 9);

      if (time >= 70000) this.text('SCHEMATIC PATH · NO MACHINE RUN', { x: x + size / 2, y: y - 13 }, this.page.phone ? 7.5 : 10);

      const tickY = labelY + (this.page.phone ? 45 : 59);

      for (let index = 0; index < 9; index++) {
        const tickX = x + size * (.18 + .08 * index);
        this.line({ x: tickX, y: tickY }, { x: tickX, y: tickY + 5 }, false, .8);
      }

      this.text('NINE PAPERS · SCHEMATIC', { x: x + size / 2, y: tickY + 16 }, this.page.phone ? 7 : 9);
    }
  }

  draw(time: number): void {
    const { pen, width, height } = this;
    const motion = motionAt(time);
    this.page = layout(width, height, time >= 56000);

    if (time >= 56000 && motion.overviewReturn < 1) {
      const before = layout(width, height).sheet;
      const after = this.page.sheet;
      this.page.sheet = { x: mix(before.x, after.x, motion.overviewReturn), y: mix(before.y, after.y, motion.overviewReturn), size: mix(before.size, after.size, motion.overviewReturn) };
    }
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, width, height);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();
    this.fluid(time);

    if (time >= 17500 && time < 56000) {
      this.sheetAxes(time);
      this.bands(time);
      this.tapeRuns(time, motion);
      this.shears(time, motion);
      this.history(time, motion);
    }

    this.claimCube(time, motion);

    drawTapeShearsPanels(pen, width, height, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }
}

export function createTapeShearsFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new TapeShearsFilm(root, context);
}

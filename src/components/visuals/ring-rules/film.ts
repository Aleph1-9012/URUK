import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText, type TextStyle } from '../../plate/canvas/wrapped-text';
import { buildRingRulesModel, coefficientCells, type RingAction } from './math';
import { drawRingRulesPanels } from './panels';
import { motionAt, SCENE_TIMES } from './story';

type Point = { x: number; y: number };

type Motion = ReturnType<typeof motionAt>;

type MatrixView = { name: string; rows: readonly number[]; center: Point; amount: number };

function between(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

function circlePoint(center: Point, radius: number, index: number, order: number): Point {
  const angle = -Math.PI / 2 + Math.PI * 2 * index / order;

  return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
}

class RingRulesFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly model = buildRingRulesModel();

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

  private get fieldX(): number {
    return this.width * (this.phone ? .5 : .28);
  }

  private text(value: string, x: number, y: number, size: number, math = false, paper = false): void {
    const style: TextStyle = { size, color: this.tones.ink, family: math ? 'math' : 'type' };

    if (paper) style.paper = this.tones.paper;

    drawText(this.pen, value, x, y, style);
  }

  draw(time: number): void {
    const { pen, width: w, height: h } = this;
    const motion = motionAt(time);
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();
    this.matrices(motion);
    this.coefficients(time, motion);

    if (time >= SCENE_TIMES.c4 && time < SCENE_TIMES.c3) this.map(this.model.four, motion.c4Mapping, 1);
    if (time >= SCENE_TIMES.c3 && time < SCENE_TIMES.sofic) {
      if (motion.c3Shrink < 1) this.map(this.model.four, 1, 1 - motion.c3Shrink);
      else this.map(this.model.three, motion.c3Mapping, 1);
    }

    if (time >= SCENE_TIMES.sofic && motion.toyRetreat < 1) {
      if (motion.windowRing < 1) this.map(this.model.three, 1, 1 - motion.windowRing);

      this.window(motion);
    }
    if (time >= SCENE_TIMES.claim) this.claim(motion);

    if (time < SCENE_TIMES.sofic && ![motion.collapse, motion.rowToRing, motion.c3Shrink].some(amount => amount > 0 && amount < 1)) {
      const y = motion.collapse < 1 ? (this.phone ? .60 : .88) : time < SCENE_TIMES.c4 ? (this.phone ? .47 : .58) : (this.phone ? .62 : .94);
      this.text('FILLED = 1 · HOLLOW = 0', this.fieldX, h * y, this.phone ? 8.5 : 10);
    }

    drawRingRulesPanels(pen, w, h, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }

  private bit(point: Point, value: number, radius: number): void {
    if (radius <= 0) return;

    const { pen, tones } = this;
    pen.beginPath();
    pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    pen.fillStyle = value ? tones.ink : tones.paper;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = .8;
    pen.fill();
    pen.stroke();
  }

  private matrixCenter(column: number, row: number): Point {
    return { x: this.width * (this.phone ? .28 + .44 * column : .16 + .25 * column), y: this.height * (this.phone ? .18 + .25 * row : .26 + .39 * row) };
  }

  private matrixPoint(center: Point, row: number, column: number): Point {
    const spacing = this.phone ? 13 : 19;

    return { x: center.x + (column - 1.5) * spacing, y: center.y + (row - 1.5) * spacing };
  }

  private matrices(motion: Motion): void {
    const four = this.model.four;

    if (!four.inverseRows || !four.abRows || !four.baRows) throw new Error('The four-cell example needs its computed inverse and both products.');

    const views: MatrixView[] = [
      { name: 'A=C(a)', rows: four.rows, center: this.matrixCenter(0, 0), amount: motion.matrixA },
      { name: 'B=C(b)', rows: four.inverseRows, center: this.matrixCenter(1, 0), amount: motion.matrixB },
      { name: 'AB', rows: four.abRows, center: this.matrixCenter(0, 1), amount: motion.productAB },
      { name: 'BA', rows: four.baRows, center: this.matrixCenter(1, 1), amount: motion.productBA },
    ];
    const retirement = 1 - motion.collapse;

    if (retirement <= 0) return;

    for (const [index, view] of views.entries()) {
      for (const [row, bits] of view.rows.entries()) {
        if (index === 0 && row === 0) continue;

        for (const [column, value] of coefficientCells(bits, four.order).entries()) {
          const position = this.matrixPoint(view.center, row, column);
          const radius = (this.phone ? 3 : 4) * retirement * Math.max(0, Math.min(1, view.amount * 16 - row * 4 - column));
          this.bit(between(view.center, position, retirement), value, radius);
        }
      }

      if (view.amount === 1 && motion.collapse === 0) this.text(view.name, view.center.x, view.center.y - (this.phone ? 39 : 52), this.phone ? 14 : 20, true);
    }
  }

  private smallCenter(): Point {
    return { x: this.fieldX, y: this.height * .16 };
  }

  private smallRadius(): number {
    return Math.min(this.width * (this.phone ? .125 : .063), this.height * .10);
  }

  private integerPoint(value: number): Point {
    const { width: w, height: h } = this;

    return { x: w * (this.phone ? .10 + .80 * (value + 10) / 20 : .06 + .44 * (value + 10) / 20), y: h * (this.phone ? .49 : .66) };
  }

  private windowPoint(residue: number, motion: Motion): Point {
    const { width: w, height: h, model } = this;
    const value = residue <= (model.window.order - 1) / 2 ? residue : residue - model.window.order;
    const center = { x: this.fieldX, y: h * (this.phone ? .23 : .28) };
    const radius = Math.min(w * (this.phone ? .30 : .15), h * (this.phone ? .16 : .23));

    return between(circlePoint(center, radius, residue, model.window.order), this.integerPoint(value), motion.windowUnroll);
  }

  private coefficientPoint(index: number, motion: Motion): Point {
    const source = this.matrixPoint(this.matrixCenter(0, 0), 0, index);
    const row = { x: this.fieldX + (index - 1.5) * (this.phone ? 25 : 37), y: this.height * .30 };
    let point = between(source, row, motion.collapse);
    point = between(point, circlePoint(this.smallCenter(), this.smallRadius(), index, this.model.four.order), motion.rowToRing);
    const three = index < this.model.three.order ? circlePoint(this.smallCenter(), this.smallRadius(), index, this.model.three.order) : this.smallCenter();
    point = between(point, three, motion.c3Shrink);
    point = between(point, this.windowPoint(index, motion), motion.windowRing);
    const gallery = { x: this.width * (this.phone ? .75 : .42), y: this.height * .13 };

    return between(point, circlePoint(gallery, 16, index, this.model.three.order), motion.toyRetreat);
  }

  private coefficients(time: number, motion: Motion): void {
    const { model, pen, tones, width: w, height: h } = this;
    const centers: Point[] = [];

    if (motion.rowToRing > 0 && motion.windowRing === 0) {
      const circle = this.smallCenter();
      pen.beginPath();
      pen.arc(circle.x, circle.y, this.smallRadius(), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * motion.rowToRing);
      pen.strokeStyle = tones.ink;
      pen.lineWidth = .7;
      pen.stroke();
    }


    for (const [index, value] of model.four.ruleCells.entries()) {
      const point = this.coefficientPoint(index, motion);
      centers.push(point);
      const fourth = index >= model.three.order ? 1 - motion.c3Shrink : 1;
      const born = Math.max(0, Math.min(1, motion.matrixA * 16 - index));
      this.bit(point, value, (this.phone ? 3 : 4) * fourth * born);
    }


    const moving = [motion.collapse, motion.rowToRing, motion.c3Shrink, motion.windowRing, motion.windowUnroll, motion.toyRetreat].some(amount => amount > 0 && amount < 1);

    if (time < SCENE_TIMES.groupAlgebra) return;

    if (time < SCENE_TIMES.claim) {
      if (moving) this.text('CHANGING THE PICTURE · SAME STENCIL', this.fieldX, h * (this.phone ? .62 : .94), this.phone ? 8 : 10);

      if (!moving && motion.collapse === 1 && time < SCENE_TIMES.sofic) {
        const count = motion.c3Shrink === 1 ? model.three.order : model.four.order;
        const powers = ['1', 'x', 'x²', 'x³'];

        for (let index = 0; index < count; index++) {
          const position = centers[index];
          const label = powers[index];

          if (!position || !label) throw new Error('Each displayed coefficient needs its basis label.');

          const center = motion.rowToRing === 1 ? this.smallCenter() : { x: this.fieldX, y: h * .30 };
          const direction = motion.rowToRing === 1 ? { x: (position.x - center.x) / this.smallRadius(), y: (position.y - center.y) / this.smallRadius() } : { x: 0, y: 1 };
          this.text(label, position.x + direction.x * 14, position.y + direction.y * 14, this.phone ? 11 : 15, true, true);
        }

        if (!this.phone && motion.rowToRing === 1) {
          this.text('FIXED RULE', w * .46, h * .12, 9);
          this.text('COEFFICIENTS', w * .46, h * .17, 9);
        } else this.text('FIXED RULE COEFFICIENTS', this.fieldX, h * (motion.rowToRing === 1 ? .035 : .19), this.phone ? 8.5 : 11);
      }
    }

    if (time >= SCENE_TIMES.claim && motion.toyRetreat < 1) this.text('FINITE TOY · NOT THE COUNTEREXAMPLE', this.fieldX, h * .035, this.phone ? 8 : 10);

    if (motion.toyRetreat > 0) {
      const gallery = { x: w * (this.phone ? .25 : .14), y: h * .13 };
      pen.beginPath();
      pen.arc(gallery.x, gallery.y, 16 * motion.toyRetreat, 0, Math.PI * 2);
      pen.strokeStyle = tones.ink;
      pen.lineWidth = .7;
      pen.stroke();

      for (const [index, value] of model.four.ruleCells.entries()) this.bit(circlePoint(gallery, 16 * motion.toyRetreat, index, model.four.order), value, 2.5 * motion.toyRetreat);

      if (motion.toyRetreat === 1) {
        const second = { x: w * (this.phone ? .75 : .42), y: h * .13 };
        pen.beginPath();
        pen.arc(second.x, second.y, 16, 0, Math.PI * 2);
        pen.stroke();
        this.text(`C${String.fromCodePoint(0x2080 + model.four.order)}`, gallery.x, gallery.y + 29, this.phone ? 11 : 14, true);
        this.text(`C${String.fromCodePoint(0x2080 + model.three.order)}`, second.x, second.y + 29, this.phone ? 11 : 14, true);
        this.text('FINITE TOYS ONLY', this.fieldX, h * .035, this.phone ? 8.5 : 11);
      }
    }
  }

  private cells(values: readonly number[], point: Point, size: number, gap = 1.5): void {
    const { pen, tones } = this;

    for (const [index, value] of values.entries()) {
      const x = point.x + (index - (values.length - 1) / 2) * (size + gap);
      pen.fillStyle = value ? tones.ink : tones.paper;
      pen.strokeStyle = tones.ink;
      pen.lineWidth = .65;
      pen.fillRect(x - size / 2, point.y - size / 2, size, size);
      pen.strokeRect(x - size / 2, point.y - size / 2, size, size);
    }
  }

  private map(action: RingAction, progress: number, retirement: number): void {
    if (progress <= 0 || retirement <= 0) return;

    const { width: w, height: h, pen, tones } = this;
    const left = w * (this.phone ? .20 : .12);
    const right = w * (this.phone ? .80 : .46);
    const top = h * (this.phone ? .32 : .34);
    const bottom = h * (this.phone ? .59 : .85);
    const point = (index: number, x: number): Point => ({ x, y: mix(top, bottom, index / (action.configurations.length - 1)) });
    const visible = Math.ceil(progress * action.configurations.length);
    const size = (this.phone ? 5.5 : 8) * retirement;
    const width = action.order * ((this.phone ? 5.5 : 8) + 1.5) * retirement;

    for (const [index, config] of action.configurations.entries()) {
      if (index >= visible) break;

      const from = between(this.smallCenter(), point(index, left), retirement);
      const to = between(this.smallCenter(), point(config.outputBits, right), retirement);
      drawLine(pen, from.x + width / 2, from.y, to.x - width / 2, to.y, tones.ink, index === visible - 1 ? 1.2 : .45);
    }

    for (const [index, config] of action.configurations.entries()) {
      if (index >= visible) break;

      const from = between(this.smallCenter(), point(index, left), retirement);
      this.cells(config.inputCells, from, size, 1.5 * retirement);
    }

    for (const [index, config] of action.configurations.entries()) {
      const to = between(this.smallCenter(), point(index, right), retirement);
      this.cells(config.inputCells, to, size, 1.5 * retirement);

      if (action.missingOutputs.includes(index)) {
        const x = to.x + width / 2 + 8 * retirement;
        const extent = 3 * retirement;
        drawLine(pen, x - extent, to.y - extent, x + extent, to.y + extent, tones.ink, .8);
        drawLine(pen, x + extent, to.y - extent, x - extent, to.y + extent, tones.ink, .8);
      }
    }

    if (retirement === 1) {
      this.text('INPUTS', left, top - 16, this.phone ? 8 : 10);
      this.text('TARGETS', right, top - 16, this.phone ? 8 : 10);
    }
  }

  private window(motion: Motion): void {
    const { model, pen, tones, height: h } = this;
    const retirement = 1 - motion.toyRetreat;
    const points: Point[] = [];

    for (let residue = 0; residue < model.window.order; residue++) {
      const from = residue < model.three.order ? circlePoint(this.smallCenter(), this.smallRadius(), residue, model.three.order) : this.smallCenter();
      const target = this.windowPoint(residue, motion);
      const base = between(from, target, motion.windowRing);
      const gallery = { x: this.width * (this.phone ? .75 : .42), y: h * .13 };
      const retiring = residue < model.three.order ? circlePoint(gallery, 16, residue, model.three.order) : gallery;
      const point = between(base, retiring, motion.toyRetreat);
      points.push(point);
    }

    for (const [index, point] of points.entries()) {
      const next = points[(index + 1) % points.length];

      if (!next) throw new Error('The finite cyclic window needs each adjacent site.');

      if (index === (model.window.order - 1) / 2 && motion.windowUnroll > 0) {
        pen.beginPath();
        pen.moveTo(point.x, point.y);
        pen.quadraticCurveTo(this.fieldX, point.y - h * .10 * motion.windowUnroll, next.x, next.y);
        pen.strokeStyle = tones.ink;
        pen.lineWidth = .65 * retirement;
        pen.stroke();
      } else drawLine(pen, point.x, point.y, next.x, next.y, tones.ink, .65 * retirement);
    }

    for (const [residue, point] of points.entries()) {
      if (!model.stencilExponents.some(index => index === residue)) this.bit(point, 0, 2.2 * motion.windowRing * retirement);
    }

    if (motion.windowRing < 1 || retirement < 1) return;

    const checked = Math.floor(model.window.checks * motion.windowChecks);
    const sample = checked > 0 ? model.window.sums[checked - 1] : undefined;

    if (sample) {
      for (const value of [sample.x, sample.y, sample.decoded]) {
        const point = this.integerPoint(value);
        pen.beginPath();
        pen.arc(point.x, point.y, 5.5, 0, Math.PI * 2);
        pen.strokeStyle = tones.ink;
        pen.lineWidth = 1;
        pen.stroke();
      }

      this.text(`${sample.x} + ${sample.y} = ${sample.decoded}`.replaceAll('-', '−'), this.fieldX, h * (this.phone ? .56 : .80), this.phone ? 16 : 23, true);
      this.text('WINDOW ONLY · Z IS INFINITE', this.fieldX, h * (this.phone ? .62 : .91), this.phone ? 8 : 10);
    }

    for (let residue = 0; residue < model.window.order; residue++) {
      const value = residue <= (model.window.order - 1) / 2 ? residue : residue - model.window.order;

      if (motion.windowUnroll > 0 && value % 5 !== 0) continue;

      const position = points[residue];

      if (!position) throw new Error('Each integer-window label needs its actual residue position.');

      if (motion.windowUnroll === 0) {
        const center = { x: this.fieldX, y: h * (this.phone ? .23 : .28) };
        const scale = Math.hypot(position.x - center.x, position.y - center.y);
        const vector = { x: (position.x - center.x) / scale, y: (position.y - center.y) / scale };
        this.text(String(value).replace('-', '−'), position.x + vector.x * 12, position.y + vector.y * 12, this.phone ? 9 : 11, true, true);
      } else this.text(String(value).replace('-', '−'), position.x, position.y + 15, this.phone ? 10 : 13, true, true);
    }
  }

  private claim(motion: Motion): void {
    const { pen, tones, width: w, height: h } = this;
    const center = { x: this.fieldX, y: h * .35 };
    const width = w * (this.phone ? .72 : .43) * motion.claimBlank;
    const height = h * .28 * motion.claimBlank;

    if (motion.claimBlank > 0) {
      pen.save();
      pen.beginPath();
      pen.rect(center.x - width / 2, center.y - height / 2, width, height);
      pen.strokeStyle = tones.ink;
      pen.lineWidth = .85;
      pen.stroke();
      pen.clip();

      for (let offset = -height; offset < width + height; offset += 9) drawLine(pen, center.x - width / 2 + offset, center.y + height / 2, center.x - width / 2 + offset + height, center.y - height / 2, tones.ink, .35);

      pen.restore();
    }

    if (motion.claimBlank === 1) {
      this.text('GROUP NOT DRAWN', center.x, center.y - 9, this.phone ? 12 : 17, false, true);
      this.text('NO EXAMPLE GENERATED', center.x, center.y + 14, this.phone ? 8.5 : 11, false, true);
    }

    if (motion.claimMark > 0) {
      const left = center.x - w * (this.phone ? .39 : .235);
      const right = mix(left, center.x + w * (this.phone ? .39 : .235), motion.claimMark);
      const y = center.y + h * .165;
      drawLine(pen, left, y, right, y, tones.blue, 2, [5, 4]);
      drawLine(pen, left, y - 7, left, y, tones.blue, 2);

      if (motion.claimMark === 1) drawLine(pen, right, y - 7, right, y, tones.blue, 2);
    }

    if (motion.claimMap > 0) {
      const y = h * .565;
      const left = this.fieldX - w * (this.phone ? .22 : .14);
      const right = mix(left, this.fieldX + w * (this.phone ? .22 : .14), motion.claimMap);
      drawLine(pen, left, y, right, y, tones.blue, 1.5);
      drawLine(pen, right - 7, y - 4, right, y, tones.blue, 1.5);
      drawLine(pen, right - 7, y + 4, right, y, tones.blue, 1.5);

      if (motion.claimMap === 1) {
        drawText(pen, 'CLAIMED MAP', this.fieldX, y - 13, { size: this.phone ? 9 : 12, color: tones.blue, paper: tones.paper });
        this.text('INJECTIVE · NOT ONTO', this.fieldX, y + 18, this.phone ? 8.5 : 11);
      }
    }
  }
}

export function createRingRulesFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new RingRulesFilm(root, context);
}

import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText, drawWrappedText, type TextStyle } from '../../plate/canvas/wrapped-text';
import { buildSharedColourModel, colour, type Ink } from './math';
import { drawSharedPanels } from './panels';
import { motionAt, SCENE_TIMES } from './story';

type Point = { x: number; y: number };

type Motion = ReturnType<typeof motionAt>;

type Mark = { value: number; original: number; ink: Ink; input: boolean; sum: boolean; product: boolean };

function computedValue(values: readonly number[], index: number): number {
  const value = values.at(index);

  if (value === undefined) throw new Error('Every drawn search configuration needs its computed endpoint.');

  return value;
}

class SharedColourFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly model = buildSharedColourModel();

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 6, vertical: 6 });
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.tones = tones;
    this.labels.resize(width, height);
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
    this.strip(time, motion);

    if (time < SCENE_TIMES.pairSearch) this.earlyExamples(time, motion);
    else this.ribbon(time, motion);

    drawSharedPanels(pen, w, h, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }

  private get phone(): boolean {
    return this.width < PHONE_STAGE_WIDTH;
  }

  private text(value: string, x: number, y: number, size: number, math = false, paper = false): void {
    const style: TextStyle = { size, color: this.tones.ink, family: math ? 'math' : 'type' };

    if (paper) style.paper = this.tones.paper;

    drawText(this.pen, value, x, y, style);
  }

  private note(value: string, x: number, y: number, width: number, size: number): void {
    drawWrappedText(this.pen, value, x, y, width, { size, color: this.tones.ink });
  }

  private cell(point: Point, n: number, ink: Ink, width: number, height: number, numbered: boolean, painted = true): void {
    const { pen, tones } = this;
    const left = point.x - width / 2;
    const top = point.y - height / 2;
    pen.save();
    pen.beginPath();
    pen.rect(left, top, width, height);
    pen.fillStyle = painted && ink === 0 ? tones.ink : tones.paper;
    pen.fill();
    pen.strokeStyle = tones.ink;
    pen.lineWidth = .7;
    pen.stroke();
    pen.clip();

    if (painted && ink === 1) {
      for (let offset = -height; offset < width + height; offset += 3.5) {
        drawLine(pen, left + offset, top + height, left + offset + height, top, tones.ink, .55);
      }
    }

    if (numbered) {
      const font = Math.max(8, Math.min(12, width * .70));
      const style: TextStyle = { size: font, color: painted && ink === 0 ? tones.paper : tones.ink, family: 'math' };

      if (ink === 1 || !painted) style.paper = tones.paper;

      drawText(pen, String(n), point.x, point.y + .3, style);
    }

    pen.restore();
  }

  private gridPoint(n: number): Point {
    const { width: w, height: h } = this;
    const columns = this.phone ? 16 : w < 800 ? 32 : 64;
    const rows = 64 / columns;
    const index = n - 1;
    const spacing = w * .90 / columns;
    const vertical = this.phone ? h * .065 : h * .095;

    return {
      x: w * .05 + spacing * (index % columns + .5),
      y: h * (rows === 1 ? .32 : .25) + Math.floor(index / columns) * vertical,
    };
  }

  private extent(motion: Motion): number {
    const scale = motion.scale * (1 - motion.scaleReturn);
    const pairExtent = Math.exp(mix(Math.log(computedValue(this.model.m2.union, -1)), Math.log(computedValue(this.model.scaled.configuration.union, -1)), scale));
    const maximum = computedValue(this.model.m3.union, -1);

    return Math.exp(mix(Math.log(pairExtent), Math.log(maximum), motion.camera));
  }

  private axisPoint(n: number, motion: Motion): Point {
    const { width: w, height: h } = this;
    const position = Math.log(n) / Math.log(this.extent(motion));

    return this.phone ? { x: w * .13, y: h * (.105 + .495 * position) } : { x: w * (.065 + .87 * position), y: h * .36 };
  }

  private strip(time: number, motion: Motion): void {
    const { width: w, height: h } = this;
    const columns = this.phone ? 16 : w < 800 ? 32 : 64;
    const cellWidth = Math.min(this.phone ? 14 : 19, w * .90 / columns - 2);
    const lift = this.phone ? 8 : 14;

    for (const entry of this.model.strip) {
      if (motion.exponentLift > 0 && this.model.exponents.rows.slice(0, 6).some(row => row.power === entry.n)) continue;

      const grid = this.gridPoint(entry.n);
      const axis = this.axisPoint(entry.n, motion);
      let raised = 0;

      if (this.model.schur.values.includes(entry.n)) raised += motion.schurLift;
      const revealedSums = this.model.folkman.terms.slice(0, Math.floor(motion.sumReveal * this.model.folkman.terms.length));

      if (this.model.folkman.inputs.includes(entry.n) || revealedSums.some(term => term.sum === entry.n)) raised += motion.sumLift;

      const point = { x: mix(grid.x, axis.x, motion.ribbon), y: mix(grid.y - raised * lift, axis.y, motion.ribbon) };
      const boxWidth = mix(cellWidth, this.phone ? 6 : 1.7, motion.ribbon);
      const boxHeight = mix(this.phone ? 15 : 18, this.phone ? 1.5 : 7, motion.ribbon);
      this.cell(point, entry.n, entry.colour, boxWidth, boxHeight, motion.ribbon < .18, motion.paint * this.model.strip.length >= entry.n);
    }

    if (time < SCENE_TIMES.pairSearch) {
      this.text('1', w * .035, h * .17, this.phone ? 10 : 12, true);
      this.text('64', w * .965, h * .17, this.phone ? 10 : 12, true);
    }
  }

  private arc(from: Point, to: Point, bend: number, amount: number, dashed = false, row = false): void {
    if (amount <= 0) return;

    const { pen, tones } = this;
    const vertical = this.phone && !row && Math.abs(from.y - to.y) > this.height * .04;
    const control = vertical ? { x: Math.max(from.x, to.x) + bend, y: (from.y + to.y) / 2 } : { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - bend };
    const steps = Math.max(2, Math.ceil(40 * amount));
    pen.save();
    pen.beginPath();
    pen.moveTo(from.x, from.y);

    for (let i = 1; i <= steps; i++) {
      const t = amount * i / steps;
      const s = 1 - t;
      pen.lineTo(s * s * from.x + 2 * s * t * control.x + t * t * to.x, s * s * from.y + 2 * s * t * control.y + t * t * to.y);
    }

    pen.strokeStyle = tones.ink;
    pen.lineWidth = .8;
    pen.setLineDash(dashed ? [3, 3] : []);
    pen.stroke();
    pen.restore();
  }

  private earlyExamples(time: number, motion: Motion): void {
    const { width: w, height: h, model } = this;
    const font = this.phone ? 15 : 22;
    const row = this.phone ? .53 : .47;

    if (time >= SCENE_TIMES.schur && time < SCENE_TIMES.finiteSums) {
      const [a, b] = model.schur.inputs;

      if (a === undefined || b === undefined) throw new Error('The Schur drawing needs its searched pair.');

      const from = this.gridPoint(a);
      const to = this.gridPoint(model.schur.sum);
      this.arc({ x: from.x, y: from.y - 12 }, { x: to.x, y: to.y - 12 }, this.phone ? 12 : 42, motion.schurLift);
      this.text(`${a} + ${b} = ${model.schur.sum}`, w * .5, h * row, font, true);
    }

    if (time >= SCENE_TIMES.finiteSums && time < SCENE_TIMES.exponents) {
      const count = Math.floor(motion.sumReveal * model.folkman.terms.length);
      this.text(`A = {${model.folkman.inputs.join(', ')}}`, w * .5, h * (row - .015), font, true);

      for (const [index, term] of model.folkman.terms.entries()) {
        if (index >= count) break;

        const columns = this.phone ? 4 : 7;
        const x = w * (.10 + .80 * ((index % columns + .5) / columns));
        const y = h * (row + .05 + Math.floor(index / columns) * .04);
        this.text(String(term.sum), x, y, this.phone ? 13 : 19, true);
      }
    }

    if (motion.exponentLift > 0) this.exponents(motion);

    if (time >= SCENE_TIMES.both && time < SCENE_TIMES.infiniteObstruction) {
      this.text(`A = {${model.m2.inputs.join(', ')}}`, w * .5, h * .51, font, true);
      this.text('SUMS ?', w * .30, h * .57, this.phone ? 10 : 14);
      this.text('PRODUCTS ?', w * .70, h * .57, this.phone ? 10 : 14);
      const first = model.m2.inputs[0];
      const last = model.m2.inputs.at(-1);

      if (first === undefined || last === undefined) throw new Error('The pair question needs both searched generators.');

      this.arc(this.gridPoint(first), this.gridPoint(last), this.phone ? 30 : 65, motion.bothArcs);
      this.arc(this.gridPoint(first), this.gridPoint(last), this.phone ? -25 : -65, motion.bothArcs, true);
    }

    if (time >= SCENE_TIMES.infiniteObstruction && time < SCENE_TIMES.finiteQuestion) {
      this.text('…', w * .94, h * .49, 26, true);
      this.note('A SEPARATE COLOURING BLOCKS INFINITE A', w * .5, h * .52, w * .85, this.phone ? 11 : 15);
    }

    if (time >= SCENE_TIMES.finiteQuestion) {
      const slots = Math.ceil(5 * motion.slots);
      const spacing = Math.min(44, w * .15);

      for (let index = 0; index < slots; index++) {
        const x = w * .5 + (index - 2) * spacing;
        drawLine(this.pen, x - 10, h * .54, x + 10, h * .54, this.tones.ink, 1);
      }

      this.text('m = 1, 2, 3, …', w * .5, h * .60, this.phone ? 14 : 20, true);
    }
  }

  private exponents(motion: Motion): void {
    const { width: w, height: h, model } = this;
    const lift = motion.exponentLift;
    const rows = model.exponents.rows.slice(0, 6);
    const endpoint = (index: number): Point => ({ x: w * (.12 + .76 * (index + .5) / rows.length), y: h * .51 });

    const carriedPoint = (k: number): Point => {
      const row = rows[k - 1];

      if (!row) throw new Error('The exponent arc needs a computed power cell.');

      const from = this.gridPoint(row.power);
      const to = endpoint(k - 1);

      return { x: mix(from.x, to.x, lift), y: mix(from.y, to.y, lift) };
    };
    const [a, , c] = model.exponents.triple;
    this.arc(carriedPoint(a), carriedPoint(c), this.phone ? 35 : 55, motion.exponentArc * lift, false, true);

    for (const [index, item] of rows.entries()) {
      const from = this.gridPoint(item.power);
      const to = endpoint(index);
      const position = { x: mix(from.x, to.x, lift), y: mix(from.y, to.y, lift) };
      const columns = this.phone ? 16 : w < 800 ? 32 : 64;
      const originalWidth = Math.min(this.phone ? 14 : 19, w * .90 / columns - 2);
      this.cell(position, item.power, item.colour, mix(originalWidth, this.phone ? 23 : 34, lift), mix(this.phone ? 15 : 18, 18, lift), lift === 1);

      if (lift > .95) this.text(String(item.k), to.x, to.y + 25, this.phone ? 12 : 17, true);
    }

    if (lift > .95) {
      this.text('EXPONENT k', w * .5, h * .61, this.phone ? 9 : 13);
      const [a, b, c] = model.exponents.triple;
      this.text(`${a} + ${b} = ${c}    ↔    ${2 ** a} × ${2 ** b} = ${2 ** c}`, w * .5, h * .15, this.phone ? 13 : 20, true);
    }
  }

  private marks(time: number, motion: Motion): Mark[] {
    const { model } = this;
    const scale = motion.scale * (1 - motion.scaleReturn);
    const showTriple = time >= SCENE_TIMES.paperClaim;
    const config = showTriple ? model.m3 : model.m2;
    const result: Mark[] = [];

    for (const value of config.union) {
      const input = config.inputs.includes(value);
      const sum = config.sums.includes(value);
      const product = config.products.includes(value);
      let shown = value;

      if (!showTriple && scale > 0) {
        const term = config.terms.find(item => item.product === value);
        const power = product && !sum && term ? term.indices.length : 1;
        shown = value * model.scaled.k ** (power * scale);
      }

      result.push({ value: shown, original: value, ink: scale === 1 && !showTriple ? colour(Math.round(shown)) : colour(value), input, sum, product });
    }

    return result;
  }

  private ribbon(time: number, motion: Motion): void {
    const { width: w, height: h, pen, tones, model } = this;
    const start = this.axisPoint(1, motion);
    const end = this.axisPoint(this.extent(motion), motion);
    const axisEnd = { x: mix(start.x, end.x, motion.ribbon), y: mix(start.y, end.y, motion.ribbon) };
    drawLine(pen, start.x, start.y, axisEnd.x, axisEnd.y, tones.ink, .75);
    const marks = this.marks(time, motion);
    const triple = time >= SCENE_TIMES.paperClaim;
    const visibleCount = triple ? marks.length : Math.ceil(marks.length * motion.pairReveal);
    const settledScale = motion.scale === 1 && motion.scaleReturn === 0;
    const movingScale = !triple && motion.scale * (1 - motion.scaleReturn) > 0 && !settledScale;
    const calloutSize = this.phone ? 14 : 18;


    for (const [index, mark] of marks.entries()) {
      if (index >= visibleCount) continue;
      if (triple && !model.m2.union.includes(mark.original) && motion.tripleReveal === 0) continue;

      const point = this.axisPoint(mark.value, motion);
      const targetRank = index / Math.max(1, marks.length - 1);
      const oldIndex = model.m2.union.indexOf(mark.original);
      const rank = triple && oldIndex >= 0 ? mix(oldIndex / (model.m2.union.length - 1), targetRank, motion.tripleReveal) : targetRank;
      const label = this.phone ? { x: w * .66, y: h * (.105 + .495 * rank) } : { x: w * (.07 + .86 * rank), y: h * (index % 2 ? .50 : .16) };
      const amount = triple && oldIndex < 0 ? motion.tripleReveal : motion.ribbon;
      const grid = triple && oldIndex < 0 ? this.axisPoint(computedValue(model.m2.union, -1), motion) : this.gridPoint(Math.min(mark.original, 64));
      const moving = { x: mix(grid.x, point.x, amount), y: mix(grid.y, point.y, amount) };
      this.cell(moving, Math.round(mark.value), mark.ink, this.phone ? 8 : 8, this.phone ? 7 : 10, false, !movingScale);

      if (amount > .97) {
        const corner = this.phone ? { x: w * .31, y: label.y } : { x: label.x, y: label.y + (index % 2 ? -15 : 15) };
        drawLine(pen, point.x + (this.phone ? 6 : 0), point.y, corner.x, corner.y, tones.ink, .55);
        drawLine(pen, corner.x, corner.y, label.x - (this.phone ? 25 : 0), label.y, tones.ink, .55);
        this.cell({ x: label.x - (this.phone ? 29 : 28), y: label.y }, Math.round(mark.value), mark.ink, 8, 8, false, !movingScale);
        const readout = movingScale ? 'MOVING' : String(Math.round(mark.value));
        this.text(readout, label.x, label.y, calloutSize, true, true);

        if (mark.input && !movingScale) this.text('A', label.x + (this.phone ? 40 : 34), label.y, this.phone ? 9 : 12, true, true);
      }
    }

    if (!triple && motion.pairArcs > 0) {
      const first = marks.find(mark => mark.original === model.m2.inputs[0]);
      const sum = marks.find(mark => mark.sum && !mark.input);
      const product = marks.find(mark => mark.product && !mark.input);

      if (!first || !sum || !product) throw new Error('The pair arcs need the searched generator, sum and product.');

      this.arc(this.axisPoint(first.value, motion), this.axisPoint(sum.value, motion), this.phone ? 32 : 75, motion.pairArcs);
      this.arc(this.axisPoint(first.value, motion), this.axisPoint(product.value, motion), this.phone ? 45 : -75, motion.pairArcs, true);
    }

    if (triple && motion.sumArcs > 0) {
      const origin = this.axisPoint(computedValue(model.m3.inputs, 0), motion);

      for (const mark of marks) {
        if (mark.input) continue;
        if (mark.sum) this.arc(origin, this.axisPoint(mark.value, motion), this.phone ? 25 : 55, motion.sumArcs);
        if (mark.product) this.arc(origin, this.axisPoint(mark.value, motion), this.phone ? 36 : -60, motion.productArcs, true);
      }
    }

    if (motion.claim > 0) this.claim(motion);

    if (motion.unionCount > 0) this.text(`${model.m3.counts.sums} + ${model.m3.counts.products} − ${model.m3.counts.shared} = ${model.m3.counts.union}`, w * .5, h * .64, this.phone ? 16 : 25, true, true);

    this.axisLabels(motion);
  }

  private axisLabels(motion: Motion): void {
    const { width: w, height: h, pen, tones } = this;

    if (motion.ribbon > .98) {
      for (const value of [1, 10, 100, 1000, 10000]) {
        if (value > this.extent(motion)) continue;

        const point = this.axisPoint(value, motion);

        if (this.phone) {
          drawLine(pen, point.x - 3, point.y, point.x + 3, point.y, tones.ink, .8);
          this.text(String(value), w * .055, point.y, 9, true, true);
        } else {
          drawLine(pen, point.x, point.y - 3, point.x, point.y + 3, tones.ink, .8);
          this.text(String(value), point.x, point.y + 16, 12, true, true);
        }
      }

      this.text('LOG SCALE', this.phone ? w * .15 : w * .50, h * .065, this.phone ? 8 : 11);
    }

  }

  private claim(motion: Motion): void {
    const { pen, width: w, height: h, tones } = this;
    const x1 = w * (this.phone ? .91 : .05);
    const y1 = h * (this.phone ? .085 : .565);
    const x2 = this.phone ? x1 : w * .95;
    const y2 = this.phone ? h * .615 : y1;
    drawLine(pen, x1, y1, mix(x1, x2, motion.claim), mix(y1, y2, motion.claim), tones.blue, 2, [5, 4]);

    if (this.phone) {
      drawLine(pen, x1 - 7, y1, x1, y1, tones.blue, 2);
      drawLine(pen, x2 - 7, y2, x2, y2, tones.blue, 2);
    } else {
      drawLine(pen, x1, y1 - 7, x1, y1, tones.blue, 2);
      drawLine(pen, x2, y2 - 7, x2, y2, tones.blue, 2);
    }
  }
}

export function createSharedColourFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new SharedColourFilm(root, context);
}

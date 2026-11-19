import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { buildCoinMatrixModel, rowPartialProducts, type Sign } from './math';
import { drawCoinMatrixPanels } from './panels';
import { motionAt } from './story';

type Motion = ReturnType<typeof motionAt>;

type Point = { x: number; y: number };

type Grid = Point & { side: number; size: number };

type Cell = Point & { side: number };

function between(a: Cell, b: Cell, amount: number): Cell {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount), side: mix(a.side, b.side, amount) };
}

function clamp(amount: number): number {
  return Math.max(0, Math.min(1, amount));
}

class CoinMatrixFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly model = buildCoinMatrixModel();
  private readonly singularPartial = rowPartialProducts(this.model.cornerSingular, this.model.cornerKernel);
  private readonly invertiblePartial = rowPartialProducts(this.model.cornerInvertible, this.model.cornerKernel);

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 4, vertical: 4 });
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

  private fullGrid(motion: Motion): Grid {
    const { width: w, height: h } = this;
    const side = Math.min(w * (this.phone ? .72 : .43), h * (this.phone ? .36 : .70));
    const shrink = this.phone ? motion.countsRetire : 0;

    return { x: w * mix(this.phone ? .40 : .26, .28, shrink), y: h * mix(this.phone ? .28 : .43, this.phone ? .235 : .16, shrink), side: mix(side, w * .42, shrink), size: this.model.matrix.length };
  }

  private cornerGrid(): Grid {
    const { width: w, height: h } = this;

    return { x: w * (this.phone ? .30 : .25), y: h * (this.phone ? .28 : .43), side: Math.min(w * (this.phone ? .50 : .28), h * .56), size: 2 };
  }

  private parkedGrid(): Grid {
    return { x: this.width * (this.phone ? .80 : .17), y: this.height * (this.phone ? .57 : .085), side: Math.min(this.width * (this.phone ? .12 : .15), this.height * (this.phone ? .10 : .13)), size: this.model.matrix.length };
  }

  private gridCell(grid: Grid, row: number, column: number): Cell {
    const side = grid.side / grid.size;

    return { x: grid.x + (column + .5 - grid.size / 2) * side, y: grid.y + (row + .5 - grid.size / 2) * side, side };
  }

  private cell(row: number, column: number, motion: Motion): Cell {
    const start = this.gridCell(this.fullGrid(motion), row, column);
    const target = row < 2 && column < 2 ? this.gridCell(this.cornerGrid(), row, column) : this.gridCell(this.parkedGrid(), row, column);

    const amount = motion.corner * (1 - motion.regrow);
    const cell = between(start, target, amount);

    if (this.phone && !(row < 2 && column < 2)) {
      if (motion.regrow > 0) return { ...cell, x: mix(target.x, start.x, clamp(motion.regrow * 2)), y: mix(target.y, start.y, clamp((motion.regrow - .5) * 2)) };

      return { ...cell, x: mix(start.x, target.x, clamp(amount * 2)), y: mix(start.y, target.y, clamp((amount - .5) * 2)) };
    }

    return cell;
  }

  private text(value: string, x: number, y: number, size: number, math = false): void {
    drawText(this.pen, value, x, y, { size, family: math ? 'math' : 'type', color: this.tones.ink, paper: this.tones.paper });
  }

  private glyph(sign: Sign, point: Point, side: number, breadth = 1): void {
    if (side < .1 || breadth < .01) return;

    const { pen, tones } = this;
    pen.save();
    pen.translate(point.x, point.y);
    pen.scale(breadth, 1);
    pen.fillStyle = sign === 1 ? tones.ink : tones.paper;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = .8;
    pen.fillRect(-side / 2, -side / 2, side, side);

    if (sign === -1) {
      pen.strokeRect(-side / 2, -side / 2, side, side);
      pen.beginPath();
      pen.rect(-side / 2, -side / 2, side, side);
      pen.clip();
      pen.beginPath();

      for (let offset = -side; offset <= side; offset += Math.max(2, side / 5)) {
        pen.moveTo(offset - side / 2, side / 2);
        pen.lineTo(offset + side / 2, -side / 2);
      }

      pen.stroke();
    }

    pen.restore();
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
    this.matrix(motion);
    this.vectors(motion);
    this.scale(motion);
    this.productCarrier(motion);

    if (motion.pairFactors > 0 && motion.restoreRows === 0) this.factors(motion);
    if (motion.smallCounts > 0) this.counts(motion);
    if (motion.biasCoin > 0) this.coins(motion);

    drawCoinMatrixPanels(pen, w, h, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }

  private matrix(motion: Motion): void {
    const { pen, model, tones } = this;
    const size = model.matrix.length;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = .65;
    pen.beginPath();

    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size; column++) {
        const point = this.cell(row, column, motion);
        pen.rect(point.x - point.side / 2, point.y - point.side / 2, point.side, point.side);
      }
    }

    pen.stroke();
    let upper = 0;
    let reflected = 0;

    for (let row = 0; row < size; row++) {
      for (let column = row; column < size; column++) {
        const original = model.matrix[row]?.[column];
        const target = model.whatIfMatrix[row]?.[column];

        if (original === undefined || target === undefined) throw new Error('Every independent position needs its retained sign.');

        const fill = clamp(motion.upper * (size * (size + 1) / 2) - upper++);
        const corner = row === 1 && column === 1 ? motion.cornerFlip * (1 - motion.cornerRestore) : 0;
        const equal = original === target ? 0 : motion.whatIf * (1 - motion.restoreRows);
        const flip = Math.max(corner, equal);
        const sign: Sign = flip > .5 ? 1 : original;
        const point = this.cell(row, column, motion);
        const breadth = Math.abs(Math.cos(Math.PI * flip));
        this.glyph(sign, point, point.side * .58 * fill, breadth * (fill === 1 ? 1 : Math.abs(Math.cos(3 * Math.PI * (1 - fill)))));

        if (row !== column) {
          const progress = clamp(motion.mirror * (size * (size - 1) / 2) - reflected++);

          if (progress > 0) {
            const destination = this.cell(column, row, motion);
            const mirrored = between(point, destination, progress * progress * (3 - 2 * progress));
            this.glyph(sign, mirrored, mirrored.side * .58, breadth);
          }
        }
      }
    }

    if (motion.equalRows > 0 && motion.cornerRestore === 0) {
      const grid = this.cornerGrid();
      pen.lineWidth = 1.6;
      pen.setLineDash([3, 3]);
      pen.strokeRect(grid.x - grid.side / 2 - 3, grid.y - grid.side / 2 - 3, grid.side + 6, grid.side + 6);
      pen.setLineDash([]);
    }

    if (motion.whatIf > 0 && motion.restoreRows === 0) {
      const grid = this.fullGrid(motion);
      const cell = grid.side / size;
      pen.lineWidth = 1.7;
      pen.strokeRect(grid.x - grid.side / 2 - 2, grid.y - grid.side / 2 - 2, grid.side + 4, 2 * cell + 4);
    }

    const corner = motion.corner * (1 - motion.regrow);

    if (corner === 1) {
      const kept = this.parkedGrid();
      this.text('OTHER 32 ENTRIES', kept.x, this.phone ? kept.y - kept.side / 2 - 7 : kept.y + kept.side / 2 + 10, this.phone ? 7 : 9);
      const grid = this.cornerGrid();
      this.text('2 × 2 CORNER', grid.x, this.phone ? grid.y - grid.side / 2 - 12 : grid.y + grid.side / 2 + 12, this.phone ? 9 : 12, true);
    }

    if (motion.countsRetire === 0) {
      const y = this.height * (this.phone ? .48 : .90);
      const x = this.width * (this.phone ? .5 : .26);
      const distance = this.phone ? 35 : 58;

      if (this.phone) {
        const enter = clamp(corner * 2);
        const drop = clamp((corner - .5) * 2);
        const first = { x: mix(x - distance, this.width * .75, enter), y: mix(y, this.height * .68, drop) };
        const second = { x: mix(mix(x + 15, this.width * .895, enter), this.width * .75, drop), y: mix(y, this.height * .78, drop) };
        this.glyph(1, first, 8);
        this.text('+1', first.x + mix(14, 15, enter), first.y, 10, true);
        this.glyph(-1, second, 8);
        this.text('−1', second.x + mix(25, 15, enter), second.y, 10, true);

        return;
      }

      this.glyph(1, { x: x - distance, y }, this.phone ? 8 : 11);
      this.text('+1', x - distance + (this.phone ? 14 : 19), y, this.phone ? 10 : 13, true);
      this.glyph(-1, { x: x + (this.phone ? 15 : 25), y }, this.phone ? 8 : 11);
      this.text('−1', x + distance + 5, y, this.phone ? 10 : 13, true);
    }
  }

  private vectors(motion: Motion): void {
    const { model, pen, tones } = this;
    const corner = motion.corner * (1 - motion.regrow);
    const two = corner > 0 && motion.kernelTwo > 0;
    const six = motion.kernelSix > 0;

    if (!two && !six && !(corner === 1 && motion.scene === 'dependent')) return;

    const first = this.cell(0, 0, motion);
    const second = this.cell(1, 1, motion);
    const cornerFrame = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2, side: first.side * 2, size: 2 };
    const grid = two || corner === 1 ? cornerFrame : this.fullGrid(motion);
    const count = two || corner === 1 ? 2 : model.kernel.length;
    const right = grid.x + grid.side / 2;
    const inputX = this.phone && count === 2 ? mix(right + 35, this.width * .74, motion.regrow) : right + (this.phone ? this.width * .06 : count === 2 ? 40 : 24);
    const outputX = this.phone && count === 2 ? mix(right + 82, this.width * .94, motion.regrow) : right + (this.phone ? this.width * .16 : count === 2 ? 96 : 70);
    const font = this.phone ? (motion.countsRetire > 0 ? 9 : 12) : 17;
    const progress = two ? motion.kernelTwo * (1 - motion.regrow) : motion.kernelSix;
    const products = two ? (motion.cornerRestore === 0 ? motion.zeroProducts : motion.invertibleProduct) : motion.sixProducts;
    const terms = Math.ceil(products * count);
    const partials = two ? (motion.cornerRestore === 0 ? this.singularPartial : this.invertiblePartial) : model.partialProducts;

    for (let index = 0; index < count; index++) {
      const y = grid.y + (index + .5 - count / 2) * grid.side / count;

      if (corner === 1 && motion.scene === 'dependent') {
        this.text(index === 0 ? 'x₁' : 'x₂', inputX, y, font + 1, true);
        continue;
      }

      const value = two ? model.cornerKernel[index] : model.kernel[index];

      if (value === undefined) throw new Error('Every vector component must come from its retained kernel.');

      if (progress * count > index) this.text(value < 0 ? '−1' : '1', inputX, y, font * clamp(progress * count - index), true);

      if (products > 0) {
        const value = partials[index]?.[terms];

        if (value === undefined) throw new Error('Every displayed partial product needs its exact integer sum.');

        this.text(String(value), outputX, y, font, true);
      }
    }

    if (count === 2) {
      const top = grid.y - grid.side / 2 + 4;
      const bottom = grid.y + grid.side / 2 - 4;
      pen.strokeStyle = tones.ink;
      pen.lineWidth = .85;

      for (const x of products > 0 ? [inputX, outputX] : [inputX]) {
        for (const direction of [-1, 1]) {
          const edge = x + direction * 10;
          drawLine(pen, edge - direction * 4, top, edge, top, tones.ink, .85);
          drawLine(pen, edge, top, edge, bottom, tones.ink, .85);
          drawLine(pen, edge, bottom, edge - direction * 4, bottom, tones.ink, .85);
        }
      }
    }

    if (six) {
      const top = grid.y - grid.side / 2 - 13;

      if (this.phone && motion.countsRetire > 0) {
        const amount = motion.countsRetire;
        const y = mix(top, this.height * 18.5 / 310, amount);
        drawText(pen, 'v', inputX, y, { size: font, family: 'math', color: tones.ink });
        if (products > 0) drawText(pen, products === 1 ? 'Av' : 'Σ', outputX, y, { size: font, family: 'math', color: tones.ink });
      } else {
        this.text('v', inputX, top, font, true);
        if (products > 0) this.text(products === 1 ? 'Av' : 'Σ', outputX, top, font, true);
      }
    }

    if (products > 0 && products < 1) {
      const y = Math.max(grid.y + grid.side / 2 + (count === 2 ? 32 : 12), this.height * .45);
      this.text(`FIRST ${terms} OF ${count} TERMS`, grid.x, y, this.phone ? 8 : 10);
    }

    const multiplyX = this.phone && count === 2 ? mix(right + 15, this.width * .66, motion.regrow) : right + (count === 2 ? 16 : this.phone ? 8 : 9);
    if (motion.scene !== 'dependent') this.text('×', multiplyX, grid.y, font, true);
    if (products > 0) this.text('=', outputX - (count === 2 ? this.phone ? 20 : 24 : this.phone ? 12 : 22), grid.y, font, true);

    if (products > 0 && products < 1) {
      const column = terms - 1;
      const point = this.gridCell(grid, 0, column);
      pen.strokeStyle = tones.ink;
      pen.lineWidth = 1.5;
      pen.setLineDash([2, 3]);
      pen.strokeRect(point.x - point.side / 2 - 1, grid.y - grid.side / 2 - 1, point.side + 2, grid.side + 2);
      pen.setLineDash([]);
    }
  }

  private scale(motion: Motion): void {
    if (motion.scale === 0) return;

    if (this.phone && motion.countsRetire > 0) {
      this.retiredScale(motion);

      return;
    }

    const { width: w, height: h, pen, tones, model } = this;
    const retire = clamp((motion.countsRetire - .8) / .2);
    const before = mix(.67, .80, Math.min(1, motion.smallCounts * 2));
    const y = h * (this.phone ? mix(before, .47, retire) : .81);
    const left = w * .10;
    const right = w * .92;
    const minimum = -model.fair.n - 2;
    const coordinate = (exponent: number) => mix(left, right, (exponent - minimum) / -minimum);
    drawLine(pen, left, y, mix(left, right, motion.scale), y, tones.ink);

    if (motion.scale < 1) return;

    for (const exponent of [minimum, -model.fair.n, 0]) {
      const x = coordinate(exponent);
      drawLine(pen, x, y - 3, x, y + 3, tones.ink);
      const label = exponent === 0 ? '1' : `1/${2 ** -exponent}`;
      const carried = exponent === -model.fair.n && motion.bruteCounts > 0 && motion.restoreRows === 0;

      if (!carried) this.text(label, x, y + 13, this.phone ? 9 : 12, true);
    }

    if (motion.lowerBound > 0) {
      const point = coordinate(Math.log2(model.fair.specifiedRows));
      drawLine(pen, point, y - 7, point, y + 7, tones.ink, 2.3);
      this.text(`n=${model.fair.n}`, point, y + (this.phone && motion.smallCounts === 0 ? -13 : 28), this.phone ? 8 : 11, true);
    }
  }

  private retiredScale(motion: Motion): void {
    const { width: w, height: h, pen, tones, model } = this;
    const amount = clamp((motion.countsRetire - .8) / .2);
    const before = mix(.67, .80, Math.min(1, motion.smallCounts * 2));
    const minimum = -model.fair.n - 2;
    const point = (exponent: number): Point => {
      const position = (exponent - minimum) / -minimum;

      return { x: mix(mix(w * .10, w * .92, position), w * .87, amount), y: mix(h * before, h * (75 + 48 * position) / 310, amount) };
    };
    const first = point(minimum);
    const last = point(0);
    const length = Math.hypot(last.x - first.x, last.y - first.y);
    const normal = { x: (first.y - last.y) / length, y: (last.x - first.x) / length };
    drawLine(pen, first.x, first.y, last.x, last.y, tones.ink);

    for (const exponent of [minimum, -model.fair.n, 0]) {
      const at = point(exponent);
      drawLine(pen, at.x - 3 * amount, at.y - 3 * (1 - amount), at.x + 3 * amount, at.y + 3 * (1 - amount), tones.ink);
      const offset = mix(13, w * .08, amount);
      drawText(pen, exponent === 0 ? '1' : `1/${2 ** -exponent}`, at.x + normal.x * offset, at.y + normal.y * offset, { size: 9, family: 'math', color: tones.ink });
    }

    if (motion.lowerBound > 0) {
      const at = point(Math.log2(model.fair.specifiedRows));
      drawLine(pen, at.x - 7 * amount, at.y - 7 * (1 - amount), at.x + 7 * amount, at.y + 7 * (1 - amount), tones.ink, 2.3);
      const detour = 32 * Math.sin(Math.PI * amount);
      this.text(`n=${model.fair.n}`, at.x + 19 * amount + detour, at.y + 28 * (1 - amount) - detour, 8, true);
    }
  }

  private productCarrier(motion: Motion): void {
    if (motion.bruteCounts === 0 || motion.restoreRows > 0) return;

    const { width: w, height: h, model } = this;
    const minimum = -model.fair.n - 2;
    const exponent = Math.log2(model.fair.specifiedRows);
    const target = { x: mix(w * .10, w * .92, (exponent - minimum) / -minimum), y: h * (this.phone ? .67 : .81) + 13 };
    const source = { x: w * (this.phone ? .5 : .80), y: h * (this.phone ? .855 : .61) };
    const point = { x: mix(source.x, target.x, motion.bruteCounts), y: mix(source.y, target.y, motion.bruteCounts) };
    this.text(`1/${Math.round(1 / model.fair.specifiedRows)}`, point.x, point.y, mix(this.phone ? 12 : 15, this.phone ? 9 : 12, motion.bruteCounts), true);
  }

  private factors(motion: Motion): void {
    const { model, pen, tones } = this;
    const grid = this.fullGrid(motion);
    const side = grid.side / grid.size;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.4;

    for (let column = 2; column < grid.size; column++) {
      const point = this.gridCell(grid, 0, column);
      pen.strokeRect(point.x - side * .43, point.y - side * .43, side * .86, side * 1.86);
      this.text(`1/${Math.round(1 / model.fair.pairAgreement)}`, point.x, grid.y - grid.side / 2 - 12, this.phone ? 10 : 14, true);
    }

    pen.strokeRect(grid.x - grid.side / 2 + 1, grid.y - grid.side / 2 + 1, side * 2 - 2, side * 2 - 2);
    this.text(`1/${Math.round(1 / model.fair.cornerAgreement)}`, grid.x - grid.side / 2 + side, grid.y - grid.side / 2 - 12, this.phone ? 10 : 14, true);
    this.text('3 COINS', this.phone ? grid.x - grid.side / 2 - 18 : grid.x - grid.side / 2 + side, grid.y - grid.side / 2 - (this.phone ? 12 : 25), this.phone ? 7 : 9);
  }

  private counts(motion: Motion): void {
    const { width: w, height: h, pen, tones, model } = this;
    const retiring = motion.countsRetire;
    const middle = this.phone ? .5 : .80;

    if (retiring > 0) {
      let x: number;
      let top: number;

      if (this.phone) {
        x = retiring < .3 ? mix(.5, .90, retiring / .3) : retiring < .8 ? .90 : mix(.90, .28, (retiring - .8) / .2);
        top = retiring < .3 ? .715 : retiring < .8 ? mix(.715, .025, (retiring - .3) / .5) : .025;
      } else {
        x = retiring < .6 ? .80 : retiring < .85 ? mix(.80, .32, (retiring - .6) / .25) : .32;
        top = retiring < .6 ? mix(.53, .015, retiring / .6) : retiring < .85 ? .015 : mix(.015, .04, (retiring - .85) / .15);
      }

      if (this.phone) drawText(pen, retiring === 1 ? 'FINITE COUNTS' : 'COUNTS', w * x, h * top, { size: 8, color: tones.ink });
      else this.text(retiring === 1 ? 'FINITE COUNTS' : 'COUNTS', w * x, h * top, 10);

      if (retiring === 1) {
        pen.strokeStyle = tones.ink;
        pen.lineWidth = .7;
        const width = w * (this.phone ? .42 : .20);
        const halfHeight = this.phone ? 7 : 8;
        pen.strokeRect(w * x - width / 2, h * top - halfHeight, width, halfHeight * 2);
      }

      return;
    }

    const font = this.phone ? 9 : 12;
    this.text('UNPAIRED / ALL SINGULAR', w * middle, h * (this.phone ? .65 : .43), this.phone ? 8 : 10);
    const small = model.counts.find(row => row.n === 4);
    const five = model.counts.find(row => row.n === 5);
    const six = model.counts.find(row => row.n === 6);

    if (!small || !five || !six) throw new Error('The finite count strip needs its exact retained sizes.');

    const rows = [
      `n≤${small.n}: 0 WITHOUT A ROW PAIR`,
      `n=${five.n}: ${five.unpaired.toLocaleString('en-US')} / ${five.singular.toLocaleString('en-US')}`,
      `n=${six.n}: ${six.unpaired.toLocaleString('en-US')} / ${six.singular.toLocaleString('en-US')}`,
    ];

    const reveal = this.phone ? clamp((motion.smallCounts - .5) * 2) : motion.smallCounts;

    for (const [index, row] of rows.entries()) {
      if (reveal * rows.length <= index) continue;

      this.text(row, w * middle, h * ((this.phone ? .69 : .48) + index * (this.phone ? .04 : .065)), font, true);
    }
  }

  private coin(point: Point, radius: number, p: number): void {
    const { pen, tones } = this;
    pen.fillStyle = tones.paper;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1;
    pen.beginPath();
    pen.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    pen.fill();
    pen.stroke();
    pen.fillStyle = tones.ink;
    pen.beginPath();
    pen.moveTo(point.x, point.y);
    pen.arc(point.x, point.y, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * p);
    pen.closePath();
    pen.fill();
  }

  private coins(motion: Motion): void {
    const { width: w, height: h, model } = this;
    const radius = (this.phone ? 9 : 16) * motion.biasCoin;
    const x = this.phone ? .81 : .80;
    const y = this.phone ? .14 : .05;
    const gap = this.phone ? .08 : .045;
    this.coin({ x: w * (x - gap), y: h * y }, radius, model.bias.p);
    this.coin({ x: w * (x + gap), y: h * y }, radius, model.bias.p);
    this.text(this.phone ? 'PAIR p=3/4' : 'BIASED PAIR: p=3/4', w * x, h * y + radius + 10, this.phone ? 8 : 10, true);
    const grid = this.fullGrid(motion);
    const fair = { x: this.phone ? w * .81 : grid.x + grid.side / 2 + 102, y: h * (this.phone ? .035 : .12) };
    this.coin(fair, radius * .7, model.fair.p);
    this.text('FAIR p=1/2', fair.x, fair.y + radius * .7 + 9, this.phone ? 7 : 9, true);
  }
}

export function createCoinMatrixFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new CoinMatrixFilm(root, context);
}

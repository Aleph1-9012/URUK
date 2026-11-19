import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { buildThreeOfSevenModel, type OverlapPair } from './math';
import { drawThreeOfSevenPanels, layoutSlots } from './panels';
import { motionAt } from './story';

type Motion = ReturnType<typeof motionAt>;

type Square = { x: number; y: number; side: number };

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function between(a: Square, b: Square, amount: number): Square {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount), side: mix(a.side, b.side, amount) };
}

class ThreeOfSevenFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly model = buildThreeOfSevenModel();

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

  private text(value: string, x: number, y: number, size: number, math = false): void {
    drawText(this.pen, value, x, y, { size, family: math ? 'math' : 'type', color: this.tones.ink, paper: this.tones.paper });
  }

  private opening(): Square {
    const side = Math.min(this.width * (this.phone ? .57 : .35), this.height * .33);

    return { x: this.width * (this.phone ? .07 : .16), y: this.height * .105, side };
  }

  private primeTile(index: number): Square {
    const side = Math.min(this.width * .105, this.height * .09);

    return { x: this.width * (this.phone ? .205 : .18) - side / 2, y: this.height * (.13 + index * .14) - side / 2, side };
  }

  private sixTable(): Square {
    const side = Math.min(this.width * (this.phone ? .57 : .29), this.height * (this.phone ? .255 : .29));

    return { x: this.width * (this.phone ? .065 : .13), y: this.height * .065, side };
  }

  private cell(square: Square, probability: number, lineAmount: number, dotsAmount: number): void {
    const { pen, tones } = this;
    const { x, y, side } = square;

    if (side <= 0 || lineAmount <= 0) return;

    pen.strokeStyle = tones.ink;
    pen.lineWidth = .55;
    pen.beginPath();
    const extent = Math.min(1, lineAmount) * 4;
    const corners = [[x, y], [x + side, y], [x + side, y + side], [x, y + side], [x, y]] as const;

    for (let edge = 0; edge < 4; edge++) {
      const start = corners[edge];
      const end = corners[edge + 1];

      if (!start || !end) throw new Error('Every cell edge needs its two corners.');

      const progress = clamp(extent - edge);
      pen.moveTo(start[0], start[1]);
      pen.lineTo(mix(start[0], end[0], progress), mix(start[1], end[1], progress));
    }

    pen.stroke();
    pen.fillStyle = tones.ink;
    pen.beginPath();
    const dots = Math.round(probability * 24 * dotsAmount);

    for (let index = 0; index < dots; index++) {
      const slot = index * 11 % 24;
      const px = x + ((slot % 6) + .5) * side / 6;
      const py = y + (Math.floor(slot / 6) + .5) * side / 4;
      const radius = side * .033;
      pen.moveTo(px + radius, py);
      pen.arc(px, py, radius, 0, Math.PI * 2);
    }

    pen.fill();
  }

  private grid(square: Square, pair: OverlapPair, lines = 1, dots = 1): void {
    const dimension = pair.values.length;
    const side = square.side / dimension;

    for (let row = 0; row < dimension; row++) {
      for (let column = 0; column < dimension; column++) {
        const probability = pair.values[row]?.[column];

        if (probability === undefined) throw new Error('A displayed cell needs its live overlap probability.');

        const index = row * dimension + column;
        this.cell({ x: square.x + column * side, y: square.y + row * side, side }, probability, clamp(lines * dimension * dimension - index), dots);
      }
    }
  }

  // Cells move and split between two actual tables. The intervening layout is
  // presentation choreography, never a basis in a fractional dimension.
  private morph(square: Square, from: OverlapPair, to: OverlapPair, amount: number): void {
    if (amount === 0) {
      this.grid(square, from);
      return;
    }

    if (amount === 1) {
      this.grid(square, to);
      return;
    }

    const sourceDimension = from.values.length;
    const targetDimension = to.values.length;
    const sourceSide = square.side / sourceDimension;
    const targetSide = square.side / targetDimension;

    for (let row = 0; row < targetDimension; row++) {
      for (let column = 0; column < targetDimension; column++) {
        const oldRow = Math.min(sourceDimension - 1, row);
        const oldColumn = Math.min(sourceDimension - 1, column);
        const sourceProbability = from.values[oldRow]?.[oldColumn];
        const targetProbability = to.values[row]?.[column];

        if (sourceProbability === undefined || targetProbability === undefined) throw new Error('A moving cell needs both endpoint tables.');

        const carried = row < sourceDimension && column < sourceDimension;
        const start = { x: square.x + (oldColumn + .5) * sourceSide, y: square.y + (oldRow + .5) * sourceSide };
        const end = { x: square.x + (column + .5) * targetSide, y: square.y + (row + .5) * targetSide };
        const side = carried ? mix(sourceSide, targetSide, amount) : targetSide * amount;
        const centerX = mix(start.x, end.x, amount);
        const centerY = mix(start.y, end.y, amount);
        this.cell({ x: centerX - side / 2, y: centerY - side / 2, side }, mix(sourceProbability, targetProbability, amount), 1, 1);
      }
    }
  }

  private firstPair(kind: 'stage2' | 'stage3' | 'six'): OverlapPair {
    const pair = this.model[kind].pairs[0];

    if (!pair) throw new Error('The carried table needs the first pair of constructed bases.');

    return pair;
  }

  private outcomes(motion: Motion, square: Square): void {
    if (motion.rowLift === 0 || motion.primeCarry === 1) return;

    const { pen, width: w, height: h, tones } = this;
    const dimension = motion.dimensionThree === 1 ? 3 : 2;
    const source = dimension === 3 ? this.firstPair('stage3') : this.firstPair('stage2');
    const probabilities = source.values[0];

    if (!probabilities) throw new Error('The equal-outcome bars need the first measured row.');

    if (motion.primeCarry === 0 && (motion.dimensionThree === 0 || motion.dimensionThree === 1)) {
      const right = square.x + square.side;
      const bottom = square.y + square.side / dimension;
      drawLine(pen, square.x - 3, square.y - 3, right + 3, square.y - 3, tones.ink, 1.2);
      drawLine(pen, right + 3, square.y - 3, right + 3, bottom + 3, tones.ink, 1.2);
      drawLine(pen, right + 3, bottom + 3, square.x - 3, bottom + 3, tones.ink, 1.2);
      drawLine(pen, square.x - 3, bottom + 3, square.x - 3, square.y - 3, tones.ink, 1.2);
    }

    const withdrawing = 1 - motion.primeCarry;
    const lift = motion.rowLift;
    const centerX = w * (this.phone ? .81 : .72);
    const top = h * .16;
    const pitch = h * .085;
    const unit = this.phone ? w * .20 : w * .25;

    for (let index = 0; index < dimension; index++) {
      const probability = probabilities[index];

      if (probability === undefined) throw new Error('Every outcome bar needs a live probability.');

      const sourceX = square.x + (index + .5) * square.side / dimension;
      const sourceY = square.y + square.side / (2 * dimension);
      const x = mix(sourceX, centerX, lift);
      const y = mix(sourceY, top + index * pitch, lift);
      const bar = unit * probability * withdrawing;
      drawLine(pen, x - bar / 2, y, x + bar / 2, y, tones.ink, mix(.9, 3, motion.outcomeBars));

      if (lift === 1 && motion.dimensionThree !== 0 && motion.dimensionThree !== 1) continue;

      if (lift === 1 && motion.primeCarry === 0) this.text(`1/${dimension}`, centerX, y + 15, this.phone ? 11 : 14, true);
    }

    if (lift === 1 && motion.primeCarry === 0) this.text('ONE ROW', centerX, h * .09, this.phone ? 8 : 10);
  }

  private primeSets(motion: Motion): void {
    if (motion.primeCarry === 0 || motion.primeRetire === 1) return;

    const { width: w, height: h, pen, tones } = this;
    const amount = motion.primeSets * (1 - motion.primeRetire);
    const start = w * .34;
    const end = w * .90;

    for (const [index, family] of this.model.primeFamilies.entries()) {
      const y = h * (.13 + index * .14);
      const emerging = clamp(amount * 4 - index);

      if (emerging === 0) continue;

      if (motion.scene === 'primes') this.text(`d = ${family.dimension}`, w * .075, y, this.phone ? 12 : 16, true);
      drawLine(pen, w * .29, y + (this.phone ? 17 : 22), mix(w * .29, w * .93, emerging), y + (this.phone ? 17 : 22), tones.ink, .5);
      const radius = this.phone ? Math.min(5, (end - start) / 23) : 7;

      for (let slot = 0; slot < family.count; slot++) {
        const grow = clamp(emerging * family.count - slot);

        if (grow === 0) continue;

        const x = start + slot / (family.upperBound - 1) * (end - start);
        pen.fillStyle = tones.ink;
        pen.beginPath();
        pen.arc(x, y, radius * grow, 0, Math.PI * 2);
        pen.fill();
      }

      if (emerging === 1 && motion.scene === 'primes') this.text(`${family.count} BASES`, w * .62, y + (this.phone ? 30 : 38), this.phone ? 8 : 10);
    }

    if (motion.primePowerTicks > 0 && motion.scene === 'primes') {
      this.text('4 · 8 · 9', w * .5, h * .70, this.phone ? 14 : 18, true);
      this.text('KNOWN COMPLETE · NOT DRAWN', w * .5, h * (this.phone ? .76 : .735), this.phone ? 8 : 10);
    }
  }

  private tables(motion: Motion): void {
    const opening = this.opening();
    const prime = this.primeTile(1);
    const six = this.sixTable();
    const square = between(between(opening, prime, motion.primeCarry), six, motion.sixCarry);

    if (motion.dimensionThree === 0) this.grid(square, this.firstPair('stage2'), motion.table, motion.stipple);
    else if (motion.sixCarry === 0) this.morph(square, this.firstPair('stage2'), this.firstPair('stage3'), motion.dimensionThree);
    else this.morph(square, this.firstPair('stage3'), this.firstPair('six'), motion.sixCarry);

    this.outcomes(motion, square);
    this.primeSets(motion);

    if (motion.scene === 'six' && motion.sixCarry < 1) {
      this.text('DISPLAY MORPH · TO d = 6', this.width * .5, this.height * .32, this.phone ? 9 : 11, true);
    } else if (motion.dimensionThree > 0 && motion.dimensionThree < 1) {
      this.text('DISPLAY MORPH · TO d = 3', this.width * .38, this.height * .455, this.phone ? 9 : 11, true);
    }

    if (motion.primeCarry === 0) {
      const changing = motion.dimensionThree > 0 && motion.dimensionThree < 1;

      if (!changing) this.labels.place(motion.dimensionThree === 1 ? 'third' : 'half', square.x + square.side / 2, square.y + square.side + this.height * .045);
    }

    if (motion.triple === 0) return;

    const { width: w, height: h } = this;
    this.text('BASES 1–2', six.x + six.side / 2, six.y - (this.phone ? 15 : 18), this.phone ? 8 : 10);
    this.labels.place('sixth', this.phone ? w * .695 : six.x + six.side + w * .07, six.y + six.side / 2);
    const side = Math.min(w * (this.phone ? .20 : .16), h * (this.phone ? .09 : .12));
    const x = w * (this.phone ? .755 : .69);

    for (let index = 1; index < this.model.six.pairs.length; index++) {
      const pair = this.model.six.pairs[index];

      if (!pair) throw new Error('The triple must expose all three pair tables.');

      const amount = clamp(motion.triple * 2 - (index - 1));

      if (amount === 0) continue;

      const target = { x, y: h * (this.phone ? .065 + (index - 1) * .16 : .065 + (index - 1) * .225), side };
      const source = { x: six.x + six.side / 2, y: six.y + six.side / 2, side: 0 };
      const box = between(source, target, amount);
      this.grid(box, pair);

      if (amount === 1) {
        this.text(`BASES ${pair.first + 1}–${pair.second + 1}`, target.x + side / 2, target.y - (this.phone ? 13 : 14), this.phone ? 7.5 : 9);
        this.text('1/6', this.phone ? target.x + side + 11 : target.x + side / 2, this.phone ? target.y + side / 2 : target.y + side + 12, this.phone ? 10 : 11, true);
      }
    }
  }

  private slots(motion: Motion): void {
    if (motion.slots === 0) return;

    const { pen, width: w, height: h, tones } = this;
    const row = layoutSlots(w, h);
    const pitch = (row.slotRight - row.slotLeft) / 6;
    const radius = this.phone ? 10 : 14;

    for (let slot = 0; slot < this.model.six.upperBound; slot++) {
      const amount = clamp(motion.slots * this.model.six.upperBound - slot);

      if (amount === 0) continue;

      const x = row.slotLeft + slot * pitch;
      pen.lineWidth = 1;
      pen.strokeStyle = tones.ink;
      pen.fillStyle = slot < this.model.six.count ? tones.ink : tones.paper;
      pen.beginPath();
      pen.arc(x, row.slotY, radius * amount, 0, Math.PI * 2);
      pen.fill();
      pen.stroke();

      if (amount === 1 && !(slot === 5 && motion.weiner > 0)) drawText(pen, String(slot + 1), x, row.slotY, { size: this.phone ? 12 : 16, family: 'math', color: slot < this.model.six.count ? tones.paper : tones.ink });
    }

    if (motion.zauner > 0) {
      const y = row.slotY - radius - (this.phone ? 10 : 14);
      const end = mix(row.slotLeft - radius, row.slotLeft + pitch * 2 + radius, motion.zauner);
      drawLine(pen, row.slotLeft - radius, y, end, y, tones.ink, .9);
      drawLine(pen, row.slotLeft - radius, y, row.slotLeft - radius, y + 4, tones.ink, .9);

      if (motion.zauner === 1) drawLine(pen, end, y, end, y + 4, tones.ink, .9);
    }

    if (motion.noFour > 0) {
      const first = row.slotLeft + pitch * 3 - radius;
      const last = row.slotRight + radius;
      drawLine(pen, first, row.noFourBarY, mix(first, last, motion.noFour), row.noFourBarY, tones.blue, 2.4, [5, 3]);
      drawLine(pen, first, row.noFourBarY - 4, first, row.noFourBarY + 4, tones.blue, 2.4);

      if (motion.noFour === 1) drawLine(pen, last, row.noFourBarY - 4, last, row.noFourBarY + 4, tones.blue, 2.4);
    }

    if (motion.noSeven > 0) {
      const y = row.noSevenBarY;
      const x = row.slotRight;
      drawLine(pen, x - radius, y, x - radius + radius * 2 * motion.noSeven, y, tones.blue, 2.5);

      if (motion.noSeven === 1) {
        drawLine(pen, x - radius, y - 4, x - radius, y + 4, tones.blue, 2);
        drawLine(pen, x + radius, y - 4, x + radius, y + 4, tones.blue, 2);
      }
    }

    if (motion.weiner > 0) {
      const x = row.slotLeft + pitch * 5;
      pen.strokeStyle = tones.ink;
      pen.lineWidth = .6;
      pen.beginPath();

      for (let index = -2; index <= 2; index++) {
        const dx = index * radius / 3;
        const half = Math.sqrt(radius * radius - dx * dx);
        pen.moveTo(x + dx, row.slotY - half);
        pen.lineTo(x + dx, row.slotY + half);
      }

      pen.stroke();
      // Knock out only the numeral, retaining the hatching as an implication
      // marker; it is not a verdict on an independently tested sixth basis.
      this.text('6', x, row.slotY, this.phone ? 12 : 16, true);
    }
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
    this.tables(motion);
    this.slots(motion);
    drawThreeOfSevenPanels(pen, w, h, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }
}

export function createThreeOfSevenFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new ThreeOfSevenFilm(root, context);
}

import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { buildChoicePiecesModel, type ChoiceTargets } from './math';
import { drawChoicePiecesPanels } from './panels';
import { motionAt } from './story';

type Point = { x: number; y: number };

type Box = Point & { width: number; height: number };

type Motion = ReturnType<typeof motionAt>;

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function carried(from: Point, to: Point, amount: number): Point {
  return { x: mix(from.x, to.x, amount), y: mix(from.y, to.y, amount) };
}

class ChoicePiecesFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly model = buildChoicePiecesModel();
  private readonly outsideIndex = this.model.assignments.findIndex(assignment => assignment.to.every((point, index) => point === this.model.exampleOutside[index]));

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 4, vertical: 4 });

    if (this.outsideIndex < 0) throw new Error('The carried outside example must have its own enumerated board cell.');
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

  private spine(motion: Motion) {
    const { width: w, height: h } = this;
    const parked = motion.boardFold;
    const node = motion.diagramCarry;
    const x = mix(w * mix(this.phone ? .50 : .25, this.phone ? .35 : .32, parked), w * .30, node);
    const y = mix(h * mix(this.phone ? .17 : .32, this.phone ? .14 : .39, parked), h * (this.phone ? .085 : .16), node);
    const gap = mix(w * mix(this.phone ? .14 : .07, this.phone ? .075 : .035, parked), w * (this.phone ? .035 : .037), node);
    const height = mix(h * mix(this.phone ? .12 : .18, this.phone ? .10 : .09, parked), h * (this.phone ? .032 : .045), node);

    return { x, y, gap, height };
  }

  private point(index: number, motion: Motion): Point {
    const spine = this.spine(motion);

    return { x: spine.x + (index - (this.model.points - 1) / 2) * spine.gap, y: spine.y };
  }

  private piece(index: number, motion: Motion): Box {
    const points = this.model.pieces[index];

    if (!points) throw new Error('Every displayed piece must be a member of the retained partition.');

    const first = points[0];
    const last = points.at(-1);

    if (first === undefined || last === undefined) throw new Error('Partition pieces must be nonempty.');

    const spine = this.spine(motion);
    const left = this.point(first, motion);
    const right = this.point(last, motion);

    return { x: (left.x + right.x) / 2, y: spine.y, width: right.x - left.x + spine.gap * .80, height: spine.height };
  }

  private origin(index: number, motion: Motion): Point {
    const piece = this.piece(index, motion);

    return { x: piece.x, y: piece.y + piece.height / 2 + (this.phone ? 13 : 23) };
  }

  private hatch(box: Box, index: number, amount: number): void {
    if (amount <= 0) return;

    const { pen, tones } = this;
    const left = box.x - box.width / 2;
    const top = box.y - box.height / 2;
    const height = box.height * amount;
    pen.save();
    pen.strokeStyle = tones.ink;
    pen.lineWidth = .45;
    pen.beginPath();
    pen.rect(left, top, box.width, height);
    pen.clip();
    pen.beginPath();
    const spacing = this.phone ? 7 + index * 2 : 10 + index * 3;

    for (let offset = -height; offset <= box.width + height; offset += spacing) {
      const direction = index === 1 ? -1 : 1;
      pen.moveTo(left + offset, top);
      pen.lineTo(left + offset + direction * height, top + height);

      if (index === 2) {
        pen.moveTo(left + offset, top);
        pen.lineTo(left + offset - height, top + height);
      }
    }

    pen.stroke();
    pen.restore();
    pen.lineWidth = .9;
    pen.strokeStyle = tones.ink;
    pen.strokeRect(left, top, box.width, height);
  }

  private pieces(motion: Motion): void {
    const { pen, tones, model } = this;

    for (let index = 0; index < model.pieces.length; index++) {
      this.hatch(this.piece(index, motion), index, clamp(motion.pieces * model.pieces.length - index));
    }

    for (let index = 0; index < model.points; index++) {
      const point = this.point(index, motion);
      const amount = clamp(motion.points * model.points - index);
      pen.fillStyle = tones.ink;
      pen.beginPath();
      pen.arc(point.x, point.y, mix(this.phone ? 2.7 : 4, 1.5, motion.diagramCarry) * amount, 0, Math.PI * 2);
      pen.fill();

      const movingOutside = motion.outside > 0 && motion.outside < 1;

      if (amount === 1 && motion.diagramCarry === 0 && !movingOutside) this.text(String(index), point.x, point.y - (this.phone ? 12 : 16), this.phone ? 9 : 12, true);
    }

    if (motion.pieces === 1 && motion.diagramCarry === 0) {
      for (let index = 0; index < model.pieces.length; index++) {
        const source = this.origin(index, motion);
        if (this.phone) {
          const piece = this.piece(index, motion);
          drawText(this.pen, `P${index + 1}`, source.x, piece.y - piece.height / 2 - 10, { size: 9, color: this.tones.ink, family: 'math' });
        }
        else this.text(`P${index + 1}`, source.x, source.y + 17, 12, true);
      }
    }
  }

  private assignmentTargets(motion: Motion): Point[] {
    const choices = this.model.insideChoices;
    const clock = motion.insideCycle * (choices.length - 1);
    const index = Math.floor(clock);
    const first = choices[index];
    const next = choices[Math.min(choices.length - 1, index + 1)];

    if (!first || !next) throw new Error('Every inside-choice step must use an enumerated choice function.');

    const change = clamp((clock - index - .65) / .35);

    return first.map((target, piece) => {
      const nextTarget = next[piece];
      const outside = this.model.exampleOutside[piece];

      if (nextTarget === undefined || outside === undefined) throw new Error('An assignment needs exactly one target per piece.');

      const inside = carried(this.point(target, motion), this.point(nextTarget, motion), change);

      const position = carried(inside, this.point(outside, motion), motion.outside);

      return { x: position.x, y: position.y + (piece - 1) * this.height * .04 * Math.sin(Math.PI * motion.outside) };
    });
  }

  private arrow(from: Point, to: Point, bend: Point, amount = 1, head = true): void {
    if (amount <= 0) return;

    const { pen, tones } = this;
    const control = { x: (from.x + to.x) / 2 + bend.x, y: (from.y + to.y) / 2 + bend.y };
    const end = {
      x: (1 - amount) ** 2 * from.x + 2 * (1 - amount) * amount * control.x + amount ** 2 * to.x,
      y: (1 - amount) ** 2 * from.y + 2 * (1 - amount) * amount * control.y + amount ** 2 * to.y,
    };
    const partial = carried(from, control, amount);
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.1;
    pen.beginPath();
    pen.moveTo(from.x, from.y);
    pen.quadraticCurveTo(partial.x, partial.y, end.x, end.y);
    pen.stroke();

    if (head && amount === 1) this.arrowhead(end, { x: end.x - partial.x, y: end.y - partial.y }, this.phone ? 4 : 5);
  }

  private arrowhead(tip: Point, direction: Point, size: number): void {
    const angle = Math.atan2(direction.y, direction.x);
    const { pen, tones } = this;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.1;
    pen.beginPath();
    pen.moveTo(tip.x - Math.cos(angle - .45) * size, tip.y - Math.sin(angle - .45) * size);
    pen.lineTo(tip.x, tip.y);
    pen.lineTo(tip.x - Math.cos(angle + .45) * size, tip.y - Math.sin(angle + .45) * size);
    pen.stroke();
  }

  private picks(motion: Motion): void {
    if (motion.insideEnter === 0 || motion.boardSetup > 0) return;

    const targets = this.assignmentTargets(motion);
    const radius = this.phone ? 6 : 8;

    for (const [index, target] of targets.entries()) {
      const source = this.origin(index, motion);
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.hypot(dx, dy);
      const tip = { x: target.x - dx / distance * (radius + 1), y: target.y - dy / distance * (radius + 1) };
      this.arrow(source, tip, { x: (index - 1) * this.width * .035, y: this.height * (this.phone ? .045 : .065) }, motion.insideEnter);
      this.pen.strokeStyle = this.tones.ink;
      this.pen.lineWidth = 1.2;
      this.pen.beginPath();
      this.pen.arc(target.x, target.y, radius * motion.insideEnter, 0, Math.PI * 2);
      this.pen.stroke();
    }
  }

  private boardBox(motion: Motion): Box {
    const { width: w, height: h } = this;
    const width = w * (this.phone ? .50 : .40);
    const height = width * 10 / 12;
    const center = this.phone ? { x: w * .5, y: h * .43 + height / 2 } : { x: w * .76, y: h * .42 };
    const parked = { x: w * (this.phone ? .84 : .075), y: h * (this.phone ? .29 : .10) };
    const miniature = w * .13;
    const shrink = clamp(motion.boardFold / .55);
    const travel = clamp((motion.boardFold - .55) / .45);
    let point = carried(center, parked, travel);

    if (!this.phone) {
      if (travel < .25) point = { x: center.x, y: mix(center.y, h * .20, travel / .25) };
      else if (travel < .85) point = { x: mix(center.x, parked.x, (travel - .25) / .60), y: h * .20 };
      else point = { x: parked.x, y: mix(h * .20, parked.y, (travel - .85) / .15) };
    }

    return { ...point, width: mix(width, miniature, shrink), height: mix(height, miniature * 10 / 12, shrink) };
  }

  private boardCell(index: number, motion: Motion): Box {
    const board = this.boardBox(motion);
    const side = board.width / 12;

    return { x: board.x + (index % 12 + .5 - 6) * side, y: board.y + (Math.floor(index / 12) + .5 - 5) * side, width: side * .83, height: side * .83 };
  }

  private tile(index: number, motion: Motion): void {
    const item = this.model.assignments[index];

    if (!item) throw new Error('Every board cell must encode its lexicographic injection.');

    const cell = this.boardCell(index, motion);
    const { pen, tones } = this;
    pen.strokeStyle = tones.ink;
    pen.fillStyle = tones.ink;
    pen.lineWidth = motion.boardFold > .5 ? .35 : .65;

    if (item.allInside) pen.fillRect(cell.x - cell.width / 2, cell.y - cell.height / 2, cell.width, cell.height);
    else pen.strokeRect(cell.x - cell.width / 2, cell.y - cell.height / 2, cell.width, cell.height);
  }

  private arrowTile(targets: ChoiceTargets, index: number, amount: number, motion: Motion): void {
    const cell = this.boardCell(index, motion);
    const corners = [
      { x: cell.x - cell.width / 2, y: cell.y - cell.height / 2 },
      { x: cell.x + cell.width / 2, y: cell.y - cell.height / 2 },
      { x: cell.x + cell.width / 2, y: cell.y + cell.height / 2 },
      { x: cell.x - cell.width / 2, y: cell.y + cell.height / 2 },
    ];

    for (const [piece, target] of targets.entries()) {
      const first = corners[piece];
      const next = corners[piece + 1];

      if (!first || !next) throw new Error('Three carried arrows become three successive tile edges.');

      const source = this.origin(piece, motion);
      const destination = this.point(target, motion);
      const dx = destination.x - source.x;
      const dy = destination.y - source.y;
      const distance = Math.hypot(dx, dy);
      const radius = this.phone ? 6 : 8;
      const tip = { x: destination.x - dx / distance * (radius + 1), y: destination.y - dy / distance * (radius + 1) };
      const from = carried(source, first, amount);
      const to = carried(tip, next, amount);
      this.arrow(from, to, { x: (piece - 1) * this.width * .035 * (1 - amount), y: this.height * (this.phone ? .045 : .065) * (1 - amount) }, 1, amount < .8);

      if (amount < 1) {
        const ring = carried(destination, next, amount);
        this.pen.beginPath();
        this.pen.arc(ring.x, ring.y, radius * (1 - amount), 0, Math.PI * 2);
        this.pen.stroke();
      }
    }
  }

  private board(motion: Motion): void {
    if (motion.boardSetup === 0) return;

    if (motion.boardSetup < 1) {
      this.arrowTile(this.model.exampleOutside, this.outsideIndex, motion.boardSetup, motion);

      return;
    }

    this.tile(this.outsideIndex, motion);
    const scan = motion.boardFill < .35 ? motion.boardFill / .35 * 3 : 3 + (motion.boardFill - .35) / .65 * (this.model.assignments.length - 3);
    const complete = Math.min(this.model.assignments.length, Math.floor(scan));

    for (let index = 0; index < complete; index++) {
      if (index !== this.outsideIndex) this.tile(index, motion);
    }

    if (complete < this.model.assignments.length) {
      const current = this.model.assignments[complete];

      if (!current) throw new Error('The live scan needs its exact current assignment.');

      if (complete !== this.outsideIndex) this.arrowTile(current.to, complete, scan - complete, motion);
      const count = complete + Number(this.outsideIndex >= complete);
      let inside = 0;

      for (const index of this.model.insideIndices) {
        if (index < complete) inside++;
      }

      this.text(`${count} / ${this.model.counts.injections} SEEN · ${inside} FROM INSIDE`, this.width * (this.phone ? .5 : .76), this.height * (this.phone ? .82 : .74), this.phone ? 9 : 11, true);
    }
  }

  private question(motion: Motion): void {
    if (motion.question === 0) return;

    const { width: w, height: h, pen, tones } = this;
    const parked = motion.boardSetup;
    const y = mix(this.phone ? .61 : .70, this.phone ? .35 : .10, parked) * h;
    const shift = this.phone ? .26 * motion.boardFold : 0;
    const left = (mix(this.phone ? .24 : .64, this.phone ? .50 : .62, parked) - shift) * w;
    const right = (mix(this.phone ? .76 : .88, this.phone ? .86 : .90, parked) - shift) * w;
    const original = [{ x: left + 15, y }, { x: mix(left, right, .35), y }, { x: mix(left, right, .65), y }, { x: right - 15, y }];
    const final = [
      { x: w * .42, y: h * (this.phone ? .25 : .43) },
      { x: w * (this.phone ? .61 : .52), y: h * (this.phone ? .25 : .43) },
      { x: w * (this.phone ? .61 : .52), y: h * (this.phone ? .11 : .19) },
      { x: w * (this.phone ? .50 : .45), y: h * (this.phone ? .11 : .19) },
    ];
    const points = original.map((point, index) => {
      const target = final[index];

      if (!target) throw new Error('The same four arrow vertices carry into the dependency diagram.');

      return carried(point, target, motion.questionCarry);
    });
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1;
    pen.setLineDash([4, 3]);
    pen.beginPath();
    let length = 0;

    for (let index = 1; index < points.length; index++) {
      const from = points[index - 1];
      const to = points[index];

      if (!from || !to) throw new Error('Every return-arrow segment needs both endpoints.');

      length += Math.hypot(to.x - from.x, to.y - from.y);
    }

    let remaining = length * motion.question;
    const start = points[0];

    if (!start) throw new Error('The return arrow needs its first vertex.');

    pen.moveTo(start.x, start.y);

    for (let index = 1; index < points.length && remaining > 0; index++) {
      const from = points[index - 1];
      const to = points[index];

      if (!from || !to) throw new Error('Every return-arrow segment needs both endpoints.');

      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const portion = distance === 0 ? 1 : Math.min(1, remaining / distance);
      const end = carried(from, to, portion);
      pen.lineTo(end.x, end.y);
      remaining -= distance;
    }

    pen.stroke();
    pen.setLineDash([]);
    const last = points.at(-1);
    const before = points.at(-2);

    if (!last || !before) throw new Error('An implication arrow needs its final segment.');

    if (motion.question === 1) this.arrowhead(last, { x: last.x - before.x, y: last.y - before.y }, this.phone ? 4 : 5);

    if (motion.question === 1 && motion.claimCut < 1) {
      const start = { x: (left + right) / 2, y: y - 15 };
      const target = { x: w * (this.phone ? .68 : .565), y: h * (this.phone ? .18 : .31) };
      const mark = carried(start, target, motion.questionCarry);
      this.text('?', mark.x, mark.y, this.phone ? 13 : 18, true);
    }

    if (motion.claimCut > 0) {
      const x = w * (this.phone ? .61 : .52);
      const y = h * (this.phone ? .18 : .31);
      const half = (this.phone ? 12 : 17) * motion.claimCut;
      drawLine(pen, x - half, y + half * .45, x + half, y - half * .45, tones.blue, 2.6);
    }
  }

  private sheet(point: Point, width: number, height: number, crossed: number): void {
    const { pen, tones } = this;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = .9;
    pen.fillStyle = tones.paper;
    pen.fillRect(point.x - width / 2, point.y - height / 2, width, height);
    pen.strokeRect(point.x - width / 2, point.y - height / 2, width, height);
    drawLine(pen, point.x - width * .28, point.y - height * .20, point.x + width * .28, point.y - height * .20, tones.ink, .6);
    drawLine(pen, point.x - width * .28, point.y, point.x + width * .28, point.y, tones.ink, .6);

    if (crossed > 0) drawLine(pen, point.x - width * .70, point.y + height * .25, point.x + width * mix(-.7, .7, crossed), point.y - height * .25 * crossed, tones.ink, 1.2);
  }

  private dates(motion: Motion): void {
    if (motion.dateLine === 0) return;

    const { width: w, height: h, pen, tones } = this;
    const y = h * (this.phone ? .57 : .72);
    const carry = motion.diagramCarry;
    const park = { x: w * (this.phone ? .84 : .53), y: h * (this.phone ? .16 : .79) };
    const start = carried({ x: w * .10, y }, park, carry);
    const end = carried({ x: w * .93, y }, park, carry);
    drawLine(pen, start.x, start.y, mix(start.x, end.x, motion.dateLine), mix(start.y, end.y, motion.dateLine), tones.ink);

    if (carry === 0) {
      drawLine(pen, w * .15, y - 5, w * .15, y + 5, tones.ink);
      this.text('1902', w * .15, y + 17, this.phone ? 10 : 14, true);
      drawLine(pen, w * .29 - 4, y + 4, w * .29, y - 4, tones.ink);
      drawLine(pen, w * .29 + 2, y + 4, w * .29 + 6, y - 4, tones.ink);

      if (motion.withdrawnSheets > 0) this.text('2025/26', w * .55, y + 17, this.phone ? 9 : 12, true);
      if (motion.newSheet > 0) this.text('24 SEP', w * .86, y + 17, this.phone ? 9 : 12, true);
    }

    for (let index = 0; index < 3; index++) {
      const amount = clamp(motion.withdrawnSheets * 3 - index);

      if (amount === 0) continue;

      const point = carried({ x: w * (.44 + index * .11), y: y - (this.phone ? 21 : 31) }, { x: park.x - 12 + index * 5, y: park.y - 12 }, carry);
      this.sheet(point, mix(this.phone ? 10 : 15, 4, carry) * amount, mix(this.phone ? 18 : 26, 6, carry) * amount, clamp(motion.withdrawnBars * 3 - index));
    }

    if (motion.newSheet > 0) {
      const point = carried({ x: w * .86, y: y - (this.phone ? 24 : 35) }, park, carry);
      const size = motion.newSheet;
      this.sheet(point, mix(this.phone ? 16 : 23, this.phone ? 12 : 16, carry) * size, mix(this.phone ? 25 : 34, this.phone ? 18 : 23, carry) * size, 0);

      if (motion.readerMark > 0) {
        const eye = { x: point.x, y: point.y + (this.phone ? 29 : 34) };
        const width = (this.phone ? 9 : 13) * motion.readerMark;
        pen.strokeStyle = tones.ink;
        pen.lineWidth = .9;
        pen.beginPath();
        pen.moveTo(eye.x - width, eye.y);
        pen.quadraticCurveTo(eye.x, eye.y - width * .8, eye.x + width, eye.y);
        pen.quadraticCurveTo(eye.x, eye.y + width * .8, eye.x - width, eye.y);
        pen.stroke();
        pen.fillStyle = tones.ink;
        pen.beginPath();
        pen.arc(eye.x, eye.y, width * .22, 0, Math.PI * 2);
        pen.fill();
      }
    }
  }

  private diagram(motion: Motion): void {
    if (motion.nodes === 0) return;

    const { width: w, height: h, pen, tones } = this;
    const nodes = [
      { y: this.phone ? .11 : .19, width: this.phone ? .40 : .30, height: this.phone ? .14 : .18 },
      { y: this.phone ? .25 : .43, width: .24, height: this.phone ? .07 : .10 },
      { y: this.phone ? .39 : .67, width: .28, height: this.phone ? .08 : .12 },
    ];
    pen.strokeStyle = tones.ink;
    pen.lineWidth = .9;

    for (const [index, node] of nodes.entries()) {
      const amount = clamp(motion.nodes * nodes.length - index);

      if (amount > 0) pen.strokeRect(w * (.30 - node.width / 2), h * (node.y - node.height / 2), w * node.width, h * node.height * amount);
    }

    for (let index = 0; index < nodes.length - 1; index++) {
      const first = nodes[index];
      const second = nodes[index + 1];

      if (!first || !second) throw new Error('The known dependency arrows connect successive choice principles.');

      const amount = clamp(motion.knownArrows * 2 - index);
      this.arrow({ x: w * .30, y: h * (first.y + first.height / 2) + 2 }, { x: w * .30, y: h * (second.y - second.height / 2) - 3 }, { x: 0, y: 0 }, amount);
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
    this.pieces(motion);
    this.picks(motion);
    this.board(motion);
    this.dates(motion);
    this.diagram(motion);
    this.question(motion);
    drawChoicePiecesPanels(pen, w, h, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }
}

export function createChoicePiecesFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new ChoicePiecesFilm(root, context);
}

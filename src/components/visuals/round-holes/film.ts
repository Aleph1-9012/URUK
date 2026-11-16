import { mix, progress, smooth } from '../../../lib/animation';
import { line } from '../../plate/canvas/strokes';
import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { type Box, type Colors, type Point, text } from './drawing';
import { createHoleModel, derivativeAt, joukowski, type CantorDisc } from './math';
import { drawPanels } from './panels';
import { layout } from './story';

type Camera = { x: number; y: number; scale: number };

function flat(point: Point, camera: Camera): Point {
  return { x: camera.x + point.x * camera.scale, y: camera.y - point.y * camera.scale };
}

function mapTime(time: number): number {
  if (time < 10000) return 1 - smooth(time, 1500, 6500);
  if (time < 21750) return smooth(time, 10000, 12000);
  if (time < 59000) return 1 - smooth(time, 21750, 25300);
  if (time < 60500) return smooth(time, 59000, 60500);

  return 1 - smooth(time, 60500, 64000);
}

function compactTime(time: number): number {
  return smooth(time, 27750, 29750) * (1 - smooth(time, 59000, 60500)) + smooth(time, 65000, 66750);
}

export class RoundHolesFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly model = createHoleModel();
  private colors: Colors = PAGE_TONES;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 4 });
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.colors = tones;

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    const boxes = layout(this.width, this.height, time);
    const { pen, colors } = this;
    const compact = compactTime(time);
    const cards = smooth(time, 46000, 48000) * (1 - smooth(time, 59000, 60500));
    const scale = Math.min(boxes.stage.w, boxes.stage.h) / 10.8;
    const camera = {
      x: boxes.stage.x + boxes.stage.w * mix(.50, .26, compact),
      y: boxes.stage.y + boxes.stage.h * (mix(.49, .28, compact) + cards * .14),
      scale: scale * mix(1, .46, compact),
    };
    const stagePosition = 7 * smooth(time, 66600, 73500);
    const stageIndex = Math.floor(stagePosition);
    const stage = this.model.cantor[stageIndex];

    if (!stage) throw new Error('The Cantor picture has its declared stage.');

    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, this.width, this.height);
    pen.lineJoin = 'round';
    pen.lineCap = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();

    if (cards > 0) this.paperCards(boxes.stage, cards, boxes.tall);

    this.domain(camera, mapTime(time), smooth(time, 12000, 14250), Math.max(.035, smooth(time, 0, 1500)));

    if (time >= 1500 && compact < .25) this.rightAngle(camera, mapTime(time), boxes.tall);
    if (time >= 27750 && time < 60500) this.countable(boxes.stage, time, cards, boxes.tall);
    if (time >= 65000) this.cantor(boxes.stage, stagePosition, boxes.tall, smooth(time, 65000, 66600));
    if (time >= 59000) this.claimMark(boxes.stage, time, boxes.tall);

    if (time < 27750 || time >= 59000 && time < 65000) {
      text(pen, 't = ' + mapTime(time).toFixed(2) + ' · EXACT MAP', boxes.stage.x + boxes.stage.w / 2, boxes.stage.y + boxes.stage.h - 7, boxes.tall ? 9 : 13, boxes.stage.w - 12, colors);
    }

    drawPanels(pen, boxes.panel, time, colors, this.labels.place, boxes.tall, {
      angleError: this.model.audit.worstAngleError,
      cantorStage: stage.k,
      cantorCount: stage.holes,
      cantorTransition: stagePosition > stageIndex && stageIndex < 7,
      cantorForming: time < 66600,
      countableShown: Math.min(this.model.countable.length, Math.floor(progress(time, 29750, 35250) * this.model.countable.length)),
    });
    this.labels.endFrame();
  }

  private boundary(points: readonly Point[], camera: Camera, t: number, opening = 1): Path2D {
    const path = new Path2D();

    for (const [index, point] of points.entries()) {
      const model = opening === 1 ? point : { x: this.model.parameters.centre + (point.x - this.model.parameters.centre) * opening, y: point.y * opening };
      const mapped = flat(joukowski(model, t), camera);

      if (index === 0) path.moveTo(mapped.x, mapped.y);
      else path.lineTo(mapped.x, mapped.y);
    }

    path.closePath();

    return path;
  }

  private shade(path: Path2D, reverse: boolean, weight: number): void {
    const { pen, colors } = this;
    pen.fillStyle = colors.paper;
    pen.fill(path);
    pen.save();
    pen.clip(path);
    pen.lineWidth = .45;
    pen.strokeStyle = colors.muted;
    const span = this.width + this.height;

    for (let x = -this.height; x < span; x += 6) {
      if (reverse) line(pen, x, 0, x + this.height, this.height);
      else line(pen, x, this.height, x + this.height, 0);
    }

    pen.restore();
    pen.strokeStyle = colors.ink;
    pen.lineWidth = weight;
    pen.stroke(path);
  }

  private domain(camera: Camera, t: number, second: number, revealed: number): void {
    const { pen, colors, model } = this;
    pen.strokeStyle = colors.muted;
    pen.lineWidth = Math.min(.7, 1 / this.density);
    pen.beginPath();

    for (const [index, curve] of model.fullNet.entries()) {
      const amount = Math.max(0, Math.min(1, revealed * model.fullNet.length - index));

      if (amount === 0) continue;

      for (const run of curve.runs) {
        const count = Math.max(2, Math.ceil(amount * run.length));

        for (let point = 0; point < count; point++) {
          const source = run[point];

          if (!source) throw new Error('The net run retains each sampled point.');

          const mapped = flat(joukowski(source, t), camera);

          if (point === 0) pen.moveTo(mapped.x, mapped.y);
          else pen.lineTo(mapped.x, mapped.y);
        }
      }
    }

    pen.stroke();
    this.shade(this.boundary(model.hole1, camera, t), false, 1.3);

    if (second > 0) this.shade(this.boundary(model.hole2, camera, t, second), true, 1.3);
  }

  private rightAngle(camera: Camera, t: number, tall: boolean): void {
    const theta = Math.PI / 4;
    const z = { x: 2.6 * Math.cos(theta), y: 2.6 * Math.sin(theta) };
    const p = flat(joukowski(z, t), camera);
    const derivative = derivativeAt(z, t);
    const u = { x: derivative.x * Math.cos(theta) - derivative.y * Math.sin(theta), y: -(derivative.x * Math.sin(theta) + derivative.y * Math.cos(theta)) };
    const length = Math.hypot(u.x, u.y);
    const size = tall ? 6 : 9;
    const a = { x: u.x / length * size, y: u.y / length * size };
    const b = { x: -a.y, y: a.x };
    this.pen.strokeStyle = this.colors.ink;
    this.pen.lineWidth = 1;
    line(this.pen, p.x + a.x, p.y + a.y, p.x + a.x + b.x, p.y + a.y + b.y);
    line(this.pen, p.x + b.x, p.y + b.y, p.x + a.x + b.x, p.y + a.y + b.y);
    text(this.pen, '90°', p.x + 17, p.y - 14, tall ? 10 : 14, 38, this.colors);
  }

  private countable(box: Box, time: number, cards: number, tall: boolean): void {
    const { pen, colors } = this;
    const width = box.w * mix(.80, .35, cards);
    const right = box.x + box.w * mix(.92, .43, cards);
    const y = box.y + box.h * mix(.78, .70, cards);
    const scale = width * 6 / 7;
    const collapse = smooth(time, 36500, 40000);
    const returnToMap = 1 - smooth(time, 59000, 60500);
    const shown = progress(time, 29750, 35250) * this.model.countable.length;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = Math.min(.8, 1 / this.density);

    for (const [index, disc] of this.model.countable.entries()) {
      const entrance = Math.max(0, Math.min(1, shown - index));
      const radius = disc.radius * scale * entrance * (1 - collapse) * returnToMap;
      const x = right - disc.centre * scale * (1 - collapse);

      if (radius <= 0) continue;

      pen.beginPath();
      pen.arc(x, y, radius, 0, Math.PI * 2);
      pen.stroke();
    }

    pen.fillStyle = colors.ink;
    pen.beginPath();
    pen.arc(right, y, (tall ? 1.8 : 2.5) * returnToMap, 0, Math.PI * 2);
    pen.fill();

    if (time < 36500) {
      text(pen, '0', right, y + (tall ? 17 : 25), tall ? 10 : 14, 20, colors);
      text(pen, 'ACCUMULATION POINT', box.x + box.w / 2, box.y + box.h - 7, tall ? 8.5 : 12, box.w - 12, colors);
    }
  }

  private paperCards(box: Box, amount: number, tall: boolean): void {
    const { pen, colors } = this;
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .75;
    const width = box.w * .44 * amount;
    const height = box.h * .76 * amount;
    const top = box.y + box.h * .12;

    for (const side of [.25, .75]) {
      const x = box.x + box.w * side;
      pen.strokeRect(x - width / 2, top, width, height);
    }

    const camera = { x: box.x + box.w * .75, y: box.y + box.h * .44, scale: Math.min(width, height) / 8.5 };
    const first = this.boundary(this.model.hole1, camera, 0);
    const second = this.boundary(this.model.hole2, camera, 0);
    this.shade(first, false, 1);
    this.shade(second, true, 1);

    if (amount === 1) {
      text(pen, 'PAPER 1', box.x + box.w * .25, top + 12, tall ? 9 : 13, width - 8, colors);
      text(pen, 'PAPER 2', box.x + box.w * .75, top + 12, tall ? 9 : 13, width - 8, colors);
    }
  }

  private disc(disc: CantorDisc, box: Box, y: number, parent: CantorDisc, amount: number, entrance = 1): void {
    const radius = mix(parent.radius, disc.radius, amount) * box.w * entrance;
    const x = box.x + mix(parent.centre, disc.centre, amount) * box.w;
    this.pen.beginPath();
    this.pen.arc(x, y, radius, 0, Math.PI * 2);
    this.pen.stroke();
  }

  private cantor(box: Box, position: number, tall: boolean, entrance: number): void {
    const current = this.model.cantor[Math.floor(position)];
    const next = this.model.cantor[Math.min(7, Math.floor(position) + 1)];

    if (!current || !next) throw new Error('The Cantor morph has adjacent declared finite stages.');

    const tray = { x: box.x + box.w * .055, y: box.y, w: box.w * .89, h: box.h };
    const y = box.y + box.h * .76;
    const amount = smooth(position % 1, 0, .8);
    this.pen.strokeStyle = this.colors.ink;
    this.pen.lineWidth = Math.min(.8, 1 / this.density);

    if (current.k === 7 || amount === 0) {
      for (const disc of current.discs) this.disc(disc, tray, y, disc, 1, entrance);
    } else {
      for (const disc of next.discs) {
        const parent = current.discs.find(candidate => candidate.id === disc.parentId);

        if (!parent) throw new Error('Every split disc retains its actual ternary parent.');

        this.disc(disc, tray, y, parent, amount);
      }
    }

    if (current.k >= 1) this.magnifiedSplit(box, current.k, tall, smooth(position, 1, 1.3));

    const subpixel = current.discs.every(disc => disc.radius * tray.w * this.density < 1);

    text(this.pen, subpixel ? 'RADII BELOW A PIXEL · CENTRES RETAINED' : 'FINITE STAGES · SPLITTING IS SCHEMATIC', box.x + box.w / 2, box.y + box.h - 7, tall ? 8 : 12, box.w - 10, this.colors);
  }

  private magnifiedSplit(box: Box, k: number, tall: boolean, entrance: number): void {
    const stage = this.model.cantor[k];
    const parent = this.model.cantor[k - 1]?.discs[0];

    if (!stage || !parent) throw new Error('The detail shows children of a real Cantor interval.');

    const width = box.w * .38;
    const x = box.x + box.w * .77;
    const y = box.y + box.h * .24;
    const scale = mix(box.w * .89, width / (parent.right - parent.left), entrance);
    const left = mix(box.x + box.w * .055, x - width / 2 - parent.left * scale, entrance);
    const centreY = mix(box.y + box.h * .76, y, entrance);
    this.pen.strokeStyle = this.colors.ink;
    this.pen.lineWidth = .8;

    for (const disc of stage.discs) {
      if (disc.parentId !== parent.id) continue;

      this.pen.beginPath();
      this.pen.arc(left + disc.centre * scale, centreY, disc.radius * scale, 0, Math.PI * 2);
      this.pen.stroke();
    }

    if (entrance === 1) text(this.pen, 'LEFT BRANCH\nMAGNIFIED', x, y + box.h * .12, tall ? 8.5 : 13, width, this.colors);
  }

  private claimMark(box: Box, time: number, tall: boolean): void {
    const { pen, colors } = this;
    const shown = smooth(time, 60500, 64000);
    const inset = tall ? 2 : 5;
    const top = box.y + inset;
    const bottom = box.y + box.h - inset;
    const middle = (top + bottom) / 2;
    pen.strokeStyle = colors.blue;
    pen.lineWidth = tall ? 2 : 2.5;

    for (const x of [box.x + inset, box.x + box.w - inset]) {
      const sign = x < box.x + box.w / 2 ? 1 : -1;
      line(pen, x, middle, x, mix(middle, top, shown));
      line(pen, x, middle, x, mix(middle, bottom, shown));
      line(pen, x, top, x + sign * 9 * shown, top);
      line(pen, x, bottom, x + sign * 9 * shown, bottom);
    }

    if (time < 65000 && shown > 0) {
      const y = box.y + box.h * .83;
      const start = box.x + box.w * .34;
      const end = mix(start, box.x + box.w * .67, shown);
      line(pen, start, y, end, y);
      line(pen, end, y, end - 6 * shown, y - 4 * shown);
      line(pen, end, y, end - 6 * shown, y + 4 * shown);
    }
  }
}

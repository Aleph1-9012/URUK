import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { buildFlatWallsModel, direction, flatValue, laplacianResidual, profile, stippleDensity, type Point } from './math';
import { drawFlatWallsPanels, layout } from './panels';
import { motionAt } from './story';

type Motion = ReturnType<typeof motionAt>;
type Window = { x: number; y: number; size: number };
type Wall = { e: Point; offset: number; bend: number; angleDegrees: number; maximumResidual: number };

function between(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

function markNoise(index: number): number {
  let value = Math.imul(index + 375, 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);

  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

class FlatWallsFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private page = layout(1, 1);
  private readonly labels: FilmLabels;
  private readonly model = buildFlatWallsModel();

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

  private text(value: string, x: number, y: number, size = this.page.phone ? 9 : 12, math = false): void {
    drawText(this.pen, value, x, y, { size, family: math ? 'math' : 'type', color: this.tones.ink, paper: this.tones.paper });
  }

  private line(a: Point, b: Point, weight = .8, blue = false, dash: readonly number[] = []): void {
    drawLine(this.pen, a.x, a.y, b.x, b.y, blue ? this.tones.blue : this.tones.ink, weight, dash);
  }

  private cell(index: number): Window {
    const strip = this.page.strip;
    const column = index % strip.columns;
    const row = Math.floor(index / strip.columns);

    return { x: strip.left + column * (strip.cellSize + strip.gap), y: strip.top + row * (strip.cellSize + strip.rowGap), size: strip.cellSize };
  }

  private wall(motion: Motion): Wall {
    const position = motion.rotate * (this.model.walls.length - 1);
    const index = Math.min(this.model.walls.length - 2, Math.floor(position));
    const first = this.model.walls[index];
    const second = this.model.walls[index + 1];
    const opening = this.model.walls[0];

    if (!first || !second || !opening) throw new Error('The carried wall needs its four computed input cases.');

    const amount = position - index;
    const theta = mix(mix(first.theta, second.theta, amount), opening.theta, motion.reset);
    const offset = mix(mix(first.offset, second.offset, amount), opening.offset, motion.reset);
    const e = direction(theta);
    let maximumResidual = 0;

    for (let sample = 0; sample < first.samples.length; sample++) {
      const a = first.samples[sample];
      const b = second.samples[sample];
      const c = opening.samples[sample];

      if (!a || !b || !c) throw new Error('Every residual sample needs its preserved seeded coordinates.');

      const point = between(between(a.point, b.point, amount), c.point, motion.reset);
      maximumResidual = Math.max(maximumResidual, Math.abs(laplacianResidual(p => flatValue(p, e, offset), point)));
    }

    return { e, offset, bend: motion.circle * (1 - motion.reset), angleDegrees: theta * 180 / Math.PI, maximumResidual };
  }

  private fieldPoint(box: Window, point: Point): Point {
    return { x: box.x + box.size * (point.x + 4) / 8, y: box.y + box.size * (4 - point.y) / 8 };
  }

  private signedDistance(point: Point, wall: Wall): number {
    return mix(wall.e.x * point.x + wall.e.y * point.y - wall.offset, Math.hypot(point.x, point.y) - 3, wall.bend);
  }

  private field(box: Window, wall: Wall, extent = 1, miniature = false): void {
    if (box.size <= 0 || extent <= 0) return;

    const { pen } = this;
    const side = miniature ? 10 : 34;
    const radius = miniature ? .42 : Math.max(.55, box.size / 330);
    pen.beginPath();

    for (let row = 0; row < side; row++) {
      for (let column = 0; column < side; column++) {
        const index = row * side + column;
        const point = { x: -4 + 8 * (column + .5) / side, y: -4 + 8 * (row + .5) / side };
        const value = profile(this.signedDistance(point, wall));
        const threshold = (markNoise(index * 3) + markNoise(index * 3 + 1)) / 2;

        if (threshold > (.035 + .91 * stippleDensity(value)) * extent) continue;

        const pixel = this.fieldPoint(box, point);
        const jitter = box.size / side * .22;
        const x = pixel.x + jitter * (markNoise(index * 3 + 1) - .5);
        const y = pixel.y + jitter * (markNoise(index * 3 + 2) - .5);
        pen.moveTo(x + radius, y);
        pen.arc(x, y, radius, 0, Math.PI * 2);
      }
    }

    pen.fillStyle = this.tones.ink;
    pen.fill();
    pen.strokeStyle = this.tones.ink;
    pen.lineWidth = miniature ? .6 : 1;
    pen.strokeRect(box.x, box.y, box.size, box.size);
    this.contour(box, wall, miniature);
  }

  private contour(box: Window, wall: Wall, miniature: boolean): void {
    const { pen } = this;
    const count = miniature ? 12 : 44;
    pen.beginPath();

    for (let row = 0; row < count; row++) {
      for (let column = 0; column < count; column++) {
        const x = -4 + 8 * column / count;
        const y = -4 + 8 * row / count;
        const step = 8 / count;
        const corners = [{ x, y }, { x: x + step, y }, { x: x + step, y: y + step }, { x, y: y + step }];
        const intersections: Point[] = [];

        for (let edge = 0; edge < 4; edge++) {
          const a = corners[edge];
          const b = corners[(edge + 1) % 4];

          if (!a || !b) throw new Error('Every contour cell needs its four corners.');

          const fa = this.signedDistance(a, wall);
          const fb = this.signedDistance(b, wall);

          if ((fa < 0) === (fb < 0)) continue;

          intersections.push(this.fieldPoint(box, between(a, b, fa / (fa - fb))));
        }

        for (let pair = 0; pair + 1 < intersections.length; pair += 2) {
          const a = intersections[pair];
          const b = intersections[pair + 1];

          if (!a || !b) throw new Error('A contour segment needs both intersections.');

          pen.moveTo(a.x, a.y);
          pen.lineTo(b.x, b.y);
        }
      }
    }

    pen.strokeStyle = this.tones.ink;
    pen.lineWidth = miniature ? 1 : 1.8;
    pen.stroke();

    if (wall.bend === 1 && !miniature) {
      const center = this.fieldPoint(box, { x: 0, y: 0 });
      const sample = this.fieldPoint(box, { x: 3, y: 0 });
      this.line({ x: center.x - 3, y: center.y - 3 }, { x: center.x + 3, y: center.y + 3 });
      this.line({ x: center.x - 3, y: center.y + 3 }, { x: center.x + 3, y: center.y - 3 });
      pen.beginPath();
      pen.arc(sample.x, sample.y, 3.5, 0, Math.PI * 2);
      pen.stroke();
    }
  }

  private profile(motion: Motion): void {
    if (motion.profile === 0 || motion.shrink === 1) return;

    const plot = this.page.profile;
    const contraction = 1 - motion.shrink;
    const left = plot.left;
    const right = mix(plot.left, plot.right, contraction);
    const middle = (plot.top + plot.bottom) / 2;
    const amplitude = (plot.bottom - plot.top) / 2 * contraction;
    this.line({ x: left, y: middle }, { x: right, y: middle }, .5);

    for (const value of [-1, 1]) {
      const y = middle - value * amplitude;
      this.line({ x: left, y }, { x: right, y }, .5, false, [2, 4]);
      if (contraction > .4) this.text(value < 0 ? '−1' : '+1', left - (this.page.phone ? 13 : 20), y, this.page.phone ? 12 : 16, true);
    }

    const { pen } = this;
    pen.beginPath();

    for (let index = 0; index <= Math.floor(160 * motion.profile); index++) {
      const point = this.model.profile[index];

      if (!point) throw new Error('The profile needs its live computed samples.');

      const x = left + (right - left) * (point.s + 4) / 8;
      const y = middle - amplitude * point.value;

      if (index === 0) pen.moveTo(x, y);
      else pen.lineTo(x, y);
    }

    pen.strokeStyle = this.tones.ink;
    pen.lineWidth = 1.6;
    pen.stroke();
    if (contraction > .4) this.text('s', right + 8, middle + 12, this.page.phone ? 13 : 18, true);
  }

  private hatch(box: Window, lift = 0): void {
    if (lift === 1) return;

    const { pen } = this;
    const rise = lift * box.size;
    pen.save();
    pen.beginPath();
    pen.rect(box.x + 1, box.y + 1, box.size - 2, box.size - 2);
    pen.clip();
    pen.beginPath();

    for (let position = -box.size; position <= box.size * 2; position += 7) {
      pen.moveTo(box.x + position, box.y + box.size - rise);
      pen.lineTo(box.x + position + box.size, box.y - rise);
    }

    pen.strokeStyle = this.tones.ink;
    pen.lineWidth = .45;
    pen.stroke();
    pen.restore();
  }

  private tick(x: number, y: number, size: number, blue = false): void {
    this.line({ x: x - size, y }, { x: x - .2 * size, y: y + .65 * size }, blue ? 2 : 1.2, blue);
    this.line({ x: x - .2 * size, y: y + .65 * size }, { x: x + size, y: y - .9 * size }, blue ? 2 : 1.2, blue);
  }

  private strip(motion: Motion, wall: Wall): void {
    if (motion.shrink === 0) return;

    const first = this.cell(0);
    const opening = this.page.window;
    const master = { x: mix(opening.x, first.x, motion.shrink), y: mix(opening.y, first.y, motion.shrink), size: mix(opening.size, first.size, motion.shrink) };
    this.field(master, wall, 1, motion.shrink === 1);

    if (motion.shrink < 1) return;

    for (let index = 0; index < 8; index++) {
      const box = this.cell(index);
      const arrival = Math.max(0, Math.min(1, motion.strip * 7 - index + 1));

      if (index > 0 && arrival === 0) continue;

      if (index > 0) {
        const growing = { x: box.x + box.size * (1 - arrival) / 2, y: box.y + box.size * (1 - arrival) / 2, size: box.size * arrival };
        this.field(growing, wall, 1, true);
      }

      if (arrival < 1 && index > 0) continue;

      this.text(index === 7 ? '9+' : String(index + 2), box.x + box.size / 2, box.y + box.size + (this.page.phone ? 12 : 18), this.page.phone ? 13 : 18, true);

      if (motion.proven > 0 && index < 2) this.tick(box.x + box.size / 2, box.y + box.size / 2, box.size * .14);
      if (motion.conditional > 0 && index >= 2 && index <= 6) this.hatch(box, index === 6 ? motion.lift : 0);

      if (motion.counterexample > 0 && index === 7) {
        const verdict = { x: box.x + box.size / 2 + (this.page.phone ? 15 : 22), y: box.y + box.size + (this.page.phone ? 12 : 18) };
        this.line({ x: verdict.x - 3, y: verdict.y - 3 }, { x: verdict.x + 3, y: verdict.y + 3 }, 1.3);
        this.line({ x: verdict.x - 3, y: verdict.y + 3 }, { x: verdict.x + 3, y: verdict.y - 3 }, 1.3);
      }

      if (index === 6) {
        const inset = 3 + motion.focus * 2;
        this.pen.strokeStyle = this.tones.ink;
        this.pen.lineWidth = 1;
        this.pen.strokeRect(box.x - inset, box.y - inset, box.size + inset * 2, box.size + inset * 2);
      }

      if (index === 6 && motion.arrow > 0) {
        const x = box.x + box.size * .8;
        const end = box.y + box.size * mix(.8, .25, motion.arrow);
        this.line({ x, y: box.y + box.size * .8 }, { x, y: end }, 1.3);
        this.line({ x: x - 2.5, y: end + 4 }, { x, y: end }, 1.3);
        this.line({ x: x + 2.5, y: end + 4 }, { x, y: end }, 1.3);
        this.text('x₈', box.x + box.size * .45, box.y + box.size * .19, this.page.phone ? 10 : 14, true);
      }

      if (index === 6 && motion.claim > 0) {
        this.pen.strokeStyle = this.tones.blue;
        this.pen.lineWidth = 2.8;
        this.pen.strokeRect(box.x - 3, box.y - 3, box.size + 6, box.size + 6);
      }
    }
  }

  private cone(motion: Motion): void {
    if (motion.scene !== 'dimensions' || motion.cone === 0) return;

    const plot = this.page.cone;
    const point = (rho1: number, rho2: number): Point => ({ x: mix(plot.left, plot.right, rho1 / 3), y: mix(plot.bottom, plot.top, rho2 / 3) });
    const origin = point(0, 0);
    this.line(origin, point(3, 0));
    this.line(origin, point(0, 3));
    this.line(origin, point(3 * motion.cone, 3 * motion.cone), 1.4);
    this.text('0', origin.x - 9, origin.y + 10, 12, true);
    this.text('ρ₁', plot.right + 10, plot.bottom + 12, this.page.phone ? 13 : 18, true);
    this.text('ρ₂', plot.left - 12, plot.top + 14, this.page.phone ? 13 : 18, true);

    for (let index = 0; index < Math.floor(motion.cone * this.model.cone.points.length); index++) {
      const row = this.model.cone.points[index];

      if (!row) throw new Error('Each norm projection point needs its normalized eight-dimensional input.');

      const pixel = point(row.rho1, row.rho2);
      this.pen.beginPath();
      this.pen.arc(pixel.x, pixel.y, this.page.phone ? 2.5 : 3.5, 0, Math.PI * 2);
      this.pen.fillStyle = this.tones.ink;
      this.pen.fill();
    }
  }

  private stable(motion: Motion, wall: Wall): void {
    if (motion.stable === 0) return;

    const row = this.page.stable;
    const total = row.cellSize * 7 + row.gap * 6;
    const left = (this.width - total) / 2;

    for (let index = 0; index < 7; index++) {
      const amount = Math.min(1, motion.stable * 7 - index);

      if (amount <= 0) continue;

      const x = left + index * (row.cellSize + row.gap);
      const box = { x, y: row.top, size: row.cellSize };
      this.pen.strokeStyle = this.tones.ink;
      this.pen.lineWidth = .7;
      this.pen.strokeRect(x, row.top, row.cellSize * amount, row.cellSize);

      if (amount < 1) continue;

      if (index === 5) this.field(box, wall, 1, true);
      if (index === 5 && motion.stableClaim > 0) {
        this.pen.strokeStyle = this.tones.blue;
        this.pen.lineWidth = 2.8;
        this.pen.strokeRect(x - 2, row.top - 2, row.cellSize + 4, row.cellSize + 4);
      }

      if (index === 6) {
        const points = Array.from({ length: 25 }, (_, step) => ({ x: x + row.cellSize * step / 24, y: row.top + row.cellSize * (.5 + .25 * Math.sin(step / 24 * Math.PI * 2)) }));

        for (let segment = 1; segment < points.length; segment++) {
          const a = points[segment - 1];
          const b = points[segment];

          if (!a || !b) throw new Error('The schematic non-flat icon needs its segment endpoints.');

          this.line(a, b, 1.2);
        }
      }

      this.text(String(index + 2), x + row.cellSize / 2, row.top + row.cellSize + (this.page.phone ? 10 : 14), this.page.phone ? 11 : 16, true);
    }
  }

  draw(time: number): void {
    const { pen, width, height } = this;
    const motion = motionAt(time);
    const wall = this.wall(motion);
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, width, height);
    pen.setLineDash([]);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    this.labels.beginFrame();

    if (motion.shrink === 0) this.field(this.page.window, wall, motion.field);

    this.profile(motion);
    this.strip(motion, wall);
    this.cone(motion);
    this.stable(motion, wall);
    drawFlatWallsPanels(pen, width, height, time, this.tones, this.labels, { flatResidual: wall.maximumResidual, circleResidual: this.model.circle.finiteDifferenceResidual, directionDegrees: wall.angleDegrees });
    this.labels.endFrame();
  }
}

export function createFlatWallsFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new FlatWallsFilm(root, context);
}

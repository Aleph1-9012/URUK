import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawText } from '../../plate/canvas/wrapped-text';
import { buildClosingUpModel, pointAtArcLength, type Path, type Vec3 } from './math';
import { drawClosingUpPanels, layout } from './panels';
import { motionAt } from './story';

type Motion = ReturnType<typeof motionAt>;

type ProjectedPoint = { x: number; y: number; front: boolean };

const YAW = .55;

const RIGHT: Vec3 = [Math.cos(YAW), -Math.sin(YAW), 0];

const UP: Vec3 = [.5 * Math.sin(YAW), .5 * Math.cos(YAW), -Math.sqrt(3) / 2];

const VIEW: Vec3 = [Math.sqrt(3) / 2 * Math.sin(YAW), Math.sqrt(3) / 2 * Math.cos(YAW), .5];

function dot(first: Vec3, second: Vec3): number {
  return first[0] * second[0] + first[1] * second[1] + first[2] * second[2];
}

class ClosingUpFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private page = layout(1, 1);
  private readonly labels: FilmLabels;
  private readonly model = buildClosingUpModel();

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

  private get phone(): boolean {
    return this.width < PHONE_STAGE_WIDTH;
  }

  private axes(motion: Motion): Vec3 {
    const amount = motion.deform * (1 - motion.relax);

    return [1, mix(1, this.model.axes[1], amount), mix(1, this.model.axes[2], amount)];
  }

  private carry(point: Vec3, sourceAxes: Vec3, currentAxes: Vec3): Vec3 {
    return [point[0] * currentAxes[0] / sourceAxes[0], point[1] * currentAxes[1] / sourceAxes[1], point[2] * currentAxes[2] / sourceAxes[2]];
  }

  private project(point: Vec3, axes: Vec3): ProjectedPoint {
    const { sphere } = this.page;
    const normal: Vec3 = [point[0] / axes[0] ** 2, point[1] / axes[1] ** 2, point[2] / axes[2] ** 2];

    return { x: sphere.cx + sphere.radius * dot(point, RIGHT), y: sphere.cy + sphere.radius * dot(point, UP), front: dot(normal, VIEW) >= 0 };
  }

  private surface(axes: Vec3, amount: number): void {
    if (amount === 0) return;

    const { pen, tones } = this;
    pen.beginPath();

    // The support point of an ellipsoid in every screen direction gives
    // its apparent contour without using a shaded three-dimensional render.
    for (let k = 0; k <= Math.ceil(240 * amount); k++) {
      const angle = Math.min(k / 240, amount) * 2 * Math.PI;
      const direction: Vec3 = [
        Math.cos(angle) * RIGHT[0] + Math.sin(angle) * UP[0],
        Math.cos(angle) * RIGHT[1] + Math.sin(angle) * UP[1],
        Math.cos(angle) * RIGHT[2] + Math.sin(angle) * UP[2],
      ];
      const denominator = Math.hypot(axes[0] * direction[0], axes[1] * direction[1], axes[2] * direction[2]);
      const point = this.project([
        axes[0] ** 2 * direction[0] / denominator,
        axes[1] ** 2 * direction[1] / denominator,
        axes[2] ** 2 * direction[2] / denominator,
      ], axes);

      if (k === 0) pen.moveTo(point.x, point.y);
      else pen.lineTo(point.x, point.y);
    }

    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1;
    pen.stroke();

    if (amount !== 1) return;

    pen.fillStyle = tones.muted;

    for (let k = 0; k < 420; k++) {
      const z = 1 - 2 * (k + .5) / 420;
      const angle = k * Math.PI * (3 - Math.sqrt(5));
      const radius = Math.sqrt(1 - z * z);
      const unit: Vec3 = [radius * Math.cos(angle), radius * Math.sin(angle), z];
      const point = this.project([axes[0] * unit[0], axes[1] * unit[1], axes[2] * unit[2]], axes);

      if (!point.front || unit[0] < .1) continue;

      pen.beginPath();
      pen.arc(point.x, point.y, this.phone ? .38 : .5, 0, 2 * Math.PI);
      pen.fill();
    }
  }

  private curve(path: Path, sourceAxes: Vec3, axes: Vec3, amount: number, weight = 1.2, dashed = false): void {
    if (amount <= 0) return;

    const { pen, tones } = this;
    const segments = Math.min(path === this.model.generic.path ? 2800 : 700, path.positions.length - 1);

    for (const front of [false, true]) {
      pen.beginPath();
      let continuing = false;

      for (let k = 0; k <= Math.ceil(segments * amount); k++) {
        const phase = Math.min(k / segments, amount);
        const arcLength = phase * path.length;
        const position = pointAtArcLength(path, Math.min(path.length, arcLength));
        const point = this.project(this.carry(position, sourceAxes, axes), axes);

        if (point.front !== front) {
          continuing = false;
          continue;
        }

        if (continuing) pen.lineTo(point.x, point.y);
        else pen.moveTo(point.x, point.y);

        continuing = true;
      }

      pen.strokeStyle = front ? tones.ink : tones.muted;
      pen.lineWidth = front ? weight : Math.min(.65, weight);
      pen.setLineDash(front ? dashed ? [4, 3] : [] : [2, 3]);
      pen.stroke();
    }

    pen.setLineDash([]);
  }

  private bead(path: Path, sourceAxes: Vec3, axes: Vec3, phase: number, kind: 'solid' | 'ring' | 'square' = 'solid'): void {
    const normalized = path === this.model.generic.path ? Math.min(1, Math.max(0, phase)) : ((phase % 1) + 1) % 1;
    const arcLength = normalized * path.length;
    const point = this.project(this.carry(pointAtArcLength(path, arcLength), sourceAxes, axes), axes);
    const { pen, tones } = this;
    const radius = this.phone ? 3.2 : 4.2;
    pen.save();
    pen.strokeStyle = point.front ? tones.ink : tones.muted;
    pen.lineWidth = point.front ? 1.1 : .85;
    pen.setLineDash(point.front ? [] : [1.5, 2]);

    if (point.front) {
      pen.fillStyle = tones.paper;
      pen.beginPath();
      pen.arc(point.x, point.y, radius + 1.5, 0, Math.PI * 2);
      pen.fill();
    }

    pen.beginPath();

    if (kind === 'square') pen.rect(point.x - radius, point.y - radius, 2 * radius, 2 * radius);
    else pen.arc(point.x, point.y, radius, 0, Math.PI * 2);

    if (kind === 'solid' && point.front) {
      pen.fillStyle = tones.ink;
      pen.fill();
    } else pen.stroke();

    pen.restore();
  }

  private curves(motion: Motion, axes: Vec3): void {
    const round: Vec3 = [1, 1, 1];

    if (motion.scene === 'round') {
      for (const [index, path] of this.model.roundCircles.entries()) {
        const amount = Math.min(1, Math.max(0, 6 * motion.greatCircles - index));
        this.curve(path, round, axes, amount);

        if (amount > 0 && amount < 1) this.bead(path, round, axes, amount);
      }

      return;
    }

    if (motion.scene === 'deform') {
      for (const [index, path] of this.model.roundCircles.entries()) {
        if (index > 2) this.curve(path, round, axes, 1 - motion.deform, .8);
      }

      for (const principal of this.model.principal) this.curve(principal.path, this.model.axes, axes, 1, .85);

      this.curve(this.model.generic.path, this.model.axes, axes, .15 * motion.deform);

      return;
    }

    if (motion.scene === 'principal') {
      // The carried curves remain underneath each newly traced, heavier lap.
      for (const [index, principal] of this.model.principal.entries()) {
        this.curve(principal.path, this.model.axes, axes, 1, .65);
        const amount = Math.min(1, Math.max(0, 3 * motion.principal - index));
        this.curve(principal.path, this.model.axes, axes, amount, 1.8);

        if (amount > 0 && amount < 1) this.bead(principal.path, this.model.axes, axes, amount);
      }

      this.curve(this.model.generic.path, this.model.axes, axes, .15, .65);

      return;
    }

    const first = this.model.principal[0];

    if (!first) throw new Error('The definition scene needs its integrated xy ellipse.');

    const focused = ['closed', 'prime', 'sameImage'].includes(motion.scene);

    for (const principal of this.model.principal) {
      const amount = principal === first ? 1 : motion.scene === 'closed' ? 1 - motion.rewind : motion.scene === 'classical' ? motion.relax : focused ? 0 : 1;

      this.curve(principal.path, this.model.axes, axes, amount, focused ? 1.6 : .8);
    }

    if (motion.scene === 'generic' || motion.scene === 'closed') {
      const amount = motion.scene === 'generic' ? mix(.15, 1, motion.generic) : 1 - motion.rewind;
      this.curve(this.model.generic.path, this.model.axes, axes, amount, 1.15);

      if (amount > 0) {
        this.bead(this.model.generic.path, this.model.axes, axes, 0, 'ring');
        this.bead(this.model.generic.path, this.model.axes, axes, amount);
      }
    }

    if (motion.scene === 'prime') {
      const phase = motion.secondLap > 0 ? motion.secondLap : motion.prime;
      this.curve(first.path, this.model.axes, axes, phase, 1.8, motion.secondLap > 0);
      this.bead(first.path, this.model.axes, axes, phase, motion.secondLap > 0 ? 'ring' : 'solid');
    }

    if (motion.scene === 'sameImage') {
      this.bead(first.path, this.model.axes, axes, motion.sameImage);

      if (motion.shiftedStart > 0) this.bead(first.path, this.model.axes, axes, .3 + motion.shiftedStart, 'ring');
      if (motion.reverse > 0) this.bead(first.path, this.model.axes, axes, -motion.reverse, 'square');
      if (motion.repeat > 0) this.bead(first.path, this.model.axes, axes, 2 * motion.repeat);
    }
  }

  private halo(motion: Motion): void {
    if (motion.halo === 0) return;

    const { sphere } = this.page;
    const { pen, tones } = this;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = .8;
    pen.beginPath();
    pen.arc(sphere.cx, sphere.cy, sphere.radius * 1.13, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * motion.halo);
    pen.stroke();

    if (motion.infinity > 0) {
      const size = (this.phone ? 22 : 30) * motion.infinity;
      drawText(pen, '∞', sphere.cx, sphere.cy - sphere.radius * 1.13, { size, color: tones.blue, family: 'math', paper: tones.paper });
    }
  }

  draw(time: number): void {
    const { pen, width, height } = this;
    const motion = motionAt(time);
    const axes = this.axes(motion);
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, width, height);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();
    this.surface(axes, motion.surface);
    this.curves(motion, axes);
    this.halo(motion);
    drawClosingUpPanels(pen, width, height, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }
}

export function createClosingUpFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new ClosingUpFilm(root, context);
}

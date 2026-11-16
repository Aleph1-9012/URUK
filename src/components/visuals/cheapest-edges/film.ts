import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { buildCheapestEdgesModel, tipField, type Point } from './math';
import { drawCheapestEdgesPanels, layout } from './panels';
import { motionAt } from './story';

type Motion = ReturnType<typeof motionAt>;

function between(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

function quadratic(a: Point, b: Point, c: Point): Point[] {
  return Array.from({ length: 61 }, (_, index) => {
    const t = index / 60;

    return between(between(a, b, t), between(b, c, t), t);
  });
}

const TIP = { x: .42, y: .80 };
const JUNCTION = { x: .68, y: .42 };
const ARC = quadratic({ x: 0, y: .30 }, { x: .12, y: .02 }, { x: .36, y: 0 });
const CRACK = quadratic({ x: .30, y: 1 }, { x: .38, y: .94 }, TIP);
const RIGHT = { x: 1, y: JUNCTION.y + (1 - JUNCTION.x) / Math.sqrt(3) };
const LEFT = { x: 0, y: JUNCTION.y + JUNCTION.x / Math.sqrt(3) };
const K_CURVES = [
  { component: 1, points: ARC },
  { component: 2, points: CRACK },
  { component: 3, points: [JUNCTION, { x: JUNCTION.x, y: 0 }] },
  { component: 3, points: [JUNCTION, RIGHT] },
  { component: 3, points: [JUNCTION, LEFT] },
] as const;

const TIP_ROTATION = Math.PI - Math.atan2(.14, -.04);

class CheapestEdgesFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private page = layout(1, 1);
  private readonly labels: FilmLabels;
  private readonly model = buildCheapestEdgesModel();

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

  private line(a: Point, b: Point, blue = false, weight = .8, dash: readonly number[] = []): void {
    drawLine(this.pen, a.x, a.y, b.x, b.y, blue ? this.tones.blue : this.tones.ink, weight, dash);
  }

  private path(points: readonly Point[], amount = 1, blue = false, weight = 1): void {
    if (amount <= 0) return;

    const first = points[0];

    if (!first) throw new Error('Each drawn curve needs its first point.');

    const { pen } = this;
    const extent = amount * (points.length - 1);
    pen.beginPath();
    pen.moveTo(first.x, first.y);

    for (let index = 1; index <= Math.ceil(extent); index++) {
      const previous = points[index - 1];
      const next = points[index];

      if (!previous || !next) throw new Error('Every drawn curve segment needs both endpoints.');

      const point = between(previous, next, Math.min(1, extent - index + 1));
      pen.lineTo(point.x, point.y);
    }

    pen.strokeStyle = blue ? this.tones.blue : this.tones.ink;
    pen.lineWidth = weight;
    pen.stroke();
  }

  private imageBox() {
    const box = this.page.image;
    const size = Math.min(box.width, box.height);

    return { x: box.x + (box.width - size) / 2, y: box.y + (box.height - size) / 2, size };
  }

  private imagePoint(point: Point): Point {
    const box = this.imageBox();

    return { x: box.x + point.x * box.size, y: box.y + point.y * box.size };
  }

  private zoom(motion: Motion): number {
    if (motion.scene === 'blowUp' || motion.scene === 'twoProofs') return motion.blowUp;
    if (motion.scene === 'claim') return 1 - motion.claim;
    if (motion.scene === 'tip') return motion.tipZoom;
    if (motion.scene === 'ledger') return 1 - motion.review;

    return 0;
  }

  private camera(point: Point, zoom: number, flattenTip = false): Point {
    const focus = between({ x: .5, y: .5 }, TIP, zoom);
    const x = point.x - focus.x;
    const y = point.y - focus.y;
    const angle = TIP_ROTATION * zoom;
    const rx = Math.cos(angle) * x - Math.sin(angle) * y;
    const ry = Math.sin(angle) * x + Math.cos(angle) * y;

    return this.imagePoint({ x: .5 + (1 + 4 * zoom) * rx, y: .5 + (1 + 4 * zoom) * ry * (flattenTip ? 1 - zoom : 1) });
  }

  private wash(points: readonly Point[], alpha: number, zoom: number): void {
    const first = points[0];

    if (!first) throw new Error('A schematic patch needs its first corner.');

    const { pen } = this;
    const start = this.camera(first, zoom);
    pen.save();
    pen.beginPath();
    pen.moveTo(start.x, start.y);

    for (const point of points) {
      const p = this.camera(point, zoom);
      pen.lineTo(p.x, p.y);
    }

    pen.closePath();
    pen.fillStyle = this.tones.ink;
    pen.globalAlpha = alpha;
    pen.fill();
    pen.restore();
  }

  private mark(point: Point, kind: 'arc' | 'tip' | 'junction', blue: boolean, angle = 0): void {
    const { pen } = this;
    pen.save();
    pen.translate(point.x, point.y);
    pen.rotate(angle);
    pen.strokeStyle = blue ? this.tones.blue : this.tones.ink;
    pen.lineWidth = blue ? 1.7 : 1.1;
    pen.beginPath();

    if (kind === 'arc') pen.arc(0, 0, 5, 0, Math.PI * 2);
    else if (kind === 'tip') { pen.moveTo(-5, -3); pen.lineTo(5, 3); }
    else {
      for (let index = 0; index < 3; index++) {
        const theta = Math.PI / 6 + index * Math.PI * 2 / 3;
        pen.moveTo(0, 0);
        pen.lineTo(8 * Math.cos(theta), 8 * Math.sin(theta));
      }
    }

    pen.stroke();
    pen.restore();
  }

  private image(motion: Motion, time: number): void {
    const { pen } = this;
    const box = this.imageBox();
    const zoom = this.zoom(motion);
    pen.save();
    pen.beginPath();
    pen.rect(box.x, box.y, box.size, box.size);
    pen.clip();

    if (motion.imagePatches > 0) {
      this.wash([JUNCTION, RIGHT, { x: 1, y: 0 }, { x: JUNCTION.x, y: 0 }], .05, zoom);
      this.wash([JUNCTION, { x: JUNCTION.x, y: 0 }, { x: 0, y: 0 }, LEFT], .11, zoom);
      this.wash([JUNCTION, LEFT, { x: 0, y: 1 }, { x: 1, y: 1 }, RIGHT], .025, zoom);
      this.wash([{ x: 0, y: 0 }, ...ARC], .09, zoom);
    }

    for (const curve of K_CURVES) this.path(curve.points.map(point => this.camera(point, zoom, curve.component === 2)), motion.imageTrace, false, 1.25);

    if (motion.localTypes > 0) {
      const arc = ARC[30];

      if (!arc) throw new Error('The regular-arc marker needs its actual curve point.');

      this.mark(this.camera(arc, zoom), 'arc', time >= 55500);
      this.mark(this.camera(TIP, zoom, true), 'tip', time >= 55500, TIP_ROTATION * zoom);
      this.mark(this.camera(JUNCTION, zoom), 'junction', time >= 55500, TIP_ROTATION * zoom);
    }

    pen.restore();
    pen.strokeStyle = this.tones.ink;
    pen.lineWidth = .7;
    pen.strokeRect(box.x, box.y, box.size, box.size);

    if (zoom > 0 && motion.scene !== 'tip' && motion.scene !== 'ledger') this.text('SCHEMATIC BLOW-UP · NOT A COMPUTED LIMIT', { x: box.x + box.size / 2, y: box.y - 12 }, this.page.phone ? 7 : 9);
    else this.text('K', { x: box.x + 9, y: box.y + 11 }, this.page.phone ? 12 : 16, true);
  }

  private hypothetical(motion: Motion, time: number): void {
    if (time < 45000 || time >= 62000) return;

    const box = this.imageBox();
    const points = quadratic({ x: .60, y: .25 }, { x: .74, y: .12 }, { x: .87, y: .30 });
    const remaining = motion.floating * (1 - motion.claim);
    this.path(points.map(point => this.imagePoint(point)), remaining, false, 1.4);

    if (time >= 55500) {
      const amount = motion.exclude * (1 - motion.claim);
      const a = this.imagePoint({ x: .57, y: .15 });
      const b = this.imagePoint({ x: .89, y: .34 });
      const c = this.imagePoint({ x: .58, y: .34 });
      const d = this.imagePoint({ x: .88, y: .13 });
      this.line(a, between(a, b, amount), true, 2);
      this.line(c, between(c, d, amount), true, 2);
    }

    if (motion.claim === 0) this.text('SUPPOSED BOUNDED ARC', { x: box.x + .72 * box.size, y: box.y + .39 * box.size }, this.page.phone ? 8 : 9);
  }

  private energy(motion: Motion): void {
    if (motion.scene !== 'energy') return;

    const { plot, phone } = this.page;
    const height = plot.bottom - plot.top;
    const profileBottom = plot.top + height * .37;
    const scanTop = plot.top + height * .64;
    const x = (value: number): number => mix(plot.left, plot.right, value);
    const profileY = (value: number): number => mix(profileBottom, plot.top, value / 4);
    const scanY = (value: number): number => mix(plot.bottom, scanTop, value / 5);
    const extent = motion.toySlide;
    this.line({ x: plot.left, y: profileBottom }, { x: x(extent), y: profileBottom });
    this.line({ x: plot.left, y: plot.bottom }, { x: x(extent), y: plot.bottom });

    if (extent !== 1) return;

    this.line({ x: x(0), y: profileY(0) }, { x: x(.5), y: profileY(0) }, false, .8, [3, 2]);
    this.line({ x: x(.5), y: profileY(4) }, { x: x(1), y: profileY(4) }, false, .8, [3, 2]);
    const candidate = motion.cut > 0 ? this.model.toy.midpoint : this.model.toy.noEdge;
    const grow = motion.cut > 0 ? motion.cut : motion.noEdge;
    const { pen } = this;
    pen.beginPath();

    for (let index = 0; index < candidate.u.length * grow; index++) {
      const position = this.model.toy.positions[index];
      const value = candidate.u[index];

      if (position === undefined || value === undefined) throw new Error('The plotted solution needs its computed finite-difference cell.');

      if (index === 0 || index === candidate.cut) pen.moveTo(x(position), profileY(value));
      else pen.lineTo(x(position), profileY(value));
    }

    pen.strokeStyle = this.tones.ink;
    pen.lineWidth = 1.4;
    pen.stroke();
    this.text(motion.cut > 0 ? 'g = u · EDGE AT 0.50' : 'g DASHED · u SOLID', { x: (plot.left + plot.right) / 2, y: plot.top - 10 }, phone ? 8 : 10, true);

    for (const value of [0, 4]) this.text(String(value), { x: plot.left - 9, y: profileY(value) }, phone ? 8 : 11, true);

    const baseline = this.model.toy.noEdge.total;
    this.line({ x: plot.left, y: scanY(baseline) }, { x: plot.right, y: scanY(baseline) }, false, .6, [3, 3]);
    const scanPoints: Point[] = [];

    for (const row of this.model.toy.scan) scanPoints.push({ x: x(row.edgeAt), y: scanY(row.total) });

    this.path(scanPoints, motion.scan, false, 1.1);

    if (motion.scan === 1) {
      const best = this.model.toy.best;
      const point = { x: x(best.edgeAt), y: scanY(best.total) };
      this.pen.beginPath();
      this.pen.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      this.pen.stroke();
    }

    for (const value of [0, .5, 1]) this.text(String(value), { x: x(value), y: plot.bottom + 10 }, phone ? 8 : 11, true);

    this.text('E', { x: plot.left - 10, y: scanTop + 2 }, phone ? 10 : 13, true);
  }

  private network(motion: Motion): void {
    if (motion.scene !== 'localTypes' || motion.junction === 0) return;

    const { plot } = this.page;
    const size = Math.min(plot.right - plot.left, (plot.bottom - plot.top) / .8);
    const left = (plot.left + plot.right - size) / 2;
    const project = (point: Point): Point => ({ x: left + size * point.x, y: plot.bottom - size * point.y });
    const origin = this.camera(JUNCTION, 0);
    const carry = (target: Point): Point => {
      if (!this.page.stacked) return between(origin, target, motion.junction);

      const entrance = { x: this.width * .975, y: origin.y };
      const exit = { x: entrance.x, y: target.y };
      const amount = motion.junction;

      if (amount < .3) return between(origin, entrance, amount / .3);
      if (amount < .7) return between(entrance, exit, (amount - .3) / .4);

      return between(exit, target, (amount - .7) / .3);
    };
    const terminals = this.model.triple.terminals.map(point => carry(project(point)));
    const joint = carry(project(this.model.triple.junction));

    for (const terminal of terminals) {
      this.line(joint, between(joint, terminal, motion.network), false, 1.2);
      this.pen.beginPath();
      this.pen.arc(terminal.x, terminal.y, 2.5, 0, Math.PI * 2);
      this.pen.fillStyle = this.tones.ink;
      this.pen.fill();
    }

    this.pen.beginPath();
    this.pen.arc(joint.x, joint.y, 3, 0, Math.PI * 2);
    this.pen.stroke();
  }

  private components(motion: Motion): void {
    if (motion.scene !== 'components') return;

    const bounds = [{ x: .08, y: .05 }, { x: .92, y: .05 }, { x: .92, y: .95 }, { x: .08, y: .95 }, { x: .08, y: .05 }];
    const components = Array.from(new Set(K_CURVES.map(curve => curve.component)));
    const count = Math.floor(motion.componentCount * components.length);
    const points = bounds.map(point => this.imagePoint(point));
    this.pen.setLineDash([3, 3]);
    this.path(points, motion.openSet, false, .8);
    this.pen.setLineDash([]);

    const arc = ARC[30];

    if (!arc) throw new Error('The schematic component count needs its regular arc point.');

    const markers = { 1: arc, 2: TIP, 3: JUNCTION };

    for (let index = 0; index < count; index++) {
      const component = components[index];

      if (component === undefined) throw new Error('Every count needs its global curve identifier.');

      const marker = markers[component];
      const p = this.imagePoint(marker);
      this.text(String(index + 1), { x: p.x + 12, y: p.y + 12 }, this.page.phone ? 9 : 12, true);
    }

    const box = this.imageBox();
    this.text('U', this.imagePoint({ x: .88, y: .88 }), this.page.phone ? 13 : 17, true);
    this.text(`SCHEMATIC COUNT: ${count} GLOBAL COMPONENTS`, { x: box.x + box.size / 2, y: this.page.text.imageCaption + 17 }, this.page.phone ? 7.5 : 10);
  }

  private tip(motion: Motion): void {
    if (motion.scene !== 'tip') return;

    const box = this.imageBox();
    const center = this.imagePoint({ x: .5, y: .5 });
    const spatial = .65 * box.size;
    const vectorScale = this.page.phone ? 7 : 13;
    const fields: { point: Point; vector: Point }[] = [];

    for (const radius of [.12, .28, .56]) {
      for (const angle of [-2.4, -1.2, 0, 1.2, 2.4]) {
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const field = tipField(x, y);
        fields.push({ point: { x: center.x + spatial * x, y: center.y - spatial * y }, vector: { x: vectorScale * field.gradient.x, y: -vectorScale * field.gradient.y } });
      }
    }

    for (let index = 0; index < Math.ceil(fields.length * motion.tipArrows); index++) {
      const field = fields[index];

      if (!field) throw new Error('Each model gradient arrow needs its computed field sample.');

      const tip = { x: field.point.x + field.vector.x, y: field.point.y + field.vector.y };
      this.line(field.point, tip, false, .7);
      const angle = Math.atan2(field.vector.y, field.vector.x);
      this.line(tip, { x: tip.x - 3 * Math.cos(angle - .5), y: tip.y - 3 * Math.sin(angle - .5) }, false, .7);
      this.line(tip, { x: tip.x - 3 * Math.cos(angle + .5), y: tip.y - 3 * Math.sin(angle + .5) }, false, .7);
    }

    if (motion.tipTable === 0) return;

    const { plot, phone } = this.page;
    const gap = (plot.right - plot.left) / 3.7;
    const top = plot.top + 8;
    const line = (plot.bottom - plot.top) / 3;
    this.text('ε', { x: plot.left, y: top }, phone ? 12 : 16, true);

    for (let column = 0; column < this.model.tip.epsilons.length; column++) this.text(`10${['⁻²', '⁻⁴', '⁻⁶'][column]}`, { x: plot.left + gap * (column + 1.25), y: top }, phone ? 10 : 14, true);

    for (let row = 0; row < this.model.tip.rows.length; row++) {
      const entry = this.model.tip.rows[row];

      if (!entry) throw new Error('The annulus table needs its selected exponent.');

      const y = top + line * (row + 1);
      this.text(`p=${entry.power}`, { x: plot.left, y }, phone ? 10 : 14, true);

      for (let column = 0; column < entry.values.length; column++) {
        const value = entry.values[column];

        if (value === undefined) throw new Error('Each annulus cell needs its computed integral.');

        this.text(value.toFixed(3), { x: plot.left + gap * (column + 1.25), y }, phone ? 10 : 14, true);
      }
    }
  }

  draw(time: number): void {
    const { pen, width, height } = this;
    const motion = motionAt(time);
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, width, height);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();
    this.image(motion, time);
    this.hypothetical(motion, time);
    this.energy(motion);
    this.network(motion);
    this.components(motion);
    this.tip(motion);
    drawCheapestEdgesPanels(pen, width, height, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }
}

export function createCheapestEdgesFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new CheapestEdgesFilm(root, context);
}

import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { buildLastSlopesModel, torusCurve, type BoundaryCurve, type SlopeMark, type TorusCurvePoint } from './math';
import { drawLastSlopesPanels, layout } from './panels';
import { motionAt } from './story';

type Motion = ReturnType<typeof motionAt>;

type Point = { x: number; y: number };

type Selection = { from: SlopeMark; to: SlopeMark; amount: number };

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function movingAngle(from: number, to: number, amount: number): number {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from));

  return from + delta * amount;
}

class LastSlopesFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly model = buildLastSlopesModel();
  private readonly curves = new Map<string, BoundaryCurve>();
  private readonly trefoil = torusCurve({ p: 3, q: 2 });

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 4, vertical: 4 });

    for (const slope of [this.model.special.zero, this.model.special.infinity, ...Object.values(this.model.examples)]) {
      this.curves.set(`${slope.p}/${slope.q}`, torusCurve(slope));
    }
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

  private selection(motion: Motion): Selection {
    const { zero, infinity } = this.model.special;
    const { one, two, half } = this.model.examples;

    if (motion.question > 0) return { from: infinity, to: two, amount: motion.question };
    if (motion.meridian > 0) return { from: half, to: infinity, amount: motion.meridian };
    if (motion.slopeHalf > 0) return { from: two, to: half, amount: motion.slopeHalf };
    if (motion.slopeTwo > 0) return { from: one, to: two, amount: motion.slopeTwo };
    if (motion.slopeOne > 0) return { from: zero, to: one, amount: motion.slopeOne };

    return { from: zero, to: zero, amount: 1 };
  }

  private curve(slope: SlopeMark): BoundaryCurve {
    const curve = this.curves.get(`${slope.p}/${slope.q}`);

    if (!curve) throw new Error('Every endpoint glyph needs its computed primitive boundary curve.');

    return curve;
  }

  private atAngle(angle: number, radius?: number): Point {
    const { guide } = layout(this.width, this.height);
    const distance = radius ?? guide.radius;

    return { x: guide.cx + distance * Math.sin(angle), y: guide.cy + distance * Math.cos(angle) };
  }

  private knot(motion: Motion): void {
    const amount = motion.trefoil * (1 - motion.question);

    if (amount === 0) return;

    const { guide } = layout(this.width, this.height);
    const scale = guide.radius * mix(.68, .27, motion.exterior) / 1.32;
    const tubeWidth = 1 + (this.phone ? 9 : 13) * motion.tube * (1 - motion.exterior);
    const { pen, tones } = this;
    const count = this.trefoil.points.length - 1;

    const pointAt = (position: number): Point => {
      const index = Math.floor(position * count);
      const first = this.trefoil.points[index];
      const second = this.trefoil.points[Math.min(index + 1, count)];

      if (!first || !second) throw new Error('A drawn trefoil point needs both sampled endpoints.');

      const fraction = position * count - index;

      return { x: guide.cx + scale * mix(first.x, second.x, fraction), y: guide.cy + scale * mix(first.y, second.y, fraction) };
    };

    const pathBetween = (start: number, end: number): Path2D => {
      const path = new Path2D();
      const first = pointAt(start);
      path.moveTo(first.x, first.y);

      for (let index = Math.ceil(start * count); index <= Math.floor(end * count); index++) {
        const point = this.trefoil.points[index];

        if (!point) throw new Error('The continuous trefoil path needs every sampled point.');

        path.lineTo(guide.cx + scale * point.x, guide.cy + scale * point.y);
      }

      const last = pointAt(end);
      path.lineTo(last.x, last.y);

      return path;
    };

    const stroke = (path: Path2D): void => {
      pen.strokeStyle = tones.paper;
      pen.lineWidth = tubeWidth + 2;
      pen.stroke(path);

      if (tubeWidth > 2) {
        pen.strokeStyle = tones.ink;
        pen.lineWidth = tubeWidth;
        pen.stroke(path);
        pen.strokeStyle = tones.paper;
        pen.lineWidth = tubeWidth - 2;
        pen.stroke(path);
      }

      pen.strokeStyle = tones.ink;
      pen.lineWidth = .9;
      pen.stroke(path);
    };

    stroke(pathBetween(0, amount));

    // In this top view of T(3,2), the positive-height arcs at these three
    // crossings pass over their partners. Clip the continuous redraw locally
    // so its paper halo cannot erase neighbouring parts of the same strand.
    for (const phase of [1 / 12, 5 / 12, 9 / 12]) {
      if (amount < phase) continue;

      const point = pointAt(phase);
      pen.save();
      pen.beginPath();
      pen.arc(point.x, point.y, Math.max(3, tubeWidth * 1.5), 0, Math.PI * 2);
      pen.clip();
      stroke(pathBetween(phase - .045, Math.min(amount, phase + .045)));
      pen.restore();
    }
  }

  private guide(motion: Motion, selection: Selection): void {
    if (motion.guide === 0) return;

    const { pen, tones } = this;
    const { guide } = layout(this.width, this.height);
    pen.strokeStyle = tones.ink;
    pen.lineWidth = .7;
    pen.beginPath();
    pen.arc(guide.cx, guide.cy, guide.radius, Math.PI / 2, Math.PI / 2 + 2 * Math.PI * motion.guide);
    pen.stroke();

    if (motion.guide < 1) return;

    if (this.phone) {
      const y = guide.cy - guide.radius;
      const lift = this.width < 292 ? motion.lastMarker : 0;
      drawLine(pen, mix(guide.cx - guide.radius - 3, guide.cx, lift), y - 3 * lift, mix(guide.cx - 3, guide.cx, lift), y - 1.5 * lift, tones.ink, .5);
      this.text('∞', mix(guide.cx - guide.radius - 13, guide.cx, lift), y - 9 * lift, 16, true);
    } else this.text('∞', guide.cx, guide.cy - guide.radius - 18, 20, true);
    this.text('0', guide.cx, guide.cy + guide.radius + (this.phone ? 13 : 18), this.phone ? 13 : 16, true);
    const angle = movingAngle(selection.from.angle, selection.to.angle, selection.amount);
    const point = this.atAngle(angle);
    pen.fillStyle = tones.ink;
    pen.beginPath();
    pen.arc(point.x, point.y, 3 + 1.5 * motion.lastMarker, 0, Math.PI * 2);
    pen.fill();
  }

  private comparison(motion: Motion, selection: Selection): void {
    if (motion.comparisonCross === 0) return;

    const { pen, tones } = this;
    const { guide } = layout(this.width, this.height);
    const primaryAngle = movingAngle(selection.from.angle, selection.to.angle, selection.amount);
    const secondaryAngle = movingAngle(
      movingAngle(this.model.examples.one.angle, this.model.examples.half.angle, motion.question),
      this.model.examples.negativeTwo.angle,
      motion.niWu,
    );
    const first = this.atAngle(primaryAngle);
    const second = this.atAngle(secondaryAngle);
    const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
    drawLine(pen, first.x, first.y, mix(first.x, second.x, motion.comparisonCross), mix(first.y, second.y, motion.comparisonCross), tones.ink, .6, [3, 3]);
    const cross = 6 * motion.comparisonCross * (1 - motion.question);

    if (cross > 0) {
      drawLine(pen, midpoint.x - cross, midpoint.y - cross, midpoint.x + cross, midpoint.y + cross, tones.ink, 1.2);
      drawLine(pen, midpoint.x - cross, midpoint.y + cross, midpoint.x + cross, midpoint.y - cross, tones.ink, 1.2);
    }

    if (motion.question > 0) {
      pen.strokeStyle = tones.ink;
      pen.lineWidth = 1;
      pen.beginPath();
      pen.arc(second.x, second.y, 3, 0, Math.PI * 2);
      pen.stroke();
    }

    const boxes = motion.comparisonThread * (1 - motion.window);

    if (boxes > 0) {
      const size = (this.phone ? 19 : 29) * boxes;

      for (const direction of [-1, 1]) {
        const x = guide.cx - guide.radius * .25;
        const y = guide.cy + direction * guide.radius * .29;
        pen.strokeStyle = tones.ink;
        pen.lineWidth = .8;
        pen.strokeRect(x - size / 2, y - size / 2, size, size);
      }

      this.text('?', guide.cx - guide.radius * .25, guide.cy, this.phone ? 15 : 20, true);
    }
  }

  private ticks(motion: Motion): void {
    if (motion.window === 0) return;

    const { guide } = layout(this.width, this.height);
    const { pen, tones } = this;

    for (const [index, slope] of this.model.window.entries()) {
      const grow = clamp(motion.window * this.model.window.length - index);
      const removal = !slope.niWu ? motion.niWu : !slope.hanselman ? motion.hanselman : !slope.dlme ? motion.instanton : 0;
      const amount = grow * (1 - removal);

      if (amount === 0) continue;

      const radius = guide.radius - 9 * removal * (1 - removal);
      const first = this.atAngle(slope.angle, radius - 3 * amount);
      const second = this.atAngle(slope.angle, radius + 3 * amount);
      drawLine(pen, first.x, first.y, second.x, second.y, tones.ink, slope.dlme ? 1.2 : .65);
    }

    if (motion.instanton > 0) {
      for (const slope of [this.model.examples.negativeTwo, this.model.examples.two]) {
        const point = this.atAngle(slope.angle, guide.radius + 16);
        const tick = this.atAngle(slope.angle);
        const sign = Math.sign(slope.p);
        const value = slope.label.replace('-', '−');
        const size = this.phone ? 13 : 16;
        const y = point.y - (sign > 0 ? 4 : 0);
        pen.save();
        pen.font = `${size}px "Garamond Math", serif`;
        pen.textAlign = 'center';
        pen.textBaseline = 'middle';
        const metrics = pen.measureText(value);
        pen.restore();
        const halfPaper = (sign > 0 ? metrics.actualBoundingBoxLeft : metrics.actualBoundingBoxRight) + 2;
        const paperTop = y - metrics.actualBoundingBoxAscent - 2;
        const paperBottom = y + metrics.actualBoundingBoxDescent + 2;
        const nearY = Math.max(0, tick.y - paperBottom - 1);
        const ringHeight = this.phone ? 18 : 26;
        const ringReach = guide.radius * .93 * Math.sqrt(Math.max(0, 1 - (nearY / ringHeight) ** 2)) + 1;
        const stroke = this.phone ? 7 : 10;
        const slashTop = Math.max(paperTop - 1.1, tick.y - stroke);
        const slashBottom = Math.min(paperBottom + 1.1, tick.y + stroke);
        const slashReach = slashTop <= slashBottom ? Math.abs(tick.x - guide.cx) + sign * (tick.y - (sign > 0 ? slashTop : slashBottom)) + 1.1 : 0;
        const reach = Math.max(ringReach, slashReach) + halfPaper + 2;
        const offset = Math.max(0, reach - Math.abs(point.x - guide.cx)) * motion.lastMarker;
        const x = point.x + sign * offset;

        if (offset > 4) drawLine(pen, tick.x, tick.y, x - sign * (halfPaper + 1), y, tones.muted, .5);

        this.text(value, x, y, size, true);
      }
    }
  }

  private project(point: TorusCurvePoint): Point {
    const { glyph } = layout(this.width, this.height);
    const scale = Math.min(glyph.width / 2.64, glyph.height / 1.52);

    return { x: glyph.cx + point.x * scale, y: glyph.cy + (.46 * point.y - .8 * point.z) * scale };
  }

  private boundaryCurve(curve: BoundaryCurve, amount: number, alternate = false): void {
    if (amount === 0) return;

    const { pen, tones } = this;
    const end = amount * (curve.points.length - 1);
    pen.beginPath();
    let previous: Point | null = null;

    for (const [index, point] of curve.points.entries()) {
      const projected = this.project(point);

      if (previous === null) pen.moveTo(projected.x, projected.y);
      else pen.lineTo(mix(previous.x, projected.x, clamp(end - index + 1)), mix(previous.y, projected.y, clamp(end - index + 1)));

      previous = projected;

      if (index >= end) break;
    }

    pen.strokeStyle = tones.paper;
    pen.lineWidth = 2.8;
    pen.stroke();
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.15;
    pen.setLineDash(alternate ? [3, 2] : []);
    pen.stroke();
    pen.setLineDash([]);
  }

  private glyph(motion: Motion, selection: Selection): void {
    if (motion.slopeOne === 0) return;

    const { glyph, text } = layout(this.width, this.height);
    const scale = Math.min(glyph.width / 2.64, glyph.height / 1.52);
    const { pen, tones } = this;
    pen.lineWidth = .65;
    pen.strokeStyle = tones.ink;

    for (const [rx, ry] of [[1.32, .755], [.68, .165]] as const) {
      pen.beginPath();
      pen.ellipse(glyph.cx, glyph.cy, rx * scale, ry * scale, 0, 0, Math.PI * 2);
      pen.stroke();
    }

    const moving = selection.amount > 0 && selection.amount < 1;
    const selected = moving && selection.amount < .5 ? selection.from : selection.to;
    const amount = moving ? Math.abs(2 * selection.amount - 1) : 1;
    const curve = this.curve(selected);
    this.boundaryCurve(curve, amount);

    if (motion.lastCurves > 0) this.boundaryCurve(this.curve(this.model.examples.negativeTwo), motion.lastCurves, true);

    if (moving) this.text('CHANGING SLOPE · GRAPHIC MOVE', glyph.cx, text.fractionY, this.phone ? 7.5 : 9);
    else if (motion.lastCurves === 1) {
      this.text('2μ + λ    −2μ + λ', glyph.cx, text.fractionY, this.phone ? 13 : 16, true);
      this.text('SAME KNOT · SAME AMBIENT ORIENTATION', glyph.cx, text.fractionY + (this.phone ? 16 : 24), this.phone ? 7 : 9);
    } else {
      this.text(selected.label.replace('-', '−'), glyph.cx, text.fractionY, this.phone ? 17 : 21, true);
      this.text(`p=${selected.p} · q=${selected.q}`, glyph.cx, text.fractionY + (this.phone ? 16 : 24), this.phone ? 9 : 11, true);
    }
  }

  private claim(motion: Motion): void {
    if (motion.claimRing === 0) return;

    const { guide } = layout(this.width, this.height);
    const { pen, tones } = this;
    const centerY = guide.cy + this.model.examples.two.y * guide.radius;
    pen.strokeStyle = tones.blue;
    pen.lineWidth = 2;
    pen.beginPath();
    pen.ellipse(guide.cx, centerY, guide.radius * .93, this.phone ? 18 : 26, 0, 0, Math.PI * 2 * motion.claimRing);
    pen.stroke();

    for (const slope of [this.model.examples.negativeTwo, this.model.examples.two]) {
      const point = this.atAngle(slope.angle);
      const extent = (this.phone ? 7 : 10) * motion.claimStroke;

      if (extent > 0) drawLine(pen, point.x - extent, point.y + extent, point.x + extent, point.y - extent, tones.blue, 2.2);
    }
  }

  draw(time: number): void {
    const { pen, width: w, height: h } = this;
    const motion = motionAt(time);
    const selection = this.selection(motion);
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();
    this.knot(motion);
    this.guide(motion, selection);
    this.comparison(motion, selection);
    this.ticks(motion);
    this.glyph(motion, selection);
    this.claim(motion);
    drawLastSlopesPanels(pen, w, h, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }
}

export function createLastSlopesFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new LastSlopesFilm(root, context);
}

import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText, type TextStyle } from '../../plate/canvas/wrapped-text';
import { buildCircleModel, rationalNumber, rationalText, type Point, type CircleExample } from './math';
import { drawCirclePanels } from './panels';
import { motionAt, SCENE_TIMES } from './story';

type Motion = ReturnType<typeof motionAt>;

type Mark = { point: Point; size: number };

type Field = { x: number; y: number; radius: number };

function interpolate(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

function marks(points: readonly Point[]): Mark[] {
  return points.map(point => ({ point, size: 1 }));
}

function morph(before: readonly Mark[], after: readonly Point[], amount: number): Mark[] {
  const result: Mark[] = [];

  for (let index = 0; index < Math.max(before.length, after.length); index++) {
    const a = before[index];
    const b = after[index];
    const from = a?.point ?? { x: 0, y: 0 };
    const to = b ?? { x: 0, y: 0 };
    result.push({ point: interpolate(from, to, amount), size: mix(a?.size ?? 0, b ? 1 : 0, amount) });
  }

  return result;
}

function circlePoint(angle: number): Point {
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

class CircleFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly model = buildCircleModel();
  private readonly simplexPlot = Array.from({ length: this.model.simplex.vertices.length }, (_, index) => circlePoint(-Math.PI / 4 + Math.PI * index / 2));
  private readonly polygonPlot: Point[] = [];
  private readonly heptagon = [-.40, .14, 1.05, 1.79, 2.7, 3.8, 5.16].map(circlePoint);

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 5 });

    for (const index of this.model.polygon.rectangleIndices) {
      const point = this.model.polygon.vertices[index];

      if (!point) throw new Error('The lifted rectangle needs its parent polygon vertex.');

      this.polygonPlot.push(point);
    }

    for (const [index, point] of this.model.polygon.vertices.entries()) {
      if (!this.model.polygon.rectangleIndices.some(value => value === index)) this.polygonPlot.push(point);
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

  private field(): Field {
    const { width: w, height: h } = this;

    return { x: w * (this.phone ? .5 : .28), y: h * (this.phone ? .27 : .37), radius: Math.min(w * (this.phone ? .38 : .23), h * (this.phone ? .20 : .32)) };
  }

  private project(point: Point): Point {
    const field = this.field();

    return { x: field.x + point.x * field.radius, y: field.y - point.y * field.radius };
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
    this.stipple(motion);
    this.spine(motion);
    const current = this.configuration(time, motion);
    this.connections(time, motion, current);
    this.drawMarks(time, motion, current);
    this.annotations(time, motion);

    if (time >= SCENE_TIMES.tensor && time < SCENE_TIMES.exact) this.matrix();
    if (motion.rounding === 1 && motion.roundingReturn < 1) this.magnifier(motion, current);

    drawCirclePanels(pen, w, h, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }

  private stipple(motion: Motion): void {
    if (motion.fieldRetreat === 1) return;

    const { pen, width: w, height: h, tones } = this;
    const count = 150;
    const visible = Math.floor(count * motion.field);

    for (let index = 0; index < visible; index++) {
      const x = w * (.04 + .92 * ((index * 73 + 17) % 157) / 156);
      const y = h * (.06 + .44 * ((index * 47 + 29) % 151) / 150);
      const direction = x < w / 2 ? -1 : 1;
      const px = x + direction * motion.fieldRetreat * w * .18;
      const radius = .75 * (1 - motion.fieldRetreat);
      pen.beginPath();
      pen.arc(px, y, radius, 0, Math.PI * 2);
      pen.strokeStyle = tones.ink;
      pen.lineWidth = .5;

      if (index % 2) pen.stroke();
      else {
        pen.fillStyle = tones.ink;
        pen.fill();
      }
    }
  }

  private spine(motion: Motion): void {
    const { pen, tones } = this;
    const field = this.field();
    pen.beginPath();
    pen.arc(field.x, field.y, field.radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * motion.circle);
    pen.strokeStyle = tones.ink;
    pen.lineWidth = .85;
    pen.stroke();

    if (motion.claim <= 0) return;

    pen.beginPath();
    pen.arc(field.x, field.y, field.radius + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * motion.claim);
    pen.strokeStyle = tones.blue;
    pen.lineWidth = 2;
    pen.setLineDash(motion.sixth > 0 ? [5, 4] : []);
    pen.stroke();
    pen.setLineDash([]);
    const x = field.x;
    const y = this.phone ? this.height * .05 : 10;
    pen.strokeRect(x - 47, y - 8, 94, 16);
    drawText(pen, 'CLAIMED TEST', x, y + .5, { size: 9, color: tones.blue, paper: tones.paper });
  }

  private configuration(time: number, motion: Motion): Mark[] {
    const { model } = this;

    if (time < SCENE_TIMES.pigeonhole) return [];
    if (time < SCENE_TIMES.spherical) return this.simplexPlot.map(point => ({ point: { x: point.x * motion.simplex, y: point.y * motion.simplex }, size: motion.simplex }));

    let current = morph(marks(this.simplexPlot), model.triangle.plot, motion.triangle);
    current = morph(current, model.square.plot, motion.square);
    const collinear = model.collinear.plot.map(point => ({ x: point.x - 1, y: point.y }));
    current = morph(current, collinear, motion.collinear);
    current = morph(current, model.square.plot, motion.sphereReturn);

    if (time < SCENE_TIMES.transitive) return current;

    const clock = motion.rotation * model.polygon.rotations.length;
    const step = Math.min(model.polygon.rotations.length - 1, Math.floor(clock));
    const local = Math.min(1, (clock - step) * 2);
    const eased = local * local * (3 - 2 * local);
    const angle = 2 * Math.PI * (step + eased) / model.polygon.rotations.length;
    const polygon = this.polygonPlot.map((point, index) => {
      const radius = index < model.polygon.rectangleIndices.length ? 1 - .18 * motion.rectangle : 1;

      return { x: radius * (point.x * Math.cos(angle) - point.y * Math.sin(angle)), y: radius * (point.x * Math.sin(angle) + point.y * Math.cos(angle)) };
    });
    current = morph(current, polygon, motion.polygon);

    if (time < SCENE_TIMES.kite) return current;

    current = morph(current, model.kite.plot, motion.kite);

    if (time < SCENE_TIMES.heptagon) return current;

    current = morph(current, this.heptagon, motion.heptagon);

    if (time < SCENE_TIMES.classification) return current;

    current = morph(current, model.kite.plot, motion.kiteReturn);
    const first = model.kite.plot[0];

    if (!first) throw new Error('The point-count consequence needs its retained first circle mark.');

    current = current.map((mark, index) => index === 0 ? mark : { point: interpolate(mark.point, first, motion.fivePreparation), size: mark.size * (1 - motion.fivePreparation) });

    if (time < SCENE_TIMES.fivePoints) return current;

    const circleMarks: Mark[] = [{ point: first, size: 1 }];

    for (let index = 1; index < 5; index++) {
      const amount = Math.max(0, Math.min(1, motion.five * 4 - (index - 1)));
      const start = 2 * Math.PI * (index - 1) / model.polygon.vertices.length;
      const end = 2 * Math.PI * index / model.polygon.vertices.length;
      circleMarks.push({ point: circlePoint(mix(start, end, amount)), size: amount });
    }

    circleMarks.push({ point: circlePoint(2 * Math.PI * (4 + motion.sixth) / model.polygon.vertices.length), size: motion.sixth });
    current = morph(circleMarks, model.square.plot, motion.tensorPreparation);

    if (time < SCENE_TIMES.tensor) return current;

    const split = motion.tensorSplit * (1 - motion.tensorMerge);
    current = model.square.plot.map(point => ({ point: { x: point.x * (1 - .45 * split) - .55 * split, y: point.y * (1 - .45 * split) }, size: 1 }));

    if (split > 0) {
      for (const point of model.square.plot) current.push({ point: { x: point.x * (1 - .45 * split) + .55 * split, y: point.y * (1 - .45 * split) }, size: split });
    }

    if (time < SCENE_TIMES.exact) return current;

    const rounded = motion.rounding * (1 - motion.roundingReturn);
    const exact = model.rounding.plot.map((point, index) => {
      const target = model.rounding.roundedPlot[index];

      if (!target) throw new Error('Each rounded coordinate needs its exact source point.');

      return interpolate(point, target, rounded);
    });
    current = morph(current, exact, motion.exact);
    const closing = [...model.kite.plot, ...model.square.plot];

    return morph(current, closing, motion.closingMorph);
  }

  private curve(points: readonly Point[], width = .8, dashed = false): void {
    const { pen, tones } = this;

    if (!points.length) return;

    pen.save();
    pen.beginPath();

    for (const [index, point] of points.entries()) {
      const projected = this.project(point);

      if (index === 0) pen.moveTo(projected.x, projected.y);
      else pen.lineTo(projected.x, projected.y);
    }

    pen.closePath();
    pen.strokeStyle = tones.ink;
    pen.lineWidth = width;
    pen.setLineDash(dashed ? [3, 3] : []);
    pen.stroke();
    pen.restore();
  }

  private connections(time: number, motion: Motion, current: readonly Mark[]): void {
    const { model, pen, tones } = this;

    if (time >= SCENE_TIMES.pigeonhole && time < SCENE_TIMES.spherical) {
      const trial = motion.trialsComplete ? model.simplex.representativeTrial : model.simplex.trials[motion.trialIndex];

      if (!trial) throw new Error('The finite trial animation needs its enumerated assignment.');

      for (const pair of model.simplex.pairs) {
        const a = current[pair.a];
        const b = current[pair.b];

        if (!a || !b) throw new Error('Each unit pair needs its two schematic projected vertices.');

        const from = this.project(a.point);
        const to = this.project(b.point);
        const selected = trial.sameInkPairs[0];
        const same = selected?.[0] === pair.a && selected[1] === pair.b;
        drawLine(pen, from.x, from.y, to.x, to.y, tones.ink, same ? 2 : .6);
      }
    } else if (time >= SCENE_TIMES.spherical && time < SCENE_TIMES.transitive) {
      this.curve(current.slice(0, motion.square > 0 && motion.collinear === 0 || motion.sphereReturn > 0 ? 4 : 3).map(mark => mark.point));
    } else if (time >= SCENE_TIMES.transitive && time < SCENE_TIMES.kite) {
      if (motion.rectangle > 0) {
        for (let index = 0; index < model.polygon.rectangleIndices.length; index++) {
          const site = this.polygonPlot[index];
          const carried = current[index];

          if (!site || !carried) throw new Error('Every lifted rectangle corner needs its original parent site.');

          const from = this.project(site);
          const to = this.project(carried.point);
          drawLine(pen, from.x, from.y, to.x, to.y, tones.ink, .55, [2, 3]);
          this.glyph(from, .65 * motion.rectangle, 1);
        }
      }

      this.curve(current.slice(0, model.polygon.rectangleIndices.length).map(mark => mark.point), 1.1);
    } else if (time >= SCENE_TIMES.kite && time < SCENE_TIMES.heptagon || time >= SCENE_TIMES.classification && time < SCENE_TIMES.fivePoints) {
      this.curve(current.slice(0, 4).map(mark => mark.point), 1);
    } else if (time >= SCENE_TIMES.tensor && time < SCENE_TIMES.exact) {
      this.curve(current.slice(0, 4).map(mark => mark.point));

      if (current.length > 4) this.curve(current.slice(4).map(mark => mark.point), .8, true);
    } else if (motion.closingMorph > 0) {
      this.curve(current.slice(0, 4).map(mark => mark.point), 1.1);
      this.curve(current.slice(4).map(mark => mark.point), .8, true);
    }
  }

  private glyph(point: Point, size: number, ink: number): void {
    if (size <= 0) return;

    const { pen, tones } = this;
    const radius = (this.phone ? 3.5 : 5) * size;
    pen.beginPath();
    pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    pen.fillStyle = ink === 0 ? tones.ink : tones.paper;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1;
    pen.fill();
    pen.stroke();

    if (ink === 2) {
      pen.save();
      pen.clip();

      for (let offset = -radius * 2; offset <= radius * 2; offset += 3) drawLine(pen, point.x - radius, point.y + offset, point.x + radius, point.y + offset - 2 * radius, tones.ink, .8);

      pen.restore();
    }
  }

  private drawMarks(time: number, motion: Motion, current: readonly Mark[]): void {
    const trial = motion.trialsComplete ? this.model.simplex.representativeTrial : this.model.simplex.trials[motion.trialIndex];

    if (!trial) throw new Error('The same-ink pair scene needs its actual colour trial.');

    for (const [index, mark] of current.entries()) {
      const point = this.project(mark.point);
      const ink = time < SCENE_TIMES.spherical ? trial.inks[index] : 0;

      if (ink === undefined) throw new Error('Every schematic simplex vertex needs its assigned ink.');

      this.glyph(point, mark.size, ink);

      if (time >= SCENE_TIMES.pigeonhole && time < SCENE_TIMES.spherical && motion.simplex === 1) {
        const field = this.field();
        this.text(`v${String.fromCodePoint(0x2081 + index)}`, point.x + (point.x - field.x) * .15, point.y + (point.y - field.y) * .15, this.phone ? 11 : 14, true, true);
      }
    }
  }

  private annotations(time: number, motion: Motion): void {
    const { width: w, height: h, model } = this;
    const x = this.field().x;

    if (time >= SCENE_TIMES.spherical && time < SCENE_TIMES.graham) {
      const moving = motion.triangle < 1 || [motion.square, motion.collinear, motion.sphereReturn].some(value => value > 0 && value < 1);
      const collinear = motion.collinear === 1 && motion.sphereReturn === 0;

      if (moving) this.text('MOVING · READ WHEN SETTLED', x, h * (this.phone ? .49 : .77), this.phone ? 10 : 14);
      else if (collinear) {
        for (const [index, point] of model.collinear.plot.entries()) {
          const placed = this.project({ x: point.x - 1, y: point.y });
          const original = model.collinear.points[index];

          if (!original) throw new Error('Each collinear mark needs its exact coordinate.');

          this.text(rationalText(original[0]), placed.x, placed.y + 18, this.phone ? 14 : 18, true, true);
        }
      }
      else {
        const example: CircleExample = motion.square === 1 ? model.square : model.triangle;
        this.text(`O = (${example.centreText.join(', ')})   r² = ${example.radiusSquaredText}`, x, h * (this.phone ? .49 : .77), this.phone ? 12 : 18, true);
        this.text('ORIGINAL COORDINATES · DISPLAY RESCALED', x, h * (this.phone ? .53 : .84), this.phone ? 8 : 10);
      }
    }

    if (time >= SCENE_TIMES.transitive && time < SCENE_TIMES.kite) {
      const mark = this.configuration(time, motion)[0];

      if (!mark) throw new Error('The transitive action needs its retained labelled vertex.');

      const first = this.project(mark.point);
      this.text('v₀', first.x + 12, first.y - 12, this.phone ? 12 : 16, true, true);
      this.text(motion.rectangle > 0 ? `${model.polygon.vertices.length}-GON PARENT · RECTANGLE LIFTED` : `REGULAR ${model.polygon.vertices.length}-GON`, x, h * (this.phone ? .49 : .78), this.phone ? 9 : 12);
    }

    if (time >= SCENE_TIMES.kite && time < SCENE_TIMES.heptagon) {
      const values = model.kite.sideSquares.map(rationalText);
      this.text(motion.kite === 1 ? `SIDES²: ${values.join(', ')}` : 'MOVING TO THE CYCLIC KITE', x, h * (this.phone ? .49 : .78), this.phone ? 11 : 15, motion.kite === 1);
    }

    if (time >= SCENE_TIMES.fivePoints && time < SCENE_TIMES.tensor) {
      const total = 1 + Math.ceil(motion.five * 4) + Number(motion.sixth > 0);
      this.text(motion.tensorPreparation > 0 ? 'CARRYING TO THE Q EXAMPLE' : `${total} POINTS`, x, h * (this.phone ? .49 : .78), this.phone ? 12 : 16, true);
    }

    if (time >= SCENE_TIMES.tensor && time < SCENE_TIMES.exact) {
      for (const [index, point] of model.square.plot.entries()) {
        const original = model.square.points[index];

        if (!original) throw new Error('The rescaled display needs its original rational coordinate label.');

        if (motion.tensorSplit * (1 - motion.tensorMerge) > 0) continue;

        const projected = this.project(point);
        this.text(`(${original.map(rationalText).join(',')})`, projected.x, projected.y + (point.y < 0 ? 17 : -17), this.phone ? 10 : 13, true, true);
      }
    }

    if (time >= SCENE_TIMES.exact && time < SCENE_TIMES.review && motion.rounding === 1 && motion.roundingReturn === 0) {
      const original = model.rounding.points[1];
      const rounded = model.rounding.roundedPoints[1];

      if (!original || !rounded) throw new Error('The rounding comparison needs its computed exact and rounded coordinates.');

      this.text(`${rationalText(original[0])} → ${rationalNumber(rounded[0]).toFixed(2)}`, w * (this.phone ? .33 : .16), h * (this.phone ? .47 : .77), this.phone ? 12 : 16, true);
      this.text(`${rationalText(original[1])} → ${rationalNumber(rounded[1]).toFixed(2)}`, w * (this.phone ? .33 : .16), h * (this.phone ? .51 : .83), this.phone ? 12 : 16, true);
      this.text(`${rationalText(model.rounding.fourthResidual)} ≠ 0`, w * (this.phone ? .33 : .16), h * (this.phone ? .55 : .89), this.phone ? 10 : 13, true);
    }
  }

  private matrix(): void {
    const { width: w, height: h, model, pen, tones } = this;
    const center = { x: w * (this.phone ? .56 : .80), y: h * (this.phone ? .73 : .37) };
    const dx = this.phone ? 32 : 44;
    const dy = this.phone ? 17 : 22;

    for (const [rowIndex, row] of model.tensor.matrix.entries()) {
      for (const [column, value] of row.entries()) this.text(rationalText(value).replace('-', '−'), center.x + (column - 1) * dx, center.y + (rowIndex - 1) * dy, this.phone ? 13 : 17, true);
    }

    for (const sign of [-1, 1]) {
      const x = center.x + sign * dx * 1.5;
      drawLine(pen, x, center.y - dy * 1.5, x, center.y + dy * 1.5, tones.ink, 1);
      drawLine(pen, x, center.y - dy * 1.5, x - sign * 5, center.y - dy * 1.5, tones.ink, 1);
      drawLine(pen, x, center.y + dy * 1.5, x - sign * 5, center.y + dy * 1.5, tones.ink, 1);
    }
  }

  private magnifier(motion: Motion, current: readonly Mark[]): void {
    const { model, width: w, height: h, pen, tones } = this;
    const q = model.rounding.roundedPlot[3];

    if (!q) throw new Error('The rounding magnifier needs the fourth point.');

    const fit = model.rounding.firstThreeCircle;
    const center = { x: rationalNumber(fit.centre[0]), y: rationalNumber(fit.centre[1]) };
    const radius = Math.sqrt(rationalNumber(fit.radiusSquared));
    const length = Math.hypot(q.x - center.x, q.y - center.y);
    const foot = { x: center.x + (q.x - center.x) * radius / length, y: center.y + (q.y - center.y) * radius / length };
    const middle = interpolate(q, foot, .5);
    const inset = { x: w * (this.phone ? .82 : .43), y: h * (this.phone ? .485 : .80), radius: (this.phone ? 24 : 42) * (1 - motion.roundingReturn) };
    const zoom = 40;
    const scale = this.field().radius * zoom;
    const map = (point: Point): Point => ({ x: inset.x + (point.x - middle.x) * scale, y: inset.y - (point.y - middle.y) * scale });
    const carried = current[3];

    if (!carried) throw new Error('The retiring magnifier needs its carried source mark.');

    const from = this.project(carried.point);
    drawLine(pen, from.x, from.y, inset.x - inset.radius * .6, inset.y - inset.radius * .8, tones.ink, .6);
    pen.save();
    pen.beginPath();
    pen.arc(inset.x, inset.y, inset.radius, 0, Math.PI * 2);
    pen.fillStyle = tones.paper;
    pen.fill();
    pen.strokeStyle = tones.ink;
    pen.lineWidth = .9;
    pen.stroke();
    pen.clip();
    const fc = map(center);
    pen.beginPath();
    pen.arc(fc.x, fc.y, radius * scale, 0, Math.PI * 2);
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1;
    pen.stroke();
    const a = map(q);
    const b = map(foot);
    drawLine(pen, a.x, a.y, b.x, b.y, tones.ink, .8);
    this.glyph(a, .85, 0);
    this.glyph(b, .7, 1);
    pen.restore();

    if (motion.roundingReturn === 0) this.text(`×${zoom}`, inset.x, inset.y + inset.radius + 12, this.phone ? 11 : 15, true, true);
  }
}

export function createCircleFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new CircleFilm(root, context);
}

import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { buildCarryTreeModel, circleRotation, residueAt, type TreeNode } from './math';
import { drawCarryTreePanels } from './panels';
import { motionAt } from './story';

type Point = { x: number; y: number };

type Motion = ReturnType<typeof motionAt>;

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

class CarryTreeFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly model = buildCarryTreeModel();

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

  private circleFrame() {
    return {
      x: this.width * (this.phone ? .29 : .18),
      y: this.height * (this.phone ? .13 : .27),
      radius: this.phone ? this.height * .09 : Math.min(this.width * .13, this.height * .21),
    };
  }

  private action(motion: Motion) {
    if (motion.toyRotations < 1) {
      const clock = motion.toyRotations * this.model.modulus;
      const from = Math.floor(clock);
      const fraction = clock - from;
      const travel = clamp(fraction / .65);

      return { input: from + Number(travel > 0), turns: (from + travel) / this.model.modulus, moving: travel > 0 && travel < 1 };
    }

    const clock = motion.actionClock;
    const from = this.model.modulus + Math.floor(clock);
    const travel = clamp((clock - Math.floor(clock)) / .55);

    return { input: from + Number(travel > 0), turns: (from + travel) / this.model.modulus, moving: travel > 0 && travel < 1 };
  }

  private circle(motion: Motion): void {
    const { pen, tones } = this;
    const circle = this.circleFrame();
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.3;
    pen.beginPath();
    pen.arc(circle.x, circle.y, circle.radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * motion.circle);
    pen.stroke();

    if (motion.circle === 0) return;

    const rough = motion.rough * (1 - motion.tree);

    if (rough > 0) {
      pen.lineWidth = .8;
      pen.beginPath();

      for (let index = 0; index <= 80; index++) {
        const angle = 2 * Math.PI * index / 80 - Math.PI / 2;
        const radius = circle.radius * (1 + rough * (.08 * Math.sin(7 * angle) + .035 * Math.cos(13 * angle)));
        const x = circle.x + Math.cos(angle) * radius;
        const y = circle.y + Math.sin(angle) * radius;

        if (index === 0) pen.moveTo(x, y);
        else pen.lineTo(x, y);
      }

      pen.stroke();
    }

    let turns = motion.rotations + motion.roughHold;

    if (motion.toyRotations > 0) turns = this.action(motion).turns;

    const angle = turns * Math.PI * 2 - Math.PI / 2;
    const radius = circle.radius * (1 + rough * (.08 * Math.sin(7 * angle) + .035 * Math.cos(13 * angle)));
    const point = { x: circle.x + Math.cos(angle) * radius, y: circle.y + Math.sin(angle) * radius };
    pen.fillStyle = tones.ink;
    pen.beginPath();
    pen.arc(point.x, point.y, this.phone ? 3 : 4.5, 0, Math.PI * 2);
    pen.fill();

    if (motion.quotient > 0) {
      const tick = this.model.rotations;

      for (const rotation of tick) {
        const angle = rotation.turns * Math.PI * 2 - Math.PI / 2;
        drawLine(pen, circle.x + Math.cos(angle) * (circle.radius - 3), circle.y + Math.sin(angle) * (circle.radius - 3), circle.x + Math.cos(angle) * (circle.radius + 3), circle.y + Math.sin(angle) * (circle.radius + 3), tones.ink, .8);
      }

      const action = this.action(motion);

      if (motion.toyRotations > 0) {
        const rotation = circleRotation(action.input, this.model.toyLevel);
        const label = action.moving ? `TURNING TO a=${action.input}` : `a=${action.input} · ${rotation.label} TURN`;
        this.text(label, this.width * (this.phone ? .29 : .18), this.height * (this.phone ? .245 : .54), this.phone ? 8 : 11, true);
      }
    }
  }

  private sphere(motion: Motion): void {
    if (motion.sphere === 0) return;

    const { pen, width: w, height: h, tones } = this;
    const original = { x: w * (this.phone ? .77 : .18), y: h * (this.phone ? .13 : .61) };
    const parked = { x: w * (this.phone ? .94 : .32), y: h * (this.phone ? .025 : .08) };
    const shrink = clamp(motion.tree / .4);
    const travel = clamp((motion.tree - .4) / .6);
    let x = mix(original.x, parked.x, travel);
    let y = mix(original.y, parked.y, travel);

    if (!this.phone) {
      if (travel < 1 / 3) {
        x = mix(original.x, w * .335, travel * 3);
        y = original.y;
      } else if (travel < 5 / 6) {
        x = w * .335;
        y = mix(original.y, parked.y, (travel - 1 / 3) * 2);
      } else {
        x = mix(w * .335, parked.x, (travel - 5 / 6) * 6);
        y = parked.y;
      }
    }

    const radius = mix(this.phone ? h * .055 : h * .075, this.phone ? 7 : 10, shrink) * motion.sphere;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = .8;
    pen.beginPath();
    pen.arc(x, y, radius, 0, Math.PI * 2);
    pen.moveTo(x + radius * .42, y);
    pen.ellipse(x, y, radius * .42, radius, 0, 0, Math.PI * 2);
    pen.moveTo(x + radius, y);
    pen.ellipse(x, y, radius, radius * .32, 0, 0, Math.PI * 2);
    pen.stroke();

    if (motion.tree === 1) this.text('SO(3)', x, y + radius + 9, this.phone ? 7 : 9, true);
  }

  private nodePoint(node: TreeNode, motion: Motion): Point {
    const left = this.width * (this.phone ? .08 : .40);
    const width = this.width * (this.phone ? mix(.88, .58, motion.quotient) : .30);
    const top = this.phone ? mix(.28, .31, motion.quotient) : .14;
    const gap = this.phone ? mix(.052, .045, motion.quotient) : .10;
    const point = { x: left + (node.order + .5) / 2 ** node.level * width, y: this.height * (top + node.level * gap) };

    if (this.phone && node.level === this.model.maxLevel && node.parentOrder !== null) {
      const parent = this.model.levels[node.level - 1]?.[node.parentOrder];

      if (!parent) throw new Error('Every finite coset disc must have its containing parent.');

      const target = this.nodePoint(parent, motion);

      return { x: mix(point.x, target.x, motion.quotient), y: mix(point.y, target.y, motion.quotient) };
    }

    return point;
  }

  private nodeRadius(level: number): number {
    const radii = this.phone ? [11, 9, 8, 7, 6] : [13, 10, 9, 8, 7];
    const radius = radii[level];

    if (radius === undefined) throw new Error('Each displayed coset level needs a finite node radius.');

    if (level === this.model.maxLevel) {
      const spacing = this.width * (this.phone ? .88 : .30) / 2 ** level;

      return Math.min(radius, spacing * .42);
    }

    return radius;
  }

  private levelAmount(level: number, motion: Motion): number {
    if (this.phone && level === this.model.maxLevel) return clamp(motion.odometer * 16) * (1 - motion.quotient);

    const levels = this.phone ? this.model.maxLevel : this.model.maxLevel + 1;

    return clamp(motion.tree * levels - level);
  }

  private odometerState(motion: Motion) {
    const progress = this.phone ? clamp((motion.odometer - 1 / 16) / (15 / 16)) : motion.odometer;
    const clock = progress * this.model.odometer.length;
    const index = Math.min(this.model.odometer.length - 1, Math.floor(clock));
    const row = this.model.odometer[index];

    if (!row) throw new Error('Each odometer step must come from its exact finite carry table.');

    return { row, phase: progress === 1 ? 1 : clock - index };
  }

  private tree(motion: Motion): void {
    if (motion.tree === 0) return;

    const { pen, tones, model } = this;
    let active = 0;

    if (motion.odometer > 0 && motion.quotient === 0) {
      const state = this.odometerState(motion);
      active = state.phase < .6 ? state.row.from : state.row.to;
    } else if (motion.toyRotations > 0) active = this.action(motion).input;

    for (const level of model.levels) {
      for (const node of level) {
        const amount = this.levelAmount(node.level, motion);

        if (amount === 0) continue;

        const point = this.nodePoint(node, motion);
        const radius = this.nodeRadius(node.level) * amount;

        if (node.parentOrder !== null) {
          const parent = model.levels[node.level - 1]?.[node.parentOrder];

          if (!parent) throw new Error('An inclusion edge needs its containing residue coset.');

          const from = this.nodePoint(parent, motion);
          const parentRadius = this.nodeRadius(parent.level);
          drawLine(pen, from.x, from.y + parentRadius, mix(from.x, point.x, amount), mix(from.y + parentRadius, point.y - radius, amount), tones.ink, .65);
        }

        pen.fillStyle = tones.paper;
        pen.strokeStyle = tones.ink;
        pen.lineWidth = residueAt(active, node.level) === node.residue ? 1.7 : .7;
        pen.beginPath();
        pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
        pen.fill();
        pen.stroke();

        if (amount === 1 && !(this.phone && node.level === model.maxLevel && motion.quotient > 0)) {
          drawText(pen, node.level === 0 ? 'Z₂' : String(node.residue), point.x, point.y, {
            size: node.level === model.maxLevel ? 8 : this.phone ? 9 : 11,
            family: 'math',
            color: tones.ink,
          });
        }

        if (motion.kernel > 0 && node.level === model.toyLevel && node.residue === 0) {
          pen.lineWidth = 1.6;
          pen.beginPath();
          pen.arc(point.x, point.y, radius + 4 * motion.kernel, 0, Math.PI * 2);
          pen.stroke();
        }
      }
    }

    for (let level = 0; level <= model.maxLevel; level++) {
      if (this.levelAmount(level, motion) !== 1) continue;

      this.text(`k=${level}`, this.width * (this.phone ? .035 : .37), this.height * ((this.phone ? mix(.28, .31, motion.quotient) : .14) + level * (this.phone ? mix(.052, .045, motion.quotient) : .10)), this.phone ? 8 : 10, true);
    }
  }

  private carry(motion: Motion): void {
    if (motion.odometer === 0 || motion.quotient > 0) return;

    const { row, phase } = this.odometerState(motion);
    const { pen, width: w, height: h, tones } = this;
    const x = w * (this.phone ? .76 : .83);
    const top = h * (this.phone ? .05 : .12);
    const gap = this.phone ? 12 : 18;
    const size = this.phone ? 10 : 14;
    const labelX = x - this.width * (this.phone ? .16 : .11);
    this.text('BEFORE', labelX, top, this.phone ? 7 : 9);
    this.text('AFTER', labelX, top + (this.phone ? 25 : 35), this.phone ? 7 : 9);

    for (let index = 0; index < this.model.maxLevel; index++) {
      const before = row.beforeDigits[index];
      const after = row.afterDigits[index];

      if (before === undefined || after === undefined) throw new Error('The displayed carry needs both exact digit rows.');

      const point = x + (index - 1.5) * gap;
      this.text(String(before), point, top, size, true);
      this.text(String(after), point, top + (this.phone ? 25 : 35), size, true);
      const reached = clamp(phase * (row.carries + 1) - index);

      if (reached > 0 && index < Math.min(row.carries + 1, this.model.maxLevel)) drawLine(pen, point - gap * .4, top - 10, point - gap * .4 + gap * .8 * reached, top - 10, tones.ink, 1.7);
    }

    this.text('LOW DIGIT FIRST', x, top + (this.phone ? 44 : 60), this.phone ? 7 : 9);
    this.text(`${row.from} → ${row.nextInteger}`, x, h * (this.phone ? .235 : .34), this.phone ? 10 : 14, true);
    this.text(row.overflow ? '16: FIFTH DIGIT IS 1' : `${row.carries} CARRY${row.carries === 1 ? '' : 'S'}`, x, h * (this.phone ? .28 : .41), this.phone ? 7 : 9, true);
    const affected = Math.min(row.carries + 1, this.model.maxLevel);
    const pulse = clamp(phase) * affected;
    const level = Math.min(affected, Math.floor(pulse) + 1);
    const nodes = this.model.levels[level];
    const node = nodes?.find(item => item.residue === residueAt(row.from, level));

    if (node && node.parentOrder !== null) {
      const parent = this.model.levels[level - 1]?.[node.parentOrder];

      if (!parent) throw new Error('A carry pulse must follow a real prefix inclusion.');

      const from = this.nodePoint(parent, motion);
      const to = this.nodePoint(node, motion);
      const portion = clamp(pulse - (level - 1));
      const startY = from.y + this.nodeRadius(parent.level) + 3;
      const endY = to.y - this.nodeRadius(node.level) - 3;
      pen.fillStyle = tones.ink;
      pen.beginPath();
      pen.arc(mix(from.x, to.x, portion), mix(startY, endY, portion), 2, 0, Math.PI * 2);
      pen.fill();
    }
  }

  private ruler(motion: Motion): void {
    if (motion.ruler === 0) return;

    const { pen, width: w, height: h, tones } = this;
    const left = w * .06;
    const right = w * .94;
    const ending = this.phone ? 18 : 32;
    const cell = Math.min(this.phone ? 40 : 78, (right - left - ending) / 5);
    const y = h * (this.phone ? .66 : .77);
    const height = this.phone ? 24 : 34;
    const width = cell * 5;

    for (let index = 0; index < 5; index++) {
      const amount = clamp(motion.ruler * 5 - index);

      if (amount === 0) continue;

      const x = left + index * cell;
      pen.strokeStyle = tones.ink;
      pen.lineWidth = .8;
      pen.strokeRect(x, y - height / 2, cell - 2, height * amount);
      const known = index < 2 ? clamp(motion.classical * 2 - index) : index === 2 ? motion.pardon : 0;
      const fill = known * (1 - motion.publicReview);

      if (fill > 0) {
        pen.fillStyle = tones.ink;
        pen.fillRect(x, y - height / 2, cell - 2, height * fill);
      }

      if (index >= 3 && motion.openCase > 0 && motion.claimBracket < 1) {
        const length = height * motion.openCase * (1 - motion.claimBracket);
        pen.save();
        pen.beginPath();
        pen.rect(x + 1, y - height / 2 + 1, cell - 4, height - 2);
        pen.clip();
        pen.beginPath();

        for (let offset = 0; offset < cell + height; offset += 6) {
          pen.moveTo(x + offset, y + length / 2);
          pen.lineTo(x + offset - length, y - length / 2);
        }

        pen.lineWidth = .5;
        pen.stroke();
        pen.restore();
      }

      const color = fill > .5 ? tones.paper : tones.ink;
      drawText(pen, String(index + 1), x + (cell - 2) / 2, y, { size: this.phone ? 11 : 15, family: 'math', color, paper: fill > .5 ? tones.ink : tones.paper });

      if (index >= 3 && motion.claimGlyphs > 0) {
        const radius = (this.phone ? 3 : 4) * motion.claimGlyphs;
        pen.strokeStyle = tones.blue;
        pen.lineWidth = 1.4;
        pen.beginPath();
        pen.arc(x + cell - 9, y - height / 2 + 6, radius, 0, Math.PI * 2);
        pen.stroke();
      }
    }

    if (motion.ruler === 1) this.text('…', left + width + ending / 2, y, this.phone ? 13 : 18, true);

    if (motion.regularity > 0) {
      const bandY = h * (this.phone ? .61 : .72);
      drawLine(pen, left, bandY, left + (width + ending) * motion.regularity, bandY, tones.ink, .8);
    }

    if (motion.claimBracket > 0) {
      const start = left + 3 * cell;
      const end = left + width + ending * .8;
      const below = h * (this.phone ? .71 : .83);
      pen.strokeStyle = tones.blue;
      pen.lineWidth = 1.7;
      pen.beginPath();
      pen.moveTo(start, below - 5);
      pen.lineTo(start, below);
      pen.lineTo(mix(start, end, motion.claimBracket), below);

      if (motion.claimBracket === 1) pen.lineTo(end, below - 5);

      pen.stroke();
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
    this.circle(motion);
    this.sphere(motion);
    this.tree(motion);
    this.carry(motion);
    this.ruler(motion);
    drawCarryTreePanels(pen, w, h, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }
}

export function createCarryTreeFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new CarryTreeFilm(root, context);
}

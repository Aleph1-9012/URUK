import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { buildDoublingClockModel } from './math';
import { drawDoublingClockPanels, layout } from './panels';
import { motionAt } from './story';

type Motion = ReturnType<typeof motionAt>;

type Point = { x: number; y: number };

function fraction(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function swarmSeed() {
  let state = 362;
  const random = (): number => {
    state = (1664525 * state + 1013904223) >>> 0;

    return state / 4294967296;
  };

  return Array.from({ length: 24 }, () => ({ x: .1 + .8 * random(), y: .1 + .8 * random(), phase: random() * Math.PI * 2 }));
}

class DoublingClockFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private page = layout(1, 1);
  private readonly labels: FilmLabels;
  private readonly model = buildDoublingClockModel();
  private readonly swarm = swarmSeed();

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

  private text(value: string, x: number, y: number, size = this.page.phone ? 8 : 10, math = false, blue = false): void {
    drawText(this.pen, value, x, y, { size, family: math ? 'math' : 'type', color: blue ? this.tones.blue : this.tones.ink, paper: this.tones.paper });
  }

  private swarmPoint(index: number, time: number, carry: number): Point {
    const dot = this.swarm[index];

    if (!dot) throw new Error('Every schematic particle needs its fixed seed.');

    const { stacked, ladder } = this.page;
    const left = this.width * (stacked ? .07 : .04);
    const right = this.width * (stacked ? .93 : .68);
    const top = this.height * (stacked ? .07 : .12);
    const bottom = this.height * (stacked ? .40 : .80);
    const x = left + (right - left) * dot.x + 3 * Math.sin(time / 1700 + dot.phase);
    const y = top + (bottom - top) * dot.y + 3 * Math.cos(time / 1900 + dot.phase);

    return { x: mix(x, ladder.x, carry), y: mix(y, ladder.bottom, carry) };
  }

  private ring(point: Point): void {
    const { pen, tones } = this;
    pen.fillStyle = tones.paper;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.2;
    pen.beginPath();
    pen.arc(point.x, point.y, 4, 0, Math.PI * 2);
    pen.fill();
    pen.stroke();
    pen.fillStyle = tones.ink;
    pen.beginPath();
    pen.arc(point.x, point.y, 1.3, 0, Math.PI * 2);
    pen.fill();
  }

  private drawSwarm(time: number, motion: Motion): void {
    if (motion.ladderCarry === 1) return;

    const { pen, tones } = this;
    const count = Math.floor(this.swarm.length * motion.swarm);
    const { stacked, ladder } = this.page;
    const left = this.width * (stacked ? .07 : .04);
    const right = this.width * (stacked ? .93 : .68);
    const top = this.height * (stacked ? .07 : .12);
    const bottom = this.height * (stacked ? .40 : .80);
    pen.strokeStyle = tones.muted;
    pen.lineWidth = .6;
    pen.strokeRect(mix(left, ladder.x, motion.ladderCarry), mix(top, ladder.bottom, motion.ladderCarry), (right - left) * (1 - motion.ladderCarry), (bottom - top) * (1 - motion.ladderCarry));

    for (let index = 0; index < count; index++) {
      const point = this.swarmPoint(index, time, motion.ladderCarry);
      pen.fillStyle = tones.ink;
      pen.beginPath();
      pen.arc(point.x, point.y, 1.8, 0, Math.PI * 2);
      pen.fill();
    }

    if (motion.feedback > 0) {
      for (let index = 0; index < 6; index++) {
        const first = this.swarmPoint(index * 3, time, motion.ladderCarry);
        const last = this.swarmPoint(index * 3 + 2, time, motion.ladderCarry);
        const middle = { x: (first.x + last.x) / 2, y: (first.y + last.y) / 2 };
        const dx = (last.x - first.x) / 2;
        const dy = (last.y - first.y) / 2;
        const distance = Math.hypot(dx, dy);

        if (distance === 0) continue;

        const bend = 12 * (1 - motion.ladderCarry);
        pen.strokeStyle = tones.muted;
        pen.lineWidth = .7;
        pen.beginPath();
        let tip = first;
        let previous = first;

        for (let segment = 0; segment <= 80; segment++) {
          const angle = Math.PI + 2 * Math.PI * motion.feedback * segment / 80;
          const point = { x: middle.x + dx * Math.cos(angle) - dy / distance * bend * Math.sin(angle), y: middle.y + dy * Math.cos(angle) + dx / distance * bend * Math.sin(angle) };

          if (segment === 0) pen.moveTo(point.x, point.y);
          else pen.lineTo(point.x, point.y);

          previous = tip;
          tip = point;
        }

        pen.stroke();
        const angle = Math.atan2(tip.y - previous.y, tip.x - previous.x);
        drawLine(pen, tip.x, tip.y, tip.x - 4 * Math.cos(angle - .5), tip.y - 4 * Math.sin(angle - .5), tones.muted, .7);
        drawLine(pen, tip.x, tip.y, tip.x - 4 * Math.cos(angle + .5), tip.y - 4 * Math.sin(angle + .5), tones.muted, .7);
      }
    }

    if (motion.ring > 0) this.ring(this.swarmPoint(0, time, motion.ladderCarry));
  }

  private ladderPoint(n: number): Point {
    const { ladder } = this.page;

    return { x: ladder.x, y: mix(ladder.bottom, ladder.top, n / 12) };
  }

  private drawLadder(motion: Motion): void {
    if (motion.ladderCarry === 0 || motion.gaps === 1) return;

    const { pen, tones } = this;
    const { ladder, phone } = this.page;
    const withdrawal = 1 - motion.gaps;
    drawLine(pen, ladder.x, ladder.bottom, ladder.x, mix(ladder.bottom, ladder.top, motion.ladderCarry * withdrawal), tones.ink, .8);

    for (let n = 0; n <= 12; n++) {
      const point = this.ladderPoint(n);
      const grow = fraction(motion.ladderCarry * 13 - n) * withdrawal;
      drawLine(pen, point.x - 6 * grow, point.y, point.x + 6 * grow, point.y, tones.ink, .8);

      if (grow === 1 && n % (phone ? 4 : 2) === 0) this.text(String(2 ** n), ladder.labelX, point.y, phone ? 9 : 12, true);
    }

    if (motion.ladderCarry === 1 && withdrawal === 1) this.text(motion.energyCriterion > .5 ? 'Q' : '|v|', ladder.x, ladder.top - 17, phone ? 12 : 15, true);

    if (motion.scene === 'velocity' && motion.ladderCarry === 1) this.ring(this.ladderPoint(12 * motion.velocity));
    else if (motion.scene === 'criterion') this.ring(this.ladderPoint(12 * (1 - motion.energyCriterion) + 12 * motion.climb));
    else if (motion.scene === 'finiteHorizon') this.ring(this.ladderPoint(12));
    else if (motion.scene === 'doubling' && motion.gaps === 0) this.ring(this.ladderPoint(12));
  }

  private velocity(motion: Motion): void {
    if (motion.velocity === 0 || motion.energyCriterion === 1) return;

    const { pen, tones } = this;
    const { chart, phone } = this.page;
    const amount = motion.velocity * (1 - motion.energyCriterion);
    const x = (n: number): number => mix(chart.left, chart.right, n / 12);
    const y = (speed: number): number => mix(chart.bottom, chart.top, (speed - .65) / .38);
    drawLine(pen, chart.left, chart.bottom, chart.right, chart.bottom, tones.ink, .7);
    drawLine(pen, chart.right, chart.bottom, chart.right, chart.top, tones.ink, .7);
    drawLine(pen, chart.left, y(1), chart.right, y(1), tones.ink, .7, [3, 3]);
    this.text('1', chart.right + 9, y(1), phone ? 10 : 12, true);
    pen.beginPath();

    for (const row of this.model.speeds) {
      if (row.n > 12 * amount) break;

      if (row.n === 0) pen.moveTo(x(row.n), y(row.velocity));
      else pen.lineTo(x(row.n), y(row.velocity));
    }

    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.2;
    pen.stroke();

    for (const n of [0, 4, 8, 12]) this.text(String(n), x(n), chart.bottom + 13, phone ? 9 : 12, true);

    this.text('n', (chart.left + chart.right) / 2, chart.bottom + 27, phone ? 10 : 12, true);
    const index = Math.min(12, Math.floor(12 * amount));
    const row = this.model.speeds[index];

    if (!row) throw new Error('The velocity picture needs its selected computed row.');

    const value = row.n < 10 ? `n=${row.n}: u=${row.velocity.toFixed(6)}` : `n=${row.n}: 1-u=${row.oneMinusVelocity.toExponential(2)}`;
    this.text(value, (chart.left + chart.right) / 2, chart.top - 15, phone ? 8.5 : 11, true);
  }

  private chartState(motion: Motion) {
    const n = motion.partialSums > 0 ? Math.round(12 * (this.model.limit / 12) ** motion.partialSums) : Math.max(1, Math.ceil(12 * motion.gaps));
    const time = this.sumAt(n);
    const maximum = Math.max(12, n);
    const top = mix(Math.max(1.25, time * 1.08), 14.5, motion.zoom);

    return { n, time, maximum, top };
  }

  private sumAt(n: number): number {
    const time = this.model.partialSums[n];

    if (time === undefined) throw new RangeError('Every plotted partial sum needs its stored integer index.');

    return time;
  }

  private plotPoint(n: number, time: number, motion: Motion): Point {
    const { chart } = this.page;
    const state = this.chartState(motion);
    const linear = n / state.maximum;
    const logarithmic = Math.log10(Math.max(1, n)) / Math.log10(state.maximum);

    return { x: mix(chart.left, chart.right, mix(linear, logarithmic, motion.zoom)), y: mix(chart.bottom, chart.top, time / state.top) };
  }

  private sumPath(motion: Motion): Path2D {
    const state = this.chartState(motion);
    const points = new Set<number>();

    for (let n = 1; n <= Math.min(12, state.n); n++) points.add(n);

    if (state.n > 12) {
      for (let index = 0; index <= 360; index++) points.add(Math.max(1, Math.round(state.n ** (index / 360))));
    }

    points.add(state.n);
    const indices = Array.from(points).sort((a, b) => a - b);
    const path = new Path2D();
    let first = true;

    for (const n of indices) {
      const point = this.plotPoint(n, this.sumAt(n), motion);

      if (first) {
        if (state.n <= 12) {
          path.moveTo(this.page.chart.left, this.page.chart.bottom);
          path.lineTo(point.x, this.page.chart.bottom);
          path.lineTo(point.x, point.y);
        } else path.moveTo(point.x, point.y);
      }
      else if (state.n <= 12) {
        const previous = this.plotPoint(n - 1, this.sumAt(n - 1), motion);
        path.lineTo(point.x, previous.y);
        path.lineTo(point.x, point.y);
      } else path.lineTo(point.x, point.y);

      first = false;
    }

    return path;
  }

  private axesAndHorizon(motion: Motion): void {
    if (motion.timeAxis === 0) return;

    const { pen, tones } = this;
    const { chart, phone } = this.page;
    const state = this.chartState(motion);
    drawLine(pen, chart.left, chart.bottom, mix(chart.left, chart.right, motion.timeAxis), chart.bottom, tones.ink, .7);
    drawLine(pen, chart.right, chart.bottom, chart.right, mix(chart.bottom, chart.top, motion.timeAxis), tones.ink, .7);

    if (motion.timeAxis === 1) {
      const ticks = motion.zoom === 1 ? [10, 100, 1000, 100000] : [0, state.maximum];

      for (const n of ticks) {
        const point = this.plotPoint(n, 0, motion);
        drawLine(pen, point.x, chart.bottom, point.x, chart.bottom + 3, tones.ink, .7);
        this.text(String(n), point.x, chart.bottom + 13, phone ? 8 : 10, true);
      }

      this.text(motion.zoom === 1 ? 'N · LOG SCALE' : 'N', (chart.left + chart.right) / 2, chart.bottom + (phone ? 25 : 24), phone ? 8 : 10);

      const tickSize = state.top > 4 ? 2 : .5;

      for (let t = 0; t <= state.top; t += tickSize) {
        const point = this.plotPoint(state.maximum, t, motion);
        this.text(String(t), chart.right + (phone ? 10 : 14), point.y, phone ? 9 : 11, true);
      }

      drawText(pen, 'TOY TIME', chart.right + (phone ? 13 : 19), chart.top - 16, { size: phone ? 7 : 9, color: tones.ink, align: 'right', paper: tones.paper });
    }

    if (motion.horizon > 0 && motion.assumptionRetire < 1) {
      const y = mix(this.plotPoint(1, 1, motion).y, chart.top, motion.assumptionRetire);
      drawLine(pen, chart.left, y, mix(chart.left, chart.right, motion.horizon * (1 - motion.assumptionRetire)), y, tones.muted, .8, [3, 3]);

      if (motion.horizon === 1 && motion.assumptionRetire === 0) {
        if (phone) {
          const leaderX = chart.left - 6;
          drawLine(pen, chart.left, y, leaderX, y, tones.muted, .65);
          drawLine(pen, leaderX, y, leaderX, chart.bottom + 7, tones.muted, .65);
        }

        this.labels.place('max-time', phone ? chart.left - 23 : (chart.left + chart.right) / 2, phone ? chart.bottom + 13 : y - 14);
      }
    }

    if (motion.gaps > 0) {
      const path = this.sumPath(motion);
      pen.strokeStyle = tones.ink;
      pen.lineWidth = 1;
      pen.stroke(path);
      pen.strokeStyle = tones.blue;
      pen.lineWidth = 1.4;
      pen.setLineDash([4, 2]);
      pen.stroke(path);
      pen.setLineDash([]);
      let point = this.plotPoint(state.n, state.time, motion);

      if (motion.partialSums === 0) {
        const rung = 12 * motion.gaps;
        const lower = Math.floor(rung);
        const upper = Math.min(12, lower + 1);
        const part = rung - lower;
        point = this.plotPoint(mix(lower, upper, fraction(2 * part)), mix(this.sumAt(lower), this.sumAt(upper), fraction(2 * part - 1)), motion);
      }

      const start = this.ladderPoint(12);
      const transfer = fraction(4 * motion.gaps);
      this.ring({ x: mix(start.x, point.x, transfer), y: mix(start.y, point.y, transfer) });

      if (motion.globalBracket === 0) this.text(`N=${state.n} · SUM=${state.time.toFixed(3)}`, (chart.left + chart.right) / 2, chart.top - 16, phone ? 8 : 10, true);
    }

    if (motion.zoom === 1) {
      for (const row of this.model.checkpoints) {
        const point = this.plotPoint(row.n, row.time, motion);
        const last = row.n === this.model.limit;
        const x = point.x - (last ? 34 : 0);
        const y = point.y - (last ? 6 : 16);
        drawLine(pen, point.x, point.y, x, y + 4, tones.ink, .6);
        drawText(pen, row.time.toFixed(3), x, y, { size: phone ? 8 : 10, family: 'math', color: tones.ink });
      }
    }
  }

  private tableAndCaps(motion: Motion): void {
    if (motion.gaps !== 1) return;

    const { pen, tones } = this;
    const { ladder, chart, phone } = this.page;
    const x = ladder.x - 16;
    const height = chart.bottom - chart.top;

    if (motion.caps === 0) {
      this.text('c=1', x, ladder.top - 17, phone ? 10 : 12, true);

      for (const row of this.model.crossings) {
        if (row.horizon > 4) break;

        const y = chart.top + height * (.15 + .22 * (row.horizon - 1));
        this.text(`T=${row.horizon}`, x - (phone ? 15 : 0), y, phone ? 8 : 10, true);
        this.text(`N=${row.n}`, x + (phone ? 15 : 0), y + (phone ? 0 : 16), phone ? 8 : 10, true);
        drawLine(pen, x - 9, y + (phone ? 9 : 22), x + 9, y + (phone ? 9 : 22), tones.ink, .7);
      }

      return;
    }

    for (let index = 0; index < 3; index++) {
      const origin = chart.top + height * (.15 + .22 * (2 - index)) + (phone ? 9 : 22);
      const target = chart.bottom - height * (.25 + index * .28);
      const y = mix(origin, target, motion.caps);
      drawLine(pen, x - 9, y, x + 9, y, tones.ink, 1);
      drawLine(pen, x, mix(y, chart.bottom, motion.caps), x, y, tones.ink, .6, [2, 3]);
      this.text(`T${index + 1}`, mix(x, x + 18, motion.caps), y - (1 - motion.caps) * 12, phone ? 9 : 11, true);
    }

    const lastRow = chart.top + height * .81 + (phone ? 9 : 22);
    drawLine(pen, x - 9 * (1 - motion.caps), lastRow, x + 9 * (1 - motion.caps), lastRow, tones.ink, .7);

    this.text('CAPS', x, ladder.top - 17, phone ? 8 : 10);
  }

  private bracket(motion: Motion): void {
    if (motion.globalBracket === 0) return;

    const { pen, tones } = this;
    const { chart, phone } = this.page;
    const x = chart.left - (phone ? 9 : 14);
    const y = mix(chart.bottom, chart.top, motion.globalBracket);
    drawLine(pen, x, chart.bottom, x, y, tones.blue, 1.8);
    drawLine(pen, x, chart.bottom, x + 4, chart.bottom, tones.blue, 1.8);
    drawLine(pen, x, y, x - 3, y + 5, tones.blue, 1.8);
    drawLine(pen, x, y, x + 3, y + 5, tones.blue, 1.8);
    this.text('CLAIMED · EVERY FINITE T', (chart.left + chart.right) / 2, chart.top - 16, phone ? 7.5 : 10, false, true);
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
    this.drawSwarm(time, motion);
    this.drawLadder(motion);
    this.velocity(motion);
    this.axesAndHorizon(motion);
    this.tableAndCaps(motion);
    this.bracket(motion);
    drawDoublingClockPanels(pen, width, height, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }
}

export function createDoublingClockFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new DoublingClockFilm(root, context);
}

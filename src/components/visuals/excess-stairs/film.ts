import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { buildExcessStairsModel, schematicStairAt } from './math';
import { drawExcessStairsPanels } from './panels';
import { motionAt } from './story';

type Motion = ReturnType<typeof motionAt>;

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

class ExcessStairsFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly model = buildExcessStairsModel();

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

  private chart(motion: Motion) {
    const span = this.phone ? mix(.61, .69, motion.pullback) + .10 * motion.symbolicResize : mix(.42, .45, motion.pullback) + .06 * motion.symbolicResize;

    return {
      left: this.width * (this.phone ? .13 : .43),
      span: this.width * span,
      top: this.height * (this.phone ? .27 : .14),
      depth: this.height * (this.phone ? .24 : .35),
      axisY: this.height * (this.phone ? .55 : .54),
    };
  }

  private nucleus(motion: Motion): void {
    if (motion.nucleus === 0) return;

    const { pen, width: w, height: h, tones } = this;
    const x = w * .18;
    const y = h * (this.phone ? .10 : .22);
    const radius = this.phone ? Math.min(18, w * .075) : Math.min(48, h * .10);
    pen.fillStyle = tones.paper;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.3;
    pen.beginPath();
    pen.arc(x, y, radius * (1 - motion.nuclei), -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * motion.nucleus);
    pen.fill();
    pen.stroke();

    if (motion.nuclei === 0) {
      this.labels.place('nucleus-charge', x, y);
      let charge: number | null = null;

      if (motion.scene === 'neutral' || motion.scene === 'more') charge = 2;
      else if (motion.scene === 'laboratory' || motion.scene === 'binding') charge = motion.hydrogen < .5 ? 2 : 1;
      else if (motion.scene === 'plateau') charge = Math.min(4, 1 + Math.floor(motion.chargeCycle * 4));

      if (charge !== null) this.text(`= ${charge}`, x, y + radius + 12, this.phone ? 11 : 15, true);
    } else {
      const separation = w * (this.phone ? .10 : .07) * motion.nuclei;
      const smallRadius = (this.phone ? 10 : 14) * motion.nuclei;

      for (const side of [-1, 1]) {
        pen.beginPath();
        pen.arc(x + side * separation, y, smallRadius, 0, Math.PI * 2);
        pen.fill();
        pen.stroke();
      }

      if (motion.nuclei === 1) {
        this.text('+', x - separation, y, this.phone ? 10 : 14, true);
        this.text('+', x + separation, y, this.phone ? 10 : 14, true);
        this.text('…', x, y, this.phone ? 10 : 14, true);
        this.text('M FIXED NUCLEI', x, y + smallRadius + 14, this.phone ? 7 : 9);
      }
    }

    const rowY = h * (this.phone ? .10 : .44);
    const rowLeft = w * (this.phone ? .43 : .07);
    const pitch = this.phone ? 22 : Math.max(25, w * .055);
    const halfSlot = this.phone ? 9 : 11;
    this.labels.place('electron-count', rowLeft - 18, rowY);

    for (let index = 0; index < 4; index++) {
      const amount = index < 2 ? motion.nucleus : motion.extraSlots;

      if (amount === 0) continue;

      const slotX = rowLeft + index * pitch;
      pen.setLineDash(index < 2 ? [] : [2, 3]);
      pen.lineWidth = .7;
      pen.strokeRect(slotX - halfSlot, rowY - halfSlot, 2 * halfSlot, 2 * halfSlot * amount);
      pen.setLineDash([]);

      if (index < 2) {
        const arrival = clamp(motion.neutralElectrons * 2 - index);

        if (arrival === 0) continue;

        const withdrawal = index === 1 ? motion.hydrogen * (1 - motion.labSecond) : 0;
        const lift = mix(22 * (1 - arrival), 22, withdrawal);
        pen.fillStyle = tones.ink;
        pen.beginPath();
        pen.arc(slotX, rowY - lift, 2.8 * arrival, 0, Math.PI * 2);
        pen.fill();
      }
    }

    const cross = motion.labCross * (1 - motion.stair);

    if (cross > 0) {
      const x = rowLeft + 2 * pitch;
      const half = 5 * cross;
      drawLine(pen, x - half, rowY - half, x + half, rowY + half, tones.ink, 1.2);
      drawLine(pen, x + half, rowY - half, x - half, rowY + half, tones.ink, 1.2);
    }
  }

  private staircase(motion: Motion): void {
    if (motion.nucleus === 0) return;

    const { pen, width: w, height: h, tones, model } = this;
    const chart = this.chart(motion);
    const right = chart.left + chart.span;
    drawLine(pen, chart.left, chart.axisY, right, chart.axisY, tones.ink, .8);
    drawLine(pen, chart.left, chart.axisY, chart.left, chart.top - 5, tones.ink, .8);
    drawLine(pen, right - 4, chart.axisY - 3, right, chart.axisY, tones.ink, .8);
    drawLine(pen, right - 4, chart.axisY + 3, right, chart.axisY, tones.ink, .8);
    this.labels.place('energy-axis', chart.left - 14, chart.top);
    this.text('n', right + 8, chart.axisY, this.phone ? 11 : 14, true);
    this.text('SCHEMATIC · NO COMPUTED ATOM', w * (this.phone ? .5 : .68), h * (this.phone ? .22 : .09), this.phone ? 8 : 10);
    const generic = schematicStairAt(model, motion.chargeCycle);
    const first = clamp(motion.neutralElectrons * 2);
    const second = clamp(motion.neutralElectrons * 2 - 1);
    const firstDepth = .42 * first;
    const secondDepth = firstDepth + (.40 * (1 - motion.hydrogen) + .05 * motion.labSecond) * second;
    const points = model.positions.map((position, index) => {
      let target = 0;

      for (const vertex of generic.vertices) {
        if (vertex.position > position) break;

        target = vertex.depth;
      }

      const initialPosition = index === 0 ? 0 : index === 1 ? .16 * first : index === model.positions.length - 1 ? 1 : mix(.16 * first, .32, second);
      const initialDepth = index === 0 ? 0 : index === 1 ? firstDepth : secondDepth;

      return {
        x: chart.left + mix(initialPosition, position, motion.stair) * chart.span,
        y: chart.top + mix(initialDepth, target, motion.stair) * chart.depth,
      };
    });
    const firstPoint = points[0];

    if (!firstPoint) throw new Error('The schematic stair needs its opening point.');

    for (let index = 1; index < points.length - 1; index++) {
      const previous = points[index - 1];
      const point = points[index];

      if (!previous || !point) throw new Error('Each schematic stair segment needs both graphic endpoints.');

      drawLine(pen, previous.x, previous.y, point.x, previous.y, tones.ink, 1.1);
      drawLine(pen, point.x, previous.y, point.x, point.y, tones.ink, 2.5);
    }

    const last = points.at(-2);

    if (!last) throw new Error('The schematic stair needs its flat-tail anchor.');

    drawLine(pen, last.x, last.y, right, last.y, tones.ink, .9, [4, 3]);

    if (motion.bindingProbe > 0 && motion.plateau === 0) {
      const before = points[2];
      const after = points[3];

      if (!before || !after) throw new Error('The binding pointer must indicate a real schematic downward step.');

      const y = mix(before.y, after.y, motion.bindingProbe);
      pen.beginPath();
      pen.arc(after.x, y, 3, 0, Math.PI * 2);
      pen.fillStyle = tones.ink;
      pen.fill();
    }

    if (motion.plateau > 0) {
      drawLine(pen, last.x, last.y + 5, last.x, chart.axisY + 3, tones.ink, .6, [2, 3]);
      this.labels.place('last-binding', last.x, chart.axisY + 14);
    }

    if (motion.pullback > 0) {
      const neutralX = chart.left + .35 * chart.span;
      drawLine(pen, neutralX, chart.axisY - 3, neutralX, chart.axisY + 3, tones.ink, .8);
      this.text('Z', neutralX, chart.axisY + 13, this.phone ? 11 : 14, true);
    }

    if (motion.liebWall > 0) {
      const wallX = chart.left + .96 * chart.span;
      drawLine(pen, wallX, chart.axisY, wallX, mix(chart.axisY, chart.top - 6, motion.liebWall), tones.ink, 1.7);
      this.labels.place(motion.nuclei > 0 ? 'lieb-molecular-wall' : 'lieb-wall', wallX, chart.top - 16);
      const hatch = motion.liebHatch * (1 - motion.questionBracket);

      if (hatch > 0) {
        const start = chart.left + .35 * chart.span;

        for (let x = start; x < wallX - 6; x += 7) {
          drawLine(pen, x, chart.axisY - 4, x + 4 * hatch, chart.axisY - 4 - 8 * hatch, tones.ink, .6);
        }
      }
    }
  }

  private bracket(motion: Motion): void {
    if (motion.questionBracket === 0) return;

    const { pen, width: w, height: h, tones } = this;
    const chart = this.chart(motion);
    const width = w * mix(.38, .48, motion.nuclei);
    const start = mix(chart.left + .35 * chart.span, (w - width) / 2, motion.questionBracket);
    const end = mix(chart.left + .96 * chart.span, (w + width) / 2, motion.questionBracket);
    const y = mix(chart.axisY - 6, h * .625, motion.questionBracket);
    pen.strokeStyle = motion.claimBracket > 0 ? tones.blue : tones.ink;
    pen.lineWidth = motion.claimBracket > 0 ? 2 : 1.1;
    pen.beginPath();
    pen.moveTo(start, y - 5);
    pen.lineTo(start, y);
    pen.lineTo(end, y);
    pen.lineTo(end, y - 5);
    pen.stroke();
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
    this.nucleus(motion);
    this.staircase(motion);
    this.bracket(motion);
    drawExcessStairsPanels(pen, w, h, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }
}

export function createExcessStairsFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new ExcessStairsFilm(root, context);
}

import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { buildTiltedWavesModel, type IdealMagnonPoint } from './math';
import { drawTiltedWavesPanels } from './panels';
import { motionAt } from './story';

type Motion = ReturnType<typeof motionAt>;

type Point = { x: number; y: number };

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

class TiltedWavesFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly model = buildTiltedWavesModel();

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

  private cursor(motion: Motion): IdealMagnonPoint {
    const cooling = motion.ideal > 0 ? motion.cursor : 1 - motion.warm;
    const point = this.model.curve[Math.round(cooling * (this.model.curve.length - 1))];

    if (!point) throw new Error('The cursor must select a computed ideal-gas point.');

    return point;
  }

  private arrow(point: Point, angle: number, length: number): void {
    if (length <= 0) return;

    const { pen, tones } = this;
    const dx = Math.sin(angle);
    const dy = -Math.cos(angle);
    const tip = { x: point.x + dx * length / 2, y: point.y + dy * length / 2 };
    const back = { x: tip.x - dx * length * .26, y: tip.y - dy * length * .26 };
    const head = length * .16;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.1;
    pen.beginPath();
    pen.moveTo(point.x - dx * length / 2, point.y - dy * length / 2);
    pen.lineTo(tip.x, tip.y);
    pen.moveTo(back.x + dy * head, back.y - dx * head);
    pen.lineTo(tip.x, tip.y);
    pen.lineTo(back.x - dy * head, back.y + dx * head);
    pen.stroke();
  }

  private gridPoint(index: number): Point {
    const columns = this.phone ? 4 : 5;
    const pitch = this.phone ? Math.min(22, this.height * .04) : Math.min(28, this.height * .046);
    const centerX = this.width * (this.phone ? .5 : .36);

    return {
      x: centerX + (index % columns - (columns - 1) / 2) * pitch,
      y: this.height * (this.phone ? .055 : .065) + Math.floor(index / columns) * pitch,
    };
  }

  private spins(motion: Motion, sample: IdealMagnonPoint): void {
    if (motion.arrows === 0) return;

    const { width: w, height: h } = this;
    const count = this.phone ? 10 : 16;
    const columns = this.phone ? 4 : 5;
    const length = this.phone ? 16 : 18;
    const span = w * (this.phone ? .80 : .55);
    const left = w * (this.phone ? .10 : .09);
    const rowY = h * (this.phone ? .09 : .10);
    const lift = clamp(motion.block / .45);
    const fold = clamp((motion.block - .45) / .55);
    const cold = this.model.rows.at(-1);
    const hot = this.model.rows[0];

    if (!cold || !hot) throw new Error('The schematic amplitude needs the plotted ideal-density range.');

    const height = clamp(Math.log(sample.idealDensity / cold.idealDensity) / Math.log(hot.idealDensity / cold.idealDensity));
    const amplitude = (.12 + .45 * height) * motion.warm;
    this.text('SCHEMATIC QUANTUM SPINS', w * (this.phone ? .5 : .35), h * .018, this.phone ? 7.5 : 9);

    for (let index = 0; index < count; index++) {
      const amount = clamp(motion.arrows * count - index);
      const start = { x: left + index / (count - 1) * span, y: rowY };
      const target = this.gridPoint(index);
      const point = { x: mix(start.x, target.x, fold), y: mix(start.y, target.y, lift) };
      const phase = index / (count - 1) * Math.PI * mix(1, 2, motion.longWave) + motion.waveClock * Math.PI * 2;
      const angle = amplitude * Math.sin(phase);
      this.arrow(point, angle, length * amount);

      if (motion.shortWave > 0 && motion.block < 1) {
        const secondAmount = clamp(motion.shortWave * count - index) * (1 - clamp(motion.block / .25));
        const secondY = h * (this.phone ? .165 : .26);
        const second = { x: mix(start.x, point.x, motion.block), y: mix(secondY, point.y, motion.block) };
        this.arrow(second, amplitude * Math.sin(phase * 3), length * secondAmount);
      }
    }

    for (let index = count; index < columns * columns; index++) {
      const amount = clamp(motion.blockFill * (columns * columns - count) - (index - count));

      if (amount === 0) continue;

      const source = this.gridPoint(index - columns);
      const target = this.gridPoint(index);
      const point = { x: target.x, y: mix(source.y, target.y, amount) };
      const angle = amplitude * Math.sin(index / columns * Math.PI * 2 + motion.waveClock * Math.PI * 2);
      this.arrow(point, angle, length * amount);
    }

    if (motion.shortWave > 0 && motion.scene === 'waves') {
      this.labels.place('spin-energy', w * (this.phone ? .5 : .825), h * (this.phone ? .215 : .22));
    }

    if (motion.unproved > 0 && motion.scene === 'unproved') {
      this.text('?', w * (this.phone ? .82 : .62), h * (this.phone ? .13 : .17), this.phone ? 21 : 27, true);
    }
  }

  private chart() {
    return {
      left: this.width * .16,
      right: this.width * (this.phone ? .91 : .88),
      top: this.height * (this.phone ? .31 : .41),
      bottom: this.height * (this.phone ? .54 : .68),
    };
  }

  private plotPoint(temperature: number, density: number): Point {
    const chart = this.chart();

    return {
      x: chart.left + Math.log2(temperature * 128) / 6 * (chart.right - chart.left),
      y: chart.bottom - Math.log(density / .00002) / Math.log(2000) * (chart.bottom - chart.top),
    };
  }

  private curve(kind: 'idealDensity' | 'blochDensity', amount: number): void {
    if (amount === 0) return;

    const { pen, tones, model } = this;
    const last = model.curve.length - 1;
    const clock = amount * last;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = kind === 'idealDensity' ? .8 : .7;
    pen.setLineDash(kind === 'blochDensity' ? [5, 4] : []);
    pen.beginPath();
    let previous: Point | null = null;

    for (let index = 0; index <= Math.ceil(clock); index++) {
      const sample = model.curve[kind === 'idealDensity' ? index : last - index];

      if (!sample) throw new Error('Every curve segment must use a computed positive ideal-gas parameter.');

      const point = this.plotPoint(sample.temperatureOverS, sample[kind]);

      if (previous === null) pen.moveTo(point.x, point.y);
      else {
        const fraction = index > clock ? clock - Math.floor(clock) : 1;
        pen.lineTo(mix(previous.x, point.x, fraction), mix(previous.y, point.y, fraction));
      }

      previous = point;
    }

    pen.stroke();
    pen.setLineDash([]);
  }

  private plot(motion: Motion, sample: IdealMagnonPoint): void {
    if (motion.axes === 0) return;

    const { pen, width: w, height: h, tones } = this;
    const chart = this.chart();
    const end = mix(chart.left, chart.right, motion.axes);
    drawLine(pen, chart.left, chart.bottom, end, chart.bottom, tones.ink, .8);
    drawLine(pen, chart.left, chart.bottom, chart.left, mix(chart.bottom, chart.top, motion.axes), tones.ink, .8);
    this.text('IDEAL NN MAGNONS · S=1', w * .53, h * (this.phone ? .245 : .365), this.phone ? 8 : 10);
    this.text('NOT THE QUANTUM MAGNET', w * .53, h * (this.phone ? .272 : .395), this.phone ? 8 : 9);

    if (motion.axes === 1) {
      for (const temperature of [1 / 128, 1 / 16, 1 / 2]) {
        const point = this.plotPoint(temperature, .00002);
        drawLine(pen, point.x, chart.bottom - 3, point.x, chart.bottom + 3, tones.ink, .7);
        this.text(String(temperature < .01 ? .0078 : temperature), point.x, chart.bottom + 11, this.phone ? 8 : 10, true);
      }

      for (const density of [.00004, .001, .02]) {
        const point = this.plotPoint(1 / 128, density);
        drawLine(pen, chart.left - 3, point.y, chart.left + 3, point.y, tones.ink, .7);
        this.text(String(density), chart.left - (this.phone ? 22 : 29), point.y, this.phone ? 8 : 10, true);
      }

      this.labels.place('temperature-ratio', chart.left + (chart.right - chart.left) * .12, chart.bottom + 28);
    }

    if (motion.warm === 0) {
      this.text('T=0', chart.left - 21, chart.bottom + 1, this.phone ? 8 : 10, true);
      drawLine(pen, chart.left - 10, chart.bottom + 3, chart.left - 6, chart.bottom - 3, tones.ink, .7);
    }

    this.curve('blochDensity', motion.bloch);
    this.curve('idealDensity', motion.ideal);

    if (motion.bloch > 0) {
      const legendY = chart.bottom + 28;
      drawLine(pen, w * .55, legendY, w * .66, legendY, tones.ink, .9, [5, 4]);
      this.text('BLOCH', w * .79, legendY, this.phone ? 8 : 10);

      if (motion.experiment > 0) this.text('TEXTBOOK · EXPERIMENT', w * .75, legendY + 13, this.phone ? 7 : 8);
    }

    if (motion.ideal > 0) {
      const point = this.plotPoint(sample.temperatureOverS, sample.idealDensity);
      drawLine(pen, point.x, point.y + 4, point.x, chart.bottom, tones.ink, .6, [2, 3]);
      pen.fillStyle = tones.ink;
      pen.beginPath();
      pen.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
      pen.fill();

      if (motion.claimBracket === 0 && motion.scene !== 'claim') {
        const temperature = sample.betaS === 2 ? '1/2' : sample.betaS === 8 ? '1/8' : sample.betaS === 128 ? '1/128' : sample.temperatureOverS.toPrecision(3);
        this.text(`T/S=${temperature} · IDEAL/BLOCH ${sample.ratio.toFixed(4)}`, w * .5, h * (this.phone ? .645 : .775), this.phone ? 8.5 : 10, true);
      }
    }

    if (motion.claimBracket > 0) {
      const y = chart.bottom - (chart.bottom - chart.top) * .20;
      const start = chart.left + (chart.right - chart.left) * .16;
      const end = mix(start, chart.left - 6, motion.claimBracket);
      pen.strokeStyle = tones.blue;
      pen.lineWidth = 1.8;
      pen.beginPath();
      pen.moveTo(start, y - 4);
      pen.lineTo(start, y);
      pen.lineTo(end, y);

      if (motion.claimBracket === 1) {
        pen.lineTo(end + 4, y - 3);
        pen.moveTo(end, y);
        pen.lineTo(end + 4, y + 3);
      }

      pen.stroke();
      this.text('β → ∞', chart.left + (chart.right - chart.left) * .14, y - 26, this.phone ? 9 : 11, true);
    }
  }

  draw(time: number): void {
    const { pen, width: w, height: h } = this;
    const motion = motionAt(time);
    const sample = this.cursor(motion);
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();
    this.spins(motion, sample);
    this.plot(motion, sample);
    drawTiltedWavesPanels(pen, w, h, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }
}

export function createTiltedWavesFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new TiltedWavesFilm(root, context);
}

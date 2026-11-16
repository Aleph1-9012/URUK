import { mix, progress, smooth } from '../../../lib/animation';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import type { FilmDrawing } from '../../plate/controller';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';
import { buildOverlapModel, GOLDEN_LAMBDA, histogram, histogramPieces, type Histogram } from './math';
import { drawClaimAndLedger, drawIngredients, drawMaps, ingredientLayout } from './panels';

type Point = { x: number; y: number };

type Tones = { ink: string; muted: string; paper: string; blue: string };

const SAMPLE_SIGNS = [1, -1, 1, 1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1] as const;

class OverlapFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly model = buildOverlapModel();
  private readonly pieces = histogramPieces(.62);
  private readonly labels: FilmLabels;
  private cached: Histogram | undefined;
  private tones: Tones = PAGE_TONES;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 5 });
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.tones = tones;

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    const { pen, width: w, height: h, tones } = this;
    const lambda = this.lambda(time);
    const terms = time < 5600 ? Math.floor(14 * progress(time, 0, 5600)) : 14;
    const law = this.law(lambda, terms);
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();
    this.strip(time, law);

    if (time < 7000) this.coins(time, law);
    if (time < 29000) this.slider(time, law);

    this.axisCarry(time);
    drawIngredients(pen, w, h, time, tones, lambda, this.labels);
    drawMaps(pen, w, h, time, tones, this.model);
    drawClaimAndLedger(pen, w, h, time, tones, this.labels);
    this.labels.endFrame();
  }

  private lambda(time: number): number {
    if (time < 14000) return .4;
    if (time < 22000) return mix(.4, .9, smooth(time, 14000, 19500));
    if (time < 46500) return mix(.9, .62, smooth(time, 22000, 23500));

    return mix(.62, GOLDEN_LAMBDA, smooth(time, 46500, 47000));
  }

  private law(lambda: number, terms: number): Histogram {
    if (lambda === GOLDEN_LAMBDA && terms === 14) return this.model.golden.histogram;
    if (lambda === .62 && terms === 14) return this.pieces.combined;
    if (this.cached?.lambda === lambda && this.cached.terms === terms) return this.cached;

    this.cached = histogram(lambda, terms);

    return this.cached;
  }

  private text(value: string, x: number, y: number, size: number, math = false): void {
    drawText(this.pen, value, x, y, { size, color: this.tones.ink, family: math ? 'math' : 'type' });
  }

  private note(value: string, x: number, top: number, width: number, size: number): void {
    drawWrappedText(this.pen, value, x, top, width, { size, color: this.tones.ink });
  }

  private box(time: number) {
    const { width: w, height: h } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const tucked = smooth(time, 29000, 32000);

    return {
      left: w * mix(.07, tall ? .06 : .07, tucked),
      right: w * mix(.93, tall ? .94 : .62, tucked),
      base: h * mix(.47, tall ? .18 : .28, tucked),
      height: h * mix(.25, tall ? .10 : .18, tucked),
      tucked,
    };
  }

  private hatch(left: number, right: number, top: number, bottom: number, reverse = false): void {
    const { pen, tones } = this;

    if (right <= left || bottom <= top) return;

    pen.save();
    pen.beginPath();
    pen.rect(left, top, right - left, bottom - top);
    pen.clip();
    pen.strokeStyle = tones.ink;
    pen.lineWidth = Math.min(.65, 1 / this.density);
    pen.beginPath();

    for (let x = left - (bottom - top); x < right + bottom - top; x += 5) {
      pen.moveTo(x, reverse ? top : bottom);
      pen.lineTo(x + bottom - top, reverse ? bottom : top);
    }

    pen.stroke();
    pen.restore();
  }

  private strip(time: number, law: Histogram): void {
    const { pen, width: w, height: h, tones } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const box = this.box(time);
    const width = box.right - box.left;
    const binWidth = width / law.counts.length;
    const scale = Math.max(1024, Math.ceil(law.maxCount / 256) * 256);
    const copies = time >= 23500 && time < 29000;
    const separate = smooth(time, 23500, 25000) * (1 - smooth(time, 26000, 28000));
    const lift = h * .14 * separate;

    if (law.lambda > .8 && law.terms === 14) {
      const endWidth = width * law.relativeTail / 2;
      this.hatch(box.left, box.left + endWidth, box.base - box.height * .45, box.base);
      this.hatch(box.right - endWidth, box.right, box.base - box.height * .45, box.base);
    }

    for (const [index, count] of law.counts.entries()) {
      const left = box.left + index * binWidth + .25;
      const barWidth = Math.max(.5, binWidth - .5);

      if (copies) {
        const negative = this.pieces.negative[index];
        const positive = this.pieces.positive[index];

        if (negative === undefined || positive === undefined) throw new Error('Both exact copies need the same target-bin grid.');

        const nh = negative / scale * box.height;
        const ph = positive / scale * box.height;
        const nb = box.base - lift;
        const pb = box.base + lift - nh * (1 - separate);
        this.hatch(left, left + barWidth, nb - nh, nb);
        this.hatch(left, left + barWidth, pb - ph, pb, true);
        pen.strokeStyle = tones.ink;
        pen.lineWidth = Math.min(.8, 1 / this.density);
        pen.strokeRect(left, nb - nh, barWidth, nh);
        pen.strokeRect(left, pb - ph, barWidth, ph);
      } else if (count > 0) {
        pen.fillStyle = tones.ink;
        pen.fillRect(left, box.base - count / scale * box.height, barWidth, count / scale * box.height);
      }
    }

    drawLine(pen, box.left, box.base, box.right, box.base, tones.ink, .9);

    if (time >= 29000 && time < 32000) return;

    const cx = (box.left + box.right) / 2;
    const size = tall ? 8.5 : 11;

    if (time >= 32000) {
      this.text('14 TERMS · 16,384 EQUALLY WEIGHTED WORDS', cx, h * (tall ? .025 : .045), size);
      this.fillRuler(law, box.left, box.right, h * (tall ? .20 : .315));
      this.text(`${law.occupied}/64 BINS OCCUPIED · ${(law.occupiedFraction * 100).toFixed(1)}%`, cx, h * (tall ? .225 : .35), size);

      if (time >= 47000) {
        this.labels.place('golden', cx, h * (tall ? .26 : .39));
        this.text('ONE EXACT-OVERLAP EXAMPLE', cx, h * (tall ? .295 : .435), size);
      } else {
        this.text(`λ = ${law.lambda.toFixed(4)} · BIN COUNTS, NOT DIMENSION`, cx, h * (tall ? .27 : .40), tall ? 10 : 12, true);
      }

      return;
    }

    if (time >= 7000) this.text('FINITE SIGN SUMS · 64 FIXED BINS', w * .5, h * .055, tall ? 10 : 15);

    if (copies) {
      this.labels.place('copy-minus', w * .30, box.base - lift - h * .115);
      this.labels.place('copy-plus', w * .70, box.base + lift + h * .075);
      this.text('HALF THE WEIGHT IN EACH COPY', w * .5, h * .77, tall ? 9 : 12);
      this.text('13 TERMS → 14 · SAME TARGET BINS', w * .5, h * .82, tall ? 9 : 12);
      this.text('EXACT REBINNING · HISTOGRAMS ADD', w * .5, h * .87, size);

      return;
    }

    if (time >= 7000) {
      this.fillRuler(law, box.left, box.right, box.base + 17);
      this.text(`−${law.radius.toFixed(2)}`, box.left, box.base + 36, tall ? 11 : 14, true);
      this.text(law.radius.toFixed(2), box.right, box.base + 36, tall ? 11 : 14, true);
      this.text(`${law.occupied}/64 BINS · ${(law.occupiedFraction * 100).toFixed(1)}% OCCUPIED`, w * .5, h * .60, tall ? 10 : 13);
      this.text(`${law.words.toLocaleString('en-US')} WORDS · HEIGHT SCALE 0–${scale} COUNTS`, w * .5, h * .65, size);
      this.text('FILLED BINS SHOW NEITHER DIMENSION NOR DENSITY', w * .5, h * .81, tall ? 8 : 11);

      if (law.lambda > .8) {
        this.text(`14-TERM CUTOFF · ${(100 * law.relativeTail).toFixed(1)}% OF RADIUS OMITTED`, w * .5, h * .86, size);
        this.labels.place('finite-tail', w * .5, h * .92);
      } else {
        this.text('TOY · FINITE RESOLUTION · NOT A PROOF', w * .5, h * .87, size);
      }
    }
  }

  private fillRuler(law: Histogram, left: number, right: number, y: number): void {
    const step = (right - left) / law.counts.length;
    this.pen.strokeStyle = this.tones.ink;
    this.pen.lineWidth = .5;

    for (const [index, count] of law.counts.entries()) {
      if (count > 0) {
        this.pen.fillStyle = this.tones.ink;
        this.pen.fillRect(left + index * step, y, Math.max(.5, step - .6), 3);
      } else this.pen.strokeRect(left + index * step, y, Math.max(.5, step - .6), 3);
    }
  }

  private sampleSum(terms: number): number {
    let sum = 0;

    for (let index = 0; index < terms; index++) {
      const sign = SAMPLE_SIGNS[index];

      if (sign === undefined) throw new Error('The illustrative coin path needs one sign per term.');

      sum += sign * .4 ** (index + 1);
    }

    return sum;
  }

  private coins(time: number, law: Histogram): void {
    const { pen, width: w, height: h, tones } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const box = this.box(time);
    const clock = 14 * progress(time, 0, 5600);
    const taken = Math.min(14, Math.floor(clock));
    const fold = smooth(time, 5800, 7000);
    const xAt = (value: number) => mix(box.left, box.right, (value + law.radius) / (2 * law.radius));
    const y = h * .13;

    for (const [index, sign] of SAMPLE_SIGNS.entries()) {
      const from = { x: mix(w * .09, w * .91, index / 13), y };
      const target = { x: xAt(this.sampleSum(index + 1)), y: box.base };
      const point: Point = { x: mix(from.x, target.x, fold), y: mix(from.y, target.y, fold) };
      const radius = (tall ? 4.8 : 7) * (1 - fold);
      pen.beginPath();
      pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
      pen.strokeStyle = tones.ink;
      pen.lineWidth = .8;
      pen.stroke();

      if (index < taken && fold === 0) this.text(sign > 0 ? '+' : '−', point.x, point.y, tall ? 9 : 12, true);
    }

    const before = this.sampleSum(taken);
    const after = this.sampleSum(Math.min(14, taken + 1));
    const sum = mix(before, after, smooth(clock - taken, 0, 1));
    pen.beginPath();
    pen.arc(xAt(sum), box.base, 3.4 * (1 - fold), 0, Math.PI * 2);
    pen.fillStyle = tones.ink;
    pen.fill();
    this.text('FOURTEEN TOSSES · ONE ILLUSTRATIVE PATH', w * .5, h * .045, tall ? 9 : 13);
    this.labels.place('step-sign', w * .5, h * .22);
    this.text(`TERM ${taken}/14 · ALL ${law.words.toLocaleString('en-US')} SIGN WORDS COUNTED`, w * .5, h * .60, tall ? 9 : 13);
    this.text('ONE PATH MOVES · THE HISTOGRAM COUNTS EVERY WORD', w * .5, h * .68, tall ? 8 : 11);
    this.text('TOY · 14 TERMS · A PICTURE, NOT A PROOF', w * .5, h * .84, tall ? 8.5 : 12);
  }

  private slider(time: number, law: Histogram): void {
    if (time < 7000 || time >= 23500) return;

    const { pen, width: w, height: h, tones } = this;
    const left = w * .12;
    const right = w * .88;
    const y = h * .72;
    drawLine(pen, left, y, right, y, tones.ink, .8);

    for (const lambda of [.4, .5, .9]) {
      const x = mix(left, right, (lambda - .4) / .5);
      drawLine(pen, x, y - 4, x, y + 4, tones.ink, .8);
      this.text(lambda.toFixed(1), x, y + 15, w < PHONE_STAGE_WIDTH ? 11 : 14, true);
    }

    const x = mix(left, right, (law.lambda - .4) / .5);
    pen.beginPath();
    pen.arc(x, y, 4, 0, Math.PI * 2);
    pen.fillStyle = tones.ink;
    pen.fill();
    this.text(`λ = ${law.lambda.toFixed(3)}`, w * .5, h * .19, w < PHONE_STAGE_WIDTH ? 18 : 25, true);
  }

  private axisCarry(time: number): void {
    if (time < 29000 || time >= 32000) return;

    const box = this.box(29000);
    const plot = ingredientLayout(this.width, this.height);
    const amount = smooth(time, 29000, 32000);
    const y = mix(box.base, plot.ratioBottom, amount);
    drawLine(this.pen, mix(box.left, plot.left, amount), y, mix(box.right, plot.right, amount), y, this.tones.ink, 1.2);
    this.note('AXIS CARRY · RESET FROM SUM TO λ', this.width * .5, this.height * .035, this.width * .9, this.width < PHONE_STAGE_WIDTH ? 9 : 12);
  }
}

export function createOverlapFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new OverlapFilm(root, context);
}

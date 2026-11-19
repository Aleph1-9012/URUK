import { mix, smooth } from '../../../lib/animation';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { equalAngles, mixAngles, sectorIndex, sectorPartition, type Point, type PropellerModel } from './math';
import { drawLedger } from './panels';

type Palette = { ink: string; muted: string; paper: string; blue: string };

type Plot = { x: number; y: number; scale: number; radius: number };

type Quad = readonly [Point, Point, Point, Point];

function pointBetween(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

function cutAt(time: number): number[] {
  const uneven = [90, 110, 160];
  const propeller = equalAngles(3);

  if (time < 24750) return uneven;
  if (time < 29750) return mixAngles(uneven, equalAngles(2), smooth(time, 24750, 26250));
  if (time < 34750) return mixAngles(equalAngles(2), propeller, smooth(time, 29750, 32500));
  if (time < 37750) return mixAngles(propeller, equalAngles(4), smooth(time, 34750, 35750));
  if (time < 40750) return mixAngles(equalAngles(4), equalAngles(5), smooth(time, 37750, 38750));
  if (time < 42750) return mixAngles(equalAngles(5), equalAngles(6), smooth(time, 40750, 41750));
  if (time < 43750) return mixAngles(equalAngles(6), propeller, smooth(time, 42750, 43750));

  const excursion = 60 * smooth(time, 43750, 46750) * (1 - smooth(time, 46750, 49750));

  return [120 + 2 * excursion, 120 - excursion, 120 - excursion];
}

export class PropellerCutsFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private data: PropellerModel | undefined;
  private failure: string | undefined;
  private extent = 1;
  private cloud: { wide: Point[]; phone: Point[] } | undefined;
  private readonly labels: FilmLabels;
  private palette: Palette = PAGE_TONES;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 5 });
  }

  setData(data: PropellerModel): void {
    this.data = data;
    this.failure = undefined;
    const radialOrder = (a: Point, b: Point) => a.x * a.x + a.y * a.y - b.x * b.x - b.y * b.y;
    this.cloud = { wide: data.cloud.slice().sort(radialOrder), phone: data.cloud.slice(0, 300).sort(radialOrder) };
    this.extent = 0;

    for (const point of data.cloud) this.extent = Math.max(this.extent, Math.hypot(point.x, point.y));

    if (!(this.extent > 0)) throw new Error('The sampled Gaussian cloud needs a nonzero extent.');
  }

  setError(reason: string): void {
    this.failure = reason;
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.palette = tones;

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    const { width: w, height: h, pen, palette } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const size = tall ? 9 : w < 880 ? 11 : 13;
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.strokeStyle = palette.ink;
    pen.lineWidth = 1;
    pen.setLineDash([]);
    this.labels.beginFrame();

    if (this.failure !== undefined || !this.data || !this.cloud) {
      this.text(this.failure !== undefined ? 'THE PARTITION CALCULATION COULD NOT FINISH' : 'CALCULATING THE CUTS', w / 2, h * .4, w * .88, size + 2);
      this.text(this.failure !== undefined ? 'RELOAD TO TRY AGAIN' : 'NO MOMENT OR GRID READOUT IS READY YET', w / 2, h * .53, w * .88, size, 'Alegreya');
      this.labels.endFrame();

      return;
    }

    const tucked = smooth(time, 57750, 59500);
    const radius = mix(tall ? w * .34 : h * .31, tall ? w * .20 : h * .20, tucked);
    const plot: Plot = { x: w * mix(tall ? .5 : .30, tall ? .25 : .22, tucked), y: h * mix(tall ? .32 : .40, tall ? .20 : .28, tucked), scale: radius / this.extent, radius };
    const angles = cutAt(time);
    const partition = sectorPartition(angles);
    this.drawCloud(plot, angles, time, tall);
    this.drawRays(plot, angles, smooth(time, 8500, 11000));
    this.drawArrows(plot, partition.moments, smooth(time, 11000, 13500));

    if (time < 57750) {
      this.text(tall ? 'GAUSSIAN CLOUD · PLANE · 300 OF 600 DOTS' : 'STANDARD GAUSSIAN IN THE PLANE · 600 FIXED DOTS', w * (tall ? .5 : .30), h * .035, w * (tall ? .94 : .58), tall ? 8.5 : 12);
    } else {
      this.text('PLANE · n ≤ 3: KNOWN', plot.x, h * .045, w * .43, tall ? 9 : 12, '"Garamond Math"');
    }

    const aside = tall ? smooth(time, 20750, 21000) * (1 - smooth(time, 23750, 24000)) : 0;

    if (time >= 8500) this.text('ARROWS ×4 · EXACT DENSITY', w * (mix(tall ? .5 : .30, tall ? .72 : .22, tucked) - .26 * aside), h * mix(tall ? .59 : .755, tall ? .365 : .535, tucked), w * mix(mix(tall ? .91 : .56, .44, aside), .45, tucked), tall ? 9 : 12, '"Garamond Math"');

    if (time >= 19750) {
      const numberX = w * mix(tall ? .60 : .79, tall ? .25 : .58, tucked);
      const numberY = h * mix(tall ? .69 : .085, tall ? .435 : .085, tucked);
      this.labels.place('objective', numberX - (tall ? 42 : 60), numberY);
      this.text(partition.value.toFixed(4), numberX, numberY, w * .29, tall ? 24 : 30, '"Garamond Math"');
      this.gauge(partition.moments, partition.value, time, tucked);
      this.squares(plot, partition.moments, time, tucked);
    }

    this.notes(time, angles, tucked);
    drawLedger(pen, w, h, time, palette.ink, palette.paper);
    this.labels.endFrame();
  }

  private position(point: Point, plot: Plot, magnification = 1): Point {
    return { x: plot.x + point.x * plot.scale * magnification, y: plot.y - point.y * plot.scale * magnification };
  }

  private drawCloud(plot: Plot, angles: number[], time: number, tall: boolean): void {
    if (!this.cloud) throw new Error('The cloud must be ready before it is drawn.');

    const points = tall ? this.cloud.phone : this.cloud.wide;
    const count = Math.floor(points.length * smooth(time, 0, 5500));
    this.pen.lineWidth = .55;

    for (let index = 0; index < count; index++) {
      const point = points[index];

      if (!point) throw new Error('Each drawn Gaussian point must exist.');

      const p = this.position(point, plot);
      const cell = time < 8500 ? 0 : sectorIndex(point, angles);
      this.glyph(cell, p.x, p.y, tall ? 1.2 : 1.5);
    }

    this.pen.strokeStyle = this.palette.muted;
    this.pen.lineWidth = .55;
    this.line(plot.x - plot.radius, plot.y, plot.x + plot.radius, plot.y);
    this.line(plot.x, plot.y - plot.radius, plot.x, plot.y + plot.radius);
    this.line(plot.x + plot.scale, plot.y - 3, plot.x + plot.scale, plot.y + 3);
    this.text('1σ', plot.x + plot.scale + 9, plot.y + 11, 25, tall ? 9 : 12, '"Garamond Math"', true);
    this.pen.strokeStyle = this.palette.ink;
    this.pen.lineWidth = 1.2;
    this.pen.beginPath();
    this.pen.arc(plot.x, plot.y, 2, 0, Math.PI * 2);
    this.pen.fillStyle = this.palette.ink;
    this.pen.fill();
  }

  private drawRays(plot: Plot, angles: number[], progress: number): void {
    if (progress === 0) return;

    let angle = 0;

    for (const width of angles) {
      if (width <= 1e-8) continue;

      const radians = angle * Math.PI / 180;
      this.pen.strokeStyle = this.palette.ink;
      this.pen.lineWidth = 1.1;
      this.line(plot.x, plot.y, plot.x + Math.cos(radians) * plot.radius * progress, plot.y - Math.sin(radians) * plot.radius * progress);
      angle += width;
    }
  }

  private drawArrows(plot: Plot, moments: Point[], progress: number): void {
    if (progress === 0) return;

    for (const [index, moment] of moments.entries()) {
      const end = this.position({ x: moment.x * progress, y: moment.y * progress }, plot, 4);
      const length = Math.hypot(end.x - plot.x, end.y - plot.y);

      if (length < .05) continue;

      this.pen.strokeStyle = this.palette.paper;
      this.pen.lineWidth = 5;
      this.line(plot.x, plot.y, end.x, end.y);
      this.pen.strokeStyle = this.palette.ink;
      this.pen.lineWidth = 1.7;
      this.line(plot.x, plot.y, end.x, end.y);
      const direction = Math.atan2(end.y - plot.y, end.x - plot.x);

      for (const sign of [-1, 1]) this.line(end.x, end.y, end.x - Math.cos(direction + sign * .5) * 5, end.y - Math.sin(direction + sign * .5) * 5);

      this.glyph(index, end.x + Math.cos(direction) * 8, end.y + Math.sin(direction) * 8, 2);
    }
  }

  private gaugePoint(value: number, tucked: number): Point {
    const { width: w, height: h } = this;
    const tall = w < PHONE_STAGE_WIDTH;

    return tall ? { x: w * (.12 + .76 * value / .4), y: h * mix(.82, .54, tucked) } : { x: w * mix(.80, .53, tucked), y: h * (.68 - .49 * value / .4) };
  }

  private gauge(moments: Point[], value: number, time: number, tucked: number): void {
    if (!this.data) throw new Error('The gauge needs its computed comparison data.');

    const { pen, width: w, height: h, palette } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const a = this.gaugePoint(0, tucked);
    const b = this.gaugePoint(.4, tucked);
    pen.strokeStyle = palette.ink;
    pen.lineWidth = .8;
    this.line(a.x, a.y, b.x, b.y);
    const normal = tall ? { x: 0, y: 1 } : { x: 1, y: 0 };

    for (const tick of [0, .2, .4]) {
      const p = this.gaugePoint(tick, tucked);
      this.line(p.x - normal.x * 4, p.y - normal.y * 4, p.x + normal.x * 4, p.y + normal.y * 4);
      this.text(String(tick), p.x + normal.x * (tall ? time >= 50750 ? 23 : 16 : time >= 50750 ? 44 : 27), p.y + normal.y * (tall ? time >= 50750 ? 23 : 16 : time >= 50750 ? 44 : 27), 30, tall ? 9 : 12, '"Garamond Math"');
    }

    if (time >= 23750) {
      let total = 0;

      for (const [index, moment] of moments.entries()) {
        const term = moment.x * moment.x + moment.y * moment.y;

        if (term < 1e-12) continue;

        const from = this.gaugePoint(total, tucked);
        const to = this.gaugePoint(total + term, tucked);
        const quad: Quad = tall ? [{ x: from.x, y: from.y - 6 }, { x: to.x, y: to.y - 6 }, { x: to.x, y: to.y + 6 }, { x: from.x, y: from.y + 6 }] : [{ x: from.x - 8, y: from.y }, { x: from.x - 8, y: to.y }, { x: from.x + 8, y: to.y }, { x: from.x + 8, y: from.y }];
        this.quad(quad);
        this.glyph(index, (from.x + to.x) / 2, (from.y + to.y) / 2, tall ? 1.5 : 2);
        total += term;
      }
    }

    const marks = [
      { at: 26250, k: 2, text: '2/4' },
      { at: 32500, k: 3, text: '3' },
      { at: 38750, k: 5, text: '5' },
      { at: 41750, k: 6, text: '6' },
    ];

    for (const mark of marks) {
      if (time < mark.at) continue;

      const p = this.gaugePoint(sectorPartition(equalAngles(mark.k)).value, tucked);
      this.line(p.x - normal.x * 11, p.y - normal.y * 11, p.x - normal.x * 17, p.y - normal.y * 17);
      this.text(mark.k === 2 && time < 35750 ? '2' : mark.text, p.x - normal.x * 23, p.y - normal.y * 23, 25, tall ? 8.5 : 11, '"Garamond Math"');
    }

    if (time >= 50750) {
      const bound = this.data.propeller.value;
      const low = this.gaugePoint(bound - .003, tucked);
      const high = this.gaugePoint(bound + .003, tucked);
      pen.strokeStyle = palette.ink;
      pen.lineWidth = .6;

      if (tall) {
        this.line(low.x, low.y - 13, low.x, low.y + 13);
        this.line(high.x, high.y - 13, high.x, high.y + 13);
        this.line(low.x, low.y + 10, high.x, high.y - 10);
      } else {
        this.line(low.x - 13, low.y, low.x + 13, low.y);
        this.line(high.x - 13, high.y, high.x + 13, high.y);
        this.line(low.x - 10, low.y, high.x + 10, high.y);
      }

      const p = this.gaugePoint(bound, tucked);
      pen.strokeStyle = palette.blue;
      pen.lineWidth = 2.4;
      const extension = 15 * smooth(time, 50750, 51750);
      this.line(p.x - normal.x * extension, p.y - normal.y * extension, p.x + normal.x * extension, p.y + normal.y * extension);
      pen.strokeStyle = palette.ink;
      pen.lineWidth = .7;
      const released = Math.floor(this.data.randomCuts.count * smooth(time, 51750, 55750));

      for (let index = 0; index < released; index++) {
        const cut = this.data.randomCuts.cuts[index];

        if (!cut) throw new Error('Each comparison tick needs its own grid-evaluated partition.');

        const q = this.gaugePoint(cut.value, tucked);
        const lane = tall ? 8 + index % 5 * 1.5 : 15 + index % 5 * 3;
        this.line(q.x + normal.x * lane, q.y + normal.y * lane, q.x + normal.x * (lane + 2), q.y + normal.y * (lane + 2));
      }
    }

    const end = this.gaugePoint(value, tucked);
    pen.fillStyle = palette.ink;
    pen.beginPath();
    pen.arc(end.x, end.y, 2.4, 0, Math.PI * 2);
    pen.fill();

    if (!tall && time < 57750) this.text('SUM OF SQUARED TRUE LENGTHS', w * .79, h * .83, w * .34, 11);
  }

  private squares(plot: Plot, moments: Point[], time: number, tucked: number): void {
    if (time < 19750 || time >= 23750) return;

    const tall = this.width < PHONE_STAGE_WIDTH;
    const growth = smooth(time, 19750, 20750);
    const travel = smooth(time, 21000, 23750);
    let total = 0;

    for (const moment of moments) {
      const end = this.position(moment, plot, 4);
      const vector = { x: end.x - plot.x, y: end.y - plot.y };
      const offset = { x: -vector.y * growth, y: vector.x * growth };
      const initial: Quad = [{ x: plot.x, y: plot.y }, end, { x: end.x + offset.x, y: end.y + offset.y }, { x: plot.x + offset.x, y: plot.y + offset.y }];
      const term = moment.x * moment.x + moment.y * moment.y;
      const a = this.gaugePoint(total, tucked);
      const b = this.gaugePoint(total + term, tucked);
      const target: Quad = tall ? [{ x: a.x, y: a.y - 6 }, { x: b.x, y: b.y - 6 }, { x: b.x, y: b.y + 6 }, { x: a.x, y: a.y + 6 }] : [{ x: a.x - 8, y: a.y }, { x: a.x - 8, y: b.y }, { x: b.x + 8, y: b.y }, { x: b.x + 8, y: a.y }];
      const initialCenter = initial.reduce((sum, point) => sum + point.x, 0) / 4;
      const targetCenter = target.reduce((sum, point) => sum + point.x, 0) / 4;
      const corridor = this.width * .82;
      const carryPoint = (point: Point, destination: Point): Point => {
        if (!tall) return pointBetween(point, destination, travel);

        const side = { x: point.x + corridor - initialCenter, y: point.y };
        const landing = { x: destination.x + corridor - targetCenter, y: destination.y };

        if (travel < .25) return pointBetween(point, side, smooth(travel, 0, .25));
        if (travel < .75) return pointBetween(side, landing, smooth(travel, .25, .75));

        return pointBetween(landing, destination, smooth(travel, .75, 1));
      };
      const quad: Quad = [carryPoint(initial[0], target[0]), carryPoint(initial[1], target[1]), carryPoint(initial[2], target[2]), carryPoint(initial[3], target[3])];
      this.quad(quad);
      total += term;
    }
  }

  private notes(time: number, angles: number[], tucked: number): void {
    const { width: w, height: h } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const size = tall ? 8.5 : w < 880 ? 11 : 12;
    const x = w * (tall ? .5 : .30);
    const y = h * (tall ? .96 : .89);
    let tag: string;

    if (time < 8500) tag = 'ONE FIXED SAMPLE · THE DENSITY IS CONTINUOUS';
    else if (time < 19750) tag = 'FIRST MOMENTS · NOT DIVIDED BY CELL MASS';
    else if (time < 23750) tag = 'SQUARE THE TRUE LENGTHS · STACK THEIR VALUES';
    else if (time < 24750) tag = 'UNEQUAL SECTORS: 90°, 110°, 160°';
    else if (time < 26250) tag = 'CLOSE ONE CELL · TWO HALVES';
    else if (time < 29750) tag = 'TWO HALVES · OPPOSITE VECTORS';
    else if (time < 32500) tag = 'OPEN THREE BLADES';
    else if (time < 34750) tag = 'THREE EQUAL 120° SECTORS';
    else if (time < 35750 || time >= 37750 && time < 38750 || time >= 40750 && time < 41750) tag = 'OPEN THE NEXT CELL · MOVING TOWARD EQUAL SECTORS';
    else if (time < 42750) tag = 'SECTORS ONLY · EQUAL PIECES CAN DO WORSE';
    else if (time < 43750) tag = 'RETURN TO THREE ACTIVE PIECES';
    else if (time < 46750) tag = 'TILT THE BLADES · THE VALUE FALLS AWAY';
    else if (time < 49750) tag = 'RETURN TO BALANCE · THE VALUE RISES';
    else if (time < 50750) tag = 'BEST WHOLE-DEGREE SECTORS: THREE ACTIVE CELLS';
    else if (time < 57750) tag = 'CLAIM: ALL DIMENSIONS · ALL CELL COUNTS';
    else tag = 'CLAIM: ALL DIMENSIONS · ALL CELL COUNTS';

    if (time < 50750) this.text(tag, x, y, w * (tall ? .94 : .58), size, time >= 23750 && time < 24750 || time >= 32500 && time < 34750 ? '"Garamond Math"' : '"Special Elite"');

    if (time >= 8500 && time < 50750) {
      const angleText = angles.reduce((text, angle) => angle > 1e-6 ? text + (text ? ' · ' : '') + angle.toFixed(0) + '°' : text, '');
      const aside = tall ? smooth(time, 20750, 21000) * (1 - smooth(time, 23750, 24000)) : 0;
      this.text('ANGLES ≈ ' + angleText, w * ((tall ? .5 : .30) - .26 * aside), h * (tall ? .635 : .80), w * mix(tall ? .94 : .58, .44, aside), tall ? 10 : 13, '"Garamond Math"');
    }

    if (time >= 26250 && time < 29750) this.labels.place('two-halves', w * (tall ? .20 : .79), h * (tall ? .69 : .135));
    if (time >= 32500 && time < 34750) this.labels.place('propeller', w * (tall ? .20 : .79), h * (tall ? .69 : .135));

    if (time >= 42750 && time < 50750) this.text('1° SEARCH · k = 3 TO 6 · EMPTY CELLS ALLOWED', x, h * (tall ? .91 : .95), w * (tall ? .94 : .58), tall ? 8.5 : 11, '"Garamond Math"');

    if (time >= 50750) {
      if (!this.data) throw new Error('The comparison notes need computed random-cut values.');

      const carrying = time >= 57750 && time < 59500;
      const across = smooth(tucked, 0, tall ? .55 : .75);
      const upward = smooth(tucked, tall ? .60 : .82, 1);
      const noteX = tall ? w * .5 : w * mix(.30, .77, across);
      const available = tall ? w * .94 : w * mix(.58, .36, across);
      const noteY = tall ? h * mix(.925, .70, tucked) : h * mix(.86, .20, upward);
      const sharpY = tall ? h * mix(.9575, .735, tucked) : h * mix(.91, .29, upward);
      const gridY = tall ? h * mix(.9875, .77, tucked) : h * mix(.96, .49, upward);
      const bandX = tall ? w * .72 : noteX;
      const bandY = tall ? h * .105 : h * mix(.78, .40, upward);
      this.text(carrying && !tall ? 'CLAIMED: ALL n,k' : 'CLAIMED: EVERY n AND k', noteX, noteY, available, size, '"Garamond Math"', true);
      this.text(tall || time < 57750 ? 'SHARP n ≥ 2, k ≥ 3 · EMPTY CELLS' : 'SHARP: n ≥ 2, k ≥ 3', noteX, sharpY, available, size, '"Garamond Math"', true);
      this.text(carrying && !tall ? '150 GRID CUTS' : `150 GRID CUTS · BEST ${this.data.randomCuts.max.toFixed(4)} · EXAMPLES ONLY`, noteX, gridY, available, size, '"Special Elite"', true);
      this.text('±.003 BAND: VISUAL REFERENCE', bandX, bandY, tall ? w * .46 : available, size, '"Garamond Math"', true);

      if (!tall && tucked === 1) this.text('EMPTY CELLS ALLOWED', noteX, h * (tall ? .27 : .335), available, size, '"Special Elite"', true);

    }
  }

  private glyph(index: number, x: number, y: number, radius: number): void {
    const { pen, palette } = this;
    pen.fillStyle = palette.ink;
    pen.strokeStyle = palette.ink;
    pen.beginPath();

    switch (index % 6) {
      case 0:
        pen.arc(x, y, radius * .75, 0, Math.PI * 2);
        pen.fill();
        break;
      case 1:
        pen.arc(x, y, radius, 0, Math.PI * 2);
        pen.stroke();
        break;
      case 2:
        this.line(x - radius, y - radius, x + radius, y + radius);
        this.line(x - radius, y + radius, x + radius, y - radius);
        break;
      case 3:
        this.line(x, y - radius, x, y + radius);
        break;
      case 4:
        pen.moveTo(x, y - radius);
        pen.lineTo(x + radius, y + radius);
        pen.lineTo(x - radius, y + radius);
        pen.closePath();
        pen.stroke();
        break;
      case 5:
        pen.rect(x - radius, y - radius, radius * 2, radius * 2);
        pen.stroke();
        break;
    }
  }

  private quad(points: Quad): void {
    const { pen } = this;
    pen.strokeStyle = this.palette.ink;
    pen.lineWidth = .9;
    pen.beginPath();

    for (const [index, point] of points.entries()) {
      if (index === 0) pen.moveTo(point.x, point.y);
      else pen.lineTo(point.x, point.y);
    }

    pen.closePath();
    pen.stroke();
  }

  private line(x1: number, y1: number, x2: number, y2: number): void {
    this.pen.beginPath();
    this.pen.moveTo(x1, y1);
    this.pen.lineTo(x2, y2);
    this.pen.stroke();
  }

  private text(value: string, x: number, y: number, width: number, size: number, family = '"Special Elite"', knockout = false): void {
    const { pen } = this;
    pen.font = `${size}px ${family}, serif`;
    pen.textAlign = 'center';
    pen.textBaseline = 'middle';
    pen.fillStyle = this.palette.ink;
    const lines: string[] = [];
    let line = '';

    for (const word of value.split(' ')) {
      const next = line ? line + ' ' + word : word;

      if (line && pen.measureText(next).width > width) {
        lines.push(line);
        line = word;
      } else line = next;
    }

    if (line) lines.push(line);

    for (const [index, row] of lines.entries()) {
      const baseline = y + (index - (lines.length - 1) / 2) * size * 1.4;

      if (knockout) {
        const measured = pen.measureText(row);
        pen.fillStyle = this.palette.paper;
        pen.fillRect(x - measured.width / 2 - 2, baseline - size * .7, measured.width + 4, size * 1.4);
        pen.fillStyle = this.palette.ink;
      }

      pen.fillText(row, x, baseline);
    }
  }
}

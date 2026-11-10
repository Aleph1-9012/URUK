import { mix, smooth } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { type ReciprocalModel } from './math';
import { type Box, type Colors, type Point, blockCellPoint, blockLayout, cellPoint, completionBox, densityPlotBox, densityPoint, gaugeBox, line, lineLayout, text } from './drawing';
import { blockProgress, completionFrame, envelopeProgress, gaugeCompression, layout, lineProgress, powersProgress, primeGaugeProgress, primeProgress, progressionProgress, setProgress, shortenProgress, stackProgress, unstackProgress } from './story';
import { drawPanels } from './panels';

type Bar = { m: number; ratio: number; start: number; end: number };

function interpolate(first: Point, second: Point, amount: number): Point {
  return { x: mix(first.x, second.x, amount), y: mix(first.y, second.y, amount) };
}

function interpolateBox(first: Box, second: Box, amount: number): Box {
  return { x: mix(first.x, second.x, amount), y: mix(first.y, second.y, amount), w: mix(first.w, second.w, amount), h: mix(first.h, second.h, amount) };
}

export class ThickEnoughFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };

  constructor(private readonly root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D, private readonly model: ReciprocalModel) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 4 });
  }

  resize(width: number, height: number, density: number): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.canvas.width = Math.round(width * density);
    this.canvas.height = Math.round(height * density);
    const style = getComputedStyle(this.root);

    for (const tone of ['ink', 'blue', 'muted', 'paper'] as const) this.colors[tone] = style.getPropertyValue(`--${tone}`).trim() || this.colors[tone];

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    const boxes = layout(this.width, this.height, time);
    this.labels.beginFrame();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineJoin = 'round';
    this.pen.lineCap = 'round';
    this.pen.setLineDash([]);

    if (time >= 55000) this.bars(boxes.stage, time, boxes.tall);

    this.numbers(boxes.stage, time, boxes.tall);

    if (time >= 6000 && time < 37000) this.gauge(boxes.stage, time, boxes.tall);
    if (time >= 46500 && time < 55000) this.completions(boxes.stage, time, boxes.tall);

    drawPanels(this.pen, boxes.panel, time, this.colors, this.labels.place, this.model, boxes.tall);
    this.labels.endFrame();
  }

  private point(value: number, box: Box, time: number, tall: boolean): Point {
    const full = cellPoint(value, lineLayout(box, tall));
    const short = value <= 14 ? cellPoint(value, lineLayout(box, tall, 14)) : { x: this.width + 40 + value * 5, y: full.y };
    const first = interpolate(full, short, shortenProgress(time));

    if (time < 55000) return first;

    const blocks = blockLayout(box, tall);
    const next = value <= 31 ? blockCellPoint(value, blocks) : { x: this.width + 40 + value * 5, y: blocks.cellY };
    next.y = mix(next.y, box.y + box.h * .84, unstackProgress(time));

    return interpolate(first, next, blockProgress(time));
  }

  private numbers(box: Box, time: number, tall: boolean): void {
    const { pen, colors, model } = this;
    const full = lineLayout(box, tall);
    const short = lineLayout(box, tall, 14);
    const blocks = blockLayout(box, tall);
    const size = mix(mix(full.cellSize, short.cellSize, shortenProgress(time)), blocks.cellSize, blockProgress(time));
    const intro = time < 6000;
    const powers = time >= 29000 && time < 37000;
    const small = time >= 37000 && time < 55000;
    const phase = completionFrame(time);
    const completion = model.completions[phase.index];

    if (small && !completion) throw new Error('Each finite example has its next real completion witness.');

    const shownPrimes = Math.floor(primeProgress(time) * model.primes64.length);
    const shownSet = Math.floor(setProgress(time) * model.set14.length);
    const selectedPrimes = new Set(model.primes64.slice(0, shownPrimes));
    const selectedSet = new Set(model.set14.slice(0, shownSet));

    for (const value of model.line) {
      const shown = Math.max(0, Math.min(1, lineProgress(time) * model.line.length - value + 1));

      if (shown <= 0) continue;

      const point = this.point(value, box, time, tall);

      if (point.x < -20 || point.x > this.width + 20) continue;

      let selected = 0;

      if (intro) selected = model.intro.includes(value) ? progressionProgress(time) : 0;
      else if (time < 29000) selected = selectedPrimes.has(value) ? 1 : 0;
      else if (powers) selected = mix(model.primes64.includes(value) ? 1 : 0, model.powers64.includes(value) ? 1 : 0, powersProgress(time));
      else if (small) {
        if (shortenProgress(time) < 1) selected = model.powers64.includes(value) ? 1 - smooth(shortenProgress(time), .7, 1) : 0;
        else selected = selectedSet.has(value) ? 1 : 0;
      }

      const added = time >= 46500 && time < 55000 && completion?.added === value;

      if (added) selected = smooth(phase.progress, 0, .25);

      pen.fillStyle = colors.paper;
      pen.strokeStyle = colors.muted;
      pen.lineWidth = .5;
      pen.fillRect(point.x - size / 2, point.y - size / 2, size, size);
      pen.strokeRect(point.x - size / 2, point.y - size / 2, size, size);

      if (selected > 0) {
        pen.fillStyle = colors.ink;
        const inkSize = size * selected;
        pen.fillRect(point.x - inkSize / 2, point.y - inkSize / 2, inkSize, inkSize);
      }

      if (added) {
        pen.strokeStyle = colors.ink;
        pen.lineWidth = tall ? 1.1 : 1.7;
        pen.beginPath();
        pen.arc(point.x, point.y, size / 2 + (tall ? 3 : 4), 0, Math.PI * 2);
        pen.stroke();
      }

      const allLabels = shortenProgress(time) === 1 && time < 55000;
      const boundary = time >= 55000 && [1, 2, 4, 8, 16, 31].includes(value);
      const basic = value === 1 || value === 32 || value === 64 || value % 8 === 0;
      const example = intro && model.intro.includes(value);
      const powersLabel = powers && [1, 4, 8, 16, 32, 64].includes(value);

      if (allLabels || boundary || (time < 37000 && (basic || example || powersLabel))) {
        pen.fillStyle = colors.ink;
        pen.font = `${tall ? 8 : 10}px "Garamond Math", serif`;
        pen.textAlign = 'center';
        pen.textBaseline = 'top';
        pen.fillText(`${value}`, point.x, point.y + size / 2 + 5);
      }
    }

    if (intro) this.progression(model.intro, box, time, tall, progressionProgress(time));
    if (powers && powersProgress(time) === 1) this.progression(model.comparison.values, box, time, tall, 1);
    if (time >= 46500 && time < 55000 && completion) this.progression(completion.progression, box, time, tall, smooth(phase.progress, .15, .45));

    let title = 'DOUBLING BLOCKS · EXACT k = 3 CAPACITIES';

    if (intro) title = 'ONE NUMBER LINE · EQUAL GAPS';
    else if (time < 29000) title = 'SHOWN HERE: PRIMES UP TO 64';
    else if (powers) title = powersProgress(time) === 1 ? 'SHOWN HERE: 1, 2, 4, 8, 16, 32, 64' : 'SWITCHING FROM PRIMES TO POWERS';
    else if (time < 46000) {
      if (shortenProgress(time) < 1) title = 'CARRYING CELLS 1–14';
      else if (setProgress(time) < 1) title = 'MARKING THE COMPUTED EIGHT-SET';
      else title = 'A MAXIMUM THREE-TERM-FREE SET IN [14]';
    }
    else if (time < 55000) title = 'SIX SEPARATE ADDITIONS TO THIS EIGHT-SET';
    else if (unstackProgress(time) === 1) title = 'FOUR EXACT k = 3 BARS · LATER DECAY SCHEMATIC';

    text(pen, title, box.x + box.w / 2, box.y + 8, tall ? 9 : 13, box.w - 6, colors);
  }

  private progression(values: readonly number[], box: Box, time: number, tall: boolean, amount: number): void {
    const { pen, colors } = this;
    const arcHeight = lineLayout(box, tall).arcHeight;

    for (let index = 1; index < values.length; index++) {
      const a = values[index - 1];
      const b = values[index];

      if (a === undefined || b === undefined) throw new Error('A progression step has its actual endpoints.');

      const shown = Math.max(0, Math.min(1, amount * (values.length - 1) - index + 1));

      if (shown <= 0) continue;

      const first = this.point(a, box, time, tall);
      const last = this.point(b, box, time, tall);
      pen.strokeStyle = colors.ink;
      pen.lineWidth = tall ? 1 : 1.5;
      pen.beginPath();

      for (let step = 0; step <= 30; step++) {
        const portion = shown * step / 30;
        const x = mix(first.x, last.x, portion);
        const y = mix(first.y, last.y, portion) - Math.sin(Math.PI * portion) * arcHeight;

        if (step === 0) pen.moveTo(x, y);
        else pen.lineTo(x, y);
      }

      pen.stroke();

      if (shown === 1) text(pen, `+${b - a}`, (first.x + last.x) / 2, Math.min(first.y, last.y) - arcHeight - (tall ? 8 : 11), tall ? 8 : 11, Math.max(14, Math.abs(last.x - first.x)), colors);
    }
  }

  private gauge(box: Box, time: number, tall: boolean): void {
    const { pen, colors, model } = this;
    const bounds = gaugeBox(box, tall);
    const compression = gaugeCompression(time);
    const maximum = mix(2, 15, compression);
    const partialCount = Math.floor(primeGaugeProgress(time) * model.primes64.length);
    const prime = model.primes64[partialCount - 1];
    const initialLimit = prime ?? 1;
    let limit = initialLimit;

    if (time >= 22000) {
      if (compression === 0) limit = 64;
      else if (compression === 1) limit = model.gauges.limit;
      else limit = Math.floor(Math.exp(mix(Math.log(64), Math.log(model.gauges.limit), compression)));
    }

    const primeSum = model.primeSumAt(limit);
    const harmonicSum = model.harmonicSumAt(limit);
    const powerCount = Math.min(model.powers20.length, 7 + Math.floor(powersProgress(time) * 13));
    const powerSum = model.powerSumAt(powerCount);
    const withdrawal = 1 - smooth(time, 36500, 37000);
    const start = tall ? { x: bounds.x, y: bounds.y + bounds.h * .40 } : { x: bounds.x + bounds.w * .20, y: bounds.y + bounds.h };
    const length = tall ? bounds.w : bounds.h;
    const point = (value: number): Point => tall ? { x: start.x + value / maximum * length, y: start.y } : { x: start.x, y: start.y - value / maximum * length };
    const end = point(maximum * withdrawal);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .7;
    line(pen, start.x, start.y, end.x, end.y);

    if (withdrawal !== 1) return;

    const ticks = maximum < 3 ? [0, 1, 2] : [0, 2, 5, 10, 15];

    for (const tick of ticks) {
      if (tick > maximum) continue;

      const at = point(tick);
      line(pen, at.x - (tall ? 0 : 3), at.y, at.x + (tall ? 0 : 3), at.y + (tall ? 4 : 0));
      text(pen, `${tick}`, at.x - (tall ? 0 : 8), at.y + (tall ? 13 : 0), tall ? 8 : 10, 22, colors, tall ? 'center' : 'right');
    }

    const markers = [{ key: 'P', value: primeSum, label: `${primeSum.toFixed(3)}`, row: tall ? -22 : .32 }];

    if (time >= 22000 && harmonicSum <= maximum) markers.push({ key: 'H', value: harmonicSum, label: `${harmonicSum.toFixed(3)}`, row: tall ? -22 : .12 });
    if (time >= 29000) markers.push({ key: 'POW', value: powerSum, label: `${powerSum.toFixed(6)}`, row: tall ? -42 : .62 });

    for (const marker of markers) {
      const at = point(marker.value);
      const x = tall ? bounds.x + bounds.w * (marker.key === 'H' ? .84 : marker.key === 'P' ? .45 : .22) : bounds.x + bounds.w * .66;
      const y = tall ? start.y + marker.row : bounds.y + bounds.h * marker.row;
      pen.strokeStyle = colors.ink;
      pen.lineWidth = .55;
      line(pen, at.x, at.y, x, y + (tall ? 6 : 5));
      pen.fillStyle = colors.paper;
      pen.beginPath();
      pen.arc(at.x, at.y, marker.key === 'POW' ? 3 : 2, 0, Math.PI * 2);
      pen.fill();
      pen.stroke();
      text(pen, `${marker.key}: ${marker.label}`, x, y, tall ? 8.5 : 10, tall ? bounds.w * .44 : bounds.w * .95, colors);
    }

    text(pen, `FINITE LIMIT: ${limit.toLocaleString('en-US')}`, bounds.x + bounds.w / 2, tall ? start.y + 33 : bounds.y + bounds.h + 23, tall ? 8 : 9, tall ? bounds.w : bounds.w * 1.2, colors);

    if (time >= 29000) text(pen, `POW: FIRST ${powerCount} TERMS · BELOW 2`, box.x + box.w * (tall ? .5 : .90), tall ? bounds.y - 37 : bounds.y - 17, tall ? 8 : 9, tall ? bounds.w : bounds.w * 1.4, colors);
  }

  private completions(box: Box, time: number, tall: boolean): void {
    const area = completionBox(box, tall);
    const current = completionFrame(time).index;

    for (const [index, completion] of this.model.completions.entries()) {
      const row = area.h / this.model.completions.length;
      const y = area.y + (index + .5) * row;
      const gap = completion.progression[1] - completion.progression[0];

      if (index === current) {
        this.pen.strokeStyle = this.colors.ink;
        this.pen.lineWidth = .7;
        this.pen.strokeRect(area.x, y - row * .35, area.w, row * .7);
      }

      text(this.pen, `ADD ${completion.added}: ${completion.progression.join(', ')} · GAP ${gap}`, area.x + area.w / 2, y, tall ? 10 : 14, area.w - 8, this.colors);
    }
  }

  private bars(box: Box, time: number, tall: boolean): void {
    const { pen, colors, model } = this;
    const geometry = blockLayout(box, tall);
    const stacking = stackProgress(time);
    const unfolding = unstackProgress(time);
    const plot = densityPlotBox(box, tall);
    const entries: Bar[] = [{ m: 0, ratio: model.initialContribution, start: 1, end: 2 }, ...model.blocks];
    const unit = box.h * .12;
    const stackBase = box.y + box.h * .79;
    let cumulative = 0;

    if (unfolding === 1) this.densityAxes(plot, tall);

    for (const entry of entries) {
      const home: Box = { x: geometry.x + (entry.start - 1) * geometry.pitch + 1, y: geometry.barBase - entry.ratio * geometry.barHeight, w: Math.max(2, (entry.end - entry.start) * geometry.pitch - 2), h: entry.ratio * geometry.barHeight };
      const stacked: Box = { x: box.x + box.w * .67, y: stackBase - (cumulative + entry.ratio) * unit, w: box.w * .18, h: entry.ratio * unit };
      const point = densityPoint(entry.m, entry.ratio, plot);
      const baseline = densityPoint(entry.m, 0, plot);
      const target: Box = entry.m === 0 ? { x: geometry.x + geometry.pitch / 2 - geometry.cellSize / 2, y: box.y + box.h * .84, w: geometry.cellSize, h: 0 } : { x: point.x - plot.w / 32, y: point.y, w: plot.w / 16, h: baseline.y - point.y };
      const transit = interpolateBox(interpolateBox(home, stacked, stacking), target, unfolding);
      const height = transit.h * blockProgress(time);
      pen.strokeStyle = colors.ink;
      pen.lineWidth = tall ? .75 : 1;
      if (height > 0) pen.strokeRect(transit.x, transit.y + transit.h - height, transit.w, height);

      if (blockProgress(time) === 1 && stacking === 0 && entry.m > 0) text(pen, `${entry.ratio}`, transit.x + transit.w / 2, transit.y - 10, tall ? 9 : 12, Math.max(15, transit.w + 4), colors);
      if (stacking === 1 && unfolding === 0) text(pen, `${entry.ratio}`, transit.x + transit.w / 2, transit.y + transit.h / 2, tall ? 10 : 13, transit.w - 4, colors);

      cumulative += entry.ratio;
    }

    if (blockProgress(time) === 1 && stacking === 0) {
      for (const [index, entry] of model.blocks.entries()) {
        const center = geometry.x + ((entry.start + entry.end) / 2 - 1) * geometry.pitch;
        const x = box.x + box.w * ((index + .5) / 4);
        pen.strokeStyle = colors.muted;
        pen.lineWidth = .45;
        line(pen, center, geometry.barBase + 3, x, geometry.labelY - 8);
        text(pen, `[${entry.start}, ${entry.end})`, x, geometry.labelY, tall ? 8.5 : 12, box.w / 4 - 4, colors);
      }
    }

    if (stacking === 1 && unfolding === 0) text(pen, `${model.partialBound.toFixed(2)} SO FAR`, box.x + box.w * .76, box.y + box.h * .18, tall ? 12 : 17, box.w * .45, colors);

    if (unfolding === 1) {
      this.envelope(plot, time, tall);
    }
  }

  private densityAxes(plot: Box, tall: boolean): void {
    const { pen, colors } = this;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .6;
    line(pen, plot.x, plot.y, plot.x, plot.y + plot.h);
    line(pen, plot.x, plot.y + plot.h, plot.x + plot.w, plot.y + plot.h);

    for (const ratio of [0, .5, 1]) {
      const at = densityPoint(1, ratio, plot);
      line(pen, plot.x - 3, at.y, plot.x, at.y);
      text(pen, `${ratio}`, plot.x - 5, at.y, tall ? 8 : 11, 24, colors, 'right');
    }

    for (const m of [1, 4, 8, 12]) {
      const at = densityPoint(m, 0, plot);
      line(pen, at.x, at.y, at.x, at.y + 3);
      text(pen, `${m}`, at.x, at.y + 13, tall ? 8 : 11, 24, colors);
    }

    text(pen, 'm', plot.x + plot.w + 10, plot.y + plot.h + 13, tall ? 10 : 13, 20, colors);
    text(pen, 'RATIO · EXACT k = 3 BARS', plot.x, plot.y - 14, tall ? 8 : 11, plot.w, colors, 'left');
  }

  private envelope(plot: Box, time: number, tall: boolean): void {
    const amount = envelopeProgress(time);

    if (amount <= 0) return;

    const { pen, colors } = this;
    const maximum = 1 + 11 * amount;
    pen.strokeStyle = colors.blue;
    pen.lineWidth = tall ? 1.6 : 2.4;
    pen.setLineDash(tall ? [4, 3] : [6, 4]);
    pen.beginPath();

    for (let step = 0; step <= 120; step++) {
      const m = 1 + (maximum - 1) * step / 120;
      // An expressly schematic guide: unknown theorem constants are not fitted.
      const ratio = m <= 4.5 ? 1.16 - .18 * (m - 1) : .53 * Math.exp(-.65 * (m - 4.5) ** .8);
      const at = densityPoint(m, ratio, plot);

      if (step === 0) pen.moveTo(at.x, at.y);
      else pen.lineTo(at.x, at.y);
    }

    pen.stroke();
    pen.setLineDash([]);
  }
}

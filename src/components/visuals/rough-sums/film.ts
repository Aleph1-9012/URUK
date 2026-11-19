import { mix, smooth } from '../../../lib/animation';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { type Box, type Colors, rule, words } from './drawing';
import { evaluateFunction, partialSum, preparePlot, type RoughSumsData } from './math';

type PlotCache = ReturnType<typeof preparePlot>;

function orderAt(time: number): number {
  if (time < 2700) return smooth(time, 2000, 2700);
  if (time < 3900) return 1 + smooth(time, 3100, 3900);
  if (time < 33000) return 2 + 3 * smooth(time, 4300, 6200);
  if (time < 35500) return 5 + 15 * smooth(time, 33000, 34500);
  if (time < 38000) return 20 + 30 * smooth(time, 35500, 37000);
  if (time < 40500) return 50 + 50 * smooth(time, 38000, 39500);

  return 100 + 100 * smooth(time, 40500, 42500);
}

export class RoughSumsFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private data: RoughSumsData | undefined;
  private cache: PlotCache | undefined;
  private readonly labels: FilmLabels;
  private colors: Colors = PAGE_TONES;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 5 });
  }

  setData(data: RoughSumsData): void {
    this.data = data;
    this.cache = preparePlot(data.coefficients);
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.colors = tones;

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    if (!this.data || !this.cache) return;

    const { width: w, height: h, pen } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();

    const tucked = smooth(time, 7000, 8750) * (1 - smooth(time, 31000, 32750));
    const fullWidth = tall ? w * .88 : w * .60;
    const full: Box = { x: w * .06, y: h * (tall ? .35 : .31), w: fullWidth, h: tall ? fullWidth * .275 : fullWidth / 2 };
    const miniWidth = w * (tall ? .35 : .30);
    const mini: Box = { x: w * .075, y: h * (tall ? .25 : .26), w: miniWidth, h: miniWidth / 2 };
    const plot: Box = { x: mix(full.x, mini.x, tucked), y: mix(full.y, mini.y, tucked), w: mix(full.w, mini.w, tucked), h: mix(full.h, mini.h, tucked) };
    const ymax = mix(.4, 1.5, smooth(time, 31000, 32750));
    const order = orderAt(time);
    this.ladder(time, tall);
    this.plot(plot, this.cache, order, ymax, time, tall, tucked);

    if (time < 7000) this.opening(full, tall);
    else if (time < 31000) this.history(time, tall, full);
    else if (time < 45250) this.integrals(time, tall, this.data);
    else if (time < 56000) this.sampleNotes(tall, this.data);
    else this.claim(time, tall);

    this.labels.endFrame();
  }

  private plot(box: Box, cache: PlotCache, order: number, ymax: number, time: number, tall: boolean, tucked: number): void {
    const { pen, colors } = this;
    const size = (tall ? 9 : 13) * mix(1, .78, tucked);
    const lower = cache.partialValues[Math.floor(order)];
    const upper = cache.partialValues[Math.min(200, Math.floor(order) + 1)];

    if (!lower || !upper) throw new Error('Both integer curves surrounding the added cosine must exist.');

    const point = (x: number, y: number) => ({ x: box.x + (x + Math.PI) / (2 * Math.PI) * box.w, y: box.y + box.h * (1 - y / ymax) });
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .7;
    rule(pen, box.x, box.y + box.h, box.x + box.w, box.y + box.h);
    rule(pen, box.x + box.w / 2, box.y + box.h, box.x + box.w / 2, box.y);
    pen.save();
    pen.beginPath();
    pen.rect(box.x - 1, box.y, box.w + 2, box.h + 1);
    pen.clip();
    pen.strokeStyle = colors.ink;
    pen.lineWidth = tucked > .5 ? .75 : 1;
    pen.setLineDash([3, 3]);
    pen.beginPath();
    let drawing = false;

    for (const [index, x] of cache.x.entries()) {
      if ((x + Math.PI) / (2 * Math.PI) > smooth(time, 0, 1000)) break;

      const value = cache.functionValues[index];

      if (value === undefined) throw new Error('Every graph abscissa has a function value.');

      if (!Number.isFinite(value)) {
        drawing = false;
        continue;
      }

      const p = point(x, Math.min(ymax * 1.1, value));

      if (!drawing) pen.moveTo(p.x, p.y);
      else pen.lineTo(p.x, p.y);

      drawing = true;
    }

    pen.stroke();
    pen.setLineDash([]);
    pen.lineWidth = tucked > .5 ? 1.1 : 1.6;
    pen.beginPath();
    const fraction = order - Math.floor(order);
    const entrance = smooth(time, 350, 1500);

    for (const [index, x] of cache.x.entries()) {
      if ((x + Math.PI) / (2 * Math.PI) > entrance) break;

      const a = lower[index];
      const b = upper[index];

      if (a === undefined || b === undefined) throw new Error('Every cached partial sum has every graph abscissa.');

      const p = point(x, mix(a, b, fraction));

      if (index === 0) pen.moveTo(p.x, p.y);
      else pen.lineTo(p.x, p.y);
    }

    pen.stroke();
    pen.restore();
    const zero = box.x + box.w / 2;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .9;
    rule(pen, zero, box.y + 5, zero, box.y - 5);
    rule(pen, zero, box.y - 5, zero - 3, box.y - 1);
    rule(pen, zero, box.y - 5, zero + 3, box.y - 1);

    if (tucked < .5) {
      words(pen, 'UNBOUNDED NEAR 0', zero, box.y - 18, box.w * .65, size - 1, colors.ink);
      this.labels.place('function', box.x + 14, box.y - 12);
      this.labels.place('series', box.x + box.w - (tall ? 25 : 35), box.y - 12);
      words(pen, '−π', box.x, box.y + box.h + 14, 30, size + 2, colors.ink, '"Garamond Math"');
      words(pen, 'π', box.x + box.w, box.y + box.h + 14, 30, size + 2, colors.ink, '"Garamond Math"');
      words(pen, '0', zero, box.y + box.h + 14, 20, size, colors.ink);
      words(pen, ymax.toFixed(1), box.x - (tall ? 5 : 9), box.y + 5, 30, size - 1, colors.ink);
      const adding = Math.abs(order - Math.round(order)) > 1e-8;
      const label = adding ? `ADDING COSINE ${Math.ceil(order)}` : `N = ${Math.round(order)} · SOLID SUM · DASHED f`;

      if (time >= 56000) words(pen, 'N = 200 · SOLID', box.x + box.w * .80, box.y + 13, box.w * .38, size - 1, colors.ink);
      else words(pen, label, box.x + box.w / 2, box.y + box.h + (tall ? 27 : 40), box.w + 10, size, colors.ink, adding ? '"Special Elite"' : 'Alegreya');
    } else words(pen, 'OUR EXAMPLE · N = 5', box.x + box.w / 2, box.y - 16, box.w + 20, Math.max(8, size), colors.ink);
  }

  private ladder(time: number, tall: boolean): void {
    const { width: w, height: h, pen, colors } = this;
    const x = w * .075;
    const width = w * .85;
    const y = h * .105;
    const small = tall ? 8 : w < 880 ? 11 : 13;
    const at = (position: number): number => x + position * width;
    const left = .03;
    const endpoint = .29;
    const antonov = mix(.95, .51, smooth(time, 47800, 49300));
    const sjolin = mix(.95, .73, smooth(time, 45250, 46800));
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .8;
    rule(pen, x, y, x + width * smooth(time, 7000, 8500), y);

    if (time < 7000) return;

    rule(pen, at(left), y - 6, at(left), y + 6);
    this.labels.place('l-one', at(left), y - 20);
    pen.beginPath();

    for (let shift = -4; shift <= 4; shift += 3) {
      pen.moveTo(at(left) - 4, y + shift);
      pen.lineTo(at(left) + 4, y + shift + 4);
    }

    pen.stroke();

    if (time >= 14750) {
      const position = mix(left, .95, smooth(time, 14750, 16500));
      rule(pen, at(position), y - 7, at(position), y + 7);
      this.labels.place(time < 27000 ? 'l-two' : 'l-p', at(position), y - 20);

      if (time >= 27000) {
        const half = width * .035 * smooth(time, 27000, 28500);
        pen.lineWidth = 3;
        rule(pen, at(.95) - half, y, at(.95) + half, y);
        pen.lineWidth = .8;

        if (!tall) {
          if (w >= 880) this.labels.place('strict-p', at(.95), y - 45);
          else if (time < 45250 || time >= 46800) this.labels.place('strict-p', at(.95), y + 46);
        }
      }
    }

    if (time >= 31000) {
      rule(pen, at(endpoint), y - 5, at(endpoint), y + 5);
      this.labels.place('l-log-l', at(endpoint), y - 20);
      const qx = at((left + endpoint) / 2);
      words(pen, '?', qx, y + 13, 20, small + 4, colors.ink);

    }

    for (const item of [
      { visible: time >= 45250, settled: time >= 46800, position: sjolin, id: 'sjolin', name: 'SJÖLIN · 1969', row: tall ? 37 : 48 },
      { visible: time >= 47800, settled: time >= 49300, position: antonov, id: 'antonov', name: 'ANTONOV · 1996', row: tall ? 21 : 22 },
    ]) {
      if (!item.visible) continue;

      rule(pen, at(item.position), y - 4, at(item.position), y + 6);

      if (tall || !item.settled) words(pen, item.name, at(item.position), y + item.row, width * .34, small, colors.ink, 'Alegreya');
      else {
        this.labels.place(item.id, at(item.position), y + item.row);
        words(pen, item.name, at(item.position), y + item.row + 20, width * .38, small - 1, colors.ink, 'Alegreya');
      }
    }

    if (time >= 45250) {
      const row = tall ? 48 : w < 880 ? 45 : 64;
      words(pen, 'SPACING SCHEMATIC', w * .20, y + row, w * .32, small, colors.ink);
    }

    if (time >= 56000) {
      const half = (tall ? 24 : 40) * smooth(time, 56000, 57500);
      pen.strokeStyle = colors.blue;
      pen.lineWidth = tall ? 1.7 : 2.3;
      const top = tall ? Math.max(4, y - 33) : y - 33;
      pen.beginPath();
      pen.moveTo(at(endpoint) - half, top + 9);
      pen.lineTo(at(endpoint) - half, top);
      pen.lineTo(at(endpoint) + half, top);
      pen.lineTo(at(endpoint) + half, top + 9);
      pen.stroke();
    }
  }

  private opening(plot: Box, tall: boolean): void {
    const { width: w, height: h, pen, colors } = this;
    const x = tall ? w / 2 : w * .81;
    const width = tall ? w - 26 : w * .32;
    words(pen, 'A SUM OF COSINES · ONE FUNCTION', x, h * (tall ? .70 : .38), width, tall ? 9 : 13, colors.ink);
    this.labels.place('model-f', x, h * (tall ? .79 : .50));
    this.labels.place('model-log', x, h * (tall ? .88 : .59));
    words(pen, 'THE SAME CURVE REBUILT, ONE MODE AT A TIME', x, h * (tall ? .96 : .72), width, tall ? 8 : 12, colors.ink);
    const y = plot.y + plot.h + (tall ? 56 : 65);

    if (!tall) words(pen, 'ON THE CIRCLE · −π TO π', plot.x + plot.w / 2, y, plot.w, 13, colors.ink, '"Garamond Math"');
  }

  private history(time: number, tall: boolean, openingPlot: Box): void {
    const { width: w, height: h, pen, colors } = this;
    const x = tall ? w * .70 : w * .69;
    const width = tall ? w * .48 : w * .49;
    const size = tall ? 9 : 14;
    const arriving = 1 - smooth(time, 7000, 8750);
    const rightOffset = Math.max(0, openingPlot.x + openingPlot.w + 10 - (x - width / 2)) * arriving;
    const lowerOffset = Math.max(0, openingPlot.y + openingPlot.h + (tall ? 27 : 40) + 24 - h * .72) * arriving;

    if (time < 14750) {
      words(pen, '1923 · KOLMOGOROV', x + rightOffset, h * .36 + (tall ? 3 : 0), width, size, colors.ink, 'Alegreya');
      words(pen, 'ONE COUNTEREXAMPLE DIVERGES ALMOST EVERYWHERE', x + rightOffset, h * .48, width, size, colors.ink);
      words(pen, "KOLMOGOROV'S FUNCTION IS NOT DRAWN", w / 2, h * .72 + lowerOffset, w - 25, size, colors.ink);
    } else if (time < 27000) {
      words(pen, '1966 · CARLESON', x, h * .36, width, size, colors.ink, 'Alegreya');
      words(pen, 'SQUARE-INTEGRABLE FUNCTIONS CONVERGE ALMOST EVERYWHERE', x, h * .49, width, size, colors.ink);
    } else {
      words(pen, 'HUNT · EVERY p > 1', x, h * .36, width, size + 1, colors.ink, '"Garamond Math"');
      words(pen, 'CONVERGENCE ALMOST EVERYWHERE', x, h * .49, width, size, colors.ink);
    }

    words(pen, 'THE SMALL GRAPH REMAINS OUR EXAMPLE', w / 2, h * .84 + lowerOffset, w - 24, size - 1, colors.ink);
  }

  private integrals(time: number, tall: boolean, data: RoughSumsData): void {
    const { width: w, height: h, pen, colors } = this;
    const index = time < 35500 ? 0 : time < 38250 ? 1 : time < 41000 ? 2 : 3;
    const row = data.integrals[index];

    if (!row) throw new Error('Every displayed cutoff has a live integral row.');

    const x = tall ? w / 2 : w * .84;
    const size = tall ? 9 : w < 880 ? 11 : 13;
    this.labels.place('integral', tall ? w * .37 : x, h * (tall ? .70 : .36));
    this.labels.place('cutoff-' + index, tall ? w * .85 : x, h * (tall ? .70 : .45));
    this.labels.place('model-f', w * (tall ? .36 : .78), h * (tall ? .785 : .56));
    this.labels.place('comparison', w * (tall ? .36 : .78), h * (tall ? .87 : .66));
    words(pen, row.k3.toFixed(4), w * (tall ? .81 : .94), h * (tall ? .785 : .56), w * .20, size + 1, colors.ink);
    words(pen, row.k2.toFixed(4), w * (tall ? .81 : .94), h * (tall ? .87 : .66), w * .20, size + 1, colors.ink);
    this.labels.place('cut-domain', x, h * (tall ? .97 : .79));
  }

  private sampleNotes(tall: boolean, data: RoughSumsData): void {
    const { width: w, height: h, pen, colors } = this;
    const x = tall ? w / 2 : w * .84;
    const width = tall ? w - 25 : w * .28;
    const size = tall ? 9 : w < 880 ? 11 : 13;
    words(pen, 'N = 200 · ERROR BELOW 3% AT x = 0.5, 1, 2, 3', x, h * (tall ? .70 : .40), width, size, colors.ink, 'Alegreya');
    const value = partialSum(data.coefficients, 200, .05);
    words(pen, 'AT x = 0.05: f = ' + evaluateFunction(.05).toFixed(4), x, h * (tall ? .80 : .54), width, size, colors.ink, 'Alegreya');
    words(pen, 'SUM = ' + value.toFixed(4) + ' · STILL NOT CLOSE HERE', x, h * (tall ? .86 : .63), width, size, colors.ink);
    words(pen, 'THIS ONE EXAMPLE IS ALREADY COVERED BY OLDER THEOREMS', x, h * (tall ? .96 : .78), width, size - 1, colors.ink);
  }

  private claim(time: number, tall: boolean): void {
    const { width: w, height: h, pen, colors } = this;
    const x = tall ? w / 2 : w * .81;
    const width = tall ? w - 26 : w * .31;
    const size = tall ? 9 : w < 880 ? 11 : 13;
    words(pen, 'CLAIMED', x, h * (tall ? .65 : .36), width, size + 2, colors.blue);
    this.labels.place('claim-sums', x, h * (tall ? .71 : .445));
    words(pen, 'EVERY COMPLEX f IN L LOG L', x, h * (tall ? .775 : .53), width, size, colors.ink, '"Garamond Math"');
    words(pen, 'FULL SEQUENCE N = 0, 1, 2, …', x, h * (tall ? .835 : .62), width, size, colors.ink, '"Garamond Math"');

    if (time < 62000) words(pen, 'SUFFICIENCY · NOT AN EXACT THRESHOLD', x, h * (tall ? .94 : .77), width, size - 1, colors.ink);
    else {
      words(pen, 'UNREVIEWED', tall ? w / 2 : w * .53, h * .89, w - 25, size + 2, colors.ink);

      if (time >= 68750) {
        words(pen, 'LEAN STATEMENT ONLY', w / 2, h * .945, w - 24, size, colors.ink);
        words(pen, 'FourierLLogL.lean · IN THE CATALOGUE', w / 2, h * .985, w - 24, size - 1, colors.ink, 'Alegreya');
      } else words(pen, 'NO PUBLIC HUMAN CHECK · 20 OCTOBER 2026', w / 2, h * .97, w - 24, size - 1, colors.ink);
    }
  }
}

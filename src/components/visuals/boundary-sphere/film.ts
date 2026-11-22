import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { smooth, fade } from '../../../lib/animation';
import { crumple, gridCost, exponentialCost, quadraticCost } from './math';

import { drawBoundaryDisk } from './disk';

type Tone = 'ink' | 'blue' | 'muted' | 'paper';

type Point = { x: number; y: number };

export class BoundarySphereFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private tall = false;
  private time = 0;
  private colors: Record<Tone, string> = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly energy: HTMLElement;
  private readonly viewport: HTMLElement;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 7, vertical: 6 });
    const energy = root.querySelector<HTMLElement>('[data-label="energy"] > span');

    if (!energy) throw new Error('The boundary-sphere film has an energy label.');

    const viewport = root.querySelector<HTMLElement>('[data-film-viewport]');

    if (!viewport) throw new Error('The boundary-sphere film has a viewport.');

    this.energy = energy;
    this.viewport = viewport;
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.tall = height > width;
    this.colors = tones;

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    this.time = time;
    this.labels.beginFrame();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineCap = 'round';
    this.pen.lineJoin = 'round';
    drawBoundaryDisk(this.pen, this.width, this.height, time, this.colors);
    this.squareGrid(fade(time, 1000, 3500, 19000, 23000), true);
    this.globe(Math.max(fade(time, 25000, 28000, 51500, 55000), smooth(time, 101500, 104000)));
    const exchange = smooth(time, 93500, 94500);
    const panelLeft = this.tall ? 0 : this.width * .5;
    const panelWidth = this.width - panelLeft;
    const outgoing = time < 93000 ? fade(time, 49500, 55000, 93000, 94500) : time < 94500 ? 1 : 0;
    this.energy.style.translate = time >= 93500 && time < 94500 ? `${-panelWidth * exchange}px 0` : '0px 0';

    if (time >= 93500 && time < 94500) {
      this.pen.save();
      this.pen.beginPath();
      this.pen.rect(panelLeft, 0, panelWidth, this.height);
      this.pen.clip();
      this.pen.translate(-panelWidth * exchange, 0);
      this.squareGrid(outgoing, false);
      this.pen.restore();
    } else this.squareGrid(outgoing, false);

    this.costPlot();

    if (time >= 93500 && time <= 95000) {
      this.pen.save();
      this.pen.beginPath();
      this.pen.rect(panelLeft, 0, panelWidth, this.height);
      this.pen.clip();
      this.pen.translate(panelWidth * (1 - exchange), 0);
      this.growth();
      this.pen.restore();
    } else this.growth();
    const final = smooth(time, 109000, 111000);
    const x = this.width * (this.tall ? .5 : .75);
    this.labels.place('status', x, this.height * (this.tall ? .87 : .77), final);
    this.words('MARIO BONK · 22 OCT 2026\n“SEEMS TO BE CORRECT”', x, this.height * (this.tall ? .96 : .87), this.width * (this.tall ? .88 : .42), final, 'muted');

    this.labels.endFrame();

    if (time >= 93500 && time < 94500) {
      const bounds = this.energy.getBoundingClientRect();
      const viewport = this.viewport.getBoundingClientRect();
      const clippedLeft = Math.max(0, viewport.left + panelLeft - bounds.left);
      const clippedRight = Math.max(0, bounds.right - viewport.left - this.width);
      this.energy.style.clipPath = `inset(0 ${clippedRight}px 0 ${clippedLeft}px)`;
    } else this.energy.style.clipPath = '';
  }

  private line(points: readonly Point[], tone: Tone = 'ink', alpha = 1, weight = 1): void {
    if (alpha < .005 || points.length < 2) return;

    this.pen.globalAlpha = alpha;
    this.pen.strokeStyle = this.colors[tone];
    this.pen.lineWidth = weight;
    this.pen.beginPath();

    for (const [index, p] of points.entries()) {
      if (index === 0) this.pen.moveTo(p.x, p.y);
      else this.pen.lineTo(p.x, p.y);
    }

    this.pen.stroke();
    this.pen.globalAlpha = 1;
  }

  private words(text: string, x: number, y: number, width: number, alpha = 1, tone: Tone = 'ink', tag = true): void {
    if (alpha < .005) return;

    const size = tag ? (this.tall ? 10 : 11) : (this.tall ? 15 : 18);
    this.pen.font = tag ? `${size}px "Special Elite", monospace` : `italic ${size}px Alegreya, serif`;
    this.pen.textAlign = 'center';
    this.pen.textBaseline = 'middle';
    const lines: string[] = [];

    for (const paragraph of text.split('\n')) {
      let line = '';

      for (const word of paragraph.split(' ')) {
        const next = line ? `${line} ${word}` : word;

        if (line && this.pen.measureText(next).width > width) {
          lines.push(line);
          line = word;
        } else line = next;
      }

      lines.push(line);
    }

    this.pen.globalAlpha = alpha;

    for (const [index, line] of lines.entries()) {
      const extent = this.pen.measureText(line).width;
      const px = Math.max(extent / 2 + 5, Math.min(this.width - extent / 2 - 5, x));
      const py = y + (index - (lines.length - 1) / 2) * (size + 4);
      this.pen.fillStyle = this.colors.paper;
      this.pen.fillRect(px - extent / 2 - 2, py - size / 2 - 2, extent + 4, size + 4);
      this.pen.fillStyle = this.colors[tone];
      this.pen.fillText(line, px, py);
    }

    this.pen.globalAlpha = 1;
  }

  private globe(alpha: number): void {
    if (alpha < .005) return;

    const t = this.time;
    const center = { x: this.width * (this.tall ? .5 : .75), y: this.height * (this.tall ? .69 : .37) };
    const radius = Math.min(this.width * (this.tall ? .23 : .15), this.height * (this.tall ? .13 : .23));
    const bent = smooth(t, 40500, 44000) * (1 - smooth(t, 101500, 104500));
    const outline = crumple(bent);
    const ring = [...outline, outline[0] ?? { x: 0, y: -1 }];
    const mapped = (sx: number, sy: number) => ring.map(p => ({ x: center.x + p.x * radius * sx, y: center.y + p.y * radius * sy }));
    this.line(mapped(1, 1), 'ink', alpha, 1.3);
    this.line(mapped(.37, 1), 'ink', alpha * .65);
    this.line(mapped(1, .32), 'ink', alpha * .65);
    const leavingForGrid = t > 51500 && t < 55000;
    const returningFromGrowth = t >= 101500 && t < 104000;
    const captionAlpha = leavingForGrid || returningFromGrowth ? 0 : alpha;
    const titleAlpha = this.tall ? captionAlpha : alpha;
    this.words(t >= 101500 ? 'ROUND COORDINATES' : t >= 40500 ? 'SAME TOPOLOGY · NOT ROUND' : 'BOUNDARY: A SPHERE', center.x, center.y - radius - 23, this.width * (this.tall ? .9 : .4), titleAlpha);
    this.words(t >= 101500 ? 'THE MOVES BECOME SYMMETRIES' : t >= 40500 ? 'DISTANCES NOT SPECIFIED · SCHEMATIC' : 'IN THREE DIMENSIONS', center.x, center.y + radius + 24, this.width * (this.tall ? .9 : .4), captionAlpha * (1 - smooth(t, 108000, 109000)), 'muted');
    const question = fade(t, 32500, 34500, 40000, 41000);
    this.words('?', center.x, center.y, radius, question, 'blue', false);
    this.words('SPHERE BOUNDARY ⇒ SYMMETRIES?', center.x, center.y + radius + 52, this.width * (this.tall ? .9 : .42), question, 'blue');
    const covers = fade(t, 47500, 49000, 53000, 55000);

    if (covers > .01) {
      const step = t < 49000 ? .6 : t < 50500 ? .3 : .15;

      for (let x = -.9; x <= .9; x += step) {
        for (let y = -.9; y <= .9; y += step) {
          if (x * x + y * y > .85) continue;

          this.pen.globalAlpha = covers * .35;
          this.pen.strokeStyle = this.colors.blue;
          this.pen.lineWidth = .6;
          this.pen.beginPath();
          this.pen.arc(center.x + x * radius, center.y + y * radius, step * radius * .65, 0, Math.PI * 2);
          this.pen.stroke();
          this.pen.globalAlpha = 1;
        }
      }

      if (t <= 53000) this.labels.place('radius', center.x, center.y + radius + 48, covers);
    }
  }

  private squareGrid(alpha: number, opening: boolean): void {
    if (alpha < .005) return;

    const t = this.time;
    const w = this.width;
    const h = this.height;
    const top = h * (this.tall ? .57 : .19);
    const size = Math.min(w * (this.tall ? .56 : .28), h * (this.tall ? .23 : .43));
    const left = this.tall ? w * .5 - size / 2 : w * .61;
    const center = left + size / 2;
    const m = opening ? 8 : t < 64000 ? 3 : t < 66500 ? 6 : 12;
    const cell = size / m;
    const fold = !opening && this.tall ? smooth(t, 89500, 92000) : 0;
    const intoIntervals = (p: Point): Point => ({ x: center + (p.x - center) * (1 - fold), y: top + size / 2 + (p.y - top - size / 2) * (1 - fold) });
    const distorted = opening ? 0 : Math.max(1 - smooth(t, 53500, 55500), smooth(t, 68000, 70000));
    const v = (x: number, y: number) => ({ x: left + x * cell + Math.sin(y * 1.7) * cell * .18 * distorted * Math.sin(Math.PI * x / m), y: top + y * cell + Math.sin(x * 1.4) * cell * .18 * distorted * Math.sin(Math.PI * y / m) });
    const functionStage = opening ? 0 : smooth(t, 77000, 79500);

    if (functionStage > .01) {
      for (let row = 0; row < m; row++) {
        this.pen.fillStyle = this.colors.blue;
        this.pen.globalAlpha = alpha * functionStage * (row + 1) / m * .20;
        const corner = intoIntervals({ x: left, y: top + row * cell });
        this.pen.fillRect(corner.x, corner.y, size * (1 - fold), cell * (1 - fold));
      }

      this.pen.globalAlpha = 1;
    }

    for (let row = 0; row <= m; row++) {
      const horizontal: Point[] = [];
      const vertical: Point[] = [];

      for (let col = 0; col <= m; col++) {
        horizontal.push(v(col, row));
        vertical.push(v(row, col));
      }

      if (fold < 1) {
        this.line(horizontal.map(intoIntervals), 'muted', t >= 93000 ? alpha : this.tall && fold > 0 ? .65 : alpha * .65, .6);
        this.line(vertical.map(intoIntervals), 'muted', t >= 93000 ? alpha : this.tall && fold > 0 ? .65 : alpha * .65, .6);
      }
    }

    const phoneClaim = this.tall && t >= 70500 && t < 77000;
    const title = opening ? 'MOVES THAT COMMUTE: A GRID' : phoneClaim ? 'PROVED · OPENAI, 23 SEP 2026' : functionStage > .5 ? 'A FUNCTION · SCHEMATIC' : distorted > .5 ? 'A PATCH OF THE BOUNDARY' : `${m} × ${m} CELLS`;
    const titleAlpha = opening || t >= 55000 ? alpha : 0;
    this.words(title, center, top - 22, this.width * (this.tall ? .88 : .42), titleAlpha, phoneClaim ? 'blue' : 'ink');

    if (opening) {
      const amount = smooth(t, 8000, 10500);
      const n = t < 11000 ? 2 : t < 14000 ? 4 : 8;
      this.line([v(0, 0), v(n, 0), v(n, n), v(0, n), v(0, 0)], 'blue', alpha * amount, 2);
      this.pen.setLineDash([3, 3]);
      this.line([v(n, n), v(n, 0)], 'blue', alpha * amount, 1);
      this.pen.setLineDash([]);
      this.words(`THICKNESS ${n} · NO BOUND`, center, top + size + 25, w * (this.tall ? .9 : .42), alpha * amount, 'blue');
      this.words('NOT HYPERBOLIC', center, top + size + 49, w * (this.tall ? .9 : .42), alpha * amount);
    } else if (functionStage < .5) {
      if (m === 3 && t >= 55000) {
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) this.words('1/3', left + (col + .5) * cell, top + (row + .5) * cell, cell, alpha, 'ink', false);
        }
      }

      const crossed = fade(t, 56500, 58000, 63500, 65000);
      this.line([v(0, .08), v(m, .08)], 'blue', alpha * crossed, 2);
      const wiggle = fade(t, 59000, 60500, 63500, 65000);
      this.line([v(0, .08), v(1.08, .08), v(1.08, 2.08), v(3, 2.08)], 'blue', alpha * wiggle, 1.7);
      this.words(t < 59500 ? '3 × 1/3 = 1 PER CROSSING' : t < 63000 ? 'WIGGLY CROSSING: 5/3 ≥ 1' : `COST: ${m * m} × (1/${m})² = ${gridCost(m)}`, center, top + size + 25 - (this.tall ? 15 * smooth(t, 63000, 64000) : 0), w * (this.tall ? .88 : .42), titleAlpha * (1 - smooth(t, 67500, 69000)), 'blue');
      this.words('SQUARED WEIGHTS TOTAL 1', center, top + size + 49, w * (this.tall ? .88 : .42), titleAlpha * (1 - smooth(t, 63000, 64500)), 'muted');
    } else {
      const tickX = left - 14 - (this.tall ? w * .22 * smooth(t, 89500, 92000) : 0);

      for (let level = 1; level <= 4; level++) {
        const points: Point[] = [];

        for (let x = 0; x <= 30; x++) points.push({ x: left + x / 30 * size, y: top + size * (level / 5 + .035 * Math.sin(x / 30 * Math.PI * 3 + level)) });

        if (fold < 1) this.line(points.map(intoIntervals), 'blue', this.tall && fold > 0 ? 1 : alpha, 1.3);
        this.words((level / 5).toFixed(1), tickX, top + size * level / 5, 30, alpha, 'blue');
      }

      this.words('0', tickX, top, 25, alpha, 'blue');
      this.words('1', tickX, top + size, 25, alpha, 'blue');
      this.words('0 AT TOP · 1 AT BOTTOM', center, top + size + 24, w * (this.tall ? .88 : .4), alpha * (this.tall ? smooth(t, 85500, 86200) : 1));
      this.labels.place('energy', center, top + size + 48, alpha * smooth(t, 86000, 87500));
      const copies = smooth(t, 89500, 92000);
      if (copies > .01) {
        const copyW = w * (this.tall ? .28 : .12);
        const gap = w * (this.tall ? .10 : .04);
        const cy = top + size / 2;
        const comparisonAlpha = copies === 1 ? alpha : 0;

        if (comparisonAlpha > 0) {
          this.pen.globalAlpha = comparisonAlpha;
          this.pen.fillStyle = this.colors.paper;
          this.pen.fillRect(center - copyW - gap, cy - 30, copyW * 2 + gap * 2, 60);
          this.pen.globalAlpha = 1;
        }

        for (const [index, value] of ['0.1–0.3', '0.6–0.8'].entries()) {
          const cx = center + (index ? 1 : -1) * (copyW / 2 + gap / 2);
          this.line([{ x: cx - copyW / 2, y: cy - 24 }, { x: cx + copyW / 2, y: cy - 24 }, { x: cx + copyW / 2, y: cy + 24 }, { x: cx - copyW / 2, y: cy + 24 }, { x: cx - copyW / 2, y: cy - 24 }], 'blue', alpha * copies);
          this.words(value, cx, cy, copyW, comparisonAlpha, 'blue', false);
        }

        this.words('≠', center, cy, gap, comparisonAlpha, 'blue', false);
      }
    }
  }

  private costPlot(): void {
    const t = this.time;
    const alpha = fade(t, 65000, 66500, 84000, 85500);

    if (alpha < .005) return;

    const x = this.width * (this.tall ? .5 : .75);
    const y = this.height * (this.tall ? .92 : .86);
    const wide = this.width * (this.tall ? .7 : .31);
    this.line([{ x: x - wide / 2, y }, { x: x + wide / 2, y }], 'muted', alpha);
    this.line([{ x: x - wide / 2, y: y - 16 }, { x: x + wide / 2, y: y - 16 }], 'blue', alpha, 2);
    this.words('n', x + wide / 2 + 10, y, 20, alpha, 'muted');
    this.words('M(n): BLOCKING COST · NEEDED: BOUNDED', x, y + 15, this.width * (this.tall ? .92 : .44), alpha);
    const assume = smooth(t, 77000, 79500);
    const curve: Point[] = [];

    for (let i = 0; i <= 30; i++) curve.push({ x: x - wide / 2 + i / 30 * wide, y: y - 16 - assume * (i / 30) ** 2 * (this.tall ? 23 : 50) });

    this.pen.setLineDash([4, 3]);
    this.line(curve, 'ink', alpha * assume, 1.1);
    this.pen.setLineDash([]);
    if (!this.tall) this.words('PROVED · OPENAI, 23 SEP 2026', x, y - 42, this.width * .44, fade(t, 70500, 72000, 77000, 78000), 'blue');
  }

  private growth(): void {
    const alpha = this.time < 93500 ? 0 : 1 - smooth(this.time, 101500, 103000);

    if (alpha < .005) return;

    const w = this.width;
    const h = this.height;
    const left = w * (this.tall ? .12 : .56);
    const top = h * (this.tall ? .59 : .25);
    const span = w * (this.tall ? .8 : .4);
    const plotLeft = left + span * .32;
    const plotW = span * .65;
    const plotH = h * (this.tall ? .20 : .39);
    const point = (n: number, value: number) => ({ x: plotLeft + n / 55 * plotW, y: top + plotH - Math.log10(value) / 9 * plotH });
    const captionAlpha = this.time <= 101500 ? alpha : 0;
    this.words('NESTED VALUES · SCHEMATIC CONSTANTS', left + span / 2, top - 25, span + 20, this.tall && w >= 300 ? alpha : captionAlpha);

    for (let depth = 0; depth < 4; depth++) {
      const nodes = 2 ** depth;

      for (let index = 0; index < nodes; index++) {
        const x = left + (index + .5) / nodes * span * .24;
        const y = top + depth * plotH * .23;
        this.line([{ x: x - span * .1 / nodes, y }, { x: x + span * .1 / nodes, y }], 'ink', alpha, 1.4);

        if (depth > 0) this.line([{ x, y }, { x: left + (Math.floor(index / 2) + .5) / (nodes / 2) * span * .24, y: y - plotH * .23 }], 'muted', alpha, .7);
      }
    }

    this.line([point(0, 1), point(55, 1)], 'muted', alpha);
    this.line([point(0, 1), point(0, 1e9)], 'muted', alpha);
    const upper: Point[] = [];
    const lower: Point[] = [];
    const end = 10 + 45 * smooth(this.time, 94500, 98500);

    for (let n = 0; n <= end; n += .5) {
      upper.push(point(n, exponentialCost(n)));
      lower.push(point(n, quadraticCost(n)));
    }

    this.line(upper, 'blue', alpha, 1.6);
    this.line(lower, 'ink', alpha, 1.2);
    this.words('LOG SIZE', plotLeft + plotW / 2, top - 9, plotW, captionAlpha, 'muted');
    this.words('n', plotLeft + plotW + 9, top + plotH + 17, 20, alpha, 'muted');
    this.words('EXPONENTIAL', plotLeft + plotW * (this.tall ? .45 : .68), top + 2, plotW, captionAlpha, 'blue');
    const quadraticIndex = Math.min(50, end);
    const quadraticAnchor = point(quadraticIndex, quadraticCost(quadraticIndex));
    const captionCarry = this.tall ? smooth(this.time, 94500, 95000) : 1;
    const quadraticOffset = !this.tall && this.width > 760 ? 10 : 0;
    const quadraticX = this.tall ? .60 + .22 * captionCarry : .30 + .52 * captionCarry;
    const quadraticCaption = { x: plotLeft + plotW * quadraticX, y: (top + plotH * .87) * (1 - captionCarry) + (quadraticAnchor.y + 22) * captionCarry + quadraticOffset };
    this.line([quadraticAnchor, { x: quadraticAnchor.x + (quadraticCaption.x - quadraticAnchor.x) * captionCarry, y: quadraticAnchor.y + (quadraticCaption.y - 10 - quadraticAnchor.y) * captionCarry }], 'muted', alpha, .7);
    this.words('QUADRATIC', quadraticCaption.x, quadraticCaption.y, plotW, this.tall ? alpha : captionAlpha);
    this.words('n = 41', point(41, 1).x, top + plotH + 17, 60, !this.tall && w <= 760 ? captionAlpha : alpha, 'blue');
    this.words('REQUIRED TO STAY BELOW · IMPOSSIBLE', left + span / 2, top + plotH + 42, span + 20, this.tall ? captionAlpha : alpha);
  }
}

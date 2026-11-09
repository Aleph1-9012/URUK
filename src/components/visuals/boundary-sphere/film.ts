import { crumple, gridCost, exponentialCost, quadraticCost } from './math';
import { smooth, fade } from './story';
import { drawBoundaryDisk } from './disk';

type Tone = 'ink' | 'blue' | 'muted' | 'paper';

type Point = { x: number; y: number };

export class BoundarySphereFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private tall = false;
  private time = 0;
  private colors: Record<Tone, string> = { ink: '#28241f', blue: '#28486e', muted: '#777067', paper: '#e7e5e0' };
  private readonly labels = new Map<string, HTMLElement>();
  private readonly sizes = new Map<string, Point>();
  private readonly visible = new Set<string>();

  constructor(host: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D) {
    for (const label of host.querySelectorAll<HTMLElement>('[data-label]')) {
      if (label.dataset.label) this.labels.set(label.dataset.label, label);
    }
  }

  resize(width: number, height: number, density: number): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.tall = height > width;
    this.canvas.width = Math.round(width * density);
    this.canvas.height = Math.round(height * density);
    const style = getComputedStyle(this.canvas);

    for (const key of ['ink', 'blue', 'muted', 'paper'] as const) this.colors[key] = style.getPropertyValue(`--${key}`).trim() || this.colors[key];

    this.measureLabels();
  }

  measureLabels(): void {
    this.sizes.clear();

    for (const [id, label] of this.labels) {
      const rect = label.firstElementChild?.getBoundingClientRect();
      this.sizes.set(id, { x: rect?.width ?? 0, y: rect?.height ?? 0 });
    }
  }

  draw(time: number): void {
    this.time = time;
    this.visible.clear();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineCap = 'round';
    this.pen.lineJoin = 'round';
    drawBoundaryDisk(this.pen, this.width, this.height, time, this.colors, (id, x, y, alpha) => this.label(id, x, y, alpha));
    this.squareGrid(fade(time, 1000, 3500, 19000, 23000), true);
    this.globe(Math.max(fade(time, 25000, 28000, 51500, 55000), smooth(time, 101500, 104000)));
    this.squareGrid(fade(time, 49500, 55000, 93000, 94500), false);
    this.costPlot();
    this.growth();
    const final = smooth(time, 109000, 111000);
    const x = this.width * (this.tall ? .5 : .75);
    this.label('status', x, this.height * (this.tall ? .87 : .77), final);
    this.words('MARIO BONK · 22 OCT 2026\n“SEEMS TO BE CORRECT”', x, this.height * (this.tall ? .96 : .87), this.width * (this.tall ? .88 : .42), final, 'muted');

    for (const [id, label] of this.labels) {
      if (!this.visible.has(id)) label.style.visibility = 'hidden';
    }
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

  private label(id: string, x: number, y: number, alpha = 1): void {
    const label = this.labels.get(id);

    if (!label || alpha < .005) return;

    const size = this.sizes.get(id) ?? { x: 0, y: 0 };
    label.style.transform = `translate(${Math.max(size.x / 2 + 7, Math.min(this.width - size.x / 2 - 7, x))}px,${Math.max(size.y / 2 + 6, Math.min(this.height - size.y / 2 - 6, y))}px)`;
    label.style.visibility = 'visible';
    label.style.opacity = String(alpha);
    this.visible.add(id);
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
    this.words(t >= 101500 ? 'ROUND COORDINATES' : t >= 40500 ? 'SAME TOPOLOGY · NOT ROUND' : 'BOUNDARY: A SPHERE', center.x, center.y - radius - 23, this.width * (this.tall ? .9 : .4), alpha);
    this.words(t >= 101500 ? 'THE MOVES BECOME SYMMETRIES' : t >= 40500 ? 'DISTANCES NOT SPECIFIED · SCHEMATIC' : 'IN THREE DIMENSIONS', center.x, center.y + radius + 24, this.width * (this.tall ? .9 : .4), alpha * (1 - smooth(t, 108000, 109000)), 'muted');
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

      this.label('radius', center.x, center.y + radius + 48, covers);
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
    const distorted = opening ? 0 : Math.max(1 - smooth(t, 53500, 55500), smooth(t, 68000, 70000));
    const v = (x: number, y: number) => ({ x: left + x * cell + Math.sin(y * 1.7) * cell * .18 * distorted * Math.sin(Math.PI * x / m), y: top + y * cell + Math.sin(x * 1.4) * cell * .18 * distorted * Math.sin(Math.PI * y / m) });
    const functionStage = opening ? 0 : smooth(t, 77000, 79500);

    if (functionStage > .01) {
      for (let row = 0; row < m; row++) {
        this.pen.fillStyle = this.colors.blue;
        this.pen.globalAlpha = alpha * functionStage * (row + 1) / m * .20;
        this.pen.fillRect(left, top + row * cell, size, cell);
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

      this.line(horizontal, 'muted', alpha * .65, .6);
      this.line(vertical, 'muted', alpha * .65, .6);
    }

    const phoneClaim = this.tall && t >= 70500 && t < 77000;
    const title = opening ? 'MOVES THAT COMMUTE: A GRID' : phoneClaim ? 'PROVED · OPENAI, 23 SEP 2026' : functionStage > .5 ? 'A FUNCTION · SCHEMATIC' : distorted > .5 ? 'A PATCH OF THE BOUNDARY' : `${m} × ${m} CELLS`;
    this.words(title, center, top - 22, this.width * (this.tall ? .88 : .42), alpha, phoneClaim ? 'blue' : 'ink');

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
      if (m === 3) {
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) this.words('1/3', left + (col + .5) * cell, top + (row + .5) * cell, cell, alpha, 'ink', false);
        }
      }

      const crossed = fade(t, 56500, 58000, 63500, 65000);
      this.line([v(0, .5), v(m, .5)], 'blue', alpha * crossed, 2);
      const wiggle = fade(t, 59000, 60500, 63500, 65000);
      this.line([v(0, .5), v(1.5, .5), v(1.5, 2.5), v(3, 2.5)], 'blue', alpha * wiggle, 1.7);
      this.words(t < 59500 ? '3 × 1/3 = 1 PER CROSSING' : t < 63000 ? 'WIGGLY CROSSING: 5/3 ≥ 1' : `COST: ${m * m} × (1/${m})² = ${gridCost(m)}`, center, top + size + 25 - (this.tall ? 15 * smooth(t, 63000, 64000) : 0), w * (this.tall ? .88 : .42), alpha * (1 - smooth(t, 67500, 69000)), 'blue');
      this.words('SQUARED WEIGHTS TOTAL 1', center, top + size + 49, w * (this.tall ? .88 : .42), alpha * (1 - smooth(t, 63000, 64500)), 'muted');
    } else {
      for (let level = 1; level <= 4; level++) {
        const points: Point[] = [];

        for (let x = 0; x <= 30; x++) points.push({ x: left + x / 30 * size, y: top + size * (level / 5 + .035 * Math.sin(x / 30 * Math.PI * 3 + level)) });

        this.line(points, 'blue', alpha, 1.3);
        this.words((level / 5).toFixed(1), left - 14, top + size * level / 5, 30, alpha, 'blue');
      }

      this.words('0', left - 14, top, 25, alpha, 'blue');
      this.words('1', left - 14, top + size, 25, alpha, 'blue');
      this.words('0 AT TOP · 1 AT BOTTOM', center, top + size + 24, w * (this.tall ? .88 : .4), alpha * (this.tall ? smooth(t, 85500, 86200) : 1));
      this.label('energy', center, top + size + 48, alpha * smooth(t, 86000, 87500));
      const copies = smooth(t, 89500, 92000);
      if (copies > .01) {
        const copyW = w * (this.tall ? .28 : .12);
        const gap = w * (this.tall ? .10 : .04);
        const cy = top + size / 2;
        this.pen.globalAlpha = alpha * copies;
        this.pen.fillStyle = this.colors.paper;
        this.pen.fillRect(center - copyW - gap, cy - 30, copyW * 2 + gap * 2, 60);
        this.pen.globalAlpha = 1;

        for (const [index, value] of ['0.1–0.3', '0.6–0.8'].entries()) {
          const cx = center + (index ? 1 : -1) * (copyW / 2 + gap / 2);
          this.line([{ x: cx - copyW / 2, y: cy - 24 }, { x: cx + copyW / 2, y: cy - 24 }, { x: cx + copyW / 2, y: cy + 24 }, { x: cx - copyW / 2, y: cy + 24 }, { x: cx - copyW / 2, y: cy - 24 }], 'blue', alpha * copies);
          this.words(value, cx, cy, copyW, alpha * copies, 'blue', false);
        }

        this.words('≠', center, cy, gap, alpha * copies, 'blue', false);
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
    const alpha = fade(this.time, 93500, 95000, 101500, 103000);

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
    this.words('NESTED VALUES · SCHEMATIC CONSTANTS', left + span / 2, top - 25, span + 20, alpha);

    for (let depth = 0; depth < 4; depth++) {
      const nodes = 2 ** depth;

      for (let index = 0; index < nodes; index++) {
        const x = left + (index + .5) / nodes * span * .24;
        const y = top + depth * plotH * .23;
        this.line([{ x: x - span * .1 / nodes, y }, { x: x + span * .1 / nodes, y }], 'ink', alpha, 1.4);

        if (depth > 0) this.line([{ x, y }, { x: left + (Math.floor(index / 2) + .5) / (nodes / 2) * span * .24, y: y - plotH * .23 }], 'muted', alpha * .4, .7);
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
    this.words('LOG SIZE', plotLeft + plotW / 2, top - 9, plotW, alpha, 'muted');
    this.words('n', plotLeft + plotW + 9, top + plotH + 17, 20, alpha, 'muted');
    this.words('EXPONENTIAL', plotLeft + plotW * .68, top + 2, plotW, alpha, 'blue');
    this.words('QUADRATIC', plotLeft + plotW * .52, top + plotH * .43, plotW, alpha);
    this.words('n = 41', point(41, 1).x, top + plotH + 17, 60, alpha, 'blue');
    this.words('REQUIRED TO STAY BELOW · IMPOSSIBLE', left + span / 2, top + plotH + 42, span + 20, alpha);
  }
}

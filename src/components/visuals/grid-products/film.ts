import { A, B, SCHOOL_PRODUCT, STRASSEN_PRODUCTS, RECOMBINATIONS, POLYNOMIAL_GRID, TRIPLING_GRID } from './math';
import { smooth, fade } from './story';
import { drawRecordChart } from './chart';

type Tone = 'ink' | 'blue' | 'muted' | 'paper';

type Point = { x: number; y: number };

export class GridProductsFilm {
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

    for (const key of ['ink', 'blue', 'muted', 'paper'] as const) {
      this.colors[key] = style.getPropertyValue(`--${key}`).trim() || this.colors[key];
    }

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
    const proof = fade(time, 65500, 67500, 103500, 105000);
    this.matrices(1 - proof);
    this.characters(fade(time, 65500, 67700, 79000, 80000));
    this.polynomials(fade(time, 80000, 81500, 88000, 89000));
    this.tripling(fade(time, 88000, 89500, 103500, 105000));
    drawRecordChart(this.pen, this.width, this.height, time, this.colors, (id, x, y, opacity) => this.label(id, x, y, opacity));

    for (const [id, label] of this.labels) {
      if (!this.visible.has(id)) label.style.visibility = 'hidden';
    }
  }

  private line(x1: number, y1: number, x2: number, y2: number, tone: Tone = 'ink', opacity = 1, width = 1): void {
    if (opacity <= 0) return;

    this.pen.strokeStyle = this.colors[tone];
    this.pen.lineWidth = width;
    this.pen.globalAlpha = opacity;
    this.pen.beginPath();
    this.pen.moveTo(x1, y1);
    this.pen.lineTo(x2, y2);
    this.pen.stroke();
    this.pen.globalAlpha = 1;
  }

  private words(text: string, x: number, y: number, width: number, opacity = 1, tone: Tone = 'ink', tag = true, fontSize?: number): void {
    if (opacity < .005) return;

    const size = fontSize ?? (tag ? (this.tall ? 10 : 11) : (this.tall ? 15 : 20));
    this.pen.font = tag ? `${size}px "Special Elite", monospace` : `${size}px Alegreya, serif`;
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

    this.pen.globalAlpha = opacity;

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

  private label(id: string, x: number, y: number, opacity = 1): void {
    const label = this.labels.get(id);

    if (!label || opacity < .005) return;

    const size = this.sizes.get(id) ?? { x: 0, y: 0 };
    label.style.transform = `translate(${Math.max(size.x / 2 + 7, Math.min(this.width - size.x / 2 - 7, x))}px,${Math.max(size.y / 2 + 6, Math.min(this.height - size.y / 2 - 6, y))}px)`;
    label.style.visibility = 'visible';
    label.style.opacity = String(opacity);
    this.visible.add(id);
  }

  private grid(x: number, y: number, size: number, values: readonly number[], shown: number, blocks: number, highlight: readonly number[], opacity: number): void {
    const half = size / 2;
    this.pen.globalAlpha = opacity * .14;
    this.pen.fillStyle = this.colors.blue;

    for (const index of highlight) this.pen.fillRect(x + index % 2 * half, y + Math.floor(index / 2) * half, half, half);

    this.pen.globalAlpha = 1;

    for (let index = 0; index <= 2; index++) {
      this.line(x + index * half, y, x + index * half, y + size, 'ink', opacity, index === 1 ? 1.1 : .7);
      this.line(x, y + index * half, x + size, y + index * half, 'ink', opacity, index === 1 ? 1.1 : .7);
    }

    for (let index = 0; index < 4; index++) {
      if (index < shown) this.words(String(values[index] ?? ''), x + (index % 2 + .5) * half, y + (Math.floor(index / 2) + .5) * half, half, opacity * (1 - blocks), 'ink', false);
    }

    for (const quarter of [.25, .75]) {
      this.line(x + quarter * size, y, x + quarter * size, y + size, 'muted', blocks * opacity * .7, .6);
      this.line(x, y + quarter * size, x + size, y + quarter * size, 'muted', blocks * opacity * .7, .6);
    }
  }

  private matrices(opacity: number): void {
    if (opacity < .005) return;

    const t = this.time;
    const boardW = this.width * (this.tall ? .9 : .43);
    const left = this.width * .05;
    const size = boardW * .25;
    const y = this.height * (this.tall ? .075 : .14);
    const center = left + boardW / 2;
    const schoolCell = Math.max(0, Math.min(3, Math.floor((t - 1400) / 1500)));
    const chip = Math.max(0, Math.min(6, Math.floor((t - 11000) / 550)));
    const product = STRASSEN_PRODUCTS[chip];
    const blocks = Math.max(fade(t, 8500, 9200, 10300, 11000), smooth(t, 17000, 19000));
    const early = t < 8500;
    const aActive = early ? [Math.floor(schoolCell / 2) * 2, Math.floor(schoolCell / 2) * 2 + 1] : t < 15000 ? product?.aCells ?? [] : [];
    const bActive = early ? [schoolCell % 2, schoolCell % 2 + 2] : t < 15000 ? product?.bCells ?? [] : [];
    this.words('A', left + size / 2, y - 17, size, opacity);
    this.words('B', left + boardW * .375 + size / 2, y - 17, size, opacity);
    this.words('C', left + boardW * .75 + size / 2, y - 17, size, opacity);
    this.grid(left, y, size, A, 4, blocks, aActive, opacity);
    this.grid(left + boardW * .375, y, size, B, 4, blocks, bActive, opacity);
    this.grid(left + boardW * .75, y, size, SCHOOL_PRODUCT, early ? Math.max(0, Math.floor((t - 2300) / 1500) + 1) : 4, blocks, early ? [schoolCell] : [], opacity);
    this.words('×', left + boardW * .313, y + size / 2, boardW * .1, opacity, 'ink', false);
    this.words('=', left + boardW * .688, y + size / 2, boardW * .1, opacity, 'ink', false);
    const under = y + size + (this.tall ? 22 : 30);

    if (t < 8500) {
      const row = Math.floor(schoolCell / 2);
      const col = schoolCell % 2;
      const a = A[row * 2] ?? 0;
      const b = B[col] ?? 0;
      const c = A[row * 2 + 1] ?? 0;
      const d = B[col + 2] ?? 0;
      this.words(`${a} × ${b} + ${c} × ${d} = ${a * b + c * d}`, center, under, boardW, opacity, 'blue', false);
      this.words(`${Math.min(8, Math.max(0, Math.floor((t - 1400) / 750) + 1))} MULTIPLICATIONS`, center, under + 29, boardW, opacity);
      this.words('4 ENTRIES × 2 PRODUCTS EACH', center, under + 53, boardW, opacity, 'muted');
    } else if (t < 11000) {
      this.words('n = 4: 16 ENTRIES × 4 = 64', center, under + 8, boardW, opacity);
      this.words('TWICE AS WIDE · EIGHT TIMES THE WORK', center, under + 42, boardW, opacity, 'blue');
    } else if (t < 25500 || t >= 103500) {
      const ending = t >= 103500;
      const chipTop = under + (this.tall ? (ending ? 2 : 10) : 24);
      const cell = boardW / 4;
      const gap = this.tall ? (ending ? 26 : 31) : 45;

      for (let index = 0; index < 7; index++) {
        const value = STRASSEN_PRODUCTS[index];
        const alpha = opacity * (ending ? 1 : smooth(t, 11000 + index * 550, 11500 + index * 550));
        const row = Math.floor(index / 4);
        const x = left + (index % 4 + .5 + (row ? .5 : 0)) * cell;
        const py = chipTop + row * gap;
        this.pen.setLineDash(ending ? [3, 3] : []);
        this.line(x - cell * .4, py - 12, x + cell * .4, py - 12, 'muted', alpha);
        this.line(x - cell * .4, py + 12, x + cell * .4, py + 12, 'muted', alpha);
        this.pen.setLineDash([]);
        this.words(ending ? '?' : t >= 17000 ? 'BLOCK' : String(value?.value ?? ''), x, py, cell * .8, alpha, index === chip ? 'blue' : 'ink', !ending && t >= 17000);
      }

      const noteY = chipTop + gap + (this.tall ? (ending ? 30 : 34) : 45);

      if (ending) {
        this.words('A RECIPE EXISTS FOR SOME SIZE\nNOT WRITTEN DOWN', center, noteY, boardW, opacity, 'muted');
      } else if (t < 15000) {
        const short = product ? `${product.left} × ${product.right} = ${product.value}` : '';
        this.words(this.tall ? short : product?.expression ?? '', center, noteY, boardW, opacity, 'blue', false);
      } else if (t < 17000) {
        const equation = RECOMBINATIONS[Math.min(3, Math.floor((t - 15000) / 500))];
        this.words(equation ?? '', center, noteY, boardW, opacity, 'blue', false);
      } else {
        this.words(t < 21500 ? 'EACH BLOCK USES SEVEN AGAIN' : 'SCHOOL 64 · STRASSEN 7 × 7 = 49', center, noteY, boardW, opacity, 'blue');
        const miniature = fade(t, 19000, 20200, 21400, 22400);
        const miniY = noteY + 35;

        for (let index = 0; index < 7; index++) this.words('·', center + (index - 3) * 14, miniY, 12, opacity * miniature, 'blue', false);
      }
    } else if (t < 33500) {
      const level = Math.min(10, Math.max(1, Math.floor((t - 25500) / 480) + 1));
      const school = 8 ** level;
      const strassen = 7 ** level;
      this.words(`LEVEL ${level} · n = ${2 ** level}`, center, under, boardW, opacity, 'muted');
      this.words(`SCHOOL  ${school.toLocaleString('en-US')}`, center, under + 29, boardW, opacity, 'ink', false);
      this.words(`STRASSEN  ${strassen.toLocaleString('en-US')}`, center, under + 56, boardW, opacity, 'blue', false);
      this.words(level === 10 ? '3.8 TIMES FEWER · THE GAP KEEPS GROWING' : '×8 EACH LEVEL       ×7 EACH LEVEL', center, under + 85, boardW, opacity);
      this.label('recursion', center, under + (this.tall ? 120 : 130), opacity * smooth(t, 30000, 31000));
    } else {
      this.words('STRASSEN: SEVEN BLOCK PRODUCTS', center, under + 9, boardW, opacity);
      this.words('16 ENTRIES TO WRITE', center, under + 39, boardW, opacity, 'blue');
      const cLeft = left + boardW * .75;
      const amount = smooth(t, 33500, 39000);

      for (let cell = 0; cell < Math.floor(16 * amount); cell++) {
        const cx = cLeft + (cell % 4 + .5) * size / 4;
        const cy = y + (Math.floor(cell / 4) + .5) * size / 4;
        this.line(cx - 2, cy, cx + 2, cy, 'blue', opacity, 2);
      }
    }
  }

  private characters(opacity: number): void {
    if (opacity < .005) return;

    const w = this.width;
    const h = this.height;
    const x1 = w * (this.tall ? .23 : .23);
    const x2 = w * (this.tall ? .6 : .6);
    const y = h * (this.tall ? .20 : .34);
    const size = Math.min(w * .17, h * .16);
    const count = smooth(this.time, 72500, 74500);
    this.words('SIDE BY SIDE', x1, y - 40, w * .34, opacity);
    this.words('MADE OF BLOCKS', x2, y - 40, w * .34, opacity);
    this.grid(x1 - size - 3, y, size, [], 0, 0, [], opacity);
    this.grid(x1 + 3, y, size, [], 0, 0, [], opacity);
    this.grid(x2 - size / 2, y, size, [], 0, 1, [], opacity);
    this.words('VALUES ADD', x1, y + size + 25, w * .34, opacity);
    this.words('VALUES MULTIPLY', x2, y + size + 25, w * .34, opacity);
    this.words('METERS · SCHEMATIC', w * .42, y + size + 64, w * .65, opacity * (1 - count), 'muted');
    this.label('blocks', w * .42, y + size + (this.tall ? 77 : 85), opacity * count);
    this.label('character', w * .42, y + size + (this.tall ? 127 : 145), opacity * count);
    this.words('ANY m × m JOB', w * .42, y + size + (this.tall ? 102 : 115), w * .5, opacity * count);
  }

  private polynomials(opacity: number): void {
    if (opacity < .005) return;

    const t = this.time;
    const shearing = smooth(t, 82500, 85000);
    const cell = Math.min(this.width * (this.tall ? .105 : .075), this.tall ? 30 : 46);
    const left = this.width * (this.tall ? .08 : .15);
    const top = this.height * (this.tall ? .14 : .23);
    this.words('MULTIPLY TWO POLYNOMIALS', this.width * .42, top - 30, this.width * .75, opacity);

    for (const entry of POLYNOMIAL_GRID) {
      const x = left + (entry.x + entry.row * shearing) * cell;
      const y = top + entry.row * cell;
      this.pen.fillStyle = this.colors[entry.column % 2 ? 'blue' : 'ink'];
      this.pen.globalAlpha = opacity * .06;
      this.pen.fillRect(x, y, cell, cell);
      this.pen.globalAlpha = 1;
      this.line(x, y, x + cell, y, 'muted', opacity * .5, .6);
      this.line(x, y, x, y + cell, 'muted', opacity * .5, .6);
      this.words(`x${'₀₁₂₃'[entry.x]}y${'₀₁₂₃'[entry.row]}`, x + cell / 2, y + cell / 2, cell, opacity, 'ink', false, this.tall ? 12 : 20);
    }

    const base = top + cell * 4 + 22;
    const points = smooth(t, 85000, 87000);

    for (let column = 0; column < 7; column++) {
      const x = left + (column + .5) * cell;
      this.line(x, base - 4, x, base + 4, 'blue', opacity * points, 3);
    }

    this.words('16 PRODUCTS · 7 ANSWER COEFFICIENTS', this.width * .42, base + 30, this.width * .76, opacity);
    this.words('EVALUATE AT 7 POINTS', this.width * .42, base + 57, this.width * .72, opacity * points, 'blue');
    this.label('points', this.width * .42, base + 90, opacity * points);
  }

  private tripling(opacity: number): void {
    if (opacity < .005) return;

    const shrinking = smooth(this.time, 95500, 97200);
    const size = Math.min(this.width * (this.tall ? .071 : .054), this.tall ? 24 : 38) * (1 - shrinking * (this.tall ? .33 : .55));
    const left = this.width * (this.tall ? .06 : .08);
    const top = this.height * (this.tall ? .12 : .17);
    const center = left + 5 * size;
    this.words('THREE COPIES SHARE x₀, x₁, x₂', center, top - 24, size * 10 + 10, opacity * (1 - shrinking));
    const crossing = smooth(this.time, 90000, 93500);
    let removed = 0;

    for (const entry of TRIPLING_GRID) {
      const x = left + entry.column * size;
      const y = top + entry.row * size;
      this.pen.globalAlpha = opacity * (entry.kept ? .11 : .035);
      this.pen.fillStyle = this.colors[entry.rowSector === 'middle' ? 'blue' : 'ink'];
      this.pen.fillRect(x, y, size - 1, size - 1);
      this.pen.globalAlpha = 1;
      this.words(shrinking > .5 ? '·' : `x${'₀₁₂'[entry.x]}`, x + size / 2, y + size / 2, size, opacity, entry.kept ? 'ink' : 'muted', true);

      if (!entry.kept) {
        const alpha = Math.max(0, Math.min(1, crossing * 6 - removed));
        this.line(x + 3, y + 3, x + size - 3, y + size - 3, 'blue', opacity * alpha, 1.2);
        this.line(x + size - 3, y + 3, x + 3, y + size - 3, 'blue', opacity * alpha, 1.2);
        removed += 1;
      }
    }

    for (const box of [{ x: 0, y: 0, w: 4, h: 2 }, { x: 4, y: 2, w: 2, h: 4 }, { x: 6, y: 6, w: 4, h: 2 }]) {
      this.line(left + box.x * size, top + box.y * size, left + (box.x + box.w) * size, top + box.y * size, 'blue', opacity * .8);
      this.line(left + box.x * size, top + (box.y + box.h) * size, left + (box.x + box.w) * size, top + (box.y + box.h) * size, 'blue', opacity * .8);
    }

    const below = top + size * 8 + 25;
    this.words('6 PRODUCTS IN EACH · 6 CROSSED OUT', center, below, size * 10 + 10, opacity * (1 - shrinking));
    this.label('tripling', center, below + 35, opacity * smooth(this.time, 93500, 95000) * (1 - shrinking));
    this.words('P: MEASURE OF THE PRODUCT', center, below + 65, size * 10 + 20, opacity * smooth(this.time, 93500, 95000) * (1 - shrinking));
  }
}

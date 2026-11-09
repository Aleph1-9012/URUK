import { fade, mix, progress as share, smooth as span } from '../../../lib/animation';
import { CATALAN, EXAMPLES, SUMS, LOWER_BOUND, UPPER_BOUND } from './catalan';
import { geometryAt, termsAt, type Layout } from './story';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type Point = readonly [number, number];

type Plot = { x: number; y: number; w: number; h: number };

type Align = 'left' | 'center' | 'right';

const ALIGN_SHIFT: Record<Align, number> = { left: 0.5, center: 0, right: -0.5 };

const HOP_TERMS = ['+1', '−1/9'];

export class CatalanFilm {
  private readonly context: CanvasRenderingContext2D;
  private readonly visible = new Set<string>();
  private readonly measured = new Map<string, { width: number; height: number }>();
  private colors: Colors = { ink: '#1c1a17', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  private width = 1;
  private height = 1;
  private ratio = 1;
  private layout: Layout = 'wide';
  private time = 0;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly labels: ReadonlyMap<string, HTMLElement>) {
    const context = canvas.getContext('2d');

    if (!context) throw new Error('The Catalan film needs a 2D canvas.');

    this.context = context;
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const style = getComputedStyle(this.canvas);
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.ratio = window.devicePixelRatio || 1;
    this.layout = this.width >= this.height ? 'wide' : 'tall';
    this.canvas.width = Math.round(this.width * this.ratio);
    this.canvas.height = Math.round(this.height * this.ratio);
    this.colors = {
      ink: style.getPropertyValue('--ink').trim() || this.colors.ink,
      blue: style.getPropertyValue('--blue').trim() || this.colors.blue,
      muted: style.getPropertyValue('--muted').trim() || this.colors.muted,
      paper: style.getPropertyValue('--paper').trim() || this.colors.paper,
    };
    this.measured.clear();
  }

  draw(time: number): void {
    this.time = time;
    this.visible.clear();
    const context = this.context;
    context.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    context.clearRect(0, 0, this.width, this.height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    this.opening();
    this.comparison();
    this.integerGap();
    this.construction();
    this.bounds();
    this.label('rational', 0.5, mix(0.17, this.layout === 'tall' ? 0.12 : 0.14, span(time, 73500, 76300)), fade(time, 66400, 68000, 101500, 102500));
    this.label('determinant', 0.5, mix(0.69, 0.38, span(time, 67900, 71300)), fade(time, 68800, 70800, 74800, 75800));

    for (const [id, element] of this.labels) {
      if (!this.visible.has(id)) {
        element.style.visibility = 'hidden';
        element.style.opacity = '0';
      }
    }
  }

  // Coordinates below are shares of the frame, except explicit font sizes and stroke widths.
  private line(points: readonly Point[], color: string, alpha = 1, width = 1): void {
    if (alpha <= 0 || points.length < 2) return;

    const context = this.context;
    context.beginPath();

    for (const [index, point] of points.entries()) {
      if (index === 0) context.moveTo(point[0] * this.width, point[1] * this.height);
      else context.lineTo(point[0] * this.width, point[1] * this.height);
    }

    context.strokeStyle = color;
    context.globalAlpha = alpha;
    context.lineWidth = width;
    context.stroke();
    context.globalAlpha = 1;
  }

  private dot(x: number, y: number, radius: number, color: string, alpha = 1, hollow = false): void {
    if (alpha <= 0) return;

    const context = this.context;
    context.globalAlpha = alpha;
    context.beginPath();
    context.arc(x * this.width, y * this.height, radius, 0, 2 * Math.PI);
    context.fillStyle = hollow ? this.colors.paper : color;
    context.fill();

    if (hollow) {
      context.strokeStyle = color;
      context.lineWidth = 1.4;
      context.stroke();
    }

    context.globalAlpha = 1;
  }

  private head(tip: Point, direction: -1 | 1, color: string, alpha: number): void {
    if (alpha <= 0) return;

    const context = this.context;
    const x = tip[0] * this.width;
    const y = tip[1] * this.height;
    context.globalAlpha = alpha;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x - direction * 9, y - 5);
    context.lineTo(x - direction * 9, y + 5);
    context.closePath();
    context.fillStyle = color;
    context.fill();
    context.globalAlpha = 1;
  }

  private text(value: string, x: number, y: number, alpha = 1, tone: keyof Colors = 'ink', kind: 'note' | 'tag' | 'number' = 'note', align: Align = 'center'): void {
    if (alpha <= 0) return;

    const context = this.context;
    const size = kind === 'tag' ? 10 : this.layout === 'tall' ? 14 : 17;
    context.font = kind === 'tag' ? `${size}px "Special Elite", monospace` : `${kind === 'note' ? 'italic ' : ''}${size}px Alegreya, Georgia, serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.globalAlpha = alpha;
    const lines = value.split('\n');

    for (const [index, line] of lines.entries()) {
      const width = context.measureText(line).width;
      const centre = x * this.width + ALIGN_SHIFT[align] * width;
      const px = Math.min(this.width - width / 2 - 7, Math.max(width / 2 + 7, centre));
      const py = y * this.height + (index - (lines.length - 1) / 2) * (size + 4);
      context.fillStyle = this.colors.paper;
      context.fillRect(px - width / 2 - 3, py - size * 0.65, width + 6, size * 1.3);
      context.fillStyle = this.colors[tone];
      context.fillText(line, px, py);
    }

    context.globalAlpha = 1;
  }

  // Places a formula and returns its half width as a share of the frame.
  private label(id: string, x: number, y: number, alpha = 1): number {
    const element = this.labels.get(id);

    if (!element || alpha <= 0.005) return 0;

    let box = this.measured.get(id);

    if (!box) {
      const rect = element.firstElementChild?.getBoundingClientRect();
      box = { width: rect?.width ?? 0, height: rect?.height ?? 0 };
      this.measured.set(id, box);
    }

    const px = Math.max(box.width / 2 + 8, Math.min(this.width - box.width / 2 - 8, x * this.width));
    const py = Math.max(box.height / 2 + 4, Math.min(this.height - box.height / 2 - 4, y * this.height));
    element.style.transform = `translate(${px.toFixed(2)}px, ${py.toFixed(2)}px)`;
    element.style.visibility = 'visible';
    element.style.opacity = alpha.toFixed(3);
    this.visible.add(id);

    return box.width / 2 / this.width;
  }

  private shade(left: number, right: number, top: number, bottom: number, tone: keyof Colors, alpha: number): void {
    if (alpha <= 0 || right <= left) return;

    const context = this.context;
    const height = (bottom - top) * this.height;
    context.save();
    context.beginPath();
    context.rect(left * this.width, top * this.height, (right - left) * this.width, height);
    context.clip();
    context.beginPath();

    for (let start = left * this.width - height; start < right * this.width; start += 7) {
      context.moveTo(start, bottom * this.height);
      context.lineTo(start + height, top * this.height);
    }

    context.strokeStyle = this.colors[tone];
    context.globalAlpha = alpha;
    context.lineWidth = 1;
    context.stroke();
    context.restore();
  }

  private opening(): void {
    const time = this.time;
    const alpha = 1 - span(time, 21800, 24000);

    if (alpha <= 0) return;

    const tall = this.layout === 'tall';
    const { lineY, lineLeft, lineRight, viewLeft, viewRight } = geometryAt(time, this.layout);
    const x = (value: number) => lineLeft + (value - viewLeft) / (viewRight - viewLeft) * (lineRight - lineLeft);
    const zoom = span(time, 7600, 12500);
    const count = termsAt(time);
    const settled = fade(time, 10000, 13000);
    const wording = alpha * (1 - span(time, 21800, 22600));
    this.label('series', 0.5, 0.11, wording);
    this.text('ADD, SUBTRACT, REPEAT', 0.5, 0.21, wording * (1 - settled), 'muted', 'tag');
    this.line([[lineLeft, lineY], [lineRight, lineY]], this.colors.ink, alpha);

    for (let step = 0; step <= 20; step += 1) {
      const value = mix(step / 20, 0.88 + step * 0.006, zoom);
      const place = x(value);

      if (place < lineLeft || place > lineRight) continue;

      this.line([[place, lineY - 0.009], [place, lineY + 0.009]], this.colors.muted, alpha * 0.6, 1 / this.ratio);

      if (step % 10 === 0) this.text(value.toFixed(zoom > 0.9 ? 2 : 1), place, lineY + 0.07, wording, 'muted', 'number');
    }

    const gx = x(CATALAN);
    this.line([[gx, lineY - 0.1], [gx, lineY + 0.03]], this.colors.blue, alpha * settled);
    const half = this.label('g', gx, lineY - 0.14, wording * settled);
    this.text('= 0.9159655…', gx + half + 0.008, lineY - 0.14, wording * span(time, 12400, 13400), 'blue', 'number', 'left');
    const context = this.context;
    context.save();
    context.beginPath();
    context.rect(lineLeft * this.width, (lineY - 0.26) * this.height, (lineRight - lineLeft) * this.width, 0.45 * this.height);
    context.clip();
    let from = 0;

    for (const [index, sum] of SUMS.entries()) {
      const progress = Math.min(1, Math.max(0, count - index));

      if (progress <= 0) break;

      const start = x(from);
      const end = x(sum.value);
      const side = index % 2 === 0 ? 1 : -1;
      const arcHeight = Math.min(mix(0.19, 0.12, span(time, 15000, 17000)), Math.abs(end - start) * 0.28 + 0.018);
      const arcAlpha = alpha * (index >= 4 ? 0.2 : 0.5) * (index === 0 ? 1 - zoom : 1);
      const points: Point[] = [];

      for (let segment = 0; segment <= 40; segment += 1) {
        const travel = segment / 40 * progress;
        points.push([mix(start, end, travel), lineY - Math.sin(Math.PI * travel) * arcHeight * side]);
      }

      this.line(points, this.colors.ink, arcAlpha, 1);
      this.dot(end, lineY, index < 4 ? 3 : 1.6, this.colors.ink, alpha * progress * 0.65);
      const term = HOP_TERMS[index];

      if (term) {
        const below = tall ? 0.12 : 0.13;
        this.text(term, mix(start, end, 0.5), lineY - side * (side > 0 ? arcHeight - 0.04 : below), wording * span(progress, 0.3, 0.9) * (1 - span(time, 7000, 8000)), 'ink', 'number');
      }

      if (index === Math.ceil(count) - 1) {
        this.dot(mix(start, end, progress), lineY - Math.sin(Math.PI * progress) * arcHeight * side, 4.5, this.colors.blue, alpha);
      }

      from = sum.value;
    }

    context.restore();
    const ledger = wording * span(time, 15300, 17700);

    if (ledger > 0) {
      this.text('THE FIRST SIX SUMS, EXACTLY', 0.5, tall ? 0.55 : 0.65, ledger, 'muted', 'tag');

      for (const [index, sum] of SUMS.slice(0, 6).entries()) {
        const shown = ledger * span(time, 15700 + index * 250, 16500 + index * 250);
        const side = index % 2 === 0 ? -1 : 1;
        const reach = index >= 4 ? 0.085 : 0.045;
        const place = x(sum.value);
        this.line([[place, lineY + side * 0.012], [place, lineY + side * (reach - 0.018)]], this.colors.muted, shown * 0.6, 1 / this.ratio);
        this.text(String(index + 1), place, lineY + side * reach, shown, 'muted', 'tag');
        const px = tall ? 0.27 + index % 2 * 0.46 : 0.1 + index * 0.16;
        const py = tall ? 0.65 + Math.floor(index / 2) * 0.13 : 0.79;
        this.label(`sum-${index}`, px, py, shown);
      }
    } else {
      this.text('Each step is smaller than the last.', 0.5, 0.81, wording * fade(time, 4000, 5500, 14500, 15500));
    }
  }

  private comparison(): void {
    const time = this.time;
    const alpha = fade(time, 22800, 24500, 39500, 41400);

    if (alpha <= 0) return;

    const tall = this.layout === 'tall';
    const first: Plot = tall ? { x: 0.2, y: 0.25, w: 0.65, h: 0.23 } : { x: 0.13, y: 0.28, w: 0.32, h: 0.46 };
    const second: Plot = tall ? { x: 0.2, y: 0.68, w: 0.65, h: 0.2 } : { x: 0.62, y: 0.28, w: 0.28, h: 0.46 };
    const multiply = span(time, 32200, 36600);
    const named = alpha * span(time, 25600, 26300);
    const before = 1 - span(time, 31200, 32300);
    const after = span(time, 36600, 37300);
    const title = (plot: Plot) => plot.y - (tall ? 0.105 : 0.12);
    const centre = first.x + first.w / 2;
    this.label('approximation', 0.5, tall ? 0.07 : 0.085, alpha);
    this.text('ERROR', centre, title(first), named * before, 'muted', 'tag');
    this.label('error', centre, first.y - 0.055, named * before);
    this.text('Multiplying by q', centre, first.y - 0.06, alpha * fade(time, 32300, 33300, 36100, 36600), 'blue');
    this.text('ERROR × q', centre, title(first), named * after, 'blue', 'tag');
    this.label('cleared', centre, first.y - 0.055, named * after);
    this.text('DENOMINATOR q', second.x + second.w / 2, title(second), named, 'muted', 'tag');
    this.text('n = NUMBER OF TERMS · LOG SCALES', 0.5, 0.965, named, 'muted', 'tag');
    const errorEnd = this.logPlot(first, -3, mix(0, 5, multiply), false, multiply, alpha);
    const denominatorEnd = this.logPlot(second, 0, 8, true, 0, alpha);
    const last = EXAMPLES[5];

    if (!last || time < 26300) return;

    const value = last.error * Number(last.denominator) ** multiply;
    const shown = value < 1 ? value.toFixed(4) : Math.round(value).toLocaleString('en-US');
    this.text(shown, errorEnd[0] + 0.015, errorEnd[1] - 0.05, named, multiply > 0 ? 'blue' : 'ink', 'number', 'right');
    this.text(Number(last.denominator).toLocaleString('en-US'), denominatorEnd[0] + 0.015, denominatorEnd[1] - 0.05, named, 'ink', 'number', 'right');
  }

  private logPlot(plot: Plot, low: number, high: number, denominators: boolean, multiply: number, alpha: number): Point {
    const x = (index: number) => plot.x + index / 5 * plot.w;
    const y = (log: number) => plot.y + plot.h * (1 - (log - low) / (high - low));
    const unfold = span(this.time, 22800, 25600);
    const opening = geometryAt(23000, this.layout);
    const axes = alpha * span(this.time, 25600, 26300);
    const baseline = mix(opening.lineY, plot.y + plot.h, unfold);
    const left = mix(opening.lineLeft, plot.x, unfold);
    const right = mix(opening.lineRight, plot.x + plot.w, unfold);
    this.line([[left, mix(baseline, plot.y, unfold)], [left, baseline], [right, baseline]], this.colors.muted, alpha * 0.7);
    const ticks = denominators ? [0, 4, 8] : [-3, 0, 3];

    for (const exponent of ticks) {
      if (exponent > high) continue;

      const py = y(exponent);
      this.line([[plot.x, py], [plot.x + plot.w, py]], this.colors.muted, axes * 0.22, 1 / this.ratio);
      const name = exponent === -3 ? '.001' : exponent === 0 ? '1' : exponent === 3 ? '1,000' : exponent === 4 ? '10⁴' : '10⁸';
      this.text(name, plot.x - 0.065, py, axes, 'muted', 'tag');
    }

    const points: Point[] = [];
    const ghosts: Point[] = [];
    const revealed = 5 * share(this.time, 23700, 26700);
    const ghost = alpha * Math.min(1, multiply * 4) * 0.55;

    for (const [index, sum] of EXAMPLES.entries()) {
      const value = denominators ? Number(sum.denominator) : sum.error * Number(sum.denominator) ** multiply;
      const startX = opening.lineLeft + (sum.value - opening.viewLeft) / (opening.viewRight - opening.viewLeft) * (opening.lineRight - opening.lineLeft);
      const point: Point = [mix(startX, x(index), unfold), mix(opening.lineY, y(Math.log10(value)), unfold)];
      const seen = Math.min(1, Math.max(0, revealed - index + 1));
      const previous = points[index - 1];

      if (previous) this.line([previous, [mix(previous[0], point[0], seen), mix(previous[1], point[1], seen)]], this.colors.blue, alpha * 0.8, 1.5);

      if (ghost > 0) {
        const old: Point = [x(index), y(Math.log10(sum.error))];
        ghosts.push(old);
        this.line([old, [old[0], point[1] + 0.012]], this.colors.muted, ghost * 0.6, 1 / this.ratio);
        this.dot(old[0], old[1], 2.4, this.colors.muted, ghost, true);
      }

      points.push(point);
      this.dot(point[0], point[1], 3.2, this.colors.blue, alpha * seen);
    }

    this.line(ghosts, this.colors.muted, ghost * 0.7, 1);

    for (let index = 0; index < 6; index += 1) {
      this.text(String(index + 1), x(index), plot.y + plot.h + 0.038, axes, 'muted', 'tag');
    }

    this.text('n', plot.x + plot.w + 0.045, plot.y + plot.h + 0.038, axes, 'muted', 'tag');

    return points[5] ?? [x(5), y(low)];
  }

  private integerGap(): void {
    const time = this.time;
    const alpha = fade(time, 40200, 42000, 48800, 50200);

    if (alpha <= 0) return;

    const tall = this.layout === 'tall';
    const enter = span(time, 40200, 43000);
    const y = mix(tall ? 0.48 : 0.74, 0.58, enter);
    const left = mix(tall ? 0.2 : 0.13, 0.12, enter);
    const right = mix(tall ? 0.85 : 0.45, 0.88, enter);
    const at = (value: number) => mix(left, right, value / 4);
    const wording = alpha * span(time, 41200, 42400) * (1 - span(time, 48800, 49900));
    this.text('SUPPOSE', 0.5, 0.1, wording, 'muted', 'tag');
    this.label('rational', 0.5, 0.18, wording);
    this.label('integer', 0.5, 0.29, wording);
    this.text('A WHOLE NUMBER', 0.5, 0.355, wording, 'blue', 'tag');
    this.line([[left, y], [right, y]], this.colors.ink, alpha);

    for (let whole = 0; whole <= 4; whole += 1) {
      this.dot(at(whole), y, 3.4, this.colors.ink, alpha);
      this.text(String(whole), at(whole), y + 0.07, alpha, 'ink', 'number');
    }

    // Between 0 and 1 there is no whole number to stand on.
    const empty = alpha * span(time, 45200, 46000);
    this.shade(at(0) + 0.012, at(1) - 0.012, y - 0.03, y + 0.03, 'muted', empty * 0.7);
    this.text(tall ? 'no whole\nnumber here' : 'no whole number here', at(0.5), y - (tall ? 0.1 : 0.09), wording * empty, 'muted');
    // If it kept shrinking it would step 4, 3, 2, 1 and then have to land inside (0, 1).
    const steps = 3 * share(time, 42600, 45200);
    const slide = span(time, 45800, 46600);
    const value = steps < 3 ? 4 - steps : mix(1, 0.45, slide);
    const lift = steps < 3 ? Math.sin(Math.PI * (steps % 1)) * 0.06 : 0;
    this.dot(at(value), y - lift, 6, this.colors.blue, alpha * span(time, 42000, 42600), true);
    const cross = alpha * span(time, 46600, 47400);
    const point = at(value);
    this.line([[point - 0.022, y - 0.03], [point + 0.022, y + 0.03]], this.colors.blue, cross, 1.8);
    this.line([[point - 0.022, y + 0.03], [point + 0.022, y - 0.03]], this.colors.blue, cross, 1.8);
    this.text(tall ? 'A whole number that is not 0\nis at least 1.' : 'A whole number that is not 0 is at least 1.', 0.5, 0.78, wording * span(time, 46600, 47600));
    this.text('SCHEMATIC · IF IT KEPT SHRINKING', 0.5, 0.92, wording * span(time, 42000, 43000), 'muted', 'tag');
  }

  private construction(): void {
    const time = this.time;
    const alpha = fade(time, 49600, 52000, 73500, 75800);

    if (alpha <= 0) return;

    const wording = alpha * (1 - span(time, 73300, 74100));
    const contact = span(time, 58000, 60700);
    const collapse = span(time, 67900, 71300);
    const tall = this.layout === 'tall';
    const size = mix(tall ? 0.42 : 0.27, tall ? 0.24 : 0.13, contact) * (1 - collapse * 0.8);
    const y = mix(0.43, 0.32, contact);
    const entry = alpha * fade(time, 59400, 60600, 63300, 64100);
    const rational = span(time, 66400, 67600);
    this.text('CLAIMED CONSTRUCTION · SCHEMATIC', 0.5, 0.06, wording, 'muted', 'tag');
    this.label('matrix-size', 0.5, 0.17, wording * (1 - contact));
    this.label('rational', 0.5, 0.17, wording * span(time, 66400, 68000));
    const cell = this.matrix(0.5, y, size, alpha * (1 - collapse), span(time, 50600, 54900), entry, rational);
    this.label('determinant', 0.5, mix(0.69, 0.38, collapse), wording * (1 - contact * (1 - span(time, 68800, 70800))));
    this.text('A square array gives one number.', 0.5, 0.83, wording * (1 - contact));
    this.line([[cell[0], cell[1] + 0.02], [0.5, 0.595]], this.colors.blue, entry * 0.6);
    this.label('entry', 0.5, 0.63, entry);
    const cancel = alpha * fade(time, 64100, 64900, 67600, 68600);
    this.label('entry-clean', 0.35, 0.63, cancel);
    this.label('unwanted', 0.7, 0.63, cancel);
    this.beginnings(wording * fade(time, 60400, 62000, 66500, 67800));
    this.label('entry-clean', 0.5, 0.6, wording * span(time, 70600, 71800));
    this.text('Rational entries. Rational determinant.', 0.5, 0.79, wording * span(time, 70600, 71800));
  }

  private beginnings(alpha: number): void {
    if (alpha <= 0) return;

    const tall = this.layout === 'tall';
    const left = tall ? 0.2 : 0.34;
    const right = 1 - left;
    const top = tall ? 0.765 : 0.745;
    const apart = tall ? 0.06 : 0.075;
    const reveal = span(this.time, 60400, 62600);
    const curve = (apart: number): Point[] => {
      const points: Point[] = [];

      for (let step = 0; step <= 48; step += 1) {
        const t = step / 48 * reveal;
        points.push([mix(left, right, t), top + 0.03 * t + 0.02 * t * t + apart * t ** 4]);
      }

      return points;
    };

    this.line(curve(0), this.colors.ink, alpha, 1.5);
    this.line(curve(apart), this.colors.blue, alpha, 1.5);
    this.dot(left, top, 3.4, this.colors.ink, alpha);
    this.text('SAME BEGINNING', left, top - 0.04, alpha, 'muted', 'tag', 'left');
    this.text('Matching the beginnings', 0.5, tall ? 0.93 : 0.92, alpha);
  }

  private matrix(x: number, y: number, size: number, alpha: number, fill = 1, ring = 0, rational = 0): Point {
    const halfWidth = size / 2;
    const halfHeight = size * this.width / this.height / 2;
    const step = size / 6;
    const ringed: Point = [x - step, y + step * this.width / this.height];
    this.line([[x - halfWidth + 0.012, y - halfHeight], [x - halfWidth, y - halfHeight], [x - halfWidth, y + halfHeight], [x - halfWidth + 0.012, y + halfHeight]], this.colors.ink, alpha);
    this.line([[x + halfWidth - 0.012, y - halfHeight], [x + halfWidth, y - halfHeight], [x + halfWidth, y + halfHeight], [x + halfWidth - 0.012, y + halfHeight]], this.colors.ink, alpha);
    const small = step * this.width < 12;

    for (let row = 0; row < 5; row += 1) {
      for (let column = 0; column < 5; column += 1) {
        const arrived = Math.min(1, Math.max(0, fill * 25 - row * 5 - column));
        const px = x + (column - 2) * step;
        const py = y + (row - 2) * step * this.width / this.height;
        const color = column === row ? this.colors.blue : this.colors.ink;
        this.dot(px, py, small ? 1.2 : 2, color, alpha * arrived * (1 - rational));

        if (rational > 0) this.fraction(px, py, Math.min(5, step * this.width * 0.22), color, alpha * arrived * rational);
      }
    }

    const spacing = step * this.width;
    this.dot(ringed[0], ringed[1], Math.min(9, spacing * 0.5), this.colors.blue, alpha * ring * 0.9, true);
    this.dot(ringed[0], ringed[1], small ? 1.2 : 2, this.colors.blue, alpha * ring);

    return ringed;
  }

  private fraction(x: number, y: number, half: number, color: string, alpha: number): void {
    const px = half / this.width;
    const py = half * 1.3 / this.height;
    this.line([[x - px, y], [x + px, y]], color, alpha, 1.2);
    this.dot(x, y - py, 1.3, color, alpha);
    this.dot(x, y + py, 1.3, color, alpha);
  }

  private bounds(): void {
    const time = this.time;
    const alpha = span(time, 74200, 76300);

    if (alpha <= 0) return;

    const tall = this.layout === 'tall';
    const retire = span(time, 101500, 102500);
    const finale = span(time, 102500, 105300);
    const status = span(time, 112500, 114200);
    const beforeStatus = 1 - span(time, 111800, 112300);
    const floorIn = span(time, 76600, 80700);
    const ceilingIn = span(time, 94700, 99000);
    const left = tall ? 0.08 : 0.1;
    const right = 1 - left;
    const lineY = tall ? 0.6 : 0.58;
    const low = -2.29105;
    const high = -2.29072;
    const x = (value: number) => left + (value - low) / (high - low) * (right - left);
    const floorX = x(LOWER_BOUND);
    const ceilingX = x(UPPER_BOUND);
    this.text('SUPPOSE G IS RATIONAL · SCHEMATIC', 0.5, 0.055, alpha * (1 - retire), 'muted', 'tag');
    this.text('AS THE ARRAYS GROW', 0.5, 0.055, alpha * span(time, 102700, 103600) * beforeStatus, 'muted', 'tag');
    this.text('UNREVIEWED · 18 OCTOBER 2026', 0.5, 0.055, alpha * status, 'blue', 'tag');
    this.label('normalized', 0.5, tall ? 0.205 : 0.24, alpha);
    this.text(tall ? 'SIZE OF THE DETERMINANT, LOG SCALE' : 'THE SIZE OF THE DETERMINANT, ON A LOG SCALE', 0.5, tall ? 0.28 : 0.31, alpha, 'muted', 'tag');

    this.line([[left, lineY], [right, lineY]], this.colors.muted, alpha * 0.8, 1);

    for (let tick = 0; tick <= 5; tick += 1) {
      const place = x(-2.291 + tick * 0.00005);
      this.line([[place, lineY - 0.008], [place, lineY + 0.008]], this.colors.muted, alpha * 0.6, 1 / this.ratio);
    }

    this.text('← SMALLER', left, lineY + 0.04, alpha, 'muted', 'tag', 'left');
    this.text('LARGER →', right, lineY + 0.04, alpha, 'muted', 'tag', 'right');

    const floorEnd = mix(floorX, right, floorIn);
    this.line([[floorX, lineY - 0.035], [floorX, lineY + 0.035]], this.colors.ink, alpha * span(time, 76000, 76600), 2);
    this.line([[floorX, lineY], [floorEnd, lineY]], this.colors.ink, alpha, 4);
    this.head([floorEnd + 0.004, lineY], 1, this.colors.ink, alpha * span(time, 76800, 77400));
    this.label('lower', tall ? 0.5 : (floorX + right) / 2, tall ? mix(0.53, 0.45, finale) : 0.51, alpha * span(time, 77000, 78500));

    const ceilingStart = mix(ceilingX, left, ceilingIn);
    this.line([[ceilingX, lineY - 0.035], [ceilingX, lineY + 0.035]], this.colors.blue, alpha * span(time, 94000, 94700), 2);
    this.line([[ceilingStart, lineY], [ceilingX, lineY]], this.colors.blue, alpha, 4);
    this.head([ceilingStart - 0.004, lineY], -1, this.colors.blue, alpha * span(time, 94900, 95500));
    this.label('upper', tall ? 0.5 : (left + ceilingX) / 2, tall ? 0.69 : 0.67, alpha * span(time, 95500, 97000));

    this.proofSources(alpha * (1 - retire), tall);

    const gap = alpha * span(time, 104000, 105300);
    const gapY = lineY - 0.045;
    this.shade(ceilingX + 0.006, floorX - 0.006, lineY - 0.022, lineY + 0.022, 'muted', gap * 0.7);
    this.line([[ceilingX, gapY + 0.014], [ceilingX, gapY], [floorX, gapY], [floorX, gapY + 0.014]], this.colors.muted, gap);
    this.text('gap 0.000099875', (ceilingX + floorX) / 2, gapY - 0.035, gap, 'blue', 'number');
    const conclusion = tall ? 'Nothing is above the floor\nand below the ceiling.' : 'Nothing is above the floor and below the ceiling.';
    this.text(conclusion, 0.5, tall ? 0.86 : 0.88, alpha * finale * beforeStatus);
    this.text('The paper claims G is irrational.', 0.5, tall ? 0.86 : 0.88, alpha * status);
  }

  private proofSources(alpha: number, tall: boolean): void {
    if (alpha <= 0) return;

    const time = this.time;
    // The floor: a nonzero fraction cannot be smaller than one over its denominator.
    const floor = alpha * fade(time, 75900, 76900, 82600, 83400);
    const rule = tall ? 'A fraction that is not 0 is at\nleast 1 / its denominator.' : 'A fraction that is not 0 is at least 1 / its denominator.';
    this.text(rule, 0.5, tall ? 0.36 : 0.37, floor);
    this.label('denominator', 0.5, tall ? 0.45 : 0.43, floor * span(time, 77600, 78800));

    // Zero: three fixed matrices rule it out along infinitely many primes.
    const zero = alpha * fade(time, 83300, 84300, 91300, 92300);
    const matricesX = tall ? 0.32 : 0.5;
    this.text(tall ? '3 FIXED MATRICES' : 'THREE FIXED MATRICES · INFINITELY MANY PRIMES p', matricesX, 0.36, zero, 'muted', 'tag');

    for (let index = 0; index < 3; index += 1) {
      this.matrix(matricesX + (index - 1) * (tall ? 0.17 : 0.1), tall ? 0.415 : 0.42, tall ? 0.08 : 0.045, zero, span(time, 84200 + index * 700, 85600 + index * 700));
    }

    const zeroX = tall ? 0.78 : 0.24;
    const zeroY = tall ? 0.415 : 0.42;
    const struck = span(time, 87600, 88400);
    const half = this.label('zero', zeroX, zeroY, zero * (1 - span(time, 88600, 89200)));
    this.line([[zeroX - half - 0.006, zeroY], [zeroX - half - 0.006 + struck * (2 * half + 0.012), zeroY]], this.colors.blue, zero * (1 - span(time, 88600, 89200)), 1.8);
    this.label('nonzero', zeroX, zeroY, zero * span(time, 88800, 89600));
    const pointer = zero * span(time, 86400, 87200);
    const direction = tall ? 1 : -1;
    const from = matricesX + direction * (tall ? 0.17 + 0.06 : 0.1 + 0.035);
    const to = zeroX - direction * (Math.max(half, 0.03) + 0.02);
    this.line([[from, zeroY], [to - direction * 0.01, zeroY]], this.colors.blue, pointer, 1.2);
    this.head([to, zeroY], direction, this.colors.blue, pointer);

    // The ceiling: an integral that runs over both branches of the construction.
    const ceiling = alpha * fade(time, 92300, 93500, 100800, 101800);
    const junctionX = tall ? 0.5 : 0.3;
    const junctionY = tall ? 0.775 : 0.76;
    const spread = tall ? 0.24 : 0.14;
    const grow = span(time, 92800, 94400);

    for (const side of [-1, 1] as const) {
      const points: Point[] = [];

      for (let step = 0; step <= 30; step += 1) {
        const t = step / 30 * grow;
        points.push([junctionX + side * spread * (1 - t), mix(tall ? 0.885 : 0.86, junctionY + 0.04, t) + Math.sin(Math.PI * t) * 0.02]);
      }

      this.line(points, side < 0 ? this.colors.ink : this.colors.blue, ceiling, 1.5);
      this.text(side < 0 ? 'branch 1' : 'branch 2', junctionX + side * spread, tall ? 0.92 : 0.895, ceiling);
    }

    this.label('integral', junctionX, junctionY, ceiling);
    this.text('BOTH BRANCHES COUNTED', junctionX, tall ? 0.965 : 0.95, ceiling * span(time, 94400, 95200), 'muted', 'tag');
  }
}

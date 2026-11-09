import { crossfade as fade, smoothStep as span } from '../../../lib/animation';
import type { Complex } from './zeta/lfunctions';
import type { Lines } from './zeta/contours';
import type { MapData, MapId } from './zeta/maps';
import { zeroHeights } from './zeta/zeros';
import { CHART_END, PRIMES, offsetLi, primeCount, waveSize, type WaveTable } from './primes';
import { CLAIMED_EDGE, FIRST_HEIGHT, SUPPOSED, classicalWidth, dialAt, panelAt, zerosUsed, type Layout, type Panel, type View } from './story';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type TextStyle = { size: number; color: string; alpha: number; align?: CanvasTextAlign; italic?: boolean; typewriter?: boolean; clear?: boolean };

// A drawing placed on the frame: its box in pixels and the part of its plane it shows.
type Placed = { left: number; top: number; width: number; height: number; view: View };

type DrawnMap = { data: MapData; bands: { bottom: number; top: number; path: Path2D }[]; rings: Path2D };

// The single wave's own scale: counts above and below the line.
const WAVE_RANGE = 3.4;

const COUNT_TOP = 30;

const OPENING_END: Record<Layout, number> = { wide: 31, tall: 13 };

const ANCHOR_SHARE: Record<CanvasTextAlign, number> = { left: 0, start: 0, center: 0.5, right: 1, end: 1 };

const EDGE = 6;

// Schematic arrow lengths for the two ways of writing the sum. Not data.
const REFLECTION_ROW = [0.36, 0.22, 0.15, 0.1, 0.07, 0.05, 0.03, 0.02];

const POISSON_ROW = [0.74, 0.11, 0.07, 0.05, 0.03];

const OMEGA = { re: -0.5, im: Math.sqrt(3) / 2 };

function keepInside(left: number, size: number, anchor: number, extent: number, margin: number): number {
  const highest = Math.max(extent - margin, anchor);
  const lowest = Math.min(margin, anchor);

  return Math.max(lowest, Math.min(left, highest - size));
}

function linesPath({ points, starts }: Lines): Path2D {
  const path = new Path2D();
  const count = points.length / 2;

  for (const [line, first] of starts.entries()) {
    const end = starts[line + 1] ?? count;
    path.moveTo(points[2 * first] ?? 0, points[2 * first + 1] ?? 0);

    for (let index = first + 1; index < end; index += 1) {
      path.lineTo(points[2 * index] ?? 0, points[2 * index + 1] ?? 0);
    }
  }

  return path;
}

// The Eisenstein integers a + bω within a radius, nearest first.
export function latticePoints(radius: number): { x: number; y: number; norm: number }[] {
  const points: { x: number; y: number; norm: number }[] = [];
  const reach = Math.ceil(radius * 1.2) + 1;

  for (let a = -reach; a <= reach; a += 1) {
    for (let b = -reach; b <= reach; b += 1) {
      const x = a + b * OMEGA.re;
      const y = b * OMEGA.im;
      const norm = a * a - a * b + b * b;

      if (Math.hypot(x, y) <= radius) points.push({ x, y, norm });
    }
  }

  return points.sort((first, second) => first.norm - second.norm);
}

const LATTICE = latticePoints(3.05);

const LI_CURVE = Array.from({ length: 160 }, (_, index) => {
  const x = 2 + (CHART_END - 2) * index / 159;

  return [x, offsetLi(x)] as const;
});

export class PrimeFilm {
  private readonly context: CanvasRenderingContext2D;
  private readonly maps = new Map<MapId, DrawnMap>();
  private readonly mapPaths = new Map<MapId, { key: string; path: Path2D }>();
  private readonly shown = new Set<string>();
  private readonly visible = new Set<string>();
  private readonly boxes = new Map<string, { offset: number; width: number }>();
  private waves: WaveTable | undefined;
  private colors: Colors = { ink: '#1c1a17', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  private width = 1;
  private height = 1;
  private ratio = 1;
  private layout: Layout = 'wide';
  private time = 0;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly labels: ReadonlyMap<string, HTMLElement>) {
    const context = canvas.getContext('2d');

    if (!context) throw new Error('The film needs a 2D canvas.');

    this.context = context;
  }

  addMap(data: MapData): void {
    this.maps.set(data.id, {
      data,
      bands: data.bands.map((band) => ({ bottom: band.bottom, top: band.top, path: linesPath(band) })),
      rings: linesPath(data.rings),
    });
  }

  setWaves(table: WaveTable): void {
    this.waves = table;
  }

  resize(): void {
    const box = this.canvas.getBoundingClientRect();
    const style = getComputedStyle(this.canvas);
    this.colors = {
      ink: style.getPropertyValue('--ink').trim() || this.colors.ink,
      blue: style.getPropertyValue('--blue').trim() || this.colors.blue,
      muted: style.getPropertyValue('--muted').trim() || this.colors.muted,
      paper: style.getPropertyValue('--paper').trim() || this.colors.paper,
    };

    this.width = Math.max(1, box.width);
    this.height = Math.max(1, box.height);
    this.ratio = window.devicePixelRatio || 1;
    this.layout = this.width >= this.height ? 'wide' : 'tall';
    this.canvas.width = Math.round(this.width * this.ratio);
    this.canvas.height = Math.round(this.height * this.ratio);
    this.boxes.clear();
  }

  draw(time: number): void {
    const context = this.context;
    this.time = time;
    this.shown.clear();
    context.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    context.clearRect(0, 0, this.width, this.height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    this.drawChart();
    this.drawPlane();
    this.drawCousin();
    this.drawLattice();
    this.drawDevice();
    this.settleLabels();
  }


  private place(panel: Panel): Placed {
    const { box, view } = panelAt(panel, this.time, this.layout);

    return { left: box.x * this.width, top: box.y * this.height, width: box.w * this.width, height: box.h * this.height, view };
  }

  private px(placed: Placed, x: number, view = placed.view): number {
    return placed.left + (x - view.left) / (view.right - view.left) * placed.width;
  }

  private py(placed: Placed, y: number, view = placed.view): number {
    return placed.top + (view.top - y) / (view.top - view.bottom) * placed.height;
  }


  private stroke(path: Path2D, color: string, width: number, alpha: number): void {
    if (alpha <= 0) return;

    const context = this.context;
    context.globalAlpha = Math.min(1, alpha);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.stroke(path);
    context.globalAlpha = 1;
  }

  private line(points: readonly (readonly [number, number])[], color: string, width: number, alpha: number, dash: readonly number[] = []): void {
    if (alpha <= 0 || points.length < 2) return;

    const path = new Path2D();

    for (const [index, [x, y]] of points.entries()) {
      if (index === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }

    this.context.setLineDash(dash);
    this.stroke(path, color, width, alpha);
    this.context.setLineDash([]);
  }

  private dot(x: number, y: number, radius: number, color: string, alpha: number, hollow = false): void {
    if (alpha <= 0) return;

    const context = this.context;
    context.globalAlpha = Math.min(1, alpha);
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);

    if (hollow) {
      context.fillStyle = this.colors.paper;
      context.fill();
      context.strokeStyle = color;
      context.lineWidth = 1.5;
      context.stroke();
    } else {
      context.fillStyle = color;
      context.fill();
    }

    context.globalAlpha = 1;
  }

  private text(value: string, x: number, y: number, style: TextStyle): void {
    if (style.alpha <= 0) return;

    const context = this.context;
    const family = style.typewriter ? '"Special Elite", "Courier New", monospace' : 'Alegreya, Georgia, serif';
    const share = ANCHOR_SHARE[style.align ?? 'center'];
    context.font = `${style.italic ? 'italic ' : ''}${style.size}px ${family}`;
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    context.globalAlpha = Math.min(1, style.alpha);
    context.fillStyle = style.color;
    const lines = this.lines(value, x, share);

    for (const [index, line] of lines.entries()) {
      const width = context.measureText(line).width;
      const left = keepInside(x - width * share, width, x, this.width, EDGE);
      const middle = y + (index - (lines.length - 1) / 2) * style.size * 1.1;

      if (style.clear) {
        context.fillStyle = this.colors.paper;
        context.fillRect(left - 3, middle - style.size * 0.7, width + 6, style.size * 1.4);
        context.fillStyle = style.color;
      }

      context.fillText(line, left, middle);
    }

    context.globalAlpha = 1;
  }

  private lines(value: string, x: number, share: number): string[] {
    if (value.includes('\n')) return value.split('\n');

    const width = this.context.measureText(value).width;
    const left = x - width * share;
    const fits = left >= EDGE && left + width <= this.width - EDGE;

    if (fits || x < 0 || x > this.width) return [value];

    const middle = value.length / 2;
    let cut = -1;

    for (const match of value.matchAll(/ /g)) {
      if (cut < 0 || Math.abs(match.index - middle) < Math.abs(cut - middle)) cut = match.index;
    }

    return cut < 0 ? [value] : [value.slice(0, cut), value.slice(cut + 1)];
  }

  private tag(value: string, x: number, y: number, alpha: number, align: CanvasTextAlign = 'center', color = this.colors.muted): void {
    this.context.letterSpacing = '0.06em';
    this.text(value.toUpperCase(), x, y, { size: this.small(9.5), color, alpha, align, typewriter: true, clear: true });
    this.context.letterSpacing = '0px';
  }

  private note(value: string, x: number, y: number, alpha: number, align: CanvasTextAlign = 'left', color = this.colors.ink): void {
    this.text(value, x, y, { size: this.small(14), color, alpha, align, italic: true, clear: true });
  }

  private small(size: number): number {
    return this.width < 480 ? size - 1 : size;
  }

  private hatch(box: { left: number; right: number; top: number; bottom: number }, color: string, alpha: number, gap = 4, clip?: Path2D): void {
    if (alpha <= 0 || box.right <= box.left) return;

    const context = this.context;
    const path = new Path2D();
    const left = Math.max(0, box.left);
    const right = Math.min(this.width, box.right);
    const start = Math.max(0, Math.ceil(box.top / gap) * gap);

    for (let y = start; y <= Math.min(this.height, box.bottom); y += gap) {
      path.moveTo(left, y + 0.5);
      path.lineTo(right, y + 0.5);
    }

    context.save();
    context.lineCap = 'butt';

    if (clip) context.clip(clip);

    this.stroke(path, color, 0.8, alpha);
    context.restore();
  }

  private clipTo(placed: Placed): void {
    const context = this.context;
    context.save();
    context.beginPath();
    context.rect(placed.left, placed.top, placed.width, placed.height);
    context.clip();
  }


  private label(id: string, x: number, y: number, alpha: number): void {
    const element = this.labels.get(id);

    if (!element || alpha <= 0.01) return;

    const { offset, width } = this.box(id, element);
    const left = keepInside(x + offset, width, x, this.width, EDGE + 2);
    this.shown.add(id);
    element.style.transform = `translate(${(left - offset).toFixed(1)}px, ${y.toFixed(1)}px)`;
    element.style.opacity = Math.min(1, alpha).toFixed(3);

    if (!this.visible.has(id)) {
      element.style.visibility = 'visible';
      this.visible.add(id);
    }
  }

  private box(id: string, element: HTMLElement): { offset: number; width: number } {
    const known = this.boxes.get(id);

    if (known) return known;

    const pin = element.getBoundingClientRect();
    const drawn = element.firstElementChild?.getBoundingClientRect() ?? pin;
    const measured = { offset: drawn.left - pin.left, width: drawn.width };
    this.boxes.set(id, measured);

    return measured;
  }

  private settleLabels(): void {
    for (const id of this.visible) {
      if (this.shown.has(id)) continue;

      const element = this.labels.get(id);

      if (element) {
        element.style.visibility = 'hidden';
        element.style.opacity = '0';
      }

      this.visible.delete(id);
    }
  }

  // A computed map in a drawing's box: its lines at most one device pixel wide, the width the canvas draws fastest.
  private drawMap(id: MapId, placed: Placed, alpha: number, revealTop = Infinity): void {
    const map = this.maps.get(id);

    if (!map || alpha <= 0.01) return;

    const { view } = placed;
    const scaleX = placed.width / (view.right - view.left);
    const scaleY = placed.height / (view.top - view.bottom);
    const matrix = new DOMMatrix([scaleX, 0, 0, -scaleY, this.px(placed, 0), this.py(placed, 0)]);
    const top = Math.min(view.top, revealTop);
    const key = [scaleX, scaleY, matrix.e, matrix.f, view.bottom, top].map((value) => value.toFixed(3)).join(' ');
    const cached = this.mapPaths.get(id);
    let path = cached?.key === key ? cached.path : undefined;

    if (!path) {
      path = new Path2D();

      for (const band of map.bands) {
        if (band.top < view.bottom || band.bottom > top) continue;

        path.addPath(band.path, matrix);
      }

      this.mapPaths.set(id, { key, path });
    }

    const width = 0.65;
    const drawnWidth = Math.min(width, 1 / this.ratio);
    const context = this.context;
    context.save();
    context.beginPath();
    context.rect(placed.left, this.py(placed, top), placed.width, this.py(placed, view.bottom) - this.py(placed, top));
    context.clip();
    context.lineCap = 'butt';
    context.lineJoin = 'bevel';
    this.stroke(path, this.colors.ink, drawnWidth, Math.min(1, alpha * width / drawnWidth));
    context.restore();
  }

  private drawChart(): void {
    const time = this.time;
    const shown = fade(time, -1, 0, 83500, 85500);

    if (shown <= 0) return;

    const placed = this.place('chart');
    const counting = shown * (1 - span(time, 46500, 48000));
    const waving = shown * span(time, 47000, 48500);

    if (counting > 0) this.drawCount(placed, counting);
    if (waving > 0) this.drawWave(placed, waving);
  }

  private drawCount(placed: Placed, alpha: number): void {
    const time = this.time;
    const { ink, blue, muted } = this.colors;
    const opening = OPENING_END[this.layout];
    const right = opening + (CHART_END - opening) * span(time, 5000, 7000);
    const view: View = { left: 0, right, bottom: 0, top: COUNT_TOP };
    const x = (value: number) => this.px(placed, value, view);
    const y = (value: number) => this.py(placed, value, view);
    const size = this.small(11);
    const behind = 1 - 0.65 * span(time, 40500, 41500);

    const drawn = right * span(time, 0, 1200);
    this.line([[x(0), y(0)], [x(drawn), y(0)]], ink, 1, alpha);
    const ticks = new Path2D();

    for (let n = 1; n <= drawn; n += 1) {
      const long = n % 10 === 0 ? 5 : 2.5;
      ticks.moveTo(x(n), y(0));
      ticks.lineTo(x(n), y(0) + long);
    }

    this.stroke(ticks, muted, 0.8, alpha);
    const near = alpha * (1 - span(time, 5000, 5800));
    const far = alpha * span(time, 6000, 7000);

    for (let n = 1; n < opening; n += 1) {
      const prime = PRIMES.includes(n);
      const shown = near * span(time, 150 + 25 * n, 450 + 25 * n);
      this.text(String(n), x(n), y(0) + 16, { size: this.small((prime ? 15 : 12) + (this.layout === 'wide' ? 2 : 0)), color: prime ? blue : muted, alpha: shown, italic: prime, typewriter: !prime });
    }

    for (let n = 0; n <= CHART_END; n += 10) {
      this.text(String(n), x(n), y(0) + 15, { size, color: muted, alpha: far, typewriter: true });
    }

    const rise = (prime: number) => 7300 + 4000 * prime / CHART_END;

    for (const [index, prime] of PRIMES.entries()) {
      const close = prime < opening;
      const marked = close ? 900 + 380 * index : 5000 + 2000 * (prime - opening) / (CHART_END - opening);
      const appear = span(time, marked, marked + 300);
      const lifted = span(time, rise(prime), rise(prime) + 400);
      this.dot(x(prime), y((index + 1) * lifted), close ? 3 + 1.5 * (1 - span(time, 5000, 7000)) : 3, blue, alpha * appear * behind);
    }

    const reach = CHART_END * Math.min(1, Math.max(0, (time - 7300) / 4000));
    const counted = alpha * span(time, 7000, 7400);

    if (counted > 0) {
      const stairs = new Path2D();
      let level = 0;
      stairs.moveTo(x(0), y(0));

      for (const prime of PRIMES) {
        if (prime > reach) break;

        stairs.lineTo(x(prime), y(level));
        level += 1;
        stairs.lineTo(x(prime), y(level));
      }

      stairs.lineTo(x(reach), y(level));
      this.stroke(stairs, ink, 1.6, counted * behind);
      this.label('pi', x(CHART_END) + 6, Math.max(y(primeCount(CHART_END)), y(offsetLi(CHART_END)) + 19), counted * span(time, 11000, 11800));

      for (let count = 5; count <= 25; count += 5) {
        this.text(String(count), placed.left - 8, y(count), { size, color: muted, alpha: counted, align: 'right', typewriter: true });
      }
    }

    const curve = alpha * span(time, 12800, 13300);

    if (curve > 0) {
      const end = 2 + (CHART_END - 2) * span(time, 13000, 15500);
      const points: [number, number][] = [];

      for (const [value, level] of LI_CURVE) {
        if (value > end) break;

        points.push([x(value), y(level)]);
      }

      const faint = 1 - 0.6 * span(time, 40500, 41500);
      this.line(points, ink, 1.4, curve * faint, [6, 4]);
      this.label('li', x(CHART_END) + 6, y(offsetLi(CHART_END)), curve * span(time, 15000, 15800) * faint);
    }

    const gap = alpha * fade(time, 20000, 21500, 40500, 41500);

    if (gap > 0) {
      const outline = new Path2D();
      outline.moveTo(x(2), y(offsetLi(2)));

      for (const [value, level] of LI_CURVE) {
        outline.lineTo(x(value), y(level));
      }

      let level = primeCount(CHART_END);
      outline.lineTo(x(CHART_END), y(level));

      for (const prime of [...PRIMES].reverse()) {
        outline.lineTo(x(prime), y(level));
        level -= 1;
        outline.lineTo(x(prime), y(level));
      }

      outline.closePath();
      this.hatch({ left: x(2), right: x(CHART_END), top: y(COUNT_TOP), bottom: y(0) }, blue, 0.9 * gap, 3, outline);
      this.tag('the gap', x(66), y((primeCount(66) + offsetLi(66)) / 2), gap, 'center', blue);
    }

    // Riemann's formula: the smooth part, plus one wave for each zero used so far.
    const table = this.waves;
    const rebuilt = alpha * span(time, 40500, 41200);

    if (table && rebuilt > 0) {
      const used = zerosUsed(time);
      const whole = Math.min(table.zeros, Math.floor(used));
      const part = Math.min(1, used - whole);
      const count = table.xs.length;
      const path = new Path2D();

      for (let index = 0; index < count; index += 1) {
        const below = table.partial[whole * count + index] ?? 0;
        const above = table.partial[Math.min(table.zeros, whole + 1) * count + index] ?? below;
        const value = (table.smooth[index] ?? 0) + below + (above - below) * part;
        const point: [number, number] = [x(table.xs[index] ?? 2), y(value)];

        if (index === 0) path.moveTo(...point);
        else path.lineTo(...point);
      }

      this.context.lineJoin = 'bevel';
      this.stroke(path, blue, 2, rebuilt);
      this.context.lineJoin = 'round';
      this.tag(`zeros used: ${Math.round(used)}`, placed.left + 4, placed.top + 6, alpha * fade(time, 40800, 41300), 'left', blue);
    }
  }

  // IV–VI. One zero's wave, and how fast it may grow: like x^β for a zero at β.
  private drawWave(placed: Placed, alpha: number): void {
    const time = this.time;
    const { ink, blue, muted } = this.colors;
    const view: View = { left: 0, right: CHART_END, bottom: -WAVE_RANGE, top: WAVE_RANGE };
    const x = (value: number) => this.px(placed, value, view);
    const y = (value: number) => this.py(placed, value, view);
    const beta = dialAt(time);
    const rho: Complex = { re: beta, im: FIRST_HEIGHT };

    this.line([[x(0), y(0)], [x(CHART_END), y(0)]], ink, 1, alpha);

    for (let n = 0; n <= CHART_END; n += 20) {
      this.text(String(n), x(n), y(-WAVE_RANGE) + 12, { size: this.small(11), color: muted, alpha, typewriter: true });
    }

    const envelope = (re: number, sign: number): [number, number][] => {
      const points: [number, number][] = [];

      for (let step = 0; step <= 80; step += 1) {
        const value = 2 + (CHART_END - 2) * step / 80;
        points.push([x(value), y(sign * waveSize(value, { re, im: FIRST_HEIGHT }))]);
      }

      return points;
    };

    const edge = alpha * fade(time, 67500, 68500);
    const claim = alpha * span(time, 76500, 77500);

    for (const sign of [1, -1]) {
      this.line(envelope(1, sign), muted, 1, edge * (1 - 0.5 * claim), [2, 3]);
      this.line(envelope(beta, sign), blue, 1, alpha * (1 - 0.6 * span(time, 60500, 61500)), [5, 4]);
      this.line(envelope(CLAIMED_EDGE, sign), blue, 1.4, claim);
    }

    if (claim > 0) {
      for (const sign of [1, -1]) {
        const region = new Path2D();
        const inner = envelope(CLAIMED_EDGE, sign);
        region.moveTo(x(2), y(sign * WAVE_RANGE));

        for (const [px, py] of inner) {
          region.lineTo(px, py);
        }

        region.lineTo(x(CHART_END), y(sign * WAVE_RANGE));
        region.closePath();
        this.hatch({ left: x(2), right: x(CHART_END), top: placed.top, bottom: placed.top + placed.height }, blue, 0.45 * claim, 5, region);
      }

      this.label('x-claim', x(CHART_END) + 6, y(waveSize(CHART_END, { re: CLAIMED_EDGE, im: FIRST_HEIGHT })), claim);
    }

    this.label('x-edge', x(CHART_END) + 6, y(waveSize(CHART_END, { re: 1, im: FIRST_HEIGHT })), edge * (1 - claim));

    // The wave itself, from the table of the first zero moved across, between its two nearest rows.
    const table = this.waves;

    if (table) {
      const count = table.xs.length;
      const position = (beta - table.dialFrom) / (table.dialTo - table.dialFrom) * (table.dialRows - 1);
      const row = Math.min(table.dialRows - 2, Math.max(0, Math.floor(position)));
      const part = Math.min(1, Math.max(0, position - row));
      const path = new Path2D();

      for (let index = 0; index < count; index += 1) {
        const below = table.dial[row * count + index] ?? 0;
        const above = table.dial[(row + 1) * count + index] ?? below;
        const point: [number, number] = [x(table.xs[index] ?? 2), y(below + (above - below) * part)];

        if (index === 0) path.moveTo(...point);
        else path.lineTo(...point);
      }

      this.context.lineJoin = 'bevel';
      this.stroke(path, ink, 1.4, alpha);
      this.context.lineJoin = 'round';
    }

    this.label('x-beta', x(CHART_END) + 6, y(waveSize(CHART_END, rho)), alpha * (1 - span(time, 60500, 61500)));
    this.tag('one zero’s wave', placed.left + 4, placed.top + 6, alpha, 'left');
    this.tag(`β = ${beta.toFixed(2)}`, placed.left + 4, placed.top + 20, alpha * (1 - span(time, 60500, 61500)), 'left', blue);
  }

  private drawPlane(): void {
    const time = this.time;
    const shown = span(time, 26500, 28500);

    if (shown <= 0) return;

    const placed = this.place('plane');
    const { view } = placed;
    const { ink, blue, muted } = this.colors;
    const x = (value: number) => this.px(placed, value);
    const y = (value: number) => this.py(placed, value);
    const top = placed.top;
    const bottom = placed.top + placed.height;
    const tall = view.top - view.bottom;

    this.stroke(this.rect(placed), ink, 0.9, shown);
    this.clipTo(placed);

    const dense = 1 - Math.min(1, Math.max(0, (tall - 70) / 50));
    const crowd = Math.max(0.35, Math.min(1, placed.height / tall / 9));
    this.drawMap('zeta', placed, 0.62 * shown * dense * crowd, 3 + 61 * span(time, 27000, 30000));

    for (const value of [0, 1]) {
      this.line([[x(value), top], [x(value), bottom]], ink, 0.8, 0.55 * shown);
    }

    const half = shown * span(time, 60500, 62500);
    this.line([[x(0.5), bottom], [x(0.5), bottom - placed.height * half]], blue, 1, 0.8 * half, [5, 4]);
    const edge = shown * span(time, 67500, 68500);
    this.line([[x(1), bottom], [x(1), bottom - placed.height * edge]], ink, 2.2, edge);
    const sliver = shown * fade(time, 69000, 70000, 83500, 85000);

    if (sliver > 0) {
      const outline = new Path2D();
      const points: [number, number][] = [];
      const lowest = Math.max(3, view.bottom);

      for (let step = 0; step <= 120; step += 1) {
        const height = lowest + (view.top - lowest) * step / 120;
        points.push([x(1 - classicalWidth(Math.max(3, height))), y(height)]);
      }

      outline.moveTo(x(1), y(lowest));

      for (const [px, py] of points) {
        outline.lineTo(px, py);
      }

      outline.lineTo(x(1), y(view.top));
      outline.closePath();
      this.hatch({ left: x(1 - classicalWidth(lowest)) - 1, right: x(1), top, bottom: y(lowest) }, ink, 0.75 * sliver, 3, outline);
      this.line(points, ink, 1, sliver);
    }

    const fence = shown * span(time, 75500, 77500);
    const fenceBand = fence * (1 - span(time, 98000, 99500) + span(time, 112500, 114000));
    this.line([[x(CLAIMED_EDGE), bottom], [x(CLAIMED_EDGE), bottom - placed.height * fence]], blue, 1.6, Math.min(1, fence * 3));
    this.hatch({ left: x(CLAIMED_EDGE), right: x(1), top: bottom - placed.height * fence, bottom }, blue, 0.9 * fenceBand);
    this.drawArgument(placed);
    this.context.restore();
    this.markArgument(placed);

    const used = zerosUsed(time);
    const appear = shown * span(time, 33500, 35500);

    for (const [index, height] of zeroHeights.entries()) {
      if (height < view.bottom || height > view.top) continue;

      const filled = index < used ? 1 : 0;
      const radius = tall > 120 ? 2.4 : 3.6;
      this.dot(x(0.5), y(height), radius, blue, appear, filled === 0 && time < 47000);
    }

    const meet = shown * fade(time, 35500, 36300, 39500, 40500);

    for (const height of zeroHeights.slice(0, 3)) {
      if (height > view.top) continue;

      this.dot(x(0.5), y(height), 9, blue, 0.9 * meet, true);
      this.dot(x(0.5), y(height), 3.6, blue, meet);
    }

    const dial = shown * fade(time, 47000, 48000, 60500, 61500);

    if (dial > 0) {
      const beta = dialAt(time);
      const sliding = fade(time, 53500, 54000, 59500, 60300);
      this.dot(x(0.5), y(FIRST_HEIGHT), 8, blue, dial * (1 - sliding), true);
      this.dot(x(0.5), y(FIRST_HEIGHT), 3.6, blue, dial);
      this.dot(x(beta), y(FIRST_HEIGHT), 5.5, blue, dial * sliding, true);
      this.tag('if a zero sat here', x(beta), y(FIRST_HEIGHT) - 18, dial * sliding);
      this.line([[x(beta), top - 7], [x(beta), top]], blue, 2, dial);
      this.tag(`β = ${beta.toFixed(2)}`, x(beta), top - 16, dial, 'center', blue);
    }

    const foot = bottom + 14;
    const marks: [string, number, number][] = [
      ['0', 0, shown],
      ['½', 0.5, shown],
      ['1', 1, shown],
      ['7/8', CLAIMED_EDGE, shown * span(time, 76500, 77500)],
    ];

    for (const [text, value, alpha] of marks) {
      const claimMark = text.includes('/');
      this.text(text, x(value), claimMark ? foot + 13 : foot, { size: this.small(claimMark ? 11 : 13), color: claimMark ? blue : muted, alpha, italic: !claimMark, typewriter: claimMark });
    }

    this.drawHeights(placed, shown);

    const words = shown * fade(time, 68500, 69500, 75000, 76000);
    this.note('no zeros on\nthe edge (1896)', x(1) + 8, y(view.bottom + tall * 0.85), words);
    this.note('a sliver,\nthinner with\nheight', x(1) + 8, y(view.bottom + tall * 0.6), shown * fade(time, 70000, 71000, 75000, 76000));
    this.tag('claimed fence', x(CLAIMED_EDGE + 0.06), top - 10, shown * fade(time, 77000, 78000, 83500, 84500), 'center', blue);
    this.tag('at every height', x(CLAIMED_EDGE + 0.06), top + 14, shown * fade(time, 78000, 79000, 83500, 84500), 'center', blue);
    this.label('zeta-sum', placed.left + placed.width / 2, top - 8, shown * fade(time, 32800, 33600, 40000, 41000));
    this.label('zeta-card', placed.left + placed.width / 2, top - 8, shown * fade(time, 84500, 85500, 98000, 99000) + shown * span(time, 113000, 114000));

    const review = span(time, 114500, 115500);
    this.tag('7/8 claim', placed.left + placed.width / 2, bottom + 44, review, 'center', blue);
    this.tag('under review', placed.left + placed.width / 2, bottom + 58, review, 'center', blue);
  }

  private drawHeights(placed: Placed, alpha: number): void {
    const { view } = placed;
    const tall = view.top - view.bottom;
    const steps = [2, 5, 10, 20, 50, 100];
    const step = steps.find((candidate) => candidate * placed.height / tall >= 34) ?? 200;
    const { muted } = this.colors;

    for (let height = Math.ceil(view.bottom / step) * step; height <= view.top; height += step) {
      const y = this.py(placed, height);

      if (y < placed.top + 10 || y > placed.top + placed.height - 6) continue;

      this.line([[placed.left - 4, y], [placed.left, y]], muted, 1, alpha);
      this.text(String(height), placed.left - 7, y, { size: this.small(10), color: muted, alpha, align: 'right', typewriter: true });
    }
  }

  private rect(placed: Placed): Path2D {
    const path = new Path2D();
    path.rect(placed.left, placed.top, placed.width, placed.height);

    return path;
  }

  // IX. A supposed zero past the fence, 1/ζ large near it, the region where the paper's sum keeps 1/L finite, and the strike.
  // Inside the plane's clip: ζ's computed size rings, the supposed zero's schematic ones, and the finite region.
  private drawArgument(placed: Placed): void {
    const time = this.time;
    const { ink, blue } = this.colors;
    const x = (value: number) => this.px(placed, value);
    const y = (value: number) => this.py(placed, value);
    const supposed = fade(time, 98500, 99300, 112000, 113000);

    if (supposed <= 0) return;

    const zx = x(SUPPOSED.re);
    const zy = y(SUPPOSED.im);
    const rings = fade(time, 100000, 101500, 104000, 105500);
    const map = this.maps.get('zeta');

    if (map && rings > 0) {
      const path = new Path2D();
      const scaleX = placed.width / (placed.view.right - placed.view.left);
      const scaleY = placed.height / (placed.view.top - placed.view.bottom);
      path.addPath(map.rings, new DOMMatrix([scaleX, 0, 0, -scaleY, x(0), y(0)]));
      this.stroke(path, ink, 0.7, 0.75 * rings);
    }

    for (const radius of [0.02, 0.04, 0.065, 0.1, 0.15]) {
      this.context.beginPath();
      this.context.ellipse(zx, zy, radius * placed.width / (placed.view.right - placed.view.left), radius * 3 * placed.height / (placed.view.top - placed.view.bottom), 0, 0, 2 * Math.PI);
      this.context.setLineDash([2, 3]);
      this.context.globalAlpha = 0.85 * rings * supposed;
      this.context.strokeStyle = ink;
      this.context.lineWidth = 1;
      this.context.stroke();
      this.context.setLineDash([]);
      this.context.globalAlpha = 1;
    }

    const x0 = x(this.finiteEdge(placed));
    const finite = fade(time, 108000, 108500, 112000, 113000);
    this.hatch({ left: x0, right: placed.left + placed.width, top: placed.top, bottom: placed.top + placed.height }, blue, 0.8 * finite, 5);
    this.line([[x0, placed.top], [x0, placed.top + placed.height]], blue, 1.5, finite);
  }

  // The squeeze: finite from the right edge to a fixed distance left of the supposed zero. Schematic.
  private finiteEdge(placed: Placed): number {
    const time = this.time;

    return placed.view.right - (placed.view.right - SUPPOSED.re) * span(time, 108000, 109300) - 0.12 * span(time, 109500, 110800);
  }

  private markArgument(placed: Placed): void {
    const time = this.time;
    const { blue } = this.colors;
    const supposed = fade(time, 98500, 99300, 112000, 113000);

    if (supposed <= 0) return;

    const zx = this.px(placed, SUPPOSED.re);
    const zy = this.py(placed, SUPPOSED.im);
    const x0 = this.px(placed, this.finiteEdge(placed));
    const words = fade(time, 108600, 109200, 112000, 113000);
    this.label('reciprocal', zx + 14, zy - 22, supposed * fade(time, 100000, 101500, 104000, 105500));
    this.tag('1/L finite here', x0 - 6, placed.top + 16, words, 'right', blue);
    this.tag('schematic', x0 - 6, placed.top + 30, words, 'right');
    this.dot(zx, zy, 5.5, blue, supposed, true);
    this.line([[zx - 9, zy + 9], [zx + 9, zy - 9]], blue, 1.6, span(time, 110800, 111300) * supposed);
    this.tag('if a zero sat here', zx, zy + 20, supposed * fade(time, 98800, 99600, 103500, 104300));
  }

  // VII. A cousin of ζ, for primes 4k + 1 against 4k + 3, with the same fence; at the end, the Landau–Siegel mark.
  private drawCousin(): void {
    const time = this.time;
    const shown = span(time, 84000, 85500);

    if (shown <= 0) return;

    const placed = this.place('cousin');
    const { ink, blue, muted } = this.colors;
    const x = (value: number) => this.px(placed, value);
    const y = (value: number) => this.py(placed, value);
    const top = placed.top;
    const bottom = placed.top + placed.height;
    this.stroke(this.rect(placed), ink, 0.9, shown);
    this.clipTo(placed);
    this.drawMap('minus-four', placed, 0.62 * shown, placed.view.bottom + (placed.view.top - placed.view.bottom) * span(time, 84500, 86000));

    for (const value of [0, 1]) {
      this.line([[x(value), top], [x(value), bottom]], ink, 0.8, 0.55 * shown);
    }

    const fence = shown * span(time, 86000, 87500);
    this.line([[x(CLAIMED_EDGE), bottom], [x(CLAIMED_EDGE), bottom - placed.height * fence]], blue, 1.6, Math.min(1, fence * 3));
    this.hatch({ left: x(CLAIMED_EDGE), right: x(1), top: bottom - placed.height * fence, bottom }, blue, 0.9 * fence);
    this.context.restore();

    for (const zero of this.maps.get('minus-four')?.data.zeros ?? []) {
      if (zero.im < placed.view.bottom || zero.im > placed.view.top) continue;

      this.dot(x(zero.re), y(zero.im), 3, blue, shown);
    }

    for (const [text, value] of [['0', 0], ['½', 0.5], ['1', 1]] as const) {
      this.text(text, x(value), bottom + 14, { size: this.small(13), color: muted, alpha: shown, italic: true });
    }

    this.label('cousin', placed.left + placed.width / 2, top - 8, shown);
    this.tag('primes 4k+1 against 4k+3', placed.left + placed.width / 2, bottom + 34, shown * fade(time, 85500, 86500, 89000, 90000));

    // A Landau–Siegel zero would be a real zero very close to 1. The separate proof rules it out.
    const siegel = span(time, 116000, 117000);
    const sx = x(0.97);
    const sy = y(0);
    this.dot(sx, sy, 5, ink, siegel, true);
    this.line([[sx - 8, sy + 8], [sx + 8, sy - 8]], ink, 1.4, span(time, 116800, 117400));
    this.tag('no Landau–Siegel zero', placed.left + placed.width / 2, bottom + 44, siegel);
    this.tag('approved', placed.left + placed.width / 2, bottom + 58, siegel, 'center', ink);
  }

  // VIII. The Eisenstein integers a + bω: a hexagonal grid. Its proportions are kept, so the hexagons stay regular.
  private drawLattice(): void {
    const time = this.time;
    const shown = fade(time, 89500, 90500, 97500, 99000);

    if (shown <= 0) return;

    const placed = this.place('lattice');
    const { ink, blue, muted } = this.colors;
    const { view } = placed;
    const scale = Math.min(placed.width / (view.right - view.left), placed.height / (view.top - view.bottom));
    const cx = placed.left + placed.width / 2;
    const cy = placed.top + placed.height / 2;
    const at = (point: { x: number; y: number }): [number, number] => [cx + point.x * scale, cy - point.y * scale];
    const grown = 3.1 * span(time, 90000, 92500);

    for (const norm of [1, 3, 4, 7]) {
      const radius = Math.sqrt(norm);
      const circle = new Path2D();
      circle.arc(cx, cy, radius * scale, 0, 2 * Math.PI);
      this.context.setLineDash([2, 4]);
      this.stroke(circle, muted, 0.8, 0.7 * shown * span(time, 91500 + 300 * norm, 92200 + 300 * norm));
      this.context.setLineDash([]);
    }

    for (const point of LATTICE) {
      const distance = Math.hypot(point.x, point.y);

      if (distance > grown) continue;

      const origin = point.norm === 0;
      this.dot(...at(point), origin ? 3.6 : 2.6, origin ? blue : ink, shown);
    }

    // The six units, joined: the grid's hexagon.
    const hexagon = Array.from({ length: 7 }, (_, index) => at({ x: Math.cos(index * Math.PI / 3), y: Math.sin(index * Math.PI / 3) }));
    this.line(hexagon, blue, 1.4, shown * span(time, 92500, 93500));
    this.label('eisenstein', cx, cy + 3.25 * scale + 22, shown * span(time, 92000, 93000));
    this.tag('the hexagonal grid', cx, cy - 3.25 * scale - 12, shown * span(time, 91000, 92000));
  }

  // IX. The same sum written two ways, as two rows of arrows ending at one mark. Schematic: the lengths are not data.
  private drawDevice(): void {
    const time = this.time;
    const shown = fade(time, 104500, 105200, 111800, 113000);

    if (shown <= 0) return;

    const placed = this.place('device');
    const { ink, blue, muted } = this.colors;
    const at = (across: number, up: number): [number, number] => [placed.left + across * placed.width, placed.top + (1 - up) * placed.height];
    const size = this.small(15);
    const row = (lengths: readonly number[], up: number, start: number, end: number, main: boolean): void => {
      const count = Math.round(lengths.length * span(time, start, end));
      let position = 0;

      for (let index = 0; index < count; index += 1) {
        const length = lengths[index] ?? 0;
        const [x0, y] = at(position, up);
        const [x1] = at(position + length, up);
        const isMain = main && index === 0;
        this.line([[x0 + 1, y], [x1 - 1, y]], isMain ? blue : ink, isMain ? 3 : 1.8, shown);
        this.line([[x1 - 1, y - 6], [x1 - 1, y + 6]], isMain ? blue : ink, 1.2, shown);
        position += length;
      }
    };

    this.text('one way: a theta function’s reflection', ...at(0, 0.86), { size, color: ink, alpha: shown * span(time, 104800, 105400), align: 'left', italic: true });
    row(REFLECTION_ROW, 0.72, 105000, 106500, false);
    this.text('the other: Poisson summation', ...at(0, 0.48), { size, color: ink, alpha: shown * span(time, 106300, 106900), align: 'left', italic: true });
    row(POISSON_ROW, 0.34, 106500, 108000, true);
    const meet = shown * span(time, 108000, 108600);
    this.line([at(1, 0.24), at(1, 0.8)], blue, 1, meet, [3, 3]);
    this.tag('same sum', ...at(1, 0.92), meet, 'right', blue);
    const rows = shown * span(time, 108300, 108900);
    this.text('this row holds 1/L', ...at((POISSON_ROW[0] ?? 0) / 2, 0.2), { size: this.small(14), color: blue, alpha: rows, italic: true });
    this.text('the rest', ...at(0.87, 0.2), { size: this.small(14), color: muted, alpha: rows, italic: true });
    const bounds = shown * span(time, 109300, 109900);
    this.tag('bounded', ...at(0.5, 0.6), bounds, 'center', ink);
    this.tag('bounded', ...at(0.87, 0.08), bounds, 'center', ink);
    this.tag('schematic', ...at(0, 0.02), shown, 'left');
  }
}

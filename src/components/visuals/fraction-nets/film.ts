// Draws one frame of the 004 film (v2, "nets and shadows") for a given time. Every frame is a function of the time alone,
// so scrubbing lands on the same picture. Three places stay on screen: the plane, the line under it and a side panel.
import {
  CUBIC_KNOTS, CUBIC_NET, SQUARE_REMAINDERS, TORSION, cubicY, curvePieces, exactMultiples, floatMultiples, fractionText, nearestMiss,
} from './nets';
import {
  BOUND_SLOPE, CIRCLE_MARK, MULTIPLES_SHOWN, NET_RUNS, STAR_RETURN, STRETCH, TESTS, WRITTEN, cameraAt, fade, netAt, netStart, panelAt, share,
  span, type Box, type Layout, type Panel, type View,
} from './story';

type Colors = { ink: string; blue: string; muted: string; paper: string };

// `clear` lays paper under the text, so it reads over knots, hatching and lines.
type TextStyle = { size: number; color: string; alpha: number; align?: CanvasTextAlign; italic?: boolean; typewriter?: boolean; clear?: boolean };

// A drawing placed on the frame: its box in pixels, the part of its plane it shows, and how a point of the plane lands on the frame.
type Placed = { left: number; top: number; width: number; height: number; view: View; scaleX: number; scaleY: number; originX: number; originY: number };

type Point = readonly [number, number];

// Where a label's text sits against its pin: across (offset, width) and up and down (rise, height).
type LabelBox = { offset: number; width: number; rise: number; height: number };

const ANCHOR_SHARE: Record<CanvasTextAlign, number> = { left: 0, start: 0, center: 0.5, right: 1, end: 1 };

const EDGE = 6;

const TYPEWRITER = '"Special Elite", "Courier New", monospace';

const ROOT_THREE = Math.sqrt(3);

// The real curve x³ + y³ = 6, sampled once, written from left to right in the opening.
const CUBIC = Array.from({ length: 481 }, (_, index) => {
  const x = -2.7 + 5.4 * index / 480;

  return [x, cubicY(x)] as const;
});

const PIECES = curvePieces(7.5);

const MULTIPLES = exactMultiples(MULTIPLES_SHOWN);

const FLOATS = floatMultiples(150);

// The size chart's parabola: c·n², fitted to the digits of x(nP) by least squares.
const GROWTH = MULTIPLES.reduce((sum, multiple) => sum + multiple.digits * multiple.n ** 2, 0)
  / MULTIPLES.reduce((sum, multiple) => sum + multiple.n ** 4, 0);

const CROSSING = BOUND_SLOPE / GROWTH;

// When the net of 21sts lands, and the cubic's two knots turn blue.
const CAUGHT = netStart(NET_RUNS[0], CUBIC_NET);

// The multiples written out in the side panel: "3P  x = −2439844/5094049".
const WRITTEN_LINES = WRITTEN.map(({ n, at }) => {
  const multiple = MULTIPLES[n - 1];
  const name = n === 1 ? 'P' : `${n}P`;

  return { n, at, text: multiple ? `${name}  x = ${fractionText(multiple.point.x)}` : name, digits: multiple?.digits ?? 0 };
});

// The multiples drawn and named on the curve: those inside the far view.
const NAMED = [
  { n: 3, id: 'p3', at: 97500 },
  { n: 4, id: 'p4', at: 98500 },
  { n: 5, id: 'p5', at: 99700 },
] as const;

const TYPING_STEP = 16;

// Slides a box [left, left + size] inside [margin, extent − margin] while its anchor is inside the frame.
// Once the anchor crosses the margin the box leaves with it, so a label never jumps during a move.
function keepInside(left: number, size: number, anchor: number, extent: number, margin: number): number {
  const highest = Math.max(extent - margin, anchor);
  const lowest = Math.min(margin, anchor);

  return Math.max(lowest, Math.min(left, highest - size));
}

// The name of the net of c: "whole numbers", "halves", "thirds", "quarters", then "5ths", "21sts", "22nds", "23rds".
function netName(c: number): string {
  const names = ['', 'whole numbers', 'halves', 'thirds', 'quarters'];
  const named = names[c];

  if (named) return named;

  const last = c % 10;
  const teen = c % 100 >= 11 && c % 100 <= 13;
  let suffix = 'th';

  if (!teen && last === 1) suffix = 'st';
  else if (!teen && last === 2) suffix = 'nd';
  else if (!teen && last === 3) suffix = 'rd';

  return `${c}${suffix}s`;
}

export class FractionNetsFilm {
  private readonly context: CanvasRenderingContext2D;
  private readonly shown = new Set<string>();
  private readonly visible = new Set<string>();
  private readonly boxes = new Map<string, LabelBox>();
  // One knot of a net, drawn small and repeated as a pattern: a net is a lattice, so it fills in one call. Patterns are
  // kept by tile size and knot size, so a net that holds still reuses its tile.
  private readonly tile = document.createElement('canvas');
  private readonly patterns = new Map<string, CanvasPattern>();
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
    this.drawPlane();
    this.drawLine();
    this.drawTests();
    this.drawSide();
    this.drawChart();
    this.drawStatus();
    this.settleLabels();
  }

  // Placing drawings. `even` keeps one unit the same length across and up, so circles stay round.

  private frame(panel: Panel): { left: number; top: number; width: number; height: number } {
    const box: Box = panelAt(panel, this.time, this.layout);

    return { left: box.x * this.width, top: box.y * this.height, width: box.w * this.width, height: box.h * this.height };
  }

  private place(panel: Panel, view: View, even: boolean): Placed {
    const { left, top, width, height } = this.frame(panel);
    let scaleX = width / (view.right - view.left);
    let scaleY = height / (view.top - view.bottom);

    if (even) {
      scaleX = Math.min(scaleX, scaleY);
      scaleY = scaleX;
    }

    const originX = left + width / 2 - (view.left + view.right) / 2 * scaleX;
    const originY = top + height / 2 + (view.bottom + view.top) / 2 * scaleY;

    return { left, top, width, height, view, scaleX, scaleY, originX, originY };
  }

  private plane(): Placed {
    return this.place('plane', cameraAt(this.time, this.layout), true);
  }

  private px(placed: Placed, x: number): number {
    return placed.originX + x * placed.scaleX;
  }

  private py(placed: Placed, y: number): number {
    return placed.originY - y * placed.scaleY;
  }

  private at(placed: Placed, [x, y]: Point): Point {
    return [this.px(placed, x), this.py(placed, y)];
  }

  // The plane's values at the edges of its box, which shows more than the camera's view across or up.
  private reach(placed: Placed): View {
    return {
      left: (placed.left - placed.originX) / placed.scaleX,
      right: (placed.left + placed.width - placed.originX) / placed.scaleX,
      bottom: (placed.originY - placed.top - placed.height) / placed.scaleY,
      top: (placed.originY - placed.top) / placed.scaleY,
    };
  }

  // Pen and type.

  private stroke(path: Path2D, color: string, width: number, alpha: number, dash: readonly number[] = []): void {
    if (alpha <= 0) return;

    const context = this.context;
    context.globalAlpha = Math.min(1, alpha);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.setLineDash(dash);
    context.stroke(path);
    context.setLineDash([]);
    context.globalAlpha = 1;
  }

  private line(points: readonly Point[], color: string, width: number, alpha: number, dash: readonly number[] = []): void {
    if (alpha <= 0 || points.length < 2) return;

    const path = new Path2D();

    for (const [index, [x, y]] of points.entries()) {
      if (index === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }

    this.stroke(path, color, width, alpha, dash);
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

  private ring(x: number, y: number, radius: number, color: string, alpha: number, width = 1.2): void {
    if (alpha <= 0) return;

    const path = new Path2D();
    path.arc(x, y, radius, 0, 2 * Math.PI);
    this.stroke(path, color, width, alpha);
  }

  // Many dots of one size and colour, filled at once.
  private dots(points: readonly Point[], radius: number, color: string, alpha: number): void {
    if (alpha <= 0 || points.length === 0) return;

    const context = this.context;
    const path = new Path2D();

    for (const [x, y] of points) {
      path.moveTo(x + radius, y);
      path.arc(x, y, radius, 0, 2 * Math.PI);
    }

    context.globalAlpha = Math.min(1, alpha);
    context.fillStyle = color;
    context.fill(path);
    context.globalAlpha = 1;
  }

  // Canvas text stays inside the frame: a line that would run off it breaks at its middle space, then slides in.
  private text(value: string, x: number, y: number, style: TextStyle): void {
    if (style.alpha <= 0 || value.length === 0) return;

    const context = this.context;
    const family = style.typewriter ? TYPEWRITER : 'Alegreya, Georgia, serif';
    const anchor = ANCHOR_SHARE[style.align ?? 'center'];
    context.font = `${style.italic ? 'italic ' : ''}${style.size}px ${family}`;
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    context.globalAlpha = Math.min(1, style.alpha);
    context.fillStyle = style.color;
    const lines = this.lines(value, x, anchor);

    for (const [index, line] of lines.entries()) {
      const width = context.measureText(line).width;
      const left = keepInside(x - width * anchor, width, x, this.width, EDGE);
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

  // A line break in the text is kept; a single line that would run off the frame breaks at its middle space.
  private lines(value: string, x: number, anchor: number): string[] {
    if (value.includes('\n')) return value.split('\n');

    const width = this.context.measureText(value).width;
    const left = x - width * anchor;
    const fits = left >= EDGE && left + width <= this.width - EDGE;

    if (fits || x < 0 || x > this.width) return [value];

    const middle = value.length / 2;
    let cut = -1;

    for (const match of value.matchAll(/ /g)) {
      if (cut < 0 || Math.abs(match.index - middle) < Math.abs(cut - middle)) cut = match.index;
    }

    return cut < 0 ? [value] : [value.slice(0, cut), value.slice(cut + 1)];
  }

  private tagSize(): number {
    return this.small(9.5);
  }

  private tag(value: string, x: number, y: number, alpha: number, align: CanvasTextAlign = 'center', color = this.colors.muted): void {
    this.context.letterSpacing = '0.06em';
    this.text(value.toUpperCase(), x, y, { size: this.tagSize(), color, alpha, align, typewriter: true, clear: true });
    this.context.letterSpacing = '0px';
  }

  // How wide a one-line tag is.
  private tagWidth(value: string): number {
    const context = this.context;
    context.font = `${this.tagSize()}px ${TYPEWRITER}`;
    context.letterSpacing = '0.06em';
    const width = context.measureText(value.toUpperCase()).width;
    context.letterSpacing = '0px';

    return width;
  }

  // A tag struck through from left to right as `amount` goes from 0 to 1, for something ruled out.
  private struckTag(value: string, { x, y, align }: { x: number; y: number; align: CanvasTextAlign }, alpha: number, amount: number): void {
    this.tag(value, x, y, alpha, align);

    if (amount <= 0) return;

    const width = this.tagWidth(value);
    const left = keepInside(x - width * ANCHOR_SHARE[align], width, x, this.width, EDGE);
    this.line([[left - 3, y], [left - 3 + (width + 6) * amount, y]], this.colors.ink, 1.4, alpha);
  }

  // A stamp: typewriter capitals in a ruled box on paper, set a little askew.
  private stamp(value: string, x: number, y: number, alpha: number, color: string): void {
    if (alpha <= 0) return;

    const context = this.context;
    const text = value.toUpperCase();
    const size = this.small(11);
    context.save();
    context.font = `${size}px ${TYPEWRITER}`;
    context.letterSpacing = '0.08em';
    const width = context.measureText(text).width + 16;
    const height = size + 12;
    const left = keepInside(x - width / 2, width, x, this.width, EDGE);
    context.translate(left + width / 2, y);
    context.rotate(-0.035);
    context.globalAlpha = Math.min(1, alpha);
    context.fillStyle = this.colors.paper;
    context.fillRect(-width / 2, -height / 2, width, height);
    context.strokeStyle = color;
    context.lineWidth = 1.3;
    context.strokeRect(-width / 2 + 0.5, -height / 2 + 0.5, width - 1, height - 1);
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 0, 1);
    context.letterSpacing = '0px';
    context.restore();
  }

  // A ledger line in typewriter type.
  private typed(value: string, x: number, y: number, alpha: number, color = this.colors.ink, align: CanvasTextAlign = 'left', size = this.typedSize()): void {
    this.text(value, x, y, { size, color, alpha, align, typewriter: true });
  }

  private typedSize(): number {
    return this.width < 480 ? 11.5 : 13;
  }

  // The written multiples: a little smaller on a phone, so the longest still wrap onto a few rows.
  private writtenSize(): number {
    return this.width < 480 ? 10 : 13;
  }

  // Where the first written row sits under the panel's tag.
  private writtenFirst(): number {
    return this.layout === 'wide' ? 30 : 22;
  }

  // The part of `value` typed by now, one letter every `step` ms from `start`.
  private typing(value: string, start: number, step = 30): string {
    return value.slice(0, Math.max(0, Math.floor((this.time - start) / step)));
  }

  private small(size: number): number {
    return this.width < 480 ? size - 1 : size;
  }

  // Horizontal ruling, like an engraver's hatch, inside a closed path. The rules sit on one grid for the whole frame.
  private hatch(clip: Path2D, top: number, bottom: number, left: number, right: number, color: string, alpha: number, gap = 4): void {
    if (alpha <= 0 || right <= left) return;

    const context = this.context;
    const path = new Path2D();

    for (let y = Math.max(0, Math.ceil(top / gap) * gap); y <= Math.min(this.height, bottom); y += gap) {
      path.moveTo(left, y + 0.5);
      path.lineTo(right, y + 0.5);
    }

    context.save();
    context.lineCap = 'butt';
    context.clip(clip);
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

  // Formula labels, set with Temml in the page and pinned here.

  private label(id: string, x: number, y: number, alpha: number): void {
    const element = this.labels.get(id);

    if (!element || alpha <= 0.01) return;

    const { offset, width, rise, height } = this.box(id, element);
    const left = keepInside(x + offset, width, x, this.width, EDGE + 2);
    const top = keepInside(y + rise, height, y, this.height, EDGE);
    this.shown.add(id);
    element.style.transform = `translate(${(left - offset).toFixed(1)}px, ${(top - rise).toFixed(1)}px)`;
    element.style.opacity = Math.min(1, alpha).toFixed(3);

    if (!this.visible.has(id)) {
      element.style.visibility = 'visible';
      this.visible.add(id);
    }
  }

  private labelWidth(id: string): number {
    const element = this.labels.get(id);

    return element ? this.box(id, element).width : 0;
  }

  private box(id: string, element: HTMLElement): LabelBox {
    const known = this.boxes.get(id);

    if (known) return known;

    const pin = element.getBoundingClientRect();
    const drawn = element.firstElementChild?.getBoundingClientRect() ?? pin;
    const measured = { offset: drawn.left - pin.left, width: drawn.width, rise: drawn.top - pin.top, height: drawn.height };
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

  // The plane: axes, nets, the two opening curves, the whole numbers, the example curve and its multiples.

  private drawPlane(): void {
    const time = this.time;
    // On a phone the chart takes the plane's place for the last scenes.
    const alpha = this.layout === 'tall' ? 1 - span(time, 103000, 104000) : 1;

    if (alpha <= 0) return;

    const placed = this.plane();
    const { muted } = this.colors;
    const reach = this.reach(placed);
    const size = placed.view.right - placed.view.left;
    this.clipTo(placed);
    this.line([this.at(placed, [reach.left, 0]), this.at(placed, [reach.right, 0])], muted, 0.9, alpha * 0.7);
    this.line([this.at(placed, [0, reach.bottom]), this.at(placed, [0, reach.top])], muted, 0.9, alpha * 0.7);
    // Numbers on the axis while the whole picture shows; the line under the plane takes them over later.
    const numbers = alpha * Math.min(1, Math.max(0, (size - 4) / 1.2)) * (1 - span(time, 38500, 39200));

    for (const value of [-2, -1, 1, 2]) {
      this.line([this.at(placed, [value, 0]), [this.px(placed, value), this.py(placed, 0) + 4]], muted, 1, numbers);
      this.text(String(value).replace('-', '−'), this.px(placed, value), this.py(placed, 0) + 13, { size: this.small(11), color: muted, alpha: numbers });
    }

    this.drawNets(placed, reach, alpha);
    this.drawOpeningCurves(placed, alpha);
    this.drawWholeNumbers(placed, reach, alpha);
    this.drawExampleCurve(placed, alpha);
    this.context.restore();
    this.drawPlaneNotes(placed, alpha);
  }

  // The net on screen, the one before it fading out, and on the circle the knot that comes closest.
  private drawNets(placed: Placed, reach: View, alpha: number): void {
    const net = netAt(this.time);

    if (!net) return;

    // The knots (a/c, b/c) in reach, as a block of tiles, each tile one spacing wide with its knot in the middle.
    const knots = (c: number, shown: number) => {
      if (shown <= 0) return;

      const spacing = placed.scaleX / c;
      const [firstA, lastA] = [Math.ceil(reach.left * c), Math.floor(reach.right * c)];
      const [firstB, lastB] = [Math.floor(reach.top * c), Math.ceil(reach.bottom * c)];
      const left = this.px(placed, firstA / c) - spacing / 2;
      const top = this.py(placed, firstB / c) - spacing / 2;
      const pattern = this.knotPattern(spacing, Math.min(2.2, Math.max(0.9, spacing * 0.15)), left, top);

      if (!pattern || lastA < firstA || firstB < lastB) return;

      // The tile is within a few per cent of its size on screen, so nearest-pixel sampling changes a knot by a pixel at
      // most, and it paints much faster than smoothing on slow phones.
      const context = this.context;
      context.globalAlpha = Math.min(1, shown);
      context.imageSmoothingEnabled = false;
      context.fillStyle = pattern;
      context.fillRect(left, top, (lastA - firstA + 1) * spacing, (firstB - lastB + 1) * spacing);
      context.imageSmoothingEnabled = true;
      context.globalAlpha = 1;
    };

    knots(net.c, alpha * net.alpha * 0.55 * (1 - net.previous));
    knots(net.c - 1, alpha * net.alpha * 0.55 * net.previous);

    if (net.run !== NET_RUNS[1]) return;

    const miss = this.nearestMiss(placed, net.c);
    this.ring(this.px(placed, miss.a / miss.c), this.py(placed, miss.b / miss.c), 6, this.colors.muted, alpha * net.alpha, 1.3);
  }

  // A pattern of knots `spacing` apart with a knot at (left + spacing/2, top + spacing/2). The tile is drawn at device
  // resolution, rounded up to whole pixels, and scaled back to the exact spacing so the knots don't drift.
  private knotPattern(spacing: number, radius: number, left: number, top: number): CanvasPattern | null {
    const size = Math.max(2, Math.ceil(spacing * this.ratio));
    const scale = size / spacing;
    // The knot's radius in tile pixels, to a quarter pixel.
    const dot = Math.round(radius * scale * 4) / 4;
    const key = `${size} ${dot} ${this.colors.ink}`;
    let pattern = this.patterns.get(key) ?? null;

    if (!pattern) {
      this.tile.width = size;
      this.tile.height = size;
      const tile = this.tile.getContext('2d');

      if (!tile) return null;

      tile.fillStyle = this.colors.ink;
      tile.beginPath();
      tile.arc(size / 2, size / 2, dot, 0, 2 * Math.PI);
      tile.fill();
      pattern = this.context.createPattern(this.tile, 'repeat');

      if (!pattern) return null;

      if (this.patterns.size >= 16) this.patterns.clear();

      this.patterns.set(key, pattern);
    }

    pattern.setTransform(new DOMMatrix([1 / scale, 0, 0, 1 / scale, left, top]));

    return pattern;
  }

  // On the circle's nets, the knot nearest the circle in the middle of the window, away from the frame's edges.
  private nearestMiss(placed: Placed, c: number): ReturnType<typeof nearestMiss> {
    const { left, right, bottom, top } = placed.view;
    const inset = (right - left) * 0.2;

    return nearestMiss(c, left + inset, right - inset, bottom + inset, top - inset);
  }

  // x³ + y³ = 6 with its two caught knots, then the circle x² + y² = 3 that no net catches.
  private drawOpeningCurves(placed: Placed, alpha: number): void {
    const time = this.time;
    const { ink, blue } = this.colors;
    // The cubic leaves for the circle, then both come back faint when the camera pulls back.
    const cubic = alpha * Math.max(fade(time, 0, 400, 18200, 18900), 0.45 * fade(time, 31500, 32500, 38500, 39500));
    const written = Math.round(span(time, 500, 4500) * (CUBIC.length - 1));
    this.line(CUBIC.slice(0, written + 1).map((point) => this.at(placed, point)), ink, 1.8, cubic);
    const circle = alpha * fade(time, 18000, 18300, 38500, 39500);
    const turn = span(time, 18000, 19000) * 2 * Math.PI;

    if (circle > 0) {
      const path = new Path2D();
      path.arc(this.px(placed, 0), this.py(placed, 0), ROOT_THREE * placed.scaleX, 0, -turn, true);
      this.stroke(path, ink, 1.8, circle);
    }

    // The caught knots leave with the cubic while the circle's nets run, and come back with it.
    const caught = alpha * Math.max(fade(time, CAUGHT + 200, CAUGHT + 500, 18200, 18900), fade(time, 31500, 32500, 38500, 39500));

    for (const knot of CUBIC_KNOTS) {
      const x = this.px(placed, knot.a / knot.c);
      const y = this.py(placed, knot.b / knot.c);
      this.dot(x, y, 4.5, blue, caught);
      this.ring(x, y, 9 + 6 * (1 - span(time, CAUGHT + 200, CAUGHT + 800)), blue, caught);
    }
  }

  // Scene 3: the whole-number knots, their shadow falling onto the line, and the uprights of the wanted equation.
  private drawWholeNumbers(placed: Placed, reach: View, alpha: number): void {
    const time = this.time;
    const shown = alpha * fade(time, 39200, 40700, 54500, 55500);

    if (shown <= 0) return;

    const points: Point[] = [];

    for (let a = Math.ceil(reach.left); a <= Math.floor(reach.right); a += 1) {
      for (let b = Math.ceil(reach.bottom); b <= Math.floor(reach.top); b += 1) {
        points.push(this.at(placed, [a, b]));
      }
    }

    this.dots(points, this.layout === 'wide' ? 2.2 : 1.8, this.colors.blue, shown * (1 - 0.45 * span(time, 47000, 48500)));
    const uprights = shown * 0.55 * fade(time, 50000, 51500);

    if (uprights <= 0) return;

    const lineY = this.frame('line').top;

    for (let a = Math.ceil(reach.left); a <= Math.floor(reach.right); a += 1) {
      this.line([[this.px(placed, a), lineY], [this.px(placed, a), placed.top]], this.colors.muted, 0.8, uprights, [2, 4]);
    }
  }

  // Scene 4 on: y² = x³ − 25x. Its fraction points arrive, the gaps fill into two pieces; later P and its multiples.
  private drawExampleCurve(placed: Placed, alpha: number): void {
    const time = this.time;
    const { ink, blue } = this.colors;
    const fraction = alpha * fade(time, 55000, 55400) * (1 - 0.75 * span(time, 86500, 88000));

    if (fraction > 0) {
      const points: Point[] = TORSION.map((point) => this.at(placed, point));

      for (const { n, x, y } of FLOATS) {
        if (time < 55200 + (n - 1) * 29) break;

        points.push(this.at(placed, [x, y]));
      }

      this.dots(points, this.layout === 'wide' ? 2.1 : 1.7, ink, fraction);
    }

    const pieces = alpha * fade(time, 59500, 59700);
    const oval = Math.round(span(time, 59500, 60700) * (PIECES.oval.length - 1));
    const branch = Math.round(span(time, 60200, 61400) * (PIECES.branch.length - 1));
    this.line(PIECES.oval.slice(0, oval + 1).map((point) => this.at(placed, point)), ink, 1.8, pieces);
    this.line(PIECES.branch.slice(0, branch + 1).map((point) => this.at(placed, point)), ink, 1.8, pieces);
    // Scene 6: P, then the multiples that fall inside the picture, as they are written out.
    const first = MULTIPLES[0];

    if (first) this.dot(this.px(placed, first.x), this.py(placed, first.y), 4.5, blue, alpha * fade(time, 95300, 95700));

    for (const named of NAMED) {
      const multiple = MULTIPLES[named.n - 1];

      if (multiple) this.dot(this.px(placed, multiple.x), this.py(placed, multiple.y), 3.6, blue, alpha * fade(time, named.at, named.at + 300));
    }
  }

  // Labels, tags and stamps on the plane, drawn outside its clip so they can't be cut.
  private drawPlaneNotes(placed: Placed, alpha: number): void {
    const time = this.time;
    const { blue, ink } = this.colors;
    const size = placed.view.right - placed.view.left;
    // The opening curve's name over its left arm; once the circle is beside it, against its lower arm, clear of the circle.
    this.label('cubic', this.px(placed, -1.55) + 8, this.py(placed, cubicY(-1.55)) - 16, alpha * fade(time, 1200, 1800, 6800, 7600));
    const lowArm = Math.cbrt(6 + 2.15 ** 3);
    const cubicName = alpha * fade(time, 33300, 34000, 38500, 39200);
    this.label('cubic', this.px(placed, lowArm) - this.labelWidth('cubic') - 10, this.py(placed, -2.15), cubicName);
    // The caught point's sum, in the open space under the curve in the last net's window.
    const upper = CUBIC_KNOTS[0];
    const upperX = this.px(placed, upper.a / upper.c);
    const upperY = this.py(placed, upper.b / upper.c);
    const window = NET_RUNS[0].reach[this.layout] / CUBIC_NET;
    const corner = NET_RUNS[0].centre[0] - window / 2;
    this.label('found', this.px(placed, corner + 0.05 * window), this.py(placed, corner + 0.3 * window), alpha * fade(time, 13300, 13900, 16300, 17000));
    // The circle's name: outside the arc while the camera is close, then inside the circle once it pulls back.
    const close = alpha * fade(time, 19000, 19600, 31500, 32200);
    const far = alpha * fade(time, 33300, 34000, 38500, 39200);
    const middleX = (placed.view.left + placed.view.right) / 2;
    const middleY = (placed.view.bottom + placed.view.top) / 2;

    if (close > 0) {
      this.label('circle', this.px(placed, middleX - 0.4 * size), this.py(placed, middleY + 0.32 * size), close);
    } else if (far > 0) {
      this.label('circle', this.px(placed, -0.62), this.py(placed, -1.05), far);
    }

    // The knot nearest the circle, named once.
    const net = netAt(time);
    const missNote = alpha * fade(time, 20200, 20800, 23600, 24200);

    if (net && missNote > 0) {
      const miss = this.nearestMiss(placed, net.c);
      this.tag('close, not on it', this.px(placed, miss.a / miss.c), this.py(placed, miss.b / miss.c) + 18, missNote);
    }

    // The circle's verdict, pinned where the camera looked, and what each curve's answer needed.
    const onCircle = this.at(placed, CIRCLE_MARK);
    this.stamp('none, ever', onCircle[0], onCircle[1], alpha * fade(time, 27000, 27400, 38500, 39200), ink);
    this.tag('only an argument can say this', onCircle[0], onCircle[1] + 24, alpha * fade(time, 34600, 35200, 38500, 39200));
    this.tag('a search can say this', upperX, upperY - 18, alpha * fade(time, 34000, 34600, 38500, 39200), 'center', blue);
    // The wanted equation, struck once Mazur's pieces rule it out; then the paper's claim.
    const wanted = alpha * fade(time, 51000, 51800, 86500, 87500);
    const [first, second, third] = [this.note(0), this.note(1), this.note(2)];
    this.struckTag('wanted: an equation with this shadow', first, wanted, span(time, 65000, 65600));
    this.tag('if Mazur is right, there is none', second.x, second.y, alpha * fade(time, 65400, 66000, 86500, 87500), second.align);
    this.tag('claimed: no for fractions too', third.x, third.y, alpha * fade(time, 69500, 70100, 86500, 87500), third.align, blue);
    this.drawCurveNotes(placed, alpha);
  }

  // Where the story's notes go, one per row: on a wide frame in the empty top right, past the curve's branch; on a phone
  // under the test row.
  private note(row: number): { x: number; y: number; align: CanvasTextAlign } {
    if (this.layout === 'wide') return { x: this.width - EDGE, y: this.frame('plane').top + 12 + 16 * row, align: 'right' };

    return { x: this.width / 2, y: this.frame('tests').top + 34 + 16 * row, align: 'center' };
  }

  private drawCurveNotes(placed: Placed, alpha: number): void {
    const time = this.time;
    // On a phone the plane shrinks for the written multiples, so the curve's name leaves first, and P takes its place.
    const curve = alpha * (this.layout === 'wide' ? fade(time, 59800, 60400) : fade(time, 59800, 60400, 92500, 93300));
    // Above the oval's top (y ≈ 6.94), ending just short of the branch, which crosses y = 7.6 at x ≈ 5.9.
    this.label('curve', this.px(placed, 5.9) - 10 - this.labelWidth('curve'), this.py(placed, 7.6), curve);
    const pieces = alpha * fade(time, 61000, 61600, 69000, 69800);
    this.tag('piece 1', this.px(placed, -2.5), this.py(placed, 3.9), pieces);
    this.tag('piece 2', this.px(placed, 5.17) + 8, this.py(placed, -3), pieces, 'left');
    const first = MULTIPLES[0];

    if (first) this.label('p', this.px(placed, first.x) - 22, this.py(placed, first.y) - 12, alpha * fade(time, 95300, 95900));

    for (const named of NAMED) {
      const multiple = MULTIPLES[named.n - 1];

      if (multiple) this.label(named.id, this.px(placed, multiple.x) + 9, this.py(placed, multiple.y) - 10, alpha * fade(time, named.at, named.at + 400));
    }

    const example = alpha * fade(time, 96000, 96600);

    // On a phone there is no room beside the oval, so the note goes under the tests, where "suppose every test passes" was.
    if (this.layout === 'wide') {
      this.tag('points: a small example', placed.left + 4, placed.top + placed.height - 8, example, 'left');
    } else {
      const tests = this.frame('tests');
      this.tag('points: a small example', tests.left + tests.width, this.testsFoot(), example * (1 - span(time, 102800, 103300)), 'right');
    }
  }

  // The line under the plane: the whole numbers' shadow, the curve's two stretches, a search, and the larger number system.

  private lineMap(): { y: number; left: number; right: number; cut: number; toX: (value: number) => number; fromX: (x: number) => number } {
    const placed = this.plane();
    const { left, top: y, width } = this.frame('line');
    const right = left + width;
    // Stretching: the ordinary numbers close up towards the left, leaving room for the larger system past a break.
    const squeeze = 1 - 0.5 * span(this.time, STRETCH.start, STRETCH.end);
    // A phone gives the larger system half the line, so its name and the solution's tag fit side by side.
    const cut = right - (right - left) * (this.layout === 'wide' ? 0.42 : 0.5) * span(this.time, STRETCH.start, STRETCH.end);

    return {
      y, left, right, cut,
      toX: (value) => left + (this.px(placed, value) - left) * squeeze,
      fromX: (x) => ((x - left) / squeeze + left - placed.originX) / placed.scaleX,
    };
  }

  private drawLine(): void {
    const time = this.time;
    const drawn = span(time, 41500, 42800);

    if (drawn <= 0) return;

    const { ink, blue, muted } = this.colors;
    const { y, left, right, cut, toX, fromX } = this.lineMap();
    const end = Math.min(cut, left + (right - left) * drawn);
    this.line([[left, y], [end, y]], ink, 1.2, 1);
    // Whole numbers: blue dots, swept in from the left as the knots' shadows land.
    const first = Math.ceil(fromX(left + 4));
    const last = Math.floor(fromX(cut - 8));

    for (let value = first; value <= last; value += 1) {
      const x = toX(value);
      const sweep = (x - left) / (right - left);
      const shown = span(time, 47800 + 1500 * sweep, 48300 + 1500 * sweep);
      this.dot(x, y, this.layout === 'wide' ? 2.6 : 2.2, blue, shown);

      if (value % 5 === 0) {
        this.text(String(value).replace('-', '−'), x, y + 12, { size: this.small(11), color: muted, alpha: fade(time, 42500, 43300, STRETCH.start, STRETCH.start + 600) });
      }
    }

    const ends = fade(time, 49500, 50200);
    this.typed('…', left - 2, y - 1, ends, blue, 'right');
    this.typed('…', cut + 4, y - 1, ends * (1 - span(time, STRETCH.start, STRETCH.start + 400)), blue);
    this.drawShadows(y, right, toX);
    this.drawFalling(y);
    this.drawSearchOnLine(y, right, toX, fromX);
    this.drawLarger(y, right, cut, toX);
    this.tag('endlessly many separate points', left + 4, y + 40, fade(time, 62000, 62600, 69000, 69800), 'left', blue);
  }

  // Scene 3: copies of the whole-number knots fall straight down onto the line, row by row from the bottom.
  private drawFalling(lineY: number): void {
    const time = this.time;

    if (time < 47000 || time > 49800) return;

    const placed = this.plane();
    const reach = this.reach(placed);
    const bottom = Math.ceil(reach.bottom);
    const points: Point[] = [];

    for (let b = bottom; b <= Math.floor(reach.top); b += 1) {
      const start = 47000 + (b - bottom) * 55;
      const fall = span(time, start, start + 800);

      if (fall <= 0 || fall >= 1) continue;

      for (let a = Math.ceil(reach.left); a <= Math.floor(reach.right); a += 1) {
        const from = this.py(placed, b);
        points.push([this.px(placed, a), from + (lineY - from) * fall]);
      }
    }

    this.dots(points, this.layout === 'wide' ? 2.2 : 1.8, this.colors.blue, 0.8);
  }

  // Scene 4: the curve's two pieces drop their shadows, two hatched stretches just above the line.
  private drawShadows(y: number, right: number, toX: (value: number) => number): void {
    const time = this.time;
    const shown = fade(time, 61400, 61800, 86500, 87500);

    if (shown <= 0) return;

    const placed = this.plane();
    const { ink, muted } = this.colors;
    const sweep = span(time, 61400, 62800);
    const stretches = [[-5, 0], [5, Infinity]] as const;

    for (const [from, to] of stretches) {
      const start = toX(from);
      const stop = Math.min(right, to === Infinity ? right : toX(to));
      const end = start + (stop - start) * sweep;
      const band = new Path2D();
      band.rect(start, y - 11, end - start, 8);
      this.hatch(band, y - 11, y - 3, start, end, ink, shown * 0.8, 2);
      this.line([[start, y - 11], [start, y - 3]], ink, 1, shown);
    }

    const edges = fade(time, 61400, 61800, 64500, 65500);

    for (const value of [-5, 0, 5]) {
      this.line([[this.px(placed, value), this.py(placed, 0)], [toX(value), y - 12]], muted, 0.8, edges * 0.7, [2, 3]);
    }

    this.tag('2 pieces, 2 stretches', toX(2.5), y + 26, fade(time, 62300, 62900, 69000, 69800));
  }

  // Scene 5: a search along the whole numbers, one at a time, beside the search through the tests.
  private drawSearchOnLine(y: number, right: number, toX: (value: number) => number, fromX: (x: number) => number): void {
    const time = this.time;
    const shown = fade(time, TESTS.searchStart, TESTS.searchStart + 300, TESTS.searchEnd, TESTS.searchEnd + 500);

    if (shown <= 0) return;

    // It tries 0, 1, 2… up to the last whole number on screen.
    const last = Math.min(13, Math.floor(fromX(right - 12)));
    const step = Math.min(last, Math.floor(share(time, TESTS.searchStart, TESTS.searchEnd) * (last + 1)));
    this.ring(toX(step), y, 6.5, this.colors.ink, shown, 1.4);
  }

  // Scene 5: the larger number system past a break, its supposed solution, and the solution coming home.
  private drawLarger(y: number, right: number, cut: number, toX: (value: number) => number): void {
    const time = this.time;
    const shown = fade(time, STRETCH.start + 1200, STRETCH.end + 400);

    if (shown <= 0) return;

    const { ink, blue } = this.colors;
    const start = cut + 22;
    this.line([[cut + 4, y + 6], [cut + 10, y - 6]], ink, 1.2, shown);
    this.line([[cut + 11, y + 6], [cut + 17, y - 6]], ink, 1.2, shown);
    this.line([[start, y], [right, y]], ink, 1.2, shown);
    const gap = this.layout === 'wide' ? 18 : 14;

    for (let x = start + gap / 2; x < right - 4; x += gap) {
      this.dot(x, y, 2.2, ink, shown);
    }

    // Its name and the solution's tag sit under the line, where nothing of the plane reaches. A phone has no room for
    // a second row there; the tests' own tag says they are schematic.
    this.label('zstar', start + 2, y + 15, shown);

    if (this.layout === 'wide') this.tag('schematic', right, y + 28, shown * (1 - span(time, 103000, 103600)), 'right');

    // The supposed solution: hollow out in the larger system, blue once it is ordinary.
    const far = start + (right - start) * 0.75;
    const home = toX(2);
    const back = span(time, STAR_RETURN.start, STAR_RETURN.end);
    const x = far + (home - far) * back;
    const lift = Math.sin(Math.PI * back) * 22;
    const star = fade(time, 91000, 91800);
    this.dot(x, y - lift, 5, back >= 1 ? blue : ink, star, back < 1);
    // Centred under the solution, or flush with the line's end when that is too close.
    const named = Math.min(far + this.tagWidth('a solution') / 2, right);
    this.tag('a solution', named, y + 14, star * (1 - span(time, STAR_RETURN.start, STAR_RETURN.start + 400)), 'right');
    this.tag('ordinary after all', home, y + (this.layout === 'wide' ? 26 : 15), fade(time, STAR_RETURN.end - 300, STAR_RETURN.end + 300), 'center', blue);
  }

  // The tests: a row of boxes under the line, each a few questions (schematic). They tick as the search goes along them.

  private testBox(): number {
    return this.layout === 'wide' ? 12 : 10;
  }

  // Where the names under the test row sit.
  private testsFoot(): number {
    return this.frame('tests').top + this.testBox() + 11;
  }

  private drawTests(): void {
    const time = this.time;
    // On a phone the row steps out while it moves back down past the written multiples, and comes back under the line.
    const away = this.layout === 'tall' ? 1 - fade(time, 103000, 103300, 104200, 104600) : 1;
    const drawn = away * span(time, TESTS.drawn, TESTS.drawn + 2000);

    if (drawn <= 0) return;

    const { ink, blue, muted } = this.colors;
    const { left, top, width } = this.frame('tests');
    const size = this.testBox();
    const gap = this.layout === 'wide' ? 8 : 6;
    const count = Math.floor((width - 24) / (size + gap));
    const stepping = Math.floor(share(time, TESTS.searchStart, TESTS.searchEnd) * 14);

    for (let index = 0; index < count; index += 1) {
      const x = left + index * (size + gap);
      const shown = away * span(time, TESTS.drawn + 2000 * (index / count), TESTS.drawn + 2000 * (index / count) + 200);

      if (shown <= 0) continue;

      this.line([[x, top], [x + size, top], [x + size, top + size], [x, top + size], [x, top]], ink, 1, shown);
      const ticked = time >= Math.min(TESTS.searchStart + index * ((TESTS.searchEnd - TESTS.searchStart) / 14), TESTS.allPass + 1200 * (index / count));

      if (ticked) {
        this.line([[x + 2.5, top + size * 0.55], [x + size * 0.42, top + size - 2.5], [x + size - 2, top + 2.5]], blue, 1.4, shown);
      } else {
        this.text('?', x + size / 2, top + size / 2 + 0.5, { size: size - 2, color: muted, alpha: shown, typewriter: true });
      }

      if (index === stepping && time >= TESTS.searchStart && time <= TESTS.searchEnd + 300) {
        this.line([[x - 3, top - 3], [x + size + 3, top - 3], [x + size + 3, top + size + 3], [x - 3, top + size + 3], [x - 3, top - 3]], ink, 1.4, shown);
      }
    }

    const end = left + count * (size + gap);
    this.typed('…', end, top + size / 2, drawn, muted);
    const below = this.testsFoot();
    const stamped = fade(time, 83500, 83900, 86500, 87000);
    // On a phone the stamp reaches down to the row's name, which steps aside while the stamp shows.
    const named = away * fade(time, TESTS.drawn + 1200, TESTS.drawn + 1800, 112500, 113000) * (this.layout === 'tall' ? 1 - stamped : 1);
    this.tag('tests (schematic)', left, below, named, 'left');
    this.tag('one of them would finish', left + width, below, fade(time, 78000, 78600, 83300, 83800), 'right');
    this.tag('suppose every test passes', left + width, below, fade(time, 87500, 88100, 95000, 95600), 'right');
    this.stamp('impossible (1970)', left + width / 2, top + size / 2, stamped, ink);
  }

  // The side panel: the net's name, the remainder table, and the multiples written out in full.

  private drawSide(): void {
    const time = this.time;
    const { left, top, width } = this.frame('side');
    const { ink, blue } = this.colors;
    const net = netAt(time);

    if (net) {
      const found = net.run === NET_RUNS[0] && time >= CAUGHT + 200;
      const nothing = net.run === NET_RUNS[1] && net.c === net.run.last;
      let name = `net of ${netName(net.c)}`;

      if (found) name = `${name} · found`;
      else if (nothing) name = `${name} · nothing yet`;

      this.tag(name, left, top + 6, net.alpha, 'left', found ? blue : this.colors.muted);
    }

    // The remainders that settle x² + y² = 3, once the last net has gone.
    const table = fade(time, 25200, 25700, 31500, 32300);

    if (table > 0) {
      const height = this.typedSize() * 1.5;
      this.tag('remainders on division by 3', left, top + 6, table, 'left');
      // The row names in one column, the digits in another, so the digits line up whatever the names' glyphs.
      const names = ['n', 'n² leaves'];
      this.context.font = `${this.typedSize()}px ${TYPEWRITER}`;
      const digits = left + Math.max(...names.map((name) => this.context.measureText(name).width)) + 12;
      const rows = [Array.from({ length: 9 }, (_, n) => String(n)), SQUARE_REMAINDERS.map(String)];

      for (const [index, name] of names.entries()) {
        const y = top + 6 + (index + 1) * height;
        const start = 25700 + index * 1000;
        this.typed(name, left, y, table * fade(time, start - 300, start));
        this.typed(this.typing(rows[index]?.join(' ') ?? '', start, 45), digits, y, table);
      }
    }

    this.drawWritten(left, top, width, this.frame('side').height, ink);
  }

  // Each written line wraps to the panel's width; its rows, and its total length, say how big the fraction is. Rows
  // past the panel's foot are left out, and the last one that fits ends in "…" (a phone has room for about seven).
  private writtenRows(width: number, height: number): { rows: { part: string; start: number; cut: boolean }[]; length: number; n: number; at: number; digits: number; text: string; top: number }[] {
    const context = this.context;
    context.font = `${this.writtenSize()}px ${TYPEWRITER}`;
    const letter = context.measureText('0').width;
    const perRow = Math.max(8, Math.floor(width / letter));
    const step = this.writtenSize() * 1.45;
    const room = Math.floor((height - this.writtenFirst() - step / 2) / step) + 1;
    let row = 0;

    return WRITTEN_LINES.map((written) => {
      const rows: { part: string; start: number; cut: boolean }[] = [];

      for (let start = 0; start < written.text.length && row + rows.length < room; start += perRow) {
        const part = written.text.slice(start, start + perRow);
        const cut = row + rows.length === room - 1 && start + perRow < written.text.length;
        rows.push({ part: cut ? `${part.slice(0, -1)}…` : part, start, cut });
      }

      const block = { ...written, rows, length: Math.min(written.text.length, rows.length * perRow) * letter, top: row };
      row += rows.length;

      return block;
    });
  }

  private drawWritten(left: number, top: number, width: number, height: number, ink: string): void {
    const time = this.time;
    const header = fade(time, 95400, 95900, 103300, 104000);

    if (time < 95400) return;

    const step = this.writtenSize() * 1.45;
    const first = top + this.writtenFirst();
    this.tag('the multiples of P, written out', left, top + 6, header, 'left');

    for (const block of this.writtenRows(width, height)) {
      const typed = this.typing(block.text, block.at, TYPING_STEP);
      // Each line goes as its bar sets off for the chart.
      const leaving = 103300 + block.n * 120;
      const shown = fade(time, block.at, block.at + 100, leaving - 100, leaving + 200);

      for (const [index, row] of block.rows.entries()) {
        const done = typed.length >= row.start + row.part.length;
        const part = row.cut && done ? row.part : typed.slice(row.start, row.start + row.part.length);
        this.typed(part, left, first + (block.top + index) * step, shown, ink, 'left', this.writtenSize());
      }
    }
  }

  // The size chart: digits of x(nP) against n, the bound a constant times n (schematic), and where both can hold.

  private chartPlaced(): Placed {
    return this.place('chart', { left: 0, right: 12.5, bottom: 0, top: 130 }, false);
  }

  private drawChart(): void {
    const time = this.time;
    const opening = this.layout === 'wide' ? 103800 : 104000;
    const alpha = fade(time, opening, opening + 800);

    if (alpha <= 0) return;

    const placed = this.chartPlaced();
    const { ink, blue, muted } = this.colors;
    const { view } = placed;
    const origin = this.at(placed, [0, 0]);
    this.line([[origin[0], this.py(placed, view.top)], origin, [this.px(placed, view.right), origin[1]]], ink, 1, alpha);

    for (const n of [4, 8, 12]) {
      this.text(String(n), this.px(placed, n), origin[1] + 12, { size: this.small(11), color: muted, alpha });
    }

    this.tag('index B', this.px(placed, view.right), origin[1] + 26, alpha, 'right');
    this.tag('size h: digits of each point', placed.left, placed.top - 10, alpha, 'left');
    this.drawMorph(placed);
    // Where both hold: above the points' growth, below the bound. It ends at a finite B.
    const region = alpha * fade(time, 108300, 109300);

    if (region > 0) {
      const path = new Path2D();
      path.moveTo(...origin);

      for (let n = 0; n <= CROSSING; n += CROSSING / 30) {
        path.lineTo(this.px(placed, n), this.py(placed, BOUND_SLOPE * n));
      }

      for (let n = CROSSING; n >= 0; n -= CROSSING / 30) {
        path.lineTo(this.px(placed, n), this.py(placed, GROWTH * n * n));
      }

      path.closePath();
      this.hatch(path, placed.top, origin[1], placed.left, placed.left + placed.width, blue, region * 0.8, 3);
      this.tag('only ordinary B fit', this.px(placed, CROSSING / 2), this.py(placed, 110), region * (1 - span(time, 112500, 113000)), 'center', blue);
    }

    this.tag('no room', this.px(placed, 10.4), this.py(placed, 20), alpha * fade(time, 109300, 109900));

    for (const multiple of MULTIPLES) {
      const at = multiple.n <= WRITTEN.length ? 104900 + multiple.n * 120 : 105300 + (multiple.n - WRITTEN.length) * 200;
      this.dot(this.px(placed, multiple.n), this.py(placed, multiple.digits), 2.6, ink, alpha * fade(time, at, at + 200));
    }

    // The parabola, written from the left, then the bound.
    const parabola = span(time, 106000, 107300);
    const growth: Point[] = [];

    for (let n = 0; n <= 12.5 * parabola; n += 0.1) {
      growth.push(this.at(placed, [n, Math.min(view.top, GROWTH * n * n)]));
    }

    this.line(growth, ink, 1.2, alpha);
    const bound = span(time, 107300, 108300);
    this.line([origin, this.at(placed, [12.5 * bound, BOUND_SLOPE * 12.5 * bound])], muted, 1.2, alpha * (bound > 0 ? 1 : 0), [5, 4]);
    this.label('growth', this.px(placed, 5.2), this.py(placed, 62), alpha * fade(time, 106800, 107500));
    this.label('bound', this.px(placed, 10.6), this.py(placed, 46), alpha * fade(time, 108000, 108600));
  }

  // Each written line shrinks to a dot at its length: a bar from the line's extent to the chart's dot for (n, digits).
  private drawMorph(placed: Placed): void {
    const time = this.time;

    if (time < 103300 || time > 105600) return;

    const side = this.frame('side');
    const height = this.writtenSize() * 1.45;

    for (const block of this.writtenRows(side.width, side.height)) {
      const start = 103300 + block.n * 120;
      const amount = span(time, start, start + 1400);

      if (amount <= 0 || amount >= 1) continue;

      const y = side.top + this.writtenFirst() + block.top * height;
      const right = side.left + Math.min(side.width, block.length);
      const dotX = this.px(placed, block.n);
      const dotY = this.py(placed, block.digits);
      const fromLeft = side.left + (dotX - side.left) * amount;
      const toRight = right + (dotX - right) * amount;
      this.line([[fromLeft, y + (dotY - y) * amount], [toRight, y + (dotY - y) * amount]], this.colors.ink, 4 - 1.5 * amount, 1);
    }
  }

  // The last scene: the two unchecked papers pinned to what they hold up, and the status.

  private drawStatus(): void {
    const time = this.time;
    const shown = fade(time, 113000, 113800);

    if (shown <= 0) return;

    const { blue } = this.colors;
    const tests = this.frame('tests');
    const size = this.layout === 'wide' ? 12 : 10;
    this.tag('parity step: pointwise 2-converse · unchecked', tests.left, tests.top + size + 11, shown, 'left');
    // The bound's paper, in the chart's empty top left where "only ordinary B fit" stood.
    const chart = this.chartPlaced();
    this.tag('the bound: Fontaine–Mazur\nat 2 · unchecked', this.px(chart, 0.3), this.py(chart, 105), shown, 'left');
    const stamp = fade(time, 114300, 114800);

    // The status, between the chart and the line.
    if (this.layout === 'wide') {
      this.stamp('claimed · unreviewed', chart.left + chart.width / 2, this.frame('line').top - 32, stamp, blue);
    } else {
      this.stamp('claimed · unreviewed', this.width / 2, chart.top + chart.height + 44, stamp, blue);
    }
  }
}

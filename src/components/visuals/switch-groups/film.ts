import { mix as between, smooth as ease, fade as presence } from '../../../lib/animation';
import { BENT_COEFFICIENTS, BETTER_METHODS, CROSSING_RULES, GROUP_COUNTS, GROUP_RULES, GROUP_SIZE, LEDGER, OPENING_COUNT, STOP_DATA, SWITCHES, TRUE_COUNT, evaluate, nodeOf, settingOf } from './sat';
import { ADDED, BREAK_U, GROUP_STEP, REGROUP, THRESHOLD_U, TREE_ROWS, WALKS, arrivalOf, bendAt, boxesFor, depthOf, dialAt, pinPlace, walkAt, walkedOn, type Box, type Layout } from './timeline';

type Tone = 'ink' | 'blue' | 'muted' | 'paper';

// Points are shares of the frame: [0, 1] across and down.
type Point = readonly [number, number];

type Kind = 'tag' | 'note' | 'number' | 'count';

type Writing = { kind?: Kind; tone?: Tone; alpha?: number; align?: 'left' | 'center' | 'right'; patch?: boolean; size?: number };

const FALLBACK: Record<Tone, string> = { ink: '#1c1a17', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };

// Font sizes in CSS pixels, wide and tall.
const SIZES: Record<Kind, readonly [number, number]> = { tag: [11, 10], note: [16, 13], number: [13, 11], count: [24, 18] };

const FACES: Record<Kind, string> = {
  tag: '"Special Elite", monospace',
  note: 'italic {size}px Alegreya, Georgia, serif',
  number: '"Special Elite", monospace',
  count: '{size}px Alegreya, Georgia, serif',
};

// The cost chart's plot area, in shares of the panel; multipliers run from ×1 at the foot to ×2.25 at the top.
const PLOT = { u: 0.15, v: 0.13, w: 0.8, h: 0.68 } as const;

const TOP_MULTIPLIER = 2.25;

const BAR_TOP = 84;

// The tree of choices, in shares of the panel: its span across, and the height of each row
// (the start, then switches 1 to 4), wide and tall.
const TREE = { left: 0.14, width: 0.7 } as const;

const TREE_ROWS_V: Record<Layout, readonly number[]> = { wide: [0.1, 0.27, 0.44, 0.61, 0.78], tall: [0.07, 0.24, 0.41, 0.58, 0.75] };

const TALLY_V: Record<Layout, number> = { wide: 0.92, tall: 0.93 };

// The dial and the plot of the bent count share one track, from T = 0 to 3.3.
const TRACK = { from: 0.14, to: 0.94, v: 0.86, last: 3.3 } as const;

const CURVE_LOW = 600;

const CURVE_HIGH = 1000;

const COUNTING = [[91600, 92500], [93100, 94000], [94600, 95300]] as const;

const ASSIGNED = [0, 1, 2] as const;

// The claimed curve's fall from ×2 toward ×1, with t running 0 to 1 past the bend (schematic).
function descentAt(t: number): number {
  return 2 - 0.94 * (3 * t * t - 2 * t * t * t);
}

function reach(level: number): number {
  let low = 0;
  let high = 1;

  for (let step = 0; step < 30; step += 1) {
    const middle = (low + high) / 2;

    if (descentAt(middle) > level) low = middle;
    else high = middle;
  }

  return (low + high) / 2;
}

class Pen {
  width = 1;
  height = 1;
  ratio = 1;
  tall = false;
  colors: Record<Tone, string> = { ...FALLBACK };

  constructor(private readonly context: CanvasRenderingContext2D) {}

  stroke(points: readonly Point[], tone: Tone, alpha: number, width = 1, dash: readonly number[] = []): void {
    if (alpha <= 0.003 || points.length < 2) return;

    const context = this.context;
    context.beginPath();

    for (const [index, [x, y]] of points.entries()) {
      if (index === 0) context.moveTo(x * this.width, y * this.height);
      else context.lineTo(x * this.width, y * this.height);
    }

    context.setLineDash(dash);
    context.globalAlpha = alpha;
    context.strokeStyle = this.colors[tone];
    context.lineWidth = width;
    context.stroke();
    context.setLineDash([]);
    context.globalAlpha = 1;
  }

  hairline(points: readonly Point[], tone: Tone, alpha: number): void {
    this.stroke(points, tone, alpha, Math.min(1, 1 / this.ratio));
  }

  disc(center: Point, radius: number, tone: Tone, alpha: number, hollow = false): void {
    if (alpha <= 0.003 || radius <= 0) return;

    const context = this.context;
    context.globalAlpha = alpha;
    context.beginPath();
    context.arc(center[0] * this.width, center[1] * this.height, radius, 0, 2 * Math.PI);
    context.fillStyle = hollow ? this.colors.paper : this.colors[tone];
    context.fill();

    if (hollow) {
      context.strokeStyle = this.colors[tone];
      context.lineWidth = 1.5;
      context.stroke();
    }

    context.globalAlpha = 1;
  }

  square(center: Point, half: number, tone: Tone, alpha: number): void {
    if (alpha <= 0.003) return;

    const context = this.context;
    context.globalAlpha = alpha;
    context.fillStyle = this.colors[tone];
    context.fillRect(center[0] * this.width - half, center[1] * this.height - half, 2 * half, 2 * half);
    context.globalAlpha = 1;
  }

  // A rectangle given in pixels, filled with paper so it reads over lines behind it.
  frame(left: number, top: number, width: number, height: number, tone: Tone, alpha: number, fill = true): void {
    if (alpha <= 0.003) return;

    const context = this.context;
    context.globalAlpha = alpha;

    if (fill) {
      context.fillStyle = this.colors.paper;
      context.fillRect(left, top, width, height);
    }

    context.strokeStyle = this.colors[tone];
    context.lineWidth = 1;
    context.strokeRect(Math.round(left) + 0.5, Math.round(top) + 0.5, Math.round(width), Math.round(height));
    context.globalAlpha = 1;
  }

  cased(left: number, top: number, right: number, bottom: number, tone: Tone, alpha: number): void {
    const x0 = left * this.width;
    const x1 = right * this.width;
    const y0 = top * this.height;
    const y1 = bottom * this.height;
    const over = 4;
    const rules: [number, number, number, number][] = [
      [x0 - over, y0, x1 + over, y0],
      [x0 - over, y1, x1 + over, y1],
      [x0, y0 - over, x0, y1 + over],
      [x1, y0 - over, x1, y1 + over],
    ];

    for (const [ax, ay, bx, by] of rules) {
      this.stroke([[ax / this.width, ay / this.height], [bx / this.width, by / this.height]], tone, alpha, 1);
    }
  }

  hatch(left: number, top: number, right: number, bottom: number, tone: Tone, alpha: number): void {
    if (alpha <= 0.003 || right <= left || bottom <= top) return;

    const context = this.context;
    const x0 = left * this.width;
    const x1 = right * this.width;
    const y0 = top * this.height;
    const y1 = bottom * this.height;
    const gap = 6;
    context.beginPath();

    // Each line x + y = start is cut to the rectangle by its ends, not by a clip, which is slow to draw on phones.
    for (let start = Math.floor((x0 + y0) / gap) * gap; start < x1 + y1; start += gap) {
      const from = Math.max(y0, start - x1);
      const to = Math.min(y1, start - x0);

      if (to <= from) continue;

      context.moveTo(start - from, from);
      context.lineTo(start - to, to);
    }

    context.globalAlpha = alpha;
    context.strokeStyle = this.colors[tone];
    context.lineWidth = Math.min(1, 1 / this.ratio);
    context.stroke();
    context.globalAlpha = 1;
  }

  // A filled arrowhead with its tip at the point, pointing along the angle (radians, screen axes).
  head(tip: Point, angle: number, tone: Tone, alpha: number, size = 8): void {
    if (alpha <= 0.003) return;

    const context = this.context;
    const x = tip[0] * this.width;
    const y = tip[1] * this.height;
    context.globalAlpha = alpha;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x - size * Math.cos(angle - 0.42), y - size * Math.sin(angle - 0.42));
    context.lineTo(x - size * Math.cos(angle + 0.42), y - size * Math.sin(angle + 0.42));
    context.closePath();
    context.fillStyle = this.colors[tone];
    context.fill();
    context.globalAlpha = 1;
  }

  mark(center: Point, size: number, good: boolean, alpha: number): void {
    const dx = size / this.width;
    const dy = size / this.height;
    const [x, y] = center;

    if (good) {
      this.stroke([[x - dx, y], [x - dx * 0.25, y + dy * 0.75], [x + dx, y - dy * 0.9]], 'blue', alpha, 1.8);
    } else {
      this.stroke([[x - dx * 0.8, y - dy * 0.8], [x + dx * 0.8, y + dy * 0.8]], 'ink', alpha, 1.6);
      this.stroke([[x - dx * 0.8, y + dy * 0.8], [x + dx * 0.8, y - dy * 0.8]], 'ink', alpha, 1.6);
    }
  }

  font(kind: Kind, size?: number): number {
    const pixels = size ?? SIZES[kind][this.tall ? 1 : 0];
    const face = FACES[kind];
    this.context.font = face.includes('{size}') ? face.replace('{size}', String(pixels)) : `${pixels}px ${face}`;

    return pixels;
  }

  measure(text: string, kind: Kind, size?: number): number {
    this.font(kind, size);

    return this.context.measureText(text).width / this.width;
  }

  // Writes text on a patch of paper, kept inside the frame; returns its width as a share of the frame.
  write(text: string, at: Point, options: Writing = {}): number {
    const { kind = 'note', tone = 'ink', alpha = 1, align = 'center', patch = true, size } = options;

    if (alpha <= 0.003) return 0;

    const context = this.context;
    const pixels = this.font(kind, size);
    context.textBaseline = 'middle';
    context.textAlign = 'left';
    context.globalAlpha = alpha;
    const lines = text.split('\n');
    let widest = 0;

    for (const [row, line] of lines.entries()) {
      const width = context.measureText(line).width;
      const anchor = at[0] * this.width;
      const wanted = align === 'left' ? anchor : align === 'right' ? anchor - width : anchor - width / 2;
      const left = Math.min(this.width - width - 6, Math.max(6, wanted));
      const middle = at[1] * this.height + (row - (lines.length - 1) / 2) * pixels * 1.25;
      widest = Math.max(widest, width);

      if (patch) {
        context.fillStyle = this.colors.paper;
        context.fillRect(left - 3, middle - pixels * 0.62, width + 6, pixels * 1.24);
      }

      context.fillStyle = this.colors[tone];
      context.fillText(line, left, middle + (kind === 'tag' || kind === 'number' ? 1 : 0));
    }

    context.globalAlpha = 1;

    return widest / this.width;
  }
}

export class SwitchFilm {
  private readonly pen: Pen;
  private readonly shown = new Set<string>();
  private readonly styled = new Map<string, string>();
  private readonly sizes = new Map<string, { width: number; height: number }>();
  private readonly context: CanvasRenderingContext2D;
  private layout: Layout = 'wide';
  private board: Box = boxesFor('wide').board;
  private panel: Box = boxesFor('wide').panel;
  private radius = 8;
  private time = 0;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly labels: ReadonlyMap<string, HTMLElement>) {
    const context = canvas.getContext('2d');

    if (!context) throw new Error('The 378 film needs a 2D canvas.');

    this.context = context;
    this.pen = new Pen(context);
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const style = getComputedStyle(this.canvas);
    const pen = this.pen;
    pen.width = Math.max(1, rect.width);
    pen.height = Math.max(1, rect.height);
    pen.ratio = window.devicePixelRatio || 1;
    this.layout = pen.width >= pen.height ? 'wide' : 'tall';
    pen.tall = this.layout === 'tall';
    ({ board: this.board, panel: this.panel } = boxesFor(this.layout));
    this.canvas.width = Math.round(pen.width * pen.ratio);
    this.canvas.height = Math.round(pen.height * pen.ratio);

    for (const tone of ['ink', 'blue', 'muted', 'paper'] as const) {
      pen.colors[tone] = style.getPropertyValue(`--${tone}`).trim() || FALLBACK[tone];
    }

    this.sizes.clear();
  }

  draw(time: number): void {
    this.time = time;
    this.shown.clear();
    const context = this.context;
    context.setTransform(this.pen.ratio, 0, 0, this.pen.ratio, 0, 0);
    context.clearRect(0, 0, this.pen.width, this.pen.height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    this.drawOpening();
    this.drawGroups();
    this.drawPins();
    this.drawTree();
    this.drawChart();
    this.drawProof();

    for (const [id, element] of this.labels) {
      if (!this.shown.has(id) && this.styled.get(id) !== 'hidden') {
        element.style.visibility = 'hidden';
        element.style.opacity = '0';
        this.styled.set(id, 'hidden');
      }
    }
  }

  private get tall(): boolean {
    return this.layout === 'tall';
  }

  private onBoard(u: number, v: number): Point {
    return [this.board.x + u * this.board.w, this.board.y + v * this.board.h];
  }

  private onPanel(u: number, v: number): Point {
    return [this.panel.x + u * this.panel.w, this.panel.y + v * this.panel.h];
  }

  // A point on the cost chart: u across the plot, m the multiplier per switch.
  private onChart(u: number, m: number): Point {
    return this.onPanel(PLOT.u + u * PLOT.w, PLOT.v + PLOT.h * (1 - (m - 1) / (TOP_MULTIPLIER - 1)));
  }

  private onBars(u: number, count: number): Point {
    return this.onPanel(PLOT.u + u * PLOT.w, PLOT.v + PLOT.h * (1 - count / BAR_TOP));
  }

  // Moves a point by whole pixels.
  private nudge(point: Point, dx: number, dy: number): Point {
    return [point[0] + dx / this.pen.width, point[1] + dy / this.pen.height];
  }

  // A formula's box in CSS pixels, measured once per size of the frame.
  private sizeOf(id: string): { width: number; height: number } {
    let size = this.sizes.get(id);

    if (!size) {
      const rect = this.labels.get(id)?.firstElementChild?.getBoundingClientRect();
      size = { width: rect?.width ?? 0, height: rect?.height ?? 0 };
      this.sizes.set(id, size);
    }

    return size;
  }

  // Half a formula's width, as a share of the frame.
  private halfOf(id: string): number {
    return this.sizeOf(id).width / 2 / this.pen.width;
  }

  private place(id: string, at: Point, alpha: number): void {
    const element = this.labels.get(id);

    if (!element || alpha <= 0.004) return;

    const size = this.sizeOf(id);
    const { width, height } = this.pen;
    const x = Math.min(width - size.width / 2 - 6, Math.max(size.width / 2 + 6, at[0] * width));
    const y = Math.min(height - size.height / 2 - 3, Math.max(size.height / 2 + 3, at[1] * height));
    const transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    const opacity = alpha.toFixed(3);
    this.shown.add(id);

    if (this.styled.get(id) === `${transform} ${opacity}`) return;

    element.style.transform = transform;
    element.style.opacity = opacity;
    element.style.visibility = 'visible';
    this.styled.set(id, `${transform} ${opacity}`);
  }

  private isOn(index: number): boolean {
    if (walkAt(this.time) >= 0) return index < 3 && walkedOn(this.time, index);

    for (const [from, to] of COUNTING) {
      if (this.time >= from && this.time < to) {
        // The groups run through their own settings at once; the order is schematic.
        const group = Math.floor(index / GROUP_SIZE);
        const step = Math.floor((this.time - from) / 60);

        return settingOf((step + group * 5) % 16, GROUP_SIZE)[index % GROUP_SIZE] ?? false;
      }
    }

    return false;
  }

  private pinAt(index: number): Point {
    const { u, v } = pinPlace(this.time, index);

    return this.onBoard(u, v);
  }

  private groupCentre(group: number): number {
    return 0.06 + (GROUP_SIZE * group + 1.5 + 1.2 * group) * GROUP_STEP;
  }

  private drawPins(): void {
    const time = this.time;
    const regroup = ease(time, REGROUP.from, REGROUP.to);
    const spacing = between(0.15, GROUP_STEP, regroup) * this.board.w * this.pen.width;
    this.radius = Math.min(10, Math.max(5, spacing * 0.34));

    for (let index = 0; index < SWITCHES; index += 1) {
      const arrived = arrivalOf(time, index);

      if (arrived <= 0) continue;

      const at = this.pinAt(index);
      const on = this.isOn(index);
      this.pen.disc(at, this.radius * between(0.3, 1, arrived), on ? 'blue' : 'ink', arrived, !on);

      if (this.radius >= 7) {
        this.pen.write(String(index + 1), at, { kind: 'number', tone: on ? 'paper' : 'ink', alpha: arrived, patch: false, size: Math.round(this.radius * 1.05) });
      }
    }
  }

  private drawOpening(): void {
    const time = this.time;
    const leave = 1 - ease(time, 69000, 70000);

    if (leave <= 0) return;

    const tall = this.tall;
    const symbols = presence(time, 24400, 25300) * leave;
    const [centre, formulaY] = this.onBoard(0.5, 0.05);

    if (tall) {
      const note = 'IN SYMBOLS';
      const noteWidth = this.pen.measure(note, 'tag');
      const gap = 10 / this.pen.width;
      const formulaWidth = 2 * this.halfOf('formula');
      const fits = noteWidth + gap + formulaWidth <= 1 - 16 / this.pen.width;
      const left = fits ? centre - (noteWidth + gap + formulaWidth) / 2 : centre - formulaWidth / 2;

      if (fits) this.pen.write(note, [left, formulaY], { kind: 'tag', tone: 'muted', alpha: symbols, align: 'left' });

      this.place('formula', [fits ? left + noteWidth + gap + formulaWidth / 2 : centre, formulaY], symbols);
    } else {
      this.place('formula', [centre, formulaY], symbols);
      this.pen.write('THE TWO RULES IN SYMBOLS', this.nudge([centre, formulaY], 0, 20), { kind: 'tag', tone: 'muted', alpha: symbols });
    }
    this.pen.write(tall ? '3-SAT: RULES OF THREE SWITCHES' : 'THIS IS 3-SAT: EVERY RULE NAMES THREE SWITCHES', this.onBoard(0.5, 0.9), { kind: 'tag', tone: 'blue', alpha: presence(time, 24400, 25300) * leave });
    const leaf = walkAt(time);
    const reached = leaf >= 0 && time >= (WALKS[leaf]?.end ?? Infinity);
    const broken = reached ? LEDGER[leaf]?.broken ?? -1 : -1;
    const rules = [
      { text: 'RULE 1: AT LEAST ONE ON', v: 0.28, appear: 1500, side: -1 },
      { text: 'RULE 2: AT LEAST ONE OFF', v: 0.72, appear: 3600, side: 1 },
    ] as const;

    for (const [index, rule] of rules.entries()) {
      const alpha = ease(time, rule.appear, rule.appear + 800) * leave;

      if (alpha <= 0) continue;

      const at = this.onBoard(0.5, rule.v);
      const struck = broken === index;
      const half = this.pen.measure(rule.text, 'tag') / 2;
      const edge = this.nudge(at, 0, -rule.side * 11);
      const tie = ease(time, rule.appear + 700, rule.appear + 1700);

      for (let pin = 0; pin < 3; pin += 1) {
        const target = this.nudge(this.pinAt(pin), 0, rule.side * this.radius);
        this.pen.stroke([edge, [between(edge[0], target[0], tie), between(edge[1], target[1], tie)]], struck ? 'blue' : 'ink', alpha * 0.75, 1);
      }

      this.pen.write(rule.text, at, { kind: 'tag', tone: struck ? 'blue' : 'ink', alpha });
      this.pen.cased(at[0] - half - 6 / this.pen.width, at[1] - 10 / this.pen.height, at[0] + half + 6 / this.pen.width, at[1] + 10 / this.pen.height, struck ? 'blue' : 'ink', alpha);

      if (struck) this.pen.stroke([[at[0] - half - 2 / this.pen.width, at[1]], [at[0] + half + 2 / this.pen.width, at[1]]], 'blue', alpha, 1.8);
    }

    const key = presence(time, 800, 1800, 23600, 24300);
    const keyY = 0.9;
    this.pen.disc(this.onBoard(0.36, keyY), 5, 'blue', key);
    this.pen.write('ON', this.nudge(this.onBoard(0.36, keyY), 10, 0), { kind: 'tag', alpha: key, align: 'left' });
    this.pen.disc(this.onBoard(0.6, keyY), 5, 'ink', key, true);
    this.pen.write('OFF', this.nudge(this.onBoard(0.6, keyY), 10, 0), { kind: 'tag', alpha: key, align: 'left' });
  }

  private drawGroups(): void {
    const time = this.time;

    if (time < REGROUP.from) return;

    const tall = this.tall;
    const radius = this.radius;
    const step = GROUP_STEP;
    const cases = ease(time, 72400, 73400);

    this.pen.write(tall ? '3 GROUPS OF 4 · RULES INSIDE' : 'THREE GROUPS OF FOUR · EVERY RULE INSIDE ONE GROUP', this.onBoard(0.5, 0.03), { kind: 'tag', alpha: presence(time, 72600, 73400, 77800, 78400) });
    this.pen.write('RULES THAT CROSS GROUPS', this.onBoard(0.5, 0.03), { kind: 'tag', tone: 'blue', alpha: presence(time, 78600, 79400, 86500, 87200) });

    for (let group = 0; group < 3; group += 1) {
      const centre = this.groupCentre(group);
      const left = centre - 1.5 * step - 0.55 * step;
      const right = centre + 1.5 * step + 0.55 * step;
      this.pen.cased(this.board.x + left * this.board.w, this.onBoard(0, 0.41)[1], this.board.x + right * this.board.w, this.onBoard(0, 0.86)[1], 'muted', cases);

      const knots = ease(time, 73400 + group * 400, 74400 + group * 400);

      for (const [index, rule] of (GROUP_RULES[group] ?? []).entries()) {
        const knot = this.onBoard(centre + (index - 1) * step * 1.15, 0.76);

        for (const literal of rule) {
          const target = this.nudge(this.pinAt(Math.abs(literal) - 1), 0, radius);
          this.pen.stroke([knot, [between(knot[0], target[0], knots), between(knot[1], target[1], knots)]], 'ink', knots * 0.7, 1);
        }

        this.pen.square(knot, 3, 'ink', knots);
      }

      const count = GROUP_COUNTS[group] ?? 0;
      this.pen.write(tall ? `${count}/16` : `${count} OF 16`, this.onBoard(centre, 0.93), { kind: 'tag', alpha: presence(time, 75400, 76200, 80400, 81200) });
    }

    this.drawCrossing();
  }

  private boxOf(group: number): { centre: Point; half: number; top: number; bottom: number } {
    const centre = this.onBoard(this.groupCentre(group) + 0.85 * GROUP_STEP, 0.2);
    const half = 0.7 * GROUP_STEP * this.board.w;

    return { centre, half, top: centre[1] - 0.035 * this.board.h, bottom: centre[1] + 0.035 * this.board.h };
  }

  private drawCrossing(): void {
    const time = this.time;
    const appear = ease(time, 78300, 79300);

    if (appear <= 0) return;

    const tall = this.tall;
    const boxes = ease(time, 87800, 88800);
    const reroute = ease(time, 88800, 90800);
    const fixed = ease(time, 90800, 91600);

    for (let group = 0; group < 3; group += 1) {
      const box = this.boxOf(group);

      for (let index = group * GROUP_SIZE; index < (group + 1) * GROUP_SIZE; index += 1) {
        this.pen.hairline([[box.centre[0], box.bottom], this.nudge(this.pinAt(index), 0, -this.radius)], 'muted', boxes * 0.8);
      }

      const left = (box.centre[0] - box.half) * this.pen.width;
      const top = box.top * this.pen.height;
      const width = 2 * box.half * this.pen.width;
      const height = (box.bottom - box.top) * this.pen.height;
      this.pen.frame(left, top, width, height, fixed > 0.5 ? 'blue' : 'ink', boxes);
      this.pen.hatch(box.centre[0] - box.half, box.top, box.centre[0] + box.half, box.bottom, 'blue', boxes * fixed * 0.9);

      for (const rule of [0.36, 0.64]) {
        const y = between(box.top, box.bottom, rule);
        this.pen.hairline([[box.centre[0] - box.half * 0.6, y], [box.centre[0] + box.half * 0.6, y]], 'ink', boxes * (1 - fixed));
      }
    }

    for (const [index, rule] of CROSSING_RULES.entries()) {
      const home = ASSIGNED[index] ?? 0;
      const knot = this.onBoard(this.groupCentre(home) - 0.95 * GROUP_STEP, 0.2);

      for (const literal of rule) {
        const pin = Math.abs(literal) - 1;
        const group = Math.floor(pin / GROUP_SIZE);
        const target = this.nudge(this.pinAt(pin), 0, -this.radius);
        const draw = ease(time, 78300 + index * 300, 79500 + index * 300);

        if (group === home || reroute <= 0) {
          const end: Point = [between(knot[0], target[0], draw), between(knot[1], target[1], draw)];
          this.pen.stroke([knot, end], 'blue', appear * (group === home ? 1 : 1 - reroute), 1.3, group === home ? [] : [4, 3]);

          if (group === home) continue;
        }

        const box = this.boxOf(group);
        const side = group > home ? 1 : -1;
        const landing: Point = [box.centre[0] - side * box.half * 0.4, box.top];
        const end: Point = [between(target[0], landing[0], reroute), between(target[1], landing[1], reroute)];
        const lift = between(0, 0.06 + 0.035 * Math.abs(group - home), reroute) * this.board.h;
        const control: Point = [(knot[0] + end[0]) / 2, Math.min(knot[1], end[1]) - lift];
        const points: Point[] = [];

        for (let sample = 0; sample <= 24; sample += 1) {
          const s = sample / 24;
          points.push([
            (1 - s) ** 2 * knot[0] + 2 * (1 - s) * s * control[0] + s * s * end[0],
            (1 - s) ** 2 * knot[1] + 2 * (1 - s) * s * control[1] + s * s * end[1],
          ]);
        }

        this.pen.stroke(points, 'blue', appear * reroute, 1.3, [4, 3]);
      }

      this.pen.square(knot, 3.5, 'blue', appear);
    }

    const note = tall ? 'SHARED SUMMARIES · SCHEMATIC' : 'SHARED SUMMARIES (THE PAPER\'S MEASUREMENTS) · SCHEMATIC';
    this.pen.write(note, this.onBoard(0.5, 0.965), { kind: 'tag', alpha: presence(time, 88000, 88800, 90800, 91400) });
    this.pen.write(tall ? 'SUMMARIES FIXED · GROUPS COUNTED ALONE' : 'SUMMARIES FIXED · EACH GROUP COUNTED ALONE · SCHEMATIC', this.onBoard(0.5, 0.965), { kind: 'tag', tone: 'blue', alpha: ease(time, 91400, 92000) });
  }

  // A node of the tree of choices: row 0 is the start, and row r has 2^r nodes, left to right.
  private nodeAt(row: number, index: number): Point {
    return this.onPanel(TREE.left + ((index + 0.5) / 2 ** row) * TREE.width, TREE_ROWS_V[this.layout][row] ?? 0);
  }

  private drawTree(): void {
    const time = this.time;

    if (time < 7000 || time > 19400) return;

    const tall = this.tall;
    const rowsV = TREE_ROWS_V[this.layout];
    const fade = 1 - ease(time, 17800, 18400);
    const begun = ease(time, 7000, 7600) * fade;
    const root = this.nodeAt(0, 0);
    this.pen.write('START', this.nudge(root, 9, 0), { kind: 'tag', tone: 'muted', alpha: begun, align: 'left' });
    this.pen.write('WAYS', this.onPanel(0.98, rowsV[0] ?? 0), { kind: 'tag', tone: 'muted', alpha: begun, align: 'right' });

    for (const [index, start] of TREE_ROWS.entries()) {
      const row = index + 1;
      const grow = ease(time, start, start + 800);

      if (grow <= 0) continue;

      for (let node = 0; node < 2 ** row; node += 1) {
        const parent = this.nodeAt(row - 1, node >> 1);
        const child = this.nodeAt(row, node);
        this.pen.stroke([parent, [between(parent[0], child[0], grow), between(parent[1], child[1], grow)]], 'ink', fade * 0.7, row === 4 ? 0.7 : 1);
      }

      const labels = ease(time, start + 300, start + 800) * fade;
      const rowV = rowsV[row] ?? 0;
      const pin = this.onPanel(0.04, rowV);
      const pinRadius = tall ? 8 : 9;
      this.pen.disc(pin, pinRadius, 'ink', labels, true);
      this.pen.write(String(row), pin, { kind: 'number', alpha: labels, patch: false, size: pinRadius });
      this.pen.write(String(2 ** row), this.onPanel(0.98, rowV), { kind: 'number', alpha: labels, align: 'right' });

      if (row > 1) this.pen.write('×2', this.onPanel(0.98, ((rowsV[row - 1] ?? 0) + rowV) / 2), { kind: 'number', tone: 'blue', alpha: labels, align: 'right' });
    }

    const sides = ease(time, 7900, 8500) * fade;
    this.pen.write('OFF', this.nudge(this.nodeAt(1, 0), -12, 0), { kind: 'tag', alpha: sides, align: 'right' });
    this.pen.write('ON', this.nudge(this.nodeAt(1, 1), 12, 0), { kind: 'tag', tone: 'blue', alpha: sides, align: 'left' });

    this.drawWalk();
    this.pen.disc(root, 3.5, 'ink', begun, true);

    for (const [index, start] of TREE_ROWS.entries()) {
      const row = index + 1;
      const shown = ease(time, start + 500, start + 800);
      const radius = row === 4 ? (tall ? 2.5 : 3.5) : tall ? 3.5 : 4.5;

      for (let node = 0; node < 2 ** row; node += 1) {
        const child = this.nodeAt(row, node);
        const on = node % 2 === 1;

        if (row < 3) {
          this.pen.disc(child, radius, on ? 'blue' : 'ink', shown * fade, !on);
          continue;
        }

        const leave = 18000 + node * (row === 3 ? 70 : 35);
        const fly = ease(time, leave, leave + 650);
        const cell = this.cellOf(row, node);
        const at: Point = [between(child[0], cell[0], fly), between(child[1], cell[1], fly)];
        this.pen.disc(at, radius * (1 - 0.5 * fly), on ? 'blue' : 'ink', shown * (1 - ease(time, leave + 450, leave + 650)), !on);
      }
    }

    const kept = 1 - ease(time, 16000, 16500);

    for (const [leaf, entry] of LEDGER.entries()) {
      const end = this.nodeAt(3, leaf);
      const arrival = WALKS[leaf]?.end ?? Infinity;
      this.pen.mark(this.nudge(end, 0, tall ? 13 : 16), tall ? 4.5 : 5, entry.broken < 0, ease(time, arrival, arrival + 200) * kept);

      if (entry.broken < 0) continue;

      const left = leaf < LEDGER.length / 2;
      this.pen.write(`BREAKS${tall ? '\n' : ' '}RULE ${entry.broken + 1}`, this.nudge(end, left ? -8 : 8, 32), { kind: 'tag', alpha: ease(time, arrival + 100, arrival + 600) * kept, align: left ? 'left' : 'right' });
    }

    this.pen.write(`${LEDGER.length} SETTINGS · ${OPENING_COUNT} OBEY BOTH RULES`, this.onPanel(0.5, TALLY_V[this.layout]), { kind: 'tag', tone: 'blue', alpha: presence(time, 14600, 15200, 16000, 16500) });
  }

  private drawWalk(): void {
    const leaf = walkAt(this.time);

    if (leaf < 0) return;

    const depth = depthOf(this.time, leaf);
    const path = [0, 1, 2, 3].map((row) => this.nodeAt(row, nodeOf(leaf, 3, row)));
    const done = Math.min(3, Math.floor(depth));
    const points = path.slice(0, done + 1);
    const from = path[done];
    const to = path[done + 1];

    if (from && to) {
      const part = depth - done;
      const tip: Point = [between(from[0], to[0], part), between(from[1], to[1], part)];
      points.push(tip);
      this.pen.stroke(points, 'blue', 1, 2.2);
      this.pen.head(tip, Math.atan2((to[1] - from[1]) * this.pen.height, (to[0] - from[0]) * this.pen.width), 'blue', 1, 9);

      return;
    }

    this.pen.stroke(points, 'blue', 1, 2.2);
  }

  private cellOf(n: number, index: number): Point {
    const [x] = this.onBars(this.slot(n), 0);
    const [, y] = this.onBars(0, index + 0.5);

    return [x, y];
  }

  private slot(n: number): number {
    return 0.13 + (n - 3) * 0.25;
  }

  private chartPresence(): number {
    const time = this.time;

    return time < 87000 ? 1 - ease(time, 69000, 70500) : ease(time, 105300, 106500);
  }

  private drawChart(): void {
    const time = this.time;
    const alpha = this.chartPresence();

    if (time < 18000 || alpha <= 0) return;

    const tall = this.tall;
    const axes = ease(time, 18300, 19100) * alpha;
    const multiplier = ease(time, 27000, 27800) * alpha;
    const bottom = this.onChart(0, 1);
    const top = this.onChart(0, TOP_MULTIPLIER);
    const end = this.onChart(1, 1);
    this.pen.stroke([top, [bottom[0], between(top[1], bottom[1], 1)], bottom], 'muted', axes, 1);
    this.pen.stroke([bottom, [between(bottom[0], end[0], ease(time, 18300, 19100)), end[1]]], 'muted', axes, 1);
    this.pen.head(this.nudge(end, 8, 0), 0, 'muted', multiplier, 7);

    const titleAt = this.onPanel(0.02, 0.035);
    const tries = presence(time, 18500, 19300, 26000, 26700) * alpha;
    const titleWidth = this.pen.write('SETTINGS TO TRY', titleAt, { kind: 'tag', alpha: tries, align: 'left' });
    this.pen.write('COST OF ONE MORE SWITCH', titleAt, { kind: 'tag', alpha: multiplier, align: 'left' });
    this.drawBars(alpha, titleAt, titleWidth);

    if (time < 26000) return;

    this.pen.write('×1', this.nudge(this.onChart(0, 1), -8, 0), { kind: 'number', alpha: multiplier, align: 'right' });
    this.pen.write('×2', this.nudge(this.onChart(0, 2), -8, 0), { kind: 'number', alpha: multiplier, align: 'right' });
    const digits = ease(time, 62400, 63200);
    const axisTitle = this.nudge(this.onChart(1, 1), 0, tall ? 30 : 34);
    this.pen.write('NUMBER OF SWITCHES n', axisTitle, { kind: 'tag', alpha: multiplier * (1 - ease(time, 62000, 62400)), align: 'right' });
    this.pen.write('n, COUNTED IN DIGITS', axisTitle, { kind: 'tag', alpha: multiplier * digits, align: 'right' });

    // Exhaustive search: a flat line at ×2.
    const reveal = ease(time, 28000, 30000);
    this.pen.stroke([this.onChart(0, 2), this.onChart(reveal, 2)], 'ink', alpha, 1.6);
    this.pen.write('TRY EVERY SETTING', this.nudge(this.onChart(0.02, 2), 0, -12), { kind: 'tag', alpha: ease(time, 29500, 30500) * alpha, align: 'left' });

    this.drawBetter(alpha);
    this.drawFloor(alpha);
    this.drawClaim(alpha, digits);
    this.drawStrands(alpha);
  }

  private drawBars(alpha: number, titleAt: Point, titleWidth: number): void {
    const time = this.time;
    const bars = (1 - ease(time, 25000, 26500)) * alpha;
    const toLine = ease(time, 26000, 28000);
    const tall = this.tall;
    const perSetting = PLOT.h * this.panel.h * this.pen.height / BAR_TOP;
    const barHalf = 0.065;
    let previousTop: Point | undefined;

    for (let n = 3; n <= 6; n += 1) {
      const value = 2 ** n;
      const grow = n <= 4 ? ease(time, 18900, 19500) : ease(time, (ADDED[n - 1] ?? 0) + 300, (ADDED[n - 1] ?? 0) + 1100);

      if (grow <= 0) continue;

      const u = this.slot(n);
      const [left] = this.onBars(u - barHalf, 0);
      const [right, base] = this.onBars(u + barHalf, 0);
      const [, topY] = this.onBars(u, value * grow);
      this.pen.stroke([[left, base], [left, topY], [right, topY], [right, base]], 'ink', bars, 1);

      if (perSetting >= 3.5) {
        for (let cell = 1; cell < value * grow; cell += 1) {
          const [, y] = this.onBars(u, cell);
          this.pen.hairline([[left, y], [right, y]], 'muted', bars * 0.8);
        }
      } else {
        this.pen.hatch(left, topY, right, base, 'muted', bars * 0.8);
      }

      this.pen.write(String(value), this.nudge([(left + right) / 2, topY], 0, -10), { kind: 'number', alpha: bars * grow });
      this.pen.write(String(n), this.nudge([(left + right) / 2, base], 0, tall ? 11 : 13), { kind: 'number', tone: 'muted', alpha: bars * grow });
      const topPoint: Point = [(left + right) / 2, topY];

      if (previousTop && n > 3) {
        const apexU = (this.slot(n - 1) + this.slot(n)) / 2;
        const control: Point = [(previousTop[0] + topPoint[0]) / 2, Math.min(previousTop[1], topPoint[1]) - (tall ? 30 : 38) / this.pen.height];
        const points: Point[] = [];
        const clear = 24 / this.pen.height;

        for (let sample = 0; sample <= 16; sample += 1) {
          const s = sample / 16;
          points.push([
            (1 - s) ** 2 * previousTop[0] + 2 * (1 - s) * s * control[0] + s * s * topPoint[0],
            (1 - s) ** 2 * (previousTop[1] - clear) + 2 * (1 - s) * s * control[1] + s * s * (topPoint[1] - clear),
          ]);
        }

        this.pen.stroke(points, 'blue', bars * grow, 1.2);
        this.pen.head(points[points.length - 1] ?? topPoint, Math.PI / 2.4, 'blue', bars * grow, 6);
        const from: Point = [control[0], control[1] + 4 / this.pen.height];
        const to = this.nudge(this.onChart(apexU, 2), 0, -12);
        const at: Point = [between(from[0], to[0], toLine), between(from[1], to[1], toLine)];
        const carried = grow * alpha * (1 - ease(time, 29500, 30500));
        this.pen.write('×2', at, { kind: 'number', tone: 'blue', alpha: carried });
        this.pen.disc(this.onChart(apexU, 2), 3.2, 'blue', carried * ease(time, 27900, 28400));
      }

      previousTop = topPoint;
    }

    const half = this.halfOf('power');
    const moved = ease(time, 26000, 27000);
    const near: Point = [titleAt[0] + titleWidth + half + 10 / this.pen.width, titleAt[1]];
    const far = this.nudge(this.onChart(1, 2), 0, -14);
    const kept = presence(time, 18800, 19600, 63600, 64600);
    this.place('power', [between(near[0], far[0] - half, moved), between(near[1], far[1], moved)], kept * alpha);
  }

  private drawBetter(alpha: number): void {
    const time = this.time;
    const tall = this.tall;

    for (const [index, method] of BETTER_METHODS.entries()) {
      const start = 34000 + index * 1400;
      const reveal = ease(time, start, start + 1200);
      this.pen.stroke([this.onChart(0, method.multiplier), this.onChart(reveal, method.multiplier)], 'ink', alpha * (reveal > 0 ? 1 : 0), 1);
      const line = this.nudge(this.onChart(1, 4 / 3), 0, -(tall ? 18 : 22) - (2 - index) * (tall ? 13 : 15));
      this.pen.write(`${method.name}  ${method.shown}`, line, { kind: 'tag', alpha: alpha * presence(time, start + 300, start + 1000, 42000, 43000), align: 'right' });
    }

    this.place('better', this.nudge(this.onChart(0.16, 4 / 3), 0, tall ? -16 : -18), alpha * ease(time, 38000, 39000));
  }

  // The hypothesis: a floor of unknown height above ×1 that no method gets under.
  private drawFloor(alpha: number): void {
    const time = this.time;
    const shown = ease(time, 43000, 43600) * alpha;

    if (shown <= 0) return;

    const tall = this.tall;
    const reveal = ease(time, 43000, 45500);
    const height = 1.12;
    const [left, top] = this.onChart(0, height);
    const [right, bottom] = this.onChart(reveal, 1);
    this.pen.hatch(left, top, right, bottom, 'ink', shown * 0.75);
    this.pen.stroke([[left, top], [right, top]], 'ink', shown, 1, [5, 4]);
    this.pen.write(tall ? 'NO METHOD GETS IN HERE' : 'THE HYPOTHESIS: NO METHOD GETS IN HERE', this.onChart(0.42, (1 + height) / 2), { kind: 'tag', alpha: alpha * ease(time, 45000, 46000) });
    this.pen.write('HEIGHT NOT KNOWN', this.nudge(this.onChart(1, height), 0, -9), { kind: 'tag', tone: 'muted', alpha: alpha * presence(time, 45600, 46400, 50800, 51600), align: 'right' });
  }

  // The claimed curve: on ×2 until the threshold, then bending down toward ×1 (schematic).
  private claimed(u: number, bend: number): number {
    return u <= bend ? 2 : descentAt((u - bend) / (1 - bend));
  }

  private drawClaim(alpha: number, digits: number): void {
    const time = this.time;
    const tall = this.tall;
    const reveal = ease(time, 52000, 56000);

    if (reveal <= 0) return;

    const bend = bendAt(time);
    const points: Point[] = [];

    for (let sample = 0; sample <= 160; sample += 1) {
      const u = (sample / 160) * reveal;
      points.push(this.onChart(u, this.claimed(u, bend)));
    }

    this.pen.stroke(points, 'blue', alpha, 2.2);
    const level = tall ? 1.7 : 1.68;
    const [descentX, levelY] = this.onChart(bend + reach(level) * (1 - bend), level);
    const [bendX] = this.onChart(bend, level);
    const anchor = this.nudge([between(descentX, bendX, ease(time, 60300, 62600)), levelY], -12, 0);
    const claim = alpha * presence(time, 55000, 56000, 69000, 69800);
    this.pen.write(tall ? 'CLAIMED · OPENAI' : 'CLAIMED · OPENAI, 25 OCT 2026', anchor, { kind: 'tag', tone: 'blue', alpha: claim, align: 'right' });
    this.pen.write(tall ? 'SCHEMATIC' : 'SCHEMATIC: CONSTANTS NOT STATED', this.nudge(anchor, 0, tall ? -15 : -16), { kind: 'tag', tone: 'muted', alpha: claim * ease(time, 63600, 64400), align: 'right' });

    if (digits <= 0) return;

    // The axis counts n by its digits; it breaks before the threshold, which has about 3.3 billion of them.
    const shown = digits * alpha;
    const [, axisY] = this.onChart(0, 1);
    const ticks = tall ? ['1', '10', '100'] : ['1', '10', '100', '1,000'];

    for (const [index, name] of ticks.entries()) {
      const u = 0.06 + index * (tall ? 0.19 : 0.16);
      const [x] = this.onChart(u, 1);
      this.pen.hairline([[x, axisY], this.nudge([x, axisY], 0, 5)], 'muted', shown);
      this.pen.write(name, this.nudge([x, axisY], 0, tall ? 12 : 14), { kind: 'number', tone: 'muted', alpha: shown });
    }

    const [breakX] = this.onChart(BREAK_U, 1);
    this.pen.frame(breakX * this.pen.width - 4, axisY * this.pen.height - 2, 8, 4, 'paper', shown);

    for (const offset of [-4, 4]) {
      this.pen.stroke([this.nudge([breakX, axisY], offset - 3, 6), this.nudge([breakX, axisY], offset + 3, -6)], 'muted', shown, 1);
    }

    const [thresholdX] = this.onChart(THRESHOLD_U, 1);
    this.pen.stroke([[thresholdX, axisY], this.nudge([thresholdX, axisY], 0, 6)], 'ink', shown, 1.4);
    this.pen.write('3.3 BILLION', this.nudge([thresholdX, axisY], 0, tall ? 12 : 14), { kind: 'number', alpha: shown });
    const guide = ease(time, 63600, 64600) * alpha;
    this.pen.stroke([[thresholdX, axisY], this.onChart(THRESHOLD_U, 2)], 'muted', guide, 1, [3, 4]);
    this.place('threshold', this.nudge(this.onChart(THRESHOLD_U, 2), 0, -this.sizeOf('threshold').height / 2 - 5), guide);
  }

  // The proof's three costs braid into the claimed curve (schematic).
  private drawStrands(alpha: number): void {
    const time = this.time;
    const grow = ease(time, 106600, 109600);

    if (grow <= 0) return;

    const tall = this.tall;
    const shown = alpha * (1 - ease(time, 111600, 112400) * 0.7);
    const merge = 0.86;
    const target = this.onChart(merge, this.claimed(merge, THRESHOLD_U));
    const names = ['SUMMARIES', 'ONE GROUP', 'SLOPES'];

    for (const [index, name] of names.entries()) {
      const start = this.onChart(0.44, (tall ? [1.92, 1.8, 1.68] : [1.93, 1.77, 1.61])[index] ?? 1.7);
      const points: Point[] = [];

      for (let sample = 0; sample <= 30; sample += 1) {
        const s = (sample / 30) * grow;
        const lift = Math.sin(Math.PI * s) * (index - 1) * 0.012;
        points.push([between(start[0], target[0], s), between(start[1], target[1], s * s * (3 - 2 * s)) + lift]);
      }

      this.pen.stroke(points, 'muted', shown * 0.9, 1);
      const named = presence(time, 106600 + index * 400, 107400 + index * 400, 112000, 112600);
      this.pen.write(name, this.nudge(start, -6, 0), { kind: 'tag', tone: 'muted', alpha: shown * named, align: 'right' });
    }

    const level = 1.85;
    const named = this.onChart(THRESHOLD_U + reach(level) * (1 - THRESHOLD_U), level);
    this.place('subexp', this.nudge(named, this.halfOf('subexp') + (tall ? 6 : 8), 0), alpha * ease(time, 109200, 110200));
    const stamp = ease(time, 112400, 113400) * alpha;
    const at = this.onChart(tall ? 0.39 : 0.42, 1.74);
    const status = tall ? 'CLAIM UNDER REVIEW' : 'CLAIMED · UNDER REVIEW';
    const half = this.pen.measure(status, 'tag') / 2;
    this.pen.write(status, at, { kind: 'tag', tone: 'blue', alpha: stamp });
    this.pen.cased(at[0] - half - 8 / this.pen.width, at[1] - 11 / this.pen.height, at[0] + half + 8 / this.pen.width, at[1] + 11 / this.pen.height, 'blue', stamp);
  }

  private drawProof(): void {
    const time = this.time;

    if (time < 76000 || time > 106500) return;

    const tall = this.tall;
    const words = 1 - ease(time, 95500, 96500);
    const product = presence(time, 76300, 77300) * words;
    const productAt = this.onPanel(0.5, 0.1);
    const total = GROUP_COUNTS.reduce((result, count) => result * count, 1);
    const width = this.pen.write(`${GROUP_COUNTS.join(' × ')} = ${total.toLocaleString('en-US')}`, productAt, { kind: 'count', alpha: product }) * this.pen.width;
    this.pen.write(tall ? 'SETTINGS OBEYING THE NINE RULES' : 'SETTINGS THAT OBEY THE NINE INSIDE RULES', this.onPanel(0.5, 0.19), { kind: 'tag', alpha: product });
    // Once rules cross, the product is struck: it no longer counts the settings.
    const strike = ease(time, 80500, 81300);
    const from = this.nudge(productAt, -width / 2 - 4, 0);
    this.pen.stroke([from, this.nudge(from, (width + 8) * strike, 0)], 'blue', product * (strike > 0 ? 1 : 0), 2);
    this.place('tries', this.onPanel(0.5, 0.3), presence(time, 77000, 77800, 80400, 81200) * words);
    this.pen.write(tall ? 'TRUE COUNT, ALL 12 RULES' : 'THE TRUE COUNT, WITH ALL TWELVE RULES', this.onPanel(0.5, 0.4), { kind: 'tag', tone: 'blue', alpha: presence(time, 81300, 82100) * words });
    this.pen.write(TRUE_COUNT.toLocaleString('en-US'), this.onPanel(0.5, 0.5), { kind: 'count', tone: 'blue', alpha: presence(time, 81500, 82300) * words });

    this.drawDial();
  }

  private trackAt(t: number, v: number = TRACK.v): Point {
    return this.onPanel(TRACK.from + (t / TRACK.last) * (TRACK.to - TRACK.from), v);
  }

  private curveV(value: number): number {
    return 0.82 - ((value - CURVE_LOW) / (CURVE_HIGH - CURVE_LOW)) * 0.68;
  }

  private drawDial(): void {
    const time = this.time;
    const shown = presence(time, 82500, 83500, 104500, 105300);

    if (shown <= 0) return;

    const tall = this.tall;
    const grow = ease(time, 82500, 83800);
    const start = this.trackAt(0);
    const finish = this.trackAt(TRACK.last);
    this.pen.stroke([start, [between(start[0], finish[0], grow), start[1]]], 'ink', shown, 1.4);
    this.pen.head(this.nudge(finish, 8, 0), 0, 'ink', shown * ease(time, 83600, 84000), 7);
    this.place('dial', this.nudge(start, -18, 0), shown);

    for (let t = 0; t <= 3; t += 1) {
      const at = this.trackAt(t);
      this.pen.stroke([this.nudge(at, 0, -4), this.nudge(at, 0, 4)], 'ink', shown * grow, 1);
      this.pen.write(String(t), this.nudge(at, 0, tall ? 13 : 15), { kind: 'number', alpha: shown * grow });
    }

    const knob = presence(time, 82800, 83600, 95500, 96200);
    this.pen.disc(this.trackAt(dialAt(time)), tall ? 6 : 7, 'blue', knob);
    this.place('dial-zero', this.nudge(this.trackAt(0), this.sizeOf('dial-zero').width / 2 - 6, tall ? -20 : -24), presence(time, 83600, 84600, 86500, 87300));
    const stops = presence(time, 87000, 88000, 95500, 96300);
    this.place('dial-stops', this.nudge(this.trackAt(2), 0, tall ? -22 : -26), stops);
    this.pen.stroke([this.nudge(this.trackAt(1), 0, -10), this.nudge(this.trackAt(1), 0, -13), this.nudge(this.trackAt(3), 0, -13), this.nudge(this.trackAt(3), 0, -10)], 'muted', stops, 1);

    const plot = ease(time, 96000, 97200);
    const [axisX, axisBottom] = this.trackAt(0);
    const [, axisTop] = this.onPanel(0, 0.1);
    this.pen.stroke([[axisX, axisBottom], [axisX, between(axisBottom, axisTop, plot)]], 'ink', shown * (plot > 0 ? 1 : 0), 1.2);
    this.place('bent', [axisX + 24 / this.pen.width, this.onPanel(0, 0.06)[1]], shown * ease(time, 96800, 97600));

    for (const [index, stop] of STOP_DATA.entries()) {
      const counted = ease(time, (COUNTING[index]?.[1] ?? 0) - 200, (COUNTING[index]?.[1] ?? 0) + 200);
      const rise = ease(time, 97500 + index * 600, 98200 + index * 600);
      const onTrack = this.trackAt(stop.t);
      const onCurve = this.trackAt(stop.t, this.curveV(stop.value));
      const at: Point = [onTrack[0], between(onTrack[1], onCurve[1], rise)];
      this.pen.disc(at, tall ? 3.5 : 4, 'blue', shown * counted);
      const tangent = ease(time, 98000 + index * 600, 98600 + index * 600) * shown;
      const dx = ((TRACK.to - TRACK.from) / TRACK.last) * this.panel.w * this.pen.width;
      const dy = (-stop.slope * 0.68 / (CURVE_HIGH - CURVE_LOW)) * this.panel.h * this.pen.height;
      const length = Math.hypot(dx, dy);
      const half = (tall ? 13 : 17) / length;
      this.pen.stroke([this.nudge(onCurve, -dx * half, -dy * half), this.nudge(onCurve, dx * half, dy * half)], 'blue', tangent, 2);
    }

    const right = this.onPanel(0.98, tall ? 0.07 : 0.04);
    this.pen.write(tall ? 'VALUE AND SLOPE\nAT EACH STOP' : 'VALUE AND SLOPE AT EACH STOP', right, { kind: 'tag', alpha: shown * presence(time, 98000, 98800, 102000, 102600), align: 'right' });
    this.pen.write(tall ? 'EXACT RULE\nSCHEMATIC CURVE' : 'EXACT RULE · SCHEMATIC CURVE', right, { kind: 'tag', tone: 'muted', alpha: shown * ease(time, 102600, 103300), align: 'right' });

    const back = ease(time, 99800, 102300);
    const points: Point[] = [];

    for (let sample = 0; sample <= 120 && back > 0; sample += 1) {
      const t = TRACK.last - (sample / 120) * back * TRACK.last;
      points.push(this.trackAt(t, this.curveV(evaluate(BENT_COEFFICIENTS, t))));
    }

    this.pen.stroke(points, 'blue', shown, 1.8);
    const landing = this.trackAt(0, this.curveV(TRUE_COUNT));
    const landed = ease(time, 102000, 102600) * shown;
    this.pen.disc(landing, 6, 'blue', landed, true);
    this.place('landing', this.nudge(landing, this.sizeOf('landing').width / 2 + 12, tall ? 15 : 18), landed);
  }
}

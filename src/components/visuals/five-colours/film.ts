import { SPINDLE, SPINDLE_EDGES, SPINDLE_ANGLE, PALETTE, FORCED_COLOURS, hexTiles, hexVertices, classAt, rulerAt, type Point } from './math';
import { smooth } from './story';
import { drawColourLedger, spindleCardPose } from './ledger';
import { drawColourFields, focusPose } from './fields';

type Ink = 'ink' | 'blue' | 'muted' | 'paper';

type Box = { x: number; y: number; w: number; h: number };

type Pose = { x: number; y: number; unit: number };

const TILES = hexTiles(8);

function lerp(a: number, b: number, amount: number): number {
  return a + (b - a) * amount;
}

function blend(a: Pose, b: Pose, amount: number): Pose {
  return { x: lerp(a.x, b.x, amount), y: lerp(a.y, b.y, amount), unit: lerp(a.unit, b.unit, amount) };
}

export class FiveColoursFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private tall = false;
  private time = 0;
  private colors: Record<Ink, string> = { ink: '#28241f', blue: '#28486e', muted: '#777067', paper: '#e7e5e0' };
  private readonly pigments: string[] = [];
  private readonly patterns = new Map<number, CanvasPattern>();
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

    this.patterns.clear();

    for (const entry of PALETTE) {
      this.pigments[entry.id] = style.getPropertyValue(`--five-${entry.id}`).trim() || entry.hex;
      const tile = document.createElement('canvas');
      tile.width = 8;
      tile.height = 8;
      const p = tile.getContext('2d');

      if (!p) continue;

      p.fillStyle = entry.tint;
      p.fillRect(0, 0, 8, 8);
      p.strokeStyle = this.colors.ink;
      p.fillStyle = this.colors.ink;
      p.globalAlpha = .34;
      p.lineWidth = .6;
      p.beginPath();

      if (entry.pattern === 'h' || entry.pattern === 'x') {
        p.moveTo(0, 4);
        p.lineTo(8, 4);
      }

      if (entry.pattern === 'v' || entry.pattern === 'x') {
        p.moveTo(4, 0);
        p.lineTo(4, 8);
      }

      if (entry.pattern === 'd' || entry.pattern === 'a') {
        for (let start = -8; start <= 8; start += 8) {
          p.moveTo(start, entry.pattern === 'd' ? 8 : 0);
          p.lineTo(start + 8, entry.pattern === 'd' ? 0 : 8);
        }
      }

      if (entry.pattern === 'o') {
        p.arc(4, 4, .75, 0, Math.PI * 2);
        p.fill();
      } else p.stroke();

      const pattern = this.pen.createPattern(tile, 'repeat');

      if (pattern) this.patterns.set(entry.id, pattern);
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
    const box = this.sheet();
    this.pen.save();
    this.pen.beginPath();
    this.pen.rect(box.x, box.y, box.w, box.h);
    this.pen.clip();

    if (time >= 32000 && time < 64500 || time >= 117500) this.hexagons(box);

    if (time >= 61500 && time < 117500) {
      this.pen.save();
      const wipe = smooth(time, 61500, 64500);
      this.pen.beginPath();
      this.pen.rect(box.x, box.y, box.w * wipe, box.h);
      this.pen.clip();
      drawColourFields(this.pen, box, Math.min(time, 114999), this.colors, (path, id, alpha) => this.fillClass(path, id, alpha), (id, x, y, alpha) => this.label(id, x, y, alpha));
      this.pen.restore();
    }

    if (time >= 115000) {
      this.pen.save();
      this.pen.beginPath();
      this.pen.arc(box.x + box.w / 2, box.y + box.h / 2, Math.hypot(box.w, box.h) * smooth(time, 115000, 117500), 0, Math.PI * 2);
      this.pen.clip();
      this.hexagons(box, true);
      this.pen.restore();
    }

    this.ruler(box);
    this.pen.restore();
    drawColourLedger(this.pen, this.width, this.height, time, this.colors, (id, x, y, alpha) => this.label(id, x, y, alpha));
    this.spindle(box);

    for (const [id, label] of this.labels) {
      if (!this.visible.has(id)) label.style.visibility = 'hidden';
    }
  }

  private sheet(): Box {
    return this.tall
      ? { x: this.width * .04, y: this.height * .045, w: this.width * .92, h: this.height * .53 }
      : { x: this.width * .04, y: this.height * .08, w: this.width * .56, h: this.height * .80 };
  }

  private openingPose(box: Box): Pose {
    const unit = Math.min(box.w * .29, box.h * .35);

    return { x: box.x + box.w * .31, y: box.y + box.h * .56, unit };
  }

  private fillClass(path: Path2D, id: number, alpha = 1): void {
    this.pen.globalAlpha = alpha;
    this.pen.fillStyle = this.patterns.get(id) ?? this.colors.paper;
    this.pen.fill(path);
    this.pen.globalAlpha = 1;
  }

  private line(points: readonly Point[], color: Ink = 'ink', alpha = 1, weight = 1, progress = 1): void {
    if (points.length < 2 || alpha <= 0 || progress <= 0) return;

    let total = 0;

    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];

      if (a && b) total += Math.hypot(b.x - a.x, b.y - a.y);
    }

    let remaining = total * Math.min(1, progress);
    this.pen.beginPath();
    this.pen.strokeStyle = this.colors[color];
    this.pen.lineWidth = weight;
    this.pen.globalAlpha = alpha;

    for (let i = 1; i < points.length && remaining > 0; i++) {
      const a = points[i - 1];
      const b = points[i];

      if (!a || !b) continue;

      const length = Math.hypot(b.x - a.x, b.y - a.y);
      const portion = Math.min(1, remaining / (length || 1));
      this.pen.moveTo(a.x, a.y);
      this.pen.lineTo(lerp(a.x, b.x, portion), lerp(a.y, b.y, portion));
      remaining -= length;
    }

    this.pen.stroke();
    this.pen.globalAlpha = 1;
  }

  private words(text: string, x: number, y: number, width: number, color: Ink = 'ink', size = this.tall ? 10 : 11): void {
    this.pen.font = `${size}px "Special Elite", monospace`;
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

    for (const [index, line] of lines.entries()) {
      const extent = this.pen.measureText(line).width;
      const px = Math.max(extent / 2 + 4, Math.min(this.width - extent / 2 - 4, x));
      const py = y + (index - (lines.length - 1) / 2) * (size + 3);
      this.pen.fillStyle = this.colors.paper;
      this.pen.fillRect(px - extent / 2 - 3, py - size / 2 - 2, extent + 6, size + 4);
      this.pen.fillStyle = this.colors[color];
      this.pen.fillText(line, px, py);
    }
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

  private disc(point: Point, id: number, radius: number, numeral = true): void {
    this.pen.beginPath();
    this.pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    this.pen.fillStyle = this.pigments[id] ?? this.colors.paper;
    this.pen.fill();
    this.pen.strokeStyle = this.colors.ink;
    this.pen.lineWidth = 1;
    this.pen.stroke();

    if (numeral && radius >= 6) {
      this.pen.font = `${this.tall ? 10 : 12}px "Special Elite", monospace`;
      this.pen.textAlign = 'center';
      this.pen.textBaseline = 'middle';
      this.pen.fillStyle = this.colors[PALETTE.find(entry => entry.id === id)?.numeral ?? 'ink'];
      this.pen.fillText(String(id), point.x, point.y + 1);
    }
  }

  private hexagons(box: Box, closing = false): void {
    const t = this.time;
    const unit = this.tall ? Math.max(50, box.w * .19) : box.w * .18;
    const origin = { x: box.x + box.w * .5, y: box.y + box.h * .5 };
    const reach = closing || t >= 38000 ? 20 : 1 + 7 * smooth(t, 32000, 38000);

    for (const tile of TILES) {
      if (Math.max(Math.abs(tile.q), Math.abs(tile.r), Math.abs(tile.q + tile.r)) > reach) continue;

      const vertices = hexVertices(tile.q, tile.r);
      const path = new Path2D();

      for (const [i, p] of vertices.entries()) {
        const x = origin.x + p.x * unit;
        const y = origin.y - p.y * unit;

        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }

      path.closePath();
      this.fillClass(path, tile.classId);
      this.pen.strokeStyle = this.colors.ink;
      this.pen.lineWidth = .6;
      this.pen.stroke(path);
    }

    if (t >= 34000 && t < 44500) {
      this.words('SEVEN COLOURS SUFFICE', box.x + box.w / 2, box.y + 11, box.w * .95);
      const near = hexVertices(0, 0)[0];
      const far = hexVertices(1, 2)[3];

      if (near && far) {
        const a = { x: origin.x + near.x * unit, y: origin.y - near.y * unit };
        const b = { x: origin.x + far.x * unit, y: origin.y - far.y * unit };
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const normal = { x: -Math.sin(angle) * 4, y: Math.cos(angle) * 4 };
        this.line([a, b], 'ink', 1, 1, smooth(t, 35000, 37500));

        for (const point of [a, b]) this.line([{ x: point.x - normal.x, y: point.y - normal.y }, { x: point.x + normal.x, y: point.y + normal.y }], 'ink', 1, 1);

        if (t >= 37500) this.words('SAME COLOUR GAP > 1', (a.x + b.x) / 2, (a.y + b.y) / 2 - 15, box.w * .8);
      }

      const hexagon = hexVertices(1, 0);
      const upper = hexagon[1];
      const lower = hexagon[4];

      if (upper && lower) {
        const a = { x: origin.x + upper.x * unit, y: origin.y - upper.y * unit };
        const b = { x: origin.x + lower.x * unit, y: origin.y - lower.y * unit };
        this.line([a, b], 'ink', 1, 1, smooth(t, 34500, 36500));

        for (const point of [a, b]) this.line([{ x: point.x - 4, y: point.y }, { x: point.x + 4, y: point.y }], 'ink', 1, 1);
      }

      this.words('WITHIN ONE HEXAGON', box.x + box.w * .72, box.y + box.h - 63, box.w * .54);
      this.label('diameter', box.x + box.w * .72, box.y + box.h - 43);
      this.label('gap', box.x + box.w / 2, box.y + box.h - 12);
    }
  }

  private spindle(box: Box): void {
    const t = this.time;
    const start = this.openingPose(box);
    const parked = spindleCardPose(this.width, this.height, Math.min(t, 95500));
    const small = { ...start, unit: parked.unit };
    let pose = t < 32400 ? blend(start, small, smooth(t, 31500, 32400)) : blend(small, parked, smooth(t, 32400, 33750));

    if (this.tall && t >= 31500 && t < 33750) {
      const side = { x: this.width + 8, y: start.y, unit: parked.unit };
      const below = { ...side, y: parked.y };
      pose = t < 32100 ? blend(start, side, smooth(t, 31500, 32100))
        : t < 32650 ? blend(side, below, smooth(t, 32100, 32650))
        : blend(below, parked, smooth(t, 32650, 33750));
    }
    const focus = focusPose(box);
    const circum = 3 / Math.sqrt(11);
    const mid = SPINDLE_ANGLE / 2;
    const finalPose = { x: focus.x - circum * Math.cos(mid) * focus.unit, y: focus.y + circum * Math.sin(mid) * focus.unit, unit: focus.unit };
    pose = blend(pose, finalPose, smooth(t, 110000, 113000));
    const closingCard = spindleCardPose(this.width, this.height, t);
    pose = blend(pose, closingCard, smooth(t, 115000, 117500));

    if (this.tall && t >= 115000 && t < 118500) {
      const destination = spindleCardPose(this.width, this.height, 120000);
      const side = { x: this.width + destination.x, y: finalPose.y, unit: destination.unit };
      const below = { ...side, y: destination.y };
      pose = t < 115800 ? blend(finalPose, side, smooth(t, 115000, 115800))
        : t < 117000 ? blend(side, below, smooth(t, 115800, 117000))
        : closingCard;
    }
    const rotated = smooth(t, 18200, 24000);
    const points = SPINDLE.map((point, index) => {
      const angle = index >= 4 && t < 25000 ? (rotated - 1) * SPINDLE_ANGLE : 0;
      const px = point.x * Math.cos(angle) - point.y * Math.sin(angle);
      const py = point.x * Math.sin(angle) + point.y * Math.cos(angle);

      return { x: pose.x + px * pose.unit, y: pose.y - py * pose.unit };
    });
    const initialThird = points[2];
    const selected = t < 11500 ? 1 : t < 13000 ? 2 : 3;

    for (const [a, b] of SPINDLE_EDGES) {
      const from = points[a];
      const to = points[b];

      if (!from || !to) continue;

      const available = Math.max(a, b) <= 2 ? smooth(t, a === 0 && b === 1 ? 500 : 9200, a === 0 && b === 1 ? 1800 : 10800) : a <= 3 && b <= 3 ? smooth(t, 15000, 17500) : a === 3 && b === 6 ? smooth(t, 23800, 25000) : smooth(t, 18000, 22000);
      this.line([from, to], 'ink', 1, pose.unit < 25 ? .65 : 1.2, available);
    }

    for (const [index, point] of points.entries()) {
      if (index > 1 && t < 10000 || index === 3 && t < 16500 || index > 3 && t < 18500) continue;

      const forced = t >= 25500 || t >= 110000;
      const id = index === 2 && !forced ? selected : FORCED_COLOURS[index] ?? 1;
      const r = Math.min(this.tall ? 8 : 10, Math.max(2, pose.unit * .11));
      this.disc(point, id, r, pose.unit > 30);
    }

    if (t >= 10000 && t < 13000 && initialThird) {
      this.words('×', initialThird.x + 17, initialThird.y, 25, 'blue', 17);
    }

    if (t >= 25500 && t < 31500 || t >= 112500 && t < 115000) {
      const p = points[3];
      const q = points[6];

      if (p && q) {
        const middle = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
        this.words('×', middle.x, middle.y, 25, 'blue', 20);
        this.words(t < 31500 ? 'SAME COLOUR · ONE UNIT APART' : 'NEEDS FOUR COLOURS', box.x + box.w / 2, box.y + box.h - 10, box.w * .96, 'blue');
      }
    }

    if (t >= 15000 && t < 25500) this.words('MOSER SPINDLE · 7 POINTS · 11 UNIT SEGMENTS', box.x + box.w / 2, box.y + 12, box.w * .95);
  }

  private ruler(box: Box): void {
    const t = this.time;
    const opening = this.openingPose(box);
    const sweep = smooth(t, 2800, 7000) * Math.PI * 2;
    let pose = { x: opening.x, y: opening.y, unit: opening.unit, angle: Math.PI / 6 - sweep };
    const move = (target: typeof pose, start: number, end: number): void => {
      const amount = smooth(t, start, end);
      const turn = Math.atan2(Math.sin(target.angle - pose.angle), Math.cos(target.angle - pose.angle));
      pose = { x: lerp(pose.x, target.x, amount), y: lerp(pose.y, target.y, amount), unit: lerp(pose.unit, target.unit, amount), angle: pose.angle + turn * amount };
    };
    const tip = SPINDLE[3];
    const other = SPINDLE[6];
    move({ x: opening.x + tip.x * opening.unit, y: opening.y - tip.y * opening.unit, unit: opening.unit, angle: Math.atan2(tip.y - other.y, other.x - tip.x) }, 18000, 22000);
    const path = rulerAt(t >= 115000 ? 41000 : Math.min(t, 61500));
    const hexUnit = this.tall ? Math.max(50, box.w * .19) : box.w * .18;
    const hexPose = { x: box.x + box.w / 2 + path.start.x * hexUnit, y: box.y + box.h / 2 - path.start.y * hexUnit, unit: hexUnit, angle: -path.angle };
    move(hexPose, 32000, 36000);
    move({ x: box.x + box.w * .11, y: box.y + box.h - 25, unit: Math.min(box.w * .24, box.h * .3), angle: 0 }, 61500, 64000);
    const focus = focusPose(box);
    move({ x: focus.x, y: focus.y, unit: focus.unit, angle: -smooth(t, 98000, 104000) * Math.PI * 2 }, 96000, 98000);
    move(hexPose, 115000, 117500);
    const from = { x: pose.x, y: pose.y };
    const to = { x: from.x + Math.cos(pose.angle) * pose.unit, y: from.y + Math.sin(pose.angle) * pose.unit };

    if (t > 2500 && t < 9000) {
      const circle: Point[] = [];

      for (let index = 0; index <= 100; index++) {
        const angle = Math.PI / 6 - Math.PI * 2 * index / 100;
        circle.push({ x: opening.x + opening.unit * Math.cos(angle), y: opening.y + opening.unit * Math.sin(angle) });
      }

      this.line(circle, 'blue', .5, 1, smooth(t, 2800, 7000));
      this.words('EVERY POINT ON THE CIRCLE\nDIFFERS FROM THE CENTRE', box.x + box.w / 2, box.y + 15, box.w * .9);
      this.disc(to, 2, this.tall ? 8 : 10);
    }

    if (t >= 36000 && t < 61500 || t >= 117500) {
      this.disc(from, classAt(path.start), this.tall ? 6 : 8);
      this.disc(to, classAt(path.end), this.tall ? 6 : 8);
    }

    this.line([from, to], 'blue', 1, 2, smooth(t, 0, 1500));
    const nx = -Math.sin(pose.angle) * 5;
    const ny = Math.cos(pose.angle) * 5;

    for (const point of [from, to]) this.line([{ x: point.x - nx, y: point.y - ny }, { x: point.x + nx, y: point.y + ny }], 'blue', 1, 1.4);

    if (t < 61500 || t >= 115000) this.words('1 UNIT', (from.x + to.x) / 2, (from.y + to.y) / 2 + 17, 70, 'blue');
  }
}

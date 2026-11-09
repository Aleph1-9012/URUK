import { OPENING, SQUARE, latticeLinkClasses, circlePoints, unitPairs, type Point } from './math';
import { layout, smooth, type Box } from './story';
import { jumpDialAt } from './exponent';

type Ink = 'ink' | 'blue' | 'muted' | 'paper';

type Colors = Record<Ink, string>;

type Label = (id: string, x: number, y: number, opacity?: number) => void;

type GridView = { map: (point: Point) => Point; scale: number };

const mix = (a: number, b: number, p: number) => a + (b - a) * p;

const between = (a: Point, b: Point, p: number): Point => ({ x: mix(a.x, b.x, p), y: mix(a.y, b.y, p) });

export class UnitSheet {
  private colors: Colors = { ink: '', blue: '', muted: '', paper: '' };
  private box: Box = { x: 0, y: 0, w: 1, h: 1 };
  private tall = false;
  private readonly lattice = new Map<string, Path2D[]>();

  constructor(private readonly pen: CanvasRenderingContext2D) {}

  draw(width: number, height: number, density: number, time: number, colors: Colors, label: Label): void {
    this.colors = colors;
    const view = layout(width, height);
    this.box = view.sheet;
    this.tall = view.tall;
    const { x, y, w, h } = this.box;
    this.words('ONE LENGTH, MANY LINKS', x + w / 2, y + 8, w, 'ink', this.tall ? 10 : 12);

    if (time < 15500) this.smallSets(time);
    else if (time < 32000) this.latticeConstruction(time);
    else if (time < 76500) this.circleBounds(time);
    else if (time < 101500) this.wedges(width, height, time, label);
    else this.closing(time);

    this.pen.strokeStyle = colors.muted;
    this.pen.lineWidth = Math.min(.65, 1 / density);
    this.pen.beginPath();
    this.pen.moveTo(x, y + h);
    this.pen.lineTo(x + w, y + h);
    this.pen.stroke();
  }

  private line(a: Point, b: Point, tone: Ink = 'ink', width = 1, progress = 1): void {
    if (progress <= 0) return;

    this.pen.strokeStyle = this.colors[tone];
    this.pen.lineWidth = width;
    this.pen.beginPath();
    this.pen.moveTo(a.x, a.y);
    this.pen.lineTo(mix(a.x, b.x, progress), mix(a.y, b.y, progress));
    this.pen.stroke();
  }

  private dot(point: Point, radius = 2, tone: Ink = 'ink'): void {
    this.pen.fillStyle = this.colors[tone];
    this.pen.beginPath();
    this.pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    this.pen.fill();
  }

  private words(text: string, x: number, y: number, maxWidth = this.box.w, tone: Ink = 'ink', size = this.tall ? 9 : 11): void {
    this.pen.font = `${size}px "Special Elite", monospace`;
    this.pen.textAlign = 'center';
    this.pen.textBaseline = 'middle';
    const lines: string[] = [];

    for (const paragraph of text.split('\n')) {
      let line = '';

      for (const word of paragraph.split(' ')) {
        const next = line ? `${line} ${word}` : word;

        if (line && this.pen.measureText(next).width > maxWidth - 6) {
          lines.push(line);
          line = word;
        } else line = next;
      }

      lines.push(line);
    }

    for (const [index, line] of lines.entries()) {
      const extent = this.pen.measureText(line).width;
      const py = y + (index - (lines.length - 1) / 2) * (size + 3);
      this.pen.fillStyle = this.colors.paper;
      this.pen.fillRect(x - extent / 2 - 3, py - size / 2 - 2, extent + 6, size + 4);
      this.pen.fillStyle = this.colors[tone];
      this.pen.fillText(line, x, py);
    }
  }

  private circle(center: Point, radius: number, progress = 1, power = 2, tone: Ink = 'ink'): void {
    if (radius <= 0 || progress <= 0) return;

    this.pen.beginPath();
    this.pen.lineWidth = this.tall ? .8 : 1;
    this.pen.strokeStyle = this.colors[tone];
    const samples = Math.max(2, Math.ceil(180 * progress));

    for (let index = 0; index <= samples; index++) {
      const angle = -Math.PI / 2 + index / samples * Math.PI * 2 * progress;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const r = radius / (Math.abs(c) ** power + Math.abs(s) ** power) ** (1 / power);
      const x = center.x + c * r;
      const y = center.y + s * r;

      if (index === 0) this.pen.moveTo(x, y);
      else this.pen.lineTo(x, y);
    }

    this.pen.stroke();
  }

  private grid(side: number, squaredRadius: number, angle: number, area: Box, progress = 1, opacity = 1): GridView {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const scale = Math.min(area.w / ((side - 1) * (1 + cosine)), area.h / ((side - 1) * sine));
    const origin = { x: area.x + (area.w - (side - 1) * (1 + cosine) * scale) / 2, y: area.y + (area.h + (side - 1) * sine * scale) / 2 };
    const map = (point: Point): Point => ({ x: origin.x + (point.x + point.y * cosine) * scale, y: origin.y - point.y * sine * scale });
    this.pen.save();
    this.pen.globalAlpha = opacity * (side > 10 && squaredRadius > 1 ? .16 : 1);
    this.pen.transform(scale, 0, cosine * scale, -sine * scale, origin.x, origin.y);
    this.pen.strokeStyle = this.colors.ink;
    this.pen.lineWidth = (side > 10 ? .5 : .85) / scale;
    const key = `${side}:${squaredRadius}`;
    let paths = this.lattice.get(key);

    if (!paths) {
      paths = latticeLinkClasses(side, squaredRadius).map(group => {
        const path = new Path2D();

        for (const segment of group.segments) {
          path.moveTo(segment.from.x, segment.from.y);
          path.lineTo(segment.to.x, segment.to.y);
        }

        return path;
      });
      this.lattice.set(key, paths);
    }

    for (const [index, path] of paths.entries()) {
      const amount = Math.max(0, Math.min(1, progress * paths.length - index));

      if (amount === 1) this.pen.stroke(path);
      else if (amount > 0) {
        const group = latticeLinkClasses(side, squaredRadius)[index];
        this.pen.beginPath();

        for (const segment of group?.segments ?? []) {
          this.pen.moveTo(segment.from.x, segment.from.y);
          this.pen.lineTo(mix(segment.from.x, segment.to.x, amount), mix(segment.from.y, segment.to.y, amount));
        }

        this.pen.stroke();
      }
    }

    if (squaredRadius === 1 && Math.abs(angle - Math.PI / 3) < 1e-10) {
      this.pen.beginPath();

      for (let row = 0; row < side - 1; row++) {
        for (let column = 1; column < side; column++) {
          this.pen.moveTo(column, row);
          this.pen.lineTo(column - 1, row + 1);
        }
      }

      this.pen.stroke();
    }

    this.pen.globalAlpha = opacity;
    this.pen.fillStyle = this.colors.ink;
    this.pen.beginPath();
    const radius = (side > 10 ? .45 : 1.7) / scale;

    for (let row = 0; row < side; row++) {
      for (let column = 0; column < side; column++) {
        this.pen.moveTo(column + radius, row);
        this.pen.arc(column, row, radius, 0, Math.PI * 2);
      }
    }

    this.pen.fill();
    this.pen.restore();

    return { map, scale };
  }

  private area(): Box {
    const b = this.box;

    return { x: b.x + 10, y: b.y + 28, w: b.w - 20, h: b.h - (this.tall ? 64 : 88) };
  }

  private footer(text: string, second = ''): void {
    const b = this.box;
    this.words(text, b.x + b.w / 2, b.y + b.h - (second ? 32 : 20), b.w);

    if (second) this.words(second, b.x + b.w / 2, b.y + b.h - 13, b.w, 'muted', this.tall ? 8 : 10);
  }

  private smallSets(time: number): void {
    const area = this.area();
    const center = { x: area.x + area.w / 2, y: area.y + area.h / 2 };

    if (time < 8500) {
      const scale = Math.min(area.w / 5.5, area.h / 4.5);
      const settle = smooth(time, 0, 900);
      const square = smooth(time, 7500, 8500);
      const positions = OPENING.map((point, index) => {
        const initial = { x: center.x + (point.x - 1) * scale, y: center.y - (point.y - 1.15) * scale - (1 - settle) * (10 + index * 3) };
        const corner = SQUARE[index];
        const squareScale = Math.min(area.w * .46, area.h * .7);
        const target = corner ? { x: center.x + (corner.x - .5) * squareScale, y: center.y - (corner.y - .5) * squareScale } : { x: area.x + area.w + 30 + index * 6, y: initial.y };

        return between(initial, target, square);
      });
      const scan = Math.min(7, Math.floor(Math.max(0, time - 1300) / 750));
      const last = Math.max(0, scan - 1);
      const moving = smooth(time, 1300 + scan * 750, 1500 + scan * 750);
      const from = positions[last];
      const to = positions[scan];

      if (from && to && time < 7500) this.circle(between(from, to, moving), scale * smooth(time, 600, 1250));

      let links = 0;

      if (time < 7500) {
        for (const [a, b] of unitPairs(OPENING)) {
          const p = positions[a];
          const q = positions[b];
          const growth = smooth(time, 1500 + a * 750, 1850 + a * 750);

          if (p && q && growth > 0) {
            this.line(p, q, 'ink', 1.3, growth);

            if (growth === 1) links++;
          }
        }
      }

      this.pen.save();
      this.pen.beginPath();
      this.pen.rect(area.x, area.y, area.w, area.h);
      this.pen.clip();

      for (const point of positions) this.dot(point, this.tall ? 2 : 3);

      this.pen.restore();
      this.footer(time >= 7500 ? 'FOUR POINTS MOVE INTO A SQUARE' : `8 POINTS · LINKS: ${links}`, time < 7500 ? 'ON THE CIRCLE = ONE UNIT AWAY' : '');

      return;
    }

    if (time < 12200) {
      const angle = mix(Math.PI / 2, Math.PI / 3, smooth(time, 10000, 11200));
      this.grid(2, 1, angle, { x: center.x - area.w * .23, y: area.y + area.h * .15, w: area.w * .46, h: area.h * .7 });
      this.footer(time >= 11200 ? 'TWO TRIANGLES · 5 LINKS' : time >= 10000 ? 'THE SIDES KEEP THEIR LENGTH' : 'A SQUARE · 4 LINKS');

      return;
    }

    const grow = smooth(time, 12200, 13000);
    const shear = smooth(time, 13400, 14800);
    const angle = mix(Math.PI / 3, Math.PI / 2, grow) - Math.PI / 6 * shear;
    const zoom = 5 / (1 + 4 * grow);
    this.pen.save();
    this.pen.beginPath();
    this.pen.rect(area.x, area.y, area.w, area.h);
    this.pen.clip();
    this.grid(6, 1, angle, { x: area.x - area.w * (zoom - 1) / 2, y: area.y - area.h * (zoom - 1) / 2, w: area.w * zoom, h: area.h * zoom });
    this.pen.restore();
    this.footer(shear === 1 ? 'TRIANGULAR GRID · 85 LINKS' : shear > 0 ? 'TURNING THE GRID · UNIT SIDES' : grow < 1 ? 'THE GRID GROWS' : '36 POINTS · 60 LINKS', shear === 1 ? '2.36 LINKS PER POINT' : shear === 0 && grow === 1 ? '1.67 LINKS PER POINT' : '');
  }

  private latticeConstruction(time: number): void {
    const area = this.area();
    const enter = smooth(time, 15500, 17200);
    const rescale = smooth(time, 24500, 27000);
    const scaleDown = mix(1, .82, rescale);
    const camera = 29 / (5 + 24 * enter);
    const zoom = scaleDown * camera;
    const drawing = { x: area.x + area.w * (1 - zoom) / 2, y: area.y + area.h * (1 - zoom) / 2, w: area.w * zoom, h: area.h * zoom };
    const angle = mix(Math.PI / 3, Math.PI / 2, enter);
    const radius2 = time < 18500 ? 1 : time < 20100 ? 5 : time < 21700 ? 25 : 65;
    const starts = radius2 === 1 ? 17200 : radius2 === 5 ? 18500 : radius2 === 25 ? 20100 : 21700;
    const previous = radius2 === 1 ? 1 : radius2 === 5 ? 1 : radius2 === 25 ? Math.sqrt(5) : 5;
    const radius = mix(previous, Math.sqrt(radius2), smooth(time, starts, starts + 550));
    const linkN = time >= 23500 ? 65 : 1;
    this.pen.save();
    this.pen.beginPath();
    this.pen.rect(area.x, area.y, area.w, area.h);
    this.pen.clip();
    const view = this.grid(30, linkN, angle, drawing, time >= 23500 ? smooth(time, 23500, 25700) : 1);
    const center = view.map({ x: 14, y: 14 });
    this.circle(center, radius * view.scale, smooth(time, 17200, 18000));

    if (time >= starts + 550) {
      for (const point of circlePoints(radius2)) this.dot(view.map({ x: point.x + 14, y: point.y + 14 }), this.tall ? 1.7 : 2.5);
    }

    this.pen.restore();

    if (time < 23500) this.footer(time < 17200 ? 'THE CAMERA PULLS BACK' : time < starts + 550 ? 'THE CIRCLE GROWS ON THE SAME GRID' : `RADIUS² ${radius2} · ${circlePoints(radius2).length} POINTS ON THE RIM`, radius2 === 65 ? '65 = 1² + 8² = 4² + 7²' : time < 17200 ? '' : '900 POINTS · 1,740 UNIT LINKS');
    else this.footer(time < 27000 ? 'THIS LENGTH BECOMES THE UNIT' : '900 POINTS · 4,944 LINKS · 5.49 EACH', time < 27000 ? 'ALL PAIRS AT THE SAME LENGTH' : '3,600: 7.83 · 10,000: 9.82 PER POINT');
  }

  private circleBounds(time: number): void {
    const area = this.area();
    const cardExit = smooth(time, 74500, 76500);
    const zoom = mix(.82, 1, smooth(time, 32000, 34000)) * mix(1, 2.9, cardExit);
    const drawing = { x: area.x + area.w * (1 - zoom) / 2, y: area.y + area.h * (1 - zoom) / 2, w: area.w * zoom, h: area.h * zoom };
    this.pen.save();
    this.pen.beginPath();
    this.pen.rect(area.x - 1, area.y - 3, area.w + 2, area.h + 6);
    this.pen.clip();
    const view = this.grid(30, cardExit > 0 ? 25 : 65, Math.PI / 2, drawing, 1, time < 34500 ? mix(.8, .25, smooth(time, 32000, 34500)) : .25);
    const p = view.map({ x: 10, y: 11 });
    const q = view.map({ x: 14, y: 18 });
    const radius = Math.sqrt(65) * view.scale;
    const nonround = smooth(time, 47500, 50000) * (1 - smooth(time, 56000, 58200));
    const card = smooth(time, 61500, 63500);
    const circleSize = 1 - card * .7;
    const circleP = between(p, { x: area.x + area.w * .14, y: area.y + area.h * .2 }, card);
    const circleQ = between(q, { x: area.x + area.w * .25, y: area.y + area.h * .28 }, card);
    const power = 2 + 1.4 * nonround;
    this.circle(circleP, radius * circleSize, smooth(time, 32000, 34000), power);
    this.circle(circleQ, radius * circleSize, smooth(time, 33300, 35200), power);
    this.dot(circleP);
    this.dot(circleQ);

    if (time >= 35200 && time < 40500) {
      const midpoint = between(p, q, .5);
      const distance = Math.hypot(q.x - p.x, q.y - p.y);
      const rise = Math.sqrt(radius * radius - distance * distance / 4);
      const normal = { x: -(q.y - p.y) / distance, y: (q.x - p.x) / distance };

      for (const sign of [-1, 1]) {
        const point = { x: midpoint.x + normal.x * rise * sign, y: midpoint.y + normal.y * rise * sign };
        this.line(p, point, 'muted', .6, smooth(time, 35000, 36000));
        this.line(q, point, 'muted', .6, smooth(time, 35000, 36000));
        this.dot(point, this.tall ? 3 : 4);
      }
    }

    if (time >= 40500 && time < 61500) {
      for (const [index, point] of [{ x: 17, y: 12 }, { x: 12, y: 18 }].entries()) {
        this.circle(view.map(point), radius, smooth(time, 41000 + index * 600, 42500 + index * 600), power);
      }
    }

    if (card > 0) {
      const left = area.x + area.w * .09;
      const top = mix(area.y - area.h * .6, area.y + area.h * .32, card) - cardExit * area.h;
      const width = area.w * .82;
      const height = area.h * .44;
      this.pen.fillStyle = this.colors.paper;
      this.pen.fillRect(left, top, width, height);
      this.pen.strokeStyle = this.colors.ink;
      this.pen.lineWidth = .7;
      this.pen.strokeRect(left, top, width, height);
      this.words('A TOWER OF NUMBER FIELDS', left + width / 2, top + height * .3, width - 10);
      this.words('MAY CONSTRUCTION · NOT DRAWN', left + width / 2, top + height * .7, width - 10, 'muted', this.tall ? 8 : 10);
    }

    this.pen.restore();

    if (time < 40500) this.footer('TWO CIRCLES · AT MOST TWO MEETINGS', 'THE ONLY COMMON UNIT NEIGHBOURS');
    else if (time < 47500) this.footer('CIRCLE ARCS AND CROSSINGS', 'SZÉKELY, 1997 · SCHEMATIC');
    else if (time < 56000) this.footer("VALTR'S NON-ROUND UNIT CIRCLES", 'SAME TWO PROPERTIES · CONTOUR SCHEMATIC');
    else if (time < 61500) this.footer('ROUND CIRCLES HAVE TO MATTER', 'BLOOM: USE THE EUCLIDEAN METRIC');
    else this.footer(time < 68500 ? 'MAY: A CONSTRUCTION THAT WAS CHECKED' : 'SEPTEMBER: A SEPARATE UPPER-BOUND CLAIM', 'THE TWO RESULTS LEAVE A GAP');
  }

  private wedges(width: number, height: number, time: number, label: Label): void {
    const area = this.area();
    const reveal = smooth(time, 76500, 78500);
    const view = this.grid(11, 25, Math.PI / 2, area, reveal, .2);
    const sample = time < 81000 ? 0 : Math.min(3, Math.floor((time - 81000) / 850));
    const centerIndex = time < 84500 ? [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 5 }][sample] ?? { x: 5, y: 5 } : { x: 5, y: 5 };
    const c = view.map(centerIndex);
    const jump = jumpDialAt(width, height, time);
    const turning = time >= 88500 && time < 92500;
    const a = view.map({ x: centerIndex.x + (turning ? 5 * jump.dx : 3), y: centerIndex.y + (turning ? 5 * jump.dy : 4) });
    const b = view.map({ x: centerIndex.x + 4, y: centerIndex.y + 3 });
    const circleProgress = smooth(time, 77500, 79500);
    const extract = smooth(time, 92500, 94800);
    this.circle(c, 5 * view.scale * (1 - extract), circleProgress);
    this.line(c, between(a, c, extract), time >= 85500 ? 'blue' : 'ink', 1.6, smooth(time, 78500, 79800));
    this.line(c, between(b, c, extract), 'ink', 1.2, smooth(time, 79200, 80500));

    if (time < 92500) {
      this.dot(c, 2.4);
      this.dot(a, 2.7);
      this.dot(b, 2.7);
    }

    if (time < 85500) {
      this.words('A WEDGE', c.x, c.y + 18, area.w * .6);
      this.footer('TWO ENDS, ONE CIRCLE CENTRE', 'LITTLE SHARED INFORMATION · SCHEMATIC');
    } else if (time < 92500) {
      const dial = jumpDialAt(width, height, time);
      const carried = smooth(time, 85500, 87200);
      const start = between(c, { x: dial.x, y: dial.y }, carried);
      const end = between(a, { x: dial.x + .6 * dial.radius, y: dial.y - .8 * dial.radius }, carried);

      if (carried < 1) {
        this.line(start, end, 'blue', 1.7);
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        this.line(end, { x: end.x - 6 * Math.cos(angle - .45), y: end.y - 6 * Math.sin(angle - .45) }, 'blue', 1.2);
        this.line(end, { x: end.x - 6 * Math.cos(angle + .45), y: end.y - 6 * Math.sin(angle + .45) }, 'blue', 1.2);
      }

      label('jump-product', this.box.x + this.box.w / 2, this.box.y + this.box.h - 31);
      this.words('THE UNIT EQUATION FACTORS', this.box.x + this.box.w / 2, this.box.y + this.box.h - 12, this.box.w, 'muted', this.tall ? 8 : 10);
    } else {
      const grow = smooth(time, 92500, 94800);
      const rectangle = { x: area.x + area.w * .18, y: area.y + area.h * .2, w: area.w * .64, h: area.h * .6 };
      const corners = [
        between(a, { x: rectangle.x, y: rectangle.y }, grow),
        between(b, { x: rectangle.x + rectangle.w, y: rectangle.y }, grow),
        between(c, { x: rectangle.x + rectangle.w, y: rectangle.y + rectangle.h }, grow),
        between(c, { x: rectangle.x, y: rectangle.y + rectangle.h }, grow),
      ];

      for (const [index, corner] of corners.entries()) {
        const next = corners[(index + 1) % corners.length];

        if (next) this.line(corner, next, 'ink', 1, grow);

        this.dot(corner, 2.4);
      }

      this.words('RATIOS AT FOUR PAIRS', rectangle.x + rectangle.w / 2, rectangle.y + rectangle.h * .35, rectangle.w - 4, 'ink', this.tall ? 8 : 11);
      this.words('ALTERNATING PRODUCT: SMALL', rectangle.x + rectangle.w / 2, rectangle.y + rectangle.h * .64, rectangle.w - 4, 'muted', this.tall ? 8 : 10);

      if (time > 97500) {
        this.line({ x: rectangle.x - 5, y: rectangle.y + rectangle.h + 5 }, { x: rectangle.x + rectangle.w + 5, y: rectangle.y - 5 }, 'ink', 1.6, smooth(time, 97500, 98900));
      }

      this.footer(time < 97500 ? 'EACH RATIO: LARGE ARITHMETIC HEIGHT' : 'CANNOT HOLD · SO THE CAP DROPS, CLAIMED', 'RECTANGLE ARGUMENT · SCHEMATIC');
    }
  }

  private closing(time: number): void {
    const area = this.area();
    this.grid(30, 65, Math.PI / 2, area, smooth(time, 101500, 103500));
    const exit = smooth(time, 101500, 103500);

    if (exit < 1) {
      const left = area.x + area.w * .08;
      const top = area.y + area.h * .07 - exit * area.h;
      const w = area.w * .84;
      const h = area.h * .87;
      this.pen.save();
      this.pen.beginPath();
      this.pen.rect(area.x, area.y, area.w, area.h);
      this.pen.clip();
      this.pen.fillStyle = this.colors.paper;
      this.pen.fillRect(left, top, w, h);
      this.pen.strokeStyle = this.colors.ink;
      this.pen.lineWidth = .9;
      this.pen.strokeRect(left + w * .12, top + h * .15, w * .76, h * .7);
      this.line({ x: left + w * .1, y: top + h * .87 }, { x: left + w * .9, y: top + h * .12 }, 'ink', 1.4);
      this.words('CANNOT HOLD · CLAIMED', left + w / 2, top + h * .48, w - 10);
      this.pen.restore();
    }

    this.footer('900 POINTS · 4,944 LINKS', 'OSVERIFY: FIXABLE ERROR · LEAN: UNCLEAR');
  }
}

import { FilmLabels } from '../../plate/labels';
import { smooth } from '../../../lib/animation';
import { ringState, energyBeta, doublingStep } from './math';

import { drawGapChart } from './chart';

type Ink = 'ink' | 'blue' | 'muted' | 'paper';

type Point = { x: number; y: number };

type Box = { x: number; y: number; w: number; h: number };

export class GapLadderFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private tall = false;
  private time = 0;
  private colors: Record<Ink, string> = { ink: '#28241f', blue: '#28486e', muted: '#777067', paper: '#e7e5e0' };
  private readonly labels: FilmLabels;

  constructor(host: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(host, { horizontal: 7, vertical: 6 });
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

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    this.time = time;
    this.labels.beginFrame();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineCap = 'round';
    this.pen.lineJoin = 'round';
    this.ringAndSheet();
    drawGapChart(this.pen, this.width, this.height, time, this.colors, (id, x, y, alpha) => this.labels.place(id, x, y, alpha));

    this.labels.endFrame();
  }

  private line(points: readonly Point[], tone: Ink = 'ink', weight = 1, alpha = 1, progress = 1): void {
    if (alpha < .005 || points.length < 2 || progress <= 0) return;

    this.pen.globalAlpha = alpha;
    this.pen.strokeStyle = this.colors[tone];
    this.pen.lineWidth = weight;
    this.pen.beginPath();
    const end = Math.min(points.length - 1, progress * (points.length - 1));

    for (let i = 0; i <= Math.floor(end); i++) {
      const point = points[i];

      if (!point) continue;

      if (i === 0) this.pen.moveTo(point.x, point.y);
      else this.pen.lineTo(point.x, point.y);
    }

    const a = points[Math.floor(end)];
    const b = points[Math.floor(end) + 1];

    if (a && b) this.pen.lineTo(a.x + (b.x - a.x) * (end % 1), a.y + (b.y - a.y) * (end % 1));

    this.pen.stroke();
    this.pen.globalAlpha = 1;
  }

  private words(text: string, x: number, y: number, width: number, tone: Ink = 'ink', size = this.tall ? 10 : 11): void {
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
      const px = Math.max(extent / 2 + 5, Math.min(this.width - extent / 2 - 5, x));
      const py = y + (index - (lines.length - 1) / 2) * (size + 3);
      this.pen.fillStyle = this.colors.paper;
      this.pen.fillRect(px - extent / 2 - 2, py - size / 2 - 2, extent + 4, size + 4);
      this.pen.fillStyle = this.colors[tone];
      this.pen.fillText(line, px, py);
    }
  }

  private dial(point: Point, radius: number, states: number, angle: number, scale = 1): void {
    if (radius * scale < .1) return;

    this.pen.beginPath();
    this.pen.arc(point.x, point.y, radius * scale, 0, Math.PI * 2);
    this.pen.fillStyle = this.colors.paper;
    this.pen.fill();
    this.pen.strokeStyle = this.colors.ink;
    this.pen.lineWidth = .8;
    this.pen.stroke();

    for (let index = 0; index < states; index++) {
      const theta = -Math.PI / 2 + index * Math.PI * 2 / states;
      this.line([{ x: point.x + Math.cos(theta) * radius * .78 * scale, y: point.y + Math.sin(theta) * radius * .78 * scale }, { x: point.x + Math.cos(theta) * radius * 1.14 * scale, y: point.y + Math.sin(theta) * radius * 1.14 * scale }], 'ink', .8);
    }

    this.line([point, { x: point.x + Math.sin(angle) * radius * .72 * scale, y: point.y - Math.cos(angle) * radius * .72 * scale }], 'ink', 1.2);
  }

  private ringAndSheet(): void {
    const t = this.time;
    const w = this.width;
    const h = this.height;
    const state = ringState(t);
    const inset = Math.max(smooth(t, 31000, 33000) * (1 - smooth(t, 45000, 47000)), smooth(t, 77000, 79500) * (1 - smooth(t, 110000, 113000)));
    const center = { x: w * (this.tall ? .5 - .13 * inset : .245), y: h * (this.tall ? .23 : .43) };
    const radius = Math.min(w * (this.tall ? .34 : .19), h * (this.tall ? .14 : .30));
    const n = state.length;
    const count = Math.ceil(n);
    const split = smooth(t, 32000, 35000) * (1 - smooth(t, 38000, 41000));
    const open = smooth(t, 69500, 71500) * (1 - smooth(t, 74500, 77000));
    const unroll = smooth(t, 77000, 80200) * (1 - smooth(t, 110000, 113000));
    const sheet = this.tall ? { x: w * .07, y: h * .12, w: w * .61, h: h * .23 } : { x: w * .055, y: h * .16, w: w * .36, h: h * .52 };
    const sites: Point[] = [];
    const siteAt = (index: number): Point => {
      const angle = -Math.PI / 2 + index / n * Math.PI * 2;
      const arc = { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
      const fraction = index / Math.max(1, n - 1);
      const chain = { x: w * (this.tall ? .07 : .05) + fraction * w * (this.tall ? .86 : .39), y: center.y + Math.sin(fraction * Math.PI) * radius * .3 };
      const row = { x: sheet.x + fraction * sheet.w, y: sheet.y + sheet.h };
      const opened = { x: arc.x + (chain.x - arc.x) * open, y: arc.y + (chain.y - arc.y) * open };

      return { x: opened.x + (row.x - opened.x) * unroll, y: opened.y + (row.y - opened.y) * unroll };
    };

    for (let index = 0; index < count; index++) sites.push(siteAt(index));

    if (unroll > 0) this.sheet(sheet, unroll);

    for (let index = 0; index < count; index++) {
      const a = sites[index];
      const b = sites[(index + 1) % count];

      if (!a || !b) continue;

      const closing = index === count - 1;
      const opacity = closing ? (1 - open) * (1 - unroll) : 1;
      const bond: Point[] = [];
      const aAngle = -Math.PI / 2 + index / n * Math.PI * 2;
      const bAngle = closing ? Math.PI * 3 / 2 : -Math.PI / 2 + (index + 1) / n * Math.PI * 2;

      for (let step = 0; step <= 12; step++) {
        const p = step / 12;
        const theta = aAngle + (bAngle - aAngle) * p;
        const ringPoint = { x: center.x + radius * Math.cos(theta), y: center.y + radius * Math.sin(theta) };
        const flat = { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p };
        const flatten = Math.max(open, unroll);
        bond.push({ x: ringPoint.x + (flat.x - ringPoint.x) * flatten, y: ringPoint.y + (flat.y - ringPoint.y) * flatten });
      }

      this.line(bond, 'muted', .9, opacity, smooth(t, index * 220, index * 220 + 900));

      if (split > 0) {
        const from = { x: a.x - Math.sin(aAngle) * 7 * split, y: a.y + Math.cos(aAngle) * 7 * split };
        const to = { x: b.x + Math.sin(bAngle) * 7 * split, y: b.y - Math.cos(bAngle) * 7 * split };
        const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
        const normalLength = Math.hypot(mid.x - center.x, mid.y - center.y) || 1;
        const control = { x: mid.x + (mid.x - center.x) / normalLength * 16 * split, y: mid.y + (mid.y - center.y) / normalLength * 16 * split };
        const curve: Point[] = [];

        for (let step = 0; step <= 20; step++) {
          const p = step / 20;
          curve.push({ x: (1 - p) ** 2 * from.x + 2 * p * (1 - p) * control.x + p * p * to.x, y: (1 - p) ** 2 * from.y + 2 * p * (1 - p) * control.y + p * p * to.y });
        }

        this.line(curve, 'ink', 1.4, 1, split);
      }
    }

    for (const [index, p] of sites.entries()) {
      const born = Math.min(1, Math.max(0, n - index));
      const radiusDial = Math.min(this.tall ? 7 : 10, Math.PI * radius / n * .38) * (1 - unroll * .55);
      const tremble = .12 * Math.sin(t / 550 + index * 1.2);
      const stir = index === 2 ? Math.PI * smooth(t, 8000, 9000) * (1 - smooth(t, 10500, 11500)) : 0;
      const angle = index % 2 * Math.PI + tremble + stir;
      const appear = smooth(t, 300 + index * 180, 850 + index * 180) * born;
      this.dial(p, radiusDial, state.spin === .5 ? 2 : 3, angle, appear * (1 - split));

      if (split > 0) {
        const theta = -Math.PI / 2 + index / n * Math.PI * 2;
        const tangent = { x: -Math.sin(theta) * 7 * split, y: Math.cos(theta) * 7 * split };
        this.dial({ x: p.x - tangent.x, y: p.y - tangent.y }, radiusDial * .52, 2, angle, split);
        this.dial({ x: p.x + tangent.x, y: p.y + tangent.y }, radiusDial * .52, 2, angle + Math.PI, split);
      }
    }

    const title = t < 14500 ? 'A RING OF 8 MAGNETS' : t < 23000 ? 'SPIN ONE HALF · TWO STATES' : t < 31000 ? 'SPIN ONE · THREE STATES' : t < 37500 ? 'AKLT · PAIRED ACROSS EACH BOND' : t < 47000 ? 'PURE CHAIN · NOT FRUSTRATION-FREE' : t < 69500 ? 'EVEN PERIODIC RINGS' : t < 77000 ? t < 74500 ? 'ODD OPEN CHAIN · 9 SITES' : 'RETURNING TO THE RING' : t < 110000 ? 'THE PROOF’S SHEET · SCHEMATIC' : 'ANALYTIC ARGUMENT · TASAKI';
    const compactTitle = (t >= 31000 && t < 49000) || (t >= 77000 && t < 112000);
    this.words(title, this.tall ? (unroll > .5 ? w * .36 : center.x) : w * .245, h * (this.tall ? .035 : .055), w * (this.tall ? compactTitle ? .65 : .9 : .43));

    if (t < 6500) this.words(this.tall ? 'QUANTUM SPINS · A PICTURE' : 'A PICTURE: QUANTUM SPINS DO NOT SIMPLY POINT', center.x, center.y + radius + (this.tall ? 20 : 40), w * (this.tall ? .9 : .43), 'muted');
    else if (t < 31000) this.words(state.settled ? `${Math.round(n)} SITES` : 'THE RING GROWS', center.x, center.y + radius + (this.tall ? 20 : 40), w * (this.tall ? .8 : .4));
    else if (t < 47000) this.words(split > .5 ? 'TWO HALVES PER SITE' : 'WHOLE SPIN-ONE SITES', center.x, center.y + radius + (this.tall ? 20 : 40), w * (this.tall ? .72 : .4), 'muted');

    if (open > 0) {
      for (const p of [sites[0], sites.at(-1)]) {
        if (!p) continue;

        this.line([{ x: p.x, y: p.y + 28 }, { x: p.x, y: p.y + 9 }, { x: p.x - 3, y: p.y + 14 }, { x: p.x, y: p.y + 9 }, { x: p.x + 3, y: p.y + 14 }], 'blue', 1.4, 1, open);
      }

      if (open > .5) this.words('FIELD 3/5 AT BOTH ENDS', w * (this.tall ? .5 : .245), h * (this.tall ? .44 : .85), w * (this.tall ? .9 : .43), 'blue');
    }

    if (t >= 101500) this.smallRings(sheet, smooth(t, 101500, 104000));
  }

  private tile(box: Box, generationX: number, generationY: number): void {
    this.line([{ x: box.x, y: box.y }, { x: box.x + box.w, y: box.y }, { x: box.x + box.w, y: box.y + box.h }, { x: box.x, y: box.y + box.h }, { x: box.x, y: box.y }], 'ink', .9);
    const columns = Math.min(24, 8 * 2 ** generationX);

    for (let index = 1; index < columns; index++) this.line([{ x: box.x + index / columns * box.w, y: box.y }, { x: box.x + index / columns * box.w, y: box.y + box.h }], 'muted', .5, .32);

    const copies = Math.min(8, 2 ** generationY);

    for (let row = 0; row < copies; row++) {
      for (let index = 0; index < 15; index++) {
        const col = (index * 5 + row * 3) % (columns - 1);
        const y = box.y + (row + .1 + ((index * 7) % 13) / 16) / copies * box.h;
        const x = box.x + (col + 1) / columns * box.w;
        this.line([{ x: x - Math.max(1, box.w / columns * .28), y }, { x: x + Math.max(1, box.w / columns * .28), y }], 'ink', .9);

        if (!this.tall && generationY === 0 && index < 5) this.words(['x', 'y', 'z'][index % 3] ?? 'x', x, y - 8, 20, 'muted', 9);
      }
    }

    for (const side of [-1, 1]) {
      const x = box.x + (side > 0 ? box.w : 0);
      const y = box.y + box.h / 2;
      this.line([{ x: x - 3 * side, y: y - 4 }, { x: x + 3 * side, y }, { x: x - 3 * side, y: y + 4 }], 'blue', 1);
    }
  }

  private sheet(box: Box, unroll: number): void {
    const t = this.time;
    const w = this.width;
    const h = this.height;
    const beta = energyBeta(t);
    const energyPower = Math.log2(beta / 2);
    const completedY = Math.floor(energyPower + 1e-8);
    const vertical = energyPower - Math.floor(energyPower);
    const sideways = smooth(t, 92000, 93800);
    const jointProgress = Math.max(0, Math.min(3, (t - 94000) / 2400));
    const completedJoint = Math.floor(jointProgress);
    const joint = smooth((jointProgress % 1) * 2400, 0, 1800);
    const jointActive = t >= 94000 && t < 101200;
    const amountY = jointActive ? joint : vertical;
    const amountX = jointActive ? joint : t >= 92000 && t < 94000 ? sideways : 0;
    const scaleX = 1 / (1 + amountX);
    const scaleY = 1 / (1 + amountY);
    const reveal = smooth(t, 79200, 82000) * unroll;
    const current = { x: box.x, y: box.y + box.h * (1 - scaleY * reveal), w: box.w * scaleX, h: box.h * scaleY * reveal };
    this.pen.save();
    this.pen.beginPath();
    this.pen.rect(box.x - 6, h * (this.tall ? .07 : .09), box.w + (this.tall ? 0 : 50), box.h + h * .12);
    this.pen.clip();
    const gx = (t >= 94000 ? 1 : 0) + completedJoint;
    const gy = completedY + completedJoint;
    this.tile(current, gx, gy);

    if (amountY > 0) this.tile({ ...current, y: current.y - current.h - (1 - amountY) * box.h * .6 }, gx, gy);
    if (amountX > 0) this.tile({ ...current, x: current.x + current.w + (1 - amountX) * box.w * .3 }, gx, gy);
    if (amountX > 0 && amountY > 0) this.tile({ ...current, x: current.x + current.w + (1 - amountX) * box.w * .3, y: current.y - current.h - (1 - amountY) * box.h * .6 }, gx, gy);

    this.pen.restore();

    if (unroll < .8) return;

    const captionY = box.y + box.h + (this.tall ? 13 : 24);

    if (t < 86000) {
      const cursor = smooth(t, 81000, 85500) * 7;
      const x = box.x + cursor / 7 * box.w;
      this.line([{ x, y: box.y + 2 }, { x, y: box.y + box.h - 2 }], 'blue', 1.5);
      this.words('SPACE: 8 SITES · ENDS JOINED', box.x + box.w / 2, captionY, box.w + 20);
      this.labels.place('partition', this.tall ? w * .5 : box.x + box.w / 2, this.tall ? h * .94 : captionY + 37);
      this.labels.place('transfer', x, box.y + 10);
    } else if (t < 94000) {
      this.words(t < 92000 ? `INVERSE TEMPERATURE b = ${beta.toFixed(beta % 1 === 0 ? 0 : 1)}` : 'DOUBLE THE RING · n → 2n', box.x + box.w / 2, captionY, box.w + 20);
      if (!this.tall || t < 89000 || t >= 92000) this.labels.place(t < 92000 ? 'physical-purity' : 'spatial-purity', this.tall ? w * .50 : box.x + box.w / 2, this.tall ? h * .94 : captionY + 48);
    } else if (t < 101500) {
      const state = doublingStep(Math.min(3, completedJoint));
      this.words(`n = ${state.sites} · b = ${state.beta}`, box.x + box.w / 2, captionY, box.w + 20);
      this.words('PAPER’S START · DRAWN SMALLER', box.x + box.w / 2, captionY + (this.tall ? 16 : 20), box.w + 24, 'muted');
      this.labels.place('defect', this.tall ? w * .50 : box.x + box.w / 2, this.tall ? h * .94 : captionY + 54);
    }

    if (this.tall && t < 94000) {
      const power = t < 92000 ? 1 : 1 + sideways;
      const values = [.50, .22, .14, .09, .05].map(value => value ** power);
      const total = values.reduce((sum, value) => sum + value, 0);
      const baseline = h * .44;
      this.words('STEP WEIGHTS', w * .15, h * .43, w * .25, 'muted', 8);

      for (const [index, value] of values.entries()) {
        const x = w * .31 + (index + .5) / values.length * w * .35;
        this.line([{ x, y: baseline }, { x, y: baseline - value / total * 18 }], 'ink', 5);
      }
    }

    if (t < 101500 && !this.tall) {
      const power = t < 92000 ? 1 : t < 94000 ? 1 + sideways : 2 ** (completedJoint + 1);
      const values = [.50, .22, .14, .09, .05].map(value => value ** power);
      const total = values.reduce((sum, value) => sum + value, 0);
      const y = box.y + box.h + 90;

      for (const [index, value] of values.entries()) {
        const x = box.x + (index + .5) / values.length * box.w;
        this.line([{ x, y }, { x, y: y - value / total * 35 }], 'ink', Math.min(12, box.w / 14));
      }

      this.words('STEP WEIGHTS · SCHEMATIC', box.x + box.w / 2, y + 19, box.w);
    }
  }

  private smallRings(sheet: Box, progress: number): void {
    const w = this.width;
    const h = this.height;
    const y = h * (this.tall ? .405 : .86);
    const radius = this.tall ? 5 : 13;

    for (const [index, count] of [6, 8, 10].entries()) {
      const center = { x: sheet.x + (index + .5) / 3 * sheet.w, y };
      const points: Point[] = [];

      for (let site = 0; site <= count; site++) {
        const angle = -Math.PI / 2 + site / count * Math.PI * 2;
        points.push({ x: center.x + Math.cos(angle) * radius * progress, y: center.y + Math.sin(angle) * radius * progress });
      }

      this.line(points, 'ink', .8, 1, progress);
      this.pen.font = `${this.tall ? 8 : 10}px "Special Elite", monospace`;
      this.pen.textAlign = 'center';
      this.pen.textBaseline = 'middle';
      this.pen.fillStyle = this.colors.ink;
      this.pen.fillText(String(count), center.x, y);
    }

    const starting = this.time < 110000;
    const caption = starting
      ? this.tall ? 'b = 21/2, 49/4 · COMPUTER-ASSISTED' : 'STARTING VALUES · COMPUTER-ASSISTED'
      : this.tall ? 'INPUTS NOT INDEPENDENTLY CHECKED · NO LEAN' : 'ESTIMATES NOT INDEPENDENTLY CHECKED';
    this.words(caption, sheet.x + sheet.w / 2, y + (this.tall ? 11 : 29), this.tall ? w * .92 : sheet.w + 30, 'muted', this.tall ? 8 : 11);

    if (!this.tall) this.words(starting ? 'b = 21/2, 49/4' : 'NO LEAN', sheet.x + sheet.w / 2, y + 51, sheet.w, 'muted');
  }
}

import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { smooth, fade } from '../../../lib/animation';
import { MINIMUM_DEGREES, coefficientCount, pointCost } from './math';

import { drawCurvePlane } from './plane';

type Tone = 'ink' | 'blue' | 'muted' | 'paper';

type Point = { x: number; y: number };

function inTransition(time: number, start: number, end: number): boolean {
  return time > start && time < end;
}

export class CurveBudgetFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private tall = false;
  private time = 0;
  private colors: Record<Tone, string> = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly lineLabel: HTMLElement;
  private readonly statusLabel: HTMLElement;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 7, vertical: 6 });
    const lineLabel = root.querySelector<HTMLElement>('[data-label="line"] > span');

    if (!lineLabel) throw new Error('The curve-budget film must have a threshold formula label.');

    this.lineLabel = lineLabel;
    const statusLabel = root.querySelector<HTMLElement>('[data-label="status"] > span');

    if (!statusLabel) throw new Error('The curve-budget film must have an approval stamp.');

    this.statusLabel = statusLabel;
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
    drawCurvePlane(this.pen, this.width, this.height, time, this.colors, (id, x, y, alpha) => this.labels.place(id, x, y, alpha));
    this.plot();
    this.triangle();
    this.lens();

    this.labels.endFrame();
  }

  private line(a: Point, b: Point, tone: Tone = 'ink', alpha = 1, weight = 1): void {
    if (alpha <= 0) return;

    this.pen.strokeStyle = this.colors[tone];
    this.pen.lineWidth = weight;
    this.pen.globalAlpha = alpha;
    this.pen.beginPath();
    this.pen.moveTo(a.x, a.y);
    this.pen.lineTo(b.x, b.y);
    this.pen.stroke();
    this.pen.globalAlpha = 1;
  }

  private dot(point: Point, radius: number, tone: Tone = 'ink', alpha = 1, ring = false): void {
    if (alpha <= 0) return;

    this.pen.globalAlpha = alpha;
    this.pen.beginPath();
    this.pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    this.pen.fillStyle = this.colors[ring ? 'paper' : tone];
    this.pen.fill();
    this.pen.strokeStyle = this.colors[tone];
    this.pen.lineWidth = 1;
    this.pen.stroke();
    this.pen.globalAlpha = 1;
  }

  private words(text: string, x: number, y: number, width: number, alpha = 1, tone: Tone = 'ink', tag = true, fontSize?: number): void {
    if (alpha < .005) return;

    const size = fontSize ?? (tag ? (this.tall ? 10 : 11) : (this.tall ? 14 : 18));
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
      const py = y + (index - (lines.length - 1) / 2) * (size + 3);
      this.pen.fillStyle = this.colors.paper;
      this.pen.fillRect(px - extent / 2 - 2, py - size / 2 - 2, extent + 4, size + 4);
      this.pen.fillStyle = this.colors[tone];
      this.pen.fillText(line, px, py);
    }

    this.pen.globalAlpha = 1;
  }

  private plot(): void {
    const t = this.time;
    const w = this.width;
    const h = this.height;
    const visible = smooth(t, 27800, 29000);
    const strip = smooth(t, 52000, 54000);
    const history = fade(t, 52000, 53500, 61000, 62000);
    const solving = fade(t, 45500, 47000, 52000, 53000);
    const claim = fade(t, 68000, 70000, 74000, 75000);
    const notes = fade(t, 96000, 97000, 105500, 107000);
    const lensLabels = fade(t, 60500, 61000, 68700, 69200);
    const visitor = Math.max(fade(t, 7500, 8500, 27000, 27800), fade(t, 81500, 83000, 97500, 99000));
    const ending = smooth(t, 105500, 107000);
    const top = h * (this.tall ? .53 + visitor * .14 + ending * .08 : .35);
    const bottom = h * (this.tall ? .85 - strip * .05 : .83);
    const left = w * (this.tall ? .15 : .59);
    const right = w * (this.tall ? .9 : .93);
    const compactPlot = !this.tall && right - left < 230;
    const narrowPlot = compactPlot && right - left < 225;
    const narrowPhone = this.tall && w < 300;
    const point = (m: number, d: number) => ({ x: left + m / 8.5 * (right - left), y: bottom - d / 32 * (bottom - top) });
    const nine = fade(t, 36000, 38000, 43000, 44800);
    const square = fade(t, 53000, 55000, 57500, 59500);
    const slope = Math.sqrt(10) + (3 - Math.sqrt(10)) * nine + (4 - Math.sqrt(10)) * square;
    this.line(point(0, 32), point(0, 0), 'muted', visible);
    this.line(point(0, 0), point(8.5, 0), 'muted', visible);

    for (const d of [0, 16, 32]) {
      this.line({ x: left - 3, y: point(0, d).y }, { x: right, y: point(0, d).y }, 'muted', visible * .18, .6);
      this.words(String(d), left - 14, point(0, d).y, 28, visible, 'muted');
    }

    for (const m of [0, 2, 4, 6, 8]) this.words(String(m), point(m, 0).x, bottom + 14, 25, visible, 'muted');

    this.words('m: TIMES THROUGH EACH POINT', (left + right) / 2, bottom + (this.tall ? 30 : 38), right - left + 30, visible);
    const headerRetired = this.tall && t >= 67500 && t < 70000 || t >= 105500;
    const solveHandoff = inTransition(t, 45500, 47000) || inTransition(t, 52000, 53000);
    const claimHandoff = (narrowPlot && inTransition(t, 68000, 70000)) || (this.tall && inTransition(t, 74000, 75000));
    const proofHandoff = (this.tall || compactPlot) && inTransition(t, 81500, 83000);

    if (!headerRetired && !solveHandoff && !claimHandoff && !proofHandoff) {
      this.words('DEGREE d', left + (right - left) * .2, top - 19, right - left, visible * (1 - visitor) * (1 - ending) * (1 - Math.max(solving, claim, notes)));
    }
    const hatch = visible * smooth(t, 28500, 30000) * (1 - nine);
    this.pen.save();
    this.pen.beginPath();
    this.pen.moveTo(left, bottom);
    this.pen.lineTo(right, bottom);
    this.pen.lineTo(right, point(8.5, 8.5 * slope).y);
    this.pen.closePath();
    this.pen.clip();

    for (let x = left - h; x < right; x += 8) this.line({ x, y: bottom }, { x: x + h, y: bottom - h }, 'muted', hatch * .22, .6);

    this.pen.restore();
    this.line(point(0, 0), point(8, 8 * slope), 'blue', visible, 1.7);
    const tenDots = smooth(t, 43000, 45000) * (1 - fade(t, 52000, 53000, 59500, 60500));

    for (const [index, degree] of MINIMUM_DEGREES.entries()) {
      const alpha = visible * tenDots * smooth(t, 43500 + index * 650, 44500 + index * 650);
      const at = point(index + 1, degree);
      const margin = degree - (index + 1) * Math.sqrt(10);
      const radius = this.tall ? 2.6 : 3.3;
      this.dot(at, radius, 'ink', alpha);

      if (margin < .25) {
        const gap = `${degree} > ${(degree - margin).toFixed(2)}`;
        const size = this.tall ? 10 : 11;
        this.pen.font = `${size}px "Special Elite", monospace`;
        const half = this.pen.measureText(gap).width / 2;
        this.words(gap, at.x - radius - 5 - half, at.y - radius - size / 2 - 4, 90, alpha * (1 - smooth(t, 52000, 53000)));
      }
    }

    this.dot(point(3, 10), 3, 'ink', visible * (1 - smooth(t, 36000, 37000)));

    for (let m = 1; m <= 4; m++) this.dot(point(m, 3 * m), this.tall ? 3 : 4, 'ink', nine * smooth(t, 36500 + m * 650, 37500 + m * 650));

    for (let m = 1; m <= 2; m++) this.dot(point(m, 4 * m), 5, 'blue', square, true);

    const lineArrival = t >= 68700 && t < 69200;
    const lineOpacity = visible * (1 - visitor) * (1 - nine) * (1 - square) * (1 - history) * (1 - lensLabels);
    const phoneLineSlot = this.tall && t >= 68700;
    const lineX = phoneLineSlot ? right - 13 : right - (this.tall ? 28 : 48);
    const lineY = phoneLineSlot ? h * .30 : top + (this.tall ? -18 : 25);
    const formulaHandoff = inTransition(t, 52000, 53500)
      || (compactPlot && (inTransition(t, 81500, 83000) || inTransition(t, 97500, 99000)));
    this.labels.place('line', lineX, lineY, lineArrival ? 1 : formulaHandoff ? 0 : lineOpacity);
    this.lineLabel.style.clipPath = lineArrival ? `inset(0 ${lensLabels * 100}% 0 0)` : '';
    this.labels.place('nine', (left + right) / 2, top + 20, nine);
    const historyHandoff = ((!this.tall || narrowPhone) && inTransition(t, 52000, 53500))
      || (this.tall && inTransition(t, 61000, 62000));
    this.words(square > .5 ? '√16 = 4: HITS GRID POINTS' : 'r = 10 · √10 IS IRRATIONAL', (left + right) / 2, top + (this.tall ? 16 : 22), right - left, historyHandoff ? 0 : history);
    this.words('SOLVED AT THESE PINS · m = 1…8', (left + right) / 2, top - 18, right - left + 20, Number(solving === 1));
    const hypothesis = fade(t, 74000, 76000, 96000, 98000);
    const target = point(5, 15);
    this.dot(target, 6, 'ink', hypothesis, true);
    this.words('SUPPOSE A CURVE HERE', target.x - (this.tall ? 12 : 60), target.y - (this.tall ? 23 + 10 * (1 - visitor) : 33), (right - left) * .9, this.tall && proofHandoff ? 0 : hypothesis * (1 - smooth(t, 81500, 83000)));
    const contradiction = hypothesis * smooth(t, 91000, 94000);
    this.line({ x: target.x - 7, y: target.y - 7 }, { x: target.x + 7, y: target.y + 7 }, 'blue', contradiction, 1.6);
    this.line({ x: target.x + 7, y: target.y - 7 }, { x: target.x - 7, y: target.y + 7 }, 'blue', contradiction, 1.6);
    this.words('CANNOT EXIST', left + (right - left) * .24, bottom - 20, (right - left) * .55, Number(contradiction === 1), 'blue');
    const solved = smooth(t, 68000, 70500);
    const stripY = h * (this.tall ? .972 : .955);

    const stripLeft = this.tall ? w * .11 : left;
    const stripRight = this.tall ? w * .96 : right;
    this.words('r', this.tall ? w * .04 : left - 15, stripY - 8, 15, strip, 'muted');

    for (let r = 10; r <= 25; r++) {
      const x = stripLeft + (r - 10) / 15 * (stripRight - stripLeft);
      const done = r === 16 || r === 25 ? 1 : solved;
      const crowdedTick = (narrowPhone && r >= 12 && r <= 23)
        || (compactPlot && r >= 11 && r <= 23)
        || (narrowPlot && r === 25);
      const tickInk = crowdedTick ? Number(strip === 1) : strip;
      this.words(String(r), x, stripY - 8, 20, tickInk, done > .5 ? 'blue' : 'muted', true, this.tall ? 9 : 11);

      if (done > 0) this.line({ x: x - 3, y: stripY + 2 }, { x: x - 3 + 6 * done, y: stripY + 2 }, 'blue', strip, 2);
    }

    const claimLeaving = this.tall && inTransition(t, 74000, 75000);

    if (claim >= .005 && !claimLeaving) {
      const arrival = smooth(t, 68000, 70000);
      const y = h * (this.tall ? .46 : .16) + (this.tall ? 10 * (1 - arrival) : 0);
      this.pen.save();

      if (t < 70000) {
        this.pen.beginPath();
        this.pen.rect(left - 7.5, 0, (right - left + 15) * arrival, h);
        this.pen.clip();
      }

      this.words('EVERY r ≥ 10 · EVERY m\nUNEQUAL MULTIPLICITIES TOO', (left + right) / 2, y, right - left + 15, t < 70000 ? 1 : claim, 'blue');
      this.pen.restore();
    }

    const captionY = h * (this.tall ? .46 : .16);
    const captionWidth = right - left + 15;

    if (t < 105500) this.words('TEVELEV · 21 OCT 2026\nREWORKED IN LECTURE NOTES', (left + right) / 2, captionY, captionWidth, fade(t, 97500, 99000, 105500, 107000));
    else if (t < 107000) {
      this.pen.save();
      this.pen.beginPath();
      this.pen.rect(left - 7.5, captionY - 20, captionWidth, 40);
      this.pen.clip();
      this.pen.translate(-captionWidth * ending, 0);
      this.words('TEVELEV · 21 OCT 2026\nREWORKED IN LECTURE NOTES', (left + right) / 2, captionY, captionWidth);
      this.pen.restore();
    }

    const stampArrival = smooth(t, 106000, 108000);
    this.labels.place('status', (left + right) / 2, captionY, t >= 106000 ? 1 : 0);
    this.statusLabel.style.clipPath = t >= 106000 && t < 108000 ? `inset(0 0 0 ${(1 - stampArrival) * 100}%)` : '';

    if (t >= 108000) {
      this.pen.save();

      if (t < 110000) {
        this.pen.beginPath();
        this.pen.rect(left - 7.5, captionY + 20, captionWidth * smooth(t, 108000, 110000), 20);
        this.pen.clip();
      }

      this.words('COMPANIONS: UNREVIEWED', (left + right) / 2, captionY + 30, captionWidth, 1, 'muted');
      this.pen.restore();
    }
  }

  private triangle(): void {
    const t = this.time;
    const proof = fade(t, 81500, 83000, 96000, 97500);
    const budget = fade(t, 7500, 8500, 27000, 27800);
    const alpha = Math.max(proof, budget);

    if (alpha < .005) return;

    const w = this.width;
    const h = this.height;
    const center = w * (this.tall ? .52 : .76);
    const top = h * (this.tall ? .46 : .075);
    const regionHeight = h * (this.tall ? .16 : .23);
    const degree = proof > .01 ? 4 : t < 10800 ? 2 : t < 21500 ? 3 : t < 24700 ? 9 : 10;
    const rows = degree + 1;
    const spacing = Math.min((w * (this.tall ? .65 : .3)) / rows, regionHeight / rows);
    const shrink = 1 - smooth(t, 89000, 93500) * .08;
    const left = center - degree * spacing / 2;
    const centerY = top + degree * spacing / 2;
    const spent = t < 10800 ? 5 : t < 21500 ? 9 : 60;
    let index = 0;

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < rows - row; column++) {
        const x = left + column * spacing + row * spacing * .5;
        const y = top + row * spacing;
        const filled = proof > .01 ? row <= (t - 83000) / 1250 : index < spent;
        const progress = proof > .01 ? smooth(t, 83000 + row * 1000, 84000 + row * 1000) : smooth(t, 7900 + index * (degree > 4 ? 25 : 90), 8300 + index * (degree > 4 ? 25 : 90));
        this.dot({ x: center + (x - center) * (proof > .01 ? shrink : 1), y: centerY + (y - centerY) * (proof > .01 ? shrink : 1) }, degree > 4 ? 1.5 : 2.3, filled ? 'ink' : 'blue', alpha * progress, !filled);
        index += 1;
      }
    }

    const bottom = top + degree * spacing;
    this.words(proof > .01 ? 'EXPONENT PAIRS · SCHEMATIC' : `DEGREE ${degree}: ${coefficientCount(degree)} COEFFICIENTS`, center, top - (this.tall ? 16 : 22), w * (this.tall ? .84 : .38), alpha);

    if (proof > .01) {
      const a = { x: center + (left - 8 - center) * shrink, y: centerY + (top - 8 - centerY) * shrink };
      const b = { x: center + (left + degree * spacing + 8 - center) * shrink, y: a.y };
      const c = { x: center, y: centerY + (bottom + 8 - centerY) * shrink };
      this.line(a, b, 'blue', alpha * .6);
      this.line(a, c, 'blue', alpha * .6);
      this.line(b, c, 'blue', alpha * .6);
      const proofEntering = (this.tall || w < 675) && t < 83000;
      this.words(t < 89000 ? 'ONE ROW AT A TIME' : 'GAP → ROOM TO SHRINK → FULL RANK', center, bottom + (this.tall ? 14 : 22), w * (this.tall ? .9 : .4), proofEntering ? 0 : alpha, 'blue');
    } else {
      const note = t < 10800 ? '5 POINTS USE 5 · 1 LEFT' : t < 14500 ? '9 POINTS USE 9 · THE 10TH USES ALL' : t < 21500 ? `${pointCost(2)} AT THE NODE + 6 = 9 OF 10` : t < 24700 ? '60 CONDITIONS > 55 COEFFICIENTS' : '66 COEFFICIENTS > 60 CONDITIONS';
      this.words(note, center, bottom + (this.tall ? 16 : 25), w * (this.tall ? .9 : .42), budget, 'blue');
      const costs = fade(t, 15500, 16500, 20500, 21500);

      if (costs > .01) {
        for (let m = 1; m <= 4; m++) {
          const cx = center + (m - 2.5) * w * (this.tall ? .20 : .09);
          const cy = this.tall ? h * .78 : bottom + 82;
          this.words(`m = ${m}`, cx, cy - 22, w * .17, costs);

          for (let row = 0; row < m; row++) {
            for (let col = 0; col < m - row; col++) this.dot({ x: cx + (col - (m - row - 1) / 2) * 6, y: cy + row * 5 }, 1.5, 'ink', costs);
          }

          this.words(String(pointCost(m)), cx, cy + 28, w * .17, costs, 'blue');
        }
      }
    }
  }

  private lens(): void {
    const alpha = fade(this.time, 61000, 63000, 67500, 68700);

    if (alpha < .005) return;

    this.pen.save();

    if (this.tall) {
      this.pen.fillStyle = this.colors.paper;
      this.pen.fillRect(this.width * .06, this.height * .43, this.width * .9, this.height * .3);
      this.pen.beginPath();
      this.pen.rect(this.width * .06, this.height * .43, this.width * .9, this.height * .3);
      this.pen.clip();
    }

    const entrance = smooth(this.time, 61000, 63000);
    const departure = smooth(this.time, 67500, 68700);
    const carry = departure ** 3;
    const x = this.width * (this.tall ? .5 - .07 * (1 - entrance) + .1 * carry : .76);
    const y = this.height * (this.tall ? .54 + .22 * (1 - entrance) - .30 * carry : .16);
    const opacity = this.tall ? 1 : alpha;
    const span = this.width * (this.tall ? .65 : .28);
    const lensLabelInk = this.tall || alpha === 1 ? 1 : 0;
    this.words('FAR OUT: m = 37', x, y - 25, span, lensLabelInk);
    this.line({ x: x - span / 2, y }, { x: x + span / 2, y }, 'ink', opacity);

    for (const d of [116, 117, 118, 119]) {
      const px = x - span / 2 + (d - 116) / 3 * span;
      this.line({ x: px, y: y - 4 }, { x: px, y: y + 4 }, 'ink', opacity);
      this.words(String(d), px, y + 15, 35, d === 117 ? lensLabelInk : opacity);
    }

    const old = x - span / 2 + span / 3;
    const exact = x - span / 2 + (37 * Math.sqrt(10) - 116) / 3 * span;
    this.line({ x: exact, y: y - 13 }, { x: exact, y: y + 4 }, 'blue', opacity, 2);
    this.words('117.0043', exact + 20, y - 15, 90, lensLabelInk, 'blue');
    this.line({ x: old, y: y + 5 }, { x: old, y: y + 22 }, 'muted', opacity);
    this.words('OLD BOUND ALLOWS 117\nNAGATA REQUIRES AT LEAST 118', x, y + 43, span + 30, !this.tall && this.width < 675 ? lensLabelInk : opacity, 'blue');
    this.pen.restore();
  }
}

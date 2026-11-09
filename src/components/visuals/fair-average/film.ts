import { freeBall, leftMultiply, diskMap, FIXED_POINT, integerShare, freeShare } from './math';
import { smooth, fade } from './story';
import { drawThompsonGraph } from './graph';

type Tone = 'ink' | 'blue' | 'muted' | 'paper';

type Point = { x: number; y: number };

const BALL = new Set(freeBall(2));

const MOVED = new Set(Array.from(BALL, word => leftMultiply('a', word)));

const UNION = Array.from(new Set([...BALL, ...MOVED]));

function treePoint(word: string): Point {
  let angle = 0;
  let span = Math.PI * 2;
  let previous = '';

  for (const [index, letter] of Array.from(word).entries()) {
    const allowed = Array.from('aAbB').filter(move => move !== (previous === previous.toUpperCase() ? previous.toLowerCase() : previous.toUpperCase()));
    const position = allowed.indexOf(letter);
    const nextSpan = span / allowed.length;
    angle = index === 0 ? -Math.PI / 2 + (position + .5) * nextSpan : angle - span / 2 + (position + .5) * nextSpan;
    span = nextSpan * .8;
    previous = letter;
  }

  const radius = word.length / 3;

  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

const TREE_POINTS = new Map(UNION.map(word => [word, treePoint(word)]));

export class FairAverageFilm {
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
    drawThompsonGraph(this.pen, this.width, this.height, time, this.colors, (id, x, y, alpha) => this.label(id, x, y, alpha));
    this.sets();
    this.history();
    this.colorDisk();
    this.fixedPoints();
    this.gauge();
    this.ending();

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

  private dot(p: Point, radius: number, tone: Tone = 'ink', alpha = 1, ring = false): void {
    if (alpha < .005) return;

    this.pen.globalAlpha = alpha;
    this.pen.beginPath();
    this.pen.arc(p.x, p.y, radius, 0, Math.PI * 2);
    this.pen.fillStyle = this.colors[ring ? 'paper' : tone];
    this.pen.fill();
    this.pen.strokeStyle = this.colors[tone];
    this.pen.lineWidth = 1.1;
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

  private arrow(from: Point, to: Point, tone: Tone, alpha = 1): void {
    this.line([from, to], tone, alpha, 1.2);
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    this.line([{ x: to.x - 4 * Math.cos(angle - .6), y: to.y - 4 * Math.sin(angle - .6) }, to, { x: to.x - 4 * Math.cos(angle + .6), y: to.y - 4 * Math.sin(angle + .6) }], tone, alpha);
  }

  private sets(): void {
    const t = this.time;
    const alpha = fade(t, 15000, 16600, 32500, 33800);

    if (alpha < .005) return;

    const paradox = fade(t, 15000, 16500, 22500, 23700);
    const center = { x: this.width * ((this.tall ? .5 : .75) - paradox * (this.tall ? .12 : .07)), y: this.height * (this.tall ? .57 : .32) };
    const radius = Math.min(this.width * (this.tall ? .28 : .17), this.height * (this.tall ? .09 : .23));
    const integers = fade(t, 23500, 24500, 28000, 29200);
    const treeAlpha = alpha * (1 - integers);
    const translated = smooth(t, 29000, 30500);
    this.words(integers > .5 ? 'A RUN OF WHOLE NUMBERS' : 'THE FREE GROUP ON a, b', center.x, center.y - radius - (this.tall ? 6 : 18), this.width * (this.tall ? .9 : .43), alpha * (t >= 94500 ? 0 : 1));

    for (const word of UNION) {
      const p = TREE_POINTS.get(word);
      const parent = TREE_POINTS.get(word.slice(0, -1));

      if (!p) continue;

      const screen = { x: center.x + radius * p.x, y: center.y + radius * p.y };

      if (parent && word) {
        const parentWord = word.slice(0, -1);
        const originalEdge = BALL.has(word) && BALL.has(parentWord);
        const movedEdge = MOVED.has(word) && MOVED.has(parentWord);
        const edgeAlpha = originalEdge ? treeAlpha : movedEdge ? treeAlpha * translated : 0;
        this.line([{ x: center.x + radius * parent.x, y: center.y + radius * parent.y }, screen], originalEdge ? 'muted' : 'blue', edgeAlpha * .6);
      }

      if (MOVED.has(word)) this.dot(screen, this.tall ? 3.6 : 5, 'blue', treeAlpha * translated, true);
      if (BALL.has(word)) this.dot(screen, this.tall ? 2 : 3, 'ink', treeAlpha);
    }

    const n = t < 25000 ? 5 : t < 26000 ? 10 : t < 27000 ? 20 : 40;
    const width = this.width * (this.tall ? .8 : .36);

    for (let index = 0; index <= n; index++) {
      const x = center.x - width / 2 + index / n * width;

      if (index < n) this.dot({ x, y: center.y - 10 }, n > 20 ? 1.4 : 2.4, 'ink', alpha * integers);
      if (index > 0) this.dot({ x, y: center.y + 12 }, n > 20 ? 1.4 : 2.4, 'blue', alpha * integers);
    }

    this.words(integers > .5 ? `ONLY TWO ENDS DIFFER · 2/${n}` : translated > .5 ? '18 OF 17 CHANGE · BLUE = MOVED SET' : '17 ELEMENTS · RADIUS 2', center.x, this.tall ? this.height * .685 : center.y + radius + 19, this.width * (this.tall ? .9 : .43), alpha, translated > .5 || integers > .5 ? 'blue' : 'muted');
    this.label('share', this.width * (this.tall ? .85 : .75), this.height * (this.tall ? .57 : .63), fade(t, 30500, 31000, 32000, 33000));
    const iconX = this.width * (this.tall ? .79 : .91);
    const iconR = this.tall ? 7 : 12;
    this.dot({ x: iconX, y: center.y - 25 }, iconR, 'ink', paradox, true);
    this.arrow({ x: iconX, y: center.y - 11 }, { x: iconX, y: center.y + 4 }, 'blue', paradox);
    this.dot({ x: iconX - iconR - 3, y: center.y + 18 }, iconR, 'ink', paradox, true);
    this.dot({ x: iconX + iconR + 3, y: center.y + 18 }, iconR, 'ink', paradox, true);
    this.words('1 → 2', iconX, center.y + 40, 65, paradox, 'muted');
  }

  private history(): void {
    const t = this.time;
    const alpha = fade(t, 32500, 34000, 62000, 63000);

    if (alpha < .005) return;

    const x = this.width * (this.tall ? .5 : .75);
    const y = this.height * (this.tall ? .58 : .32);
    const span = this.width * (this.tall ? .88 : .41);
    const routes = 1 - smooth(t, 41000, 42000);
    this.words('1979 · GEOGHEGAN: NO FAIR AVERAGE?', x, y - (this.tall ? 31 : 72), span, alpha * routes);
    this.words('CONTAINS A NONABELIAN FREE GROUP?  ×', x, y, span, alpha * routes);
    this.words('BUILT FROM FINITE + ABELIAN PIECES?  ×', x, y + 33, span, alpha * routes, 'muted');
    const tower = fade(t, 41500, 43000, 47500, 48700);
    this.label('tower', x, y, tower);
    this.words('MOORE 2013 · IF F PASSED\nSETS AT LEAST THIS LARGE · SCHEMATIC', x, y + (this.tall ? 40 : 75), span, tower, 'muted');
    const timeline = smooth(t, 48000, 49300);
    const left = x - span * .43;
    const right = x + span * .43;
    const pos = (year: number) => left + (year - 1979) / 47 * (right - left);
    this.line([{ x: left, y }, { x: right, y }], 'muted', timeline * alpha);
    const cases = [{ year: 2009, text: 'SHAVGULIDZE', direction: 'AMENABLE' }, { year: 2012, text: 'MOORE', direction: 'WITHDRAWN' }, { year: 2021, text: 'AKHMEDOV', direction: 'NOT ACCEPTED' }];
    const selected = t < 51000 ? 0 : t < 54000 ? 1 : 2;

    for (const [index, entry] of cases.entries()) {
      const px = pos(entry.year);
      this.words('×', px, y, 18, alpha * timeline, 'ink', false);

      if (!this.tall || selected === index) {
        const labelX = this.tall ? x : left + (index + .5) / 3 * (right - left);
        this.line([{ x: px, y: y - 6 }, { x: labelX, y: y - (this.tall ? this.height * .055 : 30) }], 'muted', alpha * timeline * .4);
        this.words(`${entry.year} · ${entry.text}\n${entry.direction}`, labelX, y - (this.tall ? this.height * .08 : 50), this.tall ? span : span / 3, alpha * timeline * (1 - smooth(t, 57000, 58000)));
      }
    }

    this.words('1979', left, y + 20, 45, alpha * timeline);
    this.words('2026', right, y + 20, 45, alpha * timeline);
    this.words('ABOUT ONE FALSE PROOF A YEAR', x, y + 47, span, alpha * timeline * (1 - smooth(t, 57000, 58000)), 'muted');
    const claim = smooth(t, 57000, 58500);
    this.dot({ x: right, y }, 4, 'blue', alpha * claim);
    this.words('OPENAI · 23 SEP 2026\nCLAIM: F IS NOT AMENABLE', x, y - (this.tall ? this.height * .08 : 43), span, alpha * claim, 'blue');
  }

  private colorDisk(): void {
    const t = this.time;
    const alpha = fade(t, 62000, 63800, 86000, 87000) + fade(t, 94500, 95700, 102500, 103500);

    if (alpha < .005) return;

    const center = { x: this.width * (this.tall ? .5 : .75), y: this.height * (this.tall ? (t >= 94500 ? .52 : .58) : .30) };
    const radius = Math.min(this.width * (this.tall ? .26 : .15), this.height * (this.tall ? (t >= 94500 ? .075 : .10) : .20));
    this.dot(center, radius, 'muted', alpha, true);
    this.words('COLORS AS VECTORS · SCHEMATIC', center.x, center.y - radius - (this.tall ? 6 : 18), this.width * (this.tall ? .9 : .43), alpha * (t >= 94500 ? 0 : 1));
    const converging = smooth(t, 77500, 82500);
    const average = { x: center.x + radius * .16, y: center.y - radius * .08 };

    for (let index = 0; index < 12; index++) {
      const angle = index * 2.399963;
      const r = radius * (.35 + index % 4 * .13) * (1 - converging * .8);
      const p = { x: average.x + Math.cos(angle) * r, y: average.y + Math.sin(angle) * r };
      const shown = smooth(t, 62500 + index * 190, 63500 + index * 190);
      this.arrow(center, p, 'muted', alpha * shown * .4);
      this.dot(p, 2, 'ink', alpha * shown);
    }

    this.dot(average, 4, 'blue', alpha);
    this.words('m', average.x + 12, average.y - 8, 20, alpha, 'blue', false);
    const reached = t >= 94500 ? radius * .58 : radius * .10;
    const image = { x: average.x + reached, y: average.y + reached * .25 };
    this.arrow(average, image, 'blue', alpha * smooth(t, 70500, 73000));
    this.words(t >= 94500 ? 'DISTANCE AT LEAST 1/2' : 'm ≈ f(m)', center.x, this.tall && t >= 94500 ? this.height * .61 : center.y + radius + 18, this.width * (this.tall ? .88 : .4), alpha * smooth(t, 70500, 73000) * (this.tall ? 1 - fade(t, 71000, 72500, 77000, 78200) : 1), 'blue');
    this.label('colors', center.x - (this.tall ? 55 : 75), this.tall ? this.height * .70 : center.y + radius + 45, fade(t, 71000, 72500, 77000, 78200));
    this.label('mean', center.x + (this.tall ? 56 : 95), this.tall ? this.height * .70 : center.y + radius + 45, fade(t, 71000, 72500, 77000, 78200));
    this.label('floor', center.x, this.tall ? this.height * .70 : center.y + radius + 53, fade(t, 95500, 97000, 102500, 103500));
  }

  private fixedPoints(): void {
    const t = this.time;
    const alpha = fade(t, 86000, 87500, 94500, 95500);

    if (alpha < .005) return;

    const center = { x: this.width * (this.tall ? .5 : .63), y: this.height * (this.tall ? .59 : .33) };
    const radius = Math.min(this.width * (this.tall ? .24 : .10), this.height * (this.tall ? .105 : .18));
    const wavePart = this.tall ? smooth(t, 89700, 90700) : 1;
    const diskAlpha = alpha * (this.tall ? 1 - wavePart : 1);
    const point = (p: Point) => ({ x: center.x + radius * p.x, y: center.y - radius * p.y });
    this.dot(center, radius, 'muted', diskAlpha, true);

    for (let x = -.8; x <= .8; x += .4) {
      for (let y = -.8; y <= .8; y += .4) {
        if (x * x + y * y > .9) continue;

        this.arrow(point({ x, y }), point(diskMap({ x, y })), 'ink', diskAlpha * .7);
      }
    }

    this.dot(point(FIXED_POINT), 4, 'blue', diskAlpha, true);
    this.words('A FLAT DISK', center.x, center.y - radius - (this.tall ? 8 : 19), this.width * (this.tall ? .9 : .24), diskAlpha);
    this.words('CONTINUOUS MAP: A FIXED POINT', center.x, this.tall ? this.height * .73 : center.y + radius + 25, this.width * (this.tall ? .9 : .26), diskAlpha, 'blue');
    const x = this.width * (this.tall ? .5 : .86);
    const waveW = this.width * (this.tall ? .65 : .18);
    const top = this.height * (this.tall ? .5 : .19);
    const gap = this.height * (this.tall ? .045 : .09);

    for (let level = 0; level < 4; level++) {
      const points: Point[] = [];

      for (let sample = 0; sample <= 96; sample++) points.push({ x: x - waveW / 2 + sample / 96 * waveW, y: top + level * gap + Math.cos(sample / 96 * Math.PI * 2 * 2 ** level) * gap * .24 });

      this.line(points, level === 3 ? 'blue' : 'ink', alpha * wavePart, 1);
    }

    this.words('ENDLESS NEW DIRECTIONS', x, top - 22, this.width * (this.tall ? .9 : .24), alpha * wavePart);
    this.words(this.tall ? 'INFINITE DIMENSIONS · SCHEMATIC\nEVERY POINT MOVES ≥ 1/2' : 'INFINITE DIMENSIONS · SCHEMATIC\nEVERY POINT MOVES BY AT LEAST 1/2', x, this.tall ? this.height * .715 : top + 4 * gap + 15, this.width * (this.tall ? .9 : .26), alpha * wavePart, 'blue');
  }

  private gauge(): void {
    const t = this.time;
    const alpha = smooth(t, 23500, 25500);
    const w = this.width;
    const h = this.height;
    const left = w * (this.tall ? .48 : .72);
    const right = w * (this.tall ? .82 : .94);
    const labelX = w * (this.tall ? .24 : .61);
    const y = h * (this.tall ? .84 : .73);
    const gap = h * (this.tall ? .06 : .08);
    const n = t < 25000 ? 5 : t < 26000 ? 10 : t < 27000 ? 20 : 40;
    const radius = t < 30500 ? 2 : t < 31500 ? 4 : 8;
    const claim = smooth(t, 94500, 97000);
    const undecided = .48 + .30 * Math.sin(t / 2400) * (1 - smooth(t, 57000, 59000));
    const rows = [
      { title: this.tall ? 'INTEGERS' : 'WHOLE NUMBERS', value: integerShare(n), text: t > 28000 ? '→ 0' : integerShare(n).toFixed(2), alpha },
      { title: 'FREE GROUP', value: freeShare(radius), text: `≈ ${freeShare(radius).toFixed(3)}`, alpha: alpha * smooth(t, 29000, 31000) },
      { title: 'THOMPSON F', value: undecided * (1 - claim) + .2 * claim, text: claim > .9 ? '> 0' : '?', alpha: alpha * smooth(t, 32500, 34000) },
    ];
    this.words(t >= 94500 ? 'SHARE CHANGED · FLOOR SCHEMATIC' : 'SHARE CHANGED BY A MOVE', w * (this.tall ? .5 : .75), y - (this.tall ? this.height * .05 : 30), w * (this.tall ? .9 : .44), alpha);

    for (const [index, row] of rows.entries()) {
      const py = y + index * gap;
      const px = left + row.value / 1.2 * (right - left);
      this.words(row.title, labelX, py, w * (this.tall ? .43 : .21), row.alpha);
      this.line([{ x: left, y: py }, { x: right, y: py }], 'muted', row.alpha * .6);
      this.line([{ x: left, y: py - 3 }, { x: left, y: py + 3 }], 'muted', row.alpha);
      this.line([{ x: left + (right - left) / 1.2, y: py - 3 }, { x: left + (right - left) / 1.2, y: py + 3 }], 'muted', row.alpha);
      this.dot({ x: px, y: py }, 3, index === 2 && claim > .5 ? 'blue' : 'ink', row.alpha);
      this.words(row.text, this.tall ? w * .93 : right + 23, py, 45, row.alpha, index === 2 ? 'blue' : 'muted');

      if (index === 2) {
        this.line([{ x: px, y: py - 5 }, { x: px, y: py + 5 }], 'blue', claim * row.alpha, 2);
        this.line([{ x: px, y: py }, { x: right, y: py }], 'blue', claim * row.alpha, 2);
      }
    }
  }

  private ending(): void {
    const alpha = smooth(this.time, 102500, 104500);
    const x = this.width * (this.tall ? .5 : .75);
    const y = this.height * (this.tall ? .51 : .22);
    this.label('status', x, y, alpha);
    this.words('KIM & LODHA · 13 OCT 2026\nTHEIR OWN TWO-PAGE PROOF · NO AI', x, y + (this.tall ? 44 : 64), this.width * (this.tall ? .92 : .43), alpha);
    this.words('MOORE’S COGNAC: STILL CLOSED', x, this.tall ? this.height * .72 : y + 108, this.width * (this.tall ? .92 : .43), smooth(this.time, 110000, 112000), 'muted');
  }
}

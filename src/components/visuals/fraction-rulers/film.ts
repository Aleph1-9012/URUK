import { CEILINGS, CONVERGENTS, PI_SCALED, PI_SCALE, type Convergent } from './approximations';
import type { SeriesData } from './series';
import { ceilingAt, fade, mix, sceneAt, span, type Box, type Layout } from './story';

type Ink = 'ink' | 'blue' | 'muted' | 'paper';

type XY = readonly [number, number];

// Signed misses are subtracted as integers before becoming drawing coordinates.
function miss(fraction: Convergent): number {
  return fraction.numerator * PI_SCALE > PI_SCALED * fraction.denominator ? fraction.error : -fraction.error;
}

export class FractionRulersFilm {
  private readonly pen: CanvasRenderingContext2D;
  private colors: Record<Ink, string> = { ink: '#1c1a17', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  private width = 1;
  private height = 1;
  private dpr = 1;
  private layout: Layout = 'wide';
  private time = 0;
  private series: SeriesData | undefined;
  private readonly shown = new Set<string>();
  private readonly labelSizes = new Map<string, { width: number; height: number }>();

  constructor(private readonly canvas: HTMLCanvasElement, private readonly labels: ReadonlyMap<string, HTMLElement>) {
    const context = canvas.getContext('2d');

    if (!context) throw new Error('The fraction rulers film needs a canvas context.');

    this.pen = context;
  }

  setSeries(data: SeriesData): void {
    this.series = data;
  }

  resize(): void {
    const bounds = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, bounds.width);
    this.height = Math.max(1, bounds.height);
    this.layout = this.width >= this.height ? 'wide' : 'tall';
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    const style = getComputedStyle(this.canvas);

    for (const key of ['ink', 'blue', 'muted', 'paper'] as const) {
      this.colors[key] = style.getPropertyValue(`--${key}`).trim() || this.colors[key];
    }

    this.labelSizes.clear();
  }

  draw(time: number): void {
    this.time = time;
    this.shown.clear();
    this.pen.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineJoin = 'round';
    this.pen.lineCap = 'round';
    this.ruler();
    this.chart();
    this.sumStrip();
    this.proof();

    for (const [id, label] of this.labels) {
      if (!this.shown.has(id)) label.style.visibility = 'hidden';
    }
  }

  private path(points: readonly XY[], tone: Ink, alpha = 1, weight = 1): void {
    if (alpha <= 0 || points.length < 2) return;

    this.pen.beginPath();

    for (const [index, [x, y]] of points.entries()) {
      if (index === 0) this.pen.moveTo(x * this.width, y * this.height);
      else this.pen.lineTo(x * this.width, y * this.height);
    }

    this.pen.globalAlpha = alpha;
    this.pen.strokeStyle = this.colors[tone];
    this.pen.lineWidth = weight;
    this.pen.stroke();
    this.pen.globalAlpha = 1;
  }

  private dot(x: number, y: number, radius: number, tone: Ink, alpha = 1, ring = false): void {
    if (alpha <= 0) return;

    this.pen.beginPath();
    this.pen.arc(x * this.width, y * this.height, radius, 0, 2 * Math.PI);
    this.pen.globalAlpha = alpha;
    this.pen.fillStyle = this.colors[ring ? 'paper' : tone];
    this.pen.fill();

    if (ring) {
      this.pen.strokeStyle = this.colors[tone];
      this.pen.lineWidth = 1.3;
      this.pen.stroke();
    }

    this.pen.globalAlpha = 1;
  }

  private words(text: string, x: number, y: number, width: number, alpha = 1, tone: Ink = 'ink', tag = false): void {
    if (alpha <= 0) return;

    const size = tag ? (this.layout === 'tall' ? 10 : 11) : (this.layout === 'tall' ? 14 : 17);
    this.pen.font = tag ? `${size}px "Special Elite", monospace` : `italic ${size}px Alegreya, Georgia, serif`;
    const lines: string[] = [];

    for (const paragraph of text.split('\n')) {
      let line = '';

      for (const word of paragraph.split(' ')) {
        const candidate = line ? `${line} ${word}` : word;

        if (line && this.pen.measureText(candidate).width > width * this.width) {
          lines.push(line);
          line = word;
        } else line = candidate;
      }

      lines.push(line);
    }

    this.pen.textAlign = 'center';
    this.pen.textBaseline = 'middle';
    this.pen.globalAlpha = alpha;

    for (const [index, line] of lines.entries()) {
      const extent = this.pen.measureText(line).width;
      const px = Math.max(extent / 2 + 6, Math.min(this.width - extent / 2 - 6, x * this.width));
      const py = y * this.height + (index - (lines.length - 1) / 2) * (size + 3);
      this.pen.fillStyle = this.colors.paper;
      this.pen.fillRect(px - extent / 2 - 3, py - size * 0.65, extent + 6, size * 1.3);
      this.pen.fillStyle = this.colors[tone];
      this.pen.fillText(line, px, py);
    }

    this.pen.globalAlpha = 1;
  }

  private formula(id: string, x: number, y: number, alpha = 1): void {
    const label = this.labels.get(id);

    if (!label || alpha < 0.005) return;

    let size = this.labelSizes.get(id);

    if (!size) {
      const rect = label.firstElementChild?.getBoundingClientRect();
      size = { width: rect?.width ?? 0, height: rect?.height ?? 0 };
      this.labelSizes.set(id, size);
    }

    const px = Math.max(size.width / 2 + 8, Math.min(this.width - size.width / 2 - 8, x * this.width));
    const py = Math.max(size.height / 2 + 5, Math.min(this.height - size.height / 2 - 5, y * this.height));
    label.style.transform = `translate(${px.toFixed(2)}px, ${py.toFixed(2)}px)`;
    label.style.opacity = alpha.toFixed(3);
    label.style.visibility = 'visible';
    this.shown.add(id);
  }

  private hatch(box: Box, alpha: number, tone: Ink = 'muted'): void {
    if (alpha <= 0 || box.w <= 0 || box.h <= 0) return;

    for (let y = Math.ceil(box.y * this.height / 6) * 6; y < (box.y + box.h) * this.height; y += 6) {
      this.path([[box.x, y / this.height], [box.x + box.w, y / this.height]], tone, alpha, 1 / this.dpr);
    }
  }

  private bracket(left: number, right: number, y: number, alpha: number, tone: Ink = 'blue'): void {
    this.path([[left, y - 0.01], [left, y], [right, y], [right, y - 0.01]], tone, alpha);
  }

  private ruler(): void {
    const time = this.time;
    const state = sceneAt(time, this.layout).ruler;
    const place = (offset: number) => 0.1 + ((offset * state.multiplier - state.center) / state.width + 0.5) * 0.8;
    const y = 0.22;
    const pi = place(0);
    const opening = 1 - span(time, 6500, 7200);
    const sevenths = fade(time, 7000, 9000, 14900, 15800);
    const closeLook = fade(time, 15500, 17000, 22000, 23200);
    const near355 = span(time, 18500, 20200);
    const multiple = span(time, 80100, 83500);
    let index = time < 18500 ? 0 : 2;

    if (time >= 32200 && time < 80000) index = Math.min(21, Math.floor((time - 32200) / 300));

    const fraction = CONVERGENTS[index];

    if (!fraction) return;

    this.words(time < 6500 ? 'FRACTIONS NEAR PI' : time < 80000 ? 'FRACTION RULER' : 'WHOLE NUMBERS NEAR A MULTIPLE OF PI', 0.5, 0.035, 0.88, 1, 'muted', true);
    this.path([[0.1, y], [mix(0.1, 0.9, span(time, 0, 1300)), y]], 'ink');
    const q = fraction.denominator;
    const qNumber = Number(q);
    const stride = BigInt(Math.max(1, Math.ceil(state.width / state.multiplier * qNumber / 10)));
    const central = BigInt(Math.round((Math.PI + state.center / state.multiplier) * qNumber));

    for (let step = -7; step <= 7; step += 1) {
      const numerator = central + BigInt(step) * stride;
      const offset = Number((numerator * PI_SCALE - PI_SCALED * q) / (10n ** 180n)) / 1e120 / qNumber;
      const x = place(offset);

      if (x < 0.1 || x > 0.9) continue;

      this.path([[x, y - 0.014], [x, y + 0.014]], 'muted', 0.75, 1 / this.dpr);

      if (sevenths > 0.01) {
        if (numerator === 21n) this.formula('sevenths-21', x, 0.31, sevenths);
        if (numerator === 22n) this.formula('fraction-0', x, 0.31, sevenths);
        if (numerator === 23n) this.formula('sevenths-23', x, 0.31, sevenths);
      }
    }

    const targetAlpha = span(time, 300, 1500);
    this.path([[pi, 0.17], [pi, 0.255]], 'blue', targetAlpha, 1.5);
    this.dot(pi, y, 3.5, 'blue', targetAlpha);
    this.formula('pi', pi, 0.145, targetAlpha * (1 - span(time, 79900, 80100)));
    this.formula('multiple', pi, 0.12, span(time, 83500, 84500));
    const f7 = CONVERGENTS[0];
    const f113 = CONVERGENTS[2];

    if (!f7 || !f113) return;

    for (const [at, f] of [[0, f7], [2, f113]] as const) {
      const x = place(miss(f));
      const visible = x >= 0.1 && x <= 0.9;

      if (visible && (time < 32000 || time >= 80000 && at === 2)) this.dot(x, y, 3, 'ink', span(time, at === 0 ? 1300 : 3000, at === 0 ? 2400 : 4300));
    }

    if (opening > 0) {
      const scaleAlpha = 1 - span(time, 6200, 6800);

      for (let value = 310; value <= 318; value += 1) {
        const x = place(value / 100 - Math.PI);

        if (x < 0.1 - 1e-10 || x > 0.9 + 1e-10) continue;

        this.path([[x, y - 0.008], [x, y + 0.008]], 'muted', scaleAlpha, 1 / this.dpr);

        if (value === 310 || value === 314 || value === 318) this.words((value / 100).toFixed(2), x, 0.267, 0.17, scaleAlpha, 'muted');
      }

      this.formula('fraction-0', 0.72, 0.34, opening * span(time, 1300, 2400));
      this.formula('fraction-2', 0.28, 0.34, opening * span(time, 3000, 4300));
      this.path([[place(miss(f7)), y], [0.72, 0.29]], 'muted', opening * span(time, 1300, 2400), 1 / this.dpr);
      this.path([[place(miss(f113)), y], [0.28, 0.29]], 'muted', opening * span(time, 3000, 4300), 1 / this.dpr);
      this.words('3.142857…', 0.72, 0.44, 0.4, opening * span(time, 1300, 2400));
      this.words('3.1415929…', 0.28, 0.44, 0.4, opening * span(time, 3000, 4300));
      this.words('The blue mark is π = 3.14159265…', 0.5, 0.59, 0.82, opening, 'blue');
    }

    if (sevenths > 0) {
      const left = place(miss(f7) - 1 / 14);
      const right = place(miss(f7) + 1 / 14);
      this.hatch({ x: Math.max(0.1, left), y: 0.19, w: Math.min(0.9, right) - Math.max(0.1, left), h: 0.06 }, sevenths * 0.35, 'blue');
      const wholeStep = sevenths * span(time, 9200, 9800);
      this.bracket(place(3 - Math.PI), place(miss(f7)), 0.38, wholeStep, 'ink');
      this.words('ONE STEP', 0.29, 0.445, 0.26, wholeStep, 'muted', true);
      this.formula('step-seven', 0.29, 0.51, wholeStep);
      this.words('ALWAYS WITHIN\nHALF A STEP', 0.68, 0.445, 0.42, sevenths, 'blue', true);
      this.formula('half-step', 0.68, 0.53, sevenths);
    }

    if (time >= 32000 && time < 80000) {
      this.dot(place(miss(fraction)), y, 5, 'ink', 1, true);
      this.dot(pi, y, 3, 'blue');
    }

    const active = near355 > 0.5 ? f113 : f7;
    const end = place(miss(active));

    if (closeLook > 0 && end > 0.1 && end < 0.9) {
      this.bracket(pi, end, 0.29, closeLook);
      this.formula(near355 > 0.5 ? 'fraction-2' : 'fraction-0', end + 0.16, 0.34, closeLook);
    }

    const firstMiss = closeLook * (1 - span(time, 18100, 18800));
    const lastMiss = closeLook * span(time, 19700, 20700);
    this.words('MISSES BY 0.00126', 0.5, 0.45, 0.85, firstMiss, 'blue', true);
    this.words('56 times inside half a step', 0.5, 0.54, 0.85, firstMiss);
    this.words('MISSES BY 0.000000267', 0.5, 0.45, 0.85, lastMiss, 'blue', true);
    this.words('About 16,600 times inside', 0.5, 0.54, 0.85, lastMiss);
    const zoomTag = fade(time, 15000, 16300, 79500, 80200);
    const zoom = Math.round(0.34 / state.width);
    this.words(`MAGNIFIED ×${zoom.toLocaleString('en-US')}`, 0.5, 0.085, 0.85, zoomTag, 'muted', true);
    this.words(`denominator ${qNumber.toLocaleString('en-US')}${stride > 1n ? ' · some ticks shown' : ''}`, 0.5, 0.315, 0.85, fade(time, 31000, 32500, 79000, 80200));

    this.words('STRETCH THE RULER BY 113', 0.5, 0.31, 0.85, fade(time, 80000, 81000, 83200, 84200), 'muted', true);

    if (multiple > 0) {
      const integer = place(miss(f113));
      this.dot(integer, y, 3.5, 'ink', multiple);
      this.formula('multiple', pi - 0.12, 0.13, span(time, 83500, 84500));
      this.words('355', integer + 0.12, 0.13, 0.25, span(time, 83500, 84500));
      this.bracket(pi, integer, 0.255, multiple);
      this.words('355 misses 113π by 0.00003014', 0.5, 0.31, 0.87, span(time, 85100, 86600), 'blue');
    }
  }

  private chart(): void {
    const time = this.time;
    const scene = sceneAt(time, this.layout);
    const box = scene.chart;
    const arrival = span(time, 22500, 25500);
    const sumVisit = fade(time, 80200, 83000, 96400, 99200);
    const alpha = arrival * (1 - 0.83 * sumVisit);
    const compact = this.layout === 'tall' ? span(time, 96800, 99500) : 0;
    const details = arrival * (1 - fade(time, 79500, 80700, 98600, 99600));
    const x = (log: number) => box.x + log / 12.2 * box.w;
    const y = (level: number) => box.y + (box.top - level) / (box.top - box.bottom) * box.h;

    if (arrival <= 0) return;

    let heading = 'CLOSENESS OF EACH FRACTION';

    if (time >= 72400 && time < 80000) heading = 'UNKNOWN THRESHOLD · SCHEMATIC';
    if (this.layout === 'tall' && time >= 97800 && time < 106000) heading = 'SUPPOSE MORE KEEP COMING';

    this.words(heading, box.x + box.w / 2, box.y - 0.065, box.w, details * (1 - span(time, 109200, 109700)), 'muted', true);
    this.pen.save();
    this.pen.translate(0.025 * this.width, (box.y + box.h / 2) * this.height);
    this.pen.rotate(-Math.PI / 2);
    this.pen.font = '10px "Special Elite", monospace';
    this.pen.fillStyle = this.colors.muted;
    this.pen.textAlign = 'center';
    this.pen.globalAlpha = details * span(box.h * this.height, 80, 110);
    this.pen.fillText('EXPONENT ACHIEVED', 0, 0);
    this.pen.restore();
    this.path([[box.x, box.y], [box.x, box.y + box.h], [box.x + box.w, box.y + box.h]], 'ink', alpha);
    const levels = box.top > 15 ? [2, 10, 20, 30, 40] : box.top > 5 ? [2, 4, 6, 8] : [2, 2.5, 3, 3.5];

    for (const level of levels) {
      if (level > box.top) continue;

      this.path([[box.x - 0.008, y(level)], [box.x + box.w, y(level)]], 'muted', alpha * 0.22, 1 / this.dpr);
      this.words(String(level), box.x - 0.035, y(level), 0.06, details);
    }

    for (const power of this.layout === 'wide' ? [0, 2, 4, 6, 8, 10, 12] : [0, 4, 8, 12]) {
      const text = power === 0 ? '1' : `10${String(power).replaceAll('0', '⁰').replaceAll('1', '¹').replaceAll('2', '²').replaceAll('4', '⁴').replaceAll('6', '⁶').replaceAll('8', '⁸')}`;
      this.path([[x(power), box.y + box.h], [x(power), box.y + box.h + 0.01]], 'ink', alpha, 1 / this.dpr);
      this.words(text, x(power), box.y + box.h + mix(0.045, 0.025, compact), 0.11, details);
    }

    this.words('DENOMINATOR · LOG SCALE', box.x + box.w / 2, box.y + box.h + 0.095, box.w, details * (1 - compact), 'muted', true);
    this.formula('q', box.x + box.w * 0.52, box.y + box.h + 0.045, details * compact);
    this.formula('error-rule', 0.5, this.layout === 'wide' ? 0.315 : 0.35, fade(time, 22400, 24200, 29800, 31000));
    const two = y(2);
    const dirichlet = span(time, 30700, 32500);
    this.path([[box.x, two], [mix(box.x, box.x + box.w, dirichlet), two]], 'blue', alpha * dirichlet, 1.4);
    this.words('EVERY IRRATIONAL NUMBER\nREACHES 2 AGAIN AND AGAIN', box.x + box.w * 0.64, box.y + box.h * 0.4, box.w * 0.66, details * fade(time, 31600, 33600, 38800, 40000), 'blue', true);

    this.hatch({ x: box.x, y: box.y, w: box.w, h: Math.max(0, y(scene.dial) - box.y) }, alpha * fade(time, 97800, 100600, 110000, 113000) * 0.12, 'blue');
    const view = scene.ruler;

    for (const [index, fraction] of CONVERGENTS.entries()) {
      const start = index === 0 ? 26300 : index === 2 ? 28000 : 32000 + (index === 1 ? 0 : index - 2) * 300;
      const end = start + (index === 0 || index === 2 ? 1700 : 850);
      const travel = span(time, start, end);
      const opacity = span(time, start, start + 400) * alpha;
      const sourceX = Math.min(0.9, Math.max(0.1, 0.1 + (miss(fraction) * view.multiplier - view.center + view.width / 2) / view.width * 0.8));
      const px = mix(sourceX, x(fraction.logQ), travel);
      const py = mix(0.22, y(fraction.exponent), travel);
      const selected = time >= 65000 && fraction.exponent > scene.dial;

      if (opacity <= 0) continue;

      this.path([[sourceX, 0.22], [px, py]], 'blue', opacity * (1 - travel) * 0.2, 1 / this.dpr);
      this.dot(px, py, 2.8, 'ink', opacity);

      if (selected) this.dot(px, py, 5.5, 'blue', opacity * span(time, 65000, 66300), true);

      const labelled = index === 0 || index === 2 || time < 97000 && selected && (index === 10 || index === 19);
      const inHistory = fade(time, 47400, 49000, 60700, 62700);
      const room = this.layout === 'tall' ? 1 - span(time, 96800, 99000) : 1;
      const dialLabels = index === 0 || index === 2 ? 1 - fade(time, 64700, 65500, 71600, 72400) : 1;

      if (labelled && details > 0) {
        const labelY = index === 0 ? py - 0.065 : index === 2 ? py + 0.075 : index === 10 ? box.y + box.h * 0.55 : box.y + box.h * 0.35;
        const labelX = index === 19 ? px - 0.055 : px;
        this.path([[px, py], [labelX, labelY]], 'muted', details * room * dialLabels * (1 - inHistory) * 0.5, 1 / this.dpr);
        this.formula(`fraction-${index}`, labelX, labelY, details * room * dialLabels * (1 - inHistory) * span(time, end - 500, end));
      }
    }

    const question = details * fade(time, 39400, 41000, 46600, 48000);
    this.formula('mu', box.x + box.w * 0.67, box.y + box.h * 0.15, question);
    this.words('Highest recurring level\nunknown', box.x + box.w * 0.67, box.y + box.h * 0.45, box.w * 0.58, question, 'blue');
    this.beyond(box, scene.dial, details);
    this.records(box, details);

    const claim = details * fade(time, 61500, 63500, 64800, 65700);
    this.words('CLAIMED', box.x + box.w * 0.65, box.y + box.h * 0.28, box.w * 0.45, claim, 'blue', true);
    this.formula('claim', box.x + box.w * 0.65, box.y + box.h * 0.48, claim);

    if (time >= 65000) {
      const dialY = y(scene.dial);
      const dialAlpha = details * span(time, 65000, 66700);
      this.path([[box.x, dialY], [box.x + box.w, dialY]], 'blue', alpha * span(time, 65000, 66700), 1.4);
      this.path([[box.x + box.w * 0.31, box.y + 0.04], [box.x + box.w * 0.31, dialY]], 'blue', dialAlpha * 0.25, 1 / this.dpr);
      this.formula('nu', box.x + box.w * 0.25, box.y + 0.015, dialAlpha);
      this.words(scene.dial.toFixed(2), box.x + box.w * 0.40, box.y + 0.015, 0.16, dialAlpha, 'blue');
      const count = CONVERGENTS.reduce((total, item) => total + (item.exponent > scene.dial ? 1 : 0), 0);
      this.words(`${count} SHOWN ABOVE`, box.x + box.w * 0.72, box.y + box.h * 0.1, box.w * 0.44, dialAlpha * (1 - span(time, 96800, 98300)), 'blue', true);
    }

    this.formula('status', box.x + box.w / 2, box.y - 0.065, span(time, 113300, 114200));
  }

  private beyond(box: ReturnType<typeof sceneAt>['chart'], dial: number, alpha: number): void {
    const time = this.time;
    const show = alpha * fade(time, 39100, 41000, 96400, 98300);

    if (show <= 0) return;

    const left = box.x + box.w + 0.02;
    this.hatch({ x: left, y: box.y, w: 0.06, h: box.h }, show * 0.3);
    this.pen.setLineDash([3, 4]);
    this.path([[left, box.y], [left, box.y + box.h]], 'muted', show, 1 / this.dpr);
    this.pen.setLineDash([]);
    const threshold = span(time, 72400, 74000);
    this.pen.save();
    this.pen.translate((left + 0.035) * this.width, (box.y + box.h / 2) * this.height);
    this.pen.rotate(-Math.PI / 2);
    this.pen.font = '10px "Special Elite", monospace';
    this.pen.textAlign = 'center';
    this.pen.fillStyle = this.colors.muted;
    this.pen.globalAlpha = show * (1 - threshold);
    this.pen.fillText('BEYOND ANY SCREEN', 0, 0);
    this.pen.restore();
    const cutoff = box.y + (box.top - dial) / (box.top - box.bottom) * box.h;
    this.hatch({ x: left, y: box.y, w: 0.06, h: cutoff - box.y }, show * threshold * 0.6, 'blue');
    this.words('PAST', left + 0.025, box.y + 0.02, 0.12, show * threshold, 'muted', true);
    this.formula('threshold', left + 0.025, box.y + 0.1, show * threshold);
    this.words('NONE\nABOVE', left + 0.025, box.y + 0.21, 0.14, show * threshold, 'blue', true);
  }

  private records(box: ReturnType<typeof sceneAt>['chart'], alpha: number): void {
    const time = this.time;
    const show = alpha * fade(time, 49700, 50200, 63700, 65300);

    if (show <= 0) return;

    const limit = ceilingAt(time);
    const py = box.y + (box.top - limit) / (box.top - box.bottom) * box.h;

    if (py < box.y) return;

    this.hatch({ x: box.x, y: box.y, w: box.w, h: py - box.y }, show * 0.4);
    this.path([[box.x, py], [box.x + box.w, py]], 'ink', show, 1.4);
    const index = time < 51500 ? 0 : time < 52800 ? 1 : time < 54100 ? 2 : time < 55400 ? 3 : 4;
    const record = CEILINGS[index];

    if (!record) return;

    const ended = [50000, 52000, 53300, 54600, 56000][index] ?? 56500;
    const settled = show * span(time, ended, ended + 200) * (1 - span(time, 60400, 61300));
    this.words(`${record.name.toUpperCase()} · ${record.year}`, box.x + box.w * 0.58, box.y + 0.14, box.w * 0.8, settled, 'ink', true);
    this.words(`CEILING ≈ ${record.value}`, box.x + box.w * 0.58, box.y + 0.23, box.w * 0.65, settled);

    for (const [at, old] of CEILINGS.entries()) {
      if (at >= index || old.value > box.top) continue;

      const oldY = box.y + (box.top - old.value) / (box.top - box.bottom) * box.h;
      this.path([[box.x, oldY], [box.x + box.w, oldY]], 'muted', show * 0.2, 1 / this.dpr);

      if (Math.abs(oldY - 0.025 - (box.y + 0.14)) < 0.055 || Math.abs(oldY - 0.025 - (box.y + 0.23)) < 0.055) continue;

      this.words(String(old.year), box.x + box.w * (0.16 + at * 0.17), oldY - 0.025, box.w * 0.16, show * 0.6, 'muted', true);
    }

    const gap = fade(time, 60500, 61800, 64200, 65000) * alpha;
    const floor = box.y + (box.top - 2) / (box.top - box.bottom) * box.h;
    this.path([[box.x + box.w * 0.88, py], [box.x + box.w * 0.93, py], [box.x + box.w * 0.93, floor], [box.x + box.w * 0.88, floor]], 'muted', gap);
    this.words('NOT KNOWN BEFORE', box.x + box.w * 0.6, box.y + box.h * 0.67, box.w * 0.6, gap, 'muted', true);
  }

  private sumStrip(): void {
    const time = this.time;
    const scene = sceneAt(time, this.layout);
    const box = scene.sum;
    const alpha = fade(time, 80700, 83300, 96400, 99000);

    if (alpha <= 0 || box.y > 1) return;

    const wording = alpha * span(time, 84000, 85000) * (1 - span(time, 96000, 97200));

    const plot: Box = { x: box.x, y: box.y + 0.055, w: box.w, h: box.h - 0.13 };
    const x = (n: number) => plot.x + Math.log(n) / Math.log(2_000_000) * plot.w;
    const y = (total: number) => plot.y + plot.h * (1 - total / 32);
    this.pen.globalAlpha = alpha;
    this.pen.fillStyle = this.colors.paper;
    this.pen.fillRect(0.055 * this.width, (box.y - 0.09) * this.height, 0.89 * this.width, (box.h + 0.095) * this.height);
    this.pen.globalAlpha = 1;
    this.path([[0.07, box.y - 0.09], [0.93, box.y - 0.09]], 'muted', alpha * 0.45, 1 / this.dpr);
    this.words('FLINT HILLS\nRUNNING TOTAL', 0.29, box.y - 0.045, 0.38, wording, 'muted', true);
    this.formula('sum', 0.71, box.y - 0.045, wording);
    this.path([[plot.x, plot.y], [plot.x, plot.y + plot.h], [plot.x + plot.w, plot.y + plot.h]], 'muted', alpha, 1 / this.dpr);
    this.words('32', plot.x - 0.055, plot.y, 0.09, wording);
    this.words('0', plot.x - 0.055, plot.y + plot.h, 0.09, wording);

    for (const [n, title] of [[1, '1'], [355, '355'], [2_000_000, '2 million']] as const) {
      this.words(title, x(n), plot.y + plot.h + 0.045, 0.23, wording);
    }

    this.words('TERMS · LOG SCALE', 0.5, plot.y + plot.h + 0.085, 0.65, wording, 'muted', true);
    const data = this.series;

    if (!data) {
      this.words('Calculating the running sum…', 0.5, plot.y + plot.h / 2, 0.75, wording);

      return;
    }

    const before = Math.exp(Math.log(354) * span(time, 83600, 88400));
    const after = Math.exp(mix(Math.log(355), Math.log(2_000_000), span(time, 91000, 95400)));
    const early: XY[] = [];
    const late: XY[] = [];

    for (let index = 0; index < data.indices.length; index += 1) {
      const n = data.indices[index];
      const total = data.totals[index];

      if (n === undefined || total === undefined) continue;

      if (n <= 354 && n <= before) early.push([x(n), y(total)]);
      if (n >= 355 && n <= after) late.push([x(n), y(total)]);
    }

    this.path(early, 'ink', alpha, 1.6);
    const jump = span(time, 88800, 90900);
    const jumpX = x(355);
    this.path([[jumpX, y(data.beforeJump)], [jumpX, y(mix(data.beforeJump, data.afterJump, jump))]], 'blue', alpha, 2);
    this.path(late, 'ink', alpha * span(time, 90800, 91300), 1.6);
    this.dot(jumpX, y(data.beforeJump), 2.8, 'ink', alpha * span(time, 87800, 88700));
    this.dot(jumpX, y(data.afterJump), 3.3, 'blue', alpha * jump);
    this.words('4.81', jumpX - 0.075, y(data.beforeJump) - 0.01, 0.15, wording * span(time, 87800, 88700));
    this.words('29.41', jumpX + 0.09, y(data.afterJump) - 0.04, 0.2, wording * jump, 'blue');
    const end = wording * span(time, 94300, 95500);
    this.dot(x(2_000_000), y(data.total), 3, 'blue', end);
    this.words(data.total.toFixed(4), 0.82, y(data.total) + 0.05, 0.29, end, 'blue');
    const reference = CONVERGENTS[2];

    if (reference) {
      const cx = scene.chart.x + reference.logQ / 12.2 * scene.chart.w;
      const cy = scene.chart.y + (scene.chart.top - reference.exponent) / (scene.chart.top - scene.chart.bottom) * scene.chart.h;
      this.path([[jumpX, y(data.beforeJump)], [jumpX, plot.y + plot.h + 0.018], [cx, cy]], 'blue', alpha * jump * 0.55, 1 / this.dpr);
      this.dot(cx, cy, 3, 'blue', alpha);
      this.formula('fraction-2', cx - 0.03, cy + 0.065, wording);
    }
  }


  private proof(): void {
    const time = this.time;
    const tall = this.layout === 'tall';
    const alpha = span(time, tall ? 100000 : 97800, tall ? 101300 : 100600);

    if (alpha <= 0) return;

    const scene = sceneAt(time, this.layout);
    const chart = scene.chart;
    const chartX = (log: number) => chart.x + log / 12.2 * chart.w;
    const chartY = (level: number) => chart.y + (chart.top - level) / (chart.top - chart.bottom) * chart.h;
    const upper = span(time, 106000, 111500);
    const contradiction = span(time, 109700, 111500);
    const chosen = [[3.2, 2.85], [7.8, 3.25], [11.5, 2.75]] as const;
    const grid = { x: tall ? 0.3 : 0.69, y: tall ? 0.82 : 0.56, size: tall ? 0.16 : 0.105 };
    const count = mix(4, 7, upper);
    const rows = Math.ceil(count);
    const height = grid.size * this.width / this.height;
    const top = grid.y - height / 2;
    const bottom = grid.y + height / 2;
    const left = grid.x - grid.size / 2;
    const right = grid.x + grid.size / 2;
    this.path([[left + 0.008, top], [left, top], [left, bottom], [left + 0.008, bottom]], 'ink', alpha);
    this.path([[right - 0.008, top], [right, top], [right, bottom], [right - 0.008, bottom]], 'ink', alpha);
    this.words('SCHEMATIC', grid.x, tall ? 0.735 : 0.425, tall ? 0.45 : 0.26, alpha, 'muted', true);
    this.formula('det', grid.x, tall ? 0.94 : 0.72, alpha);

    if (!tall) {
      this.formula('proof-hypothesis', 0.76, 0.35, alpha * (1 - span(time, 112000, 114000)));
      this.words('BUILT FROM THE\nSUPPOSED FRACTIONS', grid.x, 0.79, 0.26, alpha * (1 - span(time, 112000, 114000)), 'muted', true);
    }

    const collection = span(time, 99600, 104500);

    for (const [index, [log, level]] of chosen.entries()) {
      const x = chartX(log);
      const y = chartY(level);
      const travel = span(time, 100000 + index * 650, 103000 + index * 650);
      const destination: XY = [grid.x + (index - 1) * grid.size / 5, grid.y];
      this.dot(x, y, 4.5, 'blue', alpha * (1 - contradiction), true);
      this.path([[x, y], [mix(x, destination[0], travel), mix(y, destination[1], travel)]], 'blue', alpha * (1 - travel) * 0.45, 1 / this.dpr);
      this.dot(mix(x, destination[0], travel), mix(y, destination[1], travel), 2.4, 'blue', alpha * (1 - contradiction));

      if (contradiction > 0) {
        this.path([[x - 0.016, y - 0.015], [x + 0.016, y + 0.015]], 'blue', alpha * contradiction, 1.4);
        this.path([[x - 0.016, y + 0.015], [x + 0.016, y - 0.015]], 'blue', alpha * contradiction, 1.4);
      }
    }

    if (!tall) this.words('SUPPOSE INFINITELY MANY ABOVE', chart.x + chart.w * 0.64, chart.y + chart.h * 0.42, chart.w * 0.68, alpha * (1 - span(time, 104800, 106000)), 'blue', true);

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < rows; column += 1) {
        const x = left + (column + 1) / (count + 1) * grid.size;
        const y = top + (row + 1) / (count + 1) * height;
        const reveal = Math.min(1, Math.max(0, collection * rows * rows - row * rows - column));
        this.dot(x, y, tall ? 1.05 : 1.3, row === column ? 'blue' : 'ink', alpha * reveal * span(count, Math.max(row, column), Math.max(row, column) + 1));
      }
    }

    const gauge = { x: tall ? 0.79 : 0.92, top: tall ? 0.785 : 0.49, bottom: tall ? 0.905 : 0.86 };
    const sizeY = (log: number) => gauge.top + (1 - log) / 3 * (gauge.bottom - gauge.top);
    const floor = sizeY(0);
    const ceiling = sizeY(mix(0.7, -1.3, upper));
    const revealGauge = alpha * span(time, 101000, 104000);
    this.path([[gauge.x, gauge.top], [gauge.x, gauge.bottom]], 'ink', revealGauge);
    this.hatch({ x: gauge.x - 0.075, y: gauge.top, w: 0.1, h: floor - gauge.top }, revealGauge * 0.4);
    this.path([[gauge.x - 0.085, floor], [gauge.x + 0.035, floor]], 'ink', revealGauge, 1.6);
    this.words('1', gauge.x + 0.065, floor, 0.1, revealGauge);
    this.formula('floor', tall ? 0.76 : 0.81, tall ? 0.745 : floor - 0.07, revealGauge);

    if (!tall) this.words('CLEARED SIZE', 0.85, 0.43, 0.22, revealGauge, 'muted', true);

    const upperAlpha = revealGauge * span(time, 105700, 107000);
    this.hatch({ x: gauge.x - 0.075, y: ceiling, w: 0.1, h: gauge.bottom - ceiling }, upperAlpha * 0.65, 'blue');
    this.path([[gauge.x - 0.085, ceiling], [gauge.x + 0.035, ceiling]], 'blue', upperAlpha, 1.6);
    this.formula('ceiling', tall ? 0.76 : 0.81, tall ? 0.955 : 0.9, upperAlpha);
    const gap = Math.max(0, ceiling - floor);
    this.hatch({ x: gauge.x - 0.075, y: floor, w: 0.1, h: gap }, alpha * contradiction * 0.3, 'blue');
    this.path([[gauge.x - 0.045, floor + gap * 0.25], [gauge.x + 0.005, floor + gap * 0.75]], 'blue', alpha * contradiction, 1.5);
    this.path([[gauge.x - 0.045, floor + gap * 0.75], [gauge.x + 0.005, floor + gap * 0.25]], 'blue', alpha * contradiction, 1.5);
    this.words('BOTH CANNOT HOLD', chart.x + chart.w / 2, chart.y - 0.065, chart.w, alpha * contradiction * (1 - span(time, 112600, 113200)), 'blue', true);

    // Moving proof links pass behind the axis lettering, like the other plot lines.
    if (tall) {
      const compact = span(time, 96800, 99500);
      const lettering = 1 - fade(time, 79500, 80700, 98600, 99600);

      for (const [power, name] of [[0, '1'], [4, '10⁴'], [8, '10⁸'], [12, '10¹²']] as const) {
        this.words(name, chartX(power), chart.y + chart.h + mix(0.045, 0.025, compact), 0.11, lettering);
      }
    }

  }
}

import { EDGES, BAD_EDGES, HIDDEN_LABELS, WALK_LABELS, WALK_EDGES, CUT_LABELS, agreement, AGREE_GAMMA } from './math';

type Point = { x: number; y: number };

type Tone = 'ink' | 'blue' | 'muted' | 'paper';

type Box = { x: number; y: number; w: number; h: number };

function ease(time: number, start: number, end: number): number {
  const t = Math.max(0, Math.min(1, (time - start) / (end - start)));

  return t * t * (3 - 2 * t);
}

function fade(time: number, start: number, end: number, leave = Infinity, gone = Infinity): number {
  return ease(time, start, end) * (leave === Infinity ? 1 : 1 - ease(time, leave, gone));
}

export class UniqueRulesFilm {
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

    for (const key of ['ink', 'blue', 'muted', 'paper'] as const) {
      this.colors[key] = style.getPropertyValue(`--${key}`).trim() || this.colors[key];
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
    this.network();
    this.gauge();
    this.closeup();
    this.agreementPlot();

    for (const [id, label] of this.labels) {
      if (!this.visible.has(id)) label.style.visibility = 'hidden';
    }
  }

  private line(a: Point, b: Point, tone: Tone = 'ink', opacity = 1, weight = 1): void {
    if (opacity <= 0) return;

    this.pen.globalAlpha = opacity;
    this.pen.strokeStyle = this.colors[tone];
    this.pen.lineWidth = weight;
    this.pen.beginPath();
    this.pen.moveTo(a.x, a.y);
    this.pen.lineTo(b.x, b.y);
    this.pen.stroke();
    this.pen.globalAlpha = 1;
  }

  private circle(point: Point, radius: number, tone: Tone, filled = true, opacity = 1): void {
    this.pen.globalAlpha = opacity;
    this.pen.beginPath();
    this.pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    this.pen.fillStyle = this.colors[filled ? tone : 'paper'];
    this.pen.fill();
    this.pen.strokeStyle = this.colors[tone];
    this.pen.lineWidth = 1.3;
    this.pen.stroke();
    this.pen.globalAlpha = 1;
  }

  private words(text: string, x: number, y: number, width: number, opacity = 1, tone: Tone = 'ink', tag = true): void {
    if (opacity < .005) return;

    const size = tag ? (this.tall ? 10 : 11) : (this.tall ? 14 : 17);
    const leading = size + 4;
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

    this.pen.globalAlpha = opacity;

    for (const [index, line] of lines.entries()) {
      const extent = this.pen.measureText(line).width;
      const px = Math.max(extent / 2 + 5, Math.min(this.width - extent / 2 - 5, x));
      const py = y + (index - (lines.length - 1) / 2) * leading;
      this.pen.fillStyle = this.colors.paper;
      this.pen.fillRect(px - extent / 2 - 2, py - size / 2 - 2, extent + 4, size + 4);
      this.pen.fillStyle = this.colors[tone];
      this.pen.fillText(line, px, py);
    }

    this.pen.globalAlpha = 1;
  }

  private label(id: string, x: number, y: number, opacity = 1): void {
    const label = this.labels.get(id);

    if (!label || opacity < .005) return;

    const size = this.sizes.get(id) ?? { x: 0, y: 0 };
    label.style.transform = `translate(${Math.max(size.x / 2 + 7, Math.min(this.width - size.x / 2 - 7, x))}px,${Math.max(size.y / 2 + 5, Math.min(this.height - size.y / 2 - 5, y))}px)`;
    label.style.visibility = 'visible';
    label.style.opacity = String(opacity);
    this.visible.add(id);
  }

  private hatch(box: Box, opacity = .4): void {
    this.pen.save();
    this.pen.beginPath();
    this.pen.rect(box.x, box.y, box.w, box.h);
    this.pen.clip();

    for (let x = Math.floor((box.x - box.h) / 8) * 8; x < box.x + box.w; x += 8) {
      this.line({ x, y: box.y + box.h }, { x: x + box.h, y: box.y }, 'muted', opacity, .6);
    }

    this.pen.restore();
  }

  private network(): void {
    const t = this.time;
    const center = { x: this.width * (this.tall ? .5 : .25), y: this.height * (this.tall ? .25 : .44) };
    const radius = Math.min(this.width * (this.tall ? .25 : .17), this.height * (this.tall ? .14 : .28));
    const points: Point[] = [center];

    for (let index = 0; index < 6; index++) {
      const angle = -Math.PI / 2 + index * Math.PI / 3;
      points.push({ x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) });
    }

    const maxCut = fade(t, 58500, 60000, 74500, 76000);
    const changed = ease(t, 17500, 18800);
    const best = ease(t, 29000, 31500);
    const bits = Math.max(fade(t, 50000, 52000, 57500, 58500), ease(t, 84500, 86700));
    const walkStart = t < 17500 ? 9500 : 19000;
    const walkStep = (t - walkStart) / 650;
    const walk = t < 17500 ? HIDDEN_LABELS : WALK_LABELS;
    const order = [1, 2, 3, 4, 5, 6, 0];
    const rules = t < 17500 ? EDGES : BAD_EDGES;
    const labels = maxCut > .5 ? CUT_LABELS : best > .5 ? HIDDEN_LABELS : walk;
    const marks = fade(t, 13500, 16000, 17500, 18200) + fade(t, 24500, 26500, 33000, 34000);
    this.words(t >= 84500 ? 'BUILT FROM 3SAT · SCHEMATIC' : maxCut > .5 ? (this.tall ? 'MAX-CUT · BEST: 9 OF 12' : 'MAX-CUT') : 'ONE REPLY AT EACH END', center.x, this.height * (this.tall ? .025 : .08), this.width * (this.tall ? .86 : .43));

    for (const [index, rule] of rules.entries()) {
      const a = points[rule.from];
      const b = points[rule.to];

      if (!a || !b) continue;

      const reveal = ease(t, 500 + index * 240, 1300 + index * 240);
      const cut = labels[rule.from] !== labels[rule.to];
      const kept = cut === rule.opposite;
      const tone = maxCut > .5 && cut ? 'blue' : 'ink';
      const end = { x: a.x + (b.x - a.x) * reveal, y: a.y + (b.y - a.y) * reveal };
      this.line(a, end, tone, maxCut > .5 && !cut ? .27 : .75, maxCut > .5 && cut ? 2 : 1);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      const normal = { x: -(b.y - a.y) / length, y: (b.x - a.x) / length };
      const crossOpacity = maxCut > 0 ? maxCut : rule.opposite ? 1 : 0;
      this.line({ x: mid.x - normal.x * 5, y: mid.y - normal.y * 5 }, { x: mid.x + normal.x * 5, y: mid.y + normal.y * 5 }, tone, crossOpacity * reveal);

      if (rule.from === 3 && rule.to === 4) {
        this.circle(mid, 10, 'blue', false, changed * (1 - ease(t, 33000, 35000)));
      }

      if (marks > .01 && t < 34000) {
        const offset = rule.from === 0 ? -13 : 13;
        this.words(kept ? '✓' : '×', mid.x + normal.x * offset, mid.y + normal.y * offset, 25, Math.min(1, marks), kept ? 'muted' : 'blue', false);
      }
    }

    if (t > walkStart && t < walkStart + 3900) {
      const segment = Math.floor(walkStep);
      const edge = WALK_EDGES[segment];
      const from = points[edge?.[0] ?? 1];
      const to = points[edge?.[1] ?? 0];
      const part = walkStep - segment;

      if (from && to) this.circle({ x: from.x + (to.x - from.x) * part, y: from.y + (to.y - from.y) * part }, 4, 'blue');
    }

    for (const [index, point] of points.entries()) {
      const reached = order.indexOf(index) <= walkStep || t > 25000;
      const on = reached && labels[index] === 1;
      this.circle(point, this.tall ? 7 : 9, on ? 'blue' : 'ink', on);
      this.words(String(index), point.x + (index === 0 ? 15 : (point.x - center.x) / radius * 16), point.y + (index === 0 ? 0 : (point.y - center.y) / radius * 17), 18, 1, 'muted');

      if (!this.tall && bits > .01) {
        for (let bit = 0; bit < 4; bit++) {
          const x = point.x + (bit - 1.5) * 8;
          const y = point.y + 24;
          this.circle({ x, y }, 2.4, bit % 2 === labels[index] ? 'blue' : 'ink', bit % 2 === labels[index], bits);
        }
      }
    }

    const keyY = center.y + radius + (this.tall ? 22 : 48);
    const keyX = center.x - (this.tall ? 68 : 75);
    this.line({ x: keyX - 12, y: keyY }, { x: keyX + 12, y: keyY });
    this.words('SAME', keyX + 35, keyY, 55);
    this.line({ x: keyX + 86, y: keyY }, { x: keyX + 110, y: keyY });
    this.line({ x: keyX + 98, y: keyY - 5 }, { x: keyX + 98, y: keyY + 5 });
    this.words('OPPOSITE', keyX + 147, keyY, 70);
    const intro = fade(t, 3900, 4700, 9000, 9600);
    this.words('OFF → ON    ON → OFF\nONE REPLY EACH', center.x, keyY + 35, this.width * .43, intro, 'blue');

    if (maxCut > .01 && !this.tall) this.words('BEST CUT: 9 OF 12', center.x, keyY + 25, this.width * (this.tall ? .8 : .43), maxCut, 'blue');
  }

  private gauge(): void {
    const t = this.time;
    const coverStage = fade(t, 67500, 69000, 74500, 76000);
    const proofStage = fade(t, 93000, 94700, 111500, 113000);
    const shortLabels = fade(t, 50500, 52000, 57500, 58500);
    const lowerLabels = 1 - Math.max(fade(t, 49500, 50200, 57800, 58500), fade(t, 92500, 93000, 112500, 114000));
    const box = { x: this.width * (this.tall ? .12 : .56), y: this.height * (this.tall ? .65 - .02 * coverStage - .05 * proofStage : .44), w: this.width * (this.tall ? .76 : .36), h: this.height * .07 };
    const mid = box.x + box.w / 2;
    const appear = ease(t, 11500, 14000);
    const cut = fade(t, 58500, 60500, 74500, 76000);
    const zones = fade(t, 33000, 35500, 57500, 58500) + ease(t, 76000, 78000);
    const oldYes = fade(t, 76000, 78800, 84500, 86800);
    const yes = .95 - .45 * oldYes;
    const tickY = box.y + 25;
    const claiming = t >= 84500 && t < 93000;
    const title = claiming ? 'CLAIMED · OPENAI 2026' : cut > .5 ? 'SHARE OF OPTIMUM\nGUARANTEED' : t >= 50500 && t < 58500 ? 'SHORT LABELS: CLOSE TO 1\nSCHEMATIC' : 'SHARE OF RULES KEPT';
    this.words(title, mid, box.y - (this.tall ? 30 : 60), box.w + 20, appear * (this.tall ? 1 - proofStage : 1), claiming ? 'blue' : 'ink');
    this.line({ x: box.x, y: box.y }, { x: box.x + box.w, y: box.y }, 'ink', appear);

    for (const value of [0, .5, 1]) {
      const x = box.x + value * box.w;
      this.line({ x, y: box.y - 4 }, { x, y: box.y + 4 }, 'ink', appear);
      this.words(String(value), x, tickY, 30, appear * lowerLabels, 'muted');
    }

    const early = fade(t, 12000, 14500, 33000, 34000);
    const best = ease(t, 29000, 31500);
    const walk = ease(t, 20000, 24800);
    const value = 1 - walk / 3 + best / 4;
    const x = box.x + value * box.w;
    this.circle({ x, y: box.y }, 4, 'blue', true, early);
    this.words(t < 17500 ? 'ALL 12 KEPT' : best > .8 ? 'BEST LABELLING: 11 OF 12' : 'FOLLOWING THE LINES: 8 OF 12', mid, box.y + 62, box.w + 35, early, 'blue');
    this.line({ x, y: box.y + 6 }, { x: mid, y: box.y + 47 }, 'blue', early * .4);

    if (zones > .01) {
      this.hatch({ x: box.x + .15 * box.w, y: box.y - 12, w: (yes - .15) * box.w, h: 24 }, zones * .3);
      this.line({ x: box.x, y: box.y }, { x: box.x + .15 * box.w, y: box.y }, 'blue', zones, 5);
      this.line({ x: box.x + yes * box.w, y: box.y }, { x: box.x + box.w, y: box.y }, 'blue', zones, 5);
      this.words('NO', box.x + .075 * box.w, box.y - 28, 40, zones * (1 - ease(t, 50000, 50500) + ease(t, 58500, 59000)), 'blue');
      this.words('YES', box.x + (yes + 1) / 2 * box.w, box.y - 28, 40, zones * (1 - ease(t, 50000, 50500) + ease(t, 58500, 59000)), 'blue');
      this.label('no', box.x + .06 * box.w, box.y + 52, zones * lowerLabels);
      this.label('yes', box.x + .92 * box.w, box.y + 52, zones * (1 - oldYes) * lowerLabels);
      this.words('PROMISED NOT TO HAPPEN', box.x + .5 * box.w, box.y + 51, box.w * .55, zones * (1 - ease(t, 84500, 86000)) * lowerLabels);
      this.words('ε AND δ CHOSEN FIRST · SCHEMATIC', mid, box.y + 83, box.w + 25, fade(t, 33000, 35000, 41000, 42000), 'muted');
      this.words('WHICH ZONE? AS HARD AS 3SAT', mid, box.y + 83, box.w + 24, fade(t, 42000, 43500, 49000, 50000), 'blue');
      this.words('2018: YES CASE NEAR 1/2', mid, box.y + 75, box.w + 30, oldYes * (1 - ease(t, 84000, 84500)), 'blue');
      this.line({ x: box.x + .95 * box.w, y: box.y - 16 }, { x: box.x + box.w, y: box.y - 16 }, 'muted', oldYes);
      this.words('NEEDED: NEAR 1', mid, box.y + 101, box.w, oldYes * (1 - ease(t, 84000, 84500)), 'muted');
      const claim = fade(t, 85200, 86800, 92400, 93000);
      this.words('SATISFIABLE → YES\nUNSATISFIABLE → NO', mid, box.y + 78, box.w, claim, 'blue');
    }

    if (shortLabels > .01) {
      const start = box.x + .7 * box.w;
      const end = box.x + (.7 + .27 * ease(t, 52000, 55800)) * box.w;
      const y = box.y - 5;
      this.line({ x: start, y }, { x: end, y }, 'blue', shortLabels, 1.5);
      this.line({ x: end - 5, y: y - 4 }, { x: end, y }, 'blue', shortLabels, 1.5);
      this.line({ x: end - 5, y: y + 4 }, { x: end, y }, 'blue', shortLabels, 1.5);
    }

    if (cut > .01) {
      const at = box.x + .87856 * box.w;
      this.line({ x: box.x, y: box.y }, { x: at, y: box.y }, 'blue', cut, 5);
      this.hatch({ x: at, y: box.y - 14, w: box.w * (1 - .87856), h: 28 }, cut * .6);
      this.words('0.878…', at, box.y - 26, 65, cut, 'blue', false);
      this.words('GOEMANS–WILLIAMSON · 1995', mid, box.y + (this.tall ? 44 : 58), box.w + 25, cut * (1 - coverStage));
      this.words('UNDER THE CONJECTURE\nNO BETTER GUARANTEE UNLESS P = NP', mid, box.y + (this.tall ? 77 : 91), box.w + 30, cut * (1 - coverStage), 'muted');
    }

    const cover = fade(t, 67500, 69000, 75000, 76000);

    if (cover > .01) {
      const y = box.y + (this.tall ? this.height * .24 : 146);
      this.words('VERTEX COVER: TIMES THE SMALLEST', mid, y - 24, box.w + 25, cover);
      this.line({ x: box.x, y }, { x: box.x + box.w, y }, 'ink', cover);
      const x2 = box.x + box.w * 2 / 3;
      this.hatch({ x: box.x, y: y - 7, w: x2 - box.x, h: 14 }, cover * .3);
      this.circle({ x: x2, y }, 4, 'blue', true, cover);
      this.words('1', box.x, y + 21, 25, cover);
      this.words('2', x2, y + 21, 25, cover, 'blue');
      this.words('2.5', box.x + box.w, y + 21, 35, cover);
    }

    const status = ease(t, 112000, 114000);
    this.label('status', mid, box.y + 104, status);
  }

  private closeup(): void {
    const t = this.time;
    const rule = fade(t, 50500, 52500, 57500, 58500);
    const code = fade(t, 93000, 94700, 102000, 102500);
    const isCode = t >= 93000;
    const opacity = Math.max(rule, code);

    if (opacity < .005) return;

    const x = this.width * (this.tall ? .5 : .75);
    const y = this.height * (this.tall ? (isCode ? .7 : .8) : .72);
    const count = isCode ? 8 : 4;
    const spacing = this.tall ? 22 : 26;
    const left = x - (count - 1) * spacing / 2;
    const noise = ease(t, 95400, 96600);
    this.words(isCode ? 'CODE + NOISE · SCHEMATIC' : 'A RULE: FLIP BITS 1 AND 3', x, y - (this.tall ? (isCode ? 15 : 18) : 30), this.width * (this.tall ? .9 : .42), opacity);

    for (let bit = 0; bit < count; bit++) {
      const original = bit % 3 === 0;
      const flipped = bit === 0 || bit === 2;
      const px = left + bit * spacing;
      this.words(original ? '1' : '0', px, y, spacing, opacity, 'ink', false);
      this.line({ x: px, y: y + 10 }, { x: px, y: y + 23 }, flipped ? 'blue' : 'muted', opacity * .5);
      const changed = flipped && (rule > .5 || noise > .5);
      this.words(original !== changed ? '1' : '0', px, y + 34, spacing, opacity, changed ? 'blue' : 'ink', false);

      if (flipped) {
        this.circle({ x: px, y: y + 34 }, 11, 'blue', false, opacity * (rule > .5 ? .6 : noise));
        this.words(original !== changed ? '1' : '0', px, y + 34, spacing, opacity, changed ? 'blue' : 'ink', false);
      }
    }

    if (code > .01) {
      this.label('stable', x - (this.tall ? 25 : 35), y + 65, code);
      this.label('stability', x + (this.tall ? 90 : 110), y + 65, code);
      const checks = ease(t, 99000, 100400);
      this.words('BROAD CHECKS NOTICE: AT LEAST 1/8', x, y + (this.tall ? 85 : 92), this.width * (this.tall ? .9 : .45), checks * code, 'blue');
      this.line({ x: left, y: y - 10 }, { x: left + spacing * 4, y: y - 10 }, 'blue', checks * code);
    }
  }

  private agreementPlot(): void {
    const t = this.time;
    const opacity = fade(t, 102500, 104000, 111500, 113000);

    if (opacity < .005) return;

    const entering = ease(t, 102500, 104000);
    const box = { x: this.width * (this.tall ? .18 : .59), y: this.height * (this.tall ? .78 : .67) + (1 - entering) * 25, w: this.width * (this.tall ? .68 : .3), h: this.height * (this.tall ? .14 : .2) };
    const maxK = 80;
    const maxY = .6;
    const point = (k: number, rate: number) => ({ x: box.x + k / maxK * box.w, y: box.y + box.h * (1 - rate / maxY) });
    this.words('AGREEMENT · SCHEMATIC CONSTANTS', box.x + box.w / 2, box.y - 20, box.w + 45, opacity);
    this.line(point(0, maxY), point(0, 0), 'muted', opacity);
    this.line(point(0, 0), point(maxK, 0), 'muted', opacity);
    const threshold = Math.pow(Math.log(1 / AGREE_GAMMA) / .6, 3);
    this.hatch({ x: point(threshold, 0).x, y: point(0, AGREE_GAMMA).y, w: box.w * (1 - threshold / maxK), h: box.h * AGREE_GAMMA / maxY }, opacity * .35);
    this.line(point(0, AGREE_GAMMA), point(maxK, AGREE_GAMMA), 'blue', opacity, 1.4);
    const limit = 1 + 79 * ease(t, 104000, 108500);

    for (let k = 1; k < limit; k += .5) {
      this.line(point(k, Math.min(maxY, agreement(k))), point(k + .5, Math.min(maxY, agreement(k + .5))), 'ink', opacity, 1.4);
    }

    this.label('gamma', box.x - 14, point(0, AGREE_GAMMA).y, opacity);
    this.label('agreement', box.x + box.w * .7, box.y + 5, opacity);
    this.words('REPETITIONS k', box.x + box.w / 2, box.y + box.h + 20, box.w, opacity, 'muted');
  }
}

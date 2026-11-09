import { mix, progress, smooth } from '../../../lib/animation';
import { DRAWN_MODES, SCATTER } from './data';
import { wedgeBounds, type ModeReference, type Point } from './math';
import { plateGeometry, type Box, type Colors, type Place } from './stage';
import type { ModeNumerics } from './transport';

const BOUNDS = wedgeBounds();
const DOT_TIMES = [9700, 9700, 11750, 14000, 16250, 18500] as const;
const EXTRA_MODES = SCATTER.filter(([m, n, sign]) => !DRAWN_MODES.some(mode => mode.m === m && mode.n === n && mode.sign === sign));

type MeasuredReferences = readonly (ModeReference | undefined)[];

function text(pen: CanvasRenderingContext2D, words: string, x: number, y: number, size: number, colors: Colors, width: number, align: CanvasTextAlign = 'center', tone: 'ink' | 'blue' | 'muted' = 'ink'): void {
  pen.font = `${size}px ${/[λβηξε]/u.test(words) ? '"Garamond Math", "Alegreya", serif' : '"Special Elite", monospace'}`;
  pen.textAlign = align;
  pen.textBaseline = 'middle';
  const lines: string[] = [];

  for (const supplied of words.split('\n')) {
    let current = '';

    for (const word of supplied.split(' ')) {
      const next = current ? `${current} ${word}` : word;

      if (current && pen.measureText(next).width > width) {
        lines.push(current);
        current = word;
      } else current = next;
    }

    lines.push(current);
  }

  for (const [index, words] of lines.entries()) {
    const measured = pen.measureText(words).width;
    const top = y + index * (size + 3);
    const left = align === 'left' ? x : align === 'right' ? x - measured : x - measured / 2;
    pen.fillStyle = colors.paper;
    pen.fillRect(left - 2, top - size / 2 - 1, measured + 4, size + 2);
    pen.fillStyle = colors[tone];
    pen.fillText(words, x, top);
  }
}

function line(pen: CanvasRenderingContext2D, from: Point, to: Point, amount = 1): void {
  pen.beginPath();
  pen.moveTo(from.x, from.y);
  pen.lineTo(mix(from.x, to.x, amount), mix(from.y, to.y, amount));
  pen.stroke();
}

function dot(pen: CanvasRenderingContext2D, point: Point, radius: number): void {
  pen.moveTo(point.x + radius, point.y);
  pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
}

function fraction(pen: CanvasRenderingContext2D, x: number, y: number, numerator: number, denominator: number, colors: Colors, size = 12): void {
  pen.fillStyle = colors.paper;
  pen.fillRect(x - size * .45 - 2, y - size - 1, size * .9 + 4, size * 2 + 2);
  pen.fillStyle = colors.ink;
  pen.font = `${size}px "Garamond Math", serif`;
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  pen.fillText(String(numerator), x, y - size * .52);
  pen.fillText(String(denominator), x, y + size * .55);
  pen.save();
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .7;
  line(pen, { x: x - size * .38, y }, { x: x + size * .38, y });
  pen.restore();
}

function wedgePlot(box: Box, closing = false): Box {
  const compact = box.h < 160;

  return { x: box.x + (compact ? 24 : 34), y: box.y + 16, w: box.w - (compact ? 72 : 88), h: box.h - (closing ? 72 : 39) };
}

function wedgePoint(plot: Box, k: number, length: number): Point {
  return { x: plot.x + k / 46 * plot.w, y: plot.y + (1 - length / 23) * plot.h };
}

function wedge(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, references: MeasuredReferences, labels = true, closing = false): void {
  const plot = wedgePlot(box, closing);
  const point = (k: number, length: number): Point => wedgePoint(plot, k, length);
  const compact = box.h < 160;
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  line(pen, point(0, 0), point(0, 23), progress(time, 7750, 8400));
  line(pen, point(0, 0), point(46, 0), progress(time, 7750, 8700));

  if (time >= 16750) {
    const turn = smooth(time, 26000, 27800);
    const lower = mix(.30, BOUNDS.lower, turn);
    const upper = mix(.43, BOUNDS.upper, turn);
    const shown = progress(time, 16750, 19000);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1;
    line(pen, point(0, 0), point(46, 46 * lower), shown);
    line(pen, point(0, 0), point(46, 46 * upper), shown);

    if (labels) {
      const low = point(46, 46 * lower);
      const high = point(46, 46 * upper);
      line(pen, low, { x: low.x + 6, y: low.y });
      line(pen, high, { x: high.x + 6, y: high.y });
      place('wedge-lower', low.x + 25, low.y);
      place('wedge-upper', high.x + 25, high.y);

      if (!compact && time >= 31500 && time < 39750) {
        const anchor = point(28, 28 * lower);
        const x = box.x + box.w * .52;
        const y = anchor.y + 27;
        line(pen, anchor, { x, y: y - 9 });
        text(pen, 'BRÜNING 1978\nLOWER BOUND · SMOOTH SURFACES', x, y, 11, colors, box.w - 20);
      }
    }
  }

  pen.fillStyle = colors.ink;
  pen.beginPath();

  for (const [index, reference] of references.entries()) {
    const at = DOT_TIMES[index];

    if (!reference || at === undefined || time < at || index === 0 && time < 9800) continue;

    const target = point(reference.k, reference.length);
    const fall = (1 - smooth(time, at, at + 650)) * plot.h * .7;
    dot(pen, { x: target.x, y: target.y - fall }, compact ? 1.8 : 2.6);
  }

  if (time >= 26000) {
    const shown = Math.floor(progress(time, 26000, 29800) * EXTRA_MODES.length);

    for (let index = 0; index < shown; index++) {
      const row = EXTRA_MODES[index];

      if (!row) continue;

      const at = point(row[3], row[4]);
      const delay = 26000 + index / EXTRA_MODES.length * 3000;
      dot(pen, { x: at.x, y: at.y - (1 - smooth(time, delay, delay + 700)) * plot.h * .35 }, compact ? 1.25 : 1.8);
    }
  }

  pen.fill();

  if (!labels) return;

  text(pen, closing ? '230 MODES · ONE FIXED PLATE' : time < 26000 ? 'NODAL LENGTH' : '230 MODES · ONE FIXED PLATE', box.x + box.w / 2, box.y + 2, compact ? 10 : 12, colors, box.w);

  for (const k of compact ? [0, 20, 40] : [0, 10, 20, 30, 40]) {
    const at = point(k, 0);
    text(pen, String(k), at.x, at.y + 10, 10, colors, 22);
  }

  for (const length of compact ? [0, 20] : [0, 10, 20]) {
    const at = point(0, length);
    text(pen, String(length), at.x - 5, at.y, 10, colors, 24, 'right');
  }

  text(pen, '√λ', plot.x + plot.w + 5, plot.y + plot.h + 10, 11, colors, 22);
}

function firstLength(pen: CanvasRenderingContext2D, box: Box, stageBox: Box, time: number, colors: Colors, data: ModeNumerics | undefined): void {
  const reference = data?.reference;

  if (!data || !reference || time < 7750 || time >= 9800) return;

  const plot = wedgePlot(box);
  const target = wedgePoint(plot, reference.k, reference.length);
  const baseline = wedgePoint(plot, reference.k, 0);
  const straighten = smooth(time, 7750, 9000);
  const collapse = smooth(time, 9050, 9800);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.1;

  const plate = plateGeometry(stageBox);
  let travelled = 0;
  pen.beginPath();

  for (const path of data.contour.paths) {
    for (let index = 0; index < path.length; index += 2) {
      const x = path[index] ?? 0;
      const y = path[index + 1] ?? 0;

      if (index > 0) travelled += Math.hypot(x - (path[index - 2] ?? 0), y - (path[index - 1] ?? 0));

      const fraction = travelled / data.contour.length;
      const barY = mix(baseline.y, target.y, fraction);
      const at = { x: mix(plate.x + x * plate.size, target.x, straighten), y: mix(plate.y + (1 - y) * plate.size, mix(barY, target.y, collapse), straighten) };

      if (index === 0) pen.moveTo(at.x, at.y);
      else pen.lineTo(at.x, at.y);
    }
  }

  pen.stroke();
}

function claimTick(pen: CanvasRenderingContext2D, x: number, y: number, colors: Colors, amount = 1): void {
  pen.save();
  pen.strokeStyle = colors.blue;
  pen.lineWidth = 3;
  pen.setLineDash([6, 3]);
  line(pen, { x, y: y - 14 }, { x, y: y + 14 }, amount);
  pen.restore();
}

function surfaceRuler(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, labels = true, strip = false): void {
  const left = box.x + 24;
  const right = box.x + box.w - 17;
  const y = strip ? box.y + box.h / 2 : box.y + box.h * .49;
  const at = (exponent: number): number => left + (exponent - .5) * 2 * (right - left);
  const compact = box.h < 160;
  const improved = smooth(time, 42750, 44750);
  const pointer = mix(.75, .705, improved);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .8;
  line(pen, { x: left, y }, { x: right, y }, progress(time, 39750, 40800));

  for (const value of [.5, 1]) line(pen, { x: at(value), y: y - 4 }, { x: at(value), y: y + 4 });

  if (!strip) {
    line(pen, { x: at(.75), y: y - 4 }, { x: at(.75), y: y + 4 });
    line(pen, { x: at(pointer), y: y - 8 }, { x: at(pointer), y: y + 6 });
    pen.beginPath();
    pen.arc(left, y, 3, 0, Math.PI * 2);
    pen.stroke();
  }

  if (!labels) {
    if (time >= 46750) claimTick(pen, left, y, colors, progress(time, 46750, 47900));
    return;
  }

  if (strip) {
    fraction(pen, left - 13, y, 1, 2, colors);
    text(pen, '1', right + 10, y, 12, colors, 18);
    text(pen, 'CLAIMED C√λ · SURFACES', box.x + box.w * .55, y - 11, 11, colors, box.w - 35, 'center', 'blue');
    if (time >= 46750) claimTick(pen, left, y, colors, progress(time, 46750, 47900));
    return;
  }

  fraction(pen, left - 13, y, 1, 2, colors);
  text(pen, '√λ', left, y + 24, 12, colors, 30);
  text(pen, '1', right + 10, y, 12, colors, 18);
  text(pen, 'LENGTH ≲ λˣ · SMOOTH SURFACES', box.x + box.w / 2, box.y + 2, compact ? 10 : 12, colors, box.w);
  const labelY = box.y + (compact ? 19 : 30);
  const labelX = Math.max(box.x + box.w * .42, Math.min(box.x + box.w * .58, at(pointer)));
  line(pen, { x: at(pointer), y: y - 9 }, { x: labelX, y: labelY + 9 });
  text(pen, time < 42750 ? 'DONNELLY–FEFFERMAN · ¾' : 'LOGUNOV–MALINNIKOVA · ¾ − β', labelX, labelY, compact ? 10 : 12, colors, box.w - 8);
  fraction(pen, at(.75), y + 24, 3, 4, colors, 11);

  if (time >= 42750 && time < 46750) text(pen, 'β > 0 · OFFSET SCHEMATIC', box.x + box.w / 2, box.y + box.h - 2, 10, colors, box.w);

  if (time >= 46750) {
    text(pen, 'CLAIMED: C√λ ON EVERY SMOOTH SURFACE', compact ? box.x + box.w / 2 : left, compact ? box.y + box.h - 1 : y + 56, 10, colors, compact ? box.w : box.w - 24, compact ? 'center' : 'left', 'blue');
    claimTick(pen, left, y, colors, progress(time, 46750, 47900));
  }
}

function growthChart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, references: MeasuredReferences): void {
  const plot = { x: box.x + 22, y: box.y + 18, w: box.w - 73, h: box.h - 47 };
  const point = (k: number, E: number): Point => ({ x: plot.x + k / 32 * plot.w, y: plot.y + (1 - E / 3.7) * plot.h });
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  line(pen, point(0, 0), point(0, 3.7));
  line(pen, point(0, 0), point(32, 0));
  const shown = progress(time, 78250, 82000) * DRAWN_MODES.length;

  for (const maximum of [false, true]) {
    pen.strokeStyle = colors.ink;
    pen.lineWidth = maximum ? .8 : 1.4;
    pen.setLineDash(maximum ? [3, 3] : []);
    pen.beginPath();
    let started = false;

    for (const [index, reference] of references.entries()) {
      if (index > shown) break;
      if (!reference) continue;

      const at = point(reference.k, maximum ? reference.growthMax : reference.growthMean);

      if (!started) pen.moveTo(at.x, at.y);
      else pen.lineTo(at.x, at.y);

      started = true;
    }

    pen.stroke();
    pen.setLineDash([]);
    pen.fillStyle = colors.ink;
    pen.beginPath();

    for (const [index, reference] of references.entries()) {
      if (reference && index <= shown) dot(pen, point(reference.k, maximum ? reference.growthMax : reference.growthMean), maximum ? 1.6 : 2.2);
    }

    pen.fill();
  }

  text(pen, 'GROWTH E · SIX NOTES · COMPUTED', box.x + box.w / 2, box.y + 2, 10, colors, box.w);

  for (const E of [1, 2, 3]) text(pen, String(E), plot.x - 5, point(0, E).y, 10, colors, 15, 'right');
  for (const k of [10, 20, 30]) text(pen, String(k), point(k, 0).x, plot.y + plot.h + 11, 10, colors, 20);

  text(pen, 'MAX', plot.x + plot.w + 6, point(32, 3.3).y, 10, colors, 43, 'left');
  text(pen, 'MEAN', plot.x + plot.w + 6, point(32, 1.6).y, 10, colors, 43, 'left');
  let meanMin = Infinity;
  let meanMax = -Infinity;
  let maximumMin = Infinity;
  let maximumMax = -Infinity;

  for (const reference of references) {
    if (!reference) continue;

    meanMin = Math.min(meanMin, reference.growthMean);
    meanMax = Math.max(meanMax, reference.growthMean);
    maximumMin = Math.min(maximumMin, reference.growthMax);
    maximumMax = Math.max(maximumMax, reference.growthMax);
  }

  if (Number.isFinite(meanMin)) text(pen, `MEAN ${meanMin.toFixed(3)}–${meanMax.toFixed(3)} · MAX ${maximumMin.toFixed(3)}–${maximumMax.toFixed(3)}`, box.x + box.w / 2, box.y + box.h - 3, 10, colors, box.w);
  text(pen, 'k', box.x + box.w - 3, plot.y + plot.h + 11, 10, colors, 20, 'right');
}

function localGrowthBound(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, reference: ModeReference | undefined): void {
  if (!reference || time < 64000) return;

  const compact = box.h < 160;
  const centre = box.x + box.w / 2;
  const coefficient = Math.ceil(reference.localBound * 100) / 100;
  const mean = reference.growthMean.toFixed(2);

  if (time < 72000) {
    place('growth-bound', centre, box.y + (compact ? 45 : box.h * .23));
    text(pen, 'THIS MODE', centre, box.y + (compact ? 64 : box.h * .31), compact ? 10 : 12, colors, box.w);
    text(pen, `LENGTH ≤ ${coefficient.toFixed(2)} · s(1 + E)`, centre, box.y + (compact ? 79 : box.h * .38), compact ? 10 : 12, colors, box.w);
    return;
  }

  const total = coefficient * reference.q * (1 + Number(mean));

  if (compact) {
    text(pen, `TOTAL ${reference.length.toFixed(2)} ≤`, centre, box.y + 45, 11, colors, box.w);
    text(pen, `${coefficient.toFixed(2)} · ${reference.q} · (1 + ${mean})`, centre, box.y + 63, 11, colors, box.w);
    text(pen, `= ${total.toFixed(1)}`, centre, box.y + 81, 11, colors, box.w);
  } else {
    text(pen, `TOTAL ${reference.length.toFixed(2)} ≤ ${coefficient.toFixed(2)} · ${reference.q} · (1 + ${mean}) = ${total.toFixed(1)}`, centre, box.y + box.h * .27, 12, colors, box.w);
  }
}

function unboundedRatio(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const plot = { x: box.x + 25, y: box.y + 19, w: box.w - 43, h: box.h - 43 };
  const point = (x: number, y: number): Point => ({ x: plot.x + x * plot.w, y: plot.y + (1 - y) * plot.h });
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  line(pen, point(0, 0), point(0, 1));
  line(pen, point(0, 0), point(1, 0));
  pen.setLineDash([2, 3]);
  line(pen, point(0, .25), point(1, .25));
  pen.setLineDash([]);
  const height = mix(.25, .97, smooth(time, 85800, 92250));
  pen.strokeStyle = colors.ink;
  line(pen, point(.73, .25), point(.73, height));
  pen.fillStyle = colors.ink;
  pen.beginPath();
  dot(pen, point(.73, height), 3);
  pen.fill();
  text(pen, 'AREA / √λ', box.x + box.w / 2, box.y + 3, 11, colors, box.w);
  text(pen, 'SCHEMATIC · UNBOUNDED RATIO', box.x + box.w / 2, box.y + box.h - 3, 10, colors, box.w);
}

function metricThresholds(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const plot = { x: box.x + 35, y: box.y + 19, w: box.w - 52, h: box.h - 43 };
  const shown = progress(time, 94500, 100600) * 3;
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  line(pen, { x: plot.x, y: plot.y }, { x: plot.x, y: plot.y + plot.h });

  for (let index = 0; index < 3; index++) {
    const y = plot.y + (1 - (index + 1) / 3.6) * plot.h;
    pen.setLineDash([2, 3]);
    line(pen, { x: plot.x, y }, { x: plot.x + plot.w, y }, Math.min(1, Math.max(0, shown - index)));
    pen.setLineDash([]);
    text(pen, `A${['₁', '₂', '₃'][index]}`, plot.x - 6, y, 10, colors, 25, 'right');
  }

  const x = plot.x + plot.w * .74;
  const y = plot.y + (1 - Math.min(3.3, shown + .3) / 3.6) * plot.h;
  pen.fillStyle = colors.ink;
  pen.beginPath();
  dot(pen, { x, y }, 3);
  pen.fill();
  text(pen, time < 100100 ? 'g₁ → g₂ → g₃' : 'g∞: ALL THRESHOLDS', box.x + box.w / 2, box.y + 2, 10, colors, box.w);
}

function dimensionsRuler(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, closing = 0): void {
  const compact = box.h < 220;
  const row = (box.h - 32) / 3;
  const left = mix(box.x + (compact ? 28 : 45), box.x + 24, closing);
  const right = box.x + box.w - 24;
  const at = (exponent: number): number => left + (exponent - .5) * 2 * (right - left);
  const claimMarks: Point[] = [];
  if (closing === 0) text(pen, 'EXPONENT x IN λˣ · CLAIMS', box.x + box.w / 2, box.y + 2, compact ? 10 : 12, colors, box.w);

  for (let index = 0; index < 3; index++) {
    if ((time < 102950 && index > 0) || (time < 103400 && index > 1) || (closing > .2 && index > 0)) continue;

    const nameY = box.y + 20 + index * row;
    const y = mix(nameY + 22, box.y + box.h - 16, closing);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .7;
    line(pen, { x: left, y }, { x: right, y }, progress(time, 102500 + index * 180, 103500 + index * 180));
    line(pen, { x: left, y: y - 4 }, { x: left, y: y + 4 });
    line(pen, { x: right, y: y - 4 }, { x: right, y: y + 4 });
    if (closing === 0) {
      text(pen, ['SURFACES', 'd = 3, 4', 'd = 5'][index] ?? '', left, nameY, compact ? 11 : 13, colors, box.w, 'left');
      fraction(pen, left - 13, y, 1, 2, colors);
      text(pen, '1', right + 10, y, 12, colors, 18);
    }

    if (index === 0) {
      claimMarks.push({ x: left, y });
      if (closing === 0) text(pen, 'CLAIMED: C√λ', box.x + box.w / 2, y + 13, 11, colors, box.w, 'center', 'blue');
    } else if (index === 1) {
      const x = at(.55);
      line(pen, { x: left, y: y - 8 }, { x, y: y - 8 });
      line(pen, { x: left, y: y - 8 }, { x: left, y: y - 12 });
      line(pen, { x, y: y - 8 }, { x, y: y - 12 });
      if (closing === 0) text(pen, 'UNBOUNDED RATIO · NO POWER', box.x + box.w / 2, y + 13, 10, colors, box.w);
    } else {
      claimMarks.push({ x: at(.58), y });
      if (closing === 0) {
        const claimX = at(.58) + 7;
        text(pen, 'CLAIMED · ε₀ > 0 FIXED', claimX, y + 13, 11, colors, box.x + box.w - claimX, 'left', 'blue');
        text(pen, 'SIZE SCHEMATIC', box.x + box.w / 2, y + 26, 10, colors, box.w);
      }
    }
  }

  for (const mark of claimMarks) claimTick(pen, mark.x, mark.y, colors);
}

export function drawChart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, numerics: readonly (ModeNumerics | undefined)[] = [], stageBox?: Box): void {
  if (time < 7750) return;

  pen.save();
  const references = DRAWN_MODES.map((_, index) => numerics[index]?.reference);

  if (time < 39750) {
    wedge(pen, box, time, colors, place, references);

    if (stageBox) firstLength(pen, box, stageBox, time, colors, numerics[0]);
  } else if (time < 56500) {
    const change = smooth(time, 39750, 40950);
    pen.beginPath();
    pen.rect(box.x - 4, box.y - 7, box.w + 8, box.h + 15);
    pen.clip();

    if (change < 1) wedge(pen, { ...box, x: box.x + change * (box.w + 30) }, time, colors, place, references, false);

    surfaceRuler(pen, { ...box, x: box.x - (1 - change) * (box.w + 30) }, time, colors, change === 1);
  } else if (time < 78250) {
    const strip = { x: box.x, y: box.y + 4, w: box.w, h: 28 };
    surfaceRuler(pen, strip, time, colors, true, true);
    localGrowthBound(pen, box, time, colors, place, numerics[6]?.reference ?? numerics[3]?.reference);

    if (box.h > 135) wedge(pen, { x: box.x + box.w * .37, y: box.y + box.h * .43, w: box.w * .63, h: box.h * .57 }, time, colors, place, references, false);
  } else if (time < 85250) growthChart(pen, box, time, colors, references);
  else if (time < 93750) unboundedRatio(pen, box, time, colors);
  else if (time < 102500) metricThresholds(pen, box, time, colors);
  else if (time < 109500) dimensionsRuler(pen, box, time, colors);
  else {
    const change = smooth(time, 109500, 110600);
    pen.save();
    pen.beginPath();
    pen.rect(box.x - 4, box.y - 7, (box.w + 8) * change, box.h + 15);
    pen.clip();
    wedge(pen, box, time, colors, place, references, change === 1, true);
    pen.restore();

    if (change < 1) dimensionsRuler(pen, box, time, colors, change);
    else surfaceRuler(pen, { x: box.x, y: box.y + box.h - 30, w: box.w, h: 28 }, time, colors, true, true);
  }

  pen.restore();
}

export function drawLedger(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const compact = box.w < 450;
  const centre = box.x + box.w / 2;

  if (time < 7750) return;

  if (time < 16750) text(pen, 'CHLADNI · 1809', centre, box.y + 4, compact ? 10 : 13, colors, box.w);
  else if (time < 26000) text(pen, 'YAU · 1982 · ONE FIXED METRIC', centre, box.y + 4, compact ? 10 : 13, colors, box.w);
  else if (time < 31500) text(pen, `230 MODES: ${BOUNDS.lower.toFixed(3)}√λ ≤ LENGTH ≤ ${BOUNDS.upper.toFixed(3)}√λ`, centre, box.y + 4, compact ? 10 : 13, colors, box.w);
  else if (time < 39750) text(pen, compact ? 'ANALYTIC: 1988 · SMOOTH LOWER: 1978' : 'DONNELLY–FEFFERMAN 1988 · REAL-ANALYTIC · BRÜNING 1978 · LOWER, SMOOTH SURFACES', centre, box.y + 4, compact ? 10 : 12, colors, box.w);
  else if (time < 46750) return;
  else if (time < 56500) text(pen, 'CLAIMED FALSE: d = 3, 4, 5', centre, box.y + 4, compact ? 10 : 13, colors, box.w, 'center', 'blue');
  else if (time < 78250) text(pen, 'FLAT PLATE · ILLUSTRATES THE QUANTITY', centre, box.y + 4, compact ? 10 : 12, colors, box.w);
  else if (time < 85250) text(pen, compact ? 'THEOREM 5.5: BOUNDED MEAN GROWTH' : 'THEOREM 5.5: BOUNDED MEAN GROWTH · EVERY SMOOTH SURFACE', centre, box.y + 4, compact ? 10 : 12, colors, box.w);
  else if (time < 109500) text(pen, 'ONE FIXED SMOOTH METRIC', centre, box.y + 4, compact ? 10 : 12, colors, box.w);
  else if (compact) {
    text(pen, 'UNREVIEWED', centre, box.y + 1, 10, colors, box.w);
    text(pen, 'LEAN: TWO COUNTEREXAMPLES CATALOGUED', centre, box.y + 14, 10, colors, box.w);
    text(pen, 'NodalLength LINKED, NOT CATALOGUED', centre, box.y + 27, 10, colors, box.w);
  } else {
    text(pen, 'UNREVIEWED', centre, box.y + 4, 14, colors, box.w);
    text(pen, 'LEAN: SmoothYau, YauCounterexample CATALOGUED', centre, box.y + 25, 12, colors, box.w);
    text(pen, 'NodalLength LINKED, NOT CATALOGUED', centre, box.y + 45, 12, colors, box.w);
  }
}

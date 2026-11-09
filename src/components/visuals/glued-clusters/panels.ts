import { progress } from '../../../lib/animation';
import { gluingAt, crossingAt, ballSizes } from './math';
import { SAMPLE_SPANNING } from './data';
import { pAt } from './motion';
import type { Box } from './story';

type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

type Tone = keyof Colors;

type Place = (id: string, x: number, y: number, opacity?: number) => void;

type Point = { x: number; y: number };

const GLUING = Array.from({ length: 201 }, (_, index) => ({ p: index / 200, ...gluingAt(index / 200) }));

const CROSSING = Array.from({ length: 201 }, (_, index) => ({ p: index / 200, value: crossingAt(index / 200) }));

const BALLS = ballSizes();

function tagWidth(pen: CanvasRenderingContext2D, words: string, size: number): number {
  let width = 0;
  const parts = words.split('p_c');

  for (const [index, part] of parts.entries()) {
    pen.font = `${size}px "Special Elite"`;
    width += pen.measureText(part).width;

    if (index < parts.length - 1) {
      width += pen.measureText('p').width;
      pen.font = `${size * .7}px "Special Elite"`;
      width += pen.measureText('c').width;
    }
  }

  return width;
}

function tagLetters(pen: CanvasRenderingContext2D, words: string, x: number, y: number, size: number): void {
  let nextX = x;
  const parts = words.split('p_c');
  pen.textAlign = 'left';

  for (const [index, part] of parts.entries()) {
    pen.font = `${size}px "Special Elite"`;
    pen.fillText(part, nextX, y);
    nextX += pen.measureText(part).width;

    if (index < parts.length - 1) {
      pen.fillText('p', nextX, y);
      nextX += pen.measureText('p').width;
      pen.font = `${size * .7}px "Special Elite"`;
      pen.fillText('c', nextX, y + size * .27);
      nextX += pen.measureText('c').width;
    }
  }
}

function text(pen: CanvasRenderingContext2D, words: string, x: number, y: number, size: number, colors: Colors, maxWidth: number, tone: Tone = 'ink', align: CanvasTextAlign = 'center'): void {
  pen.font = `${size}px "Special Elite"`;
  pen.textAlign = align;
  pen.textBaseline = 'middle';
  const lines: string[] = [];

  for (const supplied of words.split('\n')) {
    let line = '';

    for (const word of supplied.split(' ')) {
      const next = line ? `${line} ${word}` : word;

      if (line && tagWidth(pen, next, size) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }

    lines.push(line);
  }

  for (const [index, line] of lines.entries()) {
    const width = tagWidth(pen, line, size);
    const top = y + index * (size + 3);
    const left = align === 'left' ? x : align === 'right' ? x - width : x - width / 2;
    pen.fillStyle = colors.paper;
    pen.fillRect(left - 2, top - size / 2 - 1, width + 4, size + 4);
    pen.fillStyle = colors[tone];
    tagLetters(pen, line, left, top, size);
  }
}

function claim(pen: CanvasRenderingContext2D, prefix: string, x: number, y: number, size: number, colors: Colors): void {
  pen.font = `${size}px "Special Elite"`;
  const first = pen.measureText(prefix).width;
  const last = pen.measureText('CLAIMED').width;
  const left = x - (first + last) / 2;
  text(pen, prefix, left, y, size, colors, first, 'ink', 'left');
  text(pen, 'CLAIMED', left + first, y, size, colors, last, 'blue', 'left');
}

function line(pen: CanvasRenderingContext2D, from: Point, to: Point, amount = 1): void {
  pen.beginPath();
  pen.moveTo(from.x, from.y);
  pen.lineTo(from.x + (to.x - from.x) * amount, from.y + (to.y - from.y) * amount);
  pen.stroke();
}

function curve(pen: CanvasRenderingContext2D, points: readonly Point[], count: number): void {
  const first = points[0];

  if (!first) return;

  pen.beginPath();
  pen.moveTo(first.x, first.y);

  for (let index = 1; index < points.length; index++) {
    const from = points[index - 1];
    const to = points[index];

    if (!from || !to) continue;

    const amount = Math.min(1, Math.max(0, count - index + 1));
    pen.lineTo(from.x + (to.x - from.x) * amount, from.y + (to.y - from.y) * amount);

    if (amount < 1) break;
  }

  pen.stroke();
}

function dot(pen: CanvasRenderingContext2D, at: Point, size = 2): void {
  pen.beginPath();
  pen.arc(at.x, at.y, size, 0, Math.PI * 2);
  pen.fill();
}

function probabilityAxes(pen: CanvasRenderingContext2D, box: Box, colors: Colors, top: number, bottom: number): { point: (p: number, probability: number) => Point; plot: Box } {
  const plot = { x: box.x + 25, y: box.y + top, w: box.w - 36, h: box.h - top - bottom };
  const point = (p: number, probability: number): Point => ({ x: plot.x + p * plot.w, y: plot.y + (1 - probability) * plot.h });
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .6;
  line(pen, point(0, 1), point(0, 0));
  line(pen, point(0, 0), point(1, 0));

  for (const value of [0, .5, 1]) {
    const x = point(value, 0);
    text(pen, value === .5 ? '½' : String(value), x.x, x.y + 11, 10, colors, 20, 'ink', value === 1 ? 'right' : 'center');
  }

  for (const value of [0, 1]) {
    const y = point(0, value);
    text(pen, String(value), y.x - 6, y.y, 10, colors, 15, 'ink', 'right');
  }

  text(pen, 'p', plot.x + plot.w + 5 + tagWidth(pen, 'p', 10), plot.y + plot.h + 11, 10, colors, 15, 'ink', 'right');

  return { point, plot };
}

function gluingCurves(pen: CanvasRenderingContext2D, point: (p: number, probability: number) => Point, time: number, colors: Colors): void {
  const count = progress(time, 60000, 65000) * 200;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.7;
  curve(pen, GLUING.map(({ p, left }) => point(p, left)), count);
  pen.lineWidth = 1;
  pen.setLineDash([4, 3]);
  curve(pen, GLUING.map(({ p, right }) => point(p, right)), count);
  pen.setLineDash([]);
}

function gluing(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place): void {
  const small = box.h < 170;

  if (time >= 69250) {
    missBars(pen, box, time, colors);
    return;
  }

  const { point, plot } = probabilityAxes(pen, box, colors, small ? 53 : 64, small ? 41 : 49);
  gluingCurves(pen, point, time, colors);
  const read = gluingAt(.5);
  const x = point(.5, 0).x;
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  pen.setLineDash([2, 3]);
  line(pen, { x, y: plot.y }, { x, y: plot.y + plot.h });
  pen.setLineDash([]);
  pen.fillStyle = colors.ink;
  dot(pen, point(.5, read.left));
  dot(pen, point(.5, read.right));
  place('gluing', box.x + box.w / 2, box.y + (small ? 24 : 28));
  text(pen, 'EXACT · ALL 131,072 CONFIGURATIONS', box.x + box.w / 2, box.y - 6, 10, colors, box.w + 12);
  const y = box.y + box.h - 15;
  text(pen, `JOINT ${read.left.toFixed(4)}`, box.x + box.w * .24, y, small ? 10 : 12, colors, box.w * .48);
  text(pen, `PRODUCT ${read.right.toFixed(4)}`, box.x + box.w * .75, y, small ? 10 : 12, colors, box.w * .50);
}

function missBars(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const p = pAt(time);
  const read = gluingAt(p);
  const small = box.h < 170;
  const miniature = { x: box.x + box.w * .65, y: box.y + 19, w: box.w * .32, h: box.h * .38 };
  const point = (value: number, probability: number): Point => ({ x: miniature.x + value * miniature.w, y: miniature.y + (1 - probability) * miniature.h });
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .6;
  line(pen, point(0, 1), point(0, 0));
  line(pen, point(0, 0), point(1, 0));
  gluingCurves(pen, point, time, colors);
  text(pen, `p = ${p.toFixed(2)} · EXACT`, box.x + box.w / 2, box.y + 3, small ? 10 : 12, colors, box.w);
  text(pen, `REACH A: ${read.reachRelays.toFixed(4)}`, box.x, box.y + 23, small ? 10 : 12, colors, box.w * .62, 'ink', 'left');
  text(pen, `WORST RELAY: ${read.worstRelay.toFixed(4)}`, box.x, box.y + 39, small ? 10 : 12, colors, box.w * .62, 'ink', 'left');
  const start = box.x + box.w * .25;
  const width = box.w * .47;
  const maximum = Math.max(.12, read.b * 1.08, read.missTarget * 1.08);
  const rows = [{ name: 'MISS T', value: read.missTarget }, { name: 'b', value: read.b }];
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;

  for (const [index, row] of rows.entries()) {
    const y = box.y + box.h * (index === 0 ? .62 : .84);
    const length = row.value / maximum * width;
    text(pen, row.name, box.x + 2, y, small ? 10 : 12, colors, box.w * .23, 'ink', 'left');
    pen.strokeRect(start, y - 4, length, 8);
    text(pen, row.value.toFixed(4), start + length + 6, y, small ? 10 : 12, colors, box.w * .24, 'ink', 'left');
  }
}

function crossing(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const small = box.h < 170;
  const { point, plot } = probabilityAxes(pen, box, colors, 21, small ? 62 : 70);
  const low = point(.49, 0).x;
  const high = point(.5, 0).x;
  pen.fillStyle = colors.muted;
  pen.fillRect(low, plot.y, high - low, plot.h);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.6;
  curve(pen, CROSSING.map(({ p, value }) => point(p, value)), progress(time, 83500, 87500) * 200);
  const readP = pAt(time);
  const read = point(readP, crossingAt(readP));
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  pen.setLineDash([2, 3]);
  line(pen, { x: read.x, y: plot.y }, { x: read.x, y: plot.y + plot.h });
  pen.setLineDash([]);
  pen.fillStyle = colors.ink;
  dot(pen, read);
  text(pen, 'A FINITE EVENT IS A POLYNOMIAL IN p', box.x + box.w / 2, box.y + 3, 10, colors, box.w);
  text(pen, `p = 0.48: ${crossingAt(.48).toFixed(4)}`, box.x + box.w / 2, box.y + box.h - 34, small ? 10 : 12, colors, box.w);
  text(pen, `0.49: ${crossingAt(.49).toFixed(4)} · 0.50: ${crossingAt(.5).toFixed(4)}`, box.x + box.w / 2, box.y + box.h - 17, small ? 10 : 12, colors, box.w);
}

function growth(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const plot = { x: box.x + 18, y: box.y + 22, w: box.w - 118, h: box.h - 67 };
  const point = (r: number, size: number): Point => ({ x: plot.x + r / 12 * plot.w, y: plot.y + (1 - Math.log10(size) / 4.2) * plot.h });
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .6;
  line(pen, point(0, 10 ** 4.2), point(0, 1));
  line(pen, point(0, 1), point(12, 1));
  const series = [{ name: 'TREE', values: BALLS.tree, dash: [] }, { name: 'CUBIC', values: BALLS.cubic, dash: [4, 3] }, { name: 'SQUARE', values: BALLS.square, dash: [1, 3] }];
  const shown = progress(time, 107250, 110600) * 12;

  for (const item of series) {
    const points = item.values.map((value, r) => point(r, value));
    pen.strokeStyle = colors.ink;
    pen.lineWidth = item.name === 'TREE' ? 1.6 : 1.1;
    pen.setLineDash(item.dash);
    curve(pen, points, shown);
    pen.setLineDash([]);
    const last = points[12];
    const value = item.values[12];

    if (last && value !== undefined) {
      text(pen, `${item.name} ${value.toLocaleString('en-US')}`, last.x + 8, last.y, 10, colors, 105, 'ink', 'left');
    }
  }

  const firstWin = BALLS.tree.findIndex((size, r) => size > (BALLS.cubic[r] ?? Infinity));
  const x = point(firstWin, 1).x;
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  pen.setLineDash([2, 3]);
  line(pen, { x, y: plot.y }, { x, y: plot.y + plot.h });
  pen.setLineDash([]);
  text(pen, 'BALL SIZE · LOG AXIS', box.x + box.w / 2, box.y + 4, box.h < 170 ? 11 : 13, colors, box.w);
  text(pen, `r = ${firstWin}: TREE OVERTAKES`, box.x + box.w / 2, box.y + box.h - 9, 10, colors, box.w);
  text(pen, 'RADIUS r', plot.x + plot.w * .45, plot.y + plot.h + 11, 10, colors, plot.w);
}

export function drawChart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place): void {
  if (time < 60000) return;

  pen.save();

  if (time < 76250) gluing(pen, box, time, colors, place);
  else if (time >= 83500 && time < 98250) crossing(pen, box, time, colors);
  else if (time >= 107250 && time < 111750) growth(pen, box, time, colors);

  pen.restore();
}

function hatch(pen: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colors: Colors): void {
  pen.save();
  pen.beginPath();
  pen.rect(x, y, width, height);
  pen.clip();
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .7;

  for (let offset = -height; offset <= width; offset += 3) line(pen, { x: x + offset, y: y + height }, { x: x + offset + height, y });

  pen.restore();
}

function tick(pen: CanvasRenderingContext2D, x: number, y: number, colors: Colors): void {
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  pen.beginPath();
  pen.moveTo(x - 3, y);
  pen.lineTo(x - 1, y + 3);
  pen.lineTo(x + 4, y - 4);
  pen.stroke();
}

function pAxis(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const p = pAt(time);
  const start = box.x + 18;
  const width = box.w - 36;
  const y = box.y + 14;
  const x = start + p * width;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .8;
  line(pen, { x: start, y }, { x: start + width, y });
  const defining = time >= 91500 && time < 98250;
  const firstCrossing = time >= 6750 && time < 14500;

  if (defining) {
    const words = 'NO INFINITE CLUSTER BELOW p_c (DEFINITION)';
    const width = tagWidth(pen, words, 9);
    const fit = Math.min(1, (box.w - 2) / width);
    pen.save();
    pen.translate(box.x + 1, box.y - 9);
    pen.scale(fit, 1);
    text(pen, words, 0, 0, 9, colors, width + 1, 'ink', 'left');
    pen.restore();
  } else text(pen, firstCrossing ? 'FIRST CROSSING' : box.w < 200 ? 'SQUARE p' : 'SQUARE SAMPLE p', box.x + 1, box.y + 2, 10, colors, box.w * .6, 'ink', 'left');
  text(pen, `p = ${p.toFixed(2)}`, box.x + box.w - 1, box.y + 2, 11, colors, box.w * .4, 'ink', 'right');
  pen.fillStyle = colors.ink;
  pen.beginPath();
  pen.moveTo(x, y);
  pen.lineTo(x - 4, y - 6);
  pen.lineTo(x + 4, y - 6);
  pen.closePath();
  pen.fill();

  for (const value of [0, .5, 1]) {
    const at = start + value * width;
    line(pen, { x: at, y: y - 3 }, { x: at, y: y + 4 });
    text(pen, value === .5 ? time >= 14500 ? '½ · SQUARE p_c' : '½' : String(value), at, y + 11, 10, colors, value === .5 ? box.w * .65 : 20);
  }

  if (time >= 6750 && time < 14500) {
    for (const pivotal of [SAMPLE_SPANNING.vertical, SAMPLE_SPANNING.horizontal]) {
      if (p < pivotal) continue;

      const at = start + pivotal * width;
      pen.lineWidth = 1.2;
      line(pen, { x: at, y: y - 5 }, { x: at, y: y + 5 });
    }

    const vertical = SAMPLE_SPANNING.vertical.toFixed(3);
    const horizontal = SAMPLE_SPANNING.horizontal.toFixed(3);

    if (box.w > 250) text(pen, `TOP TO BOTTOM ${vertical} · SIDE TO SIDE ${horizontal}`, box.x + box.w / 2, box.y + 43, 10, colors, box.w);
    else text(pen, `TOP TO BOTTOM ${vertical}\nSIDE TO SIDE ${horizontal}`, box.x + box.w / 2, box.y + 40, 10, colors, box.w);
  }
}

function dimensions(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const font = box.w < 400 ? 10 : 11;
  const step = box.w / 10;
  text(pen, 'DIMENSION d', box.x, box.y + 3, font, colors, box.w, 'ink', 'left');

  for (let d = 2; d <= 11; d++) {
    const x = box.x + (d - 1.5) * step;
    text(pen, d === 11 ? '11+' : String(d), x, box.y + 18, font, colors, step);

    if (d === 2 || d === 11) {
      tick(pen, x, box.y + 31, colors);
    } else if (time >= 43250) {
      hatch(pen, x - 4, box.y + 26, 8, 10, colors);
    } else {
      text(pen, '?', x, box.y + 31, font, colors, step);
    }

    if (d === 3 && time >= 52000) {
      pen.strokeStyle = colors.blue;
      pen.lineWidth = 1.2;
      pen.setLineDash([2, 2]);
      line(pen, { x: x - 6, y: box.y + 38 }, { x: x + 6, y: box.y + 38 });
      pen.setLineDash([]);
    }
  }

  if (time >= 43250) {
    hatch(pen, box.x, box.y + 42, 8, 8, colors);
    text(pen, 'ANTHROPIC FORMAL PROOF · AUG 2026', box.x + 13, box.y + 46, 10, colors, box.w - 13, 'ink', 'left');
  } else {
    text(pen, '2: 1960/1980 · 11+: 2017', box.x + box.w / 2, box.y + 46, 10, colors, box.w);
  }
}

function classes(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const lines = ['NONAMENABLE, UNIMODULAR · 1999', 'EXPONENTIAL GROWTH · 2016', 'SOME INTERMEDIATE · 2021', time >= 43250 ? 'OTHER SLOWER GROWTH · ?' : 'SLOWER, INCLUDING LATTICES · ?'];

  for (const [index, words] of lines.entries()) text(pen, words, box.x, box.y + 4 + index * 14, 10, colors, box.w, 'ink', 'left');
}

function claims(pen: CanvasRenderingContext2D, box: Box, colors: Colors): void {
  const words = 'ANTHROPIC FORMAL PROOF · SEPARATE';
  const width = tagWidth(pen, words, 10);
  const left = box.x + (box.w - width - 23) / 2;
  hatch(pen, left, box.y, 9, 9, colors);
  text(pen, words, left + 23, box.y + 4, 10, colors, width + 1, 'ink', 'left');
  claim(pen, 'GENERAL BOND · ', box.x + box.w / 2, box.y + 18, 10, colors);
  text(pen, 'QUASI-TRANSITIVE · p_c < 1', box.x + box.w / 2, box.y + 31, 10, colors, box.w);
  claim(pen, 'CUBIC BOND AND SITE · ', box.x + box.w / 2, box.y + 44, 10, colors);
  pen.strokeStyle = colors.blue;
  pen.lineWidth = 1.1;
  pen.setLineDash([4, 3]);
  line(pen, { x: box.x + box.w * .1, y: box.y + 50 }, { x: box.x + box.w * .9, y: box.y + 50 });
  pen.setLineDash([]);
}

function growthMethods(pen: CanvasRenderingContext2D, box: Box, colors: Colors): void {
  const rows = ['EXPONENTIAL · HUTCHCROFT 2016', 'IN BETWEEN · CLUSTERS FORCED ADJACENT', 'POLYNOMIAL · CORRIDORS, AS ON THE CUBE'];

  for (const [index, words] of rows.entries()) text(pen, words, box.x + box.w / 2, box.y + 6 + index * 17, 10, colors, box.w);
}

function settled(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  if (box.w < 400) {
    const step = box.w / 10;
    text(pen, 'UNREVIEWED · DIMENSION d', box.x + box.w / 2, box.y + 35, 10, colors, box.w);

    for (let d = 2; d <= 11; d++) {
      const x = box.x + (d - 1.5) * step;
      text(pen, d === 11 ? '11+' : String(d), x, box.y + 48, 10, colors, step);

      if (d === 2 || d === 11) tick(pen, x, box.y + 59, colors);
      else hatch(pen, x - 4, box.y + 54, 8, 10, colors);

      if (d === 3) {
        pen.strokeStyle = colors.blue;
        pen.lineWidth = 1.2;
        pen.setLineDash([2, 2]);
        line(pen, { x: x - 6, y: box.y + 66 }, { x: x + 6, y: box.y + 66 });
        pen.setLineDash([]);
      }
    }

    hatch(pen, box.x + 1, box.y + 70, 8, 8, colors);
    text(pen, 'ANTHROPIC FORMAL PROOF · SEPARATE', box.x + 14, box.y + 74, 10, colors, box.w - 14, 'ink', 'left');
    claim(pen, 'GENERAL BOND · ', box.x + box.w / 2, box.y + 87, 10, colors);
    text(pen, 'QUASI-TRANSITIVE · p_c < 1', box.x + box.w / 2, box.y + 99, 10, colors, box.w);
    claim(pen, 'CUBIC BOND AND SITE · ', box.x + box.w / 2, box.y + 111, 10, colors);
    text(pen, 'LEAN: TWO 63-LINE STATEMENTS\nNOT COUNTED AS APPROVAL', box.x + box.w / 2, box.y + 123, 10, colors, box.w);
    return;
  }

  dimensions(pen, { x: box.x + box.w * .275, y: box.y + 3, w: box.w * .31, h: box.h - 3 }, time, colors);
  const x = box.x + box.w * .805;
  claim(pen, 'GENERAL BOND · ', x, box.y + 7, 10, colors);
  text(pen, 'QUASI-TRANSITIVE · p_c < 1', x, box.y + 20, 10, colors, box.w * .39);
  claim(pen, 'CUBIC BOND AND SITE · ', x, box.y + 33, 10, colors);
  text(pen, 'UNREVIEWED', x, box.y + 49, 11, colors, box.w * .39);
  text(pen, 'LEAN: TWO 63-LINE STATEMENTS · NOT COUNTED AS APPROVAL', box.x + box.w / 2, box.y + box.h - 7, 10, colors, box.w);
}

export function drawLedger(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  pen.save();
  const small = box.w < 400;
  const axis = small ? box : { ...box, w: box.w * .25 };
  pAxis(pen, axis, time, colors);
  const body = small
    ? { x: box.x, y: box.y + 35, w: box.w, h: box.h - 35 }
    : { x: box.x + box.w * .29, y: box.y + 7, w: box.w * .71, h: box.h - 7 };

  if (time >= 112750 || !small && time >= 111750) {
    settled(pen, box, time, colors);
  } else if (time >= 107250) {
    growthMethods(pen, body, colors);
  } else if (!small && time >= 30250) {
    dimensions(pen, { x: box.x + box.w * .275, y: box.y + 7, w: box.w * .31, h: box.h - 7 }, time, colors);
    const graph = { x: box.x + box.w * .61, y: box.y + 7, w: box.w * .39, h: box.h - 7 };

    if (time >= 52000) claims(pen, graph, colors);
    else if (time >= 35500) classes(pen, graph, time, colors);
  } else if (time >= 52000) {
    claims(pen, body, colors);
  } else if (time >= 43250) {
    dimensions(pen, body, time, colors);
  } else if (time >= 35500) {
    classes(pen, body, time, colors);
  } else if (time >= 30250) {
    dimensions(pen, body, time, colors);
  }

  pen.restore();
}

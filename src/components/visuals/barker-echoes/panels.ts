import { mix, progress, smooth } from '../../../lib/animation';
import { BARKER13, ROW4, KNOWN_ROWS, aperiodic, periodic, allOnesWalk, Turynsurvivors, type Complex } from './math';
import { openingShift } from './motion';
import type { Box } from './story';

type Tone = 'ink' | 'blue' | 'muted' | 'paper';

type Colors = Record<Tone, string>;

type Place = (id: string, x: number, y: number, opacity?: number) => void;

const SURVIVORS = new Set(Turynsurvivors());

const TRIVIAL_WALK = allOnesWalk(3, 1);

const THIRD_WALK = allOnesWalk(3, 3);

function caption(pen: CanvasRenderingContext2D, words: string, x: number, y: number, size: number, colors: Colors, maxWidth: number, tone: Tone = 'ink', align: CanvasTextAlign = 'center'): void {
  pen.font = `${size}px "Special Elite"`;
  pen.textAlign = align;
  pen.textBaseline = 'middle';
  const lines: string[] = [];

  for (const supplied of words.split('\n')) {
    let line = '';

    for (const word of supplied.split(' ')) {
      const next = line ? `${line} ${word}` : word;

      if (line && pen.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }

    lines.push(line);
  }

  for (const [index, line] of lines.entries()) {
    const width = pen.measureText(line).width;
    const top = y + index * (size + 3);
    const left = align === 'left' ? x : align === 'right' ? x - width : x - width / 2;
    pen.fillStyle = colors.paper;
    pen.fillRect(left - 2, top - size / 2 - 1, width + 4, size + 2);
    pen.fillStyle = colors[tone];
    pen.fillText(line, x, top);
  }
}

function claimCaption(pen: CanvasRenderingContext2D, after: string, right: number, y: number, size: number, colors: Colors): void {
  pen.font = `${size}px "Special Elite"`;
  const first = pen.measureText('CLAIMED').width;
  const rest = pen.measureText(after).width;
  const content = after.trimStart();
  const gap = pen.measureText(after.slice(0, after.length - content.length)).width;
  const x = right - first - rest;
  caption(pen, 'CLAIMED', x, y, size, colors, first, 'blue', 'left');
  caption(pen, content, x + first + gap, y, size, colors, rest, 'ink', 'left');
}

function line(pen: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, amount = 1): void {
  pen.beginPath();
  pen.moveTo(x0, y0);
  pen.lineTo(mix(x0, x1, amount), mix(y0, y1, amount));
  pen.stroke();
}

function arrow(pen: CanvasRenderingContext2D, from: Complex, to: Complex, amount: number, unit: number): void {
  if (amount <= 0) return;

  const x = mix(from.re, to.re, amount);
  const y = mix(from.im, to.im, amount);
  line(pen, from.re, from.im, x, y);
  const angle = Math.atan2(to.im - from.im, to.re - from.re);
  const tip = Math.min(5, unit * .24);
  pen.beginPath();
  pen.moveTo(x - tip * Math.cos(angle - .5), y - tip * Math.sin(angle - .5));
  pen.lineTo(x, y);
  pen.lineTo(x - tip * Math.cos(angle + .5), y - tip * Math.sin(angle + .5));
  pen.stroke();
}

function echo(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, complete = false, labels = true): void {
  const small = box.h < 145;
  const font = small ? 10 : 12;
  const mirror = complete ? 1 : smooth(time, 15500, 17400);
  const plot = { x: box.x + 18, y: box.y + 24, w: box.w - 36, h: box.h - 48 };
  const baseline = plot.y + plot.h - 5;
  const unit = (plot.h - 3) / 14;
  const zero = mix(plot.x, plot.x + plot.w / 2, mirror);
  const step = plot.w / mix(12, 24, mirror);
  const motion = openingShift(time);
  const last = complete || time >= 15500 ? 12 : motion.settled ? motion.shift : motion.shift - 1;
  const title = time >= 15500 || complete ? 'ECHO: PEAK 13, SIDELOBES ≤ 1' : time >= 7500 ? 'BARKER 13' : 'AGREEMENTS MINUS DISAGREEMENTS';
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .75;
  line(pen, plot.x, baseline, plot.x + plot.w, baseline);

  if (time >= 7500 || complete) {
    pen.setLineDash([2, 3]);
    line(pen, plot.x, baseline - unit, plot.x + plot.w, baseline - unit, complete ? 1 : progress(time, 7500, 8500));
    line(pen, plot.x, baseline + unit, plot.x + plot.w, baseline + unit, complete ? 1 : progress(time, 7500, 8500));
    pen.setLineDash([]);
    if (labels) caption(pen, '±1', plot.x - 3, baseline - unit - 3, 9, colors, 20, 'muted', 'right');
  }

  pen.strokeStyle = colors.ink;
  pen.fillStyle = colors.ink;
  pen.lineWidth = Math.max(1, Math.min(3, step * .35));

  for (let shift = 0; shift <= last; shift++) {
    const value = aperiodic(BARKER13, shift);
    const height = value * unit;
    const x = zero + shift * step;
    line(pen, x, baseline, x, baseline - height);

    if (value === 0) {
      pen.beginPath();
      pen.arc(x, baseline, 1.2, 0, Math.PI * 2);
      pen.fill();
    }

    if (shift > 0 && mirror > 0) {
      const negativeX = zero - shift * step * mirror;
      line(pen, negativeX, baseline, negativeX, baseline - height);

      if (value === 0) {
        pen.beginPath();
        pen.arc(negativeX, baseline, 1.2, 0, Math.PI * 2);
        pen.fill();
      }
    }
  }

  if (labels) {
    caption(pen, title, box.x + box.w / 2, box.y + 9, font, colors, box.w - 3);
    caption(pen, '13', zero + 6, baseline - 13 * unit + 3, 10, colors, 24, 'ink', 'left');
    caption(pen, 'SHIFT', box.x + box.w / 2, box.y + box.h - 5, font, colors, box.w);

    for (const shift of mirror > .99 ? [-12, 0, 12] : [0, 6, 12]) {
      caption(pen, String(shift), zero + shift * step, baseline + 13, 10, colors, 24);
    }
  }
}

function wrappedStack(pen: CanvasRenderingContext2D, box: Box, colors: Colors, labels = true, showSum = true): void {
  const small = box.h < 145;
  const first = aperiodic(BARKER13, 4);
  const second = aperiodic(BARKER13, BARKER13.length - 4);
  const sum = periodic(BARKER13, 4);
  const unit = small ? 20 : Math.min(box.h * .30, 44);
  const x = box.x + box.w * (small ? .22 : .40);
  const y = small ? box.y + 56 : box.y + box.h * .72;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  line(pen, small ? x - 12 : box.x + box.w * .18, y, small ? x + 30 : box.x + box.w * .77, y);
  pen.strokeRect(x, y - first * unit, 15, first * unit);
  pen.beginPath();
  pen.arc(x + 7.5, y - sum * unit, 3, 0, Math.PI * 2);
  pen.stroke();

  if (labels && small) {
    const labelX = box.x + box.w * .45;
    caption(pen, `+ C(9) = ${second}`, labelX, box.y + 24, 11, colors, box.w * .53, 'ink', 'left');
    caption(pen, `C(4) = ${first}`, labelX, box.y + 39, 11, colors, box.w * .53, 'ink', 'left');
    if (showSum) caption(pen, `P(4) = ${sum}`, labelX, box.y + 54, 11, colors, box.w * .53, 'ink', 'left');
  } else if (labels) {
    caption(pen, `C(4) = ${first}`, x + 25, y - unit / 2, 13, colors, box.w * .5, 'ink', 'left');
    caption(pen, `+ C(9) = ${second}`, x + 25, y - unit - 12, 13, colors, box.w * .5, 'ink', 'left');
    if (showSum) caption(pen, `P(4) = ${sum}`, box.x + box.w / 2, y + 18, 13, colors, box.w);
  }
}

function wrapped(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place): void {
  if (time < 35000) {
    const carry = smooth(time, 30500, 31600);

    if (carry < 1) echo(pen, { ...box, x: box.x - carry * box.w }, 18000, colors, true, false);

    wrappedStack(pen, { ...box, x: box.x + (1 - carry) * box.w }, colors, carry === 1, time >= 31800);
    caption(pen, 'WRAPPED SHIFT 4', box.x + box.w / 2, box.y + 8, box.h < 145 ? 11 : 13, colors, box.w);
    if (time < 31800) place('wrapping', box.x + box.w / 2, box.y + box.h - (box.h < 145 ? 9 : 0));
    return;
  }

  const shift = smooth(time, 35000, 36300);

  if (shift < 1) wrappedStack(pen, { ...box, x: box.x - shift * box.w }, colors, false);

  periodicBars(pen, { ...box, x: box.x + (1 - shift) * box.w }, time, colors, shift === 1);

  if (shift < 1) caption(pen, 'WRAPPED COUNTS', box.x + box.w / 2, box.y + 10, box.h < 145 ? 11 : 13, colors, box.w);
}

function periodicBars(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, labels = true): void {
  const small = box.h < 145;
  const baseline = box.y + box.h * .76;
  const unit = Math.min(box.h * .13, box.w * .095);
  const firstX = box.x + box.w * .19;
  const step = box.w * .21;
  const morph = smooth(time, 52500, 55300);
  const squareSide = unit;
  const squareX = box.x + box.w / 2 - squareSide;
  const squareY = box.y + box.h * .48 - squareSide;
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .8;

  if (morph < 1) line(pen, box.x + 8, baseline, box.x + box.w - 8, baseline);

  for (let shift = 0; shift < 4; shift++) {
    const value = periodic(ROW4, shift);
    const x = firstX + shift * step;

    if (shift === 0) {
      for (let cell = 0; cell < value; cell++) {
        const fromX = x - unit * .32;
        const fromY = baseline - (cell + 1) * unit;
        const toX = squareX + cell % 2 * squareSide;
        const toY = squareY + Math.floor(cell / 2) * squareSide;
        pen.strokeStyle = colors.ink;
        pen.lineWidth = 1;
        pen.strokeRect(mix(fromX, toX, morph), mix(fromY, toY, morph), mix(unit * .64, squareSide, morph), unit);
      }
    } else if (morph < 1) {
      pen.fillStyle = colors.ink;
      pen.beginPath();
      pen.arc(x, baseline, 1.8, 0, Math.PI * 2);
      pen.fill();
    }

    if (morph < .9 && labels) {
      caption(pen, String(value), x, baseline - value * unit - 11, small ? 11 : 13, colors, 25);
      caption(pen, String(shift), x, baseline + 15, 10, colors, 25);
    }
  }

  if (time < 52500 && labels) {
    caption(pen, 'WRAPPED COUNTS', box.x + box.w / 2, box.y + 10, small ? 11 : 13, colors, box.w);
    caption(pen, 'SHIFT', small ? box.x + box.w - 2 : box.x + box.w / 2, baseline + (small ? 15 : 31), 10, colors, box.w, 'ink', small ? 'right' : 'center');
  }
}

function unitCircle(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, remark: boolean, labels = true): void {
  const small = box.h < 145;
  const center = { x: box.x + box.w / 2, y: box.y + box.h * .53 };
  const radius = Math.min(box.w * .34, box.h * .30);
  const built = remark ? progress(time, 102000, 102800) : progress(time, 81750, 82750);
  pen.lineWidth = .8;
  pen.strokeStyle = colors.muted;
  line(pen, center.x - radius - 5, center.y, center.x + radius + 5, center.y, built);
  line(pen, center.x, center.y + radius + 5, center.x, center.y - radius - 5, built);
  pen.strokeStyle = colors.ink;
  pen.beginPath();
  pen.arc(center.x, center.y, radius, 0, Math.PI * 2 * built);
  pen.stroke();

  if (built < 1) return;

  if (labels) {
    caption(pen, '1', center.x + radius - 10, center.y + 7, 10, colors, 20);
    caption(pen, 'i', center.x + 6, center.y - radius + 10, 11, colors, 20);
  }

  if (remark) {
    const angle = Math.PI / 2 * smooth(time, 103200, 106000);
    const x = center.x + Math.cos(angle) * radius;
    const y = center.y - Math.sin(angle) * radius;
    pen.fillStyle = colors.ink;
    pen.beginPath();
    pen.arc(x, y, small ? 3.2 : 4.5, 0, Math.PI * 2);
    pen.fill();
    if (labels) caption(pen, 'W = i · ORDER 4, EVEN', box.x + box.w / 2, box.y + box.h - 4, small ? 11 : 13, colors, box.w);
    return;
  }

  for (const order of [3, 5]) {
    for (let index = 0; index < order; index++) {
      const angle = Math.PI * 2 * index / order;
      pen.fillStyle = colors.ink;
      pen.beginPath();
      pen.arc(center.x + Math.cos(angle) * radius, center.y - Math.sin(angle) * radius, small ? 1.8 : 2.5, 0, Math.PI * 2);
      pen.fill();
    }
  }

  const travel = smooth(time, 89000, 91600);
  const firstAngle = (1 - travel) * Math.PI * 2 / 3;
  const secondAngle = (1 - travel) * Math.PI * 4 / 5;
  const first = { x: center.x + Math.cos(firstAngle) * radius, y: center.y - Math.sin(firstAngle) * radius };
  const second = { x: center.x + Math.cos(secondAngle) * radius, y: center.y - Math.sin(secondAngle) * radius };
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.3;
  pen.fillStyle = colors.paper;
  pen.beginPath();
  pen.arc(first.x, first.y, 4, 0, Math.PI * 2);
  pen.fill();
  pen.stroke();
  pen.beginPath();
  pen.moveTo(second.x, second.y - 5);
  pen.lineTo(second.x + 5, second.y);
  pen.lineTo(second.x, second.y + 5);
  pen.lineTo(second.x - 5, second.y);
  pen.closePath();
  pen.fill();
  pen.stroke();
  const labelX = center.x + radius + 24;
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .6;
  line(pen, first.x, first.y, labelX - 6, center.y - 13);
  line(pen, second.x, second.y, labelX - 6, center.y + 13);
  caption(pen, 'R', labelX, center.y - 13, 11, colors, 18);
  caption(pen, 'W', labelX, center.y + 13, 11, colors, 18);
  caption(pen, 'SCHEMATIC: R AND W', box.x + box.w / 2, box.y + 5, small ? 10 : 12, colors, box.w);
  caption(pen, 'ONLY IF A MATRIX EXISTS', box.x + box.w / 2, box.y + box.h - 3, small ? 10 : 12, colors, box.w);
}

function walks(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const small = box.h < 145;
  const amount = progress(time, 93500, 97800) * 9;
  const collapse = smooth(time, 98800, 100800);
  const lineUnit = (box.w - 65) / 9;
  const triangleUnit = Math.min(box.w * .12, box.h * .23);
  const startX = box.x + 26;
  const topY = box.y + box.h * .35;
  const bottomY = box.y + box.h * .77;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;

  for (let index = 0; index < 9; index++) {
    const part = Math.min(1, Math.max(0, amount - index));
    const from = TRIVIAL_WALK[index];
    const to = TRIVIAL_WALK[index + 1];
    const triFrom = THIRD_WALK[index];
    const triTo = THIRD_WALK[index + 1];

    if (from && to) {
      arrow(pen, { re: startX + from.re * lineUnit, im: topY - from.im * lineUnit }, { re: startX + to.re * lineUnit, im: topY - to.im * lineUnit }, part, lineUnit);
    }

    if (triFrom && triTo) {
      const scale = triangleUnit * (1 - collapse);
      const x = box.x + box.w * .48;
      arrow(pen, { re: x + triFrom.re * scale, im: bottomY - triFrom.im * scale }, { re: x + triTo.re * scale, im: bottomY - triTo.im * scale }, part, triangleUnit);
    }
  }

  caption(pen, '+', box.x + 6, topY, 15, colors, 20);
  caption(pen, '−', box.x + 6, bottomY, 15, colors, 20);
  caption(pen, '9', startX + 9 * lineUnit + 9, topY, 12, colors, 20);
  caption(pen, '0', box.x + box.w * .48 + triangleUnit + 16, bottomY, 12, colors, 20);
  caption(pen, collapse > .99 ? 'ONE NONZERO TERM' : '9 UNIT STEPS EACH', box.x + box.w / 2, box.y + 8, small ? 11 : 13, colors, box.w);

  if (collapse > .99) {
    pen.fillStyle = colors.ink;
    pen.beginPath();
    pen.arc(box.x + box.w * .48, bottomY, 2, 0, Math.PI * 2);
    pen.fill();
  }
}

export function drawChart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place): void {
  pen.save();
  pen.beginPath();
  pen.rect(box.x - 2, box.y - 7, box.w + 4, box.h + 18);
  pen.clip();

  if (time < 30500) {
    echo(pen, box, time, colors);
  } else if (time < 38000) {
    wrapped(pen, box, time, colors, place);
  } else if (time < 81750) {
    periodicBars(pen, box, time, colors);

    if (time >= 55300) place('order', box.x + box.w / 2, box.y + box.h - 5);
  } else if (time < 93250) {
    unitCircle(pen, box, time, colors, false);
  } else if (time < 101750) {
    walks(pen, box, time, colors);
  } else if (time < 109250) {
    unitCircle(pen, box, time, colors, true);
  } else {
    const move = smooth(time, 109250, 110500);

    if (move < 1) unitCircle(pen, { ...box, x: box.x - move * box.w }, time, colors, true, false);

    echo(pen, { ...box, x: box.x + (1 - move) * box.w }, time, colors, true, move === 1);

    if (move < 1) caption(pen, 'ECHO: PEAK 13, SIDELOBES ≤ 1', box.x + box.w / 2, box.y + 9, box.h < 145 ? 10 : 12, colors, box.w);
  }

  pen.restore();
}

function tick(pen: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  pen.beginPath();
  pen.moveTo(x - size, y);
  pen.lineTo(x - size * .25, y + size * .7);
  pen.lineTo(x + size, y - size);
  pen.stroke();
}

function cross(pen: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  line(pen, x - size, y - size, x + size, y + size);
  line(pen, x - size, y + size, x + size, y - size);
}

function tinyMatrix(pen: CanvasRenderingContext2D, x: number, y: number, side: number, colors: Colors): void {
  const unit = side / 4;

  for (let row = 0; row < 4; row++) {
    for (let column = 0; column < 4; column++) {
      pen.strokeStyle = colors.ink;
      pen.fillStyle = row === column ? colors.paper : colors.ink;
      pen.fillRect(x + column * unit, y + row * unit, unit * .8, unit * .8);
      pen.strokeRect(x + column * unit, y + row * unit, unit * .8, unit * .8);
    }
  }
}

function barkerLedger(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const small = box.w < 400;
  if (time >= 109250) {
    caption(pen, 'BARKER n > 1', box.x, box.y + 6, small ? 10 : 12, colors, box.w * .4, 'ink', 'left');
    caption(pen, Object.keys(KNOWN_ROWS).join(' '), box.x + box.w, box.y + 6, small ? 12 : 14, colors, box.w * .65, 'ink', 'right');
    const size = small ? 10 : 12;
    const prefix = 'ODD 1961/2016 · EVEN ';
    const claimed = 'CLAIMED';
    const date = ' 2026';
    pen.font = `${size}px "Special Elite"`;
    const prefixWidth = pen.measureText(prefix).width;
    const claimWidth = pen.measureText(claimed).width;
    const total = prefixWidth + claimWidth + pen.measureText(date).width;
    const left = box.x + (box.w - total) / 2;
    const y = box.y + box.h * .82;
    caption(pen, prefix, left, y, size, colors, box.w, 'ink', 'left');
    caption(pen, claimed, left + prefixWidth, y, size, colors, box.w, 'blue', 'left');
    caption(pen, date.trimStart(), left + prefixWidth + claimWidth + pen.measureText(' ').width, y, size, colors, box.w, 'ink', 'left');
    return;
  }

  const unit = box.w / 17;
  const headerY = box.y + 5;
  const numberY = box.y + box.h * .50;
  const markY = box.y + box.h * .88;
  const revealed = progress(time, 23000, 24300) * 16;
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .65;
  line(pen, box.x, box.y + box.h, box.x + box.w, box.y + box.h, progress(time, 23000, 24000));
  caption(pen, 'BARKER LENGTH', box.x, headerY, small ? 10 : 12, colors, box.w, 'ink', 'left');

  if (time >= 66500) {
    claimCaption(pen, ' COMPLETE', box.x + box.w, headerY, small ? 10 : 12, colors);
  }

  for (let length = 1; length <= 16; length++) {
    if (length > revealed + 1) continue;

    const x = box.x + unit * (length - .5);
    caption(pen, String(length), x, numberY, small ? 10 : 12, colors, unit);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1;
    const knownLength = ([2, 3, 4, 5, 7, 11, 13] as const).find(value => value === length);
    const row = knownLength === undefined ? undefined : KNOWN_ROWS[knownLength];

    if (row) {
      tick(pen, x, markY, small ? 2.2 : 3.2);

      if (time < 30500 && (!small || length <= 7)) {
        const cell = Math.min(2, unit * .75 / length);

        for (const [index, sign] of row.entries()) {
          const tileX = x - length * cell / 2 + index * cell;
          pen.fillStyle = sign === 1 ? colors.ink : colors.paper;
          pen.fillRect(tileX, markY + 6, Math.max(.8, cell * .8), 2);
          pen.strokeRect(tileX, markY + 6, Math.max(.8, cell * .8), 2);
        }
      }
    } else if (length >= 6 && length % 2 === 0) {
      caption(pen, '?', x, markY, small ? 11 : 13, colors, unit);
    } else if (length === 9 || length === 15) {
      cross(pen, x, markY, small ? 2.6 : 3.5);
    }
  }

  caption(pen, '…', box.x + box.w - unit * .35, numberY, 12, colors, unit);

  if (time >= 66500) {
    pen.strokeStyle = colors.blue;
    pen.lineWidth = 1.2;
    pen.setLineDash([4, 3]);
    for (let length = 6; length <= 16; length += 2) {
      const x = box.x + unit * (length - .5);
      line(pen, x - unit * .3, markY, x + unit * .3, markY, progress(time, 66500, 68100));
    }

    pen.setLineDash([]);
  }
}

function matrixLedger(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  if (time < 46000) return;

  const small = box.w < 400;
  const unit = box.w / 17;
  const numberY = box.y + box.h * .55;
  const markY = box.y + box.h * .90;
  if (time >= 109250) {
    caption(pen, 'ORDERS 1 AND 4', box.x, box.y + 7, small ? 10 : 12, colors, box.w * .4, 'ink', 'left');
    claimCaption(pen, ': NONE BEYOND 4', box.x + box.w, box.y + 7, small ? 10 : 12, colors);
  } else {
    caption(pen, small ? 'CIRCULANT HADAMARD: ORDER n' : 'CIRCULANT HADAMARD, ORDER n', box.x, box.y + 7, small ? 10 : 12, colors, box.w, 'ink', 'left');
  }

  for (let order = 1; order <= 16; order++) {
    const x = box.x + unit * (order - .5);
    caption(pen, String(order), x, numberY, small ? 10 : 12, colors, unit);

    if (order === 1) {
      pen.fillStyle = colors.ink;
      pen.fillRect(x - 2, markY - 2, 4, 4);
    } else if (order === 4) {
      tinyMatrix(pen, x - 4, markY - 4, 8, colors);
    } else if (order > 4) {
      caption(pen, '?', x, markY, small ? 11 : 13, colors, unit);

      if (time >= 109250) {
        pen.strokeStyle = colors.blue;
        pen.lineWidth = 1.2;
        pen.setLineDash([3, 2]);
        line(pen, x - unit * .3, markY, x + unit * .3, markY);
        pen.setLineDash([]);
      }
    }
  }

  caption(pen, '…', box.x + box.w - unit * .35, numberY, 12, colors, unit);
}

function turynLedger(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const small = box.w < 400;
  const y = box.y + box.h * .65;
  const move = smooth(time, 59500, 60600);
  const crossed = progress(time, 60600, 62600) * 100;
  const first = box.x + 5;
  const width = box.w - 10;
  caption(pen, small ? 'u: ODD, NOT A PRIME POWER' : "LEFT BY TURYN'S 1965 RESTRICTION · u", box.x, box.y + 7, small ? 10 : 12, colors, box.w, 'ink', 'left');
  pen.lineWidth = .9;

  for (let u = 1; u < 100; u++) {
    const x = first + (u - 1) / 98 * width;

    if (u === 1) {
      tinyMatrix(pen, x - 4, y - 4, 8, colors);
      caption(pen, '1', x, y + 12, 10, colors, 15);
    } else if (u % 2 === 0) {
      if (move < 1) {
        pen.fillStyle = colors.muted;
        pen.beginPath();
        pen.arc(x, y + move * box.h, 1.1, 0, Math.PI * 2);
        pen.fill();
      }
    } else if (SURVIVORS.has(u)) {
      pen.strokeStyle = colors.ink;
      pen.beginPath();
      pen.arc(x, y, small ? 2 : 3, 0, Math.PI * 2);
      pen.stroke();

      if (u === 15 || !small && [35, 55, 75, 99].includes(u)) {
        caption(pen, String(u), x, y + 12, 10, colors, 24);
      }
    } else {
      pen.strokeStyle = colors.muted;

      if (u < crossed) {
        cross(pen, x, y, small ? 1.1 : 1.8);
      } else {
        pen.beginPath();
        pen.arc(x, y, 1, 0, Math.PI * 2);
        pen.stroke();
      }
    }
  }

  if (time >= 66500) {
    pen.strokeStyle = colors.blue;
    pen.lineWidth = 1.3;
    pen.setLineDash([4, 3]);
    line(pen, first + 14 / 98 * width, y, first + width, y, progress(time, 66500, 68100));
    pen.setLineDash([]);
  }
}

export function drawLedger(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  if (time < 23000) return;

  pen.save();
  pen.beginPath();
  pen.rect(box.x - 3, box.y - 3, box.w + 6, box.h + 8);
  pen.clip();
  const rowHeight = box.h * .48;
  barkerLedger(pen, { x: box.x, y: box.y, w: box.w, h: rowHeight }, time, colors);
  const lower = { x: box.x, y: box.y + box.h * .52, w: box.w, h: rowHeight };

  if (time >= 109250) {
    const move = smooth(time, 109250, 110500);

    if (move < 1) turynLedger(pen, { ...lower, x: lower.x - move * lower.w }, time, colors);

    matrixLedger(pen, { ...lower, x: lower.x + (1 - move) * lower.w }, time, colors);
  } else if (time >= 59500) {
    turynLedger(pen, lower, time, colors);
  } else {
    matrixLedger(pen, lower, time, colors);
  }

  pen.restore();
}

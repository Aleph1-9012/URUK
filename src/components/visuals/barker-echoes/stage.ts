import { mix, smooth } from '../../../lib/animation';
import type { FilmLabels } from '../../plate/labels';
import { BARKER13, KNOWN_ROWS, ROW4, ROW36, aperiodic, circulant, coefficientRows, evaluations, fold, periodic, slidePairs, type Complex, type Sign, type SignRow } from './math';
import { openingShift } from './motion';
import type { Box } from './story';

type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

const MATRIX = circulant(ROW4);
const GRID = fold(ROW36, 3);
const COEFFICIENTS = coefficientRows(GRID);
const LENGTHS = [2, 3, 4, 5, 7, 11, 13] as const;

function tag(pen: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, colors: Colors, maxWidth: number): void {
  pen.font = `${size}px "Special Elite", monospace`;
  const measured = pen.measureText(text).width;

  if (measured > maxWidth) pen.font = `${Math.max(9, size * maxWidth / measured)}px "Special Elite", monospace`;

  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  const width = pen.measureText(text).width;
  pen.fillStyle = colors.paper;
  pen.fillRect(x - width / 2 - 3, y - size * .65, width + 6, size * 1.3);
  pen.fillStyle = colors.ink;
  pen.fillText(text, x, y);
}

function tile(pen: CanvasRenderingContext2D, sign: Sign, x: number, y: number, size: number, colors: Colors, glyph = true): void {
  pen.fillStyle = sign === 1 ? colors.ink : colors.paper;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .8;
  pen.fillRect(x, y, size, size);
  pen.strokeRect(x, y, size, size);

  if (!glyph || size < 12) return;

  pen.strokeStyle = sign === 1 ? colors.paper : colors.ink;
  const middleX = x + size / 2;
  const middleY = y + size / 2;
  const reach = Math.min(4.5, size * .22);
  pen.beginPath();
  pen.moveTo(middleX - reach, middleY);
  pen.lineTo(middleX + reach, middleY);

  if (sign === 1) {
    pen.moveTo(middleX, middleY - reach);
    pen.lineTo(middleX, middleY + reach);
  }

  pen.stroke();
}

function row(pen: CanvasRenderingContext2D, signs: SignRow, x: number, y: number, step: number, colors: Colors, glyph = true): void {
  for (const [index, sign] of signs.entries()) tile(pen, sign, x + index * step, y, step * .78, colors, glyph);
}

function mark(pen: CanvasRenderingContext2D, agree: boolean, x: number, y: number, size: number, colors: Colors): void {
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.1;
  pen.beginPath();

  if (agree) {
    pen.moveTo(x - size * .45, y);
    pen.lineTo(x - size * .1, y + size * .35);
    pen.lineTo(x + size * .5, y - size * .4);
  } else {
    pen.moveTo(x - size * .4, y - size * .4);
    pen.lineTo(x + size * .4, y + size * .4);
    pen.moveTo(x - size * .4, y + size * .4);
    pen.lineTo(x + size * .4, y - size * .4);
  }

  pen.stroke();
}

function knownPosition(box: Box, length: number): { x: number; y: number; step: number } {
  const index = LENGTHS.indexOf(length === 2 || length === 3 || length === 4 || length === 5 || length === 7 || length === 11 || length === 13 ? length : 13);
  const step = Math.min(18, box.w / 17);

  return { x: box.x + box.w * .24, y: box.y + 22 + index * (box.h - 30) / 7, step };
}

function ledgerPosition(ledger: Box, length: number): { x: number; y: number; step: number } {
  const cell = ledger.w / 16;

  return { x: ledger.x + (length - .5) * cell - length * .65, y: ledger.y + ledger.h * .27, step: 1.3 };
}

function knownRows(pen: CanvasRenderingContext2D, box: Box, ledger: Box, time: number, colors: Colors): void {
  const enter = smooth(time, 23000, 24200);
  const leave = smooth(time, 30500, 31400);
  tag(pen, 'THE KNOWN BARKER ROWS', box.x + box.w / 2, box.y + 7, 11, colors, box.w);

  for (const length of LENGTHS) {
    if (length === 13 && time >= 30500) continue;

    const here = knownPosition(box, length);
    const there = ledgerPosition(ledger, length);
    let x = mix(there.x, here.x, enter);
    let y = mix(there.y, here.y, enter);
    let step = mix(there.step, here.step, enter);

    if (length === 13 && time < 24200) {
      const openingStep = Math.min(30, box.w / 13);
      x = mix(box.x + (box.w - openingStep * 13) / 2, here.x, enter);
      y = mix(box.y + box.h * .28, here.y, enter);
      step = mix(openingStep, here.step, enter);
    }

    x = mix(x, there.x, leave);
    y = mix(y, there.y, leave);
    step = mix(step, there.step, leave);
    row(pen, KNOWN_ROWS[length], x, y, step, colors);

    if (enter === 1 && leave === 0) tag(pen, String(length), box.x + box.w * .13, y + step * .4, 11, colors, 25);
  }
}

function opening(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const state = openingShift(time);
  const echo = time >= 15500;
  const position = echo ? mix(12, 0, smooth(time, 15500, 16800)) : state.position;
  const step = Math.min(30, box.w / (13 + position));
  const x = box.x + (box.w - step * (13 + position)) / 2;
  const y = box.y + box.h * .26;
  const copyY = y + Math.max(step * 1.65, box.h * .27) * smooth(time, 0, 700) * (1 - smooth(time, 15500, 16800));
  const size = step * .78;
  tag(pen, echo ? 'A THIRTEEN-SIGN BARKER ROW' : 'SLIDE A COPY · NO WRAPPING', box.x + box.w / 2, box.y + 7, 11, colors, box.w);
  row(pen, BARKER13, x, y, step, colors);
  row(pen, BARKER13, x + position * step, copyY, step, colors);

  if (echo || !state.settled || time < 700) {
    tag(pen, 'FILLED +     OPEN −', box.x + box.w / 2, box.y + box.h * .86, 10, colors, box.w);
    return;
  }

  const pairs = slidePairs(BARKER13, state.shift);
  let agreements = 0;

  for (const pair of pairs) {
    if (pair.agree) agreements++;

    mark(pen, pair.agree, x + (pair.top + .39) * step, (y + size + copyY) / 2, Math.min(7, step * .38), colors);
  }

  tag(pen, `SHIFT ${state.shift} · ${agreements} AGREE − ${pairs.length - agreements} DISAGREE = ${aperiodic(BARKER13, state.shift)}`, box.x + box.w / 2, box.y + box.h * .86, 11, colors, box.w);
}

function wrapThirteen(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const step = Math.min(26, box.w / 17);
  const target = { x: box.x + (box.w - 17 * step) / 2, y: box.y + box.h * .25 };
  const start = knownPosition(box, 13);
  const lift = smooth(time, 30500, 31200);
  const x = mix(start.x, target.x, lift);
  const y = mix(start.y, target.y, lift);
  const topStep = mix(start.step, step, lift);
  row(pen, BARKER13, x, y, topStep, colors);
  const copyY = target.y + Math.max(step * 1.7, box.h * .28);
  let complete = true;
  tag(pen, 'THE SAME SHIFT · CARRY THE OVERHANG ROUND', box.x + box.w / 2, box.y + 7, 10.5, colors, box.w);

  for (const [index, sign] of BARKER13.entries()) {
    const original = index + 4;
    const wrap = index < 9 ? 0 : smooth(time, 31400 + (index - 9) * 280, 31950 + (index - 9) * 280);
    const slot = mix(original, original - 13, wrap);
    const flightY = Math.sin(Math.PI * wrap) * box.h * .22;
    const copyLift = smooth(time, 30700, 31400);
    const tileX = mix(x + index * topStep, target.x + slot * step, copyLift);
    const tileY = mix(y, copyY + flightY, copyLift);
    tile(pen, sign, tileX, tileY, step * .78, colors);

    if (index >= 9 && wrap !== 1) complete = false;
  }

  if (complete) {
    for (let index = 0; index < 13; index++) {
      const first = BARKER13[index];
      const second = BARKER13[(index + 9) % 13];
      mark(pen, first === second, target.x + (index + .39) * step, (target.y + step * .78 + copyY) / 2, 6, colors);
    }
  }

  tag(pen, complete ? `WRAPPED: 13 PAIRS · P(4) = ${periodic(BARKER13, 4)}` : '9 OVERLAPS + 4 CARRIED TILES', box.x + box.w / 2, box.y + box.h * .89, 10.5, colors, box.w);
}

function wrappedFour(pen: CanvasRenderingContext2D, box: Box, ledger: Box, time: number, colors: Colors): void {
  const lift = smooth(time, 33700, 34500);
  const step = Math.min(32, box.w / 8);
  const x = box.x + (box.w - 4 * step) / 2;
  const y = box.y + box.h * .23;
  const from = ledgerPosition(ledger, 4);
  row(pen, ROW4, mix(from.x, x, lift), mix(from.y, y, lift), mix(from.step, step, lift), colors);
  const shift = Math.min(3, 1 + Math.floor(Math.max(0, time - 34600) / 1000));
  const start = 34600 + (shift - 1) * 1000;
  const move = smooth(time, start, start + 350);
  const copyY = y + Math.max(step * 1.65, box.h * .28);
  const previous = (shift + 3) % 4;
  tag(pen, 'NOW THE FOUR-SIGN ROW', box.x + box.w / 2, box.y + 7, 11, colors, box.w);

  for (const [index, sign] of ROW4.entries()) {
    const fromSlot = (index + previous) % 4;
    const toSlot = (index + shift) % 4;
    const tileX = mix(x + fromSlot * step, x + toSlot * step, move);
    const tileY = copyY + (toSlot === 0 ? Math.sin(Math.PI * move) * step : 0);
    tile(pen, sign, tileX, mix(y, tileY, smooth(time, 34100, 34600)), step * .78, colors);
  }

  if (move === 1) {
    const shifted = MATRIX[shift];

    for (let index = 0; index < 4; index++) mark(pen, ROW4[index] === shifted?.[index], x + (index + .39) * step, (y + step * .78 + copyY) / 2, 7, colors);
  }

  tag(pen, move === 1 ? `SHIFT ${shift} · 2 AGREE − 2 DISAGREE = 0` : 'CARRY THE LAST TILE TO THE FRONT', box.x + box.w / 2, box.y + box.h * .87, 11, colors, box.w);
}

function matrixGeometry(box: Box, time: number): { x: number; y: number; step: number; parked: boolean } {
  const settle = smooth(time, 38000, 38700);
  const startStep = Math.min(32, box.w / 8);
  const finalStep = Math.min(35, box.h * .155, box.w / 7);
  const step = mix(startStep, finalStep, settle);
  const x = mix(box.x + (box.w - 4 * startStep) / 2, box.x + box.w * (box.w < 400 ? .5 : .36) - finalStep * 2, settle);
  const y = mix(box.y + box.h * .23, box.y + box.h * .21, settle);
  const park = smooth(time, 53500, 55100) * (1 - smooth(time, 101750, 102550));
  const small = box.w < 400 ? 6 : 12;

  return { x: mix(x, box.x + box.w - small * 4, park), y: mix(y, box.y + 4, park), step: mix(step, small, park), parked: park > .99 };
}

function drawMatrix(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const matrix = matrixGeometry(box, time);
  const phone = box.w < 400;
  const currentPair = Math.floor(Math.max(0, time - 42000) / 900) % 6;
  const pairs = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]] as const;
  const active = pairs[currentPair];
  const extraction = smooth(time, 102650, 103650);

  for (const [index, signs] of MATRIX.entries()) {
    if (index !== 3 && time < 38000 + index * 900) continue;

    const drop = smooth(time, 38000 + index * 900, 38700 + index * 900);
    const oldStep = Math.min(32, box.w / 8);
    const oldCopyY = box.y + box.h * .23 + Math.max(oldStep * 1.65, box.h * .28);
    const y = index === 3 ? mix(oldCopyY, matrix.y + 3 * matrix.step, smooth(time, 38000, 38700)) : matrix.y + index * matrix.step * drop;
    const extracting = time >= 101750 && index === 3;
    const targetX = phone ? matrix.x : box.x + box.w - matrix.step * 3.78 - 3;
    const targetY = box.y + box.h * (phone ? .76 : .33);
    const rowX = extracting ? mix(matrix.x, targetX, extraction) : matrix.x;
    const rowY = extracting ? mix(y, targetY, extraction) : y;
    row(pen, signs, rowX, rowY, matrix.step, colors);

    if (extracting) {
      pen.strokeStyle = colors.ink;
      pen.lineWidth = 1.7;
      pen.strokeRect(rowX - 3, rowY - 3, matrix.step * 3.78 + 6, matrix.step * .78 + 6);
    } else if (time >= 42000 && time < 52500 && active && (active[0] === index || active[1] === index)) {
      pen.strokeStyle = colors.muted;
      pen.strokeRect(matrix.x - 3, y - 3, matrix.step * 3.78 + 6, matrix.step * .78 + 6);
    }
  }

  if (matrix.parked) {
    if (box.w >= 400) tag(pen, '4 × 4', matrix.x + matrix.step * 1.9, matrix.y + matrix.step * 4.6, 9, colors, matrix.step * 6);
    return;
  }

  if (time < 52500) {
    tag(pen, 'CIRCULANT · EACH ROW SHIFTS ONCE', box.x + box.w / 2, box.y + 7, 11, colors, box.w);
    const pair = active ?? pairs[0];
    const first = MATRIX[pair[0]];
    const second = MATRIX[pair[1]];
    if (time >= 42000) {
      const markY = matrix.y + matrix.step * 4.15;

      for (let index = 0; index < 4; index++) mark(pen, first?.[index] === second?.[index], matrix.x + matrix.step * (index + .39), markY, 8, colors);

      tag(pen, '2 AGREE · 2 DISAGREE', matrix.x + matrix.step * 1.89, Math.min(markY + 18, box.y + box.h - 8), 10.5, colors, box.w);
    } else {
      tag(pen, 'STACK THE WRAPPED COPIES', box.x + box.w / 2, box.y + box.h * .96, 10.5, colors, box.w);
    }
  }

  if (time >= 103650) {
    const remark = MATRIX[3];

    if (!remark) return;

    const values = evaluations(remark);
    tag(pen, `c = ${values.c}   d = ${values.d}   g = ${complexText(values.g)}`, box.x + box.w * (phone ? .5 : .77), box.y + box.h * (phone ? .97 : .57), 12, colors, box.w * (phone ? 1 : .45));
    tag(pen, 'FOURTH ROW · +++−', box.x + box.w * (phone ? .5 : .77), box.y + box.h * (phone ? .69 : .68), 10.5, colors, box.w * (phone ? 1 : .45));
    tag(pen, 'THE GENUINE ORDER-FOUR EXAMPLE', box.x + box.w / 2, box.y + 7, 11, colors, box.w);
  }
}

function complexText(value: Complex): string {
  if (value.im === 0) return String(value.re);

  const imaginary = value.im === 1 ? 'i' : value.im === -1 ? '−i' : `${value.im}i`;

  if (value.re === 0) return imaginary;

  return `${value.re}${value.im > 0 ? '+' : '−'}${Math.abs(value.im) === 1 ? 'i' : `${Math.abs(value.im)}i`}`;
}

function drawFold(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: FilmLabels['place']): void {
  const phone = box.w < 400;
  const stepX = box.w / 10;
  const stepY = Math.min(31, box.h * .115);
  const cell = Math.min(stepX * .67, stepY * .77);
  const gridX = box.x + stepX;
  const gridY = box.y + box.h * .19;
  const departure = smooth(time, 101750, 102450) * box.h * 1.5;
  const visibleY = gridY + departure;
  tag(pen, 'ANY 36 SIGNS · u = 3', box.x + box.w * .43, box.y + 5 + departure, 10.5, colors, box.w * .8);
  tag(pen, 'THE MECHANICS ONLY', box.x + box.w * .43, box.y + 18 + departure, 10.5, colors, box.w * .8);

  for (const [index, sign] of ROW36.entries()) {
    const startColumn = phone ? index % 18 : index;
    const startRow = phone ? Math.floor(index / 18) : 0;
    const originalStep = box.w / (phone ? 18 : 36);
    const from = { x: box.x + startColumn * originalStep, y: box.y + box.h * .37 + startRow * 22 + departure };
    const to = { x: gridX + index % 9 * stepX, y: visibleY + index % 4 * stepY };
    const amount = smooth(time, 74000 + index * 65, 74700 + index * 65);
    const x = mix(from.x, to.x, amount);
    const y = mix(from.y, to.y, amount) - Math.sin(Math.PI * amount) * box.h * .12;
    tile(pen, sign, x, y, mix(originalStep * .75, cell, amount), colors, amount > .98);
  }

  if (time < 77800) {
    place('fold', box.x + box.w / 2, box.y + box.h * .96);
    return;
  }

  for (let column = 0; column < 9; column++) {
    const x = gridX + column * stepX + cell / 2;
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .65;
    pen.beginPath();
    pen.moveTo(x - cell / 2 - 2, visibleY - 3);
    pen.lineTo(x - cell / 2 - 2, visibleY + 3 * stepY + cell + 3);
    pen.stroke();

    if (time < 77800 + column * 160) continue;

    const baseY = visibleY + 4 * stepY + 9;
    const values = [COEFFICIENTS.c[column], COEFFICIENTS.d[column], COEFFICIENTS.g[column]];

    for (const [index, value] of values.entries()) {
      if (value === undefined) continue;

      const text = index === 2 ? complexText(COEFFICIENTS.g[column] ?? { re: 0, im: 0 }) : String(value);
      tag(pen, text.replaceAll('-', '−'), x, baseY + index * 14, phone ? 9.5 : 12, colors, stepX * .95);
    }
  }

  const baseY = visibleY + 4 * stepY + 9;

  for (const [index, label] of ['c', 'd', 'g'].entries()) tag(pen, label, box.x + 5, baseY + index * 14, 11, colors, 20);

}

function rowSum(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const step = Math.min(30, box.w / 7);
  const x = box.x + (box.w - 4 * step) / 2;
  const y = box.y + box.h * .33;
  row(pen, ROW4, x, y, step, colors);
  tag(pen, 'THE ROW SUM', box.x + box.w * .4, box.y + 8, 11, colors, box.w * .65);
  tag(pen, '−1 + 1 + 1 + 1 = 2', box.x + box.w / 2, y + step * 1.75, 13, colors, box.w);
  if (time < 59500) tag(pen, 'ROW SUM SQUARED: 2² = 4', box.x + box.w / 2, y + step * 2.55, 11, colors, box.w);

  if (time >= 59500) {
    tag(pen, '2017: 4,489 ORDERS REMAIN', box.x + box.w / 2, box.y + box.h * .83, 10.5, colors, box.w);
    tag(pen, 'BELOW 4·10³⁰ · CITED [8]', box.x + box.w / 2, box.y + box.h * .94, 10.5, colors, box.w);
  }
}

export function drawStage(pen: CanvasRenderingContext2D, box: Box, ledger: Box, time: number, colors: Colors, place: FilmLabels['place']): void {
  if (time < 23000) {
    opening(pen, box, time, colors);
    return;
  }

  if (time < 30500) {
    knownRows(pen, box, ledger, time, colors);
    return;
  }

  if (time < 33700) {
    if (time < 31400) knownRows(pen, box, ledger, time, colors);

    wrapThirteen(pen, box, time, colors);
    return;
  }

  if (time < 38000) {
    wrappedFour(pen, box, ledger, time, colors);
    return;
  }

  if (time < 73750) {
    drawMatrix(pen, box, time, colors);

    if (time >= 55100) rowSum(pen, box, time, colors);

    return;
  }

  if (time < 102450) drawFold(pen, box, time, colors, place);

  if (time < 101750) {
    drawMatrix(pen, box, time, colors);
    return;
  }

  if (time < 109250) {
    drawMatrix(pen, box, time, colors);
    return;
  }

  const closing = smooth(time, 109250, 110250);
  const from = ledgerPosition(ledger, 13);
  const step = Math.min(28, box.w / 13);
  const x = box.x + (box.w - step * 13) / 2;
  const y = box.y + box.h * .3;
  row(pen, BARKER13, mix(from.x, x, closing), mix(from.y, y, closing), mix(from.step, step, closing), colors);
  tag(pen, 'UNREVIEWED', box.x + box.w / 2, box.y + 8, 14, colors, box.w);
  tag(pen, 'LEAN: 30-LINE STATEMENT · 68-FILE PROOF', box.x + box.w / 2, box.y + box.h * .69, 10, colors, box.w);
  tag(pen, 'A KERNEL CHECK IS NOT HUMAN APPROVAL', box.x + box.w / 2, box.y + box.h * .83, 10, colors, box.w);
}

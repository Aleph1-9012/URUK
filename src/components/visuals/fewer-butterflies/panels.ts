import { mix, smooth } from '../../../lib/animation';
import { PHONE_STAGE_WIDTH } from '../../plate/frame';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { savingAtLog2, type FourierModel } from './math';

type Tones = { ink: string; muted: string; paper: string; blue: string };

export function plotLayout(width: number, height: number) {
  const phone = width < PHONE_STAGE_WIDTH;

  return {
    left: width * (phone ? .13 : .56),
    right: width * (phone ? .90 : .94),
    top: height * (phone ? .49 : .20),
    bottom: height * (phone ? .73 : .56),
    referenceY: height * (phone ? .51 : .25),
  };
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, ink: string): void {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = ink;
  ctx.fill();
}

function exponentText(value: number, digits: number): string {
  const [coefficient, exponent] = value.toExponential(digits).split('e');

  if (coefficient === undefined || exponent === undefined) throw new Error('A finite saving must have a coefficient and exponent.');

  const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  let power = '';

  for (const digit of String(Number(exponent))) {
    if (digit === '-') {
      power += '⁻';
      continue;
    }

    const glyph = superscripts[Number(digit)];

    if (glyph === undefined) throw new Error('A decimal exponent digit needs a superscript glyph.');

    power += glyph;
  }

  return coefficient + ' × 10' + power;
}

function topRows(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones, model: FourierModel): void {
  const phone = width < PHONE_STAGE_WIDTH;
  const { left, right } = plotLayout(width, height);
  const center = (left + right) / 2;
  const body = phone ? 8.5 : 10.5;
  const heading = phone ? 9.5 : 12;

  if (time < 41500) {
    const rows = [
      'SELECTED n log n REFERENCE = 1',
      'SCHEMATIC · CONSTANTS SUPPRESSED',
      'BOUNDED MULTIPLIERS: Ω(n log n)',
      'MORGENSTERN · 1973 · RESTRICTED MODEL',
    ];

    for (const [index, value] of rows.entries()) {
      drawText(ctx, value, center, height * (phone ? .325 + index * .035 : .06 + index * .032), { size: index === 0 ? heading : body, color: tones.ink, family: index === 0 || index === 2 ? 'math' : 'type', paper: tones.paper });
    }

    return;
  }

  if (time < 52250) {
    const rows = [
      'COMPANION CLAIM · UNRESTRICTED COEFFICIENTS',
      'o(n log n) ALONG AN UNBOUNDED SEQUENCE',
      'EXISTENCE ONLY · WHICH LENGTHS NOT SHOWN',
      'POSITIONS SCHEMATIC · NO SIZES OR VALUES',
    ];

    for (const [index, value] of rows.entries()) {
      drawText(ctx, value, center, height * (phone ? .325 + index * .035 : .06 + index * .032), { size: body, color: tones.ink, family: index === 1 ? 'math' : 'type', paper: tones.paper });
    }

    return;
  }

  const first = model.factorRows[0];
  const sixty = model.factorRows.find(row => row.log2N === 2 ** 60);

  if (!first || !sixty) throw new Error('The factor plot needs its two specified length readouts.');

  const values = [
    { text: 'CLAIMED MAIN: EXACT DFT AT EVERY LENGTH', family: 'type' as const, size: heading },
    { text: 'UNRESTRICTED COEFFICIENTS · ROOT SUPPLIED', family: 'type' as const, size: body },
    { text: 'NO STABILITY OR USEFUL CROSSOVER CLAIM', family: 'type' as const, size: body },
    { text: 'ONLY LOG FACTOR; CONSTANTS + LOGLOG OMITTED', family: 'type' as const, size: body },
    { text: 'FACTOR = exp(−ε ln ln n)', family: 'math' as const, size: phone ? 10.5 : 13 },
    { text: 'ε = 1 − θ = ' + exponentText(model.epsilon, 3), family: 'math' as const, size: phone ? 10.5 : 13 },
    { text: 'n = 2¹⁰: DROP ' + exponentText(first.drop, 2), family: 'math' as const, size: phone ? 10 : 12 },
    { text: 'log₂ n = 2⁶⁰: DROP ' + exponentText(sixty.drop, 2), family: 'math' as const, size: phone ? 10 : 12 },
  ];

  for (const [index, value] of values.entries()) {
    const y = height * (phone ? .285 + index * .023 : .025 + index * .023);
    drawText(ctx, value.text, center, y, { size: value.size, color: tones.ink, family: value.family });
  }
}

function companion(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones): void {
  if (time < 37500) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const { left, right, referenceY, bottom } = plotLayout(width, height);
  const length = right - left;
  const span = bottom - referenceY;
  const carry = smooth(time, 52250, 54000);
  const footerY = bottom + (phone ? 31 : 43);
  const positions = [
    { x: left + length * .28, y: referenceY + span * .30 },
    { x: left + length * .52, y: referenceY + span * .59 },
    { x: left + length * .77, y: referenceY + span * .76 },
  ];

  for (const [index, point] of positions.entries()) {
    if (index > 0 && time < 41500) continue;

    const grown = index === 0 ? 1 : smooth(time, 41500 + index * 250, 42000 + index * 250);
    const x = mix(point.x, left + index * 4, carry);
    const y = mix(point.y, footerY, carry);
    dot(ctx, x, y, (phone ? 2.4 : 3) * grown, tones.blue);
  }

  if (time < 52250) {
    drawText(ctx, 'COMPANION · SCHEMATIC EXISTENCE', (left + right) / 2, bottom + (phone ? 28 : 35), { size: phone ? 8.5 : 10, color: tones.ink, paper: tones.paper });
  } else if (time < 54000) {
    drawText(ctx, 'COMPANION MARKS MOVING · SCHEMATIC', left + 17, footerY, { size: phone ? 8.5 : 10, color: tones.ink, align: 'left', paper: tones.paper });
  } else {
    drawText(ctx, 'COMPANION: EXISTENCE ONLY', left + 17, footerY, { size: phone ? 8.5 : 10, color: tones.ink, align: 'left', paper: tones.paper });
  }
}

export function drawPlot(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones, model: FourierModel): void {
  if (time < 25000) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const { left, right, top, bottom, referenceY } = plotLayout(width, height);
  const center = (left + right) / 2;
  const length = right - left;
  const plotHeight = bottom - referenceY;
  drawLine(ctx, left, referenceY, right, referenceY, tones.ink, 1.1);

  if (time < 28500) return;

  topRows(ctx, width, height, time, tones, model);
  const zoom = smooth(time, 55250, 57000) * (1 - smooth(time, 62250, 64000));
  const range = Math.exp(Math.log(50e-12) * zoom);
  const settledZoom = zoom > .999999;
  const moving = zoom > .000001 && !settledZoom;
  const xAt = (log2N: number) => left + (Math.log10(log2N) - 1) / 99 * length;
  const small = phone ? 8.5 : 10;
  drawLine(ctx, left, referenceY, left, bottom, tones.ink, .8);
  drawLine(ctx, left, bottom, right, bottom, tones.ink, .8);

  if (time < 54000) {
    drawText(ctx, '1', left - 9, referenceY, { size: phone ? 11 : 13, color: tones.ink, family: 'math' });
    drawText(ctx, 'NORMALIZED REFERENCE · NOT AN OPERATION COUNT', center, time >= 52250 && !phone ? referenceY - 14 : top - (phone ? 4 : 6), { size: small, color: tones.ink, paper: tones.paper });
    drawText(ctx, time < 41500 ? 'LENGTH AXIS · SCHEMATIC' : 'WHICH LENGTHS: NOT SPECIFIED', center, bottom + (phone ? 14 : 19), { size: small, color: tones.ink });
  } else {
    const title = settledZoom ? 'DROP 1−FACTOR · ×10⁻¹² · VERTICAL ×2·10¹⁰' : moving ? 'CAMERA MOVING · LOG FACTOR ONLY' : 'LOG FACTOR ONLY · REFERENCE = 1';
    drawText(ctx, title, center, phone ? top - 4 : referenceY - 14, { size: small, color: tones.ink, family: settledZoom ? 'math' : 'type', paper: tones.paper });

    if (settledZoom) {
      for (const value of [0, 25, 50]) {
        const y = referenceY + value / 50 * plotHeight;
        drawLine(ctx, left - 3, y, left, y, tones.ink, .8);
        drawText(ctx, String(value), left - 7, y, { size: phone ? 10 : 12, color: tones.ink, family: 'math', align: 'right', paper: tones.paper });
      }
    } else if (!moving) {
      drawText(ctx, '1', left - 9, referenceY, { size: phone ? 11 : 13, color: tones.ink, family: 'math' });
      drawText(ctx, '0', left - 9, bottom, { size: phone ? 11 : 13, color: tones.ink, family: 'math' });
    }

    for (const value of [1, 50, 100]) {
      const x = left + (value - 1) / 99 * length;
      drawLine(ctx, x, bottom, x, bottom + 3, tones.ink, .8);
      drawText(ctx, String(value), x, bottom + (phone ? 10 : 13), { size: phone ? 10 : 12, color: tones.ink, family: 'math' });
    }

    drawText(ctx, 'log₁₀(log₂ n)', right, bottom + (phone ? 21 : 28), { size: phone ? 10 : 12, color: tones.ink, family: 'math', align: 'right', paper: tones.paper });
  }

  if (time >= 37500 && time < 52250) {
    const mainX = left + length * .79;
    drawLine(ctx, mainX, referenceY - 5, mainX, referenceY + 5, tones.blue, 2.5);
    drawText(ctx, 'MAIN', mainX, referenceY + 17, { size: phone ? 9 : 11, color: tones.ink, paper: tones.paper });
  }

  if (time >= 54000) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(left - 1, referenceY - 2, length + 2, plotHeight + 4);
    ctx.clip();
    ctx.strokeStyle = tones.blue;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();

    for (let index = 0; index <= 256; index++) {
      const log2N = 10 ** (1 + 99 * index / 256);
      const saving = savingAtLog2(log2N);
      const x = xAt(log2N);
      const y = referenceY + saving.drop / range * plotHeight;

      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
    ctx.restore();
  }

  companion(ctx, width, height, time, tones);
}

export function drawLedger(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones): void {
  if (time < 69000) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const size = phone ? 8.5 : 10.5;
  const line = size * 1.5;
  const left = width * .05;
  const right = width * .95;
  const top = mix(height + 12, height * (phone ? .84 : .78), smooth(time, 69000, 70250));
  const rows = [
    'UNREVIEWED · 18 OCT 2026',
    'TWO LEAN STATEMENTS IN CATALOGUE',
    'UNIFORM STATEMENT: ITS OWN COST MODEL',
    'ROOT SUPPLIED · EXTRACTION/SEARCH OUTSIDE',
    'NO OUTSIDE REPLAY · KERNEL CHECK ≠ READING',
  ];
  drawLine(ctx, left, top, right, top, tones.ink, 1);

  for (const [index, value] of rows.entries()) {
    drawText(ctx, value, (left + right) / 2, top + 11 + index * line, { size: index === 0 ? size + .5 : size, color: tones.ink, family: index === rows.length - 1 ? 'math' : 'type', paper: tones.paper });
  }
}

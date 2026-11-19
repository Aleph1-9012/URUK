import { mix, smooth } from '../../../lib/animation';
import { PHONE_STAGE_WIDTH } from '../../plate/frame';
import { drawLine, drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';

type Tones = { ink: string; muted: string; paper: string; blue: string };

type Records = { nisan: number; saksZhou: number; log: number };

export function memoryLayout(width: number, height: number) {
  const phone = width < PHONE_STAGE_WIDTH;

  return {
    left: width * (phone ? .12 : .53),
    right: width * (phone ? .90 : .94),
    generalY: height * (phone ? .55 : .34),
    mazeY: height * (phone ? .21 : .60),
    barHeight: phone ? 12 : 16,
  };
}

function stippleBar(ctx: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, ink: string): void {
  if (width <= 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, width, height);
  ctx.clip();
  ctx.fillStyle = ink;
  ctx.beginPath();

  for (let row = 0; row <= height / 4; row++) {
    for (let column = 0; column <= width / 5; column++) {
      const x = left + column * 5 + (row % 2 ? 2.5 : 0);
      const y = top + 2 + row * 4;
      ctx.moveTo(x + .6, y);
      ctx.arc(x, y, .6, 0, Math.PI * 2);
    }
  }

  ctx.fill();
  ctx.restore();
}

function outlineBar(ctx: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, ink: string, lineWidth = 1): void {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(left, top, width, height);
  ctx.restore();
}

function hatch(ctx: CanvasRenderingContext2D, left: number, right: number, top: number, bottom: number, ink: string): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, right - left, bottom - top);
  ctx.clip();
  ctx.strokeStyle = ink;
  ctx.lineWidth = .65;
  ctx.beginPath();

  for (let x = left - (bottom - top); x < right; x += 5) {
    ctx.moveTo(x, bottom);
    ctx.lineTo(x + bottom - top, top);
  }

  ctx.stroke();
  ctx.restore();
}

export function drawMemory(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones, records: Records): void {
  if (time < 33500) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const size = phone ? 9.5 : 11.5;
  const small = phone ? 8.5 : 10;
  const { left, right, generalY, mazeY, barHeight } = memoryLayout(width, height);
  const length = right - left;
  const position = (value: number) => left + length * value / records.nisan;
  const current = mix(records.nisan, records.saksZhou, smooth(time, 39000, 40500));
  const top = generalY - barHeight / 2;
  const center = (left + right) / 2;

  outlineBar(ctx, left, top, length, barHeight, tones.muted);
  const carried = smooth(time, 33500, 35500);
  const currentWidth = length * current / records.nisan * carried;
  stippleBar(ctx, left, top, currentWidth, barHeight, tones.ink);

  if (currentWidth > 0) outlineBar(ctx, left, top, currentWidth, barHeight, tones.ink, 1.4);

  if (time < 35500) return;

  drawText(ctx, 'SELECTED SPACE BOUNDS · TIME NOT SHOWN', center, generalY - (phone ? 62 : 88), { size: small, color: tones.ink });
  drawText(ctx, 'n = 2¹⁰ · CONSTANTS IGNORED · SCHEMATIC', center, generalY - (phone ? 50 : 70), { size: small, color: tones.ink, family: 'math' });
  drawText(ctx, 'GENERAL RANDOMIZED COMPUTATION', center, generalY - (phone ? 37 : 53), { size, color: tones.ink });
  drawText(ctx, '1990 · NISAN · log² n', left, generalY - (phone ? 24 : 34), { size, color: tones.ink, family: 'math', align: 'left' });

  if (time >= 39000) {
    drawText(ctx, '1999 · SAKS–ZHOU · log³ᐟ² n', left, generalY - (phone ? 12 : 18), { size, color: tones.ink, family: 'math', align: 'left' });
  }

  const marks = [
    { value: 0, label: '0' },
    { value: records.log, label: '10' },
    { value: records.saksZhou, label: '31.6' },
    { value: records.nisan, label: '100' },
  ];

  for (const mark of marks) {
    const x = position(mark.value);
    drawLine(ctx, x, top + barHeight + 2, x, top + barHeight + 5, tones.ink, .8);
    drawText(ctx, mark.label, x, generalY + barHeight / 2 + 14, { size: phone ? 10 : 11.5, color: tones.ink, family: 'math' });
  }

  drawText(ctx, 'BITS', right, generalY + barHeight / 2 + 28, { size: small, color: tones.ink, align: 'right' });

  if (time >= 43000) {
    const mazeWidth = length * records.log / records.nisan * smooth(time, 43000, 44500);
    const mazeLeft = phone ? width * .55 : left;

    if (phone) drawWrappedText(ctx, '2005 · REINGOLD · THE MAZE ALONE', width * .75, mazeY - 27, width * .44, { size, color: tones.ink });
    else drawText(ctx, '2005 · REINGOLD · THE MAZE ALONE', left, mazeY - 26, { size, color: tones.ink, align: 'left' });

    outlineBar(ctx, mazeLeft, mazeY - barHeight / 2, mazeWidth, barHeight, tones.ink, 1.4);
    stippleBar(ctx, mazeLeft, mazeY - barHeight / 2, mazeWidth, barHeight, tones.ink);
    drawText(ctx, 'log n = 10', mazeLeft + mazeWidth + 9, mazeY, { size: phone ? 12 : 14, color: tones.ink, family: 'math', align: 'left', paper: tones.paper });

    if (phone) drawWrappedText(ctx, 'UNDIRECTED CONNECTIVITY', width * .75, mazeY + 12, width * .44, { size: small, color: tones.ink });
    else drawText(ctx, 'UNDIRECTED CONNECTIVITY', left, mazeY + 28, { size: small, color: tones.ink, align: 'left' });
  }

  if (time < 49750) return;

  const from = position(records.log);
  const to = position(records.saksZhou);
  hatch(ctx, from, to, top + 1, top + barHeight - 1, tones.ink);
  const bracketY = generalY + (phone ? 32 : 43);
  const claimed = time >= 55750;
  const progress = claimed ? smooth(time, 55750, 57000) : smooth(time, 49750, 51000);
  const bracketLeft = mix(to, from, progress);
  const color = claimed ? tones.blue : tones.ink;
  const stroke = claimed ? 2.7 : 1.2;
  drawLine(ctx, bracketLeft, bracketY, to, bracketY, color, stroke);
  drawLine(ctx, bracketLeft, bracketY - 5, bracketLeft, bracketY + 5, color, stroke);
  drawLine(ctx, to, bracketY - 5, to, bracketY + 5, color, stroke);

  if (claimed) {
    drawText(ctx, 'CLAIMED: L = RL = BPL', center, bracketY + (phone ? 15 : 23), { size: phone ? 11 : 13, color: tones.ink, family: 'math', paper: tones.paper });
  } else {
    drawText(ctx, 'GENERAL GAP: 31.6 TO 10', center, bracketY + (phone ? 15 : 23), { size, color: tones.ink, paper: tones.paper });
  }
}

export function drawLedger(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones): void {
  if (time < 60500) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const size = phone ? 9.2 : 11.2;
  const line = size * (phone ? 1.3 : 1.55);
  const left = width * .06;
  const right = width * .94;
  const top = mix(height + 12, height * (phone ? .735 : .76), smooth(time, 60500, 61750));
  const center = (left + right) / 2;
  const rows = [
    'UNREVIEWED · 20 OCT 2026',
    'LEAN STATEMENT ONLY',
    'CLASS EQUALITY · EXPLICIT MACHINE MODEL',
    'APPROXIMATION + COMPILER OUTSIDE',
    'NO OUTSIDE REPLAY',
    'KERNEL CHECK ≠ APPROVAL',
  ];
  drawLine(ctx, left, top, right, top, tones.ink, 1);

  for (const [index, value] of rows.entries()) {
    drawText(ctx, value, center, top + 12 + index * line, { size: index === 0 ? size + .5 : size, color: tones.ink, family: index === rows.length - 1 ? 'math' : 'type', paper: tones.paper });
  }
}

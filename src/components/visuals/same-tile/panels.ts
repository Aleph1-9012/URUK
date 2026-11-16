import { smooth } from '../../../lib/animation';
import type { FilmLabels } from '../../plate/labels';
import { PHONE_STAGE_WIDTH } from '../../plate/frame';
import { drawLine, drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';

type Point = { x: number; y: number };

type Tones = { ink: string; muted: string; paper: string; blue: string };

function diagramLayout(width: number, height: number) {
  const phone = width < PHONE_STAGE_WIDTH;
  const pitch = Math.min(width * (phone ? .105 : .055), height * .078);

  return {
    phone,
    center: { x: width * (phone ? .5 : .30), y: height * (phone ? .29 : .36) },
    pitch,
    depth: { x: -pitch * .60, y: -pitch * .45 },
  };
}

export function dimensionPoint(width: number, height: number, time: number, column: number, row: number): Point {
  const { center, pitch } = diagramLayout(width, height);
  const spread = smooth(time, 56250, 58500);

  return { x: center.x + (column - 3) * pitch, y: center.y + (row - 2) * pitch * .75 * spread };
}

function dot(ctx: CanvasRenderingContext2D, point: Point, radius: number, color: string): void {
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function rotated(point: Point, angle: number): Point {
  return { x: point.x * Math.cos(angle) - point.y * Math.sin(angle), y: point.x * Math.sin(angle) + point.y * Math.cos(angle) };
}

function periodMark(ctx: CanvasRenderingContext2D, center: Point, angle: number, broken: number, color: string, unit: number): void {
  const gap = unit * .38 * broken;
  const piece = (a: Point, b: Point, pivot: number, turn: number) => {
    const start = rotated({ x: a.x - pivot, y: a.y }, turn);
    const end = rotated({ x: b.x - pivot, y: b.y }, turn);
    const p = rotated({ x: start.x + pivot, y: start.y }, angle);
    const q = rotated({ x: end.x + pivot, y: end.y }, angle);
    drawLine(ctx, center.x + p.x, center.y + p.y, center.x + q.x, center.y + q.y, color, 1.7);
  };
  piece({ x: -unit, y: 0 }, { x: -gap, y: 0 }, -unit / 2, -.36 * broken);
  piece({ x: gap, y: 0 }, { x: unit, y: 0 }, unit / 2, .36 * broken);
  piece({ x: unit, y: 0 }, { x: unit - 5, y: -4 }, unit / 2, .36 * broken);
  piece({ x: unit, y: 0 }, { x: unit - 5, y: 4 }, unit / 2, .36 * broken);
}

function ladder(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones): void {
  const phone = width < PHONE_STAGE_WIDTH;
  const rungs = [
    { space: 'ℤ¹', author: 'NEWMAN', year: '1977' },
    { space: 'ℤ²', author: 'BHATTACHARYA', year: '2020' },
    { space: 'ℤ³', author: time >= 67750 ? 'CLAIMED' : 'OPEN CASE', year: '' },
  ];

  if (phone) {
    const y = height * .52;
    drawLine(ctx, width * .18, y, width * .82, y, tones.ink, .9);

    for (const [index, rung] of rungs.entries()) {
      const x = width * (.2 + index * .3);
      drawLine(ctx, x, y - 5, x, y + 5, tones.ink, 1.1);
      drawText(ctx, rung.space, x, height * .488, { size: 12, color: tones.ink, family: 'math' });
      drawText(ctx, rung.author, x, height * .553, { size: 8.5, color: tones.ink });
      drawText(ctx, rung.year, x, height * .575, { size: 10, color: tones.ink, family: 'math' });
    }

    drawText(ctx, 'ℝ² · ARBITRARY MEASURABLE TILES STILL OPEN', width * .5, height * .609, { size: 8.5, color: tones.ink, family: 'math' });

    return;
  }

  const x = width * .675;
  drawLine(ctx, x, height * .15, x, height * .46, tones.ink, .9);

  for (const [index, rung] of rungs.entries()) {
    const y = height * (.18 + index * .12);
    drawLine(ctx, x - 5, y, x + 5, y, tones.ink, 1.1);
    drawText(ctx, rung.space, width * .72, y, { size: 17, color: tones.ink, family: 'math' });
    drawText(ctx, rung.year ? rung.author + ' · ' + rung.year : rung.author, width * .84, y, { size: 11, color: tones.ink });
  }

  drawWrappedText(ctx, 'GENERAL MEASURABLE ℝ²\nSTILL OPEN', width * .82, height * .48, width * .30, { size: 11, color: tones.ink, family: 'math' });
}

function claim(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones, labels: FilmLabels): void {
  if (time < 67750) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const small = phone ? 8.5 : 11;

  if (phone) {
    labels.place('tiling', width * .5, height * .64);
    drawText(ctx, 'CLAIMED: NO FULLY PERIODIC TILING', width * .5, height * .68, { size: 9, color: tones.ink });
    labels.place('thickening', width * .5, height * .72);
    drawText(ctx, 'ℝ³ · ARBITRARY REAL TRANSLATIONS', width * .5, height * .755, { size: 9, color: tones.ink, family: 'math' });
    drawText(ctx, 'NO FULLY PERIODIC TILING HERE EITHER', width * .5, height * .785, { size: 8.5, color: tones.ink });
  } else {
    drawText(ctx, 'CLAIMED', width * .09, height * .70, { size: 12, color: tones.ink, align: 'left' });
    labels.place('tiling', width * .35, height * .70);
    drawText(ctx, 'NO FULLY PERIODIC TILING', width * .71, height * .70, { size: 12, color: tones.ink });
    labels.place('thickening', width * .26, height * .77);
    drawText(ctx, 'ℝ³ · ARBITRARY REAL TRANSLATIONS', width * .69, height * .77, { size: 12, color: tones.ink, family: 'math' });
    drawText(ctx, 'NO FULLY PERIODIC TILING HERE EITHER', width * .5, height * .82, { size: 11, color: tones.ink });
  }

  const arrowX = width * (phone ? .19 : .26);
  const arrowY = height * (phone ? .825 : .859);
  drawLine(ctx, arrowX - 16, arrowY, arrowX + 16, arrowY, tones.ink, 1.2, [3, 3]);
  drawLine(ctx, arrowX + 16, arrowY, arrowX + 11, arrowY - 4, tones.ink, 1.2);
  drawLine(ctx, arrowX + 16, arrowY, arrowX + 11, arrowY + 4, tones.ink, 1.2);
  drawText(ctx, 'ONE PERIOD NOT EXCLUDED', width * .31, height * (phone ? .817 : .848), { size: small, color: tones.ink, align: 'left' });
  drawText(ctx, 'NOT ASSERTED TO EXIST', width * .31, height * (phone ? .844 : .875), { size: small, color: tones.ink, align: 'left' });
}

function ledger(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones): void {
  if (time < 79000) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const offset = (1 - smooth(time, 79000, 80250)) * height * .15;
  const rows = [
    'UNREVIEWED · 18 OCT 2026',
    'LEAN STATEMENT CATALOGUED',
    'ADDS LEAST-DIMENSION CLAUSE',
    'NO OUTSIDE REPLAY · KERNEL CHECK ≠ READING',
  ];
  drawLine(ctx, width * .05, height * (phone ? .88 : .90) + offset, width * .95, height * (phone ? .88 : .90) + offset, tones.ink, 1);

  for (const [index, value] of rows.entries()) {
    drawText(ctx, value, width * .5, height * (phone ? .90 + index * .025 : .918 + index * .022) + offset, { size: phone ? 8.5 : 10.5, color: tones.ink, family: index === 3 ? 'math' : 'type' });
  }
}

export function drawDimensionSequence(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones, labels: FilmLabels): void {
  if (time < 53500) return;

  const { phone, center, depth } = diagramLayout(width, height);
  const small = phone ? 8.5 : 11;
  const space = time >= 60750;
  const claimed = time >= 67750;
  const depthAmount = smooth(time, 60750, 62500);

  if (time >= 55500) {
    const spread = smooth(time, 56250, 58500);
    const rowIndices = spread === 0 ? [2] : [0, 1, 2, 3, 4];
    const layers = space ? 3 : 1;

    for (let layer = 0; layer < layers; layer++) {
      for (const row of rowIndices) {
        for (let column = 0; column < 7; column++) {
          const point = dimensionPoint(width, height, time, column, row);
          dot(ctx, { x: point.x + layer * depth.x * depthAmount, y: point.y + layer * depth.y * depthAmount }, phone ? 2.5 : 3, claimed ? tones.blue : tones.ink);
        }
      }
    }
  }

  if (space) {
    const titleX = phone ? width * .5 : width * .30;
    drawText(ctx, "PAPER'S TILE AND TRANSLATION SET NOT DRAWN", titleX, height * (phone ? .035 : .055), { size: small, color: tones.ink });
    drawText(ctx, 'SCHEMATIC LAYOUT · NOT THE DOMINO SET OR PAPER A', titleX, height * (phone ? .067 : .095), { size: phone ? 8.5 : 10, color: tones.ink });
    const box = { x: width * (phone ? .80 : .47), y: height * (phone ? .105 : .13), width: phone ? 28 : 38, height: phone ? 19 : 25 };
    ctx.save();
    ctx.strokeStyle = tones.ink;
    ctx.lineWidth = 1;
    ctx.setLineDash([1, 3]);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.restore();
    drawText(ctx, 'EMPTY PLACEHOLDER', width * (phone ? .41 : .28), box.y + box.height / 2, { size: small, color: tones.ink });
    const origin = dimensionPoint(width, height, time, 3, 4);
    drawLine(ctx, origin.x, origin.y, origin.x + depth.x * 2 * depthAmount, origin.y + depth.y * 2 * depthAmount, tones.ink, .8, [3, 3]);
    const y = height * (phone ? .433 : .59);
    const marks = [
      { fraction: phone ? .23 : .17, angle: 0 },
      { fraction: phone ? .50 : .30, angle: -Math.PI / 2 },
      { fraction: phone ? .77 : .43, angle: -Math.PI / 4 },
    ];

    for (const [index, mark] of marks.entries()) {
      const broken = claimed ? smooth(time, 67750 + index * 1250, 69000 + index * 1250) : 0;
      periodMark(ctx, { x: width * mark.fraction, y }, mark.angle, broken, claimed ? tones.blue : tones.ink, phone ? 14 : 19);
    }

    drawText(ctx, 'STATEMENT MARKS · NOT INVARIANCE TESTS', center.x, height * (phone ? .468 : .64), { size: small, color: tones.ink });
  } else {
    drawText(ctx, 'KNOWN INTEGER-LATTICE DIMENSIONS', phone ? width * .5 : center.x, height * (phone ? .045 : .06), { size: phone ? 10 : 14, color: tones.ink });
    drawText(ctx, 'DIMENSION ILLUSTRATION · NOT A NEW TILING TEST', phone ? width * .5 : center.x, height * (phone ? .08 : .105), { size: small, color: tones.ink });
  }

  ladder(ctx, width, height, time, tones);
  claim(ctx, width, height, time, tones, labels);
  ledger(ctx, width, height, time, tones);
}

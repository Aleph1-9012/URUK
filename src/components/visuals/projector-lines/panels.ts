import { mix, smooth } from '../../../lib/animation';
import type { FilmLabels } from '../../plate/labels';
import { PHONE_STAGE_WIDTH } from '../../plate/frame';
import { drawLine, drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';
import { lineDistance, orthogonalSimplex, type Point } from './math';

type Tones = { ink: string; muted: string; paper: string; blue: string };

const SIMPLEX = orthogonalSimplex();

function dot(ctx: CanvasRenderingContext2D, point: Point, radius: number, ink: string): void {
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = ink;
  ctx.fill();
}

function ruler(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones, labels: FilmLabels): void {
  if (time < 28250 || time >= 53250) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const enter = smooth(time, 28250, 30250);
  const left = width * (phone ? .12 : .60);
  const right = width * (phone ? .88 : .94);
  const y = height * (phone ? .80 : .66);

  if (time >= 52250) {
    drawLine(ctx, left, y, mix(right, left, smooth(time, 52250, 53250)), y, tones.ink, 1);

    return;
  }

  const currentRight = mix(left, right, enter);
  drawLine(ctx, left, y, currentRight, y, tones.ink, 1);

  for (let dimension = 1; dimension <= 9; dimension++) {
    const x = mix(left, right, (dimension - 1) / 8);

    if (x > currentRight + .01) continue;

    drawLine(ctx, x, y - 5, x, y + 5, tones.ink, 1);

    if (!phone || dimension === 1 || dimension === 3 || dimension === 9) {
      drawText(ctx, String(dimension), x, y + 17, { size: phone ? 12 : 14, color: tones.ink, family: 'math' });
    }

    if (dimension <= 3) {
      drawText(ctx, 'YES', x, y - 15, { size: phone ? 8.5 : 10, color: tones.ink });
    }

    if (dimension === 9 && time >= 42500) {
      ctx.beginPath();
      ctx.arc(x, y, 7 + 2 * Math.sin((time - 42500) / 350), 0, 2 * Math.PI);
      ctx.strokeStyle = tones.ink;
      ctx.lineWidth = 1.3;
      ctx.stroke();
      drawText(ctx, 'CLAIM', x, y - 17, { size: phone ? 8.5 : 10, color: tones.ink });
    }
  }

  if (time < 35250) {
    drawText(ctx, 'KNOWN YES: DIMENSIONS 1, 2, 3', (left + right) / 2, y - 42, { size: phone ? 9 : 12, color: tones.ink });
  } else if (time < 42500) {
    const center = width * (phone ? .5 : .77);
    drawText(ctx, 'KAHN–KALAI 1993 · OFF SCALE', center, height * (phone ? .60 : .15), { size: phone ? 9 : 12, color: tones.ink });
    labels.place('kahn-1325', width * (phone ? .28 : .66), height * (phone ? .65 : .25));
    labels.place('kahn-2014', width * (phone ? .72 : .87), height * (phone ? .65 : .25));
    drawText(ctx, 'ONE COUNTEREXAMPLE', width * (phone ? .28 : .66), height * (phone ? .70 : .31), { size: phone ? 8.5 : 10.5, color: tones.ink });
    drawText(ctx, 'EVERY DIMENSION ABOVE', width * (phone ? .72 : .87), height * (phone ? .70 : .31), { size: phone ? 8.5 : 10.5, color: tones.ink });
    drawLine(ctx, right + 3, y, right + 14, y, tones.ink, 1.1);
    drawLine(ctx, right + 14, y, right + 9, y - 4, tones.ink, 1.1);
    drawLine(ctx, right + 14, y, right + 9, y + 4, tones.ink, 1.1);
  } else {
    labels.place('ambient-dimension', width * (phone ? .5 : .77), height * (phone ? .66 : .50));
    drawText(ctx, 'AFFINE AMBIENT DIMENSION', width * (phone ? .5 : .77), height * (phone ? .705 : .55), { size: phone ? 8.5 : 11, color: tones.ink });
    drawText(ctx, 'FULL SET: INTRINSIC DIMENSION 3', width * (phone ? .5 : .77), height * (phone ? .745 : .59), { size: phone ? 8.5 : 10.5, color: tones.ink });
  }
}

function distanceBar(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones, labels: FilmLabels): void {
  if (time < 53250 || time >= 65500) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const center = width * (phone ? .5 : .76);
  const left = width * (phone ? .18 : .59);
  const right = width * (phone ? .86 : .94);
  const y = height * (phone ? .76 : .44);
  const theta = Math.PI / 2 * smooth(time, 53250, 62500);
  const distance = lineDistance(theta);
  const retire = 1 - smooth(time, 64750, 65500);
  const length = (right - left) * retire;
  drawLine(ctx, left, y, left + length, y, tones.ink, 1);
  drawLine(ctx, left, y - 5, left, y + 5, tones.ink, 1);
  drawLine(ctx, left + length, y - 5, left + length, y + 5, tones.ink, 1);
  drawLine(ctx, left, y, left + length * distance / Math.SQRT2, y, tones.ink, 4);

  if (time >= 64750) return;

  labels.place('distance', center, height * (phone ? .69 : .30));
  drawText(ctx, '0', left, y + 19, { size: phone ? 11 : 13, color: tones.ink, family: 'math' });
  labels.place('sqrt-two', right, y + 19);
  drawText(ctx, 'θ = ' + (theta * 180 / Math.PI).toFixed(0) + '° · DISTANCE = ' + distance.toFixed(4), center, height * (phone ? .85 : .55), { size: phone ? 11 : 14, color: tones.ink, family: 'math' });
  drawText(ctx, 'BAR USES THE TRUE FROBENIUS METRIC', center, height * (phone ? .91 : .62), { size: phone ? 8.5 : 11, color: tones.ink });

  if (theta === Math.PI / 2) {
    drawText(ctx, 'FULL DIAMETER · PERPENDICULAR LINES', center, height * (phone ? .95 : .69), { size: phone ? 8.5 : 11, color: tones.ink });
  }
}

function simplex(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones): void {
  if (time < 64750) return;

  const firstEdge = SIMPLEX.edges[0];

  if (!firstEdge) throw new Error('The four-axis simplex must have its computed pair distances.');

  const phone = width < PHONE_STAGE_WIDTH;
  const arrive = smooth(time, 64750, 66250);
  const closing = smooth(time, 72250, 74250);
  const source = { x: width * (phone ? .5 : .28), y: height * (phone ? .25 : .43) };
  const initial = { x: width * (phone ? .5 : .73), y: height * (phone ? .57 : .40) };
  const final = { x: width * (phone ? .74 : .30), y: height * (phone ? .17 : .70) };
  const center = { x: mix(source.x, mix(initial.x, final.x, closing), arrive), y: mix(source.y, mix(initial.y, final.y, closing), arrive) };
  const unit = height * mix(phone ? .12 : .21, phone ? .055 : .10, closing) * arrive;
  const points = SIMPLEX.vertices.map(vertex => ({ x: center.x + (vertex.x + .45 * vertex.z) * unit, y: center.y - (vertex.y + .25 * vertex.z) * unit }));

  for (const edge of SIMPLEX.edges) {
    const a = points[edge.a];
    const b = points[edge.b];

    if (!a || !b) throw new Error('Each projected simplex edge needs both orthogonal-axis vertices.');

    drawLine(ctx, a.x, a.y, b.x, b.y, tones.ink, 1);
  }

  for (const [index, point] of points.entries()) {
    dot(ctx, point, (phone ? 2.6 : 3.2) * arrive, tones.ink);

    if (time >= 66250 && time < 72250) {
      const left = point.x < center.x;
      const names = ['e₁', 'e₂', 'e₃', 'e₄'];
      const name = names[index];

      if (!name) throw new Error('Each orthogonal coordinate axis needs its label.');

      drawText(ctx, name, point.x + (left ? -7 : 7), point.y + 3, { size: phone ? 11 : 13, color: tones.ink, family: 'math', align: left ? 'right' : 'left' });
    }
  }

  if (time < 66250) {
    drawText(ctx, 'MOVE TO FOUR DIMENSIONS', width * (phone ? .5 : .74), height * (phone ? .70 : .16), { size: phone ? 9 : 12, color: tones.ink });
    drawText(ctx, 'NEW AXES · NOT A PLANAR ISOMETRY', width * (phone ? .5 : .74), height * (phone ? .75 : .21), { size: phone ? 8.5 : 11, color: tones.ink });
  } else if (time < 72250) {
    drawText(ctx, 'R⁴ AXES · PROJECTION SCHEMATIC', width * (phone ? .5 : .74), height * (phone ? .70 : .17), { size: phone ? 9 : 12, color: tones.ink, family: 'math' });
    drawText(ctx, String(SIMPLEX.edges.length) + ' TRUE DISTANCES: ' + firstEdge.distance.toFixed(4), width * (phone ? .5 : .74), height * (phone ? .75 : .60), { size: phone ? 11 : 14, color: tones.ink, family: 'math' });
    drawText(ctx, '4 PIECES FORCED · NOT THE TEN-SET CLAIM', width * (phone ? .5 : .74), height * (phone ? .80 : .66), { size: phone ? 8.5 : 11, color: tones.ink });
    drawText(ctx, 'SCREEN EDGE LENGTHS ARE NOT THE METRIC', width * (phone ? .5 : .74), height * (phone ? .85 : .72), { size: phone ? 8.5 : 10.5, color: tones.ink });
  } else if (closing === 1) {
    drawWrappedText(ctx, 'FOUR R⁴ AXES\nFOUR PIECES', final.x, height * (phone ? .265 : .81), width * (phone ? .42 : .36), { size: phone ? 8.5 : 10.5, color: tones.ink, family: 'math' });
  }
}

function claimTiles(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones, labels: FilmLabels): void {
  if (time < 72250) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const center = { x: width * (phone ? .5 : .73), y: height * (phone ? .43 : .44) };
  const side = phone ? 18 : 26;
  const horizontal = phone ? 8 : 13;
  const vertical = phone ? 8 : 12;

  for (let index = 0; index < 10; index++) {
    const column = index % 5;
    const row = Math.floor(index / 5);
    const amount = smooth(time, 72250 + index * 100, 73100 + index * 100);
    const x = center.x + (column - 2) * (side + horizontal);
    const y = center.y + (row - .5) * (side + vertical);
    const length = 4 * side * amount;
    const corners = [
      { x: x - side / 2, y: y - side / 2 },
      { x: x + side / 2, y: y - side / 2 },
      { x: x + side / 2, y: y + side / 2 },
      { x: x - side / 2, y: y + side / 2 },
    ];

    for (let edge = 0; edge < 4; edge++) {
      const a = corners[edge];
      const b = corners[(edge + 1) % 4];

      if (!a || !b) throw new Error('Each empty claim tile needs its four border corners.');

      const fraction = Math.max(0, Math.min(1, (length - edge * side) / side));

      if (fraction <= 0) continue;

      drawLine(ctx, a.x, a.y, mix(a.x, b.x, fraction), mix(a.y, b.y, fraction), tones.blue, 1.8);
    }
  }

  drawText(ctx, 'SCHEMATIC EMPTY LABELS · NOT A COVER', center.x, height * (phone ? .50 : .56), { size: phone ? 8.5 : 11, color: tones.ink });
  labels.place('threshold', center.x, height * (phone ? .535 : .615));
  drawWrappedText(ctx, 'CLAIMED: NO COVER BY TEN SETS\nOF STRICTLY SMALLER DIAMETER', center.x, height * (phone ? .57 : .66), width * (phone ? .90 : .42), { size: phone ? 9.5 : 12, color: tones.ink });
  labels.place('ambient-dimension', center.x, height * (phone ? .635 : .745));
  drawText(ctx, 'AFFINE AMBIENT DIMENSION', center.x, height * (phone ? .674 : .79), { size: phone ? 8.5 : 10.5, color: tones.ink });
  drawText(ctx, 'FULL SET: INTRINSIC DIMENSION 3', center.x, height * (phone ? .708 : .83), { size: phone ? 8.5 : 10.5, color: tones.ink });

  if (time >= 74250) {
    drawWrappedText(ctx, 'CIRCLE ALONE:\n3 PIECES SUFFICE', width * (phone ? .22 : .23), height * (phone ? .265 : .50), width * (phone ? .40 : .38), { size: phone ? 8.5 : 10.5, color: tones.ink });
  }
}

function ledger(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones): void {
  if (time < 81250) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const enter = smooth(time, 81250, 82500);
  const center = width * (phone ? .5 : .73);
  const left = width * (phone ? .05 : .53);
  const right = width * .95;
  const top = height * (phone ? .745 : .87);
  const step = height * (phone ? .04 : .028);
  const rows = [
    'UNREVIEWED · 18 OCT 2026',
    'LEAN STATEMENT · 34 LINES · IN CATALOGUE',
    'NO OUTSIDE REPLAY FOUND',
    'KERNEL CHECK ≠ READING OR APPROVAL',
  ];
  drawLine(ctx, left, top, mix(left, right, enter), top, tones.ink, 1);

  for (const [index, value] of rows.entries()) {
    if (time < 81250 + index * 300) continue;

    const y = top + 11 + index * step;
    drawText(ctx, value, center, y, { size: phone ? 8.5 : 10.5, color: tones.ink, family: index === 3 ? 'math' : 'type' });

    if (index === 2 && time >= 88000) {
      const amount = smooth(time, 88000, 89000);
      drawLine(ctx, mix(left, right, .25), y + 7, mix(mix(left, right, .25), mix(left, right, .75), amount), y + 7, tones.ink, .8);
    }
  }
}

export function drawProjectorPanels(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones, labels: FilmLabels): void {
  ruler(ctx, width, height, time, tones, labels);
  distanceBar(ctx, width, height, time, tones, labels);
  simplex(ctx, width, height, time, tones);
  claimTiles(ctx, width, height, time, tones, labels);
  ledger(ctx, width, height, time, tones);
}

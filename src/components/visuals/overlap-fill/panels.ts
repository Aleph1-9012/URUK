import { mix, progress, smooth } from '../../../lib/animation';
import type { FilmLabels } from '../../plate/labels';
import { PHONE_STAGE_WIDTH } from '../../plate/frame';
import { drawLine, drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';
import { GOLDEN_LAMBDA, ingredients, type OverlapModel } from './math';

type Tones = { ink: string; muted: string; paper: string; blue: string };

type Point = { x: number; y: number };

export function ingredientLayout(width: number, height: number, time: number) {
  const phone = width < PHONE_STAGE_WIDTH;
  const claim = smooth(time, 66650, 68350);

  return {
    left: width * (phone ? .09 : .07),
    right: width * (phone ? .91 : .62),
    top: height * (phone ? mix(139, 198, claim) / 310 : .48),
    bottom: height * (phone ? mix(183, 216, claim) / 310 : .65),
    ratioTop: height * (phone ? mix(217, 238, claim) / 310 : .69),
    ratioBottom: height * (phone ? mix(254, 253, claim) / 310 : .76),
  };
}

function dot(ctx: CanvasRenderingContext2D, point: Point, radius: number, ink: string, filled = true, paper = ''): void {
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.lineWidth = .9;
  ctx.strokeStyle = ink;
  ctx.fillStyle = filled ? ink : paper;
  ctx.fill();
  ctx.stroke();
}

export function drawIngredients(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones, lambda: number, labels: FilmLabels): void {
  if (time < 29000) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const small = phone ? 8.5 : 10.5;
  const { left, right, top, bottom, ratioTop, ratioBottom } = ingredientLayout(width, height, time);
  const claim = smooth(time, 66650, 68350);
  const headerOffset = phone ? 8 * (1 - progress(width, 248, 318)) * (1 - claim) : 0;
  const ratioRight = phone ? width * .49 : right;
  const ratioXAt = (value: number) => left + (value - .4) / .5 * (ratioRight - left);
  const length = right - left;
  const xAt = (value: number) => left + (value - .4) / .5 * length;
  const yAt = (value: number) => bottom - value * (bottom - top);
  const ratioAt = (value: number) => ratioBottom - value * (ratioBottom - ratioTop);
  const reveal = smooth(time, 29000, 32000);
  const maximum = .4 + .5 * reveal;
  drawLine(ctx, left, bottom, mix(left, right, reveal), bottom, tones.ink, .9);
  drawLine(ctx, left, bottom, left, mix(bottom, top, reveal), tones.ink, .9);
  drawLine(ctx, left, ratioBottom, mix(left, ratioRight, reveal), ratioBottom, tones.ink, .9);
  drawLine(ctx, left, ratioBottom, left, mix(ratioBottom, ratioTop, reveal), tones.ink, .9);
  drawLine(ctx, left, yAt(Math.LN2), mix(left, right, reveal), yAt(Math.LN2), tones.ink, .9, [3, 3]);
  drawLine(ctx, left, ratioTop, mix(left, ratioRight, reveal), ratioTop, tones.muted, .7);
  ctx.save();
  ctx.strokeStyle = tones.ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  for (let index = 0; index <= 160; index++) {
    const value = .4 + .5 * index / 160;

    if (value > maximum) break;

    const y = yAt(ingredients(value).chi);

    if (index === 0) ctx.moveTo(xAt(value), y);
    else ctx.lineTo(xAt(value), y);
  }

  ctx.stroke();
  ctx.setLineDash([2.5, 2.5]);
  ctx.beginPath();
  let beginning = true;

  for (let index = 0; index <= 160; index++) {
    const value = .4 + .5 * index / 160;

    if (value > maximum) break;

    if (Math.abs(value - GOLDEN_LAMBDA) < .009) {
      beginning = true;
      continue;
    }

    const y = ratioAt(ingredients(value).conditionalDimension);

    if (beginning) ctx.moveTo(ratioXAt(value), y);
    else ctx.lineTo(ratioXAt(value), y);

    beginning = false;
  }

  ctx.stroke();
  ctx.restore();

  if (time < 32000) return;

  drawText(ctx, 'ENTROPY / CONTRACTION · NATS PER STEP', (left + right) / 2, top - (phone ? mix(30, 24, claim) : 6) + headerOffset, { size: small, color: tones.ink });
  const entropyCaptionY = phone && claim < 1 ? mix(top - 10, yAt(Math.LN2) - 12.5, claim) : yAt(Math.LN2) - (phone ? 12.5 : 8);
  drawText(ctx, 'H(p) = ln 2', left + .35 * length, entropyCaptionY + headerOffset * .75, { size: phone ? 11 : 13, color: tones.ink, family: 'math', paper: tones.paper });
  labels.place('chi', right - (phone ? mix(48, 28, claim) : 66), top + (phone ? -mix(10, 8, claim) : 10) + headerOffset * .75);
  drawText(ctx, 'IF NO EXACT OVERLAPS · NOT MEASURED', (left + right) / 2, (bottom + ratioTop) / 2, { size: small, color: tones.ink });
  labels.place('conditional', phone ? width * .75 : (left + right) / 2, phone ? height * mix(236, 246, claim) / 310 : ratioBottom - .32 * (ratioBottom - ratioTop));
  drawText(ctx, '1', left - 8, ratioTop, { size: phone ? 11 : 13, color: tones.ink, family: 'math' });

  for (const value of [.4, .5, .9]) {
    const x = ratioXAt(value);
    drawLine(ctx, x, ratioBottom, x, ratioBottom + 3, tones.ink, .8);
    drawText(ctx, value.toFixed(1), x, ratioBottom + (phone ? 10 : 14), { size: phone ? 10 : 12, color: tones.ink, family: 'math' });
  }

  drawText(ctx, 'λ', phone ? left + .55 * (ratioRight - left) : right + 12, ratioBottom + (phone ? 12 : -10), { size: phone ? 10 : 13, color: tones.ink, family: 'math', align: phone ? 'center' : 'left' });
  const current = ingredients(lambda);
  dot(ctx, { x: xAt(lambda), y: yAt(current.chi) }, phone ? 2.3 : 3, tones.ink);

  if (time >= 46500) {
    const x = ratioXAt(GOLDEN_LAMBDA);
    drawLine(ctx, x, ratioTop - 2, x, ratioBottom + 4, tones.ink, 1);
    dot(ctx, { x, y: ratioTop }, phone ? 3 : 4, tones.ink, false, tones.paper);
  }
}

function mapLayout(width: number, height: number) {
  const phone = width < PHONE_STAGE_WIDTH;

  return {
    phone,
    countX: width * (phone ? .76 : .83),
    titleY: height * (phone ? 23 / 310 : .23),
    nY: height * (phone ? 37 / 310 : .29),
    wordsY: height * (phone ? 37 / 310 : .355),
    mapsY: height * (phone ? 52 / 310 : .42),
    traceLeft: width * (phone ? .61 : .71),
    traceRight: width * (phone ? .94 : .95),
    traceTop: height * (phone ? 88 / 310 : .62),
    traceBottom: height * (phone ? 103 / 310 : .73),
  };
}

export function drawMaps(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones, model: OverlapModel): void {
  if (time < 46500) return;

  const layout = mapLayout(width, height);
  const { phone, countX, titleY, nY, wordsY, mapsY, traceLeft, traceRight, traceTop, traceBottom } = layout;
  const rows = model.golden.rows;
  const index = Math.min(rows.length - 1, Math.floor(progress(time, 47000, 61500) * rows.length));
  const row = rows[index];

  if (!row) throw new Error('Every displayed golden count needs its exact finite map row.');

  drawText(ctx, 'EXACT: F(n+3)−1 MAPS', countX, titleY, { size: phone ? 8.5 : 11, color: tones.ink, family: 'math' });
  drawText(ctx, 'n = ' + row.n, phone ? width * .585 : countX, nY, { size: phone ? 11 : 18, color: tones.ink, family: 'math' });
  drawText(ctx, row.words.toLocaleString('en-US') + ' WORDS', phone ? width * .825 : countX, wordsY, { size: phone ? 9.5 : 18, color: tones.ink, family: 'math' });
  drawText(ctx, row.maps.toLocaleString('en-US') + ' MAPS', countX, mapsY, { size: phone ? 12 : 23, color: tones.ink, family: 'math' });

  if (!phone) {
    drawText(ctx, 'EXACT OVERLAPS · WORDS MERGE', countX, height * .458, { size: 11, color: tones.ink });
    drawText(ctx, 'HOCHMAN 2014 · WEAK SEPARATION', countX, height * .485, { size: 9.5, color: tones.ink });
    drawWrappedText(ctx, 'ALGEBRAIC λ: BREUILLARD, VARJÚ, RAPAPORT, FENG…', countX, height * .505, width * .26, { size: 9, color: tones.ink, family: 'math' });
  }

  const entropy = time >= 63750;
  const carrying = entropy && time < 65250;
  const title = carrying ? 'ICON TO TRACE\nLAYOUT CARRY' : entropy ? phone ? 'FINITE H/n\nNO LIMIT VALUE' : 'FINITE H/n\nLIMIT NOT COMPUTED' : 'MERGE ICON\nSCHEMATIC';
  const traceTitleTop = phone ? height * 59 / 310 : height * .555;
  drawWrappedText(ctx, title, (traceLeft + traceRight) / 2, traceTitleTop, traceRight - traceLeft, { size: phone ? 8.5 : 10.5, color: tones.ink, family: entropy ? 'math' : 'type' });
  const span = traceRight - traceLeft;
  const high = traceBottom - traceTop;
  const icon: Point[] = [
    { x: traceLeft, y: traceTop + high * .5 },
    { x: traceLeft + span * .32, y: traceTop },
    { x: traceLeft + span * .32, y: traceBottom },
    { x: traceLeft + span * .67, y: traceTop + high * .16 },
    { x: traceLeft + span * .67, y: traceTop + high * .40 },
    { x: traceLeft + span * .67, y: traceTop + high * .63 },
    { x: traceLeft + span * .67, y: traceTop + high * .84 },
    { x: traceRight, y: traceTop + high * .5 },
  ];
  const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [6, 7]] as const;
  const transition = smooth(time, 63750, 65250);
  const tracePoint = (position: number): Point => {
    const value = rows[position];

    if (!value) throw new Error('Every finite entropy point needs its weighted exact-map law.');

    return { x: traceLeft + position / (rows.length - 1) * span, y: traceTop + (Math.LN2 - value.entropyPerStep) / (Math.LN2 - .45) * high };
  };

  for (const [position, [from, to]] of edges.entries()) {
    const a = icon[from];
    const b = icon[to];

    if (!a || !b) throw new Error('The schematic merge icon needs every edge endpoint.');

    const targetA = tracePoint(position);
    const targetB = tracePoint(position + 1);
    drawLine(ctx, mix(a.x, targetA.x, transition), mix(a.y, targetA.y, transition), mix(b.x, targetB.x, transition), mix(b.y, targetB.y, transition), tones.ink, 1);
  }

  for (const [position, before] of icon.entries()) {
    const target = tracePoint(position);
    dot(ctx, { x: mix(before.x, target.x, transition), y: mix(before.y, target.y, transition) }, phone ? 1.6 : 2.3, tones.ink);
  }

  if (entropy) {
    drawLine(ctx, traceLeft, traceTop, traceRight, traceTop, tones.muted, .7, [2, 3]);
    drawText(ctx, 'ln 2', traceRight, traceTop + (phone ? -6 : 8), { size: phone ? 8.5 : 10, color: tones.ink, family: 'math', align: 'right' });

    for (let position = 8; position < rows.length; position++) {
      const before = tracePoint(position - 1);
      const target = tracePoint(position);
      const grown = smooth(time, 65250 + position * 30, 65550 + position * 30);

      if (grown <= 0) continue;

      const next = { x: mix(before.x, target.x, grown), y: mix(before.y, target.y, grown) };
      drawLine(ctx, before.x, before.y, next.x, next.y, tones.ink, 1.1);
      dot(ctx, target, (phone ? 1.3 : 2) * grown, tones.ink);
    }
  }
}

export function drawClaimAndLedger(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: Tones, labels: FilmLabels): void {
  const phone = width < PHONE_STAGE_WIDTH;

  if (time >= 68750) {
    const layout = ingredientLayout(width, height, time);
    const horizontal = smooth(time, 68750, 69500);
    const vertical = smooth(time, 69500, 70250);
    const bandY = layout.ratioBottom + (phone ? height * 19 / 310 : 4);
    const corner = width * (phone ? .96 : .98);
    drawLine(ctx, layout.left, bandY, mix(layout.left, corner, horizontal), bandY, tones.blue, phone ? 2.5 : 3);

    if (vertical > 0) {
      drawLine(ctx, corner, bandY, corner, mix(bandY, height * (phone ? 103 / 310 : .23), vertical), tones.blue, phone ? 2.5 : 3);
    }
    labels.place('dimension', width * .5, height * (phone ? 116 / 310 : .81));
    const rows = phone ? [
      'CLAIMED: SIMILARITIES OF THE LINE',
      'FINITE FAMILY · 0<|rᵢ|<1 · SIGNED/UNEQUAL',
      'ALL pᵢ>0 · NO SEPARATION · DIMENSION, NOT DENSITY',
    ] : [
      'CLAIMED: EVERY FINITE FAMILY OF CONTRACTING SIMILARITIES OF THE LINE',
      'SIGNED UNEQUAL RATIOS · EVERY STRICTLY POSITIVE WEIGHT VECTOR',
      'NO SEPARATION CONDITION · DIMENSION, NOT A DENSITY',
    ];

    for (const [index, value] of rows.entries()) {
      drawText(ctx, value, width * .5, height * (phone ? (137 + index * 12) / 310 : .85 + index * .026), { size: phone ? 8.5 : 10.5, color: tones.ink, family: phone && index > 0 ? 'math' : 'type' });
    }
  }

  if (time < 77500) return;

  const amount = smooth(time, 77500, 78750);
  const offset = phone ? 0 : (1 - amount) * height * .15;
  const rows = [
    'UNREVIEWED · 20 OCT 2026',
    'SelfSimilar.lean · STATEMENT CATALOGUED',
    'COROLLARIES: LINKED, NOT CATALOGUED',
  ];
  drawLine(ctx, width * .05, height * (phone ? 277 / 310 : .923) + offset, width * (phone ? mix(.05, .95, amount) : .95), height * (phone ? 277 / 310 : .923) + offset, tones.ink, 1);

  for (const [index, value] of rows.entries()) {
    drawText(ctx, value, width * .5, height * (phone ? (284 + index * 10) / 310 : .94 + index * .022) + offset, { size: phone ? 8.5 : 10.5, color: tones.ink });
  }
}

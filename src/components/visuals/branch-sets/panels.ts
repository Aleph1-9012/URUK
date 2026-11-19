import { mix } from '../../../lib/animation';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import { drawLine, drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';
import { asymptoticRatio, chartValues, CYCLE_SIZES } from './math';
import { motionAt, SCENE_TIMES } from './story';

type Plot = { left: number; right: number; top: number; bottom: number; mMin: number; mMax: number; yMax: number };

function chartFrame(width: number, height: number): Plot {
  const phone = width < PHONE_STAGE_WIDTH;

  return {
    left: width * (phone ? .14 : .60),
    right: width * (phone ? .88 : .92),
    top: height * (phone ? .55 : .32),
    bottom: height * (phone ? .67 : .66),
    mMin: 100,
    mMax: 600,
    yMax: chartValues(600).half * 1.1,
  };
}

function project(plot: Plot, m: number, value: number): { x: number; y: number } {
  return {
    x: mix(plot.left, plot.right, (m - plot.mMin) / (plot.mMax - plot.mMin)),
    y: mix(plot.bottom, plot.top, value / plot.yMax),
  };
}

function claim(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones, labels: FilmLabels): void {
  if (time < SCENE_TIMES.claim) return;

  const phone = width < PHONE_STAGE_WIDTH;
  if (time < SCENE_TIMES.chart) {
    if (motionAt(time).definitionRetirement < 1) return;

    labels.place('claim-fraction', width * (phone ? .5 : .75), height * (phone ? .42 : .065));
    labels.place('claim-matching', width * (phone ? .5 : .75), height * (phone ? .51 : .17));
    drawText(ctx, 'ONLY AN UNSPECIFIED LARGE-ORDER FAMILY', width * (phone ? .5 : .75), height * (phone ? .575 : .25), { size: phone ? 8.5 : 11, color: tones.ink });
    drawWrappedText(ctx, 'AN EDGE ALREADY HAS MATCHING SIZE 1\nORDER ABOVE 100 IS NECESSARY, NOT SUFFICIENT', width * (phone ? .5 : .75), height * (phone ? .62 : .35), width * (phone ? .90 : .44), { size: phone ? 9 : 12, color: tones.ink });
    drawText(ctx, 'NO EXAMPLE IS ASSERTED AT A DISPLAYED ORDER', width * (phone ? .5 : .75), height * (phone ? .78 : .54), { size: phone ? 8 : 10, color: tones.ink });
  }
}

function chart(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones, labels: FilmLabels): void {
  if (time < SCENE_TIMES.chart) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const motion = motionAt(time);
  const plot = chartFrame(width, height);
  const currentM = mix(plot.mMin, plot.mMax, motion.chart);
  const center = width * (phone ? .5 : .76);
  labels.place('count-bound', phone ? width * .30 : center, height * (phone ? .42 : .20));
  drawText(ctx, 'UNSPECIFIED FAMILY · NO GRAPH VALUES MEASURED', center, height * (phone ? .505 : .265), { size: phone ? 8 : 10.5, color: tones.ink });
  drawLine(ctx, plot.left, plot.bottom, plot.right, plot.bottom, tones.ink, .9);
  drawLine(ctx, plot.left, plot.bottom, plot.left, plot.top, tones.ink, .9);

  for (const m of [100, 300, 600]) {
    const point = project(plot, m, 0);
    drawLine(ctx, point.x, point.y - 3, point.x, point.y + 3, tones.ink, .8);
    drawText(ctx, String(m), point.x, point.y + 12, { size: phone ? 10 : 12, color: tones.ink, family: 'math' });
  }

  drawText(ctx, 'm', plot.right + (phone ? 8 : 9), plot.bottom - 11, { size: phone ? 11 : 13, color: tones.ink, family: 'math' });

  for (const value of [0, 150, 300]) {
    const point = project(plot, plot.mMin, value);
    drawLine(ctx, point.x - 3, point.y, point.x + 3, point.y, tones.ink, .8);
    drawText(ctx, String(value), point.x - 7, point.y, { size: phone ? 9 : 11, color: tones.ink, family: 'math', align: 'right' });
  }

  if (motion.gap > 0) {
    const end = mix(plot.left, plot.right, motion.gap);

    for (let x = plot.left; x <= end; x += 5) {
      const m = mix(plot.mMin, plot.mMax, (x - plot.left) / (plot.right - plot.left));
      const values = chartValues(m);
      const half = project(plot, m, values.half);
      const upper = project(plot, m, values.claimedH);
      drawLine(ctx, x, half.y, x, upper.y, tones.muted, .45);
    }
  }

  const first = chartValues(plot.mMin);
  const current = chartValues(currentM);
  const halfA = project(plot, plot.mMin, first.half);
  const halfB = project(plot, currentM, current.half);
  const upperA = project(plot, plot.mMin, first.claimedH);
  const upperB = project(plot, currentM, current.claimedH);
  drawLine(ctx, halfA.x, halfA.y, halfB.x, halfB.y, tones.ink, 1.5);
  drawLine(ctx, upperA.x, upperA.y, upperB.x, upperB.y, tones.blue, 1.8, [5, 3]);

  if (!phone) {
    const thirdA = project(plot, plot.mMin, first.third);
    const thirdB = project(plot, currentM, current.third);
    drawLine(ctx, thirdA.x, thirdA.y, thirdB.x, thirdB.y, tones.ink, 1, [2, 3]);

    if (motion.chart === 1) {
      drawLine(ctx, thirdB.x, thirdB.y, width * .85, height * .56, tones.ink, .7);
      labels.place('chart-third', width * .78, height * .59);
      drawText(ctx, 'DUCHET–MEYNIEL · KNOWN LOWER BOUND', center, height * .625, { size: 9, color: tones.ink });
    }
  }

  if (motion.chart === 1) {
    const halfTarget = { x: width * (phone ? .77 : .78), y: height * (phone ? .42 : .30) };

    if (phone) {
      const elbow = width * .95;
      drawLine(ctx, halfB.x, halfB.y, elbow, halfB.y, tones.ink, .7);
      drawLine(ctx, elbow, halfB.y, elbow, halfTarget.y + 14, tones.ink, .7);
      drawLine(ctx, elbow, halfTarget.y + 14, halfTarget.x, halfTarget.y + 14, tones.ink, .7);
    } else drawLine(ctx, halfB.x, halfB.y, halfTarget.x, halfTarget.y + 8, tones.ink, .7);
    labels.place('chart-half', halfTarget.x, halfTarget.y);
    const upperY = height * (phone ? .76 : .72);
    const elbow = plot.right + (phone ? 19 : 24);
    drawLine(ctx, upperB.x, upperB.y, elbow, upperB.y, tones.blue, .7);
    drawLine(ctx, elbow, upperB.y, elbow, upperY, tones.blue, .7);
    drawLine(ctx, elbow, upperY, width * (phone ? .83 : .89), upperY, tones.blue, .7);
    labels.place('claim-upper', center, upperY);

    if (!phone) {
      drawText(ctx, 'CLAIMED UPPER ENVELOPE · ONLY FOR THAT FAMILY', center, height * .76, { size: 9.5, color: tones.ink });
      drawText(ctx, 'GENERAL BOUND CHECKED ON ' + CYCLE_SIZES.length + ' SMALL GRAPHS', center, height * .815, { size: 9, color: tones.ink });
    }
  }
}

function ratio(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones, labels: FilmLabels): void {
  if (time < SCENE_TIMES.gap) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const x = width * (phone ? .25 : .42);
  const y = height * (phone ? .075 : .12);
  const value = asymptoticRatio();

  if (!Number.isFinite(value) || value <= 1) throw new Error('The asymptotic ratio must come from the positive leading coefficients.');

  labels.place('asymptotic-ratio', x, y);
  drawWrappedText(ctx, phone ? 'ASYMPTOTIC\nLARGE ORDER ONLY' : 'ASYMPTOTIC · LARGE ORDER ONLY', x, y + (phone ? 13 : 20), width * (phone ? .44 : .48), { size: phone ? 8 : 10.5, color: tones.ink });
}

function ledger(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones): void {
  if (time < SCENE_TIMES.ledger) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const motion = motionAt(time);
  const center = width * (phone ? .5 : .76);
  const left = width * (phone ? .055 : .55);
  const right = width * (phone ? .945 : .97);
  const top = height * (phone ? .82 : .85);
  const step = phone ? Math.max(10, height * .027) : height * .023;
  const rows = [
    'UNREVIEWED · 17 OCT 2026',
    'LEAN STATEMENT · 56 LINES · CATALOGUED',
    'FRACTIONAL STRENGTHENING OUTSIDE THE STATEMENT',
    'NO OUTSIDE REPLAY FOUND',
    'FORMAL STATEMENT ≠ HUMAN APPROVAL',
  ];
  drawLine(ctx, left, top, mix(left, right, motion.ledger), top, tones.ink, .9);

  for (const [index, value] of rows.entries()) {
    if (motion.ledger < index / rows.length) continue;

    const replayRow = index === 3;
    const compactReplay = replayRow && phone && width < 300;
    const y = top + 11 + index * step - (compactReplay ? 1 : 0);
    drawText(ctx, value, center, y, { size: phone ? 8 : 9.5, color: tones.ink, family: index === rows.length - 1 ? 'math' : 'type' });

    if (replayRow && motion.replayMark > 0) {
      const underlineY = y + (compactReplay ? 3.75 : 6);
      drawLine(ctx, mix(left, right, .25), underlineY, mix(mix(left, right, .25), mix(left, right, .75), motion.replayMark), underlineY, tones.ink, .7);
    }
  }
}

export function drawBranchPanels(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones, labels: FilmLabels): void {
  claim(ctx, width, height, time, tones, labels);
  chart(ctx, width, height, time, tones, labels);
  ratio(ctx, width, height, time, tones, labels);
  ledger(ctx, width, height, time, tones);
}

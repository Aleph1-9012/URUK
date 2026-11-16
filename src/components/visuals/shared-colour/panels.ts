import { mix } from '../../../lib/animation';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import { drawLine, drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';
import type { SharedColourModel } from './math';
import { motionAt, SCENE_TIMES } from './story';

function note(ctx: CanvasRenderingContext2D, value: string, width: number, height: number, fraction: number, tones: FilmTones, size?: number): void {
  const phone = width < PHONE_STAGE_WIDTH;
  drawWrappedText(ctx, value, width * .5, height * fraction, width * .91, { size: size ?? (phone ? 9 : 12), color: tones.ink });
}

function history(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones, labels: FilmLabels, model: SharedColourModel): void {
  const phone = width < PHONE_STAGE_WIDTH;
  const motion = motionAt(time);
  const first = phone ? .66 : .67;

  switch (motion.scene) {
    case 'paint':
      if (motion.paint === 1) {
        note(ctx, `${model.colourCounts[0]} SOLID · ${model.colourCounts[1]} HATCHED`, width, height, .57, tones, phone ? 10 : 13);
      }

      note(ctx, `ONE FIXED COLOURING · ${model.colourCounts.length} INK PATTERNS`, width, height, first, tones);
      labels.place('colour-rule', width * .5, height * .76);
      note(ctx, 'PRIME FACTORS COUNTED WITH MULTIPLICITY', width, height, .84, tones, phone ? 8.5 : 11);
      note(ctx, 'A PICTURE · THE CLAIM IS FOR EVERY COLOURING', width, height, .91, tones, phone ? 8.5 : 11);
      break;
    case 'schur':
      note(ctx, 'SCHUR 1916 · ONE SAME-COLOUR SUM', width, height, first, tones);
      labels.place('schur', width * .5, height * .76);
      note(ctx, 'FOUND IN THIS ONE COLOURING', width, height, .84, tones);
      break;
    case 'finiteSums':
      note(ctx, `${model.folkman.inputs.length} GENERATORS · ${model.folkman.sums.length} SUBSET SUMS`, width, height, first, tones);
      labels.place('subset-example', width * .5, height * .76);
      note(ctx, 'THE ADDITIVE STATEMENT ONLY', width, height, .84, tones);
      break;
    case 'exponents':
      note(ctx, "CARRY THE POWERS' COLOURS TO THEIR EXPONENTS", width, height, first, tones, phone ? 8.5 : 12);
      labels.place('exponent-colour', width * .5, height * .74);
      labels.place('power-product', width * .5, height * .83);
      note(ctx, 'SUM OF EXPONENTS · PRODUCT OF POWERS', width, height, .90, tones, phone ? 8.5 : 11);
      break;
    case 'both':
      note(ctx, 'ASK FOR BOTH OPERATIONS IN ONE COLOUR', width, height, first, tones);
      labels.place('mixed-four', width * .5, height * .76);
      note(ctx, `THE TARGET USES ${model.m2.inputs.length} GENERATORS`, width, height, .84, tones);
      break;
    case 'infiniteObstruction':
      note(ctx, 'HINDMAN 1980 · HISTORICAL OBSTRUCTION', width, height, first, tones);
      note(ctx, 'SOME COLOURINGS BLOCK INFINITE SETS', width, height, .74, tones);
      note(ctx, 'THIS FINITE WINDOW DOES NOT SHOW ONE', width, height, .83, tones, phone ? 8.5 : 11);
      break;
    case 'finiteQuestion':
      note(ctx, 'THE FINITE QUESTION · EVERY PRESCRIBED SIZE', width, height, first, tones);
      drawText(ctx, 'm = 1, 2, 3, …', width * .5, height * .77, { size: phone ? 15 : 21, color: tones.ink, family: 'math' });
      note(ctx, 'THE SLOTS ARE THE GENERATORS TO BE FOUND', width, height, .86, tones, phone ? 8.5 : 11);
      break;
    case 'pairSearch':
      note(ctx, 'FOUND BY SEARCH FOR THIS ONE COLOURING', width, height, first, tones);
      labels.place('mixed-four', width * .5, height * .76);
      note(ctx, `${model.m2.inputs.length} GENERATORS · ${model.m2.union.length} UNION VALUES`, width, height, .84, tones, phone ? 8.5 : 11);
      break;
    case 'scaling': {
      const settled = motion.scale * (1 - motion.scaleReturn) === 1;
      const terms = model.scaled.inputs.length;
      const factor = model.scaled.k;

      note(ctx, settled ? 'DILATE THE INPUTS, THEN RECOMPUTE' : 'INPUT MARKS MOVING · READ AFTER SETTLING', width, height, first, tones, phone ? 8.5 : 12);
      note(ctx, `SUM TIMES ${factor} · ${terms}-TERM PRODUCT TIMES ${factor ** terms}`, width, height, .75, tones);
      note(ctx, 'AN ARBITRARY COLOURING NEED NOT KEEP THE INK', width, height, .85, tones, phone ? 8.5 : 11);
      break;
    }
    default:
      break;
  }
}

function claimScope(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones, labels: FilmLabels, model: SharedColourModel): void {
  const motion = motionAt(time);

  if (time < SCENE_TIMES.paperClaim) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const late = time >= SCENE_TIMES.review;
  note(ctx, late ? 'CLAIMED: EVERY FINITE COLOURING · EVERY m' : 'CLAIMED: EVERY FINITE COLOURING\nEVERY PRESCRIBED FINITE SIZE', width, height, phone ? .68 : .66, tones, late ? (phone ? 8.5 : 11) : (phone ? 9 : 12));

  if (late) return;

  if (motion.scene === 'paperClaim') {
    note(ctx, `THESE MARKS: ONE COLOURING, ${model.m3.inputs.length} GENERATORS`, width, height, .76, tones, phone ? 8.5 : 11);
    labels.place('separation', width * .5, height * .86);
  } else {
    labels.place('union-count', width * .5, height * .79);

    if (motion.scene === 'separatedUnion') {
      note(ctx, `${model.m3.intersection.length} SHARED SINGLETONS COUNTED ONCE`, width, height, .86, tones, phone ? 8.5 : 11);
    } else {
      note(ctx, 'FINITE SIZE ONLY · NO NUMERICAL BOUND', width, height, .87, tones, phone ? 8.5 : 11);
      note(ctx, 'NO INFINITE GUARANTEE FOR EVERY COLOURING', width, height, .93, tones, phone ? 8.5 : 11);
    }
  }
}

function ledger(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones): void {
  if (time < SCENE_TIMES.review) return;

  const motion = motionAt(time);
  const phone = width < PHONE_STAGE_WIDTH;
  const left = width * .055;
  const right = width * .945;
  const top = height * .73;
  drawLine(ctx, left, top - 8, mix(left, right, motion.review), top - 8, tones.ink, .8);
  drawText(ctx, 'UNREVIEWED · 20 OCT 2026', width * .5, top, { size: phone ? 9 : 12, color: tones.ink });

  if (time < SCENE_TIMES.formalEvidence) return;

  const rows = [
    'RELEASE: NO LEAN STATEMENT',
    'OUTSIDE LEAN 4 PROOF WITHOUT SEPARATION',
    'TWO INDEPENDENT REPLAYS REPORTED',
    'REPLAYS NOT PERFORMED BY THIS FILM',
    "PARTLY USES THE RELEASE'S OWN LIBRARY",
    "AUTHOR'S STANDING UNASSESSED",
    'MACHINE EVIDENCE · NOT HUMAN APPROVAL',
  ];
  const size = phone ? 8.5 : 11;
  let topOfRow = height * .77;

  for (const [index, value] of rows.entries()) {
    if (motion.ledger < index / rows.length) continue;

    const bounds = drawWrappedText(ctx, value, width * .5, topOfRow, width * .90, { size, color: tones.ink });
    topOfRow = bounds.y + bounds.height + (phone ? 3.5 : 3);
  }
}

export function drawSharedPanels(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones, labels: FilmLabels, model: SharedColourModel): void {
  history(ctx, width, height, time, tones, labels, model);
  claimScope(ctx, width, height, time, tones, labels, model);
  ledger(ctx, width, height, time, tones);
}

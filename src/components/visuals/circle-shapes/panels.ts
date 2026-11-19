import { mix } from '../../../lib/animation';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import { drawLine, drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';
import type { buildCircleModel } from './math';
import { motionAt, SCENE_TIMES } from './story';

type CircleModel = ReturnType<typeof buildCircleModel>;

function note(ctx: CanvasRenderingContext2D, value: string, width: number, height: number, phoneY: number, wideY: number, tones: FilmTones, size?: number, family: 'type' | 'math' = 'type') {
  const phone = width < PHONE_STAGE_WIDTH;

  return drawWrappedText(ctx, value, width * (phone ? .5 : .77), height * (phone ? phoneY : wideY), width * (phone ? .90 : .40), {
    size: size ?? (phone ? 9.5 : 12), color: tones.ink, family,
  });
}

function history(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones, model: CircleModel): void {
  const motion = motionAt(time);
  const phone = width < PHONE_STAGE_WIDTH;

  switch (motion.scene) {
    case 'colouring':
      note(ctx, 'ANY FINITE COLOURING', width, height, .59, .28, tones);
      note(ctx, 'NO REGULARITY ASSUMED', width, height, .68, .42, tones);
      note(ctx, 'INK GLYPHS DISTINGUISH THE CATEGORIES', width, height, .80, .58, tones, phone ? 9 : 11);
      break;
    case 'pigeonhole':
      note(ctx, `${model.simplex.colours} CATEGORIES · ${model.simplex.vertices.length} POINTS\n${model.simplex.pairs.length} UNIT-DISTANCE PAIRS`, width, height, .57, .19, tones);
      note(ctx, motion.trialsComplete
        ? `${model.simplex.trials.length} CHECKED · ONE REPRESENTATIVE PAIR SHOWN`
        : `ASSIGNMENT ${motion.trialIndex + 1} OF ${model.simplex.trials.length}\nEACH HAS A SAME-INK PAIR`, width, height, .68, .36, tones);
      note(ctx, `PIGEONHOLE · DIMENSION ${model.simplex.dimension} DRAWN SCHEMATICALLY`, width, height, .79, .54, tones, phone ? 8.5 : 11);
      note(ctx, 'NO MONOCHROMATIC SIMPLEX COMPUTED', width, height, .88, .68, tones, phone ? 8.5 : 11);
      break;
    case 'spherical':
      note(ctx, 'NECESSARY: ON A SPHERE', width, height, .59, .25, tones);
      note(ctx, 'ERDŐS ET AL. · 1973 · KNOWN', width, height, .68, .39, tones, phone ? 10 : 13, 'math');
      note(ctx, motion.collinear === 1 && motion.sphereReturn === 0
        ? 'COLLINEAR 0, 1, 2: NO COMMON CIRCLE\nNOT RAMSEY BY THE KNOWN NECESSARY CONDITION'
        : 'SMALL CIRCUMCIRCLES COMPUTED EXACTLY\nA NECESSARY CONDITION IS NOT A CONVERSE', width, height, .78, .55, tones, phone ? 9 : 11);
      break;
    case 'graham':
      note(ctx, "GRAHAM'S CONJECTURE", width, height, .59, .28, tones);
      note(ctx, 'SPHERICAL SUFFICES', width, height, .69, .44, tones);
      note(ctx, 'A CONJECTURE', width, height, .80, .59, tones);
      break;
    case 'transitive':
      note(ctx, motion.rectangle > 0 ? `${model.polygon.rotations.length} ROTATIONS VERIFIED ON THE PARENT` : `${model.polygon.rotations.length} ROTATIONS PERMUTE ${model.polygon.vertices.length} MARKS`, width, height, .59, .25, tones);
      note(ctx, 'TRANSITIVE: ANY MARK CAN MOVE TO ANY OTHER', width, height, .69, .41, tones);
      note(ctx, 'A RECTANGLE INSIDE IS SUBTRANSITIVE', width, height, .81, .58, tones);
      break;
    case 'kite':
      note(ctx, 'BOTH ON A CIRCLE\nGRAHAM PREDICTED RAMSEY', width, height, .58, .22, tones);
      note(ctx, 'SOME CYCLIC KITES ARE NOT SUBTRANSITIVE', width, height, .70, .41, tones);
      note(ctx, 'CITED · NON-SUBTRANSITIVITY NOT CHECKED FOR THIS KITE', width, height, .82, .59, tones, phone ? 8.5 : 11);
      break;
    case 'heptagon': {
      note(ctx, "PÁLVÖLGYI'S SEVEN-POINT OBSTRUCTION", width, height, .57, .18, tones, phone ? 10 : 13, 'math');
      note(ctx, 'POSITIONS SCHEMATIC\nNOT RAMSEY: CITED, NOT COMPUTED', width, height, .68, .36, tones);
      const bounds = note(ctx, "GRAHAM'S SPHERICAL CONVERSE", width, height, .82, .59, tones, phone ? 9 : 11);
      drawLine(ctx, bounds.x - 3, bounds.y + bounds.height / 2, mix(bounds.x - 3, bounds.x + bounds.width + 3, motion.grahamStrike), bounds.y + bounds.height / 2, tones.ink, 1.2);
      break;
    }
    default:
      break;
  }
}

function claim(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones): void {
  const motion = motionAt(time);
  const phone = width < PHONE_STAGE_WIDTH;

  if (motion.scene === 'classification') {
    note(ctx, 'CLAIMED: EXACT ALGEBRAIC CLASSIFICATION', width, height, .57, .18, tones);
    note(ctx, 'MAIN CRITERION: AT LEAST TWO POINTS\nFULL AFFINE SPAN', width, height, .67, .33, tones, phone ? 9 : 11);
    const kiteNote = phone
      ? 'SOME NON-SUBTRANSITIVE CYCLIC KITES:\nCLAIMED RAMSEY\nTHIS KITE\'S NON-SUBTRANSITIVITY NOT CHECKED'
      : 'SOME NON-SUBTRANSITIVE CYCLIC KITES: CLAIMED RAMSEY\nTHIS KITE\'S NON-SUBTRANSITIVITY NOT CHECKED';
    note(ctx, kiteNote, width, height, .78, .49, tones, phone ? 8.5 : 11);
    const bounds = note(ctx, 'LRW: SUBTRANSITIVITY IS NECESSARY', width, height, .92, .70, tones, phone ? 8.5 : 11);
    drawLine(ctx, bounds.x - 3, bounds.y + bounds.height / 2, mix(bounds.x - 3, bounds.x + bounds.width + 3, motion.rivalStrike), bounds.y + bounds.height / 2, tones.ink, 1.2);
  } else if (motion.scene === 'fivePoints') {
    note(ctx, motion.sixth > 0
      ? 'SIX OR MORE: THIS CONSEQUENCE DOES NOT APPLY'
      : 'CLAIMED: AT MOST FIVE POINTS ON A CIRCLE ARE RAMSEY', width, height, .59, .26, tones);
    note(ctx, motion.sixth > 0
      ? 'NO RAMSEY VERDICT FOR THIS SIX-POINT SET'
      : 'EVERY NONEMPTY SET · THE PAPER\'S CLAIM', width, height, .73, .47, tones, phone ? 9 : 11);
  }
}

function tensor(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones, labels: FilmLabels, model: CircleModel): void {
  if (motionAt(time).scene !== 'tensor') return;

  const phone = width < PHONE_STAGE_WIDTH;
  const center = width * (phone ? .5 : .77);
  labels.place('tensor-left', width * (phone ? .12 : .16), height * (phone ? .419 : .76));
  labels.place('tensor-right', width * (phone ? .42 : .40), height * (phone ? .419 : .76));
  labels.place('multiply-map', width * (phone ? .5 : .28), height * (phone ? .506 : .85));
  if (phone) {
    drawWrappedText(ctx, 'SPLIT AND MERGE: SCHEMATIC', width * .25, height * .55, width * .46, { size: 8.5, color: tones.ink });
    drawWrappedText(ctx, 'Q EXAMPLE ONLY · CLASSIFICATION NOT TESTED', width * .75, height * .55, width * .46, { size: 8.5, color: tones.ink });
  } else {
    note(ctx, 'SPLIT AND MERGE: SCHEMATIC', width, height, .57, .10, tones, 11);
    note(ctx, 'Q EXAMPLE ONLY · CLASSIFICATION NOT TESTED', width, height, .61, .17, tones, 11);
  }
  labels.place('square-matrix', width * (phone ? .76 : .64), height * (phone ? .094 : .37));
  labels.place('square-residual', center, height * (phone ? .697 : .56));
  note(ctx, `${model.tensor.evaluations.length} EXACT ZERO EVALUATIONS · IDENTITY SPATIAL BLOCK`, width, height, .761, .65, tones, phone ? 8 : 10.5);
  labels.place('tensor-field', center, height * (phone ? .868 : .75));
  note(ctx, 'DISPLAY RESCALED · ORIGINAL COORDINATES IN THE Q TEST', width, height, .932, .86, tones, phone ? 8 : 10.5);
}

function exact(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones): void {
  const motion = motionAt(time);

  if (motion.scene !== 'exact') return;

  note(ctx, 'EXACT COORDINATES ONLY', width, height, .59, .25, tones);
  const carrying = motion.exact < 1 || motion.rounding > 0 && motion.rounding < 1 || motion.roundingReturn > 0 || motion.closingMorph > 0;
  note(ctx, carrying ? 'CARRYING THE MARKS · READ WHEN SETTLED' : motion.rounding === 1
    ? 'ROUNDED TO TWO DECIMALS: NO COMMON CIRCLE'
    : 'EXACT RATIONAL POINTS: ONE COMMON CIRCLE', width, height, .70, .43, tones);
  note(ctx, 'SMALL NUMERICAL ERRORS DO NOT PRESERVE THE RELATIONS', width, height, .82, .62, tones, width < PHONE_STAGE_WIDTH ? 8.5 : 11);
}

function ledger(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones): void {
  if (time < SCENE_TIMES.review) return;

  const phone = width < PHONE_STAGE_WIDTH;
  const motion = motionAt(time);
  const center = width * .5;
  const left = width * .055;
  const right = width * .945;
  const top = height * (phone ? .58 : .74);
  note(ctx, 'TWO SEPARATE ILLUSTRATIONS', width, height, .44, .25, tones, phone ? 8.5 : 11);
  note(ctx, 'NO VERDICT ON THEIR COMBINED SET', width, height, .49, .34, tones, phone ? 8 : 10.5);
  drawLine(ctx, left, top - 13, mix(left, right, motion.review), top - 13, tones.ink, .8);
  drawText(ctx, 'UNREVIEWED · 20 OCT 2026', center, top, { size: phone ? 10 : 12, color: tones.ink });
  const rows = [
    'LEAN CATALOGUE:',
    'CLASSIFICATION · FULL AFFINE SPAN',
    "PAPER'S 12-POINT EXAMPLE · NOT DRAWN",
    'FIVE OTHERS LINKED · NOT CATALOGUED',
    'MACHINE EVIDENCE · NOT A READING',
    'NOT HUMAN APPROVAL',
  ];
  let rowTop = top + (phone ? 20 : 15);

  for (const [index, value] of rows.entries()) {
    if (motion.ledger < index / rows.length) continue;

    const bounds = drawWrappedText(ctx, value, center, rowTop, width * .88, { size: phone ? 9 : 10.5, color: tones.ink });
    rowTop = bounds.y + bounds.height + (phone ? 6 : 3.5);
  }
}

export function drawCirclePanels(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones, labels: FilmLabels, model: CircleModel): void {
  history(ctx, width, height, time, tones, model);
  claim(ctx, width, height, time, tones);
  tensor(ctx, width, height, time, tones, labels, model);
  exact(ctx, width, height, time, tones);
  ledger(ctx, width, height, time, tones);
}

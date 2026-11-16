import { drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import type { buildRingRulesModel } from './math';
import { motionAt } from './story';

type RingRulesModel = ReturnType<typeof buildRingRulesModel>;

function note(ctx: CanvasRenderingContext2D, value: string, width: number, height: number, phoneY: number, wideY: number, tones: FilmTones, size?: number): void {
  const phone = width < PHONE_STAGE_WIDTH;
  drawWrappedText(ctx, value, width * (phone ? .5 : .77), height * (phone ? phoneY : wideY), width * (phone ? .91 : .40), {
    size: size ?? (phone ? 9 : 11.5), color: tones.ink,
  });
}

function place(labels: FilmLabels, id: string, width: number, height: number, phoneY: number, wideY: number): void {
  labels.place(id, width * (width < PHONE_STAGE_WIDTH ? .5 : .77), height * (width < PHONE_STAGE_WIDTH ? phoneY : wideY));
}

function tally(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones, model: RingRulesModel): void {
  const motion = motionAt(time);
  const phone = width < PHONE_STAGE_WIDTH;
  note(ctx, 'EVERY BINARY RULE CHECKED', width, height, .67, .12, tones);
  note(ctx, 'FINITE CYCLIC ALGEBRAS ONLY', width, height, .74, .21, tones, phone ? 8.5 : 10.5);

  if (phone) {
    const last = model.tally.at(-1);

    if (!last) throw new Error('The finite-ring tally must contain its eight-cell case.');

    note(ctx, `${last.order} CELLS: ${last.units} OF ${last.ruleCount} RULES INVERTIBLE`, width, height, .83, .5, tones);
    note(ctx, 'INJECTIVE = ONTO\nZERO EXCEPTIONS', width, height, .93, .7, tones, 8.5);

    return;
  }

  const count = Math.min(model.tally.length, Math.ceil(motion.tally * model.tally.length));

  for (const [index, row] of model.tally.entries()) {
    if (index >= count) break;

    drawText(ctx, `${row.order} CELLS     ${row.units} / ${row.ruleCount} RULES`, width * .77, height * (.31 + index * .062), { size: 10.5, color: tones.ink });
  }

  note(ctx, 'INJECTIVE = ONTO · ZERO EXCEPTIONS', width, height, .93, .88, tones, 10);
}

function ledger(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones): void {
  const phone = width < PHONE_STAGE_WIDTH;
  const motion = motionAt(time);
  const center = width * .5;
  const top = height * .65;
  drawText(ctx, 'UNREVIEWED · 3 NOV 2026', center, top, { size: phone ? 10 : 12, color: tones.ink });
  const rows = [
    'LEAN CATALOGUE: THREE OF FOUR PAPERS',
    'TORSION-FREE PAPER: NOT CATALOGUED',
    'NONSOFICITY: OUTSIDE THE STATEMENTS',
    'NO OUTSIDE REPLAY FOUND',
    'EARLIER NONSOFIC GROUP STUDIED SEPARATELY',
    'NO PUBLIC CHECK OF THESE FOUR PROOFS',
    'MACHINE EVIDENCE IS NOT HUMAN APPROVAL',
  ];
  let y = top + (phone ? 20 : 19);

  for (const [index, row] of rows.entries()) {
    if (motion.ledger < index / rows.length) continue;

    const bounds = drawWrappedText(ctx, row, center, y, width * .90, { size: phone ? 8.5 : 10.5, color: tones.ink });
    y = bounds.y + bounds.height + (phone ? 5 : 4);
  }
}

export function drawRingRulesPanels(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, tones: FilmTones, labels: FilmLabels, model: RingRulesModel): void {
  const motion = motionAt(time);
  const phone = width < PHONE_STAGE_WIDTH;

  switch (motion.scene) {
    case 'matrices':
      note(ctx, 'FINITE SQUARE MATRICES OVER A FIELD', width, height, .66, .15, tones);
      place(labels, 'matrix-field', width, height, .74, .29);

      if (motion.productAB === 1) place(labels, 'matrix-ab', width, height, .83, .45);
      if (motion.productBA === 1) place(labels, 'matrix-ba', width, height, .92, .61);

      break;
    case 'groupAlgebra':
      note(ctx, 'THE MATRIX CARRIES ITS FIRST ROW', width, height, .66, .16, tones);
      place(labels, 'ring-rule', width, height, .75, .34);
      place(labels, 'ring-inverse', width, height, .84, .52);
      place(labels, 'finite-algebra', width, height, .93, .71);
      break;
    case 'c4':
      note(ctx, 'FOUR CYCLIC CELLS · TWO-ELEMENT FIELD', width, height, .66, .15, tones);
      place(labels, 'ring-rule', width, height, .75, .32);
      note(ctx, `${model.four.configurations.length} CONFIGURATIONS\n${model.four.groups.length} DISTINCT IMAGES`, width, height, .84, .49, tones);
      note(ctx, 'NO TWO MERGE · EVERY ONE REACHED', width, height, .94, .70, tones, phone ? 8.5 : 11);
      break;
    case 'c3':
      if (motion.c3Shrink < 1) {
        note(ctx, 'CHANGING THE FINITE RING', width, height, .68, .25, tones);
        note(ctx, 'FOUR CELLS TO THREE', width, height, .80, .46, tones);
        note(ctx, 'A LAYOUT TRANSITION · READ AFTER SETTLING', width, height, .92, .68, tones, phone ? 8.5 : 11);
        break;
      }

      if (motion.tally > 0) {
        tally(ctx, width, height, time, tones, model);
        break;
      }

      note(ctx, 'THE SAME STENCIL · THREE CYCLIC CELLS', width, height, .66, .16, tones);
      place(labels, 'ring-rule', width, height, .75, .34);
      note(ctx, `${model.three.configurations.length} CONFIGURATIONS · ${model.three.groups.length} IMAGES\n${model.three.kernel.length} PREIMAGES PER IMAGE`, width, height, .84, .51, tones);
      note(ctx, 'MERGING AND UNREACHABLE STATES\nARRIVE TOGETHER', width, height, .94, .74, tones, phone ? 8.5 : 11);
      break;
    case 'sofic': {
      if (motion.windowRing < 1) {
        note(ctx, 'CHANGING TO THE INTEGER WINDOW', width, height, .69, .28, tones);
        note(ctx, 'A DIFFERENT FINITE ILLUSTRATION', width, height, .83, .50, tones);
        break;
      }

      note(ctx, 'A FINITE PIECE MATCHED EXACTLY', width, height, .66, .14, tones);
      note(ctx, `CYCLIC GROUP: ${model.window.order} CELLS\nINTEGER WINDOW: −10 TO 10`, width, height, .75, .32, tones);
      const checked = Math.floor(model.window.checks * motion.windowChecks);
      note(ctx, `${checked} OF ${model.window.checks} SUMS CHECKED\nINPUTS −5 TO 5 · ${model.window.errors} ERRORS`, width, height, .85, .52, tones);
      note(ctx, 'SCHEMATIC SOFIC IDEA\nNO COUNTEREXAMPLE GROUP DRAWN', width, height, .95, .74, tones, phone ? 8.5 : 10.5);
      break;
    }
    case 'claim':
      note(ctx, '23 SEPTEMBER · THE PAPER CLAIMS', width, height, .66, .13, tones);
      if (motion.claimBlank < 1) {
        note(ctx, 'COUNTEREXAMPLE GROUP NOT GENERATED', width, height, .76, .32, tones);
        note(ctx, 'THE FINITE RULE IS A SEPARATE TOY', width, height, .87, .53, tones, phone ? 8.5 : 11);
        break;
      }

      place(labels, 'claim-field', width, height, .74, .29);
      place(labels, 'claim-products', width, height, .82, .46);
      if (motion.claimMap > 0) place(labels, 'claim-map', width, height, .90, .64);
      if (motion.claimMap === 1) note(ctx, 'INJECTIVE · NOT ONTO', width, height, .97, .81, tones, phone ? 8.5 : 11);
      break;
    case 'torsionFree':
      note(ctx, '4 OCTOBER · TORSION-FREE CLAIM', width, height, .66, .10, tones, phone ? 8.5 : 11);
      place(labels, 'torsion-field', width, height, .72, .23);
      place(labels, 'torsion-hypothesis', width, height, .79, .36);

      if (motion.proof >= .2) place(labels, 'proof-assumption', width, height, .85, .50);
      if (motion.proof >= .4) place(labels, 'proof-first', width, height, .90, .63);
      if (motion.proof >= .7) place(labels, 'proof-second', width, height, .95, .76);

      note(ctx, 'SYMBOLS ONLY · NO EXAMPLE COMPUTED', width, height, .98, .91, tones, phone ? 8 : 10);
      break;
    case 'recipe':
      note(ctx, 'NO SMALL EXAMPLE IS WRITTEN DOWN', width, height, .67, .22, tones);
      note(ctx, 'THE TERMINATING RECIPES HAVE NOT BEEN RUN', width, height, .78, .43, tones);
      note(ctx, 'THE FINITE STENCIL IS A TOY\nTHE CLAIMED GROUP REMAINS UNDRAWN', width, height, .91, .67, tones, phone ? 8.5 : 10.5);
      break;
    case 'ledger':
      ledger(ctx, width, height, time, tones);
      break;
  }
}

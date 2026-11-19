import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import type { CarryTreeModel } from './math';
import { motionAt } from './story';

export function drawCarryTreePanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, model: CarryTreeModel): void {
  const phone = w < PHONE_STAGE_WIDTH;
  const motion = motionAt(time);
  const center = phone ? .5 : .845;
  const panelWidth = phone ? .94 : .26;

  function note(value: string, y: number, size = phone ? 9 : 11, blue = false): void {
    drawWrappedText(ctx, value, w * center, h * y, w * panelWidth, {
      size,
      color: blue ? tones.blue : tones.ink,
      paper: tones.paper,
    });
  }

  function formula(id: string, y: number, x = center): void {
    labels.place(id, w * x, h * y);
  }

  function toyFormulas(): void {
    if (motion.quotient > 0) formula('quotient-eight', phone ? .085 : .13, phone ? .72 : center);
    if (motion.toyRotations > 0) formula('rotation-rule', phone ? .175 : .25, phone ? .72 : center);
    if (motion.kernel > 0) formula('kernel', phone ? .265 : .38, phone ? .72 : center);
  }

  function knownResults(): void {
    if (motion.regularity > 0) {
      drawWrappedText(ctx, 'SMOOTH · LIPSCHITZ · QUASICONFORMAL', w * (phone ? .25 : .5), h * (phone ? .53 : .69), w * (phone ? .46 : .94), {
        size: phone ? 8 : 10,
        color: tones.ink,
        paper: tones.paper,
      });
    }

    if (motion.pardon > 0) {
      drawWrappedText(ctx, '1, 2 CLASSICAL · 3 PARDON 2013', w * (phone ? .75 : .5), h * (phone ? .53 : .90), w * (phone ? .46 : .94), {
        size: phone ? 8.5 : 10,
        color: tones.ink,
        paper: tones.paper,
      });
    }
  }

  function claim(): void {
    if (phone) {
      drawWrappedText(ctx, 'CLAIMED · NONZERO KERNEL', w * .25, h * .74, w * .46, { size: 8.5, color: tones.blue, paper: tones.paper });
      formula('claim-parameters', .78, .75);
      drawWrappedText(ctx, 'CONNECTED · HAUSDORFF\nSECOND-COUNTABLE · WITHOUT BOUNDARY', w * .25, h * .83, w * .46, { size: 8, color: tones.blue, paper: tones.paper });
      drawWrappedText(ctx, 'JOINTLY CONTINUOUS · k ACTION-DEPENDENT', w * .75, h * .83, w * .46, { size: 8, color: tones.blue, paper: tones.paper });
    } else {
      note('CLAIMED · NONZERO KERNEL', .10, 11, true);
      formula('claim-parameters', .20);
      note('CONNECTED · HAUSDORFF\nSECOND-COUNTABLE · WITHOUT BOUNDARY', .28, 10, true);
      note('JOINTLY CONTINUOUS · k ACTION-DEPENDENT', .44, 10, true);
    }

    if (!phone) note('TOPOLOGICAL n-MANIFOLD · FULL SCOPE IN CAPTION', .54, 9, true);
  }

  if (motion.quotient > 0 && motion.claimBracket === 0) toyFormulas();
  if (motion.ruler > 0) knownResults();

  switch (motion.scene) {
    case 'rotations':
      note('CIRCLE · ROTATIONS ONLY', phone ? .32 : .14);
      if (motion.sphere > 0) {
        note('SPHERE ROTATION GROUP: 3 PARAMETERS', phone ? .45 : .31, phone ? 8.5 : 11);
        note('THE SPHERE ITSELF IS TWO-DIMENSIONAL', phone ? .58 : .50, phone ? 8.5 : 10);
      }
      note('LIE GROUPS · SMOOTH PARAMETERS', phone ? .81 : .64, phone ? 8.5 : 10);
      break;
    case 'rough':
      note('SCHEMATIC · MERELY CONTINUOUS', phone ? .35 : .14);
      note('MUST THE GROUP BE A LIE GROUP?', phone ? .49 : .31);
      note('ROUGH PATH ONLY · NO ACTION CONSTRUCTED', phone ? .67 : .50, phone ? 8.5 : 10);
      note('HILBERT’S FIFTH PROBLEM · 1900', phone ? .83 : .64, phone ? 8.5 : 10);
      break;
    case 'tree':
      formula('p-two', phone ? .24 : .10, phone ? .76 : center);
      formula('adic-integers', phone ? .57 : .23);
      note('LEAST SIGNIFICANT DIGITS FIRST', phone ? .66 : .37, phone ? 8.5 : 10);
      note('EACH DISC IS ONE RESIDUE COSET', phone ? .78 : .50, phone ? 8.5 : 10);
      note('EDGES SHOW COSET INCLUSION', phone ? .90 : .63, phone ? 8.5 : 10);
      break;
    case 'toy':
      note(motion.quotient > 0 ? 'ONE CLASSICAL ACTION · CIRCLE ROTATIONS' : 'ADDING ONE · SHOWN MOD 16', phone ? .59 : .48, phone ? 8.5 : 10);
      if (motion.quotient > 0) note(`FACTORS THROUGH MOD ${model.modulus}`, phone ? .70 : .56, phone ? 9 : 11);
      note('FINITE DIGITS WRAP · HIGHER DIGITS CONTINUE', phone ? .82 : .64, phone ? 8 : 9);
      note('THE TOY DOES NOT PROVE THE GENERAL CLAIM', phone ? .93 : .95, phone ? 8 : 9);
      break;
    case 'known':
      note('KNOWN CASES STAY IN INK', phone ? .81 : .53, phone ? 8.5 : 10);
      note('ONE CIRCLE ACTION · NOT EVERY ACTION', phone ? .93 : .63, phone ? 8 : 9);
      break;
    case 'open':
      note('GENERAL TOPOLOGICAL ACTIONS', phone ? .80 : .52, phone ? 8.5 : 10);
      note('DIMENSION 4 AND ABOVE · OPEN', phone ? .90 : .63, phone ? 8.5 : 10);
      break;
    case 'claim':
      note('CLAIMED · DIMENSION 4 AND ABOVE', phone ? .80 : .30, phone ? 8.5 : 11, true);
      if (motion.claimDate > 0) note('23 SEPTEMBER 2026 · UNREVIEWED', phone ? .91 : .47, phone ? 8.5 : 10);
      break;
    case 'exclusion':
    case 'scope':
    case 'review':
    case 'ledger':
      claim();
      if (motion.scene === 'scope' && motion.manifoldScope > 0) {
        note('NONCOMPACT AND NONORIENTABLE ALLOWED', phone ? .935 : .61, phone ? 8 : 9);
        note('BOUNDARY NOT COVERED', phone ? .97 : .66, phone ? 8 : 9);
      }
      if (motion.scene === 'review') {
        if (motion.publicReview > 0) note('NO PUBLIC READING OR CHECK', phone ? .935 : .61, phone ? 8.5 : 10);
        if (motion.reviewDate > 0) note('AS OF 18 OCTOBER 2026', phone ? .97 : .66, phone ? 8 : 9);
      }
      if (motion.scene === 'ledger') {
        note('UNREVIEWED · 18 OCTOBER 2026', phone ? .935 : .61, phone ? 8 : 9);
        if (motion.ledger > 0) note('RELEASE CATALOGUE: NO ENTRY', phone ? .97 : .66, phone ? 8 : 9);
      }
      break;
  }
}

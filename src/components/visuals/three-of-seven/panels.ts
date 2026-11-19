import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import type { ThreeOfSevenModel } from './math';
import { motionAt } from './story';

export function layoutSlots(w: number, h: number) {
  const phone = w < PHONE_STAGE_WIDTH;

  return {
    slotLeft: .1 * w,
    slotRight: .9 * w,
    slotY: (phone ? .365 : .48) * h,
    slotDiameter: phone ? 19 : 27,
    noFourBarY: (phone ? .423 : .55) * h,
    noSevenBarY: (phone ? .575 : .67) * h,
  };
}

export function drawThreeOfSevenPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, model: ThreeOfSevenModel): void {
  const phone = w < PHONE_STAGE_WIDTH;
  const motion = motionAt(time);

  function note(value: string, y: number, size = phone ? 9 : 11): void {
    drawWrappedText(ctx, value, w * .5, h * y, w * .94, { size, color: tones.ink, paper: tones.paper });
  }

  function formula(id: string, y: number): void {
    labels.place(id, w * .5, h * y);
  }

  function claims(): void {
    if (motion.noFour > 0) note('CLAIMED: NO FOUR IN DIMENSION SIX', phone ? .45 : .59, phone ? 8.5 : 11);
    if (motion.conditions > 0) {
      if (phone) {
        note('ONE RECORDED RUN · CORRECT IEEE BINARY64', .495, 8);
        note('STATED COMPILER CONDITIONS', .54, 8);
      } else {
        note('ONE RECORDED RUN · CORRECT IEEE BINARY64 · STATED COMPILER CONDITIONS', .62, 10);
      }
    }
    if (motion.noSeven > 0) note('CLAIMED: NO SEVEN · EXACT ARITHMETIC', phone ? .595 : .70, phone ? 8.5 : 11);
    if (motion.weiner > 0) note('KNOWN: SIX WOULD EXTEND TO SEVEN', phone ? .65 : .755, phone ? 8.5 : 10);
    if (motion.claimReadout > 0) note('DISPLAYED TRIPLE IS NOT A SEARCH', phone ? .71 : .795, phone ? 8 : 9);
  }

  switch (motion.scene) {
    case 'two':
      note('TWO LEVELS · EVERY OVERLAP IS ONE HALF', .54);
      formula('half', .70);
      note('AN EXPLICIT FINITE CONSTRUCTION', .88, phone ? 8.5 : 10);
      break;
    case 'unbiased':
      note('ONE DEFINITE STATE · EQUALLY LIKELY OUTCOMES', .53, phone ? 8.5 : 11);
      formula('overlap-rule', .69);
      if (motion.dimensionThree === 1) note('THREE LEVELS · EVERY OVERLAP IS ONE THIRD', .84, phone ? 8.5 : 10);
      break;
    case 'applications':
      note('MUTUALLY UNBIASED', .54, phone ? 10 : 13);
      note('STATE TOMOGRAPHY', .70);
      note('QUANTUM KEY DISTRIBUTION', .85);
      note('PROTOCOLS ARE NOT DRAWN', .95, phone ? 8 : 9);
      break;
    case 'primes':
      formula('upper-bound', phone ? .83 : .79);
      note('COMPLETE SETS FOR THE SHOWN PRIMES', phone ? .885 : .86, phone ? 8.5 : 11);
      note('OTHER PRIME POWERS ARE NOT DRAWN', .95, phone ? 8 : 9);
      break;
    case 'six':
      if (motion.sixCarry < 1) break;

      note(`SIX LEVELS · ${model.six.count} CONSTRUCTED · ${model.six.upperBound} ALLOWED`, phone ? .45 : .59, phone ? 8.5 : 11);
      formula('triple-factorization', phone ? .58 : .72);
      note('THREE PAIR TABLES OF THE SAME TRIPLE', phone ? .70 : .84, phone ? 8.5 : 10);
      note('LIVE CONSTRUCTION CHECK · NOT A FOURTH-BASIS SEARCH', .95, phone ? 8 : 9);
      break;
    case 'zauner':
      note('ZAUNER 1991 · CONJECTURE', phone ? .46 : .60, phone ? 9 : 12);
      formula('zauner-three', phone ? .61 : .74);
      note('THE TRIPLE SUPPLIES THE LOWER BOUND', .90, phone ? 8.5 : 10);
      break;
    case 'claims':
      claims();
      break;
    case 'ledger':
      claims();
      if (motion.unreviewed > 0) note('UNREVIEWED · 18 OCTOBER 2026', phone ? .77 : .835, phone ? 8 : 9);
      if (motion.replication > 0) note(phone ? 'JASWAL · 13 OCT REPLICATION\nNOT AN EXPERT PROOF CHECK' : 'JASWAL · 13 OCT REPLICATION · NOT AN EXPERT PROOF CHECK', phone ? .815 : .875, phone ? 8 : 9);
      if (motion.lean > 0) {
        note('LINKED LEAN MODEL: AT MOST FIVE · UNCATALOGUED', phone ? .895 : .925, phone ? 7.5 : 9);
        note('DOES NOT ESTABLISH THREE OR EXCLUDE FOUR', phone ? .945 : .97, phone ? 8 : 9);
      }
      break;
  }
}

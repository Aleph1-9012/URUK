import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import type { CoinMatrixModel } from './math';
import { motionAt } from './story';

export function drawCoinMatrixPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, model: CoinMatrixModel): void {
  const phone = w < PHONE_STAGE_WIDTH;
  const motion = motionAt(time);
  const center = phone ? .5 : .80;
  const panelWidth = phone ? .95 : .32;
  const size = model.matrix.length;
  const independent = size * (size + 1) / 2;
  const copies = size * (size - 1) / 2;

  function note(value: string, y: number, fontSize = phone ? 9 : 11, math = false, blue = false): void {
    drawWrappedText(ctx, value, w * center, h * y, w * panelWidth, { size: fontSize, family: math ? 'math' : 'type', color: blue ? tones.blue : tones.ink, paper: tones.paper });
  }

  function formula(id: string, y: number): void {
    labels.place(id, w * center, h * y);
  }

  function laterClaims(): void {
    note('CLAIMED · SYMMETRIC SIGNS', phone ? .285 : .12, phone ? 8.5 : 11, false, true);
    formula('fair-rate', phone ? .365 : .23);
    note('DIAGONAL INCLUDED · RATE ONLY', phone ? .415 : .33, phone ? 8 : 10, false, true);
    if (motion.biasClaim > 0) {
      formula('biased-probability', phone ? .56 : .45);
      formula('biased-rate', phone ? .635 : .54);
      formula('fixed-p', phone ? .71 : .64);
    }
    if (motion.biasAgreement === 1) formula('bias-example', phone ? .79 : .73);
    if (motion.biasScope > 0) note('FIXED p · NO UNIFORM p(n) CLAIM', .86, phone ? 8 : 10, true);
  }

  switch (motion.scene) {
    case 'coins':
      note('ONE SELECTED EXAMPLE', phone ? .52 : .20);
      note(`${independent} INDEPENDENT SIGN CHOICES`, phone ? .63 : .36);
      note('ON AND ABOVE THE DIAGONAL', phone ? .75 : .54, phone ? 8.5 : 11);
      note('DIAGONAL SIGNS ARE RANDOM TOO', phone ? .87 : .73, phone ? 8 : 10);
      break;
    case 'symmetry':
      note(`${copies} MIRROR COPIES · NOT NEW FLIPS`, phone ? .53 : .22, phone ? 9 : 11);
      note(`${independent} INDEPENDENT CHOICES STILL`, phone ? .67 : .42);
      note('SYMMETRY REUSES RANDOMNESS', phone ? .82 : .64, phone ? 8.5 : 11);
      break;
    case 'dependent':
      note(motion.corner < 1 ? 'KEEPING THE TOP-LEFT CORNER' : 'TEMPORARY TWO-BY-TWO CORNER', phone ? .52 : .20);
      formula('unknown-two', phone ? .65 : .40);
      if (motion.cornerFlip === 1) {
        note('BOTH ROWS ASK FOR THE SAME SUM', phone ? .78 : .61, phone ? 8.5 : 11);
        note('CORNER ONLY · TWO EQUAL ROWS', phone ? .90 : .80, phone ? 8 : 10);
      }
      break;
    case 'kernel':
      note('THIS CORNER HAS A NONZERO KERNEL', phone ? .52 : .19, phone ? 9 : 11);
      if (motion.kernelTwo > 0) formula('kernel-two', phone ? .65 : .40);
      if (motion.zeroProducts === 1) {
        note('BOTH ROW PRODUCTS ARE ZERO', phone ? .79 : .62);
        note('SINGULAR · THE TWO-BY-TWO EXAMPLE', phone ? .91 : .81, phone ? 8 : 10);
      }
      break;
    case 'invertible':
      note('RESTORING THE ORIGINAL CORNER SIGN', phone ? .51 : .14, phone ? 8.5 : 11);
      if (motion.cornerRestore === 1) {
        formula('determinant-two', phone ? .58 : .29);
        note('THIS CORNER IS INVERTIBLE', phone ? .64 : .40, phone ? 8 : 10);
      }
      if (motion.equations > 0) {
        formula('equation-one', phone ? .73 : .53);
        formula('equation-two', phone ? .82 : .66);
      }
      note('THE SIX-BY-SIX EXAMPLE IS SEPARATE', phone ? .93 : .91, phone ? 8 : 10);
      break;
    case 'lowerBound':
      formula('lower-bound', phone ? .55 : .24);
      note('ELEMENTARY EQUAL-ROW EVENT', phone ? .75 : .42, phone ? 8.5 : 11);
      if (motion.lowerBound > 0) formula('six-bound', phone ? .84 : .61);
      note('SPECIFIED TWO ROWS · n ≥ 2', phone ? .94 : .92, phone ? 8.5 : 11, true);
      break;
    case 'equalRows':
      note(motion.restoreRows > 0 ? 'RESTORING ROW 2 AND COLUMN 2' : 'WHAT IF ROWS 1 AND 2 AGREE?', phone ? .52 : .16, phone ? 9 : 11);
      note('ROW AND MATCHING COLUMN CHANGE TOGETHER', phone ? .58 : .30, phone ? 8 : 10);
      if (motion.pairFactors > 0 && motion.bruteCounts === 0) note(`${size - 2} OUTER PAIRS: EACH 1/2 · CORNER: 1/4`, phone ? .77 : .46, phone ? 9 : 12, true);
      if (motion.product > 0 && motion.bruteCounts === 0) formula('row-product', phone ? .855 : .61);
      if (motion.bruteCounts > 0) note('EXACT ROW-PAIR CHECKS: n=3,4,5', phone ? .95 : .93, phone ? 7.5 : 9);
      break;
    case 'beyondPairs':
      if (motion.countsRetire === 0) {
        note('NO EQUAL OR OPPOSITE ROW PAIR', phone ? .53 : .16, phone ? 8.5 : 11);
        if (motion.sixProducts === 1) note(`${size} ZERO ROW PRODUCTS · STILL SINGULAR`, phone ? .59 : .32, phone ? 9 : 12, true);
        note('EXACT COUNTS · SMALL n ONLY', .94, phone ? 8.5 : 11, true);
      }
      break;
    case 'fair':
      note('CLAIMED · FAIR SYMMETRIC SIGNS', phone ? .275 : .10, phone ? 8.5 : 11, false, true);
      if (motion.fairClaim > 0) {
        formula('fair-probability', phone ? .335 : .24);
        formula('fair-rate', phone ? .405 : .37);
      }
      if (motion.fairScope > 0) {
        note('REAL SYMMETRIC · INDEPENDENT FAIR SIGNS', phone ? .55 : .50, phone ? 8.5 : 11, false, true);
        note('ON AND ABOVE THE DIAGONAL, INCLUDING IT', phone ? .62 : .61, phone ? 8 : 10, false, true);
        note('EXPONENTIAL RATE ONLY', phone ? .72 : .72, phone ? 9 : 12, false, true);
        note('THE LEADING FACTOR IS NOT DETERMINED', phone ? .80 : .91, phone ? 8 : 10);
        note('SMALL n ARE NOT THE LIMIT', phone ? .88 : .96, phone ? 8.5 : 10, true);
      }
      break;
    case 'biased':
      laterClaims();
      if (motion.biasAgreement > 0 && motion.biasClaim === 0) {
        formula('pair-agreement', phone ? .60 : .47);
        formula('bias-example', phone ? .74 : .63);
        note('TWO COINS WITH THE SAME FIXED BIAS', phone ? .84 : .92, phone ? 8 : 10);
      }
      if (motion.biasClaim > 0) note('Q ILLUSTRATES A RATE, NOT A FAILURE PERCENTAGE', phone ? .93 : .92, phone ? 7.5 : 9);
      break;
    case 'review':
      laterClaims();
      if (motion.unreviewed > 0) note('UNREVIEWED', phone ? .92 : .92, phone ? 10 : 13);
      if (motion.reviewDate > 0) note('CHECKED 7 NOVEMBER 2026', .97, phone ? 8.5 : 11);
      break;
    case 'catalogue':
      laterClaims();
      note('UNREVIEWED · 7 NOVEMBER 2026', .90, phone ? 8 : 10);
      if (motion.catalogue > 0) {
        note('LEAN CATALOGUE: NONE', .935, phone ? 8.5 : 11);
        note('NO RELEASE PROOF REPLAY', .97, phone ? 8 : 10);
      }
      break;
  }
}

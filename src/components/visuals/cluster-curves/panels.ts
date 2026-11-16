import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import type { buildClusterCurvesModel } from './math';
import { motionAt } from './story';

type Model = ReturnType<typeof buildClusterCurvesModel>;

export function drawClusterCurvesPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, model: Model): void {
  const phone = w < PHONE_STAGE_WIDTH;
  const motion = motionAt(time);
  const chart = motion.thumbnails > 0;
  const center = phone ? .5 : .75;
  const panelWidth = phone ? .93 : .42;

  function note(value: string, x: number, y: number, width = panelWidth, math = false, size = phone ? 8.5 : 11): void {
    drawWrappedText(ctx, value, w * x, h * y, w * width, { size, family: math ? 'math' : 'type', color: tones.ink, paper: tones.paper });
  }

  function formula(id: string, x: number, y: number): void {
    labels.place(id, w * x, h * y);
  }

  if (!chart) {
    note('FREE BOUNDARY · FINITE TOY · 24 × 24', phone ? .5 : .26, phone ? .005 : .025, phone ? .95 : .49, false, phone ? 7.5 : 10);
  } else {
    note('PARAMETER FORMULA · NOT A SIMULATED LIMIT', .52, .018, .93, false, phone ? 8 : 11);
  }

  switch (motion.scene) {
    case 'grid':
      note(motion.edges < 1 ? 'BUILDING THE q = 1 SAMPLE' : '545 OPEN EDGES · 83 CLUSTERS', center, phone ? .61 : .23, undefined, false, phone ? 9 : 13);
      formula('cluster-weight', center, phone ? .72 : .39);
      note('CLUSTER SIZE SETS THE DOT SIZE', center, phone ? .79 : .54);
      formula('edge-probability', center, phone ? .89 : .72);
      break;
    case 'models':
      if (phone) {
        note('RETAINED SAMPLES', .5, .61, .91, false, 9);
        for (const [index, sample] of model.samples.entries()) {
          if (sample.q === 2 && motion.q2Enter < 1) continue;
          if (sample.q === 3 && motion.q3Enter < 1) continue;

          note(`q=${sample.q} · ${sample.clusterCount} CLUSTERS · ${sample.openEdgeCount} OPEN`, .5, .66 + index * .045, .94, false, 8.5);
        }
        note('INDEPENDENT SAMPLES · ONE EACH', .5, .84);
        note('SAME SELF-DUAL FORMULA FOR p', .5, .89);
        formula('edge-probability', .5, .95);
      } else {
        for (const sample of model.samples) {
          if (sample.q === 1 && motion.q1Retreat < 1) continue;
          if (sample.q === 2 && motion.q2Enter < 1) continue;
          if (sample.q === 3 && motion.q3Enter < 1) continue;

          const x = .19 + (sample.q - 1) * .31;
          note(`${sample.clusterCount} CLUSTERS\n${sample.openEdgeCount} OPEN EDGES`, x, .67, .28, false, 12);
        }
        note('INDEPENDENT SAMPLES · ONE EACH', .5, .86, .89);
        formula('edge-probability', .5, .95);
      }
      break;
    case 'loops':
      if (motion.q1Return < 1) {
        note('CARRYING THE SAME SAMPLES', center, .90);
        break;
      }

      note('LOOPS: 135 · 151 · 187', center, phone ? .61 : .32, undefined, false, phone ? 9 : 13);
      note('LONGEST: 892 · 336 · 228 STEPS', center, phone ? .65 : .38, undefined, false, phone ? 8 : 11);
      note('RIBBON BOUNDARIES · LONGEST THICK', center, phone ? .69 : .44);
      note('NOT A DOBRUSHIN INTERFACE', center, phone ? .96 : .83, undefined, false, phone ? 8 : 11);
      if (motion.loopZoom === 0 || motion.loopReturn === 1) {
        note('SAME LOOK AT EVERY SCALE:\nPREDICTED, NOT SHOWN BY ONE SAMPLE', center, phone ? .79 : .59);
      }
      break;
    case 'parameter':
      if (motion.thumbnails === 1) {
        formula('sle-family', .52, .12);
        note('SAMPLES LOCATED BY q', .52, .75, .9);
        note('ONE PARAMETER FOR EACH q', .52, .83, .9);
      }
      break;
    case 'formula':
      formula('kappa-formula', .52, .12);
      if (motion.kappaReadouts > 0) {
        formula('q0-limit', phone ? .59 : .36, phone ? .23 : .18);
        formula('kappa-one', phone ? .27 : .23, .75);
        formula('kappa-two', phone ? .73 : .45, .75);
        formula('kappa-three', phone ? .27 : .67, phone ? .84 : .75);
        formula('kappa-four', phone ? .73 : .86, phone ? .84 : .75);
        note('FROM THE FORMULA', .52, phone ? .94 : .89, .9);
      }
      break;
    case 'humanProofs':
      formula('kappa-formula', .52, .12);
      if (motion.triangularProof > 0) note('△  q = 1: TRIANGULAR SITE ONLY · 2001', .52, .73, .93, true, phone ? 10 : 14);
      if (motion.isingProof > 0) note('○  q = 2: FK-ISING · INTERFACE 2014', .52, phone ? .79 : .80, .93, true, phone ? 10 : 14);
      if (motion.predictedDash > 0) note('2010: ISING OBSERVABLE\nDASHED CURVE: PREDICTED', .52, phone ? .86 : .88, .93);
      break;
    case 'openProblem':
      formula('kappa-formula', .52, .12);
      note('△ TRIANGULAR SITE · ○ FK-ISING', .52, .73, .94, true, phone ? 10 : 14);
      if (motion.squareOpen > 0) note('□ SQUARE-LATTICE q = 1\nOPEN BEFORE 2026', .52, phone ? .80 : .81, .94, true, phone ? 11 : 15);
      if (motion.openProblem > 0) note('ONE FINITE SAMPLE DOES NOT CHECK A LIMIT', .52, phone ? .92 : .94, .95, false, phone ? 8 : 10);
      break;
    case 'claim':
    case 'review':
      formula('kappa-formula', .52, .12);
      note('△ TRIANGULAR SITE · ○ FK-ISING', .56, .19, .79, true, phone ? 9 : 12);
      if (motion.claimScope > 0) {
        note('CLAIMED · SQUARE-LATTICE LIMITS', .52, .73, .94, false, phone ? 9 : 12);
        formula('sle-scope', phone ? .50 : .29, phone ? .80 : .81);
        formula('cle-scope', phone ? .50 : .75, phone ? .86 : .81);
        note('q < 1: SMOOTH DOMAINS', .52, phone ? .90 : .86, .94, true, phone ? 9 : 12);
      }
      if (motion.scene === 'claim' && motion.qRings > 0) {
        note('RINGS MARK q, NOT THESE SAMPLES\nq = 0 IS A LIMIT · NOTHING FOR q > 4', .52, phone ? .94 : .90, .95, true, phone ? 9 : 12);
      }
      if (motion.scene === 'review' && motion.ledger > 0) {
        note('UNREVIEWED · 20 OCTOBER 2026', .52, phone ? .94 : .92, .95, false, phone ? 9 : 13);
        note('MACHINE CHECK: NONE', .52, phone ? .98 : .97, .95, false, phone ? 8 : 11);
      }
      break;
  }
}

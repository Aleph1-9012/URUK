import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import type { ClosingUpModel } from './math';
import { motionAt } from './story';

export function layout(w: number, h: number) {
  const phone = w < PHONE_STAGE_WIDTH;
  const compact = !phone && w < 760;
  const sphere = { cx: (phone ? .5 : compact ? .27 : .29) * w, cy: (phone ? .23 : .48) * h, radius: Math.min((phone ? .42 : compact ? .22 : .25) * w, (phone ? .19 : compact ? .34 : .36) * h) };

  return {
    phone,
    sphere,
    panel: { center: phone ? .5 : .75, width: phone ? .94 : .46 },
    text: { top: (phone ? .48 : .06) * h, toyY: sphere.cy + 1.13 * sphere.radius + (phone ? 10 : 14) },
  };
}

export function drawClosingUpPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, model: ClosingUpModel): void {
  const page = layout(w, h);
  const { phone } = page;
  const motion = motionAt(time);

  function note(value: string, y: number, size = phone ? 9 : 11, blue = false): void {
    drawWrappedText(ctx, value, w * page.panel.center, h * y, w * page.panel.width, {
      size,
      color: blue ? tones.blue : tones.ink,
      paper: tones.paper,
    });
  }

  function formula(id: string, y: number): void {
    labels.place(id, w * page.panel.center, h * y);
  }

  function compactClaim(): void {
    note('CLAIMED · HIGHER SPHERES', phone ? .49 : .10, phone ? 9 : 12, true);
    formula('new-dimensions', phone ? .55 : .23);
    note('PRIME GEODESICS · PAIRWISE DISTINCT IMAGES', phone ? .61 : .35, phone ? 8 : 10, true);
    note('TWO-SPHERE CASE: CLASSICAL INPUT', phone ? .69 : .47, phone ? 8.5 : 10);
  }

  if (motion.toyTag > 0) {
    drawWrappedText(ctx, 'TOY: TWO-SPHERE · CLASSICAL CASE', page.sphere.cx, page.text.toyY, w * (phone ? .94 : .54), {
      size: phone ? 8 : 10,
      color: tones.ink,
      paper: tones.paper,
    });
  }

  switch (motion.scene) {
    case 'round':
      note('ROUND SPHERE · GREAT CIRCLES CLOSE', phone ? .50 : .18);
      note('SIX DIFFERENT IMAGES SHOWN', phone ? .67 : .44);
      note('ONE LAP RETURNS TO THE START', phone ? .85 : .71, phone ? 8.5 : 10);
      break;
    case 'deform':
      note('TOY: A TRIAXIAL ELLIPSOID', phone ? .51 : .16);
      note('SEMI-AXES 1, 0.8, 0.6', phone ? .66 : .38);
      note('INTERMEDIATE CURVES ARE A DISPLAY MORPH', phone ? .82 : .62, phone ? 8 : 10);
      note('SETTLED GEODESICS ARE INTEGRATED LIVE', phone ? .94 : .84, phone ? 8 : 10);
      break;
    case 'principal':
      note('THREE PRINCIPAL ELLIPSES CLOSE', phone ? .50 : .12);
      for (const [index, entry] of model.principal.entries()) note(`${entry.name.toUpperCase()} PLANE · PERIMETER ${entry.perimeter.toFixed(4)}`, (phone ? .60 : .28) + index * (phone ? .09 : .16), phone ? 9 : 12);
      note('BIRKHOFF 1917: AT LEAST ONE ALWAYS CLOSES', phone ? .92 : .84, phone ? 8 : 10);
      break;
    case 'generic':
      note('ONE FINITE NUMERICAL TRACE', phone ? .50 : .12);
      note(`ARC-LENGTH WINDOW ${model.generic.exclusionLength.toFixed(3)} TO ${model.generic.path.length.toFixed(3)}`, phone ? .62 : .32, phone ? 8.5 : 11);
      if (motion.generic === 1) note(`MIN SAMPLED POSITION DISTANCE: ${model.generic.closestReturn.toFixed(3)}`, phone ? .75 : .53, phone ? 8 : 10);
      note('AFTER THE INITIAL EXCLUSION · NOT A NONCLOSURE PROOF', phone ? .90 : .78, phone ? 8 : 10);
      break;
    case 'closed':
      note('CLOSED GEODESIC', phone ? .52 : .18, phone ? 10 : 13);
      note('NONCONSTANT AND PERIODIC', phone ? .70 : .45);
      note('THE PRINCIPAL ELLIPSE STAYS', phone ? .88 : .72, phone ? 8.5 : 10);
      break;
    case 'prime':
      note('ONCE ROUND: PRIME', phone ? .52 : .16, phone ? 10 : 13);
      if (motion.secondLap > 0) note('TWICE ROUND: A REPEAT, NOT PRIME', phone ? .68 : .40);
      note('THE SECOND LAP USES THE SAME IMAGE', phone ? .84 : .68, phone ? 8.5 : 10);
      break;
    case 'sameImage':
      note('ONE GEOMETRIC IMAGE', phone ? .50 : .12, phone ? 10 : 13);
      if (motion.shiftedStart > 0) note('ANOTHER STARTING POINT', phone ? .62 : .32);
      if (motion.reverse > 0) note('REVERSED DIRECTION', phone ? .73 : .50);
      if (motion.repeat > 0) note('A REPEATED TRAVERSAL', phone ? .84 : .68);
      note('NONE OF THESE CREATES A NEW IMAGE', phone ? .95 : .86, phone ? 8 : 10);
      break;
    case 'classical':
      note('TWO-SPHERE: CLASSICAL', phone ? .50 : .12, phone ? 9 : 12);
      formula('classical-dimension', phone ? .60 : .30);
      note('FRANKS, BANGERT, HINGSTON · AROUND 1992', phone ? .72 : .50, phone ? 8.5 : 11);
      note(motion.relax < 1 ? 'DISPLAY MORPH · ENDPOINT METRICS ONLY' : 'INPUT TO THE PAPER · NOT NEW WORK', phone ? .87 : .74, phone ? 8.5 : 10);
      break;
    case 'claim':
      if (motion.claim > 0) {
        note('CLAIMED · HIGHER SPHERES', phone ? .49 : .08, phone ? 9 : 12, true);
        formula('new-dimensions', phone ? .55 : .18);
        note('EVERY SMOOTH RIEMANNIAN METRIC', phone ? .61 : .29, phone ? 8.5 : 11, true);
        note('INFINITELY MANY PRIME CLOSED GEODESICS', phone ? .67 : .40, phone ? 8 : 10, true);
        note('PAIRWISE DISTINCT IMAGES', phone ? .725 : .51, phone ? 8.5 : 11, true);
        note('TWO-SPHERE CASE: CLASSICAL INPUT', phone ? .78 : .61, phone ? 8 : 10);
      }
      if (motion.extensions > 0) {
        note('ALSO CLOSED MANIFOLDS FINITELY COVERED BY A SPHERE', phone ? .84 : .72, phone ? 7.5 : 9, true);
        note('EVERY CLOSED THREE-MANIFOLD', phone ? .90 : .83, phone ? 8 : 10, true);
      }
      note('HIGHER-DIMENSIONAL SPHERES ARE NOT DRAWN', phone ? .96 : .94, phone ? 8 : 9);
      break;
    case 'review':
      compactClaim();
      if (motion.unreviewed > 0) note('UNREVIEWED · NO PUBLIC PROOF CHECK', phone ? .77 : .63, phone ? 8 : 10);
      if (motion.reviewDate > 0) note('AS OF 18 OCTOBER 2026', phone ? .89 : .83, phone ? 8.5 : 11);
      break;
    case 'ledger':
      compactClaim();
      note('UNREVIEWED · 18 OCTOBER 2026', phone ? .77 : .61, phone ? 8 : 10);
      if (motion.ledger > 0) {
        note('PINNED RELEASE: NO FAMILY LEAN SCOPE NOTE', phone ? .84 : .74, phone ? 8 : 10);
        note('NO COMPARATOR STATEMENT IN THAT RELEASE', phone ? .90 : .85, phone ? 8 : 10);
        note('NO PROOF REPLAY PERFORMED HERE', phone ? .96 : .95, phone ? 8 : 10);
      }
      break;
  }
}

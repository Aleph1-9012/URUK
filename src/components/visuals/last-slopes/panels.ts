import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import type { LastSlopesModel } from './math';
import { motionAt } from './story';

export function layout(w: number, h: number) {
  const phone = w < PHONE_STAGE_WIDTH;

  return {
    phone,
    guide: { cx: (phone ? .5 : .26) * w, cy: (phone ? .23 : .37) * h, radius: Math.min((phone ? .42 : .22) * w, (phone ? .19 : .30) * h) },
    glyph: { cx: (phone ? .5 : .74) * w, cy: (phone ? .54 : .28) * h, width: (phone ? .5 : .32) * w, height: (phone ? .14 : .27) * h },
    text: { glyphHeadingY: (phone ? .46 : .09) * h, fractionY: (phone ? .64 : .46) * h, tagsTop: (phone ? .69 : .54) * h, toyY: .975 * h },
    panel: { center: phone ? .5 : .74, width: phone ? .94 : .46 },
  };
}

export function drawLastSlopesPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, model: LastSlopesModel): void {
  const page = layout(w, h);
  const { phone } = page;
  const motion = motionAt(time);

  function note(value: string, y: number, size = phone ? 9 : 11): void {
    drawWrappedText(ctx, value, w * page.panel.center, h * y, w * page.panel.width, { size, color: tones.ink, paper: tones.paper });
  }

  function formula(id: string, y: number): void {
    labels.place(id, w * page.panel.center, h * y);
  }

  if (motion.slopeOne > 0) {
    drawWrappedText(ctx, 'ABSTRACT BOUNDARY COORDINATES', page.glyph.cx, page.text.glyphHeadingY, page.glyph.width * 1.7, {
      size: phone ? 8 : 10,
      color: tones.ink,
      paper: tones.paper,
    });
  }

  if (motion.window > 0) {
    drawWrappedText(ctx, 'TOY: WINDOW, NOT A KNOT', w * .5, page.text.toyY, w * .94, { size: phone ? 8.5 : 11, color: tones.ink, paper: tones.paper });
  }

  switch (motion.scene) {
    case 'surgery':
      note('TREFOIL · GENUS ONE · MECHANICS ONLY', phone ? .72 : .55, phone ? 8.5 : 11);
      note('DRILLING AND RE-GLUING ARE SCHEMATIC', phone ? .84 : .72, phone ? 8.5 : 10);
      note('THE GUIDE MARKS RATIONAL DIRECTIONS', .94, phone ? 8 : 10);
      break;
    case 'slopes':
      note('SLOPE ENDPOINT: A PRIMITIVE CLOSED CURVE', phone ? .70 : .56, phone ? 8.5 : 11);
      formula('slope-class', phone ? .79 : .70);
      note('MARKER TRAVEL IS GRAPHIC · ENDPOINT WINDINGS ARE INTEGER', phone ? .91 : .88, phone ? 8 : 10);
      break;
    case 'meridian':
      formula('infinity-surgery', phone ? .72 : .57);
      note('MERIDIAN ALLOWED · GIVES BACK THE THREE-SPHERE', phone ? .81 : .70, phone ? 8 : 10);
      note('GORDON-LUECKE 1989: NO DIFFERENT SLOPE DOES', phone ? .92 : .86, phone ? 8 : 10);
      break;
    case 'question':
      note('TWO SLOPES · THE SAME ORIENTED SPACE?', phone ? .70 : .55, phone ? 8.5 : 11);
      formula('comparison', phone ? .80 : .70);
      note('THE HOMEOMORPHISM MAY BE ARBITRARY', phone ? .92 : .88, phone ? 8.5 : 10);
      break;
    case 'cosmetic':
      note('PURELY COSMETIC', phone ? .70 : .55, phone ? 10 : 13);
      note('DISTINCT SLOPES · SAME KNOT', phone ? .80 : .70);
      note('ORIENTATION-PRESERVING HOMEOMORPHISM', phone ? .92 : .88, phone ? 8 : 10);
      break;
    case 'niWu':
      note(`NI-WU 2015 · REDUCED FRACTIONS WITH BOUND ${model.bound}`, phone ? .70 : .55, phone ? 8 : 10);
      formula('ni-wu-condition', phone ? .79 : .69);
      if (motion.niWu === 1) note(`${model.counts.window} TO ${model.counts.niWu} OF THE WINDOW SHOWN`, phone ? .90 : .85, phone ? 8.5 : 11);
      break;
    case 'hanselman':
      note('HANSELMAN 2023 · REMAINING FORMS', phone ? .70 : .54, phone ? 8.5 : 11);
      formula('hanselman-forms', phone ? .78 : .67);
      note('MAGNITUDE TWO ONLY IN GENUS TWO', phone ? .85 : .78, phone ? 8 : 10);
      if (motion.hanselman === 1) note(`${model.counts.niWu} TO ${model.counts.hanselman} OF THE WINDOW SHOWN`, phone ? .92 : .90, phone ? 8.5 : 11);
      break;
    case 'lastPair':
      note('DAEMI, LIDMAN, MILLER EISMEIER', phone ? .69 : .53, phone ? 8 : 10);
      note('UNIT-FRACTION PAIRS EXCLUDED', phone ? .75 : .64, phone ? 8.5 : 11);
      formula('last-slopes', phone ? .82 : .75);
      if (motion.instanton === 1) note(`${model.counts.hanselman} TO ${model.counts.daemiLidmanMillerEismeier} OF THE WINDOW · GENUS TWO CASE`, phone ? .91 : .89, phone ? 8 : 10);
      break;
    case 'claim':
      note('CLAIMED · LAST GENUS-TWO CASE', phone ? .69 : .54, phone ? 8.5 : 11);
      formula('claim-implication', phone ? .755 : .64);
      note('ALL SMOOTH NONTRIVIAL KNOTS IN THE THREE-SPHERE', phone ? .81 : .73, phone ? 7.5 : 10);
      note('ALL SLOPES, INCLUDING THE MERIDIAN', phone ? .86 : .80, phone ? 8 : 10);
      note('ARBITRARY ORIENTATION-PRESERVING HOMEOMORPHISM', phone ? .905 : .87, phone ? 7.5 : 9);
      note('NEW PROOF: GENUS TWO, MINUS TWO AND TWO', phone ? .945 : .94, phone ? 7.5 : 9);
      break;
    case 'review':
      note('CLAIMED EXCLUSION · NOT A TOY COMPUTATION', phone ? .70 : .54, phone ? 8 : 10);
      note('HUMAN REDUCTION TAKEN AS GIVEN', phone ? .78 : .66, phone ? 8.5 : 10);
      if (motion.unreviewed > 0) note('UNREVIEWED · NO PUBLIC PROOF CHECK', phone ? .86 : .79, phone ? 8 : 10);
      if (motion.reviewDate > 0) note('AS OF 18 OCTOBER 2026', phone ? .93 : .91, phone ? 8.5 : 10);
      break;
    case 'ledger':
      note('CLAIMED EXCLUSION · NOT A TOY COMPUTATION', phone ? .69 : .54, phone ? 8 : 10);
      note('UNREVIEWED · 18 OCTOBER 2026', phone ? .76 : .66, phone ? 8 : 10);
      if (motion.ledger > 0) {
        note('PINNED RELEASE: NO FAMILY LEAN SCOPE NOTE', phone ? .83 : .76, phone ? 8 : 10);
        note('NO COMPARATOR STATEMENT IN THAT RELEASE', phone ? .90 : .86, phone ? 8 : 10);
        note('NO PROOF REPLAY PERFORMED HERE', phone ? .94 : .93, phone ? 8 : 10);
      }
      break;
  }
}

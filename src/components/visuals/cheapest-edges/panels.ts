import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import type { CheapestEdgesModel } from './math';
import { motionAt } from './story';

export function layout(w: number, h: number) {
  const phone = w < PHONE_STAGE_WIDTH;
  const stacked = w < 760;
  const image = stacked
    ? { x: w * (phone ? .07 : .11), y: h * (phone ? .06 : .04), width: w * (phone ? .86 : .78), height: h * (phone ? .28 : .36) }
    : { x: .04 * w, y: .10 * h, width: .51 * w, height: .60 * h };

  return {
    phone,
    stacked,
    image,
    plot: { left: (stacked ? .10 : .60) * w, right: (stacked ? .90 : .96) * w, top: (phone ? .50 : stacked ? .46 : .13) * h, bottom: (phone ? .70 : stacked ? .69 : .53) * h },
    panel: { center: stacked ? .5 : .78, width: stacked ? .94 : .36 },
    text: { top: (stacked ? .46 : .08) * h, imageCaption: image.y + image.height + (phone ? 6 : 15) },
  };
}

export function drawCheapestEdgesPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, model: CheapestEdgesModel): void {
  const page = layout(w, h);
  const { phone, stacked } = page;
  const motion = motionAt(time);
  const panelTop = page.text.top / h;

  function row(part: number): number {
    return panelTop + (.94 - panelTop) * part;
  }

  function note(value: string, at: number, size = phone ? 8.5 : 10, math = false): void {
    drawWrappedText(ctx, value, w * page.panel.center, h * at, w * page.panel.width, {
      size,
      family: math ? 'math' : 'type',
      color: tones.ink,
      paper: tones.paper,
    });
  }

  function formula(id: string, at: number): void {
    labels.place(id, w * page.panel.center, h * at);
  }

  function schematic(): void {
    const caption = motion.scene === 'claim' && motion.claim < 1 ? 'LOCAL WINDOW OF SUPPOSED H · REST UNSPECIFIED' : 'SCHEMATIC IMAGE AND EDGE SET K';
    const above = stacked && !phone && ['energy', 'localTypes', 'tip'].includes(motion.scene);
    drawWrappedText(ctx, caption, page.image.x + page.image.width / 2, above ? page.image.y - 14 : page.text.imageCaption, page.image.width, {
      size: phone ? 8 : 10,
      color: tones.ink,
      paper: tones.paper,
    });
  }

  if (motion.scene !== 'blowUp' && motion.scene !== 'twoProofs') schematic();

  switch (motion.scene) {
    case 'image':
      note('MUMFORD–SHAH · IMAGE SEGMENTATION · 1989', row(.10), phone ? 8.5 : 11);
      note('APPROXIMATE THE PICTURE, ALLOW JUMPS AT EDGES', row(.46));
      note('THIS PICTURE IS NOT A COMPUTED MINIMIZER', row(.86), phone ? 8 : 10);
      break;
    case 'energy': {
      const none = model.toy.noEdge;
      const middle = model.toy.midpoint;
      const misplaced = model.toy.misplaced;
      if (phone || !stacked) note('AN EDGE IS ONE POINT · ITS COST IS 1', stacked ? .405 : .06, phone ? 8 : 10);
      note(`NO EDGE · ROUGHNESS ${none.roughness.toFixed(2)} + DISTANCE ${none.distance.toFixed(2)} = ${none.total.toFixed(2)}`, stacked ? .745 : .60, phone ? 9 : 12, true);

      if (motion.cut > 0) note(`EDGE AT 0.50 · ROUGHNESS ${middle.roughness.toFixed(0)} + EDGE ${middle.length.toFixed(0)} +${stacked && !phone ? ' ' : '\n'}DISTANCE ${middle.distance.toFixed(0)} = ${middle.total.toFixed(2)}`, stacked ? .815 : .71, phone ? 9 : 12, true);
      if (motion.scan > 0) note(`EDGE AT 0.05 · TOTAL ${misplaced.total.toFixed(3)}`, stacked ? .885 : .81, phone ? 9 : 12, true);

      note(`${model.toy.cells}-CELL 1D TOY · NOT A PLANAR MINIMIZER`, stacked ? .945 : .91, phone ? 8 : 10);
      break;
    }
    case 'localTypes':
      if (phone || !stacked) note('ARC · FREE END · TRIPLE JUNCTION', stacked ? .405 : .06, phone ? 8 : 10);

      if (motion.angles > 0) note(model.triple.angles.map(value => `${value.toFixed(2)}°`).join(' · '), stacked ? .745 : .60, phone ? 11 : 14, true);

      if (motion.network > 0) {
        note(`NETWORK ${model.triple.networkLength.toFixed(3)} · TWO SIDES ${model.triple.twoSidesLength.toFixed(3)}`, stacked ? .82 : .73, phone ? 9 : 12, true);
        note('SHORTEST NETWORK · LENGTH TERM ONLY', stacked ? .89 : .84, phone ? 8 : 10);
      }

      note('A TOY NETWORK, NOT AN IMAGE MINIMIZER', stacked ? .95 : .94, phone ? 8 : 10);
      break;
    case 'blowUp':
      note('HYPOTHETICAL LOCAL WINDOW · NOT COMPUTED', row(.12), phone ? 8.5 : 11);
      note('ASSUME THE GLOBAL COMPLEMENT IS CONNECTED', row(.43), phone ? 9 : 11);
      note('ISOLATED BOUNDED ARC BESIDE A HALF-LINE', row(.73), phone ? 8 : 10);
      note('REST OF H UNSPECIFIED', row(.94));
      break;
    case 'twoProofs':
      note('TWO PROOFS · WITHIN TWO DAYS', row(.12), phone ? 9 : 11);
      note('SEPTEMBER 2026 · DEANGELIS AND OPENAI', row(.45));
      note('NEITHER HAD A PUBLIC SPECIALIST CHECK', row(.81), phone ? 8 : 10);
      break;
    case 'claim':
      note('CLAIMED · PLANAR INTERIOR CLASSIFICATION', row(.04), phone ? 8 : 10);
      note('REDUCED ABSOLUTE MINIMIZER', row(.23));
      formula('claim-domain', row(.43));
      formula('claim-data', row(.59));
      formula('claim-arcs', row(.75));
      note('INTERIOR ONLY · NO BOUNDARY CONCLUSION', row(.93), phone ? 8 : 10);
      break;
    case 'components':
      note('CLAIMED · GLOBAL COMPONENTS MEETING U', row(.06), phone ? 8 : 10);
      formula('interior-set', row(.27));
      note('COMPONENTS OF K, NOT COMPONENTS OF K ∩ U', row(.49), phone ? 8 : 10, true);
      note('THE DRAWN COUNT IS SCHEMATIC', row(.72));
      note('NOTHING ASSERTED AT THE BOUNDARY', row(.92), phone ? 8 : 10);
      break;
    case 'tip':
      if (stacked && !phone) {
        labels.place('tip-gradient', .30 * w, .80 * h);
        labels.place('weak-integrability', .68 * w, .80 * h);
      } else {
        formula('tip-gradient', phone ? .445 : (page.plot.top - 26) / h);
        labels.place('tip-field', w * (phone ? .26 : page.panel.center), h * (phone ? .80 : .62));
        labels.place('weak-integrability', w * (phone ? .73 : page.panel.center), h * (phone ? .80 : .74));
      }
      note('WEAK L⁴ DOES NOT MEAN STRONG L⁴ AT THE TIP', stacked ? .895 : .84, phone ? 8 : 10, true);
      note('AMPLITUDE 1 MODEL · NOT A COMPUTED MINIMIZER', stacked ? .95 : .94, phone ? 8 : 10);
      break;
    case 'ledger':
      note('CLAIMED INTERIOR RESULT', row(.04), phone ? 9 : 11);
      note('UNREVIEWED · 20 OCTOBER 2026', row(.25));

      if (motion.ledger > 0) {
        note('NO CHECK REPORTED IN THE HISTORICAL ARTICLE', row(.50), phone ? 8 : 10);
        note('NO RELEASE COMPARATOR OR SCOPE NOTE', row(.69));
        note('HISTORICAL REVIEW DATE · NO NEW PROOF REPLAY', row(.92), phone ? 8 : 10);
      }

      break;
  }
}

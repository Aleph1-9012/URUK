import { drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import type { buildArrowGridModel } from './math';
import { motionAt } from './story';

type Model = ReturnType<typeof buildArrowGridModel>;

export function drawArrowGridPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, model: Model): void {
  const phone = w < PHONE_STAGE_WIDTH;
  const compact = !phone && w < 760;
  const motion = motionAt(time);
  const chart = motion.gridInset > 0;
  const center = phone ? .5 : .77;

  function note(value: string, x: number, y: number, width = phone ? .91 : .40, math = false, blue = false, size = phone ? 8.5 : 11): void {
    drawWrappedText(ctx, value, w * x, h * y, w * width, { size, family: math ? 'math' : 'type', color: blue ? tones.blue : tones.ink, paper: tones.paper });
  }

  function formula(id: string, x: number, y: number): void {
    labels.place(id, w * x, h * y);
  }

  if (!chart) {
    note('PERIODIC TOY · 20 × 20 · ONE SAMPLE AT EACH b', phone ? .5 : .27, phone ? .025 : .035, phone ? .95 : .48, false, false, phone ? 8 : 10);
    const turning = (motion.align > 0 && motion.align < 1) || (motion.cold > 0 && motion.cold < 1) || (motion.warm > 0 && motion.warm < 1) || (motion.hot > 0 && motion.hot < 1);
    const assembling = motion.populate < 1 || motion.align < 1;
    const beta = motion.hot === 1 ? model.hot.beta : motion.warm === 1 ? model.middle.beta : motion.cold === 1 ? model.cold.beta : model.middle.beta;
    const description = assembling ? 'BUILDING THE GRID · TARGET b=0.9' : turning ? 'TURNING BETWEEN STORED SAMPLES' : `b = ${beta}`;
    note(description, center, phone ? .52 : .12, phone ? .91 : .40, !turning && !assembling, false, phone ? 12 : 18);
  } else {
    note('FORMULA CURVES · SCHEMATIC', phone ? .65 : .52, phone ? .035 : .045, phone ? .55 : .75, false, false, phone ? 8 : 11);
    if (motion.gridInset === 1) note('TOY', phone ? .18 : .24, phone ? .19 : .12, .20, false, false, phone ? 7.5 : 9);
  }

  switch (motion.scene) {
    case 'grid':
      note('NEIGHBOURS PREFER TO AGREE', center, phone ? .65 : .28);
      formula('interaction', center, phone ? .76 : .44);
      note('CHOSEN INVERSE TEMPERATURE\nCRITICAL VALUE NOT COMPUTED', center, phone ? .88 : .64);
      break;
    case 'model':
      note('XY MODEL', center, phone ? .66 : .30, undefined, false, false, phone ? 12 : 18);
      note('CHOSEN b VALUES\nNOT THE UNKNOWN CRITICAL VALUE', center, phone ? .80 : .51);
      note('INDEPENDENT SAMPLES · VISUAL TURNS', center, phone ? .93 : .73, undefined, false, false, phone ? 8 : 10);
      break;
    case 'noOrder':
      note('MERMIN–WAGNER', center, phone ? .64 : .28, undefined, false, false, phone ? 11 : 15);
      note('CITED THEOREM', center, phone ? .76 : .47);
      note('THIS FINITE PICTURE DOES NOT PROVE IT', center, phone ? .90 : .68);
      break;
    case 'memory':
      if (phone) note('ILLUSTRATIVE LINK\nCORRELATION IS AN AVERAGE', .28, .66, .43, false, false, 8);
      else note('ONE ILLUSTRATIVE LINK\nNO CORRELATION ESTIMATED', center, .28);

      note('LOW TEMPERATURE\nPOWER-LAW MEMORY', phone ? .5 : .77, phone ? .89 : .90);
      break;
    case 'vortices': {
      note('FILLED +1', phone ? .18 : .64, phone ? .64 : .30, .25, true);
      note('OPEN −1', phone ? .18 : .90, phone ? .71 : .30, .25, true);
      note('FINAL STORED COUNTS', center, phone ? .83 : .72);

      for (const [index, sample] of model.samples.entries()) {
        const x = phone ? .20 + .30 * index : .64 + .13 * index;
        drawText(ctx, `b=${sample.beta}: ${sample.vortexCount}`, w * x, h * (phone ? .89 : .81), { size: phone ? 10.5 : 13, family: 'math', color: tones.ink, paper: tones.paper });
      }

      note('SMALL GRID · COUNTS ONLY\nNOT A TEST OF THE TRANSITION OR UNBINDING', center, phone ? .95 : .92, undefined, false, false, phone ? 8 : 10);
      break;
    }
    case 'correlation':
      if (motion.axisCarry < 1) {
        note('THE GRID CONTRACTS\nITS BOTTOM ROW BECOMES THE DISTANCE AXIS', center, phone ? .88 : .64);
        break;
      }

      note('AMPLITUDE B = 1\nNOT MEASURED FROM THE GRID', phone ? .65 : .77, phone ? .14 : .16, phone ? .55 : .40, false, false, phone ? 8 : 11);
      formula('correlation-pure', center, phone ? .72 : .36);
      formula('correlation-corrected', center, phone ? .80 : .51);

      if (motion.slopeReadouts > 0) {
        formula('local-slope', center, phone ? .89 : .67);
        const rows = model.correlationReadouts.slice(0, 3);
        const values = rows.map(row => `${row.r === 10000 ? '10⁴' : row.r}: ${row.localSlope.toFixed(3)}`);
        note(phone ? `${values[0]} · ${values[1]}\n${values[2]} · → −¼` : values.join(' · ') + '\n→ −¼', center, phone ? .96 : .84, undefined, true, false, phone ? 10 : 13);
      }

      break;
    case 'length':
      if (motion.lengthAxis < 1) {
        note('THE DISTANCE AXIS BECOMES AN INVERSE-TEMPERATURE AXIS', phone ? .5 : .75, phone ? .87 : .80);
        break;
      }

      formula('length-units', phone ? .65 : .76, phone ? .14 : .20);
      note('ILLUSTRATIVE UNITS\nCRITICAL VALUE NOT COMPUTED', phone ? .65 : .76, phone ? .20 : .255, phone ? .55 : .34, false, false, phone ? 7.5 : 9);
      formula('length-law', phone ? .5 : .76, phone ? .51 : compact ? .78 : .83);

      if (motion.lengthReadouts > 0) {
        note('CHOSEN GAP → ln ξ', phone ? .5 : .76, phone ? .88 : compact ? .85 : .89, undefined, false, false, phone ? 8 : 10);

        for (const [index, row] of model.lengthReadouts.entries()) {
          const x = phone ? .29 + .46 * (index % 2) : compact ? .65 + .23 * (index % 2) : .61 + .10 * index;
          const y = phone ? .92 + .055 * Math.floor(index / 2) : compact ? .90 + .06 * Math.floor(index / 2) : .95;
          drawText(ctx, `${row.delta} → ${row.logXi.toFixed(2)}`, w * x, h * y, { size: phone ? 9 : compact ? 9.5 : 10.5, family: 'math', color: tones.ink, paper: tones.paper });
        }
      }

      break;
    case 'knownPhase':
      formula('length-units', phone ? .65 : .76, phone ? .14 : .20);
      note('ILLUSTRATIVE UNITS\nCRITICAL VALUE NOT COMPUTED', phone ? .65 : .76, phone ? .20 : .255, phone ? .55 : .34, false, false, phone ? 7.5 : 9);
      formula('length-law', phone ? .5 : .76, phone ? .51 : .77);
      note('1981 · LOW-TEMPERATURE PHASE PROVED\nCRITICAL NUMBERS REMAIN PREDICTIONS', phone ? .5 : .5, phone ? .91 : .83, phone ? .91 : .90, false, false, phone ? 8.5 : 12);
      break;
    case 'claim':
    case 'review':
      formula('critical-claim', phone ? .5 : .28, phone ? .51 : .79);
      formula('length-units', phone ? .5 : .76, phone ? .86 : .20);
      note('ILLUSTRATIVE UNITS\nCRITICAL VALUE NOT COMPUTED', phone ? .5 : .76, phone ? .90 : .255, phone ? .91 : .34, false, false, phone ? 7.5 : 9);

      if (!phone) formula('length-general', .76, .79);

      if (motion.scene === 'claim') {
        note('CLAIMED · NEAREST-NEIGHBOUR SQUARE LATTICE\nNOT CHECKED', .5, phone ? .95 : .94, .94, false, true, phone ? 8.5 : 12);
      } else if (motion.ledger > 0) {
        note('UNREVIEWED · 20 OCT 2026\nMACHINE CHECK: NONE', .5, phone ? .95 : .93, .94, false, false, phone ? 9 : 12);
      }

      break;
  }
}

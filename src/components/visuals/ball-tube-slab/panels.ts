import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import type { BallTubeSlabModel } from './math';
import { motionAt } from './story';

export function layout(w: number, h: number) {
  const phone = w < PHONE_STAGE_WIDTH;
  const alternativeSide = phone ? Math.min(.40 * w, .20 * h) : Math.min(.20 * w, .35 * h);
  const alternativeTop = .065 * h;
  const alternatives = [
    { x: phone ? .26 * w - alternativeSide / 2 : .04 * w, y: alternativeTop, side: alternativeSide },
    { x: phone ? .74 * w - alternativeSide / 2 : .27 * w, y: alternativeTop, side: alternativeSide },
  ] as const;

  return {
    phone,
    cell: { x: (phone ? .08 : .06) * w, y: (phone ? .045 : .065) * h, side: Math.min(w * (phone ? .84 : .37), h * (phone ? .38 : .48)) },
    alternatives,
    chart: { left: (phone ? .16 : .56) * w, right: phone ? Math.min(.92 * w, w - 34) : .94 * w, top: (phone ? .53 : .10) * h, bottom: (phone ? .71 : .62) * h, maxPerimeter: 3.2 },
    text: {
      alternativeHeaderY: .015 * h,
      radiusLabelY: phone ? .28 * h : alternativeTop + alternativeSide + 20,
      radiusFormulaY: phone ? .355 * h : alternativeTop + alternativeSide + 45,
      commonAreaY: (phone ? .445 : .59) * h,
      commonNumberY: (phone ? .495 : .655) * h,
      notesY: .74 * h,
    },
  };
}

export function drawBallTubeSlabPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, model: BallTubeSlabModel): void {
  const page = layout(w, h);
  const { phone } = page;
  const motion = motionAt(time);

  function note(value: string, y: number, size = phone ? 9 : 11, x = .5, width = .94): void {
    drawWrappedText(ctx, value, w * x, h * y, w * width, { size, color: tones.ink, paper: tones.paper });
  }

  function formula(id: string, y: number, x = .5): void {
    labels.place(id, w * x, h * y);
  }

  function candidateLegend(): void {
    formula('ball-area', phone ? .12 : .85, phone ? .77 : .19);
    formula('tube-area', phone ? .26 : .85, phone ? .77 : .53);
    formula('slab-area', phone ? .40 : .85, phone ? .77 : .85);
    formula('complement', .925);
    note('THICK INK: LOWEST AMONG THESE THREE ONLY', phone ? .97 : .98, phone ? 8 : 10);
  }

  function claim(): void {
    note('CLAIMED · ALL FINITE-PERIMETER REGIONS', phone ? .775 : .755, phone ? 8.5 : 11);
    note('UNIT CUBIC FLAT THREE-TORUS', phone ? .82 : .81, phone ? 8.5 : 10);
    note('ONLY BALL, WRAPPED TUBE, SLAB OR COMPLEMENT', .865, phone ? 8 : 10);
    note('UP TO ISOMETRY AND NULL SETS', .92, phone ? 8.5 : 10);
    note('ADJACENT TYPES TIE AT THE TWO TRANSITIONS', .97, phone ? 8 : 10);
  }

  if (motion.comparisonCarry > 0) {
    const first = page.alternatives[0];
    const second = page.alternatives[1];
    const leftCenter = first.x + first.side / 2;
    const rightCenter = second.x + second.side / 2;
    drawWrappedText(ctx, 'ALTERNATIVE SECTIONS · SAME SCALE · SCHEMATIC', w * (phone ? .5 : .255), page.text.alternativeHeaderY, w * (phone ? .94 : .48), {
      size: phone ? 7.5 : 9,
      color: tones.ink,
      paper: tones.paper,
    });
    if (motion.comparisonRadii > 0) {
      drawWrappedText(ctx, 'BALL SECTION', leftCenter, page.text.radiusLabelY, first.side + 8, { size: phone ? 8 : 10, color: tones.ink, paper: tones.paper });
      drawWrappedText(ctx, 'TUBE, END-ON', rightCenter, page.text.radiusLabelY, second.side + 8, { size: phone ? 8 : 10, color: tones.ink, paper: tones.paper });
      labels.place('ball-radius', leftCenter, page.text.radiusFormulaY);
      labels.place('tube-radius', rightCenter, page.text.radiusFormulaY);
    }
    if (motion.comparisonReadout > 0) {
      const center = w * (phone ? .5 : .255);
      labels.place('common-area', center, page.text.commonAreaY);
      drawWrappedText(ctx, `BOTH BOUNDARY AREAS: ${model.first.area.toFixed(3)}`, center, page.text.commonNumberY, w * (phone ? .94 : .48), { size: phone ? 8 : 10, color: tones.ink, paper: tones.paper });
    }
  }

  switch (motion.scene) {
    case 'ordinary':
      note('ORDINARY SPACE · SECTION THROUGH A BALL', .77, phone ? 8.5 : 11);
      note('SCHEMATIC SECTION · AREA IS NOT 3D VOLUME', .91, phone ? 8.5 : 10);
      break;
    case 'periodic':
      note('OPPOSITE FACES JOINED', .77);
      note('CELL FACES ADD NO BOUNDARY AREA', .91, phone ? 8.5 : 10);
      break;
    case 'wrapping':
      note('WRAPPED TUBE: NO END CAPS', .76);
      note('SLAB: TWO BOUNDARY SURFACES', .85);
      note('THE SECTION REMAINS SCHEMATIC', .95, phone ? 8.5 : 10);
      break;
    case 'candidates':
      candidateLegend();
      break;
    case 'claim':
      if (motion.claimScope > 0) claim();
      break;
    case 'transitions':
      candidateLegend();
      break;
    case 'alternatives':
      note('EQUAL 3D VOLUME AND BOUNDARY AREA', phone ? .79 : .76, phone ? 8.5 : 11);
      note('DIFFERENT RADII · DIFFERENT SECTION AREAS', phone ? .87 : .85, phone ? 8.5 : 10);
      note('TWO ALTERNATIVES, NOT ONE COMBINED REGION', phone ? .96 : .95, phone ? 8 : 10);
      break;
    case 'review':
      note('CLAIMED FULL PROFILE · CANDIDATE CURVES SHOWN', phone ? .79 : .75, phone ? 8 : 10);
      if (motion.unreviewed > 0) note('UNREVIEWED · NO PUBLIC SPECIALIST VERIFICATION', phone ? .86 : .84, phone ? 8 : 10);
      if (motion.reviewDate > 0) note('SEARCHED 7 NOVEMBER 2026', phone ? .96 : .95, phone ? 8.5 : 10);
      break;
    case 'ledger':
      note('CLAIMED FULL PROFILE AND CLASSIFICATION', phone ? .785 : .745, phone ? 8 : 10);
      note('UNREVIEWED · 7 NOVEMBER 2026', phone ? .825 : .79, phone ? 8 : 10);
      if (motion.ledger > 0) note('FULL PROFILE LINKED · NOT CATALOGUED', phone ? .865 : .835, phone ? 8 : 10);
      if (motion.replayReport > 0) {
        note('LEAN AND NANODA ACCEPTANCE REPORTED', phone ? .90 : .88, phone ? 8 : 10);
        note('10 OCTOBER 2026 · HISTORICAL LEDGER', phone ? .935 : .925, phone ? 8 : 10);
        note('NOT OUR REPLAY OR A SPECIALIST ASSESSMENT', .97, phone ? 7.5 : 9);
      }
      break;
  }
}

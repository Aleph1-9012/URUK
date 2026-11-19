import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import { motionAt } from './story';

export type FlatWallsAudit = {
  flatResidual: number;
  circleResidual: number;
  directionDegrees: number;
};

export function layout(w: number, h: number) {
  const phone = w < PHONE_STAGE_WIDTH;
  const compact = !phone && w < 760;
  const windowSize = phone ? .50 * w : Math.min(.34 * w, .62 * h);
  const cellSize = phone ? .085 * w : Math.min(.085 * w, .14 * h);
  const columns = 8;
  const stripLeft = (phone ? .04 : .05) * w;
  const stripRight = (phone ? .96 : .95) * w;

  return {
    phone,
    compact,
    window: { x: phone ? (w - windowSize) / 2 : .05 * w, y: (phone ? .045 : .10) * h, size: windowSize },
    profile: { left: (phone ? .12 : .57) * w, right: (phone ? .88 : .94) * w, top: (phone ? .57 : .24) * h, bottom: (phone ? .69 : .58) * h },
    strip: { left: stripLeft, right: stripRight, top: (phone ? .13 : .15) * h, cellSize, gap: (stripRight - stripLeft - columns * cellSize) / (columns - 1), columns, rowGap: (phone ? .095 : .06) * h },
    stable: { top: (phone ? .315 : .46) * h, cellSize: phone ? .07 * w : Math.min(.065 * w, .08 * h), gap: (phone ? .045 : .04) * w },
    cone: { left: (phone ? .22 : .61) * w, right: (phone ? .82 : .91) * w, top: (phone ? .40 : .38) * h, bottom: .68 * h },
    panel: { center: .5, width: phone ? .92 : .90 },
    text: { windowCaption: (phone ? .045 : .10) * h + windowSize + (phone ? .035 : .055) * h, profileCaption: (phone ? .75 : .65) * h, stripHeading: .025 * h, historyNotesTop: (phone ? .34 : .43) * h },
  };
}

export function drawFlatWallsPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, audit: FlatWallsAudit): void {
  const page = layout(w, h);
  const { phone } = page;
  const motion = motionAt(time);
  const tagSize = phone ? 9 : 12;

  function note(value: string, y: number, size = tagSize, center = page.panel.center, width = page.panel.width): void {
    drawWrappedText(ctx, value, w * center, h * y, w * width, { size, color: tones.ink, paper: tones.paper });
  }

  function formula(id: string, y: number, center = page.panel.center): void {
    labels.place(id, w * center, h * y);
  }

  function historicalHeading(): void {
    note('INK: BEFORE SEPTEMBER 2026', .025, phone ? 9 : 12);

    if (motion.scene === 'monotone' || motion.scene === 'noExtra' || motion.scene === 'stable' || motion.scene === 'ledger') {
      note('BLUE: OPENAI CLAIM · 26 SEPTEMBER 2026', phone ? .063 : .075, phone ? 8 : 10);
    }

    note('MONOTONE · SCHEMATIC WALL ICONS', phone ? .092 : .11, phone ? 8 : 10);
  }

  function stableHeading(): void {
    note('STABLE · DIMENSIONS 2 TO 6 NOT SHOWN', phone ? .275 : .39, phone ? 8.5 : 11);
    note('8: NON-FLAT STABLE SOLUTIONS EXIST', phone ? .435 : .59, phone ? 8.5 : 11);
  }

  function monotoneClaim(consequences: boolean): void {
    note('CLAIMED · MONOTONE IN DIMENSION EIGHT', phone ? .32 : .43, phone ? 9.5 : 13);
    formula('monotone-domain', phone ? .40 : .51);
    formula('monotone-rise', phone ? .49 : .58);
    note('FLAT WALL AT EVERY POINT', phone ? .56 : .635, phone ? 8.5 : 11);
    formula('flat-wall', phone ? .64 : .70);
    formula('monotone-parameters', phone ? .72 : .77);
    note('ENTIRE SOLUTION · THIS QUARTIC EQUATION ONLY', phone ? .79 : .825, phone ? 8 : 10);
    note('NO ENERGY GROWTH, MINIMIZATION OR END LIMITS ASSUMED', phone ? .86 : .88, phone ? 8.5 : 11);

    if (consequences && motion.consequences > 0) {
      note('ALL THREE CLAIMED AS CONSEQUENCES', phone ? .96 : .955, phone ? 8.5 : 11);
    }
  }

  switch (motion.scene) {
    case 'phases': {
      if (motion.field === 1) labels.place('phase-limits', page.window.x + page.window.size / 2, page.text.windowCaption);

      if (motion.profile > 0) {
        labels.place('profile', (page.profile.left + page.profile.right) / 2, page.text.profileCaption);
        formula('equation', phone ? .84 : .76, phone ? .5 : .755);
        note('PARALLEL LEVEL SETS · ONE FLAT WALL', phone ? .90 : .85, tagSize, phone ? .5 : .755, phone ? .92 : .43);
        note('PHASE VALUES ARE LIMITS AT INFINITY', phone ? .96 : .93, phone ? 8.5 : 10, phone ? .5 : .755, phone ? .92 : .43);
      }

      break;
    }
    case 'flatTest': {
      const center = phone ? .5 : .755;
      const width = phone ? .92 : .43;

      if (motion.circle === 0 || motion.reset === 1) {
        labels.place('flat-wall', page.window.x + page.window.size / 2, page.text.windowCaption);
        labels.place('profile', (page.profile.left + page.profile.right) / 2, page.text.profileCaption);
        note(`DIRECTION ${audit.directionDegrees.toFixed(1)}°`, phone ? .81 : .72, tagSize, center, width);
        note(`MAX RESIDUAL ${audit.flatResidual.toExponential(1)}`, phone ? .88 : .79, tagSize, center, width);
      } else if (motion.reset > 0) {
        note('RESETTING FLAT BEFORE THE DIMENSION STRIP', phone ? .81 : .83, phone ? 10 : 13, center, width);
      } else if (motion.circle === 1) {
        labels.place('circle-wall', page.window.x + page.window.size / 2, page.text.windowCaption);
        note('BENT WALL · NOT A SOLUTION', phone ? .81 : .69, phone ? 10 : 13, center, width);
        note(`RESIDUAL ON THE CIRCLE: ${audit.circleResidual.toFixed(4)}`, phone ? .88 : .76, tagSize, center, width);
        note('CENTRE NOT SMOOTH · NO GLOBAL MONOTONICITY', phone ? .93 : .83, phone ? 8 : 10, center, width);
      } else {
        note('DISPLAY MORPH · BENDING THE SAME WINDOW', phone ? .81 : .69, phone ? 10 : 13, center, width);
      }

      note('FINITE DIFFERENCES · A PICTURE, NOT A PROOF', phone ? .96 : .94, phone ? 8 : 10, center, width);
      break;
    }
    case 'dimensions': {
      if (motion.reset < 1) {
        note('RESETTING FLAT BEFORE THE DIMENSION STRIP', phone ? .77 : .83);
      }

      if (motion.shrink === 1) note('1978 · DE GIORGI · MONOTONE WALLS', .025, phone ? 9 : 12);

      if (motion.cone > 0) {
        note('AREA-MINIMIZING CONE · AMBIENT DIMENSION EIGHT', phone ? .335 : .35, phone ? 8.5 : 11, phone ? .5 : .76, phone ? .92 : .43);
        formula('cone-norms', phone ? .73 : .74, phone ? .5 : .76);
        note('NONLINEAR NORM PROJECTION', phone ? .79 : .43, tagSize, phone ? .5 : .28, phone ? .92 : .48);
        note('NOT A PLANE SLICE · NOT A MINIMAL GRAPH', phone ? .85 : .53, phone ? 8 : 10, phone ? .5 : .28, phone ? .92 : .48);
        note('NOT AN ALLEN-CAHN SOLUTION', phone ? .91 : .64, phone ? 8.5 : 11, phone ? .5 : .28, phone ? .92 : .48);
        note('MINIMAL-GRAPH THRESHOLD: AMBIENT NINE', phone ? .955 : .85, phone ? 8 : 10);
      }

      break;
    }
    case 'history':
      historicalHeading();

      if (motion.proven > 0) note('PROVED: 2 · 1998 / 3 · 2000', phone ? .34 : .43);

      if (motion.conditional > 0) {
        note('4 TO 8 · SAVIN 2009 · EXTRA ASSUMPTION', phone ? .44 : .51, phone ? 8.5 : 11);
        formula('end-limits', phone ? .54 : .61);
        note('HUMAN SEPTEMBER 2026 RESULTS NOT SHOWN', phone ? .65 : .70, phone ? 8 : 10);
      }

      if (motion.counterexample > 0) {
        note('9 AND ABOVE: NON-FLAT MONOTONE SOLUTIONS EXIST', phone ? .77 : .81, phone ? 8.5 : 11);
        note('FLAT WALLS STILL SOLVE THE EQUATION', .93, phone ? 8 : 10);
      }

      break;
    case 'release':
      historicalHeading();
      note('OPENAI · 26 SEPTEMBER 2026', phone ? .39 : .44, phone ? 12 : 18);
      note('CLAIMING THE ENDPOINT: DIMENSION EIGHT', phone ? .52 : .61, phone ? 9 : 12);
      note('HATCHING STILL SHOWS THE EARLIER CONDITION', phone ? .66 : .76, phone ? 8.5 : 11);
      note('HUMAN SEPTEMBER 2026 RESULTS NOT SHOWN', phone ? .84 : .92, phone ? 8 : 10);
      break;
    case 'monotone':
      historicalHeading();
      monotoneClaim(false);
      break;
    case 'noExtra':
      historicalHeading();
      monotoneClaim(true);
      break;
    case 'stable': {
      historicalHeading();
      stableHeading();
      note('CLAIMED · STABLE IN DIMENSION SEVEN', phone ? .49 : .645, phone ? 9 : 12);

      // The four Temml labels are about 26px tall. A short desktop stage
      // needs two columns to keep that readable size and clear row gaps.
      if (!phone && h < 600) {
        formula('stable-domain', .715, .25);
        formula('stable-equation', .79, .25);
        note('NONNEGATIVE SECOND VARIATION', .865, 10, .25, .43);
        note('CONSTANT +1, CONSTANT −1, OR A FLAT WALL', .715, 10, .75, .43);
        formula('stable-profile', .79, .75);
        formula('stable-parameters', .865, .75);
        note('NO ENERGY-GROWTH ASSUMPTION', .95, 11);
        break;
      }

      formula('stable-domain', phone ? .57 : .70);
      formula('stable-equation', phone ? .65 : .75);
      note('NONNEGATIVE SECOND VARIATION', phone ? .71 : .79, phone ? 8.5 : 11);
      note('CONSTANT +1, CONSTANT −1, OR A FLAT WALL', phone ? .75 : .83, phone ? 8 : 10);
      formula('stable-profile', phone ? .825 : .875);
      formula('stable-parameters', phone ? .91 : .925);
      note('NO ENERGY-GROWTH ASSUMPTION', phone ? .975 : .96, phone ? 8.5 : 11);
      break;
    }
    case 'ledger':
      historicalHeading();
      stableHeading();
      note('UNREVIEWED · 20 OCTOBER 2026', phone ? .54 : .635, phone ? 10 : 15);
      note('NO REPORTED HUMAN PROOF CHECK', phone ? .64 : .715, phone ? 8.5 : 11);

      if (motion.ledger > 0) {
        note('NO FAMILY LEAN SCOPE NOTE', phone ? .74 : .79, phone ? 8.5 : 11);
        note('NO COMPARATOR STATEMENT IN PINNED RELEASE', phone ? .84 : .86, phone ? 8 : 10);
        note('NO MACHINE REPLAY PERFORMED HERE', phone ? .94 : .94, phone ? 8.5 : 11);
      }

      break;
  }
}

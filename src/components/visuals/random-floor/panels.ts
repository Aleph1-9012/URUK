import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import { motionAt } from './story';

export type RandomFloorAudit = {
  hom: number;
  totalMaps: number;
  t: number;
  pPower: number;
  ratio: number;
  minima: { cherry: number; fourCycle: number; cube: number };
};

export function layout(w: number, h: number) {
  const phone = w < PHONE_STAGE_WIDTH;
  const compact = !phone && w < 760;

  return {
    phone,
    compact,
    pattern: { cx: (phone ? .23 : .19) * w, cy: (phone ? .18 : .26) * h, w: (phone ? .36 : .27) * w, h: (phone ? .20 : .36) * h },
    host: { cx: (phone ? .73 : .52) * w, cy: (phone ? .18 : .26) * h, w: (phone ? .34 : .25) * w, h: (phone ? .20 : .36) * h },
    paper: { left: (phone ? .08 : .06) * w, right: (phone ? .92 : .31) * w, top: (phone ? .07 : .10) * h, bottom: (phone ? .27 : .54) * h },
    hostFrame: { left: (phone ? .15 : .40) * w, right: (phone ? .85 : .65) * w, top: (phone ? .31 : .10) * h, bottom: (phone ? .39 : .54) * h },
    gauge: { left: (phone ? .12 : .75) * w, right: (phone ? .88 : .94) * w, top: (phone ? .435 : .12) * h, bottom: (phone ? .54 : .50) * h, horizontal: phone },
    triples: { left: (phone ? .10 : .06) * w, right: (phone ? .90 : .65) * w, top: (phone ? .07 : .08) * h, bottom: (phone ? .35 : .53) * h },
    sweep: { left: (phone ? .08 : .06) * w, right: (phone ? .92 : .65) * w, top: (phone ? .34 : .49) * h, bottom: (phone ? .39 : .55) * h },
    panel: { center: .5, width: phone ? .92 : .90 },
    text: { patternHeading: .035 * h, hostHeading: .035 * h, gaugeHeading: (phone ? .405 : .055) * h, earlyNotes: .60 * h, claimNotes: .62 * h },
  };
}

export function drawRandomFloorPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, audit: RandomFloorAudit): void {
  const page = layout(w, h);
  const { phone } = page;
  const motion = motionAt(time);
  const size = phone ? 9 : 12;

  function note(value: string, y: number, fontSize = size, center = .5, width = phone ? .92 : .90): void {
    drawWrappedText(ctx, value, w * center, h * y, w * width, { size: fontSize, color: tones.ink, paper: tones.paper });
  }

  function formula(id: string, y: number, center = .5): void {
    labels.place(id, w * center, h * y);
  }

  function toyHeadings(): void {
    if (motion.pattern > 0) labels.place('pattern-name', page.pattern.cx, page.text.patternHeading);

    if (motion.host > 0) labels.place('host-name', page.host.cx, page.text.hostHeading);

    if (motion.host === 1) note('TOY HOST · SIX VERTICES', phone ? .31 : .48, phone ? 8 : 10, phone ? .73 : .52, phone ? .44 : .29);
  }

  function paperHeadings(): void {
    if (motion.paper < 1) return;

    labels.place('pattern-name', (page.paper.left + page.paper.right) / 2, page.text.patternHeading);
    note('PAPER H · IN THE PAPER, NOT DRAWN', phone ? .285 : .575, phone ? 8 : 10, phone ? .5 : .185, phone ? .92 : .29);
    note('PAPER G · IN THE PAPER, NOT DRAWN', phone ? .405 : .575, phone ? 8 : 10, phone ? .5 : .525, phone ? .92 : .29);
  }

  function schematicGauge(): void {
    note('CLAIMED · HEIGHTS SCHEMATIC', phone ? .575 : .055, phone ? 8 : 10, phone ? .5 : .845, phone ? .92 : .27);
  }

  function claimedFormula(y = .635): void {
    if (motion.claim > 0) formula('claimed-inequality', y);
  }

  const inMorph = (motion.benchmark > 0 && motion.benchmark < 1)
    || (motion.benchmarkOut > 0 && motion.benchmarkOut < 1)
    || (motion.cycle > 0 && motion.cycle < 1)
    || (motion.cube > 0 && motion.cube < 1)
    || (motion.triples > 0 && motion.triples < 1);

  switch (motion.scene) {
    case 'drop':
      toyHeadings();
      note('CHERRY · THREE VERTICES, TWO EDGES', .60, phone ? 8.5 : 11);

      if (motion.drop > 0) {
        note('THE TWO LEAVES MAY SHARE AN IMAGE', .72);
        note('REPEATS ALLOWED · EVERY EDGE MUST LAND ON AN EDGE', .84, phone ? 8.5 : 11);
      }

      break;
    case 'density':
      toyHeadings();
      formula('density-definition', .61);

      if (motion.maps > 0) {
        note(`${audit.hom.toLocaleString('en-US')} OF ${audit.totalMaps.toLocaleString('en-US')} MAPS PRESERVE EVERY EDGE`, .71, phone ? 8.5 : 11);
      }

      if (motion.density > 0) {
        note(`DENSITY ${audit.t}`, .79, phone ? 12 : 18);
        note('EXACT COUNT · K3,3 · REPEATED IMAGES INCLUDED', .92, phone ? 8 : 10);
      }

      break;
    case 'benchmark':
      if (motion.benchmark < 1) {
        note('DISPLAY MORPH TO THE CONSTANT WEIGHTED KERNEL', .68, phone ? 9 : 12);
      } else {
        formula('constant-kernel', .625);
        formula('constant-density', .71);
        note('EVERY ORDERED PAIR, INCLUDING THE DIAGONAL', .80, phone ? 8.5 : 11);
        note('EXACT KERNEL BENCHMARK · NOT A RANDOM SIX-VERTEX SIMPLE GRAPH', .91, phone ? 8 : 10);
      }

      break;
    case 'conjecture':
      toyHeadings();
      note('CONJECTURED 1991', .60, phone ? 10 : 14);
      formula('conjectured-inequality', .68);
      note('EVERY BIPARTITE PATTERN H · EVERY HOST G', .745, phone ? 8.5 : 11);

      if (inMorph || motion.cycle < 1) {
        note('MORPH · EXACT READOUT WAITS FOR THE FOUR-CYCLE', .83, phone ? 8.5 : 11);
      } else {
        note(`FOUR-CYCLE · DENSITY ${audit.t} · BENCHMARK ${audit.pPower}`, .83, phone ? 8 : 11);
        note(`RATIO ${audit.ratio} · ONE HOST AND ONE PATTERN`, .89, phone ? 8 : 10);
      }

      note('A PICTURE, NOT A PROOF', .96, phone ? 8.5 : 11);
      break;
    case 'known':
      toyHeadings();

      if (inMorph || motion.cube < 1) {
        note('MORPH · FOUR-CYCLE TO CUBE', .63, phone ? 10 : 14);
        note('EXACT READOUT WAITS FOR THE CUBE', .75);
      } else {
        note(`K3,3 · CUBE DENSITY ${audit.t}`, .60, phone ? 9 : 12);
        note(`BENCHMARK ${audit.pPower} · RATIO ${audit.ratio}`, .66, phone ? 8 : 10);
        note('KNOWN: TREES, EVEN CYCLES, COMPLETE BIPARTITE GRAPHS, HYPERCUBES', .72, phone ? 8 : 10);

        if (motion.sweep > 0) {
          note('MINIMUM RATIOS TO THE RANDOM BENCHMARK', .80, phone ? 8 : 10);
          note(`ROUNDED MINIMA: CHERRY ${audit.minima.cherry.toFixed(4)}`, .855, phone ? 8 : 10);
          note(`FOUR-CYCLE ${audit.minima.fourCycle.toFixed(4)} · CUBE ${audit.minima.cube.toFixed(4)}`, .90, phone ? 8 : 10);
          note('1,023 FIVE-VERTEX HOSTS · NOT A PROOF', .96, phone ? 8 : 10);
        }
      }

      break;
    case 'pairs':
      if (inMorph) {
        note('MORPH · THE CUBE AS POINTS AND TRIPLES', .61, phone ? 9 : 12);
      } else {
        note(`K3,3 · CUBE DENSITY ${audit.t} · RATIO ${audit.ratio}`, .61, phone ? 8.5 : 11);
      }

      note('TOY · FOUR POINTS AND THEIR FOUR TRIPLES', .70, phone ? 8.5 : 11);
      note('EACH OF SIX POINT PAIRS OCCURS IN TWO TRIPLES', .79, phone ? 8.5 : 11);
      note("THE CUBE TOY IS NOT THE PAPER'S PATTERN", .91, phone ? 8 : 10);
      break;
    case 'paper':
      paperHeadings();

      if (motion.paper < 1) {
        note('MORPH · THE TOY LEAVES, PAPER H IS NOT RECONSTRUCTED', .64, phone ? 8.5 : 11);
      } else {
        formula('paper-vertices', .63);

        if (motion.arithmetic > 0) {
          formula('paper-edges', .72);
          formula('paper-pairs', .81);
          note('33 USED POINT PAIRS · EACH OCCURS TWICE', .875, phone ? 8.5 : 11);
          note('INCIDENCE COUNT ONLY · ADJACENCIES NOT DRAWN', .955, phone ? 8 : 10);
        }
      }

      break;
    case 'claim':
      paperHeadings();
      schematicGauge();
      claimedFormula();
      note('FIXED INCIDENCE GRAPH · 13 POINTS, 22 TRIPLES', .70, phone ? 8.5 : 11);
      note('CONNECTED BIPARTITE · 35 VERTICES · 66 EDGES', .755, phone ? 8 : 11);
      note('THERE EXISTS A FINITE SIMPLE UNDIRECTED G', .81, phone ? 8 : 11);
      note('AT LEAST ONE EDGE · REPEATED IMAGES ALLOWED', .865, phone ? 8 : 10);
      note('DEFICIT SIZE NOT SHOWN', .92, phone ? 8.5 : 11);
      note('FORCING COROLLARY NOT SHOWN', .97, phone ? 8 : 10);
      break;
    case 'hostExistence':
      paperHeadings();
      schematicGauge();
      claimedFormula();
      note('EXISTENCE OF A FINITE SIMPLE HOST', .72, phone ? 9 : 12);
      note('SAMPLED FROM A KERNEL · NOT AN EXPLICIT SMALL HOST', .81, phone ? 8.5 : 11);
      note('NO HOST SIZE, DENSITY OR DEFICIT COMPUTED HERE', .92, phone ? 8 : 10);
      break;
    case 'formal':
      paperHeadings();
      schematicGauge();
      claimedFormula();

      if (motion.lean > 0) {
        note('COMPARATOR STATEMENT · NOT IN CATALOGUE', .71, phone ? 8.5 : 11);
        note('FIXED H · HOST ONLY · FORCING OUTSIDE', .78, phone ? 8.5 : 11);
        note('35 SOLUTION MODULES · INVENTORY ONLY', .845, phone ? 8 : 10);
      }

      if (motion.notApproval > 0) {
        note('A KERNEL CHECK IS NOT APPROVAL', .91, phone ? 8.5 : 11);
        note('NO LOCAL KERNEL REPLAY', .97, phone ? 8 : 10);
      }

      break;
    case 'ledger':
      paperHeadings();
      schematicGauge();
      claimedFormula();

      if (motion.review > 0) {
        note('UNREVIEWED · 20 OCTOBER 2026', .70, phone ? 10 : 15);
        note('NO REPORTED HUMAN PROOF CHECK', .765, phone ? 8.5 : 11);
      }

      if (motion.ledger > 0) {
        note('COMPARATOR STATEMENT · NOT IN CATALOGUE', .825, phone ? 8 : 10);
        note('35 SOLUTION MODULES · INVENTORY ONLY', .885, phone ? 8 : 10);
        note('A KERNEL CHECK IS NOT A READING OF THE PAPER', .94, phone ? 8 : 10);
        note('NO LOCAL KERNEL REPLAY', .975, phone ? 8 : 9);
      }

      break;
  }
}

import { type Box, type Colors, type Place, text } from './drawing';

export type PanelAudit = { angleError: number; cantorStage: number; cantorCount: number; cantorTransition: boolean; cantorForming: boolean; countableShown: number };

function rows(pen: CanvasRenderingContext2D, box: Box, words: readonly string[], fraction: number, colors: Colors, tall: boolean, size = tall ? 10.5 : 15, gap = tall ? 17 : 26): void {
  const x = box.x + box.w / 2;

  for (const [index, row] of words.entries()) {
    text(pen, row, x, box.y + box.h * fraction + index * gap, size, box.w - 6, colors);
  }
}

function workedExample(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, tall: boolean, audit: PanelAudit): void {
  if (time < 10000) {
    rows(pen, box, ['ONE EXAMPLE', 'BUILT FROM ITS ROUND MODEL'], .06, colors, tall, tall ? 11 : 17);
    rows(pen, box, ['∞ INCLUDED · ONE BOUNDARY', 'EXTERIOR IS A DISC ON THE SPHERE'], .47, colors, tall, tall ? 10 : 14);
    rows(pen, box, ['THE SAME NET · ANGLES KEPT'], .91, colors, tall, tall ? 9.5 : 13);

    return;
  }

  if (time < 21750) {
    rows(pen, box, ['KOEBE ASKS · 1908'], .08, colors, tall, tall ? 17 : 25);
    rows(pen, box, ['ANY NUMBER OF HOLES', 'ANY BOUNDARY', 'ROUND DISCS OR POINTS?'], .35, colors, tall, tall ? 11 : 17);
    rows(pen, box, ['HERE: TWO BOUNDARIES', 'BUILT FROM THEIR ROUND MODEL'], .78, colors, tall, tall ? 9.5 : 13);

    return;
  }

  rows(pen, box, ['TWO BOUNDARIES', 'KOEBE · 1920'], .07, colors, tall, tall ? 14 : 21);
  rows(pen, box, ['ANGLES KEPT', 'GRID CROSSES AT 90°'], .43, colors, tall, tall ? 11 : 17);
  rows(pen, box, [`MAX CHECK ERROR: ${audit.angleError.toExponential(1)} RAD`], .72, colors, tall, tall ? 10.5 : 14);
  rows(pen, box, ['BUILT BACKWARDS', 'FROM ITS ROUND MODEL'], .83, colors, tall, tall ? 9.5 : 14, tall ? 15 : 24);
}

function countable(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, tall: boolean, audit: PanelAudit): void {
  if (time < 36500) {
    rows(pen, box, ['COUNTABLY MANY', 'HE–SCHRAMM · 1993'], .08, colors, tall, tall ? 13 : 21);
    rows(pen, box, [String(audit.countableShown) + ' OF 12 PLACED', 'ACCUMULATING AT ONE POINT'], .47, colors, tall, tall ? 10.5 : 15);
    rows(pen, box, ['COUNTABLE PICTURE · SCHEMATIC'], .91, colors, tall, tall ? 9.5 : 13);

    return;
  }

  rows(pen, box, ['SURVEY · 30 SEPTEMBER 2026'], .08, colors, tall, tall ? 12 : 19);
  rows(pen, box, ['STILL OPEN'], .43, colors, tall, tall ? 22 : 32);
  rows(pen, box, ['AFTER MORE THAN A HUNDRED YEARS'], .69, colors, tall, tall ? 10 : 14);
  rows(pen, box, ['NTALAMPEKOS · YOUNSI'], .91, colors, tall, tall ? 10 : 14);
}

function papers(pen: CanvasRenderingContext2D, box: Box, colors: Colors, tall: boolean): void {
  rows(pen, box, ['23 SEPTEMBER 2026', 'TWO PAPERS'], .07, colors, tall, tall ? 13 : 20);
  rows(pen, box, ['PAPER 1 · THE FULL CONJECTURE'], .42, colors, tall, tall ? 10.5 : 15);
  rows(pen, box, ['PAPER 2 · ONE DIRECTION', 'OF HE–SCHRAMM RIGIDITY'], .65, colors, tall, tall ? 10.5 : 15);
  rows(pen, box, ['CLAIMS · THE PROOF IS LEFT OUT'], .94, colors, tall, tall ? 9 : 13);
}

function claim(pen: CanvasRenderingContext2D, box: Box, colors: Colors, place: Place, tall: boolean): void {
  const x = box.x + box.w / 2;
  rows(pen, box, ['CLAIMED'], .07, colors, tall, tall ? 19 : 28);
  place('sphere-domain', x, box.y + box.h * .28);
  rows(pen, box, ['EVERY NONEMPTY CONNECTED OPEN SET', 'OF THE RIEMANN SPHERE', 'CONFORMAL TO A CIRCLE DOMAIN'], .51, colors, tall, tall ? 10 : 15);
  rows(pen, box, ['THIS MAP IS ONE WORKED EXAMPLE'], .94, colors, tall, tall ? 9 : 13);
}

function cantor(pen: CanvasRenderingContext2D, box: Box, colors: Colors, tall: boolean, audit: PanelAudit): void {
  rows(pen, box, ['FINITE CANTOR PICTURE'], .06, colors, tall, tall ? 13 : 20);
  const stage = audit.cantorForming ? 'FORMING THE FIRST STAGE' : audit.cantorTransition ? 'STAGE ' + audit.cantorStage + ' → ' + (audit.cantorStage + 1) + ' · SPLITTING' : 'STAGE ' + audit.cantorStage + ' · ' + audit.cantorCount + ' ROUND DISCS';
  rows(pen, box, [stage], .27, colors, tall, tall ? 11 : 16);
  rows(pen, box, ['STAGES: DIFFERENT CIRCLE DOMAINS'], .44, colors, tall, tall ? 9 : 13);
  rows(pen, box, ['LIMIT: UNCOUNTABLY MANY', 'POINT COMPONENTS'], .62, colors, tall, tall ? 10 : 15);
  rows(pen, box, ["A PICTURE, NOT THE PAPER'S DOMAIN"], .95, colors, tall, tall ? 9 : 13);
}

function ledger(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, tall: boolean, audit: PanelAudit): void {
  rows(pen, box, ['UNREVIEWED'], .07, colors, tall, tall ? 20 : 29);

  if (time >= 81000) {
    rows(pen, box, ['LEAN STATEMENT', 'NOT IN THE CATALOGUE'], .28, colors, tall, tall ? 11.5 : 17);
    rows(pen, box, [`FINITE PICTURE: STAGE ${audit.cantorStage} · ${audit.cantorCount} DISCS`], .56, colors, tall, tall ? 9 : 13);
  } else {
    rows(pen, box, [`STAGE ${audit.cantorStage} · ${audit.cantorCount} ROUND DISCS`], .29, colors, tall, tall ? 11 : 16);
    rows(pen, box, ["FINITE PICTURE · NOT THE PAPER'S DOMAIN"], .47, colors, tall, tall ? 9 : 13);
  }

  rows(pen, box, ['LIMIT: UNCOUNTABLY MANY', 'POINT COMPONENTS'], .72, colors, tall, tall ? 10 : 15);
  rows(pen, box, ['CIRCLE-DOMAIN CLAIM'], .97, colors, tall, tall ? 9 : 13);
}

export function drawPanels(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, tall: boolean, audit: PanelAudit): void {
  if (time < 27750) workedExample(pen, box, time, colors, tall, audit);
  else if (time < 46000) countable(pen, box, time, colors, tall, audit);
  else if (time < 59000) papers(pen, box, colors, tall);
  else if (time < 65000) claim(pen, box, colors, place, tall);
  else if (time < 74250) cantor(pen, box, colors, tall, audit);
  else ledger(pen, box, time, colors, tall, audit);
}

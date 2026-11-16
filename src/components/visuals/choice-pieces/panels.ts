import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import type { ChoicePiecesModel } from './math';
import { motionAt } from './story';

export function drawChoicePiecesPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, model: ChoicePiecesModel): void {
  const phone = w < PHONE_STAGE_WIDTH;
  const motion = motionAt(time);
  const panelCenter = phone ? .5 : .79;
  const panelWidth = phone ? .94 : .36;

  function note(value: string, y: number, size = phone ? 9 : 11, blue = false): void {
    drawWrappedText(ctx, value, w * panelCenter, h * y, w * panelWidth, {
      size,
      color: blue ? tones.blue : tones.ink,
      paper: tones.paper,
    });
  }

  function formula(id: string, y: number): void {
    labels.place(id, w * panelCenter, h * y);
  }

  function questionLabels(): void {
    if (motion.question === 0) return;

    const initialY = phone ? .61 : .70;
    const parkedY = phone ? .35 : .10;
    const initialPpX = phone ? .24 : .64;
    const initialAcX = phone ? .76 : .88;
    const parkedPpX = phone ? .50 : .62;
    const parkedAcX = phone ? .86 : .90;
    const miniY = initialY + (parkedY - initialY) * motion.boardSetup;
    const shift = phone ? .26 * motion.boardFold : 0;
    const miniPpX = initialPpX + (parkedPpX - initialPpX) * motion.boardSetup - shift;
    const miniAcX = initialAcX + (parkedAcX - initialAcX) * motion.boardSetup - shift;
    const formalAcY = phone ? .145 : .235;
    const formalPpY = phone ? .25 : .43;

    labels.place('ac-node', w * (miniAcX + (.30 - miniAcX) * motion.questionCarry), h * (miniY + (formalAcY - miniY) * motion.questionCarry));
    labels.place('pp-node', w * (miniPpX + (.30 - miniPpX) * motion.questionCarry), h * (miniY + (formalPpY - miniY) * motion.questionCarry));

    if (motion.nodes > 0) labels.place('acwo-node', w * .30, h * (phone ? .39 : .67));
  }

  function claim(): void {
    if (motion.claimTag > 0) {
      note('CLAIMED · RELATIVE CONSISTENCY', phone ? .465 : .13, phone ? 8.5 : 11, true);
      formula('con-zf', phone ? .53 : .25);
      formula('con-extension', phone ? .595 : .385);
    } else {
      note('KNOWN IMPLICATIONS OVER ZF', phone ? .48 : .22);
    }

    note('SCHEMATIC · THE FINITE PICTURE IS NOT A MODEL', phone ? .665 : .49, phone ? 8 : 9);

    if (motion.scopeTags > 0) note('THEOREM 1.1: NO ATOMS · NO LARGE CARDINALS', phone ? .705 : .565, phone ? 8 : 10);
  }

  questionLabels();

  switch (motion.scene) {
    case 'pieces':
      note('THE SAME SIX POINTS', phone ? .43 : .24);
      note('THREE PIECES · SIZES 1, 2 AND 3', phone ? .58 : .43);
      note('FINITE EXAMPLE', phone ? .83 : .70, phone ? 8.5 : 10);
      break;
    case 'inside':
      note('ONE PICK FROM EACH PIECE', phone ? .44 : .23);
      note(`${model.counts.inside} WAYS TO PICK FROM INSIDE`, phone ? .61 : .44);
      note('EACH POINT STAYS IN ITS OWN PIECE', phone ? .80 : .68, phone ? 8.5 : 10);
      break;
    case 'outside':
      note(motion.outside < 1 ? 'MOVING THE PICKS TO A DIFFERENT ASSIGNMENT' : 'ONE-TO-ONE · PICKS MAY LEAVE THEIR PIECES', phone ? .405 : .21, phone ? 8.5 : 11);
      if (motion.outsideMark === 1) note('THIS ASSIGNMENT PICKS OUTSIDE ALL THREE', phone ? .485 : .40, phone ? 8 : 10);
      if (motion.question > 0) note('OPEN SINCE 1902', phone ? .73 : .83);
      note('FINITE ARROWS DO NOT SHOW AN INFINITE MODEL', phone ? .91 : .94, phone ? 8 : 9);
      break;
    case 'board':
      if (motion.boardFill === 1) {
        if (phone) note('ALL ONE-TO-ONE ASSIGNMENTS', .40, 8.5);
        note(`${model.counts.injections} INJECTIONS · ${model.counts.inside} ALL INSIDE`, phone ? .82 : .74);
        note(`${model.counts.outside} OTHER INJECTIONS`, phone ? .865 : .815, phone ? 8.5 : 10);
      }
      note('LIVE FINITE ENUMERATION', phone ? .91 : .88, phone ? 8 : 10);
      note('NOT A SET-THEORY MODEL OR PROOF', phone ? .955 : .95, phone ? 8 : 9);
      break;
    case 'levi':
      if (motion.boardFold === 1) note('BEPPO LEVI · 1902', phone ? .415 : .25);
      if (motion.dateLine > 0) note('THE RETURN QUESTION REMAINED OPEN', phone ? .83 : .90, phone ? 8.5 : 10);
      break;
    case 'withdrawals':
      note('THREE WITHDRAWN PREPRINTS', phone ? .415 : .25);
      if (motion.withdrawnBars > 0) note('2025 AND 2026 · ALL THREE WITHDRAWN', phone ? .83 : .90, phone ? 8.5 : 10);
      break;
    case 'paper':
      note('24 SEPTEMBER 2026 · OPENAI', phone ? .415 : .25);
      if (motion.paperTag > 0) {
        note('44-PAGE PAPER · NEW CLAIM', phone ? .82 : .87);
        note('UNREVIEWED', phone ? .92 : .96, phone ? 9 : 11);
      }
      break;
    case 'diagram':
    case 'scope':
      claim();
      break;
    case 'reader':
      claim();
      if (motion.readerMark > 0) note('READ BY ONE EXPERT · KARAGILA', phone ? .765 : .65, phone ? 8.5 : 10);
      if (motion.exposition > 0) note('EXPOSITION REJECTED · NO ERROR REPORTED', phone ? .825 : .75, phone ? 8 : 10);
      if (motion.reviewDate > 0) note('UNREVIEWED · 18 OCTOBER 2026', phone ? .925 : .91, phone ? 8.5 : 10);
      break;
    case 'ledger':
      claim();
      note('UNREVIEWED · 18 OCTOBER 2026', phone ? .76 : .65, phone ? 8.5 : 10);
      if (motion.ledger > 0) {
        note('CATALOGUED: INACCESSIBLE ASSUMPTION', phone ? .805 : .725, phone ? 8 : 10);
        note('THEOREM 1.1: LINKED, NOT CATALOGUED', phone ? .85 : .805, phone ? 8 : 10);
      }
      if (motion.replay > 0) {
        note('NO OUTSIDE REPLAY FOUND', phone ? .90 : .885, phone ? 8.5 : 10);
        note('KERNEL CHECK IS NOT APPROVAL', phone ? .95 : .955, phone ? 8 : 10);
      }
      break;
  }
}

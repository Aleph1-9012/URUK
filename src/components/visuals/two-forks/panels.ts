import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import { motionAt } from './story';

export type TwoForksAudit = {
  orientations: number;
  height2Required: number;
  height2Envelope: number;
  height2Height: number;
  height3Required: number;
  height3Envelope: number;
  height3Height: number;
  height3ActualMoves: number;
};

export function layout(w: number, h: number) {
  const phone = w < PHONE_STAGE_WIDTH;
  const compact = !phone && w < 760;
  const boardSize = phone ? Math.min(.88 * w, .40 * h) : Math.min(.60 * w, .82 * h);
  const boardLeft = .06 * w;
  const boardTop = (phone ? .055 : .08) * h;

  return {
    phone,
    compact,
    board: { left: phone ? (w - boardSize) / 2 : .055 * w, top: boardTop, size: boardSize },
    inset: { left: boardLeft, top: (phone ? .49 : .74) * h, width: (phone ? .25 : .15) * w, height: (phone ? .11 : .16) * h },
    scale: { left: (phone ? .50 : .70) * w, right: .88 * w, top: (phone ? .07 : .10) * h, bottom: (phone ? .44 : .48) * h },
    certificate: { left: (phone ? .14 : .10) * w, right: (phone ? .86 : .61) * w, top: .10 * h, bottom: (phone ? .28 : .43) * h },
    panel: { center: phone ? .5 : .80, width: phone ? .92 : .31, top: (phone ? .56 : .08) * h },
    text: { boardHeading: (phone ? .02 : .025) * h, insetCaption: (phone ? .61 : .935) * h },
  };
}

export function drawTwoForksPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, audit: TwoForksAudit): void {
  const page = layout(w, h);
  const { phone } = page;
  const motion = motionAt(time);
  const size = phone ? 9 : 11;

  function note(value: string, phoneY: number, wideY: number, fontSize = size): void {
    drawWrappedText(ctx, value, w * page.panel.center, h * (phone ? phoneY : wideY), w * page.panel.width, { size: fontSize, color: tones.ink, paper: tones.paper });
  }

  function formula(id: string, phoneY: number, wideY: number): void {
    labels.place(id, w * page.panel.center, h * (phone ? phoneY : wideY));
  }

  function conditionalHeading(): void {
    note('RESET · CONDITIONAL POSITION', .56, .08, phone ? 9 : 12);
    note('MAKER ALREADY OWNS A · BREAKER MISSES T', .62, .20, phone ? 8.5 : 10);
  }

  switch (motion.scene) {
    case 'grid':
      note('MAKER · FILLED CELL', .59, .12, phone ? 10 : 13);
      note('BREAKER · RING', .72, .34, phone ? 10 : 13);
      note('ALTERNATING CLAIMS ON THE UNLIMITED GRID', .87, .64, phone ? 8.5 : 11);
      break;
    case 'orientations':
      note('RESET · TARGET GALLERY', .56, .08, phone ? 10 : 13);
      note('TARGET OUTLINE · NOT OWNERSHIP', .66, .24);
      note(`${audit.orientations} ROTATIONS AND REFLECTIONS`, .76, .42);
      note('A RING BLOCKS AN UNOWNED TARGET CELL', .86, .61, phone ? 8.5 : 10);
      note('A FULL MAKER SNAKY ALREADY WINS', .95, .83, phone ? 8.5 : 10);
      break;
    case 'snaky':
      note('TARGET OUTLINE · NOT OWNERSHIP', .56, .08);
      note('FOUR CELLS IN ONE ROW', .68, .29, phone ? 10 : 13);
      note('TWO-CELL TAIL STEPPING UP', .80, .50, phone ? 10 : 13);
      note('SIX TARGET CELLS IN TOTAL', .93, .75);
      break;
    case 'turns':
      note('RESET · A NEW ALTERNATING PLAY', .56, .08, phone ? 9.5 : 12);
      note('ONE FRESH UNCLAIMED CELL PER TURN', .69, .31);
      note('CLAIMED CELLS KEEP THEIR MARKS', .81, .54);
      note('EXAMPLES RESET; CLAIMS WITHIN PLAY DO NOT', .94, .80, phone ? 8.5 : 10);
      break;
    case 'base':
      conditionalHeading();
      formula('base-claim', .725, .39);
      note('FIVE OWNED CELLS · ONE FREE FINISH', .83, .58);
      note('ONE FRESH MAKER CLAIM SUFFICES', .94, .80);
      break;
    case 'fork':
      conditionalHeading();
      formula('envelope-rule', .71, .37);
      note(`TOY HEIGHT ${audit.height2Height} · ${audit.height2Required} REQUIRED CELLS · ${audit.height2Envelope}-CELL ENVELOPE`, .79, .51, phone ? 8 : 10);
      note('CLAIM THE PIVOT · TWO FINISHING THREATS', .865, .67, phone ? 8.5 : 10);
      note("TOY RULE INSTANCE · NOT THE PAPER'S CERTIFICATE", .955, .88, phone ? 8 : 10);
      break;
    case 'outside':
      note('RESET · REPLAY AN OUTSIDE REPLY', .64, .10, phone ? 8.5 : 11);
      formula('child-avoids', .73, .29);

      if (motion.height3 > 0) {
        note('COMBINE TWO HEIGHT-TWO CLAIMS', .80, .46);
        note('SECOND COPY: HALF TURN + SHIFT (5,1)', .87, .63, phone ? 8.5 : 10);
        note(`TOY HEIGHT ${audit.height3Height} · ${audit.height3Required} REQUIRED CELLS ALREADY OWNED · ${audit.height3Envelope}-CELL ENVELOPE`, .95, .82, phone ? 8 : 10);
      } else {
        note('OUTSIDE T: EVERY CHILD STAYS CLEAR', .82, .53);
        note('THE TOY IS STILL A CONDITIONAL POSITION', .94, .79, phone ? 8 : 10);
      }

      break;
    case 'height':
      if (motion.paperScale === 0) {
        note(`TOY HEIGHT ${audit.height3Height} · AN UPPER BOUND`, .64, .08, phone ? 10 : 13);
        formula('height-rule', .73, .25);
        note('COUNT ONLY FRESH MAKER CLAIMS', .82, .43);
        note('HEIGHT NEED NOT EQUAL THE NUMBER OF CLAIMS', .93, .66, phone ? 8.5 : 10);
      } else {
        note(`TOY: EARLY WIN IN ${audit.height3ActualMoves} FRESH MAKER CLAIMS`, .64, .57, phone ? 8.5 : 10);
        note('CLAIMED PAPER BOUND', .72, .66, phone ? 10 : 12);
        formula('paper-height', .79, .75);
        note('NO EMPTY-BOARD STRATEGY COMPUTED HERE', .88, .85, phone ? 8.5 : 10);
        note("THE PAPER'S TREE AND CARDS ARE NOT DRAWN", .96, .95, phone ? 8 : 9);
      }

      break;
    case 'certificate':
      formula('paper-claims', .65, .59);
      note('CLAIMED CONDITIONAL CLAIMS · COUNT ONLY', .73, .68, phone ? 8.5 : 10);
      formula('paper-required', .80, .77);
      note('LAST PAPER CARD: REQUIRED SET EMPTY', .865, .84, phone ? 8.5 : 10);
      note('ACTUAL CERTIFICATE NOT RECONSTRUCTED', .94, .94, phone ? 8.5 : 10);
      break;
    case 'finite':
      formula('paper-height', .65, .59);
      formula('paper-pivot', .735, .72);
      note('FIRST MAKER MOVE', .79, .79);

      if (motion.envelope > 0) {
        note('251 CELLS · IN THE PAPER, NOT DRAWN', .865, .86, phone ? 8.5 : 10);
        note('BLANK PLACEHOLDER · NOT THE ACTUAL BOUNDARY', .95, .95, phone ? 8 : 9);
      }

      break;
    case 'checker':
      note("CHECKS THE RULE'S USE · NOT GAME SEARCH", .64, .59, phone ? 9 : 11);

      if (motion.checkScope > 0) {
        note('PAPER CERTIFICATE NOT RECONSTRUCTED', .73, .69, phone ? 8.5 : 10);
        note('PAPER CHECKER NOT RUN HERE', .82, .79, phone ? 9 : 11);
      }

      if (motion.formal > 0) {
        note('THREE COMPARATORS · NOT IN CATALOGUE', .90, .88, phone ? 8 : 10);
        note('354 MODULES · INVENTORY ONLY', .97, .96, phone ? 8 : 9);
      }

      break;
    case 'ledger':
      if (motion.review > 0) note('UNREVIEWED · 20 OCTOBER 2026', .64, .59, phone ? 10 : 13);

      if (motion.ledger > 0) {
        note('THREE COMPARATORS · NOT IN CATALOGUE', .73, .69, phone ? 8.5 : 10);
        note('354 MODULES · INVENTORY ONLY', .81, .78, phone ? 8.5 : 10);
        note('NO LOCAL PROOF REPLAY', .885, .87, phone ? 9 : 11);
        note('PAPER CHECKER NOT RUN HERE', .96, .96, phone ? 8.5 : 10);
      }

      break;
  }
}

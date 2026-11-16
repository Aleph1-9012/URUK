import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import { fractionText, type TapeShearsModel } from './math';
import { motionAt } from './story';

export function layout(w: number, h: number, claimed = false) {
  const phone = w < PHONE_STAGE_WIDTH;
  const compactClaim = claimed && !phone && w < 760;
  const stacked = w < 760 && !compactClaim;
  const size = compactClaim ? Math.min(.43 * w, .55 * h) : stacked ? Math.min(.76 * w, (phone ? .34 : .40) * h) : Math.min(.48 * w, .66 * h);
  const sheet = { x: stacked ? (w - size) / 2 : .04 * w, y: (compactClaim ? .08 : stacked ? .05 : .12) * h, size };

  return {
    phone,
    stacked,
    sheet,
    panel: { center: compactClaim ? .76 : stacked ? .5 : .79, width: compactClaim ? .43 : stacked ? .94 : .36 },
    text: {
      top: (phone ? claimed ? .56 : .49 : compactClaim ? .06 : stacked ? .56 : .08) * h,
      toyY: sheet.y + sheet.size + 34,
      historyTop: (phone ? .66 : stacked ? .70 : .55) * h,
      historyBottom: (phone ? .84 : stacked ? .87 : .81) * h,
    },
  };
}

export function drawTapeShearsPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, model: TapeShearsModel): void {
  const page = layout(w, h, time >= 56000);
  const { phone, stacked } = page;
  const motion = motionAt(time);
  const top = page.text.top / h;
  const onSheet = ['encoding', 'digits', 'tapeStep', 'shears', 'history'].includes(motion.scene);

  function row(part: number): number {
    return top + (.965 - top) * part;
  }

  function note(value: string, at: number, size = phone ? 8.5 : 10, blue = false, math = false): void {
    drawWrappedText(ctx, value, w * page.panel.center, h * at, w * page.panel.width, {
      size,
      family: math ? 'math' : 'type',
      color: blue ? tones.blue : tones.ink,
      paper: tones.paper,
    });
  }

  function formula(id: string, at: number): void {
    labels.place(id, w * page.panel.center, h * at);
  }

  function claimTag(): void {
    note('CLAIMED · SMOOTH FORCED FLOW', row(.05), phone ? 9 : 11, true);
  }

  if (onSheet) {
    drawWrappedText(ctx, "TOY ENCODING · NOT THE PAPER'S FORCE", page.sheet.x + page.sheet.size / 2, page.text.toyY, Math.min(w * .94, page.sheet.size + 38), {
      size: phone ? 8 : 10,
      color: tones.ink,
      paper: tones.paper,
    });
  }

  switch (motion.scene) {
    case 'fluid':
      note('SCHEMATIC FLUID · INITIALLY AT REST', row(.12), phone ? 9 : 11);
      note('ONE MATERIAL PARTICLE IS MARKED', row(.48));
      note('NO FLOW IS COMPUTED', row(.86));
      break;
    case 'detector':
      note('A FINITE PROGRAM · A FIXED DETECTOR', row(.12));
      note('SCHEMATIC FORCE AND REGION', row(.47));
      note('FORCE SCHEMATIC · NO FLOW IS COMPUTED', row(.86), phone ? 8 : 10);
      break;
    case 'question':
      note('ENTER THE REGION IF AND ONLY IF IT HALTS?', row(.12), phone ? 8.5 : 11);
      note('THE EVENT IS A QUESTION AT THIS STAGE', row(.48));
      note('NO COMPUTED TRAJECTORY OR FORCE', row(.86));
      break;
    case 'encoding':
      note(motion.loader < 1 ? 'SCHEMATIC ONE-TIME LOADER' : 'TWO TAPE HALVES · TWO COORDINATES', row(.10));
      note('LEFT TAPE AND RIGHT TAPE', row(.43));
      note('NO DETECTOR IS DRAWN ON THIS SHEET', row(.84), phone ? 8 : 10);
      break;
    case 'digits':
      note(`BASE ${model.base} · TWO TAPE SYMBOLS`, row(.08));
      note('SYMBOL 0 → DIGIT 1 · SYMBOL 1 → DIGIT 3', row(.28), phone ? 8.5 : 11, false, true);
      formula('input-code', row(.51));
      note('ONLY DIGIT-1/3 STRINGS ARE TAPE CODES', row(.73), phone ? 8 : 10);
      note('THE DRAWN BANDS ARE BRANCH HULLS', row(.90));
      break;
    case 'tapeStep': {
      const resetting = motion.aReturn > 0 && motion.aReturn < 1;
      const machine = motion.aReturn === 1 ? 'S' : 'A';
      const path = machine === 'S' ? model.machineS.path : model.machineA.path;
      const position = machine === 'S' ? 6 * motion.sRun : 4 * motion.aRun;
      const index = Math.min(path.length - 1, Math.floor(position));
      const frame = resetting ? model.machineS.path[0] : path[index];

      if (!frame) throw new Error('The displayed instruction needs its exact machine frame.');

      const moving = position > index;
      const state = frame.state === 'halt' ? 'halt' : frame.state === 'q0' ? 'q₀' : 'q₁';
      const prefix = resetting ? 'NEXT INPUT' : moving ? 'FROM' : 'AT';
      const control = resetting ? 'DISPLAY RESET · A TO S' : `${machine} · ${prefix} STEP ${frame.step} · ${state}`;
      formula('affine-step', row(.12));
      formula(machine === 'S' || resetting ? 'shuttle-scales' : 'scale-factors', row(.28));
      note(control, row(.42), phone ? 9 : 12, false, true);
      note(`${prefix}: x=${fractionText(frame.x)}, y=${fractionText(frame.y)}`, row(.54), phone ? 10 : 13, false, true);
      note(`L=${frame.left.join('')}0… · R=${frame.right.join('')}0…`, row(.65), phone ? 10 : 13, false, true);

      if (resetting) note('EXPLANATORY MOVE · NO FLUID IS RUN BACKWARD', row(.77), phone ? 8 : 10);
      else if (moving) note(`MOVING TO STEP ${frame.step + 1}`, row(.77));
      else if (machine === 'A' && frame.state === 'halt') note(`A HALTS · STEP ${frame.step}`, row(.77), phone ? 9 : 11);
      else if (machine === 'S' && frame.step >= model.machineS.repeatAfter) note(`FULL STATE REPEATS AFTER ${model.machineS.repeatAfter} STEPS · NEVER HALTS`, row(.77), phone ? 8 : 10);

      note('EXACT ENDPOINTS · BOTH TAPES CONTINUE WITH BLANKS', row(.91), phone ? 8 : 9);
      break;
    }
    case 'shears':
      formula('rectangle-area', row(.15));
      note(`AREA ${fractionText(model.branch.area)} AT EVERY STAGE`, row(.39));
      note('APPLY THE MATRIX FACTORS RIGHTMOST FIRST', row(.65), phone ? 8 : 10);
      note('CENTER, FOUR SHEARS, THEN TRANSLATE', row(.92), phone ? 8 : 10);
      break;
    case 'history':
      note('OVERWRITING CAN LOSE INFORMATION', phone ? .50 : stacked ? .57 : .10, phone ? 8.5 : 11);
      note(`${model.history.withHistory} INPUTS · ${model.history.withoutHistory} DISTINCT xy OUTPUTS`, phone ? .57 : stacked ? .63 : .25, phone ? 8.5 : 10);
      note('FOUR xy OUTPUTS × TWO h VALUES · EIGHT TRIPLES', phone ? .91 : stacked ? .93 : .88, phone ? 8 : 9);
      break;
    case 'claim':
      note('EXPLANATORY OVERVIEW · NOT A SECOND LOADER', row(.04), phone ? 8 : 10);
      if (motion.claim > 0) {
        note('CLAIMED · FLAT THREE-TORUS · FROM REST', row(.23), phone ? 8 : 10, true);
        formula('halting-equivalence', row(.51));
        note('EFFECTIVE · SMOOTH · SOLENOIDAL · ZERO MEAN', row(.82), phone ? 8 : 10, true);
      }
      break;
    case 'fixed':
      claimTag();
      formula('force-input', row(.29));
      note('POINT AND DETECTOR ARE FIXED FIRST', row(.51));
      note('THEN CHOOSE THE FORCE FOR MACHINE AND INPUT', row(.75), phone ? 8 : 10);
      note('THE MATERIAL LABEL IS NOT A FIXED TRAJECTORY', row(.96), phone ? 8 : 9);
      break;
    case 'smooth':
      claimTag();
      if (motion.smooth > 0) note('DESIGNED TO STAY SMOOTH FOR ALL TIME', row(.32), phone ? 8 : 10);
      if (motion.scope > 0) {
        note('NOT THE GENERAL NAVIER-STOKES REGULARITY PROBLEM', row(.62), phone ? 8 : 10);
        note('NO FORCE OR PDE IS COMPUTED IN THIS FILM', row(.90), phone ? 8 : 10);
      }
      break;
    case 'review':
      claimTag();
      if (motion.unreviewed > 0) note('UNREVIEWED · 7 NOVEMBER 2026', row(.34));
      if (motion.reviewDate > 0) {
        note('NO PUBLIC SPECIALIST ACCEPTANCE FOUND', row(.62), phone ? 8 : 10);
        note('NO JOURNAL ACCEPTANCE OR IDENTIFIED ERROR', row(.89), phone ? 8 : 10);
      }
      break;
    case 'ledger':
      note('CLAIMED · SMOOTH FORCED FLOW', row(.01), phone ? 8 : 10, true);
      note('UNREVIEWED · 7 NOVEMBER 2026', row(.15));
      if (motion.formal > 0) {
        note('LEAN STATEMENTS ONLY · 6 TARGETS · 5 GROUPS', row(.32), phone ? 8 : 10);
        note('SOME INCLUDE FULL HALTING EQUIVALENCES', row(.49), phone ? 8 : 10);
        note('NOT EVERY CLAIM IN ALL 9 MANUSCRIPTS', row(.65), phone ? 8 : 10);
      }
      if (motion.replay > 0) {
        note('LEAN/NANODA ACCEPTANCE REPORTED · 10 OCT', row(.80), phone ? 8 : 9);
        note('HISTORICAL REPORT · NOT OUR REPLAY', row(.93), phone ? 8 : 9);
      }
      break;
  }
}

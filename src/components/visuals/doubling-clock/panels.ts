import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import type { DoublingClockModel } from './math';
import { motionAt } from './story';

export function layout(w: number, h: number) {
  const phone = w < PHONE_STAGE_WIDTH;
  const stacked = w < 760;

  return {
    phone,
    stacked,
    ladder: { x: stacked ? 46 : .10 * w, labelX: stacked ? 20 : .055 * w, top: (phone ? .09 : stacked ? .075 : .12) * h, bottom: (phone ? .34 : stacked ? .40 : .80) * h },
    chart: { left: (stacked ? .30 : .22) * w, right: (stacked ? .91 : .68) * w, top: (phone ? .09 : stacked ? .07 : .12) * h, bottom: (phone ? .34 : stacked ? .40 : .80) * h },
    panel: { center: stacked ? .5 : .85, width: stacked ? .94 : .27 },
    text: { top: (stacked ? .49 : .06) * h, toyY: (phone ? .46 : stacked ? .475 : .89) * h },
  };
}

export function drawDoublingClockPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, model: DoublingClockModel): void {
  const page = layout(w, h);
  const { phone, stacked } = page;
  const motion = motionAt(time);
  const ten = model.speeds[10];

  if (!ten || ten.n !== 10) throw new Error('The stable high-momentum readout needs the computed n=10 speed row.');

  function note(value: string, y: number, size = phone ? 8.5 : 10, blue = false, math = false): void {
    drawWrappedText(ctx, value, w * page.panel.center, h * y, w * page.panel.width, {
      size,
      family: math ? 'math' : 'type',
      color: blue ? tones.blue : tones.ink,
      paper: tones.paper,
    });
  }

  function formula(id: string, y: number): void {
    labels.place(id, w * page.panel.center, h * y);
  }

  function retainedGap(): void {
    note('CLAIMED GAP · SUFFICIENTLY LARGE INDEX', phone ? .51 : stacked ? .50 : .08, phone ? 8 : 10, true);
    formula('gap-bound', phone ? .57 : stacked ? .56 : .20);
    note('c DEPENDS ON DATUM AND FIXED HORIZON', phone ? .625 : stacked ? .61 : .31, phone ? 8 : 9);
  }

  function globalTag(): void {
    note('CLAIMED · UNIQUE GLOBAL CLASSICAL SOLUTION', stacked ? .67 : .43, phone ? 8 : 10, true);
  }

  if (motion.timeAxis > 0) {
    let toy = 'TOY TIME · NOT A PDE LIFESPAN';

    if (motion.caps > 0) toy = 'c=1 TOY SUM · CAPS ARE UNMEASURED';
    else if (motion.zoom > 0 && motion.zoom < 1) toy = 'DISPLAY ZOOM · TOY GAP ARITHMETIC';
    else if (motion.zoom === 1) toy = 'EXACT PARTIAL SUMS · DISPLAY SAMPLES · c=1 TOY';
    else if (motion.gaps > 0) toy = 'GAP CONSTANT c=1 CHOSEN · NOT A NUMERIC PDE BOUND';

    drawWrappedText(ctx, toy, w * (stacked ? .5 : .44), page.text.toyY, w * (stacked ? .94 : .60), { size: phone ? 8 : 10, color: tones.ink, paper: tones.paper });
  }

  if (motion.gaps > 0) retainedGap();

  switch (motion.scene) {
    case 'swarm':
      note('SCHEMATIC SWARM', stacked ? .55 : .15, phone ? 10 : 12);
      note('NO PLASMA DYNAMICS ARE SOLVED', stacked ? .72 : .42);
      note('ONE RING IS CARRIED INTO THE NEXT PICTURE', stacked ? .89 : .72, phone ? 8 : 10);
      break;
    case 'feedback':
      note('PARTICLES AND FIELDS FEED BACK', stacked ? .55 : .14, phone ? 9 : 11);
      note('SCHEMATIC LOOPS · NOT A SOLUTION', stacked ? .70 : .39);
      note('THE RING IS A DISPLAY MARKER', stacked ? .87 : .69);
      break;
    case 'velocity':
      formula('velocity-rule', stacked ? .55 : .16);
      note('EXACT MOMENTUM-SPEED ARITHMETIC', stacked ? .65 : .35);
      note(`AT MOMENTUM MAGNITUDE ${ten.momentum}`, stacked ? .76 : .54);
      note(`1 - SPEED = ${ten.oneMinusVelocity.toExponential(2)}`, stacked ? .85 : .70, phone ? 10 : 12, false, true);
      note('THE SPEED REMAINS BELOW ONE', stacked ? .94 : .87);
      break;
    case 'criterion':
      formula('energy', stacked ? .56 : .18);
      note('GLASSEY-STRAUSS 1986 · CONTINUATION CRITERION', stacked ? .68 : .39, phone ? 8 : 10);
      note('BREAKDOWN REQUIRES UNBOUNDED MOMENTUM SUPPORT', stacked ? .80 : .61, phone ? 8 : 10);
      note('MAXIMUM ENERGY · THE PARTICLE LABEL MAY CHANGE', stacked ? .93 : .84, phone ? 8 : 9);
      break;
    case 'finiteHorizon':
      note('ASSUMED FINITE HORIZON · CONTRADICTION ARGUMENT', stacked ? .54 : .14, phone ? 8 : 10);
      formula('energy-doubling', stacked ? .67 : .37);
      note('HORIZONTAL LINE: ONE SCHEMATIC TOY TIME UNIT', stacked ? .79 : .61, phone ? 8 : 10);
      note('NOT ONE PHYSICAL PARTICLE THROUGH EVERY LEVEL', stacked ? .93 : .84, phone ? 8 : 9);
      break;
    case 'doubling':
      formula('toy-constant', phone ? .69 : stacked ? .68 : .43);
      if (motion.harmonic > 0) {
        formula('harmonic-floor', stacked ? .77 : .58);
        note('A HARMONIC TAIL · THE TOY SUM DIVERGES', stacked ? .85 : .73, phone ? 8 : 10);
      }
      note('TOY INDEX STARTS AT ONE · TOY TIME STARTS AT ZERO', stacked ? .95 : .91, phone ? 8 : 9);
      break;
    case 'global':
      globalTag();
      if (motion.globalScope > 0) {
        note('3D · ONE SPECIES · RELATIVISTIC', stacked ? .73 : .55, phone ? 8.5 : 10, true);
        note('EVERY SMOOTH ADMISSIBLE DATUM', stacked ? .79 : .66, phone ? 8.5 : 10, true);
        note('NO SIZE OR SYMMETRY RESTRICTION', stacked ? .85 : .77, phone ? 8 : 10, true);
        note('GAUSS-CONSTRAINED INITIAL FIELDS', stacked ? .91 : .88, phone ? 8 : 9);
        note('NO UNIFORM-IN-TIME SUPPORT BOUND', .97, phone ? 8 : 9);
      }
      break;
    case 'finiteCaps':
      globalTag();
      if (motion.caps > 0) formula('finite-interval', stacked ? .75 : .56);
      if (motion.capScope > 0) {
        note('SCHEMATIC CAP DEPENDS ON THE INTERVAL', stacked ? .83 : .69, phone ? 8 : 10);
        note('NO NUMERICAL SUPPORT HEIGHT IS SUPPLIED', stacked ? .90 : .81, phone ? 8 : 9);
        note('NO BOUND UNIFORM FOR ALL TIME', stacked ? .97 : .94, phone ? 8 : 9);
      }
      break;
    case 'review':
      globalTag();
      if (motion.unreviewed > 0) note('UNREVIEWED · NO PUBLIC PROOF CHECK', stacked ? .79 : .62, phone ? 8 : 10);
      if (motion.reviewDate > 0) note('AS OF 18 OCTOBER 2026', stacked ? .88 : .79, phone ? 8.5 : 10);
      break;
    case 'ledger':
      globalTag();
      note('UNREVIEWED · 18 OCTOBER 2026', stacked ? .75 : .55, phone ? 8 : 10);
      if (motion.ledger > 0) {
        note('LEAN STATEMENT: 112 LINES · CATALOGUED', stacked ? .82 : .69, phone ? 8 : 9);
        note('STATEMENT ONLY · NOT APPROVAL', stacked ? .88 : .82, phone ? 8 : 9);
        note('DATED NO OUTSIDE REPLAY · NONE RUN HERE', stacked ? .96 : .95, phone ? 8 : 9);
      }
      break;
  }
}

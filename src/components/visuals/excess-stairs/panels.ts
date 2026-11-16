import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import type { ExcessStairsModel } from './math';
import { motionAt } from './story';

export function drawExcessStairsPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, model: ExcessStairsModel): void {
  const phone = w < PHONE_STAGE_WIDTH;
  const motion = motionAt(time);

  function note(value: string, y: number, size = phone ? 9 : 11, math = false): void {
    drawWrappedText(ctx, value, w * .5, h * y, w * .94, {
      size,
      family: math ? 'math' : 'type',
      color: tones.ink,
      paper: tones.paper,
    });
  }

  function formula(id: string, y: number): void {
    labels.place(id, w * .5, h * y);
  }

  if (motion.questionBracket > 0) {
    formula(motion.nuclei > 0 ? 'symbolic-molecule' : 'symbolic-atom', .665);
    const claimed = motion.scene === 'claim' || motion.scene === 'review';

    note(claimed ? 'CLAIMED · WIDTH SYMBOLIC' : 'SYMBOLIC, NOT A NUMBER', .70, phone ? 8 : 10);
  }

  switch (motion.scene) {
    case 'neutral':
      note('NEUTRAL · ELECTRON COUNT MATCHES NUCLEAR CHARGE', .74, phone ? 8.5 : 11);
      note('THE PICTURE ONLY ILLUSTRATES THE DEFINITION', .84, phone ? 8.5 : 10);
      note('STEP HEIGHTS AND COUNTS ARE SCHEMATIC', .95, phone ? 8.5 : 10);
      break;
    case 'more':
      note('CAN THE NEXT ELECTRON LOWER THE ENERGY?', .75, phone ? 9 : 12);
      note('EMPTY SLOTS ASK A QUESTION', .85, phone ? 8.5 : 10);
      note('NO BINDING COUNT IS COMPUTED', .95, phone ? 8.5 : 10);
      break;
    case 'laboratory':
      note('LABORATORY · AT MOST ONE EXTRA OBSERVED', .74, phone ? 8.5 : 11);
      note('HYDROGEN BINDS A SECOND ELECTRON', .84, phone ? 8.5 : 10);
      note('STEP SIZE SCHEMATIC · NO ATOM COMPUTED', .95, phone ? 8.5 : 10);
      break;
    case 'binding':
      formula('binding', .75);
      note('A LOWER ENERGY MEANS STRICT BINDING', .84, phone ? 8.5 : 11);
      note('SCHEMATIC STEPS · NO NUMERICAL ENERGIES', .95, phone ? 8.5 : 10);
      break;
    case 'plateau':
      if (motion.plateau > 0) formula('plateau', .75);
      note('NONINCREASING · EVENTUALLY FLAT', .84, phone ? 9 : 11);
      note('STOPPING POINT AND STEP COUNTS ARE SCHEMATIC', .95, phone ? 8 : 10);
      break;
    case 'hard':
      note('NO COMPUTED ATOM IN THIS FILM', .75, phone ? 9 : 12);
      note('THE TRUE MANY-ELECTRON PROBLEM', .85, phone ? 8.5 : 10);
      note('THE GRAPH ILLUSTRATES DEFINITIONS ONLY', .95, phone ? 8.5 : 10);
      break;
    case 'lieb': {
      if (motion.wallValues > 0) {
        formula('lieb-at-most', .745);
        note('FOR THESE INTEGER CHARGES ONLY', .79, phone ? 8 : 10);
        const readouts: string[] = [];

        for (const row of model.wallReadouts) readouts.push(`Z=${row.Z}: ${row.wall}`);

        if (phone) {
          note(readouts.slice(0, 2).join(' · '), .84, 9, true);
          note(readouts.slice(2).join(' · '), .885, 9, true);
        } else {
          note(readouts.join(' · '), .85, 12, true);
        }
      }
      note('LIEB 1984 · ROOM FOR Z EXTRA', .94, phone ? 8.5 : 11);
      break;
    }
    case 'conjecture':
      note("SIMON'S PROBLEM 9 · A UNIVERSAL EXCESS?", .74, phone ? 8.5 : 11);
      note('THE CONSTANT IS NOT COMPUTED', .84, phone ? 9 : 12);
      note("NO WIDTH COMPARISON WITH Z OR LIEB'S WALL", .95, phone ? 8 : 10);
      break;
    case 'claim':
      if (motion.uniformScope > 0) formula('total-charge', .77);
      note('STRICT BINDING · FULL NONRELATIVISTIC MODEL · TWO SPINS', .825, phone ? 8 : 10);
      note('FIXED NUCLEI · NO MAGNETIC FIELD', .87, phone ? 8 : 10);
      note('C UNIVERSAL, NOT COMPUTED', .915, phone ? 8.5 : 11);
      note('24 SEPTEMBER 2026 · UNREVIEWED', .97, phone ? 8 : 10);
      break;
    case 'review':
      if (motion.review > 0) note('UNREVIEWED · 20 OCTOBER 2026', .745, phone ? 8 : 10);
      if (motion.companionLedger > 0) {
        note('COMPANIONS ONLY: IONIZATION CATALOGUED', .80, phone ? 8 : 10);
        note('RADII LINKED · NOT CATALOGUED', .85, phone ? 8 : 10);
        note('EXCESS, FIRST IONIZATION, HALF-ELECTRON: NO RELEASE STATEMENT', .90, phone ? 8 : 10);
        note('NO OUTSIDE REPLAY · DATED SEARCH', .975, phone ? 8 : 10);
      }
      break;
  }
}

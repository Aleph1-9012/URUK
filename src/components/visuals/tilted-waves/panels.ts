import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import type { TiltedWavesModel } from './math';
import { motionAt } from './story';

export function drawTiltedWavesPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, model: TiltedWavesModel): void {
  const phone = w < PHONE_STAGE_WIDTH;
  const motion = motionAt(time);
  const hot = model.rows[0];
  const middle = model.rows[2];
  const cold = model.rows[6];

  if (!hot || !middle || !cold) throw new Error('The ideal-gas comparison needs its three computed temperature samples.');

  const nextTermRatio = cold.nextRatio.toFixed(3);

  function note(value: string, y: number, size = phone ? 9 : 11, x = .5, width = .94, math = false): void {
    drawWrappedText(ctx, value, w * x, h * y, w * width, {
      size,
      family: math ? 'math' : 'type',
      color: tones.ink,
      paper: tones.paper,
    });
  }

  function formula(id: string, y: number, x = .5): void {
    labels.place(id, w * x, h * y);
  }

  function limitingClaim(): void {
    note('CLAIMED · ZERO-TEMPERATURE LIMIT ONLY', phone ? .68 : .27, phone ? 8 : 9, phone ? .5 : .825, phone ? .94 : .27);
    if (motion.limitFormula > 0) {
      formula('claim-leading', phone ? .72 : .075, phone ? .5 : .825);
      formula('claim-limit', phone ? .785 : .17, phone ? .5 : .825);
    }
    if (motion.nextTerm > 0) {
      note(`(IDEAL - BLOCH) / NEXT TERM: ${nextTermRatio}\nT/S=1/128`, phone ? .835 : .82, phone ? 8 : 10, phone ? .5 : .25, phone ? .94 : .43);
    }
    if (motion.hypotheses > 0) {
      note('3D · EVERY FIXED SPIN · SYMMETRIC NONNEGATIVE J', phone ? .885 : .80, phone ? 7.5 : 10, phone ? .5 : .75, phone ? .94 : .43);
      note('FINITE RANGE · SUPPORT GENERATES THE LATTICE', phone ? .925 : .89, phone ? 8 : 10, phone ? .5 : .75, phone ? .94 : .43);
      note('VOLUME, THEN FIELD, THEN TEMPERATURE', phone ? .965 : .94, phone ? 8 : 10, phone ? .5 : .25, phone ? .94 : .43);
    }
  }

  if (motion.block > 0) note('SCHEMATIC SLICE OF A 3D SYSTEM', phone ? .215 : .315, phone ? 7.5 : 10, phone ? .5 : .375, phone ? .94 : .50);

  switch (motion.scene) {
    case 'zero':
      note('UPRIGHT ARROWS ARE SCHEMATIC', phone ? .71 : .82);
      note('ABSOLUTE ZERO IS OFF THE POSITIVE LOG AXIS', phone ? .84 : .94, phone ? 8.5 : 10);
      break;
    case 'waves':
      note('LONG WAVES COST LESS', phone ? .70 : .82);
      if (motion.shortWave > 0) note('SHORTER WAVE · HIGHER COST', phone ? .80 : .90, phone ? 8.5 : 10);
      if (motion.bloch > 0) formula('bloch-power', phone ? .92 : .97);
      break;
    case 'ideal':
      formula('bloch-coefficient', phone ? .705 : .12, phone ? .5 : .825);
      note(`NEAREST-NEIGHBOUR COEFFICIENT: ${model.coefficient.toFixed(4)}`, phone ? .75 : .23, phone ? 8 : 9, phone ? .5 : .825, phone ? .94 : .27);
      if (phone) {
        note(`T/S=1/2 · IDEAL/BLOCH ${hot.ratio.toFixed(4)}`, .80, 9, .5, .94, true);
        note(`T/S=1/8 · IDEAL/BLOCH ${middle.ratio.toFixed(4)}`, .86, 9, .5, .94, true);
        note(`T/S=1/128 · IDEAL/BLOCH ${cold.ratio.toFixed(4)}`, .92, 9, .5, .94, true);
      } else {
        note(`IDEAL/BLOCH: T/S=1/2 ${hot.ratio.toFixed(4)} · 1/8 ${middle.ratio.toFixed(4)} · 1/128 ${cold.ratio.toFixed(4)}`, .83, 11, .5, .94, true);
        note('NUMERICAL IDEAL INTEGRAL · NOT FINITE-T QUANTUM MAGNETIZATION', .94, 10);
      }
      break;
    case 'experiment':
      note('DASHED BLOCH LAW: TEXTBOOK AND EXPERIMENT', phone ? .71 : .82, phone ? 8.5 : 11);
      note('SOLID CURVE: NUMERICAL IDEAL INTEGRAL', phone ? .82 : .93, phone ? 8.5 : 10);
      break;
    case 'model':
      note('HEISENBERG MODEL · QUANTUM SPINS', phone ? .71 : .82, phone ? 9 : 11);
      note('THE ARROWS ARE NOT DEFINITE QUANTUM DIRECTIONS', phone ? .82 : .92, phone ? 8 : 10);
      note('THE PLOT STILL COUNTS IDEAL NON-INTERACTING WAVES', .96, phone ? 8 : 9);
      break;
    case 'unproved':
      note('QUANTUM ORDERING WAS OPEN', phone ? .71 : .82, phone ? 9 : 11);
      if (motion.historical > 0) note('LIEB 1999 · SEIRINGER 2025', phone ? .81 : .91, phone ? 8.5 : 10);
      note('NO FINITE-T QUANTUM VALUES ON THIS PLOT', .96, phone ? 8 : 9);
      break;
    case 'claim':
      limitingClaim();
      break;
    case 'review':
      note('CLAIMED LIMIT · IDEAL CURVES ONLY', phone ? .70 : .80, phone ? 8.5 : 10);
      if (motion.unreviewed > 0) note('UNREVIEWED · NO PUBLIC PROOF CHECK', phone ? .81 : .89, phone ? 8.5 : 10);
      if (motion.reviewDate > 0) note('AS OF 3 NOVEMBER 2026', .96, phone ? 8.5 : 10);
      break;
    case 'ledger':
      note('UNREVIEWED · 3 NOVEMBER 2026', phone ? .70 : .80, phone ? 8 : 10);
      if (motion.ledger > 0) {
        note('ONLY MAGNETIZATION LINKED · UNCATALOGUED', phone ? .77 : .87, phone ? 8 : 10);
        note('BLOCH, CORRECTION, SPHERICAL: NO RELEASE STATEMENT', phone ? .85 : .93, phone ? 8 : 9);
      }
      if (motion.replay > 0) note('NO OUTSIDE REPLAY · DATED SEARCH', .97, phone ? 8 : 9);
      break;
  }
}

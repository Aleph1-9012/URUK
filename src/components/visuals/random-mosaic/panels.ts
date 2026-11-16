import { drawWrappedText } from '../../plate/canvas/wrapped-text';
import { PHONE_STAGE_WIDTH, type FilmTones } from '../../plate/frame';
import type { FilmLabels } from '../../plate/labels';
import type { RandomMosaicModel } from './math';
import { motionAt, SCENE_TIMES } from './story';

export function drawRandomMosaicPanels(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, tones: FilmTones, labels: FilmLabels, model: RandomMosaicModel): void {
  const phone = w < PHONE_STAGE_WIDTH;
  const motion = motionAt(time);
  const center = phone ? .5 : .76;
  const panelWidth = phone ? .94 : .42;

  function note(value: string, y: number, size = phone ? 9 : 12, math = false, blue = false, x = center, width = panelWidth): void {
    drawWrappedText(ctx, value, w * x, h * y, w * width, { size, family: math ? 'math' : 'type', color: blue ? tones.blue : tones.ink, paper: tones.paper });
  }

  function formula(id: string, y: number, x = center): void {
    labels.place(id, w * x, h * y);
  }

  function targetName(name: RandomMosaicModel['targets'][number]['name']): string {
    switch (name) {
      case 'square': return 'SQUARE';
      case 'wide': return 'WIDE 2:1';
      case 'tall': return 'TALL 1:2';
    }
  }

  function knownCardyTag(): void {
    if (phone) note('CARDY: TRIANGULAR SITE\nSMIRNOV 2001', .295, 8, false, false, .62, .68);
    else note('CARDY · TRIANGULAR SITE · SMIRNOV 2001', .055, 10);
  }

  function compactClaim(): void {
    note('CLAIMED · ANNEALED LIMIT F(x)', .70, phone ? 9 : 12, true, true);
    note('FAIR COLOURS 1/2 · INTENSITY → ∞', .745, phone ? 9 : 12, true, true);
    note('ANY BOUNDED JORDAN DOMAIN', .79, phone ? 8 : 11, false, true);
    note('COMPANIONS: PIVOTAL POWER −3/4', .835, phone ? 8.5 : 11, true, true);
    note('NEAR-CRITICAL LAW GIVEN THE MOSAIC', .875, phone ? 8 : 10, false, true);
  }

  if (time < SCENE_TIMES.crossRatio) {
    note('FINITE-WINDOW TOY · A PICTURE, NOT A PROOF', phone ? .015 : .025, phone ? 8 : 10, false, false, phone ? .5 : .26, phone ? .95 : .50);
  }

  switch (motion.scene) {
    case 'mosaic':
      note(motion.sites < 1 ? 'DRAWING THE RETAINED SITES' : `${model.square.sites.length} RETAINED SITES`, phone ? .56 : .22);
      note(motion.cells < 1 ? 'EACH CELL GROWS FROM ITS SITE' : 'NEAREST-SITE CELLS IN ONE WINDOW', phone ? .66 : .40);
      note('OUTSIDE SITES ARE OMITTED', phone ? .79 : .60, phone ? 8 : 11);
      note('FINITE PICTURE · NOT THE FULL PLANE', phone ? .90 : .80, phone ? 8 : 10);
      break;
    case 'colour':
      note('FAIR COINS SET THE COLOURS', phone ? .56 : .22);
      formula('colour-half', phone ? .66 : .40);
      if (motion.black === 1) {
        note(`${model.square.blackCount} BLACK · ${model.square.sites.length - model.square.blackCount} PAPER`, phone ? .77 : .58);
        note('OBSERVED SHARE DIFFERS FROM COIN PROBABILITY', phone ? .87 : .74, phone ? 8 : 10);
      }
      break;
    case 'critical':
      note('COIN PROBABILITY', phone ? .54 : .14, phone ? 9 : 12);
      formula('colour-half', phone ? .67 : .34);
      note(motion.route < 1 ? 'SEARCHING ADJACENT BLACK CELLS' : `${model.originalChain.length} BLACK CELLS · LEFT TO RIGHT`, phone ? .76 : .49);
      note('CRITICAL HALF · BOLLOBÁS–RIORDAN 2006', phone ? .85 : .65, phone ? 8 : 11);
      note('THEOREM CITED · ONE CROSSING IS AN EXAMPLE', phone ? .94 : .82, phone ? 7.5 : 10);
      break;
    case 'geometry': {
      let state = 'EXTENDING THE SAME WINDOW';

      if (motion.square > 0 || motion.unturn > 0) state = 'RETURNING THE SAME MOSAIC';
      else if (motion.turn === 1) state = 'TALL 1:2 · LEFT-RIGHT CROSSED';
      else if (motion.turn > 0) state = 'TURNING THE SAME COLOURS';
      else if (motion.wide === 1) state = 'WIDE 2:1 · LEFT-RIGHT NOT CROSSED';

      note(state, phone ? .55 : .22, phone ? 9 : 12);
      note('TALL LEFT-RIGHT = WIDE TOP-BOTTOM', phone ? .65 : .39, phone ? 9 : 12, true);
      note('PREDICTED: THE SHAPE SETS THE LIMITING ODDS', phone ? .76 : .55, phone ? 8 : 11);
      formula('mesh-limit', phone ? .85 : .70);
      note('ONE ILLUSTRATION · NOT THE MEASURED TRIALS', phone ? .94 : .84, phone ? 7.5 : 10);
      break;
    }
    case 'isotropy':
      note('NO LATTICE · NO PREFERRED DIRECTION', phone ? .53 : .24, phone ? 9 : 12);
      note('ROTATING THIS FINITE PICTURE', phone ? .69 : .45);
      note('SCHEMATIC · NOT A TEST OF INVARIANCE', phone ? .80 : .64, phone ? 8 : 11);
      note('THE FULL-PLANE POISSON LAW HAS NO PREFERRED ANGLE', phone ? .91 : .82, phone ? 8 : 10);
      break;
    case 'crossRatio':
      note('FOUR MARKS · SCHEMATIC CONFORMAL MAP', phone ? .015 : .10, phone ? 8 : 10);
      formula('boundary-map', phone ? .71 : .17);
      formula('cross-ratio', phone ? .78 : .73);
      if (motion.crossRatioReadouts > 0) {
        for (const [index, target] of model.targets.entries()) {
          note(`${targetName(target.name)}: x ≈ ${target.x.toFixed(4)}`, (phone ? .83 : .79) + index * (phone ? .05 : .065), phone ? 10 : 13, true);
        }
      }
      break;
    case 'cardy':
      knownCardyTag();
      if (!phone) formula('cardy-formula', .17);
      note(`TOY · ${model.samples} MOSAICS · NOT A LIMIT TEST`, .70, phone ? 8 : 11);
      if (motion.toyBars > 0) {
        for (const [index, target] of model.targets.entries()) {
          note(`${targetName(target.name)} ${target.measured.toFixed(4)} · CARDY ${target.F.toFixed(4)}`, .75 + index * .05, phone ? 8.5 : 11, true);
        }
        note(`±${model.standardError.toFixed(3)}: MAX STANDARD ERROR, NOT A CI`, .90, phone ? 8.5 : 10, true);
        note('TALL: SAME WIDE MOSAICS, SEEN SIDEWAYS\nFINITE TOY · SQUARE SITS LOW', .945, phone ? 7.5 : 9);
      }
      break;
    case 'claim':
      knownCardyTag();
      if (motion.claimTags > 0) {
        note('CLAIMED · POISSON-VORONOI LIMIT', .70, phone ? 9 : 12, false, true);
        note(motion.companion > 0 ? 'ANNEALED · COINS 1/2 · INTENSITY → ∞' : 'ANNEALED · FAIR COLOURS 1/2', .75, phone ? 9 : 12, true, true);
        note('ANY BOUNDED JORDAN DOMAIN', .795, phone ? 8.5 : 11, false, true);
        formula('crossing-limit', .852);
        if (motion.companion === 0) note('POINT INTENSITY → ∞', .90, phone ? 9 : 12, true, true);
      }
      if (motion.companion > 0) {
        note('COMPANIONS ASSUME THE MAIN THEOREM', .885, phone ? 8 : 10, false, true);
        formula('pivotal-law', .945);
        note('NEAR-CRITICAL: GIVEN THE MOSAIC', .98, phone ? 8 : 10, false, true);
      }
      break;
    case 'annealed':
      knownCardyTag();
      compactClaim();
      note('EACH TICK: NEW MOSAIC AND NEW COLOURS\nSHOWN MOSAIC: ONE EXAMPLE', .93, phone ? 8 : 10);
      break;
    case 'review':
      knownCardyTag();
      compactClaim();
      if (motion.unreviewed > 0) note('UNREVIEWED · 20 OCTOBER 2026', .94, phone ? 9 : 12);
      break;
    case 'machine':
      knownCardyTag();
      compactClaim();
      note('UNREVIEWED · 20 OCTOBER 2026', .93, phone ? 8.5 : 11);
      if (motion.machine > 0) note('MACHINE CHECKING: NONE', .975, phone ? 8 : 10);
      break;
  }
}

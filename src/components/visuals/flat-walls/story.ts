import { progress, smooth } from '../../../lib/animation';
import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: 'A wall between phases', text: 'Where two phases of a material meet, oil and water, up-magnets and down-magnets, a thin wall forms, and the Allen-Cahn equation $\\Delta u=u^{3}-u$ is the simplest model of it: $u$ is $-1$ in one phase, $+1$ in the other, and crosses between them along the wall.', sources: [1] },
  { at: 15750, title: 'Flat and bent walls', text: 'The flat wall is the explicit solution $\\tanh((e\\cdot x-c)/\\sqrt2)$.', sources: [1] },
  { at: 25750, title: 'Why dimension eight?', text: 'In 1978 Ennio De Giorgi conjectured that in dimensions up to eight, any solution that rises monotonically in one direction must be a flat wall, and he chose eight because of the Bernstein problem for minimal surfaces, where flat is forced through dimension eight and fails from nine.', sources: [1] },
  { at: 43250, title: 'The earlier frontier', text: 'The conjecture was proved in two dimensions in 1998, in three in 2000, and through eight by Ovidiu Savin in 2009 under an extra assumption that the solution really reaches $\\pm1$ far away; del Pino, Kowalczyk and Wei built non-flat monotone solutions in dimension nine and above in 2011.', sources: [1, 3, 4] },
  { at: 61000, title: 'A claim at the endpoint', text: 'On 26 September 2026 OpenAI posted a paper claiming dimension eight, the sharp endpoint.', sources: [1] },
  { at: 68000, title: 'The monotone claim', text: 'Let $u\\in C^{2}(\\mathbb R^{8},(-1,1))$ satisfy $\\Delta u=u^{3}-u$ and $\\partial_8u>0$.', sources: [1] },
  { at: 78000, title: 'No extra assumption', text: 'Neither energy growth nor minimization is assumed; both, and the limits at infinity, are consequences.', sources: [1] },
  { at: 88000, title: 'The stable claim in seven', text: 'Then $v\\equiv1$, $v\\equiv-1$, or $v(x)=\\tanh((a\\cdot x-b)/\\sqrt2)$ for some $a\\in\\mathbb S^{6}$, $b\\in\\mathbb R$. No energy-growth assumption is required.', sources: [1] },
  { at: 98000, title: 'Where the proof stands', text: 'As of 20 October 2026 no mathematician has said publicly that they have read or checked the proof.', sources: [1, 6] },
] as const;

export const FILM_DURATION = 106000;

export const SETTLED_TIMES = [15500, 25500, 43000, 60750, 67750, 77750, 87750, 97750, 106000] as const;

export const TIMELINE = {
  ...createTimeline(CUES, FILM_DURATION, 180),
  stillTime(index: number): number {
    const time = SETTLED_TIMES[index];

    if (time === undefined) throw new RangeError('Every reduced-motion cue needs its complete supporting frame.');

    return time;
  },
};

export const SCENE_TIMES = {
  phases: 0,
  flatTest: 15750,
  dimensions: 25750,
  history: 43250,
  release: 61000,
  monotone: 68000,
  noExtra: 78000,
  stable: 88000,
  ledger: 98000,
} as const;

const SCENE_NAMES = ['phases', 'flatTest', 'dimensions', 'history', 'release', 'monotone', 'noExtra', 'stable', 'ledger'] as const;

export function sceneAt(time: number) {
  const scene = SCENE_NAMES[TIMELINE.cueAt(time)];

  if (!scene) throw new Error('Every cue needs its named drawing scene.');

  return scene;
}

export function fieldProgress(time: number): number {
  return progress(time, 0, 2500);
}

export function profileProgress(time: number): number {
  return progress(time, 2500, 6000);
}

export function rotationProgress(time: number): number {
  return progress(time, 15750, 21250);
}

export function circleProgress(time: number): number {
  return smooth(time, 21250, 24250);
}

export function resetProgress(time: number): number {
  return smooth(time, 24750, 25500);
}

export function shrinkProgress(time: number): number {
  return smooth(time, 25750, 29500);
}

export function stripProgress(time: number): number {
  return progress(time, 29500, 33500);
}

export function coneProgress(time: number): number {
  return progress(time, 33500, 40500);
}

export function provenProgress(time: number): number {
  return progress(time, 43250, 46500);
}

export function conditionalProgress(time: number): number {
  return progress(time, 46500, 52500);
}

export function counterexampleProgress(time: number): number {
  return progress(time, 52500, 57500);
}

export function focusProgress(time: number): number {
  return smooth(time, 61000, 65000);
}

export function arrowProgress(time: number): number {
  return progress(time, 68000, 70500);
}

export function claimProgress(time: number): number {
  return progress(time, 70500, 74500);
}

export function liftProgress(time: number): number {
  return smooth(time, 78000, 81500);
}

export function consequencesProgress(time: number): number {
  return progress(time, 81500, 85500);
}

export function stableProgress(time: number): number {
  return progress(time, 88000, 91500);
}

export function stableClaimProgress(time: number): number {
  return progress(time, 91500, 95500);
}

export function ledgerProgress(time: number): number {
  return progress(time, 98000, 101000);
}

export function motionAt(time: number) {
  return {
    scene: sceneAt(time),
    field: fieldProgress(time),
    profile: profileProgress(time),
    rotate: rotationProgress(time),
    circle: circleProgress(time),
    reset: resetProgress(time),
    shrink: shrinkProgress(time),
    strip: stripProgress(time),
    cone: coneProgress(time),
    proven: provenProgress(time),
    conditional: conditionalProgress(time),
    counterexample: counterexampleProgress(time),
    focus: focusProgress(time),
    arrow: arrowProgress(time),
    claim: claimProgress(time),
    lift: liftProgress(time),
    consequences: consequencesProgress(time),
    stable: stableProgress(time),
    stableClaim: stableClaimProgress(time),
    ledger: ledgerProgress(time),
  };
}

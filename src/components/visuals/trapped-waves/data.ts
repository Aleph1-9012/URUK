import initial from './small-data.json';

export type WaveFrame = { time: number; side: number; density: Float32Array<ArrayBuffer>; rms: number; within3: number; within31: number; edge: number; norm: number };

export type WaveWorkerMessage =
  | { kind: 'initial'; unit: Float64Array<ArrayBuffer>; strong: Float32Array<ArrayBuffer> }
  | { kind: 'frame'; disorder: 5 | 2; index: number; frame: WaveFrame }
  | { kind: 'complete' }
  | { kind: 'error'; message: string };

export type WaveData = {
  unit: Float64Array<ArrayBuffer> | null;
  strong: Float32Array<ArrayBuffer> | null;
  medium: Map<number, WaveFrame>;
  weak: Map<number, WaveFrame>;
  complete: boolean;
  error: string | null;
};

export const STRONG_STILL = initial.strongStill;

export const LOCALIZED_STATES = initial.states;

export const EIGENVALUES = initial.energies;

export const STRONG_STATS = initial.strongStats;

export function createWaveData(): WaveData {
  return { unit: null, strong: null, medium: new Map(), weak: new Map(), complete: false, error: null };
}

export function applyWaveMessage(data: WaveData, message: WaveWorkerMessage): void {
  switch (message.kind) {
    case 'initial':
      data.unit = message.unit;
      data.strong = message.strong;
      break;
    case 'frame':
      (message.disorder === 5 ? data.medium : data.weak).set(message.index, message.frame);
      break;
    case 'complete':
      data.complete = true;
      break;
    case 'error':
      data.error = message.message;
      break;
  }
}

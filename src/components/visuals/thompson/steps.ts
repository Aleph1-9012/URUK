import { BAND_COUNT, bandMaps } from './maps';

// The still picture, and the film's first frame: five of the eight bands, as on the approved 62b plate.
export const START_STEP = 5;

export function describeStep(step: number): string {
  const maps = bandMaps.slice(0, step).map((map) => map.spoken).join(', then ');

  return `Step ${step} of ${BAND_COUNT}: ${maps}`;
}

// The film draws one band at a time, then rests on all eight before it starts again from the first.
const BAND_TIME = 1100;
const REST = 2600;

export const FILM_PERIOD = (BAND_COUNT - 1) * BAND_TIME + REST;

// 1 to 8: whole bands drawn, plus how far down the next one the drawing has got.
export function stepAt(time: number): number {
  return Math.min(BAND_COUNT, 1 + (time % FILM_PERIOD) / BAND_TIME);
}

export function timeOfStep(step: number): number {
  return (step - 1) * BAND_TIME;
}

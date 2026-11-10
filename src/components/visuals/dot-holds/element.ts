import { defineFilm } from '../../plate/controller';
import { DotHoldsFilm } from './film';
import { createHoldModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-dot-holds', TIMELINE, ({ root, canvas, context }) =>
  new DotHoldsFilm(root, canvas, context, createHoldModel()));

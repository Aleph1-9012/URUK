import { defineFilm } from '../../plate/controller';
import { DotHoldsFilm } from './film';
import { createHoldModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-dot-holds', TIMELINE, ({ root, context }) =>
  new DotHoldsFilm(root, context, createHoldModel()));

import { defineFilm } from '../../plate/controller';
import { createCoinMatrixFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-coin-matrix', TIMELINE, ({ root, context }) =>
  createCoinMatrixFilm(root, context));

import { defineFilm } from '../../plate/controller';
import { createRandomMosaicFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-random-mosaic', TIMELINE, ({ root, context }) =>
  createRandomMosaicFilm(root, context));

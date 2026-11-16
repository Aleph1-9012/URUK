import { defineFilm } from '../../plate/controller';
import { createSameTileFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-same-tile', TIMELINE, ({ root, context }) =>
  createSameTileFilm(root, context));

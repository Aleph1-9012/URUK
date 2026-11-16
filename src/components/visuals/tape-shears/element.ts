import { defineFilm } from '../../plate/controller';
import { createTapeShearsFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-tape-shears', TIMELINE, ({ root, context }) =>
  createTapeShearsFilm(root, context));

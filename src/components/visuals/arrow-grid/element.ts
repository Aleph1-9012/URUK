import { defineFilm } from '../../plate/controller';
import { createArrowGridFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-arrow-grid', TIMELINE, ({ root, context }) =>
  createArrowGridFilm(root, context));

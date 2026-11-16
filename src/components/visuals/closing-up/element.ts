import { defineFilm } from '../../plate/controller';
import { createClosingUpFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-closing-up', TIMELINE, ({ root, context }) =>
  createClosingUpFilm(root, context));

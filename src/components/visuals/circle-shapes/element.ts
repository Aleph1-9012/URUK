import { defineFilm } from '../../plate/controller';
import { createCircleFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-circle-shapes', TIMELINE, ({ root, context }) =>
  createCircleFilm(root, context));

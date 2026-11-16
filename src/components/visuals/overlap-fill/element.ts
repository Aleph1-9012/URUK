import { defineFilm } from '../../plate/controller';
import { createOverlapFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-overlap-fill', TIMELINE, ({ root, context }) =>
  createOverlapFilm(root, context));

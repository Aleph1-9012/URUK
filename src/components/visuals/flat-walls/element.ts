import { defineFilm } from '../../plate/controller';
import { createFlatWallsFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-flat-walls', TIMELINE, ({ root, context }) =>
  createFlatWallsFilm(root, context));

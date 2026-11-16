import { defineFilm } from '../../plate/controller';
import { createExcessStairsFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-excess-stairs', TIMELINE, ({ root, context }) =>
  createExcessStairsFilm(root, context));

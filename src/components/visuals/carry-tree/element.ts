import { defineFilm } from '../../plate/controller';
import { createCarryTreeFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-carry-tree', TIMELINE, ({ root, context }) =>
  createCarryTreeFilm(root, context));

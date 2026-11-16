import { defineFilm } from '../../plate/controller';
import { CheapestFloorFilm } from './film';
import { createFloorModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-cheapest-floor', TIMELINE, ({ root, context }) =>
  new CheapestFloorFilm(root, context, createFloorModel()));

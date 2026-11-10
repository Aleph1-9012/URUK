import { defineFilm } from '../../plate/controller';
import { CheapestFloorFilm } from './film';
import { createFloorModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-cheapest-floor', TIMELINE, ({ root, canvas, context }) =>
  new CheapestFloorFilm(root, canvas, context, createFloorModel()));

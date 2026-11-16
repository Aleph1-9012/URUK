import { defineFilm } from '../../plate/controller';
import { createCheapestEdgesFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-cheapest-edges', TIMELINE, ({ root, context }) =>
  createCheapestEdgesFilm(root, context));

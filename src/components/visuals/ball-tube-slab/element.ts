import { defineFilm } from '../../plate/controller';
import { createBallTubeSlabFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-ball-tube-slab', TIMELINE, ({ root, context }) =>
  createBallTubeSlabFilm(root, context));

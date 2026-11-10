import { defineFilm } from '../../plate/controller';
import { FewDistancesFilm } from './film';
import { createDistanceModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-few-distances', TIMELINE, ({ root, canvas, context }) =>
  new FewDistancesFilm(root, canvas, context, createDistanceModel()));

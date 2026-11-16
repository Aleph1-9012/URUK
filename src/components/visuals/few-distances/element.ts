import { defineFilm } from '../../plate/controller';
import { FewDistancesFilm } from './film';
import { createDistanceModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-few-distances', TIMELINE, ({ root, context }) =>
  new FewDistancesFilm(root, context, createDistanceModel()));

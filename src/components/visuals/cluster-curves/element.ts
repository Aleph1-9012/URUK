import { defineFilm } from '../../plate/controller';
import { createClusterCurvesFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-cluster-curves', TIMELINE, ({ root, context }) =>
  createClusterCurvesFilm(root, context));

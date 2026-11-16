import { defineFilm } from '../../plate/controller';
import { ThreeLanesFilm } from './film';
import { createSchedulingModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-three-lanes', TIMELINE, ({ root, context }) =>
  new ThreeLanesFilm(root, context, createSchedulingModel()));

import { defineFilm } from '../../plate/controller';
import { ThreeLanesFilm } from './film';
import { createSchedulingModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-three-lanes', TIMELINE, ({ root, canvas, context }) =>
  new ThreeLanesFilm(root, canvas, context, createSchedulingModel()));

import { defineFilm } from '../../plate/controller';
import { PromisedThreeFilm } from './film';
import { createColourModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-promised-three', TIMELINE, ({ root, canvas, context }) =>
  new PromisedThreeFilm(root, canvas, context, createColourModel()));

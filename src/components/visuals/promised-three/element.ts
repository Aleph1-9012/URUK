import { defineFilm } from '../../plate/controller';
import { PromisedThreeFilm } from './film';
import { createColourModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-promised-three', TIMELINE, ({ root, context }) =>
  new PromisedThreeFilm(root, context, createColourModel()));

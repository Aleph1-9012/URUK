import { defineFilm } from '../../plate/controller';
import { createTwoForksFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-two-forks', TIMELINE, ({ root, context }) =>
  createTwoForksFilm(root, context));

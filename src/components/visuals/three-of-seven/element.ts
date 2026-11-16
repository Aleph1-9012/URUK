import { defineFilm } from '../../plate/controller';
import { createThreeOfSevenFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-three-of-seven', TIMELINE, ({ root, context }) =>
  createThreeOfSevenFilm(root, context));

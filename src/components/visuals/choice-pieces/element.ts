import { defineFilm } from '../../plate/controller';
import { createChoicePiecesFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-choice-pieces', TIMELINE, ({ root, context }) =>
  createChoicePiecesFilm(root, context));

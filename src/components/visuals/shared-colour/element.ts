import { defineFilm } from '../../plate/controller';
import { createSharedColourFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-shared-colour', TIMELINE, ({ root, context }) =>
  createSharedColourFilm(root, context));

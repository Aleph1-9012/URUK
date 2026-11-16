import { defineFilm } from '../../plate/controller';
import { createProjectorLinesFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-projector-lines', TIMELINE, ({ root, context }) =>
  createProjectorLinesFilm(root, context));

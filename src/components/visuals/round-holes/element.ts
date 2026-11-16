import { defineFilm } from '../../plate/controller';
import { RoundHolesFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-round-holes', TIMELINE, ({ root, context }) =>
  new RoundHolesFilm(root, context));

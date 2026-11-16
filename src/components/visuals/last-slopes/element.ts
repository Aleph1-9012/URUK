import { defineFilm } from '../../plate/controller';
import { createLastSlopesFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-last-slopes', TIMELINE, ({ root, context }) =>
  createLastSlopesFilm(root, context));

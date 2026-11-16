import { defineFilm } from '../../plate/controller';
import { createTiltedWavesFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-tilted-waves', TIMELINE, ({ root, context }) =>
  createTiltedWavesFilm(root, context));

import { defineFilm } from '../../plate/controller';
import { createDoublingClockFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-doubling-clock', TIMELINE, ({ root, context }) =>
  createDoublingClockFilm(root, context));

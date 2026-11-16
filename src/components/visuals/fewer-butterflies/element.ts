import { defineFilm } from '../../plate/controller';
import { createButterflyFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-fewer-butterflies', TIMELINE, ({ context }) =>
  createButterflyFilm(context));

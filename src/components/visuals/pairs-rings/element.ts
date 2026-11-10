import { defineFilm } from '../../plate/controller';
import { PairsRingsFilm } from './film';
import { createPairsModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-pairs-rings', TIMELINE, ({ root, canvas, context }) =>
  new PairsRingsFilm(root, canvas, context, createPairsModel()));

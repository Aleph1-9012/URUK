import { defineFilm } from '../../plate/controller';
import { PairsRingsFilm } from './film';
import { createPairsModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-pairs-rings', TIMELINE, ({ root, context }) =>
  new PairsRingsFilm(root, context, createPairsModel()));

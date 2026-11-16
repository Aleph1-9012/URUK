import { defineFilm } from '../../plate/controller';
import { CornerTourFilm } from './film';
import { createCornerModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-corner-tour', TIMELINE, ({ root, context }) =>
  new CornerTourFilm(root, context, createCornerModel()));

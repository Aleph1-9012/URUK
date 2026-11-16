import { defineFilm } from '../../plate/controller';
import { PolarProductFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-polar-product', TIMELINE, ({ root, context }) =>
  new PolarProductFilm(root, context));

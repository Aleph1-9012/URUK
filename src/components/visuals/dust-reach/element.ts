import { defineFilm } from '../../plate/controller';
import { DustReachFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-dust-reach', TIMELINE, ({ root, context }) =>
  new DustReachFilm(root, context));

import { defineFilm } from '../../plate/controller';
import { createMazeFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-maze-walk', TIMELINE, ({ context }) =>
  createMazeFilm(context));

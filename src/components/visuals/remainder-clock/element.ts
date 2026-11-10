import { defineFilm } from '../../plate/controller';
import { createRemainderClock } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-remainder-clock', TIMELINE, ({ root, canvas, context }) =>
  createRemainderClock(root, canvas, context));

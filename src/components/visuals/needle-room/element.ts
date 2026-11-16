import { defineFilm } from '../../plate/controller';
import { NeedleRoomFilm } from './film';
import { createKakeyaModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-needle-room', TIMELINE, ({ root, context }) =>
  new NeedleRoomFilm(root, context, createKakeyaModel()));

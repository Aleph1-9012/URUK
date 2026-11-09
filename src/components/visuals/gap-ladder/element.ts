import { defineFilm } from '../../plate/controller';
import { GapLadderFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-gap-ladder', TIMELINE, ({ root, canvas, context }) => {
  const drawing = new GapLadderFilm(root, canvas, context);

  return drawing;
});

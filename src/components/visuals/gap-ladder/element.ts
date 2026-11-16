import { defineFilm } from '../../plate/controller';
import { GapLadderFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-gap-ladder', TIMELINE, ({ root, context }) => {
  const drawing = new GapLadderFilm(root, context);

  return drawing;
});

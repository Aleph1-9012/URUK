import { defineFilm } from '../../plate/controller';
import { FairAverageFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-fair-average', TIMELINE, ({ root, canvas, context }) => {
  const drawing = new FairAverageFilm(root, canvas, context);

  return drawing;
});

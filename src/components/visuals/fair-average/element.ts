import { defineFilm } from '../../plate/controller';
import { FairAverageFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-fair-average', TIMELINE, ({ root, context }) => {
  const drawing = new FairAverageFilm(root, context);

  return drawing;
});

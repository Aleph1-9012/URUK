import { defineFilm } from '../../plate/controller';
import { FractionNetsFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-fraction-nets', TIMELINE, ({ canvas, labels }) => {
  const drawing = new FractionNetsFilm(canvas, labels);

  return drawing;
});

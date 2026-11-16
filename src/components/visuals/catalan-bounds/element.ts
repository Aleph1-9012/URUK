import { defineFilm } from '../../plate/controller';
import { CatalanFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-catalan-bounds', TIMELINE, ({ canvas, labels }) => {
  const drawing = new CatalanFilm(canvas, labels);

  return drawing;
});

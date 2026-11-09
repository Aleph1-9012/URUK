import { defineFilm } from '../../plate/controller';
import { UnitLinksFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-unit-links', TIMELINE, ({ root, canvas, context }) => {
  const drawing = new UnitLinksFilm(root, canvas, context);

  return drawing;
});

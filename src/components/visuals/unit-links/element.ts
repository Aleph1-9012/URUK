import { defineFilm } from '../../plate/controller';
import { UnitLinksFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-unit-links', TIMELINE, ({ root, context }) => {
  const drawing = new UnitLinksFilm(root, context);

  return drawing;
});

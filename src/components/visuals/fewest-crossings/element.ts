import { defineFilm } from '../../plate/controller';
import { FewestCrossingsFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-fewest-crossings', TIMELINE, ({ root, canvas, context }) => {
  const drawing = new FewestCrossingsFilm(root, canvas, context);

  return drawing;
});

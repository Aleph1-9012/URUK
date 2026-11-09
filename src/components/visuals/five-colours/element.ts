import { defineFilm } from '../../plate/controller';
import { FiveColoursFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-five-colours', TIMELINE, ({ root, canvas, context }) => {
  const drawing = new FiveColoursFilm(root, canvas, context);

  return drawing;
});

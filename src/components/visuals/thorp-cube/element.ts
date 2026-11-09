import { defineFilm } from '../../plate/controller';
import { ThorpCubeFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-thorp-cube', TIMELINE, ({ root, canvas, context }) => {
  const drawing = new ThorpCubeFilm(root, canvas, context);

  return drawing;
});

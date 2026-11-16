import { defineFilm } from '../../plate/controller';
import { BarkerEchoesFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-barker-echoes', TIMELINE, ({ root, context }) => {
  const drawing = new BarkerEchoesFilm(root, context);

  return drawing;
});

import { defineFilm } from '../../plate/controller';
import { SwitchFilm } from './film';
import { TIMELINE } from './timeline';

defineFilm('uruk-switch-film', TIMELINE, ({ canvas, labels }) => {
  const drawing = new SwitchFilm(canvas, labels);

  return drawing;
});

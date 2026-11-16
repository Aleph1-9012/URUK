import { defineFilm } from '../../plate/controller';
import { SwitchFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-switch-groups', TIMELINE, ({ canvas, labels }) => {
  const drawing = new SwitchFilm(canvas, labels);

  return drawing;
});

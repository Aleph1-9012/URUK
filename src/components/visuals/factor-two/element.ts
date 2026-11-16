import { defineFilm } from '../../plate/controller';
import { FactorTwoFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-factor-two', TIMELINE, ({ root, context }) => {
  const drawing = new FactorTwoFilm(root, context);

  return drawing;
});

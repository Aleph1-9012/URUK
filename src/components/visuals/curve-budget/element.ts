import { defineFilm } from '../../plate/controller';
import { CurveBudgetFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-curve-budget', TIMELINE, ({ root, canvas, context }) => {
  const drawing = new CurveBudgetFilm(root, canvas, context);

  return drawing;
});

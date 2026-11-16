import { defineFilm } from '../../plate/controller';
import { CurveBudgetFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-curve-budget', TIMELINE, ({ root, context }) => {
  const drawing = new CurveBudgetFilm(root, context);

  return drawing;
});

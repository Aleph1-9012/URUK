import { defineFilm } from '../../plate/controller';
import { UniqueRulesFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-unique-rules', TIMELINE, ({ root, canvas, context }) => {
  const drawing = new UniqueRulesFilm(root, canvas, context);

  return drawing;
});

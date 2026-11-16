import { defineFilm } from '../../plate/controller';
import { UniqueRulesFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-unique-rules', TIMELINE, ({ root, context }) => {
  const drawing = new UniqueRulesFilm(root, context);

  return drawing;
});

import { defineFilm } from '../../plate/controller';
import { createRingRulesFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-ring-rules', TIMELINE, ({ root, context }) =>
  createRingRulesFilm(root, context));

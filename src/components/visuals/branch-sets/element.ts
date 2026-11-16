import { defineFilm } from '../../plate/controller';
import { createBranchSetsFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-branch-sets', TIMELINE, ({ root, context }) =>
  createBranchSetsFilm(root, context));

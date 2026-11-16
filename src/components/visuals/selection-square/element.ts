import { defineFilm } from '../../plate/controller';
import { SelectionSquareFilm } from './film';
import { createSelectionModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-selection-square', TIMELINE, ({ root, context }) =>
  new SelectionSquareFilm(root, context, createSelectionModel()));

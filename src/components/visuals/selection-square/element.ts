import { defineFilm } from '../../plate/controller';
import { SelectionSquareFilm } from './film';
import { createSelectionModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-selection-square', TIMELINE, ({ root, canvas, context }) =>
  new SelectionSquareFilm(root, canvas, context, createSelectionModel()));

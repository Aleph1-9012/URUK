import { defineFilm } from '../../plate/controller';
import { DigitSquareFilm } from './film';
import { createDigitModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-digit-square', TIMELINE, ({ root, context }) =>
  new DigitSquareFilm(root, context, createDigitModel()));

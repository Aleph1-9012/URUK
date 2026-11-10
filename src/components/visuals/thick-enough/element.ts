import { defineFilm } from '../../plate/controller';
import { ThickEnoughFilm } from './film';
import { createReciprocalModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-thick-enough', TIMELINE, ({ root, canvas, context }) =>
  new ThickEnoughFilm(root, canvas, context, createReciprocalModel()));

import { defineFilm } from '../../plate/controller';
import { ThickEnoughFilm } from './film';
import { createReciprocalModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-thick-enough', TIMELINE, ({ root, context }) =>
  new ThickEnoughFilm(root, context, createReciprocalModel()));

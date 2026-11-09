import { defineFilm } from '../../plate/controller';
import { GridProductsFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-grid-products', TIMELINE, ({ root, canvas, context }) => {
  const drawing = new GridProductsFilm(root, canvas, context);

  return drawing;
});

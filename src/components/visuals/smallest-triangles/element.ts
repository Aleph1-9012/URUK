import { defineFilm } from '../../plate/controller';
import { SmallestTrianglesFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-smallest-triangles', TIMELINE, ({ root, canvas, context }) => {
  const drawing = new SmallestTrianglesFilm(root, canvas, context);

  return drawing;
});

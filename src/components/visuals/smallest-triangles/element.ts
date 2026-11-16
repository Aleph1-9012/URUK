import { defineFilm } from '../../plate/controller';
import { SmallestTrianglesFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-smallest-triangles', TIMELINE, ({ root, context }) => {
  const drawing = new SmallestTrianglesFilm(root, context);

  return drawing;
});

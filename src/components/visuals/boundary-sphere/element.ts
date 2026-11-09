import { defineFilm } from '../../plate/controller';
import { BoundarySphereFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-boundary-sphere', TIMELINE, ({ root, canvas, context }) => {
  const drawing = new BoundarySphereFilm(root, canvas, context);

  return drawing;
});

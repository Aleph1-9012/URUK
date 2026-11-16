import { defineFilm } from '../../plate/controller';
import { BoundarySphereFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-boundary-sphere', TIMELINE, ({ root, context }) => {
  const drawing = new BoundarySphereFilm(root, context);

  return drawing;
});

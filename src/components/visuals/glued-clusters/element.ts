import { defineFilm } from '../../plate/controller';
import { GluedClustersFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-glued-clusters', TIMELINE, ({ root, context }) => {
  const drawing = new GluedClustersFilm(root, context);

  return drawing;
});

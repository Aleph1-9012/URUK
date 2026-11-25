import { defineFilm } from '../../plate/controller';
import { collectFilmLabels } from '../../plate/labels';
import { FractionNetsFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-fraction-nets', TIMELINE, ({ root, canvas }) => new FractionNetsFilm(canvas, collectFilmLabels(root)));

import { defineFilm } from '../../plate/controller';
import { collectFilmLabels } from '../../plate/labels';
import { CatalanFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-catalan-bounds', TIMELINE, ({ root, canvas }) => new CatalanFilm(canvas, collectFilmLabels(root)));

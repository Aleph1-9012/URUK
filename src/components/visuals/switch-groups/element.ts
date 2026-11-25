import { defineFilm } from '../../plate/controller';
import { collectFilmLabels } from '../../plate/labels';
import { SwitchFilm } from './film';
import { TIMELINE } from './story';

defineFilm('uruk-switch-groups', TIMELINE, ({ root, canvas }) => new SwitchFilm(canvas, collectFilmLabels(root)));

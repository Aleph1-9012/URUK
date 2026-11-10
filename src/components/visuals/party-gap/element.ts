import { defineFilm } from '../../plate/controller';
import { PartyGapFilm } from './film';
import { createPartyModel } from './math';
import { TIMELINE } from './story';

defineFilm('uruk-party-gap', TIMELINE, ({ root, canvas, context }) =>
  new PartyGapFilm(root, canvas, context, createPartyModel()));

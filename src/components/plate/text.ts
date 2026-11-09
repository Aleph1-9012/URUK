import { renderFormula } from '../../lib/formulas/render';

export type FilmCue = {
  readonly at: number;
  readonly text: string;
  readonly sources: readonly number[];
  readonly title?: string;
};

export type FilmScene = { readonly title: string; readonly first: number };

function escape(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function renderFilmText(text: string): string {
  const pieces: string[] = [];
  let position = 0;

  for (const match of text.matchAll(/\$([^$\n]+)\$([^\s$]*)/g)) {
    pieces.push(escape(text.slice(position, match.index)));
    pieces.push(`<span class="film-phrase">${renderFormula(match[1] ?? '', false)}${escape(match[2] ?? '')}</span>`);
    position = match.index + match[0].length;
  }

  pieces.push(escape(text.slice(position)));

  return pieces.join('');
}

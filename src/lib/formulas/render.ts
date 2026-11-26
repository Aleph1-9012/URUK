import temml from 'temml';
import { alignedFormula } from './break';

type ArticlePart = { type: 'text' | 'inlineMath'; value: string };

function mathMarkup(tex: string, display: boolean): string {
  return temml.renderToString(tex, { displayMode: display, throwOnError: true, strict: true, wrap: 'tex' });
}

function mathPieces(markup: string): string[] {
  const opening = /^<math\b[^>]*>/.exec(markup)?.[0];
  if (!opening || !markup.endsWith('</math>')) return [markup];

  const body = markup.slice(opening.length, -'</math>'.length);
  const pieces: string[] = [];
  let depth = 0;
  let start = 0;

  // Temml emits a complete MathML subtree at each TeX break point.
  for (const match of body.matchAll(/<\/?[a-z][\w:-]*(?:[^<>"']|"[^"]*"|'[^']*')*>/gi)) {
    const [tag] = match;
    if (tag.startsWith('</')) depth--;
    else if (!tag.endsWith('/>')) depth++;
    if (depth !== 0) continue;

    const end = match.index + tag.length;
    pieces.push(opening + body.slice(start, end) + '</math>');
    start = end;
  }

  return pieces.length > 1 && start === body.length ? pieces : [markup];
}

export function renderInlineArticleFormula(parts: readonly ArticlePart[]): string {
  const pieces: string[] = [];
  let joined = '';

  for (const { type, value } of parts) {
    if (type === 'text') {
      joined += value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      continue;
    }

    for (const [index, piece] of mathPieces(mathMarkup(value, false)).entries()) {
      if (index === 0) joined += piece;
      else {
        pieces.push(joined);
        joined = piece;
      }
    }
  }

  pieces.push(joined);
  const content = pieces.map(piece => `<span class="formula-inline__piece">${piece}</span>`).join('');

  return `<span class="formula-inline formula-inline--article"><span class="formula-inline__viewport">${content}</span></span>`;
}

export function renderFormula(tex: string, display: boolean): string {
  const single = mathMarkup(tex, display);

  if (!display) {
    return `<span class="formula-inline">${single.replace('<math>', '<math data-scroller>')}</span>`;
  }

  const broken = temml.renderToString(alignedFormula(tex), { displayMode: true, throwOnError: true, strict: true });

  return `<uruk-formula>
    <div class="formula-viewport" data-scroller tabindex="0" aria-label="Formula">
      <div class="formula-single">${single}</div>
      <div class="formula-broken" hidden>${broken}</div>
    </div>
    <span class="formula-hint" hidden>Scroll to read the formula <span aria-hidden="true"></span></span>
  </uruk-formula>`;
}

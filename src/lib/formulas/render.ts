import temml from 'temml';
import { alignedFormula } from './break';

export function renderFormula(tex: string, display: boolean): string {
  const single = temml.renderToString(tex, { displayMode: display, throwOnError: true, strict: true, wrap: 'tex' });

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

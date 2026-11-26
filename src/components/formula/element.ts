class UrukFormula extends HTMLElement {
  private observer: ResizeObserver | undefined;

  connectedCallback(): void {
    this.observer = new ResizeObserver(() => this.fit());
    this.observer.observe(this);
    void document.fonts.ready.then(() => this.fit());
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
  }

  private fit(): void {
    const single = this.querySelector<HTMLElement>('.formula-single');
    const broken = this.querySelector<HTMLElement>('.formula-broken');
    const viewport = this.querySelector<HTMLElement>('.formula-viewport');
    const hint = this.querySelector<HTMLElement>('.formula-hint');

    if (!single || !broken || !viewport || !hint) {
      return;
    }

    single.hidden = false;
    broken.hidden = true;

    if (single.scrollWidth > viewport.clientWidth) {
      single.hidden = true;
      broken.hidden = false;
    }

    const overflowing = viewport.scrollWidth > viewport.clientWidth;
    viewport.tabIndex = overflowing ? 0 : -1;
    hint.hidden = !overflowing;
  }
}

if (!customElements.get('uruk-formula')) {
  customElements.define('uruk-formula', UrukFormula);
}

const inlineFormulas = document.querySelectorAll<MathMLElement>('.formula-inline:not(.formula-inline--article) math');

function fitInlineFormula(math: Element): void {
  const overflowing = math.scrollWidth > math.clientWidth + 1;
  math.parentElement?.toggleAttribute('data-overflow', overflowing);

  if (overflowing) {
    math.setAttribute('tabindex', '0');
    math.setAttribute('aria-description', 'Scroll horizontally to read the full formula.');
  } else {
    math.removeAttribute('tabindex');
    math.removeAttribute('aria-description');
  }
}

const inlineObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    fitInlineFormula(entry.target);
  }
});

for (const math of inlineFormulas) {
  inlineObserver.observe(math);
  fitInlineFormula(math);
}

void document.fonts.ready.then(() => {
  for (const math of inlineFormulas) {
    fitInlineFormula(math);
  }
});

const articleObserver = new ResizeObserver((entries) => {
  const formulas = new Set<Element>();

  for (const { target } of entries) {
    const formula = target.closest('.formula-inline--article');
    if (formula) formulas.add(formula);
  }

  for (const formula of formulas) {
    const viewport = formula.querySelector('[data-formula-viewport]');
    if (!viewport) continue;

    const width = formula.getBoundingClientRect().width;
    const overflowing = Array.from(viewport.children).some(piece => piece.getBoundingClientRect().width > width + 1);
    formula.toggleAttribute('data-overflow', overflowing);
    viewport.toggleAttribute('data-scroller', overflowing);

    if (overflowing) {
      viewport.setAttribute('tabindex', '0');
      viewport.setAttribute('aria-description', 'Scroll horizontally to read the full formula.');
    } else {
      viewport.removeAttribute('tabindex');
      viewport.removeAttribute('aria-description');
    }
  }
});

for (const part of document.querySelectorAll('.formula-inline--article, .formula-inline__piece')) {
  articleObserver.observe(part);
}

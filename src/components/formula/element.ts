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

const inlineFormulas = document.querySelectorAll<MathMLElement>('.formula-inline math');

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

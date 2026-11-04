class UrukBackToTop extends HTMLElement {
  private controller: AbortController | undefined;
  private observer: IntersectionObserver | undefined;
  private footer: HTMLElement | null = null;
  private footerVisible = false;
  private footerAbove = false;
  private footerStateReady = false;

  private readonly update = () => {
    if (this.footer && !this.footerStateReady) {
      return;
    }

    const footerAtEnd =
      this.footerAbove ||
      (this.footerVisible &&
        this.footer !== null &&
        this.footer.getBoundingClientRect().bottom <= window.innerHeight + 1);
    const shouldFloat = window.scrollY > window.innerHeight && !footerAtEnd;

    this.toggleAttribute('data-floating', shouldFloat);
  };

  connectedCallback(): void {
    if (this.getAttribute('data-floating-enabled') === 'false') {
      this.removeAttribute('data-floating');

      return;
    }

    this.footer = document.querySelector<HTMLElement>('[data-page-footer]');
    this.footerStateReady = this.footer === null;

    if (this.footer) {
      this.observer = new IntersectionObserver((entries) => {
        const entry = entries[0];

        if (!entry) {
          return;
        }

        this.footerVisible = entry.isIntersecting;
        this.footerAbove = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
        this.footerStateReady = true;
        this.update();
      }, { threshold: 0 });
      this.observer.observe(this.footer);
    }

    this.controller = new AbortController();
    const { signal } = this.controller;
    window.addEventListener('scroll', this.update, { passive: true, signal });
    window.addEventListener('resize', this.update, { signal });
    this.update();
  }

  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = undefined;
    this.observer?.disconnect();
    this.observer = undefined;
    this.footer = null;
    this.footerVisible = false;
    this.footerAbove = false;
    this.footerStateReady = false;
  }
}

if (!customElements.get('uruk-back-to-top')) {
  customElements.define('uruk-back-to-top', UrukBackToTop);
}

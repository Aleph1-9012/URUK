class UrukBackToTop extends HTMLElement {
  private controller: AbortController | undefined;
  private observer: IntersectionObserver | undefined;
  private footer: HTMLElement | null = null;
  private roll: HTMLElement | null = null;

  private readonly update = () => {
    // The phone menu has no footer box; read current bounds when switching layouts.
    const footerBounds = this.footer?.getBoundingClientRect();
    const footerAtEnd = footerBounds !== undefined && footerBounds.height > 0 && footerBounds.bottom <= window.innerHeight + 1;
    const rollScrolled = this.roll !== null && this.roll.scrollTop > this.roll.clientHeight;
    const shouldFloat = (window.scrollY > window.innerHeight || rollScrolled) && !footerAtEnd;

    this.toggleAttribute('data-floating', shouldFloat);
  };

  connectedCallback(): void {
    this.controller = new AbortController();
    const { signal } = this.controller;
    this.roll = this.closest('uruk-menu')?.querySelector<HTMLElement>('.roll-window') ?? null;
    this.roll?.addEventListener('scroll', this.update, { passive: true, signal });
    this.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      if (event.target instanceof Element && event.target.closest('a[href="#top"]')) {
        this.roll?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    }, { signal });

    if (this.getAttribute('data-floating-enabled') === 'false') {
      this.removeAttribute('data-floating');

      return;
    }

    this.footer = document.querySelector<HTMLElement>('[data-page-footer]');

    if (this.footer) {
      this.observer = new IntersectionObserver(this.update, { threshold: 0 });
      this.observer.observe(this.footer);
    }

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
    this.roll = null;
  }
}

if (!customElements.get('uruk-back-to-top')) {
  customElements.define('uruk-back-to-top', UrukBackToTop);
}

// One turn per roughly 1,250 pixels keeps the rosette readable as it rolls.
const PIXELS_PER_RADIAN = 200;

class UrukBackToTop extends HTMLElement {
  private controller: AbortController | undefined;
  private observer: IntersectionObserver | undefined;
  private frame: number | undefined;
  private footer: HTMLElement | null = null;
  private roll: HTMLElementTagNameMap['uruk-roll'] | null = null;

  private readonly update = () => {
    this.frame ??= requestAnimationFrame(this.render);
  };

  private readonly render = () => {
    this.frame = undefined;
    const pageY = Math.max(0, window.scrollY);
    // The phone menu has no footer box; read current bounds when switching layouts.
    const footerBounds = this.footer?.getBoundingClientRect();
    const footerAtEnd = footerBounds !== undefined && footerBounds.height > 0 && footerBounds.bottom <= window.innerHeight + 1;
    const rollScrolled = this.roll?.scrolledBeyondPage ?? false;
    const canFloat = this.getAttribute('data-floating-enabled') !== 'false';
    const shouldFloat = canFloat && (pageY > window.innerHeight || rollScrolled) && !footerAtEnd;
    const distance = pageY + (this.roll?.verticalScrollOffset ?? 0);

    this.style.setProperty('--rosette-angle', `${distance / PIXELS_PER_RADIAN}rad`);
    this.toggleAttribute('data-floating', shouldFloat);
  };

  connectedCallback(): void {
    this.controller = new AbortController();
    const { signal } = this.controller;
    if (this.closest('uruk-menu')) {
      void customElements.whenDefined('uruk-roll').then(() => {
        if (signal.aborted) return;

        this.roll = this.closest('uruk-menu')?.querySelector('uruk-roll') ?? null;
        this.roll?.addEventListener('scroll', this.update, { capture: true, passive: true, signal });
        this.update();
      });
    }
    this.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      if (event.target instanceof Element && event.target.closest('a[href="#top"]')) {
        this.roll?.scrollToStart();
      }
    }, { signal });

    this.footer = this.closest('[data-page-footer]');

    if (this.footer) {
      this.observer = new IntersectionObserver(this.update, { threshold: 0 });
      this.observer.observe(this.footer);
    }

    window.addEventListener('scroll', this.update, { passive: true, signal });
    window.addEventListener('resize', this.update, { signal });
    this.render();
  }

  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = undefined;
    this.observer?.disconnect();
    this.observer = undefined;

    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
      this.frame = undefined;
    }

    this.footer = null;
    this.roll = null;
  }
}

if (!customElements.get('uruk-back-to-top')) {
  customElements.define('uruk-back-to-top', UrukBackToTop);
}

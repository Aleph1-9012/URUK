// One turn per roughly 1,250 pixels keeps the rosette readable as it rolls.
const PIXELS_PER_RADIAN = 200;
// A short page still reads as a glide; a long one never takes long to leave.
const GLIDE_SHORTEST_MS = 320;
const GLIDE_LONGEST_MS = 900;
const GLIDE_MS_PER_PIXEL = 0.1;

function easeInOut(progress: number): number {
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}

class UrukBackToTop extends HTMLElement {
  private controller: AbortController | undefined;
  private glide: AbortController | undefined;
  private glideFrame: number | undefined;
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
    const shouldFloat = (pageY > window.innerHeight || rollScrolled) && !footerAtEnd;
    const distance = pageY + (this.roll?.verticalScrollOffset ?? 0);

    this.style.setProperty('--rosette-angle', `${distance / PIXELS_PER_RADIAN}rad`);
    this.toggleAttribute('data-floating', shouldFloat);

    if (distance === 0) this.endGlide();
  };

  // The page glides up instead of jumping to the anchor, and the rosette rolls back with it.
  // Gecko keeps a native smooth window scroll running through the reader's wheel, so the page
  // glide is driven frame by frame and any input stops it where it is. The roll's native smooth
  // scroll respects its snap points and stops on input in every engine.
  private returnToTop(): void {
    this.endGlide();

    const from = window.scrollY;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      this.roll?.scrollToStart('instant');

      return;
    }

    const glide = new AbortController();
    const duration = Math.min(GLIDE_LONGEST_MS, GLIDE_SHORTEST_MS + from * GLIDE_MS_PER_PIXEL);
    let begin: number | undefined;
    const step = (now: number) => {
      begin ??= now;
      const progress = Math.min(1, (now - begin) / duration);

      window.scrollTo({ top: from * (1 - easeInOut(progress)), left: 0, behavior: 'instant' });
      this.glideFrame = progress < 1 ? requestAnimationFrame(step) : undefined;
    };
    const stop = () => {
      this.roll?.stopScroll();
      this.endGlide();
    };

    this.glide = glide;

    for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const) {
      window.addEventListener(type, stop, { capture: true, passive: true, signal: glide.signal });
    }

    this.roll?.scrollToStart('smooth');
    this.glideFrame = requestAnimationFrame(step);
  }

  private endGlide(): void {
    this.glide?.abort();
    this.glide = undefined;

    if (this.glideFrame !== undefined) {
      cancelAnimationFrame(this.glideFrame);
      this.glideFrame = undefined;
    }
  }

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
        event.preventDefault();
        this.returnToTop();
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
    this.endGlide();
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

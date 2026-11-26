interface Motion {
  reveal: Animation;
  peers: Animation[];
  from: number;
  to: number;
}

interface Projection {
  base: number;
  full: number;
  preview: number;
  anchored: boolean;
  siblings: Element[];
  scroll: number;
  texture: HTMLElement | undefined;
  textureStack: HTMLElement | undefined;
}

function projectedSiblings(panel: Element, page: Element, anchored: boolean, shift: number): Element[] {
  const siblings: Element[] = [];
  const neighbor = (node: Element) => anchored ? node.previousElementSibling : node.nextElementSibling;

  for (let branch: Element | null = panel; branch && branch !== page; branch = branch.parentElement) {
    for (let node = neighbor(branch); node; node = neighbor(node)) {
      if (node.matches('script, style, link, template, uruk-texture-field')) continue;
      if (node.matches('[data-page-footer]')) {
        // The floating back-to-top link must keep the viewport as its containing block.
        siblings.push(...node.querySelectorAll(':scope > :not(.site-footer__bottom), .site-footer__bottom > img, .back-to-top__rest'));
      } else siblings.push(node);
    }
  }

  if (!anchored) return siblings;

  // Don't put an off-screen film and every preceding section in compositor layers.
  return siblings.filter(sibling => {
    const { top, bottom } = sibling.getBoundingClientRect();
    return bottom + Math.max(0, shift) > -innerHeight && top + Math.min(0, shift) < innerHeight * 2;
  });
}

class UrukSources extends HTMLElement {
  private events: AbortController | undefined;

  connectedCallback(): void {
    const button = this.querySelector<HTMLButtonElement>('.sources-toggle');
    const panel = this.querySelector<HTMLElement>('.sources-panel');
    const preview = this.querySelector<HTMLElement>('.sources-preview');
    const sheet = this.querySelector<HTMLElement>('.sources-sheet');
    const table = this.querySelector<HTMLElement>('.sources-table');
    const edge = this.querySelector<HTMLElement>('.sources-edge');
    const label = this.querySelector('[data-sources-label]');
    const page = this.closest('.page-layout');

    if (this.events || !button || !panel || !preview || !sheet || !table || !edge || !label || !page) return;

    this.events = new AbortController();
    const { signal } = this.events;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;
    let motion: Motion | undefined;
    let projection: Projection | undefined;

    const setOpen = (open: boolean) => {
      this.toggleAttribute('data-open', open);
      button.setAttribute('aria-expanded', String(open));
      label.textContent = open ? 'Show fewer' : `Show all ${this.dataset.total} sources`;
    };
    const stop = () => {
      if (!motion) return;
      motion.reveal.cancel();
      for (const animation of motion.peers) animation.cancel();
      motion = undefined;
    };
    const finish = (anchor?: number) => {
      stop();
      panel.removeAttribute('data-moving');
      panel.removeAttribute('data-project-open');
      panel.style.removeProperty('height');
      sheet.style.removeProperty('transform');
      edge.style.removeProperty('transform');
      table.inert = false;
      projection?.texture?.style.removeProperty('min-height');
      projection = undefined;

      if (anchor !== undefined) {
        window.scrollBy({ top: button.getBoundingClientRect().top - anchor, behavior: 'instant' });
      }
      root.removeAttribute('data-sources-moving');
    };
    const openInstantly = () => {
      setOpen(true);
      finish();
    };
    const followHash = () => {
      if (!/^#source-\d+$/.test(location.hash)) return;

      openInstantly();
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
    };
    const toggle = () => {
      const open = !this.hasAttribute('data-open');

      if (reduced.matches) {
        const anchor = panel.getBoundingClientRect().top < 0 ? button.getBoundingClientRect().top : undefined;
        setOpen(open);
        finish(anchor);
        return;
      }

      if (!projection) {
        const bounds = panel.getBoundingClientRect();
        const anchored = bounds.top < 0;
        root.setAttribute('data-sources-moving', '');
        if (open) panel.setAttribute('data-project-open', '');
        panel.style.height = `${bounds.height}px`;
        panel.setAttribute('data-moving', '');
        table.inert = true;
        const full = table.getBoundingClientRect().height;
        const previewHeight = preview.getBoundingClientRect().height;
        const texture = anchored ? page.querySelector<HTMLElement>('uruk-texture-field') ?? undefined : undefined;
        const textureStack = Array.from(texture?.querySelectorAll<HTMLElement>('[data-texture-stack]') ?? [])
          .find(stack => getComputedStyle(stack).display !== 'none');
        if (texture && full > bounds.height) {
          texture.style.minHeight = `${texture.getBoundingClientRect().height + full - bounds.height}px`;
        }
        projection = {
          base: bounds.height, full, preview: previewHeight, anchored, scroll: window.scrollY,
          siblings: projectedSiblings(panel, page, anchored, bounds.height - (open ? full : previewHeight)), texture, textureStack,
        };
      }

      const { base, full, anchored, siblings, textureStack } = projection;
      const progress = motion?.reveal.effect?.getComputedTiming().progress ?? 0;
      const from = motion ? motion.from + (motion.to - motion.from) * progress : base;
      const to = open ? full : projection.preview;
      const distance = Math.abs(to - from);
      stop();
      setOpen(open);
      if (distance < 1) {
        finish(anchored ? button.getBoundingClientRect().top : undefined);
        return;
      }

      const timing = {
        duration: Math.min(420, 220 + distance * .18),
        easing: open ? 'cubic-bezier(.35, 0, .25, 1)' : 'cubic-bezier(.75, 0, .65, 1)',
        fill: 'both',
      } satisfies KeyframeAnimationOptions;
      const heights = [from, to];
      const travel = (height: number) => anchored ? base - height : height - base;
      const shift = (y: number) => `translate3d(0, ${y}px, 0)`;
      // Deep in the list, move the paper and everything above it instead of scrolling on every frame.
      // Move the inset and counter-translate the full table. Neither layer changes size.
      const reveal = table.animate({ transform: heights.map(height => shift(full - height)) }, timing);
      const peers: Animation[] = [];
      if (anchored) {
        sheet.style.transform = shift(base - full);
        edge.style.transform = shift(base - 1);
      } else {
        peers.push(
          sheet.animate({ transform: heights.map(height => shift(height - full)) }, timing),
          edge.animate({ transform: heights.map(height => shift(height - 1)) }, timing),
        );
      }
      const translate = heights.map(height => `0 ${travel(height)}px`);
      for (const sibling of siblings) peers.push(sibling.animate({ translate }, timing));
      // The texture's clip stays still so its translation doesn't invalidate the page's paint.
      if (textureStack) peers.push(textureStack.animate({ translate }, timing));
      motion = { reveal, peers, from, to };
      reveal.onfinish = () => {
        if (motion?.reveal === reveal) finish(anchored ? button.getBoundingClientRect().top : undefined);
      };
    };

    setOpen(new URLSearchParams(location.search).get('sources') === 'open');
    followHash();
    button.addEventListener('click', toggle, { signal });
    window.addEventListener('hashchange', followHash, { signal });
    reduced.addEventListener('change', () => {
      if (reduced.matches && motion) finish(projection?.anchored ? button.getBoundingClientRect().top : undefined);
    }, { signal });
    window.addEventListener('resize', () => {
      if (motion) finish(projection?.anchored ? button.getBoundingClientRect().top : undefined);
    }, { signal });
    window.addEventListener('scroll', () => {
      if (projection?.anchored && Math.abs(window.scrollY - projection.scroll) > innerHeight) {
        finish(button.getBoundingClientRect().top);
      }
    }, { passive: true, signal });
    document.addEventListener('click', (event) => {
      const link = event.target instanceof Element ? event.target.closest('a.citation') : null;

      if (link) openInstantly();
    }, { signal });
    signal.addEventListener('abort', () => finish(), { once: true });
  }

  disconnectedCallback(): void {
    this.events?.abort();
    this.events = undefined;
  }
}

if (!customElements.get('uruk-sources')) {
  customElements.define('uruk-sources', UrukSources);
}

const NUMERALS = ['I', 'II', 'III', 'IV'];

class UrukDig extends HTMLElement {
  private open = 1;
  private controls: HTMLElement | null = null;
  private ring: HTMLButtonElement | null = null;
  private status: HTMLElement | null = null;
  private layers: HTMLElement[] = [];

  private readonly onClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (event.target.closest('[data-dig-one]')) {
      this.reveal(this.open + 1);
    } else if (event.target.closest('[data-dig-all]')) {
      this.reveal(this.layers.length);
    }
  };

  connectedCallback(): void {
    this.layers = Array.from(this.querySelectorAll<HTMLElement>('[data-dig-layer]'));
    this.controls = this.querySelector<HTMLElement>('[data-dig-controls]');
    this.ring = this.querySelector<HTMLButtonElement>('button[data-dig-one]');
    this.status = this.querySelector<HTMLElement>('[data-dig-status]');
    this.addEventListener('click', this.onClick);
    this.render();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.onClick);
  }

  private reveal(next: number): void {
    const hadFocus = this.controls?.contains(document.activeElement) ?? false;

    for (const layer of this.layers.slice(this.open, next)) {
      layer.toggleAttribute('data-just-dug', true);
    }

    this.open = next;
    this.render();

    if (this.status) {
      this.status.textContent = this.open === this.layers.length
        ? 'All layers open.'
        : `Layer ${NUMERALS[this.open - 1]} open.`;
    }

    this.controls?.scrollIntoView({ block: 'nearest' });

    if (!hadFocus) {
      return;
    }

    // Moving the controls drops focus, and once every layer is open they are gone, so it goes to the last heading.
    if (this.open === this.layers.length) {
      this.layers.at(-1)?.querySelector('h3')?.focus({ preventScroll: true });
    } else {
      this.ring?.focus({ preventScroll: true });
    }
  }

  private render(): void {
    this.layers.forEach((layer, index) => {
      const closed = index >= this.open;

      for (const part of layer.querySelectorAll<HTMLElement>('[data-dig-buried]')) {
        part.hidden = closed;
      }
    });

    const last = this.layers[this.open - 1];

    if (!this.controls || !last) {
      return;
    }

    this.controls.hidden = this.open === this.layers.length;
    last.after(this.controls);
  }
}

if (!customElements.get('uruk-dig')) {
  customElements.define('uruk-dig', UrukDig);
}

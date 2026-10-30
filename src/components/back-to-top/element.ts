class UrukBackToTop extends HTMLElement {
  private readonly update = () => {
    const footer = document.querySelector<HTMLElement>('[data-page-footer]');
    const footerAtEnd =
      footer !== null &&
      footer.getBoundingClientRect().bottom <= window.innerHeight + 1;
    const floatingEnabled = this.getAttribute('data-floating-enabled') !== 'false';
    const shouldFloat = floatingEnabled && window.scrollY > window.innerHeight && !footerAtEnd;

    this.toggleAttribute('data-floating', shouldFloat);
  };

  connectedCallback(): void {
    window.addEventListener('scroll', this.update, { passive: true });
    window.addEventListener('resize', this.update);
    this.update();
  }

  disconnectedCallback(): void {
    window.removeEventListener('scroll', this.update);
    window.removeEventListener('resize', this.update);
  }
}

if (!customElements.get('uruk-back-to-top')) {
  customElements.define('uruk-back-to-top', UrukBackToTop);
}

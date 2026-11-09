type LabelSize = { width: number; height: number };

type LabelMargin = { horizontal: number; vertical: number };

export class FilmLabels {
  private readonly elements = new Map<string, HTMLElement>();
  private readonly sizes = new Map<string, LabelSize>();
  private readonly visible = new Set<string>();
  private width = 1;
  private height = 1;

  constructor(root: HTMLElement, private readonly margin: LabelMargin) {
    for (const element of root.querySelectorAll<HTMLElement>('[data-label]')) {
      if (element.dataset.label) this.elements.set(element.dataset.label, element);
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.sizes.clear();

    for (const [id, element] of this.elements) {
      const bounds = element.firstElementChild?.getBoundingClientRect();
      this.sizes.set(id, { width: bounds?.width ?? 0, height: bounds?.height ?? 0 });
    }
  }

  beginFrame(): void {
    this.visible.clear();
  }

  endFrame(): void {
    for (const [id, element] of this.elements) {
      if (!this.visible.has(id)) element.style.visibility = 'hidden';
    }
  }

  readonly place = (id: string, x: number, y: number, opacity = 1): void => {
    const element = this.elements.get(id);

    if (!element || opacity < .005) return;

    const size = this.sizes.get(id) ?? { width: 0, height: 0 };
    const left = Math.max(size.width / 2 + this.margin.horizontal, Math.min(this.width - size.width / 2 - this.margin.horizontal, x));
    const top = Math.max(size.height / 2 + this.margin.vertical, Math.min(this.height - size.height / 2 - this.margin.vertical, y));
    element.style.transform = `translate(${left}px,${top}px)`;
    element.style.visibility = 'visible';
    element.style.opacity = String(opacity);
    this.visible.add(id);
  };
}

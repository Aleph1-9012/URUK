import { drawExponent } from './exponent';
import { UnitSheet } from './sheet';

type Point = { x: number; y: number };

type Ink = 'ink' | 'blue' | 'muted' | 'paper';

export class UnitLinksFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly colors: Record<Ink, string> = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  private readonly labels = new Map<string, HTMLElement>();
  private readonly sizes = new Map<string, Point>();
  private readonly visible = new Set<string>();
  private readonly sheet: UnitSheet;

  constructor(host: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D) {
    this.sheet = new UnitSheet(pen);

    for (const label of host.querySelectorAll<HTMLElement>('[data-label]')) {
      if (label.dataset.label) this.labels.set(label.dataset.label, label);
    }
  }

  resize(width: number, height: number, density: number): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.canvas.width = Math.round(width * density);
    this.canvas.height = Math.round(height * density);
    const style = getComputedStyle(this.canvas);

    for (const key of ['ink', 'blue', 'muted', 'paper'] as const) {
      this.colors[key] = style.getPropertyValue(`--${key}`).trim() || this.colors[key];
    }

    for (const [id, label] of this.labels) {
      const rect = label.firstElementChild?.getBoundingClientRect();
      this.sizes.set(id, { x: rect?.width ?? 0, y: rect?.height ?? 0 });
    }
  }

  draw(time: number): void {
    this.visible.clear();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineCap = 'round';
    this.pen.lineJoin = 'round';
    this.sheet.draw(this.width, this.height, this.density, time, this.colors, this.label);
    drawExponent(this.pen, this.width, this.height, time, this.colors, this.label);

    for (const [id, label] of this.labels) {
      if (!this.visible.has(id)) label.style.visibility = 'hidden';
    }
  }

  private readonly label = (id: string, x: number, y: number, opacity = 1): void => {
    const label = this.labels.get(id);

    if (!label || opacity < .005) return;

    const size = this.sizes.get(id) ?? { x: 0, y: 0 };
    const left = Math.max(size.x / 2 + 6, Math.min(this.width - size.x / 2 - 6, x));
    const top = Math.max(size.y / 2 + 5, Math.min(this.height - size.y / 2 - 5, y));
    label.style.transform = `translate(${left}px,${top}px)`;
    label.style.visibility = 'visible';
    label.style.opacity = String(opacity);
    this.visible.add(id);
  };
}

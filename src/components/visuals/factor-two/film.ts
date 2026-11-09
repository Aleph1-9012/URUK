import { drawPlane } from './plane';
import { drawStretch } from './stretch';
import { drawScale } from './scale';

type Tone = 'ink' | 'blue' | 'muted' | 'paper';

type Extent = { width: number; height: number };

export class FactorTwoFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly colors: Record<Tone, string> = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  private readonly labels = new Map<string, HTMLElement>();
  private readonly extents = new Map<string, Extent>();
  private readonly visible = new Set<string>();

  constructor(host: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D) {
    for (const label of host.querySelectorAll<HTMLElement>('[data-label]')) {
      const id = label.dataset.label;

      if (id) this.labels.set(id, label);
    }
  }

  resize(width: number, height: number, density: number): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.canvas.width = Math.round(width * density);
    this.canvas.height = Math.round(height * density);
    const style = getComputedStyle(this.canvas);

    for (const tone of ['ink', 'blue', 'muted', 'paper'] as const) {
      this.colors[tone] = style.getPropertyValue(`--${tone}`).trim() || this.colors[tone];
    }

    this.measureLabels();
  }

  measureLabels(): void {
    this.extents.clear();

    for (const [id, label] of this.labels) {
      const rect = label.firstElementChild?.getBoundingClientRect();
      this.extents.set(id, { width: rect?.width ?? 0, height: rect?.height ?? 0 });
    }
  }

  draw(time: number): void {
    this.visible.clear();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineCap = 'round';
    this.pen.lineJoin = 'round';
    drawPlane(this.pen, this.width, this.height, time, this.colors, this.label);
    drawStretch(this.pen, this.width, this.height, time, this.colors, this.label);
    drawScale(this.pen, this.width, this.height, time, this.colors, this.label);

    for (const [id, label] of this.labels) {
      if (!this.visible.has(id)) label.style.visibility = 'hidden';
    }
  }

  private readonly label = (id: string, x: number, y: number, opacity = 1): void => {
    const label = this.labels.get(id);

    if (!label || opacity < .005) return;

    const extent = this.extents.get(id) ?? { width: 0, height: 0 };
    const left = Math.max(extent.width / 2 + 6, Math.min(this.width - extent.width / 2 - 6, x));
    const top = Math.max(extent.height / 2 + 5, Math.min(this.height - extent.height / 2 - 5, y));
    label.style.transform = `translate(${left}px,${top}px)`;
    label.style.visibility = 'visible';
    label.style.opacity = String(opacity);
    this.visible.add(id);
  };
}

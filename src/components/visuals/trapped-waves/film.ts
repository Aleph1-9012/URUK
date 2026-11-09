import { createWaveData, applyWaveMessage, type WaveWorkerMessage } from './data';
import { drawWaveGrid } from './grid';
import { drawDisorderMap } from './map';

type Ink = 'ink' | 'blue' | 'muted' | 'paper';

type Size = { width: number; height: number };

export class TrappedWavesFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly data = createWaveData();
  private colors: Record<Ink, string> = { ink: '#28241f', blue: '#28486e', muted: '#777067', paper: '#e7e5e0' };
  private readonly labels = new Map<string, HTMLElement>();
  private readonly sizes = new Map<string, Size>();
  private readonly visible = new Set<string>();

  constructor(host: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D) {
    for (const label of host.querySelectorAll<HTMLElement>('[data-label]')) {
      if (label.dataset.label) this.labels.set(label.dataset.label, label);
    }
  }

  setData(message: WaveWorkerMessage): void {
    applyWaveMessage(this.data, message);
  }

  resize(width: number, height: number, density: number): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.canvas.width = Math.round(width * density);
    this.canvas.height = Math.round(height * density);
    const style = getComputedStyle(this.canvas);

    for (const key of ['ink', 'blue', 'muted', 'paper'] as const) this.colors[key] = style.getPropertyValue(`--${key}`).trim() || this.colors[key];

    this.measureLabels();
  }

  measureLabels(): void {
    this.sizes.clear();

    for (const [id, label] of this.labels) {
      const rect = label.firstElementChild?.getBoundingClientRect();
      this.sizes.set(id, { width: rect?.width ?? 0, height: rect?.height ?? 0 });
    }
  }

  draw(time: number): void {
    this.visible.clear();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineCap = 'round';
    this.pen.lineJoin = 'round';
    drawWaveGrid(this.pen, this.width, this.height, time, this.colors, this.data, (id, x, y, alpha) => this.label(id, x, y, alpha));
    drawDisorderMap(this.pen, this.width, this.height, time, this.colors, (id, x, y, alpha) => this.label(id, x, y, alpha));

    for (const [id, label] of this.labels) {
      if (!this.visible.has(id)) label.style.visibility = 'hidden';
    }
  }

  private label(id: string, x: number, y: number, alpha = 1): void {
    const label = this.labels.get(id);

    if (!label || alpha < .005) return;

    const size = this.sizes.get(id) ?? { width: 0, height: 0 };
    label.style.transform = `translate(${Math.max(size.width / 2 + 7, Math.min(this.width - size.width / 2 - 7, x))}px,${Math.max(size.height / 2 + 6, Math.min(this.height - size.height / 2 - 6, y))}px)`;
    label.style.visibility = 'visible';
    label.style.opacity = String(alpha);
    this.visible.add(id);
  }
}

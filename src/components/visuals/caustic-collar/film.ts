import { applyCausticMessage, createCausticData, type CausticWorkerMessage } from './data';
import { drawTable } from './table';
import { drawPhase } from './phase';
import { drawLedger } from './ledger';

type Tone = 'ink' | 'blue' | 'muted' | 'paper';

export class CausticCollarFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly data = createCausticData();
  private readonly colors: Record<Tone, string> = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  private readonly labels = new Map<string, HTMLElement>();
  private readonly sizes = new Map<string, { w: number; h: number }>();
  private readonly visible = new Set<string>();

  constructor(host: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D) {
    for (const label of host.querySelectorAll<HTMLElement>('[data-label]')) {
      if (label.dataset.label) this.labels.set(label.dataset.label, label);
    }
  }

  setData(message: CausticWorkerMessage): void {
    applyCausticMessage(this.data, message);
  }

  resize(width: number, height: number, density: number): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.canvas.width = Math.round(width * density);
    this.canvas.height = Math.round(height * density);
    const style = getComputedStyle(this.canvas);

    for (const tone of ['ink', 'blue', 'muted', 'paper'] as const) this.colors[tone] = style.getPropertyValue(`--${tone}`).trim() || this.colors[tone];

    this.measureLabels();
  }

  measureLabels(): void {
    this.sizes.clear();

    for (const [id, label] of this.labels) {
      const rect = label.firstElementChild?.getBoundingClientRect();
      this.sizes.set(id, { w: rect?.width ?? 0, h: rect?.height ?? 0 });
    }
  }

  draw(time: number): void {
    this.visible.clear();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineCap = 'round';
    this.pen.lineJoin = 'round';
    drawTable(this.pen, this.width, this.height, this.density, time, this.colors, this.label, this.data);
    drawPhase(this.pen, this.width, this.height, this.density, time, this.colors, this.label, this.data);
    drawLedger(this.pen, this.width, this.height, time, this.colors, this.label, this.data);

    for (const [id, label] of this.labels) {
      if (!this.visible.has(id)) label.style.visibility = 'hidden';
    }
  }

  private readonly label = (id: string, x: number, y: number, opacity = 1): void => {
    const label = this.labels.get(id);

    if (!label || opacity < .005) return;

    const size = this.sizes.get(id) ?? { w: 0, h: 0 };
    const px = Math.max(size.w / 2 + 6, Math.min(this.width - size.w / 2 - 6, x));
    const py = Math.max(size.h / 2 + 5, Math.min(this.height - size.h / 2 - 5, y));
    label.style.transform = `translate(${px}px,${py}px)`;
    label.style.visibility = 'visible';
    label.style.opacity = String(opacity);
    this.visible.add(id);
  };
}

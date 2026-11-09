import { FilmLabels } from '../../plate/labels';
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
  private readonly labels: FilmLabels;

  constructor(host: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(host, { horizontal: 6, vertical: 5 });
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

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    this.labels.beginFrame();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineCap = 'round';
    this.pen.lineJoin = 'round';
    drawTable(this.pen, this.width, this.height, this.density, time, this.colors, this.labels.place, this.data);
    drawPhase(this.pen, this.width, this.height, this.density, time, this.colors, this.labels.place, this.data);
    drawLedger(this.pen, this.width, this.height, time, this.colors, this.labels.place, this.data);

    this.labels.endFrame();
  }

}

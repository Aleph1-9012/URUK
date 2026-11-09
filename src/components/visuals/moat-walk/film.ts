import { FilmLabels } from '../../plate/labels';
import { applyMoatMessage, createMoatData, type MoatWorkerMessage } from './data';
import { drawField } from './field';
import { drawSieve } from './sieve';
import { drawDial } from './dial';
import { drawLedger } from './ledger';

type Tone = 'ink' | 'blue' | 'muted' | 'paper';

export class MoatWalkFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly data = createMoatData();
  private readonly colors: Record<Tone, string> = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  private readonly labels: FilmLabels;

  constructor(host: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(host, { horizontal: 6, vertical: 5 });
  }

  setData(message: MoatWorkerMessage): void {
    applyMoatMessage(this.data, message);
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

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    this.labels.beginFrame();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineCap = 'round';
    this.pen.lineJoin = 'round';
    drawField(this.pen, this.width, this.height, this.density, time, this.colors, this.labels.place, this.data);
    drawSieve(this.pen, this.width, this.height, this.density, time, this.colors, this.labels.place, this.data);
    drawDial(this.pen, this.width, this.height, time, this.colors, this.labels.place);
    drawLedger(this.pen, this.width, this.height, time, this.colors, this.labels.place, this.data);

    this.labels.endFrame();
  }

}

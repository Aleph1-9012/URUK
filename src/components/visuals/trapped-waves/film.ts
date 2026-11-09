import { FilmLabels } from '../../plate/labels';
import { createWaveData, applyWaveMessage, type WaveWorkerMessage } from './data';
import { drawWaveGrid } from './grid';
import { drawDisorderMap } from './map';

type Ink = 'ink' | 'blue' | 'muted' | 'paper';

export class TrappedWavesFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly data = createWaveData();
  private colors: Record<Ink, string> = { ink: '#28241f', blue: '#28486e', muted: '#777067', paper: '#e7e5e0' };
  private readonly labels: FilmLabels;

  constructor(host: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(host, { horizontal: 7, vertical: 6 });
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

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    this.labels.beginFrame();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineCap = 'round';
    this.pen.lineJoin = 'round';
    drawWaveGrid(this.pen, this.width, this.height, time, this.colors, this.data, (id, x, y, alpha) => this.labels.place(id, x, y, alpha));
    drawDisorderMap(this.pen, this.width, this.height, time, this.colors, (id, x, y, alpha) => this.labels.place(id, x, y, alpha));

    this.labels.endFrame();
  }

}

import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
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
  private colors: Record<Ink, string> = PAGE_TONES;
  private readonly labels: FilmLabels;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 7, vertical: 6 });
  }

  setData(message: Exclude<WaveWorkerMessage, { kind: 'complete' | 'error' }>): void {
    applyWaveMessage(this.data, message);
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.colors = tones;

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

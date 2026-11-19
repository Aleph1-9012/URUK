import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
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
  private colors: Record<Tone, string> = PAGE_TONES;
  private readonly labels: FilmLabels;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 6, vertical: 5 });
  }

  setData(message: Exclude<CausticWorkerMessage, { kind: 'complete' | 'error' }>): void {
    applyCausticMessage(this.data, message);
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
    drawTable(this.pen, this.width, this.height, this.density, time, this.colors, this.labels.place, this.data);
    drawPhase(this.pen, this.width, this.height, this.density, time, this.colors, this.labels.place, this.data);
    drawLedger(this.pen, this.width, this.height, time, this.colors, this.labels.place, this.data);

    this.labels.endFrame();
  }

}

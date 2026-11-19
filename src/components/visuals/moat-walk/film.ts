import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
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
  private colors: Record<Tone, string> = PAGE_TONES;
  private readonly labels: FilmLabels;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 6, vertical: 5 });
  }

  setData(message: Exclude<MoatWorkerMessage, { kind: 'complete' | 'error' }>): void {
    applyMoatMessage(this.data, message);
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
    drawField(this.pen, this.width, this.height, this.density, time, this.colors, this.labels.place, this.data);
    drawSieve(this.pen, this.width, this.height, this.density, time, this.colors, this.labels.place, this.data);
    drawDial(this.pen, this.width, this.height, time, this.colors, this.labels.place);
    drawLedger(this.pen, this.width, this.height, time, this.colors, this.labels.place, this.data);

    this.labels.endFrame();
  }

}

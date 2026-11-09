import { FilmLabels } from '../../plate/labels';
import { drawStage, type Colors } from './stage';
import { drawCounterexamples } from './counterexamples';
import { drawChart, drawLedger } from './panels';
import { layout } from './story';
import { cacheReference } from './math';
import type { ModeNumerics, SilentWorkerMessage } from './transport';

export class SilentLinesFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  private readonly labels: FilmLabels;
  private readonly numerics: (ModeNumerics | undefined)[] = [];

  constructor(root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 6, vertical: 5 });
  }

  setData(message: SilentWorkerMessage): void {
    if (message.kind !== 'mode') return;

    cacheReference(message.reference);
    this.numerics[message.index] = { contour: message.contour, tracks: message.tracks, reference: message.reference };
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
    const boxes = layout(this.width, this.height, time);
    this.labels.beginFrame();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineCap = 'round';
    this.pen.lineJoin = 'round';
    drawStage(this.pen, boxes.stage, time, this.colors, this.labels.place, this.numerics);
    drawCounterexamples(this.pen, boxes.stage, time, this.colors, this.labels.place, this.numerics);
    drawChart(this.pen, boxes.chart, time, this.colors, this.labels.place, this.numerics, boxes.stage);
    drawLedger(this.pen, boxes.ledger, time, this.colors);
    this.labels.endFrame();
  }
}

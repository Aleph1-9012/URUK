import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { graphState } from './math';
import { drawGraph } from './graph';
import { drawGauge } from './gauge';

type Tone = 'ink' | 'blue' | 'muted' | 'paper';

export class FewestCrossingsFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private colors: Record<Tone, string> = PAGE_TONES;
  private readonly labels: FilmLabels;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 6, vertical: 5 });
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.colors = tones;

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    const state = graphState(time);
    this.labels.beginFrame();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineCap = 'round';
    this.pen.lineJoin = 'round';
    drawGraph(this.pen, this.width, this.height, time, this.colors, this.labels.place, state);
    drawGauge(this.pen, this.width, this.height, time, this.colors, this.labels.place, state);

    this.labels.endFrame();
  }

}

import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawStage, type Colors } from './stage';
import { drawRuler } from './panels';
import { layout } from './story';

export class SmallestTrianglesFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private colors: Colors = PAGE_TONES;
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
    const boxes = layout(this.width, this.height);
    this.labels.beginFrame();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineCap = 'round';
    this.pen.lineJoin = 'round';
    drawStage(this.pen, boxes.stage, boxes.readout, time, this.colors, this.labels.place);
    drawRuler(this.pen, boxes.ruler, time, this.colors, this.labels.place, boxes.readout);
    this.labels.endFrame();
  }
}

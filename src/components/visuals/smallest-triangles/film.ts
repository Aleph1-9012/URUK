import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawStage, type Colors } from './stage';
import { drawRuler } from './panels';
import { layout } from './story';
import { smooth } from '../../../lib/animation';

export class SmallestTrianglesFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private colors: Colors = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly labelMargin = { horizontal: 6, vertical: 5 };

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, this.labelMargin);
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
    this.labelMargin.vertical = boxes.tall ? 5 - 4 * smooth(time, 70000, 71100) : 5;
    this.labels.beginFrame();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineCap = 'round';
    this.pen.lineJoin = 'round';
    drawStage(this.pen, boxes.stage, boxes.readout, time, this.colors, this.labels.place, this.width);
    drawRuler(this.pen, boxes.ruler, time, this.colors, this.labels.place, boxes.readout, boxes.tall);
    this.labels.endFrame();
  }
}

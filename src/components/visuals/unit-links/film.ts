import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawExponent } from './exponent';
import { UnitSheet } from './sheet';

type Ink = 'ink' | 'blue' | 'muted' | 'paper';

export class UnitLinksFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private colors: Record<Ink, string> = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly sheet: UnitSheet;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.sheet = new UnitSheet(pen);

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
    this.labels.beginFrame();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineCap = 'round';
    this.pen.lineJoin = 'round';
    this.sheet.draw(this.width, this.height, this.density, time, this.colors, this.labels.place);
    drawExponent(this.pen, this.width, this.height, time, this.colors, this.labels.place);

    this.labels.endFrame();
  }

}

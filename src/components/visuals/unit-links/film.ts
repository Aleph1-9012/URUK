import { FilmLabels } from '../../plate/labels';
import { drawExponent } from './exponent';
import { UnitSheet } from './sheet';

type Ink = 'ink' | 'blue' | 'muted' | 'paper';

export class UnitLinksFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly colors: Record<Ink, string> = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  private readonly labels: FilmLabels;
  private readonly sheet: UnitSheet;

  constructor(host: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D) {
    this.sheet = new UnitSheet(pen);

    this.labels = new FilmLabels(host, { horizontal: 6, vertical: 5 });
  }

  resize(width: number, height: number, density: number): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.canvas.width = Math.round(width * density);
    this.canvas.height = Math.round(height * density);
    const style = getComputedStyle(this.canvas);

    for (const key of ['ink', 'blue', 'muted', 'paper'] as const) {
      this.colors[key] = style.getPropertyValue(`--${key}`).trim() || this.colors[key];
    }

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

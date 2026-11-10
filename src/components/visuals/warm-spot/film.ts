import { mix, smooth } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { type Box, type Colors, line, stippleSample, text } from './drawing';
import { contours, extrema, fieldSample, gradients, normalizeField, type Point, type WarmModel } from './math';
import { drawPanels } from './panels';
import { heatTime, insetProgress, layout, modeProgress } from './story';

type Camera = { x: number; y: number; scale: number };

type DisplayField = { values: Float64Array; hot: number; cold: number; amplitude: number };

const LEVELS = [-.75, -.5, -.25, 0, .25, .5, .75];

function flat(point: Point, camera: Camera): Point {
  return { x: camera.x + point.x * camera.scale, y: camera.y - point.y * camera.scale };
}

function pointAt(points: readonly Point[], index: number): Point {
  const point = points[index];

  if (!point) throw new Error('Every thermal cell has its computed location.');

  return point;
}

export class WarmSpotFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  private readonly modeValues: Float64Array;
  private readonly initialSpread: number;
  private readonly modeGradients: ReturnType<typeof gradients>;

  constructor(private readonly root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D, private readonly model: WarmModel) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 4 });
    this.modeValues = normalizeField(model.phi1);
    this.initialSpread = extrema(model.u0).spread;
    this.modeGradients = gradients(model, model.phi1, true);
  }

  resize(width: number, height: number, density: number): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.canvas.width = Math.round(width * density);
    this.canvas.height = Math.round(height * density);
    const style = getComputedStyle(this.root);

    for (const tone of ['ink', 'blue', 'muted', 'paper'] as const) this.colors[tone] = style.getPropertyValue(`--${tone}`).trim() || this.colors[tone];

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    const { pen, colors } = this;
    const boxes = layout(this.width, this.height, time);
    this.labels.beginFrame();
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, this.width, this.height);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    const display = this.displayField(time);
    this.plate(boxes.stage, display, time, boxes.tall);
    drawPanels(pen, boxes.panel, time, colors, this.labels.place, this.model, boxes.tall);
    this.labels.endFrame();
  }

  private displayField(time: number): DisplayField {
    if (time >= 21000) {
      const values = this.modeValues;

      return { values, ...extrema(values), amplitude: 1 };
    }

    const sample = fieldSample(this.model, heatTime(time));
    const amount = modeProgress(time);

    if (time >= 20250 && sample.kind === 'initial') {
      const values = this.modeValues;

      return { values, ...extrema(values), amplitude: 1 };
    }

    const values = normalizeField(sample.values);

    if (amount > 0) {
      for (let index = 0; index < values.length; index++) {
        const value = values[index];
        const target = this.modeValues[index];

        if (value === undefined || target === undefined) throw new Error('The heat and first-mode grids have the same cells.');

        values[index] = mix(value, target, amount);
      }
    }

    const contrast = Math.pow(sample.spread / this.initialSpread, .25);

    return { values, ...extrema(values), amplitude: mix(contrast, 1, amount) };
  }

  private camera(box: Box): Camera {
    const points = this.model.boundary;
    const minX = Math.min(...points.map(point => point.x));
    const maxX = Math.max(...points.map(point => point.x));
    const minY = Math.min(...points.map(point => point.y));
    const maxY = Math.max(...points.map(point => point.y));
    const scale = Math.min((box.w - 20) / (maxX - minX + .18), (box.h - 40) / (maxY - minY + .18));

    return { x: box.x + box.w / 2 - (minX + maxX) / 2 * scale, y: box.y + box.h / 2 + (minY + maxY) / 2 * scale, scale };
  }

  private outline(camera: Camera, amount: number, factor = 1): void {
    const { pen, model } = this;
    const count = model.boundary.length;
    const coordinate = amount * count;
    pen.beginPath();

    for (let index = 0; index <= Math.floor(coordinate); index++) {
      const world = pointAt(model.boundary, index % count);
      const point = flat({ x: world.x * factor, y: world.y * factor }, camera);

      if (index === 0) pen.moveTo(point.x, point.y);
      else pen.lineTo(point.x, point.y);
    }

    if (amount < 1) {
      const index = Math.floor(coordinate);
      const a = pointAt(model.boundary, index % count);
      const b = pointAt(model.boundary, (index + 1) % count);
      const fraction = coordinate - index;
      const point = flat({ x: mix(a.x, b.x, fraction) * factor, y: mix(a.y, b.y, fraction) * factor }, camera);
      pen.lineTo(point.x, point.y);
    } else pen.closePath();

    pen.stroke();
  }

  private clipPlate(camera: Camera): void {
    const { pen } = this;
    pen.beginPath();

    for (const [index, point] of this.model.boundary.entries()) {
      const target = flat(point, camera);

      if (index === 0) pen.moveTo(target.x, target.y);
      else pen.lineTo(target.x, target.y);
    }

    pen.closePath();
    pen.clip();
  }

  private plate(box: Box, display: DisplayField, time: number, tall: boolean): void {
    const { pen, colors, model } = this;
    const camera = this.camera(box);
    const reveal = smooth(time, 500, 3800);
    pen.save();
    this.clipPlate(camera);
    pen.fillStyle = colors.ink;
    pen.globalAlpha = .40;
    const radius = tall ? .45 : .55;

    for (const [index, cell] of model.cells.entries()) {
      const value = display.values[index];

      if (value === undefined) throw new Error('Every stippled cell has its displayed temperature.');

      const intensity = .34 + .33 * value * display.amplitude;

      for (let dot = 0; dot < 2; dot++) {
        const grain = stippleSample(index, dot);

        if (grain.threshold > intensity || grain.reveal > reveal) continue;

        const jitter = { x: cell.x + grain.x * model.h, y: cell.y + grain.y * model.h };
        const point = flat(jitter, camera);
        pen.beginPath();
        pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
        pen.fill();
      }
    }

    pen.globalAlpha = display.amplitude;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = tall ? .8 : 1;
    const contourReveal = smooth(time, 800, 4200);

    for (const segment of contours(model, display.values, LEVELS)) {
      const a = flat(segment.a, camera);
      const b = flat(segment.b, camera);
      line(pen, a.x, a.y, b.x, b.y, contourReveal);
    }

    pen.restore();
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1.2;
    this.outline(camera, smooth(time, 0, 1800));
    pen.lineWidth = .65;
    this.outline(camera, smooth(time, 200, 2000), 1.035);

    if (time >= 43000) {
      pen.strokeStyle = colors.blue;
      pen.lineWidth = tall ? 3 : 4;
      this.outline(camera, smooth(time, 43000, 45300), 1.017);
      this.arrows(camera, time, tall);
    }

    if (time >= 1200) {
      this.ring(flat(pointAt(model.cells, display.hot), camera), true, tall);
      this.ring(flat(pointAt(model.cells, display.cold), camera), false, tall);
    }

    const header = time >= 43000 ? 'GRADIENT DIRECTIONS' : time >= 8000 && time < 20250 ? 'CELL EXTREMA' : 'INSULATED EDGE';
    text(pen, header, box.x + box.w / 2, box.y + 6, tall ? 10 : 15, box.w - 4, colors);

    if (time >= 29000 && time < 36000) this.holes(box, time, tall);
  }

  private ring(point: Point, hot: boolean, tall: boolean): void {
    const { pen, colors } = this;
    const radius = tall ? 5.7 : 8;
    pen.fillStyle = colors.paper;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1.6;
    pen.beginPath();
    pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    pen.fill();
    pen.stroke();
    const half = tall ? 2.4 : 3.4;
    line(pen, point.x - half, point.y, point.x + half, point.y);

    if (hot) line(pen, point.x, point.y - half, point.x, point.y + half);
  }

  private arrows(camera: Camera, time: number, tall: boolean): void {
    const { pen, colors, model } = this;
    const stride = tall ? 6 : 4;
    const selected = this.modeGradients.filter(gradient => {
      const cell = model.cellIndices[gradient.index];

      if (!cell) throw new Error('A gradient arrow belongs to its grid cell.');

      return cell.row % stride === 0 && cell.col % stride === 0;
    });
    const growth = smooth(time, 43300, 47500);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = tall ? .9 : 1.1;

    for (const [index, gradient] of selected.entries()) {
      const amount = Math.max(0, Math.min(1, growth * selected.length - index));

      if (amount === 0) continue;

      const point = flat(gradient.point, camera);
      const length = (tall ? 9 : 15) * amount;
      const dx = gradient.x / gradient.magnitude;
      const dy = -gradient.y / gradient.magnitude;
      const tip = { x: point.x + dx * length / 2, y: point.y + dy * length / 2 };
      line(pen, point.x - dx * length / 2, point.y - dy * length / 2, tip.x, tip.y);
      const head = (tall ? 2.3 : 3.5) * amount;
      line(pen, tip.x, tip.y, tip.x - dx * head - dy * head * .6, tip.y - dy * head + dx * head * .6);
      line(pen, tip.x, tip.y, tip.x - dx * head + dy * head * .6, tip.y - dy * head - dx * head * .6);
    }
  }

  private holes(box: Box, time: number, tall: boolean): void {
    const { pen, colors } = this;
    const entrance = insetProgress(time);
    const width = box.w * .43;
    const height = box.h * .40;
    const left = box.x + box.w - width + (1 - entrance) * (width + 40);
    const top = box.y + box.h - height;
    pen.save();
    pen.beginPath();
    pen.rect(box.x, box.y, box.w, box.h);
    pen.clip();
    pen.fillStyle = colors.paper;
    pen.fillRect(left, top, width, height);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .7;
    pen.strokeRect(left, top, width, height);
    const x = left + width / 2;
    const y = top + height * .51;
    pen.beginPath();
    pen.ellipse(x, y, width * .37, height * .28, 0, 0, Math.PI * 2);
    pen.stroke();

    for (const side of [-1, 1]) {
      pen.beginPath();
      pen.ellipse(x + side * width * .17, y - height * .05, width * .075, height * .09, 0, 0, Math.PI * 2);
      pen.stroke();
    }

    this.ring({ x, y: y + height * .12 }, true, tall);

    if (entrance === 1) {
      text(pen, 'WITH HOLES', x, top + 9, tall ? 8.5 : 12, width - 6, colors);
      text(pen, 'SCHEMATIC', x, top + height - 8, tall ? 8 : 11, width - 6, colors);
    }

    pen.restore();
  }
}

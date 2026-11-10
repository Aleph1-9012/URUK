import { smooth } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { type DistanceModel, type DistancePair, type Point3 } from './math';
import { type Box, type Colors, type CubeLayout, type Point, comparisonBoxes, cubeLayout, line, projectPoint, tallyLayout, tallyPoint, text } from './drawing';
import { cameraAngle, flattenProgress, layout, nodeProgress, randomProgress, tallyProgress } from './story';
import { drawPanels } from './panels';

type Phase = 'cube' | 'flattening' | 'plane' | 'returning';

function phaseAt(time: number): Phase {
  if (time >= 34500 && time < 37500) return 'flattening';
  if (time >= 37500 && time <= 40500) return 'plane';
  if (time > 40500 && time < 44500) return 'returning';

  return 'cube';
}

export class FewDistancesFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };

  constructor(private readonly root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D, private readonly model: DistanceModel) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 4 });
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
    const { pen } = this;
    const boxes = layout(this.width, this.height, time);
    const phase = phaseAt(time);
    const amount = randomProgress(time);
    const comparison = comparisonBoxes(boxes.stage, amount);
    const angle = cameraAngle(time);
    const geometry = cubeLayout(comparison.grid, boxes.tall);
    const flat = flattenProgress(time);
    const source = phase === 'plane' ? this.model.plane.points : this.model.grid;
    this.labels.beginFrame();
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, this.width, this.height);
    pen.lineJoin = 'round';
    pen.lineCap = 'round';
    pen.setLineDash([]);
    this.frame(geometry, angle, 1 - flat);

    if (phase === 'cube' && amount === 0 && time >= 4000 && time < 13000) this.example(geometry, angle, time, boxes.stage, boxes.tall);
    if (phase === 'cube' && amount === 0 && time >= 15000 && time < 25000) this.repeated(geometry, angle, boxes.tall);

    this.cloud(source, geometry, angle, 1 - flat, nodeProgress(time));

    if (amount > 0) {
      const randomGeometry = cubeLayout(comparison.random, boxes.tall);
      randomGeometry.scale *= amount;
      randomGeometry.pointRadius *= amount;
      this.frame(randomGeometry, angle, 1);
      this.cloud(this.model.random, randomGeometry, angle, 1, amount);

      if (amount === 1) this.ordinal(comparison.random, boxes.stage, boxes.tall);
    }

    this.headings(boxes.stage, time, phase, amount, boxes.tall);
    this.tally(boxes.stage, time, phase, boxes.tall);
    drawPanels(pen, boxes.panel, time, this.colors, this.labels.place, this.model, boxes.tall);
    this.labels.endFrame();
  }

  private cloud(points: readonly Point3[], geometry: CubeLayout, angle: number, vertical: number, amount: number): void {
    const { pen, colors } = this;
    const clock = points.length * amount;
    pen.fillStyle = colors.ink;

    for (const [index, point] of points.entries()) {
      const shown = Math.max(0, Math.min(1, clock - index));

      if (shown <= 0) continue;

      const at = projectPoint(point, geometry, angle, vertical);
      pen.beginPath();
      pen.arc(at.x, at.y, Math.max(.01, geometry.pointRadius * shown), 0, Math.PI * 2);
      pen.fill();
    }
  }

  private frame(geometry: CubeLayout, angle: number, vertical: number): void {
    const { pen, colors } = this;
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .45;

    for (let corner = 0; corner < 8; corner++) {
      const point = { x: corner & 1 ? 4 : 0, y: corner & 2 ? 4 : 0, z: corner & 4 ? 4 : 0 };

      for (let bit = 0; bit < 3; bit++) {
        const other = corner ^ (1 << bit);

        if (other < corner) continue;

        const next = { x: other & 1 ? 4 : 0, y: other & 2 ? 4 : 0, z: other & 4 ? 4 : 0 };
        const a = projectPoint(point, geometry, angle, vertical);
        const b = projectPoint(next, geometry, angle, vertical);
        line(pen, a.x, a.y, b.x, b.y);
      }
    }
  }

  private pair(pair: DistancePair, geometry: CubeLayout, angle: number, width: number): { first: Point; last: Point } {
    const a = this.model.grid[pair.a];
    const b = this.model.grid[pair.b];

    if (!a || !b) throw new Error('Every illustrated distance joins its two actual three-dimensional grid points.');

    const first = projectPoint(a, geometry, angle);
    const last = projectPoint(b, geometry, angle);
    this.pen.strokeStyle = this.colors.ink;
    this.pen.lineWidth = width;
    line(this.pen, first.x, first.y, last.x, last.y);

    return { first, last };
  }

  private example(geometry: CubeLayout, angle: number, time: number, box: Box, tall: boolean): void {
    const index = Math.min(this.model.examples.length - 1, Math.floor((time - 4000) / 2000));
    const pair = this.model.examples[index];

    if (!pair) throw new Error('The opening measurement has its selected true distance.');

    const { first, last } = this.pair(pair, geometry, angle, tall ? 1 : 1.5);
    this.pen.strokeStyle = this.colors.ink;
    this.pen.lineWidth = .8;

    for (const point of [first, last]) {
      this.pen.beginPath();
      this.pen.arc(point.x, point.y, geometry.pointRadius + 2.5, 0, Math.PI * 2);
      this.pen.stroke();
    }

    const x = box.x + box.w / 2;
    const y = box.y + box.h * .69;
    this.plain(`3D SQUARED LENGTH: ${pair.squared}`, x, y, tall ? 9 : 13);
  }

  private repeated(geometry: CubeLayout, angle: number, tall: boolean): void {
    for (const id of this.model.repeatedFive) {
      const pair = this.model.gridPairs[id];

      if (!pair || pair.squared !== this.model.common.squared) throw new Error('Every repeated-length hairline belongs to the exact most-common bucket.');

      this.pair(pair, geometry, angle, tall ? .45 : .65);
    }
  }

  private headings(box: Box, time: number, phase: Phase, comparison: number, tall: boolean): void {
    const { model, pen, colors } = this;
    let first = 'A TURNING CUBIC GRID';
    let second = nodeProgress(time) < 1 ? 'DRAWING THE POINTS' : `${model.grid.length} POINTS · ${model.pairCount.toLocaleString('en-US')} PAIRS`;

    if (phase === 'flattening' || phase === 'returning') {
      first = phase === 'flattening' ? 'COLLAPSING INTO ONE PLANE LAYER' : 'OPENING THE CUBE AGAIN';
      second = 'GEOMETRY IN TRANSIT · COUNTS HIDDEN';
    } else if (phase === 'plane') {
      first = 'ONE 5 × 5 PLANE LAYER';
      second = `${model.plane.points.length} SITES · ${model.plane.pairCount} PAIRS · ${model.plane.distinct} LENGTHS`;
    } else if (comparison > 0) {
      first = 'GRID AND ONE SEEDED RANDOM SAMPLE';
      second = comparison === 1 ? `${model.grid.length} POINTS IN EACH CUBE` : 'COMPARISON IN TRANSIT';
    } else if (time >= 8000 && time < 13000) first = 'HOW MANY DIFFERENT LENGTHS?';

    text(pen, first, box.x + box.w / 2, box.y + 8, tall ? 9.5 : 14, box.w - 6, colors);
    text(pen, second, box.x + box.w / 2, box.y + (tall ? 24 : 29), tall ? 8 : 11, box.w - 6, colors);

    if (phase !== 'cube' || time < 13000) return;

    if (comparison === 1) {
      this.plain(`GRID: ${model.distinct} / ${model.pairCount.toLocaleString('en-US')}`, box.x + box.w * .235, box.y + box.h * .69, tall ? 8 : 11);
      this.plain(`RANDOM: ${model.randomDistinct.toLocaleString('en-US')} / ${model.randomPairs.length.toLocaleString('en-US')}`, box.x + box.w * .765, box.y + box.h * .69, tall ? 8 : 11);
    } else if (comparison === 0) {
      const words = time >= 15000 && time < 25000 ? `${model.repeatedFive.length} SHOWN PAIRS · ALL SQUARED LENGTH ${model.common.squared}` : 'OBLIQUE VIEW · TRUE 3D DISTANCES';
      this.plain(words, box.x + box.w / 2, box.y + box.h * .69, tall ? 8 : 11);
    }
  }

  private ordinal(randomBox: Box, stage: Box, tall: boolean): void {
    const { pen, colors } = this;
    const y = stage.y + stage.h * .58;
    const start = randomBox.x + randomBox.w * .13;
    const pitch = randomBox.w * .055;
    pen.fillStyle = colors.ink;

    for (let index = 0; index < 12; index++) pen.fillRect(start + index * pitch, y, tall ? 1.3 : 2, tall ? 3 : 4);

    pen.strokeStyle = colors.ink;
    pen.lineWidth = .7;
    const end = randomBox.x + randomBox.w * .90;
    line(pen, start + 12 * pitch, y + 2, end, y + 2);
    line(pen, end - 3, y - 1, end, y + 2);
    line(pen, end - 3, y + 5, end, y + 2);
    this.plain(`FIRST 12 OF ${this.model.randomDistinct.toLocaleString('en-US')} VALUES`, randomBox.x + randomBox.w / 2, y + (tall ? 15 : 18), tall ? 7 : 10);
  }

  private tally(box: Box, time: number, phase: Phase, tall: boolean): void {
    const { model, pen, colors } = this;
    const geometry = tallyLayout(box, tall);
    const source = phase === 'plane' || (phase === 'returning' && time < 41000) ? model.plane : model;
    let visibility = tallyProgress(time);

    if (phase === 'flattening') visibility = 1 - smooth(time, 34500, 35000);
    else if (phase === 'plane') visibility = smooth(time, 37500, 38000);
    else if (phase === 'returning') visibility = 1 - smooth(time, 40500, 41000);
    else if (time >= 44500 && time < 45000) visibility = smooth(time, 44500, 45000);

    const transitional = phase === 'flattening' || phase === 'returning';

    for (let squared = 1; squared <= 48; squared++) {
      const numbered = tall || geometry.pitch >= 7 || [1, 5, 8, 16, 24, 32, 40, 48].includes(squared);

      if (!numbered) continue;

      const at = tallyPoint(squared, geometry);
      pen.fillStyle = colors.ink;
      pen.font = `${tall ? 6.5 : 7.5}px "Garamond Math", serif`;
      pen.textAlign = 'center';
      pen.textBaseline = 'top';
      pen.fillText(`${squared}`, at.x, at.y + 4);
    }

    for (const [index, bucket] of source.histogram.entries()) {
      const amount = transitional || time >= 34500 ? visibility : Math.max(0, Math.min(1, tallyProgress(time) * source.histogram.length - index));

      if (amount <= 0) continue;

      const at = tallyPoint(bucket.squared, geometry);
      const height = geometry.barHeight * Math.sqrt(bucket.count / model.common.count) * amount;
      const width = Math.min(5, geometry.pitch * .46);
      pen.fillStyle = colors.ink;
      pen.fillRect(at.x - width / 2, at.y - height, width, height);
    }

    const captionY = tall ? geometry.y - geometry.barHeight - 6 : geometry.y + 28;
    this.plain('GRID SQUARED VALUES · 1 THROUGH 48', box.x + box.w / 2, captionY, tall ? 7.5 : 11);
    let footer = 'COLLECTING THE DISTINCT SQUARED VALUES';

    if (transitional) footer = 'TALLY IN TRANSIT · COUNTS HIDDEN';
    else if (phase === 'plane') footer = `${model.plane.distinct} VALUES · ONE TRUE PLANE LAYER`;
    else if (time >= 25000) footer = `${model.distinct} VALUES · ${model.missing.length} GAPS · PEAK ${model.common.squared}: ${model.common.count} PAIRS`;
    else if (time >= 13000) footer = `DISTINCT VALUES FOUND: ${Math.ceil(tallyProgress(time) * model.distinct)}`;

    this.plain(footer, box.x + box.w / 2, box.y + box.h * .97, tall ? 8 : 11);
  }

  private plain(words: string, x: number, y: number, size: number): void {
    this.pen.fillStyle = this.colors.ink;
    this.pen.font = `${size}px "Garamond Math", serif`;
    this.pen.textAlign = 'center';
    this.pen.textBaseline = 'middle';
    this.pen.fillText(words, x, y);
  }
}

import { mix } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { type Box, type Colors, type Point, leafClusterPoint, leafClusterSize, text } from './drawing';
import { type DigitModel, type KaratsubaNode, nodeAt } from './math';
import { drawPanels } from './panels';
import { diagonalProgress, layout, leafTravel, middleProgress, quarterProgress, recursionLevel, schoolProgress, schoolReturnProgress } from './story';

type Actor = Point & { w: number; h: number };

type Grid = { x: number; y: number; side: number; cell: number };

export class DigitSquareFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly productLabel: string;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };

  constructor(private readonly root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D, private readonly model: DigitModel) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 4 });
    this.productLabel = model.product.toLocaleString('en-US');
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
    pen.lineJoin = 'round';
    pen.lineCap = 'round';
    pen.setLineDash([]);

    if (time < 22500) this.school(boxes.stage, time, boxes.tall);
    else if (time < 32250) this.recursion(boxes.stage, time, boxes.tall);
    else {
      this.summary(boxes.stage, boxes.tall);

      if (time < 37500) this.leaves(boxes.stage, boxes.panel, time, boxes.tall);
    }

    drawPanels(pen, boxes.panel, time, colors, this.labels.place, this.model, boxes.tall, boxes.stage);

    if (time >= 37500) this.leaves(boxes.stage, boxes.panel, time, boxes.tall);

    this.labels.endFrame();
  }

  private heading(box: Box, tall: boolean): void {
    text(this.pen, `${BigInt(this.model.x).toLocaleString('en-US')} × ${BigInt(this.model.y).toLocaleString('en-US')}`, box.x + box.w / 2, box.y + 10, tall ? 13 : 20, box.w - 4, this.colors);
  }

  private grid(box: Box, tall: boolean): Grid {
    const side = Math.min(box.w - (tall ? 30 : 42), box.h - (tall ? 107 : 135));

    return { x: box.x + (tall ? 25 : 33), y: box.y + (tall ? 51 : 66), side, cell: side / this.model.n };
  }

  private school(box: Box, time: number, tall: boolean): void {
    const { pen, model, colors } = this;
    const grid = this.grid(box, tall);
    const filled = Math.floor(schoolProgress(time) * model.school.length);
    const returning = schoolReturnProgress(time);
    const gather = diagonalProgress(time) * (1 - returning);
    const gap = quarterProgress(time) * (tall ? 6 : 14);
    const fold = middleProgress(time);
    this.heading(box, tall);

    if (fold === 0) {
      for (const [index, digit] of model.xDigits.entries()) {
        const offset = index < model.n / 2 ? -gap / 2 : gap / 2;
        this.number(`${digit}`, grid.x + (index + .5) * grid.cell + offset, grid.y - (tall ? 12 : 17), tall ? 11 : 16);
      }

      for (const [index, digit] of model.yDigits.entries()) {
        const offset = index < model.n / 2 ? -gap / 2 : gap / 2;
        this.number(`${digit}`, grid.x - (tall ? 13 : 18), grid.y + (index + .5) * grid.cell + offset, tall ? 11 : 16);
      }
    }

    for (const cell of model.school) {
      const xOffset = cell.xIndex < model.n / 2 ? -gap / 2 : gap / 2;
      const yOffset = cell.yIndex < model.n / 2 ? -gap / 2 : gap / 2;
      let x = grid.x + (cell.xIndex + .5) * grid.cell + xOffset;
      let y = grid.y + (cell.yIndex + .5) * grid.cell + yOffset;
      pen.strokeStyle = colors.muted;
      pen.lineWidth = .4;

      if (fold === 0) pen.strokeRect(x - grid.cell / 2, y - grid.cell / 2, grid.cell, grid.cell);
      if (cell.id >= filled) continue;

      const column = 15 - cell.power;
      x = mix(x, grid.x + (column + .5) * grid.side / 16, gather);
      y = mix(y, grid.y + grid.side - 5, gather);

      if (fold > 0) {
        const path = cell.xIndex < 4 && cell.yIndex < 4 ? 'H' : cell.xIndex >= 4 && cell.yIndex >= 4 ? 'L' : 'M';
        const destination = this.nodePosition(nodeAt(model, path), box, tall);
        x = mix(x, destination.x, fold);
        y = mix(y, destination.y, fold);
      }

      const shrink = Math.max(gather, fold);

      if (shrink < .35) this.number(`${cell.value}`, x, y, (tall ? 10 : 15) * (1 - shrink));
      else {
        pen.fillStyle = colors.ink;
        const size = mix(tall ? 4 : 6, 1.2, shrink);
        pen.fillRect(x - size / 2, y - size / 2, size, size);
      }
    }

    if (fold > 0) {
      const nodes = model.levels[1];

      if (!nodes) throw new Error('The first split has its three actual recursive multiplications.');

      for (const node of nodes) {
        const position = this.nodePosition(node, box, tall);
        this.node(node, { ...position, w: position.w * fold, h: position.h * fold }, false, tall);
      }
    }

    const footer = box.y + box.h - (tall ? 48 : 64);
    const movingBack = returning > 0 && returning < 1;
    let title = `${filled} OF ${model.school.length} DIGIT PRODUCTS`;

    if (fold > 0) title = 'THREE PRODUCTS: H, L AND M';
    else if (movingBack) title = 'RETURN TO THE DIGIT SQUARE';
    else if (filled === model.school.length) title = `${filled} DIGIT PRODUCTS${gather > 0 ? ' · COLLECT DIAGONALS' : ' = 8²'}`;

    text(pen, title, box.x + box.w / 2, footer, tall ? 10 : 15, box.w - 4, colors);

    if (fold > 0) text(pen, 'M USES SUMS · CROSS-TERM = M − H − L', box.x + box.w / 2, footer + (tall ? 17 : 24), tall ? 8.5 : 12, box.w - 4, colors);
    else if (gather > 0) text(pen, movingBack ? 'SAME PRODUCTS · PREPARING THE SPLIT' : 'COLLECT POWERS OF TEN · THEN CARRY', box.x + box.w / 2, footer + (tall ? 17 : 24), tall ? 8.5 : 12, box.w - 4, colors);

    if (time >= 9000) text(pen, `= ${this.productLabel}`, box.x + box.w / 2, box.y + box.h - (tall ? 10 : 14), tall ? 14 : 21, box.w - 4, colors);
  }

  private number(value: string, x: number, y: number, size: number, maxWidth?: number): void {
    this.pen.font = `${size}px "Garamond Math", serif`;
    this.pen.fillStyle = this.colors.ink;
    this.pen.textAlign = 'center';
    this.pen.textBaseline = 'middle';

    if (maxWidth === undefined) this.pen.fillText(value, x, y + .2);
    else this.pen.fillText(value, x, y + .2, maxWidth);
  }

  private nodePosition(node: KaratsubaNode, box: Box, tall: boolean): Actor {
    const level = this.model.levels[node.depth];

    if (!level) throw new Error('Every multiplication box has its recursive depth.');

    const index = level.indexOf(node);

    if (index < 0) throw new Error('Each multiplication box keeps its tree identity.');

    if (node.depth === 1) {
      const x = node.path === 'H' ? .24 : node.path === 'L' ? .76 : .5;
      const y = node.path === 'M' ? tall ? 194 : 270 : tall ? 91 : 126;

      return { x: box.x + box.w * x, y: box.y + y, w: box.w * .29, h: tall ? 58 : 80 };
    }

    if (node.depth === 2) return { x: box.x + box.w * (.18 + index % 3 * .32), y: box.y + (tall ? 88 : 114) + Math.floor(index / 3) * (tall ? 63 : 88), w: box.w * .20, h: tall ? 34 : 46 };
    if (node.depth === 3) return { x: box.x + box.w * (.10 + (index % 9 + .5) * .8 / 9), y: box.y + 105 + Math.floor(index / 9) * (tall ? 44 : 65), w: tall ? 13 : 18, h: tall ? 13 : 18 };

    throw new RangeError('The visual tree shows the three splits below the eight-position root.');
  }

  private node(node: KaratsubaNode, position: Actor, values: boolean, tall: boolean): void {
    const { pen, colors } = this;
    pen.fillStyle = colors.paper;
    pen.fillRect(position.x - position.w / 2, position.y - position.h / 2, position.w, position.h);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .8;
    pen.strokeRect(position.x - position.w / 2, position.y - position.h / 2, position.w, position.h);

    if (!values || node.depth === 3) return;

    const size = node.depth === 1 ? tall ? 11 : 16 : tall ? 8.5 : 12;
    this.number(`${node.a}`, position.x, position.y - (tall ? 8 : 12), size, position.w - 5);
    this.number(`× ${node.b}`, position.x, position.y + (tall ? 8 : 12), size, position.w - 5);

    if (node.depth === 1) text(pen, node.path, position.x, position.y - position.h / 2 - (tall ? 8 : 12), tall ? 10 : 14, position.w, colors);
  }

  private recursion(box: Box, time: number, tall: boolean): void {
    const { pen, model, colors } = this;
    const clock = recursionLevel(time);
    const depth = clock === 0 ? 1 : Math.ceil(clock) + 1;
    const amount = clock === 0 ? 1 : clock - (depth - 2);
    const level = model.levels[depth];

    if (!level) throw new Error('The recursion picture has its current three-way split.');

    this.heading(box, tall);

    for (const node of level) {
      const destination = this.nodePosition(node, box, tall);
      let actor = destination;

      if (depth > 1 && amount < 1) {
        if (node.parentPath === null) throw new Error('A recursive child has its parent multiplication.');

        const parent = this.nodePosition(nodeAt(model, node.parentPath), box, tall);
        actor = { x: mix(parent.x, destination.x, amount), y: mix(parent.y, destination.y, amount), w: mix(parent.w, destination.w, amount), h: mix(parent.h, destination.h, amount) };
      }

      this.node(node, actor, amount === 1, tall);
    }

    const footer = box.y + box.h - (tall ? 48 : 64);
    const parents = model.levels[depth - 1];

    if (!parents) throw new Error('A recursive split has its previous level of multiplications.');

    const title = amount < 1 ? `${parents.length} PRODUCTS BECOME ${level.length}` : depth === 3 ? `${model.leaves.length} SMALL PRODUCTS` : `${level.length} RECURSIVE PRODUCTS`;
    text(pen, title, box.x + box.w / 2, footer, tall ? 12 : 18, box.w - 4, colors);
    text(pen, depth === 3 && amount === 1 ? `${model.carriedCount} WITH A CARRIED DIGIT` : 'M − H − L REUSES THE TWO OUTSIDE PRODUCTS', box.x + box.w / 2, footer + (tall ? 17 : 24), tall ? 8.5 : 12, box.w - 4, colors);
    text(pen, `= ${this.productLabel}`, box.x + box.w / 2, box.y + box.h - (tall ? 10 : 14), tall ? 14 : 21, box.w - 4, colors);
  }

  private summary(box: Box, tall: boolean): void {
    this.heading(box, tall);
    text(this.pen, `= ${this.productLabel}`, box.x + box.w / 2, box.y + (tall ? 44 : 50), tall ? 15 : 23, box.w - 4, this.colors);
    text(this.pen, `${this.model.leaves.length} SMALL PRODUCTS · EXACT DECIMAL TOY`, box.x + box.w / 2, box.y + 84, tall ? 9.5 : 14, box.w - 4, this.colors);
  }

  private leaves(stage: Box, panel: Box, time: number, tall: boolean): void {
    const travel = leafTravel(time);
    const finalSize = leafClusterSize(time, tall);

    for (const [index, node] of this.model.leaves.entries()) {
      const start = this.nodePosition(node, stage, tall);
      const end = leafClusterPoint(index, panel, time, tall);
      this.node(node, { x: mix(start.x, end.x, travel), y: mix(start.y, end.y, travel), w: mix(start.w, finalSize, travel), h: mix(start.h, finalSize, travel) }, false, tall);
    }
  }
}

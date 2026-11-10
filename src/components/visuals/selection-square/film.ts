import { mix } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { type Box, type Colors, line, text } from './drawing';
import { type SelectionCell, type SelectionModel } from './math';
import { drawPanels } from './panels';
import { aliasProgress, fillProgress, layout, sortProgress, splitProgress, trialIndex, walkProgress } from './story';

type Square = { x: number; y: number; side: number; cell: number };

type Raster = { raw: HTMLCanvasElement; sorted: HTMLCanvasElement; side: number; density: number };

export class SelectionSquareFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private raster: Raster | null = null;
  private readonly labels: FilmLabels;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };

  constructor(private readonly root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D, private readonly model: SelectionModel) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 4 });
  }

  resize(width: number, height: number, density: number): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.canvas.width = Math.round(width * density);
    this.canvas.height = Math.round(height * density);
    this.raster = null;
    const style = getComputedStyle(this.root);

    for (const tone of ['ink', 'blue', 'muted', 'paper'] as const) this.colors[tone] = style.getPropertyValue(`--${tone}`).trim() || this.colors[tone];

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    const boxes = layout(this.width, this.height, time);
    this.labels.beginFrame();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineJoin = 'round';
    this.pen.lineCap = 'round';
    this.pen.setLineDash([]);
    this.selections(boxes.stage, time, boxes.tall);
    drawPanels(this.pen, boxes.panel, time, this.colors, this.labels.place, this.model, boxes.tall);
    this.labels.endFrame();
  }

  private square(box: Box, tall: boolean): Square {
    const snap = (value: number) => Math.round(value * this.density) / this.density;
    const side = snap(Math.min(box.w - (tall ? 34 : 116), box.h - (tall ? 133 : 145)));

    return { x: snap(box.x + (tall ? 31 : 108)), y: snap(box.y + (tall ? 92 : 94)), side, cell: side / this.model.size };
  }

  private tile(value: number, ordinal: number, x: number, y: number, width: number, height: number, chosen: boolean, tall: boolean, ordinalVisible: boolean): void {
    const { pen, colors } = this;
    pen.fillStyle = chosen ? colors.ink : colors.paper;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = chosen ? 1.4 : .6;
    pen.fillRect(x - width / 2, y - height / 2, width, height);
    pen.strokeRect(x - width / 2, y - height / 2, width, height);
    pen.font = `${tall ? 8 : 13}px "Garamond Math", serif`;
    pen.textAlign = 'center';
    pen.textBaseline = 'middle';
    pen.fillStyle = chosen ? colors.paper : colors.ink;
    pen.fillText(`${value}`, x, y + .2, width - 3);

    if (ordinalVisible) {
      pen.fillStyle = colors.ink;
      pen.font = `${tall ? 7.5 : 11}px "Garamond Math", serif`;
      pen.fillText(`${ordinal}`, x, y - height / 2 - 6);
    }
  }

  private selections(box: Box, time: number, tall: boolean): void {
    const { model, pen, colors } = this;
    const square = this.square(box, tall);
    const division = splitProgress(time);
    const trial = model.trials[trialIndex(time)];

    if (!trial) throw new Error('The fixed instance has its three computed trial selections.');

    const trialActive = time >= 6000 && time < 11000;
    const tileWidth = Math.min(tall ? 34 : 63, box.w / 6 - 4);
    const tileHeight = tall ? 19 : 29;

    if (division > 0 && division < 1) {
      const side = square.side * division;
      pen.strokeStyle = colors.ink;
      pen.lineWidth = .75;
      pen.strokeRect(square.x + (square.side - side) / 2, square.y + (square.side - side) / 2, side, side);
    }

    for (const [index, value] of model.numbers.entries()) {
      const column = index % model.half;
      // The second half starts above the first, so their routes to top and left never cross.
      const row = index < model.half ? 1 : 0;
      const startX = box.x + (column + .5) * box.w / model.half;
      const startY = box.y + (tall ? 35 : 40) + row * (tall ? 29 : 43);
      const endX = index < model.half ? square.x - (tall ? 17 : 70) : square.x + (column + .5) * square.side / model.half;
      const endY = index < model.half ? square.y + (column + .5) * square.side / model.half : square.y - (tall ? 24 : 39);
      const chosen = trialActive ? trial.selection.includes(index) : time >= 39500 && model.solution.includes(index);
      const lift = chosen ? (tall ? 5 : 9) : 0;
      const endWidth = index < model.half ? tall ? 28 : 56 : Math.min(tileWidth, square.side / model.half - 2);
      this.tile(value, index + 1, mix(startX, endX, division), mix(startY - lift, endY, division), mix(tileWidth, endWidth, division), tileHeight, chosen, tall, division === 0 || division === 1);
    }

    const targetY = time < 18250 ? box.y + (tall ? 122 : 174) : box.y + 8;
    text(pen, `TARGET ${model.target.toLocaleString('en-US')}`, box.x + box.w / 2, targetY, tall ? 14 : 22, box.w - 4, colors);

    if (time < 18250) {
      if (trialActive) {
        const sumY = box.y + (tall ? 169 : 252);
        text(pen, `${trial.sum.toLocaleString('en-US')} ${trial.comparison === 'small' ? '<' : '>'} ${model.target.toLocaleString('en-US')}`, box.x + box.w / 2, sumY, tall ? 17 : 25, box.w - 8, colors);
        text(pen, trial.comparison === 'small' ? 'TOO SMALL' : 'TOO BIG', box.x + box.w / 2, sumY + (tall ? 28 : 42), tall ? 11 : 16, box.w - 8, colors);
      }

      if (time >= 11000) {
        text(pen, 'NP-COMPLETE', box.x + box.w / 2, box.y + (tall ? 189 : 278), tall ? 17 : 25, box.w - 8, colors);
        text(pen, 'KARP 1972 · KNAPSACK', box.x + box.w / 2, box.y + (tall ? 224 : 326), tall ? 11 : 17, box.w - 8, colors);
      }

      return;
    }

    if (division < 1) return;

    const sorting = sortProgress(time);
    const filled = Math.floor(fillProgress(time) * model.cells.length);
    this.matrix(square, sorting, filled);

    if (time >= 27250 && !tall) this.sums(square, sorting);
    if (filled > model.hit.id || time >= 27250) this.hit(square, sorting);
    if (time >= 31500) this.staircase(square, time, tall);
    if (time >= 52250) this.aliases(square, time);

    const footerY = square.y + square.side + (tall ? 15 : 24);

    if (time < 27250) {
      text(pen, `${filled.toLocaleString('en-US')} / ${model.cells.length.toLocaleString('en-US')} SELECTIONS`, square.x + square.side / 2, footerY, tall ? 10 : 15, square.side, colors);

      if (filled === model.cells.length) text(pen, 'ALL CHECKED WHEN NONE WORKS', square.x + square.side / 2, footerY + (tall ? 18 : 25), tall ? 8.5 : 12, square.side, colors);
    } else if (time < 31500) {
      text(pen, sorting < 1 ? 'ROWS ASCENDING · COLS DESCENDING' : '64 + 64 SUMS LISTED', square.x + square.side / 2, footerY, tall ? 9.5 : 14, square.side, colors);
    } else {
      const index = Math.floor(walkProgress(time) * (model.walk.length - 1));
      const step = model.walk[index];

      if (!step) throw new Error('The staircase has its currently visited cell.');

      const row = model.rows[step.cell.rowMask];
      const col = model.cols[step.cell.colMask];

      if (!row || !col) throw new Error('The current square cell retains both half-selection sums.');

      text(pen, `${row.sum.toLocaleString('en-US')} + ${col.sum.toLocaleString('en-US')} = ${step.sum.toLocaleString('en-US')}`, square.x + square.side / 2, footerY, tall ? 10 : 15, square.side + 25, colors);
      text(pen, `${index + 1} CELLS VISITED OF ${model.cells.length.toLocaleString('en-US')}`, square.x + square.side / 2, footerY + (tall ? 19 : 25), tall ? 9 : 13, square.side, colors);
    }
  }

  private coordinate(cell: SelectionCell, square: Square, sorting: number): { x: number; y: number } {
    return { x: square.x + (mix(cell.colMask, cell.sortedCol, sorting) + .5) * square.cell, y: square.y + (mix(cell.rowMask, cell.sortedRow, sorting) + .5) * square.cell };
  }

  private makeRaster(square: Square): Raster {
    const make = (sorted: boolean): HTMLCanvasElement => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(square.side * this.density);
      canvas.height = Math.round(square.side * this.density);
      const context = canvas.getContext('2d');

      if (!context) throw new Error('The selection-square raster needs a two-dimensional context.');

      const scale = canvas.width / square.side;
      context.scale(scale, scale);
      const maximum = this.model.numbers.reduce((sum, value) => sum + value, 0);
      context.fillStyle = this.colors.ink;

      for (const cell of this.model.cells) {
        context.globalAlpha = .06 + .24 * cell.sum / maximum;
        context.fillRect((sorted ? cell.sortedCol : cell.colMask) * square.cell, (sorted ? cell.sortedRow : cell.rowMask) * square.cell, square.cell, square.cell);
      }

      context.globalAlpha = .22;
      context.strokeStyle = this.colors.paper;
      context.lineWidth = .4;
      context.beginPath();

      for (let index = 1; index < this.model.size; index++) {
        context.moveTo(index * square.cell, 0);
        context.lineTo(index * square.cell, square.side);
        context.moveTo(0, index * square.cell);
        context.lineTo(square.side, index * square.cell);
      }

      context.stroke();

      return canvas;
    };

    return { raw: make(false), sorted: make(true), side: square.side, density: this.density };
  }

  private matrix(square: Square, sorting: number, filled: number): void {
    const { pen, colors, model } = this;

    if (!this.raster || this.raster.side !== square.side || this.raster.density !== this.density) this.raster = this.makeRaster(square);

    if (sorting > 0 && sorting < 1) {
      const maximum = model.numbers.reduce((sum, value) => sum + value, 0);
      pen.fillStyle = colors.ink;

      for (const cell of model.cells) {
        const point = this.coordinate(cell, square, sorting);
        pen.globalAlpha = .06 + .24 * cell.sum / maximum;
        pen.fillRect(point.x - square.cell / 2, point.y - square.cell / 2, square.cell, square.cell);
      }

      pen.globalAlpha = 1;
    } else if (filled > 0) {
      const source = sorting === 1 ? this.raster.sorted : this.raster.raw;
      const rows = Math.floor(filled / model.size);
      const tail = filled % model.size;
      const unit = source.width / model.size;

      if (rows > 0) pen.drawImage(source, 0, 0, source.width, rows * unit, square.x, square.y, square.side, rows * square.cell);
      if (tail > 0) pen.drawImage(source, 0, rows * unit, tail * unit, unit, square.x, square.y + rows * square.cell, tail * square.cell, square.cell);
    }

    pen.strokeStyle = colors.ink;
    pen.lineWidth = .75;
    pen.strokeRect(square.x, square.y, square.side, square.side);
  }

  private hit(square: Square, sorting: number): void {
    const point = this.coordinate(this.model.hit, square, sorting);
    this.pen.fillStyle = this.colors.ink;
    this.pen.fillRect(point.x - square.cell * .48, point.y - square.cell * .48, square.cell * .96, square.cell * .96);
  }

  private sums(square: Square, sorting: number): void {
    const { pen, model, colors } = this;
    pen.font = `${Math.min(7, square.cell * .85)}px "Garamond Math", serif`;
    pen.textBaseline = 'middle';
    pen.fillStyle = colors.ink;

    for (const row of model.rows) {
      const rank = model.rowRank[row.mask];

      if (rank === undefined) throw new Error('Every half-selection keeps its sorted rank.');

      pen.textAlign = 'right';
      pen.fillText(`${row.sum}`, square.x - 3, square.y + (mix(row.mask, rank, sorting) + .5) * square.cell);
    }

    for (const col of model.cols) {
      const rank = model.colRank[col.mask];

      if (rank === undefined) throw new Error('Every half-selection keeps its sorted rank.');

      pen.save();
      pen.translate(square.x + (mix(col.mask, rank, sorting) + .5) * square.cell, square.y - 3);
      pen.rotate(-Math.PI / 2);
      pen.textAlign = 'left';
      pen.fillText(`${col.sum}`, 0, 0);
      pen.restore();
    }
  }

  private staircase(square: Square, time: number, tall: boolean): void {
    const { pen, model, colors } = this;
    const coordinate = walkProgress(time) * (model.walk.length - 1);
    const last = Math.floor(coordinate);
    pen.beginPath();

    for (const [index, step] of model.walk.entries()) {
      if (index > last + 1) break;

      let x = square.x + (step.col + .5) * square.cell;
      let y = square.y + (step.row + .5) * square.cell;

      if (index === last + 1) {
        const previous = model.walk[last];

        if (!previous) throw new Error('The staircase interpolates from its preceding cell.');

        x = mix(square.x + (previous.col + .5) * square.cell, x, coordinate - last);
        y = mix(square.y + (previous.row + .5) * square.cell, y, coordinate - last);
      }

      if (index === 0) pen.moveTo(x, y);
      else pen.lineTo(x, y);
    }

    pen.strokeStyle = colors.ink;
    pen.lineWidth = tall ? 1.1 : 1.7;
    pen.stroke();
    const current = model.walk[last];

    if (!current) throw new Error('The staircase has a highlighted current cell.');

    const next = model.walk[Math.min(model.walk.length - 1, last + 1)];

    if (!next) throw new Error('The staircase cursor has its next or terminal cell.');

    const from = this.coordinate(current.cell, square, 1);
    const to = this.coordinate(next.cell, square, 1);
    const point = { x: mix(from.x, to.x, coordinate - last), y: mix(from.y, to.y, coordinate - last) };
    pen.beginPath();
    pen.arc(point.x, point.y, tall ? 3 : 4.5, 0, Math.PI * 2);
    pen.stroke();
  }

  private aliases(square: Square, time: number): void {
    const { pen, model, colors } = this;
    const shown = Math.floor(aliasProgress(time) * model.sameRemainder.length);
    const aliasOrder = new Map(model.aliases.map((cell, index) => [cell.id, index]));
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .75;

    for (const [index, cell] of model.sameRemainder.entries()) {
      if (index >= shown || cell.hit) continue;

      const removalIndex = aliasOrder.get(cell.id);

      if (removalIndex === undefined) throw new Error('Each false positive has its place in the alias-removal sequence.');

      const strikeAt = 62500 + (removalIndex + 1) / model.aliases.length * 6000;

      if (time >= strikeAt + 240) continue;

      const point = this.coordinate(cell, square, 1);
      const radius = Math.max(1.3, square.cell * .38);
      pen.beginPath();
      pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
      pen.stroke();

      if (time >= strikeAt) line(pen, point.x - radius * 1.15, point.y + radius * 1.15, point.x + radius * 1.15, point.y - radius * 1.15);
    }
  }
}

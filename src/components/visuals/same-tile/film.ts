import { mix, progress, smooth } from '../../../lib/animation';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import type { FilmDrawing } from '../../plate/controller';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';
import { buildTileModel, ROW_SHIFTS } from './math';
import { dimensionPoint, drawDimensionSequence } from './panels';

type Point = { x: number; y: number };

type Field = { x: number; y: number; unit: number; rows: number };

type Tones = { ink: string; muted: string; paper: string; blue: string };

function interpolate(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

class SameTileFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly model = buildTileModel();
  private readonly labels: FilmLabels;
  private tones: Tones = PAGE_TONES;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 5 });
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.tones = tones;

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    const { width: w, height: h, pen, tones } = this;
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();

    if (time < 10500) this.opening(time);
    if (time >= 8750 && time < 24250) this.examples(time);
    if (time >= 22250 && time < 38000) this.twoFields(time);
    if (time >= 38000 && time < 55500) this.periodicField(time);

    drawDimensionSequence(pen, w, h, time, tones, this.labels);
    this.labels.endFrame();
  }

  private text(value: string, x: number, y: number, size: number, math = false): void {
    drawText(this.pen, value, x, y, { size, color: this.tones.ink, family: math ? 'math' : 'type' });
  }

  private note(value: string, x: number, top: number, width: number, size: number): void {
    drawWrappedText(this.pen, value, x, top, width, { size, color: this.tones.ink });
  }

  private dot(point: Point, radius = 2): void {
    this.pen.beginPath();
    this.pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    this.pen.fillStyle = this.tones.ink;
    this.pen.fill();
  }

  private arrow(a: Point, b: Point, dash: readonly number[] = []): void {
    drawLine(this.pen, a.x, a.y, b.x, b.y, this.tones.ink, 1.2, dash);
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const length = 5;

    for (const offset of [-.5, .5]) {
      drawLine(this.pen, b.x, b.y, b.x - length * Math.cos(angle + offset), b.y - length * Math.sin(angle + offset), this.tones.ink, 1.2);
    }
  }

  private domino(anchor: Point, unit: number, dots = 0, marked = false): void {
    const { pen, tones } = this;
    const radius = Math.min(2.2, unit * .22);

    if (dots === 1) {
      this.dot(anchor, radius);

      return;
    }

    const width = mix(2 * unit, 2 * radius, dots);
    const height = mix(unit, 2 * radius, dots);
    const center = { x: anchor.x + .5 * unit * (1 - dots), y: anchor.y };
    pen.fillStyle = tones.paper;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = .9;
    pen.fillRect(center.x - width / 2, center.y - height / 2, width, height);
    pen.strokeRect(center.x - width / 2, center.y - height / 2, width, height);

    if (marked && dots < .95) {
      drawLine(pen, center.x - width * .35, center.y + height * .25, center.x - width * .1, center.y - height * .25, tones.ink, .7);
      drawLine(pen, center.x, center.y + height * .25, center.x + width * .25, center.y - height * .25, tones.ink, .7);
    }

    if (dots > 0) this.dot(anchor, radius * dots);
  }

  private field(index: number): Field {
    const { width: w, height: h } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const unit = phone ? Math.min(w * .0315, h * .015) : Math.min(13, w * .022, h * .024);
    const rows = phone ? 13 : 24;
    const top = h * (phone ? index === 0 ? .14 : .43 : .17);

    return { x: w * (phone ? .5 : index === 0 ? .28 : .72), y: top + (rows - 1) * unit, unit, rows };
  }

  private fieldPoint(field: Field, column: number, row: number): Point {
    return { x: field.x + column * field.unit, y: field.y - row * field.unit };
  }

  private opening(time: number): void {
    const { width: w, height: h } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const settledUnit = phone ? Math.min(w * .0315, h * .015) : Math.min(13, w * .022, h * .021);
    const pull = smooth(time, 750, 2250);
    const unit = mix(phone ? 29 : 40, settledUnit, pull);
    const origin = { x: w * .5, y: h * mix(.39, .64, pull) };
    const collapse = smooth(time, 8750, 10500);
    const target = { x: w * .12, y: h * .12 };
    const translations = this.model.aligned.translations;
    const ordered = Array.from(translations).sort((a, b) => a.y - b.y || Math.abs(a.x) - Math.abs(b.x));

    for (const [index, point] of ordered.entries()) {
      const isOrigin = point.x === 0 && point.y === 0;
      const born = isOrigin ? 1 : smooth(time, 2500 + index * 18, 3000 + index * 18);

      if (born <= 0) continue;

      const end = { x: origin.x + point.x * unit, y: origin.y - point.y * unit };
      const placed = interpolate(origin, end, born);
      const carried = interpolate(placed, target, collapse);
      const size = isOrigin ? mix(unit, 8, collapse) : unit * (1 - collapse);

      if (size > .1) this.domino(carried, size, 0, isOrigin);
    }

    if (time < 8750) {
      this.text('ONE DOMINO · TRANSLATIONS ONLY', w * .5, h * .045, phone ? 10 : 16);
      this.text('COPIES KEEP THEIR ORIENTATION', w * .5, h * .10, phone ? 8.5 : 11);

      if (time >= 7000) {
        this.text('24 ROWS · INSPECTED CELLS COVERED ONCE', w * .5, h * .80, phone ? 9 : 13);
        this.text('TWO UNIT CELLS · NO GAPS OR DOUBLE COVER', w * .5, h * .86, phone ? 8.5 : 11);
      }
    }
  }

  private lTile(origin: Point, unit: number, marked = false): void {
    const vertices = [[-.5, -.5], [1.5, -.5], [1.5, .5], [.5, .5], [.5, 2.5], [-.5, 2.5]] as const;
    const { pen, tones } = this;
    pen.beginPath();

    for (const [index, [x, y]] of vertices.entries()) {
      const px = origin.x + x * unit;
      const py = origin.y - y * unit;

      if (index === 0) pen.moveTo(px, py);
      else pen.lineTo(px, py);
    }

    pen.closePath();
    pen.fillStyle = tones.paper;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = marked ? 1.8 : .8;
    pen.fill();
    pen.stroke();

    if (marked) this.dot(origin, Math.min(2, unit * .2));
  }

  private examples(time: number): void {
    const { pen, width: w, height: h, tones } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const appear = smooth(time, 8750, 10500);
    const select = smooth(time, 14750, 16500);
    const retire = smooth(time, 22250, 24250);
    const exampleSize = (phone ? 11 : 18) * appear * (1 - select);

    if (exampleSize > .1) {
      const cx = w * .25;
      const cy = h * .31;
      pen.strokeStyle = tones.ink;
      pen.lineWidth = .8;

      for (let row = -1; row <= 1; row++) {
        for (let column = -1; column <= 1; column++) pen.strokeRect(cx + (column - .5) * exampleSize, cy + (row - .5) * exampleSize, exampleSize, exampleSize);
      }

      const radius = exampleSize;

      for (let index = -1; index <= 1; index++) {
        const hx = w * .75 + index * radius * 1.5;
        const hy = h * .31 + (index & 1) * radius * Math.sqrt(3) / 2;
        pen.beginPath();

        for (let corner = 0; corner < 6; corner++) {
          const angle = corner * Math.PI / 3;
          const x = hx + radius * Math.cos(angle);
          const y = hy + radius * Math.sin(angle);

          if (corner === 0) pen.moveTo(x, y);
          else pen.lineTo(x, y);
        }

        pen.closePath();
        pen.stroke();
      }
    }

    const center = { x: w * .5, y: h * mix(.57, .40, select) };
    const unit = mix(phone ? 6 : 9, phone ? Math.min(16, h * .028) : 23, select) * appear;
    const target = { x: w * .86, y: h * .12 };

    for (const point of this.model.l.translations) {
      const source = { x: center.x + point.x * unit, y: center.y - point.y * unit };
      const anchor = interpolate(source, target, retire);
      const isOrigin = point.x === 0 && point.y === 0;
      const size = isOrigin ? mix(unit, 3, retire) : unit * (1 - retire);

      if (size > .1) this.lTile(anchor, size, isOrigin);
    }

    if (time >= 10500) this.domino({ x: w * .12, y: h * .12 }, 8, 0, true);

    if (time < 14750) {
      this.text('OTHER TRANSLATIONAL TILES', w * .5, h * .045, phone ? 10 : 16);
      this.text('SQUARES', w * (phone ? mix(.10, .25, appear) : .25), h * (phone ? mix(.46, .40, appear) : .40), phone ? 9 : 12);
      this.text('HEXAGONS · SCHEMATIC', w * .75, h * (phone ? mix(.20, .43, appear) : .43), phone ? 8 : 11);
      this.text('L-TETROMINO · EXACT LATTICE PATCH', w * .5, h * .78, phone ? 9 : 12);
      this.text('HEXAGON ROW: NO COVER TEST CLAIMED', w * .5, h * .86, phone ? 8.5 : 11);
    } else if (time < 22250) {
      this.text('THE L TILE REPEATS BY TRANSLATION', w * .5, h * .045, phone ? 10 : 16);
      const origin = { x: center.x + 3 * unit, y: center.y + unit };
      const u = { x: origin.x - 4 * unit, y: origin.y };
      const v = { x: origin.x - 3 * unit, y: origin.y - unit };
      const uv = { x: origin.x - 7 * unit, y: origin.y - unit };
      this.arrow(origin, u);
      this.arrow(origin, v);
      drawLine(pen, u.x, u.y, uv.x, uv.y, tones.ink, 1.7);
      drawLine(pen, v.x, v.y, uv.x, uv.y, tones.ink, 1.7);
      this.labels.place('lattice', w * .5, h * .75);
      this.text('FUNDAMENTAL AREA 4 · FOUR COSETS', w * .5, h * .82, phone ? 9 : 12);
      this.text('A PARALLELOGRAM, NOT THE TILE OUTLINE', w * .5, h * .88, phone ? 8.5 : 11);
    }
  }

  private commonPoint(column: number, row: number): Point {
    const { width: w, height: h } = this;
    const pitch = Math.min(w * (w < PHONE_STAGE_WIDTH ? .105 : .055), h * .078);

    return { x: w * (w < PHONE_STAGE_WIDTH ? .5 : .30) + (column - 3) * pitch, y: h * (w < PHONE_STAGE_WIDTH ? .29 : .36) + (row - 2) * pitch * .75 };
  }

  private twoFields(time: number): void {
    const { pen, width: w, height: h, tones } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const spread = smooth(time, 22250, 25250);
    const shift = smooth(time, 26250, 28250);
    const dots = smooth(time, 29250, 30750);
    const choose = smooth(time, 35250, 38000);
    const start = { x: w * .12, y: h * .12 };

    for (let panel = 0; panel < 2; panel++) {
      const field = this.field(panel);

      for (let row = 0; row < field.rows; row++) {
        const targetShift = ROW_SHIFTS[row];

        if (targetShift === undefined) throw new Error('Every visible row needs its shipped shift.');

        for (let column = 0; column < 8; column++) {
          const x = 2 * column - 8 + (panel === 1 ? targetShift * shift : 0);
          const placed = interpolate(start, this.fieldPoint(field, x, row), spread);
          const target = panel === 0 ? this.commonPoint(Math.min(column, 6), row % 5) : { x: w * .88, y: h * .12 };
          const position = interpolate(placed, target, choose);
          const unit = mix(8, field.unit, spread) * (panel === 1 ? 1 - choose : 1);

          if (unit > .05) {
            if (panel === 0 && choose > 0) this.dot(position, mix(Math.min(2.2, unit * .22), phone ? 2.5 : 3, choose));
            else this.domino(position, unit, dots, column === 4 && row === 0);
          }
        }
      }
    }

    if (time >= 35250) {
      this.note('KEEP ONE PERIODIC TILING\nDIAGRAM LAYOUT CARRY', w * .5, h * .77, w * .9, phone ? 9 : 13);

      return;
    }

    if (time < 25250) return;

    for (let panel = 0; panel < 2; panel++) {
      const field = this.field(panel);
      const header = phone ? h * (panel === 0 ? .09 : .385) : h * .11;
      this.text(time < 26250 ? `PANEL ${panel + 1}` : panel === 0 ? 'ALIGNED ROWS' : 'SHIFTED ROWS', field.x, header, phone ? 10 : 15);
    }

    if (time < 28250) {
      this.text('THE SAME DOMINO · ONLY THE ROWS SLIDE', w * .5, h * (phone ? .72 : .84), phone ? 9 : 13);

      return;
    }

    this.text('ONE DOT PER COPY · TRANSLATION POSITIONS', w * .5, h * .035, phone ? 9 : 12);
    const left = this.field(0);
    const right = this.field(1);
    const horizontalStart = this.fieldPoint(left, -4, 1);
    this.arrow(horizontalStart, this.fieldPoint(left, -2, 1));
    this.arrow(this.fieldPoint(right, -4, 1), this.fieldPoint(right, -2, 1));
    this.arrow(this.fieldPoint(left, -6, 0), this.fieldPoint(left, -6, 1));
    const index = Math.min(11, Math.floor(12 * progress(time, 28750, 34750)));
    const tested = this.model.shifted.verticalTests[index];

    if (!tested?.witness) throw new Error('Each displayed rejected shift needs its actual missing-point witness.');

    const source = this.fieldPoint(right, tested.witness.source.x, tested.witness.source.y);
    const target = this.fieldPoint(right, tested.witness.target.x, tested.witness.target.y);
    this.arrow(source, target, [3, 2]);
    this.dot(source, 3);
    drawLine(pen, target.x - 3, target.y - 3, target.x + 3, target.y + 3, tones.ink, 1.2);
    drawLine(pen, target.x - 3, target.y + 3, target.x + 3, target.y - 3, tones.ink, 1.2);
    this.text(`(2,0) ✓ BOTH · (0,1) ✓ ALIGNED`, w * .5, h * (phone ? .68 : .79), phone ? 10 : 14, true);
    this.text(`SHIFTED: (0,${index + 1}) × · ACTUAL WINDOW WITNESS`, w * .5, h * (phone ? .73 : .84), phone ? 9 : 12, true);
    this.text(phone ? '13 ROWS SHOWN · ALL 24 ROWS TESTED' : '24-ROW WINDOW · VERTICAL SHIFTS 1–12 TESTED', w * .5, h * (phone ? .78 : .89), phone ? 8.5 : 11);
    this.text('A WINDOW CANNOT PROVE INFINITE NONPERIODICITY', w * .5, h * (phone ? .83 : .94), phone ? 8 : 10.5);
  }

  private exampleWall(time: number): void {
    const { pen, width: w, height: h, tones } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const amount = smooth(time, 42750, 44500);
    const start = { x: w * .12, y: h * .12 };

    for (let index = 0; index < 4; index++) {
      const center = interpolate(start, { x: w * (.2 + index * .2), y: h * .50 }, amount);
      const unit = (phone ? 8 : 12) * amount;

      if (index === 0) this.domino({ x: center.x - unit * .5, y: center.y }, unit);
      else if (index === 1) {
        pen.strokeStyle = tones.ink;
        pen.lineWidth = 1;
        pen.strokeRect(center.x - unit / 2, center.y - unit / 2, unit, unit);
      } else if (index === 2) this.lTile({ x: center.x - unit * .25, y: center.y + unit * .5 }, unit * .7);
      else {
        pen.beginPath();

        for (let corner = 0; corner < 6; corner++) {
          const angle = corner * Math.PI / 3;
          const x = center.x + unit * Math.cos(angle);
          const y = center.y + unit * Math.sin(angle);

          if (corner === 0) pen.moveTo(x, y);
          else pen.lineTo(x, y);
        }

        pen.closePath();
        pen.stroke();
      }

      if (time >= 44500) this.text('PERIODIC', center.x, h * .56, phone ? 8.5 : 11);
    }

    if (time >= 44500) this.text('HEXAGON ICON SCHEMATIC', w * .5, h * .925, phone ? 8.5 : 11);
  }

  private periodicField(time: number): void {
    const { width: w, height: h } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const collapse = smooth(time, 53500, 55500);

    for (let row = 0; row < 5; row++) {
      for (let column = 0; column < 7; column++) {
        const a = this.commonPoint(column, row);
        const b = dimensionPoint(w, h, time, column, row);
        this.dot(interpolate(a, b, collapse), phone ? 2.5 : 3);
      }
    }

    if (time >= 53500) return;

    const origin = this.commonPoint(1, 3);
    const along = this.commonPoint(3, 3);
    const up = this.commonPoint(1, 1);
    this.arrow(origin, along);
    this.arrow(origin, up);
    this.text('ONE PERIODIC TILING IS ENOUGH ✓', w * .5, h * .055, phone ? 10 : 16, true);
    this.text('THE ALIGNED DOMINO EXAMPLE', w * .5, h * .105, phone ? 9 : 12);
    this.text('TWO INDEPENDENT PERIODS', w * (phone ? .5 : .30), h * .60, phone ? 9 : 12);

    if (time >= 42750) {
      this.exampleWall(time);
      this.note('LAGARIAS–WANG 1996\nIF A TILE TILES, DOES SOME PERIODIC TILING EXIST?', w * .5, h * .71, w * .9, phone ? 9 : 13);
      this.text('THE CONJECTURE · NOT A THEOREM', w * .5, h * .87, phone ? 9 : 12);
    } else {
      this.text('THIS ONE EXAMPLE ANSWERS THE DOMINO CASE', w * .5, h * .78, phone ? 8.5 : 12);
    }
  }
}

export function createSameTileFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new SameTileFilm(root, context);
}

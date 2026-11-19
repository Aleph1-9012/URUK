import { mix, progress, smooth } from '../../../lib/animation';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import type { FilmDrawing } from '../../plate/controller';
import { drawLine, drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';
import { buildMazeModel, MAZE_EDGES, ROOM_COUNT, EXIT_ROOM } from './math';
import { drawLedger, drawMemory, memoryLayout } from './panels';

type Point = { x: number; y: number };

type Tones = { ink: string; muted: string; paper: string; blue: string };

const ROOM_SITES = [[0, 0], [1, 0], [1, 1], [0, 1], [2, 0], [2, 1], [2, 2], [3, 2]] as const;

function interpolate(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

class MazeFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly model = buildMazeModel();
  private tones: Tones = PAGE_TONES;

  constructor(private readonly pen: CanvasRenderingContext2D) {}

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.tones = tones;
  }

  draw(time: number): void {
    const { pen, width: w, height: h, tones } = this;
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);

    if (time < 21750) {
      this.maze(time, false);
      this.pointer(time);
    } else if (time < 35500) {
      this.layers(time);
    } else {
      this.maze(time, true);
    }

    drawMemory(pen, w, h, time, tones, this.model.records);
    drawLedger(pen, w, h, time, tones);
  }

  private text(value: string, x: number, y: number, size: number, math = false): void {
    drawText(this.pen, value, x, y, { size, color: this.tones.ink, family: math ? 'math' : 'type', paper: this.tones.paper });
  }

  private note(value: string, x: number, y: number, width: number, size: number): void {
    drawWrappedText(this.pen, value, x, y, width, { size, color: this.tones.ink, paper: this.tones.paper });
  }

  private site(room: number, small = false): Point {
    const { width: w, height: h } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const position = ROOM_SITES[room];

    if (!position) throw new Error('The maze drawing needs one site per room.');

    const unit = small ? Math.min(w * (tall ? .075 : .062), h * .105) : Math.min(w * (tall ? .20 : .11), h * .205);
    const cx = w * (tall ? (small ? .25 : .5) : .265);
    const cy = h * (small ? (tall ? .17 : .36) : .40);

    return { x: cx + (position[0] - 1.5) * unit, y: cy + (position[1] - 1) * unit };
  }

  private disk(point: Point, radius: number, filled: boolean): void {
    const { pen, tones } = this;
    pen.beginPath();
    pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    pen.fillStyle = filled ? tones.ink : tones.paper;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1;
    pen.fill();
    pen.stroke();
  }

  private maze(time: number, small: boolean): void {
    const { width: w, height: h, pen, tones } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const reveal = small ? 1 : progress(time, 0, 2200);
    const edgeCount = MAZE_EDGES.length * reveal;

    for (const [index, [from, to]] of MAZE_EDGES.entries()) {
      const a = this.site(from, small);
      const b = this.site(to, small);
      const amount = Math.max(0, Math.min(1, edgeCount - index));
      const end = interpolate(a, b, amount);
      drawLine(pen, a.x, a.y, end.x, end.y, tones.ink, 1.25);

      if (small && from === 6 && to === 7) this.wall(interpolate(a, b, .5), 7);
    }

    for (let room = 0; room < ROOM_COUNT; room++) {
      const point = this.site(room, small);
      const radius = (small ? (tall ? 7 : 8) : tall ? 8 : 11) * smooth(time, room * 90, room * 90 + 600);

      if (radius <= 0) continue;

      this.disk(point, radius, false);
      this.text(String(room), point.x, point.y, small ? (tall ? 9 : 11) : (tall ? 10 : 14), true);
    }

    if (small) {
      if (tall) {
        this.note('THE SAME UNDIRECTED MAZE', w * .25, 4, w * .44, 9);
        this.note('6–7 CLOSED · NO PATH TO THE EXIT', w * .25, this.site(EXIT_ROOM, true).y + 11, w * .44, 8.5);
      } else {
        this.text('THE SAME UNDIRECTED MAZE', w * .265, h * .13, 12);
        this.text('6–7 CLOSED · NO PATH TO THE EXIT', w * .265, h * .58, 11);
      }
      if (!tall) this.note('TOY WALK ≠ THE PAPER’S METHOD', w * .265, h * .64, w * .43, 11);

      return;
    }

    this.text('EIGHT ROOMS · NINE PASSAGES', w * (tall ? .5 : .265), h * .055, tall ? 10 : 15);
    const start = this.site(0);
    const exit = this.site(EXIT_ROOM);
    this.text('START', start.x, start.y - (tall ? 20 : 27), tall ? 8.5 : 11);
    this.text('EXIT', exit.x + (tall ? 9 : 0), exit.y + (tall ? 21 : 28), tall ? 8.5 : 11);
    const position = this.samplePosition(time);
    const token = interpolate(this.site(position.from), this.site(position.to), position.amount);
    this.disk(token, tall ? 4.3 : 5.8, true);

    if (time >= 18750) this.coin(time);
  }

  private samplePosition(time: number): { from: number; to: number; amount: number; pointer: number } {
    // One carried sample: 0→1 is the first coin decision. Keep it at room 1
    // while the three-neighbour choice is explained, then take its actual 1→2 move.
    if (time < 5000) return { from: 0, to: 0, amount: 0, pointer: 0 };

    if (time < 6500) {
      const amount = smooth(time, 5000, 6500);

      return { from: 0, to: 1, amount, pointer: amount < 1 ? 0 : 1 };
    }

    if (time < 20250) return { from: 1, to: 1, amount: 0, pointer: 1 };

    const amount = smooth(time, 20250, 21250);

    return { from: 1, to: 2, amount, pointer: amount < 1 ? 1 : 2 };
  }

  private pointer(time: number): void {
    const { width: w, height: h, pen, tones } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const centre = w * (tall ? .5 : .755);
    const top = h * (tall ? .72 : .35);
    const cell = w * (tall ? .103 : .047);
    const left = centre - 4 * cell;
    const pointer = this.samplePosition(time).pointer;
    this.text('ONE CURRENT-ROOM POINTER', centre, top - 23, tall ? 9 : 12);

    for (let room = 0; room < ROOM_COUNT; room++) {
      pen.strokeStyle = tones.ink;
      pen.lineWidth = .8;
      pen.strokeRect(left + room * cell, top, cell, cell);
      this.text(String(room), left + (room + .5) * cell, top + cell * .5, tall ? 12 : 17, true);
    }

    const x = left + (pointer + .5) * cell;
    pen.beginPath();
    pen.moveTo(x, top + cell + 4);
    pen.lineTo(x - 4, top + cell + 11);
    pen.lineTo(x + 4, top + cell + 11);
    pen.closePath();
    pen.fillStyle = tones.ink;
    pen.fill();

    if (time >= 11750) {
      const bits = pointer.toString(2).padStart(this.model.bits, '0');
      const bitY = top + cell + (tall ? 31 : 64);
      const bitWidth = tall ? 26 : 39;

      for (const [index, bit] of Array.from(bits).entries()) {
        const bx = centre + (index - 1) * (bitWidth + 4);
        pen.strokeRect(bx - bitWidth / 2, bitY - bitWidth / 2, bitWidth, bitWidth);
        this.text(bit, bx, bitY, tall ? 18 : 26, true);
      }

      this.text('3 BITS · 8 CONFIGURATIONS', centre, bitY + (tall ? 23 : 42), tall ? 9 : 12);
    } else {
      this.text('SCHEMATIC · ONE POINTER', centre, top + cell + 35, tall ? 9 : 12);
    }
  }

  private coin(time: number): void {
    const { width: w, height: h, pen, tones } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const room = this.site(1);
    const radius = tall ? 11 : 15;
    const x = room.x + (tall ? 0 : 2);
    const y = room.y - (tall ? 40 : 48);
    const decision = this.model.sample.decisions[1];

    if (!decision) throw new Error('The displayed three-way choice needs its actual fair-bit word.');

    const beat = Math.min(decision.bits.length - 1, Math.floor((time - 18750) / 350));
    const bit = decision.bits[beat];

    if (bit === undefined) throw new Error('Every displayed flip must come from the carried sample.');
    pen.beginPath();
    pen.ellipse(x, y, radius * (.15 + .85 * Math.abs(Math.cos((time - 18750) / 350 * Math.PI))), radius, 0, 0, Math.PI * 2);
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.2;
    pen.stroke();
    this.text(String(bit), x, y, tall ? 12 : 16, true);
    const choices = [0, 2, 4];

    for (const target of choices) {
      const end = this.site(target);
      const middle = interpolate(room, end, .53);
      this.text('⅓', middle.x, middle.y - 11, tall ? 12 : 17, true);
    }

    this.text(time < 19450 ? 'FAIR BITS · 11: RETRY' : '01: TAKE PASSAGE TO ROOM 2', w * (tall ? .26 : .265), h * (tall ? .575 : .72), tall ? 8.5 : 11);
  }

  private layerPoint(step: number, room: number): Point {
    const { width: w, height: h } = this;
    const tall = w < PHONE_STAGE_WIDTH;

    return {
      x: w * (tall ? .07 : .055) + step / 21 * w * (tall ? .86 : .46),
      y: h * (tall ? .14 : .17) + room / 7 * h * (tall ? .37 : .53),
    };
  }

  private cursor(time: number): number {
    if (time < 28250) return Math.floor(21 * progress(time, 24250, 27750));
    if (time < 29250) return Math.ceil(21 * (1 - smooth(time, 28250, 29250)));
    if (time < 29750) return 0;

    return Math.floor(21 * progress(time, 29750, 31500));
  }

  private carriedPoint(step: number, room: number, time: number): Point {
    const unroll = smooth(time, 21750 + step * 65, 23750 + step * 65);
    const opened = interpolate(this.site(room), this.layerPoint(step, room), unroll);
    const folded = smooth(time, 33500, 35500);

    if (folded === 0) return opened;
    if (step === 0) return interpolate(opened, this.site(room, true), folded);

    const bar = memoryLayout(this.width, this.height);
    const target = {
      x: mix(bar.left, bar.right, ((step - 1) * ROOM_COUNT + room) / (21 * ROOM_COUNT - 1)),
      y: bar.generalY + (room % 2 ? 1 : -1) * bar.barHeight * .22,
    };

    return interpolate(opened, target, folded);
  }

  private layers(time: number): void {
    const { pen, width: w, height: h, tones, model } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const cursor = this.cursor(time);
    const blocked = time >= 29750;
    const walk = blocked ? model.blocked : model.open;
    const radius = tall ? 2.5 : 3.2;
    const fold = smooth(time, 33500, 35500);
    const unroll = smooth(time, 21750, 25115);
    pen.lineWidth = Math.min(.75, 1 / this.density);
    pen.strokeStyle = tones.muted;
    pen.beginPath();

    for (let step = 0; step < 21; step++) {
      const flows = walk.flows[step];

      if (!flows) throw new Error('A layered time step needs its outgoing transitions.');

      for (const flow of flows) {
        const a = this.carriedPoint(step, flow.from, time);
        const b = this.carriedPoint(step + 1, flow.to, time);
        const end = interpolate(a, b, smooth(time, 21750 + step * 65, 22900 + step * 65));
        pen.moveTo(a.x, a.y);
        pen.lineTo(end.x, end.y);
      }
    }

    pen.stroke();

    for (let step = 0; step <= 21; step++) {
      const row = walk.rows[step];

      if (!row) throw new Error('Each displayed time column needs a computed probability row.');

      for (let room = 0; room < ROOM_COUNT; room++) {
        const point = this.carriedPoint(step, room, time);
        const probability = row[room];

        if (probability === undefined) throw new Error('A displayed room needs its actual probability.');

        this.disk(point, step === 0 ? mix(radius, tall ? 7 : 8, fold) : radius, false);

        if (step <= cursor && probability > 0) {
          pen.beginPath();
          pen.arc(point.x, point.y, (radius + 2.5) * Math.sqrt(probability) * (1 - fold), 0, Math.PI * 2);
          pen.fillStyle = tones.ink;
          pen.fill();
        }

        if (step === 0 && fold > .4) this.text(String(room), point.x, point.y, tall ? 8.5 : 11, true);
      }
    }

    if (fold > 0) return;

    this.text('ONE ROOM ROW FOR EACH TIME STEP', w * (tall ? .5 : .285), h * .05, tall ? 9 : 12);
    this.text('22 COLUMNS × 8 ROOMS · UNDIRECTED TOY', w * (tall ? .5 : .285), h * .09, tall ? 8.5 : 11);

    if (unroll > .95) {
      for (const step of tall ? [0, 21] : [0, 5, 10, 15, 21]) {
        const point = this.layerPoint(step, 7);
        this.text(String(step), point.x, point.y + 16, tall ? 10 : 12, true);
      }

      this.text('STEPS', w * (tall ? .5 : .285), h * (tall ? .59 : .78), tall ? 8.5 : 11);
      this.text('7', w * (tall ? .025 : .028), this.layerPoint(0, 7).y, tall ? 10 : 12, true);
      this.text('0', w * (tall ? .025 : .028), this.layerPoint(0, 0).y, tall ? 10 : 12, true);
    }

    if (time >= 29250) {
      const a = this.layerPoint(8, 6);
      const b = this.layerPoint(9, 7);
      drawLine(pen, a.x, a.y, b.x, b.y, tones.muted, .7);
      this.wall(interpolate(a, b, .5), tall ? 6 : 9);
    }

    const cx = w * (tall ? .5 : .765);
    const top = h * (tall ? .64 : .25);
    const available = w * (tall ? .9 : .41);
    const small = tall ? 9 : 12;
    const probability = walk.rows[cursor]?.[EXIT_ROOM];

    if (probability === undefined) throw new Error('The exit readout needs its live probability at the displayed step.');

    if (time >= 28250 && time < 29750) {
      this.note('REWIND · RESTART AT ROOM 0', cx, top, available, small);
      this.text(`STEP ${cursor}`, cx, top + 29, tall ? 13 : 18, true);
    } else {
      this.note(blocked ? 'FRESH RUN · PASSAGE 6–7 CLOSED' : 'REACHED THE EXIT BY THIS STEP', cx, top, available, small);
      this.text(`STEP ${cursor}: ${probability.toFixed(4)}`, cx, top + (tall ? 31 : 47), tall ? 20 : 29, true);
    }

    if (blocked) this.text('WITH THE WALL: 0 · EVERY STEP', cx, top + (tall ? 62 : 83), small);
    else this.text('ABSORBING EXIT · FILLED AREA ∝ PROBABILITY', cx, top + (tall ? 62 : 83), tall ? 8.5 : 10, true);

    this.note('TOY · WHOLE PROBABILITY ROW STORED\nNOT THE LOG-SPACE METHOD', cx, top + (tall ? 88 : 125), available, small);
  }

  private wall(point: Point, radius: number): void {
    drawLine(this.pen, point.x - radius * .3, point.y - radius, point.x + radius * .3, point.y + radius, this.tones.paper, 5);
    drawLine(this.pen, point.x - radius * .3, point.y - radius, point.x + radius * .3, point.y + radius, this.tones.ink, 2.2);
  }
}

export function createMazeFilm(context: CanvasRenderingContext2D): FilmDrawing {
  return new MazeFilm(context);
}

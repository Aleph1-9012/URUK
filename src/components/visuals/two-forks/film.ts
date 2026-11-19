import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';
import { buildTwoForksModel, replayPolicy, sameCell, type Cell, type Replay } from './math';
import { drawTwoForksPanels, layout } from './panels';
import { motionAt } from './story';

type Point = { x: number; y: number };
type Board = { left: number; top: number; size: number };
type Motion = ReturnType<typeof motionAt>;

function unit(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function boardBetween(a: Board, b: Board, amount: number): Board {
  return { left: mix(a.left, b.left, amount), top: mix(a.top, b.top, amount), size: mix(a.size, b.size, amount) };
}

function cellAt(cells: readonly Cell[], index: number): Cell {
  const cell = cells[index];

  if (!cell) throw new Error('Every drawn toy cell must come from its computed placement.');

  return cell;
}

class TwoForksFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private page = layout(1, 1);
  private readonly labels: FilmLabels;
  private readonly model = buildTwoForksModel();
  private readonly baseReplay: Replay;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 4, vertical: 4 });
    const base = this.model.height2.children[0];

    if (!base || base.kind !== 'base') throw new Error('The displayed conditional base must be a checked Snaky placement.');

    this.baseReplay = replayPolicy(base, base.A, []);
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.tones = tones;
    this.page = layout(width, height);
    this.labels.resize(width, height);
  }

  private text(value: string, x: number, y: number, size = this.page.phone ? 9 : 11, math = false, blue = false): void {
    drawText(this.pen, value, x, y, { size, family: math ? 'math' : 'type', color: blue ? this.tones.blue : this.tones.ink, paper: this.tones.paper });
  }

  private line(a: Point, b: Point, weight = .7, blue = false, dash: readonly number[] = []): void {
    drawLine(this.pen, a.x, a.y, b.x, b.y, blue ? this.tones.blue : this.tones.ink, weight, dash);
  }

  private cellOrigin(board: Board, cell: Cell): Point {
    return { x: board.left + (cell[0] + 1.5) * board.size / 9, y: board.top + (4 - cell[1]) * board.size / 9 };
  }

  private center(board: Board, cell: Cell): Point {
    const point = this.cellOrigin(board, cell);

    return { x: point.x + board.size / 18, y: point.y + board.size / 18 };
  }

  private maker(board: Board, cell: Cell, amount = 1): void {
    if (amount <= 0) return;

    const center = this.center(board, cell);
    const size = board.size / 9 * .76 * amount;
    this.pen.fillStyle = this.tones.ink;
    this.pen.fillRect(center.x - size / 2, center.y - size / 2, size, size);
  }

  private breaker(board: Board, cell: Cell, amount = 1): void {
    if (amount <= 0) return;

    const center = this.center(board, cell);
    this.pen.beginPath();
    this.pen.arc(center.x, center.y, board.size / 9 * .30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * amount);
    this.pen.strokeStyle = this.tones.ink;
    this.pen.lineWidth = board.size < 120 ? 1 : 1.8;
    this.pen.stroke();
  }

  private outline(board: Board, cells: readonly Cell[], weight = 1.2, amount = 1, hatch = false): void {
    const { pen } = this;
    const step = board.size / 9;
    const visible = Math.ceil(cells.length * amount);
    pen.beginPath();

    for (let index = 0; index < visible; index++) {
      const cell = cellAt(cells, index);
      const point = this.cellOrigin(board, cell);
      const neighbors: Cell[] = [[cell[0], cell[1] + 1], [cell[0] + 1, cell[1]], [cell[0], cell[1] - 1], [cell[0] - 1, cell[1]]];
      const corners = [{ x: point.x, y: point.y }, { x: point.x + step, y: point.y }, { x: point.x + step, y: point.y + step }, { x: point.x, y: point.y + step }];

      for (let edge = 0; edge < 4; edge++) {
        const neighbor = neighbors[edge];
        const a = corners[edge];
        const b = corners[(edge + 1) % 4];

        if (!neighbor || !a || !b) throw new Error('An envelope boundary needs four adjacent cell tests.');
        if (cells.some(value => sameCell(value, neighbor))) continue;

        pen.moveTo(a.x, a.y);
        pen.lineTo(b.x, b.y);
      }

      if (hatch) {
        const cornerInset = this.page.compact ? .1 : .015;
        const cornerReach = this.page.compact ? .4 : .16;
        pen.moveTo(point.x + step * cornerInset, point.y + step * cornerReach);
        pen.lineTo(point.x + step * cornerReach, point.y + step * cornerInset);
      }
    }

    pen.strokeStyle = this.tones.ink;
    pen.lineWidth = weight;
    pen.stroke();
  }

  private lattice(board: Board, amount: number): void {
    const { pen } = this;
    const step = board.size / 9;
    const radius = (.5 + amount * 8.5) * step;
    const cx = board.left + 2 * step;
    const cy = board.top + 4.5 * step;
    pen.save();
    pen.beginPath();
    pen.rect(board.left, board.top, board.size, board.size);
    pen.clip();
    pen.beginPath();

    for (let index = -10; index <= 10; index++) {
      const x = board.left + step * (index + 1.5);
      const y = board.top + step * (4 - index);

      if (Math.abs(x - cx) <= radius) {
        pen.moveTo(x, cy - radius);
        pen.lineTo(x, cy + radius);
      }

      if (Math.abs(y - cy) <= radius) {
        pen.moveTo(cx - radius, y);
        pen.lineTo(cx + radius, y);
      }
    }

    pen.strokeStyle = this.tones.muted;
    pen.lineWidth = .35;
    pen.stroke();
    pen.restore();
  }

  private replay(board: Board, replay: Replay, amounts: readonly number[], initialAmount = 1): void {
    for (const [index, cell] of replay.initialMaker.entries()) this.maker(board, cell, unit(initialAmount * replay.initialMaker.length - index));
    for (const cell of replay.initialBreaker) this.breaker(board, cell);

    for (const [index, turn] of replay.turns.entries()) {
      const amount = amounts[index];

      if (amount === undefined) throw new Error('Each legal toy turn needs its choreography interval.');

      if (turn.player === 'maker') this.maker(board, turn.cell, amount);
      else this.breaker(board, turn.cell, amount);
    }

    if (amounts.length === replay.turns.length && amounts.every(amount => amount === 1)) this.outline(board, replay.completed, board.size < 120 ? 1 : 2.3);
  }

  private insetBoard(): Board {
    const box = this.page.inset;
    const size = Math.min(box.width, box.height);

    return { left: box.left, top: box.top, size };
  }

  private proofBoard(motion: Motion): Board {
    const original = this.page.board;
    const small = { left: original.left, top: original.top, size: original.size * (this.page.phone ? .42 : .62) };

    return boardBetween(boardBetween(original, small, motion.paperScale), this.insetBoard(), motion.certificate);
  }

  private pivotLabel(board: Board, cell: Cell): void {
    const center = this.center(board, cell);
    const x = this.page.phone ? board.left - 12 : center.x - board.size / 9 * .85;
    const y = center.y - board.size / 9 * .85;
    this.line({ x: x + (this.page.phone ? 8 : 4), y: y + 4 }, { x: center.x - 3, y: center.y - 3 }, .6);
    this.labels.place('pivot-name', x, y);
  }

  private targets(motion: Motion): void {
    const board = this.page.board;
    const orientations = this.model.orientations;
    const position = motion.orient * orientations.length;
    const index = Math.min(orientations.length - 1, Math.floor(position));
    const a = orientations[index];
    const b = orientations[Math.min(orientations.length - 1, index + 1)];

    if (!a || !b) throw new Error('The gallery needs all eight computed orientations.');

    function centered(cells: readonly Cell[]): Cell[] {
      const maxX = Math.max(...cells.map(cell => cell[0]));
      const maxY = Math.max(...cells.map(cell => cell[1]));
      const tx = Math.floor((4 - maxX) / 2);
      const ty = Math.floor((1 - maxY) / 2);

      return cells.map(([x, y]) => [x + tx, y + ty]);
    }

    const first = centered(a);
    const second = centered(b);
    const amount = unit((position - index - .65) / .35);
    const cells = first.map((cell, i): Cell => {
      const target = cellAt(second, i);
      const home = cellAt(this.model.snaky, i);

      return [mix(mix(cell[0], target[0], amount), home[0], motion.settle), mix(mix(cell[1], target[1], amount), home[1], motion.settle)];
    });
    const step = board.size / 9;
    this.pen.strokeStyle = this.tones.ink;
    this.pen.lineWidth = 1;

    for (const cell of cells) {
      const point = this.cellOrigin(board, cell);
      this.pen.strokeRect(point.x, point.y, step, step);
    }

    if (motion.scene === 'orientations' || motion.settle < 1) {
      const morphing = (amount > 0 && amount < 1) || (motion.settle > 0 && motion.settle < 1);
      this.text(morphing ? 'DISPLAY MORPH · TARGET RESET' : `TARGET ORIENTATION ${index + 1} / ${orientations.length}`, board.left + board.size / 2, board.top + board.size + 13, this.page.phone ? 8 : 10);
    }

    if (motion.scene === 'orientations' && motion.orient === 1) this.breaker(board, cellAt(cells, 0));
    if (motion.scene === 'snaky' && motion.row > 0) this.outline(board, this.model.snaky.filter(cell => cell[1] === 0), 2.5, motion.row);
    if (motion.scene === 'snaky' && motion.tail > 0) this.outline(board, this.model.snaky.filter(cell => cell[1] === 1), 2.5, motion.tail);
    this.labels.place('target-name', board.left + board.size / 2, this.page.text.boardHeading);
  }

  private toys(motion: Motion): void {
    const board = this.page.board;
    const trace = this.model.traces.height2BlockFirst;
    const outside = this.model.traces.height2Outside;
    const reply = outside.turns.find(turn => turn.player === 'breaker');

    if (!reply) throw new Error('The outside class needs its legal representative reply.');

    switch (motion.scene) {
      case 'grid':
        this.maker(board, cellAt(this.model.snaky, 0), unit(motion.firstMarks * 2));
        this.breaker(board, reply.cell, unit(motion.firstMarks * 2 - 1));
        break;
      case 'orientations':
      case 'snaky':
        this.targets(motion);
        break;
      case 'turns': {
        const states = [unit(motion.turns * 3), unit(motion.turns * 3 - 1), unit(motion.turns * 3 - 2)] as const;
        this.maker(board, cellAt(this.model.snaky, 0), states[0]);
        this.breaker(board, reply.cell, states[1]);
        this.maker(board, cellAt(this.model.snaky, 1), states[2]);
        const count = states.reduce((total, amount) => total + Number(amount === 1), 0);
        const label = ['MAKER TO MOVE', 'MAKER 1', 'BREAKER 1', 'MAKER 2'][count];

        if (!label) throw new Error('The alternating example needs its actual completed turn count.');

        this.text(label, board.left + board.size / 2, board.top + board.size + 12);
        break;
      }
      case 'base': {
        this.outline(board, this.model.snaky, .8);
        this.replay(board, this.baseReplay, [motion.baseFinish], motion.base);

        if (motion.baseFinish > 0 && !this.page.compact) {
          const fresh = this.baseReplay.turns[0];

          if (!fresh || fresh.player !== 'maker') throw new Error('The base finishes with its one fresh Maker claim.');

          const center = this.center(board, fresh.cell);
          const arm = board.size / 9 * .22 * motion.baseFinish;
          drawLine(this.pen, center.x - arm, center.y, center.x + arm, center.y, this.tones.paper, 1.2);
          drawLine(this.pen, center.x, center.y - arm, center.x, center.y + arm, this.tones.paper, 1.2);
        }

        break;
      }
      case 'fork': {
        const first = this.model.height2.children[0];
        const second = this.model.height2.children[1];

        if (!first || !second) throw new Error('The fork needs both placed Snaky children.');

        this.outline(board, first.T, .8);
        this.outline(board, second.T, .8, motion.fork);

        if (motion.fork === 1) this.outline(board, this.model.height2.T, 1.2, 1, true);

        this.replay(board, trace, [motion.pivot, motion.breaker, motion.answer], motion.requiredA);
        this.pivotLabel(board, this.model.height2.p);
        break;
      }
      case 'outside': {
        const moving = boardBetween(board, this.insetBoard(), motion.inset);
        this.outline(moving, this.model.height2.T, 1, 1, true);
        this.replay(moving, outside, [1, unit(motion.distant * 2), unit(motion.distant * 2 - 1)]);

        if (motion.height3 > 0) {
          this.outline(board, this.model.height3.T, 1.2, motion.height3, true);
          for (const [index, cell] of this.model.height3.A.entries()) this.maker(board, cell, unit(motion.height3 * this.model.height3.A.length - index));
          this.pivotLabel(board, this.model.height3.p);
        }

        break;
      }
      case 'height': {
        const proof = this.proofBoard(motion);
        this.outline(proof, this.model.height3.T, 1.1, 1, true);
        const phases = [unit(motion.heightCountdown * 3), unit(motion.heightCountdown * 3 - 1), unit(motion.heightCountdown * 3 - 2)];
        this.replay(proof, this.model.traces.height3Inside, phases);

        if (motion.heightCountdown === 1) this.text(`${this.model.traces.height3Inside.makerMoves} FRESH CLAIMS · WIN`, proof.left + proof.size / 2, proof.top + proof.size + 13, this.page.phone ? 8 : 10);
        break;
      }
      case 'certificate':
        this.outline(this.proofBoard(motion), this.model.height3.T, .7, 1, true);
        this.replay(this.proofBoard(motion), this.model.traces.height3Inside, [1, 1, 1]);
        break;
      case 'finite':
      case 'checker':
      case 'ledger':
        break;
    }
  }

  private inset(motion: Motion): void {
    if (motion.inset < 1) return;

    if (motion.scene === 'certificate') {
      if (motion.certificate === 1) {
        const board = this.insetBoard();
        this.text('CONDITIONAL TOY', board.left + board.size / 2, this.page.text.insetCaption, this.page.phone ? 7 : 9);
      }

      return;
    }

    const board = this.insetBoard();
    const size = board.size;
    this.pen.fillStyle = this.tones.paper;
    this.pen.fillRect(board.left - 3, board.top - 3, size + 6, size + 6);
    this.pen.strokeStyle = this.tones.ink;
    this.pen.lineWidth = .5;
    this.pen.strokeRect(board.left - 3, board.top - 3, size + 6, size + 6);
    const trace = motion.certificate > 0 ? this.model.traces.height3Inside : this.model.traces.height2Outside;
    const claim = motion.certificate > 0 ? this.model.height3 : this.model.height2;
    this.outline(board, claim.T, .7, 1, true);
    this.replay(board, trace, [1, 1, 1]);
    this.text('CONDITIONAL TOY', board.left + size / 2, this.page.text.insetCaption, this.page.phone ? 7 : 9);
  }

  private heightScale(motion: Motion): void {
    if (motion.paperScale === 0) return;

    const box = this.page.scale;
    const collapse = this.page.phone ? motion.certificate : 0;
    const x = (box.left + box.right) / 2;
    const final = { x: this.width * .80, y: this.height * .49 };
    const top = { x: mix(x, final.x, collapse), y: mix(box.top, final.y, collapse) };
    const bottom = { x: mix(x, final.x, collapse), y: mix(box.bottom, final.y, collapse) };
    this.line(top, bottom);

    for (let value = 1; value <= this.model.articleNumbers.height; value++) {
      const y = mix(bottom.y, top.y, (value - 1) / (this.model.articleNumbers.height - 1));
      const blue = value === this.model.articleNumbers.height;
      const label = blue || value === 1 || value === 10;

      if (blue || collapse < .8) this.line({ x: top.x - 3, y }, { x: top.x + 3, y }, blue ? 2 : .7, blue);
      if (label && (blue || collapse < .4)) this.text(blue ? `≤${value}` : String(value), top.x + (blue ? 24 : 13), y, blue ? 17 : this.page.phone ? 10 : 13, true, blue);
    }

    if (collapse === 1) this.text('MAKER CLAIMS', final.x, final.y + 23, this.page.phone ? 8 : 10);
  }

  private certificate(motion: Motion): void {
    if (motion.certificate === 0 || motion.pullback === 1) return;

    const box = this.page.certificate;
    if (this.page.compact) {
      this.pen.fillStyle = this.tones.paper;
      this.pen.fillRect(box.left - 3, box.top - 3, box.right - box.left + 6, box.bottom - box.top + 6);
    }

    const middle = (box.top + box.bottom) / 2;
    this.pen.strokeStyle = this.tones.ink;
    this.pen.lineWidth = .8;
    this.pen.strokeRect(box.left, middle - 12, (box.right - box.left) * motion.certificate, 24);

    this.text('COUNT ONLY · NO CARD DATA', this.page.phone ? this.width * .40 : (box.left + box.right) / 2, middle + 29, this.page.phone ? 8 : 11);
  }

  private claimBadges(motion: Motion): void {
    if (motion.claims === 0) return;

    const box = this.page.certificate;
    const target = { x: this.width * (this.page.phone ? .50 : .60), y: this.height * (this.page.phone ? .49 : .20) };
    const x = mix((box.left + box.right) / 2, target.x, motion.pullback);
    const y = mix((box.top + box.bottom) / 2 - 30, target.y, motion.pullback);
    this.text(String(this.model.articleNumbers.claims), x, y, this.page.phone ? 17 : 23, true, true);
    this.text('CONDITIONS', x, y + (this.page.phone ? 22 : 27), this.page.phone ? 8 : 10);
  }

  private finite(motion: Motion): void {
    if (motion.pullback === 0) return;

    const initial = this.page.board;
    const board = { ...initial, size: mix(initial.size, this.page.phone ? initial.size : Math.min(initial.size, this.height * .58), motion.pullback) };
    const { pen } = this;
    pen.fillStyle = this.tones.paper;
    pen.fillRect(board.left, board.top, board.size, board.size);
    pen.strokeStyle = this.tones.blue;
    pen.lineWidth = 1.8;
    pen.setLineDash([5, 4]);
    pen.strokeRect(board.left, board.top, board.size, board.size);
    pen.setLineDash([]);
    this.labels.place('board-size', board.left + board.size / 2, board.top - 12);

    if (motion.envelope > 0) {
      pen.strokeStyle = this.tones.blue;
      pen.setLineDash([4, 4]);
      pen.strokeRect(board.left + board.size * .15, board.top + board.size * .15, board.size * .70, board.size * .62);
      pen.setLineDash([]);
      drawWrappedText(pen, `${this.model.articleNumbers.envelope} CELLS\nACTUAL REGION NOT DRAWN`, board.left + board.size / 2, board.top + board.size * .23, board.size * .60, { size: this.page.phone ? 8 : 11, color: this.tones.ink, paper: this.tones.paper });
    }

    if (motion.pivotClaim > 0) {
      const [x, y] = this.model.articleNumbers.pivot;
      const point = { x: board.left + board.size * (x + .5) / this.model.articleNumbers.board, y: board.top + board.size * (this.model.articleNumbers.board - y - .5) / this.model.articleNumbers.board };
      pen.beginPath();
      pen.arc(point.x, point.y, 3.2 * motion.pivotClaim, 0, Math.PI * 2);
      pen.fillStyle = this.tones.blue;
      pen.fill();
    }
  }

  draw(time: number): void {
    const { pen, width, height } = this;
    const motion = motionAt(time);
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, width, height);
    pen.setLineDash([]);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    this.labels.beginFrame();

    if (motion.pullback === 0) {
      const board = this.page.compact ? this.page.board : boardBetween(this.page.board, this.insetBoard(), motion.certificate);
      this.lattice(board, motion.grid);
    }

    this.toys(motion);
    this.certificate(motion);
    this.finite(motion);
    this.claimBadges(motion);
    this.inset(motion);
    this.heightScale(motion);
    drawTwoForksPanels(pen, width, height, time, this.tones, this.labels, { orientations: this.model.orientations.length, height2Required: this.model.height2.A.length, height2Envelope: this.model.height2.T.length, height2Height: this.model.height2.h, height3Required: this.model.height3.A.length, height3Envelope: this.model.height3.T.length, height3Height: this.model.height3.h, height3ActualMoves: this.model.traces.height3Inside.makerMoves });
    this.labels.endFrame();
  }
}

export function createTwoForksFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new TwoForksFilm(root, context);
}

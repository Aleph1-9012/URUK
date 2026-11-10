import { mix, smooth } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { type ColourModel, type FirstFitStep } from './math';
import { type Box, type Colors, type Point, drawGlyph, graphLayout, line, text, vertexPoint } from './drawing';
import { claimProgress, edgeProgress, firstFitProgress, isolatedProgress, layout, liftProgress, nodeProgress, revealProgress } from './story';
import { drawPanels } from './panels';

type ColourFrame = { colors: readonly number[]; step: FirstFitStep | null; opening: number; count: number };

export class PromisedThreeFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };

  constructor(private readonly root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D, private readonly model: ColourModel) {
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
    const { pen, colors } = this;
    const boxes = layout(this.width, this.height, time);
    this.labels.beginFrame();
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, this.width, this.height);
    pen.lineJoin = 'round';
    pen.lineCap = 'round';
    pen.setLineDash([]);
    this.graph(boxes.stage, time, boxes.tall);
    drawPanels(pen, boxes.panel, time, colors, this.labels.place, this.model, boxes.tall);
    this.labels.endFrame();
  }

  private colourFrame(time: number): ColourFrame {
    const amount = firstFitProgress(time);
    const clock = amount * this.model.n;
    const completed = Math.min(this.model.n, Math.floor(clock));
    const previous = this.model.firstFit.steps[completed - 1];
    const step = completed < this.model.n ? this.model.firstFit.steps[completed] : null;
    const opening = clock - completed;

    if (completed > 0 && !previous) throw new Error('A completed first-fit step retains its exact colour assignment.');
    if (completed < this.model.n && !step) throw new Error('Every unfinished first-fit prefix has its next computed choice.');

    const colors = previous?.colors ?? Array<number>(this.model.n).fill(-1);

    return { colors, step: step ?? null, opening, count: opening > 0 && step ? step.colorCount : previous?.colorCount ?? 0 };
  }

  private graph(box: Box, time: number, tall: boolean): void {
    const { model, pen, colors } = this;
    const geometry = graphLayout(box, tall);
    const lifted = liftProgress(time);
    const points = model.positions.map((position, vertex) => {
      const point = vertexPoint(position, geometry);

      return { x: point.x, y: point.y - (model.liftedClass.includes(vertex) ? lifted * (tall ? 8 : 12) : 0) };
    });
    const coloring = this.colourFrame(time);
    const revealed = revealProgress(time);
    const size = tall ? 8 : Math.min(15, box.w * .032);
    const active = time >= 12000 && time < 22250 ? coloring.step : null;
    const edges = edgeProgress(time) * model.edges.length;

    for (const [index, [a, b]] of model.edges.entries()) {
      const from = points[a];
      const to = points[b];

      if (!from || !to) throw new Error('Each graph link has its two carried vertices.');

      const shown = Math.max(0, Math.min(1, edges - index));

      if (shown <= 0) continue;

      pen.strokeStyle = colors.muted;
      pen.lineWidth = tall ? .4 : .65;
      this.link(from, to, size / 2 + 2, shown);
    }

    if (time >= 5750 && time < 7000) {
      const edge = model.edges[0];

      if (!edge) throw new Error('The opening comparison uses a real graph edge.');

      const from = points[edge[0]];
      const to = points[edge[1]];

      if (!from || !to) throw new Error('The highlighted edge joins two actual vertices.');

      pen.strokeStyle = colors.ink;
      pen.lineWidth = tall ? 1.3 : 2;
      this.link(from, to, size / 2 + 2, 1);
    }

    if (active && coloring.opening > 0) {
      const to = points[active.vertex];

      if (!to) throw new Error('The first-fit choice names its actual graph vertex.');

      pen.strokeStyle = colors.ink;
      pen.lineWidth = tall ? 1 : 1.6;

      for (const neighbour of active.neighbours) {
        const from = points[neighbour];

        if (!from) throw new Error('A forbidden mark comes from an already-coloured neighbour.');

        this.link(from, to, size / 2 + 2, 1);
      }
    }

    for (const [vertex, point] of points.entries()) {
      const shown = Math.max(0, Math.min(1, nodeProgress(time) * model.n - vertex));

      if (shown <= 0) continue;

      const planted = model.planted[vertex];
      const fitted = model.firstFit.colors[vertex];

      if (planted === undefined || fitted === undefined) throw new Error('Every graph vertex has its computed two colouring histories.');

      pen.fillStyle = colors.paper;
      pen.beginPath();
      pen.arc(point.x, point.y, size / 2 + 1.3, 0, Math.PI * 2);
      pen.fill();

      if (time < 12000) {
        const first = model.edges[0];
        const opening = smooth(time, 5750, 6250) * (1 - smooth(time, 7000, 7500));

        if (first && first.includes(vertex) && opening > 0) drawGlyph(pen, planted, point.x, point.y, size * opening, colors);
        else this.uncoloured(point, shown, colors);
      } else if (time < 22250) {
        const color = active?.vertex === vertex && coloring.opening > 0 ? active.color : coloring.colors[vertex];

        if (color === undefined) throw new Error('A first-fit frame retains every partial color slot.');

        if (color < 0) this.uncoloured(point, 1, colors);
        else drawGlyph(pen, color, point.x, point.y, size * (active?.vertex === vertex ? smooth(coloring.opening, 0, 1) : 1), colors);
      } else {
        const local = Math.max(0, Math.min(1, revealed * model.n - vertex));
        const amount = fitted === planted ? 1 : local < .5 ? 1 - 2 * local : 2 * local - 1;
        const color = local < .5 ? fitted : planted;

        if (amount > 0) drawGlyph(pen, color, point.x, point.y, size * amount, colors);
      }

      if ((active?.vertex === vertex && coloring.opening > 0) || (model.liftedClass.includes(vertex) && lifted > 0)) {
        pen.strokeStyle = colors.ink;
        pen.lineWidth = tall ? .7 : 1.2;
        pen.beginPath();
        pen.arc(point.x, point.y, size / 2 + 3, 0, Math.PI * 2);
        pen.stroke();
      }

      const position = model.positions[vertex];

      if (!position) throw new Error('A carried vertex retains its canonical circle position.');

      const home = vertexPoint(position, geometry);
      const direction = Math.atan2(home.y - geometry.center.y, home.x - geometry.center.x);
      const offset = geometry.idOffset;
      text(pen, `${vertex + 1}`, point.x + Math.cos(direction) * offset, point.y + Math.sin(direction) * offset, tall ? 8 : 11, 22, colors);
    }

    this.headings(box, time, coloring, tall);
    this.palette(box, geometry.paletteY, time, coloring, size, tall);
    this.isolates(box, geometry.isolateY, time, size);
    this.fraction(box, geometry.fractionY, time, tall);
  }

  private link(from: Point, to: Point, clearance: number, amount: number): void {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);

    if (length <= 2 * clearance) return;

    const portion = clearance / length;
    const start = { x: from.x + dx * portion, y: from.y + dy * portion };
    const end = { x: to.x - dx * portion, y: to.y - dy * portion };
    line(this.pen, start.x, start.y, mix(start.x, end.x, amount), mix(start.y, end.y, amount));
  }

  private uncoloured(point: Point, amount: number, colors: Colors): void {
    this.pen.fillStyle = colors.ink;
    this.pen.beginPath();
    this.pen.arc(point.x, point.y, Math.max(.01, 1.4 * amount), 0, Math.PI * 2);
    this.pen.fill();
  }

  private headings(box: Box, time: number, coloring: ColourFrame, tall: boolean): void {
    let first = 'NEIGHBOURS DIFFER';
    let second = 'COLOURS ARE INK MARKS';

    if (time >= 7000 && time < 12000) { first = 'ARE THREE COLOURS ENOUGH?'; second = 'HARD TO DECIDE'; }
    else if (time >= 12000 && time < 22250) { first = 'PROMISED: THREE ARE ENOUGH'; second = `FIRST-FIT, THIS ORDER: ${coloring.count} USED`; }
    else if (time >= 22250 && time < 27250) {
      const settled = revealProgress(time) === 1;
      first = settled ? 'THE HIDDEN ONE: THREE' : 'GLYPHS IN TRANSIT';
      second = settled ? `FIRST-FIT, THIS ORDER: ${this.model.firstFit.colorCount}` : 'SETTLED COLOURINGS COMPARED';
    }
    else if (time >= 27250 && time < 55000) { first = 'THE HIDDEN ONE: THREE'; second = `FIRST-FIT, THIS ORDER: ${this.model.firstFit.colorCount}`; }
    else if (time >= 55000 && time < 73750) { first = 'A THIRD, ALWAYS THERE'; second = `LARGEST HERE: ${this.model.alpha} OF ${this.model.n}`; }
    else if (time >= 73750 && time < 87250) {
      const amount = isolatedProgress(time);
      first = 'SAME COLOURS NEEDED: THREE';
      second = amount === 1 ? `INDEPENDENT: ${this.model.withIsolates.alpha} OF ${this.model.withIsolates.n} · ABOUT 0.67` : amount === 0 ? `${this.model.alpha} OF ${this.model.n} INDEPENDENT` : 'LONE DOTS IN TRANSIT';
    } else if (time >= 87250) { first = 'HIDDEN THREE · LARGEST CLASS SIX'; second = 'THIS SMALL EXAMPLE IS SOLVED EXACTLY'; }

    const x = box.x + box.w / 2;

    if (time >= 12000 && revealProgress(time) < 1) {
      const opening = revealProgress(time);
      const half = box.w * .46;
      const arm = half * (1 - opening);
      const top = box.y - (tall ? 3 : 6) + opening * 8;
      const bottom = box.y + (tall ? 17 : 20) - opening * 8;
      this.pen.strokeStyle = this.colors.ink;
      this.pen.lineWidth = tall ? .7 : 1;

      for (const side of [-1, 1]) {
        const edge = x + side * (half + opening * box.w * .02);
        this.pen.beginPath();
        this.pen.moveTo(edge - side * arm, top);
        this.pen.lineTo(edge, top);
        this.pen.lineTo(edge, bottom);
        this.pen.lineTo(edge - side * arm, bottom);
        this.pen.stroke();
      }
    }

    text(this.pen, first, x, box.y + 7, tall ? 10 : 15, box.w - 6, this.colors);
    text(this.pen, second, x, box.y + (tall ? 23 : 29), tall ? 8.5 : 12, box.w - 6, this.colors);
  }

  private palette(box: Box, y: number, time: number, coloring: ColourFrame, size: number, tall: boolean): void {
    const revealed = revealProgress(time);
    const pitch = box.w / 7;
    const first = box.x + box.w / 2 - 2.5 * pitch;
    const shift = smooth(revealed, .5, 1) * pitch * 1.5;
    text(this.pen, 'PALETTE · GLYPHS, NOT VERTEX NUMBERS', box.x + box.w / 2, y - 17, tall ? 8 : 11, box.w - 6, this.colors);

    for (let color = 0; color < 6; color++) {
      const amount = color < 3 ? 1 : 1 - Math.min(1, 2 * revealed);

      if (amount <= 0) continue;

      const x = first + color * pitch + (color < 3 ? shift : 0);
      drawGlyph(this.pen, color, x, y, size * amount, this.colors);

      if (tall) text(this.pen, `${color + 1}`, x, y + 13, 8 * amount, pitch - 4, this.colors);
      else {
        this.pen.font = `${11 * amount}px "Garamond Math", serif`;
        this.pen.fillStyle = this.colors.ink;
        this.pen.textAlign = 'center';
        this.pen.textBaseline = 'top';
        this.pen.fillText(`${color + 1}`, x, y + size * amount / 2 + 5);
      }

      if (time >= 12000 && time < 22250 && coloring.opening > 0 && coloring.step?.used.includes(color)) {
        const crossY = y + (tall ? 21 : 32);
        this.pen.strokeStyle = this.colors.ink;
        this.pen.lineWidth = .8;
        line(this.pen, x - 4, crossY, x + 4, crossY + 6);
        line(this.pen, x + 4, crossY, x - 4, crossY + 6);
      }
    }

    if (time >= 12000 && time < 22250) text(this.pen, '× = USED BY A COLOURED NEIGHBOUR', box.x + box.w / 2, y + (tall ? 39 : 52), tall ? 8 : 10, box.w - 6, this.colors);
  }

  private isolates(box: Box, rows: readonly [number, number], time: number, size: number): void {
    const amount = isolatedProgress(time);

    if (amount <= 0) return;

    const pitch = box.w / 10;

    for (let index = 0; index < this.model.withIsolates.isolateCount; index++) {
      const target = box.x + pitch * (index % 9 + 1);
      const x = target - (1 - amount) * (box.x + box.w + size);
      const y = rows[Math.floor(index / 9)];

      if (y === undefined) throw new Error('Each of the eighteen isolated dots belongs to one of two nine-dot rows.');

      drawGlyph(this.pen, 0, x, y, size, this.colors);
    }

  }

  private fraction(box: Box, y: number, time: number, tall: boolean): void {
    const amount = claimProgress(time);

    if (amount <= 0) return;

    const { pen, colors } = this;
    const start = box.x + box.w * .12;
    const end = box.x + box.w * .88;
    const tip = mix(start, end, amount);
    pen.strokeStyle = colors.blue;
    pen.lineWidth = tall ? 2 : 2.8;
    line(pen, start, y, tip, y);

    for (const x of [start, tip]) {
      pen.fillStyle = colors.paper;
      pen.beginPath();
      pen.arc(x, y, tall ? 3 : 4, 0, Math.PI * 2);
      pen.fill();
      pen.stroke();
    }

    if (amount !== 1) return;

    text(pen, '0', start, y + 15, tall ? 10 : 13, 30, colors);
    text(pen, '1/3', end, y + 15, tall ? 10 : 13, 30, colors);
    text(pen, 'CLAIMED · EVERY FIXED', box.x + box.w * .30, y - 15, tall ? 8.5 : 12, box.w * .52, colors);
    this.labels.place('fraction-range', box.x + box.w * .78, y - 15);
  }
}

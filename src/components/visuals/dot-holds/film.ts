import { mix, progress } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { type Box, type Colors, type Point, graphLayout, insetBox, line, text } from './drawing';
import { type Arc, type GraphModel } from './math';
import { drawPanels } from './panels';
import { arrowProgress, claimProgress, focusAt, insetProgress, layout, sealProgress, selectedState } from './story';

type GraphLayout = ReturnType<typeof graphLayout>;

function samePair(arc: Arc, pair: Arc): boolean {
  return Math.min(...arc) === pair[0] && Math.max(...arc) === pair[1];
}

function quadratic(a: Point, control: Point, b: Point, amount: number): Point {
  const rest = 1 - amount;

  return { x: rest * rest * a.x + 2 * rest * amount * control.x + amount * amount * b.x, y: rest * rest * a.y + 2 * rest * amount * control.y + amount * amount * b.y };
}

export class DotHoldsFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };

  constructor(private readonly root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D, private readonly model: GraphModel) {
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
    const boxes = layout(this.width, this.height, time);
    this.labels.beginFrame();
    this.pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    this.pen.clearRect(0, 0, this.width, this.height);
    this.pen.lineJoin = 'round';
    this.pen.lineCap = 'round';
    this.pen.setLineDash([]);
    this.graph(boxes.stage, time, boxes.tall);
    drawPanels(this.pen, boxes.panel, time, this.colors, this.labels.place, this.model, boxes.tall);
    this.opposite(boxes.panel, time, boxes.tall);
    this.labels.endFrame();
  }

  private point(vertex: number, geometry: GraphLayout): Point {
    const position = this.model.positions[vertex];

    if (!position) throw new Error('Every graph vertex keeps its unit-circle position.');

    return { x: geometry.centre.x + position.x * geometry.radius, y: geometry.centre.y + position.y * geometry.radius };
  }

  private graph(box: Box, time: number, tall: boolean): void {
    const { model, pen, colors } = this;
    const geometry = graphLayout(box, tall);
    const state = selectedState(time);
    const snapshot = model.history[state.index];
    const next = state.turning ? model.history[state.nextIndex] : null;

    if (!snapshot || state.turning && !next) throw new Error('Each arrow turn has both computed endpoint graphs.');

    const change = next?.change;

    if (state.turning && !change) throw new Error('Each seeded turn records the pair whose arrow reverses.');

    const focus = focusAt(time);
    const focused = focus === null ? null : snapshot.vertices[focus];

    if (focus !== null && !focused) throw new Error('The focused dot belongs to its current canonical graph.');

    const showingSets = time >= 8750 && time < 17750;
    const first = new Set(showingSets ? focused?.first : []);
    const second = new Set(showingSets ? focused?.second : []);
    const holders = new Set(snapshot.holders);
    const seals = sealProgress(time);
    const claimed = claimProgress(time);
    const halo = (vertex: number): number => {
      const marker = first.has(vertex) || second.has(vertex) ? 4 : 0;
      const stamp = holders.has(vertex) ? 4 * seals + (tall ? 2 : 4) * claimed : 0;

      return Math.max(marker, stamp);
    };
    const visible = arrowProgress(time) * snapshot.arcs.length;
    const title = state.turning ? 'TURNING ONE ARROW · COUNTS HELD' : `${model.n} DOTS · ${Math.floor(visible)} OF ${snapshot.arcs.length} ARROWS`;
    text(pen, title, box.x + box.w / 2, box.y + 8, tall ? 9.5 : 15, box.w - 4, colors);

    for (const [index, arc] of snapshot.arcs.entries()) {
      if (change && samePair(arc, change.pair)) continue;

      const amount = Math.max(0, Math.min(1, visible - index));
      const [a, b] = arc;
      const emphasized = showingSets && (a === focus || first.has(a) && second.has(b));
      pen.lineWidth = emphasized ? tall ? 1 : 1.5 : tall ? .5 : .8;
      this.arrow(this.point(a, geometry), this.point(b, geometry), geometry, amount, 0, 0, halo(a), halo(b));
    }

    if (state.turning && change) {
      if (change.from === 0 || change.to !== -change.from) throw new Error('The seeded animation reverses one existing arrow at each of its four turns.');

      const [a, b] = change.pair;
      const from = change.from === 1 ? a : b;
      const to = change.from === 1 ? b : a;
      pen.lineWidth = tall ? 1.5 : 2.2;
      const distance = Math.hypot(this.point(a, geometry).x - this.point(b, geometry).x, this.point(a, geometry).y - this.point(b, geometry).y);
      this.arrow(this.point(from, geometry), this.point(to, geometry), geometry, 1, Math.min(tall ? 13 : 24, distance / 4) * Math.sin(Math.PI * state.turnProgress), state.turnProgress, halo(from), halo(to));
    }

    for (const vertex of snapshot.holders) {
      const lifting = state.turning && change?.lost.includes(vertex) ? progress(state.turnProgress, .65, 1) : 0;
      this.seal(this.point(vertex, geometry), geometry, seals, lifting, tall);
    }

    if (claimed > 0) {
      pen.strokeStyle = colors.blue;
      pen.lineWidth = tall ? 1.8 : 2.5;

      for (const vertex of snapshot.holders) {
        const point = this.point(vertex, geometry);
        pen.beginPath();
        pen.arc(point.x, point.y, geometry.nodeRadius + (tall ? 6 : 8), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * claimed);
        pen.stroke();
      }
    }

    for (const data of snapshot.vertices) {
      const point = this.point(data.vertex, geometry);

      if (first.has(data.vertex)) {
        pen.fillStyle = colors.paper;
        pen.beginPath();
        pen.arc(point.x, point.y, geometry.nodeRadius + 4, 0, Math.PI * 2);
        pen.fill();
        pen.strokeStyle = colors.ink;
        pen.lineWidth = 1;
        pen.stroke();
      }

      if (second.has(data.vertex)) this.stipple(point, geometry.nodeRadius + 4, geometry.nodeRadius + 1, tall);

      this.vertex(point, data.vertex + 1, geometry.nodeRadius, data.vertex === focus, tall);

      if (time >= 17750 || showingSets && data.vertex === focus) {
        const unit = model.positions[data.vertex];

        if (!unit) throw new Error('Each outside count belongs to its circle vertex.');

        this.number(`${data.firstCount} | ${data.secondCount}`, point.x + unit.x * geometry.countOffset, point.y + unit.y * geometry.countOffset, tall ? 9 : 13);
      }
    }
  }

  private arrow(start: Point, end: Point, geometry: GraphLayout, amount: number, bow = 0, turn = 0, startHalo = 0, endHalo = 0): void {
    if (amount <= 0) return;

    const { pen, colors } = this;
    const length = Math.hypot(end.x - start.x, end.y - start.y);

    if (length === 0) throw new Error('An arrow joins two distinct circle positions.');

    const unit = { x: (end.x - start.x) / length, y: (end.y - start.y) / length };
    const startInset = geometry.nodeRadius + 2.5 + startHalo;
    const endInset = geometry.nodeRadius + 2.5 + endHalo;
    const a = { x: start.x + unit.x * startInset, y: start.y + unit.y * startInset };
    const b = { x: end.x - unit.x * endInset, y: end.y - unit.y * endInset };
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const normal = { x: -unit.y, y: unit.x };
    const sign = normal.x * (mid.x - geometry.centre.x) + normal.y * (mid.y - geometry.centre.y) > 0 ? -1 : 1;
    const control = { x: mid.x + normal.x * bow * sign, y: mid.y + normal.y * bow * sign };
    const tip = quadratic(a, control, b, amount);
    pen.strokeStyle = colors.ink;
    pen.beginPath();
    pen.moveTo(a.x, a.y);
    pen.quadraticCurveTo(mix(a.x, control.x, amount), mix(a.y, control.y, amount), tip.x, tip.y);
    pen.stroke();

    const parameter = turn > 0 ? 1 - turn : amount;
    const head = quadratic(a, control, b, parameter);
    const dx = 2 * (1 - parameter) * (control.x - a.x) + 2 * parameter * (b.x - control.x);
    const dy = 2 * (1 - parameter) * (control.y - a.y) + 2 * parameter * (b.y - control.y);
    const angle = Math.atan2(dy, dx) + Math.PI * turn;
    const size = geometry.head + (turn > 0 ? .5 : 0);
    pen.fillStyle = colors.ink;
    pen.beginPath();
    pen.moveTo(head.x, head.y);
    pen.lineTo(head.x - Math.cos(angle) * size - Math.sin(angle) * size * .55, head.y - Math.sin(angle) * size + Math.cos(angle) * size * .55);
    pen.lineTo(head.x - Math.cos(angle) * size + Math.sin(angle) * size * .55, head.y - Math.sin(angle) * size - Math.cos(angle) * size * .55);
    pen.closePath();
    pen.fill();
  }

  private seal(point: Point, geometry: GraphLayout, shown: number, lift: number, tall: boolean): void {
    if (shown <= 0 || lift >= 1) return;

    const { pen, colors } = this;
    const radius = geometry.nodeRadius + (tall ? 3 : 4);
    const y = point.y - lift * (tall ? 14 : 22);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = (tall ? 2.2 : 3) * (1 - lift);
    pen.beginPath();
    pen.arc(point.x, y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * shown);
    pen.stroke();
  }

  private stipple(point: Point, outer: number, inner: number, tall: boolean): void {
    const { pen, colors } = this;
    pen.fillStyle = colors.paper;
    pen.beginPath();
    pen.arc(point.x, point.y, outer, 0, Math.PI * 2);
    pen.fill();
    pen.fillStyle = colors.ink;
    const step = tall ? 2.8 : 3.5;

    for (let x = -outer; x <= outer; x += step) {
      for (let y = -outer; y <= outer; y += step) {
        const radius = Math.hypot(x, y);

        if (radius < inner || radius > outer - .5) continue;

        pen.beginPath();
        pen.arc(point.x + x, point.y + y, tall ? .65 : .85, 0, Math.PI * 2);
        pen.fill();
      }
    }
  }

  private number(words: string, x: number, y: number, size: number, tone = this.colors.ink): void {
    this.pen.font = `${size}px "Garamond Math", serif`;
    this.pen.fillStyle = tone;
    this.pen.textAlign = 'center';
    this.pen.textBaseline = 'middle';
    this.pen.fillText(words, x, y + .2);
  }

  private vertex(point: Point, id: number, radius: number, focused: boolean, tall: boolean): void {
    const { pen, colors } = this;
    pen.fillStyle = focused ? colors.ink : colors.paper;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .85;
    pen.beginPath();
    pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    pen.fill();
    pen.stroke();
    this.number(`${id}`, point.x, point.y, tall ? 9.5 : 14, focused ? colors.paper : colors.ink);
  }

  private opposite(panel: Box, time: number, tall: boolean): void {
    const shown = insetProgress(time);

    if (shown <= 0) return;

    const { pen, colors, model } = this;
    const slot = insetBox(panel, tall);
    const box = { ...slot, x: slot.x + (1 - shown) * (panel.w + 20) };
    const geometry = graphLayout(box, tall);
    geometry.centre = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
    geometry.nodeRadius = tall ? 8 : 12;
    geometry.head = tall ? 4 : 6;
    const points = [{ x: box.x + box.w * .24, y: box.y + box.h / 2 }, { x: box.x + box.w * .76, y: box.y + box.h / 2 }];
    pen.save();
    pen.beginPath();
    pen.rect(panel.x, panel.y, panel.w, panel.h);
    pen.clip();
    pen.fillStyle = colors.paper;
    pen.fillRect(box.x, box.y, box.w, box.h);
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .6;
    pen.strokeRect(box.x, box.y, box.w, box.h);

    for (const [a, b] of model.cycle.arcs) {
      const first = points[a];
      const second = points[b];

      if (!first || !second) throw new Error('The excluded reciprocal example has its two labelled dots.');

      pen.lineWidth = tall ? .9 : 1.3;
      this.arrow(first, second, geometry, 1, tall ? 20 : 32);
    }

    for (const data of model.cycle.vertices) {
      const point = points[data.vertex];

      if (!point) throw new Error('Each reciprocal-example count belongs to one of its two dots.');

      this.vertex(point, data.vertex + 1, geometry.nodeRadius, false, tall);

      if (shown === 1) {
        this.number(`${data.firstCount} | ${data.secondCount}`, point.x, point.y + (tall ? 26 : 37), tall ? 11 : 16);
        pen.strokeStyle = colors.ink;
        pen.lineWidth = 1.2;
        const y = point.y - (tall ? 25 : 36);
        line(pen, point.x - 4, y - 4, point.x + 4, y + 4);
        line(pen, point.x - 4, y + 4, point.x + 4, y - 4);
      }
    }

    pen.restore();
  }
}

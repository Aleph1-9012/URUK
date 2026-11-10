import { mix, progress } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { type Box, type Colors, line, text } from './drawing';
import { edgeKey, type Edge, type PairModel, type Point } from './math';
import { drawPanels } from './panels';
import { augmentReveal, bipartiteProgress, blossomProgress, flipProgress, greedyProgress, layout } from './story';

type Camera = { x: number; y: number; scale: number };

function flat(point: Point, camera: Camera): Point {
  return { x: camera.x + point.x * camera.scale, y: camera.y - point.y * camera.scale };
}

function pointAt(positions: readonly Point[], vertex: number): Point {
  const point = positions[vertex];

  if (!point) throw new Error('Each person has a drawing position.');

  return point;
}

export class PairsRingsFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };

  constructor(private readonly root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D, private readonly model: PairModel) {
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
    this.network(boxes.stage, time, boxes.tall);
    drawPanels(pen, boxes.panel, time, colors, this.labels.place, this.model, boxes.tall);
    this.labels.endFrame();
  }

  private camera(box: Box): Camera {
    const positions = this.model.positions;
    const minX = Math.min(...positions.map(point => point.x));
    const maxX = Math.max(...positions.map(point => point.x));
    const minY = Math.min(...positions.map(point => point.y));
    const maxY = Math.max(...positions.map(point => point.y));
    const scale = Math.min((box.w - 30) / (maxX - minX), (box.h - 42) / (maxY - minY));

    return { x: box.x + box.w / 2 - (minX + maxX) / 2 * scale, y: box.y + box.h / 2 + (minY + maxY) / 2 * scale, scale };
  }

  private bond(edge: Edge, positions: readonly Point[], camera: Camera, amount: number, width: number): void {
    if (amount <= 0) return;

    const a = flat(pointAt(positions, edge[0]), camera);
    const b = flat(pointAt(positions, edge[1]), camera);

    if (Math.hypot(a.x - b.x, a.y - b.y) < .1) return;

    const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    this.pen.strokeStyle = this.colors.ink;
    this.pen.lineWidth = width;
    line(this.pen, mix(middle.x, a.x, amount), mix(middle.y, a.y, amount), mix(middle.x, b.x, amount), mix(middle.y, b.y, amount));
  }

  private person(point: Point, number: number, radius: number, tall: boolean): void {
    const { pen, colors } = this;
    pen.fillStyle = colors.paper;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1;
    pen.beginPath();
    pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    pen.fill();
    pen.stroke();

    if (radius < (tall ? 4 : 6)) return;

    pen.font = `${tall ? number > 9 ? 8 : 9 : 12}px "Garamond Math", serif`;
    pen.textAlign = 'center';
    pen.textBaseline = 'middle';
    pen.fillStyle = colors.ink;
    pen.fillText(`${number}`, point.x, point.y + .4);
  }

  private network(box: Box, time: number, tall: boolean): void {
    const { model, pen, colors } = this;
    const camera = this.camera(box);
    const contraction = blossomProgress(time);
    const ring = new Set(model.oddRing);
    const positions = model.positions.map((point, vertex) => ring.has(vertex) ? { x: mix(point.x, model.ringCentre.x, contraction), y: mix(point.y, model.ringCentre.y, contraction) } : point);

    for (const edge of model.edges) this.bond(edge, positions, camera, 1, tall ? .9 : 1.1);

    if (time >= 45750 && time < 53750) {
      for (let index = 0; index < model.oddRing.length; index++) {
        const a = model.oddRing[index];
        const b = model.oddRing[(index + 1) % model.oddRing.length];

        if (a === undefined || b === undefined) throw new Error('The odd ring closes on its next person.');

        this.bond([a, b], positions, camera, 1, tall ? 1.4 : 1.8);
      }
    }

    const flip = flipProgress(time);
    const removed = new Set(model.flip.removed.map(edgeKey));
    const stage = greedyProgress(time) * model.greedy.length;

    for (const [index, edge] of model.greedy.entries()) {
      const amount = Math.max(0, Math.min(1, stage - index)) * (removed.has(edgeKey(edge)) ? flip.oldBond : 1);
      this.bond(edge, positions, camera, amount, tall ? 3 : 4);
    }

    for (const edge of model.flip.added) this.bond(edge, positions, camera, flip.newBonds, tall ? 3 : 4);

    if (time >= 16500 && time < 23000) this.alternating(camera, positions, time, tall);

    for (const [vertex, point] of positions.entries()) {
      const radius = (tall ? 5.5 : 8) * (ring.has(vertex) ? 1 - contraction : 1);

      if (radius > .1) this.person(flat(point, camera), vertex + 1, radius, tall);
    }

    if (contraction > .6) {
      const centre = flat(model.ringCentre, camera);
      pen.fillStyle = colors.ink;
      pen.beginPath();
      pen.arc(centre.x, centre.y, (tall ? 5 : 7) * progress(contraction, .6, 1), 0, Math.PI * 2);
      pen.fill();
    }

    if (time >= 9000 && time < 16000) {
      const free = model.greedyStages.at(-1);

      if (!free) throw new Error('The greedy pairing has its settled stage.');

      const paired = new Set(free.flatMap(edge => [edge[0], edge[1]]));
      pen.strokeStyle = colors.ink;
      pen.lineWidth = 1;

      for (const [vertex, point] of positions.entries()) {
        if (paired.has(vertex)) continue;

        const target = flat(point, camera);
        pen.beginPath();
        pen.arc(target.x, target.y, (tall ? 8 : 12) + Math.sin((time - 9000) / 350) * 1.2, 0, Math.PI * 2);
        pen.stroke();
      }
    }

    if (time >= 45750 && time < 48250) this.parity(camera, time, tall);
    if (time >= 30500 && time < 45750) this.inset(box, time, tall);

    const title = time >= 48250 && time < 53500 ? 'EDMONDS: SHRINK THE ODD RING' : `${model.n} PEOPLE · ${model.edges.length} WILLING LINKS`;
    text(pen, title, box.x + box.w / 2, box.y + 5, tall ? 9.5 : 15, box.w - 4, colors);

    if (time >= 45750 && time < 53750) text(pen, 'CLASSICAL BLOSSOM · ILLUSTRATION', box.x + box.w / 2, box.y + box.h - 4, tall ? 8 : 12, box.w - 4, colors);
  }

  private alternating(camera: Camera, positions: readonly Point[], time: number, tall: boolean): void {
    const { pen, model, colors } = this;
    const coordinate = augmentReveal(time) * (model.augmentingPath.length - 1);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = tall ? 1.5 : 2;
    pen.setLineDash([4, 3]);

    for (let index = 0; index < model.augmentingPath.length - 1; index++) {
      const a = model.augmentingPath[index];
      const b = model.augmentingPath[index + 1];

      if (a === undefined || b === undefined) throw new Error('The alternating path has its next link.');

      const amount = Math.max(0, Math.min(1, coordinate - index));

      if (amount === 0) continue;

      const first = flat(pointAt(positions, a), camera);
      const second = flat(pointAt(positions, b), camera);
      line(pen, first.x, first.y, second.x, second.y, amount);
    }

    pen.setLineDash([]);
  }

  private parity(camera: Camera, time: number, tall: boolean): void {
    const { model, pen, colors } = this;
    const revealed = Math.min(model.blossom.cycle.length, 1 + Math.floor(progress(time, 45750, 46800) * model.blossom.cycle.length));

    for (let index = 0; index < revealed; index++) {
      const vertex = model.blossom.cycle[index];

      if (vertex === undefined) throw new Error('Each parity label belongs to its odd-cycle person.');

      const world = pointAt(model.positions, vertex);
      const direction = { x: world.x - model.ringCentre.x, y: world.y - model.ringCentre.y };
      const length = Math.hypot(direction.x, direction.y);
      const target = flat(world, camera);
      const offset = tall ? 15 : 24;
      text(pen, index % 2 === 0 ? 'NEAR' : 'FAR', target.x + direction.x / length * offset, target.y - direction.y / length * offset, tall ? 8.5 : 12, tall ? 34 : 50, colors);
    }

    if (revealed === model.blossom.cycle.length) {
      const first = model.blossom.cycle[0];
      const last = model.blossom.cycle.at(-1);

      if (first === undefined || last === undefined) throw new Error('The parity collision closes the odd ring.');

      const a = pointAt(model.positions, first);
      const b = pointAt(model.positions, last);
      const middle = flat({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, camera);
      const size = tall ? 3.5 : 5;
      pen.strokeStyle = colors.ink;
      pen.lineWidth = 1.3;
      line(pen, middle.x - size, middle.y - size, middle.x + size, middle.y + size);
      line(pen, middle.x - size, middle.y + size, middle.x + size, middle.y - size);
    }
  }

  private inset(box: Box, time: number, tall: boolean): void {
    const { pen, model, colors } = this;
    const amount = bipartiteProgress(time);
    const area = { x: box.x + box.w * .015, y: box.y + box.h * .74, w: box.w * .27, h: box.h * .21 };
    const minX = Math.min(...model.inset.positions.map(point => point.x));
    const maxX = Math.max(...model.inset.positions.map(point => point.x));
    const minY = Math.min(...model.inset.positions.map(point => point.y));
    const maxY = Math.max(...model.inset.positions.map(point => point.y));
    const scale = Math.min((area.w - 12) / (maxX - minX), (area.h - 10) / (maxY - minY)) * amount;
    const camera = { x: area.x + area.w / 2 - (minX + maxX) / 2 * scale, y: area.y + area.h / 2 + (minY + maxY) / 2 * scale, scale };
    pen.fillStyle = colors.paper;
    pen.fillRect(area.x, area.y, area.w, area.h);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .65;
    pen.strokeRect(area.x, area.y, area.w, area.h);

    for (const edge of model.inset.edges) this.bond(edge, model.inset.positions, camera, 1, .8);

    const left = new Set(model.inset.left);

    for (const [vertex, world] of model.inset.positions.entries()) {
      const point = flat(world, camera);
      pen.beginPath();
      pen.arc(point.x, point.y, (tall ? 2.6 : 4) * amount, 0, Math.PI * 2);
      pen.fillStyle = left.has(vertex) ? colors.ink : colors.paper;
      pen.fill();
      pen.stroke();
    }

    if (amount === 1) text(pen, 'SEPARATE TWO-KIND EXAMPLE', box.x + box.w / 2, box.y + box.h - 4, tall ? 8 : 12, box.w - 4, colors);
  }
}

import { mix, progress, smooth } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { type Box, type Colors, line, text } from './drawing';
import { countInBall, enumerateWalks, neighbours, position, snap, type Point, type PolymerModel } from './math';
import { drawCharts } from './panels';

type Camera = { scale: number; x: number; y: number };

function bounds(points: readonly Point[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  return { minX, minY, maxX, maxY };
}

function cameraFor(points: readonly Point[], box: Box, padding = 25): Camera {
  const extent = bounds(points);
  const scale = Math.min((box.w - padding * 2) / Math.max(1, extent.maxX - extent.minX), (box.h - padding * 2) / Math.max(1, extent.maxY - extent.minY));

  return { scale, x: box.x + box.w / 2 - (extent.minX + extent.maxX) / 2 * scale, y: box.y + box.h / 2 + (extent.minY + extent.maxY) / 2 * scale };
}

function screen(point: Point, camera: Camera): Point {
  return { x: camera.x + point.x * camera.scale, y: camera.y - point.y * camera.scale };
}

function path(pen: CanvasRenderingContext2D, points: readonly Point[], camera: Camera, steps = points.length - 1): void {
  const first = points[0];

  if (!first) throw new Error('A drawn walk starts at a vertex.');

  const origin = screen(first, camera);
  pen.beginPath();
  pen.moveTo(origin.x, origin.y);

  for (let index = 1; index <= Math.ceil(steps); index++) {
    const a = points[index - 1];
    const b = points[index];

    if (!a || !b) break;

    const point = screen({ x: mix(a.x, b.x, Math.min(1, steps - index + 1)), y: mix(a.y, b.y, Math.min(1, steps - index + 1)) }, camera);
    pen.lineTo(point.x, point.y);
  }

  pen.stroke();
}

function circle(pen: CanvasRenderingContext2D, point: Point, radius: number, fill = false): void {
  pen.beginPath();
  pen.arc(point.x, point.y, radius, 0, 2 * Math.PI);

  if (fill) pen.fill();
  else pen.stroke();
}

function layout(width: number, height: number, time: number): { walk: Box; chart: Box; tall: boolean } {
  const tall = width < 600;

  if (!tall) {
    return { walk: { x: width * .025, y: height * .035, w: width * .47, h: height * .92 }, chart: { x: width * .535, y: height * .035, w: width * .435, h: height * .92 }, tall };
  }

  const ending = smooth(time, 110750, 111600);
  const split = mix(.51, .37, ending);

  return { walk: { x: width * .035, y: height * .02, w: width * .93, h: height * (split - .04) }, chart: { x: width * .055, y: height * split, w: width * .89, h: height * (.98 - split) }, tall };
}

export class PolymerWalkFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  private readonly fan3 = enumerateWalks(3);
  private readonly fan4 = enumerateWalks(4);

  constructor(private readonly root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D, private readonly model: PolymerModel) {
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
    const { pen, model, colors } = this;
    const boxes = layout(this.width, this.height, time);
    const closeAmount = smooth(time, 104500, 105500) * (1 - smooth(time, 110750, 111650));
    const points = closeAmount > 0 ? model.walk.map((point, index) => {
      const other = model.closeWalk[index];

      if (!other) throw new Error('Both carried samples have 1,024 steps.');

      return { x: mix(point.x, other.x, closeAmount), y: mix(point.y, other.y, closeAmount) };
    }) : model.walk;
    const growth = smooth(time, 16250, 22500);
    const gap = smooth(time, 54000, 54850) * (1 - smooth(time, 63000, 63850));
    const steps = time < 6500 ? progress(time, 350, 6100) * 12 : 12 + growth * 1012;
    const near = cameraFor([...model.walk.slice(0, 13), ...this.fan4.flat()], boxes.walk, boxes.tall ? 30 : 45);
    const farBox = { x: boxes.walk.x + boxes.walk.w * .34 * gap, y: boxes.walk.y, w: boxes.walk.w * (1 - .34 * gap), h: boxes.walk.h };
    const ballRoom = smooth(time, 31750, 32550);
    const cameraPoints = [...points];

    if (ballRoom > 0) {
      for (const index of [128, 320, 512, 704, 896]) {
        const centre = model.walk[index];

        if (!centre) throw new Error('The camera includes the chosen ball centres.');

        const radius = (index === 512 ? 32 : 16) * ballRoom;
        cameraPoints.push({ x: centre.x - radius, y: centre.y - radius }, { x: centre.x + radius, y: centre.y + radius });
      }
    }

    const far = cameraFor(cameraPoints, farBox, boxes.tall ? 29 : 35);
    const camera: Camera = { scale: mix(near.scale, far.scale, growth), x: mix(near.x, far.x, growth), y: mix(near.y, far.y, growth) };
    this.labels.beginFrame();
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, this.width, this.height);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.save();
    pen.beginPath();
    pen.rect(boxes.walk.x, boxes.walk.y + 20, boxes.walk.w, boxes.walk.h - 45);
    pen.clip();

    if (time < 22000) this.honeycomb(camera, 1 - growth);

    if (time >= 6500 && time < 16250) {
      const fan = time < 10500 ? this.fan3 : this.fan4;
      pen.strokeStyle = colors.muted;
      pen.globalAlpha = .5;
      pen.lineWidth = .75;

      for (const walk of fan) path(pen, walk, camera);

      pen.globalAlpha = 1;
    }

    pen.strokeStyle = colors.ink;
    pen.lineWidth = time < 16250 ? 2 : Math.min(1, 1 / this.density);
    path(pen, points, camera, steps);

    if (gap > 0) {
      const fanCamera = { x: boxes.walk.x + boxes.walk.w * .17, y: boxes.walk.y + boxes.walk.h * .47, scale: Math.min(boxes.walk.w * .30 / 8, boxes.walk.h * .60 / 8) * gap };
      pen.strokeStyle = colors.muted;

      for (const fan of [this.fan3, this.fan4]) {
        for (const walk of fan) {
          pen.lineWidth = .8 + 3 * model.rho ** (walk.length - 1);
          path(pen, walk, fanCamera);
        }
      }

      pen.strokeStyle = colors.ink;
      pen.lineWidth = 1;
      const x = boxes.walk.x + boxes.walk.w * .34;
      const y = boxes.walk.y + boxes.walk.h * .52;
      line(pen, x - 7, y, x + 10, y);
      line(pen, x + 10, y, x + 6, y - 4);
      line(pen, x + 10, y, x + 6, y + 4);
    }

    if (time >= 16250 && time < 31750) this.comparators(camera, boxes.walk);

    const first = points[0];

    if (!first) throw new Error('The sampled walk has an origin.');

    pen.fillStyle = colors.ink;
    circle(pen, screen(first, camera), 2.5, true);

    if (time < 6500) this.freeNeighbours(camera, Math.min(12, Math.floor(steps)));
    let ballNote = '';

    if ((time >= 31750 && time < 38500) || (time >= 71750 && time < 78500) || time >= 111650) ballNote = this.ball(camera, time);
    if (time >= 78500 && time < 84500) this.weightedPieces(camera, time);
    if (time >= 84500 && time < 91000) this.crossing(camera, boxes.walk);
    if (time >= 91000 && time < 97500) this.subwalk(camera, time);

    if (time >= 104500 && time < 110750) {
      const last = points[points.length - 1];

      if (!last) throw new Error('The close-ends walk has an endpoint.');

      pen.strokeStyle = colors.ink;
      pen.lineWidth = 1.5;
      circle(pen, screen(first, camera), 6);
      circle(pen, screen(last, camera), 6);
    }

    pen.restore();
    const origin = screen(first, camera);
    text(pen, 'o', origin.x + 7, origin.y + 9, 12, 18, colors);
    text(pen, time < 16250 ? 'HONEYCOMB · THREE NEIGHBOURS AT EVERY POINT' : 'PIVOT-SAMPLED · ONE WALK OF 1,024 STEPS', boxes.walk.x + boxes.walk.w / 2, boxes.walk.y + 8, boxes.tall ? 10 : 13, boxes.walk.w - 6, colors);

    if (time < 6500) text(pen, `n = ${Math.floor(steps)} · NEVER VISIT A POINT TWICE`, boxes.walk.x + boxes.walk.w / 2, boxes.walk.y + boxes.walk.h - 8, boxes.tall ? 10 : 14, boxes.walk.w - 6, colors);
    else if (time < 16250) text(pen, time < 10500 ? 'ALL 12 WALKS OF THREE STEPS' : 'ALL 24 WALKS OF FOUR STEPS', boxes.walk.x + boxes.walk.w / 2, boxes.walk.y + boxes.walk.h - 8, boxes.tall ? 10 : 14, boxes.walk.w - 6, colors);
    else if (time < 31750) text(pen, `SAW D ≈ ${model.walkDiameter.toFixed(1)} · ORDINARY D ≈ ${model.ordinaryDiameter.toFixed(1)}`, boxes.walk.x + boxes.walk.w / 2, boxes.walk.y + boxes.walk.h - 8, boxes.tall ? 10 : 13, boxes.walk.w - 6, colors);
    else if (time >= 104500 && time < 110750) text(pen, closeAmount < 1 ? 'CHANGING SAMPLE · ORIGIN o HELD' : `ENDS ${model.closeGap.toFixed(2)} APART · DIAMETER ${model.closeDiameter.toFixed(2)} · NOT CLAIMED`, boxes.walk.x + boxes.walk.w / 2, boxes.walk.y + boxes.walk.h - 8, boxes.tall ? 10 : 13, boxes.walk.w - 6, colors);

    if (ballNote) text(pen, ballNote, boxes.walk.x + boxes.walk.w / 2, boxes.walk.y + boxes.walk.h - 8, boxes.tall ? 10 : 13, boxes.walk.w - 6, colors);
    if (time >= 84500 && time < 91000) text(pen, 'N = 20 · ONE EDGE-TO-EDGE CROSSING', boxes.walk.x + boxes.walk.w / 2, boxes.walk.y + boxes.walk.h - 8, boxes.tall ? 10 : 13, boxes.walk.w - 6, colors);

    if (gap > 0) {
      text(pen, 'ALL LENGTHS\nWEIGHTED', boxes.walk.x + boxes.walk.w * .17, boxes.walk.y + boxes.walk.h - 24, boxes.tall ? 9 : 12, boxes.walk.w * .31, colors);
      text(pen, 'ONE LENGTH n\nUNIFORM', boxes.walk.x + boxes.walk.w * .69, boxes.walk.y + boxes.walk.h - 24, boxes.tall ? 9 : 12, boxes.walk.w * .57, colors);
      text(pen, 'THE GAP', boxes.walk.x + boxes.walk.w * .37, boxes.walk.y + boxes.walk.h * .52 - 13, boxes.tall ? 9 : 12, boxes.walk.w * .32, colors);
    }

    if (this.root.hasAttribute('data-numerics-error')) text(pen, 'COUNTED TO 12 · WORKER COULD NOT FINISH', boxes.walk.x + boxes.walk.w / 2, boxes.walk.y + 24, boxes.tall ? 9 : 12, boxes.walk.w - 6, colors);

    drawCharts(pen, boxes.chart, time, colors, this.labels.place, model, boxes.tall);
    this.labels.endFrame();
  }

  private honeycomb(camera: Camera, opacity: number): void {
    const { pen } = this;
    pen.strokeStyle = this.colors.muted;
    pen.lineWidth = Math.min(.7, 1 / this.density);
    pen.globalAlpha = opacity * .45;

    for (let i = -12; i <= 12; i++) {
      for (let j = -12; j <= 12; j++) {
        const vertex = { i, j, sub: 0 } as const;
        const a = screen(position(vertex), camera);

        for (const neighbour of neighbours(vertex)) {
          const b = screen(position(neighbour), camera);
          line(pen, a.x, a.y, b.x, b.y);
        }
      }
    }

    pen.globalAlpha = 1;
  }

  private freeNeighbours(camera: Camera, step: number): void {
    const tip = this.model.walk[step];

    if (!tip) throw new Error('A growing tip is on the sampled walk.');

    const { pen } = this;
    pen.lineWidth = 1.2;
    pen.strokeStyle = this.colors.ink;

    for (const vertex of neighbours(snap(tip))) {
      const point = position(vertex);
      const projected = screen(point, camera);
      const already = this.model.walk.slice(0, step).some(visited => Math.hypot(visited.x - point.x, visited.y - point.y) < .001);
      const previous = this.model.walk[step - 1];

      if (already && previous && Math.hypot(previous.x - point.x, previous.y - point.y) < .001) continue;

      circle(pen, projected, 4);

      if (already) {
        line(pen, projected.x - 5, projected.y + 5, projected.x + 5, projected.y - 5);
      }
    }
  }

  private comparators(camera: Camera, box: Box): void {
    const { pen, colors, model } = this;
    pen.strokeStyle = colors.muted;
    pen.lineWidth = 1;
    pen.setLineDash([2, 3]);
    path(pen, model.ordinaryWalk, camera);
    pen.setLineDash([]);
    pen.strokeStyle = colors.ink;
    path(pen, model.rodWalk, camera);
    const first = model.rodWalk[0];
    const last = model.rodWalk[model.rodWalk.length - 1];

    if (!first || !last) throw new Error('The rod has endpoints.');

    const start = screen(first, camera);
    const end = screen(last, camera);
    const right = box.x + box.w - 8;
    const top = box.y + 30;
    const amount = Math.min(1, (right - start.x) / (end.x - start.x), (top - start.y) / (end.y - start.y));
    const x = mix(start.x, end.x, amount);
    const y = mix(start.y, end.y, amount);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    line(pen, x, y, x - 8 * Math.cos(angle - .5), y - 8 * Math.sin(angle - .5));
    line(pen, x, y, x - 8 * Math.cos(angle + .5), y - 8 * Math.sin(angle + .5));
    text(pen, 'ROD 887 · LEAVES FRAME', box.x + box.w / 2, box.y + 27, 10, box.w - 10, colors);
  }

  private ball(camera: Camera, time: number): string {
    const sliding = time >= 71750 && time < 78500;
    const centres = [128, 320, 512, 704, 896];
    const clock = progress(time, 71750, 77800) * 5;
    const step = Math.min(4, Math.floor(clock));
    const from = centres[step];
    const to = centres[Math.min(4, step + 1)];

    if (from === undefined || to === undefined) throw new Error('The ball has five chosen centres on the walk.');

    const index = sliding ? Math.round(mix(from, to, smooth(clock - step, .65, 1))) : 512;
    const centre = this.model.walk[index];

    if (!centre) throw new Error('A ball centre is a sampled vertex.');

    const radius = sliding ? 16 : 2 ** (1 + 4 * progress(time, 31900, 37800));
    const p = screen(centre, camera);
    const { pen, colors } = this;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1.1;
    circle(pen, p, radius * camera.scale);
    pen.fillStyle = colors.ink;

    for (const point of this.model.walk) {
      if (Math.hypot(point.x - centre.x, point.y - centre.y) <= radius + 1e-10) circle(pen, screen(point, camera), 1.7, true);
    }

    circle(pen, p, 3, true);
    return `s = ${radius.toFixed(1)} · ${countInBall(this.model.walk, centre, radius)} VERTICES IN THIS BALL`;
  }

  private weightedPieces(camera: Camera, time: number): void {
    const lengths = [5, 10, 20];
    const index = Math.min(2, Math.floor(progress(time, 78500, 84200) * 3));
    const length = lengths[index];

    if (length === undefined) throw new Error('A highlighted weight has a length.');

    const start = 400;
    this.pen.strokeStyle = this.colors.ink;
    this.pen.lineWidth = 2.8;
    path(this.pen, this.model.walk.slice(start, start + length + 1), camera);
  }

  private crossing(camera: Camera, box: Box): void {
    const { pen, colors, model } = this;
    const low = screen({ x: 0, y: model.crossing.bottom }, camera).y;
    const high = screen({ x: 0, y: model.crossing.top }, camera).y;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .9;
    line(pen, box.x, low, box.x + box.w, low);
    line(pen, box.x, high, box.x + box.w, high);
    pen.lineWidth = 2.4;
    path(pen, model.crossing.points, camera);
  }

  private subwalk(camera: Camera, time: number): void {
    const index = Math.min(this.model.subwalks.length - 1, Math.floor(progress(time, 91000, 97400) * 12));
    const piece = this.model.subwalks[index];

    if (!piece) throw new Error('A highlighted subwalk has the measured start and length.');

    this.pen.strokeStyle = this.colors.ink;
    this.pen.lineWidth = 2.4;
    path(this.pen, this.model.walk.slice(piece.start, piece.start + piece.length + 1), camera);
  }
}

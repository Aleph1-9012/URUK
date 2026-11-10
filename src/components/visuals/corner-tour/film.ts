import { mix, progress, smooth } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { type Box, type Colors, line, text } from './drawing';
import { type CornerModel, type Edge, type Point, type Solid, sampleTour, cornerCorrespondence } from './math';
import { drawPanels } from './panels';
import { layout, solidAt } from './story';

type Camera = { x: number; y: number; scale: number };

function blend(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

function cameraFor(box: Box): Camera {
  return { x: box.x + box.w / 2, y: box.y + box.h * .52, scale: Math.min(box.w / 2.95, (box.h - 53) / 3.0) };
}

function closingCamera(box: Box, trees: boolean): Camera {
  const span = trees ? 3.0 : 2.3;

  return { x: box.x + box.w / 2, y: box.y + box.h * .45, scale: Math.min(box.w / span, (box.h - 23) / span) };
}

function flat(point: Point, camera: Camera): Point {
  return { x: camera.x + point.x * camera.scale, y: camera.y - point.y * camera.scale };
}

function polygon(pen: CanvasRenderingContext2D, points: readonly Point[]): void {
  pen.beginPath();

  for (const [index, point] of points.entries()) {
    if (index === 0) pen.moveTo(point.x, point.y);
    else pen.lineTo(point.x, point.y);
  }

  pen.closePath();
}

function pointAt(positions: readonly Point[], index: number): Point {
  const point = positions[index];

  if (!point) throw new Error('Every drawn corner has a computed position.');

  return point;
}

function tourProgress(time: number): number {
  if (time < 40000) return progress(time, 9750, 17800);
  if (time < 47000) return progress(time, 41500, 46400);
  if (time < 64500) return progress(time, 48500, 54800);

  return 1;
}

export class CornerTourFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };

  constructor(private readonly root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D, private readonly model: CornerModel) {
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

    if (time < 9750) this.opening(boxes.stage, time, boxes.tall);
    else if (time >= 94500) this.closing(boxes.stage, time, boxes.tall);
    else this.stage(boxes.stage, time, boxes.tall);

    drawPanels(pen, boxes.panel, time, colors, this.labels.place, this.model, boxes.tall);
    this.labels.endFrame();
  }

  private edges(positions: readonly Point[], edges: readonly Edge[], amount = 1): void {
    const { pen, colors } = this;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1;

    for (const [a, b] of edges) {
      const first = pointAt(positions, a);
      const second = pointAt(positions, b);
      const midpoint = blend(first, second, .5);
      line(pen, blend(midpoint, first, amount).x, blend(midpoint, first, amount).y, blend(midpoint, second, amount).x, blend(midpoint, second, amount).y);
    }
  }

  private corner(point: Point, open: boolean, radius: number): void {
    const { pen, colors } = this;
    pen.fillStyle = open ? colors.paper : colors.ink;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1;
    pen.beginPath();
    pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    pen.fill();
    pen.stroke();
  }

  private walker(point: Point, tall: boolean): void {
    const { pen, colors } = this;
    pen.fillStyle = colors.paper;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 2;
    pen.beginPath();
    pen.arc(point.x, point.y, tall ? 5.2 : 7, 0, Math.PI * 2);
    pen.fill();
    pen.stroke();
    pen.beginPath();
    pen.arc(point.x, point.y, 1.2, 0, Math.PI * 2);
    pen.fillStyle = colors.ink;
    pen.fill();
  }

  private tour(solid: Solid, positions: readonly Point[], tour: readonly number[], amount: number, tall: boolean, bipartite: boolean): void {
    const point = this.strokeTour(positions, tour, amount, tall);

    for (const [index, corner] of positions.entries()) this.corner(corner, bipartite && solid.colors[index] === 1, tall ? 2 : 3.2);

    this.walker(point, tall);
  }

  private strokeTour(positions: readonly Point[], tour: readonly number[], amount: number, tall: boolean): Point {
    const { pen, colors } = this;
    const sample = sampleTour(positions, tour, amount);
    const first = sample.trail[0];

    if (!first) throw new Error('A drawn tour has its first point.');

    pen.beginPath();
    pen.moveTo(first.x, first.y);

    for (const point of sample.trail) pen.lineTo(point.x, point.y);

    pen.strokeStyle = colors.ink;
    pen.lineWidth = tall ? 2.5 : 3.2;
    pen.stroke();

    return sample.point;
  }

  private opening(box: Box, time: number, tall: boolean): void {
    const solid = this.model.solids.cube;
    const camera = cameraFor(box);
    const angle = 2 * Math.PI * progress(time, 0, 4500);
    const flatten = smooth(time, 4500, 8500);
    const positions = solid.spatial.map((point, index) => {
      const x = Math.cos(angle) * point.x + Math.sin(angle) * point.z;
      const z = -Math.sin(angle) * point.x + Math.cos(angle) * point.z;
      const y = Math.cos(.4) * point.y - Math.sin(.4) * z;
      const depth = Math.sin(.4) * point.y + Math.cos(.4) * z;
      const perspective = 3.8 / (3.8 - depth);
      const view = flat({ x: x * perspective * .8, y: y * perspective * .8 }, camera);

      return blend(view, flat(pointAt(solid.positions, index), camera), flatten);
    });
    this.edges(positions, solid.edges);

    for (const point of positions) this.corner(point, false, tall ? 2 : 3.2);

    text(this.pen, time < 4500 ? 'THE CUBE' : 'THE SAME CUBE, DRAWN IN THE PLANE', box.x + box.w / 2, box.y + 11, tall ? 10 : 16, box.w - 5, this.colors);
  }

  private graph(solid: Solid, camera: Camera, amount: number, tall: boolean, trees = 0, tour = solid.firstTour, bipartite = true): void {
    const positions = solid.positions.map(point => flat(point, camera));

    if (trees > 0) this.trees(solid, camera, trees, tall);

    this.edges(positions, solid.edges);
    this.tour(solid, positions, tour, amount, tall, bipartite);
  }

  private stage(box: Box, time: number, tall: boolean): void {
    const state = solidAt(time);
    const camera = cameraFor(box);

    if (state.transition) {
      this.morph(box, camera, state, time, tall);

      return;
    }

    const solid = this.model.solids[state.key];
    const trees = time >= 65500 && time < 78000 ? smooth(time, state.key === 'cube' ? 65500 : 72000, state.key === 'cube' ? 69500 : 76000) : 0;
    let tour = solid.firstTour;
    let amount = tourProgress(time);
    let avoided: Edge | undefined;

    if (time >= 79000) {
      const phase = Math.min(2, Math.floor((time - 79000) / (7000 / 3)));
      const candidate = solid.avoided[Math.floor(solid.avoided.length * phase / 3)];

      if (!candidate) throw new Error('Each prescribed edge has a computed avoiding tour.');

      avoided = candidate.edge;
      tour = candidate.tour;
      amount = progress(time, 79000 + phase * (7000 / 3), 79000 + phase * (7000 / 3) + 1900);
    }

    this.graph(solid, camera, amount, tall, trees, tour, time >= 30000);

    if (avoided) this.strike(solid, avoided, camera, tall);

    if (time < 30000) {
      const positions = solid.positions.map(point => flat(point, camera));

      for (const [index, point] of positions.entries()) {
        const radius = Math.hypot(point.x - camera.x, point.y - camera.y);
        const multiplier = (radius + (tall ? 14 : 21)) / radius;
        text(this.pen, `${index + 1}`, camera.x + (point.x - camera.x) * multiplier, camera.y + (point.y - camera.y) * multiplier, tall ? 10 : 15, 24, this.colors);
      }
    }

    const name = solid.key === 'cube' ? 'CUBE' : solid.key === 'hexagonal_prism' ? 'HEXAGONAL PRISM' : 'TRUNCATED OCTAHEDRON';
    text(this.pen, name, box.x + box.w / 2, box.y + 11, tall ? 11 : 17, box.w - 5, this.colors);

    if (trees > 0) {
      const split = solid.split;

      if (tall) {
        text(this.pen, `${split.inside.length} INSIDE · ${split.outside.length} OUTSIDE`, box.x + box.w / 2, box.y + box.h - 15, 10, box.w - 4, this.colors);
        text(this.pen, 'INCLUDING THE OUTER FACE', box.x + box.w / 2, box.y + box.h, 9, box.w - 4, this.colors);
      } else text(this.pen, `${split.inside.length} INSIDE FACES · ${split.outside.length} OUTSIDE, INCLUDING THE OUTER FACE`, box.x + box.w / 2, box.y + box.h - 3, 13, box.w - 4, this.colors);
    } else if (time >= 30000) {
      text(this.pen, `${solid.positions.length} CORNERS · ${solid.edges.length} EDGES`, box.x + box.w / 2, box.y + box.h - 3, tall ? 10 : 15, box.w - 4, this.colors);
    }
  }

  private morph(box: Box, camera: Camera, state: ReturnType<typeof solidAt>, time: number, tall: boolean): void {
    const from = this.model.solids[state.from];
    const to = this.model.solids[state.to];
    const correspondence = cornerCorrespondence(from.positions, to.positions);
    const amount = state.amount;
    const old = from.positions.map((point, index) => flat(blend(point, pointAt(correspondence.ends, index), amount), camera));
    const next = to.positions.map((point, index) => flat(blend(pointAt(correspondence.starts, index), point, amount), camera));
    this.edges(old, from.edges, 1 - amount);
    this.edges(next, to.edges, amount);
    const returningToTrees = time >= 64500 && time < 78000;
    const retreat = returningToTrees ? 1 - progress(amount, 0, .5) : 1 - amount;
    const walker = returningToTrees && amount >= .5 ? this.strokeTour(next, to.firstTour, progress(amount, .5, 1), tall) : this.strokeTour(old, from.firstTour, retreat, tall);
    const matched = new Map(correspondence.matched.map(pair => [pair.old, pair.target]));

    for (const [index, point] of old.entries()) {
      const target = matched.get(index);
      const open = target !== undefined && amount >= .5 ? to.colors[target] === 1 : from.colors[index] === 1;
      this.corner(point, open, (tall ? 2 : 3.2) * (target === undefined ? 1 - amount : 1));
    }

    for (const index of correspondence.addedTargets) this.corner(pointAt(next, index), to.colors[index] === 1, (tall ? 2 : 3.2) * amount);

    this.walker(walker, tall);
    text(this.pen, 'CHANGING SOLID · COUNTS PAUSED', box.x + box.w / 2, box.y + 11, tall ? 9 : 15, box.w - 5, this.colors);
  }

  private strike(solid: Solid, edge: Edge, camera: Camera, tall: boolean): void {
    const first = flat(pointAt(solid.positions, edge[0]), camera);
    const second = flat(pointAt(solid.positions, edge[1]), camera);
    const middle = blend(first, second, .5);
    const dx = second.x - first.x;
    const dy = second.y - first.y;
    const length = Math.hypot(dx, dy);
    const size = tall ? 6 : 9;
    this.pen.strokeStyle = this.colors.ink;
    this.pen.lineWidth = 2;
    line(this.pen, middle.x - dy / length * size, middle.y + dx / length * size, middle.x + dy / length * size, middle.y - dx / length * size);
    text(this.pen, 'PRESCRIBED EDGE · THE TOUR AVOIDS IT', camera.x, camera.y + camera.scale * 1.23, tall ? 8.5 : 13, camera.scale * 2.75, this.colors);
  }

  private trees(solid: Solid, camera: Camera, amount: number, tall: boolean): void {
    const { pen, colors } = this;
    const outside = new Set(solid.split.outside);
    const outer = solid.faces[solid.outerFace];

    if (!outer) throw new Error('The drawn dual includes its outer face.');

    const outerPath = outer.vertices.map(vertex => flat(pointAt(solid.positions, vertex), camera));
    pen.save();
    pen.globalAlpha = Math.min(1, amount * 3) * .13;
    pen.fillStyle = colors.ink;
    pen.beginPath();
    pen.rect(camera.x - camera.scale * 1.43, camera.y - camera.scale * 1.43, camera.scale * 2.86, camera.scale * 2.86);

    for (const [index, point] of outerPath.entries()) {
      if (index === 0) pen.moveTo(point.x, point.y);
      else pen.lineTo(point.x, point.y);
    }

    pen.closePath();
    pen.fill('evenodd');

    for (const [index, face] of solid.faces.entries()) {
      if (face.outer) continue;

      pen.globalAlpha = Math.min(1, amount * 3) * (outside.has(index) ? .13 : .045);
      polygon(pen, face.vertices.map(vertex => flat(pointAt(solid.positions, vertex), camera)));
      pen.fill();
    }

    pen.restore();
    const growth = progress(amount, .25, 1);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = tall ? 1.1 : 1.5;

    for (const [index, link] of solid.split.links.entries()) {
      const length = link.route.length - 1;
      const local = Math.max(0, Math.min(1, growth * solid.split.links.length - index));

      for (let segment = 0; segment < length; segment++) {
        const a = flat(pointAt(link.route, segment), camera);
        const b = flat(pointAt(link.route, segment + 1), camera);
        line(pen, a.x, a.y, b.x, b.y, Math.max(0, Math.min(1, local * length - segment)));
      }
    }

    if (growth > 0) {
      for (const [index, face] of solid.faces.entries()) {
        const point = flat(face.centre, camera);
        this.corner(point, !outside.has(index), tall ? 2.9 : 4);
      }
    }
  }

  private closing(box: Box, time: number, tall: boolean): void {
    const amount = smooth(time, 94500, 96000);
    const main = cameraFor(box);
    const cubeBox = tall ? { x: box.x + box.w * .12, y: box.y + 16, w: box.w * .76, h: box.h * .55 } : { x: box.x, y: box.y + 12, w: box.w * .32, h: box.h - 12 };
    const prismBox = tall ? { x: box.x, y: box.y + box.h * .58, w: box.w * .48, h: box.h * .42 } : { x: box.x + box.w * .34, y: box.y + 12, w: box.w * .30, h: box.h - 12 };
    const truncBox = tall ? { x: box.x + box.w * .52, y: box.y + box.h * .58, w: box.w * .48, h: box.h * .42 } : { x: box.x + box.w * .68, y: box.y + 12, w: box.w * .32, h: box.h - 12 };
    const cubeCamera = closingCamera(cubeBox, true);
    const prismCamera = closingCamera(prismBox, false);
    const target = closingCamera(truncBox, false);
    const truncCamera = { x: mix(main.x, target.x, amount), y: mix(main.y, target.y, amount), scale: mix(main.scale, target.scale, amount) };
    const truncated = this.model.solids.truncated_octahedron;
    const lastAvoided = truncated.avoided[Math.floor(truncated.avoided.length * 2 / 3)];

    if (!lastAvoided) throw new Error('The closing solid carries its final avoiding tour.');

    this.graph(truncated, truncCamera, 1, tall, 0, lastAvoided.tour);

    if (amount > 0) {
      const cube = this.model.solids.cube;
      const prism = this.model.solids.hexagonal_prism;
      cubeCamera.scale *= amount;
      prismCamera.scale *= amount;
      this.graph(cube, cubeCamera, 1, tall, amount);
      this.graph(prism, prismCamera, 1, tall);
    }

    if (amount === 1) {
      for (const [camera, name] of [[cubeCamera, 'CUBE'], [prismCamera, 'PRISM'], [truncCamera, 'TRUNCATED']] as const) text(this.pen, name, camera.x, camera.y + camera.scale * (name === 'CUBE' ? 1.56 : 1.25), tall ? 8.5 : 13, camera.scale * 2.8, this.colors);
    }
  }
}

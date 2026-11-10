import { mix, smooth } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { type Box, type Colors, line, text } from './drawing';
import { outerBallSegments, clipRoute, gridPoint, schematicGuide, treeRoute, type Point, type RouteModel, type RouteResult, type Segment } from './math';
import { drawPanels } from './panels';
import { ballTime, branchRadius, cameraProgress, claimProgress, huntIndex, huntProgress, layout, outlineProgress, strikeProgress, treeProgress } from './story';

type Camera = { x: number; y: number; scale: number };

type Outline = { time: number; segments: Segment[] };

function flat(point: Point, camera: Camera): Point {
  return { x: camera.x + point.x * camera.scale, y: camera.y - point.y * camera.scale };
}

function stipple(vertex: number): number {
  let value = Math.imul(vertex + 1, 0x45d9f3b);
  value = Math.imul(value ^ value >>> 16, 0x45d9f3b);
  value ^= value >>> 16;

  return (value >>> 0) % 5 === 0 ? 126 : 32;
}

export class FastestRoutesFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  private readonly raster: HTMLCanvasElement;
  private readonly rasterPen: CanvasRenderingContext2D;
  private readonly pixels: ImageData;
  private rasterTime = -1;
  private previewRaster = false;
  private prepared: RouteResult | null = null;
  private outlines: Outline[] = [];
  private guide: Point[] = [];

  constructor(private readonly root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D, private readonly model: RouteModel) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 4 });
    this.raster = document.createElement('canvas');
    this.raster.width = model.N;
    this.raster.height = model.N;
    const context = this.raster.getContext('2d');

    if (!context) throw new Error('The finite-grid image requires its drawing context.');

    this.rasterPen = context;
    this.pixels = context.createImageData(model.N, model.N);
  }

  resize(width: number, height: number, density: number): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.canvas.width = Math.round(width * density);
    this.canvas.height = Math.round(height * density);
    const style = getComputedStyle(this.root);

    for (const tone of ['ink', 'blue', 'muted', 'paper'] as const) this.colors[tone] = style.getPropertyValue(`--${tone}`).trim() || this.colors[tone];

    this.rasterTime = -1;
    this.previewRaster = false;
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
    this.stage(boxes.stage, time, boxes.tall);
    drawPanels(pen, boxes.panel, time, colors, this.labels.place, this.model, boxes.tall);
    this.labels.endFrame();
  }

  private camera(box: Box, time: number): Camera {
    const full = Math.min((box.w - 18) / this.model.N, (box.h - 35) / this.model.N);
    const zoom = Math.exp(Math.log(this.model.N / 10) * (1 - cameraProgress(time)));

    return { x: box.x + box.w / 2, y: box.y + box.h * .53, scale: full * zoom };
  }

  private prepare(result: RouteResult): void {
    if (this.prepared === result) return;

    this.prepared = result;
    this.outlines = [20, 30, 40].map(time => ({ time, segments: outerBallSegments(result.centre, time) }));
    this.guide = schematicGuide(result.centre, 40);
    this.rasterTime = -1;
    this.previewRaster = false;
  }

  private paintBall(passageTime: number, result: RouteResult | null): void {
    if (result && !this.previewRaster && this.rasterTime === passageTime) return;
    if (!result && this.previewRaster) return;

    const { rasterPen, model, pixels } = this;
    rasterPen.fillStyle = this.colors.ink;
    rasterPen.fillRect(0, 0, 1, 1);
    const sample = rasterPen.getImageData(0, 0, 1, 1).data;
    const red = sample[0];
    const green = sample[1];
    const blue = sample[2];

    if (red === undefined || green === undefined || blue === undefined) throw new Error('The canvas ink sample has three colour channels.');

    pixels.data.fill(0);

    const paint = (row: number, col: number): void => {
      const vertex = row * model.N + col;
      const target = ((model.N - 1 - row) * model.N + col) * 4;
      pixels.data[target] = red;
      pixels.data[target + 1] = green;
      pixels.data[target + 2] = blue;
      pixels.data[target + 3] = stipple(vertex);
    };

    if (result) {
      for (const [vertex, distance] of result.centre.distances.entries()) {
        if (distance <= passageTime) paint(Math.floor(vertex / model.N), vertex % model.N);
      }
    } else {
      for (const [row, start, end] of model.preview.ball40Runs) {
        for (let col = start; col <= end; col++) paint(row, col);
      }
    }

    rasterPen.putImageData(pixels, 0, 0);
    this.previewRaster = result === null;
    this.rasterTime = passageTime;
  }

  private ball(camera: Camera, passageTime: number, result: RouteResult | null): void {
    this.paintBall(passageTime, result);
    this.pen.imageSmoothingEnabled = false;
    const side = this.model.N * camera.scale;
    this.pen.drawImage(this.raster, camera.x - side / 2, camera.y - side / 2, side, side);
  }

  private path(points: readonly Point[], camera: Camera, amount = 1): void {
    const first = points[0];

    if (!first || amount <= 0) return;

    const coordinate = amount * (points.length - 1);
    this.pen.moveTo(flat(first, camera).x, flat(first, camera).y);

    for (let index = 1; index <= Math.floor(coordinate); index++) {
      const point = points[index];

      if (!point) throw new Error('The drawn route contains its next vertex.');

      const target = flat(point, camera);
      this.pen.lineTo(target.x, target.y);
    }

    if (amount < 1) {
      const index = Math.floor(coordinate);
      const a = points[index];
      const b = points[index + 1];

      if (!a || !b) throw new Error('The route reveal has the endpoints of its current edge.');

      const point = flat({ x: mix(a.x, b.x, coordinate - index), y: mix(a.y, b.y, coordinate - index) }, camera);
      this.pen.lineTo(point.x, point.y);
    }
  }

  private stage(box: Box, time: number, tall: boolean): void {
    const { pen, model, colors } = this;
    const camera = this.camera(box, time);
    pen.save();
    pen.beginPath();
    pen.rect(box.x, box.y + 17, box.w, box.h - 24);
    pen.clip();

    if (time < 9000) this.closeView(camera, time, tall);
    else if (model.computation.kind !== 'ready') {
      const previewCamera = this.camera(box, 12000);
      this.ball(previewCamera, 40, null);
      pen.beginPath();

      for (const route of model.preview.treePaths40) this.path(route.map(gridPoint), previewCamera);

      pen.strokeStyle = colors.ink;
      pen.lineWidth = tall ? .7 : 1;
      pen.stroke();
      this.origin(previewCamera, tall);
    } else {
      const result = model.computation.result;
      this.prepare(result);
      this.ball(camera, ballTime(time), result);

      if (time < 11500) this.closeView(camera, time, tall);
      if (time >= 19750) this.tree(camera, result, time, tall);
      if (time >= 28750) this.hunts(camera, result, time, tall);
      if (time >= 46750) this.normalizedOutlines(camera, time, tall);
      if (time >= 57250) this.claim(camera, time, tall);

      this.origin(camera, tall);
    }

    pen.restore();
    const heading = time < 9000 ? 'CLOSE VIEW · THE SAME RANDOM GRID' : model.computation.kind !== 'ready' ? 'COMPUTED TIME-40 PREVIEW' : time < 19750 ? 'REACHABLE FROM THE CENTRE' : time < 28750 ? 'FASTEST ROUTE PREFIXES' : time < 46750 ? 'FOUR FINITE TESTS' : time < 57250 ? 'BALLS DIVIDED BY THEIR TIMES' : 'THE GENERAL CLAIMS';
    text(pen, heading, box.x + box.w / 2, box.y + 5, tall ? 9 : 14, box.w - 5, colors);
  }

  private closeView(camera: Camera, time: number, tall: boolean): void {
    const { pen, model, colors } = this;
    const initialScale = camera.scale / Math.exp(-Math.log(model.N / 10) * cameraProgress(time));
    const shrink = camera.scale / initialScale;
    const edges: { a: Point; b: Point; weight: number; label: boolean }[] = [];

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 8; col++) {
        const weight = model.close.horizontal[row * 8 + col];

        if (weight === undefined) throw new Error('The close grid has each horizontal edge time.');

        edges.push({ a: { x: col - 4, y: row - 4 }, b: { x: col - 3, y: row - 4 }, weight, label: row === 1 && col === 2 || row === 6 && col === 5 || row === 4 && col === 6 });
      }
    }

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 9; col++) {
        const weight = model.close.vertical[row * 9 + col];

        if (weight === undefined) throw new Error('The close grid has each vertical edge time.');

        edges.push({ a: { x: col - 4, y: row - 4 }, b: { x: col - 4, y: row - 3 }, weight, label: col === 1 && row === 4 || col === 7 && row === 2 || col === 4 && row === 6 });
      }
    }

    pen.strokeStyle = colors.ink;

    for (const edge of edges) {
      const a = flat(edge.a, camera);
      const b = flat(edge.b, camera);
      pen.lineWidth = (.35 + 2.4 * edge.weight / (edge.weight + 2)) * shrink;
      line(pen, a.x, a.y, b.x, b.y);
    }

    const route = model.close.route.map(gridPoint);
    pen.beginPath();
    this.path(route, camera, smooth(time, 2500, 7500));
    pen.strokeStyle = colors.ink;
    pen.lineWidth = (tall ? 3.2 : 4.4) * shrink;
    pen.stroke();
    pen.strokeStyle = colors.paper;
    pen.lineWidth = (tall ? 1.3 : 1.8) * shrink;
    pen.stroke();
    pen.strokeStyle = colors.ink;
    const start = route[0];
    const end = route.at(-1);

    if (!start || !end) throw new Error('The close-view fastest route has both endpoints.');

    for (const [index, point] of [start, end].entries()) {
      const target = flat(point, camera);
      pen.beginPath();
      pen.arc(target.x, target.y, (tall ? 3.3 : 4.5) * shrink, 0, Math.PI * 2);
      pen.fillStyle = colors.paper;
      pen.fill();
      pen.lineWidth = 1.2 * shrink;
      pen.stroke();

      if (time < 9000) text(pen, index === 0 ? 'A' : 'B', target.x + 9, target.y - 10, tall ? 10 : 14, 20, colors);
    }

    if (time < 9000) {
      for (const edge of edges) {
        if (!edge.label) continue;

        const point = flat({ x: (edge.a.x + edge.b.x) / 2, y: (edge.a.y + edge.b.y) / 2 }, camera);
        text(pen, edge.weight.toFixed(2), point.x, point.y, tall ? 8.5 : 12, camera.scale * .88, colors);
      }
    }
  }

  private origin(camera: Camera, tall: boolean): void {
    this.pen.fillStyle = this.colors.paper;
    this.pen.strokeStyle = this.colors.ink;
    this.pen.lineWidth = 1;
    this.pen.beginPath();
    this.pen.arc(camera.x, camera.y, tall ? 2.3 : 3.5, 0, Math.PI * 2);
    this.pen.fill();
    this.pen.stroke();
  }

  private tree(camera: Camera, result: RouteResult, time: number, tall: boolean): void {
    const { pen, colors } = this;
    pen.beginPath();

    for (let index = 0; index < result.targets.length; index += 6) this.path(clipRoute(result.centre, treeRoute(result.tree, index), 40 * treeProgress(time)), camera);

    pen.strokeStyle = colors.ink;
    pen.lineWidth = tall ? .65 : .9;
    pen.stroke();

    if (time < 28750) {
      pen.setLineDash([3, 3]);
      pen.lineWidth = .65;
      pen.beginPath();
      pen.arc(camera.x, camera.y, branchRadius(time) * camera.scale, 0, Math.PI * 2);
      pen.stroke();
      pen.setLineDash([]);
    }
  }

  private hunts(camera: Camera, result: RouteResult, time: number, tall: boolean): void {
    const { pen, colors } = this;
    const active = huntIndex(time);
    const hairline = smooth(time, 39750, 42000);

    for (let index = 0; index <= active; index++) {
      const hunt = result.hunts[index];

      if (!hunt) throw new Error('Each finite hunt has its computed route.');

      const amount = index < active ? 1 : huntProgress(time);
      const points = Array.from(hunt.vertices, gridPoint);
      pen.beginPath();
      this.path(points, camera, amount);
      pen.strokeStyle = colors.ink;
      pen.lineWidth = index < active ? .45 : mix(tall ? 1.8 : 2.6, .55, hairline);
      pen.stroke();
    }

    const hunt = result.hunts[active];

    if (!hunt) throw new Error('The current finite hunt has its endpoints.');

    for (const vertex of [hunt.source, hunt.target]) {
      const point = flat(gridPoint(vertex), camera);
      pen.beginPath();
      pen.arc(point.x, point.y, tall ? 2 : 3, 0, Math.PI * 2);
      pen.fillStyle = colors.ink;
      pen.fill();
    }

    if (huntProgress(time) > .6 || active > 0) {
      const row = hunt.middleRows[0];

      if (row === undefined) throw new Error('The finite route meets the middle column.');

      const point = flat({ x: 0, y: row }, camera);
      pen.lineWidth = 1;
      pen.beginPath();
      pen.arc(point.x, point.y, tall ? 3.5 : 5, 0, Math.PI * 2);
      pen.stroke();
    }
  }

  private normalizedOutlines(camera: Camera, time: number, tall: boolean): void {
    const { pen, colors } = this;
    const amount = outlineProgress(time);

    for (const [index, outline] of this.outlines.entries()) {
      const multiplier = mix(1, 40 / outline.time, amount);
      pen.beginPath();

      for (const segment of outline.segments) {
        const a = flat({ x: segment.a.x * multiplier, y: segment.a.y * multiplier }, camera);
        const b = flat({ x: segment.b.x * multiplier, y: segment.b.y * multiplier }, camera);
        pen.moveTo(a.x, a.y);
        pen.lineTo(b.x, b.y);
      }

      pen.strokeStyle = colors.ink;
      pen.lineWidth = index === 2 ? tall ? .65 : .9 : .5;
      pen.setLineDash(index === 0 ? [2, 3] : index === 1 ? [5, 3] : []);
      pen.stroke();
    }

    pen.setLineDash([]);
  }

  private claim(camera: Camera, time: number, tall: boolean): void {
    const { pen, colors } = this;
    const first = this.guide[0];

    if (!first) throw new Error('The computed schematic guide has its starting point.');

    pen.beginPath();
    this.path([...this.guide, first], camera, claimProgress(time));
    pen.strokeStyle = colors.blue;
    pen.lineWidth = tall ? 2.1 : 2.8;
    pen.setLineDash([6, 4]);
    pen.stroke();
    pen.setLineDash([]);
    const amount = strikeProgress(time);

    if (amount > 0) {
      const row = this.prepared?.hunts.at(-1)?.middleRows[0];

      if (row === undefined) throw new Error('The claim strike crosses the computed final finite route.');

      const middle = flat({ x: 0, y: row }, camera);
      const reach = tall ? 9 : 13;
      pen.lineWidth = tall ? 2.5 : 3.2;
      line(pen, middle.x - reach, middle.y + reach, middle.x + reach, middle.y - reach, amount);
    }
  }
}

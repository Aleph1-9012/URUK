import { mix, smooth } from '../../../lib/animation';
import { line } from '../../plate/canvas/strokes';
import { PAGE_TONES, type FilmFrame } from '../../plate/frame';
import { type Box, type Colors, text } from './drawing';
import { apply, barycentric, collisionSide, compose, fromBarycentric, IDENTITY, packedPoint, reflection, samplePackedRunByDistance, type BounceModel, type Isometry, type PackedBilliardRun, type Point, type TableKey, type Triangle } from './math';
import { drawPanels } from './panels';
import { layout, MORPHS, playbackDistance, playbackDistanceFor, tableAt } from './story';

type Camera = { x: number; y: number; scale: number };

type Vertex = { point: Point; distance: number };

function cameraFor(box: Box): Camera {
  const scale = Math.min((box.w - 95) / 1.1, (box.h - 42) / 1.06);

  return { x: box.x + box.w / 2 - scale / 2, y: box.y + box.h * .5 + scale * .45, scale };
}

function flat(point: Point, camera: Camera): Point {
  return { x: camera.x + point.x * camera.scale, y: camera.y - point.y * camera.scale };
}

function blend(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

function trianglePath(pen: CanvasRenderingContext2D, points: readonly Point[]): void {
  pen.beginPath();

  for (const [index, point] of points.entries()) {
    if (index === 0) pen.moveTo(point.x, point.y);
    else pen.lineTo(point.x, point.y);
  }

  pen.closePath();
}

function along(points: readonly Point[], amount: number): Point {
  const coordinate = amount * (points.length - 1);
  const index = Math.min(points.length - 2, Math.floor(coordinate));
  const first = points[index];
  const second = points[index + 1];

  if (!first || !second) throw new Error('A transition polyline has two points around its parameter.');

  return blend(first, second, coordinate - index);
}

export class EndlessBounceFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private colors: Colors = PAGE_TONES;
  private readonly maps: Record<TableKey, Isometry[]> = { irrational: [IDENTITY], equilateral: [IDENTITY], right_isosceles: [IDENTITY] };

  constructor(private readonly pen: CanvasRenderingContext2D, private readonly model: BounceModel) {}

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.colors = tones;
  }

  draw(time: number): void {
    const { pen, colors } = this;
    const boxes = layout(this.width, this.height);
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, this.width, this.height);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.table(boxes.stage, time, boxes.tall);
    drawPanels(pen, boxes.panel, time, colors, this.model, boxes.tall);
  }

  private run(key: TableKey): PackedBilliardRun {
    const state = this.model.computation;

    if (state.kind !== 'ready') throw new Error('Playback needs a computed trajectory.');

    return state.cases[key].run;
  }

  private trail(run: PackedBilliardRun, sample: ReturnType<typeof samplePackedRunByDistance>, distance: number): Vertex[] {
    const vertices: Vertex[] = [];

    for (let index = Math.max(0, sample.bounce - 399); index <= sample.bounce; index++) {
      const at = run.times[index];

      if (at === undefined) throw new Error('The playback sample has this event time.');

      vertices.push({ point: packedPoint(run, index), distance: at });
    }

    const last = run.times.at(-1);

    if (last === undefined) throw new Error('The playback sample has a terminal event time.');

    vertices.push({ point: sample.point, distance: Math.min(distance, last) });

    return vertices;
  }

  private strokeTrail(points: readonly Point[], tall: boolean): void {
    const { pen, colors } = this;
    pen.strokeStyle = colors.ink;

    for (let band = 0; band < 6; band++) {
      const first = Math.floor((points.length - 1) * band / 6);
      const last = Math.floor((points.length - 1) * (band + 1) / 6);
      const start = points[first];

      if (!start) continue;

      pen.beginPath();
      pen.moveTo(start.x, start.y);
      pen.globalAlpha = .10 + band * .13;
      pen.lineWidth = tall ? .7 : .9;

      for (let index = first + 1; index <= last; index++) {
        const point = points[index];

        if (point) pen.lineTo(point.x, point.y);
      }

      pen.stroke();
    }

    pen.globalAlpha = 1;
  }

  private table(box: Box, time: number, tall: boolean): void {
    const { pen, colors, model } = this;
    const state = tableAt(time);
    const camera = cameraFor(box);

    if (state.transition) {
      this.morph(box, time, camera, tall);

      return;
    }

    const table = model.cases[state.key];
    const distance = playbackDistance(time);
    const run = this.run(state.key);
    const sample = samplePackedRunByDistance(run, distance);
    const vertices = this.trail(run, sample, distance);
    const unfolding = smooth(time, 62250, 64250) * (1 - smooth(time, 76250, 77500));
    const available = run.directions.length;

    if (unfolding > 0 && sample.bounce < available) this.double(box, camera, vertices, sample.bounce, sample.point, unfolding, tall);
    else {
      this.outline(table.triangle.map(point => flat(point, camera)), 1);
      this.divider(table.triangle, camera, time);
      this.strokeTrail(vertices.map(vertex => flat(vertex.point, camera)), tall);
      this.ball(flat(sample.point, camera), tall);
      const name = state.key === 'right_isosceles' ? 'RIGHT ISOSCELES' : state.key.toUpperCase();
      text(pen, `${name} · PLAYBACK SAMPLE`, box.x + box.w / 2, box.y + 9, tall ? 9 : 14, box.w - 4, colors);
      this.angles(table.angles, table.triangle, camera, tall);
      text(pen, `${sample.bounce} BOUNCES SHOWN · TRAIL ≤ 400 SEGMENTS`, box.x + box.w / 2, box.y + box.h - 5, tall ? 8 : 11, box.w - 5, colors);
    }
  }

  private outline(points: readonly Point[], weight: number): void {
    this.pen.strokeStyle = this.colors.ink;
    this.pen.lineWidth = weight;
    trianglePath(this.pen, points);
    this.pen.stroke();
  }

  private ball(point: Point, tall: boolean): void {
    const { pen, colors } = this;
    pen.fillStyle = colors.paper;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1.3;
    pen.beginPath();
    pen.arc(point.x, point.y, tall ? 2.8 : 4.6, 0, Math.PI * 2);
    pen.fill();
    pen.stroke();
  }

  private angles(angles: readonly number[], triangle: Triangle, camera: Camera, tall: boolean): void {
    for (const [index, point] of triangle.entries()) {
      const radians = angles[index];

      if (radians === undefined) throw new Error('Each table vertex has one interior angle.');

      const target = flat(point, camera);
      text(this.pen, `${(radians * 180 / Math.PI).toFixed(2)}°`, target.x + (index === 0 ? -25 : index === 1 ? 25 : 29), target.y + (index === 2 ? 5 : 0), tall ? 8.5 : 13, tall ? 48 : 72, this.colors);
    }
  }

  private divider(triangle: Triangle, camera: Camera, time: number): void {
    if (time < 8000) return;

    const x = this.model.divider;
    const c = triangle[2];
    const top = x <= c.x ? c.y * x / c.x : c.y * (1 - x) / (1 - c.x);
    const first = flat({ x, y: 0 }, camera);
    const second = flat({ x, y: top }, camera);
    this.pen.strokeStyle = this.colors.muted;
    this.pen.lineWidth = .8;
    this.pen.setLineDash([3, 3]);
    line(this.pen, first.x, first.y, second.x, second.y);
    this.pen.setLineDash([]);
  }

  private morph(box: Box, time: number, camera: Camera, tall: boolean): void {
    const state = tableAt(time);
    const morph = MORPHS.find(item => time >= item.start && time < item.end);

    if (!morph) throw new Error('A table transition has a declared morph interval.');

    const from = this.model.cases[state.from].triangle;
    const to = this.model.cases[state.to].triangle;
    const triangle: Triangle = [from[0], from[1], blend(from[2], to[2], state.amount)];
    const oldDistance = playbackDistanceFor(state.from, morph.start) + (time - morph.start) / 1000 * 2.8;
    const newDistance = playbackDistanceFor(state.to, morph.start);
    const oldRun = this.run(state.from);
    const newRun = this.run(state.to);
    const oldTrail = this.trail(oldRun, samplePackedRunByDistance(oldRun, oldDistance), oldDistance).map(vertex => barycentric(vertex.point, from));
    const newTrail = this.trail(newRun, samplePackedRunByDistance(newRun, newDistance), newDistance).map(vertex => barycentric(vertex.point, to));
    const parameters = new Set<number>();

    for (let index = 0; index < oldTrail.length; index++) parameters.add(index / (oldTrail.length - 1));
    for (let index = 0; index < newTrail.length; index++) parameters.add(index / (newTrail.length - 1));

    const points = Array.from(parameters).sort((a, b) => a - b).map(parameter => flat(fromBarycentric(blend(along(oldTrail, parameter), along(newTrail, parameter), state.amount), triangle), camera));
    this.outline(triangle.map(point => flat(point, camera)), 1);
    this.strokeTrail(points, tall);
    const ball = points.at(-1);

    if (!ball) throw new Error('The carried transition trail includes its ball.');

    this.ball(ball, tall);
    text(this.pen, 'CHANGING TABLE · ARTWORK TRANSITION', box.x + box.w / 2, box.y + 9, tall ? 8.5 : 13, box.w - 4, this.colors);
    text(this.pen, 'STATIC STATISTICS PAUSED', box.x + box.w / 2, box.y + box.h - 5, tall ? 8.5 : 12, box.w - 4, this.colors);
  }

  private unfoldingMap(key: TableKey, bounce: number): Isometry {
    const maps = this.maps[key];
    const run = this.run(key);
    const triangle = this.model.cases[key].triangle;

    while (maps.length <= bounce) {
      const index = maps.length - 1;
      const previous = maps[index];
      const side = collisionSide(triangle, packedPoint(run, index + 1));
      const a = triangle[side];
      const b = triangle[(side + 1) % 3];

      if (!previous || !a || !b) throw new Error('An unfolded face follows a complete reflected side.');

      maps.push(compose(previous, reflection(a, b)));
    }

    const result = maps[bounce];

    if (!result) throw new Error('The current unfolded face has been computed.');

    return result;
  }

  private double(box: Box, camera: Camera, vertices: Vertex[], bounce: number, point: Point, amount: number, tall: boolean): void {
    const { pen, colors, model } = this;
    const triangle = model.cases.irrational.triangle;
    const map = this.unfoldingMap('irrational', bounce);
    const next = this.unfoldingMap('irrational', bounce + 1);
    const origin = apply(map, point);
    const scale = camera.scale * (tall ? .55 : .70);
    const local = (world: Point): Point => ({ x: box.x + box.w / 2 + (world.x - origin.x) * scale, y: box.y + box.h * .54 - (world.y - origin.y) * scale });
    const display = (face: Isometry, vertex: Point): Point => blend(flat(vertex, camera), local(apply(face, vertex)), amount);
    pen.save();
    pen.beginPath();
    pen.rect(box.x + 2, box.y + 23, box.w - 4, box.h - 45);
    pen.clip();
    this.outline(triangle.map(vertex => display(map, vertex)), 1);
    this.outline(triangle.map(vertex => display(next, vertex)), .8);

    for (const face of [map, next]) {
      for (let side = 0; side < 3; side++) {
        const a = triangle[side];
        const b = triangle[(side + 1) % 3];

        if (!a || !b) throw new Error('The flat double pairs two complete triangle sides.');

        const middle = display(face, blend(a, b, .5));
        pen.strokeStyle = colors.ink;
        pen.lineWidth = .8;

        for (let mark = 0; mark <= side; mark++) line(pen, middle.x - 2 + mark * 3, middle.y - 2, middle.x + 1 + mark * 3, middle.y + 2);
      }
    }

    const heading = model.heading;
    const trail = vertices.map(vertex => {
      const world = { x: model.start.x + Math.cos(heading) * vertex.distance, y: model.start.y + Math.sin(heading) * vertex.distance };

      return blend(flat(vertex.point, camera), local(world), amount);
    });
    this.strokeTrail(trail, tall);
    this.ball(blend(flat(point, camera), local(origin), amount), tall);
    pen.restore();
    text(pen, amount === 1 ? 'FLAT DOUBLE · LOCAL UNFOLDING' : 'TWO FACES FOLD OUT · TRANSITION', box.x + box.w / 2, box.y + 9, tall ? 9 : 14, box.w - 4, colors);
    text(pen, `CONE ANGLES: ${model.coneAnglesDegrees.map(value => `${value.toFixed(1)}°`).join(' · ')}`, box.x + box.w / 2, box.y + box.h - 6, tall ? 8 : 12, box.w - 4, colors);
  }
}

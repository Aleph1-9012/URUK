import { mix, progress, smooth } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { type Box, type Colors, line, text } from './drawing';
import { bushUnionBounds, needlePose, rotateTriangles, squareCells, treeTriangles, type KakeyaModel, type Point, type Triangle, type Vector } from './math';
import { drawPanels } from './panels';
import { shadedFractionAt, shadedFractionLabel } from './story';

type Camera = { x: number; y: number; scale: number; tilt?: number; oldAxis?: Point };

function view(box: Box): Camera {
  const scale = Math.min((box.w - 16) / 1.95, (box.h - 48) / 1.8);

  return { x: box.x + box.w / 2 - .35 * scale, y: box.y + box.h / 2 + .30 * scale, scale };
}

function flat(point: Point, camera: Camera): Point {
  return { x: camera.x + point.x * camera.scale, y: camera.y - point.y * camera.scale };
}

function project(point: Vector, camera: Camera): Point {
  const tilt = camera.tilt ?? 1;
  const oldAxis = camera.oldAxis ?? { x: 0, y: 1 };

  return { x: camera.x + mix(point.x + oldAxis.x * point.y, .8660254 * point.x - .5 * point.y, tilt) * camera.scale, y: camera.y + mix(oldAxis.y * point.y - point.z, .3535534 * point.x + .6123724 * point.y - .7071068 * point.z, tilt) * camera.scale };
}

function add(a: Vector, b: Vector, scale = 1): Vector {
  return { x: a.x + b.x * scale, y: a.y + b.y * scale, z: a.z + b.z * scale };
}

function normalized(vector: Vector): Vector {
  const length = Math.hypot(vector.x, vector.y, vector.z);

  if (length < 1e-10) throw new Error('A tube direction has positive length.');

  return { x: vector.x / length, y: vector.y / length, z: vector.z / length };
}

function circle(pen: CanvasRenderingContext2D, point: Point, radius: number): void {
  pen.beginPath();
  pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
  pen.stroke();
}

function polygon(pen: CanvasRenderingContext2D, triangles: readonly Triangle[], camera: Camera): void {
  pen.beginPath();

  for (const triangle of triangles) {
    const a = flat(triangle[0], camera);
    const b = flat(triangle[1], camera);
    const c = flat(triangle[2], camera);
    pen.moveTo(a.x, a.y);
    pen.lineTo(b.x, b.y);
    pen.lineTo(c.x, c.y);
    pen.closePath();
  }

  pen.fill();
}

function layout(width: number, height: number, time: number): { stage: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (!tall) {
    return { stage: { x: width * .025, y: height * .025, w: width * .53, h: height * .95 }, panel: { x: width * .60, y: height * .035, w: width * .365, h: height * .93 }, tall };
  }

  const claimRoom = smooth(time, 79750, 80550) * (1 - smooth(time, 84750, 85550));
  const finalRoom = smooth(time, 103250, 104100);
  const split = .54 - .16 * Math.max(claimRoom, finalRoom);

  return { stage: { x: width * .035, y: height * .02, w: width * .93, h: height * (split - .04) }, panel: { x: width * .055, y: height * split, w: width * .89, h: height * (.98 - split) }, tall };
}

export class NeedleRoomFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  private readonly cells;

  constructor(private readonly root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D, private readonly model: KakeyaModel) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 4 });
    this.cells = [1 / 8, 1 / 16, 1 / 32, 1 / 64].map(delta => ({ delta, cells: squareCells(model.slivers, delta) }));
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
    pen.lineCap = 'round';
    pen.lineJoin = 'round';

    if (time < 52000) this.room(boxes.stage, time, boxes.tall);
    else if (time < 111500) this.bush(boxes.stage, time, boxes.tall);
    else {
      const upper = { x: boxes.stage.x, y: boxes.stage.y, w: boxes.stage.w * .43, h: boxes.stage.h };
      const camera = view(upper);
      pen.fillStyle = colors.ink;
      polygon(pen, this.copies(1), camera);
      this.bush({ x: boxes.stage.x + boxes.stage.w * .46, y: boxes.stage.y, w: boxes.stage.w * .54, h: boxes.stage.h }, time, boxes.tall, true);
      text(pen, 'THREE COPIES · 60 TUBES', boxes.stage.x + boxes.stage.w / 2, boxes.stage.y + 7, boxes.tall ? 9 : 12, boxes.stage.w, colors);
    }

    drawPanels(pen, boxes.panel, time, colors, this.labels.place, this.model, boxes.tall);
    this.labels.endFrame();
  }

  private copies(amount: number): Triangle[] {
    return [this.model.slivers, rotateTriangles(this.model.slivers, amount * Math.PI / 3, this.model.centre), rotateTriangles(this.model.slivers, amount * Math.PI * 2 / 3, this.model.centre)].flat();
  }

  private needle(a: Point, b: Point): void {
    const { pen, colors } = this;
    pen.strokeStyle = colors.paper;
    pen.lineWidth = 4;
    line(pen, a.x, a.y, b.x, b.y);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1.5;
    line(pen, a.x, a.y, b.x, b.y);
    circle(pen, a, 2.1);
    circle(pen, b, 2.1);
  }

  private room(box: Box, time: number, tall: boolean): void {
    const { pen, colors, model } = this;
    const camera = view(box);
    const whole: Triangle[] = [[{ x: 0, y: 0 }, { x: model.side, y: 0 }, { x: model.side / 2, y: 1 }]];

    if (time < 10000) {
      const disc = flat({ x: .5, y: 0 }, camera);
      const roomChange = smooth(time, 2600, 3300);
      pen.strokeStyle = colors.ink;
      pen.lineWidth = .9;

      if (time < 3300) {
        pen.beginPath();
        pen.arc(disc.x, disc.y, camera.scale / 2, 0, Math.PI * 2);
        pen.stroke();
        const sweep = Math.min(Math.PI, progress(time, 0, 2400) * Math.PI * 2);
        pen.fillStyle = colors.ink;
        pen.globalAlpha = .13;

        for (const offset of [0, Math.PI]) {
          pen.beginPath();
          pen.moveTo(disc.x, disc.y);
          pen.arc(disc.x, disc.y, camera.scale / 2, offset, offset + sweep);
          pen.closePath();
          pen.fill();
        }

        pen.globalAlpha = 1;
      }

      if (time >= 2600) {
        pen.fillStyle = colors.ink;
        pen.globalAlpha = .12;
        polygon(pen, whole, camera);
        pen.globalAlpha = 1;
        pen.stroke();
      }

      const pose = needlePose(progress(time, 3300, 9750));
      const angle = progress(time, 0, 2400) * Math.PI * 2;
      const discA = { x: .5 - .5 * Math.cos(angle), y: -.5 * Math.sin(angle) };
      const discB = { x: .5 + .5 * Math.cos(angle), y: .5 * Math.sin(angle) };
      this.needle(flat({ x: mix(discA.x, pose.a.x, roomChange), y: mix(discA.y, pose.a.y, roomChange) }, camera), flat({ x: mix(discB.x, pose.b.x, roomChange), y: mix(discB.y, pose.b.y, roomChange) }, camera));
      text(pen, time < 3000 ? `DISC AREA ${model.discArea.toFixed(3)}` : `TRIANGLE AREA ${model.triangleArea.toFixed(3)} · HEIGHT 1`, box.x + box.w / 2, box.y + box.h - 10, tall ? 11 : 16, box.w - 6, colors);
      text(pen, time < 3300 ? 'TURN THE UNIT NEEDLE' : `${Math.round(pose.directionDegrees)}° OF 180° · MOVE ${pose.leg + 1} OF 6`, box.x + box.w / 2, box.y + 8, tall ? 10 : 14, box.w - 6, colors);

      return;
    }

    const clock = progress(time, 15000, 21700) * 8;
    const stage = Math.min(8, Math.floor(clock));
    const from = model.stages[stage];
    const to = model.stages[Math.min(8, stage + 1)];

    if (!from || !to) throw new Error('The sliver construction has nine stages.');

    const amount = smooth(clock - stage, .08, .90);
    const shifts = from.map((shift, index) => {
      const target = to[index];

      if (target === undefined) throw new Error('Each construction stage carries the same slivers.');

      return mix(shift, target, amount);
    });
    const triangles = time < 15000 ? whole : treeTriangles(shifts);
    const copies = smooth(time, 21700, 23100) * (1 - smooth(time, 24000, 24800));

    if (time >= 24800 && time < 37250) this.grid(camera, time);

    pen.fillStyle = colors.ink;
    pen.globalAlpha = .75;
    polygon(pen, copies > 0 ? this.copies(copies) : triangles, camera);
    pen.globalAlpha = 1;

    if (time < 15000) {
      const count = 2 ** Math.min(8, Math.floor(progress(time, 10000, 14600) * 8.99));
      pen.strokeStyle = colors.paper;
      pen.lineWidth = Math.min(.8, 1 / this.density);

      for (let index = 1; index < Math.min(count, tall ? 32 : 64); index++) {
        const a = flat({ x: model.side / 2, y: 1 }, camera);
        const b = flat({ x: index / Math.min(count, tall ? 32 : 64) * model.side, y: 0 }, camera);
        line(pen, a.x, a.y, b.x, b.y);
      }

      if (time < 11800) {
        const pose = needlePose(progress(time, 10000, 11800) / 3);
        this.needle(flat(pose.a, camera), flat(pose.b, camera));
      } else {
        const angle = (240 + 60 * progress(time, 11800, 14750)) * Math.PI / 180;
        const top = { x: model.side / 2, y: 1 };
        this.needle(flat({ x: top.x + Math.cos(angle), y: top.y + Math.sin(angle) }, camera), flat(top, camera));
      }

      const cutLimit = tall ? 32 : 64;
      const tag = count > cutLimit ? `${count} SLIVERS · ${cutLimit} GROUPS OUTLINED` : `${count} SLIVERS · EACH KEEPS ITS DIRECTIONS`;
      text(pen, tag, box.x + box.w / 2, box.y + box.h - 8, tall ? 10 : 14, box.w - 6, colors);
    } else if (time < 24000) {
      const leaf = triangles[Math.round(mix(255, 128, smooth(time, 15000, 16200)))];

      if (!leaf) throw new Error('The carried needle belongs to a moving sliver.');

      const top = leaf[2];
      const mid = { x: (leaf[0].x + leaf[1].x) / 2, y: 0 };
      const length = Math.hypot(mid.x - top.x, mid.y - top.y);
      this.needle(flat(top, camera), flat({ x: top.x + (mid.x - top.x) / length, y: top.y + (mid.y - top.y) / length }, camera));
      const stoppedStage = amount === 1 ? Math.min(8, stage + 1) : stage;
      const share = model.stageShares[stoppedStage];

      if (share === undefined) throw new Error('Each completed sliver stage has a measured area.');

      const readout = time >= 23100 ? `EVERY DIRECTION · AREA ${model.threeArea.toFixed(3)}` : copies > 0 ? `EACH FAN: ${(share * 100).toFixed(1)}% OF TRIANGLE` : `${amount > 0 && amount < 1 ? 'LAST STOP' : 'STAGE'} ${stoppedStage}/8 · ${(share * 100).toFixed(1)}% OF TRIANGLE`;
      text(pen, readout, box.x + box.w / 2, box.y + box.h - 8, tall ? 10 : 14, box.w - 6, colors);
      text(pen, '256 SLIVERS · 1,024 GIVE 19%', box.x + box.w / 2, box.y + 8, tall ? 10 : 13, box.w - 6, colors);
    } else {
      const final = triangles[128];

      if (!final) throw new Error('The central sliver holds the carried needle.');

      const a = final[2];
      const mid = { x: (final[0].x + final[1].x) / 2, y: 0 };
      const length = Math.hypot(mid.x - a.x, mid.y - a.y);
      this.needle(flat(a, camera), flat({ x: a.x + (mid.x - a.x) / length, y: a.y + (mid.y - a.y) / length }, camera));
      const lastGrid = model.squares.at(-1);

      if (!lastGrid) throw new Error('The comparison has a final square-count scale.');

      const tag = time < 24800 ? 'RETURNING TO ONE FAN' : time >= 37250 ? 'ONE FAN · SIXTY-DEGREE RANGE' : time >= 34900 ? `AT 1/64: ${Math.round(100 * lastGrid.tree / lastGrid.triangle)}% OF SQUARES · AREA 22%` : 'ONE FAN: AREA 22% · COUNTING ITS SQUARES';
      text(pen, tag, box.x + box.w / 2, box.y + box.h - 8, tall ? 9 : 14, box.w - 6, colors);
    }
  }

  private grid(camera: Camera, time: number): void {
    const index = time < 30000 ? 0 : Math.min(3, Math.floor(progress(time, 30000, 36500) * 3.99));
    const grid = this.cells[index];

    if (!grid) throw new Error('The grid has four halving scales.');

    const { pen, colors } = this;
    pen.fillStyle = colors.ink;
    pen.globalAlpha = .15;
    pen.beginPath();

    for (const cell of grid.cells) {
      const a = flat({ x: cell.column * grid.delta, y: (cell.row + 1) * grid.delta }, camera);
      pen.rect(a.x, a.y, grid.delta * camera.scale, grid.delta * camera.scale);
    }

    pen.fill();
    pen.globalAlpha = 1;
    pen.strokeStyle = colors.muted;
    pen.lineWidth = Math.min(.5, 1 / this.density);
    pen.beginPath();

    for (const cell of grid.cells) {
      const a = flat({ x: cell.column * grid.delta, y: (cell.row + 1) * grid.delta }, camera);
      pen.rect(a.x, a.y, grid.delta * camera.scale, grid.delta * camera.scale);
    }

    pen.stroke();
    const a = flat({ x: -.48, y: 0 }, camera);
    const b = flat({ x: -.48, y: 1 }, camera);
    this.needle(a, b);

    for (let row = 0; row < 1 / grid.delta; row++) {
      const cell = flat({ x: -.48, y: (row + 1) * grid.delta }, camera);
      pen.strokeRect(cell.x, cell.y, grid.delta * camera.scale, grid.delta * camera.scale);
    }
  }

  private tube(axis: Vector, camera: Camera, radius: number, fraction = 1, offset: Vector = { x: 0, y: 0, z: 0 }): void {
    const { pen } = this;
    const reference = Math.abs(axis.z) < .9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 };
    const u = normalized({ x: axis.y * reference.z - axis.z * reference.y, y: axis.z * reference.x - axis.x * reference.z, z: axis.x * reference.y - axis.y * reference.x });
    const v = { x: axis.y * u.z - axis.z * u.y, y: axis.z * u.x - axis.x * u.z, z: axis.x * u.y - axis.y * u.x };
    const a = add(offset, axis, -fraction / 2);
    const b = add(offset, axis, fraction / 2);

    for (const sign of [-1, 1]) {
      const from = project(add(a, u, radius * sign), camera);
      const to = project(add(b, u, radius * sign), camera);
      line(pen, from.x, from.y, to.x, to.y);
    }

    for (const centre of [a, b]) {
      pen.beginPath();

      for (let index = 0; index <= 20; index++) {
        const angle = index / 20 * Math.PI * 2;
        const point = project(add(add(centre, u, radius * Math.cos(angle)), v, radius * Math.sin(angle)), camera);

        if (index === 0) pen.moveTo(point.x, point.y);
        else pen.lineTo(point.x, point.y);
      }

      pen.stroke();
    }
  }

  private bush(box: Box, time: number, tall: boolean, compact = false): void {
    const { pen, colors, model } = this;
    const growing = smooth(time, 52000, 54800);
    const oldCamera = view(box);
    const central = model.slivers[128];

    if (!central) throw new Error('The central sliver supplies the carried needle.');

    const apex = central[2];
    const base = { x: (central[0].x + central[1].x) / 2, y: 0 };
    const length = Math.hypot(base.x - apex.x, base.y - apex.y);
    const oldAxis = { x: (base.x - apex.x) / length, y: -(base.y - apex.y) / length };
    const oldMiddle = flat({ x: apex.x + oldAxis.x / 2, y: apex.y - oldAxis.y / 2 }, oldCamera);
    const hingeRoom = smooth(time, 90750, 92000) * (1 - smooth(time, 102000, 103250));
    const camera: Camera = { x: mix(oldMiddle.x, box.x + box.w / 2, growing), y: mix(oldMiddle.y, box.y + box.h * (.5 - .12 * hingeRoom), growing), scale: mix(oldCamera.scale, Math.min(box.w - 14, box.h - 50) * .83 * (1 - .25 * hingeRoom), growing), tilt: growing, oldAxis };
    const copies = smooth(time, 57000, 58500);
    const lambda = shadedFractionAt(time);
    const data = bushUnionBounds(lambda, model.bush.delta, model.bush.directions);
    const folding = smooth(time, 90750, 93400) * (1 - smooth(time, 100500, 103250));
    const directions = time < 57000 ? [{ x: 0, y: 1, z: 0 }] : model.drawnDirections;

    if (time < 54800) {
      pen.save();
      pen.beginPath();
      pen.rect(box.x, box.y + 20, box.w, box.h - 40);
      pen.clip();
      pen.beginPath();

      for (const triangle of model.slivers) {
        for (const [index, point] of triangle.entries()) {
          const from = flat(point, oldCamera);
          const to = project({ x: point.x - .35, y: point.y - .30, z: 0 }, camera);
          const x = mix(from.x, to.x - box.w * growing, growing);
          const y = mix(from.y, to.y, growing);

          if (index === 0) pen.moveTo(x, y);
          else pen.lineTo(x, y);
        }

        pen.closePath();
      }

      pen.fillStyle = colors.ink;
      pen.globalAlpha = .75;
      pen.fill();
      pen.restore();
    }

    for (const [index, direction] of directions.entries()) {
      const axis = normalized({ x: direction.x * copies, y: mix(1, direction.y, copies), z: direction.z * copies * (1 - folding * .97) });
      const offset = { x: 0, y: 0, z: folding * ((index % 3) - 1) * .13 };
      pen.strokeStyle = index % 3 === 0 ? colors.ink : colors.muted;
      pen.lineWidth = Math.min(.65, 1 / this.density);
      this.tube(axis, camera, model.bush.delta * growing, 1, offset);
      pen.strokeStyle = colors.ink;
      pen.lineWidth = .9;
      this.tube(axis, camera, model.bush.delta * growing, lambda, offset);
    }

    if (folding > .5) {
      pen.strokeStyle = colors.ink;
      pen.lineWidth = .9;

      for (const z of [-.13, 0, .13]) {
        pen.beginPath();

        for (const [index, corner] of [{ x: -.46, y: -.075, z }, { x: .46, y: -.075, z }, { x: .46, y: .075, z }, { x: -.46, y: .075, z }].entries()) {
          const p = project(corner, camera);

          if (index === 0) pen.moveTo(p.x, p.y);
          else pen.lineTo(p.x, p.y);
        }

        pen.closePath();
        pen.stroke();
      }
    }

    if (time >= 57000 && copies === 1 && folding === 0) {
      pen.strokeStyle = colors.ink;
      pen.lineWidth = .75;
      pen.setLineDash([2, 3]);
      circle(pen, { x: camera.x, y: camera.y }, lambda / 2 * camera.scale);
      pen.setLineDash([]);
      circle(pen, { x: camera.x, y: camera.y }, Math.hypot(lambda / 2, model.bush.delta) * camera.scale);
    }

    if (time >= 90750 && time < 103250 && !compact) this.hinge(box, time, tall);

    if (!compact) {
      const header = growing < 1 ? 'TARGET TUBE · LENGTH 1 · RADIUS δ = 1/32' : time < 57000 ? 'ONE TUBE · LENGTH 1 · RADIUS δ = 1/32' : copies < 1 ? '60 TUBES SWING INTO THE BUSH' : folding > 0 ? 'PLANINESS → GRAININESS · SCHEMATIC' : '2,442 δ-SEPARATED DIRECTIONS · 60 DRAWN';
      text(pen, header, box.x + box.w / 2, box.y + 8, tall ? 9 : 13, box.w - 6, colors);
      const decimals = lambda === 1 ? 3 : 4;
      const note = time < 57000 ? 'THE NEEDLE THICKENS INTO A TUBE' : copies < 1 ? 'DIRECTIONS MOVING · TRANSITION' : folding > 0 ? 'SCHEMATIC · WORST-CASE STRUCTURE' : `${shadedFractionLabel(lambda)} · UNION ${data.unionLow.toFixed(decimals)} TO ${data.unionHigh.toFixed(decimals)}`;
      text(pen, note, box.x + box.w / 2, box.y + box.h - 7, tall ? 10 : 14, box.w - 6, colors);
    }
  }

  private hinge(box: Box, time: number, tall: boolean): void {
    const { pen, colors } = this;
    const x = box.x + box.w * .10;
    const y = box.y + box.h * .81;
    const width = box.w * .32;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1;
    line(pen, x, y, x + width, y);
    line(pen, x, y, x, y - 25);
    line(pen, x, y, x + width * .42, y);
    line(pen, x + width * .42, y, x + width, y - 23);
    this.labels.place('hinge', x + width / 2, y + 14);

    if (time >= 97500) {
      pen.lineWidth = 1.5;
      line(pen, box.x + box.w * .25, box.y + box.h * .36, box.x + box.w * .77, box.y + box.h * .63);
      text(pen, 'CLAIMED: NO SUCH CONFIGURATION', box.x + box.w / 2, box.y + box.h * .27, tall ? 9 : 12, box.w - 6, colors);
    }
  }
}

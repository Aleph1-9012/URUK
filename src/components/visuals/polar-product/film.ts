import { mix, smooth } from '../../../lib/animation';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { area, buildPolarModel, cornerCut, linearMap, mixPolygons, polar, type Point, type Polygon } from './math';
import { drawDimensions, drawLedger } from './panels';

type Center = { x: number; y: number; scale: number };

type Tones = { ink: string; muted: string; paper: string; blue: string };

function lerpPoint(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

function affine(polygon: Polygon, sx: number, sy: number, angle: number): Polygon {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return linearMap(polygon, [sx * c, -sy * s, sx * s, sy * c]);
}

export class PolarProductFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly model = buildPolarModel();
  private readonly labels: FilmLabels;
  private tones: Tones = PAGE_TONES;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 5 });
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.tones = tones;

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    const { width: w, height: h, pen, tones } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const tucked = smooth(time, 35000, 36750);
    const scale = w * mix(tall ? .15 : .105, tall ? .095 : .065, tucked);
    const assemblyDrop = tall ? h * .04 * smooth(time, 32750, 34250) * (1 - smooth(time, 35000, 36750)) : 0;
    const body: Center = { x: w * mix(tall ? .5 : .23, tall ? .25 : .13, tucked), y: h * mix(tall ? .205 : .42, tall ? .16 : .34, tucked) + assemblyDrop, scale };
    const dual: Center = { x: w * mix(tall ? .5 : .59, tall ? .25 : .35, tucked), y: h * mix(tall ? .49 : .42, tall ? .34 : .34, tucked) + assemblyDrop, scale };
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.2;
    pen.setLineDash([]);
    this.labels.beginFrame();

    if (time < 32750) this.text('ORIGIN-SYMMETRIC CONVEX BODIES', w * .5, h * .035, w * .92, tall ? 9 : 12);

    const polygon = this.currentBody(time);
    const counterpart = polar(polygon);
    const value = area(polygon) * area(counterpart);
    const spatial = smooth(time, 32750, 35000);
    this.axes(body, time);
    this.axes(dual, time);

    if (time < 32750) {
      this.outline(polygon, body, smooth(time, 0, 650));
      this.outline(counterpart, dual, smooth(time, 750, 2500));
      this.construction(polygon, counterpart, body, dual, time);
    } else {
      this.cube(body, spatial);
      this.octahedron(dual, spatial);
    }

    this.labels.place('body', tall ? body.x + scale * 1.65 + 6 : body.x - scale * 1.70, body.y);
    this.labels.place('polar', tall ? dual.x + scale * 1.45 + 6 : dual.x - scale * 1.70, dual.y);

    if (time >= 2500 && time < 32750) {
      const y = h * (tall ? .76 : .70);
      this.labels.place('product', w * (tall ? .31 : .33), y);
      this.text(value.toFixed(4), w * (tall ? .67 : .49), y, w * .25, tall ? 20 : 27, '"Garamond Math"');
      this.text(`AREAS ${area(polygon).toFixed(3)} × ${area(counterpart).toFixed(3)}`, w * (tall ? .5 : .40), y + (tall ? 20 : 28), w * (tall ? .92 : .58), tall ? 9 : 12, '"Garamond Math"');
    }

    this.phaseTag(time, tucked);
    this.meter(time, value, tucked);
    this.rememberedExamples(time, body, tucked);

    if (time >= 32750) this.spatialReadout(time, tucked, spatial);

    drawDimensions(pen, w, h, time, tones.ink, tones.paper, tones.blue, this.model.dimensionTable);
    drawLedger(pen, w, h, time, tones.ink, tones.paper, tones.blue);
    this.labels.endFrame();
  }

  private currentBody(time: number): Polygon {
    const { model } = this;

    if (time < 15250) {
      const stretch = smooth(time, 3500, 6500) * (1 - smooth(time, 11750, 14750));
      const angle = .26 * smooth(time, 8500, 11000) * (1 - smooth(time, 11750, 14750));

      return affine(model.spine, 1 + .45 * stretch, 1, angle);
    }

    if (time < 17500) return mixPolygons(model.spine, model.disk1000, smooth(time, 15250, 16600));
    if (time < 19500) return mixPolygons(model.disk1000, model.hexagon, smooth(time, 17500, 18600));
    if (time < 26100) return mixPolygons(model.hexagon, model.square, smooth(time, 19500, 20500));
    if (time < 29000) return cornerCut(2 - smooth(time, 26100, 29000));

    // At c=1 the carried body is a diamond. This invertible map turns it
    // into [-1,1]^2 before that square becomes the cube's equator.
    const amount = smooth(time, 29000, 30500);

    return affine(cornerCut(1), 1 + (Math.SQRT2 - 1) * amount, 1 + (Math.SQRT2 - 1) * amount, Math.PI / 4 * amount);
  }

  private screen(point: Point, center: Center): Point {
    return { x: center.x + point.x * center.scale, y: center.y - point.y * center.scale };
  }

  private outline(polygon: Polygon, center: Center, amount = 1): void {
    if (amount <= 0) return;

    const { pen } = this;
    const count = polygon.length * amount;
    const first = polygon[0];

    if (!first) throw new Error('The displayed convex body must have vertices.');

    const start = this.screen(first, center);
    pen.beginPath();
    pen.moveTo(start.x, start.y);

    for (let index = 0; index < count; index++) {
      const a = polygon[index % polygon.length];
      const b = polygon[(index + 1) % polygon.length];

      if (!a || !b) throw new Error('Every displayed polygon edge needs both endpoints.');

      const next = this.screen(lerpPoint(a, b, Math.min(1, count - index)), center);
      pen.lineTo(next.x, next.y);
    }

    if (amount === 1) pen.closePath();

    pen.stroke();
  }

  private axes(center: Center, time: number): void {
    const { pen, tones } = this;
    const length = center.scale * 1.38;
    const lowerLength = center.scale * (time < 32750 ? 1.38 : 1.16);
    pen.strokeStyle = tones.muted;
    pen.lineWidth = .55;
    this.line(center.x - length, center.y, center.x + length, center.y);
    this.line(center.x, Math.max(this.height * .075, center.y - length), center.x, center.y + lowerLength);

    for (const sign of [-1, 1]) {
      this.line(center.x + sign * center.scale, center.y - 2, center.x + sign * center.scale, center.y + 2);
      this.line(center.x - 2, center.y + sign * center.scale, center.x + 2, center.y + sign * center.scale);
    }

    this.text('1', center.x + center.scale + 8, center.y + (this.width < PHONE_STAGE_WIDTH ? 17 : 10), 12, this.width < PHONE_STAGE_WIDTH ? 8 : 10, '"Garamond Math"');
    pen.fillStyle = tones.ink;
    pen.beginPath();
    pen.arc(center.x, center.y, 1.8, 0, Math.PI * 2);
    pen.fill();
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.2;
  }

  private construction(polygon: Polygon, counterpart: Polygon, body: Center, dual: Center, time: number): void {
    if (time < 650 || time >= 2650) return;

    const clock = Math.min(polygon.length - 1, Math.floor((time - 650) / 300));
    const a = polygon[clock];
    const b = polygon[(clock + 1) % polygon.length];
    const vertex = counterpart[clock];

    if (!a || !b || !vertex) throw new Error('The polar construction needs a matching primal edge and dual point.');

    const start = this.screen(lerpPoint(a, b, .5), body);
    const end = this.screen(vertex, dual);
    const moving = lerpPoint(start, end, smooth(time, 650 + clock * 300, 950 + clock * 300));
    this.pen.setLineDash([2, 4]);
    this.line(start.x, start.y, moving.x, moving.y);
    this.pen.setLineDash([]);
    this.pen.beginPath();
    this.pen.arc(moving.x, moving.y, 2.5, 0, Math.PI * 2);
    this.pen.fill();
  }

  private phaseTag(time: number, tucked: number): void {
    const { width: w, height: h } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const size = tall ? 9 : 12;
    let tag: string;

    if (time < 3500) tag = 'EACH SUPPORTING EDGE GIVES ONE POLAR VERTEX';
    else if (time < 8500) tag = 'STRETCH ONE, SQUEEZE THE OTHER';
    else if (time < 15250) tag = 'ROTATE BOTH THE SAME WAY · PRODUCT FIXED';
    else if (time < 16600) tag = 'ROUNDING TO THE 1000-GON';
    else if (time < 17500) tag = 'DISK AS 1000-GON · PRODUCT ≈ 9.8696';
    else if (time < 18600) tag = 'MOVING TO THE REGULAR HEXAGON';
    else if (time < 19500) tag = 'REGULAR HEXAGON · PRODUCT 9';
    else if (time < 20500) tag = 'MOVING TO THE SQUARE';
    else if (time < 21500) tag = 'SQUARE · PRODUCT 8';
    else if (time < 25500) tag = 'HOW SMALL? · MAHLER, 1939';
    else if (time < 29000) tag = 'CUT THE CORNERS · RISE AND RETURN TO 8';
    else if (time < 30500) tag = 'DIAMOND TO SQUARE · SAME PRODUCT';
    else if (time < 32750) tag = tall ? '1500 COMPUTED · 200 SHOWN · NOT A PROOF' : '1500 RANDOM POLYGONS · A PICTURE, NOT A PROOF';
    else if (time < 35000) tag = 'SCHEMATIC DIMENSION CHANGE · ENDPOINT DUALS';
    else if (time < 36750) tag = 'CUBE AND OCTAHEDRON · KNOWN IN DIMENSION 3';
    else return;

    const y = time >= 32750 ? h * .035 : h * mix(tall ? .69 : .11, .055, tucked);
    this.text(tag, w * .5, y, w * (tall ? .91 : .88), size);
  }

  private meterPoint(value: number, tucked: number): Point {
    const { width: w, height: h } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const t = (value - 7.6) / 2.5;
    const original = tall ? { x: w * (.12 + .76 * t), y: h * .855 } : { x: w * .89, y: h * (.77 - .59 * t) };
    const final = { x: w * (.08 + .36 * t), y: h * (tall ? .68 : .67) };

    return lerpPoint(original, final, tucked);
  }

  private meter(time: number, value: number, tucked: number): void {
    if (time < 21500) return;

    const { width: w, height: h, pen } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const amount = smooth(time, 21500, 23250);
    const a = this.meterPoint(7.6, tucked);
    const b = this.meterPoint(10.1, tucked);
    const end = lerpPoint(a, b, amount);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    const normal = { x: -dy / length, y: dx / length };
    pen.lineWidth = .8;
    this.line(a.x, a.y, end.x, end.y);

    for (const number of [8, 9, 9.869571931435074]) {
      const p = this.meterPoint(number, tucked);
      const floor = number === 8 && time >= 25500;
      const extent = floor ? 13 : 4;
      pen.lineWidth = floor ? 2 : .8;
      this.line(p.x - normal.x * extent, p.y - normal.y * extent, p.x + normal.x * extent, p.y + normal.y * extent);
      this.text(number === 9.869571931435074 ? 'π²' : String(number), p.x + normal.x * (tall || tucked > .5 ? 20 : 23), p.y + normal.y * (tall || tucked > .5 ? 20 : 23), 32, tall ? 10 : 13, '"Garamond Math"');
    }

    if (time >= 25500) {
      const p = this.meterPoint(8, tucked);
      this.text(tucked > .5 ? 'PLANE: PROVED 8' : 'PLANE · PROVED BY MAHLER', w * (tucked > .5 ? tall ? .32 : .26 : tall ? .5 : .88), h * (tucked > .5 ? tall ? .64 : .755 : tall ? .98 : .88), w * (tucked > .5 ? .43 : tall ? .9 : .23), tall ? 8.5 : 11);
      pen.lineWidth = .7;
      const q = this.meterPoint(7.6, tucked);
      pen.setLineDash([2, 4]);
      this.line(q.x, q.y, p.x, p.y);
      pen.setLineDash([]);
    }

    if (time >= 30500) {
      const count = tall ? 200 : this.model.cloud.trials;
      const released = Math.floor(count * smooth(time, 30500, 32400));
      pen.fillStyle = this.tones.ink;

      for (let index = 0; index < released; index++) {
        const product = this.model.cloud.products[index];

        if (product === undefined) throw new Error('Every cloud point needs its computed product.');

        const point = this.meterPoint(product, tucked);
        const jitter = (((index * 67) % 101) / 100 - .5) * (tucked > .5 ? 14 : 23);
        const flight = 1 - smooth(time, 30500 + index / count * 1300, 31200 + index / count * 1300);
        const offset = jitter * (1 - flight);
        pen.beginPath();
        pen.arc(point.x + normal.x * offset, point.y + normal.y * offset, tall ? .85 : .7, 0, Math.PI * 2);
        pen.fill();
      }
    }

    if (time < 32750) {
      const current = this.meterPoint(value, tucked);
      pen.fillStyle = this.tones.ink;
      pen.beginPath();
      pen.arc(current.x, current.y, 3, 0, Math.PI * 2);
      pen.fill();
    }

    if (time >= 36750) this.text(tall ? '200 OF 1500 · EXAMPLES' : '1500 COMPUTED EXAMPLES', w * .26, h * (tall ? .79 : .785), w * .46, tall ? 8 : 10);

    pen.lineWidth = 1.2;
  }

  private rememberedExamples(time: number, body: Center, tucked: number): void {
    const examples = [
      { at: 16600, polygon: this.model.disk1000, value: 9.869571931435074 },
      { at: 18600, polygon: this.model.hexagon, value: 9 },
      { at: 20500, polygon: this.model.square, value: 8 },
    ];

    for (const [index, example] of examples.entries()) {
      if (time < example.at) continue;

      const tall = this.width < PHONE_STAGE_WIDTH;
      const parked = { x: this.width * (.20 + index * .30), y: this.height * (tall ? .97 : .91) };
      const emerged = smooth(time, example.at, example.at + 750);
      const departure = smooth(time, 21500 + index * 150, 23100 + index * 150);
      const initial = lerpPoint(body, parked, emerged);
      const center = lerpPoint(initial, this.meterPoint(example.value, tucked), departure);
      this.outline(example.polygon, { ...center, scale: mix(mix(body.scale, tall ? 5 : 7, emerged), tall ? 4 : 6, departure) });
    }
  }

  private cube(center: Center, amount: number): void {
    const project = (x: number, y: number, z: number) => this.screen({ x: x + .4 * z, y: y + .28 * z }, center);

    for (const z of [-amount, amount]) {
      const vertices = [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const;
      this.pen.beginPath();

      for (const [index, vertex] of vertices.entries()) {
        const point = project(vertex[0], vertex[1], z);

        if (index === 0) this.pen.moveTo(point.x, point.y);
        else this.pen.lineTo(point.x, point.y);
      }

      this.pen.closePath();
      this.pen.stroke();
    }

    for (const x of [-1, 1]) {
      for (const y of [-1, 1]) {
        const a = project(x, y, -amount);
        const b = project(x, y, amount);
        this.line(a.x, a.y, b.x, b.y);
      }
    }
  }

  private octahedron(center: Center, amount: number): void {
    const equator = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
    this.outline(equator, center);

    for (const sign of [-1, 1]) {
      const apex = this.screen({ x: .4 * amount * sign, y: .28 * amount * sign }, center);

      for (const vertex of equator) {
        const p = this.screen(vertex, center);
        this.line(apex.x, apex.y, p.x, p.y);
      }
    }
  }

  private spatialReadout(time: number, tucked: number, amount: number): void {
    const { width: w, height: h } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const x = w * mix(tall ? .5 : .4, tall ? .25 : .25, tucked);
    const y = h * mix(tall ? .72 : .71, .53, tucked);

    if (amount < 1) {
      this.text('ASSEMBLING THE THIRD DIMENSION', x, y, w * (tall ? .92 : .64), tall ? 9 : 12);
      this.text('VOLUME READOUT AFTER ASSEMBLY', x, y + 20, w * (tall ? .92 : .64), tall ? 8 : 11);

      return;
    }

    const row = this.model.dimensionTable[2];

    if (!row || row.n !== 3) throw new Error('The spatial example needs the computed three-dimensional volume row.');

    this.text(`3D VOLUMES: ${row.cube} × 4/3`, x, y, w * (tucked > .5 ? .47 : .85), tall ? 9 : 13, '"Garamond Math"');
    this.text(`PRODUCT = ${row.productFraction} ≈ ${row.product.toFixed(2)}`, x, y + (tall ? 20 : 25), w * (tucked > .5 ? .47 : .85), tall ? 10 : 16, '"Garamond Math"');

    if (time >= 36750) this.text('KNOWN 3D EXAMPLE', x, y - 22, w * .46, tall ? 8 : 11);
  }

  private line(x1: number, y1: number, x2: number, y2: number): void {
    this.pen.beginPath();
    this.pen.moveTo(x1, y1);
    this.pen.lineTo(x2, y2);
    this.pen.stroke();
  }

  private text(value: string, x: number, y: number, width: number, size: number, family = '"Special Elite"'): void {
    const { pen } = this;
    pen.font = `${size}px ${family}, serif`;
    pen.textAlign = 'center';
    pen.textBaseline = 'middle';
    pen.fillStyle = this.tones.ink;
    const rows: string[] = [];
    let row = '';

    for (const word of value.split(' ')) {
      const next = row ? row + ' ' + word : word;

      if (row && pen.measureText(next).width > width) {
        rows.push(row);
        row = word;
      } else row = next;
    }

    if (row) rows.push(row);

    for (const [index, content] of rows.entries()) pen.fillText(content, x, y + (index - (rows.length - 1) / 2) * size * 1.45);
  }
}

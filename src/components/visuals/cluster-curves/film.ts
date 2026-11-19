import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { buildClusterCurvesModel } from './math';
import { drawClusterCurvesPanels } from './panels';
import { motionAt, SCENE_TIMES } from './story';

type Point = { x: number; y: number };

type Square = { x: number; y: number; side: number };

type Rect = { left: number; right: number; top: number; bottom: number };

type Model = ReturnType<typeof buildClusterCurvesModel>;

type Sample = Model['samples'][number];

type Motion = ReturnType<typeof motionAt>;

function between(a: Square, b: Square, amount: number): Square {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount), side: mix(a.side, b.side, amount) };
}

function shrinkThenTravel(a: Square, b: Square, amount: number): Square {
  const middle = { x: a.x, y: a.y, side: b.side };

  return amount < .5 ? between(a, middle, amount * 2) : between(middle, b, (amount - .5) * 2);
}

function travelThenGrow(a: Square, b: Square, amount: number, smallSide: number): Square {
  const middle = { x: b.x, y: b.y, side: smallSide };

  return amount < .5 ? between(a, middle, amount * 2) : between(middle, b, (amount - .5) * 2);
}

class ClusterCurvesFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly model = buildClusterCurvesModel();

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

  private get phone(): boolean {
    return this.width < PHONE_STAGE_WIDTH;
  }

  private plotBounds(): Rect {
    return { left: this.width * .13, right: this.width * .93, top: this.height * (this.phone ? .28 : .23), bottom: this.height * .65 };
  }

  private plotPoint(q: number, kappa: number): Point {
    const bounds = this.plotBounds();

    return { x: mix(bounds.left, bounds.right, q / 4), y: mix(bounds.bottom, bounds.top, (kappa - 4) / 4) };
  }

  private square(sample: Sample, motion: Motion): Square {
    const { width: w, height: h } = this;
    const bigSide = Math.min(w * (this.phone ? .88 : .43), h * (this.phone ? .35 : .69));
    const big = { x: w * (this.phone ? .5 : .26), y: h * (this.phone ? .405 : .43), side: bigSide };
    const smallSide = Math.min(w * (this.phone ? .15 : .12), h * .16);
    const left = { x: w * (this.phone ? .22 : .66), y: h * (this.phone ? .11 : .20), side: smallSide };
    const right = { x: w * (this.phone ? .78 : .84), y: h * (this.phone ? .11 : .20), side: smallSide };
    let current: Square;

    if (this.phone) {
      if (sample.q === 1) {
        current = shrinkThenTravel(big, left, motion.q1Retreat);
        current = travelThenGrow(current, big, motion.q1Return, smallSide);
      } else if (sample.q === 2) {
        current = travelThenGrow({ ...right, side: 0 }, big, motion.q2Enter, smallSide);
        current = shrinkThenTravel(current, { ...left, x: w * .5 }, motion.q2Retreat);
      } else {
        current = travelThenGrow({ ...right, side: 0 }, big, motion.q3Enter, smallSide);
        current = shrinkThenTravel(current, right, motion.q3Retreat);
      }
    } else {
      const row = { x: w * (.19 + (sample.q - 1) * .31), y: h * .34, side: Math.min(w * .26, h * .48) };

      if (sample.q === 1) {
        current = between(big, row, motion.q1Retreat);
        current = between(current, big, motion.q1Return);
      } else if (sample.q === 2) {
        current = between({ ...row, side: 0 }, row, motion.q2Enter);
        current = between(current, left, motion.q3Retreat);
      } else {
        current = between({ ...row, side: 0 }, row, motion.q3Enter);
        current = between(current, right, motion.q3Retreat);
      }
    }

    const point = this.plotPoint(sample.q, mix(4, sample.kappa, motion.kappaCurve));
    const side = Math.min(w * (this.phone ? .15 : .085), h * .14);
    const thumbnail = { x: point.x, y: point.y - side / 2 - (this.phone ? 13 : 18), side };

    const carry = sample.q === 1 ? motion.thumbnailLead : motion.thumbnailSiblings;

    return between(current, thumbnail, carry);
  }

  private site(x: number, y: number, square: Square): Point {
    return { x: square.x + ((x + .5) / this.model.size - .5) * square.side, y: square.y - ((y + .5) / this.model.size - .5) * square.side };
  }

  private corner(point: Point, square: Square): Point {
    return this.site(point.x / 5, point.y / 5, square);
  }

  draw(time: number): void {
    const { pen, width: w, height: h } = this;
    const motion = motionAt(time);
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();

    if (motion.axes > 0) this.axes(motion);
    if (motion.kappaCurve > 0) this.curve(motion);

    for (const sample of this.model.samples) {
      if (sample.q === 2 && motion.q2Enter === 0) continue;
      if (sample.q === 3 && motion.q3Enter === 0) continue;

      this.grid(sample, motion);
    }

    if (motion.loopZoom > 0 && motion.loopReturn < 1) this.detail(motion);
    if (time >= SCENE_TIMES.humanProofs) this.proofMarks(motion);
    if (motion.qRings > 0) this.claimRings(motion);

    drawClusterCurvesPanels(pen, w, h, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }

  private grid(sample: Sample, motion: Motion): void {
    const square = this.square(sample, motion);

    if (square.side < .5) return;

    const { pen, tones, model } = this;
    const opening = sample.q === 1 && motion.q1Retreat === 0;
    const visibleSites = Math.ceil(model.size ** 2 * (opening ? motion.sites : 1));
    const visibleEdges = Math.ceil((2 * model.size * (model.size - 1)) * (opening ? motion.edges : 1));
    const open = new Set(sample.openEdges.map(edge => edge.join(',')));
    const cell = square.side / model.size;
    let index = 0;
    pen.strokeStyle = tones.muted;
    pen.lineWidth = Math.max(.25, Math.min(.65, cell * .07));
    pen.setLineDash([Math.max(.5, cell * .10), Math.max(.8, cell * .22)]);
    pen.beginPath();

    for (let x = 0; x < model.size; x++) {
      for (let y = 0; y < model.size; y++) {
        for (const [X, Y] of [[x + 1, y], [x, y + 1]] as const) {
          if (X >= model.size || Y >= model.size) continue;

          const shown = index++ < visibleEdges;

          if (!shown || open.has([x, y, X, Y].join(','))) continue;

          const a = this.site(x, y, square);
          const b = this.site(X, Y, square);
          pen.moveTo(a.x, a.y);
          pen.lineTo(b.x, b.y);
        }
      }
    }

    pen.stroke();
    pen.setLineDash([]);
    pen.strokeStyle = tones.ink;
    pen.lineWidth = Math.max(.4, Math.min(1.3, cell * .12));
    pen.beginPath();
    index = 0;

    for (let x = 0; x < model.size; x++) {
      for (let y = 0; y < model.size; y++) {
        for (const [X, Y] of [[x + 1, y], [x, y + 1]] as const) {
          if (X >= model.size || Y >= model.size) continue;

          const shown = index++ < visibleEdges;

          if (!shown || !open.has([x, y, X, Y].join(','))) continue;

          const a = this.site(x, y, square);
          const b = this.site(X, Y, square);
          pen.moveTo(a.x, a.y);
          pen.lineTo(b.x, b.y);
        }
      }
    }

    pen.stroke();
    pen.fillStyle = tones.ink;
    pen.beginPath();

    for (let vertex = 0; vertex < visibleSites; vertex++) {
      const point = this.site(Math.floor(vertex / model.size), vertex % model.size, square);
      const clusterId = sample.vertexCluster[vertex];

      if (clusterId === undefined) throw new Error('Each site needs its computed cluster index.');

      const cluster = sample.clusters[clusterId];

      if (!cluster) throw new Error('Every sampled vertex must belong to its computed cluster.');

      const radius = Math.min(1.7, Math.max(.32, cell * (.035 + .012 * Math.log1p(cluster.size))));
      pen.moveTo(point.x + radius, point.y);
      pen.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    }

    pen.fill();

    if (motion.loopTrace > 0) {
      pen.lineWidth = Math.max(.4, Math.min(.8, cell * .10));
      pen.strokeStyle = tones.ink;
      pen.beginPath();

      for (const loop of sample.loops) this.loopPath(loop.corners, square, motion.loopTrace);

      pen.stroke();
      pen.lineWidth = Math.max(.9, Math.min(2.1, cell * .27));
      pen.beginPath();
      this.loopPath(sample.longestLoop.corners, square, motion.loopTrace);
      pen.stroke();
    }

    if (!opening || motion.edges === 1) {
      const font = this.phone ? motion.thumbnails === 1 ? 8 : 10 : square.side < 100 ? 10 : 14;
      drawText(pen, `q = ${sample.q}`, square.x, motion.thumbnails === 1 ? square.y - square.side / 2 - 9 : square.y + square.side / 2 + (this.phone ? 9 : 12), { size: font, family: 'math', color: tones.ink, paper: tones.paper });
    }

    if (motion.thumbnails === 1 && motion.leaders > 0) {
      const anchor = this.plotPoint(sample.q, mix(4, sample.kappa, motion.kappaCurve));
      const y = square.y + square.side / 2;
      drawLine(pen, square.x, y, anchor.x, mix(y, anchor.y, motion.leaders), tones.ink, .7);
    }
  }

  private loopPath(corners: readonly Point[], square: Square, amount: number): void {
    const count = Math.min(corners.length - 1, amount * (corners.length - 1));
    const first = corners[0];

    if (!first || count <= 0) return;

    const start = this.corner(first, square);
    this.pen.moveTo(start.x, start.y);

    for (let index = 1; index <= Math.ceil(count); index++) {
      const previous = corners[index - 1];
      const current = corners[index];

      if (!previous || !current) throw new Error('Every drawn loop segment needs two actual corners.');

      const fraction = Math.min(1, count - index + 1);
      const point = this.corner({ x: mix(previous.x, current.x, fraction), y: mix(previous.y, current.y, fraction) }, square);
      this.pen.lineTo(point.x, point.y);
    }
  }

  private detail(motion: Motion): void {
    const { pen, width: w, height: h, tones } = this;
    const source = this.square(this.model.q1, motion);
    const segment = this.model.q1.longestLoop.corners.slice(20, 33);
    const xs = segment.map(point => point.x);
    const ys = segment.map(point => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const center = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
    const original = this.corner(center, source);
    const target = { x: w * (this.phone ? .5 : .74), y: h * (this.phone ? .80 : .53) };
    const amount = motion.loopZoom * (1 - motion.loopReturn);
    const destination = { x: mix(original.x, target.x, amount), y: mix(original.y, target.y, amount) };
    const scale = Math.min(w * (this.phone ? .7 : .29) / (maxX - minX + 5), h * (this.phone ? .13 : .17) / (maxY - minY + 5));
    const natural = source.side / (5 * this.model.size);
    const factor = mix(natural, scale, amount);
    drawLine(pen, original.x, original.y, destination.x, destination.y, tones.muted, .7, [2, 3]);
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.6;
    pen.beginPath();

    for (const [index, point] of segment.entries()) {
      const x = destination.x + (point.x - center.x) * factor;
      const y = destination.y - (point.y - center.y) * factor;

      if (index === 0) pen.moveTo(x, y);
      else pen.lineTo(x, y);
    }

    pen.stroke();

    if (motion.loopZoom === 1 && motion.loopReturn === 0) {
      drawText(pen, `SAME 12 SEGMENTS · ×${(scale / natural).toFixed(1)}`, target.x, target.y + h * (this.phone ? .10 : .12), { size: this.phone ? 8 : 11, color: tones.ink, paper: tones.paper });
    }
  }

  private axes(motion: Motion): void {
    const { pen, tones } = this;
    const bounds = this.plotBounds();
    drawLine(pen, bounds.left, bounds.bottom, mix(bounds.left, bounds.right, motion.axes), bounds.bottom, tones.ink);
    drawLine(pen, bounds.left, bounds.bottom, bounds.left, mix(bounds.bottom, bounds.top, motion.axes), tones.ink);

    if (motion.axes < 1) return;

    for (let q = 0; q <= 4; q++) {
      const point = this.plotPoint(q, 4);
      drawLine(pen, point.x, point.y - 3, point.x, point.y + 3, tones.ink);
      drawText(pen, String(q), point.x, point.y + 12, { size: this.phone ? 10 : 13, family: 'math', color: tones.ink, paper: tones.paper });
    }

    for (let value = 5; value <= 8; value++) {
      const point = this.plotPoint(0, value);
      drawLine(pen, point.x - 3, point.y, point.x + 3, point.y, tones.ink);
      drawText(pen, String(value), point.x - 13, point.y, { size: this.phone ? 10 : 13, family: 'math', color: tones.ink, paper: tones.paper });
    }

    drawText(pen, 'κ', bounds.left, bounds.top - 20, { size: this.phone ? 15 : 21, family: 'math', color: tones.ink, paper: tones.paper });
    drawText(pen, 'q', bounds.right + (this.phone ? 10 : 17), bounds.bottom + 11, { size: this.phone ? 14 : 18, family: 'math', color: tones.ink, paper: tones.paper });
    drawText(pen, '4', bounds.left - 13, bounds.bottom, { size: this.phone ? 10 : 13, family: 'math', color: tones.ink, paper: tones.paper });
  }

  private curve(motion: Motion): void {
    const { pen, tones } = this;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.4;
    pen.setLineDash(motion.predictedDash > 0 ? [5, 4] : []);
    pen.beginPath();
    const count = Math.ceil(this.model.kappaCurve.length * motion.kappaCurve);

    for (let index = 0; index < count; index++) {
      const value = this.model.kappaCurve[index];

      if (!value) throw new Error('The parameter curve needs its computed q and kappa.');

      const point = this.plotPoint(value.q, value.kappa);

      if (index === 0) pen.moveTo(point.x, point.y);
      else pen.lineTo(point.x, point.y);
    }

    pen.stroke();
    pen.setLineDash([]);
    const limit = this.plotPoint(0, 8);
    pen.fillStyle = tones.paper;
    pen.strokeStyle = tones.ink;
    pen.beginPath();
    pen.arc(limit.x, limit.y, 3.5, 0, 2 * Math.PI);
    pen.fill();
    pen.stroke();

    if (motion.claimStroke > 0) {
      pen.strokeStyle = tones.blue;
      pen.lineWidth = this.phone ? 2.4 : 3;
      pen.setLineDash([6, 3]);
      pen.beginPath();
      const claimed = Math.ceil(this.model.kappaCurve.length * motion.claimStroke);

      for (let index = 1; index < claimed; index++) {
        const value = this.model.kappaCurve[index];

        if (!value) throw new Error('Every claim mark must sit on its actual parameter value.');

        const point = this.plotPoint(value.q, value.kappa);

        if (index === 1) pen.moveTo(point.x, point.y);
        else pen.lineTo(point.x, point.y);
      }

      pen.stroke();
      pen.setLineDash([]);
    }
  }

  private proofMarks(motion: Motion): void {
    const { pen, tones } = this;
    const size = this.phone ? 4.5 : 6;
    const triangle = this.plotPoint(1, this.model.q1.kappa);

    if (motion.triangularProof > 0) {
      pen.strokeStyle = tones.ink;
      pen.lineWidth = 1.4;
      pen.fillStyle = tones.paper;
      pen.beginPath();
      pen.moveTo(triangle.x, triangle.y - size);
      pen.lineTo(triangle.x + size, triangle.y + size);
      pen.lineTo(triangle.x - size, triangle.y + size);
      pen.closePath();
      pen.fill();
      pen.stroke();
    }

    if (motion.isingProof > 0) {
      const point = this.plotPoint(2, this.model.q2.kappa);
      pen.beginPath();
      pen.arc(point.x, point.y, size, 0, 2 * Math.PI);
      pen.fill();
      pen.stroke();
    }

    if (motion.squareOpen > 0) {
      drawLine(pen, triangle.x + size + 2, triangle.y, triangle.x + size * 3, triangle.y, tones.ink, .8);
      pen.strokeRect(triangle.x + size * 3, triangle.y - size, size * 2, size * 2);
    }
  }

  private claimRings(motion: Motion): void {
    const { pen, tones } = this;
    pen.strokeStyle = tones.blue;
    pen.lineWidth = 2.1;

    for (const sample of this.model.samples) {
      const point = this.plotPoint(sample.q, 4);
      pen.beginPath();
      pen.arc(point.x, point.y, this.phone ? 5 : 7, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * motion.qRings);
      pen.stroke();
    }
  }
}

export function createClusterCurvesFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new ClusterCurvesFilm(root, context);
}

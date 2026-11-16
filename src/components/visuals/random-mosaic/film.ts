import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { buildRandomMosaicModel, chainPath, illustrationAt, type Point, type Mosaic, type ClippedCell } from './math';
import { drawRandomMosaicPanels } from './panels';
import { motionAt } from './story';

type Motion = ReturnType<typeof motionAt>;

type Diagram = Pick<Mosaic, 'width' | 'height' | 'sites'> & { cells: readonly ClippedCell[] };

type WindowFrame = { x: number; y: number; scale: number; angle: number };

type Rect = { left: number; right: number; top: number; bottom: number };

class RandomMosaicFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly model = buildRandomMosaicModel();
  private readonly squarePath = chainPath(this.model.square, this.model.originalChain, 'leftRight');
  private readonly widePath: Point[];
  private cachedWide = 0;
  private cachedTurn = 0;
  private cachedDiagram: Diagram = this.model.square;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 5 });
    const chain = this.model.wide.topBottomChain;

    if (!chain) throw new Error('The carried wide example needs its actual top-bottom crossing.');

    this.widePath = chainPath(this.model.wide, chain, 'topBottom');
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

  private diagram(motion: Motion): Diagram {
    const wide = motion.wide * (1 - motion.square);
    const turn = motion.turn * (1 - motion.unturn);

    if (wide === 0 && turn === 0) return this.model.square;
    if (wide === 1 && turn === 0) return this.model.wide;
    if (wide === 1 && turn === 1) return this.model.tall;

    if (wide !== this.cachedWide || turn !== this.cachedTurn) {
      this.cachedDiagram = illustrationAt(this.model, wide, turn);
      this.cachedWide = wide;
      this.cachedTurn = turn;
    }

    return this.cachedDiagram;
  }

  private windowFrame(diagram: Diagram, motion: Motion, carry = motion.halfLine): WindowFrame {
    const { width: w, height: h } = this;
    const angle = Math.PI / 4 * motion.compass * (1 - motion.compassReturn);
    const projectedWidth = diagram.width * Math.abs(Math.cos(angle)) + diagram.height * Math.abs(Math.sin(angle));
    const projectedHeight = diagram.height * Math.abs(Math.cos(angle)) + diagram.width * Math.abs(Math.sin(angle));
    const large = Math.min(w * (this.phone ? .88 : .43) / projectedWidth, h * (this.phone ? .40 : .70) / projectedHeight);
    const small = Math.min(w * .30 / diagram.width, h * .14 / diagram.height);
    const firstScale = this.phone ? mix(large, small, carry) : large;
    const finalScale = Math.min(w * (this.phone ? .14 : .15) / diagram.width, h * .17 / diagram.height);
    const x = this.phone ? .5 : .26;
    const y = this.phone ? mix(.28, .16, carry) : .43;

    return { x: w * mix(x, this.phone ? .16 : .13, motion.mosaicInset), y: h * mix(y, .12, motion.mosaicInset), scale: mix(firstScale, finalScale, motion.mosaicInset), angle };
  }

  private point(point: Point, diagram: Diagram, frame: WindowFrame): Point {
    const x = (point.x - diagram.width / 2) * frame.scale;
    const y = (point.y - diagram.height / 2) * frame.scale;

    return { x: frame.x + x * Math.cos(frame.angle) - y * Math.sin(frame.angle), y: frame.y - x * Math.sin(frame.angle) - y * Math.cos(frame.angle) };
  }

  private plotBounds(): Rect {
    return { left: this.width * (this.phone ? .13 : .55), right: this.width * .94, top: this.height * (this.phone ? .36 : .24), bottom: this.height * (this.phone ? .64 : .66) };
  }

  private plotPoint(x: number, probability: number): Point {
    const bounds = this.plotBounds();

    return { x: mix(bounds.left, bounds.right, x), y: mix(bounds.bottom, bounds.top, probability) };
  }

  draw(time: number): void {
    const { pen, width: w, height: h } = this;
    const motion = motionAt(time);
    const diagram = this.diagram(motion);
    const frame = this.windowFrame(diagram, motion);
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();
    this.mosaic(diagram, frame, motion);

    if (motion.scene === 'critical') this.gauge(motion);
    if (motion.scene === 'isotropy') this.compass();
    if (motion.boundary > 0) this.marks(diagram, motion);
    if (motion.plotAxes > 0) this.plot(motion);
    if (motion.claimBracket > 0) this.bracket(motion);
    if (motion.annealedTicks > 0) this.tickBoard(motion);

    drawRandomMosaicPanels(pen, w, h, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }

  private polygon(points: readonly Point[]): void {
    const first = points[0];

    if (!first) return;

    this.pen.moveTo(first.x, first.y);

    for (const point of points.slice(1)) this.pen.lineTo(point.x, point.y);

    this.pen.closePath();
  }

  private mosaic(diagram: Diagram, frame: WindowFrame, motion: Motion): void {
    const { pen, tones } = this;
    const boundary = [{ x: 0, y: 0 }, { x: diagram.width, y: 0 }, { x: diagram.width, y: diagram.height }, { x: 0, y: diagram.height }];
    const outline = boundary.map(point => this.point(point, diagram, frame));
    const opening = motion.scene === 'mosaic';
    const fillLimit = motion.black * this.model.square.sites.length;
    pen.fillStyle = tones.ink;
    pen.beginPath();

    for (const cell of diagram.cells) {
      if (!cell.site.black || cell.site.id >= fillLimit || cell.polygon.length < 3) continue;

      this.polygon(cell.polygon.map(point => this.point(point, diagram, frame)));
    }

    // Additional illustrative sites already retain their fair seeded colours.
    if (motion.wide > 0) {
      for (const cell of diagram.cells) {
        if (!cell.site.black || cell.site.id < this.model.square.sites.length || cell.polygon.length < 3) continue;

        this.polygon(cell.polygon.map(point => this.point(point, diagram, frame)));
      }
    }

    pen.fill();
    pen.strokeStyle = tones.ink;
    pen.lineWidth = Math.max(.35, Math.min(.8, frame.scale * .004));
    pen.beginPath();

    for (const cell of diagram.cells) {
      const growth = opening ? motion.cells : 1;
      const polygon = cell.polygon.map(point => this.point({ x: mix(cell.site.x, point.x, growth), y: mix(cell.site.y, point.y, growth) }, diagram, frame));
      this.polygon(polygon);
    }

    pen.stroke();
    pen.lineWidth = 1.1;
    pen.beginPath();
    this.polygon(outline);
    pen.stroke();
    const visibleSites = diagram.sites.length;

    for (let index = 0; index < visibleSites; index++) {
      const site = diagram.sites[index];

      if (!site) throw new Error('Each drawn seed needs its actual retained site.');
      if (site.x < 0 || site.y < 0 || site.x > diagram.width || site.y > diagram.height) continue;

      const drop = Math.max(0, Math.min(1, (motion.sites - index / this.model.square.sites.length * .65) / .35));

      if (opening && drop === 0) continue;

      const dropped = { x: site.x, y: opening ? mix(diagram.height, site.y, drop) : site.y };
      const point = this.point(dropped, diagram, frame);
      const filled = site.black && (site.id < fillLimit || site.id >= this.model.square.sites.length);
      pen.fillStyle = filled ? tones.paper : tones.ink;
      pen.beginPath();
      pen.arc(point.x, point.y, frame.scale < 90 ? .45 : 1.1, 0, 2 * Math.PI);
      pen.fill();
    }

    if (motion.scene === 'critical') {
      const layers = Math.ceil(this.model.square.leftLayers.length * motion.flood);
      pen.strokeStyle = tones.paper;
      pen.lineWidth = 1.2;
      pen.beginPath();

      for (const layer of this.model.square.leftLayers.slice(0, layers)) {
        for (const id of layer) {
          const site = this.model.square.sites.find(site => site.id === id);

          if (!site) throw new Error('Each breadth-first flood mark needs its retained black site.');

          const point = this.point(site, diagram, frame);
          pen.moveTo(point.x + 3, point.y);
          pen.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        }
      }

      pen.stroke();
    }

    if (motion.scene === 'critical' || motion.scene === 'geometry') this.crossing(diagram, frame, motion);


  }

  private path(points: readonly Point[], amount: number): void {
    const first = points[0];

    if (!first || amount <= 0) return;

    const distances = [0];
    let total = 0;

    for (let index = 1; index < points.length; index++) {
      const previous = points[index - 1];
      const current = points[index];

      if (!previous || !current) throw new Error('Each highlighted route needs its two segment endpoints.');

      total += Math.hypot(current.x - previous.x, current.y - previous.y);
      distances.push(total);
    }

    this.pen.moveTo(first.x, first.y);
    const limit = total * amount;

    for (let index = 1; index < points.length; index++) {
      const previous = points[index - 1];
      const current = points[index];
      const start = distances[index - 1];
      const finish = distances[index];

      if (!previous || !current || start === undefined || finish === undefined) throw new Error('Every route piece needs its measured length.');
      if (limit <= start) break;

      const fraction = finish === start ? 1 : Math.min(1, (limit - start) / (finish - start));
      this.pen.lineTo(mix(previous.x, current.x, fraction), mix(previous.y, current.y, fraction));
    }
  }

  private crossing(diagram: Diagram, frame: WindowFrame, motion: Motion): void {
    const { pen, tones } = this;
    const original = motion.route * Math.max(0, 1 - motion.wide * 4);
    const turn = motion.turn * (1 - motion.unturn);
    const transformed = this.widePath.map(point => ({ x: mix(point.x, 1 - point.y, turn), y: mix(point.y, point.x, turn) }));
    const paths = [{ points: this.squarePath, amount: original }, { points: transformed, amount: motion.wideRoute * (1 - motion.unturn) }];

    for (const path of paths) {
      if (path.amount <= 0) continue;

      const points = path.points.map(point => this.point(point, diagram, frame));
      pen.strokeStyle = tones.paper;
      pen.lineWidth = this.phone ? 4 : 5;
      pen.beginPath();
      this.path(points, path.amount);
      pen.stroke();
      pen.strokeStyle = tones.ink;
      pen.lineWidth = this.phone ? 1.8 : 2.2;
      pen.beginPath();
      this.path(points, path.amount);
      pen.stroke();
    }
  }

  private gauge(motion: Motion): void {
    const { width: w, height: h, pen, tones } = this;
    const left = w * (this.phone ? .20 : .63);
    const right = w * (this.phone ? .80 : .89);
    const y = h * (this.phone ? .60 : .22);
    drawLine(pen, left, y, right, y, tones.ink);
    const x = mix(left, right, .5 * motion.gauge);
    drawLine(pen, x, y - 6, x, y + 6, tones.ink, 2);

    for (const value of [0, 1]) drawText(pen, String(value), mix(left, right, value), y + 13, { size: this.phone ? 10 : 13, family: 'math', color: tones.ink, paper: tones.paper });
  }

  private compass(): void {
    const { width: w, height: h, pen, tones } = this;
    const center = { x: w * (this.phone ? .5 : .76), y: h * (this.phone ? .62 : .36) };
    const radius = Math.min(w * (this.phone ? .09 : .045), h * .085);
    pen.strokeStyle = tones.ink;
    pen.lineWidth = .9;
    pen.beginPath();

    for (let index = 0; index < 8; index++) {
      const angle = index * Math.PI / 4;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      pen.moveTo(center.x, center.y);
      pen.lineTo(x, y);
      pen.moveTo(x - 4 * Math.cos(angle - .5), y - 4 * Math.sin(angle - .5));
      pen.lineTo(x, y);
      pen.lineTo(x - 4 * Math.cos(angle + .5), y - 4 * Math.sin(angle + .5));
    }

    pen.stroke();
  }

  private marks(diagram: Diagram, motion: Motion): void {
    const { pen, tones } = this;
    const plot = this.plotBounds();
    const corners = [{ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
    const names = ['a', 'b', 'c', 'd'];
    const values = ['0', 'x', '1', '∞'];
    const origin = this.windowFrame(diagram, motion, 0);
    const finiteRight = plot.right - (this.phone ? 25 : 36);
    const markX = [plot.left, mix(plot.left, finiteRight, .5), finiteRight, plot.right];

    const current = this.windowFrame(diagram, motion);
    const amount = motion.boundary * Math.max(0, 1 - motion.halfLine * 3);

    for (const x of [0, 1]) {
      const start = this.point({ x, y: 0 }, diagram, current);
      const end = this.point({ x, y: amount }, diagram, current);
      drawLine(pen, start.x, start.y, end.x, end.y, tones.ink, 3);
    }

    if (motion.halfLine > 0 && motion.plotAxes === 0) {
      const tip = mix(plot.left, plot.right + 5, motion.halfLine);
      drawLine(pen, plot.left, plot.bottom, tip, plot.bottom, tones.ink);
      drawLine(pen, tip - 5, plot.bottom - 3, tip, plot.bottom, tones.ink);
      drawLine(pen, tip - 5, plot.bottom + 3, tip, plot.bottom, tones.ink);
    }

    if (motion.plotAxes > 0) return;

    if (motion.halfLine === 1) {
      drawLine(pen, plot.left, plot.bottom, mix(plot.left, finiteRight, .5), plot.bottom, tones.ink, 3);
      drawLine(pen, finiteRight, plot.bottom, plot.right, plot.bottom, tones.ink, 3);
    }


    for (const [index, corner] of corners.entries()) {
      const name = names[index];
      const value = values[index];
      const targetX = markX[index];

      if (!name || !value || targetX === undefined) throw new Error('Every boundary mark needs its defined image.');

      const start = this.point(corner, diagram, origin);
      const point = { x: mix(start.x, targetX, motion.halfLine), y: mix(start.y, plot.bottom, motion.halfLine) };
      pen.fillStyle = tones.ink;
      pen.beginPath();
      pen.arc(point.x, point.y, 2.1, 0, 2 * Math.PI);
      pen.fill();
      const dx = motion.halfLine === 0 ? (index < 2 ? -9 : 9) : 0;
      const dy = motion.halfLine === 0 ? (index === 0 || index === 3 ? -10 : 10) : -13;
      drawText(pen, name, point.x + dx, point.y + dy, { size: this.phone ? 13 : 16, family: 'math', color: tones.ink, paper: tones.paper });

      if (motion.halfLine === 1) drawText(pen, value, point.x, point.y + 13, { size: this.phone ? 11 : 14, family: 'math', color: tones.ink, paper: tones.paper });
    }
  }

  private plot(motion: Motion): void {
    const { pen, tones } = this;
    const bounds = this.plotBounds();
    drawLine(pen, bounds.left, bounds.bottom, bounds.right, bounds.bottom, tones.ink);
    drawLine(pen, bounds.left, bounds.bottom, bounds.left, mix(bounds.bottom, bounds.top, motion.plotAxes), tones.ink);

    if (motion.plotAxes === 1) {
      for (const value of [0, .5, 1]) {
        const point = this.plotPoint(value, 0);
        drawLine(pen, point.x, point.y - 3, point.x, point.y + 3, tones.ink);
        drawText(pen, String(value), point.x, point.y + 12, { size: this.phone ? 10 : 12, family: 'math', color: tones.ink, paper: tones.paper });
        const vertical = this.plotPoint(0, value);
        drawText(pen, String(value), vertical.x - 12, vertical.y, { size: this.phone ? 10 : 12, family: 'math', color: tones.ink, paper: tones.paper });
      }

      drawText(pen, 'x', bounds.right, bounds.bottom + 28, { size: this.phone ? 13 : 16, family: 'math', color: tones.ink, paper: tones.paper });
      drawText(pen, 'F', bounds.left, bounds.top - 17, { size: this.phone ? 14 : 18, family: 'math', color: tones.ink, paper: tones.paper });
    }

    pen.beginPath();
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1.3;
    const count = Math.ceil(this.model.cardyCurve.length * motion.cardyCurve);

    for (let index = 0; index < count; index++) {
      const value = this.model.cardyCurve[index];

      if (!value) throw new Error('Every Cardy curve point needs its actual integral value.');

      const point = this.plotPoint(value.x, value.F);

      if (index === 0) pen.moveTo(point.x, point.y);
      else pen.lineTo(point.x, point.y);
    }

    pen.stroke();

    if (motion.cardyCurve === 1) {
      for (const target of this.model.targets) {
        const point = this.plotPoint(target.x, target.F);
        pen.fillStyle = tones.ink;
        pen.beginPath();
        pen.arc(point.x, point.y, 2.5, 0, 2 * Math.PI);
        pen.fill();

        if (motion.toyBars > 0) this.toyBar(target.x, target.measured, motion.toyBars);
        if (motion.claimRings > 0) {
          pen.strokeStyle = tones.blue;
          pen.lineWidth = 2;
          pen.beginPath();
          pen.arc(point.x, point.y, this.phone ? 6 : 8, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * motion.claimRings);
          pen.stroke();
        }
      }
    }
  }

  private toyBar(x: number, measured: number, amount: number): void {
    const { pen, tones } = this;
    const center = this.plotPoint(x, measured);
    const low = this.plotPoint(x, Math.max(0, measured - this.model.standardError));
    const high = this.plotPoint(x, Math.min(1, measured + this.model.standardError));
    const offset = (x > .5 ? -1 : 1) * (this.phone ? 7 : 10);
    drawLine(pen, center.x, center.y, center.x + offset * amount, center.y, tones.ink, .65);
    const lowY = mix(center.y, low.y, amount);
    const highY = mix(center.y, high.y, amount);
    drawLine(pen, center.x + offset, lowY, center.x + offset, highY, tones.ink);
    drawLine(pen, center.x + offset - 3, lowY, center.x + offset + 3, lowY, tones.ink);
    drawLine(pen, center.x + offset - 3, highY, center.x + offset + 3, highY, tones.ink);
    pen.fillStyle = tones.paper;
    pen.strokeStyle = tones.ink;
    pen.beginPath();
    pen.arc(center.x + offset, center.y, 3, 0, 2 * Math.PI);
    pen.fill();
    pen.stroke();
  }

  private bracket(motion: Motion): void {
    const { pen, tones } = this;
    const bounds = this.plotBounds();
    const left = bounds.left + 4;
    const right = bounds.right - 4;
    const top = bounds.top - 10;
    drawLine(pen, left, top + 5, left, top, tones.blue, 2);
    drawLine(pen, left, top, mix(left, right, motion.claimBracket), top, tones.blue, 2);

    if (motion.claimBracket === 1) drawLine(pen, right, top, right, top + 5, tones.blue, 2);
  }

  private tickBoard(motion: Motion): void {
    const { width: w, height: h, pen, tones } = this;
    const outcomes = this.model.outcomes.square.leftRight;
    const columns = this.phone ? 20 : 40;
    const spacing = Math.min(this.phone ? 9 : 10, w * (this.phone ? .86 : .44) / columns);
    const left = w * (this.phone ? .5 : .26) - (columns - 1) * spacing / 2;
    const top = h * (this.phone ? .255 : .86);
    const count = Math.floor(40 * motion.annealedTicks);

    for (let index = 0; index < count; index++) {
      const value = outcomes[index];

      if (value !== '0' && value !== '1') throw new Error('Every annealed trial tick needs its actual retained binary outcome.');

      const x = left + index % columns * spacing;
      const y = top + Math.floor(index / columns) * spacing;
      pen.strokeStyle = tones.ink;
      pen.fillStyle = tones.ink;
      pen.lineWidth = .8;

      if (value === '1') pen.fillRect(x - 2, y - 2, 4, 4);
      else pen.strokeRect(x - 2, y - 2, 4, 4);
    }
  }
}

export function createRandomMosaicFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new RandomMosaicFilm(root, context);
}

import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';
import { buildBallTubeSlabModel, periodicDiscCopies, profileAt, type CandidateKind, type CandidateProfile } from './math';
import { drawBallTubeSlabPanels, layout } from './panels';
import { motionAt, SCAN_PHASES } from './story';

type Motion = ReturnType<typeof motionAt>;

type Cell = ReturnType<typeof layout>['cell'];

type Section = { profile: CandidateProfile; radius: number; strip: number; morph: boolean; kind: CandidateKind | null };

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function movingCell(a: Cell, b: Cell, amount: number): Cell {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount), side: mix(a.side, b.side, amount) };
}

class BallTubeSlabFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private readonly labels: FilmLabels;
  private readonly model = buildBallTubeSlabModel();

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 4, vertical: 4 });
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

  private text(value: string, x: number, y: number, size: number, math = false): void {
    drawText(this.pen, value, x, y, { size, family: math ? 'math' : 'type', color: this.tones.ink, paper: this.tones.paper });
  }

  // Pause at each computed tie while changing the schematic section. Only
  // the endpoint sections represent the two exact candidate geometries.
  private scan(amount: number): Section {
    const first = this.model.first;
    const second = this.model.second;
    const phases = SCAN_PHASES;

    if (amount <= phases.firstArrival) {
      const profile = profileAt(mix(.025, first.volume, amount / phases.firstArrival));

      return { profile, radius: profile.ballRadius, strip: 0, morph: false, kind: 'ball' };
    }

    if (amount < phases.firstDeparture) {
      return { profile: profileAt(first.volume), radius: mix(first.ballRadius, first.tubeRadius, (amount - phases.firstArrival) / (phases.firstDeparture - phases.firstArrival)), strip: 0, morph: true, kind: null };
    }

    if (amount <= phases.secondArrival) {
      const profile = profileAt(mix(first.volume, second.volume, (amount - phases.firstDeparture) / (phases.secondArrival - phases.firstDeparture)));

      return { profile, radius: profile.tubeRadius, strip: 0, morph: false, kind: 'tube' };
    }

    if (amount < phases.secondDeparture) {
      return { profile: profileAt(second.volume), radius: second.tubeRadius, strip: (amount - phases.secondArrival) / (phases.secondDeparture - phases.secondArrival), morph: true, kind: null };
    }

    const profile = profileAt(mix(second.volume, .5, (amount - phases.secondDeparture) / (1 - phases.secondDeparture)));

    return { profile, radius: profile.tubeRadius, strip: 1, morph: false, kind: 'slab' };
  }

  private section(motion: Motion): Section {
    if (motion.curves > 0) {
      const section = this.scan(motion.scanAmount);

      if (motion.curves < 1) {
        section.radius = mix(profileAt(.06).tubeRadius, section.radius, motion.curves);
        section.morph = true;
      }

      return section;
    }

    const profile = profileAt(.06);

    return {
      profile,
      radius: mix(profile.ballRadius, profile.tubeRadius, motion.tube) * (.25 * motion.ball + .75 * motion.discGrow),
      strip: motion.slab * (1 - motion.tube),
      morph: (motion.slab > 0 && motion.slab < 1) || (motion.tube > 0 && motion.tube < 1),
      kind: motion.tube === 1 ? 'tube' : motion.slab === 1 && motion.tube === 0 ? 'slab' : 'ball',
    };
  }

  private cell(cell: Cell, amount: number): void {
    if (amount === 0) return;

    const { x, y, side } = cell;
    const corners = [[x, y], [x + side, y], [x + side, y + side], [x, y + side], [x, y]] as const;

    for (let index = 0; index < 4; index++) {
      const first = corners[index];
      const second = corners[index + 1];

      if (!first || !second) throw new Error('A unit-cell edge needs both corners.');

      const end = clamp(amount * 4 - index);

      if (end === 0) continue;

      drawLine(this.pen, first[0], first[1], mix(first[0], second[0], end), mix(first[1], second[1], end), this.tones.ink, .8);
    }

    if (amount < 1) return;

    for (const position of [.25, .75]) {
      for (const edge of [0, 1]) {
        const px = x + edge * side;
        const py = y + position * side;
        drawLine(this.pen, px - 3, py - 2, px + 3, py + 2, this.tones.ink, .8);
        const topX = x + position * side;
        const topY = y + edge * side;
        drawLine(this.pen, topX - 2, topY - 3, topX + 2, topY + 3, this.tones.ink, .8);
      }
    }
  }

  private contour(cell: Cell, radius: number, stripWidth: number, strip: number, centerX: number): Path2D {
    const path = new Path2D();

    if (strip === 0) {
      path.arc(cell.x + centerX * cell.side, cell.y + .5 * cell.side, radius * cell.side, 0, Math.PI * 2);
      return path;
    }

    if (strip === 1) {
      path.rect(cell.x, cell.y + (1 - stripWidth) * cell.side / 2, cell.side, stripWidth * cell.side);
      return path;
    }

    for (let index = 0; index <= 96; index++) {
      const theta = index / 96 * Math.PI * 2;
      const dx = Math.cos(theta);
      const dy = Math.sin(theta);
      const reachX = Math.abs(dx) < 1e-12 ? Infinity : .5 / Math.abs(dx);
      const reachY = Math.abs(dy) < 1e-12 ? Infinity : stripWidth / (2 * Math.abs(dy));
      const rectangleRadius = Math.min(reachX, reachY);
      const length = mix(radius, rectangleRadius, strip);
      const x = cell.x + (centerX + length * dx) * cell.side;
      const y = cell.y + (.5 + length * dy) * cell.side;

      if (index === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }

    path.closePath();

    return path;
  }

  private region(cell: Cell, section: Section, centerX = .5): void {
    if (section.radius === 0 && section.strip === 0) return;

    const { pen, tones } = this;
    const copies = section.strip === 0 ? periodicDiscCopies({ x: centerX, y: .5 }, section.radius) : [{ x: .5, y: .5 }];
    pen.save();
    pen.beginPath();
    pen.rect(cell.x, cell.y, cell.side, cell.side);
    pen.clip();

    for (const copy of copies) {
      const path = this.contour(cell, section.radius, section.profile.slabWidth, section.strip, copy.x);
      pen.save();
      pen.clip(path);
      pen.fillStyle = tones.ink;
      pen.beginPath();

      for (let row = 0; row < 24; row++) {
        for (let column = 0; column < 24; column++) {
          const x = cell.x + (column + .5) * cell.side / 24;
          const y = cell.y + (row + .5) * cell.side / 24;
          const dot = cell.side * .0025;
          pen.moveTo(x + dot, y);
          pen.arc(x, y, dot, 0, Math.PI * 2);
        }
      }

      pen.fill();
      pen.restore();
      pen.strokeStyle = tones.ink;
      pen.lineWidth = 1.15;

      if (section.strip === 1) {
        // The cell sides are joined, so a wrapped slab has no end caps there.
        for (const sign of [-1, 1]) {
          const y = cell.y + (.5 + sign * section.profile.slabWidth / 2) * cell.side;
          drawLine(pen, cell.x, y, cell.x + cell.side, y, tones.ink, 1.15);
        }
      } else pen.stroke(path);
    }

    pen.restore();
  }

  private sections(motion: Motion, section: Section): void {
    const page = layout(this.width, this.height);
    const first = page.alternatives[0];
    const second = page.alternatives[1];
    const openingSide = Math.min(this.width * .84, this.height * .63);
    const opening = this.phone ? { x: (this.width - openingSide) / 2, y: page.cell.y, side: openingSide } : page.cell;
    const prepared = movingCell(opening, page.cell, this.phone ? motion.tube : 1);
    const cell = movingCell(prepared, first, motion.comparisonCarry);
    const wrap = motion.scene === 'periodic' ? motion.wrap : 0;
    this.region(cell, section, .5 + wrap);
    this.cell(cell, motion.cell);

    if (motion.secondFrame > 0) {
      const source = { x: first.x + first.side, y: first.y + first.side / 2, side: 0 };
      const target = movingCell(source, second, motion.secondFrame);
      const profile = profileAt(this.model.first.volume);
      this.region(target, { profile, radius: this.model.first.tubeRadius, strip: 0, morph: false, kind: 'tube' });
      this.cell(target, motion.secondFrame);
    }

    if (motion.comparisonCarry === 0) {
      const note = section.morph ? 'DISPLAY MORPH · SECTION ONLY' : motion.curves > 0 && section.kind ? `SCHEMATIC ${section.kind.toUpperCase()} · V=${section.profile.volume.toFixed(3)}` : 'SCHEMATIC CENTRAL SECTION';
      this.text(note, this.phone ? this.width * .5 : cell.x + cell.side / 2, cell.y + cell.side + (this.phone ? 13 : 19), this.phone ? 7.5 : 9);
    }
  }

  private plotPoint(volume: number, area: number) {
    const { chart } = layout(this.width, this.height);

    return { x: chart.left + volume / .5 * (chart.right - chart.left), y: chart.bottom - area / chart.maxPerimeter * (chart.bottom - chart.top) };
  }

  private curve(field: 'ballArea' | 'tubeArea' | 'slabArea' | 'area', amount: number): void {
    if (amount === 0) return;

    const { pen, tones } = this;
    const stop = .5 * amount;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = field === 'area' ? 2.2 : .8;
    pen.setLineDash(field === 'tubeArea' ? [4, 3] : field === 'slabArea' ? [2, 3] : []);
    pen.beginPath();

    for (const [index, sample] of this.model.curve.entries()) {
      if (sample.volume > stop) break;

      const point = this.plotPoint(sample.volume, sample[field]);

      if (index === 0) pen.moveTo(point.x, point.y);
      else pen.lineTo(point.x, point.y);
    }

    const last = profileAt(stop);
    const endpoint = this.plotPoint(stop, last[field]);
    pen.lineTo(endpoint.x, endpoint.y);
    pen.stroke();
    pen.setLineDash([]);
  }

  private plot(motion: Motion, section: Section): void {
    if (motion.curves === 0) return;

    const { pen, tones, width: w, height: h } = this;
    const { chart } = layout(w, h);
    drawLine(pen, chart.left, chart.bottom, mix(chart.left, chart.right, motion.curves), chart.bottom, tones.ink, .8);
    drawLine(pen, chart.left, chart.bottom, chart.left, mix(chart.bottom, chart.top, motion.curves), tones.ink, .8);
    this.curve('ballArea', motion.curves);
    this.curve('tubeArea', motion.curves);
    this.curve('slabArea', motion.curves);
    this.curve('area', motion.envelope);

    if (motion.curves === 1) {
      for (const area of [1, 2, 3]) {
        const point = this.plotPoint(0, area);
        drawLine(pen, chart.left - 3, point.y, chart.left + 3, point.y, tones.ink, .7);
        this.text(String(area), chart.left - 12, point.y, this.phone ? 9 : 11, true);
      }

      for (const volume of [0, .5]) this.text(String(volume), this.plotPoint(volume, 0).x, chart.bottom + 12, this.phone ? 9 : 11, true);

      this.labels.place('area-axis', chart.left - 17, chart.top - 10);
      this.labels.place('volume-axis', chart.right + 10, chart.bottom - 11);
      const endpoint = profileAt(.5);
      const tubeY = this.plotPoint(.5, endpoint.tubeArea).y;

      for (const [name, value] of [['BALL', endpoint.ballArea], ['TUBE', endpoint.tubeArea], ['SLAB', endpoint.slabArea]] as const) {
        const point = this.plotPoint(.5, value);

        if (this.phone && w < 576) {
          const captionY = name === 'BALL' ? Math.min(point.y, tubeY - 12.5) : name === 'SLAB' ? Math.max(point.y, tubeY + 12.5) : point.y;
          drawLine(pen, point.x, point.y, point.x + 4.5, captionY, tones.muted, .6);
          this.text(name, point.x + 18, captionY, 8);
        } else this.text(name, point.x - (this.phone ? 17 : 25), point.y - 9, this.phone ? 8 : 9);
      }
    }

    if (motion.envelope === 1) {
      const point = this.plotPoint(section.profile.reducedVolume, section.profile.area);
      pen.fillStyle = tones.ink;
      pen.beginPath();
      pen.arc(point.x, point.y, 3, 0, Math.PI * 2);
      pen.fill();
    }

    for (const [index, transition] of this.model.transitions.entries()) {
      const point = this.plotPoint(transition.volume, transition.area);
      const tie = clamp(motion.ties * 2 - index);

      if (tie > 0) {
        pen.strokeStyle = tones.blue;
        pen.lineWidth = 2;
        pen.beginPath();
        pen.arc(point.x, point.y, 4.5 * tie, 0, Math.PI * 2);
        pen.stroke();
      }

      if (motion.transitionTicks > 0) {
        drawLine(pen, point.x, point.y + 5, point.x, mix(point.y + 5, chart.bottom + 3, motion.transitionTicks), tones.ink, .6, [2, 3]);
      }

      if (motion.transitionLabels > 0) {
        this.text(transition.volume.toFixed(4), point.x, chart.bottom + 12, this.phone ? 8 : 10, true);
        if (motion.scene === 'transitions') this.labels.place(index === 0 ? 'first-tie' : 'second-tie', point.x, chart.bottom + (this.phone ? 36 : 35));
      }
    }
  }

  draw(time: number): void {
    const { pen, width: w, height: h } = this;
    const motion = motionAt(time);
    const section = this.section(motion);
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();
    this.sections(motion, section);
    this.plot(motion, section);
    drawBallTubeSlabPanels(pen, w, h, time, this.tones, this.labels, this.model);
    this.labels.endFrame();
  }
}

export function createBallTubeSlabFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new BallTubeSlabFilm(root, context);
}

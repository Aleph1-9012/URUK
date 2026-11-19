import { mix, progress, smooth } from '../../../lib/animation';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import type { FilmDrawing } from '../../plate/controller';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';
import { buildProjectorModel, discCut, projectorCirclePoint } from './math';
import { drawProjectorPanels } from './panels';

type Point = { x: number; y: number };

type Tones = { ink: string; muted: string; paper: string; blue: string };

type RingFrame = { x: number; y: number; radius: number; tilt: number };

function between(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

class ProjectorLinesFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly model = buildProjectorModel();
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
    const { pen, width: w, height: h } = this;
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();

    if (time < 30250) this.disc(time);
    this.rim(time);

    if (time >= 42500) this.projector(time);

    drawProjectorPanels(pen, w, h, time, this.tones, this.labels);
    this.labels.endFrame();
  }

  private frame(time: number): RingFrame {
    const { width: w, height: h } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const close = smooth(time, 72250, 74250);
    const radius = Math.min(w * (phone ? .30 : .23), h * (phone ? .16 : .29));

    return {
      x: mix(w * (phone ? .5 : .28), w * (phone ? .22 : .23), close),
      y: mix(h * (phone ? .25 + .04 * (1 - smooth(time, 40500, 42500)) : .43), h * (phone ? .10 : .32), close),
      radius: mix(radius, h * (phone ? .05 : .12), close),
      tilt: mix(1, .48, close),
    };
  }

  private text(value: string, x: number, y: number, size: number, math = false): void {
    drawText(this.pen, value, x, y, { size, color: this.tones.ink, family: math ? 'math' : 'type' });
  }

  private note(value: string, x: number, y: number, width: number, size: number): void {
    drawWrappedText(this.pen, value, x, y, width, { size, color: this.tones.ink });
  }

  private dot(point: Point, radius = 2): void {
    this.pen.beginPath();
    this.pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    this.pen.fillStyle = this.tones.ink;
    this.pen.fill();
  }

  private sectorPath(center: Point, radius: number, a0: number, a1: number): void {
    this.pen.beginPath();
    this.pen.moveTo(center.x, center.y);
    this.pen.arc(center.x, center.y, radius, -a0, -a1, true);
    this.pen.closePath();
  }

  private tilePoint(index: number, count: number): Point {
    const { width: w, height: h } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const pitch = Math.min(w * (phone ? .19 : .12), h * .19);

    return { x: w * (phone ? .5 : .28) + (index - (count - 1) / 2) * pitch, y: h * (phone ? .26 : .43) };
  }

  private tileRim(index: number, count: number): Point {
    const perTile = 24 / count;
    const group = Math.floor(index / perTile);
    const a = Math.PI * 2 * (index % perTile) / perTile;
    const center = this.tilePoint(group, count);
    const radius = Math.min(this.width * .055, this.height * .055);

    return { x: center.x + radius * Math.cos(a), y: center.y + radius * Math.sin(a) };
  }

  private rimPoint(index: number, time: number): Point {
    const frame = this.frame(time);
    const rim = this.model.rim[index];

    if (!rim) throw new Error('Each carried rim dot needs its unit-disc coordinate.');

    const basic = { x: frame.x + frame.radius * rim.x, y: frame.y - frame.radius * rim.y };

    if (time >= 16000 && time < 30250) {
      const three = this.tileRim(index, 3);
      const four = this.tileRim(index, 4);
      const countPoint = between(three, four, smooth(time, 22500, 24500));
      const fold = smooth(time, 16000, 18500) * (1 - smooth(time, 28250, 30250));

      return between(basic, countPoint, fold);
    }

    const line = this.model.ring[index % 12];

    if (!line) throw new Error('Each opposite rim pair needs its canonical line angle.');

    const pairedAngle = line.theta;
    const paired = { x: frame.x + frame.radius * Math.cos(pairedAngle), y: frame.y - frame.radius * Math.sin(pairedAngle) };
    const pair = between(basic, paired, smooth(time, 42500, 45500));
    const mapped = { x: frame.x + frame.radius * line.point.x, y: frame.y - frame.radius * line.point.y * frame.tilt };

    return between(pair, mapped, smooth(time, 45500, 49500));
  }

  private rim(time: number): void {
    const { width: w, height: h, pen, tones } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const frame = this.frame(time);
    const inTiles = time >= 16000 && time < 30250;

    if (!inTiles && time < 42500) {
      pen.beginPath();
      pen.arc(frame.x, frame.y, frame.radius, 0, Math.PI * 2 * progress(time, 0, 1500));
      pen.strokeStyle = tones.ink;
      pen.lineWidth = 1;
      pen.stroke();

      for (let index = 0; index < 12; index++) {
        const a = this.rimPoint(index, time);
        const b = this.rimPoint(index + 12, time);
        drawLine(pen, a.x, a.y, b.x, b.y, tones.muted, .35, [1, 4]);
      }
    }

    const count = time < 45500 ? 24 : 12;

    for (let index = 0; index < count; index++) {
      if (index > Math.floor(24 * progress(time, 0, 1800))) continue;

      this.dot(this.rimPoint(index, time), phone ? 1.8 : 2.1);
    }

    if (time >= 28250 && time < 42500) {
      this.note('THE SAME RIM POINTS\nOPPOSITE PAIRS MARK LINES', frame.x, h * (phone ? .50 : .79), w * (phone ? .88 : .48), phone ? 9 : 12);
    }
  }

  private disc(time: number): void {
    const { width: w, height: h, pen, tones } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const frame = this.frame(time);
    const leave = 1 - smooth(time, 16000, 18500);

    if (time < 16000) {
      const step = phone ? 8 : 10;
      const fillRadius = frame.radius * smooth(time, 1000, 2600);

      for (let y = -frame.radius; y <= frame.radius; y += step) {
        for (let x = -frame.radius; x <= frame.radius; x += step) {
          if (x * x + y * y <= fillRadius * fillRadius) this.dot({ x: frame.x + x, y: frame.y + y }, .55);
        }
      }
    }

    if (time >= 3000 && time < 13000) {
      const angle = (time - 3000) / 2300;
      const offset = .35 + .2 * Math.sin((time - 3000) / 1700);
      const cut = discCut(angle, offset);
      const a = { x: frame.x + frame.radius * cut.chord[0].x, y: frame.y - frame.radius * cut.chord[0].y };
      const b = { x: frame.x + frame.radius * cut.chord[1].x, y: frame.y - frame.radius * cut.chord[1].y };
      drawLine(pen, a.x, a.y, b.x, b.y, tones.ink, 1.7);
      this.text('ONE STRAIGHT CUT AT A TIME', w * .5, h * .045, phone ? 10 : 15);
      this.text('CLOSED PIECES · PICTURE, NOT A PROOF', w * .5, h * .095, phone ? 8.5 : 11);

      if (time >= 7250) {
        const indices = cut.witness.rimIndices;

        if (!indices || cut.witness.margin < 0) throw new Error('The displayed cut needs an antipodal rim pair in its larger closed piece.');

        const p = this.rimPoint(indices[0], time);
        const q = this.rimPoint(indices[1], time);
        drawLine(pen, p.x, p.y, q.x, q.y, tones.ink, 2);
        this.dot(p, 3.5);
        this.dot(q, 3.5);
        this.text('DIAMETER 2', frame.x, h * (phone ? .50 : .79), phone ? 12 : 17, true);
        this.note('A WITNESS FOR THIS CUT\nGENERAL DIAMETER USES A SUPREMUM', w * (phone ? .5 : .75), h * (phone ? .57 : .36), w * (phone ? .88 : .38), phone ? 9 : 12);
      }
    } else if (time < 3000) {
      this.text('ONE DISC', w * .5, h * .045, phone ? 11 : 16);
      this.text('DIAMETER 2', frame.x, h * (phone ? .50 : .79), phone ? 12 : 17, true);
    }

    if (time >= 13000 && time < 18500) {
      const amount = smooth(time, 13000, 14500);

      for (let index = 0; index < 3; index++) {
        const sector = this.model.sectors[index];

        if (!sector) throw new Error('Each sector drawing needs its computed angle and diameter.');

        const a0 = sector.start;
        const a1 = sector.end;
        const countCenter = this.tilePoint(index, 3);
        const fold = smooth(time, 16000, 18500);
        const center = between({ x: frame.x, y: frame.y }, countCenter, fold);
        const radius = mix(frame.radius, Math.min(w * .055, h * .055), fold) * (1 - smooth(time, 18000, 18500));
        const arcEnd = a0 + (a1 - a0) * amount;
        this.sectorPath(center, radius, a0, arcEnd);
        pen.save();
        pen.clip();

        for (let x = -radius * 2; x <= radius * 2; x += 6 + index * 2) {
          drawLine(pen, center.x + x, center.y - radius, center.x + x + radius * (index - 1), center.y + radius, tones.ink, .6);
        }

        pen.restore();
        this.sectorPath(center, radius, a0, arcEnd);
        pen.strokeStyle = tones.ink;
        pen.lineWidth = 1;
        pen.stroke();
      }

      if (time < 16000) {
        this.text(time < 14500 ? 'DIVIDE INTO THREE SECTORS' : 'THREE 120° SECTORS', w * .5, h * .045, phone ? 10 : 15);
        const sector = this.model.sectors[0];

        if (!sector) throw new Error('The sector readout needs its live diameter.');

        if (time >= 14500) this.text(`WIDEST √3 = ${sector.diameter.toFixed(3)} < 2`, frame.x, h * (phone ? .50 : .79), phone ? 13 : 19, true);
      }
    }

    if (time >= 16000) {
      const transition = smooth(time, 22500, 24500);
      const radius = Math.min(w * .055, h * .055);

      for (let index = 0; index < 4; index++) {
        const source = this.tilePoint(Math.min(index, 2), 3);
        const target = this.tilePoint(index, 4);
        const returnToCircle = smooth(time, 28250, 30250);
        const center = between(between(source, target, transition), frame, returnToCircle);
        const size = radius * (index === 3 ? transition : 1) * (1 - leave) * (1 - returnToCircle);

        if (size > 0) {
          pen.strokeStyle = tones.ink;
          pen.lineWidth = 1;
          pen.strokeRect(center.x - size, center.y - size, size * 2, size * 2);
        }
      }

      if (time >= 28250) return;

      this.text('HOW MANY SMALLER PIECES?', w * .5, h * .045, phone ? 10 : 15);
      this.text(transition < .5 ? '2D: 3 PIECES' : '3D: 4 PIECES', w * (phone ? .5 : .28), h * (phone ? .48 : .69), phone ? 12 : 17);
      this.labels.place('d-plus-one', w * (phone ? .5 : .75), h * (phone ? .54 : .40));
      this.note('SCHEMATIC · COUNT ONLY\nTHE BALL IS NOT DRAWN', w * (phone ? .5 : .75), h * (phone ? .64 : .59), w * (phone ? .88 : .38), phone ? 9 : 12);
    }
  }

  private projector(time: number): void {
    const { width: w, height: h, pen, tones } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const frame = this.frame(time);
    const mapping = smooth(time, 45500, 49500);
    const radius = frame.radius / Math.sqrt(2);

    if (time >= 49500) {
      pen.beginPath();
      pen.ellipse(frame.x, frame.y, radius, radius * frame.tilt, 0, 0, Math.PI * 2);
      pen.strokeStyle = tones.ink;
      pen.lineWidth = 1;
      pen.stroke();
    } else {
      for (const sign of time < 45500 ? [1, -1] : [1]) {
        const pair = smooth(time, 42500, 45500);
        pen.beginPath();

        for (let index = 0; index <= 120; index++) {
          const a = Math.PI * index / 120;
          const foldedX = frame.radius * Math.cos(a) * mix(sign, 1, pair);
          const foldedY = frame.radius * Math.sin(a) * mix(sign, 1, pair);
          const x = frame.x + mix(foldedX, radius * Math.cos(2 * a), mapping);
          const y = frame.y - mix(foldedY, radius * Math.sin(2 * a), mapping);

          if (index === 0) pen.moveTo(x, y);
          else pen.lineTo(x, y);
        }

        pen.strokeStyle = tones.ink;
        pen.lineWidth = .7;
        pen.stroke();
      }
    }

    if (time < 53250) {
      this.text('A LINE BECOMES A POINT', w * .5, h * .045, phone ? 10 : 16);
      this.labels.place('projector', frame.x, h * (phone ? .46 : .79));
      this.note(time < 49500 ? 'PAIR OPPOSITES, THEN DOUBLE THE ANGLE\nCOORDINATE CARRY · READ AFTER SETTLING' : 'PLANE: PROJECTOR CIRCLE\nPAPER: LINES IN FOUR DIMENSIONS', w * (phone ? .5 : .75), h * (phone ? .55 : .34), w * (phone ? .88 : .38), phone ? 9 : 13);

      return;
    }

    if (time < 64750) {
      const theta = Math.PI / 2 * smooth(time, 53250, 62500);
      const point = projectorCirclePoint(theta);
      const first = { x: frame.x + radius, y: frame.y };
      const second = { x: frame.x + frame.radius * point.x, y: frame.y - frame.radius * point.y };
      drawLine(pen, first.x, first.y, second.x, second.y, tones.ink, 1.7);
      this.dot(first, 3.2);
      this.dot(second, 3.2);
      const origin = { x: frame.x, y: h * (phone ? .49 : .87) };
      const lineSize = phone ? 24 : 33;

      for (const angle of [0, theta]) {
        drawLine(pen, origin.x - lineSize * Math.cos(angle), origin.y + lineSize * Math.sin(angle), origin.x + lineSize * Math.cos(angle), origin.y - lineSize * Math.sin(angle), tones.ink, 1.2);
      }

      this.text(`LINES: ${(theta * 180 / Math.PI).toFixed(0)}°`, origin.x, origin.y + lineSize + 14, phone ? 10 : 12, true);
      this.text('FROBENIUS DISTANCE', w * .5, h * .045, phone ? 10 : 16);
      this.text('ANGLE DOUBLED ON THE CIRCLE', frame.x, h * (phone ? .39 : .75), phone ? 8.5 : 11);
    } else if (time < 72250) {
      this.text('A SLICE OF THE PROJECTOR SET', frame.x, h * (phone ? .045 : .09), phone ? 9 : 13);
      this.note(phone ? 'PLANAR LINES GIVE THIS CIRCLE\nFOUR-DIMENSIONAL AXES BELOW' : 'PLANAR LINES GIVE THIS CIRCLE\nFOUR-DIMENSIONAL AXES AT RIGHT', frame.x, h * (phone ? .395 : .79), w * (phone ? .90 : .48), phone ? 9 : 11);
    } else {
      const amount = smooth(time, 72250, 74250);
      const dx = radius * 1.2;
      const dy = radius * .85;
      pen.save();
      pen.strokeStyle = tones.muted;
      pen.lineWidth = .6;
      pen.setLineDash([3, 3]);
      pen.beginPath();
      pen.moveTo(frame.x - dx, frame.y - dy * amount);
      pen.lineTo(frame.x + dx, frame.y - dy * .6 * amount);
      pen.lineTo(frame.x + dx, frame.y + dy * amount);
      pen.lineTo(frame.x - dx, frame.y + dy * .6 * amount);
      pen.closePath();
      pen.stroke();
      pen.restore();
      this.text('PLANAR SLICE', frame.x, frame.y + radius + (phone ? 9 : 15), phone ? 9 : 12);
    }
  }
}

export function createProjectorLinesFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new ProjectorLinesFilm(root, context);
}

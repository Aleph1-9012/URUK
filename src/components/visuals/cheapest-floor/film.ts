import { mix, smooth } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { type Box, type Colors, line, text } from './drawing';
import { latticeEnergy, latticePoints, nearPairs, relaxAtStep, torusDelta, type FloorModel, type LatticeKind, type Point } from './math';
import { contactTargets, drawCharts } from './panels';
import { CONTACT_ARRIVALS, layout, relaxationStepAt } from './story';

type Camera = { x: number; y: number; scale: number };

type ShellPoint = { index: number; shell: number; dx: number; dy: number };

function cameraFor(box: Box, model: FloorModel): Camera {
  const scale = Math.min((box.w - 18) / model.torus.w, (box.h - 51) / model.torus.h);

  return { x: box.x + box.w / 2 - model.torus.w * scale / 2, y: box.y + 24, scale };
}

function screen(point: Point, camera: Camera): Point {
  return { x: camera.x + camera.scale * point.x, y: camera.y + camera.scale * point.y };
}

function dot(pen: CanvasRenderingContext2D, point: Point, radius: number, filled = true): void {
  pen.beginPath();
  pen.arc(point.x, point.y, radius, 0, 2 * Math.PI);

  if (filled) pen.fill();

  pen.stroke();
}

function assignReference(model: FloorModel): Point[] {
  const from = model.frames.at(-1);

  if (!from) throw new Error('The relaxation has a final frame.');

  const available = new Set(model.reference.keys());

  return from.map(point => {
    let target = -1;
    let distance = Infinity;

    for (const index of available) {
      const candidate = model.reference[index];

      if (!candidate) throw new Error('An available reference point exists.');

      const squared = torusDelta(candidate.x - point.x, model.torus.w) ** 2 + torusDelta(candidate.y - point.y, model.torus.h) ** 2;

      if (squared < distance) {
        distance = squared;
        target = index;
      }
    }

    const next = model.reference[target];

    if (!next) throw new Error('Every carried point has one unused lattice target.');

    available.delete(target);

    return next;
  });
}

export class CheapestFloorFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  private readonly reference: Point[];
  private readonly centre: number;
  private readonly shellPoints: ShellPoint[] = [];
  private readonly comparisons = (['triangular', 'square', 'honeycomb'] as const).map(kind => ({ kind, points: latticePoints(kind, 3), energy: latticeEnergy(kind) }));

  constructor(private readonly root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D, private readonly model: FloorModel) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 4 });
    this.reference = assignReference(model);
    let nearest = Infinity;
    let centre = 0;

    for (const [index, point] of this.reference.entries()) {
      const distance = (point.x - model.torus.w / 2) ** 2 + (point.y - model.torus.h / 2) ** 2;

      if (distance < nearest) {
        nearest = distance;
        centre = index;
      }
    }

    this.centre = centre;
    const origin = this.reference[centre];

    if (!origin) throw new Error('The ideal reference has a central point.');

    for (const [index, point] of this.reference.entries()) {
      const dx = torusDelta(point.x - origin.x, model.torus.w);
      const dy = torusDelta(point.y - origin.y, model.torus.h);
      const distance = Math.hypot(dx, dy);
      const shell = model.shells.slice(0, 3).findIndex(row => Math.abs(distance - row.radius) < 1e-6);

      if (shell >= 0) this.shellPoints.push({ index, shell, dx, dy });
    }

    if (this.shellPoints.length !== 18) throw new Error('The three ideal contact shells each contain six points.');
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
    this.labels.beginFrame();
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, this.width, this.height);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.patch(boxes.stage, time, boxes.tall);
    drawCharts(pen, boxes.panel, time, colors, this.labels.place, model, boxes.tall);

    if (time >= 70800 && time < 75000) this.contacts(boxes.stage, boxes.panel, time, boxes.tall);

    this.labels.endFrame();
  }

  private patch(box: Box, time: number, tall: boolean): void {
    const { pen, model, colors } = this;
    const compare = smooth(time, 25250, 26100) * (1 - smooth(time, 32250, 33100));
    const competitors = smooth(time, 32250, 33100) * (1 - smooth(time, 40250, 41100));
    const reserve = Math.max(compare, competitors);
    const frame = { x: box.x, y: box.y, w: box.w, h: box.h * mix(1, .68, reserve) };
    const camera = cameraFor(frame, model);
    const step = relaxationStepAt(time);
    const from = relaxAtStep(model, step);
    const ideal = smooth(time, 69750, 70600) * (1 - smooth(time, 85000, 86000));
    const points = from.map((point, index) => {
      const target = this.reference[index];

      if (!target) throw new Error('A carried point retains its reference target.');

      const x = point.x + ideal * torusDelta(target.x - point.x, model.torus.w);
      const y = point.y + ideal * torusDelta(target.y - point.y, model.torus.h);

      return { x: (x + model.torus.w) % model.torus.w, y: (y + model.torus.h) % model.torus.h };
    });
    const patchWidth = model.torus.w * camera.scale;
    const patchHeight = model.torus.h * camera.scale;
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .7;
    pen.strokeRect(camera.x, camera.y, patchWidth, patchHeight);
    pen.save();
    pen.beginPath();
    pen.rect(camera.x, camera.y, patchWidth, patchHeight);
    pen.clip();
    const pairs = time >= 2800 ? nearPairs(points, model.torus) : [];

    for (let band = 0; band < 4; band++) {
      pen.beginPath();
      pen.strokeStyle = colors.ink;
      pen.lineWidth = .25 + band * .25;
      pen.globalAlpha = .12 + band * .12;

      for (const pair of pairs) {
        if (tall && pair.weight < .005) continue;
        if (Math.min(3, Math.floor(pair.weight * 4)) !== band) continue;

        const first = points[pair.a];

        if (!first) throw new Error('A near pair has a first point.');

        for (const ox of [-model.torus.w, 0, model.torus.w]) {
          for (const oy of [-model.torus.h, 0, model.torus.h]) {
            const a = screen({ x: first.x + ox, y: first.y + oy }, camera);
            pen.moveTo(a.x, a.y);
            pen.lineTo(a.x + pair.dx * camera.scale, a.y + pair.dy * camera.scale);
          }
        }
      }

      pen.stroke();
    }

    pen.globalAlpha = 1;
    pen.fillStyle = colors.ink;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .6;
    const radius = tall ? 1.65 : 2.55;
    pen.beginPath();

    for (const [index, point] of points.entries()) {
      const target = screen(point, camera);
      const fall = smooth(time, index * 17, 800 + index * 17);
      const y = target.y - (1 - fall) * patchHeight;
      pen.moveTo(target.x + radius, y);
      pen.arc(target.x, y, radius, 0, 2 * Math.PI);
    }

    pen.fill();
    pen.restore();

    const title = time < 2800 ? '120 POINTS ARRIVING · WRAPPED PATCH' : ideal === 1 ? 'IDEAL LATTICE REFERENCE · EXACT DISTANCES' : ideal > 0 ? time < 85000 ? 'TO THE IDEAL REFERENCE · TRANSITION' : 'RETURNING TO THE SETTLED RUN' : '120 POINTS · THE PATCH WRAPS ROUND';
    text(pen, title, box.x + box.w / 2, box.y + 9, tall ? 9 : 13, box.w - 4, colors);
    const bottom = camera.y + patchHeight + 15;

    if (time >= 2800 && time < 9000) text(pen, `ENERGY PER POINT ${model.initialEnergy.toFixed(3)}`, box.x + box.w / 2, bottom, tall ? 10 : 15, box.w - 4, colors);
    else if (time >= 9000 && time < 24000) text(pen, `STEP ${Math.round(step)} · MOTION BETWEEN STORED STATES`, box.x + box.w / 2, bottom, tall ? 8.5 : 12, box.w - 4, colors);
    else if (ideal > 0) {
      text(pen, ideal === 1 ? 'THREE SHELLS · SIX POINTS EACH' : 'CARRIED POINTS · CHANGING REFERENCE', box.x + box.w / 2, bottom, tall ? 9 : 13, box.w - 4, colors);
    } else if (time >= 24000 && reserve < .1) {
      const excess = ((model.finalEnergy / model.floor - 1) * 100).toFixed(1);
      const tag = `SETTLED ${model.finalEnergy.toFixed(5)} · FLOOR ${model.floor.toFixed(5)}\nTURNED 30° · SQUEEZED ±4%${tall ? '' : ' TO FIT'} · ${excess}% ABOVE`;
      text(pen, tag, box.x + box.w / 2, bottom, tall ? 8.5 : 12, box.w - 4, colors);
    }

    if (compare > 0) this.regularPatches(box, compare, tall);
    if (competitors > 0) this.irregularPatches(box, competitors, tall);
  }

  private regularPatches(box: Box, amount: number, tall: boolean): void {
    const { pen, colors } = this;
    const width = box.w / 3;
    const y = box.y + box.h * mix(.35, .76, amount);
    const radius = Math.min(width * .42, box.h * .10) * mix(.15, 1, amount);

    for (const [index, patch] of this.comparisons.entries()) {
      const x = mix(box.x + box.w / 2, box.x + width * (index + .5), amount);
      this.latticeIcon(patch.kind, patch.points, { x, y }, radius, tall);
      const name = patch.kind === 'honeycomb' ? 'HONEYCOMB' : patch.kind.toUpperCase();
      if (amount === 1) {
        text(pen, name, x, y + radius + 9, tall ? 7.5 : 11, width - 5, colors);
        text(pen, patch.energy.toFixed(5), x, y + radius + (tall ? 21 : 27), tall ? 9 : 13, width - 5, colors);
      }
    }
  }

  private latticeIcon(kind: LatticeKind, points: Point[], centre: Point, radius: number, tall: boolean): void {
    const { pen, colors } = this;
    const scale = radius / 2.2;
    pen.fillStyle = colors.ink;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .5;
    pen.beginPath();

    for (const point of points) {
      if (Math.abs(point.x) > 2.2 || Math.abs(point.y) > 1.7) continue;

      const r = tall ? 1.25 : 1.8;
      const x = centre.x + point.x * scale;
      const y = centre.y + point.y * scale;
      pen.moveTo(x + r, y);
      pen.arc(x, y, r, 0, Math.PI * 2);
    }

    pen.fill();
    const nearest = kind === 'square' ? 1 : kind === 'triangular' ? Math.sqrt(2 / Math.sqrt(3)) : Math.sqrt(4 / Math.sqrt(3)) / Math.sqrt(3);
    pen.beginPath();
    pen.arc(centre.x, centre.y, nearest * scale, 0, 2 * Math.PI);
    pen.stroke();
    dot(pen, centre, tall ? 2.4 : 3.2);
  }

  private irregularPatches(box: Box, amount: number, tall: boolean): void {
    const { pen, colors } = this;
    const width = box.w / 3;
    const y = box.y + box.h * mix(.35, .76, amount);
    const radius = Math.min(width * .4, box.h * .10);

    for (let kind = 0; kind < 3; kind++) {
      const x = box.x + width * (kind + .5);
      pen.strokeStyle = colors.muted;
      pen.lineWidth = .6;
      pen.strokeRect(x - radius, y - radius * .7, radius * 2, radius * 1.4);
      pen.fillStyle = colors.ink;
      pen.beginPath();

      for (let index = 0; index < 18; index++) {
        const u = ((index * .61803398875) % 1 - .5) * radius * 1.8;
        const v = kind === 0 ? Math.sin(index * 1.31) * radius * .5 : kind === 1 ? Math.sin(u / radius * 4) * radius * .42 + (index % 2) * 2 : (((index * .41421356237) % 1) - .5) * radius * 1.2;
        const px = kind === 0 ? Math.floor(index / 2) / 8 * radius * 1.6 - radius * .8 + index % 2 * 2 : u;
        pen.moveTo(x + px + 1.2, y + v);
        pen.arc(x + px, y + v, tall ? 1.1 : 1.7, 0, Math.PI * 2);
      }

      pen.fill();
      if (amount === 1) text(pen, 'ENERGY ?', x, y + radius + 9, tall ? 8 : 12, width - 5, colors);
    }

    text(pen, 'SCHEMATIC COMPETITORS', box.x + box.w / 2, box.y + box.h - 1, tall ? 8 : 11, box.w - 5, colors);
  }

  private contacts(stage: Box, panel: Box, time: number, tall: boolean): void {
    const { pen, colors, model } = this;
    const camera = cameraFor(stage, model);
    const centre = this.reference[this.centre];

    if (!centre) throw new Error('The reference has a central point.');

    const origin = screen(centre, camera);
    const targets = contactTargets(panel, model, tall);
    pen.strokeStyle = colors.ink;
    pen.fillStyle = colors.ink;
    pen.lineWidth = .8;
    dot(pen, origin, tall ? 3.5 : 5, false);

    for (const point of this.shellPoints) {
      const destination = targets[point.shell];

      if (!destination) throw new Error('A contact shell has a chart destination.');

      const start = screen({ x: centre.x + point.dx, y: centre.y + point.dy }, camera);
      const arrival = CONTACT_ARRIVALS[point.shell];

      if (arrival === undefined) throw new Error('A contact shell has an arrival time.');

      const amount = smooth(time, arrival - 1200, arrival);

      if (amount < 1) line(pen, origin.x, origin.y, start.x, start.y, 1 - amount);

      dot(pen, { x: mix(start.x, destination.x, amount), y: mix(start.y, destination.y, amount) }, tall ? 2.3 : 3.2);
    }
  }
}

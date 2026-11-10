import { mix, smooth } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { type Box, type Colors, type LaneGrid, type Point, dependencyRoute, graphLayout, jobPoint, laneGrid, line, slotPoint, text } from './drawing';
import { type JobSlot, type Schedule, type SchedulingModel } from './math';
import { claimProgress, comparisonProgress, dependencyProgress, gridProgress, jobProgress, labelProgress, laneCount, layout, optimumProgress, readyLift, returnProgress, schedulePhase, threeLaneProgress, twoLaneProgress } from './story';
import { drawPanels } from './panels';

type Actor = { job: number; point: Point; size: number; moving: boolean; reveal: number };

function slotFor(schedule: Schedule, job: number): JobSlot {
  const slot = schedule.jobSlots.find(item => item.job === job);

  if (!slot) throw new Error('Every complete alternative assigns each job exactly once.');

  return slot;
}

function placement(schedule: Schedule, slot: JobSlot, amount: number): number {
  const jobs = schedule.slots[slot.hour];

  if (!jobs) throw new Error('A planned job belongs to its actual hour.');

  const start = slot.hour + slot.lane / jobs.length;
  const end = slot.hour + (slot.lane + 1) / jobs.length;

  return smooth(amount * schedule.makespan, start, end);
}

function mixGrid(first: LaneGrid, second: LaneGrid, amount: number): LaneGrid {
  return { x: mix(first.x, second.x, amount), y: mix(first.y, second.y, amount), w: mix(first.w, second.w, amount), h: mix(first.h, second.h, amount), hours: first.hours, lanes: mix(first.lanes, second.lanes, amount), cellW: mix(first.cellW, second.cellW, amount), cellH: mix(first.cellH, second.cellH, amount) };
}

export class ThreeLanesFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };

  constructor(private readonly root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D, private readonly model: SchedulingModel) {
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
    const phase = schedulePhase(time);
    const geometry = graphLayout(boxes.stage, boxes.tall);
    const single = laneGrid(boxes.panel, boxes.tall, 'single', laneCount(time));
    const rule = mixGrid(laneGrid(boxes.panel, boxes.tall, 'single'), laneGrid(boxes.panel, boxes.tall, 'rule'), comparisonProgress(time));
    const best = laneGrid(boxes.panel, boxes.tall, 'best');
    const readiness = this.readiness(time);
    this.labels.beginFrame();
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, this.width, this.height);
    pen.lineJoin = 'round';
    pen.lineCap = 'round';
    pen.setLineDash([]);
    this.dependencies(boxes.stage, time, boxes.tall, readiness.jobs, readiness.hour);

    if (time >= 8250 && phase !== 'comparison') {
      const finish = phase === 'two' && twoLaneProgress(time) === 1 ? this.model.cg2.makespan : phase === 'three' && threeLaneProgress(time) === 1 ? this.model.cg3.makespan : null;
      this.grid(single, gridProgress(time), boxes.tall, 'HOURS', finish, phase === 'two' ? this.model.cg2 : this.model.cg3);
    }

    if (phase === 'comparison') {
      this.grid(rule, 1, boxes.tall, `THE RULE · ${this.model.cg3.makespan} HOURS`, this.model.cg3.makespan, this.model.cg3);
      this.recorded(this.model.cg3, rule, time, boxes.tall);
      this.grid(best, comparisonProgress(time), boxes.tall, `THE BEST · ${this.model.opt3.makespan} HOURS`, optimumProgress(time) === 1 ? this.model.opt3.makespan : null, this.model.opt3, optimumProgress(time) === 1);
    }

    const actors: Actor[] = [];
    const moving: Actor[] = [];

    for (let job = 0; job < this.model.n; job++) {
      const point = this.model.positions[job];

      if (!point) throw new Error('Every job has its shared dependency position.');

      const home = jobPoint(point, geometry);
      let actor: Actor = { job, point: home, size: geometry.tile, moving: false, reveal: Math.max(0, Math.min(1, jobProgress(time) * this.model.n - job)) };

      if (phase === 'empty') {
        const lift = readyLift(time) * (1 - smooth(time, 13250, 14500));
        actor.point = { x: home.x, y: home.y - (readiness.jobs.has(job) ? lift * (boxes.tall ? 5 : 8) : 0) };
      } else if (phase === 'two') {
        actor = this.placed(job, home, geometry.tile, this.model.cg2, laneGrid(boxes.panel, boxes.tall, 'single', 2), twoLaneProgress(time));
      } else if (phase === 'return') {
        const slot = slotFor(this.model.cg2, job);
        const index = this.model.cg2.jobSlots.indexOf(slot);

        if (index < 0) throw new Error('A returning card retains its schedule identity.');

        const amount = smooth(returnProgress(time) * this.model.n, this.model.n - 1 - index, this.model.n - index);
        const from = laneGrid(boxes.panel, boxes.tall, 'single', 2);
        const start = slotPoint(from, slot.hour, slot.lane);
        actor = { job, point: { x: mix(start.x, home.x, amount), y: mix(start.y, home.y, amount) }, size: mix(this.slotSize(from, geometry.tile), geometry.tile, amount), moving: amount > 0 && amount < 1, reveal: 1 };
      } else if (phase === 'three') {
        actor = this.placed(job, home, geometry.tile, this.model.cg3, laneGrid(boxes.panel, boxes.tall, 'single'), threeLaneProgress(time));
      } else {
        const old = slotFor(this.model.cg3, job);
        actor = this.placed(job, slotPoint(rule, old.hour, old.lane), this.slotSize(rule, geometry.tile), this.model.opt3, best, optimumProgress(time));
      }

      if (actor.moving) moving.push(actor);
      else actors.push(actor);
    }

    const visibleLabels = Math.floor(labelProgress(time) * this.model.n);
    drawPanels(pen, boxes.panel, time, colors, this.labels.place, this.model, boxes.tall);

    for (const actor of [...actors, ...moving]) {
      const label = this.model.labels[actor.job];

      if (label === undefined) throw new Error('Each job has its computed Coffman–Graham priority.');

      this.card(actor, label <= visibleLabels ? label : null, false, readiness.jobs.has(actor.job) && phase !== 'comparison', boxes.tall);
    }

    if (phase === 'comparison') this.bracket(best, time, boxes.tall);

    this.labels.endFrame();
  }

  private slotSize(grid: LaneGrid, maximum: number): number {
    return Math.min(maximum, grid.cellW - 6, grid.cellH - 4);
  }

  private placed(job: number, home: Point, size: number, schedule: Schedule, grid: LaneGrid, amount: number): Actor {
    const slot = slotFor(schedule, job);
    const portion = placement(schedule, slot, amount);
    const target = slotPoint(grid, slot.hour, slot.lane);

    return { job, point: { x: mix(home.x, target.x, portion), y: mix(home.y, target.y, portion) }, size: mix(size, this.slotSize(grid, size), portion), moving: portion > 0 && portion < 1, reveal: 1 };
  }

  private readiness(time: number): { jobs: Set<number>; hour: number | null } {
    let schedule: Schedule | null = null;
    let amount = 0;
    const phase = schedulePhase(time);

    if (phase === 'empty' && time >= 8250) schedule = this.model.cg2;
    if (phase === 'two' && twoLaneProgress(time) < 1) { schedule = this.model.cg2; amount = twoLaneProgress(time); }
    if (phase === 'three' && threeLaneProgress(time) < 1) { schedule = this.model.cg3; amount = threeLaneProgress(time); }
    if (phase === 'comparison' && time >= 41500 && optimumProgress(time) < 1) { schedule = this.model.opt3; amount = optimumProgress(time); }

    if (!schedule) return { jobs: new Set(), hour: null };

    const hour = schedule.hours[Math.min(schedule.makespan - 1, Math.floor(amount * schedule.makespan))];

    if (!hour) throw new Error('The plan-placement clock names its actual ready-at-start hour.');

    return { jobs: new Set(hour.ready), hour: hour.hour + 1 };
  }

  private dependencies(box: Box, time: number, tall: boolean, ready: Set<number>, hour: number | null): void {
    const { model, pen, colors } = this;
    const geometry = graphLayout(box, tall);
    const visible = dependencyProgress(time) * model.arcs.length;
    let skipped = 0;
    text(pen, 'DEPENDENCIES', box.x + box.w / 2, box.y + 8, tall ? 11 : 16, box.w - 4, colors);

    for (const [index, [a, b]] of model.arcs.entries()) {
      const first = model.positions[a];
      const second = model.positions[b];

      if (!first || !second) throw new Error('A dependency connects two real jobs.');

      const fromLayer = model.layers.findIndex(layer => layer.includes(a));
      const toLayer = model.layers.findIndex(layer => layer.includes(b));

      if (fromLayer < 0 || toLayer < 0) throw new Error('Both dependency endpoints belong to longest-path layers.');

      const skip = toLayer - fromLayer > 1;
      const route = dependencyRoute(jobPoint(first, geometry), jobPoint(second, geometry), geometry, skip, skip ? skipped++ : 0);
      pen.strokeStyle = colors.ink;
      pen.fillStyle = colors.ink;
      pen.lineWidth = tall ? .65 : 1;
      this.path(route, Math.max(0, Math.min(1, visible - index)), tall ? 3.5 : 5);
    }

    const shown = jobProgress(time) * model.n;
    const labels = Math.floor(labelProgress(time) * model.n);

    for (const [job, point] of model.positions.entries()) {
      if (shown < job + 1) continue;

      const label = model.labels[job];

      if (label === undefined) throw new Error('Each dependency reference has its rule priority.');

      this.card({ job, point: jobPoint(point, geometry), size: geometry.tile, moving: false, reveal: 1 }, label <= labels ? label : null, true, ready.has(job), tall);
    }

    const caption = hour === null ? time < 13250 ? 'EACH JOB: 1 HOUR · AN ARROW: WAIT' : 'BIG: JOB ID · SMALL: RULE PRIORITY' : `READY AT START OF HOUR ${hour}`;
    text(pen, caption, box.x + box.w / 2, box.y + box.h - 8, tall ? 8.5 : 12, box.w - 4, colors);
  }

  private path(points: readonly Point[], shown: number, head = 0): void {
    if (shown <= 0) return;

    const first = points[0];

    if (!first) throw new Error('An ink route starts at its first point.');

    let total = 0;

    for (let index = 1; index < points.length; index++) {
      const a = points[index - 1];
      const b = points[index];

      if (!a || !b) throw new Error('Every ink segment has both endpoints.');

      total += Math.hypot(b.x - a.x, b.y - a.y);
    }

    let remaining = total * shown;
    let tip = first;
    let angle = 0;
    this.pen.beginPath();
    this.pen.moveTo(first.x, first.y);

    for (let index = 1; index < points.length && remaining > 0; index++) {
      const a = points[index - 1];
      const b = points[index];

      if (!a || !b) throw new Error('The revealed segment has both endpoints.');

      const length = Math.hypot(b.x - a.x, b.y - a.y);

      if (length === 0) continue;

      const portion = Math.min(1, remaining / length);
      tip = { x: mix(a.x, b.x, portion), y: mix(a.y, b.y, portion) };
      angle = Math.atan2(b.y - a.y, b.x - a.x);
      this.pen.lineTo(tip.x, tip.y);
      remaining -= length;
    }

    this.pen.stroke();

    if (head <= 0) return;

    this.pen.beginPath();
    this.pen.moveTo(tip.x, tip.y);
    this.pen.lineTo(tip.x - Math.cos(angle) * head - Math.sin(angle) * head * .55, tip.y - Math.sin(angle) * head + Math.cos(angle) * head * .55);
    this.pen.lineTo(tip.x - Math.cos(angle) * head + Math.sin(angle) * head * .55, tip.y - Math.sin(angle) * head - Math.cos(angle) * head * .55);
    this.pen.closePath();
    this.pen.fill();
  }

  private card(actor: Actor, label: number | null, reference: boolean, ready: boolean, tall: boolean): void {
    if (actor.reveal <= 0) return;

    const { pen, colors } = this;
    const half = actor.size / 2;
    const { x, y } = actor.point;
    pen.fillStyle = colors.paper;
    pen.fillRect(x - half, y - half, actor.size, actor.size);
    pen.strokeStyle = reference && !ready ? colors.muted : colors.ink;
    pen.fillStyle = pen.strokeStyle;
    pen.lineWidth = ready ? tall ? 1.8 : 2.2 : reference ? .6 : 1.2;
    this.path([{ x: x - half, y: y - half }, { x: x + half, y: y - half }, { x: x + half, y: y + half }, { x: x - half, y: y + half }, { x: x - half, y: y - half }], actor.reveal);

    if (actor.reveal < 1) return;

    pen.font = `${Math.max(tall ? 11 : 13, actor.size * .43)}px "Garamond Math", serif`;
    pen.textAlign = 'center';
    pen.textBaseline = 'middle';
    pen.fillText(`${actor.job + 1}`, x - (label === null ? 0 : actor.size * .08), y + (label === null ? 0 : actor.size * .12));

    if (label !== null) {
      pen.font = `${Math.max(tall ? 7.5 : 8.5, actor.size * .25)}px "Garamond Math", serif`;
      pen.fillText(`${label}`, x + actor.size * .27, y - actor.size * .27);
    }
  }

  private grid(grid: LaneGrid, shown: number, tall: boolean, title: string, finish: number | null, schedule: Schedule, headings = true): void {
    if (shown <= 0) return;

    const { pen, colors } = this;
    const width = grid.w * shown;
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .45;
    pen.save();
    pen.beginPath();
    pen.rect(grid.x - 1, grid.y - 1, width + 2, grid.h + 2);
    pen.clip();

    for (let hour = 0; hour < grid.hours; hour++) {
      const later = finish !== null && hour >= finish;
      pen.globalAlpha = later ? .22 : .65;
      pen.setLineDash(later ? [2, 3] : []);

      for (let lane = 0; lane < grid.lanes; lane++) {
        const x = grid.x + hour * grid.cellW;
        const y = grid.y + lane * grid.cellH;
        const height = Math.min(grid.cellH, grid.h - lane * grid.cellH);
        pen.strokeRect(x, y, grid.cellW, height);

        if (finish !== null && !later && schedule.slots[hour]?.[lane] === undefined && height === grid.cellH) {
          const point = slotPoint(grid, hour, lane);
          line(pen, point.x - 3, point.y, point.x + 3, point.y);
        }
      }
    }

    pen.restore();

    if (shown !== 1) return;

    if (headings) {
      text(pen, title, grid.x + grid.w / 2, grid.y - (tall ? 25 : 29), tall ? 9.5 : 13, grid.w, colors);

      for (let hour = 0; hour < grid.hours; hour++) text(pen, `${hour + 1}`, grid.x + (hour + .5) * grid.cellW, grid.y - (tall ? 10 : 12), tall ? 9 : 12, grid.cellW, colors);
    }

    for (let lane = 0; lane + .5 < grid.lanes; lane++) text(pen, `${lane + 1}`, grid.x - (tall ? 12 : 16), grid.y + (lane + .5) * grid.cellH, tall ? 9 : 12, 20, colors);

    if (finish !== null) {
      const x = grid.x + finish * grid.cellW;
      pen.strokeStyle = colors.ink;
      pen.lineWidth = 1.3;
      line(pen, x, grid.y - 3, x, grid.y + grid.h + 3);
    }
  }

  private recorded(schedule: Schedule, grid: LaneGrid, time: number, tall: boolean): void {
    for (const slot of schedule.jobSlots) {
      const label = this.model.labels[slot.job];

      if (label === undefined) throw new Error("The retained rule keeps each job's actual priority.");

      this.card({ job: slot.job, point: slotPoint(grid, slot.hour, slot.lane), size: this.slotSize(grid, graphLayout(layout(this.width, this.height, time).stage, tall).tile), moving: false, reveal: 1 }, label, true, false, tall);
    }
  }

  private bracket(grid: LaneGrid, time: number, tall: boolean): void {
    const amount = claimProgress(time);

    if (amount <= 0) return;

    const { pen, colors } = this;
    const left = grid.x - 5;
    const right = grid.x + this.model.opt3.makespan * grid.cellW + 5;
    const top = grid.y - 5;
    const bottom = grid.y + grid.h + 5;
    pen.strokeStyle = colors.blue;
    pen.lineWidth = tall ? 1.8 : 2.5;
    this.path([{ x: left + 7, y: top }, { x: left, y: top }, { x: left, y: bottom }, { x: left + 7, y: bottom }], amount);
    this.path([{ x: right - 7, y: top }, { x: right, y: top }, { x: right, y: bottom }, { x: right - 7, y: bottom }], amount);
  }
}

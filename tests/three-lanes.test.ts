import { expect, test } from 'bun:test';
import reference from './fixtures/three-lanes.json';
import { coffmanGraham, createSchedulingModel, readyJobs, scheduleValid, transitiveReduction, type Arc, type Schedule } from '../src/components/visuals/three-lanes/math';
import { dependencyRoute, graphLayout, jobPoint, type Point } from '../src/components/visuals/three-lanes/drawing';
import { layout } from '../src/components/visuals/three-lanes/story';

const model = createSchedulingModel();

function inspectSchedule(schedule: Schedule): void {
  const byJob = Array<number>(model.n).fill(-1);
  const completed = new Set<number>();

  for (const [hour, jobs] of schedule.slots.entries()) {
    const exact = schedule.hours[hour];

    if (!exact) throw new Error('Each displayed hour has its computed readiness record.');

    expect(jobs.length).toBeLessThanOrEqual(schedule.lanes);
    const ready: number[] = [];

    for (let job = 0; job < model.n; job++) {
      if (completed.has(job)) continue;

      let satisfied = true;

      for (const [a, b] of model.arcs) {
        if (b === job && !completed.has(a)) satisfied = false;
      }

      if (satisfied) ready.push(job);
    }

    expect(exact.ready).toEqual(ready);
    const before = [...completed].reduce((mask, job) => mask | (1 << job), 0);
    expect(exact.completedBefore).toBe(before);
    expect(readyJobs(model.predecessorMasks, before)).toEqual(ready);

    for (const job of jobs) {
      expect(ready.includes(job)).toBe(true);
      expect(completed.has(job)).toBe(false);
      byJob[job] = hour;
    }

    for (const job of jobs) completed.add(job);

    expect(exact.completedAfter).toBe([...completed].reduce((mask, job) => mask | (1 << job), 0));
  }

  expect(completed.size).toBe(model.n);
  expect(schedule.jobSlots.length).toBe(model.n);

  for (const entry of schedule.jobSlots) {
    expect(schedule.slots[entry.hour]?.[entry.lane]).toBe(entry.job);
  }

  for (const [a, b] of model.arcs) {
    const first = byJob[a];
    const second = byJob[b];

    if (first === undefined || second === undefined) throw new Error('Every dependency has two scheduled jobs.');

    expect(first).toBeLessThan(second);
  }
}

test('124: cover-relation labels and each priority schedule match independent references and true hour-boundary readiness', () => {
  expect(model.labels).toEqual(reference.label);
  expect(model.coverArcs).toEqual(model.arcs);

  // Remove each edge and search independently for an alternate path.
  for (const edge of model.arcs) {
    const seen = new Set([edge[0]]);
    const stack = [edge[0]];

    while (stack.length) {
      const job = stack.pop();

      if (job === undefined) throw new Error('An independent search stack entry exists.');

      for (const arc of model.arcs) {
        if (arc === edge || arc[0] !== job || seen.has(arc[1])) continue;

        seen.add(arc[1]);
        stack.push(arc[1]);
      }
    }

    expect(seen.has(edge[1])).toBe(false);
  }

  const redundant: Arc[] = [...model.arcs, [0, 6], [2, 8]];
  expect(transitiveReduction(model.n, redundant)).toEqual(model.arcs);
  expect(coffmanGraham(model.n, redundant).labels).toEqual(model.labels);
  expect(model.cg2.slots).toEqual(reference.cg2);
  expect(model.cg3.slots).toEqual(reference.cg3);

  for (const schedule of [model.cg2, model.cg3, model.opt2, model.opt3]) {
    inspectSchedule(schedule);
    expect(scheduleValid(model.n, model.arcs, schedule.slots, schedule.lanes)).toBe(true);
  }

  for (const schedule of [model.cg2, model.cg3]) {
    for (const hour of schedule.hours) expect(hour.jobs).toEqual(hour.priorityReady.slice(0, schedule.lanes));
  }

  expect(scheduleValid(model.n, model.arcs, [[0, 5, 1], [2, 3, 4], [6, 7, 8]], 3)).toBe(false);
  expect(scheduleValid(model.n, model.arcs, [[0, 1, 2, 3], [4, 5, 7], [6, 8]], 3)).toBe(false);
  const labelled = new Set<number>();

  for (const step of model.labelSteps) {
    const expectedEligible: number[] = [];

    for (let job = 0; job < model.n; job++) {
      const successors = model.successors[job];

      if (!successors) throw new Error('Every labelled job has its successor list.');

      if (!labelled.has(job) && successors.every(next => labelled.has(next))) expectedEligible.push(job);
    }

    expect(step.candidates.map(candidate => candidate.job).sort((a, b) => a - b)).toEqual(expectedEligible);
    expect(step.candidates[0]?.job).toBe(step.job);
    expect(model.labels[step.job]).toBe(step.label);
    labelled.add(step.job);
  }
});

function assignmentCount(lanes: number, deadline: number): number {
  // Exhaust every job-to-hour function, independently of finished-set search or
  // predecessor-first recursive pruning. Machine names do not distinguish plans.
  const hours = Array<number>(model.n).fill(0);
  const load = Array<number>(deadline).fill(0);
  let legal = 0;

  for (let code = 0; code < deadline ** model.n; code++) {
    load.fill(0);
    let quotient = code;
    let capacity = true;

    for (let job = 0; job < model.n; job++) {
      const hour = quotient % deadline;
      quotient = Math.floor(quotient / deadline);
      hours[job] = hour;
      const current = load[hour];

      if (current === undefined) throw new Error('An assigned hour has a capacity counter.');

      load[hour] = current + 1;

      if (current >= lanes) {
        capacity = false;

        break;
      }
    }

    if (!capacity) continue;

    let precedence = true;

    for (const [a, b] of model.arcs) {
      const before = hours[a];
      const after = hours[b];

      if (before === undefined || after === undefined) throw new Error('Each independent time assignment gives every job an hour.');

      if (before >= after) {
        precedence = false;

        break;
      }
    }

    if (precedence) legal++;
  }

  return legal;
}

test('124: independent job-to-hour enumeration proves both exact optima and checks every reachable finished-set ideal', () => {
  for (const oracle of reference.deadline_counts) expect(assignmentCount(oracle.lanes, oracle.deadline)).toBe(oracle.count);

  expect(model.opt2.slots).toEqual(reference.opt2_slots);
  expect(model.opt3.slots).toEqual(reference.opt3);
  expect(model.optimum2).toBe(reference.opt2);
  expect(model.optimum3).toBe(reference.opt3.length);

  for (const search of [model.search.two, model.search.three]) {
    const ideals: number[] = [];

    for (const [mask, distance] of search.distance.entries()) {
      if (distance >= 0) ideals.push(mask);
    }

    expect(ideals).toEqual(reference.ideal_masks);
    expect(search.reached).toBe(ideals.length);
    expect(search.distance[(1 << model.n) - 1]).toBe(search.minimum);
  }

  // Capacity alone gives independent lower bounds attained by valid schedules.
  expect(model.optimum2).toBe(Math.ceil(model.n / 2));
  expect(model.optimum3).toBe(Math.ceil(model.n / 3));
});

test('124: job positions use true longest-path layers and reported straight-edge crossings never add dependencies', () => {
  expect(new Set(model.layers.flat()).size).toBe(model.n);
  expect(new Set(model.positions.map(point => `${point.x},${point.y}`)).size).toBe(model.n);
  const depth = Array<number>(model.n).fill(0);

  for (let pass = 0; pass < model.n; pass++) {
    for (const [a, b] of model.arcs) {
      const first = depth[a];
      const second = depth[b];

      if (first === undefined || second === undefined) throw new Error('Each independent longest-path depth exists.');

      depth[b] = Math.max(second, first + 1);
    }
  }

  for (const [layer, jobs] of model.layers.entries()) {
    for (const job of jobs) expect(depth[job]).toBe(layer);
  }

  const actual: string[] = [];

  for (let first = 0; first < model.arcs.length; first++) {
    const e = model.arcs[first];

    if (!e) throw new Error('The first geometric edge exists.');

    for (let second = first + 1; second < model.arcs.length; second++) {
      const f = model.arcs[second];

      if (!f) throw new Error('The second geometric edge exists.');

      if (e.includes(f[0]) || e.includes(f[1])) continue;

      const a = model.positions[e[0]];
      const b = model.positions[e[1]];
      const c = model.positions[f[0]];
      const d = model.positions[f[1]];

      if (!a || !b || !c || !d) throw new Error('Every geometric endpoint exists.');

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const ex = d.x - c.x;
      const ey = d.y - c.y;
      const determinant = dx * ey - dy * ex;

      if (Math.abs(determinant) < 1e-12) continue;

      const t = ((c.x - a.x) * ey - (c.y - a.y) * ex) / determinant;
      const u = ((c.x - a.x) * dy - (c.y - a.y) * dx) / determinant;

      if (t > 1e-10 && t < 1 - 1e-10 && u > 1e-10 && u < 1 - 1e-10) actual.push(`${e.join(',')}|${f.join(',')}`);
    }
  }

  expect(model.crossings.map(([e, f]) => `${e.join(',')}|${f.join(',')}`)).toEqual(actual);

  function meetsCard(a: Point, b: Point, centre: Point, half: number): boolean {
    let start = 0;
    let end = 1;

    for (const axis of ['x', 'y'] as const) {
      const delta = b[axis] - a[axis];
      const lower = centre[axis] - half;
      const upper = centre[axis] + half;

      if (Math.abs(delta) < 1e-12) {
        if (a[axis] <= lower || a[axis] >= upper) return false;
      } else {
        const first = (lower - a[axis]) / delta;
        const second = (upper - a[axis]) / delta;
        start = Math.max(start, Math.min(first, second));
        end = Math.min(end, Math.max(first, second));

        if (end <= start) return false;
      }
    }

    return end > start;
  }

  for (const width of [1440, 390, 320]) {
    const height = width * (width < 600 ? 11 / 4 : 10 / 16);
    const boxes = layout(width, height, 0);
    const geometry = graphLayout(boxes.stage, boxes.tall);
    const positions = model.positions.map(position => jobPoint(position, geometry));
    let skipped = 0;

    for (const [a, b] of model.arcs) {
      const from = positions[a];
      const to = positions[b];
      const first = model.positions[a];
      const second = model.positions[b];

      if (!from || !to || !first || !second) throw new Error('Each drawn dependency has its endpoint cards.');

      const skipLayer = second.x - first.x > .5 + 1e-10;
      const route = dependencyRoute(from, to, geometry, skipLayer, skipLayer ? skipped++ : 0);

      for (let segment = 1; segment < route.length; segment++) {
        const p = route[segment - 1];
        const q = route[segment];

        if (!p || !q) throw new Error('Each actual dependency polyline has two segment endpoints.');

        for (const [job, position] of positions.entries()) {
          if (job === a || job === b) continue;

          if (meetsCard(p, q, position, geometry.tile / 2 - .5)) throw new Error(`At width ${width}, routed dependency ${a}→${b} crosses unrelated job ${job}.`);
        }
      }
    }
  }
});

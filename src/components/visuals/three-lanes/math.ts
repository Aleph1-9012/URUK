// Runtime inputs are only n and the canonical precedence arcs from lanes.json.
import data from './data.json';

export type Arc = readonly [number, number];

export type Point = { x: number; y: number };

export type LabelCandidate = { job: number; key: number[] };

export type LabelStep = { label: number; job: number; candidates: LabelCandidate[] };

export type ScheduleHour = { hour: number; ready: number[]; priorityReady: number[]; jobs: number[]; completedBefore: number; completedAfter: number };

export type JobSlot = { job: number; hour: number; lane: number };

export type Schedule = { lanes: number; makespan: number; slots: number[][]; hours: ScheduleHour[]; jobSlots: JobSlot[] };

export type FinishedSearch = { lanes: number; minimum: number; reached: number; transitions: number; distance: Int16Array<ArrayBuffer> };

export type LayeredLayout = { layers: number[][]; positions: Point[]; crossings: [Arc, Arc][]; verticalTravel: number };

function inputArc(pair: readonly number[]): Arc {
  const a = pair[0];
  const b = pair[1];

  if (pair.length !== 2 || a === undefined || b === undefined) throw new Error('A canonical precedence arc has two job endpoints.');

  return [a, b];
}

function graph(n: number, arcs: readonly Arc[]) {
  if (!Number.isInteger(n) || n < 1 || n > 16) throw new RangeError('The exact illustrative search supports one to sixteen unit jobs.');

  const predecessorMasks = Array<number>(n).fill(0);
  const predecessors: number[][] = Array.from({ length: n }, () => []);
  const successors: number[][] = Array.from({ length: n }, () => []);
  const indegree = Array<number>(n).fill(0);
  const seen = new Set<string>();

  for (const [a, b] of arcs) {
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= n || b >= n || a === b || seen.has(`${a},${b}`)) throw new Error('Precedence arcs join distinct jobs without repetitions.');

    const incoming = predecessors[b];
    const outgoing = successors[a];
    const prior = predecessorMasks[b];
    const degree = indegree[b];

    if (!incoming || !outgoing || prior === undefined || degree === undefined) throw new Error('Each endpoint has its dependency storage.');

    incoming.push(a);
    outgoing.push(b);
    predecessorMasks[b] = prior | (1 << a);
    indegree[b] = degree + 1;
    seen.add(`${a},${b}`);
  }

  const topological: number[] = [];

  for (let job = 0; job < n; job++) {
    if (indegree[job] === 0) topological.push(job);
  }

  for (let head = 0; head < topological.length; head++) {
    const job = topological[head];
    const outgoing = job === undefined ? undefined : successors[job];

    if (!outgoing) throw new Error('Every topological job has its outgoing dependencies.');

    for (const target of outgoing) {
      const degree = indegree[target];

      if (degree === undefined) throw new Error('Every dependent job has its remaining indegree.');

      indegree[target] = degree - 1;

      if (degree === 1) topological.push(target);
    }
  }

  if (topological.length !== n) throw new Error('Unit-job precedence constraints form a directed acyclic graph.');

  return { predecessorMasks, predecessors, successors, topological };
}

/** The classical label keys use the cover relation, not redundant transitive arcs. */
export function transitiveReduction(n: number, arcs: readonly Arc[]): Arc[] {
  const dependencies = graph(n, arcs);
  const result: Arc[] = [];

  for (const arc of arcs) {
    const [a, b] = arc;
    const queue = [a];
    const visited = new Set([a]);
    let alternate = false;

    for (let head = 0; head < queue.length && !alternate; head++) {
      const source = queue[head];
      const outgoing = source === undefined ? undefined : dependencies.successors[source];

      if (!outgoing) throw new Error('The alternate-path search has an adjacency row.');

      for (const target of outgoing) {
        if (source === a && target === b) continue;

        if (target === b) {
          alternate = true;

          break;
        }

        if (visited.has(target)) continue;

        visited.add(target);
        queue.push(target);
      }
    }

    if (!alternate) result.push(arc);
  }

  return result;
}

function compareKeys(a: readonly number[], b: readonly number[]): number {
  for (let index = 0; index < Math.min(a.length, b.length); index++) {
    const first = a[index];
    const second = b[index];

    if (first === undefined || second === undefined) throw new Error('Both lexicographic keys have this entry.');

    if (first !== second) return first - second;
  }

  return a.length - b.length;
}

export function coffmanGraham(n: number, arcs: readonly Arc[]) {
  const coverArcs = transitiveReduction(n, arcs);
  const { successors } = graph(n, coverArcs);
  const labels = Array<number>(n).fill(0);
  const labelSteps: LabelStep[] = [];

  for (let label = 1; label <= n; label++) {
    const candidates: LabelCandidate[] = [];

    for (let job = 0; job < n; job++) {
      if (labels[job] !== 0) continue;

      const outgoing = successors[job];

      if (!outgoing) throw new Error('Every unlabelled job has its cover successors.');

      const key: number[] = [];
      let eligible = true;

      for (const target of outgoing) {
        const targetLabel = labels[target];

        if (targetLabel === undefined) throw new Error('Each successor has its label slot.');

        if (targetLabel === 0) eligible = false;

        key.push(targetLabel);
      }

      if (eligible) candidates.push({ job, key: key.sort((a, b) => b - a) });
    }

    candidates.sort((a, b) => compareKeys(a.key, b.key) || a.job - b.job);
    const selected = candidates[0];

    if (!selected) throw new Error('An acyclic unfinished graph has an eligible Coffman–Graham label.');

    labels[selected.job] = label;
    labelSteps.push({ label, job: selected.job, candidates });
  }

  return { labels, labelSteps, coverArcs };
}

export function readyJobs(predecessorMasks: readonly number[], completedMask: number): number[] {
  const ready: number[] = [];

  for (const [job, predecessors] of predecessorMasks.entries()) {
    if (!(completedMask & (1 << job)) && (predecessors & completedMask) === predecessors) ready.push(job);
  }

  return ready;
}

function labelsByPriority(ready: readonly number[], labels: readonly number[]): number[] {
  return ready.slice().sort((a, b) => {
    const first = labels[a];
    const second = labels[b];

    if (first === undefined || second === undefined) throw new Error('Every ready job has its priority label.');

    return second - first;
  });
}

export function scheduleValid(n: number, arcs: readonly Arc[], slots: readonly (readonly number[])[], lanes: number): boolean {
  const times = Array<number>(n).fill(-1);

  for (const [hour, jobs] of slots.entries()) {
    if (jobs.length === 0 || jobs.length > lanes) return false;

    for (const job of jobs) {
      if (!Number.isInteger(job) || job < 0 || job >= n || times[job] !== -1) return false;

      times[job] = hour;
    }
  }

  if (times.includes(-1)) return false;

  for (const [a, b] of arcs) {
    const before = times[a];
    const after = times[b];

    if (before === undefined || after === undefined || before >= after) return false;
  }

  return true;
}

function describeSchedule(n: number, arcs: readonly Arc[], predecessorMasks: readonly number[], labels: readonly number[], slots: number[][], lanes: number): Schedule {
  if (!scheduleValid(n, arcs, slots, lanes)) throw new Error('Every displayed schedule is complete, respects precedence and fits its lane capacity.');

  const hours: ScheduleHour[] = [];
  const jobSlots: JobSlot[] = [];
  let completed = 0;

  for (const [hour, jobs] of slots.entries()) {
    const ready = readyJobs(predecessorMasks, completed);
    const completedBefore = completed;

    for (const [lane, job] of jobs.entries()) {
      if (!ready.includes(job)) throw new Error('Every job was ready before its one-hour slot began.');

      completed |= 1 << job;
      jobSlots.push({ job, hour, lane });
    }

    hours.push({ hour, ready, priorityReady: labelsByPriority(ready, labels), jobs, completedBefore, completedAfter: completed });
  }

  return { lanes, makespan: slots.length, slots, hours, jobSlots };
}

export function listSchedule(n: number, arcs: readonly Arc[], labels: readonly number[], lanes: number): Schedule {
  if (!Number.isInteger(lanes) || lanes < 1 || lanes > n) throw new RangeError('A finite schedule has between one and n identical lanes.');

  const { predecessorMasks } = graph(n, arcs);
  const all = (1 << n) - 1;
  const slots: number[][] = [];
  let completed = 0;

  while (completed !== all) {
    const ready = labelsByPriority(readyJobs(predecessorMasks, completed), labels);
    const jobs = ready.slice(0, lanes);

    if (jobs.length === 0) throw new Error('An unfinished acyclic graph has a ready job.');

    slots.push(jobs);

    for (const job of jobs) completed |= 1 << job;
  }

  return describeSchedule(n, arcs, predecessorMasks, labels, slots, lanes);
}

function combinations(values: readonly number[], count: number): number[][] {
  const result: number[][] = [];
  const selected: number[] = [];

  function visit(index: number): void {
    if (selected.length === count) {
      result.push(selected.slice());

      return;
    }

    for (let next = index; next <= values.length - (count - selected.length); next++) {
      const value = values[next];

      if (value === undefined) throw new Error('A selected subset member exists.');

      selected.push(value);
      visit(next + 1);
      selected.pop();
    }
  }

  visit(0);

  return result;
}

export function finishedSetSearch(n: number, arcs: readonly Arc[], lanes: number): FinishedSearch {
  const { predecessorMasks } = graph(n, arcs);

  if (!Number.isInteger(lanes) || lanes < 1 || lanes > n) throw new RangeError('The exact search has a finite positive lane capacity.');

  const full = (1 << n) - 1;
  const distance = new Int16Array(1 << n).fill(-1);
  const queue = [0];
  distance[0] = 0;
  let transitions = 0;

  for (let head = 0; head < queue.length; head++) {
    const completed = queue[head];
    const depth = completed === undefined ? undefined : distance[completed];

    if (completed === undefined || depth === undefined) throw new Error('Every queued finished set has its exact depth.');

    const ready = readyJobs(predecessorMasks, completed);

    for (let count = 1; count <= Math.min(lanes, ready.length); count++) {
      for (const jobs of combinations(ready, count)) {
        let next = completed;

        for (const job of jobs) next |= 1 << job;

        transitions++;

        if (distance[next] !== -1) continue;

        distance[next] = depth + 1;
        queue.push(next);
      }
    }
  }

  const minimum = distance[full];

  if (minimum === undefined || minimum < 1) throw new Error('The exact acyclic search reaches a complete schedule.');

  return { lanes, minimum, reached: queue.length, transitions, distance };
}

function optimalSchedule(n: number, arcs: readonly Arc[], labels: readonly number[], lanes: number, target: number): Schedule {
  const { predecessorMasks } = graph(n, arcs);
  const full = (1 << n) - 1;
  const slots: number[][] = [];

  function visit(completed: number): number[][] | null {
    if (completed === full) return slots.slice();

    if (slots.length >= target || n - popcount(completed) > (target - slots.length) * lanes) return null;

    const ready = readyJobs(predecessorMasks, completed);

    for (let count = Math.min(lanes, ready.length); count >= 1; count--) {
      for (const jobs of combinations(ready, count)) {
        let next = completed;

        for (const job of jobs) next |= 1 << job;

        slots.push(jobs);
        const answer = visit(next);
        slots.pop();

        if (answer) return answer;
      }
    }

    return null;
  }

  const answer = visit(0);

  if (!answer) throw new Error('The independently minimal makespan has a recoverable feasible schedule.');

  return describeSchedule(n, arcs, predecessorMasks, labels, answer, lanes);
}

function popcount(value: number): number {
  let bits = value;
  let count = 0;

  while (bits) {
    bits &= bits - 1;
    count++;
  }

  return count;
}

function permutations(values: readonly number[]): number[][] {
  if (values.length === 0) return [[]];

  const result: number[][] = [];

  for (const [index, value] of values.entries()) {
    const remaining = values.slice();
    remaining.splice(index, 1);

    for (const tail of permutations(remaining)) result.push([value, ...tail]);
  }

  return result;
}

function orientation(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function crossingsAt(arcs: readonly Arc[], positions: readonly Point[]): [Arc, Arc][] {
  const crossings: [Arc, Arc][] = [];

  for (let first = 0; first < arcs.length; first++) {
    const edge = arcs[first];

    if (!edge) throw new Error('Every layout edge has its endpoints.');

    for (let second = first + 1; second < arcs.length; second++) {
      const other = arcs[second];

      if (!other) throw new Error('Every compared layout edge has its endpoints.');

      if (edge.includes(other[0]) || edge.includes(other[1])) continue;

      const a = positions[edge[0]];
      const b = positions[edge[1]];
      const c = positions[other[0]];
      const d = positions[other[1]];

      if (!a || !b || !c || !d) throw new Error('Every dependency endpoint has its layer position.');

      if (orientation(a, b, c) * orientation(a, b, d) < 0 && orientation(c, d, a) * orientation(c, d, b) < 0) crossings.push([edge, other]);
    }
  }

  return crossings;
}

/** Normalized screen-down positions: longest-path layers run left to right. */
export function layeredLayout(n: number, arcs: readonly Arc[]): LayeredLayout {
  const { predecessors, topological } = graph(n, arcs);
  const depth = Array<number>(n).fill(0);

  for (const job of topological) {
    const incoming = predecessors[job];

    if (!incoming) throw new Error('Every layered job has its precedence list.');

    for (const parent of incoming) {
      const prior = depth[parent];
      const current = depth[job];

      if (prior === undefined || current === undefined) throw new Error('Each topological depth exists.');

      depth[job] = Math.max(current, prior + 1);
    }
  }

  const layers: number[][] = Array.from({ length: Math.max(...depth) + 1 }, () => []);

  for (const [job, layer] of depth.entries()) {
    const row = layers[layer];

    if (!row) throw new Error('Every job has its longest-path layer.');

    row.push(job);
  }

  let layouts = 1;

  for (const layer of layers) {
    for (let factor = 2; factor <= layer.length; factor++) layouts *= factor;
  }

  if (layouts > 100000) throw new RangeError('This illustrative layered search is limited to 100000 arrangements.');

  const possibilities = layers.map(permutations);
  const chosen: number[][] = [];
  let best: LayeredLayout | null = null;
  const span = Math.max(1, ...layers.map(layer => layer.length - 1));

  function visit(layer: number): void {
    const orders = possibilities[layer];

    if (orders) {
      for (const order of orders) {
        chosen.push(order);
        visit(layer + 1);
        chosen.pop();
      }

      return;
    }

    const positions: Point[] = Array.from({ length: n }, () => ({ x: 0, y: 0 }));

    for (const [column, order] of chosen.entries()) {
      for (const [row, job] of order.entries()) positions[job] = { x: layers.length === 1 ? .5 : column / (layers.length - 1), y: .5 + (row - (order.length - 1) / 2) / span };
    }

    const crossings = crossingsAt(arcs, positions);
    let verticalTravel = 0;

    for (const [a, b] of arcs) {
      const first = positions[a];
      const second = positions[b];

      if (!first || !second) throw new Error('A dependency has both positions for the layout score.');

      verticalTravel += Math.abs(first.y - second.y);
    }

    if (best === null || crossings.length < best.crossings.length || (crossings.length === best.crossings.length && verticalTravel < best.verticalTravel - 1e-12)) best = { layers: chosen.map(order => order.slice()), positions, crossings, verticalTravel };
  }

  visit(0);

  if (best === null) throw new Error('The finite layer-order search selects a layout.');

  return best;
}

export function createSchedulingModel() {
  const n = data.n;
  const arcs = data.arcs.map(inputArc);
  const dependencies = graph(n, arcs);
  const labelling = coffmanGraham(n, arcs);
  const cg2 = listSchedule(n, arcs, labelling.labels, 2);
  const cg3 = listSchedule(n, arcs, labelling.labels, 3);
  const two = finishedSetSearch(n, arcs, 2);
  const three = finishedSetSearch(n, arcs, 3);
  const opt2 = optimalSchedule(n, arcs, labelling.labels, 2, two.minimum);
  const opt3 = optimalSchedule(n, arcs, labelling.labels, 3, three.minimum);
  const geometry = layeredLayout(n, arcs);

  return { n, arcs, ...dependencies, ...labelling, ...geometry, cg2, cg3, opt2, opt3, optimum2: two.minimum, optimum3: three.minimum, search: { two, three } };
}

export type SchedulingModel = ReturnType<typeof createSchedulingModel>;

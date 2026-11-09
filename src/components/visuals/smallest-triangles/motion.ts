import { POOL26, RANDOM13 } from './data';
import { alteration, gridSites, nearestFreeMatch, parabolaMinimum, parabolaPoints, projectedColumnPoints, smallestTriangle, type Point, type Triple } from './math';

export type MovingPoint = Point & { id: number; label: number | undefined; column: number | undefined };

export type Minimum = { ids: Triple; points: readonly [Point, Point, Point]; area: number; exact: 'parabola' | 'columns' | 'grid' | undefined };

export type StageState = {
  scene: 'random' | 'grid' | 'alteration' | 'parabola' | 'columns' | 'field' | 'second-prime' | 'replay' | 'closing';
  points: MovingPoint[];
  active: MovingPoint[];
  minimum: Minimum | undefined;
  badTriangles: readonly Triple[];
  flash: boolean;
  deletedCount: number;
  columnProgress: readonly number[];
  exactParabola: boolean;
};

export const ALTERATION = alteration();

export const PARABOLA = parabolaPoints();

export const GRID = gridSites();

export const SURVIVOR_MATCH = nearestFreeMatch(ALTERATION.survivors, PARABOLA);

const COLUMN_POINTS = projectedColumnPoints();

const EXACT_PARABOLA = parabolaMinimum();

const SURVIVOR_SLOT = new Map(ALTERATION.survivorIndices.map((id, slot) => [id, slot]));

const TRAY_SLOT = new Map(ALTERATION.deletionOrder.map((id, slot) => [id, slot]));

export function progress(time: number, start: number, end: number): number {
  return Math.max(0, Math.min(1, (time - start) / (end - start)));
}

export function smooth(time: number, start: number, end: number): number {
  const amount = progress(time, start, end);

  return amount * amount * (3 - 2 * amount);
}

function carry(from: Point, to: Point, amount: number, arch = 0): Point {
  if (amount === 0) return { x: from.x, y: from.y };
  if (amount === 1) return { x: to.x, y: to.y };

  return { x: from.x + (to.x - from.x) * amount, y: from.y + (to.y - from.y) * amount + Math.sin(Math.PI * amount) * arch };
}

export function trayShiftAt(time: number): number {
  if (time < 96500) return smooth(time, 28000, 31000);

  return 1 - smooth(time, 96500, 97800) + smooth(time, 105400, 106500);
}

function trayPoint(slot: number, parked: number): Point {
  return { x: 1.13 + slot % 2 * .15 + parked * .9, y: .91 - Math.floor(slot / 2) * .12 };
}

function parabolaTarget(id: number): { point: Point; label: number } | undefined {
  const slot = SURVIVOR_SLOT.get(id);

  if (slot === undefined) return;

  const label = SURVIVOR_MATCH[slot];
  const point = label === undefined ? undefined : PARABOLA[label];

  if (point === undefined || label === undefined) return;

  return { point, label };
}

function sceneAt(time: number): StageState['scene'] {
  if (time < 9500) return 'random';
  if (time < 16250) return 'grid';
  if (time < 24000) return 'alteration';
  if (time < 71750) return 'parabola';
  if (time < 81500) return 'columns';
  if (time < 89750) return 'field';
  if (time < 96500) return 'second-prime';
  if (time < 105750) return 'replay';

  return 'closing';
}

function minimumFor(points: MovingPoint[], exactParabola: boolean, columnSettled: boolean, gridSettled: boolean): Minimum | undefined {
  if (points.length < 3) return;

  if (exactParabola) {
    const selected = [0, 1, 4].map(label => points.find(point => point.label === label));
    const [a, b, c] = selected;

    if (a && b && c) return { ids: [a.id, b.id, c.id], points: [a, b, c], area: EXACT_PARABOLA.area, exact: 'parabola' };
  }

  const minimum = smallestTriangle(points);
  const a = points[minimum.triple[0]];
  const b = points[minimum.triple[1]];
  const c = points[minimum.triple[2]];

  if (!a || !b || !c) return;

  return { ids: [a.id, b.id, c.id], points: [a, b, c], area: minimum.area, exact: columnSettled ? 'columns' : gridSettled ? 'grid' : undefined };
}

/** Coordinates include the off-square tray, preserving every pool index through both deletions. */
export function motionAt(time: number, columnStarts: readonly Point[] = [{ x: 1.7, y: .8 }, { x: 1.9, y: .8 }, { x: 2.1, y: .8 }]): StageState {
  const scene = sceneAt(time);
  const points: MovingPoint[] = [];
  const replay = time >= 96500;
  const deletionStart = replay ? 98700 : 19600;
  const deletionEnd = deletionStart + 2390;
  const parabolaStart = replay ? 103300 : 24000;
  const parabolaEnd = replay ? 105400 : 26400;
  const replayIn = smooth(time, 96500, 97800);
  const parked = trayShiftAt(time);

  for (let id = 0; id < (time < 17000 ? 13 : 26); id++) {
    const pool = POOL26[id];

    if (!pool) continue;

    let point: Point = pool;
    let label: number | undefined;

    if (time < 16250) {
      const random = RANDOM13[id];
      const grid = GRID[id];

      if (!random || !grid) continue;

      point = carry({ x: random.x, y: 1.16 + id % 3 * .04 }, random, smooth(time, id * 65 - 300, id * 65 + 650));
      point = carry(point, grid, smooth(time, 9500, 11900));
    } else if (time < 19000) {
      if (id < 13) point = carry(GRID[id] ?? pool, pool, smooth(time, 16250, 17800), .025);
      else point = carry({ x: pool.x, y: 1.14 + id % 3 * .04 }, pool, smooth(time, 17000 + (id - 13) * 65, 17900 + (id - 13) * 65));
    } else {
      const tray = TRAY_SLOT.get(id);
      const target = parabolaTarget(id);

      if (tray !== undefined) {
        const order = ALTERATION.deletionOrder.indexOf(id);
        const lift = smooth(time, deletionStart + order * 145, deletionStart + order * 145 + 650);
        const outside = trayPoint(tray, parked);

        if (replay) {
          const broughtBack = carry(trayPoint(tray, 1), pool, replayIn, .04);
          point = carry(broughtBack, outside, lift, .045);
        } else {
          point = carry(pool, outside, lift, .045);
        }
      } else if (target) {
        const onParabola = carry(pool, target.point, smooth(time, parabolaStart, parabolaEnd), .035);
        point = replay ? carry(target.point, pool, replayIn, .035) : onParabola;

        if (replay && time >= parabolaStart) point = onParabola;

        if (time >= parabolaEnd || !replay && time >= 26400) label = target.label;

        if (!replay && time >= 71750) {
          const archive = { x: target.point.x, y: 1.3 + target.label % 2 * .04 };
          point = carry(target.point, archive, smooth(time, 71750, 72900), .02);

          if (time >= 80000) point = carry(archive, target.point, smooth(time, 80000, 81500), .02);
        }
      }
    }

    points.push({ id, x: point.x, y: point.y, label, column: undefined });
  }

  const columnProgress: number[] = [];

  if (time >= 71750 && time < 81200) {
    for (const [column, target] of COLUMN_POINTS.entries()) {
      const entry = smooth(time, 73300 + column * 420, 74600 + column * 420);
      const amount = entry * (1 - smooth(time, 80000, 81200));
      const point = carry(columnStarts[column] ?? target, target, amount, .07);
      columnProgress.push(amount);
      points.push({ id: 100 + column, x: point.x, y: point.y, label: column, column });
    }
  }

  const active: MovingPoint[] = [];

  for (const point of points) {
    if (point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1) active.push(point);
  }

  const exactParabola = time >= 26400 && time < 71750 || time >= 81500 && time < 96500 || time >= 105400;
  const columnSettled = time >= 75440 && time < 80000;
  const gridSettled = time >= 11900 && time < 16250;
  const minimum = minimumFor(active, exactParabola, columnSettled, gridSettled);
  const flashStart = replay ? 98100 : 19000;
  const flash = time >= flashStart && time < flashStart + 500;
  const deletedCount = time < deletionStart ? 0 : time >= deletionEnd ? 13 : points.reduce((count, point) => count + Number(point.id < 26 && TRAY_SLOT.has(point.id) && point.x > 1), 0);

  return { scene, points, active, minimum, badTriangles: ALTERATION.smallTriangles, flash, deletedCount, columnProgress, exactParabola };
}

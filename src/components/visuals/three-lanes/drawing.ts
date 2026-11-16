import { fittedText } from '../../plate/canvas/fitted-text';

export type Box = { x: number; y: number; w: number; h: number };

export type Point = { x: number; y: number };

export type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

export type Place = (id: string, x: number, y: number, opacity?: number) => void;

export type GraphLayout = { box: Box; inner: Box; tile: number };

export type LaneGrid = Box & { hours: number; lanes: number; cellW: number; cellH: number };

export type ScheduleRegion = 'single' | 'rule' | 'best';

export function graphLayout(box: Box, tall: boolean): GraphLayout {
  const tile = Math.min(tall ? 28 : 38, box.w * .135, box.h * .12);
  const margin = tile / 2 + 10;

  return { box, inner: { x: box.x + margin, y: box.y + (tall ? 44 : 58), w: box.w - margin * 2, h: box.h - (tall ? 90 : 120) }, tile };
}

export function jobPoint(position: Point, geometry: GraphLayout): Point {
  return { x: geometry.inner.x + position.x * geometry.inner.w, y: geometry.inner.y + position.y * geometry.inner.h };
}

export function dependencyRoute(from: Point, to: Point, geometry: GraphLayout, skipLayer: boolean, routeIndex = 0): Point[] {
  const half = geometry.tile / 2;

  if (skipLayer) {
    const departure = from.x + half + 10 + routeIndex * 3;
    const side = geometry.box.x + geometry.box.w - 3 - routeIndex * 3;
    const above = geometry.inner.y - half - 6 - routeIndex * 4;

    return [{ x: from.x + half + 2, y: from.y }, { x: departure, y: from.y }, { x: departure, y: above }, { x: side, y: above }, { x: side, y: to.y }, { x: to.x + half + 2, y: to.y }];
  }

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const extent = Math.max(Math.abs(dx), Math.abs(dy));

  if (extent === 0) throw new Error('A dependency joins two distinct job cards.');

  const amount = (half + 2) / extent;

  return [{ x: from.x + dx * amount, y: from.y + dy * amount }, { x: to.x - dx * amount, y: to.y - dy * amount }];
}

export function laneGrid(box: Box, tall: boolean, region: ScheduleRegion, lanes = 3): LaneGrid {
  const fraction = region === 'single' ? .32 : region === 'rule' ? .25 : .61;
  const left = tall ? 25 : 34;
  const width = box.w - left - (tall ? 8 : 12);
  const cellH = Math.min(tall ? 30 : 36, box.h * .077);

  return { x: box.x + left, y: box.y + box.h * fraction, w: width, h: lanes * cellH, hours: 5, lanes, cellW: width / 5, cellH };
}

export function slotPoint(grid: LaneGrid, hour: number, lane: number): Point {
  return { x: grid.x + (hour + .5) * grid.cellW, y: grid.y + (lane + .5) * grid.cellH };
}

export const text = fittedText(words => /[α-ωΑ-Ωℓ⊥≤≥≡∞√∇−→⇒⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/u.test(words) ? '"Garamond Math", serif' : /[À-ž]/u.test(words) ? '"Alegreya", "Garamond Math", serif' : '"Special Elite", monospace');

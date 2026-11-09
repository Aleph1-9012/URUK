import { START_RULER, UNIT, rulerEnd, type Point, type Ruler } from './tiling';

// The film: the ruler's middle traces a figure of eight over the tiles while the ruler turns once, every 24 seconds.
export const WANDER_PERIOD = 24000;

export const RETURN_TIME = 700;

const TAU = 2 * Math.PI;
const REACH = { x: 200, y: 120 };
const startEnd = rulerEnd(START_RULER);
const MIDDLE: Point = { x: (START_RULER.start.x + startEnd.x) / 2, y: (START_RULER.start.y + startEnd.y) / 2 };

function aboutMiddle(middle: Point, angle: number): Ruler {
  return { start: { x: middle.x - (UNIT / 2) * Math.cos(angle), y: middle.y - (UNIT / 2) * Math.sin(angle) }, angle };
}

export function rulerAt(time: number): Ruler {
  const phase = (TAU * time) / WANDER_PERIOD;

  return aboutMiddle({ x: MIDDLE.x + REACH.x * Math.sin(phase), y: MIDDLE.y + REACH.y * Math.sin(2 * phase) }, START_RULER.angle + phase);
}

export function between(from: Ruler, to: Ruler, share: number): Ruler {
  const eased = share * share * (3 - 2 * share);
  const turn = Math.atan2(Math.sin(to.angle - from.angle), Math.cos(to.angle - from.angle));

  return {
    start: { x: from.start.x + (to.start.x - from.start.x) * eased, y: from.start.y + (to.start.y - from.start.y) * eased },
    angle: from.angle + turn * eased,
  };
}

import { expect, test } from 'bun:test';
import {
  FORCED_COLOURS, HEX_RADIUS, INK, PALETTE, PAPER, QUOTED_HEX_GAP, SAME_HEX_GAP,
  SPINDLE, SPINDLE_EDGES, TRIANGLE, classAt, classOf, contrast, hexCentre,
  hexVertices, polygonGap, properColouringCount, rulerAt, unitPairs,
} from '../src/components/visuals/five-colours/math';

test('158: unit triangles force the spindle tips to agree, while the graph needs four colours', () => {
  expect(SPINDLE_EDGES).toHaveLength(11);
  expect(unitPairs(TRIANGLE)).toHaveLength(3);
  expect(properColouringCount(3, unitPairs(TRIANGLE), 2)).toBe(0);
  expect(properColouringCount(7, SPINDLE_EDGES, 3)).toBe(0);
  expect(properColouringCount(7, SPINDLE_EDGES, 4)).toBe(384);
  const failed = [];

  for (const [a, b] of SPINDLE_EDGES) {
    const from = SPINDLE[a];
    const to = SPINDLE[b];

    if (!from || !to) throw new Error('Every spindle edge has two vertices.');

    expect(Math.hypot(from.x - to.x, from.y - to.y)).toBeCloseTo(1, 12);

    if (FORCED_COLOURS[a] === FORCED_COLOURS[b]) failed.push([a, b]);
  }

  expect(failed).toEqual([[3, 6]]);
});

test('158: closed hexagons of one colour have a gap greater than one, and the unit ruler respects it', () => {
  const origin = hexVertices(0, 0);
  let nearest = Infinity;
  let centreDistance = Infinity;

  for (let q = -6; q <= 6; q++) {
    for (let r = -6; r <= 6; r++) {
      if ((q === 0 && r === 0) || classOf(q, r) !== 7) continue;

      nearest = Math.min(nearest, polygonGap(origin, hexVertices(q, r)));
      const centre = hexCentre(q, r);
      centreDistance = Math.min(centreDistance, Math.hypot(centre.x, centre.y));
    }
  }

  expect(centreDistance).toBeCloseTo(Math.sqrt(21) * HEX_RADIUS, 12);
  expect(nearest).toBeCloseTo(SAME_HEX_GAP, 12);
  expect(QUOTED_HEX_GAP).toBeGreaterThan(1);
  expect(nearest).toBeGreaterThan(QUOTED_HEX_GAP);

  for (let time = 34000; time <= 44500; time += 25) {
    const ruler = rulerAt(time);
    expect(Math.hypot(ruler.end.x - ruler.start.x, ruler.end.y - ruler.start.y)).toBeCloseTo(1, 12);
    expect(classAt(ruler.start)).not.toBe(classAt(ruler.end));
  }
});

test('158: every colour retains a distinct engraving and readable numerals and pattern ink', () => {
  expect(new Set(PALETTE.map(color => color.pattern)).size).toBe(7);

  for (const color of PALETTE) {
    expect(contrast(color.hex, color.numeral === 'ink' ? INK : PAPER)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(color.tint, INK)).toBeGreaterThanOrEqual(4.5);
  }
});

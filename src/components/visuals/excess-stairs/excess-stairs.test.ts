import { expect, test } from 'bun:test';
import { buildExcessStairsModel, schematicStairAt } from './math';

test('263: every illustrative morph draws a nonrising staircase with a genuinely flat terminal segment', () => {
  const model = buildExcessStairsModel();

  for (const phase of [0, .1, .2, 1 / 3, .45, .5, 2 / 3, .8, .9, 1]) {
    const stair = schematicStairAt(model, phase);
    const first = stair.vertices[0];
    const last = stair.vertices.at(-1);

    if (!first || !last) throw new Error('The observed graphic path needs both endpoints.');

    expect(first.position).toBe(0);
    expect(last.position).toBe(1);
    expect(last.depth).toBeGreaterThan(first.depth);
    let tailDepth: number | null = null;

    for (let index = 1; index < stair.vertices.length; index++) {
      const previous = stair.vertices[index - 1];
      const current = stair.vertices[index];

      if (!previous || !current) throw new Error('Each graphic segment needs its two endpoints.');

      expect(current.position).toBeGreaterThanOrEqual(previous.position);
      expect(-current.depth).toBeLessThanOrEqual(-previous.depth);
      expect(current.position === previous.position || current.depth === previous.depth).toBe(true);

      if (current.position === stair.tailStart) tailDepth = current.depth;
      if (current.position > stair.tailStart) {
        if (tailDepth === null) throw new Error('The terminal segment must follow its actual final drop.');

        expect(current.depth).toBe(tailDepth);
      }
    }

    expect(tailDepth).toBe(last.depth);
    expect(stair.tailStart).toBeLessThan(last.position);
  }
});

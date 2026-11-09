import { expect, test } from 'bun:test';
import {
  AGREE_CROSSING, AGREE_GAMMA, BAD_EDGES, BEST_LABELS, CUT_EDGES, CUT_LABELS, EDGES,
  HIDDEN_LABELS, WALK_LABELS, agreement, bestLabelling, keptCount, keepsRule, walkLabels,
} from '../src/components/visuals/unique-rules/math';
import { CUES, FILM_DURATION, cueAt, stillTime } from '../src/components/visuals/unique-rules/story';

test('102 wheel: exhaustive optima and the misleading walk match the displayed counts', () => {
  expect(EDGES.length).toBe(12);
  expect(walkLabels(EDGES)).toEqual([...HIDDEN_LABELS]);
  expect(bestLabelling(EDGES).kept).toBe(12);
  expect(bestLabelling(BAD_EDGES).kept).toBe(11);
  expect(keptCount(BEST_LABELS, BAD_EDGES)).toBe(11);
  expect(WALK_LABELS).toEqual([0, 1, 0, 0, 0, 0, 1]);
  expect(keptCount(WALK_LABELS, BAD_EDGES)).toBe(8);
  const broken: string[] = [];

  for (const edge of BAD_EDGES) {
    if (!keepsRule(WALK_LABELS, edge)) broken.push(`${edge.from}-${edge.to}`);
  }

  expect(broken).toEqual(['0-4', '0-5', '0-6', '6-1']);
  expect(bestLabelling(CUT_EDGES).kept).toBe(9);
  expect(keptCount(CUT_LABELS, CUT_EDGES)).toBe(9);
});

test('102 agreement: the falling bound crosses the positive agreement floor at the stated repetition count', () => {
  expect(agreement(0)).toBe(1);
  expect(agreement(AGREE_CROSSING)).toBeCloseTo(AGREE_GAMMA, 13);
  expect(agreement(AGREE_CROSSING - 1)).toBeGreaterThan(AGREE_GAMMA);
  expect(agreement(AGREE_CROSSING + 1)).toBeLessThan(AGREE_GAMMA);
  expect(agreement(100)).toBeLessThan(agreement(50));
});

test('102 timeline: each subtitle has time to read and a settled reduced-motion frame', () => {
  expect(FILM_DURATION).toBe(120000);

  for (const [index, cue] of CUES.entries()) {
    const next = CUES[index + 1]?.at ?? FILM_DURATION;
    const letters = cue.text.replace(/\$[^$]*\$/g, 'xxxxx').length;

    expect(next).toBeGreaterThan(cue.at);
    expect(cueAt(stillTime(index))).toBe(index);

    if (index < CUES.length - 1) expect(next - cue.at).toBeGreaterThanOrEqual(letters / 17 * 1000 - 200);
  }
});

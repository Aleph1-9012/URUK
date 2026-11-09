import { expect, test } from 'bun:test';
import { CUES, FILM_DURATION, WALKING, WALKS, arrivalOf, bendAt, dialAt, pinPlace, walkAt, walkedOn, TIMELINE } from '../src/components/visuals/switch-groups/timeline';
import {
  ALL_RULES, BENT_COEFFICIENTS, CROSSING_RULES, GROUP_COUNTS, GROUP_RULES, GROUP_SIZE, INSIDE_RULES, LEDGER, OPENING, OPENING_COUNT,
  STOP_DATA, SWITCHES, THRESHOLD_BITS, TRUE_COUNT, countSettings, decimalDigits, evaluate, hermite, nodeOf, occurrences, settingOf,
} from '../src/components/visuals/switch-groups/sat';

test('378 maths: the opening has six good settings of eight; only all-off and all-on break a rule', () => {
  expect(OPENING_COUNT).toBe(6);
  expect(countSettings(OPENING, 3)).toBe(6);
  expect(LEDGER.map((row) => row.broken)).toEqual([0, -1, -1, -1, -1, -1, -1, 1]);
});

test('378 film: the tree of choices puts OFF left and ON right, so its ends from left to right are the settings in order', () => {
  for (let leaf = 0; leaf < 8; leaf += 1) {
    const setting = settingOf(leaf, 3);

    for (let row = 0; row < 3; row += 1) {
      expect(nodeOf(leaf, 3, row + 1)).toBe(2 * nodeOf(leaf, 3, row) + (setting[row] ? 1 : 0));
    }

    expect(nodeOf(leaf, 3, 0)).toBe(0);
    expect(nodeOf(leaf, 3, 3)).toBe(leaf);
  }

  // The only broken settings are the two outermost ends: all off and all on.
  expect(LEDGER.flatMap((row, leaf) => (row.broken >= 0 ? [leaf] : []))).toEqual([0, 7]);
});

test('378 film: each walk sets the board\'s switches to its path, and the walks take turns', () => {
  for (const [leaf, walk] of WALKS.entries()) {
    const setting = settingOf(leaf, 3);

    expect(walk.end).toBeGreaterThan(walk.start);

    if (leaf > 0) expect(walk.start).toBeGreaterThanOrEqual(WALKS[leaf - 1]?.end ?? Infinity);

    expect(walkAt(walk.end)).toBe(leaf);

    for (let index = 0; index < 3; index += 1) {
      expect(walkedOn(walk.end, index)).toBe(setting[index] ?? false);
    }
  }

  for (let time = WALKING.from; time < WALKING.to; time += 20) {
    const leaf = walkAt(time);

    for (let index = 0; index < 3; index += 1) {
      const sides = [leaf - 1, leaf].map((source) => source >= 0 && (settingOf(source, 3)[index] ?? false));

      expect(sides).toContain(walkedOn(time, index));
    }
  }

  expect(WALKS.at(-1)?.end ?? Infinity).toBeLessThan(WALKING.to);
  expect(walkAt(WALKING.from - 1)).toBe(-1);
  expect(walkAt(WALKING.to)).toBe(-1);
});

test('378 maths: each group counts 10 alone, and with only the inside rules the count is their product', () => {
  expect(GROUP_COUNTS).toEqual([10, 10, 10]);
  expect(countSettings(INSIDE_RULES, SWITCHES)).toBe(1000);

  for (const [group, rules] of GROUP_RULES.entries()) {
    for (const literal of rules.flat()) {
      expect(Math.floor((Math.abs(literal) - 1) / GROUP_SIZE)).toBe(group);
    }
  }
});

test('378 maths: the crossing rules each touch all three groups, and the true count is 684', () => {
  for (const rule of CROSSING_RULES) {
    expect(new Set(rule.map((literal) => Math.floor((Math.abs(literal) - 1) / GROUP_SIZE)))).toEqual(new Set([0, 1, 2]));
  }

  expect(TRUE_COUNT).toBe(684);
  // As in the paper's Section 2, no switch occurs in more than three rules.
  expect(Math.max(...occurrences(ALL_RULES))).toBe(3);
});

test('378 maths: the threshold has about 3.3 billion decimal digits', () => {
  expect(decimalDigits(THRESHOLD_BITS)).toBe(3281226953);
  expect(Math.round(decimalDigits(THRESHOLD_BITS) / 1e8) / 10).toBe(3.3);
});

test('378 maths: values and slopes at T = 1, 2, 3 fix the drawn polynomial and give back the count at T = 0', () => {
  expect(evaluate(BENT_COEFFICIENTS, 0)).toBe(TRUE_COUNT);
  const recovered = hermite(STOP_DATA);

  for (const [power, coefficient] of BENT_COEFFICIENTS.entries()) {
    expect(recovered[power]).toBeCloseTo(coefficient, 8);
  }

  expect(evaluate(recovered, 0)).toBeCloseTo(TRUE_COUNT, 8);
});

test('378 film: subtitles stay ordered and leave time to read at seventeen characters a second', () => {
  expect(FILM_DURATION).toBeGreaterThanOrEqual(45000);
  expect(FILM_DURATION).toBeLessThanOrEqual(120000);
  expect(CUES[0]?.at).toBe(0);

  for (const [index, cue] of CUES.entries()) {
    const letters = cue.text.replace(/\$[^$]*\$/g, 'xxxxx').length;

    expect(TIMELINE.cueEnd(index)).toBeGreaterThan(cue.at);

    if (index < CUES.length - 1) expect(TIMELINE.cueEnd(index) - cue.at).toBeGreaterThanOrEqual(letters * 1000 / 17 - 200);

    expect(TIMELINE.cueAt(cue.at)).toBe(index);
    expect(TIMELINE.cueAt(TIMELINE.stillTime(index))).toBe(index);
  }

  expect(TIMELINE.cueAt(FILM_DURATION + 1000)).toBe(CUES.length - 1);
});

test('378 film: switches arrive and regroup without jumps, and the dial stops at 1, 2 and 3', () => {
  let previous = Array.from({ length: 12 }, (_, index) => pinPlace(0, index));

  for (let time = 50; time <= FILM_DURATION; time += 50) {
    const current = Array.from({ length: 12 }, (_, index) => pinPlace(time, index));

    for (const [index, place] of current.entries()) {
      if (arrivalOf(time, index) > 0) {
        expect(place.u).toBeGreaterThanOrEqual(0);
        expect(place.u).toBeLessThanOrEqual(1);
      }

      expect(Math.abs(place.u - (previous[index]?.u ?? 0))).toBeLessThan(0.05);
      expect(arrivalOf(time, index)).toBeGreaterThanOrEqual(arrivalOf(time - 50, index));
    }

    expect(Math.abs(dialAt(time) - dialAt(time - 50))).toBeLessThan(0.2);
    expect(Math.abs(bendAt(time) - bendAt(time - 50))).toBeLessThan(0.02);
    previous = current;
  }

  const settled = Array.from({ length: 12 }, (_, index) => pinPlace(80000, index).u);

  for (let index = 1; index < 12; index += 1) {
    expect(settled[index] ?? 0).toBeGreaterThan(settled[index - 1] ?? 0);
  }

  expect((settled[4] ?? 0) - (settled[3] ?? 0)).toBeGreaterThan((settled[1] ?? 0) - (settled[0] ?? 0));
  expect(dialAt(86000)).toBe(0);
  expect(dialAt(92000)).toBeCloseTo(1, 6);
  expect(dialAt(93800)).toBeCloseTo(2, 6);
  expect(dialAt(96000)).toBeCloseTo(3, 6);
});

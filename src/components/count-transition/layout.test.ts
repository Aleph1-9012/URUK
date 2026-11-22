import { expect, test } from 'bun:test';
import { countLayout, pressTimes } from './layout';

const families = Array.from({ length: 378 }, (_, index) => index + 1);

test('the signs in the case add up to the family number, in sexagesimal place', () => {
  for (const family of families) {
    const { signs } = countLayout(family);
    const tally = { 60: 0, 10: 0, 1: 0 };

    for (const sign of signs) tally[sign.unit] += 1;

    expect(60 * tally[60] + 10 * tally[10] + tally[1]).toBe(family);
    expect(tally[10]).toBeLessThan(6);
    expect(tally[1]).toBeLessThan(10);
  }
});

test('the signs read highest first and sit apart inside the case', () => {
  for (const family of families) {
    const { width, height, signs } = countLayout(family);

    for (const [index, sign] of signs.entries()) {
      expect(sign.x).toBeGreaterThan(0);
      expect(sign.y).toBeGreaterThan(0);
      expect(sign.x + sign.width).toBeLessThan(width);
      expect(sign.y + sign.height).toBeLessThan(height);

      for (const other of signs.slice(index + 1)) {
        const apart = other.x >= sign.x + sign.width || sign.x >= other.x + other.width
          || other.y >= sign.y + sign.height || sign.y >= other.y + other.height;

        expect(apart).toBe(true);

        if (other.unit < sign.unit) expect(other.x).toBeGreaterThan(sign.x + sign.width);
      }
    }
  }
});

test('the count is pressed in reading order and within its beat', () => {
  for (const family of families) {
    const layout = countLayout(family);
    const { wide, phone } = pressTimes(layout);

    expect(wide[0]).toBe(0);
    expect(phone[0]).toBe(0);

    for (const [index, at] of wide.entries()) {
      // Two frames at 60 Hz at least, so every sign is seen landing.
      if (index > 0) expect(at - (wide[index - 1] ?? 0)).toBeGreaterThanOrEqual(33);
    }

    for (const [index, at] of phone.entries()) {
      if (index > 0) expect(at).toBeGreaterThanOrEqual(phone[index - 1] ?? 0);
    }

    expect(wide.at(-1)).toBeLessThanOrEqual(660);
    expect(phone.at(-1)).toBeLessThanOrEqual(225);
  }
});

import { expect, test } from 'bun:test';
import { decomposeNumberSigns } from '../src/components/number-signs/decompose';

const examples = [
  { count: 0, sixties: 0, tens: 0, ones: 0 },
  { count: 1, sixties: 0, tens: 0, ones: 1 },
  { count: 9, sixties: 0, tens: 0, ones: 9 },
  { count: 10, sixties: 0, tens: 1, ones: 0 },
  { count: 19, sixties: 0, tens: 1, ones: 9 },
  { count: 59, sixties: 0, tens: 5, ones: 9 },
  { count: 60, sixties: 1, tens: 0, ones: 0 },
  { count: 158, sixties: 2, tens: 3, ones: 8 },
  { count: 404, sixties: 6, tens: 4, ones: 4 },
  { count: 599, sixties: 9, tens: 5, ones: 9 },
] as const;

test('decomposes counts into sixties, tens and ones', () => {
  for (const example of examples) {
    expect(decomposeNumberSigns(example.count)).toEqual({
      sixties: example.sixties,
      tens: example.tens,
      ones: example.ones,
    });
  }
});

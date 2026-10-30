import { expect, test } from 'bun:test';
import { capPoint, capTurns, closedCardWidth, friezeColumn, initialCardIndex, knobRuling, rollerRulings, rollerTurn, sheetRows, wholeSealTile } from '../src/components/roll/model';
import { matches, readSearch } from '../src/components/menu/matching';

test('the current result is centred where possible and clamped at both ends', () => {
  expect(initialCardIndex(5, 5, 14)).toBe(3);
  expect(initialCardIndex(0, 5, 14)).toBe(0);
  expect(initialCardIndex(13, 5, 14)).toBe(9);
  expect(initialCardIndex(1, 5, 2)).toBe(0);
});

test('shared menu links retain query and status and match all query words', () => {
  const item = { family: '158', topic: 'Chromatic number of the plane', title: 'How many colours?', status: 'under-review' };
  expect(readSearch('?q=158+COLOUR&status=under-review')).toEqual({ query: '158 COLOUR', status: 'under-review' });
  expect(matches(item, '158 COLOUR', 'under-review')).toBe(true);
  expect(matches(item, 'colour collatz', '')).toBe(false);
  expect(matches(item, 'colour', 'approved')).toBe(false);
  expect(readSearch('?status=made-up').status).toBe('');
});

test('filtered cards stop at a closing roller only when every card fits whole', () => {
  expect(closedCardWidth(4, 1290)).toBe(276);
  expect(closedCardWidth(4, 1100)).toBe(250);
  expect(closedCardWidth(5, 1200)).toBeUndefined();
  expect(closedCardWidth(0, 500)).toBe(276);
});

test('the phone sheet shows whole rows, and a scrolling list fills the sheet', () => {
  expect(sheetRows(512, 228, 15, true)).toEqual({ rows: 2, rowHeight: 256 });
  expect(sheetRows(100, 228, 15, true)).toEqual({ rows: 1, rowHeight: 228 });
  expect(sheetRows(450, 103, 6, false)).toEqual({ rows: 4, rowHeight: 103 });
  expect(sheetRows(900, 103, 4, false)).toEqual({ rows: 4, rowHeight: 103 });
});

test('a whole number of seal rollings spans the sheet', () => {
  expect(wholeSealTile(1360)).toBeCloseTo(1360 / 6);
  expect(wholeSealTile(100)).toBe(100);
});

test('the roller rests on the approved drawing after every whole card, and turns both ways', () => {
  const drawn = [51, 54, 59, 64, 70.5, 77.5, 85, 93, 102];
  const rulings = rollerRulings(rollerTurn(3 * 228, 228), 1);

  for (const line of drawn) {
    expect(rulings.some(({ x }) => Math.abs(x * 2 - line) < 1.5)).toBe(true);
  }

  const forward = rollerRulings(rollerTurn(40, 228), 1)[2]?.x ?? 0;
  const backward = rollerRulings(rollerTurn(-40, 228), 1)[2]?.x ?? 0;
  expect(forward).not.toBeCloseTo(backward);
  expect(friezeColumn(40, 10, 228, 1).source).not.toBeCloseTo(friezeColumn(40, 20, 228, 1).source);
  expect(friezeColumn(40, 0, 228, 1).source).toBeCloseTo(friezeColumn(40, 228, 228, 1).source);
});

test('the cap and its knob come back to the drawing after a whole card', () => {
  const turns = capTurns(2 * 228, 228, 1);
  expect(turns).toBe(2);
  expect(capPoint(60, 50, turns).x).toBeCloseTo(30);
  expect(capPoint(60, 50, turns).y).toBeCloseTo(25);
  expect(capPoint(60, 50, 0.25).x).not.toBeCloseTo(30);
  expect(capTurns(100, 228, -1)).toBeCloseTo(-capTurns(100, 228, 1));
  expect(knobRuling(turns).x * 2).toBeCloseTo(127.5, 0);
  expect(knobRuling(turns).width).toBe(0.5);
});

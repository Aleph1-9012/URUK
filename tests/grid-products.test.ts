import { expect, test } from 'bun:test';
import { A, B, SCHOOL_PRODUCT, STRASSEN_PRODUCTS, STRASSEN_COUNTS, SCHOOL_COUNTS, schoolProduct, strassenProduct, TRIPLING_GRID, triplingCells, polynomialColumnCounts, crossingLog, lowerLog, upperLog, RECORDS, WALL, CLAIM } from '../src/components/visuals/grid-products/math';
import { CUES, FILM_DURATION, TIMELINE } from '../src/components/visuals/grid-products/story';

test('the worked products, recursive counts and timeline match the film', () => {
  expect(SCHOOL_PRODUCT).toEqual([19, 22, 43, 50]);
  expect(STRASSEN_PRODUCTS.map((product) => product.value)).toEqual([65, 35, -2, 8, 24, 22, -30]);
  expect(strassenProduct(A, B)).toEqual(SCHOOL_PRODUCT);
  expect(strassenProduct([0, -3, 4, 7], [2, 9, -1, 0])).toEqual(schoolProduct([0, -3, 4, 7], [2, 9, -1, 0]));
  expect(SCHOOL_COUNTS.at(-1)).toBe(1073741824);
  expect(STRASSEN_COUNTS.at(-1)).toBe(282475249);
  expect(FILM_DURATION).toBe(120000);

  for (const [index] of CUES.entries()) expect(TIMELINE.cueAt(TIMELINE.stillTime(index))).toBe(index);
});

test('the product sectors and logarithmic bounds support the proof drawing', () => {
  expect(polynomialColumnCounts(4, 4)).toEqual([1, 2, 3, 4, 3, 2, 1]);
  const removed: string[] = [];
  const sectorCounts = { left: 0, middle: 0, right: 0 };

  for (const cell of TRIPLING_GRID) {
    if (cell.kept) sectorCounts[cell.rowSector] += 1;
    else removed.push(`${cell.row},${cell.x}`);
  }

  expect(removed).toEqual(['2,0', '2,1', '3,0', '4,2', '5,1', '5,2']);
  expect(sectorCounts).toEqual({ left: 6, middle: 6, right: 6 });

  for (const [a, h] of [[2, 3], [4, 5]] as const) {
    let kept = 0;
    let crossed = 0;

    for (const cell of triplingCells(a, h)) {
      if (cell.kept) kept += 1;
      else crossed += 1;
    }

    expect(kept).toBe(3 * a * h);
    expect(crossed).toBe(a * (a - 1));
  }

  const crossing = crossingLog(.9);
  expect(crossing).not.toBeNull();
  expect(Math.exp(crossing ?? 0)).toBeCloseTo(29.4, 0);
  expect(crossingLog(.75)).toBeNull();
  expect(lowerLog(Math.log(1e12))).toBeLessThan(upperLog(Math.log(1e12), .75));
  expect(CLAIM).toBeLessThan(WALL);
  expect(WALL).toBeLessThan(2.371177);

  for (let index = 1; index < RECORDS.length; index++) {
    expect(RECORDS[index]?.bound ?? Infinity).toBeLessThan(RECORDS[index - 1]?.bound ?? 0);
  }
});

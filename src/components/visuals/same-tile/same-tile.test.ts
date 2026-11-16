import { expect, test } from 'bun:test';
import { ALIGNED_SHIFTS, buildTileModel, coverWindow, DOMINO_CELLS, DOMINO_WINDOW, dominoTranslations, finitePeriod, latticeCoordinates, L_CELLS, L_VECTORS, quotientResidue, ROW_SHIFTS, type GridPoint } from './math';

const model = buildTileModel();

function same(a: GridPoint, b: GridPoint): boolean {
  return a.x === b.x && a.y === b.y;
}

test('155: both shipped domino translation sets cover every inspected cell exactly once and detect broken covers', () => {
  for (const panel of [model.aligned, model.shifted]) {
    expect(panel.coverage.exact).toBe(true);
    expect(panel.coverage.cells).toHaveLength(13 * 24);

    for (const cell of panel.coverage.cells) {
      let independentCount = 0;

      for (const anchor of panel.translations) {
        for (const offset of DOMINO_CELLS) {
          if (same(cell, { x: anchor.x + offset.x, y: anchor.y + offset.y })) independentCount++;
        }
      }

      expect(cell.count).toBe(independentCount);
      expect(independentCount).toBe(1);
    }
  }

  const first = model.aligned.translations[0];

  if (!first) throw new Error('The aligned tiling needs a first domino for the independent broken-cover controls.');

  const missing = coverWindow(DOMINO_CELLS, model.aligned.translations.slice(1), DOMINO_WINDOW);
  const doubled = coverWindow(DOMINO_CELLS, [...model.aligned.translations, first], DOMINO_WINDOW);
  expect(missing.exact).toBe(false);
  expect(missing.missing.length).toBeGreaterThan(0);
  expect(doubled.exact).toBe(false);
  expect(doubled.overlaps.length).toBeGreaterThan(0);
  const extendedWindow = { left: -19, right: 20, bottom: 0, top: 24 };
  expect(coverWindow(DOMINO_CELLS, dominoTranslations(ROW_SHIFTS, extendedWindow), extendedWindow).exact).toBe(true);
});

test('155: visible period tests have real present-to-absent witnesses, while a periodic extension and oblique control remain possible', () => {
  expect(model.aligned.horizontal.holds).toBe(true);
  expect(model.aligned.vertical.holds).toBe(true);
  expect(model.shifted.horizontal.holds).toBe(true);

  for (const row of model.shifted.verticalTests) {
    expect(row.holds).toBe(false);
    expect(row.comparisons).toBeGreaterThan(0);
    const witness = row.witness;

    if (!witness) throw new Error('Every rejected vertical shift needs a displayed counterexample.');

    expect(model.shifted.translations.some(point => same(point, witness.source))).toBe(true);
    expect(model.shifted.translations.some(point => same(point, witness.target))).toBe(false);
    expect(witness.target.x - witness.source.x).toBe(row.vector.x);
    expect(witness.target.y - witness.source.y).toBe(row.vector.y);
    const shiftedRows = ROW_SHIFTS.slice(row.vector.y);
    const originalRows = ROW_SHIFTS.slice(0, 24 - row.vector.y);
    expect(originalRows.some((value, index) => value !== shiftedRows[index])).toBe(true);
  }

  // Repeating the complete24-row block gives an infinite periodic extension.
  // Thus these observed failed shifts cannot certify infinite nonperiodicity.
  const repeated = [...ROW_SHIFTS, ...ROW_SHIFTS];
  const twice = { ...DOMINO_WINDOW, top: 48 };
  expect(finitePeriod(repeated, { x: 0, y: 24 }, twice).holds).toBe(true);
  expect(coverWindow(DOMINO_CELLS, dominoTranslations(repeated, twice), twice).exact).toBe(true);

  // The checkerboard translation set has an oblique period(1,1), even though
  // its first vertical step fails. Axis tests do not test every direction.
  const alternating = Array.from({ length: 24 }, (_, row) => row % 2);
  expect(finitePeriod(alternating, { x: 1, y: 1 }).holds).toBe(true);
  expect(finitePeriod(alternating, { x: 0, y: 1 }).holds).toBe(false);
  expect(finitePeriod(alternating, { x: 0, y: 2 }).holds).toBe(true);
  expect(finitePeriod(ALIGNED_SHIFTS, { x: 0, y: 24 }).holds).toBeNull();
  expect(finitePeriod(ALIGNED_SHIFTS, { x: 0, y: 24 }).comparisons).toBe(0);
});

test('155: the L tile is a complete quotient transversal, giving a global lattice certificate independent of a finite patch', () => {
  const residues = L_CELLS.map(point => ((point.x - point.y) % 4 + 4) % 4);
  expect(new Set(residues).size).toBe(4);
  const u = L_VECTORS[0];
  const v = L_VECTORS[1];
  expect(quotientResidue(u)).toBe(0);
  expect(quotientResidue(v)).toBe(0);
  expect(Math.abs(u.x * v.y - u.y * v.x)).toBe(L_CELLS.length);
  expect(model.l.coverage.exact).toBe(true);

  for (let x = -25; x <= 25; x++) {
    for (let y = -25; y <= 25; y++) {
      const point = { x, y };
      const residue = ((x - y) % 4 + 4) % 4;
      const offset = L_CELLS.find(cell => ((cell.x - cell.y) % 4 + 4) % 4 === residue);

      if (!offset) throw new Error('Each lattice point must have exactly one representative in the L tile.');

      const anchor = { x: x - offset.x, y: y - offset.y };
      const coordinates = latticeCoordinates(anchor);

      if (!coordinates) throw new Error('Subtracting the unique quotient representative must land in the lattice.');

      expect(coordinates.i * u.x + coordinates.j * v.x).toBe(anchor.x);
      expect(coordinates.i * u.y + coordinates.j * v.y).toBe(anchor.y);
      expect(quotientResidue(point)).toBe(residue);
    }
  }

  const independentTranslations: GridPoint[] = [];

  for (let i = -10; i <= 10; i++) {
    for (let j = -10; j <= 10; j++) independentTranslations.push({ x: i * u.x + j * v.x, y: i * u.y + j * v.y });
  }

  const independent = coverWindow(L_CELLS, independentTranslations, model.l.window);
  expect(independent.exact).toBe(true);
  expect(independent.cells).toEqual(model.l.coverage.cells);
  expect(latticeCoordinates({ x: 1, y: 0 })).toBeNull();
});

import { smooth } from '../../../lib/animation';

export type Matrix2 = readonly [number, number, number, number];

export const A = [1, 2, 3, 4] as const satisfies Matrix2;

export const B = [5, 6, 7, 8] as const satisfies Matrix2;

export function schoolProduct(a: Matrix2, b: Matrix2): Matrix2 {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
  ];
}

export const SCHOOL_PRODUCT = schoolProduct(A, B);

export function sevenProducts(a: Matrix2, b: Matrix2): readonly [number, number, number, number, number, number, number] {
  return [
    (a[0] + a[3]) * (b[0] + b[3]),
    (a[2] + a[3]) * b[0],
    a[0] * (b[1] - b[3]),
    a[3] * (b[2] - b[0]),
    (a[0] + a[1]) * b[3],
    (a[2] - a[0]) * (b[0] + b[1]),
    (a[1] - a[3]) * (b[2] + b[3]),
  ];
}

export function strassenProduct(a: Matrix2, b: Matrix2): Matrix2 {
  const [m1, m2, m3, m4, m5, m6, m7] = sevenProducts(a, b);

  return [m1 + m4 - m5 + m7, m3 + m5, m2 + m4, m1 - m2 + m3 + m6];
}

const products = sevenProducts(A, B);

export const STRASSEN_PRODUCTS = [
  { left: 5, right: 13, value: products[0], expression: '(1+4) · (5+8)', aCells: [0, 3], bCells: [0, 3] },
  { left: 7, right: 5, value: products[1], expression: '(3+4) · 5', aCells: [2, 3], bCells: [0] },
  { left: 1, right: -2, value: products[2], expression: '1 · (6−8)', aCells: [0], bCells: [1, 3] },
  { left: 4, right: 2, value: products[3], expression: '4 · (7−5)', aCells: [3], bCells: [2, 0] },
  { left: 3, right: 8, value: products[4], expression: '(1+2) · 8', aCells: [0, 1], bCells: [3] },
  { left: 2, right: 11, value: products[5], expression: '(3−1) · (5+6)', aCells: [2, 0], bCells: [0, 1] },
  { left: -2, right: 15, value: products[6], expression: '(2−4) · (7+8)', aCells: [1, 3], bCells: [2, 3] },
] as const;

export const RECOMBINATIONS = ['65 + 8 − 24 − 30 = 19', '−2 + 24 = 22', '35 + 8 = 43', '65 − 35 − 2 + 22 = 50'] as const;

export const SCHOOL_COUNTS = Array.from({ length: 10 }, (_, index) => 8 ** (index + 1));

export const STRASSEN_COUNTS = Array.from({ length: 10 }, (_, index) => 7 ** (index + 1));

export const STRASSEN_EXPONENT = Math.log2(7);

export const WALL = 2.3078;

export const CLAIM = 9 / 4;

export type PolynomialCell = { x: number; row: number; column: number };

export function polynomialCells(a: number, b: number): PolynomialCell[] {
  const cells: PolynomialCell[] = [];

  for (let row = 0; row < b; row++) {
    for (let x = 0; x < a; x++) cells.push({ x, row, column: row + x });
  }

  return cells;
}

export function polynomialColumnCounts(a: number, b: number): number[] {
  const counts = Array.from({ length: a + b - 1 }, () => 0);

  for (const cell of polynomialCells(a, b)) counts[cell.column] = (counts[cell.column] ?? 0) + 1;

  return counts;
}

export type Sector = 'left' | 'middle' | 'right';

export type TriplingCell = PolynomialCell & { rowSector: Sector; columnSector: Sector; kept: boolean };

export function triplingCells(a: number, h: number): TriplingCell[] {
  return polynomialCells(a, 3 * h + a - 1).map((cell) => {
    const rowSector: Sector = cell.row < h ? 'left' : cell.row <= 2 * h + a - 2 ? 'middle' : 'right';
    const columnSector: Sector = cell.column <= h + a - 2 ? 'left' : cell.column <= 2 * h + a - 2 ? 'middle' : 'right';

    return { ...cell, rowSector, columnSector, kept: rowSector === columnSector };
  });
}

export const POLYNOMIAL_GRID = polynomialCells(4, 4);

export const TRIPLING_GRID = triplingCells(3, 2);

// Both axes of the squeeze plot use natural logarithms internally.
export function lowerLog(logA: number): number {
  return logA * 4 / 3;
}

export function upperLog(logA: number, t: number): number {
  return (logA + Math.log(2 - Math.exp(-logA))) / t;
}

// Exclude the equality at a = 1. A second crossing exists precisely when 3/4 < t < 3/2.
export function crossingLog(t: number): number | null {
  if (t <= 3 / 4 || t >= 3 / 2) return null;

  let low = 1e-7;
  let high = Math.log(2) / (4 * t / 3 - 1);

  for (let step = 0; step < 70; step++) {
    const middle = (low + high) / 2;

    if (lowerLog(middle) < upperLog(middle, t)) low = middle;
    else high = middle;
  }

  return (low + high) / 2;
}

export function dialAt(time: number): number {
  return .9 - .15 * smooth(time, 99000, 102000);
}

// Values from the archived record table cited as source 3 in the article.
export const RECORDS = [
  {
    "year": 1969,
    "bound": 2.8074,
    "authors": "Volker Strassen",
    "claimed": false
  },
  {
    "year": 1978,
    "bound": 2.796,
    "authors": "Victor Pan",
    "claimed": false
  },
  {
    "year": 1979,
    "bound": 2.78,
    "authors": "Dario Bini, Milvio Capovani, Francesco Romani, Grazia Lotti",
    "claimed": false
  },
  {
    "year": 1981,
    "bound": 2.522,
    "authors": "Arnold Schönhage",
    "claimed": false
  },
  {
    "year": 1981,
    "bound": 2.517,
    "authors": "Francesco Romani",
    "claimed": false
  },
  {
    "year": 1981,
    "bound": 2.496,
    "authors": "Don Coppersmith, Shmuel Winograd",
    "claimed": false
  },
  {
    "year": 1986,
    "bound": 2.479,
    "authors": "Volker Strassen",
    "claimed": false
  },
  {
    "year": 1990,
    "bound": 2.3755,
    "authors": "Don Coppersmith, Shmuel Winograd",
    "claimed": false
  },
  {
    "year": 2010,
    "bound": 2.3737,
    "authors": "Andrew Stothers",
    "claimed": false
  },
  {
    "year": 2012,
    "bound": 2.3729,
    "authors": "Virginia Vassilevska Williams",
    "claimed": false
  },
  {
    "year": 2014,
    "bound": 2.3728639,
    "authors": "François Le Gall",
    "claimed": false
  },
  {
    "year": 2020,
    "bound": 2.3728596,
    "authors": "Josh Alman, Virginia Vassilevska Williams",
    "claimed": false
  },
  {
    "year": 2022,
    "bound": 2.371866,
    "authors": "Ran Duan, Hongxun Wu, Renfei Zhou",
    "claimed": false
  },
  {
    "year": 2024,
    "bound": 2.371552,
    "authors": "Virginia Vassilevska Williams, Yinzhan Xu, Zixuan Xu, Renfei Zhou",
    "claimed": false
  },
  {
    "year": 2024,
    "bound": 2.371339,
    "authors": "Josh Alman, Ran Duan, Virginia Vassilevska Williams, Yinzhan Xu, Zixuan Xu, Renfei Zhou",
    "claimed": false
  },
  {
    "year": 2026,
    "bound": 2.371177,
    "authors": "Emilien Dupont, Marvin Eisenberger, Borislav Kozlovskii, Abbas Mehrabian, Francisco J. R. Ruiz, Abigail See, Renfei Zhou, Josh Alman, Virginia Vassilevska Williams, Matej Balog",
    "claimed": false
  },
  {
    "year": 2026,
    "bound": 2.25,
    "authors": "OpenAI",
    "claimed": true
  }
] as const;

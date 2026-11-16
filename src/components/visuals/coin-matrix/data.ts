// Exact finite examples and count table from 239-checks/signs.json.
// Counts concern small matrices only, not an estimate of the asymptotic claim.
export const SPINE_MATRIX = [
  [1, 1, 1, 1, 1, 1],
  [1, -1, 1, -1, -1, -1],
  [1, 1, -1, 1, 1, -1],
  [1, -1, 1, 1, -1, 1],
  [1, -1, 1, -1, 1, 1],
  [1, -1, -1, 1, 1, 1],
] as const;

export const SPINE_KERNEL = [1, 1, -1, -1, -1, 1] as const;

export const SINGULAR_CORNER = [[1, 1], [1, 1]] as const;
export const INVERTIBLE_CORNER = [[1, 1], [1, -1]] as const;
export const CORNER_KERNEL = [1, -1] as const;

export const SMALL_COUNTS = [
  { n: 1, total: 2, singular: 0, unpaired: 0, fraction: 0.0 },
  { n: 2, total: 8, singular: 4, unpaired: 0, fraction: 0.5 },
  { n: 3, total: 64, singular: 32, unpaired: 0, fraction: 0.5 },
  { n: 4, total: 1024, singular: 512, unpaired: 0, fraction: 0.5 },
  { n: 5, total: 32768, singular: 15872, unpaired: 1920, fraction: 0.484375 },
  { n: 6, total: 2097152, singular: 907008, unpaired: 184320, fraction: 0.4324951171875 },
] as const;

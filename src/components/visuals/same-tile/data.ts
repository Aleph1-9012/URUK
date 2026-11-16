// Exact planar data from directions/155-checks/tiles.json. No RNG is regenerated.

export const ROW_SHIFTS = [0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0] as const;

export const DOMINO_CELLS = [{ x: 0, y: 0 }, { x: 1, y: 0 }] as const;

export const L_CELLS = [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }] as const;

export const L_VECTORS = [{ x: -4, y: 0 }, { x: -3, y: 1 }] as const;

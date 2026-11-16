// Toy inputs only. Required sets, envelopes, heights and legal continuations
// are recomputed from these placed Snakies, not copied from certificate cards.
export const SNAKY = [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [4, 1]] as const;

export const HEIGHT_TWO_INPUT = {
  pivot: [0, 0],
  children: [
    { orientation: 0, translation: [0, 0], missing: [2, 0] },
    { orientation: 2, translation: [4, 1], missing: [1, 1] },
  ],
} as const;

export const HEIGHT_THREE_INPUT = {
  pivot: [1, 0],
  secondChildPlacement: { orientation: 2, translation: [5, 1] },
} as const;

export const ARTICLE_NUMBERS = { claims: 728, height: 21, envelope: 251, board: 17, pivot: [8, 8] } as const;

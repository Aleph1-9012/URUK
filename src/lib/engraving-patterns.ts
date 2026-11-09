export const patterns = ['blank', 'h', 'd', 'o', 'v', 'a', 'x'] as const;

export type Pattern = (typeof patterns)[number];

export const patternNames: Record<Pattern, string> = {
  blank: 'plain paper',
  h: 'level lines',
  d: 'rising lines',
  o: 'dots',
  v: 'upright lines',
  a: 'falling lines',
  x: 'a grid',
};

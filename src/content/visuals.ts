// Each key names one Plate I visual; a result's front matter picks one with `visual:`.
export const visualKeys = ['zero-free-strip', 'fraction-nets', 'catalan-bounds', 'unit-ruler', 'thompson-bands'] as const;

export type VisualKey = (typeof visualKeys)[number];

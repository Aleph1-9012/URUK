// Each key names one Plate I visual; a result's front matter picks one with `visual:`.
export const visualKeys = ['unit-ruler', 'thompson-bands'] as const;

export type VisualKey = (typeof visualKeys)[number];

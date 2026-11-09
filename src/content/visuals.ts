// Each key names one Plate I visual; a result's front matter picks one with `visual:`.
export const visualKeys = ['zero-free-strip', 'fraction-nets', 'catalan-bounds', 'standard-map', 'unit-ruler', 'thompson-bands', 'fraction-rulers', 'unique-rules', 'grid-products', 'curve-budget', 'boundary-sphere', 'fair-average', 'five-colours', 'trapped-waves', 'gap-ladder'] as const;

export type VisualKey = (typeof visualKeys)[number];

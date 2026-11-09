export const visualCatalog = [
  { key: 'zero-free-strip', component: './prime-waves/PrimeWaves.astro' },
  { key: 'fraction-nets', component: './fraction-nets/FractionNets.astro' },
  { key: 'catalan-bounds', component: './catalan-bounds/CatalanBounds.astro' },
  { key: 'standard-map', component: './standard-map/StandardMap.astro' },
  { key: 'unit-ruler', component: './unit-ruler/UnitRuler.astro' },
  { key: 'thompson-bands', component: './thompson/ThompsonBands.astro' },
  { key: 'switch-groups', component: './switch-groups/SwitchGroups.astro' },
  { key: 'fraction-rulers', component: './fraction-rulers/FractionRulers.astro' },
  { key: 'unique-rules', component: './unique-rules/UniqueRules.astro' },
  { key: 'grid-products', component: './grid-products/GridProducts.astro' },
  { key: 'curve-budget', component: './curve-budget/CurveBudget.astro' },
  { key: 'boundary-sphere', component: './boundary-sphere/BoundarySphere.astro' },
  { key: 'fair-average', component: './fair-average/FairAverage.astro' },
  { key: 'five-colours', component: './five-colours/FiveColours.astro' },
  { key: 'trapped-waves', component: './trapped-waves/TrappedWaves.astro' },
  { key: 'gap-ladder', component: './gap-ladder/GapLadder.astro' },
  { key: 'unit-links', component: './unit-links/UnitLinks.astro' },
  { key: 'factor-two', component: './factor-two/FactorTwo.astro' },
  { key: 'moat-walk', component: './moat-walk/MoatWalk.astro' },
  { key: 'fewest-crossings', component: './fewest-crossings/FewestCrossings.astro' },
  { key: 'caustic-collar', component: './caustic-collar/CausticCollar.astro' },
] as const;

export const visualKeys = visualCatalog.map(({ key }) => key);

export type VisualKey = typeof visualCatalog[number]['key'];

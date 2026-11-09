import { patternNames, type Pattern } from '../../../lib/engraving-patterns';

// Plain paper has no pattern to fill with; every other pattern is defined once in the plate's SVG.
export function swatchFill(pattern: Pattern): string {
  return pattern === 'blank' ? 'none' : `url(#unit-ruler-${pattern})`;
}

export function describeEnds(start: Pattern, end: Pattern): string {
  return `The ruler’s ends are on ${patternNames[start]} and ${patternNames[end]}, never the same.`;
}

import { createTimeline } from '../../plate/timeline';
import { mix, smooth } from '../../../lib/animation';

export const CUES = [
  { at: 0, title: "A room for a turning needle", text: "In 1917 Sōichi Kakeya asked how small a region of the plane can be if a needle of length one is to be turned around inside it to point in every direction.", sources: [3] },
  { at: 10000, title: "Cut the room into slivers", text: "Besicovitch answered in 1928: as small as you like.", sources: [3] },
  { at: 15000, title: "Slide while keeping every direction", text: "A set that contains a unit segment in every direction, now called a Kakeya set, can have area zero.", sources: [1, 3] },
  { at: 24000, title: "Count the small squares", text: "But area is a crude measure. Hausdorff dimension refines volume.", sources: [1, 2] },
  { at: 30000, title: "Area and dimension", text: "A smooth curve has dimension one, a surface two, and a set of measure zero can have any dimension up to $n$.", sources: [2] },
  { at: 37250, title: "The dimension conjecture", text: "The Kakeya set conjecture. Every Kakeya set in $\\mathbb R^{n}$ has Hausdorff dimension $n$.", sources: [2] },
  { at: 43250, title: "The dimensions already settled", text: "Davies proved the plane in 1971. Three dimensions took until February 2025, when Hong Wang and Joshua Zahl proved the set conjecture.", sources: [1, 2, 4] },
  { at: 52000, title: "Thicken the needle", text: "The maximal version thickens each segment into a tube.", sources: [1, 2] },
  { at: 57000, title: "A bush of shaded tubes", text: "Take a family of tubes with $\\delta$-separated directions and shade a fraction $\\lambda$ of each.", sources: [1] },
  { at: 66000, title: "The power of the shaded fraction", text: "The set conjecture needs the shaded parts to fill a volume at least $\\delta^{\\varepsilon}\\lambda^{K}$ times the total, for some power $K$; the maximal conjecture needs exactly the power $\\lambda^{3}$ in three dimensions, uniformly in how small $\\lambda$ is.", sources: [1] },
  { at: 79750, title: "Two further claims", text: "On 23 and 24 September 2026 OpenAI posted two papers claiming the next two steps.", sources: [1, 2] },
  { at: 90750, title: "The shape of a worst case", text: "It then studies the configurations of tubes that would achieve that worst case and shows, by comparing the information they would have to carry with the information available, that they cannot exist.", sources: [1] },
  { at: 103250, title: "A line as a moving point", text: "Its basic object is a chart: a set of line pieces in a moving box and a time interval on which one quadratic test stays small.", sources: [2] },
  { at: 111500, title: "Where the claims stand", text: "As of 17 October 2026 no mathematician has said publicly that they have read or checked either paper.", sources: [7, 8, 9, 10, 11, 13] },
] as const;

export const FILM_DURATION = 119500;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 180);

export function shadedFractionAt(time: number): number {
  if (time < 61000) return mix(1, .5, smooth(time, 60000, 61000));
  if (time < 64000) return mix(.5, .25, smooth(time, 63000, 64000));

  return .25;
}

export function shadedFractionLabel(fraction: number): string {
  if (fraction === 1) return 'λ = 1';
  if (fraction === .5) return 'λ = ½';
  if (fraction === .25) return 'λ = ¼';

  return `λ ≈ ${fraction.toFixed(2)}`;
}

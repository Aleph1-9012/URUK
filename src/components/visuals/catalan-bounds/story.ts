// The 005 film: the alternating sum, denominator cost, and the claimed incompatible bounds.
export type Cue = { at: number; text: string; sources: readonly number[] };

export const CUES = [
  { at: 0, text: 'Start with 1. Subtract $1/9$, add $1/25$, subtract $1/49$, and keep going with the odd squares.', sources: [1, 3] },
  { at: 7000, text: 'The steps get smaller. The sum settles toward $0.9159655\\ldots$, called Catalan\'s constant, $G$.', sources: [1, 3] },
  { at: 15000, text: 'Could $G$ be exactly a fraction of two whole numbers? Getting closer and closer does not answer that.', sources: [1] },
  { at: 23000, text: 'Each partial sum is a fraction $p/q$. Its error gets smaller, but its denominator $q$ gets larger.', sources: [1] },
  { at: 31000, text: 'Clearing the denominator multiplies the error by $q$. In these six examples, the tiny error becomes much larger.', sources: [1] },
  { at: 40000, text: 'If $G=a/b$, then $b(qG-p)$ is an integer. Making it nonzero but ever closer to zero would be impossible.', sources: [1] },
  { at: 49000, text: 'OpenAI claims to prove $G$ irrational using determinants: numbers built from square arrays of entries.', sources: [1] },
  { at: 57000, text: 'The entries involve $1$, $G$ and another sum, $\\zeta(2)$. Matching how two expressions begin cancels the unwanted term.', sources: [1] },
  { at: 66000, text: 'Suppose $G$ is a fraction. The entries, and therefore every determinant $\\Delta_N$, are then fractions too.', sources: [1] },
  { at: 74000, text: 'The denominators limit how small a nonzero determinant can be. The paper controls their factors at each prime.', sources: [1] },
  { at: 83000, text: 'Zero must also be ruled out. Three fixed matrices certify that the determinants are nonzero along an unbounded sequence of primes.', sources: [1] },
  { at: 92000, text: 'An integral bounds the same determinant from above. The estimate must keep both branches of the construction.', sources: [1] },
  { at: 102000, text: 'As the arrays grow, the two bounds are incompatible. Their gap is about $0.0001$. If the estimates hold, $G$ cannot be a fraction.', sources: [1] },
  { at: 112000, text: 'Unreviewed as of 18 October 2026. No mathematician has publicly said they checked OpenAI\'s proof.', sources: [2, 7] },
] as const satisfies readonly Cue[];

export const FILM_DURATION = 120000;

export const SCENES = [
  { title: 'A sum that settles down', first: 0 },
  { title: 'The cost of clearing denominators', first: 3 },
  { title: 'An impossible integer', first: 5 },
  { title: 'The claimed construction', first: 6 },
  { title: 'Two incompatible bounds', first: 9 },
  { title: 'Where it stands', first: 13 },
] as const;

export function cueAt(time: number): number {
  let index = 0;

  for (const [position, cue] of CUES.entries()) {
    if (time >= cue.at) index = position;
  }

  return index;
}

export function cueEnd(index: number): number {
  return CUES[index + 1]?.at ?? FILM_DURATION;
}

export function stillTime(index: number): number {
  return index === CUES.length - 1 ? FILM_DURATION : cueEnd(index) - 250;
}

export function formatTime(time: number): string {
  const seconds = Math.floor(Math.min(FILM_DURATION, Math.max(0, time)) / 1000);

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function share(time: number, start: number, end: number): number {
  return Math.min(1, Math.max(0, (time - start) / (end - start)));
}

export function span(time: number, start: number, end: number): number {
  const value = share(time, start, end);

  return value * value * (3 - 2 * value);
}

export function fade(time: number, start: number, end: number, outStart = Infinity, outEnd = Infinity): number {
  return span(time, start, end) * (outStart === Infinity ? 1 : 1 - span(time, outStart, outEnd));
}

export function mix(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

export type Layout = 'wide' | 'tall';

// A persistent measuring line; the initial camera zoom is logarithmic in its width.
export function geometryAt(time: number, layout: Layout): { lineY: number; lineLeft: number; lineRight: number; viewLeft: number; viewRight: number } {
  const zoom = span(time, 7600, 12500);
  const width = 1.14 * (0.12 / 1.14) ** zoom;
  const center = mix(0.55, 0.94, zoom);
  const lift = span(time, 15000, 17000);

  return {
    lineY: mix(layout === 'wide' ? 0.55 : 0.48, layout === 'wide' ? 0.42 : 0.36, lift),
    lineLeft: 0.1,
    lineRight: 0.9,
    viewLeft: center - width / 2,
    viewRight: center + width / 2,
  };
}

// Four slow steps first; then twenty further terms converge while the camera moves in.
export function termsAt(time: number): number {
  if (time <= 7000) return 4 * share(time, 500, 6200);

  return 4 + 20 * share(time, 7500, 14000);
}

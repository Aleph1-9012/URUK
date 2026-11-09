// Claude's 017 storyboard, 8 November 2026. Times are milliseconds.
export const CUES = [
  { at: 0, text: 'Most people learn $\\tfrac{22}{7}$ at school, and some learn $\\tfrac{355}{113}$, which is right to six decimal places.', sources: [4] },
  { at: 6500, text: 'With denominator $q$ you can always get within $1/(2q)$ of any number: half a step of the ruler. How much better can you do, again and again?', sources: [3] },
  { at: 15000, text: '$\\tfrac{22}{7}$ misses π by about 0.00126, and $\\tfrac{355}{113}$ by about 0.000000267: far inside half a step.', sources: [4] },
  { at: 22000, text: 'Measure each fraction by the exponent it achieves: its error is $1/q^{\\nu}$. $\\tfrac{22}{7}$ achieves $\\nu\\approx3.43$, $\\tfrac{355}{113}$ about $3.20$.', sources: [4] },
  { at: 30500, text: 'Dirichlet showed that every irrational number has infinitely many fractions achieving more than 2, and almost every number has exponent exactly 2.', sources: [3] },
  { at: 39000, text: 'π\'s irrationality exponent $\\mu(\\pi)$ is the highest level its fractions reach infinitely often. π was expected to have 2, but proving it is another matter.', sources: [1, 3] },
  { at: 48000, text: 'Mahler gave the first bound, 42, in 1953. The records came down slowly: 20 in 1974, 8.016 in 1993, 7.606 in 2008, 7.103 in 2020.', sources: [1, 2] },
  { at: 56500, text: 'Each came from an explicit construction, and the numbers moved slowly. OpenAI claims the exact value, 2, by a method of a different kind.', sources: [1, 2] },
  { at: 65000, text: 'The claim: for every level $\\nu$ above 2, only finitely many fractions beat $q^{-\\nu}$, however far one goes.', sources: [1, 3] },
  { at: 72000, text: 'The threshold $Q(\\nu)$ past which none do is not given effectively, so nobody can say where the last fraction above the line is.', sources: [1] },
  { at: 80000, text: 'A consequence: $\\sum 1/(n^{3}\\sin^{2}n)$ converges. Its terms spike when a whole number lands close to a multiple of π, as 355 does near $113\\pi$.', sources: [1, 6] },
  { at: 88500, text: 'The sum jumps from 4.81 to 29.41 at $n=355$ and is still 30.3145 after two million terms. A finite computation cannot rule out a later jump.', sources: [1, 6, 7] },
  { at: 97000, text: 'From supposed good fractions, the proof builds a determinant. Clearing denominators forces its nonzero size to be at least 1.', sources: [1] },
  { at: 105500, text: 'Yet the fractions sit so close to multiples of π that it must be tiny. For large enough parameters the two estimates conflict.', sources: [1] },
  { at: 113000, text: 'Unreviewed: no mathematician has said publicly that they checked the proof, and a machine-checked Lean statement is not counted as approval.', sources: [8, 10] },
] as const;

export const FILM_DURATION = 120000;

export const SCENES = [
  { title: 'Fractions on a ruler', first: 0 },
  { title: 'A height for each approximation', first: 3 },
  { title: 'Seventy years of bounds', first: 6 },
  { title: 'The claimed ceiling', first: 8 },
  { title: 'A series with a sudden jump', first: 10 },
  { title: 'Two estimates for one determinant', first: 12 },
  { title: 'Where it stands', first: 14 },
] as const;

export function cueAt(time: number): number {
  let found = 0;

  for (const [index, cue] of CUES.entries()) {
    if (time >= cue.at) found = index;
  }

  return found;
}

export function cueEnd(index: number): number {
  return CUES[index + 1]?.at ?? FILM_DURATION;
}

export function stillTime(index: number): number {
  return cueEnd(index) - (index === CUES.length - 1 ? 0 : 200);
}

export function formatTime(time: number): string {
  const seconds = Math.floor(Math.min(FILM_DURATION, Math.max(0, time)) / 1000);

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function span(time: number, start: number, end: number): number {
  const part = Math.min(1, Math.max(0, (time - start) / (end - start)));

  return part * part * (3 - 2 * part);
}

export function fade(time: number, start: number, end: number, outStart = Infinity, outEnd = Infinity): number {
  return span(time, start, end) * (outStart === Infinity ? 1 : 1 - span(time, outStart, outEnd));
}

export function mix(first: number, last: number, part: number): number {
  return first + (last - first) * part;
}

// Ease the logarithmic zoom with a bounded middle speed and still endpoints.
function zoomProgress(time: number, start: number, end: number): number {
  const u = Math.min(1, Math.max(0, (time - start) / (end - start)));

  if (u < 0.1) return u * u / 0.18;
  if (u > 0.9) return 1 - (1 - u) ** 2 / 0.18;

  return (u - 0.05) / 0.9;
}

export type Layout = 'wide' | 'tall';

export type Box = { x: number; y: number; w: number; h: number };

// Ruler coordinates are offsets from π, or from the same target multiplied by113.
// Keeping the origin separate preserves fractions whose error is far below a double's precision near π.
export function sceneAt(time: number, layout: Layout) {
  let width = 0.08;
  let offset = (3.14 - Math.PI) / width;
  const rulerMoves = [
    { start: 6500, end: 9200, width: 0.34, offset: (3.15 - Math.PI) / 0.34 },
    { start: 15000, end: 18000, width: 0.0034, offset: 0.18 },
    { start: 18000, end: 22000, width: 0.0000034, offset: 0.04 },
    { start: 22000, end: 27000, width: 0.0034, offset: 0.18 },
    { start: 80000, end: 86000, width: 0.0002, offset: 0.07536 },
  ];

  for (const move of rulerMoves) {
    if (time < move.start) break;

    const amount = span(time, move.start, move.end);
    width *= (move.width / width) ** zoomProgress(time, move.start, move.end);
    offset = mix(offset, move.offset, amount);
  }

  const proof = span(time, 97200, 100500);
  const tall = layout === 'tall';
  const retreat = span(time, 47300, 50000);
  const returnToEight = span(time, 56500, 60500);
  const returnToDetail = span(time, 68500, 72000);
  let top = 1.8 + 1.8 * ((45 - 1.8) / 1.8) ** retreat;
  top = 1.8 + (top - 1.8) * ((8 - 1.8) / (45 - 1.8)) ** returnToEight;
  top = 1.8 + (top - 1.8) * ((3.6 - 1.8) / (8 - 1.8)) ** returnToDetail;
  const visit = span(time, 80700, 84200) * (1 - span(time, 96200, 99000));
  let dial = mix(7.103205334137, 3, span(time, 65500, 68500));
  dial = mix(dial, 2.15, span(time, 69400, 71500));

  return {
    ruler: { center: width * offset, width, multiplier: mix(1, 113, span(time, 80100, 83500)) },
    chart: { x: 0.12, y: mix(tall ? 0.47 : 0.43, tall ? 0.78 : 0.74, visit), w: mix(0.76, tall ? 0.76 : 0.43, proof), h: mix(mix(tall ? 0.39 : 0.43, tall ? 0.19 : 0.43, proof), 0.12, visit), bottom: 1.8, top },
    sum: { x: 0.12, y: mix(1.06, tall ? 0.45 : 0.41, visit), w: 0.76, h: tall ? 0.29 : 0.29 },
    dial,
  };
}

export function plottedCount(time: number): number {
  return Math.min(22, Math.max(0, 2 + Math.floor((time - 32000) / 300)));
}

export function ceilingAt(time: number): number {
  const records = [
    { value: 42, start: 49700, end: 50000 },
    { value: 20, start: 51500, end: 52000 },
    { value: 8.016, start: 52800, end: 53300 },
    { value: 7.606, start: 54100, end: 54600 },
    { value: 7.103205334137, start: 55400, end: 56000 },
  ];
  let value = 42;

  for (const record of records) {
    value = mix(value, record.value, span(time, record.start, record.end));
  }

  return value;
}

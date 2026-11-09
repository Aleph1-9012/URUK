// Claude's approved Cannon storyboard, 8 November 2026. Times are milliseconds.
export const CUES = [
  { at: 0, title: 'A network of moves', text: 'A group can be drawn as a network of moves: a dot for each element, and a line wherever one basic move takes you between two dots.', sources: [1] },
  { at: 8000, title: 'Thin and fat triangles', text: 'A group is hyperbolic when triangles of shortest paths stay thin, however large. A tree is the extreme case; a square grid has fat triangles.', sources: [1] },
  { at: 16500, title: 'Directions to infinity', text: 'Follow a shortest path from the start forever. Paths that stay within a fixed distance mark one direction to infinity: together, the boundary.', sources: [1, 3] },
  { at: 25000, title: 'A sphere at infinity', text: 'Hyperbolic three-space has a sphere at infinity. The groups of closed hyperbolic three-manifolds act on it: the model examples.', sources: [1, 3] },
  { at: 32500, title: "Cannon's question", text: 'Cannon asked the converse: if a hyperbolic group\'s boundary is a sphere, must the group act as symmetries of hyperbolic three-space?', sources: [1, 3] },
  { at: 40500, title: 'Topology does not fix distance', text: 'A sphere here means topology only: no distances, angles or areas. In its natural metric the boundary need not look round.', sources: [1, 5, 7] },
  { at: 47500, title: 'The blocking cost', text: 'Earlier work showed what would suffice: a uniform bound on the cost of blocking every large path, as the boundary\'s coverings get finer.', sources: [2, 4, 5, 6] },
  { at: 55500, title: 'A square grid costs one', text: 'For a square grid, weight $1/m$ on every cell makes every crossing collect at least 1, and the squared weights total exactly 1.', sources: [1, 5, 6] },
  { at: 63000, title: 'The bound at every scale', text: 'Refining the grid never raises that cost. The needed bound says the same of the boundary\'s coverings, however irregular they are.', sources: [1] },
  { at: 70500, title: 'The proved bound', text: 'OpenAI\'s paper of 23 September 2026 proves that bound for every hyperbolic group whose boundary is a sphere.', sources: [1] },
  { at: 77000, title: 'Suppose the cost grows', text: 'It supposes the cost grows without bound. Costly crossings one way make cheap ones the other way, and from those it builds a function.', sources: [1] },
  { at: 85000, title: 'Magnifying the level lines', text: 'Its level lines all cross the patch, yet its energy tends to zero. The group\'s magnifications force those levels to agree where they cannot.', sources: [1] },
  { at: 93500, title: 'Exponential against quadratic', text: 'When the growth is slower, a tree of nested value ranges does the work: an exponential would have to stay below a quadratic. It can\'t.', sources: [1] },
  { at: 101500, title: 'Round coordinates and symmetries', text: 'So the bound holds, earlier theory gives round coordinates, and the group\'s moves become symmetries of hyperbolic three-space.', sources: [1] },
  { at: 109000, title: 'Where it stands', text: 'Approved: Mario Bonk presented the proof at his seminar on 22 October 2026 and said it seems to be correct.', sources: [12] },
] as const;

export const FILM_DURATION = 120000;

export function cueAt(time: number): number {
  let index = 0;

  for (const [position, cue] of CUES.entries()) {
    if (time >= cue.at) index = position;
  }

  return index;
}

export function stillTime(index: number): number {
  return index === CUES.length - 1 ? FILM_DURATION : (CUES[index + 1]?.at ?? FILM_DURATION) - 200;
}

export function formatTime(time: number): string {
  const seconds = Math.floor(Math.max(0, Math.min(FILM_DURATION, time)) / 1000);

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function smooth(time: number, start: number, end: number): number {
  const amount = Math.min(1, Math.max(0, (time - start) / (end - start)));

  return amount * amount * (3 - 2 * amount);
}

export function fade(time: number, start: number, end: number, outStart = Infinity, outEnd = Infinity): number {
  return smooth(time, start, end) * (outStart === Infinity ? 1 : 1 - smooth(time, outStart, outEnd));
}

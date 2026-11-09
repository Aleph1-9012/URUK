// Claude's approved Thompson storyboard, 8 November 2026. Times are milliseconds.
export const CUES = [
  { at: 0, title: 'Stretching and squeezing an interval', text: 'In 1965 Richard Thompson wrote maps that stretch and squeeze the interval from 0 to 1, bending only at points like 1/2 or 3/8.', sources: [1, 3] },
  { at: 7500, title: 'The group F', text: 'Every slope is a power of two. Combined and undone, the maps form a group, F; two of them, $x_0$ and $x_1$, build all the rest.', sources: [1] },
  { at: 15000, title: 'A fair average', text: 'A group is amenable if it has a fair way to average. The free group on two letters has none: it is paradoxical, as in the Banach–Tarski sphere.', sources: [1] },
  { at: 23500, title: 'How much a moved set changes', text: 'Følner\'s test: a group is amenable when, for any chosen moves, some finite set barely changes when moved. Abelian groups pass; the free group fails.', sources: [1] },
  { at: 32500, title: 'The usual routes close', text: 'Geoghegan conjectured in 1979 that F is not amenable. F has no nonabelian free subgroup and is not built from finite and abelian groups.', sources: [1, 3, 7] },
  { at: 41500, title: 'The sets would have to be enormous', text: 'Moore showed in 2013 that any such sets for F would have to be enormous, growing like a tower of exponentials.', sources: [1, 7] },
  { at: 48000, title: 'A history of false proofs', text: 'False proofs appeared about once a year, half in each direction, including Moore\'s own 2012 proof of amenability, withdrawn after an error was found.', sources: [1, 4, 5] },
  { at: 57000, title: 'The new claim', text: 'On 23 September 2026 OpenAI posted a short paper claiming that F is not amenable.', sources: [1] },
  { at: 62000, title: 'Averaging the colours of cuttings', text: 'Suppose F were amenable. A set that barely moves could then average colors: vectors attached to ways of cutting the interval into dyadic pieces.', sources: [1] },
  { at: 70500, title: 'One fixed map f', text: 'Each cutting\'s color comes from its pieces\' colors through one fixed map f, so the average would be almost unmoved by f.', sources: [1] },
  { at: 77500, title: 'Transporting two pieces', text: 'Thompson\'s maps carry any two separated pieces onto any other two, so all separated pairs of colors look alike on average. That pins the average.', sources: [1] },
  { at: 86000, title: 'What infinite dimensions allow', text: 'In infinite dimensions a continuous map f can move every point of the ball by at least 1/2. In a flat disk some point must stay put.', sources: [1] },
  { at: 94500, title: 'A positive share must change', text: 'So for every finite set, some move from one fixed list shifts a definite share of it. No fair average exists: F is not amenable.', sources: [1] },
  { at: 102500, title: 'An independent written proof', text: 'Approved: Sang-hyun Kim and Yash Lodha, experts on these groups, published their own two-page proof built on OpenAI\'s idea.', sources: [2] },
  { at: 110000, title: "Moore's unopened cognac", text: 'Justin Moore will open his cognac once peers he trusts agree the proof is correct. That consensus has not been announced.', sources: [5] },
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

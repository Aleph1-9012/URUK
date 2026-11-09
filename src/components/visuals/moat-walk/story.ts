// Claude's Gaussian moat storyboard, with its original cues and timings.
export const CUES = [
  {"at": 0, "title": "The Gaussian primes", "text": "Plot the Gaussian primes, the primes of the complex plane: dots with eightfold symmetry, dense near the origin and thinning outward.", "sources": [1]},
  {"at": 8500, "title": "Three kinds of prime", "text": "They are of three kinds: $1+i$, ordinary primes like 3, 7 and 11 on the axes, and the two factors $a\\pm bi$ of primes like 5 and 13.", "sources": [1]},
  {"at": 16500, "title": "A walk to infinity?", "text": "In 1962 Basil Gordon asked whether one can walk from the origin to infinity on these dots, with every step shorter than a fixed length.", "sources": [1, 2, 4]},
  {"at": 24500, "title": "Gaps on the real axis", "text": "Along the real axis, no: ordinary primes have gaps of every length, since $n!+2$ up to $n!+n$ are all composite.", "sources": [1]},
  {"at": 31000, "title": "A disk is not a ring", "text": "In the plane a walker can go around a gap. There are prime-free disks as large as you like, but a disk is not a ring.", "sources": [1, 3]},
  {"at": 38500, "title": "A moat stops a flood", "text": "A moat of width D is a prime-free ring around the origin that no step of length D can cross.", "sources": [1]},
  {"at": 44500, "title": "Computed and cited moats", "text": "Computer searches found the moats that stop steps up to $\\sqrt{26}$ in 1998, and up to 6 in 2005, each from one starting point.", "sources": [1, 3]},
  {"at": 52500, "title": "Every cluster near the origin", "text": "Theory found periodic blocks for steps of $\\sqrt2$ and 2, and Vardi conjectured in 1998 that every cluster is finite, with a uniform bound.", "sources": [2, 4]},
  {"at": 61000, "title": "Thinning primes, a chosen route", "text": "The primes thin out like $1/\\log r$, so a walker should be trapped; but the primes are not random, and the walk picks its route.", "sources": [1]},
  {"at": 69000, "title": "The uniform cluster claim", "text": "On 26 September 2026 OpenAI claimed that for every step length every cluster has at most $B_D$ primes, so no walk reaches infinity.", "sources": [1]},
  {"at": 77000, "title": "A bound with no given number", "text": "The bound is not explicit: the proof gives no way to compute $B_D$, or which primes its sieve uses.", "sources": [1]},
  {"at": 83000, "title": "The periodic sieve", "text": "First, avoid both zero classes of a few primes. The points left repeat with a period $Q$, the product of those primes.", "sources": [1]},
  {"at": 90500, "title": "Finite clusters in a repeating pattern", "text": "If they hold no infinite walk, no cluster can contain two points a period apart, so each has at most $Q^2$ points.", "sources": [1]},
  {"at": 97500, "title": "The information budget", "text": "The hard part shows such a sieve exists for every step: dodging zero classes costs information at every scale, more than the walk can carry.", "sources": [1]},
  {"at": 106000, "title": "Where it stands", "text": "Unreviewed: no mathematician has said they checked it. A Lean proof of the statement, accepted by two reference sites, is not counted here.", "sources": [5, 6, 7, 8]},
] as const;

export const FILM_DURATION = 116000;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layout {
  field: Box;
  dial: Box;
  ledger: Box;
  tall: boolean;
}

export function layout(width: number, height: number): Layout {
  const tall = width < 600;

  if (tall) {
    return {
      field: { x: width * .04, y: height * .035, w: width * .92, h: height * .55 },
      dial: { x: width * .035, y: height * .635, w: width * .25, h: height * .30 },
      ledger: { x: width * .31, y: height * .62, w: width * .655, h: height * .34 },
      tall,
    };
  }

  return {
    field: { x: width * .035, y: height * .04, w: width * .60, h: height * .91 },
    dial: { x: width * .68, y: height * .055, w: width * .27, h: height * .25 },
    ledger: { x: width * .665, y: height * .36, w: width * .30, h: height * .59 },
    tall,
  };
}

export function stepSquared(time: number): 1 | 2 | 4 | 8 | 10 {
  if (time < 31000) return 2;
  if (time < 38500) return 8;
  if (time < 41500) return 2;
  if (time < 44500) return 4;
  if (time < 47500) return 8;
  if (time < 52500) return 10;
  if (time < 83000) return 4;
  if (time < 97500) return 1;

  return 4;
}

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
  return index === CUES.length - 1 ? FILM_DURATION : cueEnd(index) - 180;
}

export function formatTime(time: number): string {
  const seconds = Math.floor(Math.max(0, Math.min(FILM_DURATION, time)) / 1000);

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function span(time: number, start: number, end: number): number {
  return Math.min(1, Math.max(0, (time - start) / (end - start)));
}

export function smooth(time: number, start: number, end: number): number {
  const amount = span(time, start, end);

  return amount * amount * (3 - 2 * amount);
}

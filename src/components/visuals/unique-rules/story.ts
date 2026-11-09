// Claude's approved 102 storyboard, 8 November 2026. Times are milliseconds.
export const CUES = [
  { at: 0, title: 'One reply for each label', text: 'A Unique Game is played on a network. Every dot gets a label, and every line carries a rule: for each label at one end it allows exactly one at the other.', sources: [1] },
  { at: 9000, title: 'When every rule can be kept', text: 'If every rule can be kept at once, try a starting label and follow the lines. Each rule forces the next label; trying all starts is fast.', sources: [1] },
  { at: 17500, title: 'One changed rule', text: 'The hard question is what happens when, say, 99% of the rules can be kept but not all of them. Following the lines no longer works.', sources: [1] },
  { at: 25500, title: 'Following the lines can fail', text: 'A single bad rule sends wrong labels around the whole network, and you have no way of knowing which rule to disbelieve.', sources: [1] },
  { at: 33000, title: 'The gap in Khot\'s conjecture', text: 'The value of a game is the largest share of rules any labelling keeps. Khot\'s conjecture (2002): telling value near 1 from value near 0 is NP-hard.', sources: [1, 2] },
  { at: 42000, title: 'As hard as 3SAT', text: 'NP-hard: a fast method for it would give a fast method for 3SAT, and for every problem whose solutions can be checked quickly.', sources: [1] },
  { at: 50000, title: 'Why the labels grow', text: 'The labels may be long: choose both errors first, then the size of the labels. Known algorithms show that large label sets are needed.', sources: [1, 2] },
  { at: 58500, title: 'The Max-Cut threshold', text: 'Why it mattered: Max-Cut. Goemans and Williamson\'s method always gets 0.878 of the best cut; under the conjecture, no fast method can promise more.', sources: [1, 3] },
  { at: 67500, title: 'Further approximation limits', text: 'Vertex Cover\'s factor 2 would be best possible too, and Raghavendra showed one algorithm would be optimal for a whole class of problems.', sources: [1] },
  { at: 76000, title: 'From one half toward one', text: 'In 2018 the 2-to-2 Games Theorem proved hardness with the yes case near one half. Getting it up to nearly 1 was the separate, harder problem.', sources: [1, 5] },
  { at: 84500, title: 'The claimed reduction', text: 'OpenAI claims the proof: a fast reduction from 3SAT to games whose rules flip fixed bits, with value at least $1-\\varepsilon$ or at most $\\delta$.', sources: [1] },
  { at: 93000, title: 'Stable but detectable', text: 'Its new piece is a code that is stable but detectable: noise rarely changes the restored answer, yet broad enough linear checks notice it at least 1/8 of the time.', sources: [1, 7] },
  { at: 102500, title: 'Two incompatible agreement rates', text: 'If a labelling passed too often on an unsatisfiable formula, two strategies would agree at a fixed rate; parallel repetition forces them below it.', sources: [1] },
  { at: 111500, title: 'Where it stands', text: 'Under review: Dana Moshkovitz is reading the paper and has given no verdict. A machine-checked Lean statement is not counted as approval.', sources: [7, 9] },
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

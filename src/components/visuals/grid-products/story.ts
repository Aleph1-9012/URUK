import { createTimeline } from '../../plate/timeline';

// Claude's approved 107 storyboard, 8 November 2026. Times are milliseconds.
export const CUES = [
  {"at": 0, "title": "Rows times columns", "text": "The school way to multiply two grids of numbers: each entry of the answer is a row times a column, so $n\\times n$ grids take $n^3$ multiplications.", "sources": [3]},
  {"at": 8500, "title": "Seven instead of eight", "text": "Double the size and the work goes up eightfold. In 1969 Volker Strassen multiplied 2×2 grids with seven multiplications instead of eight.", "sources": [2, 3]},
  {"at": 17000, "title": "The same trick on blocks", "text": "That uses eighteen additions, but it works on blocks: on the quarters of a big grid, then again inside each of the seven products.", "sources": [2]},
  {"at": 25500, "title": "The gap grows", "text": "After $k$ levels that is $7^k$ multiplications, not $8^k$: about $n^{2.807}$ operations, which beats $n^3$ by any margin as $n$ grows.", "sources": [2, 4]},
  {"at": 33500, "title": "The exponent and its floor", "text": "The exponent ω says how the work grows, as $n^{\\omega}$. It is at least 2, since all $n^2$ entries of the answer must be written. Nobody knows if it is 2.", "sources": [1, 3]},
  {"at": 42500, "title": "Fifty-seven years of records", "text": "Records came fast: 2.796 in 1978, 2.522 in 1981, 2.3755 in 1990. Every record since has analyzed one tensor more carefully.", "sources": [1, 3, 7]},
  {"at": 50000, "title": "A barrier for old methods", "text": "Thirty-six years of work moved the third decimal place, to 2.371177 in 2026, and a broad family of these methods provably can't pass 2.3078.", "sources": [3, 8, 9]},
  {"at": 58500, "title": "The claimed improvement", "text": "On 2 October 2026 OpenAI posted a proof that ω ≤ 9/4 = 2.25: if it holds, the largest single improvement since 1981.", "sources": [1]},
  {"at": 65500, "title": "Measures of multiplication", "text": "The proof uses Strassen's characters, measures that add for jobs side by side and multiply for a job made of blocks.", "sources": [1, 10]},
  {"at": 72500, "title": "Every character must fit", "text": "So a character values $m\\times m$ grids at $m^{3t}$ for some $t$. The whole proof shows $t\\le\\tfrac34$ for every character, which gives 9/4.", "sources": [1]},
  {"at": 80000, "title": "Polynomial products", "text": "Its test case is multiplying polynomials: an $a$-by-$b$ grid of products needs only $a+b-1$ multiplications, by evaluating at points.", "sources": [1]},
  {"at": 88000, "title": "Three shorter copies", "text": "A new trick separates pieces sharing variables, so crossing out a few products splits a long product into three shorter copies.", "sources": [1]},
  {"at": 95500, "title": "Two bounds cannot cross", "text": "That gives a lower bound, $a^{4/3}$, and the points an upper one. If $t$ were above $\\tfrac34$, the two would cross as $a$ grows. They can't.", "sources": [1]},
  {"at": 103500, "title": "Existence without a recipe", "text": "The proof shows fast algorithms exist without writing one down. It won't make a graphics card, a phone or a language model faster.", "sources": [1, 3, 11]},
  {"at": 111500, "title": "Where it stands", "text": "Under review: Jeroen Zuiddam rebuilt the formal proof and extended it to every field. No one has published a verdict on the written paper.", "sources": [12]},
] as const;

export const FILM_DURATION = 120000;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 200);

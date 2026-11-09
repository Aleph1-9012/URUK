
// A literal names a switch, 1-based; a negative number asks for that switch to be off.
export type Rule = readonly [number, number, number];

// The opening: at least one switch on, and at least one switch off.
export const OPENING: readonly Rule[] = [[1, 2, 3], [-1, -2, -3]];

export const GROUP_RULES: readonly (readonly Rule[])[] = [
  [[1, 2, 3], [-2, 3, 4], [-1, -3, -4]],
  [[5, -6, 7], [6, 7, 8], [-5, -7, -8]],
  [[9, 10, -11], [-9, 11, 12], [-10, -11, -12]],
];

// Each crossing rule ties one switch from every group; it is assigned to the group it is drawn over.
export const CROSSING_RULES: readonly Rule[] = [[4, -5, 9], [-1, 8, -12], [2, -6, 10]];

export const SWITCHES = 12;

export const GROUP_SIZE = 4;

export function obeys(rule: Rule, setting: readonly boolean[]): boolean {
  return rule.some((literal) => setting[Math.abs(literal) - 1] === literal > 0);
}

// The setting with this index, switch 1 being the most significant bit.
export function settingOf(index: number, switches: number): boolean[] {
  return Array.from({ length: switches }, (_, place) => (index >> (switches - 1 - place)) % 2 === 1);
}

export function countSettings(rules: readonly Rule[], switches: number): number {
  let count = 0;

  for (let index = 0; index < 2 ** switches; index += 1) {
    const setting = settingOf(index, switches);

    if (rules.every((rule) => obeys(rule, setting))) count += 1;
  }

  return count;
}

export function countGroup(group: number): number {
  const offset = group * GROUP_SIZE;
  const shift = (literal: number) => Math.sign(literal) * (Math.abs(literal) - offset);
  const rules = (GROUP_RULES[group] ?? []).map(([first, second, third]) => [shift(first), shift(second), shift(third)] as const);

  return countSettings(rules, GROUP_SIZE);
}

export function occurrences(rules: readonly Rule[]): number[] {
  const counts = Array.from({ length: SWITCHES }, () => 0);

  for (const rule of rules) {
    for (const literal of rule) {
      const place = Math.abs(literal) - 1;
      counts[place] = (counts[place] ?? 0) + 1;
    }
  }

  return counts;
}

export const INSIDE_RULES: readonly Rule[] = GROUP_RULES.flat();

export const ALL_RULES: readonly Rule[] = [...INSIDE_RULES, ...CROSSING_RULES];

// The node a setting passes through in `row` of the tree of choices (row 0 is the start).
// Each row halves the choices: OFF goes to the left child, ON to the right.
export function nodeOf(leaf: number, rows: number, row: number): number {
  return leaf >> (rows - row);
}

// The opening's eight settings, in the order the film walks them: the tree's ends from left to right.
export const LEDGER = Array.from({ length: 8 }, (_, index) => {
  const setting = settingOf(index, 3);
  const broken = OPENING.findIndex((rule) => !obeys(rule, setting));

  return { setting, broken };
});

export const OPENING_COUNT = LEDGER.filter((row) => row.broken < 0).length;

export const GROUP_COUNTS = GROUP_RULES.map((_, group) => countGroup(group));

export const TRUE_COUNT = countSettings(ALL_RULES, SWITCHES);

// The best earlier multipliers per switch, as the article gives them.
export const BETTER_METHODS = [
  { name: 'SCHÖNING 1999', multiplier: 4 / 3, shown: '×4/3' },
  { name: 'BEST DETERMINISTIC', multiplier: 1.328, shown: '×1.328' },
  { name: 'PPSZ', multiplier: 1.308, shown: '×1.308' },
] as const;

// The article's solution of the paper's parameter constraints: ⌈log₂ n⌉ ≈ 1.09 × 10¹⁰.
export const THRESHOLD_BITS = 1.09e10;

export function decimalDigits(bits: number): number {
  return Math.floor(bits * Math.log10(2)) + 1;
}

// The drawn bent count: a degree-5 polynomial whose value at T = 0 is the true count.
// Its other coefficients are chosen for the drawing; the rule it illustrates is exact.
export const BENT_COEFFICIENTS = [TRUE_COUNT, 850 / 3, -2489 / 4, 8707 / 12, -1251 / 4, 517 / 12] as const;

export const STOPS = [1, 2, 3] as const;

export function evaluate(coefficients: readonly number[], t: number): number {
  let value = 0;

  for (let power = coefficients.length - 1; power >= 0; power -= 1) {
    value = value * t + (coefficients[power] ?? 0);
  }

  return value;
}

export function slope(coefficients: readonly number[], t: number): number {
  return evaluate(coefficients.slice(1).map((coefficient, power) => coefficient * (power + 1)), t);
}

export type Stop = { t: number; value: number; slope: number };

export const STOP_DATA: readonly Stop[] = STOPS.map((t) => ({ t, value: evaluate(BENT_COEFFICIENTS, t), slope: slope(BENT_COEFFICIENTS, t) }));

// The polynomial of degree below 2 × stops with these values and slopes (Hermite interpolation),
// found by solving for its coefficients.
export function hermite(stops: readonly Stop[]): number[] {
  const size = 2 * stops.length;
  const rows: number[][] = [];

  for (const stop of stops) {
    rows.push([...Array.from({ length: size }, (_, power) => stop.t ** power), stop.value]);
    rows.push([...Array.from({ length: size }, (_, power) => (power === 0 ? 0 : power * stop.t ** (power - 1))), stop.slope]);
  }

  for (let column = 0; column < size; column += 1) {
    let pivot = column;

    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(rows[row]?.[column] ?? 0) > Math.abs(rows[pivot]?.[column] ?? 0)) pivot = row;
    }

    const chosen = rows[pivot];
    const current = rows[column];

    if (!chosen || !current) continue;

    rows[pivot] = current;
    rows[column] = chosen;
    const lead = chosen[column] ?? 1;

    for (let row = 0; row < size; row += 1) {
      const target = rows[row];

      if (row === column || !target) continue;

      const factor = (target[column] ?? 0) / lead;

      for (let entry = column; entry <= size; entry += 1) {
        target[entry] = (target[entry] ?? 0) - factor * (chosen[entry] ?? 0);
      }
    }
  }

  return rows.map((row, power) => (row[size] ?? 0) / (row[power] ?? 1));
}

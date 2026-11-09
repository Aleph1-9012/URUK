export type Swing = { low: number; high: number; travel: number; hold: number };

export function swingPeriod(swing: Swing): number {
  return 2 * (swing.travel + swing.hold);
}

export function swingAt(swing: Swing, time: number): number {
  const { low, high, travel, hold } = swing;
  const at = time % swingPeriod(swing);

  if (at < hold) {
    return low;
  }

  if (at < hold + travel) {
    return low + ((at - hold) / travel) * (high - low);
  }

  if (at < 2 * hold + travel) {
    return high;
  }

  return high - ((at - 2 * hold - travel) / travel) * (high - low);
}

export function swingTimeOf(swing: Swing, value: number): number {
  const { low, high, travel, hold } = swing;
  const share = Math.min(1, Math.max(0, (value - low) / (high - low)));

  return hold + share * travel;
}

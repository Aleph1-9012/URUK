export function progress(time: number, start: number, end: number): number {
  return Math.min(1, Math.max(0, (time - start) / (end - start)));
}

export function smooth(time: number, start: number, end: number): number {
  const amount = progress(time, start, end);

  return amount * amount * (3 - 2 * amount);
}

export function smoothStep(time: number, start: number, end: number): number {
  if (end <= start) {
    return time >= end ? 1 : 0;
  }

  return smooth(time, start, end);
}

export function fade(time: number, start: number, end: number, outStart = Infinity, outEnd = Infinity): number {
  return smooth(time, start, end) * (outStart === Infinity ? 1 : 1 - smooth(time, outStart, outEnd));
}

export function crossfade(time: number, start: number, end: number, outStart = Infinity, outEnd = Infinity): number {
  return Math.min(smoothStep(time, start, end), 1 - smoothStep(time, outStart, outEnd));
}

export function mix(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

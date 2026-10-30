interface NumberSignCounts {
  sixties: number;
  tens: number;
  ones: number;
}

export function decomposeNumberSigns(count: number): NumberSignCounts {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError('Count must be a non-negative integer.');
  }

  const remainder = count % 60;

  return {
    sixties: Math.floor(count / 60),
    tens: Math.floor(remainder / 10),
    ones: remainder % 10,
  };
}

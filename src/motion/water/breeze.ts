type BreezeInput = {
  rows: number;
  pixelRatio: number;
  scale: number;
  elapsedMs: number;
};

function smoothstep(edge0: number, edge1: number, value: number): number {
  const amount = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return amount * amount * (3 - 2 * amount);
}

export function breezeOffsets({
  rows,
  pixelRatio,
  scale,
  elapsedMs,
}: BreezeInput): Int16Array {
  const rowCount = Math.max(0, Math.floor(rows));
  const offsets = new Int16Array(rowCount);

  if (
    rowCount === 0 ||
    !Number.isFinite(pixelRatio) ||
    !Number.isFinite(scale) ||
    !Number.isFinite(elapsedMs) ||
    pixelRatio <= 0 ||
    scale <= 0
  ) {
    return offsets;
  }

  const ramp = smoothstep(0, 1500, elapsedMs);

  for (let row = 0; row < rowCount; row += 1) {
    const y = row / pixelRatio;
    const depth = smoothstep(0, 0.18 * rows, row);
    const motion =
      0.65 * Math.sin(2 * Math.PI * (y / (22 * scale) - elapsedMs / 3200)) +
      0.35 * Math.sin(2 * Math.PI * (y / (9 * scale) + elapsedMs / 1900));
    offsets[row] = Math.round(3 * scale * depth * ramp * motion * pixelRatio);
  }

  return offsets;
}

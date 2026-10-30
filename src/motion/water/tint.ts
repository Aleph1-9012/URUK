const tintStops = [
  { position: 0, alpha: 0.329 },
  { position: 0.0015, alpha: 0.392 },
  { position: 0.0031, alpha: 0.204 },
  { position: 0.0046, alpha: 0.074 },
  { position: 0.0154, alpha: 0.071 },
  { position: 0.0615, alpha: 0.083 },
  { position: 0.1231, alpha: 0.1 },
  { position: 0.1846, alpha: 0.113 },
  { position: 0.2462, alpha: 0.124 },
  { position: 0.3077, alpha: 0.131 },
  { position: 0.3692, alpha: 0.137 },
  { position: 0.4308, alpha: 0.14 },
  { position: 0.4923, alpha: 0.141 },
  { position: 0.5538, alpha: 0.135 },
  { position: 0.6154, alpha: 0.131 },
  { position: 0.6769, alpha: 0.123 },
  { position: 0.7231, alpha: 0.098 },
  { position: 0.7692, alpha: 0.069 },
  { position: 0.8154, alpha: 0.042 },
  { position: 0.8615, alpha: 0.017 },
  { position: 0.8969, alpha: 0.003 },
  { position: 0.8985, alpha: 0 },
] as const;

export function waterTintCss(): string {
  const stops = tintStops.map(
    ({ position, alpha }) =>
      `rgba(84, 120, 158, ${alpha}) ${Number((position * 100).toFixed(4))}%`,
  );

  return `linear-gradient(to bottom, ${stops.join(', ')})`;
}

export function paintWaterTint(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  if (width <= 0 || height <= 0) {
    return;
  }

  const gradient = context.createLinearGradient(0, y, 0, y + height);

  for (const { position, alpha } of tintStops) {
    gradient.addColorStop(position, `rgba(84, 120, 158, ${alpha})`);
  }

  context.fillStyle = gradient;
  context.fillRect(x, y, width, height);
}

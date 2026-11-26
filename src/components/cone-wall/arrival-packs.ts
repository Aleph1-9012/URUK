/** Use the same native pixel box and pack sizes on both sides of navigation. */
export function conePacks(width: number, dpr: number, measured?: { width: number; pixels: number }) {
  const pixels = measured?.width === width ? measured.pixels : Math.round(width * dpr);
  const density = pixels <= Math.round(width * dpr) ? dpr : pixels / width;
  const target = Math.min(38, Math.max(24, width * 0.037)) * density;
  const pack = [24, 28, 32, 36, 38, 42, 48, 56, 64, 72, 76, 84, 96, 108, 114, 128, 144, 152, 192, 228]
    .reduce((best, size) => Math.abs(size - target) < Math.abs(best - target) ? size : best);
  const print = [1, 2, 3].includes(density) ? `print-${density}` : 'heads';

  return { density, pack, print };
}

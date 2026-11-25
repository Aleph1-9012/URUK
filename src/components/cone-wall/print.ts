import type { Head } from './layout';
import type { Print } from './raster';

/** Stamp the native mask into the common ink plane for the press and arrival. */
export function printHeads(alpha: Uint8Array, width: number, height: number, density: number,
  atlas: Uint8Array, atlasWidth: number, prints: Map<number, Print>, ink?: Uint8Array) {
  return function print(head: Head, beat = 0) {
    const x0 = head.x * density, y0 = head.y * density, scale = 3 / density;
    const tile = prints.get(head.sy * atlasWidth + head.sx);
    if (tile) {
      const qx = Math.round(x0 * 3), qy = Math.round(y0 * 6);
      const left = Math.floor(qx / 3), top = Math.floor(qy / 6);
      const phase = (qy - top * 6) * 3 + qx - left * 3;
      const [, w, h, offsets] = tile;
      const begin = offsets[phase]!;
      for (let y = Math.max(0, -top); y < Math.min(h, height - top); y++) {
        const row = (top + y) * width + left, src = begin + y * w;
        for (let x = Math.max(0, -left); x < Math.min(w, width - left); x++) {
          const a = atlas[src + x]!;
          if (!a) continue;
          const at = row + x;
          alpha[at] = a + Math.round(alpha[at]! * (255 - a) / 255);
          if (ink) ink[at] = Math.min(ink[at]!, beat);
        }
      }
      return;
    }
    const right = head.sx + head.width - 1, bottom = head.sy + head.height - 1;
    for (let y = Math.max(0, Math.ceil(y0 - 0.5)); y < Math.min(height, y0 + head.height / scale - 0.5); y++) {
      const sy = Math.max(head.sy, Math.min(bottom, head.sy + (y + 0.5 - y0) * scale - 0.5));
      const iy = Math.floor(sy), fy = sy - iy;
      for (let x = Math.max(0, Math.ceil(x0 - 0.5)); x < Math.min(width, x0 + head.width / scale - 0.5); x++) {
        const sx = Math.max(head.sx, Math.min(right, head.sx + (x + 0.5 - x0) * scale - 0.5));
        const ix = Math.floor(sx), fx = sx - ix;
        const next = Math.min(ix + 1, right), row = iy * atlasWidth, below = Math.min(iy + 1, bottom) * atlasWidth;
        const top = atlas[row + ix]! * (1 - fx) + atlas[row + next]! * fx;
        const low = atlas[below + ix]! * (1 - fx) + atlas[below + next]! * fx;
        const a = Math.round(top * (1 - fy) + low * fy);
        if (!a) continue;
        const i = y * width + x;
        alpha[i] = a + Math.round(alpha[i]! * (255 - a) / 255);
        if (ink) ink[i] = Math.min(ink[i]!, beat);
      }
    }
  };
}

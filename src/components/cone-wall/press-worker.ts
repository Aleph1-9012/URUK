import atlasUrl from './data/packs/heads.lz4?url&no-inline';
import { putPatches, raster, type Band, type Batch, type Print } from './raster';
import { loadPack, packPixels, shades } from './pack';
import { instances } from './instances';
import { preparation } from './preparation';
import type { BlankLayout } from './material';

export type PressRequest =
  | { type: 'prepare'; layout: BlankLayout; surface: OffscreenCanvas | undefined }
  | { type: 'inscribe'; label: Band; beat: number }
  | { type: 'press'; progress: number };

export type PressReply =
  | { type: 'prepared'; stripes: ArrayBuffer[]; mesh: ArrayBuffer; band: { x: number; beat: number }[]; strip: Band; first: Batch | null }
  | { type: 'pressed'; progress: number; batch?: Batch }
  | { type: 'failed' };

const prints = import.meta.glob<string>('./data/packs/print-*.lz4', { eager: true, import: 'default', query: '?url&no-inline' });
let context: OffscreenCanvasRenderingContext2D | null = null;
let submitted: Promise<void> | undefined;
let art: Awaited<ReturnType<typeof raster>> | undefined;

self.onmessage = async ({ data }: MessageEvent<PressRequest>) => {
  try {
    if (data.type === 'inscribe') { art?.inscribe(data.label, data.beat); return; }
    if (data.type === 'press') {
      if (!art) throw new Error('Cannot press before the artwork is ready');
      const batch = art.paint(Math.min(47, Math.floor(data.progress * 48)));
      if (context) {
        putPatches(context, batch);
        if (data.progress >= 47 / 48) {
          // A worker can finish the pixels before its placeholder canvas receives them.
          // Let the final strike pass through the worker’s render step before navigating.
          submitted ??= new Promise<void>(resolve => {
            try { self.requestAnimationFrame(() => self.requestAnimationFrame(() => resolve())); }
            catch { resolve(); }
          });
          await submitted;
        }
        self.postMessage({ type: 'pressed', progress: data.progress } satisfies PressReply);
      } else {
        self.postMessage({ type: 'pressed', progress: data.progress, batch } satisfies PressReply, { transfer: [batch.buffer] });
      }
      return;
    }
    const atlas = await loadPack(prints['./data/packs/print-' + data.layout.density + '.lz4'] ?? atlasUrl);
    const { width, height, prints: tiles }: { width: number; height: number; prints?: Print[] } = JSON.parse(atlas.metadata);
    const work = preparation(new AbortController().signal);
    art = await raster(data.layout, atlas.alpha, width, new Map(tiles?.map(tile => [tile[0], tile])), work);
    const geometry = await instances(data.layout, width, height, work);
    const gzip = new CompressionStream('gzip');
    const writer = gzip.writable.getWriter();
    const compressed = new Response(gzip.readable).arrayBuffer();
    const coordinates = new Uint8Array(geometry.buffer);
    for (let offset = 0; offset < coordinates.length; offset += 262144) {
      await work.yieldTask();
      await writer.write(coordinates.subarray(offset, offset + 262144));
    }
    await writer.close();
    const mesh = await compressed;
    const rows = Math.ceil(art.height / 8);
    const stripes: ArrayBuffer[] = [];
    for (let y = 0; y < art.height; y += rows) {
      await work.yieldTask();
      const top = y * art.width, count = Math.min(rows, art.height - y) * art.width;
      const pixels = new Uint32Array(count);
      for (let i = 0; i < count; i++) pixels[i] = shades[art.alpha[top + i]!]!;
      stripes.push(packPixels(new Uint8Array(pixels.buffer)).buffer);
    }
    const first = art.paint(0);
    context = data.surface?.getContext('2d') ?? null;
    const { band, strip } = art;
    const shown = context ? null : first;
    const transfer = [mesh, strip.alpha.buffer, ...stripes];
    if (context) putPatches(context, first);
    else transfer.push(first.buffer);

    self.postMessage({ type: 'prepared', mesh, stripes, first: shown, band, strip } satisfies PressReply, { transfer });
  } catch { self.postMessage({ type: 'failed' } satisfies PressReply); }
};

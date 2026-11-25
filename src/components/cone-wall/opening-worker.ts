import { softwareRelease } from './software';
import { instances } from './instances';
import { preparation } from './preparation';
import { openSurface } from './release';
import type { FaceLayout } from './material';

type OpeningMessage =
  | { type: 'prime'; atlas: string; layout: FaceLayout; buildMesh?: boolean }
  | { type: 'mesh'; chunk: string; last: boolean }
  | { type: 'pixels'; x: number; y: number; image: ImageData }
  | { type: 'face' }
  | { type: 'draw'; progress: number }
  | { type: 'dispose' };

type OpeningReply =
  | { type: 'ready' | 'unavailable' | 'disposed' }
  | { type: 'painted'; progress: number; frame: ImageBitmap };

const send = (reply: OpeningReply) => self.postMessage(reply);
let output = new OffscreenCanvas(1, 1);
let face: OffscreenCanvas | undefined;
let paper: OffscreenCanvasRenderingContext2D | null;
let gl: ReturnType<typeof openSurface>;
let plate: Promise<ImageBitmap> | undefined;
let scene: FaceLayout | undefined;
let vertices: Promise<Float32Array<ArrayBuffer>> | undefined;
const chunks: string[] = [];
let draw: ReturnType<NonNullable<typeof gl>['prepare']>['draw'] | undefined;
let stopped = false;

self.onmessage = async ({ data }: MessageEvent<OpeningMessage>) => {
  try {
    if (data.type === 'dispose') {
      stopped = true;
      draw = undefined;
      gl?.dispose();
      send({ type: 'disposed' });
      self.close();
      return;
    }
    if (stopped) return;
    if (data.type === 'prime') {
      scene = data.layout;
      face = new OffscreenCanvas(Math.round(scene.width * scene.density), Math.round(scene.height * scene.density));
      paper = face.getContext('2d');
      try { gl = openSurface(output, () => send({ type: 'unavailable' })); } catch { gl = undefined; }
      if (!gl) output = new OffscreenCanvas(1,1);
      if (data.buildMesh) vertices = instances(scene,768,211,preparation(new AbortController().signal));
      plate = fetch(data.atlas).then(response => response.blob()).then(blob => createImageBitmap(blob, { premultiplyAlpha: 'premultiply' }));
      void plate.catch(() => send({ type: 'unavailable' }));
    } else if (data.type === 'mesh') {
      chunks.push(data.chunk);
      if (data.last) {
        const bytes = Uint8Array.fromBase64(chunks.join(''));
        chunks.length = 0;
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
        vertices = new Response(stream).arrayBuffer().then(data => new Float32Array(data));
        void vertices.catch(() => send({ type: 'unavailable' }));
      }
    } else if (data.type === 'pixels') {
      paper?.putImageData(data.image, data.x, data.y);
    } else if (data.type === 'face') {
      if (!plate || !vertices || !scene || !face) throw new Error('Incomplete cone artwork');
      const [atlas, mesh] = await Promise.all([plate, vertices]);
      const layout = scene;
      if (stopped) return;
      if (gl) {
        try {
          const renderer = gl.prepare(atlas, face, layout, mesh);
          renderer.draw(0.14);
          if (!await gl.readyToPresent()) throw new Error('Use the 2D release for this surface');
          if (stopped) return;
          draw = renderer.draw;
        } catch {
          gl.dispose();
          gl = undefined;
          output = new OffscreenCanvas(1,1);
        }
      }
      if (stopped) return;
      if (gl) {
        atlas.close();
        face.width = face.height = 0;
      } else {
        draw = softwareRelease(output, face, atlas, layout, mesh);
      }
      face = undefined;
      paper = null;
      send({ type: 'ready' });

    } else if (data.type === 'draw' && draw) {
      draw(data.progress);
      const frame = output.transferToImageBitmap();
      self.postMessage({ type: 'painted', progress: data.progress, frame } satisfies OpeningReply,
        { transfer: [frame] });
    }
  } catch {
    send({ type: 'unavailable' });
  }
};

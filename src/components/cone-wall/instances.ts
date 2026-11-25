import { courses } from './courses';
import type { Preparation } from './preparation';
import { printedHeads, type Head } from './layout';
import type { BlankLayout } from './material';

export const FLOATS = 11;
export const BOUNDS = 3;

/** Native-print quad coordinates and their release beats. The destination uploads these exact floats. */
export async function instances(scene: BlankLayout, atlasWidth: number, atlasHeight: number, work: Preparation): Promise<Float32Array<ArrayBuffer>> {
  const heads: Head[] = [];
  for (const head of printedHeads(scene.width, scene.height, Math.ceil(scene.fontSize * 1.65), scene.seed)) {
    heads.push(head);
    if (work.due()) await work.yieldTask();
  }
  const groups = await courses({ ...scene, heads }, work);
  const count = groups.reduce((sum, group) => sum + group.discs.length + group.heads.length, 0);
  const vertices = new Float32Array(BOUNDS + count * FLOATS);
  let next = BOUNDS;
  let ahead = 0;
  let behind = 0;
  let earliest = scene.height;
  function put(x: number, y: number, w: number, h: number, u: number, v: number, uw: number, vh: number,
    first: number, lane: number, kind: number): void {
    vertices[next++] = x;
    vertices[next++] = y;
    vertices[next++] = w;
    vertices[next++] = h;
    vertices[next++] = u;
    vertices[next++] = v;
    vertices[next++] = uw;
    vertices[next++] = vh;
    vertices[next++] = first;
    vertices[next++] = lane;
    vertices[next++] = kind;
  }

  for (const group of groups) {
    if (work.due()) await work.yieldTask();
    earliest = Math.min(earliest, group.first);
    for (const disc of group.discs) {
      put(disc.x - disc.rx, disc.y - disc.ry, 2 * disc.rx, 2 * disc.ry, 0, 0, 1, 1, group.first, group.lane, 0);
      ahead = Math.max(ahead, disc.y + disc.ry - group.first);
      behind = Math.min(behind, disc.y - disc.ry - group.first);
    }
    for (const head of group.heads) {
      put(head.x, head.y, head.width / 3, head.height / 3, head.sx / atlasWidth, head.sy / atlasHeight,
        head.width / atlasWidth, head.height / atlasHeight, group.first, group.lane, 1);
    }
  }
  vertices[0] = Math.ceil(ahead);
  vertices[1] = Math.floor(behind);
  vertices[2] = earliest;
  return vertices;
}

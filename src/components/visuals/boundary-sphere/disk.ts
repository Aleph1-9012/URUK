import {
  CENTRAL_PENTAGON, SIDE_LENGTH, TILING_EDGES, TREE,
  geodesic, horizontalTranslation, magnifiedHalfWidth, tilingMap, treePath,
  type DiskMap, type Point,
} from './math';
import { fade, smooth } from './story';

export type DiskColors = { ink: string; blue: string; muted: string; paper: string };

export type DiskLabel = (id: string, x: number, y: number, opacity?: number) => void;

type CachedDisk = { radius: number; distance: number; path: Path2D };

let cachedDisk: CachedDisk | undefined;

function identity(point: Point): Point {
  return point;
}

function appendArc(path: Path2D, from: Point, to: Point): void {
  const edge = geodesic(from, to);
  path.moveTo(from.x, from.y);

  if (edge.kind === 'diameter') path.lineTo(to.x, to.y);
  else path.arc(edge.center.x, edge.center.y, edge.radius, edge.start, edge.start + edge.sweep, edge.sweep < 0);
}

// The moving finite patch needs tiles from both ends of the translation.
// The inverse endpoint is itself a tiling symmetry, so these are genuine tiles.
const coveredEdges: Array<{ from: Point; to: Point }> = [];

const coveredKeys = new Set<string>();

for (const map of [identity, tilingMap(-2 * SIDE_LENGTH)]) {
  for (const edge of TILING_EDGES) {
    const from = map(edge.from);
    const to = map(edge.to);
    const first = `${Math.round(from.x * 1e10)},${Math.round(from.y * 1e10)}`;
    const second = `${Math.round(to.x * 1e10)},${Math.round(to.y * 1e10)}`;
    const key = first < second ? `${first}:${second}` : `${second}:${first}`;

    if (!coveredKeys.has(key)) {
      coveredKeys.add(key);
      coveredEdges.push({ from, to });
    }
  }
}

function tilePath(radius: number, distance: number): Path2D {
  if (cachedDisk?.radius === radius && cachedDisk.distance === distance) return cachedDisk.path;

  const map = distance === 0 ? identity : tilingMap(distance);
  const path = new Path2D();

  for (const edge of coveredEdges) {
    const from = map(edge.from);
    const to = map(edge.to);

    if (Math.hypot(from.x - to.x, from.y - to.y) * radius < 1.5) continue;

    appendArc(path, from, to);
  }

  cachedDisk = { radius, distance, path };

  return path;
}

function selectedPath(word: string): readonly number[] {
  const index = TREE.findIndex((node) => node.word === word);

  return index < 0 ? [] : treePath(index);
}

const TRIPOD_WIDE = ['aaaaa', 'AAAAA', 'bbbbb'].map(selectedPath);

const TRIPOD_TALL = ['aaaa', 'AAAA', 'bbbb'].map(selectedPath);

const RAYS_WIDE = ['aaaaa', 'aaabb', 'abbbb'].map(selectedPath);

const RAYS_TALL = ['aaaa', 'aaab', 'abbb'].map(selectedPath);

export function drawBoundaryDisk(
  pen: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: DiskColors,
  _labelCallback: DiskLabel,
): void {
  const tall = height > width;
  const center = { x: width * (tall ? .5 : .255), y: height * (tall ? .24 : .46) };
  const radius = Math.min(width * (tall ? .40 : .21), height * (tall ? .18 : .34));
  const treeOpacity = 1 - smooth(time, 25000, 27800);
  const tilingOpacity = smooth(time, 25000, 28000);
  const move = smooth(time, 103000, 108000);
  const distance = 2 * SIDE_LENGTH * move;
  const screen = (point: Point): Point => ({ x: center.x + radius * point.x, y: center.y + radius * point.y });
  const text = (content: string, x: number, y: number, maxWidth: number, opacity = 1, color = colors.ink): void => {
    if (opacity < .005) return;

    pen.font = `${tall ? 10 : 11}px "Special Elite", monospace`;
    pen.textAlign = 'center';
    pen.textBaseline = 'middle';
    const lines: string[] = [];
    let line = '';

    for (const word of content.split(' ')) {
      const next = line ? `${line} ${word}` : word;

      if (line && pen.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else line = next;
    }

    lines.push(line);
    pen.globalAlpha = opacity;

    for (const [index, value] of lines.entries()) {
      const extent = pen.measureText(value).width;
      const atY = y + (index - (lines.length - 1) / 2) * 14;
      pen.fillStyle = colors.paper;
      pen.fillRect(x - extent / 2 - 2, atY - 7, extent + 4, 14);
      pen.fillStyle = color;
      pen.fillText(value, x, atY);
    }

    pen.globalAlpha = 1;
  };
  const line = (from: Point, to: Point, opacity: number, color: string, weight = 1): void => {
    if (opacity < .005) return;

    const a = screen(from);
    const b = screen(to);
    pen.globalAlpha = opacity;
    pen.strokeStyle = color;
    pen.lineWidth = weight;
    pen.beginPath();
    pen.moveTo(a.x, a.y);
    pen.lineTo(b.x, b.y);
    pen.stroke();
    pen.globalAlpha = 1;
  };
  const dot = (point: Point, size: number, opacity: number, color: string): void => {
    const at = screen(point);
    pen.globalAlpha = opacity;
    pen.fillStyle = color;
    pen.beginPath();
    pen.arc(at.x, at.y, size, 0, 2 * Math.PI);
    pen.fill();
    pen.globalAlpha = 1;
  };

  pen.save();
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .8;
  pen.beginPath();
  pen.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  pen.stroke();

  if (treeOpacity > .005) {
    const maxDepth = tall ? 4 : 5;
    const treeDim = fade(time, 8000, 9500, 16500, 17300);

    for (const node of TREE) {
      if (node.depth > maxDepth) continue;

      const appear = smooth(time, node.depth * 800 - 500, node.depth * 800 + 500);
      const parent = TREE[node.parent];

      if (parent) line(parent.point, node.point, appear * treeOpacity * (.48 - .25 * treeDim), colors.ink, .7);

      dot(node.point, node.depth === 0 ? 2.7 : tall ? .85 : 1.2, appear * treeOpacity * (.75 - .4 * treeDim), colors.ink);
    }

    const tripod = tall ? TRIPOD_TALL : TRIPOD_WIDE;

    for (const [branch, indices] of tripod.entries()) {
      const progress = smooth(time, 8500 + branch * 700, 11000 + branch * 700);

      for (let index = 1; index < indices.length; index++) {
        const from = TREE[indices[index - 1] ?? -1];
        const to = TREE[indices[index] ?? -1];
        const amount = Math.max(0, Math.min(1, progress * (indices.length - 1) - index + 1));

        if (from && to && amount > 0) {
          line(from.point, { x: from.point.x + (to.point.x - from.point.x) * amount, y: from.point.y + (to.point.y - from.point.y) * amount }, treeDim * treeOpacity, colors.blue, tall ? 1.6 : 2);
        }
      }
    }

    const rays = tall ? RAYS_TALL : RAYS_WIDE;
    const rayOpacity = smooth(time, 16500, 17300) * treeOpacity;

    for (const [branch, indices] of rays.entries()) {
      const progress = smooth(time, 17000 + branch * 1300, 18500 + branch * 1300);
      const points: Point[] = [];

      for (const index of indices) {
        const node = TREE[index];

        if (node) points.push(node.point);
      }

      const last = TREE[indices[indices.length - 1] ?? -1];

      if (last) points.push(last.boundary);

      for (let index = 1; index < points.length; index++) {
        const from = points[index - 1];
        const to = points[index];
        const amount = Math.max(0, Math.min(1, progress * (points.length - 1) - index + 1));

        if (from && to && amount > 0) line(from, { x: from.x + (to.x - from.x) * amount, y: from.y + (to.y - from.y) * amount }, rayOpacity * (branch === 0 ? 1 : .65), colors.blue, tall ? 1.3 : 1.6);
      }

      if (last && progress === 1) dot(last.boundary, tall ? 2 : 2.7, rayOpacity, colors.blue);
    }

    const dust = smooth(time, 21800, 23800) * treeOpacity;

    if (dust > .005) {
      for (const node of TREE) {
        if (node.depth === maxDepth) dot(node.boundary, tall ? .8 : 1, dust, colors.ink);
      }
    }

    const labels = fade(time, 800, 2200, 7500, 8000);
    const names = ['a', 'a⁻¹', 'b', 'b⁻¹'];

    for (let index = 1; index <= 4; index++) {
      const node = TREE[index];

      if (!node) continue;

      const at = screen({ x: node.point.x * .57, y: node.point.y * .57 });
      text(names[index - 1] ?? '', at.x, at.y, 40, labels);
    }

    text('START', center.x, center.y + 13, 60, fade(time, 0, 500, 6500, 7500), colors.muted);
  }

  if (tilingOpacity > .005) {
    const magnification = fade(time, 85000, 86700, 101500, 103000);
    pen.save();
    pen.beginPath();
    pen.arc(center.x, center.y, radius - .5, 0, 2 * Math.PI);
    pen.clip();
    pen.translate(center.x, center.y);
    pen.scale(radius, radius);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .8 / radius;
    pen.globalAlpha = tilingOpacity * (1 - .75 * magnification);
    pen.stroke(tilePath(radius, distance));

    const selected = fade(time, 101500, 103000, 109000, 111000);

    if (selected > .005) {
      const map: DiskMap = distance === 0 ? identity : tilingMap(distance);
      const tile = new Path2D();

      for (const [index, corner] of CENTRAL_PENTAGON.entries()) {
        const next = CENTRAL_PENTAGON[(index + 1) % 5];

        if (next) appendArc(tile, map(corner), map(next));
      }

      pen.globalAlpha = selected;
      pen.strokeStyle = colors.blue;
      pen.lineWidth = 2 / radius;
      pen.stroke(tile);
    }

    pen.restore();
    pen.globalAlpha = 1;

    if (magnification > .005) {
      const travel = Math.log(400) * smooth(time, 86000, 91500);
      const arcOpacity = magnification * (1 - smooth(time, 93500, 95000));
      const halfWidth = magnifiedHalfWidth(.1, travel);
      pen.beginPath();
      pen.arc(center.x, center.y, radius, Math.PI - halfWidth, Math.PI + halfWidth);
      pen.strokeStyle = colors.blue;
      pen.lineWidth = tall ? 2 : 2.5;
      pen.globalAlpha = arcOpacity;
      pen.stroke();
      pen.globalAlpha = 1;

      for (let index = 0; index < 32; index++) {
        const angle = 2 * Math.PI * index / 32;
        const point = horizontalTranslation({ x: Math.cos(angle), y: Math.sin(angle) }, travel);
        dot(point, tall ? .9 : 1.3, arcOpacity * .65, colors.muted);
      }

      dot({ x: 1, y: 0 }, tall ? 2.5 : 3, arcOpacity, colors.blue);
    }
  }

  pen.restore();
  pen.globalAlpha = 1;
  let heading = 'TWO MOVES AND THEIR UNDOS';
  let caption = 'DRAWN SMALLER · EDGE INFINITELY FAR';

  if (time >= 8000 && time < 16500) heading = 'TREE TRIANGLE · THICKNESS 0';
  else if (time >= 16500 && time < 25000) {
    heading = 'DIRECTIONS TO INFINITY';
    caption = time < 21800 ? 'SHARE MORE MOVES · LAND CLOSER' : 'TREE BOUNDARY · A SAMPLE OF THE DUST';
  } else if (time >= 25000) {
    heading = 'HYPERBOLIC SPACE';
    caption = 'DRAWN IN 2D · THE EDGE IS AT INFINITY';
  }

  if (time >= 85000 && time < 93500) {
    heading = 'MAGNIFYING A SMALL BOUNDARY ARC';
    caption = 'EXACT MAP · THE GROUP ELEMENT IS SCHEMATIC';
  } else if (time >= 101500 && time < 109000) {
    heading = 'EACH MOVE A SYMMETRY';
    caption = 'THE TILING RETURNS ONTO ITSELF · IN 2D';
  }

  text(heading, center.x, tall ? height * .025 + 3 : center.y - radius - 28, width * (tall ? .93 : .47));
  text(caption, center.x, tall ? height * .445 : center.y + radius + 29, width * (tall ? .96 : .47), 1, colors.muted);
}

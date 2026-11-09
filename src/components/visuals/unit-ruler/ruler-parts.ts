// The ruler's length is the plate's unit, so it shrinks with the drawing; its marks and grips keep their size on screen.
// `scale` is screen pixels per drawing unit.
import { UNIT } from './tiling';

type LineCut = { width: number; height: number; lineStart: number; lineLength: number };

// The two baked cuts of the wedge line in src/assets/plate, in screen pixels: the 62b desktop ruler and its phone version.
export const lineCuts = {
  desktop: { width: 121, height: 28, lineStart: 3, lineLength: 115 },
  phone: { width: 55, height: 20, lineStart: 3, lineLength: 49 },
} as const satisfies Record<string, LineCut>;

export type LineKind = keyof typeof lineCuts;

export type RulerParts = {
  kind: LineKind;
  line: { x: number; y: number; width: number; height: number };
  disc: number;
  halo: number;
  endGrip: number;
  lineGrip: number;
  focus: { x: number; y: number; width: number; height: number; stroke: number };
};

export function rulerParts(scale: number): RulerParts {
  const onScreen = UNIT * scale;
  const kind: LineKind = onScreen < 75 ? 'phone' : 'desktop';
  const cut = lineCuts[kind];
  // Along the ruler the cut is stretched to exactly one unit; across it keeps its height on screen.
  const along = UNIT / cut.lineLength;
  const disc = (kind === 'phone' ? 12 : 16) / scale;
  const ring = disc / 2 + 6 / scale;

  return {
    kind,
    line: { x: -cut.lineStart * along, y: -cut.height / scale / 2, width: cut.width * along, height: cut.height / scale },
    disc,
    halo: disc / 2 + 2 / scale,
    // Grips stay at least 24 px across, but never so wide that the two ends leave no middle to drag by.
    endGrip: Math.max(12, Math.min(22, onScreen * 0.3)) / scale,
    lineGrip: 28 / scale,
    focus: { x: -ring, y: -ring, width: UNIT + 2 * ring, height: 2 * ring, stroke: 2 / scale },
  };
}

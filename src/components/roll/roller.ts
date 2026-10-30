import { capPoint, capTurns, friezeColumn, knobRuling, rollerRulings, rollerTurn, ROLLER_CENTRE, ROLLER_RADIUS } from './model';
import { CAP_RINGS } from './roller-cap';

// The turning part of the cylinder, in CSS pixels. Everything else stays the approved drawing underneath.
const FACE_LEFT = 24.5;
const FACE_RIGHT = 93.25;
const SEAL_WIDTH = 456;
const SEAL_HEIGHT = 128;
const FRIEZE_HEIGHT = 64;

// As in the drawing, a paper outline keeps the figures readable over the rulings.
const OUTLINE = 0.75;
const OUTLINE_OFFSETS = [[-OUTLINE, 0], [OUTLINE, 0], [0, -OUTLINE], [0, OUTLINE]] as const;
const paperSeals = new WeakMap<HTMLImageElement, HTMLCanvasElement>();

// Close to a whole turn the cap is left to the drawing itself, so it rests on the exact approved pixels.
const CAP_AT_REST = 0.002;
const CAP_LINE = 0.5;
const DASH_STEPS = 12;
const CAP_FACE = { x: 59, y: 28, radiusX: 35, radiusY: 6.5 };

// The axle stands in front of the rings.
const AXLE = { x: 56.25, y: 21, width: 6.25, height: 8 };

// The paper of each knob's body, measured from the top of the box and, for the lower one, from its bottom.
const KNOB_LEFT = 54.5;
const KNOB_RIGHT = 64.25;
const UPPER_KNOB = { top: 16, bottom: 19.25 };
const LOWER_KNOB = { top: 13, bottom: 9.5 };

// Rulings keep this gap from the rim and the ridge. A fast turn softens them by part of their spacing, so they stay ink lines.
const RULING_GAP = 2;
const MAX_SMEAR = 0.6;
const SMEAR_STEPS = 3;

type RollerFrame = {
  seal: HTMLImageElement;
  offset: number;
  moved: number;
  tile: number;
  direction: number;
};

function bulge(x: number): number {
  return Math.sqrt(Math.max(0, 1 - ((ROLLER_CENTRE - x) / ROLLER_RADIUS) ** 2));
}

// The inked curves of the drawing, measured from its 2x artwork.
const rimBottom = (x: number) => 27.75 + 8.25 * bulge(x);
const ridgeTop = (x: number) => 106.25 + 9.5 * bulge(x);
const ridgeBottom = (x: number) => ridgeTop(x) + 1;
const floorTop = (x: number, height: number) => height - 28.5 + 7.425 * bulge(x);

function band(top: (x: number) => number, bottom: (x: number) => number): Path2D {
  const path = new Path2D();

  for (let x = FACE_LEFT; x <= FACE_RIGHT; x += 0.5) {
    path.lineTo(x, top(x));
  }

  for (let x = FACE_RIGHT; x >= FACE_LEFT; x -= 0.5) {
    path.lineTo(x, bottom(x));
  }

  path.closePath();

  return path;
}

function paperSeal(seal: HTMLImageElement, paper: string): HTMLCanvasElement | undefined {
  const known = paperSeals.get(seal);

  if (known) {
    return known;
  }

  const canvas = document.createElement('canvas');
  canvas.width = SEAL_WIDTH;
  canvas.height = SEAL_HEIGHT;
  const context = canvas.getContext('2d');

  if (!context) {
    return undefined;
  }

  context.drawImage(seal, 0, 0);
  context.globalCompositeOperation = 'source-in';
  context.fillStyle = paper;
  context.fillRect(0, 0, SEAL_WIDTH, SEAL_HEIGHT);
  paperSeals.set(seal, canvas);

  return canvas;
}

function drawCap(context: CanvasRenderingContext2D, turns: number, height: number, paper: string, ink: string): void {
  if (Math.abs(turns - Math.round(turns)) < CAP_AT_REST) {
    return;
  }

  const face = new Path2D();
  face.ellipse(CAP_FACE.x, CAP_FACE.y, CAP_FACE.radiusX, CAP_FACE.radiusY, 0, 0, 2 * Math.PI);
  face.rect(AXLE.x, AXLE.y, AXLE.width, AXLE.height);
  const rings = new Path2D();

  for (const ring of CAP_RINGS) {
    for (const [from, to] of ring.dashes) {
      for (let step = 0; step <= DASH_STEPS; step += 1) {
        const angle = from + ((to - from) * step) / DASH_STEPS;
        const { x, y } = capPoint(ring.x + ring.radiusX * Math.cos(angle), ring.y + ring.radiusY * Math.sin(angle), turns);

        if (step === 0) {
          rings.moveTo(x, y);
        } else {
          rings.lineTo(x, y);
        }
      }
    }
  }

  context.fillStyle = paper;
  context.fill(face, 'evenodd');
  context.save();
  context.clip(face, 'evenodd');
  context.strokeStyle = ink;
  context.lineWidth = CAP_LINE;
  context.lineCap = 'round';
  context.stroke(rings);
  context.restore();

  const knobs = [
    { top: UPPER_KNOB.top, bottom: UPPER_KNOB.bottom },
    { top: height - LOWER_KNOB.top, bottom: height - LOWER_KNOB.bottom },
  ];
  const { x, width } = knobRuling(turns);

  for (const { top, bottom } of knobs) {
    context.fillStyle = paper;
    context.fillRect(KNOB_LEFT, top, KNOB_RIGHT - KNOB_LEFT, bottom - top);
    context.fillStyle = ink;
    context.fillRect(x - width / 2, top, width, bottom - top);
  }
}

export function drawRoller(canvas: HTMLCanvasElement, frame: RollerFrame): void {
  const span = canvas.parentElement;
  const context = canvas.getContext('2d');

  if (!span || !context || span.offsetHeight === 0 || frame.tile <= 0) {
    return;
  }

  const height = span.offsetHeight;
  const ratio = window.devicePixelRatio;
  const width = Math.round(canvas.clientWidth * ratio);
  const rows = Math.round(height * ratio);

  if (canvas.width !== width || canvas.height !== rows) {
    canvas.width = width;
    canvas.height = rows;
  }

  const style = getComputedStyle(canvas);
  const paper = style.getPropertyValue('--paper');
  const ink = style.getPropertyValue('--ink-logo');
  const floor = (x: number) => floorTop(x, height);

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, canvas.clientWidth, height);
  context.fillStyle = paper;
  context.fill(band((x) => rimBottom(x) + 0.5, (x) => ridgeTop(x) - 0.25));
  context.fill(band((x) => ridgeBottom(x) + 0.75, (x) => floor(x) - 0.25));

  const turn = rollerTurn(frame.offset, frame.tile);
  const smear = Math.max(-MAX_SMEAR, Math.min(MAX_SMEAR, rollerTurn(frame.moved, frame.tile)));
  const steps = smear === 0 ? 1 : SMEAR_STEPS;

  context.fillStyle = ink;
  context.globalAlpha = steps === 1 ? 1 : 0.55;

  for (let step = 0; step < steps; step += 1) {
    for (const { x, width: lineWidth } of rollerRulings(turn - (smear * step) / steps, frame.direction)) {
      const left = x - lineWidth / 2;
      const upper = rimBottom(x) + RULING_GAP;
      const lower = ridgeBottom(x) + RULING_GAP;
      context.fillRect(left, upper, lineWidth, ridgeTop(x) - RULING_GAP - upper);
      context.fillRect(left, lower, lineWidth, floor(x) - lower);
    }
  }

  context.globalAlpha = 1;

  const outline = paperSeal(frame.seal, paper);
  const columns: { x: number; source: number; top: number }[] = [];

  for (let column = Math.ceil(FACE_LEFT * ratio); column < FACE_RIGHT * ratio; column += 1) {
    const x = column / ratio;
    const { source, top } = friezeColumn(x, frame.offset, frame.tile, frame.direction);
    columns.push({ x, source: Math.floor(source * SEAL_WIDTH), top });
  }

  if (outline) {
    for (const [right, down] of OUTLINE_OFFSETS) {
      for (const { x, source, top } of columns) {
        context.drawImage(outline, source, 0, 1, SEAL_HEIGHT, x + right, top + down, 1 / ratio, FRIEZE_HEIGHT);
      }
    }
  }

  for (const { x, source, top } of columns) {
    context.drawImage(frame.seal, source, 0, 1, SEAL_HEIGHT, x, top, 1 / ratio, FRIEZE_HEIGHT);
  }

  drawCap(context, capTurns(frame.offset, frame.tile, frame.direction), height, paper, ink);
}

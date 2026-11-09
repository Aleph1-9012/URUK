import { fade, smooth } from '../../../lib/animation';
import { CUTTINGS, DESCENDANTS, MAPS, PARENTS, TRANSPORT_SOURCES, mapSlopes, mapValue, type MapName, type Point } from './math';

export type GraphColors = { ink: string; blue: string; muted: string; paper: string };

export type GraphLabel = (id: string, x: number, y: number, opacity?: number) => void;

type Pose = { from: MapName; to: MapName; progress: number; settled: boolean };

const CHANGES: ReadonlyArray<{ start: number; end: number; to: MapName }> = [
  { start: 8500, end: 9500, to: 'x1' },
  { start: 10500, end: 11500, to: 'composite' },
  { start: 12500, end: 13500, to: 'inverse' },
  { start: 15000, end: 16500, to: 'x0' },
];

function poseAt(time: number): Pose {
  if (time >= 77500 && time < 102500) return { from: 'transport', to: 'transport', progress: 1, settled: true };

  if (time >= 102500 && time < 104000) return { from: 'transport', to: 'x0', progress: smooth(time, 102500, 104000), settled: false };

  let from: MapName = 'x0';

  for (const change of CHANGES) {
    if (time < change.start) break;
    if (time < change.end) return { from, to: change.to, progress: smooth(time, change.start, change.end), settled: false };

    from = change.to;
  }

  return { from, to: from, progress: 1, settled: true };
}

function slopeText(value: number): string {
  return value === .5 ? '1/2' : String(value);
}

export function drawThompsonGraph(
  pen: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: GraphColors,
  labelCallback: GraphLabel,
): void {
  const tall = height > width;
  const size = Math.min(width * (tall ? .62 : .39), height * (tall ? .27 : .53));
  const left = width * (tall ? .5 : .255) - size / 2;
  const top = height * (tall ? .04 : .12);
  const bottom = top + size;
  const centerX = left + size / 2;
  const screen = (point: Point): Point => ({ x: left + size * point.x, y: bottom - size * point.y });
  const pose = poseAt(time);
  const valueAt = (x: number): number => mapValue(MAPS[pose.from], x) * (1 - pose.progress) + mapValue(MAPS[pose.to], x) * pose.progress;
  const proofCuttings = fade(time, 62000, 63500, 77500, 79000);
  const graphOpacity = 1 - proofCuttings;
  const parents = fade(time, 70500, 72500, 94500, 96000);
  const transport = fade(time, 77500, 79500, 86000, 88000);
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
  const line = (a: Point, b: Point, color: string, opacity = 1, weight = 1): void => {
    if (opacity < .005) return;

    pen.globalAlpha = opacity;
    pen.strokeStyle = color;
    pen.lineWidth = weight;
    pen.beginPath();
    pen.moveTo(a.x, a.y);
    pen.lineTo(b.x, b.y);
    pen.stroke();
    pen.globalAlpha = 1;
  };

  pen.save();
  pen.lineWidth = .8;
  pen.strokeStyle = colors.muted;
  pen.strokeRect(left, top, size, size);
  line({ x: left, y: bottom }, { x: left + size, y: top }, colors.muted, .25, .65);

  for (const value of [.25, .5, .75]) {
    const x = left + size * value;
    const y = bottom - size * value;
    line({ x, y: bottom - 3 }, { x, y: bottom + 3 }, colors.muted, .7, .65);
    line({ x: left - 3, y }, { x: left + 3, y }, colors.muted, .7, .65);

    if (!tall) {
      const label = value === .25 ? '1/4' : value === .5 ? '1/2' : '3/4';
      text(label, x, bottom + 14, 35, .8, colors.muted);
      text(label, left - 20, y, 35, .8, colors.muted);
    }
  }

  text('0', left - (tall ? 9 : 14), bottom, 20, 1, colors.muted);
  text('1', left - (tall ? 9 : 14), top, 20, 1, colors.muted);
  text('1', left + size + (tall ? 8 : 0), bottom + (tall ? 8 : 14), 20, 1, colors.muted);

  if (graphOpacity > .005) {
    const reveal = smooth(time, 400, 4500);
    pen.beginPath();

    for (let index = 0; index <= 64; index++) {
      const x = Math.min(index / 64, reveal);
      const at = screen({ x, y: valueAt(x) });

      if (index === 0) pen.moveTo(at.x, at.y);
      else pen.lineTo(at.x, at.y);

      if (index / 64 >= reveal) break;
    }

    pen.strokeStyle = colors.ink;
    pen.lineWidth = tall ? 1.6 : 1.9;
    pen.globalAlpha = graphOpacity;
    pen.stroke();
    pen.globalAlpha = 1;

    if (pose.settled) {
      const map = MAPS[pose.to];
      const slopes = mapSlopes(map);
      const labels = smooth(time, 7500, 7900) * graphOpacity;

      if (tall && parents < .005 && time < 15000) {
        text(`SLOPES ${slopes.map(slopeText).join(', ')}`, left - width * .16, top + size * .52, width * .25, labels, colors.muted);
      } else if (!tall) {
        for (let index = 1; index < map.length; index++) {
          const from = map[index - 1];
          const to = map[index];

          if (!from || !to) continue;

          const at = screen({ x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 });
          text(slopeText(slopes[index - 1] ?? 1), at.x + 15, at.y - 13, 40, labels, colors.muted);
        }
      }
    }

    const bendLabels = fade(time, 2400, 4500, 7500, 8000);

    for (const [index, point] of MAPS.x0.entries()) {
      if (index === 0 || index === MAPS.x0.length - 1 || point.x > reveal) continue;

      const at = screen(point);
      pen.globalAlpha = bendLabels;
      pen.strokeStyle = colors.blue;
      pen.lineWidth = 1;
      pen.beginPath();
      pen.arc(at.x, at.y, tall ? 4 : 5, 0, 2 * Math.PI);
      pen.stroke();
      pen.globalAlpha = 1;
      const label = index === 1 ? '(1/2, 1/4)' : '(3/4, 1/2)';
      const x = tall ? index === 1 ? left - 38 : left + size + 37 : at.x + 48;
      const y = at.y + (index === 1 ? 12 : -12);
      line(at, { x, y }, colors.blue, bendLabels * .35, .6);
      text(label, x, y, 90, bendLabels, colors.blue);
    }
  }

  if (proofCuttings > .005) {
    for (const [row, cutting] of CUTTINGS.entries()) {
      const y = top + size * (.24 + row * .26);
      const appear = smooth(time, 62500 + row * 1500, 63800 + row * 1500) * proofCuttings;
      line({ x: left + 8, y }, { x: left + size - 8, y }, colors.muted, appear, 1);

      for (const cut of cutting) {
        const x = left + 8 + (size - 16) * cut;
        line({ x, y: y - 5 }, { x, y: y + 5 }, colors.ink, appear, 1);
      }
    }
  }

  const headingY = Math.max(8, top - (tall ? 11 : 24));

  if (proofCuttings > .5) text('DYADIC CUTTINGS', centerX, headingY, width * (tall ? .9 : .45));
  else if (!pose.settled) text('CHANGING MAP', centerX, headingY, width * (tall ? .9 : .45), graphOpacity, colors.muted);
  else if (pose.to === 'x0' || pose.to === 'x1' || pose.to === 'inverse') labelCallback(pose.to, centerX, headingY, graphOpacity);
  else text(pose.to === 'composite' ? 'x₀ AFTER x₁' : 'TRANSPORT MAP h', centerX, headingY, width * (tall ? .9 : .45), graphOpacity);

  const rulerLeft = width * (tall ? .10 : .07);
  const rulerWidth = width * (tall ? .80 : .38);
  const rulerTop = height * (tall ? .35 : .74);
  const rulerBottom = height * (tall ? .40 : .80);
  const appear = smooth(time, 800, 2400);
  const cuts = fade(time, 62000, 63500, 70500, 72500);
  const ordinary = 1 - Math.max(cuts, parents);
  line({ x: rulerLeft, y: rulerTop }, { x: rulerLeft + rulerWidth, y: rulerTop }, colors.ink, appear, .8);
  line({ x: rulerLeft, y: rulerBottom }, { x: rulerLeft + rulerWidth, y: rulerBottom }, colors.ink, appear, .8);

  for (let index = 0; index <= 16; index++) {
    const x = index / 16;
    const source = rulerLeft + rulerWidth * x;
    const destination = rulerLeft + rulerWidth * valueAt(x);
    line({ x: source, y: rulerTop - 3 }, { x: source, y: rulerTop + 3 }, colors.ink, appear * ordinary, .8);
    line({ x: destination, y: rulerBottom - 3 }, { x: destination, y: rulerBottom + 3 }, colors.blue, appear * ordinary, .8);
    line({ x: source, y: rulerTop + 3 }, { x: destination, y: rulerBottom - 3 }, colors.muted, appear * ordinary * .4, .7);
  }

  if (cuts > .005) {
    for (const cut of CUTTINGS[0]) {
      const x = rulerLeft + rulerWidth * cut;
      line({ x, y: rulerTop - 4 }, { x, y: rulerBottom + 4 }, colors.blue, cuts, 1);
    }
  }

  if (parents > .005) {
    for (const [index, parent] of PARENTS.entries()) {
      const x1 = rulerLeft + rulerWidth * parent.start;
      const x2 = rulerLeft + rulerWidth * parent.end;
      const alpha = parents * (1 - transport);
      line({ x: x1, y: rulerTop }, { x: x2, y: rulerTop }, colors.blue, alpha, 3);
      text(`I${index + 1}`, (x1 + x2) / 2, rulerTop - (tall ? 9 : 12), 30, alpha, colors.blue);

      for (const child of DESCENDANTS[index] ?? []) {
        const from = rulerLeft + rulerWidth * child.start;
        const to = rulerLeft + rulerWidth * child.end;
        line({ x: from, y: rulerBottom }, { x: to, y: rulerBottom }, colors.blue, alpha, 3);
        line({ x: (x1 + x2) / 2, y: rulerTop + 3 }, { x: (from + to) / 2, y: rulerBottom - 3 }, colors.muted, alpha * .4, .6);
      }
    }
  }

  if (transport > .005) {
    for (const interval of TRANSPORT_SOURCES) {
      const from1 = rulerLeft + rulerWidth * interval.start;
      const from2 = rulerLeft + rulerWidth * interval.end;
      const to1 = rulerLeft + rulerWidth * mapValue(MAPS.transport, interval.start);
      const to2 = rulerLeft + rulerWidth * mapValue(MAPS.transport, interval.end);
      pen.globalAlpha = transport * .12;
      pen.fillStyle = colors.blue;
      pen.beginPath();
      pen.moveTo(from1, rulerTop);
      pen.lineTo(from2, rulerTop);
      pen.lineTo(to2, rulerBottom);
      pen.lineTo(to1, rulerBottom);
      pen.closePath();
      pen.fill();
      pen.globalAlpha = 1;
      line({ x: from1, y: rulerTop }, { x: from2, y: rulerTop }, colors.blue, transport, 3);
      line({ x: to1, y: rulerBottom }, { x: to2, y: rulerBottom }, colors.blue, transport, 3);
      line({ x: from1, y: rulerTop }, { x: to1, y: rulerBottom }, colors.blue, transport * .7, .8);
      line({ x: from2, y: rulerTop }, { x: to2, y: rulerBottom }, colors.blue, transport * .7, .8);
    }
  }

  let caption = 'FROM A MARK TO ITS IMAGE';

  if (cuts > .5) caption = 'CUT AT DYADIC POINTS';
  else if (transport > .5) caption = 'TWO SEPARATED PIECES, CARRIED AFFINELY';
  else if (parents > .5) caption = tall ? 'D = 3 SHOWN · THE PROOF USES LARGE D' : 'THREE PARENTS, EACH HOLDING THREE COPIES · THE PROOF TAKES D LARGE';

  const captionAlpha = tall ? 1 - smooth(time, 14500, 15000) : 1;
  text(caption, rulerLeft + rulerWidth / 2, height * (tall ? .43 : .86), width * (tall ? .96 : .45), captionAlpha, colors.muted);

  if (tall && parents > .005) text('D = 3 SHOWN', left - width * .16, top + size * .52, width * .25, parents, colors.muted);
  pen.restore();
  pen.globalAlpha = 1;
}

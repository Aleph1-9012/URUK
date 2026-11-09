import { mix, progress, smooth } from '../../../lib/animation';
import { plateGeometry, type Box, type Colors, type Place } from './stage';
import type { ModeNumerics } from './transport';

type Point = { x: number; y: number };

function tag(pen: CanvasRenderingContext2D, words: string, x: number, y: number, size: number, width: number, colors: Colors): void {
  const family = words.includes('S³') || /^A[₁₂₃]$/u.test(words) ? '"Garamond Math", "Alegreya", serif' : '"Special Elite", monospace';
  pen.font = `${size}px ${family}`;
  const measured = pen.measureText(words).width;

  if (measured > width) pen.font = `${Math.max(8.5, size * width / measured)}px ${family}`;

  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  const metrics = pen.measureText(words);
  const actual = metrics.width;
  pen.fillStyle = colors.paper;
  pen.fillRect(x - actual / 2 - 2, y - metrics.actualBoundingBoxAscent - 2, actual + 4, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 4);
  pen.fillStyle = colors.ink;
  pen.fillText(words, x, y);
}

function segment(pen: CanvasRenderingContext2D, a: Point, b: Point, amount = 1): void {
  pen.beginPath();
  pen.moveTo(a.x, a.y);
  pen.lineTo(mix(a.x, b.x, amount), mix(a.y, b.y, amount));
  pen.stroke();
}

function metricPoint(box: Box): Point {
  return { x: box.x + box.w * .69, y: box.y + box.h * .50 };
}

function packetPoint(box: Box, id: number, count: number): Point {
  const plate = plateGeometry(box);
  const fold = id % 24;
  const along = Math.floor(id / 24) / Math.max(1, Math.ceil(count / 24) - 1);

  return {
    x: plate.x + plate.size * (.68 + .23 * along),
    y: plate.y + plate.size * (.24 + fold * .014 + .018 * Math.sin(along * Math.PI * 4)),
  };
}

function grains(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, numerics: readonly (ModeNumerics | undefined)[]): void {
  const tracks = numerics[6]?.tracks;

  if (!tracks) return;

  const plate = plateGeometry(box);
  const count = Math.min(tracks.count, box.w < 400 ? 900 : 2400);
  const intoPatch = smooth(time, 85250, 87650);
  const intoMetric = smooth(time, 93750, 95350);
  const backToPlate = smooth(time, 109500, 110600);
  const fixed = metricPoint(box);
  pen.fillStyle = colors.ink;
  pen.beginPath();

  for (let id = 0; id < count; id++) {
    const at = id * 2;
    const original = { x: plate.x + (tracks.after[at] ?? 0) * plate.size, y: plate.y + (1 - (tracks.after[at + 1] ?? 0)) * plate.size };
    const packet = packetPoint(box, id, count);
    const folded = { x: mix(original.x, packet.x, intoPatch), y: mix(original.y, packet.y, intoPatch) };
    const inward = { x: mix(folded.x, fixed.x, intoMetric), y: mix(folded.y, fixed.y, intoMetric) };
    const x = mix(inward.x, original.x, backToPlate);
    const y = mix(inward.y, original.y, backToPlate);
    pen.moveTo(x + .48, y);
    pen.arc(x, y, .48, 0, Math.PI * 2);
  }

  pen.fill();
}

function corrugatedCircle(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const plate = plateGeometry(box);
  const cx = plate.x + plate.size / 2;
  const cy = plate.y + plate.size / 2;
  const radius = plate.size / 2;
  const rounded = smooth(time, 85250, 87500);
  const rippled = smooth(time, 87500, 89000);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.1;
  pen.beginPath();

  for (let index = 0; index <= 320; index++) {
    const angle = index / 320 * Math.PI * 2;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const squareScale = 1 / Math.max(Math.abs(c), Math.abs(s));
    const delta = Math.atan2(Math.sin(angle + .5), Math.cos(angle + .5));
    const envelope = Math.exp(-delta * delta / .09);
    const radial = mix(squareScale, 1, rounded) + .009 * rippled * envelope * Math.sin(angle * 90);
    const x = cx + radius * radial * c;
    const y = cy + radius * radial * s;

    if (index === 0) pen.moveTo(x, y);
    else pen.lineTo(x, y);
  }

  pen.stroke();
  tag(pen, 'S³, DRAWN AS A CIRCLE · SCHEMATIC', box.x + box.w / 2, box.y + 5, 11, box.w, colors);

  if (time < 88500) return;

  const inset = { x: plate.x + plate.size * .33, y: plate.y + plate.size * .34 };
  const size = plate.size * .14;
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  segment(pen, { x: cx + radius * Math.cos(-.5), y: cy + radius * Math.sin(-.5) }, { x: inset.x + size, y: inset.y });
  pen.beginPath();
  pen.arc(inset.x, inset.y, size, 0, Math.PI * 2);
  pen.stroke();
  pen.save();
  pen.clip();
  pen.strokeStyle = colors.ink;
  pen.beginPath();

  for (let index = 0; index <= 120; index++) {
    const t = index / 120;
    const x = inset.x + size * (2 * t - 1);
    const y = inset.y + size * .17 * Math.sin(t * Math.PI * 14) * progress(time, 88500, 90000);

    if (index === 0) pen.moveTo(x, y);
    else pen.lineTo(x, y);
  }

  pen.stroke();
  pen.restore();
  tag(pen, 'PATCH MAGNIFIED', inset.x, inset.y + size + 11, 9, size * 2.5, colors);
  tag(pen, 'ONE FIXED SMOOTH METRIC · NEAR ROUND', box.x + box.w / 2, box.y + box.h - 3, 10, box.w, colors);
}

function oval(pen: CanvasRenderingContext2D, centre: Point, rx: number, ry: number, amount: number): void {
  pen.beginPath();
  pen.ellipse(centre.x, centre.y, rx, ry, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * amount);
  pen.stroke();
}

function nestedMetrics(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place): void {
  const centre = { x: box.x + box.w * .5, y: box.y + box.h * .51 };
  const outerRadius = Math.max(53, box.h * .31);
  const fixed = metricPoint(box);
  const round = { x: box.x + box.w * .24, y: centre.y };
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  oval(pen, centre, box.w * .47, outerRadius, progress(time, 93750, 94750));
  tag(pen, 'ANY C∞ NEIGHBOURHOOD OF ROUND', centre.x, box.y + 6, 10.5, box.w, colors);
  pen.fillStyle = colors.ink;
  pen.beginPath();
  pen.arc(round.x, round.y, 2.5, 0, Math.PI * 2);
  pen.fill();
  tag(pen, 'ROUND', round.x, round.y - 13, 10, box.w * .3, colors);
  tag(pen, 'ANALYTIC', round.x, round.y + 15, 9, box.w * .3, colors);

  const witnesses = Array.from({ length: 3 }, (_, index) => ({
    rx: box.w * (.21 - index * .055),
    ry: Math.max(mix([51, 39, 27][index] ?? 27, [40, 33, 27][index] ?? 27, smooth(time, 102500, 103400)), box.h * (.20 - index * .052)),
    at: 94900 + index * 1300,
  }));

  for (const { rx, ry, at } of witnesses) {
    oval(pen, fixed, rx, ry, progress(time, at, at + 950));
  }

  for (const [index, { rx, ry, at }] of witnesses.entries()) {
    if (time >= at + 500 && time < 102500) tag(pen, `${box.w < 400 ? '' : 'RATIO > '}A${['₁', '₂', '₃'][index]}`, fixed.x, fixed.y - ry + 9, 9, rx * 2, colors);
  }

  const stops = [
    { x: fixed.x + box.w * .13, y: fixed.y + box.h * .11 },
    { x: fixed.x + box.w * .07, y: fixed.y + box.h * .07 },
    { x: fixed.x + box.w * .025, y: fixed.y + box.h * .025 },
    fixed,
  ];
  const clock = progress(time, 95400, 100600) * 3;
  const index = Math.min(2, Math.floor(clock));
  const a = stops[index];
  const b = stops[index + 1];

  if (a && b) {
    const moving = { x: mix(a.x, b.x, clock - index), y: mix(a.y, b.y, clock - index) };
    pen.beginPath();
    pen.arc(moving.x, moving.y, 3, 0, Math.PI * 2);
    pen.fill();
    if (time < 100600) tag(pen, `g${['₁', '₂', '₃'][index]}`, moving.x + 15, moving.y + 13, 10, 62, colors);
  }

  if (time >= 100600) place('metric-limit', fixed.x, fixed.y + 14);

  if (time < 102500) place(box.w < 400 ? 'neighbourhoods-compact' : 'neighbourhoods', box.x + box.w / 2, centre.y + outerRadius + 20);
  tag(pen, 'SCHEMATIC · NEAR ROUND, NOT ROUND', centre.x, box.y + box.h - 2, 10, box.w, colors);
}

export function drawCounterexamples(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, numerics: readonly (ModeNumerics | undefined)[]): void {
  if (time < 85250 || time >= 110600) return;

  if (time < 93750) corrugatedCircle(pen, box, time, colors);
  else if (time < 109500) nestedMetrics(pen, box, time, colors, place);

  grains(pen, box, time, colors, numerics);
}

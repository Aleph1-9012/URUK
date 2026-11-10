import { smooth } from '../../../lib/animation';
import { type Box, type Colors, type Place, line, text } from './drawing';
import { type BounceModel, type TableKey, directionStats, samplePackedRunByDistance, sampleRunByDistance, timeShareLeft } from './math';
import { checkpointAt, playbackDistance, tableAt } from './story';

type CircleStats = ReturnType<typeof directionStats>;

type Readout = {
  kind: 'computed' | 'prefix';
  stats: CircleStats;
  bounces: number;
  gaugeBounces: number;
  share: number;
  area: number;
  heading: number;
} | { kind: 'stopped'; reason: string };

function experimentReadout(model: BounceModel, key: TableKey, time: number): Readout {
  const distance = playbackDistance(time);

  if (model.computation.kind === 'failed') return { kind: 'stopped', reason: model.computation.reason };

  if (model.computation.kind === 'ready') {
    const computed = model.computation.cases[key];

    if (computed.run.kind !== 'complete') return { kind: 'stopped', reason: computed.run.reason ?? 'THE COMPUTED PATH STOPS HERE' };

    const checkpoint = key === 'irrational' ? checkpointAt(time) : 100000;
    const anchor = computed.shares.find(row => row.bounces === checkpoint);

    if (!anchor) throw new Error(`The completed experiment has no ${checkpoint}-bounce time share.`);

    return {
      kind: 'computed', stats: computed.stats, bounces: computed.bounces, gaugeBounces: anchor.bounces,
      share: anchor.share, area: computed.areaShare, heading: samplePackedRunByDistance(computed.run, distance).heading,
    };
  }

  const table = model.cases[key];

  if (table.run.kind !== 'complete') return { kind: 'stopped', reason: table.run.reason };

  const bounces = table.run.directions.length;

  return {
    kind: 'prefix', stats: directionStats(table.run.directions), bounces, gaugeBounces: bounces,
    share: timeShareLeft(table.run), area: table.areaShare, heading: sampleRunByDistance(table.run, distance).heading,
  };
}

function circleGeometry(box: Box, tall: boolean): { x: number; y: number; radius: number } {
  return {
    x: box.x + box.w / 2,
    y: box.y + box.h * (tall ? .23 : .25),
    radius: tall ? Math.min(34, box.h * .12, box.w * .16) : Math.min(box.w * .31, box.h * .18),
  };
}

function circleFrame(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, tall: boolean): void {
  const circle = circleGeometry(box, tall);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .8;
  pen.beginPath();
  pen.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  pen.stroke();

  for (let sector = 0; sector < 24; sector++) {
    const angle = sector / 24 * Math.PI * 2;
    line(pen,
      circle.x + Math.cos(angle) * circle.radius,
      circle.y - Math.sin(angle) * circle.radius,
      circle.x + Math.cos(angle) * (circle.radius + 3),
      circle.y - Math.sin(angle) * (circle.radius + 3));
  }

  if (time >= 52250) {
    pen.strokeStyle = colors.blue;
    pen.lineWidth = tall ? 2 : 2.5;
    pen.beginPath();
    pen.arc(circle.x, circle.y, circle.radius + 7, 0, Math.PI * 2);
    pen.stroke();
  }
}

function directionCircle(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, tall: boolean, readout: Exclude<Readout, { kind: 'stopped' }>): void {
  const circle = circleGeometry(box, tall);
  const episode = tableAt(time);
  const elapsed = time < 16000 ? time - 8000 : episode.localTime;
  const reveal = smooth(elapsed, 0, 1400);
  const count = Math.floor(readout.stats.headings.length * reveal);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = readout.stats.distinct <= 24 ? 2 : tall ? .4 : .65;
  pen.beginPath();

  for (let index = 0; index < count; index++) {
    const angle = readout.stats.headings[index];

    if (angle === undefined) throw new Error('A revealed heading exists in the computed experiment.');

    pen.moveTo(circle.x + Math.cos(angle) * circle.radius * .68, circle.y - Math.sin(angle) * circle.radius * .68);
    pen.lineTo(circle.x + Math.cos(angle) * circle.radius, circle.y - Math.sin(angle) * circle.radius);
  }

  pen.stroke();
  circleFrame(pen, box, time, colors, tall);
  pen.strokeStyle = colors.ink;
  pen.fillStyle = colors.ink;
  pen.lineWidth = 1.2;
  const dx = Math.cos(readout.heading);
  const dy = -Math.sin(readout.heading);
  const tipX = circle.x + dx * circle.radius * .54;
  const tipY = circle.y + dy * circle.radius * .54;
  line(pen, circle.x, circle.y, tipX, tipY);
  line(pen, tipX, tipY, tipX - dx * 4 + dy * 2.5, tipY - dy * 4 - dx * 2.5);
  line(pen, tipX, tipY, tipX - dx * 4 - dy * 2.5, tipY - dy * 4 + dx * 2.5);
  pen.beginPath();
  pen.arc(circle.x, circle.y, 1.6, 0, Math.PI * 2);
  pen.fill();
  const occupied = readout.stats.bins.length - readout.stats.empty;
  const number = readout.stats.distinct.toLocaleString('en-US');
  const title = tall ? `${number} HEADINGS · ${occupied}/24 SECTORS` : `${number} DISTINCT HEADINGS · ${occupied}/24 SECTORS`;
  text(pen, title, circle.x, box.y + box.h * (tall ? .43 : .48), tall ? 10 : 16, box.w - 5, colors);
  const status = readout.kind === 'computed' ? `COMPUTED ${readout.bounces.toLocaleString('en-US')} BOUNCES` : `${readout.bounces} BOUNCES · CALCULATING 100,000`;
  text(pen, status, circle.x, box.y + box.h * (tall ? .49 : .52), tall ? 9 : 13, box.w - 5, colors);
}

function shareGauge(pen: CanvasRenderingContext2D, box: Box, colors: Colors, tall: boolean, readout: Exclude<Readout, { kind: 'stopped' }>): void {
  const left = box.x + 8;
  const width = box.w - (tall ? 52 : 62);
  const top = box.y + box.h * (tall ? .55 : .59);
  const gap = tall ? box.h * .10 : 40;
  const barHeight = tall ? 5 : 8;

  for (const [index, words, value] of [
    [0, `TIME LEFT · ${readout.gaugeBounces.toLocaleString('en-US')} BOUNCES`, readout.share],
    [1, 'AREA LEFT · EXACT', readout.area],
  ] as const) {
    const y = top + index * gap;
    text(pen, words, left, y, tall ? 8.5 : 12, width + 8, colors, 'left');
    pen.strokeStyle = colors.ink;
    pen.fillStyle = colors.ink;
    pen.lineWidth = .8;
    const barY = y + (tall ? 10 : 14);
    pen.strokeRect(left, barY, width, barHeight);
    pen.fillRect(left, barY, width * value, barHeight);
    text(pen, value.toFixed(3), left + width + (tall ? 23 : 28), barY + barHeight / 2, tall ? 11 : 15, tall ? 40 : 50, colors);
  }
}

function ledger(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, tall: boolean): void {
  const x = box.x + box.w / 2;
  const top = box.y + box.h * (tall ? .79 : .80);
  const size = tall ? 8.5 : 13;
  const spacing = tall ? 12.5 : 21;

  if (time >= 52250) {
    text(pen, 'CLAIMED: EVERY IRRATIONAL TRIANGLE', x, top, tall ? 9 : 15, box.w - 5, colors, 'center', colors.blue);
    text(pen, 'ERGODIC 25 SEP · WEAKLY MIXING 5 OCT', x, top + (tall ? 13 : 24), tall ? 8.5 : 13, box.w - 5, colors, 'center', colors.blue);

    if (time >= 91500) text(pen, 'UNREVIEWED', x, box.y + box.h * .95, tall ? 16 : 25, box.w - 5, colors);
    else if (time >= 84500) {
      text(pen, 'STRONG MIXING: NOT CLAIMED', x, box.y + box.h * .91, size, box.w - 5, colors);
      text(pen, '4 OR MORE SIDES: NOT CLAIMED', x, box.y + box.h * (tall ? .97 : .96), size, box.w - 5, colors);
    } else if (time >= 77500) {
      text(pen, 'NOT ERGODIC ON THE FULL SPACE', x, box.y + box.h * .95, size, box.w - 5, colors);
    }

    return;
  }

  if (time >= 43250) {
    text(pen, 'ONE BALL, ONE TABLE', x, top, tall ? 10 : 16, box.w - 5, colors);
    text(pen, 'A PICTURE, NOT EVIDENCE', x, top + spacing + 3, tall ? 10 : 16, box.w - 5, colors);

    return;
  }

  if (time >= 29750) {
    text(pen, 'KERCKHOFF–MASUR–SMILLIE 1986', x, top, size, box.w - 5, colors);
    text(pen, 'DENSE SET OF POLYGONS', x, top + spacing, size, box.w - 5, colors);
    text(pen, 'VOROBETS · VERY WELL APPROXIMABLE ANGLES', x, top + spacing * 2, size, box.w - 5, colors);
    text(pen, 'CHAIKA–FORNI · WEAK MIXING, DENSE SET', x, top + spacing * 3, size, box.w - 5, colors);

    return;
  }

  if (time >= 16000) {
    text(pen, 'IT FILLS THE TABLE', x, top, tall ? 11 : 17, box.w - 5, colors);
    text(pen, 'FINITE DIRECTIONS', x, top + spacing + 4, tall ? 11 : 17, box.w - 5, colors);
  }
}

function opening(pen: CanvasRenderingContext2D, box: Box, colors: Colors, model: BounceModel, tall: boolean): void {
  const x = box.x + box.w / 2;
  text(pen, 'ONE START, ONE HEADING', x, box.y + box.h * .20, tall ? 11 : 18, box.w - 5, colors);
  text(pen, `START (${model.start.x.toFixed(2)}, ${model.start.y.toFixed(2)})`, x, box.y + box.h * .38, tall ? 13 : 21, box.w - 5, colors);
  text(pen, `${model.heading.toFixed(2)} rad`, x, box.y + box.h * .53, tall ? 14 : 22, box.w - 5, colors);
  const y = box.y + box.h * .76;
  const length = Math.min(box.w * .23, box.h * .21);
  const endX = x + Math.cos(model.heading) * length;
  const endY = y - Math.sin(model.heading) * length;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.5;
  line(pen, x - length / 2, y, endX - length / 2, endY);
  line(pen, endX - length / 2, endY, endX - length / 2 - 6, endY + 1);
  line(pen, endX - length / 2, endY, endX - length / 2 - 4, endY + 6);
}

export function drawPanels(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, _place: Place, model: BounceModel, tall: boolean): void {
  pen.setLineDash([]);

  if (time < 8000) {
    opening(pen, box, colors, model, tall);

    return;
  }

  const x = box.x + box.w / 2;
  text(pen, 'DIRECTION CIRCLE', x, box.y + 9, tall ? 10 : 16, box.w - 5, colors);
  const episode = tableAt(time);

  if (episode.transition) {
    circleFrame(pen, box, time, colors, tall);
    text(pen, 'TRANSITION', x, box.y + box.h * (tall ? .43 : .48), tall ? 12 : 20, box.w - 5, colors);
    text(pen, 'STATIC READOUTS PAUSED', x, box.y + box.h * .61, tall ? 10 : 15, box.w - 5, colors);
    ledger(pen, box, time, colors, tall);

    return;
  }

  const readout = experimentReadout(model, episode.key, time);

  if (readout.kind === 'stopped') {
    circleFrame(pen, box, time, colors, tall);
    text(pen, 'CALCULATION STOPPED', x, box.y + box.h * (tall ? .43 : .48), tall ? 12 : 20, box.w - 5, colors);
    text(pen, readout.reason, x, box.y + box.h * .61, tall ? 9 : 14, box.w - 5, colors);
    ledger(pen, box, time, colors, tall);

    return;
  }

  directionCircle(pen, box, time, colors, tall, readout);
  shareGauge(pen, box, colors, tall, readout);
  ledger(pen, box, time, colors, tall);
}

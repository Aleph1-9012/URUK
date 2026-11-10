import { type Box, type Colors, type Place, line, runtimeChartBox, runtimeChartPoint, text } from './drawing';
import { freeVertices, runtimeAt, type PairModel } from './math';
import { blossomProgress, claimProgress, classicalProgress, flipProgress, greedyProgress, inputProgress } from './story';

function powerLabel(exponent: number): string {
  const digits = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  let result = '10';

  for (const digit of `${exponent}`) {
    const mark = digits[Number(digit)];

    if (mark === undefined) throw new Error('The chart uses nonnegative integer powers of ten.');

    result += mark;
  }

  return result;
}

function status(model: PairModel, time: number): { title: string; caption: string } {
  const flip = flipProgress(time);

  if (flip.moving) return { title: 'SWAPPING ALONG THE PATH', caption: 'RETRACT THE OLD PAIR, THEN ADD TWO' };

  if (time < 16000) {
    const index = Math.min(model.greedyStages.length - 1, Math.floor(greedyProgress(time) * (model.greedyStages.length - 1)));
    const current = model.greedyStages[index];

    if (!current) throw new Error('The greedy animation has its completed matching state.');

    const free = freeVertices(model.n, current);
    const caption = time < 7500 ? 'TAKE THE FIRST AVAILABLE LINKS' : `${free.length} PEOPLE LEFT: ${free.map(person => person + 1).join(' AND ')}`;

    return { title: `${current.length} PAIRS${time < 7500 ? ' SO FAR' : ''}`, caption };
  }

  if (!flip.complete) return { title: `${model.greedy.length} PAIRS · ALTERNATING PATH`, caption: model.augmentingPath.map(person => person + 1).join(' - ') };

  if (time >= 64250) return { title: `${model.final.length} PAIRS · UNREVIEWED · NO LEAN`, caption: 'BLUE HEIGHT SCHEMATIC · EXPONENT NOT SETTABLE' };

  if (time >= 53750) return { title: `${model.final.length} PAIRS · THE MOST POSSIBLE`, caption: 'CLAIMED ON EVERY GRAPH · HEIGHT SCHEMATIC' };

  if (time >= 45750) {
    const amount = blossomProgress(time);
    const caption = amount === 1 ? `${model.blossom.externalMatching.length} VISIBLE + ${model.blossom.internalMatching.length} INSIDE = ${model.final.length}` : time < 48250 ? 'AN ODD RING CANNOT BE TWO KINDS' : 'EDMONDS SHRINKS THE RING, THEN EXPANDS IT';

    return { title: `${model.final.length} PAIRS REMAIN`, caption };
  }

  if (time >= 30500) return { title: `${model.final.length} PAIRS · THE MOST POSSIBLE`, caption: '2022: A SEPARATE BIPARTITE EXAMPLE' };

  return { title: `${model.final.length} PAIRS · THE MOST POSSIBLE`, caption: `CHECKED ALL ${model.checkedSubsets.toLocaleString('en-US')} LINK SETS` };
}

function axes(pen: CanvasRenderingContext2D, plot: Box, colors: Colors, tall: boolean): void {
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .7;
  line(pen, plot.x, plot.y, plot.x, plot.y + plot.h);
  line(pen, plot.x, plot.y + plot.h, plot.x + plot.w, plot.y + plot.h);

  for (const exponent of [3, 5, 7, 9, 11]) {
    const point = runtimeChartPoint(1e3, 10 ** exponent, plot);
    line(pen, plot.x - 3, point.y, plot.x, point.y);
    text(pen, powerLabel(exponent), plot.x - 8, point.y, tall ? 9.5 : 12, tall ? 25 : 35, colors, 'right');
  }

  for (const exponent of [3, 4, 5, 6, 7]) {
    const point = runtimeChartPoint(10 ** exponent, 1e3, plot);
    line(pen, point.x, point.y, point.x, point.y + 3);
    text(pen, powerLabel(exponent), point.x, point.y + (tall ? 13 : 17), tall ? 9.5 : 12, tall ? 28 : 38, colors);
  }

  text(pen, 'STEPS', plot.x - 5, plot.y - 13, tall ? 8.5 : 11, 48, colors, 'right');
  text(pen, 'n', plot.x + plot.w + 10, plot.y + plot.h - 2, tall ? 11 : 15, 15, colors);
}

function boundDescriptions(pen: CanvasRenderingContext2D, plot: Box, time: number, colors: Colors, tall: boolean): void {
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .55;

  if (classicalProgress(time) === 1) {
    const reading = runtimeAt(8e5);
    const point = runtimeChartPoint(reading.n, reading.classical, plot);
    const y = plot.y + (tall ? 14 : 22);
    line(pen, plot.x + plot.w * .55, y + 10, point.x, point.y);
    text(pen, 'MICALI–VAZIRANI 1980', plot.x + plot.w * .34, y, tall ? 9.5 : 11, plot.w * .63, colors);
  }

  if (inputProgress(time) === 1) {
    const reading = runtimeAt(1e6);
    const point = runtimeChartPoint(reading.n, reading.input, plot);
    const y = plot.y + plot.h - (tall ? 13 : 18);
    line(pen, plot.x + plot.w * .70, y - (tall ? 10 : 12), point.x, point.y);
    text(pen, 'READING THE INPUT', plot.x + plot.w * .68, y, tall ? 9.5 : 11, plot.w * .60, colors);
  }
}

function runtimeChart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, tall: boolean): void {
  const x = box.x + box.w / 2;
  const plot = runtimeChartBox(box, tall);
  text(pen, 'TIME TO FIND THE MOST PAIRS', x, box.y + (tall ? 56 : 93), tall ? 10.5 : 16, box.w - 6, colors);
  place('graph-variables', x - (tall ? 36 : 45), box.y + (tall ? 75 : 120));
  text(pen, 'CONSTANTS 1', x + (tall ? 48 : 62), box.y + (tall ? 75 : 120), tall ? 8.5 : 12, box.w * .45, colors);
  axes(pen, plot, colors, tall);
  const first = runtimeAt(1e3);
  const last = runtimeAt(1e7);
  const classicalFirst = runtimeChartPoint(first.n, first.classical, plot);
  const classicalLast = runtimeChartPoint(last.n, last.classical, plot);
  const inputFirst = runtimeChartPoint(first.n, first.input, plot);
  const inputLast = runtimeChartPoint(last.n, last.input, plot);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = tall ? 1.3 : 1.7;
  line(pen, classicalFirst.x, classicalFirst.y, classicalLast.x, classicalLast.y, classicalProgress(time));

  const legendY = plot.y + plot.h + (tall ? 35 : 40);
  line(pen, box.x + 7, legendY, box.x + 25, legendY);
  place('mv-bound', box.x + box.w * .27, legendY);

  if (time >= 30500) {
    pen.lineWidth = tall ? .75 : 1;
    line(pen, inputFirst.x, inputFirst.y, inputLast.x, inputLast.y, inputProgress(time));
    line(pen, box.x + box.w * .57, legendY, box.x + box.w * .64, legendY);
    place('input-bound', box.x + box.w * .81, legendY);
  }

  if (time >= 53750) {
    const offset = tall ? 3.5 : 6;
    pen.strokeStyle = colors.blue;
    pen.lineWidth = tall ? 1.8 : 2.3;
    pen.setLineDash(tall ? [4, 3] : [6, 4]);
    line(pen, inputFirst.x, inputFirst.y - offset, inputLast.x, inputLast.y - offset, claimProgress(time));
    pen.setLineDash([]);
    const claimY = plot.y + plot.h + (tall ? 59 : 76);
    text(pen, 'CLAIMED', box.x + box.w * .17, claimY, tall ? 8.5 : 12, box.w * .30, colors);
    place('claimed-bound', box.x + box.w * .64, claimY);
  }

  boundDescriptions(pen, plot, time, colors, tall);
}

export function drawPanels(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: PairModel, tall: boolean): void {
  pen.setLineDash([]);
  const words = status(model, time);
  const x = box.x + box.w / 2;

  if (time < 16000) {
    text(pen, words.title, x, box.y + (tall ? 30 : 74), tall ? 28 : 40, box.w - 6, colors);
    text(pen, words.caption, x, box.y + (tall ? 72 : 135), tall ? 11 : 16, box.w - 6, colors);
    text(pen, time >= 9000 ? `CAN WE DO BETTER THAN ${model.greedy.length}?` : 'ONE PERSON IN AT MOST ONE PAIR', x, box.y + (tall ? 113 : 206), tall ? 12 : 18, box.w - 6, colors);
    text(pen, `${model.n} PEOPLE · ${model.edges.length} WILLING LINKS`, x, box.y + (tall ? 168 : 291), tall ? 10 : 14, box.w - 6, colors);

    return;
  }

  text(pen, words.title, x, box.y + (tall ? 6 : 15), tall ? 12 : 20, box.w - 6, colors);
  text(pen, words.caption, x, box.y + (tall ? 26 : 45), tall ? 9 : 13, box.w - 6, colors);

  if (time >= 53750 && time < 64250) text(pen, 'THE o(1) IS NOT A SETTABLE NUMBER', x, box.y + (tall ? 40 : 66), tall ? 8.5 : 12, box.w - 6, colors);

  runtimeChart(pen, box, time, colors, place, tall);
}

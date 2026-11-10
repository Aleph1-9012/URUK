import { type Box, type Colors, type Place, chartPoint, line, text } from './drawing';
import { chartAt, type SelectionModel } from './math';
import { chartProgress, chartView, claimProgress, fillProgress, humanProgress, sortProgress, trialIndex, walkProgress, zoomProgress } from './story';

function status(model: SelectionModel, time: number): { title: string; caption: string; note?: string } {
  if (time < 6000) return { title: `${model.n} NUMBERS · ONE TARGET`, caption: 'EACH TILE MAY BE CHOSEN ONCE' };

  if (time < 11000) {
    const trial = model.trials[trialIndex(time)];

    if (!trial) throw new Error('Each opening trial uses a computed selection.');

    return { title: trial.comparison === 'small' ? 'TOO SMALL' : 'TOO BIG', caption: `${trial.selection.length} TILES SELECTED` };
  }

  if (time < 18250) return { title: 'SUBSET SUM · NP-COMPLETE', caption: 'KARP 1972 · KNAPSACK' };
  if (time < 21000) return { title: 'BUILDING THE SQUARE', caption: `${model.size} SELECTIONS OF EACH HALF`, note: 'ONE CELL FOR EVERY FULL SELECTION' };

  if (time < 27250) return { title: `${Math.floor(fillProgress(time) * model.cells.length).toLocaleString('en-US')} OF ${model.cells.length.toLocaleString('en-US')} SELECTIONS`, caption: 'ALL MUST BE CHECKED WHEN NONE WORKS' };
  if (time < 31500) return { title: `${model.size} + ${model.size} SUMS LISTED`, caption: sortProgress(time) > 0 ? 'ROWS ASCENDING · COLUMNS DESCENDING' : 'SORT THE TWO HALF-LISTS' };

  if (time < 41250) {
    const index = Math.floor(walkProgress(time) * (model.walk.length - 1));
    const step = model.walk[index];

    if (!step) throw new Error('The staircase readout names its last completed cell.');

    const caption = step.move === 'hit' ? `ONLY HIT: TILE POSITIONS ${model.solution.map(number => number + 1).join(', ')}` : step.move === 'down' ? 'TOO SMALL: STEP DOWN' : 'TOO BIG: STEP RIGHT';

    return { title: `${index + 1} CELLS VISITED OF ${model.cells.length.toLocaleString('en-US')}`, caption };
  }

  if (time < 52250) return { title: 'THE 1974 REFERENCE EXPONENT', caption: 'ARBITRARY INPUTS · CONSTANTS 1' };
  if (time < 62000) return { title: `${model.sameRemainder.length} HAVE THE TARGET REMAINDER`, caption: `MOD ${model.prime}: ${model.aliases.length} ALIASES HAVE THE WRONG SUM` };
  if (time < 71500) return { title: `EXACT TOY: ${model.sameRemainder.length} − ${model.aliases.length} = 1`, caption: 'PAPER: SAMPLED COUNT · HERE: EXACT COUNT' };
  if (time < 78500) return { title: 'CLAIMED: EVERY INPUT', caption: 'RANDOMIZED · CORRECT WITH PROBABILITY ≥ 2/3', note: 'POLYNOMIAL-BIT INTEGERS' };
  if (time < 86000) return { title: 'LI–YE · 7 OCTOBER', caption: 'INDEPENDENT HUMAN PAPER · DIFFERENT METHOD', note: 'COINCIDENT WITH 1/2 AT THIS SCALE' };

  if (time < 93000) {
    const first = chartAt(100);
    const last = chartAt(200);

    return { title: 'SEPARATE EXACT GAPS · LOG₂ STEPS', caption: `n=100: Δ=${first.log2Gain}→×${first.gain} · n=200: Δ=${last.log2Gain}→×${last.gain}`, note: 'CONSTANTS NOT GIVEN · EXPONENT CLAIM' };
  }

  return { title: 'UNREVIEWED · NO LEAN', caption: 'POLYNOMIAL-BIT INPUTS · RANDOMIZED CLAIM', note: 'CONSTANTS NOT GIVEN · EXPONENT ONLY' };
}

function axes(pen: CanvasRenderingContext2D, plot: Box, time: number, colors: Colors, tall: boolean): void {
  const view = chartView(time);
  const zoom = zoomProgress(time);
  const xTicks = zoom === 0 ? [0, 50, 100, 150, 200] : zoom === 1 ? [150, 175, 200] : [view.minN, (view.minN + view.maxN) / 2, view.maxN];
  const yTicks = zoom === 0 ? [0, 50, 100, 150, 200] : zoom === 1 ? [70, 80, 90, 100] : [view.minLog, (view.minLog + view.maxLog) / 2, view.maxLog];
  const format = (value: number): string => Number.isInteger(value) ? `${value}` : value.toFixed(1);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .7;
  line(pen, plot.x, plot.y, plot.x, plot.y + plot.h);
  line(pen, plot.x, plot.y + plot.h, plot.x + plot.w, plot.y + plot.h);

  for (const n of xTicks) {
    const point = chartPoint(n, view.minLog, plot, view);
    line(pen, point.x, point.y, point.x, point.y + 3);
    text(pen, format(n), point.x, point.y + (tall ? 12 : 17), tall ? 8.5 : 11, 38, colors);
  }

  for (const logarithm of yTicks) {
    const point = chartPoint(view.minN, logarithm, plot, view);
    line(pen, plot.x - 3, point.y, plot.x, point.y);
    text(pen, format(logarithm), plot.x - 7, point.y, tall ? 8.5 : 11, 33, colors, 'right');
  }

  text(pen, 'LOG₂ STEPS', plot.x - 1, plot.y - 12, tall ? 8 : 11, 76, colors, 'left');
  text(pen, 'n', plot.x + plot.w + 10, plot.y + plot.h - 2, tall ? 11 : 15, 14, colors);
}

function chart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, tall: boolean): void {
  const plot = { x: box.x + (tall ? 31 : 45), y: box.y + (tall ? 82 : 132), w: box.w - (tall ? 44 : 62), h: box.h - (tall ? 146 : 250) };
  const view = chartView(time);
  const draw = (value: (n: number) => number, reveal: number): void => {
    const endN = view.minN + (view.maxN - view.minN) * reveal;
    const first = chartPoint(view.minN, value(view.minN), plot, view);
    const last = chartPoint(endN, value(endN), plot, view);
    line(pen, first.x, first.y, last.x, last.y);
  };
  text(pen, 'STEPS AGAINST n · CONSTANTS 1', box.x + box.w / 2, box.y + (tall ? 56 : 93), tall ? 10 : 16, box.w - 6, colors);
  axes(pen, plot, time, colors, tall);
  pen.save();
  pen.beginPath();
  pen.rect(plot.x - 1, plot.y - 1, plot.w + 2, plot.h + 2);
  pen.clip();
  pen.strokeStyle = colors.ink;
  pen.lineWidth = tall ? 1.2 : 1.6;
  draw(n => chartAt(n).brute, chartProgress(time));
  pen.lineWidth = tall ? .85 : 1.15;
  draw(n => chartAt(n).mitm, chartProgress(time));

  if (time >= 71500) {
    pen.strokeStyle = colors.blue;
    pen.lineWidth = tall ? 1.8 : 2.3;
    pen.setLineDash(tall ? [4, 3] : [6, 4]);
    draw(n => chartAt(n).claimed, claimProgress(time));
    pen.setLineDash([]);
  }

  if (time >= 78500) {
    pen.strokeStyle = colors.paper;
    pen.lineWidth = tall ? 2.8 : 3.5;
    draw(n => chartAt(n).liYe, humanProgress(time));
    pen.strokeStyle = colors.ink;
    pen.lineWidth = tall ? 1 : 1.3;
    pen.setLineDash(tall ? [1, 3] : [1.5, 4]);
    draw(n => chartAt(n).liYe, humanProgress(time));
    pen.setLineDash([]);
  }

  pen.restore();
  const legendY = plot.y + plot.h + (tall ? 31 : 41);

  if (time < 71500) {
    place('all-bound', box.x + box.w * .27, legendY);
    place('meet-bound', box.x + box.w * .77, legendY);
    text(pen, 'EVERY SELECTION', box.x + box.w * .27, legendY + (tall ? 19 : 26), tall ? 8 : 11, box.w * .46, colors);
    text(pen, 'MEET IN MIDDLE · 1974', box.x + box.w * .77, legendY + (tall ? 19 : 26), tall ? 8 : 11, box.w * .46, colors);
  } else {
    place('meet-bound', box.x + box.w * .27, legendY);
    place('claim-bound', box.x + box.w * .77, legendY);

    if (time >= 78500) {
      const humanY = legendY + (tall ? 22 : 31);
      text(pen, 'LI–YE', box.x + box.w * .17, humanY, tall ? 8.5 : 12, box.w * .27, colors);
      place('human-bound', box.x + box.w * .64, humanY);
    }
  }
}

export function drawPanels(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: SelectionModel, tall: boolean): void {
  pen.setLineDash([]);
  const words = status(model, time);
  const x = box.x + box.w / 2;

  if (time < 41250) {
    text(pen, words.title, x, box.y + (tall ? 29 : 83), tall ? 21 : 30, box.w - 6, colors);
    text(pen, words.caption, x, box.y + (tall ? 69 : 137), tall ? 11 : 16, box.w - 6, colors);

    if (words.note) text(pen, words.note, x, box.y + (tall ? 102 : 180), tall ? 10 : 14, box.w - 6, colors);

    return;
  }

  text(pen, words.title, x, box.y + (tall ? 5 : 15), tall ? 11.5 : 19, box.w - 6, colors);
  text(pen, words.caption, x, box.y + (tall ? 25 : 46), tall ? time >= 86000 && time < 93000 ? 12 : 9 : 14, box.w - 6, colors);

  if (words.note) text(pen, words.note, x, box.y + (tall ? 40 : 68), tall ? 8.5 : 12, box.w - 6, colors);

  chart(pen, box, time, colors, place, tall);
}

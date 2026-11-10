import { mix } from '../../../lib/animation';
import { type Box, type Colors, type Place, growthChartBox, growthPoint, line, text } from './drawing';
import { growthAt, type ColourModel } from './math';
import { chartProgress, firstFitProgress, humanProgress, isolatePhase, revealProgress } from './story';

function introduction(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, model: ColourModel, tall: boolean): void {
  const x = box.x + box.w / 2;
  let title = 'A PROPER COLOURING';
  let caption = 'EVERY LINK JOINS DIFFERENT INK MARKS';
  let note = `${model.n} VERTICES · ${model.edges.length} LINKS`;

  if (time >= 7000 && time < 12000) {
    title = 'ARE THREE COLOURS ENOUGH?';
    caption = 'THE DECISION PROBLEM IS NP-HARD';
    note = 'THE PROMISED VERSION ASKS A DIFFERENT QUESTION';
  } else if (time >= 12000 && time < 22250) {
    title = 'LOWEST AVAILABLE MARK';
    const completed = Math.min(model.n, Math.floor(firstFitProgress(time) * model.n));
    const step = model.firstFit.steps[completed];

    if (completed === model.n) {
      caption = `THIS ORDER USES ${model.firstFit.colorCount} MARKS`;
      note = 'A PROPER COLOURING · NO OPTIMALITY CLAIM';
    } else {
      if (!step) throw new Error('Each greedy choice has its exact already-coloured neighbours.');

      caption = `NEXT DOT: ${step.vertex + 1}`;
      note = step.used.length ? `FORBIDDEN MARKS: ${step.used.map(color => color + 1).join(', ')}` : 'NO MARK IS FORBIDDEN YET';
    }
  } else if (time >= 22250) {
    title = revealProgress(time) === 1 ? 'THE HIDDEN COLOURING: THREE' : 'INK MARKS IN TRANSIT';
    caption = revealProgress(time) === 1 ? `FIRST-FIT USED ${model.firstFit.colorCount} IN THE SHOWN ORDER` : 'ONLY THE SETTLED COLOURINGS ARE COMPARED';
    note = 'THIS SMALL INSTANCE IS COMPUTED EXACTLY';
  }

  text(pen, title, x, box.y + box.h * .15, tall ? 21 : 29, box.w - 6, colors);
  text(pen, caption, x, box.y + box.h * .33, tall ? 11 : 15, box.w - 6, colors);
  text(pen, note, x, box.y + box.h * .49, tall ? 10 : 13, box.w - 6, colors);
}

function chartHeader(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, tall: boolean): void {
  const x = box.x + box.w / 2;
  const title = time >= 87250 ? 'UNREVIEWED' : time >= 55000 ? 'CLAIMED: FIXED POSITIVE FRACTION' : time >= 39750 ? 'FEI–MINZER–WANG · HUMAN PROOF' : 'COLOURS AS THE GRAPH GROWS';
  text(pen, title, x, box.y + 6, tall ? 11 : 14, box.w - 6, colors);

  if (time >= 87250) {
    text(pen, 'LEAN: IN THE CATALOGUE', x, box.y + 24, tall ? 9 : 12, box.w - 6, colors);
    text(pen, 'A KERNEL CHECK IS NOT A READING', x, box.y + 42, tall ? 8.5 : 11, box.w - 6, colors);
  } else if (time >= 73750) {
    const phase = isolatePhase(time);
    text(pen, phase === 'extended' ? 'ADDED ISOLATES · SAME COLOURS NEEDED' : phase === 'none' ? 'INDEPENDENT-SET HARDNESS IS STRONGER' : 'LONE DOTS IN TRANSIT', x, box.y + 26, tall ? 9 : 12, box.w - 6, colors);
  } else if (time >= 55000) text(pen, 'A HARDNESS CLAIM FOR GROWING INPUTS', x, box.y + 26, tall ? 9 : 12, box.w - 6, colors);
  else if (time >= 39750) text(pen, 'EVERY FIXED PALETTE · ASYMPTOTIC', x, box.y + 26, tall ? 9 : 12, box.w - 6, colors);
  else text(pen, 'GROWING PALETTE · FIXED-PALETTE HARDNESS', x, box.y + 26, tall ? 9 : 12, box.w - 6, colors);
}

function axes(pen: CanvasRenderingContext2D, plot: Box, colors: Colors, place: Place, tall: boolean): void {
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .65;
  line(pen, plot.x, plot.y, plot.x, plot.y + plot.h);
  line(pen, plot.x, plot.y + plot.h, plot.x + plot.w, plot.y + plot.h);

  for (const count of [0, 20, 40, 60]) {
    const point = growthPoint(1e3, count, plot);
    line(pen, plot.x - 3, point.y, plot.x, point.y);
    text(pen, `${count}`, plot.x - 6, point.y, tall ? 8.5 : 11, 23, colors, 'right');
  }

  for (const [index, n] of [1e3, 1e6, 1e9].entries()) {
    const point = growthPoint(n, 0, plot);
    line(pen, point.x, point.y, point.x, point.y + 3);
    const id = index === 0 ? 'n-first' : index === 1 ? 'n-middle' : 'n-last';
    place(id, point.x, point.y + (tall ? 15 : 19));
  }

  text(pen, 'COLOURS', plot.x, plot.y - 10, tall ? 8 : 11, 64, colors, 'left');
}

function growingCurve(pen: CanvasRenderingContext2D, plot: Box, time: number, colors: Colors, model: ColourModel, tall: boolean): void {
  const end = 3 + 6 * chartProgress(time);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = tall ? 1.3 : 1.8;
  pen.beginPath();

  for (let index = 0; index <= 100; index++) {
    const n = 10 ** (3 + (end - 3) * index / 100);
    const point = growthPoint(n, growthAt(n), plot);

    if (index === 0) pen.moveTo(point.x, point.y);
    else pen.lineTo(point.x, point.y);
  }

  pen.stroke();

  if (chartProgress(time) !== 1) return;

  for (const [index, reading] of model.growthReadings.entries()) {
    const point = growthPoint(reading.n, reading.value, plot);
    pen.fillStyle = colors.ink;
    pen.beginPath();
    pen.arc(point.x, point.y, tall ? 1.6 : 2.2, 0, Math.PI * 2);
    pen.fill();
    text(pen, reading.value.toFixed(1), point.x + (index === 2 ? -12 : 12), point.y + (index === 2 ? 12 : -12), tall ? 8.5 : 11, 31, colors);
  }
}

function hardnessGuide(pen: CanvasRenderingContext2D, plot: Box, time: number, colors: Colors, tall: boolean): void {
  const amount = humanProgress(time);
  const x = plot.x + plot.w + (tall ? 12 : 16);
  const width = tall ? 7 : 10;
  const low = growthPoint(1e9, mix(4, 3, amount), plot).y;
  const high = growthPoint(1e9, mix(5, 64, amount), plot).y;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .7;
  pen.strokeRect(x, high, width, low - high);

  for (let y = high + 3; y < low; y += 4) line(pen, x, y, x + width, Math.min(low, y + 3));

  if (time < 39750) {
    line(pen, x + width / 2, high - 2, x + width / 2, high - 12);
    text(pen, '4, 5', x + width / 2, high - 20, tall ? 8 : 10, 28, colors);
  }
}

function chart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: ColourModel, tall: boolean): void {
  chartHeader(pen, box, time, colors, tall);
  const plot = growthChartBox(box, tall);
  axes(pen, plot, colors, place, tall);
  growingCurve(pen, plot, time, colors, model, tall);
  hardnessGuide(pen, plot, time, colors, tall);
  text(pen, 'POWER ONLY\nCONSTANT 1', plot.x + plot.w * .30, plot.y + 11, tall ? 8.5 : 11, plot.w * .54, colors);
  const legendY = plot.y + plot.h + (tall ? 40 : 43);
  place('growth-bound', box.x + box.w * .30, legendY);

  if (time >= 39750) place('fixed-c', box.x + box.w * .80, legendY);
  else text(pen, 'HARD: 4, 5', box.x + box.w * .80, legendY, tall ? 8.5 : 11, box.w * .4, colors);

  const captionY = box.y + box.h * .90;

  if (time >= 73750 && time < 87250) {
    text(pen, 'INDEPENDENCE RATIO', box.x + box.w * .33, captionY, tall ? 8.5 : 11, box.w * .60, colors);
    place('independence-ratio', box.x + box.w * .82, captionY);
  } else {
    const caption = time >= 87250 ? 'EXAMPLE COMPUTED · PROOF UNREVIEWED' : time >= 55000 ? 'INDEPENDENT-SET HARDNESS IS STRONGER' : time >= 39750 ? 'HUMAN PROOF · FIXED PALETTES' : 'PROVED HARD: FOUR AND FIVE';
    text(pen, caption, box.x + box.w / 2, captionY, tall ? 8.5 : 11, box.w - 6, colors);
  }
  text(pen, time >= 39750 ? 'GUIDE HEIGHT SCHEMATIC · ASYMPTOTIC' : 'FIXED-PALETTE HARDNESS · ASYMPTOTIC', box.x + box.w / 2, box.y + box.h * .97, tall ? 8 : 10.5, box.w - 6, colors);
}

export function drawPanels(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: ColourModel, tall: boolean): void {
  pen.setLineDash([]);

  if (time < 27250) introduction(pen, box, time, colors, model, tall);
  else chart(pen, box, time, colors, place, model, tall);
}

import { type Box, type Colors, type Place, text } from './drawing';
import type { SchedulingModel } from './math';

function header(pen: CanvasRenderingContext2D, box: Box, rows: readonly string[], colors: Colors, tall: boolean): void {
  const x = box.x + box.w / 2;

  for (const [index, row] of rows.entries()) {
    text(pen, row, x, box.y + 6 + index * 16, tall ? 9.5 : 12, box.w - 6, colors);
  }
}

function footer(pen: CanvasRenderingContext2D, box: Box, first: string, second: string, colors: Colors, tall: boolean): void {
  const x = box.x + box.w / 2;
  text(pen, first, x, box.y + box.h - 40, tall ? 11 : 14, box.w - 6, colors);
  text(pen, second, x, box.y + box.h - 15, tall ? 8.5 : 11, box.w - 6, colors);
}

function opening(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, model: SchedulingModel, tall: boolean): void {
  const x = box.x + box.w / 2;

  if (time < 8250) {
    text(pen, `${model.n} ONE-HOUR JOBS`, x, box.y + box.h * .13, tall ? 25 : 34, box.w - 6, colors);
    text(pen, `${model.arcs.length} ARROWS: WAIT FOR THE EARLIER JOB`, x, box.y + box.h * .27, tall ? 10 : 14, box.w - 6, colors);
    text(pen, 'IDENTICAL WORKERS · JOBS CANNOT BE SPLIT', x, box.y + box.h * .42, tall ? 10 : 14, box.w - 6, colors);

    return;
  }

  header(pen, box, ['SHORTEST SCHEDULE?', 'READY JOBS CAN START · ONE HOUR PER JOB'], colors, tall);
  footer(pen, box, 'THREE IDENTICAL WORKERS', 'EACH WORKER DOES AT MOST ONE JOB AT A TIME', colors, tall);
}

function twoLanes(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, model: SchedulingModel, tall: boolean): void {
  if (time < 23250) {
    header(pen, box, ['COFFMAN–GRAHAM · 1972', 'HIGHEST LABEL AMONG READY JOBS', 'LABELS ARE PRIORITIES, NOT DURATIONS'], colors, tall);
  } else {
    header(pen, box, ['WORKER COUNT IS PART OF THE INPUT', 'NP-COMPLETE · ULLMAN 1975', 'THE TWO-WORKER CASE STAYS EASY'], colors, tall);
  }

  if (time < 21500) footer(pen, box, 'PLACING THE TWO-LANE RULE', 'JOBS IN TRANSIT · NO FINISH-TIME VERDICT YET', colors, tall);
  else footer(pen, box, `TWO LANES: ${model.cg2.makespan} HOURS · THE MINIMUM`, 'RULE AND EXACT FINISHED-SET SEARCH AGREE', colors, tall);
}

function compare(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, model: SchedulingModel, tall: boolean): void {
  if (time < 35000) {
    header(pen, box, [`RETURNING THE SAME ${model.n} JOBS`, 'OPENING THREE LANES', 'GAREY–JOHNSON 1979 · OPEN FOR 47 YEARS'], colors, tall);
    footer(pen, box, 'CLEARING THE FIVE-HOUR PLAN', 'THE CARDS ARE RETURNING TO THE DEPENDENCY GRAPH', colors, tall);

    return;
  }

  if (time < 40250) {
    header(pen, box, ['SAME RULE, THREE LANES', 'READY JOBS, HIGHEST LABEL FIRST', 'GAREY–JOHNSON 1979 · OPEN FOR 47 YEARS'], colors, tall);
    footer(pen, box, 'PLACING THE THREE-LANE RULE', 'JOBS IN TRANSIT · NO FINISH-TIME VERDICT YET', colors, tall);

    return;
  }

  if (time < 46500) {
    header(pen, box, [`ALTERNATIVE PLANS FOR THE SAME ${model.n} JOBS`, 'KEEP THE RULE ABOVE FOR COMPARISON', 'ACTIVE CARDS REFILL THE LOWER PLAN'], colors, tall);
    footer(pen, box, `THE RULE: ${model.cg3.makespan} HOURS`, 'LOWER PLAN IN TRANSIT · NO COMPLETION VERDICT', colors, tall);

    return;
  }

  if (time < 49250) header(pen, box, ['GAREY–JOHNSON 1979 · OPEN FOR 47 YEARS', `TWO ALTERNATIVES FOR THE SAME ${model.n} JOBS`], colors, tall);
  else header(pen, box, ['THIS 3: EXACT SEARCH OVER FINISHED SETS', 'NEDERLOF · SWENNENHUIS · WĘGRZYCKI', '2025 · SUBEXPONENTIAL'], colors, tall);

  footer(pen, box, `THE RULE: ${model.cg3.makespan} HOURS · THE BEST: ${model.opt3.makespan}`, `SAME ${model.n} JOBS · EACH ALTERNATIVE RESPECTS EVERY ARROW`, colors, tall);
}

function claimLedger(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, tall: boolean): void {
  if (time < 70500) header(pen, box, ['CLAIMED: NONEMPTY PRECEDENCE DAGS', 'UNIT NONPREEMPTIVE JOBS', 'THREE IDENTICAL MACHINES'], colors, tall);
  else header(pen, box, ['UNREVIEWED', 'LEAN STATEMENT ONLY', 'NOT IN THE CATALOGUE'], colors, tall);

  const y = box.y + box.h - 40;
  text(pen, 'INPUT-LENGTH EXPONENT', box.x + box.w * .34, y, tall ? 9 : 12, box.w * .63, colors);
  place('runtime-exponent', box.x + box.w * .83, y);
  text(pen, 'NO PRACTICAL RUNNING-TIME CLAIM', box.x + box.w / 2, box.y + box.h - 15, tall ? 8.5 : 11, box.w - 6, colors);
}

export function drawPanels(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: SchedulingModel, tall: boolean): void {
  pen.setLineDash([]);

  if (time < 13250) opening(pen, box, time, colors, model, tall);
  else if (time < 33500) twoLanes(pen, box, time, colors, model, tall);
  else if (time < 61500) compare(pen, box, time, colors, model, tall);
  else claimLedger(pen, box, time, colors, place, tall);
}

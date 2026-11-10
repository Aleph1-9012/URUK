import { type Box, type Colors, type Place, text } from './drawing';
import { ballStats, type RouteModel } from './math';
import { ballTime, branchRadius, huntIndex } from './story';

type BranchCount = { radius: number; count: number };

type HuntReading = { separation: number; time: number; middleRows: number[] };

function rows(pen: CanvasRenderingContext2D, box: Box, words: readonly string[], y: number, size: number, gap: number, colors: Colors): void {
  for (const [index, row] of words.entries()) text(pen, row, box.x + box.w / 2, box.y + y + index * gap, size, box.w - 6, colors);
}

function timeReading(pen: CanvasRenderingContext2D, box: Box, value: string, y: number, colors: Colors, place: Place, tall: boolean): void {
  const x = box.x + box.w / 2;
  place('time-symbol', x - (tall ? 30 : 42), box.y + y);
  text(pen, `= ${value}`, x + (tall ? 20 : 25), box.y + y, tall ? 20 : 28, box.w * .70, colors);
}

function fallbackPanel(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: RouteModel, tall: boolean): void {
  const failed = model.computation.kind === 'failed';
  rows(pen, box, [failed ? 'LIVE ROUTES UNAVAILABLE' : 'CALCULATING FASTEST ROUTES'], tall ? 6 : 20, tall ? 11.5 : 18, 20, colors);
  text(pen, 'COMPUTED STILL', box.x + box.w / 2, box.y + (tall ? 42 : 105), tall ? 13 : 22, box.w - 6, colors);
  timeReading(pen, box, '40', tall ? 67 : 145, colors, place, tall);

  if (time >= 73750) {
    rows(pen, box, ['UNREVIEWED'], tall ? 111 : 247, tall ? 23 : 34, 20, colors);
    text(pen, 'ONE FINITE GRID · A PICTURE, NOT A PROOF', box.x + box.w / 2, box.y + (tall ? 141 : 289), tall ? 8.5 : 12, box.w - 6, colors);
  } else {
    rows(pen, box, ['THE SAME FINITE-GRID PREVIEW', 'LIVE READOUTS WAIT FOR THE SOLVE'], tall ? 108 : 230, tall ? 9.5 : 14, tall ? 19 : 28, colors);
  }
}

function branchReading(pen: CanvasRenderingContext2D, box: Box, branches: readonly BranchCount[], time: number, colors: Colors, tall: boolean): void {
  const radius = branchRadius(time);
  const entry = branches.find(candidate => candidate.radius === radius);

  if (!entry) throw new Error('The highlighted crossing radius has its live all-route branch count.');

  const x = box.x + box.w / 2;
  text(pen, `RADIUS ${radius}`, x, box.y + (tall ? 66 : 157), tall ? 11 : 16, box.w - 6, colors);
  text(pen, `${entry.count}`, x, box.y + (tall ? 91 : 208), tall ? 27 : 43, box.w - 6, colors);
  text(pen, 'BRANCHES IN ALL 360 FULL ROUTES', x, box.y + (tall ? 114 : 254), tall ? 9 : 13, box.w - 6, colors);
}

function huntPanel(pen: CanvasRenderingContext2D, box: Box, hunt: HuntReading, colors: Colors, tall: boolean): void {
  const x = box.x + box.w / 2;
  const middle = hunt.middleRows.map(row => row > 0 ? `+${row}` : `${row}`).join(', ');
  text(pen, `FINITE HUNT · ${hunt.separation} APART`, x, box.y + (tall ? 5 : 18), tall ? 12 : 20, box.w - 6, colors);
  text(pen, 'FASTEST TIME', x, box.y + (tall ? 30 : 78), tall ? 10 : 15, box.w - 6, colors);
  text(pen, hunt.time.toFixed(2), x, box.y + (tall ? 55 : 120), tall ? 27 : 43, box.w - 6, colors);
  text(pen, `MIDDLE ROW OFFSET ${middle}`, x, box.y + (tall ? 90 : 190), tall ? 10.5 : 16, box.w - 6, colors);
  rows(pen, box, ['SO FAR THE MIDDLE HOLDS', 'CAN IT HOLD FOREVER?'], tall ? 119 : 266, tall ? 10 : 17, tall ? 20 : 30, colors);
}

export function drawPanels(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: RouteModel, tall: boolean): void {
  pen.setLineDash([]);
  const x = box.x + box.w / 2;

  if (time < 9000) {
    rows(pen, box, ['FASTEST ROUTE', 'DRAWN AS A DOUBLE TRACK', 'THICKER EDGES ARE SLOWER'], tall ? 15 : 40, tall ? 13 : 21, tall ? 28 : 44, colors);
    rows(pen, box, ['THE SAME RANDOM TIMES', 'AT EVERY SCALE'], tall ? 97 : 235, tall ? 10 : 15, tall ? 19 : 27, colors);
    text(pen, 'INDEPENDENT EXPONENTIAL EDGE TIMES', x, box.y + (tall ? 143 : 311), tall ? 8.5 : 12, box.w - 6, colors);

    return;
  }

  const state = model.computation;

  if (state.kind !== 'ready') {
    fallbackPanel(pen, box, time, colors, place, model, tall);

    return;
  }

  const result = state.result;

  if (time < 19750) {
    const passageTime = ballTime(time);
    const stats = ballStats(result.centre, passageTime);
    text(pen, 'REACHABLE IN TIME', x, box.y + (tall ? 5 : 18), tall ? 12 : 19, box.w - 6, colors);
    timeReading(pen, box, passageTime.toFixed(1), tall ? 32 : 67, colors, place, tall);
    text(pen, stats.cells.toLocaleString('en-US'), x, box.y + (tall ? 72 : 135), tall ? 28 : 43, box.w - 6, colors);
    text(pen, 'GRID POINTS REACHED', x, box.y + (tall ? 95 : 179), tall ? 10 : 14, box.w - 6, colors);
    rows(pen, box, [`ONE FINITE ${model.N} × ${model.N} GRID`, 'EXPONENTIAL EDGE TIMES'], tall ? 126 : 271, tall ? 9 : 13, tall ? 18 : 27, colors);

    return;
  }

  if (time < 28750) {
    rows(pen, box, ['ROUTES MERGE', 'TOWARDS THE CENTRE'], tall ? 5 : 18, tall ? 12 : 20, tall ? 19 : 31, colors);
    text(pen, '360 FULL ROUTES · 60 PREFIXES DRAWN', x, box.y + (tall ? 46 : 105), tall ? 9 : 13, box.w - 6, colors);
    branchReading(pen, box, result.branches, time, colors, tall);
    text(pen, 'ROUTES CONTINUE BEYOND THIS BALL', x, box.y + (tall ? 133 : 296), tall ? 9 : 13, box.w - 6, colors);
    text(pen, 'ONLY TIME-40 PREFIXES ARE DRAWN', x, box.y + (tall ? 148 : 325), tall ? 8.5 : 12, box.w - 6, colors);

    return;
  }

  if (time < 39750) {
    const hunt = result.hunts[huntIndex(time)];

    if (!hunt || hunt.middleRows.length === 0) throw new Error('Each finite hunt route crosses the middle column.');

    huntPanel(pen, box, hunt, colors, tall);

    return;
  }

  if (time < 46750) {
    rows(pen, box, ['CONJECTURED: NO'], tall ? 24 : 69, tall ? 22 : 33, 20, colors);
    rows(pen, box, ['FOR CONTINUOUS EDGE TIMES', 'A FINITE MATCH DOES NOT', 'ANSWER THE INFINITE QUESTION'], tall ? 84 : 196, tall ? 10 : 15, tall ? 23 : 32, colors);

    return;
  }

  if (time < 57250) {
    const stats = ballStats(result.centre, 40);
    text(pen, 'DISTANCE DIVIDED BY TIME', x, box.y + (tall ? 5 : 18), tall ? 11.5 : 19, box.w - 6, colors);
    place('time-symbol', x - (tall ? 66 : 83), box.y + (tall ? 31 : 68));
    text(pen, '= 20, 30, 40', x + (tall ? 9 : 13), box.y + (tall ? 31 : 68), tall ? 16 : 23, box.w * .72, colors);
    rows(pen, box, [`AT 40: AXIS REACH ${stats.axis}`, `DIAGONAL REACH ${stats.diagonalEuclid.toFixed(1)}`], tall ? 72 : 160, tall ? 12 : 20, tall ? 24 : 36, colors);
    rows(pen, box, ['ONE FINITE GRID', 'THE LIMIT IS NOT DETERMINED HERE'], tall ? 124 : 276, tall ? 9 : 13, tall ? 19 : 28, colors);

    return;
  }

  if (time < 73750) {
    text(pen, 'CLAIMED', x, box.y + (tall ? 6 : 18), tall ? 14 : 23, box.w - 6, colors);
    rows(pen, box, ['EXPONENTIAL: STRICTLY CONVEX', 'AND SMOOTH · CURVE SCHEMATIC'], tall ? 35 : 91, tall ? 10 : 16, tall ? 18 : 28, colors);

    if (time >= 65000) {
      rows(pen, box, ['NO BIGEODESIC · ANY DIRECTION', 'ONE PROBABILITY-ONE EVENT', 'UNDER A MILD MOMENT CONDITION'], tall ? 84 : 207, tall ? 9.5 : 15, tall ? 18 : 28, colors);
      text(pen, 'EXPONENTIAL TIMES SATISFY IT', x, box.y + (tall ? 145 : 311), tall ? 8.5 : 12, box.w - 6, colors);
    } else {
      rows(pen, box, ['THE LIMIT, NOT THIS FINITE RIM', 'BLUE CURVE DRAWN SCHEMATIC'], tall ? 106 : 234, tall ? 9.5 : 14, tall ? 21 : 31, colors);
    }

    return;
  }

  text(pen, 'UNREVIEWED', x, box.y + (tall ? 26 : 81), tall ? 24 : 35, box.w - 6, colors);
  rows(pen, box, [`ONE FINITE GRID OF ${model.N} × ${model.N}`, 'A PICTURE, NOT A PROOF', 'NO-BIGEODESIC CLAIM: MOMENT CONDITION', 'EXPONENTIAL CURVE IS SCHEMATIC'], tall ? 74 : 183, tall ? 9.5 : 14, tall ? 19 : 30, colors);
  text(pen, 'AS OF 20 OCTOBER 2026', x, box.y + (tall ? 146 : 321), tall ? 8.5 : 12, box.w - 6, colors);
}

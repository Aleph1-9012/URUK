import { type Box, type Colors, type Place, text } from './drawing';
import { fieldSample, type WarmModel } from './math';
import { heatTime } from './story';

function rows(pen: CanvasRenderingContext2D, box: Box, words: readonly string[], y: number, size: number, gap: number, colors: Colors): void {
  for (const [index, row] of words.entries()) text(pen, row, box.x + box.w / 2, box.y + y + index * gap, size, box.w - 6, colors);
}

function edgeReading(model: WarmModel, index: number, name: string): string {
  const distance = model.edgeDistance[index];

  if (distance === undefined) throw new Error('Each extremum cell has its computed distance to edge cells.');

  return distance === 0 ? `${name}: EDGE CELL` : `${name}: ${distance.toFixed(3)} FROM EDGE CELLS`;
}

function heatPanel(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, model: WarmModel, tall: boolean): void {
  const sample = fieldSample(model, heatTime(time));
  const x = box.x + box.w / 2;

  if (time >= 8000 && sample.kind === 'initial') {
    const title = model.computation.kind === 'failed' ? 'HEAT FLOW UNAVAILABLE' : 'CALCULATING HEAT FLOW';
    rows(pen, box, [title, 'INITIAL FIELD HELD'], tall ? 8 : 36, tall ? 12 : 19, tall ? 29 : 43, colors);
    rows(pen, box, ['CURRENT HEAT READOUTS WAIT', 'FOR THE COMPUTED FLOW'], tall ? 73 : 146, tall ? 10 : 14, tall ? 18 : 25, colors);
    text(pen, 'ONE 64 × 64 GRID', x, box.y + (tall ? 132 : 265), tall ? 10 : 14, box.w - 6, colors);

    return;
  }

  const title = time < 8000 ? 'INITIAL TEMPERATURE' : `HEAT TIME t = ${sample.tau.toFixed(3)}`;
  text(pen, title, x, box.y + (tall ? 5 : 18), tall ? 12 : 19, box.w - 6, colors);
  text(pen, 'SPREAD (HOTTEST − COLDEST)', x, box.y + (tall ? 28 : 78), tall ? 10 : 15, box.w - 6, colors);
  text(pen, sample.spread.toFixed(5), x, box.y + (tall ? 55 : 120), tall ? 27 : 43, box.w - 6, colors);
  rows(pen, box, [edgeReading(model, sample.hot, 'HOT'), edgeReading(model, sample.cold, 'COLD')], tall ? 88 : 190, tall ? 10 : 15, tall ? 18 : 29, colors);

  if (time >= 8000) text(pen, 'SPREAD IS TRUE · CONTRAST RESCALED', x, box.y + (tall ? 124 : 278), tall ? 8.8 : 12, box.w - 6, colors);

  text(pen, 'COMPUTED · 64 × 64 GRID', x, box.y + (tall ? 143 : 310), tall ? 9 : 13, box.w - 6, colors);
}

function modeHeader(pen: CanvasRenderingContext2D, box: Box, colors: Colors, place: Place, tall: boolean): void {
  const x = box.x + box.w / 2;
  text(pen, "THIS PLATE'S FIRST MODE", x, box.y + (tall ? 4 : 14), tall ? 11 : 18, box.w - 6, colors);
  place('mode-mu', x, box.y + (tall ? 25 : 47));
  text(pen, 'CONTRAST RESCALED · 64 × 64 GRID', x, box.y + (tall ? 44 : 80), tall ? 9 : 12, box.w - 6, colors);
}

function gradientReading(pen: CanvasRenderingContext2D, box: Box, colors: Colors, model: WarmModel, tall: boolean): void {
  const x = box.x + box.w / 2;
  text(pen, `MIN / MAX SLOPE = ${model.gradientRatio.toFixed(3)}`, x, box.y + (tall ? 65 : 144), tall ? 12 : 20, box.w - 6, colors);
  text(pen, 'SAMPLED CELLS > 3h FROM EDGE', x, box.y + (tall ? 82 : 171), tall ? 9.5 : 12, box.w - 6, colors);
}

export function drawPanels(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: WarmModel, tall: boolean): void {
  pen.setLineDash([]);

  if (time < 20250) {
    heatPanel(pen, box, time, colors, model, tall);

    return;
  }

  modeHeader(pen, box, colors, place, tall);

  if (time < 21000) {
    const words = model.computation.kind === 'ready' ? ['THE FADING PATTERN', 'IS RESCALED TO FULL CONTRAST'] : ['COMPUTED FIRST MODE SHOWN', model.computation.kind === 'failed' ? 'HEAT FLOW UNAVAILABLE' : 'HEAT FLOW CALCULATING'];
    rows(pen, box, words, tall ? 83 : 163, tall ? 11 : 16, tall ? 20 : 29, colors);

    return;
  }

  if (time < 29000) {
    rows(pen, box, ['RAUCH 1974', 'ALWAYS ON THE EDGE?'], tall ? 86 : 175, tall ? 13 : 22, tall ? 25 : 37, colors);

    return;
  }

  if (time < 36000) {
    rows(pen, box, ['BURDZY–WERNER 1999', 'WITH HOLES: NO', 'INSET DRAWING SCHEMATIC'], tall ? 80 : 160, tall ? 11 : 18, tall ? 21 : 31, colors);

    return;
  }

  if (time < 43000) {
    rows(pen, box, ['BURDZY 2005', 'WITHOUT HOLES:', 'THE OPEN CASE'], tall ? 80 : 160, tall ? 12 : 20, tall ? 21 : 33, colors);

    return;
  }

  gradientReading(pen, box, colors, model, tall);

  if (time < 56000) {
    rows(pen, box, ['CLAIMED: EVERY SMOOTH PLATE', 'WITHOUT HOLES', 'NO FLAT POINT, NOT EVEN A SADDLE'], tall ? 105 : 236, tall ? 9.5 : 15, tall ? 17 : 26, colors);

    return;
  }

  if (time < 65750) {
    rows(pen, box, ['BURDZY: BUILDS ON IT', 'DOES NOT ASSESS THE PROOF'], tall ? 111 : 244, tall ? 10.5 : 17, tall ? 21 : 31, colors);

    return;
  }

  const x = box.x + box.w / 2;
  text(pen, 'UNREVIEWED', x, box.y + (tall ? 111 : 247), tall ? 24 : 35, box.w - 6, colors);
  text(pen, 'ONE PLATE COMPUTED, NOT EVERY PLATE', x, box.y + (tall ? 136 : 285), tall ? 9.5 : 13, box.w - 6, colors);
  text(pen, 'AS OF 17 OCTOBER 2026', x, box.y + (tall ? 146 : 310), tall ? 8.5 : 12, box.w - 6, colors);
}

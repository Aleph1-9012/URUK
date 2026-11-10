import { type Box, type Colors, type Place, insetBox, line, text } from './drawing';
import type { GraphSnapshot, HoldModel, VertexData } from './math';
import { focusAt, insetProgress, ruleProgress, selectedState } from './story';

function memberList(vertices: readonly number[]): string {
  return vertices.length ? vertices.map(vertex => vertex + 1).join(', ') : 'NONE';
}

function detail(pen: CanvasRenderingContext2D, box: Box, vertex: VertexData, y: number, colors: Colors, place: Place, tall: boolean, lists = true): void {
  const firstX = box.x + box.w * .25;
  const secondX = box.x + box.w * .75;
  place('first-set', firstX, y);
  place('second-set', secondX, y);
  text(pen, `${vertex.firstCount}`, firstX, y + (tall ? 29 : 40), tall ? 29 : 40, box.w * .44, colors);
  text(pen, `${vertex.secondCount}`, secondX, y + (tall ? 29 : 40), tall ? 29 : 40, box.w * .44, colors);

  if (lists) {
    text(pen, memberList(vertex.first), firstX, y + (tall ? 56 : 80), tall ? 10 : 14, box.w * .45, colors);
    text(pen, memberList(vertex.second), secondX, y + (tall ? 56 : 80), tall ? 10 : 14, box.w * .45, colors);
  }
}

function exhaustive(pen: CanvasRenderingContext2D, box: Box, model: HoldModel, colors: Colors, tall: boolean): void {
  const result = model.exhaustive;
  const title = result.withoutHolder === 0 ? `ALL ${result.total.toLocaleString('en-US')} ORIENTED GRAPHS` : `${result.withoutHolder.toLocaleString('en-US')} HOLDER-FREE GRAPHS FOUND`;
  const caption = result.withoutHolder === 0 ? `ON ${result.n} LABELLED DOTS HAVE A HOLDER` : `AMONG ${result.total.toLocaleString('en-US')} ON ${result.n} LABELLED DOTS`;
  text(pen, `${title}\n${caption}`, box.x + box.w / 2, box.y + box.h - (tall ? 44 : 45), tall ? 8.5 : 12, box.w - 6, colors);
}

function countOrder(pen: CanvasRenderingContext2D, box: Box, colors: Colors, tall: boolean): void {
  text(pen, 'OUTSIDE COUNTS: 1-STEP | 2-STEP', box.x + box.w / 2, box.y + box.h - (tall ? 9 : 13), tall ? 8.5 : 12, box.w - 6, colors);
}

function introductory(pen: CanvasRenderingContext2D, box: Box, model: HoldModel, colors: Colors, tall: boolean): void {
  const x = box.x + box.w / 2;
  text(pen, `${model.n} DOTS · ${model.initial.arcs.length} ARROWS`, x, box.y + (tall ? 34 : 95), tall ? 25 : 34, box.w - 6, colors);
  text(pen, 'ONE ARROW PER PAIR AT MOST', x, box.y + (tall ? 91 : 165), tall ? 12 : 17, box.w - 6, colors);
  text(pen, 'NO LOOPS · NO OPPOSITE ARROWS', x, box.y + (tall ? 128 : 215), tall ? 10.5 : 14, box.w - 6, colors);
}

function focusDetail(pen: CanvasRenderingContext2D, box: Box, vertex: VertexData, colors: Colors, place: Place, tall: boolean): void {
  const x = box.x + box.w / 2;
  text(pen, `DOT ${vertex.vertex + 1}`, x, box.y + (tall ? 10 : 25), tall ? 20 : 28, box.w - 6, colors);
  detail(pen, box, vertex, box.y + (tall ? 52 : 91), colors, place, tall);
  text(pen, 'RING: ONE STEP · STIPPLE: TWO STEPS', x, box.y + (tall ? 144 : 228), tall ? 9 : 13, box.w - 6, colors);
  text(pen, 'EXACTLY TWO STEPS · COUNT EACH DOT ONCE', x, box.y + (tall ? 176 : 280), tall ? 9 : 13, box.w - 6, colors);
  text(pen, 'EXCLUDE THE SOURCE AND ITS ONE-STEP SET', x, box.y + (tall ? 201 : 318), tall ? 8.5 : 12, box.w - 6, colors);
  text(pen, vertex.holds ? 'THIS DOT HOLDS' : 'THIS DOT FAILS', x, box.y + (tall ? 235 : 374), tall ? 12 : 17, box.w - 6, colors);
}

function initialHolders(pen: CanvasRenderingContext2D, box: Box, snapshot: GraphSnapshot, vertex: VertexData, colors: Colors, place: Place, tall: boolean): void {
  const x = box.x + box.w / 2;
  text(pen, `${snapshot.holders.length} OF ${snapshot.vertices.length} HOLD`, x, box.y + (tall ? 10 : 27), tall ? 24 : 33, box.w - 6, colors);
  text(pen, `DOT ${vertex.vertex + 1} SHOWN IN DETAIL`, x, box.y + (tall ? 37 : 68), tall ? 9 : 13, box.w - 6, colors);
  detail(pen, box, vertex, box.y + (tall ? 68 : 114), colors, place, tall);
  place('holder-rule', x, box.y + (tall ? 174 : 274));
  text(pen, 'A SINK HOLDS TOO: BOTH SETS ARE EMPTY', x, box.y + (tall ? 209 : 334), tall ? 9 : 13, box.w - 6, colors);
}

function oppositeArrows(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, tall: boolean): void {
  const x = box.x + box.w / 2;
  text(pen, 'TWO OPPOSITE ARROWS', x, box.y + (tall ? 12 : 39), tall ? 20 : 28, box.w - 6, colors);
  text(pen, 'SEPARATE TWO-DOT EXAMPLE', x, box.y + (tall ? 40 : 89), tall ? 10 : 14, box.w - 6, colors);

  if (insetProgress(time) !== 1) return;

  const inset = insetBox(box, tall);
  const below = inset.y + inset.h;
  const compact = !tall && box.h < 450;
  text(pen, '1-STEP 1 · 2-STEP 0 · BOTH FAIL', x, below + (tall ? 20 : 25), tall ? 10 : 14, box.w - 6, colors);
  text(pen, 'SO ONE ARROW PER PAIR AT MOST', x, below + (tall ? 47 : compact ? 45 : 55), tall ? 9 : 13, box.w - 6, colors);
}

function adversary(pen: CanvasRenderingContext2D, box: Box, time: number, snapshot: GraphSnapshot, vertex: VertexData, model: HoldModel, colors: Colors, place: Place, tall: boolean): void {
  const selected = selectedState(time);
  const compact = !tall && box.h < 450;
  const x = box.x + box.w / 2;
  text(pen, `${snapshot.holders.length} OF ${model.n} HOLD`, x, box.y + (tall ? 10 : 25), tall ? 24 : 33, box.w - 6, colors);

  if (time >= 50000) {
    text(pen, 'NO SINGLE CHANGE OF ONE PAIR\nREMOVES THE LAST TWO', x, box.y + (tall ? 39 : 76), tall ? 9.5 : 13, box.w - 6, colors);
    detail(pen, box, vertex, box.y + (tall ? 88 : compact ? 125 : 151), colors, place, tall);
    place('holder-rule', x, box.y + (tall ? 198 : compact ? 265 : 335));
    exhaustive(pen, box, model, colors, tall);

    return;
  }

  const caption = selected.turning ? 'ARROW TURNING · PREVIOUS COUNTS HELD' : 'ONE PAIR CHANGED AT A TIME';
  text(pen, caption, x, box.y + (tall ? 39 : 76), tall ? 9 : 13, box.w - 6, colors);
  detail(pen, box, vertex, box.y + (tall ? 75 : compact ? 110 : 128), colors, place, tall);
  text(pen, `DOT ${vertex.vertex + 1} ${vertex.holds ? 'HOLDS' : 'FAILS'}${selected.turning ? ' BEFORE THE TURN' : ''}`, x, box.y + (tall ? 165 : compact ? 244 : 270), tall ? 11 : 16, box.w - 6, colors);
  const audit = model.audits[selected.index];

  if (!audit) throw new Error('The displayed graph has its actual single-pair audit.');

  text(pen, `${audit.candidates} SINGLE-PAIR CHANGES TESTED`, x, box.y + (tall ? 200 : compact ? 289 : 326), tall ? 9 : 13, box.w - 6, colors);
  text(pen, 'ONE FINITE GRAPH · LOCAL SEARCH', x, box.y + (tall ? 228 : compact ? 319 : 369), tall ? 9 : 13, box.w - 6, colors);
}

function partialResult(pen: CanvasRenderingContext2D, box: Box, time: number, model: HoldModel, colors: Colors, place: Place, tall: boolean): void {
  const x = box.x + box.w / 2;
  const compact = !tall && box.h < 450;
  const tight = !tall && box.h < 350;
  const vertex = model.final.vertices[model.rule.vertex];

  if (!vertex) throw new Error('The partial-result ruler uses its actual displayed vertex.');

  text(pen, 'SEYMOUR, ABOUT 1990', x, box.y + (tall ? 10 : 26), tall ? 17 : 25, box.w - 6, colors);
  text(pen, 'SOME VERTEX · ABOUT', box.x + box.w * .39, box.y + (tall ? 38 : compact ? 65 : 77), tall ? 9 : 13, box.w * .73, colors);
  place('partial-ratio', box.x + box.w * .83, box.y + (tall ? 38 : compact ? 65 : 77));
  detail(pen, box, vertex, box.y + (tall ? 70 : compact ? 105 : 126), colors, place, tall, false);
  const left = box.x + (tall ? 20 : 29);
  const width = box.w - (tall ? 40 : 58);
  const y = box.y + (tall ? 134 : tight ? 180 : compact ? 194 : 233);
  const axis = (count: number): number => left + count / vertex.secondCount * width;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .7;
  line(pen, left, y, left + width, y, ruleProgress(time));

  for (const count of [0, vertex.firstCount, vertex.secondCount]) {
    const point = axis(count);
    line(pen, point, y - 4, point, y + 4);
    text(pen, `${count}`, point, y + (tall ? 13 : 19), tall ? 9 : 12, 24, colors);
  }

  if (ruleProgress(time) === 1) {
    const tick = axis(model.rule.threshold);
    pen.lineWidth = 1.1;
    pen.setLineDash([2, 2]);
    line(pen, tick, y - (tall ? 13 : 18), tick, y + 5);
    pen.setLineDash([]);
    pen.lineWidth = .5;
    line(pen, tick, y + 6, x, y + (tall ? 26 : 40));
    place('partial-example', x, y + (tall ? 42 : tight ? 51 : 61));
  }

  text(pen, `ILLUSTRATED AT DOT ${vertex.vertex + 1}`, x, box.y + (tall ? 208 : tight ? 255 : compact ? 284 : 345), tall ? 9.5 : 14, box.w - 6, colors);
  text(pen, 'BEST GENERAL RESULT · SOME VERTEX', x, box.y + (tall ? 225 : tight ? 276 : compact ? 306 : 375), tall ? 8.5 : 12, box.w - 6, colors);
  exhaustive(pen, box, model, colors, tall);
}

function claimLedger(pen: CanvasRenderingContext2D, box: Box, time: number, model: HoldModel, colors: Colors, place: Place, tall: boolean): void {
  const x = box.x + box.w / 2;
  const compact = !tall && box.h < 450;
  const tight = !tall && box.h < 350;
  const vertex = model.final.vertices[model.rule.vertex];

  if (!vertex) throw new Error('The closing readout uses its exact final holder.');

  if (time < 74000) {
    text(pen, 'CLAIMED: EVERY NONEMPTY\nFINITE ORIENTED GRAPH\nHAS A HOLDER', x, box.y + (tall ? 10 : 28), tall ? 13 : 20, box.w - 6, colors);
    text(pen, 'LEAN CATALOGUE: COMPLETE', x, box.y + (tall ? 69 : 105), tall ? 10 : 14, box.w - 6, colors);
  } else {
    text(pen, 'UNREVIEWED', x, box.y + (tall ? 10 : 28), tall ? 22 : 31, box.w - 6, colors);
    text(pen, 'A KERNEL CHECK IS NOT A READING\nOF THE PAPER', x, box.y + (tall ? 39 : 81), tall ? 10 : 14, box.w - 6, colors);
    text(pen, 'LEAN CATALOGUE: COMPLETE', x, box.y + (tall ? 83 : 147), tall ? 9 : 13, box.w - 6, colors);
  }

  detail(pen, box, vertex, box.y + (tall ? 116 : tight ? 170 : compact ? 190 : 211), colors, place, tall, false);
  text(pen, `DOT ${vertex.vertex + 1} · ${model.final.holders.length} HOLDERS IN THIS GRAPH`, x, box.y + (tall ? 175 : tight ? 242 : compact ? 262 : 308), tall ? 9.5 : 14, box.w - 6, colors);
  place('holder-rule', x, box.y + (tall ? 205 : tight ? 270 : compact ? 297 : 365));
  exhaustive(pen, box, model, colors, tall);
}

export function drawPanels(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: HoldModel, tall: boolean): void {
  pen.setLineDash([]);
  const state = selectedState(time);
  const snapshot = model.history[state.index];
  const focused = focusAt(time);

  if (!snapshot) throw new Error('Every displayed turn holds its prior canonical snapshot.');

  if (time < 8750) introductory(pen, box, model, colors, tall);
  else {
    if (focused === null) throw new Error('Every count-reading scene has a selected source vertex.');

    const vertex = snapshot.vertices[focused];

    if (!vertex) throw new Error('The selected source has its exact first and second sets.');

    if (time < 17750) focusDetail(pen, box, vertex, colors, place, tall);
    else if (time < 28750) initialHolders(pen, box, snapshot, vertex, colors, place, tall);
    else if (time < 37500) oppositeArrows(pen, box, time, colors, tall);
    else if (time < 51500) adversary(pen, box, time, snapshot, vertex, model, colors, place, tall);
    else if (time < 63500) partialResult(pen, box, time, model, colors, place, tall);
    else claimLedger(pen, box, time, model, colors, place, tall);
  }

  if (time >= 17750) countOrder(pen, box, colors, tall);
}

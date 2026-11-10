import type { DistanceModel } from './math';
import { claimProgress, flattenProgress, ladderProgress, randomProgress, ratioProgress } from './story';
import { ladderBox, ladderPoint, line, ratioChartBox, ratioPoint, subpolyPoint, text, type Box, type Colors, type Place, type Point } from './drawing';

export function drawPanels(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: DistanceModel, tall: boolean): void {
  const x = box.x + box.w / 2;
  const size = tall ? 11 : 13;
  const titleSize = tall ? 14 : 18;
  const at = (fraction: number) => box.y + box.h * fraction;
  const label = (words: string, fraction: number, fontSize = size) => text(pen, words, x, at(fraction), fontSize, box.w - 6, colors);

  if (time < 13000) {
    label(time < 8000 ? 'EVERY PAIR OF POINTS' : 'HOW FEW DIFFERENT LENGTHS?', .12, titleSize);
    label(`${model.grid.length} POINTS`, .36, tall ? 20 : 26);
    label(`${model.pairCount.toLocaleString('en-US')} UNORDERED PAIRS`, .58, tall ? 16 : 21);
    label('REPEATED LENGTHS COUNT ONLY ONCE', .83);

    return;
  }

  if (time < 27500) {
    label("ERDŐS'S GRID · 1946", .10, titleSize);
    place('grid-power', x, at(.30));
    label('AN UPPER-BOUND EXAMPLE', .43);
    label(`MOST COMMON SQUARED LENGTH: ${model.common.squared}\n${model.common.count} PAIRS HAVE THAT LENGTH`, .60);
    label(`${model.missing.length} MISSING INTEGER VALUES\nALL SQUARED LENGTHS BELOW 3t² = 75`, .83);

    return;
  }

  if (time < 34500) {
    const settled = randomProgress(time) === 1;
    label(settled ? 'SAME POINT COUNT, DIFFERENT SETS' : 'BRINGING IN THE SEEDED SAMPLE', .10, titleSize);

    if (settled) {
      label(`GRID: ${model.distinct} DIFFERENT LENGTHS`, .36, tall ? 15 : 20);
      label(`RANDOM: ${model.randomDistinct.toLocaleString('en-US')} DIFFERENT LENGTHS`, .59, tall ? 15 : 20);
      label(`${model.pairCount.toLocaleString('en-US')} PAIRS IN EACH SET · COMPUTED EXACTLY`, .85);
    } else label(tall ? 'THE GRID TALLIES INTEGER\nSQUARED DISTANCES' : 'THE GRID TALLIES INTEGER SQUARED DISTANCES', .50);

    return;
  }

  if (time < 45000) {
    label('THE PLANE · GUTH–KATZ 2015', .10, titleSize);
    label('SETTLED UP TO A LOGARITHM', .32);

    if (flattenProgress(time) === 1) {
      label(`${model.plane.points.length} DISTINCT SITES\n${model.plane.pairCount} PAIRS · ${model.plane.distinct} LENGTHS`, .56, tall ? 15 : 20);
      label('THIS FLAT GRID IS COMPUTED EXACTLY', .87);
    } else {
      label('FLATTENING AND RETURN: ARTWORK IN TRANSIT', .58);
      label('COUNTS WAIT FOR THE SETTLED CONFIGURATION', .85);
    }

    return;
  }

  label('LOWER-BOUND EXPONENT · THREE DIMENSIONS', .035, tall ? 10 : 13);
  drawLadder(pen, box, time, colors, place, model, tall);

  if (time >= 74000) drawRatios(pen, box, time, colors, place, model, tall);

  if (time >= 83500) label('UNREVIEWED · NO LEAN', .978, tall ? 11 : 14);
  else if (time >= 66000) label('CLAIM: n ≥ 2 DISTINCT POINTS · FIXED d ≥ 3', .978, tall ? 10 : 12);
  else label('THE NEAR-TOP OFFSET IS SCHEMATIC', .978, tall ? 10 : 12);
}

function drawLadder(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: DistanceModel, tall: boolean): void {
  const plot = ladderBox(box, tall);
  const opening = ladderProgress(time);
  const bottom = ladderPoint(model.ladder.half, plot);
  const top = ladderPoint(model.ladder.grid, plot);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .65;
  line(pen, bottom.x, bottom.y, top.x, top.y, Math.min(1, opening * 5));

  if (opening > 0) {
    text(pen, '1/2', bottom.x - 7, bottom.y, tall ? 9 : 12, 28, colors, 'right');
    text(pen, '2/3', top.x - 7, top.y, tall ? 9 : 12, 28, colors, 'right');
    pen.beginPath();
    pen.arc(top.x, top.y, 3, 0, Math.PI * 2);
    pen.stroke();
  }

  const rungs = [
    { point: bottom, formula: null, words: tall ? 'CLOSE TO 1/2 · 1990' : 'CLARKSON ET AL. 1990 · CLOSE TO 1/2', offset: 0 },
    { point: ladderPoint(model.ladder.apst, plot), formula: 'apst-power', words: 'ARONOV · PACH\nSHARIR · TARDOS', offset: 8 },
    { point: ladderPoint(model.ladder.solymosiVu, plot), formula: 'sv-power', words: 'SOLYMOSI · VU', offset: -7 },
    { point: ladderPoint(model.ladder.threeFifths, plot), formula: null, words: '3/5', offset: 0 },
    { point: subpolyPoint(plot, tall), formula: 'subpoly-power', words: 'TIDOR · YU · ZAKHAROV\nAUG 2026 · OFFSET SCHEMATIC', offset: 0 },
  ] as const;

  for (const [index, rung] of rungs.entries()) {
    const amount = Math.max(0, Math.min(1, opening * rungs.length - index));

    if (amount === 0) continue;

    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1;
    line(pen, rung.point.x - 5, rung.point.y, rung.point.x + 9, rung.point.y, amount);

    if (amount !== 1) continue;

    const y = rung.point.y + rung.offset;
    const destination = { x: plot.x + 20, y };
    leader(pen, rung.point, destination, colors);

    if (rung.formula) {
      place(rung.formula, plot.x + plot.w * (tall ? .49 : .25), y);

      if (tall && index === 4) text(pen, 'o(1) OFFSET SCHEMATIC', plot.x + plot.w * .52, y + 16, 8, plot.w - 10, colors);
      if (!tall) {
        const authorY = y + (index === 4 ? 9 : index === 1 ? -6 : 0);
        text(pen, rung.words, plot.x + plot.w * .73, authorY, 9, plot.w * .52, colors);
      }
    } else text(pen, rung.words, plot.x + plot.w * .52, y, tall ? 10 : 11, plot.w - 10, colors);
  }

  const claim = claimProgress(time);

  if (claim === 0 && opening > 0) text(pen, 'GRID EXPONENT', plot.x + plot.w * .58, top.y, tall ? 9 : 11, plot.w * .75, colors);

  if (claim > 0) {
    pen.strokeStyle = colors.blue;
    pen.lineWidth = tall ? 2.6 : 3.2;
    line(pen, top.x - 8, top.y, top.x + plot.w * .25, top.y, claim);

    if (claim === 1) {
      place('claimed-bound', plot.x + plot.w * .50, top.y);
      text(pen, 'CLAIMED', plot.x + plot.w * .88, top.y, tall ? 9 : 11, plot.w * .23, colors);
    }
  }
}

function leader(pen: CanvasRenderingContext2D, from: Point, to: Point, colors: Colors): void {
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .45;
  line(pen, from.x + 9, from.y, to.x, to.y);
}

function drawRatios(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: DistanceModel, tall: boolean): void {
  const plot = ratioChartBox(box, tall);
  const amount = ratioProgress(time);
  const coordinate = amount * (model.growth.length - 1);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .6;
  line(pen, plot.x, plot.y, plot.x, plot.y + plot.h);
  line(pen, plot.x, plot.y + plot.h, plot.x + plot.w, plot.y + plot.h);
  text(pen, 'GRID ONLY · d = 3', plot.x, plot.y - 17, tall ? 8 : 10, plot.w * .48, colors, 'left');
  place('ratio-definition', plot.x + plot.w * .78, plot.y - 17);

  for (const value of [0, .75, 1.5]) {
    const point = ratioPoint(2, value, plot);
    text(pen, `${value}`, point.x - 5, point.y, tall ? 8 : 10, 25, colors, 'right');
  }

  for (const t of [2, 5, 8, 12]) {
    const point = ratioPoint(t, 0, plot);
    text(pen, `${t}`, point.x, point.y + 12, tall ? 8 : 10, 20, colors);
  }

  text(pen, 't', plot.x + plot.w - 7, plot.y + plot.h - 10, tall ? 10 : 12, 15, colors);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.1;

  for (const [index, row] of model.growth.entries()) {
    const point = ratioPoint(row.t, row.ratio, plot);

    if (index > 0 && index - 1 < coordinate) {
      const previous = model.growth[index - 1];

      if (!previous) throw new Error('A grid-growth segment retains its preceding exact count.');

      const start = ratioPoint(previous.t, previous.ratio, plot);
      line(pen, start.x, start.y, point.x, point.y, Math.min(1, coordinate - index + 1));
    }

    if (index <= coordinate) {
      pen.fillStyle = colors.ink;
      pen.beginPath();
      pen.arc(point.x, point.y, tall ? 1.4 : 1.9, 0, Math.PI * 2);
      pen.fill();
    }
  }
}

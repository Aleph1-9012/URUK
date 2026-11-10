import { mix, progress, smooth } from '../../../lib/animation';
import { type Box, type Colors, type Place, line, text } from './drawing';
import { bushUnionBounds, type KakeyaModel } from './math';
import { shadedFractionAt, shadedFractionLabel } from './story';

function ring(pen: CanvasRenderingContext2D, x: number, y: number, radius: number, fill: boolean): void {
  pen.beginPath();
  pen.arc(x, y, radius, 0, 2 * Math.PI);

  if (fill) pen.fill();

  pen.stroke();
}

function squareCounts(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, model: KakeyaModel, tall: boolean): void {
  const x = box.x + box.w / 2;
  const visible = time < 30000 ? 1 : Math.min(4, 1 + Math.floor(progress(time, 30000, 36500) * 3.99));
  const header = box.y + 11;
  const rowStart = box.y + (tall ? 49 : 67);
  const rowStep = tall ? 19 : 33;
  text(pen, 'COUNTING SQUARES OF SIDE δ', x, header, tall ? 11 : 15, box.w - 5, colors);
  text(pen, 'δ', box.x + box.w * .14, rowStart - 20, tall ? 13 : 17, 40, colors);
  text(pen, 'NEEDLE', box.x + box.w * .45, rowStart - 20, tall ? 10 : 13, box.w * .3, colors);
  text(pen, 'SLID SHAPE', box.x + box.w * .80, rowStart - 20, tall ? 10 : 13, box.w * .35, colors);
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  line(pen, box.x + 5, rowStart - 8, box.x + box.w - 5, rowStart - 8);

  for (let index = 0; index < visible; index++) {
    const row = model.squares[index];

    if (!row) throw new Error('The square-count table has four measured grid sizes.');

    const y = rowStart + index * rowStep;
    text(pen, `1/${Math.round(1 / row.delta)}`, box.x + box.w * .14, y, tall ? 13 : 18, 50, colors);
    text(pen, String(row.needle), box.x + box.w * .45, y, tall ? 14 : 20, box.w * .25, colors);
    text(pen, String(row.tree), box.x + box.w * .80, y, tall ? 14 : 20, box.w * .25, colors);
  }

  if (time >= 30000) {
    text(pen, 'NEEDLE ×2 · DIMENSION 1', x, box.y + box.h - 38, tall ? 10 : 13, box.w - 6, colors);
    text(pen, 'SHAPE ×3.3 TO ×3.6 · LIKE A SURFACE', x, box.y + box.h - 21, tall ? 9 : 12, box.w - 6, colors);
    text(pen, 'BOX COUNT · A COUSIN OF HAUSDORFF DIMENSION', x, box.y + box.h - 4, tall ? 8 : 11, box.w - 6, colors);
  }
}

function ladder(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, tall: boolean): void {
  const left = box.x + (tall ? 37 : 47);
  const right = box.x + box.w - (tall ? 12 : 17);
  const width = right - left;
  const y2 = box.y + box.h * .16;
  const y3 = box.y + box.h * .43;
  const y4 = box.y + box.h * .73;
  const claimed = time >= 85750;
  const latestBounds = time >= 83750;
  const known = time >= 43250;
  const planeKnown = time >= 43800;
  const spaceKnown = time >= 48100;
  const lineGrowth = smooth(time, 37250, 39100);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;

  for (const [dimension, y] of [[2, y2], [3, y3], [4, y4]] as const) {
    line(pen, left, y, right, y, lineGrowth);
    line(pen, left, y - 3, left, y + 3);
    place(`r${dimension}`, box.x + 15, y);
    pen.fillStyle = dimension === 4 && claimed ? colors.blue : colors.ink;
    pen.strokeStyle = pen.fillStyle;
    pen.lineWidth = dimension === 4 && claimed ? 2.1 : 1;
    ring(pen, right, y, tall ? 3.3 : 4.4, dimension === 2 ? planeKnown : dimension === 3 ? spaceKnown : claimed);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1;
    text(pen, String(dimension - 1), left, y + 13, tall ? 10 : 13, 25, colors);
    text(pen, String(dimension), right, y + 13, tall ? 10 : 13, 25, colors, 'center', dimension === 4 && claimed ? colors.blue : colors.ink);
  }

  if (planeKnown) text(pen, 'DAVIES 1971', left + width * .55, y2 - 12, tall ? 9 : 12, width * .9, colors);

  if (known) {
    line(pen, left + width / 2, y3 - 5, left + width / 2, y3 + 5);
    text(pen, spaceKnown ? 'WOLFF 5/2 · WANG–ZAHL 3 (2025, SET)' : 'WOLFF 1995 · 5/2', left + width / 2, y3 - 13, tall ? 8.5 : 11, width + 3, colors);
    line(pen, left, y4 - 5, left, y4 + 5);

    if (!latestBounds) text(pen, 'WOLFF 1995 · 3', left + width * .34, y4 - 13, tall ? 9 : 12, width * .7, colors);
  }

  if (latestBounds) {
    const guth = left + width / 40;
    const katz = left + width * .059;
    const upperX = left + width * .33;
    const lowerX = left + width * .52;
    line(pen, guth, y4 - 6, guth, y4 + 3);
    line(pen, guth, y4 - 6, upperX, y4 - 23);
    line(pen, katz, y4 - 3, katz, y4 + 6);
    line(pen, katz, y4 + 6, lowerX, y4 + 26);
    text(pen, 'GUTH–ZAHL · 3 + 1/40', upperX, y4 - 23, tall ? 8.5 : 11, width * .69, colors);
    text(pen, 'KATZ–ZAHL · 3.059', lowerX, y4 + 26, tall ? 8.5 : 11, width * .76, colors);
  }

  if (claimed) {
    text(pen, tall ? 'CLAIMED' : 'CLAIMED · dim K = 4', right - width * .12, y4 - 10, tall ? 9 : 12, width * (tall ? .38 : .6), colors, 'center', colors.blue);
    text(pen, 'R⁵: AT LEAST 4 · ABOVE: OPEN', box.x + box.w / 2, box.y + box.h - 3, tall ? 9 : 12, box.w - 6, colors);
  }
}

function shareChart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: KakeyaModel, tall: boolean, compact = false): void {
  const claimed = time >= 79750;
  const showMaximal = claimed && !compact && (!tall || time < 83750);
  const left = box.x + (tall ? 37 : 43);
  const right = box.x + box.w - (tall ? 18 : 23);
  const top = box.y + 29;
  const bottom = box.y + box.h - (showMaximal ? (tall ? 116 : 125) : claimed && !compact ? 56 : 41);
  const xMap = (lambda: number) => left + Math.log2(lambda / .25) / 2 * (right - left);
  const yMap = (share: number) => bottom - (Math.log10(share) + 4) / 4 * (bottom - top);
  const x = box.x + box.w / 2;
  const growth = smooth(time, 66000, 70400);
  text(pen, 'SHARE FILLED, AGAINST λ · LOG AXES', x, box.y + 9, tall ? 10 : 13, box.w - 6, colors);
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  line(pen, left, top, left, bottom);
  line(pen, left, bottom, right, bottom);

  for (const [value, words] of [[.0001, '.0001'], [.001, '.001'], [.01, '.01'], [.1, '.1'], [1, '1']] as const) {
    const py = yMap(value);
    line(pen, left - 3, py, left, py);
    text(pen, words, left - 5, py, tall ? 8.5 : 11, 35, colors, 'right');
  }

  for (const [value, words] of [[.25, '¼'], [.5, '½'], [1, '1']] as const) {
    const px = xMap(value);
    line(pen, px, bottom, px, bottom + 3);
    text(pen, words, px, bottom + 12, tall ? 11 : 14, 25, colors);
  }

  place('lambda', right + 11, bottom + 12);
  const curve = (coefficient: number, power: number, amount: number) => {
    pen.beginPath();

    for (let sample = 0; sample <= 80 * amount; sample++) {
      const lambda = .25 * 2 ** (sample / 80 * 2);
      const px = xMap(lambda);
      const py = yMap(coefficient * lambda ** power);

      if (sample === 0) pen.moveTo(px, py);
      else pen.lineTo(px, py);
    }

    pen.stroke();
  };
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  curve(1, 1, growth);
  pen.setLineDash([2, 3]);
  curve(.04, 4, growth);
  pen.setLineDash([]);
  curve(.07, 3, growth);

  for (const row of model.bush.rows) {
    if (Math.log2(row.lambda / .25) / 2 > growth + .001) continue;

    const px = xMap(row.lambda);
    const low = yMap(row.shareLow);
    const high = yMap(row.shareHigh);
    pen.lineWidth = tall ? 2.4 : 3.2;
    line(pen, px, low, px, high);
    pen.lineWidth = 1.1;
    line(pen, px - 4, low, px + 4, low);
    line(pen, px - 4, high, px + 4, high);
  }

  text(pen, 'TUBES KEPT APART', xMap(.5), yMap(.5) - 10, tall ? 8.5 : 11, right - left, colors);
  text(pen, 'THE BUSH', xMap(.54), yMap(.07 * .54 ** 3) - 11, tall ? 9 : 12, right - left, colors);
  place('line-lambda3', xMap(.7), yMap(.07 * .7 ** 3) + 14);
  place('line-lambdaK', xMap(.32), yMap(.04 * .32 ** 4) - 13);

  if (claimed) {
    pen.strokeStyle = colors.blue;
    pen.lineWidth = 2;
    pen.setLineDash([5, 4]);
    curve(.06, 3, smooth(time, 79750, 81750));
    pen.setLineDash([]);

    if (!compact) {
      const floorY = showMaximal ? box.y + box.h - (tall ? 82 : 90) : box.y + box.h - 24;
      text(pen, 'CLAIMED FLOOR', box.x + box.w * .25, floorY, tall ? 9 : 12, box.w * .45, colors, 'center', colors.blue);
      place('floor', box.x + box.w * .66, floorY);

      if (showMaximal) place('maximal', x, box.y + box.h - (tall ? 42 : 47));

      text(pen, '3 DIMENSIONS · HEIGHT SCHEMATIC', x, box.y + box.h - 5, tall ? 8.5 : 11, box.w - 5, colors);
    }
  } else if (!compact) {
    text(pen, 'SET: SOME POWER · WANG AND ZAHL', x, box.y + box.h - 22, tall ? 9 : 12, box.w - 5, colors);
    text(pen, 'SOME-POWER LINE: SLOPE SCHEMATIC', x, box.y + box.h - 5, tall ? 9 : 12, box.w - 5, colors);
  }
}

function tubeReadout(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, model: KakeyaModel, tall: boolean): void {
  const x = box.x + box.w / 2;
  const assembling = time >= 57000 && time < 58500;
  text(pen, assembling ? 'ASSEMBLING THE DIRECTION FAMILY' : 'THE SAME TUBES · SHADED MIDDLES', x, box.y + 12, tall ? 10 : 13, box.w - 5, colors);

  if (time < 57000) {
    text(pen, time < 54800 ? 'TARGET: LENGTH 1 · RADIUS δ = 1/32' : 'LENGTH 1 · RADIUS δ = 1/32', x, box.y + box.h * .48, tall ? 13 : 18, box.w - 5, colors);

    return;
  }

  if (assembling) {
    text(pen, 'TARGET: 2,442 SEPARATED DIRECTIONS', x, box.y + box.h * .40, tall ? 10 : 14, box.w - 5, colors);
    text(pen, 'VOLUME RANGES FOLLOW WHEN IT SETTLES', x, box.y + box.h * .68, tall ? 9 : 13, box.w - 5, colors);

    return;
  }

  const lambda = shadedFractionAt(time);
  const row = bushUnionBounds(lambda, model.bush.delta, model.bush.directions);

  text(pen, '2,442 SEPARATED DIRECTIONS · 60 DRAWN', x, box.y + 34, tall ? 9 : 12, box.w - 5, colors);
  text(pen, shadedFractionLabel(row.lambda), x, box.y + box.h * .41, tall ? 17 : 24, box.w - 5, colors);
  text(pen, `SHADED PIECES, ADDED UP: ${row.shadedTotal.toFixed(3)}`, x, box.y + box.h * .60, tall ? 10 : 14, box.w - 5, colors);
  const decimals = row.lambda === 1 ? 3 : 4;
  text(pen, `SPACE FILLED: ${row.unionLow.toFixed(decimals)} TO ${row.unionHigh.toFixed(decimals)}`, x, box.y + box.h * .79, tall ? 10 : 14, box.w - 5, colors);
  text(pen, 'A RANGE BETWEEN TWO BALLS · THIS BUSH', x, box.y + box.h - 5, tall ? 8.5 : 11, box.w - 5, colors);
}

function movingChart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, tall: boolean): void {
  const x = box.x + box.w / 2;
  const left = box.x + 19;
  const right = box.x + box.w - 14;
  const top = box.y + 38;
  const bottom = box.y + box.h * .58;
  const chartH = bottom - top;
  const travel = smooth(time, 103250, 108800);
  const centre = mix(.25, .70, travel);
  text(pen, '4 DIMENSIONS · A LINE AS A MOVING POINT', x, box.y + 8, tall ? 9 : 12, box.w - 5, colors);
  place('moving-point', x, box.y + 24);
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  line(pen, left, bottom, right, bottom);
  text(pen, 't', right + 5, bottom + 10, tall ? 12 : 16, 15, colors);

  for (const [intercept, velocity] of [[.17, .47], [.27, .29], [.4, .05], [.56, -.21], [.69, -.43]] as const) {
    line(pen, left, bottom - intercept * chartH, right, bottom - (intercept + velocity) * chartH);
  }

  const windowLeft = left + (centre - .15) * (right - left);
  const windowWidth = .30 * (right - left);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  pen.strokeRect(windowLeft, top + chartH * .22, windowWidth, chartH * .64);
  pen.beginPath();

  for (let index = 0; index <= 40; index++) {
    const t = centre - .15 + index / 40 * .30;
    const px = left + t * (right - left);
    const py = bottom - (.4 + 2.5 * (t - centre) ** 2) * chartH;

    if (index === 0) pen.moveTo(px, py);
    else pen.lineTo(px, py);
  }

  pen.stroke();
  text(pen, 'QUADRATIC TEST · SCHEMATIC', x, bottom + 18, tall ? 9 : 12, box.w - 6, colors);
  const rulerY = box.y + box.h * .83;
  line(pen, left + 8, rulerY, right - 5, rulerY);
  place('ell', left + 5, rulerY - 17);
  text(pen, 'NARROWNESS', x, rulerY - 17, tall ? 9 : 12, box.w - 20, colors);

  for (const [position, words] of [[.1, 'ℓ = 0'], [.5, '0 < ℓ < ∞'], [.9, 'ℓ = ∞']] as const) {
    const px = left + (right - left) * position;
    line(pen, px - 6, rulerY - 5, px + 6, rulerY + 5);
    line(pen, px - 6, rulerY + 5, px + 6, rulerY - 5);
    text(pen, words, px, rulerY + 16, tall ? 10 : 14, (right - left) * .34, colors);
  }

  text(pen, 'EACH REGIME CONTRADICTS · CLAIMED', x, box.y + box.h - 3, tall ? 9 : 12, box.w - 5, colors);
}

function closing(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: KakeyaModel, tall: boolean): void {
  const x = box.x + box.w / 2;
  const half = tall ? .57 : .52;
  shareChart(pen, { x: box.x, y: box.y, w: box.w, h: box.h * half }, time, colors, place, model, tall, true);
  const start = box.y + box.h * (half + .04);
  text(pen, 'UNREVIEWED', x, start, tall ? 17 : 24, box.w - 6, colors);
  text(pen, 'OSVERIFY: TWO MINOR ISSUES, NO MAJOR', x, start + (tall ? 23 : 32), tall ? 9 : 12, box.w - 6, colors);
  text(pen, '4-DIMENSIONAL PAPER', x, start + (tall ? 39 : 53), tall ? 9 : 12, box.w - 6, colors);

  if (tall) {
    const y = box.y + box.h - 28;
    place('r4', box.x + box.w * .17, y);
    pen.fillStyle = colors.blue;
    pen.strokeStyle = colors.blue;
    pen.lineWidth = 2;
    ring(pen, box.x + box.w * .32, y, 4.4, true);
    text(pen, '4', box.x + box.w * .39, y, 11, 15, colors, 'center', colors.blue);
    text(pen, 'CLAIMED · dim K = 4', box.x + box.w * .72, y, 9, box.w * .48, colors, 'center', colors.blue);
  }

  text(pen, 'LEAN: NEITHER CLAIM', x, box.y + box.h - 5, tall ? 10 : 14, box.w - 6, colors);
}

export function drawPanels(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: KakeyaModel, tall: boolean): void {
  pen.strokeStyle = colors.ink;
  pen.fillStyle = colors.ink;
  pen.lineWidth = 1;
  pen.setLineDash([]);

  if (time < 24000) return;

  if (time < 37250) {
    squareCounts(pen, box, time, colors, model, tall);

    return;
  }

  if (time >= 111500) {
    if (!tall) ladder(pen, { x: box.x, y: box.y, w: box.w, h: box.h * .44 }, time, colors, place, false);

    const closingBox = tall ? box : { x: box.x, y: box.y + box.h * .46, w: box.w, h: box.h * .54 };
    closing(pen, closingBox, time, colors, place, model, tall);

    return;
  }

  if (tall) {
    if (time >= 83750 && time < 84750) {
      const amount = smooth(time, 83750, 84750);
      const movingLabels: Place = (id, x, y) => place(id, x, y, 0);
      const movingColors = { ...colors, labels: false };
      pen.save();
      pen.beginPath();
      pen.rect(box.x, box.y, box.w, box.h);
      pen.clip();
      shareChart(pen, { x: box.x - box.w * amount, y: box.y, w: box.w, h: box.h }, time, movingColors, movingLabels, model, true);
      ladder(pen, { x: box.x + box.w * (1 - amount), y: box.y, w: box.w, h: box.h }, time, movingColors, movingLabels, true);
      pen.restore();

      return;
    }

    if (time < 52000 || time >= 83750 && time < 90750) ladder(pen, box, time, colors, place, true);
    else if (time < 66000) tubeReadout(pen, box, time, colors, model, true);
    else if (time >= 103250) movingChart(pen, box, time, colors, place, true);
    else shareChart(pen, box, time, colors, place, model, true);

    return;
  }

  ladder(pen, { x: box.x, y: box.y, w: box.w, h: box.h * .44 }, time, colors, place, false);
  const lower = { x: box.x, y: box.y + box.h * .48, w: box.w, h: box.h * .52 };

  if (time < 52000) return;
  if (time < 66000) tubeReadout(pen, lower, time, colors, model, false);
  else if (time < 103250) shareChart(pen, lower, time, colors, place, model, false);
  else movingChart(pen, lower, time, colors, place, false);
}

import { mix, progress, smooth } from '../../../lib/animation';
import { type Box, type Colors, type Place, hatch, line, text } from './drawing';
import { curveValue, type PartyModel } from './math';

type CurveLabel = { id: 'classical' | 'aks' | 'bradac' | 'spencer' | 'curve-claim'; value: number; tone: string; y: number };

function circle(pen: CanvasRenderingContext2D, x: number, y: number, radius: number, fill = false): void {
  pen.beginPath();
  pen.arc(x, y, radius, 0, Math.PI * 2);

  if (fill) pen.fill();

  pen.stroke();
}

function introduction(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: PartyModel, tall: boolean): void {
  const x = box.x + box.w / 2;

  if (time < 10000) {
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1.4;
    line(pen, box.x + 14, box.y + 27, box.x + 48, box.y + 27);
    text(pen, 'ACQUAINTED', box.x + 60, box.y + 27, tall ? 11 : 16, box.w - 76, colors, 'left');
    pen.setLineDash([4, 3]);
    line(pen, box.x + 14, box.y + 54, box.x + 48, box.y + 54);
    pen.setLineDash([]);
    text(pen, 'STRANGERS', box.x + 60, box.y + 54, tall ? 11 : 16, box.w - 76, colors, 'left');

    if (time >= 5100 && time < 7200) {
      text(pen, 'THIS PARTY: TWO ACQUAINTED TRIOS', x, box.y + box.h * .63, tall ? 10 : 14, box.w - 5, colors);
      text(pen, '{1, 4, 5} AND {2, 3, 6}', x, box.y + box.h * .80, tall ? 13 : 20, box.w - 5, colors);
    } else if (time >= 7200) {
      text(pen, 'FIVE · A DIFFERENT PAIRING', x, box.y + box.h * .63, tall ? 11 : 16, box.w - 5, colors);
      text(pen, 'NO ONE-COLOUR TRIANGLE', x, box.y + box.h * .80, tall ? 12 : 18, box.w - 5, colors);
    }

    return;
  }

  if (time < 18000) {
    place('r33', x, box.y + 17);
    const six = model.party.six;
    const five = model.party.five;
    text(pen, '6 PEOPLE', x, box.y + box.h * .29, tall ? 14 : 21, box.w - 5, colors);
    text(pen, `${six.total.toLocaleString('en-US')} PAIR COLOURINGS`, x, box.y + box.h * .42, tall ? 12 : 17, box.w - 5, colors);
    text(pen, 'EVERY ONE HAS A TRIANGLE', x, box.y + box.h * .53, tall ? 10 : 15, box.w - 5, colors);
    text(pen, `5 PEOPLE: ${five.total.toLocaleString('en-US')} COLOURINGS`, x, box.y + box.h * .73, tall ? 12 : 17, box.w - 5, colors);
    text(pen, `${five.without} HAVE NONE`, x, box.y + box.h * .87, tall ? 14 : 21, box.w - 5, colors);

    return;
  }

  place('rst', x, box.y + 13);
  text(pen, 'FORCE s ACQUAINTANCES', x, box.y + box.h * .25, tall ? 12 : 18, box.w - 5, colors);
  text(pen, 'OR t MUTUAL STRANGERS', x, box.y + box.h * .39, tall ? 12 : 18, box.w - 5, colors);
  const left = box.x + 22;
  const width = box.w - 44;
  const y = box.y + box.h * .72;
  const at = (value: number) => left + (value - 40) / 8 * width;
  hatch(pen, { x: at(43), y: y - 10, w: at(46) - at(43), h: 20 }, colors);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  line(pen, left, y, left + width, y);

  for (let value = 40; value <= 48; value++) {
    line(pen, at(value), y - 4, at(value), y + 4);

    if (value === 40 || value === 43 || value === 46 || value === 48) text(pen, String(value), at(value), y + 17, tall ? 10 : 13, 26, colors);
  }

  place('r55', x, y - 28);
  text(pen, 'SOMEWHERE FROM 43 TO 46', x, box.y + box.h - 5, tall ? 11 : 15, box.w - 5, colors);
}

function ladder(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: PartyModel, tall: boolean, closing = false): void {
  const x = box.x + box.w / 2;
  const left = box.x + (tall ? 36 : 45);
  const right = box.x + box.w - 12;
  const width = right - left;
  const at = (value: number) => left + value / 6 * width;
  const claimed = time >= 79250;
  const flagRule = time >= 63250 && time < 79250;
  const scope = time >= 99500 && time < 107750;
  const positions = tall ? [59, 103, 157] : [box.h * .28, box.h * .49, box.h * .72];
  const title = scope ? 'LOG EXPONENT: CLAIMED · CONSTANT: OPEN' : 'POWER OF log t';
  text(pen, title, x, box.y + 9, tall ? 10 : 14, box.w - 5, colors);
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  line(pen, left, box.y + 27, right, box.y + 27);

  for (let value = 0; value <= 6; value++) {
    line(pen, at(value), box.y + 24, at(value), box.y + 30);
    text(pen, String(value), at(value), box.y + 39, tall ? 9 : 12, 20, colors);
  }

  const kim = smooth(time, 46000, 49500);
  const mattheus = smooth(time, 50500, 54800);
  const bradac = smooth(time, 55750, 61500);
  const claim = smooth(time, 79250, 81750);
  const rows = [
    { s: 3, upper: model.ladder['3'].upper, lower: 1, arrived: kim, label: 'KIM 1995 · 1' },
    { s: 4, upper: model.ladder['4'].upper, lower: 4, arrived: mattheus, label: scope ? 's = 4: (log t)² TO (log t)⁴' : 'MATTHEUS–VERSTRAETE 2023 · 4' },
    { s: 5, upper: model.ladder['5'].upper, lower: 6, arrived: bradac, label: claimed ? '6 · BRADAČ 2026' : 'BRADAČ 2026 · 6' },
  ];

  for (const [index, row] of rows.entries()) {
    const offset = positions[index];

    if (offset === undefined) throw new Error('The logarithm ladder has three numeric rows.');

    const y = box.y + offset;
    const lower = row.s === 5 && claimed ? mix(6, 3.08, claim) : row.lower;
    pen.strokeStyle = colors.ink;
    pen.fillStyle = colors.ink;
    pen.lineWidth = 1;

    if (row.arrived > 0 && lower > row.upper) hatch(pen, { x: at(row.upper), y: y - 6, w: at(lower) - at(row.upper), h: 12 }, colors);

    line(pen, left, y, right, y);
    circle(pen, at(row.upper), y, tall ? 3 : 4, row.s === 3 && kim === 1);
    text(pen, `s=${row.s}`, box.x + 13, y, tall ? 11 : 15, 31, colors);

    if (!(row.s === 5 && claimed)) text(pen, `UPPER ${row.upper}`, at(row.upper), y - 12, tall ? 8.5 : 11, width * .50, colors);

    if (row.arrived > 0) {
      const lowerY = y - 19 * (1 - row.arrived);
      line(pen, at(row.lower), lowerY - 5, at(row.lower), lowerY + 5);
      const labelX = Math.min(at(row.lower), right - (row.s === 3 ? 0 : tall ? 48 : 65));
      line(pen, at(row.lower), y + 5, labelX, y + 11);
      text(pen, row.label, labelX, y + 16, tall ? 9 : 12, row.s === 3 ? 90 : width * .90, colors);
    }

    if (row.s === 5 && claimed) {
      pen.strokeStyle = colors.blue;
      pen.fillStyle = colors.blue;
      pen.lineWidth = 2.6;
      line(pen, at(lower), y - 9, at(lower), y + 8);
      line(pen, at(lower), y - 9, at(3.5), y - 16);
      text(pen, 'CLAIMED', box.x + (tall ? 43 : 56), y - 19, tall ? 8.5 : 11, tall ? 57 : 76, colors, 'center', colors.blue);
      place('log-claim', at(3.5), y - 19);
    }
  }

  if (claimed) {
    const reveal = smooth(time, 79250, 80300);
    const y = box.y + (tall ? 208 : box.h * .92) + (1 - reveal) * 35;
    const upper = left + width * .30;
    const lower = upper + 8;
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .7;
    pen.setLineDash([2, 3]);
    line(pen, left, y, right, y);
    pen.setLineDash([]);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = 1;
    line(pen, upper, y - 5, upper, y + 5);
    text(pen, 's≥6', box.x + 14, y, tall ? 10 : 14, 33, colors);
    text(pen, 's−2', upper - 17, y - 13, tall ? 10 : 14, 45, colors);
    pen.strokeStyle = colors.blue;
    pen.lineWidth = 2.5;
    line(pen, lower, y - 8, lower, y + 7);
    line(pen, lower, y + 7, left + width * .65, y + 10);
    place('general-log', left + width * .65, y + 13);
    text(pen, 'POSITION SCHEMATIC', right - 48, y - 14, tall ? 8 : 10, 100, colors);
  } else if (flagRule) {
    place('flag-rule', x, box.y + box.h - 30);
  } else if (!closing) {
    text(pen, 'UPPER RINGS · LOWER MARKS · HATCHED GAP', x, box.y + box.h - 3, tall ? 8.5 : 11, box.w - 5, colors);
  }
}

function logarithmChart(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, tall: boolean, compact = false): void {
  const flagRule = time >= 63250 && time < 79250;
  const footer = compact ? 31 : flagRule && !tall ? 96 : 35;
  const chart = { left: box.x + (tall ? 32 : 42), right: box.x + box.w - (tall ? 56 : 72), top: box.y + 31, bottom: box.y + box.h - footer };
  const xMap = (t: number) => chart.left + (Math.log10(t) - 2) / 7 * (chart.right - chart.left);
  const yMap = (value: number) => chart.bottom - (Math.log10(value) - 3) / 34 * (chart.bottom - chart.top);
  const x = box.x + box.w / 2;
  const lowerMorph = smooth(time, 55250, 61250);
  const lowerValue = (t: number) => 10 ** mix(Math.log10(curveValue('spencer', t)), Math.log10(curveValue('bradac', t)), lowerMorph);
  const classical = progress(time, 36500, 38800);
  const aks = progress(time, 39000, 44900);
  const lower = progress(time, 46000, 49300);
  const claim = progress(time, 81250, 84500);
  text(pen, 's = 5 · r AGAINST t · LOG AXES', x, box.y + 9, tall ? 10 : 14, box.w - 5, colors);
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .7;
  line(pen, chart.left, chart.top, chart.left, chart.bottom);
  line(pen, chart.left, chart.bottom, chart.right, chart.bottom);

  for (const [t, words] of [[1e2, '10²'], [1e5, '10⁵'], [1e9, '10⁹']] as const) text(pen, words, xMap(t), chart.bottom + 12, tall ? 10 : 13, 36, colors);

  text(pen, 't', chart.right + 26, chart.bottom + 12, tall ? 12 : 16, 14, colors);

  for (const [value, words] of [[1e4, '10⁴'], [1e12, '10¹²'], [1e20, '10²⁰'], [1e28, '10²⁸'], [1e36, '10³⁶']] as const) text(pen, words, chart.left - 6, yMap(value), tall ? 9 : 12, 33, colors, 'right');

  const draw = (fn: (t: number) => number, amount: number) => {
    pen.beginPath();

    for (let sample = 0; sample <= 100 * amount; sample++) {
      const t = 10 ** (2 + sample / 100 * 7);
      const px = xMap(t);
      const py = yMap(fn(t));

      if (sample === 0) pen.moveTo(px, py);
      else pen.lineTo(px, py);
    }

    pen.stroke();
  };

  if (time >= 55250) {
    pen.save();
    pen.beginPath();

    for (let sample = 0; sample <= 100; sample++) {
      const t = 10 ** (2 + sample / 100 * 7);

      if (sample === 0) pen.moveTo(xMap(t), yMap(curveValue('aks', t)));
      else pen.lineTo(xMap(t), yMap(curveValue('aks', t)));
    }

    for (let sample = 100; sample >= 0; sample--) {
      const t = 10 ** (2 + sample / 100 * 7);
      pen.lineTo(xMap(t), yMap(time >= 79250 ? curveValue('claim', t) : lowerValue(t)));
    }

    pen.closePath();
    pen.clip();
    hatch(pen, { x: chart.left, y: chart.top, w: chart.right - chart.left, h: chart.bottom - chart.top }, colors);
    pen.restore();
  }

  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.1;
  draw(t => curveValue('classical', t), classical);
  pen.lineWidth = 1.5;
  draw(t => curveValue('aks', t), aks);
  pen.setLineDash([2, 3]);
  draw(lowerValue, lower);
  pen.setLineDash([]);

  if (time >= 81250) {
    pen.strokeStyle = colors.blue;
    pen.lineWidth = 1.9;
    pen.setLineDash([5, 4]);
    draw(t => curveValue('claim', t), claim);
    pen.setLineDash([]);
  }

  const labels: CurveLabel[] = [];

  if (classical > .95) labels.push({ id: 'classical', value: curveValue('classical', 1e9), tone: colors.ink, y: 0 });
  if (aks > .95) labels.push({ id: 'aks', value: curveValue('aks', 1e9), tone: colors.ink, y: 0 });
  if (lower > .95 && (lowerMorph === 0 || lowerMorph === 1)) labels.push({ id: lowerMorph === 0 ? 'spencer' : 'bradac', value: lowerValue(1e9), tone: colors.ink, y: 0 });
  if (claim > .95) labels.push({ id: 'curve-claim', value: curveValue('claim', 1e9), tone: colors.blue, y: 0 });

  labels.sort((a, b) => b.value - a.value);
  const gap = labels.length < 2 ? 0 : Math.min(tall ? 33 : 40, (chart.bottom - chart.top - 27) / (labels.length - 1));
  let previous = chart.top - gap;

  for (const label of labels) {
    label.y = Math.max(chart.top + 8, yMap(label.value), previous + gap);
    previous = label.y;
  }

  const last = labels[labels.length - 1];
  const overflow = last ? Math.max(0, last.y - (chart.bottom - 18)) : 0;

  for (const label of labels) {
    label.y -= overflow;
    pen.strokeStyle = label.tone;
    pen.lineWidth = .7;
    line(pen, chart.right, yMap(label.value), chart.right + 10, label.y);
    place(label.id, chart.right + (tall ? 31 : 40), label.y);
  }

  if (!compact && time >= 36500) text(pen, 'ERDŐS–SZEKERES 1935', chart.left + 4, chart.top + 6, tall ? 8.5 : 11, chart.right - chart.left - 4, colors, 'left');
  if (!compact && time >= 39000) text(pen, 'AKS 1980 · UPPER', chart.left + 4, chart.top + 20, tall ? 8.5 : 11, chart.right - chart.left - 4, colors, 'left');

  if (!compact && time >= 46000) {
    const label = lowerMorph === 0 ? 'SPENCER · WRONG POWER OF t' : lowerMorph < 1 ? 'SPENCER → BRADAČ' : 'BRADAČ 2026 · LOWER';
    text(pen, label, chart.left + 4, chart.top + 34, tall ? 8.5 : 11, chart.right - chart.left - 4, colors, 'left');
  }

  if (flagRule && !tall) place('flag-rule', x, box.y + box.h - 44);

  text(pen, 'CONSTANTS SET TO 1 · SHAPES ONLY', x, box.y + box.h - 4, tall ? 8.5 : 11, box.w - 5, colors);
}

export function drawBitBars(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, tall: boolean): void {
  const x = box.x + box.w / 2;
  const left = box.x + 12;
  const width = box.w - 24;
  const amount = smooth(time, 88500, 90750);
  const firstY = box.y + box.h * (tall ? .31 : .28);
  const secondY = box.y + box.h * .57;
  const height = tall ? 16 : 19;
  const longer = width * .88 * amount;
  const shorter = width * .62 * amount;
  if (tall) {
    pen.strokeStyle = colors.blue;
    pen.lineWidth = 2.5;
    line(pen, box.x + 13, box.y + 3, box.x + 13, box.y + 15);
    text(pen, 's=5 · 3+ε · CLAIMED', x, box.y + 9, 10, box.w - 36, colors, 'center', colors.blue);
  }

  text(pen, 'INFORMATION IN BITS · LENGTHS SCHEMATIC', x, box.y + (tall ? 25 : 9), tall ? 9 : 12, box.w - 5, colors);
  place('entropy-lower', x, box.y + box.h * (tall ? .22 : .17));
  place('entropy-description', x, box.y + box.h * .46);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  pen.strokeRect(left, firstY, longer, height);
  pen.strokeRect(left, secondY, shorter, height);
  hatch(pen, { x: left + shorter, y: firstY, w: longer - shorter, h: height }, colors);

  if (time >= 94500) {
    pen.lineWidth = 1.5;
    line(pen, left + width * .56, secondY + height + 4, left + width * .94, firstY - 6, smooth(time, 94500, 96000));
  }

  if (amount >= .55) {
    text(pen, 'MUST CARRY', left + Math.min(50, longer / 2), firstY + height / 2, tall ? 9 : 12, Math.max(20, longer - 4), colors);
    text(pen, 'DESCRIBED IN', left + Math.min(58, shorter / 2), secondY + height / 2, tall ? 9 : 12, Math.max(20, shorter - 4), colors);
  }

  if (amount > .9) text(pen, 'SURPLUS', left + (longer + shorter) / 2, firstY + height / 2, tall ? 8.5 : 11, longer - shorter - 4, colors);

  if (time >= 94500) text(pen, 'CONTRADICTION · CLAIMED', x, box.y + box.h - 58, tall ? 14 : 18, box.w - 5, colors);

  place('coarse', x, box.y + box.h - 30);
  text(pen, 'BRADAČ’S COUNT: TOO COARSE BY THE LOG FACTOR', x, box.y + box.h - 4, tall ? 8.5 : 11, box.w - 5, colors);
}

export function drawClosingLedger(pen: CanvasRenderingContext2D, box: Box, colors: Colors, tall: boolean): void {
  const x = box.x + box.w / 2;
  text(pen, 'UNREVIEWED', x, box.y + 11, tall ? 18 : 25, box.w - 5, colors);
  text(pen, 'LEAN: TWO COMPARATOR STATEMENTS\nNOT IN THE CATALOGUE', x, box.y + (tall ? 36 : 45), tall ? 10 : 13, box.w - 5, colors);
  text(pen, 'NO OUTSIDE REPLAY', x, box.y + box.h - 4, tall ? 10 : 13, box.w - 5, colors);
}

function closingLadder(pen: CanvasRenderingContext2D, box: Box, colors: Colors): void {
  const left = box.x + 39;
  const right = box.x + box.w - 12;
  const at = (value: number) => left + value / 6 * (right - left);
  text(pen, 'POWER OF log t · CLAIMED MARKS BLUE', box.x + box.w / 2, box.y + 8, 9, box.w - 5, colors);

  for (const [s, upper, lower, offset] of [[3, 1, 1, 37], [4, 2, 4, 70], [5, 3, 3.08, 103]] as const) {
    const y = box.y + offset;
    pen.strokeStyle = colors.ink;
    pen.fillStyle = colors.ink;
    pen.lineWidth = 1;
    hatch(pen, { x: at(upper), y: y - 5, w: at(lower) - at(upper), h: 10 }, colors);
    line(pen, left, y, right, y);
    circle(pen, at(upper), y, 3, s === 3);
    text(pen, `s=${s}`, box.x + 14, y, 11, 32, colors);

    if (s === 5) {
      pen.strokeStyle = colors.blue;
      pen.lineWidth = 2.5;
      line(pen, at(lower), y - 8, at(lower), y + 7);
      text(pen, '3', at(upper) - 11, y - 12, 10, 16, colors);
      text(pen, 'CLAIMED: 3+ε', at(3.5), y + 15, 10, 106, colors, 'center', colors.blue);
    } else {
      line(pen, at(lower), y - 5, at(lower), y + 5);
      text(pen, s === 3 ? '1 · KIM · CLOSED' : '2 TO 4 · GAP OPEN', at(3.1), y + 13, 9, right - left, colors);
    }
  }

  const genericY = box.y + 140;
  text(pen, 's≥6', box.x + 16, genericY, 10, 36, colors);
  text(pen, 's−2', left + 10, genericY, 11, 43, colors);
  pen.strokeStyle = colors.blue;
  pen.lineWidth = 2.5;
  line(pen, left + 39, genericY - 7, left + 39, genericY + 6);
  text(pen, 's−2+ε', left + 84, genericY, 11, 80, colors, 'center', colors.blue);
  drawClosingLedger(pen, { x: box.x, y: box.y + 154, w: box.w, h: box.h - 154 }, colors, true);
}

export function drawPanels(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: PartyModel, tall: boolean): void {
  pen.strokeStyle = colors.ink;
  pen.fillStyle = colors.ink;
  pen.lineWidth = 1;
  pen.setLineDash([]);

  if (time < 30500) {
    introduction(pen, box, time, colors, place, model, tall);

    return;
  }

  if (tall) {
    if (time >= 87250 && time < 99500) drawBitBars(pen, box, time, colors, place, true);
    else if (time >= 107750) {
      closingLadder(pen, box, colors);
    } else if (time >= 83500 && time < 84300) {
      const slide = smooth(time, 83500, 84300);
      const movingLabels: Place = (id, x, y) => place(id, x, y, 0);
      const movingColors: Colors = { ...colors, labels: false };
      pen.save();
      pen.beginPath();
      pen.rect(box.x, box.y, box.w, box.h);
      pen.clip();
      ladder(pen, { x: box.x - box.w * slide, y: box.y, w: box.w, h: box.h }, time, movingColors, movingLabels, model, true);
      logarithmChart(pen, { x: box.x + box.w * (1 - slide), y: box.y, w: box.w, h: box.h }, time, movingColors, movingLabels, true);
      pen.restore();
    } else if (time < 46000 || time >= 84300 && time < 87250) logarithmChart(pen, box, time, colors, place, true);
    else ladder(pen, box, time, colors, place, model, true);

    return;
  }

  if (time < 36500) {
    logarithmChart(pen, box, time, colors, place, false);

    return;
  }

  const ladderBox = { x: box.x, y: box.y, w: box.w, h: box.h * .46 };
  const chartBox = { x: box.x, y: box.y + box.h * .50, w: box.w, h: box.h * .50 };
  ladder(pen, ladderBox, time, colors, place, model, false);
  logarithmChart(pen, chartBox, time, colors, place, false);
}

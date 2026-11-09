import { mix, progress, smooth } from '../../../lib/animation';
import { BOUND_EXPONENTS, ETA } from './math';
import type { Box, Colors, Place } from './stage';

type Point = { x: number; y: number };

function text(pen: CanvasRenderingContext2D, words: string, x: number, y: number, size: number, colors: Colors, align: CanvasTextAlign = 'center', tone: 'ink' | 'blue' | 'muted' = 'ink'): void {
  pen.font = `${size}px "Special Elite", monospace`;
  pen.textAlign = align;
  pen.textBaseline = 'middle';
  const width = pen.measureText(words).width;
  const left = align === 'left' ? x : align === 'right' ? x - width : x - width / 2;
  pen.fillStyle = colors.paper;
  pen.fillRect(left - 2, y - size / 2 - 1, width + 4, size + 2);
  pen.fillStyle = colors[tone];
  pen.fillText(words, x, y);
}

function line(pen: CanvasRenderingContext2D, a: Point, b: Point, amount = 1): void {
  pen.beginPath();
  pen.moveTo(a.x, a.y);
  pen.lineTo(mix(a.x, b.x, amount), mix(a.y, b.y, amount));
  pen.stroke();
}

function upperBound(time: number): { exponent: number; label: string } {
  if (time < 50800) return { exponent: BOUND_EXPONENTS.roth, label: 'ROTH 1951 · −1' };
  if (time < 52300) return { exponent: mix(BOUND_EXPONENTS.roth, BOUND_EXPONENTS.kps1981, smooth(time, 50800, 51500)), label: 'KPS 1981 · −8/7' };
  if (time < 54000) return { exponent: mix(BOUND_EXPONENTS.kps1981, BOUND_EXPONENTS.cpz2023, smooth(time, 52300, 52800)), label: 'CPZ 2023 · −8/7 − 1/2000' };

  return { exponent: mix(BOUND_EXPONENTS.cpz2023, BOUND_EXPONENTS.cpz2025, smooth(time, 54000, 55200)), label: 'CPZ · −7/6 + ε' };
}

function openBand(pen: CanvasRenderingContext2D, left: number, right: number, y: number, colors: Colors): void {
  pen.save();
  pen.beginPath();
  pen.rect(left, y - 5, Math.max(0, right - left), 10);
  pen.clip();
  pen.strokeStyle = colors.muted;
  pen.lineWidth = .5;

  for (let x = left - 10; x < right + 10; x += 6) line(pen, { x, y: y + 5 }, { x: x + 10, y: y - 5 });

  pen.restore();
}

function exactInset(pen: CanvasRenderingContext2D, box: Box, time: number, origin: Point, colors: Colors): void {
  const compact = box.h < 130;
  const enter = smooth(time, 52000, 52400);
  const leave = smooth(time, 54400, 54800);
  const amount = enter * (1 - leave);
  const centre = { x: mix(origin.x, box.x + box.w / 2, amount), y: mix(origin.y, box.y + box.h / 2, amount) };
  const width = (compact ? box.w * .83 : box.w * .85) * amount;
  const height = (compact ? box.h * .75 : box.h * .58) * amount;
  const left = centre.x - width / 2;
  const top = centre.y - height / 2;
  pen.fillStyle = colors.paper;
  pen.fillRect(left - 3, top - 3, width + 6, height + 6);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .8;
  pen.strokeRect(left, top, width, height);

  if (amount < .99) return;

  const y = top + height * .48;
  const first = left + width * .82;
  const second = left + width * .18;
  line(pen, { x: left + width * .08, y }, { x: left + width * .92, y });

  for (const x of [first, second]) line(pen, { x, y: y - 5 }, { x, y: y + 5 });

  text(pen, 'EXACT DETAIL · Δx = 0.0005', centre.x, top + 9, compact ? 10 : 12, colors);
  text(pen, '2023', second, y + 15, 10, colors);
  text(pen, '1981', first, y + 15, 10, colors);

  if (!compact) {
    text(pen, '−8/7 − 1/2000', second, y + 31, 10, colors);
    text(pen, '−8/7', first, y + 31, 10, colors);
  }
}

function drawMagnifier(pen: CanvasRenderingContext2D, box: Box, time: number, origin: Point, colors: Colors, place: Place): void {
  const compact = box.h < 130;
  const enter = smooth(time, 63750, 64450);
  const leave = smooth(time, 71100, 71750);
  const amount = enter * (1 - leave);
  const radius = Math.min(compact ? 23 : box.w * .29, box.h * .29) * amount;
  const centre = {
    x: mix(origin.x, compact ? box.x + 29 : box.x + box.w / 2, amount),
    y: mix(origin.y, compact ? box.y + box.h * .39 : box.y + box.h * .37, amount),
  };
  const zoom = time < 66000 ? 10 : time < 68500 ? 100 : 200;
  // Keep η separate from −2: adding it to −2 first would erase it in floating point.
  const claimX = centre.x + ETA.value * 10 ** zoom * radius;
  pen.fillStyle = colors.paper;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .9;
  pen.beginPath();
  pen.arc(centre.x, centre.y, radius, 0, Math.PI * 2);
  pen.fill();
  pen.stroke();
  line(pen, { x: centre.x + radius * .72, y: centre.y + radius * .72 }, { x: centre.x + radius * 1.15, y: centre.y + radius * 1.15 });
  line(pen, { x: centre.x - radius * .8, y: centre.y }, { x: centre.x + radius * .8, y: centre.y });
  line(pen, { x: centre.x, y: centre.y - radius * .6 }, { x: centre.x, y: centre.y + radius * .6 });
  pen.strokeStyle = colors.blue;
  pen.lineWidth = 1.5;
  pen.setLineDash([3, 3]);
  line(pen, { x: claimX, y: centre.y - radius * .73 }, { x: claimX, y: centre.y + radius * .73 });
  pen.setLineDash([]);

  if (amount < .99) return;

  if (compact) {
    const x = box.x + (box.w + 61) / 2;
    place(`zoom-${zoom}`, x, box.y + 6);
    place('eta-value', x, box.y + 28);
    text(pen, 'SCALE SCHEMATIC', x, box.y + 47, 10, colors);
    text(pen, '−2', centre.x + radius + 12, centre.y, 10, colors);
    place('eta-digits', box.x + box.w / 2, box.y + box.h - 7);
  } else {
    place(`zoom-${zoom}`, centre.x, box.y + 8);
    text(pen, '−2', centre.x, centre.y + radius + 13, 12, colors);
    place('eta-value', centre.x, box.y + box.h * .73);
    text(pen, 'SCALE SCHEMATIC', centre.x, box.y + box.h * .80, 11, colors);
    place('eta-digits', centre.x, box.y + box.h * .92);
  }
}

/** The optional readout box is borrowed at 52–54.8 s and 63.75–71.75 s. */
export function drawRuler(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, readoutBox?: Box): void {
  if (time < 9500) return;

  const compact = box.w < 450;

  if (time < 32000) {
    text(pen, 'HEILBRONN, c. 1950', box.x + box.w / 2, box.y + box.h * .45, compact ? 11 : 14, colors);
    return;
  }

  const left = box.x + (compact ? 19 : 30);
  const right = box.x + box.w - (compact ? 19 : 30);
  const y = compact ? box.y + box.h - 20 : box.y + box.h * .60;
  const upperY = box.y + (compact ? 19 : 25);
  const flagY = y - 13;
  const at = (exponent: number): number => left + (exponent + 2) * (right - left);
  const bound = upperBound(time);
  pen.save();
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;

  if (time >= 49500) openBand(pen, left, at(bound.exponent), y, colors);

  line(pen, { x: left, y }, { x: right, y }, progress(time, 32000, 33400));
  line(pen, { x: left, y: y - 7 }, { x: left, y: y + 5 });

  if (time >= 33400) line(pen, { x: right, y: y - 4 }, { x: right, y: y + 5 });

  text(pen, 'EXPONENT x FOR Δ(n) ≈ nˣ', box.x + box.w / 2, box.y + 3, compact ? 10 : 12, colors);
  text(pen, '−2', left, y + 15, compact ? 11 : 13, colors);
  text(pen, '−1', right, y + 15, compact ? 11 : 13, colors);
  line(pen, { x: left, y: y - 7 }, { x: left, y: y - 19 });
  line(pen, { x: left, y: y - 19 }, { x: left + 13, y: y - 15 });
  line(pen, { x: left + 13, y: y - 15 }, { x: left, y: y - 12 });

  if (time < 49500) {
    text(pen, '× log n · 1982', left + 18, flagY, compact ? 10 : 12, colors, 'left');
  } else {
    text(pen, '1982', left + 18, flagY, 10, colors, 'left');
    const pointerX = at(bound.exponent);
    line(pen, { x: pointerX, y: y - 9 }, { x: pointerX, y: y + 6 });
    line(pen, { x: pointerX, y: y - 9 }, { x: right - 7, y: upperY + 8 });
    text(pen, bound.label, right - 6, upperY, compact ? 10 : 13, colors, 'right');
    text(pen, time >= 71100 ? 'TRUE EXPONENT: SOMEWHERE HERE' : 'OPEN', (left + at(bound.exponent)) / 2, y, compact ? 10 : 12, colors);
  }

  if (time < 41500) {
    text(pen, 'HEILBRONN: n⁻²', box.x + box.w * .42, y + 15, compact ? 10 : 12, colors);
  } else if (time < 56000) {
    const width = mix((right - left) * .13, (right - left) * .008, smooth(time, 41500, 47500));
    pen.lineWidth = .7;
    line(pen, { x: left, y: y - 9 }, { x: left + width, y: y - 9 });
    line(pen, { x: left + width, y: y - 9 }, { x: left + width, y: y - 4 });
    text(pen, compact ? 'BELIEF: ≤ n⁻²⁺ε · EVERY ε' : 'BELIEF: AT MOST n⁻²⁺ε, EVERY ε', box.x + box.w * .43, y + 15, compact ? 10 : 12, colors);
  } else {
    pen.strokeStyle = colors.blue;
    pen.lineWidth = 1.7;
    pen.setLineDash([3, 3]);
    // η is too small to separate from the existing −2 tick on this true linear scale.
    line(pen, { x: left, y: y - 12 }, { x: left, y: y + 7 }, progress(time, 56000, 57000));
    pen.setLineDash([]);
    place('claim', box.x + box.w * .42, y + 17);
  }

  if (readoutBox && time >= 52000 && time < 54800) exactInset(pen, readoutBox, time, { x: at(BOUND_EXPONENTS.cpz2023), y }, colors);
  if (readoutBox && time >= 63750 && time < 71750) drawMagnifier(pen, readoutBox, time, { x: left, y }, colors, place);

  pen.restore();
}

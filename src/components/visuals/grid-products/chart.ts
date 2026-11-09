import { fade, smooth } from '../../../lib/animation';
import { CLAIM, RECORDS, WALL, crossingLog, dialAt, lowerLog, upperLog } from './math';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type Label = (id: string, x: number, y: number, opacity?: number) => void;

type Point = { x: number; y: number };

export function drawRecordChart(p: CanvasRenderingContext2D, width: number, height: number, time: number, colors: Colors, label: Label): void {
  const tall = height > width;
  const appearing = smooth(time, tall ? 33500 : 32000, 35000);

  if (appearing < .001) return;

  const folding = fade(time, 65500, 67000, 103500, 105000);
  const chartOpacity = appearing * (1 - folding);
  const left = width * ((tall ? .16 : .56) + ((tall ? .88 : .9) - (tall ? .16 : .56)) * folding);
  const top = height * (tall ? .56 : .2);
  const bottom = height * (tall ? .86 - .06 * smooth(time, 111500, 113000) : .79);
  const right = width * (tall ? .88 : .92);
  const x = (year: number) => left + (year - 1965) / 65 * (right - left);
  const y = (value: number) => bottom - (value - 2) * (bottom - top);

  function line(a: Point, b: Point, tone: keyof Colors = 'ink', opacity = 1, thickness = 1): void {
    if (opacity <= .001) return;

    p.beginPath();
    p.moveTo(a.x, a.y);
    p.lineTo(b.x, b.y);
    p.strokeStyle = colors[tone];
    p.globalAlpha = opacity;
    p.lineWidth = thickness;
    p.stroke();
    p.globalAlpha = 1;
  }

  function words(text: string, cx: number, cy: number, maxWidth: number, opacity = 1, tone: keyof Colors = 'ink', small = true): void {
    if (opacity < .005) return;

    const size = small ? tall ? 9 : 11 : tall ? 13 : 16;
    p.font = small ? `${size}px "Special Elite", monospace` : `italic ${size}px Alegreya, serif`;
    p.textAlign = 'center';
    p.textBaseline = 'middle';
    const lines: string[] = [];

    for (const paragraph of text.split('\n')) {
      let current = '';

      for (const word of paragraph.split(' ')) {
        const next = current ? `${current} ${word}` : word;

        if (current && p.measureText(next).width > maxWidth) {
          lines.push(current);
          current = word;
        } else current = next;
      }

      lines.push(current);
    }

    p.globalAlpha = opacity;

    for (const [index, textLine] of lines.entries()) {
      const extent = p.measureText(textLine).width;
      const px = Math.max(extent / 2 + 4, Math.min(width - extent / 2 - 4, cx));
      const py = cy + (index - (lines.length - 1) / 2) * (size + 3);
      p.fillStyle = colors.paper;
      p.fillRect(px - extent / 2 - 2, py - size * .65, extent + 4, size * 1.3);
      p.fillStyle = colors[tone];
      p.fillText(textLine, px, py);
    }

    p.globalAlpha = 1;
  }

  function dot(px: number, py: number, radius: number, opacity: number, hollow = false): void {
    p.beginPath();
    p.arc(px, py, radius, 0, Math.PI * 2);
    p.globalAlpha = opacity;
    p.fillStyle = hollow ? colors.paper : colors.blue;
    p.fill();
    p.strokeStyle = colors.blue;
    p.lineWidth = 1.4;
    p.stroke();
    p.globalAlpha = 1;
  }

  function hatch(x0: number, y0: number, w: number, h: number, opacity: number): void {
    p.save();
    p.beginPath();
    p.rect(x0, y0, w, h);
    p.clip();

    for (let start = Math.floor((x0 - h) / 8) * 8; start < x0 + w; start += 8) {
      line({ x: start, y: y0 + h }, { x: start + h, y: y0 }, 'muted', opacity, .6);
    }

    p.restore();
  }

  words('ω: THE POWER OF n IN THE WORK', (left + right) / 2, top - (tall ? 19 : 32), (right - left) + 40, chartOpacity * (tall ? 1 - smooth(time, 103500, 105000) : 1));
  line({ x: left, y: top }, { x: left, y: bottom }, 'muted', appearing);
  line({ x: left, y: bottom }, { x: right, y: bottom }, 'ink', appearing, 1.4);

  for (const value of [2, 2.5, 3]) {
    line({ x: left - 4, y: y(value) }, { x: left + 4, y: y(value) }, 'ink', appearing);
    words(String(value), left - 15, y(value), 32, appearing, 'muted', false);
  }

  for (const year of [1969, 1990, 2026]) {
    words(String(year), x(year), bottom + (tall ? 16 : 24), 40, chartOpacity, 'muted');
  }

  const reveal = time < 42500 ? smooth(time, 33700, 36800) : 1 + (RECORDS.length - 2) * smooth(time, 42500, 48800);
  let prior = { year: 1965, bound: 3 };

  for (const [index, record] of RECORDS.entries()) {
    if (record.claimed) break;

    const progress = Math.min(1, Math.max(0, reveal - index));

    if (progress <= 0) break;

    const px = x(record.year);
    line({ x: x(prior.year), y: y(prior.bound) }, { x: px, y: y(prior.bound) }, 'ink', appearing);
    line({ x: px, y: y(prior.bound) }, { x: px, y: y(prior.bound + (record.bound - prior.bound) * progress) }, 'ink', appearing, 1.5);
    prior = record;
  }

  const opening = fade(time, 34000, 35500, 42500, 44000) * chartOpacity;
  words('SCHOOL: 3', (left + right) / 2, top + 16, right - left, opening);
  words('STRASSEN 1969 · 2.807', (left + right) / 2, y(2.8074) + 17, right - left, opening);
  words('?', left + (right - left) * .55, y(2.4), 40, opening * .6, 'muted', false);
  words('FLOOR: THE ANSWER HAS n² ENTRIES', (left + right) / 2, bottom + (tall ? 35 : 47), (right - left) + 22, opening, 'muted');
  const records = fade(time, 42500, 44500, 50000, 51000) * chartOpacity;
  words('1978 · 2.796', x(1983), y(2.85), (right - left) * .65, records, 'ink', false);
  words('1981 · 2.522', x(1994), y(2.60), (right - left) * .65, records, 'ink', false);
  words('1990 · 2.3755', x(2007), y(2.40) + 15, (right - left) * .7, records, 'ink', false);
  words('ONE TENSOR, STUDIED MORE CAREFULLY', (left + right) / 2, bottom + (tall ? 35 : 47), (right - left) + 25, records, 'muted');

  const lens = fade(time, 50000, 51000, 54800, 56000) * chartOpacity;

  if (lens > .005) {
    const box = { x: width * (tall ? .43 : .66), y: height * (tall ? .55 : .20), w: width * (tall ? .40 : .25), h: height * (tall ? .13 : .23) };
    p.fillStyle = colors.paper;
    p.globalAlpha = lens;
    p.fillRect(box.x - 10, box.y - 13, box.w + 20, box.h + 38);
    p.globalAlpha = 1;
    const zx = (year: number) => box.x + (year - 1990) / 36 * box.w;
    const zy = (bound: number) => box.y + (2.376 - bound) / .005 * box.h;
    let previous = { year: 1990, bound: 2.3755 };

    for (const record of RECORDS) {
      if (record.year <= 1990 || record.claimed) continue;

      line({ x: zx(previous.year), y: zy(previous.bound) }, { x: zx(record.year), y: zy(previous.bound) }, 'ink', lens);
      line({ x: zx(record.year), y: zy(previous.bound) }, { x: zx(record.year), y: zy(record.bound) }, 'ink', lens);
      previous = record;
    }

    words('2.3755', box.x + box.w * .18, box.y - 8, box.w, lens, 'ink', false);
    words('2.371177', box.x + box.w * .7, box.y + box.h + 9, box.w, lens, 'ink', false);
    words('36 YEARS · THIRD DECIMAL', (left + right) / 2, bottom + (tall ? 35 : 47), right - left + 22, lens);
  }

  const wall = smooth(time, 55000, 57500);
  hatch(left, y(WALL), right - left, Math.min(9, bottom - y(WALL)), wall * appearing * .5);
  line({ x: left, y: y(WALL) }, { x: right, y: y(WALL) }, 'muted', wall * appearing);
  words('METHOD BARRIER: 2.3078', (left + right) / 2, y(WALL) - (tall ? 14 : 18), right - left + 15, fade(time, 55600, 57000, 58500, 59600) * chartOpacity, 'muted');

  const claim = smooth(time, 58500, 61800);
  const claimY = y(2.371177 + (CLAIM - 2.371177) * claim);
  p.setLineDash([3, 3]);
  line({ x: x(2026), y: y(2.371177) }, { x: x(2026), y: claimY }, 'blue', claim * appearing, 1.5);
  p.setLineDash([]);
  dot(x(2026), claimY, 4, claim * appearing);
  const claimNote = fade(time, 60000, 62000, 65500, 66500) * chartOpacity;
  words('CLAIMED · 2 OCT 2026', (left + right) / 2, top + (tall ? 14 : 24), right - left + 20, claimNote, 'blue');
  label('claim', (left + right) / 2, top + (tall ? 38 : 57), claimNote);
  words('COMPLEX NUMBERS', (left + right) / 2, tall ? bottom + 35 : top + 88, right - left, claimNote, 'muted');
  words('−0.121', x(2026) - 35, claimY + 19, 65, claimNote, 'blue', false);

  if (!tall) {
    words('−0.258', x(1981) + 25, y(2.67), 65, claimNote, 'muted', false);
    words('−0.104', x(1990) + 35, y(2.44), 65, claimNote, 'muted', false);
  }

  if (folding > .005) {
    words('ω', left, top - 21, 30, folding, 'ink', false);

    for (const value of [2.8074, 2.371177, WALL, CLAIM]) {
      line({ x: left - 5, y: y(value) }, { x: left + 5, y: y(value) }, value === CLAIM ? 'blue' : 'muted', folding, value === CLAIM ? 2 : 1);
    }

    const pointer = 3 * dialAt(time);
    const pointerOpacity = smooth(time, 72500, 74000) * folding;
    dot(left, y(pointer), 4.5, pointerOpacity, true);
    const leader = tall ? width * .08 : width * .07;
    if (tall) {
      words(`3t\n${pointer.toFixed(2)}`, left, top - 37, 40, pointerOpacity, 'blue', false);
      line({ x: left - 8, y: y(pointer) }, { x: left - 5, y: y(pointer) }, 'blue', pointerOpacity);
    } else {
      line({ x: left - leader, y: y(pointer) }, { x: left - 5, y: y(pointer) }, 'blue', pointerOpacity);
      words(`3t = ${pointer.toFixed(2)}`, left - leader - 35, y(pointer), 90, pointerOpacity, 'blue', false);
    }
    const bracketX = left + (tall ? 9 : 16);
    line({ x: bracketX, y: y(CLAIM) }, { x: bracketX, y: bottom }, 'blue', folding, 1.5);
    line({ x: bracketX - 3, y: y(CLAIM) }, { x: bracketX + 3, y: y(CLAIM) }, 'blue', folding);
    line({ x: bracketX - 3, y: bottom }, { x: bracketX + 3, y: bottom }, 'blue', folding);
  }

  const squeeze = fade(time, 95500, 96700, 103500, 104500);

  if (squeeze > .005) {
    const box = { x: width * (tall ? .14 : .34), y: height * (tall ? .58 : .28), w: width * (tall ? .60 : .45), h: height * (tall ? .28 : .48) };
    const maxX = 12 * Math.LN10;
    const maxY = 17 * Math.LN10;
    const px = (value: number) => box.x + value / maxX * box.w;
    const py = (value: number) => box.y + box.h - value / maxY * box.h;
    const t = dialAt(time);
    const crossing = crossingLog(t);
    line({ x: box.x, y: box.y }, { x: box.x, y: box.y + box.h }, 'muted', squeeze);
    line({ x: box.x, y: box.y + box.h }, { x: box.x + box.w, y: box.y + box.h }, 'muted', squeeze);
    const points = Array.from({ length: 121 }, (_, index) => index / 120 * maxX);

    if (crossing !== null && crossing < maxX) {
      p.save();
      p.beginPath();
      p.moveTo(px(crossing), py(lowerLog(crossing)));

      for (const value of points) {
        if (value > crossing) p.lineTo(px(value), py(lowerLog(value)));
      }

      for (let index = points.length - 1; index >= 0; index--) {
        const value = points[index];

        if (value !== undefined && value > crossing) p.lineTo(px(value), py(upperLog(value, t)));
      }

      p.closePath();
      p.clip();
      hatch(box.x, box.y, box.w, box.h, squeeze * .6);
      p.restore();
    }

    for (let index = 1; index < points.length; index++) {
      const current = points[index];
      const previous = points[index - 1];

      if (current === undefined || previous === undefined) continue;

      line({ x: px(previous), y: py(lowerLog(previous)) }, { x: px(current), y: py(lowerLog(current)) }, 'ink', squeeze, 1.5);
      line({ x: px(previous), y: py(upperLog(previous, t)) }, { x: px(current), y: py(upperLog(current, t)) }, 'blue', squeeze, 1.5);
    }

    if (crossing !== null && crossing < maxX) dot(px(crossing), py(lowerLog(crossing)), 3, squeeze);

    words('P(a,a) · LOG SCALES', box.x + box.w / 2, box.y - (tall ? 15 : 25), box.w, squeeze);
    words(`t = ${t.toFixed(3)}`, box.x + box.w * .22, box.y + box.h * .13, box.w * .45, squeeze, 'blue', false);
    words('AT LEAST', box.x + box.w * .2, box.y + box.h * .36, box.w * .45, squeeze);
    label('lower', box.x + box.w * .22, box.y + box.h * .51, squeeze);
    words('AT MOST', box.x + box.w * .79, box.y + box.h * .66, box.w * .45, squeeze, 'blue');
    label('upper', box.x + box.w * .76, box.y + box.h * .83, squeeze);
    words('1', box.x, box.y + box.h + 15, 30, squeeze, 'muted');
    words('10¹²', box.x + box.w, box.y + box.h + 15, 45, squeeze, 'muted');
    words('a: COEFFICIENTS PER POLYNOMIAL', box.x + box.w / 2, box.y + box.h + (tall ? 32 : 42), box.w + 30, squeeze, 'muted');
    words(time < 101900 ? 'CROSSING: UPPER BELOW LOWER' : 't = 3/4: NO CROSSING FOR a > 1', box.x + box.w / 2, box.y - (tall ? 34 : 53), box.w + 25, squeeze, time < 101900 ? 'ink' : 'blue');
  }

  const ending = smooth(time, 111500, 113000) * chartOpacity;
  label('status', (left + right) / 2, tall ? bottom + 40 : top + 30, ending);
  if (!tall) words('FORMAL PROOF REBUILT\nPAPER: NO VERDICT YET', (left + right) / 2, top + 83, right - left + 20, ending, 'muted');
  words('2.25', x(2026) - 25, y(CLAIM) + (tall ? -13 : 18), 60, ending, 'blue', false);
}

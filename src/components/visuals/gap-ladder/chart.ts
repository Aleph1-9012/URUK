import {
  AKLT_BOND, CLAIMED_BOUNDS, GROUND_ENERGY, HALF_GAPS, LEVELS, NUMERICAL_GAP,
  ONE_GAPS, PURE_BOND, energyBeta, gapDotTime, gapFromPurity, ringState, thermalState,
} from './math';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type Point = { x: number; y: number };

type Box = { x: number; y: number; w: number; h: number };

type Label = (id: string, x: number, y: number, opacity?: number) => void;

function ease(time: number, start: number, end: number): number {
  const t = Math.max(0, Math.min(1, (time - start) / (end - start)));

  return t * t * (3 - 2 * t);
}

function mix(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

function boxMix(from: Box, to: Box, amount: number): Box {
  return { x: mix(from.x, to.x, amount), y: mix(from.y, to.y, amount), w: mix(from.w, to.w, amount), h: mix(from.h, to.h, amount) };
}

let lastBeta = 2;

let lastThermal = thermalState(2);

export function drawGapChart(pen: CanvasRenderingContext2D, width: number, height: number, time: number, colors: Colors, label: Label): void {
  const tall = height > width;
  const full: Box = { x: width * (tall ? .14 : .55), y: height * (tall ? .56 : .17), w: width * (tall ? .77 : .39), h: height * (tall ? .29 : .65) };
  const token: Box = { x: width * (tall ? .76 : .83), y: height * (tall ? .065 : .07), w: width * (tall ? .19 : .13), h: height * (tall ? .10 : .12) };
  const folding = Math.max(ease(time, 31000, 33000) * (1 - ease(time, 47000, 49000)), ease(time, 77000, 79000) * (1 - ease(time, 110000, 112000)));
  const box = boxMix(full, token, folding);
  const state = ringState(time);
  const reveal = ease(time, 6500, 7800);
  const floorZoom = ease(time, 54500, 57500) * (1 - ease(time, 62500, 65000));
  const normalMax = mix(3.4, 1.1, ease(time, 14500, 17000));
  const maxEnergy = Math.exp(mix(Math.log(normalMax), Math.log(.006), floorZoom));
  const broken = ease(time, 47000, 49000);
  const xFraction = (length: number) => {
    const unbroken = length / 24;
    const extended = length <= 24 ? .52 * length / 24 : .58 + .38 * Math.log(length / 24) / Math.log(8192 / 24);

    return mix(unbroken, extended, broken);
  };
  const at = (length: number, energy: number): Point => ({ x: box.x + xFraction(length) * box.w, y: box.y + box.h * (1 - energy / maxEnergy) });
  const line = (points: readonly Point[], tone: keyof Colors = 'ink', weight = 1, progress = 1, alpha = 1) => {
    if (points.length < 2 || progress <= 0 || alpha <= 0) return;

    let length = 0;

    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];

      if (a && b) length += Math.hypot(b.x - a.x, b.y - a.y);
    }

    let remaining = length * Math.min(1, progress);
    pen.beginPath();
    pen.strokeStyle = colors[tone];
    pen.globalAlpha = alpha;
    pen.lineWidth = weight;

    for (let i = 1; i < points.length && remaining > 0; i++) {
      const a = points[i - 1];
      const b = points[i];

      if (!a || !b) continue;

      const segment = Math.hypot(b.x - a.x, b.y - a.y);
      const part = Math.min(1, remaining / (segment || 1));
      pen.moveTo(a.x, a.y);
      pen.lineTo(mix(a.x, b.x, part), mix(a.y, b.y, part));
      remaining -= segment;
    }

    pen.stroke();
    pen.globalAlpha = 1;
  };
  const dot = (point: Point, radius: number, hollow = false, tone: keyof Colors = 'ink') => {
    pen.beginPath();
    pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    pen.fillStyle = colors[hollow ? 'paper' : tone];
    pen.fill();
    pen.strokeStyle = colors[tone];
    pen.lineWidth = 1;
    pen.stroke();
  };
  const words = (content: string, x: number, y: number, maxWidth: number, tone: keyof Colors = 'ink', size = tall ? 10 : 11) => {
    pen.font = `${size}px "Special Elite", monospace`;
    pen.textAlign = 'center';
    pen.textBaseline = 'middle';
    const lines: string[] = [];

    for (const paragraph of content.split('\n')) {
      let current = '';

      for (const word of paragraph.split(' ')) {
        const next = current ? `${current} ${word}` : word;

        if (current && pen.measureText(next).width > maxWidth) {
          lines.push(current);
          current = word;
        } else current = next;
      }

      lines.push(current);
    }

    for (const [index, contentLine] of lines.entries()) {
      const extent = pen.measureText(contentLine).width;
      const px = Math.max(extent / 2 + 5, Math.min(width - extent / 2 - 5, x));
      const py = y + (index - (lines.length - 1) / 2) * (size + 3);
      pen.fillStyle = colors.paper;
      pen.fillRect(px - extent / 2 - 2, py - size * .65, extent + 4, size * 1.3);
      pen.fillStyle = colors[tone];
      pen.fillText(contentLine, px, py);
    }
  };
  const bracket = (x: number, ground: number, excited: number, tone: keyof Colors = 'ink') => line([{ x: x + 4, y: ground }, { x, y: ground }, { x, y: excited }, { x: x + 4, y: excited }], tone, 1.2);

  line([{ x: box.x, y: box.y }, { x: box.x, y: box.y + box.h }, { x: box.x + box.w, y: box.y + box.h }], 'muted', .8, reveal);

  if (reveal > .99 && folding < .15) {
    const heading = floorZoom > .8 ? 'ZOOM: ENERGY 0 TO 0.006' : time >= 47000 && time < 54500 ? 'CLAIMED · TWO PAPERS, 2026' : 'ENERGY ABOVE THE LOWEST';

    if (time < 110000) words(heading, box.x + box.w / 2, box.y - (tall ? 21 : 29), box.w + 35);

    const ticks = floorZoom > .8 ? [0, .002, .004, .006] : floorZoom > .03 ? [0] : normalMax > 2 ? [0, 1, 2, 3] : [0, .5, 1];

    for (const energy of ticks) {
      const p = at(0, energy);
      line([{ x: p.x - 3, y: p.y }, { x: p.x + box.w, y: p.y }], 'muted', .5, 1, .22);
      words(String(energy), p.x - (tall ? 14 : 22), p.y, tall ? 27 : 42, 'muted', tall ? 9 : 11);
    }

    const lengths = broken > .9 ? [4, 12, 20, 60, time >= 69500 && time < 77000 ? 1921 : 2304] : [4, 8, 12, 16, 20];

    for (const length of lengths) words(String(length), at(length, 0).x, box.y + box.h + 14, length > 100 ? 38 : 28, 'muted', tall ? 9 : 11);

    if (broken > .9) {
      words('∞', box.x + box.w + (tall ? 12 : 0), box.y + box.h + 14, 20, 'muted', 13);
      const mark = box.x + box.w * .55;
      line([{ x: mark - 4, y: box.y + box.h + 3 }, { x: mark, y: box.y + box.h - 3 }], 'muted');
      line([{ x: mark + 2, y: box.y + box.h + 3 }, { x: mark + 6, y: box.y + box.h - 3 }], 'muted');
    }

    words(broken > .9 ? 'L: RING LENGTH · LOG AFTER BREAK' : 'L: RING LENGTH', box.x + box.w / 2, box.y + box.h + (tall ? 32 : 39), box.w + 35, 'muted', tall ? 9 : 11);
  } else if (folding > .8) words('GAPS', box.x + box.w / 2, box.y - 10, box.w + 5, 'muted', 9);

  pen.save();
  pen.beginPath();
  pen.rect(box.x - 6, box.y - 6, box.w + 12, box.h + 12);
  pen.clip();

  for (const [index, gap] of HALF_GAPS.entries()) {
    if (time >= gapDotTime(.5, index)) dot(at(4 + 2 * index, gap), mix(tall ? 2.6 : 3.3, 1.3, folding), true);
  }

  for (const [index, gap] of ONE_GAPS.entries()) {
    if (time >= gapDotTime(1, index)) dot(at(4 + 2 * index, gap), mix(tall ? 2.6 : 3.3, 1.3, folding));
  }

  if (time >= 22220) {
    const from = at(20, HALF_GAPS[8]);
    pen.setLineDash([3, 3]);
    line([from, { x: box.x + box.w, y: box.y + box.h - 1 }], 'muted', 1);
    pen.setLineDash([]);
  }

  if (time >= 29500) {
    pen.setLineDash([4, 3]);
    line([at(14, ONE_GAPS[5]), { x: box.x + box.w, y: at(14, NUMERICAL_GAP).y }], 'ink', 1, ease(time, 29500, 31000));
    pen.setLineDash([]);
  }

  if (time >= 6500 && time < 31000) {
    const gap = state.gap;

    if (gap !== null) {
      const base = at(state.length, 0);
      const levels = time < 14500 ? LEVELS.slice(0, 10).map(level => ({ gap: level.energy - GROUND_ENERGY, count: level.count })) : [{ gap: 0, count: 1 }, { gap, count: 3 }];
      const rungWidth = mix(tall ? 15 : 24, 4, folding);
      line([base, at(state.length, Math.min(maxEnergy, levels.at(-1)?.gap ?? gap))], 'ink', .8, ease(time, 6500, 8500));

      for (const [index, level] of levels.entries()) {
        const p = at(state.length, level.gap);
        line([{ x: p.x - rungWidth / 2, y: p.y }, { x: p.x + rungWidth / 2, y: p.y }], 'ink', 1.2, ease(time, 6600 + index * 330, 7100 + index * 330));
      }

      if (time >= 7800) bracket(base.x - rungWidth / 2 - 7, base.y, at(state.length, gap).y);
    }
  }

  const claimLine = (length: number, value: number, start: number, dashed = false) => {
    const a = at(length, value);
    const end = { x: box.x + box.w, y: a.y };
    pen.setLineDash(dashed ? [4, 3] : []);
    line([a, end], 'blue', folding > .5 ? 1.4 : 2, ease(time, start, start + 2000));
    line([{ x: a.x, y: at(length, 0).y }, a], 'blue', .8, ease(time, start, start + 1500));
    pen.setLineDash([]);
  };

  if (time >= 54500) claimLine(60, CLAIMED_BOUNDS.periodic60, 54500);
  if (time >= 57500) claimLine(2304, CLAIMED_BOUNDS.periodic2304, 57500);
  if (time >= 69500) claimLine(1921, CLAIMED_BOUNDS.open1921, 69500, true);

  pen.restore();

  if (folding < .1 && floorZoom < .05 && state.settled && state.gap !== null && time >= 7800 && time < 31000) {
    const p = at(state.length, state.gap);
    const side = state.length > 16 ? -1 : 1;
    words(`GAP ${state.gap.toFixed(3)}`, p.x + side * (tall ? 44 : 67), p.y - (tall ? 11 : 16), tall ? 88 : 124);

    if (time < 14500) {
      const shown = tall ? [0, 1] : [0, 1, 2, 3, 4, 9];

      for (const index of shown) {
        const level = LEVELS[index];

        if (!level || time < 7100 + index * 330) continue;

        const p = at(8, level.energy - GROUND_ENERGY);
        const offset = index === 4 ? -4 : 0;
        words(`×${level.count}`, p.x + (tall ? 26 : 38), p.y + offset, 30, 'muted');
      }

      if (!tall) words('STATES ON EACH RUNG', box.x + box.w * .72, box.y + box.h * .12, box.w * .5, 'muted');
    }
  }

  if (time >= 29500 && folding < .1 && floorZoom < .05) words('0.41050 · NUMERICAL', box.x + box.w * .68, at(14, NUMERICAL_GAP).y - 14, box.w * .69, 'muted', tall ? 9 : 11);
  if (time >= 22220 && time < 23000) words('→ 0 AS L GROWS · SCHEMATIC CONTINUATION', box.x + box.w / 2, box.y - 21, box.w + 30, 'muted', tall ? 9 : 11);

  if (floorZoom > .8 && folding < .1) {
    words('EVEN RINGS · ONE LOWEST STATE FROM 60', box.x + box.w / 2, box.y - (tall ? 43 : 50), box.w + 30, 'blue');
    words('0.41 IS FAR ABOVE THIS VIEW ↑', box.x + box.w / 2, box.y + 11, box.w + 20, 'muted', tall ? 9 : 11);
    label('floor60', box.x + box.w * (tall ? .30 : .44), at(60, CLAIMED_BOUNDS.periodic60).y - (tall ? 18 : 29));
    if (time >= 59500) label('floor2304', box.x + box.w * (tall ? .73 : .69), at(2304, CLAIMED_BOUNDS.periodic2304).y + (tall ? 18 : -26));
  }

  if (time >= 65000 && time < 69500) words('CLAIM: POSITIVE, NOT ITS VALUE', box.x + box.w * .6, box.y + box.h * .21, box.w * .8, 'blue');

  if (time >= 71000 && time < 77000) {
    label('floor-open', box.x + box.w * .75, box.y + box.h * (tall ? .18 : .45));
    words('ODD OPEN CHAINS · FROM 1921', box.x + box.w * .72, box.y + box.h * .66, box.w * .55, 'blue', tall ? 9 : 11);
  }

  // The walking ladder splits into the two bond ladders while the plot is carried to its corner.
  if (time >= 31000 && time < 49000) {
    const arriving = ease(time, 31000, 33000) * (1 - ease(time, 47000, 49000));
    const yTop = height * (tall ? .59 : .36);
    const yBottom = height * (tall ? .83 : .79);
    const originX = full.x + full.w * 14 / 24;
    const originY = full.y + full.h;
    const two = [
      { x: width * (tall ? .30 : .64), values: PURE_BOND, id: 'bond-pure', name: 'PURE', mean: GROUND_ENERGY / 8 },
      { x: width * (tall ? .72 : .84), values: AKLT_BOND, id: 'bond-aklt', name: 'AKLT', mean: -2 / 3 },
    ];
    const energyY = (energy: number) => yBottom - (energy + 2) / 3.6 * (yBottom - yTop);

    if (arriving > .99) words('ONE BOND', width * (tall ? .5 : .75), height * (tall ? .485 : .245), width * (tall ? .9 : .42));

    for (const job of two) {
      const x = mix(originX, job.x, arriving);
      const positions = job.values.map((energy, index) => ({ x, y: mix(originY - index * full.h * .22, energyY(energy), arriving) }));
      const first = positions[0];
      const last = positions[2];

      if (first && last) line([first, last], 'muted', .8);

      for (const [index, p] of positions.entries()) {
        line([{ x: p.x - 18, y: p.y }, { x: p.x + 18, y: p.y }], 'ink', 1.1);
        if (arriving > .99 && (job.name !== 'AKLT' || index !== 1)) words(job.name === 'AKLT' ? index === 0 ? '−2/3' : '4/3' : String(job.values[index]), p.x + (tall ? 31 : 44), p.y, 45, 'muted');
      }

      if (arriving > .99) {
        label(job.id, job.x, height * (tall ? .54 : .29));
        if (time < 37500) words(job.name, job.x, height * (tall ? .91 : .88), width * (tall ? .38 : .20));
      }

      if (time >= 37500) {
        const settling = ease(time, 37500, 40000);
        const p = { x, y: mix(yTop, energyY(job.mean), settling) };
        dot(p, tall ? 3 : 4);

        if (arriving > .99 && settling > .99) {
          words(job.name === 'PURE' ? '−1.417 PER BOND\nNOT EVERY BOND LOWEST' : 'EVERY BOND LOWEST\nFRUSTRATION-FREE', job.x, height * (tall ? .92 : .89), width * (tall ? .38 : .21), job.name === 'PURE' ? 'ink' : 'muted', tall ? 9 : 11);
        }
      }
    }
  }

  // The low-energy groups get a row each. Rows are listed, rather than spaced to
  // scale, so separate bars for all 21 low states remain legible on a phone.
  if (time >= 77000 && time < 112000) {
    const arriving = ease(time, 77000, 79000) * (1 - ease(time, 110000, 112000));
    const beta = energyBeta(time);

    if (beta !== lastBeta) {
      lastBeta = beta;
      lastThermal = thermalState(beta);
    }

    const left = width * (tall ? .14 : .55);
    const right = width * (tall ? .91 : .94);
    const baseline = height * (tall ? .79 : .68);
    const pitch = tall ? 1.6 : 2.5;
    const rowHeight = tall ? 15 : 30;
    const barX = left + (tall ? 45 : 62);
    const barWidth = right - barX;
    const off = (1 - arriving) * height * .4;
    const groups = lastThermal.weights.slice(0, 5);
    const lowY = baseline + off;

    if (arriving > .99) words(time >= 101500 ? 'PURITY > 1/2 · ONE LOWEST STATE' : 'ENERGY WEIGHTS · LEVELS LISTED', (left + right) / 2, height * (tall ? .48 : .25), right - left + 30);

    for (const [index, group] of groups.entries()) {
      const y = baseline - index * rowHeight + off;
      line([{ x: barX - 6, y }, { x: barX, y }], 'ink', .8);

      for (let stateIndex = 0; stateIndex < group.count; stateIndex++) {
        const py = y + (stateIndex - (group.count - 1) / 2) * pitch;
        line([{ x: barX, y: py }, { x: barX + group.each * barWidth, y: py }], 'ink', tall ? 1 : 1.5);
      }

      if (arriving > .99) words(group.gap.toFixed(3), left + (tall ? 17 : 23), y, 48, 'muted', tall ? 9 : 11);
    }

    const otherY = baseline - 5 * rowHeight + off;
    pen.setLineDash([2, 2]);
    line([{ x: barX, y: otherY }, { x: barX + lastThermal.otherWeight * barWidth, y: otherY }], 'ink', 3);
    pen.setLineDash([]);

    if (arriving > .99) {
      words('OTHER', left + (tall ? 17 : 23), otherY, 48, 'muted', tall ? 8 : 10);
      words(`b = ${beta.toFixed(beta % 1 === 0 ? 0 : 1)}`, right - 10, height * (tall ? .52 : .30), 50, 'muted');
      words(`PURITY ${lastThermal.purity.toFixed(4)} · DEFECT ${lastThermal.defect < .001 ? lastThermal.defect.toFixed(5) : lastThermal.defect.toFixed(3)}`, (left + right) / 2, height * (tall ? .85 : .76), right - left + 30, 'ink', tall ? 9 : 11);
    }

    if (time >= (tall ? 89000 : 86000) && time < (tall ? 92000 : 94000)) label('purity-lemma', (left + right) / 2, height * (tall ? .94 : .87));

    if (time >= 101500 && time < 110000) {
      const bound = gapFromPurity(beta, lastThermal.purity);
      const gap = ONE_GAPS[2];
      const carry = ease(time, 107000, 109500);
      const bx = mix(barX - 9, at(60, 0).x, carry);
      const y0 = mix(lowY, at(60, 0).y, carry);
      const y1 = mix(lowY - rowHeight * (bound ?? 0) / gap, at(60, CLAIMED_BOUNDS.periodic60).y, carry);
      bracket(bx, y0, y1, carry > .5 ? 'blue' : 'ink');
      label('purity-gap', (left + right) / 2, height * (tall ? .94 : .87));
      if (bound !== null) words(time < 107000 ? `RING 8: ≥ ${bound.toFixed(3)} · TRUE ${gap.toFixed(3)}` : 'IDEA CARRIES OVER · NOT THE NUMBER', (left + right) / 2, height * (tall ? .89 : .81), right - left + 30, 'muted', tall ? 9 : 11);
    }
  }

  if (time >= 112000) label('status', box.x + box.w / 2, box.y - (tall ? 16 : 31));
}

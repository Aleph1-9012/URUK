import { smooth } from '../../../lib/animation';
import { layout } from './story';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type Point = { x: number; y: number };

type Label = (id: string, x: number, y: number, opacity?: number) => void;

function mix(first: number, second: number, amount: number): number {
  return first + (second - first) * amount;
}

export function drawScale(pen: CanvasRenderingContext2D, width: number, height: number, time: number, colors: Colors, label: Label): void {
  if (time < 37000) return;

  const { scale: box, tall } = layout(width, height);
  const titleY = box.y - (tall ? 12 : 0);
  const axisLeft = box.x + Math.max(tall ? 62 : 72, box.w * .23);
  const axisRight = box.x + box.w * .98;
  const axisWidth = axisRight - axisLeft;
  const zoom = smooth(time, 70500, 73200);
  const low = mix(1, 1.8, zoom);
  const high = mix(12, 2.6, zoom);
  const at = (value: number) => axisLeft + (value - low) / (high - low) * axisWidth;
  const scalarY = box.y + (tall ? 32 : box.h * .49);
  const completeY = scalarY + Math.max(28, box.h * (tall ? .32 : .28));
  const split = smooth(time, 50500, 52500);
  const secondY = mix(scalarY, completeY, split);
  const stageY = box.y + (tall ? 7 : box.h * .22);
  const size = tall ? 9 : 10;
  const words = (text: string, x: number, y: number, maxWidth: number, tone: keyof Colors = 'ink', fontSize = size) => {
    pen.font = `${fontSize}px "Special Elite", monospace`;
    pen.textAlign = 'center';
    pen.textBaseline = 'middle';
    const lines: string[] = [];

    for (const paragraph of text.split('\n')) {
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

    for (const [index, content] of lines.entries()) {
      const extent = pen.measureText(content).width;
      const px = Math.max(extent / 2 + 4, Math.min(width - extent / 2 - 4, x));
      const py = y + (index - (lines.length - 1) / 2) * (fontSize + 3);
      pen.fillStyle = colors.paper;
      pen.fillRect(px - extent / 2 - 3, py - fontSize * .65, extent + 6, fontSize * 1.3);
      pen.fillStyle = colors[tone];
      pen.fillText(content, px, py);
    }
  };
  const line = (first: Point, second: Point, tone: keyof Colors = 'ink', weight = 1, progress = 1) => {
    if (progress <= 0) return;

    pen.beginPath();
    pen.moveTo(first.x, first.y);
    pen.lineTo(mix(first.x, second.x, Math.min(1, progress)), mix(first.y, second.y, Math.min(1, progress)));
    pen.strokeStyle = colors[tone];
    pen.lineWidth = weight;
    pen.stroke();
  };
  const reveal = smooth(time, 37000, 39000);

  words(tall ? 'THE FACTOR, FOR EVERY MATRIX' : 'THE FACTOR, FOR EVERY MATRIX', box.x + box.w / 2, titleY, box.w, 'ink', tall ? 10 : 11);

  for (const y of split > .005 ? [scalarY, secondY] : [scalarY]) line({ x: axisLeft, y }, { x: axisRight, y }, 'muted', .7, reveal);

  if (time >= 44500) {
    pen.save();
    pen.beginPath();
    pen.rect(axisLeft, scalarY - 9, Math.max(0, at(2) - axisLeft), secondY - scalarY + 18);
    pen.clip();
    const progress = smooth(time, 44500, 47000);

    for (let x = axisLeft - 45; x < at(2) + 45; x += 6) line({ x, y: secondY + 9 }, { x: x + 45 * progress, y: scalarY - 9 }, 'muted', .5);

    pen.restore();
  }

  const nameX = box.x + (axisLeft - box.x) * .46;
  words(split > .8 ? 'SCALAR' : 'FACTOR', nameX, scalarY, axisLeft - box.x - 4, 'ink', size);

  if (split > .8) words('COMPLETE', nameX, secondY, axisLeft - box.x - 4, 'ink', size);

  const ghostX = at(2);

  for (const y of split > .8 ? [scalarY, secondY] : [scalarY]) {
    pen.setLineDash([2, 3]);
    line({ x: ghostX, y: y - 8 }, { x: ghostX, y: y + 8 }, 'muted', 1);
    pen.setLineDash([]);
  }

  const tickValues = zoom > .99 ? [1.8, 2, 1 + Math.SQRT2, 2.6] : [1, 2, 11.08, 12];
  const numberY = (split > .8 ? secondY : scalarY) + 15;

  for (const value of tickValues) {
    const x = at(value);

    if (x < axisLeft - 1 || x > axisRight + 1) continue;

    line({ x, y: scalarY - 3 }, { x, y: scalarY + 3 }, 'muted', .6);

    if (split > .8) line({ x, y: secondY - 3 }, { x, y: secondY + 3 }, 'muted', .6);

    const text = value === 1 + Math.SQRT2 ? '2.414' : String(value);
    const offset = zoom < .1 && value === 12 ? 7 : zoom < .1 && value === 11.08 ? -9 : 0;
    words(text, x + offset, numberY, value === 11.08 || value === 1 + Math.SQRT2 ? 42 : 25, 'muted', size);
  }

  if (time >= 65500) {
    const oldCap = mix(11.08, 1 + Math.SQRT2, smooth(time, 67800, 70200));
    const scalarCap = mix(oldCap, 2, smooth(time, 73500, 75400));
    const completeCap = mix(oldCap, 2, smooth(time, 81500, 83700));
    const mark = (value: number, y: number, claimed: boolean) => {
      const x = at(value);

      if (x < axisLeft - 2 || x > axisRight + 2) return;

      pen.setLineDash(claimed ? [3, 2] : []);
      line({ x, y: y - 9 }, { x, y: y + 9 }, claimed ? 'blue' : 'ink', 2);
      pen.setLineDash([]);
    };
    mark(scalarCap, scalarY, false);
    mark(completeCap, secondY, time >= 81500);

    if (time >= 70500) {
      const wallX = at(1 + Math.SQRT2);
      pen.setLineDash([2, 3]);
      line({ x: wallX, y: scalarY - 11 }, { x: wallX, y: secondY + 10 }, 'muted', .9);
      pen.setLineDash([]);
    }

    if (time >= 73500 && time < 81500) {
      pen.globalAlpha = .3;
      line({ x: at(1 + Math.SQRT2), y: scalarY - 8 }, { x: at(1 + Math.SQRT2), y: scalarY + 8 }, 'ink', 1);
      pen.globalAlpha = 1;
    }
  }

  const center = box.x + box.w / 2;

  if (time < 44500) words('CROUZEIX, 2004 · CONJECTURED: 2', center, stageY, box.w, 'ink', size);
  else if (time < 50500) words('BELOW 2: RULED OUT BY THE EXAMPLE', center, stageY, box.w, 'ink', size);
  else if (time < 58500) words('SCALAR: m = 1 · COMPLETE: ANY m', center, stageY, box.w, 'ink', size);
  else if (time < 65500) words('COMPLETE FACTOR ↔ CHANGE OF METRIC', center, stageY, box.w, 'ink', size);
  else if (time < 67800) words('CROUZEIX · 2007 · 11.08', center, stageY, box.w, 'ink', size);
  else if (time < 70500) {
    words('CROUZEIX AND PALENCIA · 2017', center, stageY - (tall ? 2 : 3), box.w, 'ink', size);

    if (!tall) label('constant-2017', center, stageY + 16);
  } else if (time < 71700) words('2 × 2: 2006 · SIZE ≤ 3: 2026', center, stageY, box.w, 'ink', size);
  else if (time < 73500) words('WEIGHTED SHIFTS: 2025\nTHE LEMMA STOPS AT 2.414', center, stageY, box.w, 'ink', size);
  else if (time < 81500) words(tall ? 'SCALAR: PROVED AND CHECKED' : 'SUMMER 2026 · JIN, LORIST–SCHWENNINGER, LUO\nJIN CHECKED BY CROUZEIX, TOWNSEND, GREENBAUM', center, stageY, box.w, 'ink', size);
  else if (time < 89500) words('COMPLETE: CLAIMED · UNREVIEWED', center, stageY, box.w, 'ink', size);
  else if (time < 97000) words('TWO PAPERS · EVERY SIZE · OPERATORS', center, stageY, box.w, 'ink', size);
  else if (time < 104000) words('THE SHARP BOUND: 2 · CLAIMED', center, stageY, box.w, 'ink', size);
  else words(tall ? 'COMPLETE: UNREVIEWED' : 'COMPLETE: UNREVIEWED\nTHE SCALAR CHECK DOES NOT TRANSFER', center, stageY, box.w, 'ink', size);

}

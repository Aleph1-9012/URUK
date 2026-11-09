import { stepVectors } from './math';
import { layout, smooth, stepSquared } from './story';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type Point = { x: number; y: number };

type Label = (id: string, x: number, y: number, opacity?: number) => void;

const CHANGES = [
  { at: 31000, from: 2, to: 8 },
  { at: 38500, from: 8, to: 2 },
  { at: 41500, from: 2, to: 4 },
  { at: 44500, from: 4, to: 8 },
  { at: 47500, from: 8, to: 10 },
  { at: 52500, from: 10, to: 4 },
  { at: 83000, from: 4, to: 1 },
] as const;

function squaredAt(time: number): number {
  for (const change of CHANGES) {
    if (time >= change.at && time < change.at + 850) {
      const amount = smooth(time, change.at, change.at + 850);

      return change.from + (change.to - change.from) * amount;
    }
  }

  return stepSquared(time);
}

function stepName(value: number): string {
  if (value === 1 || value === 4) return String(Math.sqrt(value));

  return `√${value}`;
}

export function drawDial(pen: CanvasRenderingContext2D, width: number, height: number, time: number, colors: Colors, label: Label): void {
  const { dial: box, tall } = layout(width, height);
  const center = { x: box.x + box.w / 2, y: box.y + box.h * .44 };
  const maximumRadius = Math.min(box.w * (tall ? .30 : .42), box.h * .35);
  const unit = maximumRadius / Math.sqrt(10);
  const squared = squaredAt(time);
  const radius = Math.sqrt(squared) * unit;
  const symbolic = time >= 69000 && time < 83000 || time >= 106000;
  const budget = time >= 97500 && time < 106000;
  const size = tall ? 8 : 11;
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
      pen.fillRect(px - extent / 2 - 2, py - fontSize * .65, extent + 4, fontSize * 1.3);
      pen.fillStyle = colors[tone];
      pen.fillText(content, px, py);
    }
  };
  const line = (a: Point, b: Point, tone: keyof Colors = 'ink', weight = .8) => {
    pen.beginPath();
    pen.moveTo(a.x, a.y);
    pen.lineTo(b.x, b.y);
    pen.strokeStyle = colors[tone];
    pen.lineWidth = weight;
    pen.stroke();
  };

  if (budget) {
    const amount = smooth(time, 97500, 98600);
    const jar = { x: center.x - box.w * .30, y: box.y + box.h * .31, w: box.w * .60, h: box.h * .60 };
    const previousRadius = unit;
    const corners = [
      { x: jar.x, y: jar.y },
      { x: jar.x + jar.w, y: jar.y },
      { x: jar.x + jar.w, y: jar.y + jar.h },
      { x: jar.x, y: jar.y + jar.h },
    ];
    pen.beginPath();

    for (let index = 0; index <= 64; index++) {
      const part = index / 64;
      const angle = part * Math.PI * 2 - Math.PI * .75;
      const side = Math.min(3, Math.floor(part * 4));
      const first = corners[side];
      const second = corners[(side + 1) % 4];

      if (!first || !second) continue;

      const along = part === 1 ? 1 : part * 4 % 1;
      const target = { x: first.x + (second.x - first.x) * along, y: first.y + (second.y - first.y) * along };
      const source = { x: center.x + Math.cos(angle) * previousRadius, y: center.y + Math.sin(angle) * previousRadius };
      const x = source.x + (target.x - source.x) * amount;
      const y = source.y + (target.y - source.y) * amount;

      if (index === 0) pen.moveTo(x, y);
      else pen.lineTo(x, y);
    }

    pen.closePath();
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .9;
    pen.stroke();
    words('ONE STEP', center.x, box.y, box.w, 'ink', size);

    if (time < 101500) label('budget-capacity', center.x, jar.y - (tall ? 10 : 13));

    let stacked = 0;

    for (let index = 0; index < 10; index++) {
      const starts = 98500 + index * 490;
      const progress = smooth(time, starts, starts + 380);

      if (progress <= 0) continue;

      const blockHeight = jar.h * .18 / (1 + index * .10);
      const targetY = jar.y + jar.h - stacked - blockHeight;
      const startY = jar.y - jar.h * .40;
      const y = startY + (targetY - startY) * progress;
      pen.fillStyle = colors.ink;
      pen.fillRect(jar.x + 3, y, jar.w - 6, blockHeight * Math.min(1, progress * 3));
      line({ x: jar.x + 3, y: y + blockHeight }, { x: jar.x + jar.w - 3, y: y + blockHeight }, 'paper', .7);
      stacked += blockHeight;
    }

    words(time < 102500 ? 'SCHEMATIC' : 'TOO MUCH', center.x, jar.y + jar.h + (tall ? 11 : 13), box.w, 'ink', tall ? 7.5 : 10);

    return;
  }

  words(time < 16500 ? 'POSSIBLE STEPS' : symbolic ? 'ANY D' : 'STEP AT MOST', center.x, box.y, box.w, symbolic ? 'blue' : 'ink', size);

  if (time < 16500) {
    pen.setLineDash([2, 3]);
    pen.beginPath();
    pen.arc(center.x, center.y, radius, 0, Math.PI * 2 * smooth(time, 1000, 2500));
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .65;
    pen.stroke();
    pen.setLineDash([]);

    return;
  }

  const changing = squared !== stepSquared(time);

  if (!symbolic) words(changing ? 'CHANGING' : stepName(stepSquared(time)), center.x, box.y + (tall ? 13 : 19), box.w, 'ink', tall ? 9 : 13);

  pen.beginPath();
  pen.arc(center.x, center.y, symbolic ? maximumRadius : radius, 0, Math.PI * 2 * smooth(time, 16500, 17800));
  pen.strokeStyle = colors[symbolic ? 'blue' : 'ink'];
  pen.lineWidth = symbolic ? 1.2 : .8;
  pen.setLineDash(symbolic ? [4, 3] : []);
  pen.stroke();
  pen.setLineDash([]);

  if (symbolic) {
    label('step-count', center.x, center.y);
    words('POSSIBLE STEPS', center.x, box.y + box.h * .78, box.w, 'ink', tall ? 7.5 : 10);
  } else {
    const vectors = stepVectors(squared);

    for (const vector of vectors) {
      const end = { x: center.x + vector.x * unit, y: center.y - vector.y * unit };
      line(center, end, 'muted', tall ? .5 : .6);
      pen.fillStyle = colors.ink;
      pen.beginPath();
      pen.arc(end.x, end.y, vector.x === 0 && vector.y === 0 ? 1.7 : tall ? 1.15 : 1.5, 0, Math.PI * 2);
      pen.fill();
    }

    const countY = box.y + box.h * .78;
    label('step-count', center.x - (tall ? 11 : 17), countY);
    words(`= ${vectors.length}`, center.x + (tall ? 12 : 18), countY, box.w, 'ink', tall ? 9 : 12);
  }

  words('ZERO INCLUDED', center.x, box.y + box.h * (tall ? .99 : .91), box.w, 'muted', tall ? 7 : 9);
}

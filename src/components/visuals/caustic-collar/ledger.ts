import { smooth } from '../../../lib/animation';
import type { CausticData } from './data';
import { layout } from './story';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type Label = (id: string, x: number, y: number, opacity?: number) => void;

function words(pen: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, colors: Colors, size: number, claimed = false): void {
  pen.font = `${size}px "Special Elite", monospace`;
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  const rows: string[] = [];

  for (const paragraph of text.split('\n')) {
    let current = '';

    for (const word of paragraph.split(' ')) {
      const next = current ? `${current} ${word}` : word;

      if (current && pen.measureText(next).width > width - 4) { rows.push(current); current = word; }
      else current = next;
    }

    rows.push(current);
  }

  for (const [index, row] of rows.entries()) {
    const py = y + (index - (rows.length - 1) / 2) * (size + 3);
    pen.fillStyle = claimed ? colors.blue : colors.ink;
    pen.fillText(row, x, py);
  }
}

function arrow(pen: CanvasRenderingContext2D, fromX: number, toX: number, y: number, color: string, size: number): void {
  pen.beginPath();
  pen.moveTo(fromX, y);
  pen.lineTo(toX, y);
  pen.lineTo(toX - size, y - size * .55);
  pen.moveTo(toX, y);
  pen.lineTo(toX - size, y + size * .55);
  pen.strokeStyle = color;
  pen.lineWidth = .65;
  pen.stroke();
}

export function drawLedger(pen: CanvasRenderingContext2D, width: number, height: number, time: number, colors: Colors, _label: Label, _data: CausticData): void {
  if (time < 30000) return;

  const { ledger: box, tall } = layout(width, height);

  if (time < 38000) {
    words(pen, 'ORDER   ?   ELLIPSE', box.x + box.w / 2, box.y + box.h * .43, box.w, colors, tall ? 10 : 17);
    words(pen, 'BIRKHOFF, 1927 · PORITSKY, 1950', box.x + box.w / 2, box.y + box.h * .85, box.w, colors, tall ? 7 : 10);

    return;
  }

  words(pen, 'FOUR RESULTS · ICONS SCHEMATIC', box.x + box.w / 2, tall ? box.y + 2 : box.y - 13, box.w, colors, tall ? 6.5 : 10);
  const gap = tall ? 4 : 12;
  const cellWidth = (box.w - gap * 3) / 4;
  const starts = [38000, 45500, 51500, 58500];

  if (time < 58500) {
    const x = box.x + 3 * (cellWidth + gap) + cellWidth / 2;
    words(pen, '?', x, box.y + (tall ? 16 : 34), cellWidth, colors, tall ? 14 : 24);
    words(pen, 'THE CONVERSE', x, box.y + (tall ? 34 : 90), cellWidth, colors, tall ? 6 : 9);
  }

  for (let index = 0; index < 4; index++) {
    const start = starts[index] ?? 0;

    if (time < start) continue;

    const x = box.x + index * (cellWidth + gap);
    const y = box.y + (tall ? 11 : 4);
    const stripWidth = cellWidth * (index === 0 ? .95 : .63);
    const stripHeight = tall ? 11 : Math.min(62, box.h * .39);
    const reveal = smooth(time, start, start + 650);
    const claimed = index === 3 && time >= 65500;
    const color = claimed ? colors.blue : colors.ink;
    const midY = y + stripHeight / 2;
    pen.strokeStyle = color;
    pen.lineWidth = .65;
    pen.setLineDash(claimed ? [2, 2] : []);

    if (index !== 2) {
      pen.beginPath();
      pen.moveTo(x, y + stripHeight);
      pen.lineTo(x, y + stripHeight * (1 - reveal));
      pen.lineTo(x + stripWidth * reveal, y);

      if (reveal === 1) { pen.lineTo(x + stripWidth, y + stripHeight); pen.closePath(); }

      pen.stroke();
      pen.setLineDash([]);
      pen.beginPath();

      if (index === 0) {
        // Each line wraps all the way round the cylinder. The missing levels
        // are vertical gaps between leaves, not breaks along a single leaf.
        for (const fraction of [.08, .16, .45, .53]) {
          const py = y + stripHeight * (1 - fraction);
          pen.moveTo(x + 1, py);
          pen.lineTo(x + (stripWidth - 1) * reveal, py);
        }
      } else if (index === 1) {
        const step = tall ? 2 : 5;

        for (let offset = 2; offset < stripHeight; offset += step) {
          pen.moveTo(x + 1, y + offset);
          pen.lineTo(x + (stripWidth - 1) * reveal, y + offset);
        }
      } else {
        const bandHeight = Math.max(1.6, stripHeight * .13);
        pen.fillStyle = color;
        pen.fillRect(x + 1, y + stripHeight - bandHeight - 1, (stripWidth - 2) * reveal, bandHeight);
      }

      pen.strokeStyle = color;
      pen.lineWidth = .5;
      pen.stroke();
    } else {
      for (const factor of [.85, 1, 1.15]) {
        pen.beginPath();
        pen.ellipse(x + stripWidth / 2, midY, stripWidth * .39 * factor, stripHeight * .33 * factor, 0, 0, Math.PI * 2 * reveal);
        pen.stroke();
      }
    }

    if (index !== 0) {
      const resultX = x + cellWidth * .92;
      const resultRadius = tall ? 3 : 7;

      if (index === 3 && !claimed) words(pen, '?', x + stripWidth + (resultX - stripWidth - x) / 2, midY, cellWidth * .3, colors, tall ? 8 : 12);
      else arrow(pen, x + stripWidth + 2, resultX - resultRadius - 2, midY, color, tall ? 2 : 3);
      pen.strokeStyle = color;
      pen.lineWidth = .8;
      pen.beginPath();
      pen.ellipse(resultX, midY, resultRadius * (index === 1 ? 1 : 1.35), resultRadius, 0, 0, Math.PI * 2 * reveal);
      pen.stroke();
    }

    if (tall) {
      const first = index === 0 ? 'LAZUTKIN' : index === 1 ? 'BIALY' : index === 2 ? 'NEAR ELLIPSE' : claimed ? 'CLAIM' : 'ASSUME';
      const second = index === 0 ? 'GAPS' : index === 1 ? 'ALL WRAP' : index === 2 ? '+ ORDER' : 'NO GAPS';
      words(pen, first, x + cellWidth / 2, y + 18, cellWidth + 2, colors, 6.5, claimed);
      words(pen, second, x + cellWidth / 2, y + 27, cellWidth + 2, colors, 6.5, claimed);
    } else {
      const heading = index === 0 ? 'LAZUTKIN · 1973' : index === 1 ? 'BIALY · 1993' : index === 2 ? '2016 AND 2018' : claimed ? 'CLAIM · 2026' : 'THE ASSUMPTION';
      const detail = index === 0 ? 'MANY LEAVES\nGAPS NEAR THE RIM' : index === 1 ? 'WHOLE STRIP\nALL CURVES WRAP' : index === 2 ? 'NEAR ELLIPSE\n+ ORDER' : 'A THIN BAND\nWITH NO GAPS';
      words(pen, heading, x + cellWidth / 2, y + stripHeight + 20, cellWidth + 3, colors, 9, claimed);
      words(pen, detail, x + cellWidth / 2, y + stripHeight + 58, cellWidth + 3, colors, 9, claimed);
    }
  }

  if (!tall && time >= 73500) words(pen, 'CONTINUITY ACROSS LEAVES · THE FULL CONJECTURE IS DIFFERENT', box.x + box.w / 2, box.y + box.h - 10, box.w, colors, 9);
}

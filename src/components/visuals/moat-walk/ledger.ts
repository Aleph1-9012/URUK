import { smooth } from '../../../lib/animation';
import type { MoatData } from './data';
import { layout, type Box } from './story';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type Point = { x: number; y: number };

type Label = (id: string, x: number, y: number, opacity?: number) => void;

const ROWS = [
  { squared: 2, text: '√2', at: 41200 },
  { squared: 4, text: '2', at: 44200 },
  { squared: 8, text: '√8', at: 47200 },
  { squared: 10, text: '√10', at: 51600 },
] as const;

function integer(value: number): string {
  return value.toLocaleString('en-US');
}

export function drawLedger(pen: CanvasRenderingContext2D, width: number, height: number, time: number, colors: Colors, label: Label, data: MoatData): void {
  const { ledger: box, tall } = layout(width, height);
  const size = tall ? 8 : 10;
  const center = box.x + box.w / 2;
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
      const px = x >= 0 && x <= width ? Math.max(extent / 2 + 4, Math.min(width - extent / 2 - 4, x)) : x;
      const py = y + (index - (lines.length - 1) / 2) * (fontSize + 3);
      pen.fillStyle = colors.paper;
      pen.fillRect(px - extent / 2 - 2, py - fontSize * .65, extent + 4, fontSize * 1.3);
      pen.fillStyle = colors[tone];
      pen.fillText(content, px, py);
    }
  };
  const line = (first: Point, second: Point, tone: keyof Colors = 'ink', weight = .7) => {
    pen.beginPath();
    pen.moveTo(first.x, first.y);
    pen.lineTo(second.x, second.y);
    pen.strokeStyle = colors[tone];
    pen.lineWidth = weight;
    pen.stroke();
  };
  const thinning = (chartBox: Box, compact: boolean) => {
    words('PRIMES PER LATTICE POINT', chartBox.x + chartBox.w / 2, chartBox.y, chartBox.w, 'ink', compact ? 8 : 9);
    const plot = { x: chartBox.x + 23, y: chartBox.y + (compact ? 21 : 16), w: chartBox.w - 32, h: chartBox.h - (compact ? 37 : 29) };
    const at = (radius: number, share: number): Point => ({ x: plot.x + radius / 1600 * plot.w, y: plot.y + (1 - (share - .07) / .11) * plot.h });
    line({ x: plot.x, y: plot.y }, { x: plot.x, y: plot.y + plot.h }, 'muted', .6);
    line({ x: plot.x, y: plot.y + plot.h }, { x: plot.x + plot.w, y: plot.y + plot.h }, 'muted', .6);

    for (const share of [.10, .15]) {
      const point = at(0, share);
      line({ x: point.x - 2, y: point.y }, { x: point.x + plot.w, y: point.y }, 'muted', .4);
      words(share.toFixed(2), point.x - 13, point.y, 24, 'muted', compact ? 7 : 8);
    }

    for (const radius of [0, 800, 1600]) words(String(radius), at(radius, .07).x, plot.y + plot.h + 10, 33, 'muted', compact ? 7 : 8);

    let previous: Point | null = null;

    for (let radius = 50; radius <= 1600; radius += 10) {
      const point = at(radius, 2 / (Math.PI * Math.log(radius)));

      if (previous) line(previous, point, 'muted', .8);

      previous = point;
    }

    label('thinning-law', plot.x + plot.w * .72, plot.y + (compact ? 1 : 6));
    const samples = data.initial?.density;

    if (!samples) {
      words('COMPUTING', chartBox.x + chartBox.w / 2, plot.y + plot.h / 2, chartBox.w, 'muted', size);

      return;
    }

    for (const [index, sample] of samples.entries()) {
      const point = at(sample.radius, sample.share);
      pen.fillStyle = colors.ink;
      pen.beginPath();
      pen.arc(point.x, point.y, compact ? 1.7 : 1.6, 0, Math.PI * 2);
      pen.fill();

      if (compact && (index === 0 || index === 4 || index === 15)) {
        const left = index === 15 ? -12 : 9;
        const up = index === 4 ? 11 : -9;
        words(sample.share.toFixed(3), point.x + left, point.y + up, 35, 'ink', 7);
      }
    }
  };

  if (tall && time >= 61000 && time < 69000) {
    thinning({ x: box.x, y: box.y, w: box.w, h: box.h }, true);

    return;
  }

  words(tall ? 'FROM 1 + i · COMPUTED' : 'HOW FAR A WALK FROM 1 + i GETS', center, box.y + (tall ? -6 : box.h * .015), box.w, 'ink', tall ? 8 : 10);
  words('STEP · PRIMES · RADIUS', center, box.y + (tall ? 7 : box.h * .10), box.w, 'muted', size);

  for (const [index, row] of ROWS.entries()) {
    const y = tall ? box.y + 20 + index * 11 : box.y + box.h * (.18 + index * .07);
    const flood = data.floods.get(row.squared);
    const requested = time >= row.at;
    const ready = requested && flood?.closed;
    const slide = requested ? 1 - smooth(time, row.at, row.at + 650) : 0;
    const offset = slide * box.w;
    line({ x: box.x + 2, y: y + (tall ? 6 : 9) }, { x: box.x + box.w - 2, y: y + (tall ? 6 : 9) }, 'muted', .35);

    if (ready) {
      const count = integer(flood.count);
      const radius = row.squared === 10 ? integer(Math.round(Math.sqrt(flood.maxRadiusSquared))) : Math.sqrt(flood.maxRadiusSquared).toFixed(1);
      pen.save();
      pen.beginPath();
      pen.rect(box.x, y - 7, box.w, 16);
      pen.clip();
      words(`${row.text} · ${count} · ${radius}`, center + offset, y, box.w - 2, 'ink', size);
      pen.restore();
    } else words(requested ? `${row.text} · COMPUTING` : `${row.text} · — · —`, center, y, box.w, requested ? 'muted' : 'ink', size);
  }

  if (time >= 50500) {
    const firstY = tall ? box.y + 64 : box.y + box.h * .47;
    const secondY = tall ? box.y + 74 : box.y + box.h * .525;
    words(tall ? 'CITED: √26 · 1998' : 'CITED: √26 · GETHNER, WAGON, WICK · 1998', center, firstY, box.w, 'ink', tall ? 7.5 : 9);
    words(tall ? 'CITED: 6 · 2005' : 'CITED: 6 · TSUCHIMURA · 2005', center, secondY, box.w, 'ink', tall ? 7.5 : 9);
  }

  if (time >= 69000) {
    const claim = { x: box.x, y: tall ? box.y + 83 : box.y + box.h * .585, w: box.w, h: tall ? 33 : box.h * .16 };
    const entering = smooth(time, 69000, 70300);
    const shift = box.w * (1 - entering);
    pen.setLineDash([4, 3]);
    pen.strokeStyle = colors.blue;
    pen.lineWidth = .9;
    pen.strokeRect(claim.x + shift, claim.y, claim.w, claim.h);
    pen.setLineDash([]);

    if (entering > .85) {
      const leftX = claim.x + claim.w * .32;
      const rightX = claim.x + claim.w * .80;
      const firstY = claim.y + (tall ? 6 : claim.h * .18);
      const middleY = claim.y + (tall ? 17 : claim.h * .50);
      const lastY = claim.y + (tall ? 27 : claim.h * .81);
      const topText = time >= 106000 ? 'EVERY D / START' : time < 77000 ? 'CLAIMED' : 'EVERY D';
      const middleText = time >= 106000 ? 'UNREVIEWED' : time < 77000 ? '26 SEP 2026' : 'EVERY START';
      const bottomText = time < 77000 ? 'EVERY D / START' : 'VALUE NOT GIVEN';
      words(topText, leftX, firstY, claim.w * .60, 'blue', tall ? 7.5 : 9);
      words(middleText, leftX, middleY, claim.w * .60, 'blue', tall ? 7.5 : 9);
      words(bottomText, leftX, lastY, claim.w * .60, 'blue', tall ? 7.5 : 9);
      words('AT MOST', rightX, firstY, claim.w * .33, 'blue', tall ? 7.5 : 9);
      label('cluster-bound', rightX, claim.y + (tall ? 23 : claim.h * .65));
    }
  }

  if (!tall && time >= 61000) thinning({ x: box.x, y: box.y + box.h * .80, w: box.w, h: box.h * .20 }, false);
}

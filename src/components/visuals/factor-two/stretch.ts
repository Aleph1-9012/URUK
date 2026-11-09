import { applyRealMatrix, ellipseParameter, matrixAt, operatorNorm, realEntries, sweepAt, topSingularPairReal } from './math';
import { layout, smooth } from './story';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type Point = { x: number; y: number };

type Label = (id: string, x: number, y: number, opacity?: number) => void;

function mix(first: number, second: number, amount: number): number {
  return first + (second - first) * amount;
}

function numberText(value: number): string {
  return value.toFixed(3).replace(/\.?0+$/, '');
}

export function drawStretch(pen: CanvasRenderingContext2D, width: number, height: number, time: number, colors: Colors, label: Label): void {
  const { stretch: box, balance, tall } = layout(width, height);
  const matrix = matrixAt(time);
  const pair = topSingularPairReal(matrix);
  const center = { x: box.x + box.w * .50, y: box.y + box.h * (tall ? .46 : .55) };
  const unit = Math.min(box.w / 5.5, box.h * (tall ? .26 : .25));
  const size = tall ? 9 : 11;
  const line = (first: Point, second: Point, weight = 1, muted = false, progress = 1) => {
    if (progress <= 0) return;

    pen.beginPath();
    pen.moveTo(first.x, first.y);
    pen.lineTo(mix(first.x, second.x, Math.min(1, progress)), mix(first.y, second.y, Math.min(1, progress)));
    pen.strokeStyle = colors[muted ? 'muted' : 'ink'];
    pen.lineWidth = weight;
    pen.stroke();
  };
  const words = (text: string, x: number, y: number, maxWidth: number, muted = false, fontSize = size) => {
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
      const px = Math.max(extent / 2 + 5, Math.min(width - extent / 2 - 5, x));
      const py = y + (index - (lines.length - 1) / 2) * (fontSize + 3);
      pen.fillStyle = colors.paper;
      pen.fillRect(px - extent / 2 - 3, py - fontSize * .66, extent + 6, fontSize * 1.32);
      pen.fillStyle = colors[muted ? 'muted' : 'ink'];
      pen.fillText(content, px, py);
    }
  };
  const arrow = (first: Point, second: Point, weight = 1, muted = false) => {
    line(first, second, weight, muted);
    const length = Math.hypot(second.x - first.x, second.y - first.y);

    if (length < 4) return;

    const angle = Math.atan2(second.y - first.y, second.x - first.x);
    const head = tall ? 3 : 4;
    line(second, { x: second.x - head * Math.cos(angle - .4), y: second.y - head * Math.sin(angle - .4) }, weight, muted);
    line(second, { x: second.x - head * Math.cos(angle + .4), y: second.y - head * Math.sin(angle + .4) }, weight, muted);
  };
  const project = (point: Point): Point => ({ x: center.x + point.x * unit, y: center.y - point.y * unit });
  const matrixX = tall ? balance.x + balance.w / 2 : box.x + box.w / 2;
  const matrixY = tall ? balance.y + balance.h * .09 - 5 : box.y + box.h * .09;
  const metric = smooth(time, 58500, 60200) * (1 - smooth(time, 63800, 65500));
  const vertical = 1 / Math.sqrt(1 + 3 * metric);
  const blockAmount = smooth(time, 50500, 52000) * (1 - smooth(time, 57500, 58500));
  const orderTiles = time >= 54800 && time < 58500 || time >= 97000 && time < 104000;
  const showingSweep = time >= 22500 && time < 30000;

  if ((time < 50500 || time >= 58500) && !(tall && time >= 37000 && time < 44500)) {
    const movingMatrix = time >= 7000 && time < 15000 || time >= 89500 && time < 92000;

    if (movingMatrix) {
      const values = realEntries(matrix);
      const cell = tall ? 15 : 20;
      const matrixWidth = cell * 3.4;
      const top = matrixY - cell * .55;
      const left = matrixX - matrixWidth / 2;
      pen.font = `${tall ? 12 : 15}px Alegreya, serif`;
      pen.textAlign = 'center';
      pen.textBaseline = 'middle';
      pen.fillStyle = colors.ink;

      for (const [index, value] of values.entries()) {
        pen.fillText(value.toFixed(2), matrixX + (index % 2 === 0 ? -.9 : .9) * cell, matrixY + (index < 2 ? -.5 : .5) * cell);
      }

      line({ x: left + 4, y: top - cell * .3 }, { x: left, y: top - cell * .3 }, .8);
      line({ x: left, y: top - cell * .3 }, { x: left, y: top + cell * 1.9 }, .8);
      line({ x: left, y: top + cell * 1.9 }, { x: left + 4, y: top + cell * 1.9 }, .8);
      line({ x: left + matrixWidth - 4, y: top - cell * .3 }, { x: left + matrixWidth, y: top - cell * .3 }, .8);
      line({ x: left + matrixWidth, y: top - cell * .3 }, { x: left + matrixWidth, y: top + cell * 1.9 }, .8);
      line({ x: left + matrixWidth, y: top + cell * 1.9 }, { x: left + matrixWidth - 4, y: top + cell * 1.9 }, .8);
    } else if (!(tall && metric > .99)) label(time < 7000 ? 'matrix-d' : time < 92000 ? 'matrix-a' : 'matrix-e', matrixX, matrixY);
  }

  if (!orderTiles && !(tall && time >= 37000 && time < 44500)) words(blockAmount > .5 ? '2 × 2 COEFFICIENTS' : time >= 58500 && time < 65500 ? 'NEW LENGTH ONE' : 'VECTORS OF LENGTH ONE', center.x, box.y + (tall ? blockAmount > .5 ? 5 : 0 : box.h * .22), box.w, true, size);

  if (blockAmount < .99) {
    const move = blockAmount * box.w * (tall ? 1.2 : .65);
    pen.save();
    pen.beginPath();
    pen.rect(box.x, box.y, box.w, box.h);
    pen.clip();
    pen.translate(-move, 0);
    pen.beginPath();
    pen.ellipse(center.x, center.y, unit, unit * vertical, 0, 0, Math.PI * 2 * smooth(time, 0, 1800));
    pen.setLineDash([2, 3]);
    pen.lineWidth = .65;
    pen.strokeStyle = colors.muted;
    pen.stroke();
    pen.setLineDash([]);

    if (!showingSweep) {
      for (let index = 0; index < 24; index++) {
        const angle = index / 24 * Math.PI * 2;
        const input = { x: Math.cos(angle), y: Math.sin(angle) * vertical };
        const image = applyRealMatrix(matrix, input);
        const carrying = smooth(time, 1500 + index * 60, 4000 + index * 60);
        const tip = { x: mix(input.x, image.x, carrying), y: mix(input.y, image.y, carrying) };
        const growth = smooth(time, index * 35, 600 + index * 35);
        arrow(center, project({ x: tip.x * growth, y: tip.y * growth }), .55, true);
      }

      if (time >= 4500) {
        const input = metric > 0 ? { x: 0, y: vertical } : pair.input;
        const output = applyRealMatrix(matrix, input);
        pen.setLineDash([3, 3]);
        arrow(center, project(input), 1.1);
        pen.setLineDash([]);
        arrow(center, project(output), tall ? 1.8 : 2.2);

        if (time >= 15500 && time < 22500) {
          const inputTip = project(input);
          const outputTip = project(output);
          words('(0, 1)', inputTip.x - (tall ? 5 : 18), inputTip.y - (tall ? 9 : 15), 55, false, size);
          words('(2, 0)', outputTip.x + (tall ? 0 : 18), outputTip.y + (tall ? 12 : 17), 55, false, size);
        } else if (time >= 92000 && !tall) {
          const inputTip = project(input);
          words('x = (0.383, 0.924)', inputTip.x - 12, inputTip.y - 17, box.w * .7, false, 10);
        }
      }
    } else {
      const { theta, phi } = sweepAt(time);
      arrow(center, project({ x: Math.cos(theta), y: Math.sin(theta) }), 1.5);
      const wheel = { x: center.x + unit * 1.45, y: center.y + unit * .35 };
      const radius = unit * .42;
      pen.beginPath();
      pen.arc(wheel.x, wheel.y, radius, 0, Math.PI * 2);
      pen.lineWidth = .65;
      pen.strokeStyle = colors.ink;
      pen.stroke();
      arrow(wheel, { x: wheel.x + Math.cos(phi) * radius, y: wheel.y - Math.sin(phi) * radius }, .9);
      words('PHASE', wheel.x, wheel.y + radius + 9, 45, true, tall ? 8 : 9);
    }

    pen.restore();
  }

  if (blockAmount > .005 && time < 55300) {
    const gridCenter = {
      x: mix(matrixX, center.x, blockAmount) - smooth(time, 54800, 55300) * box.w,
      y: mix(matrixY, center.y, blockAmount),
    };
    const cell = mix(tall ? 8 : 13, tall ? 12 : 18, blockAmount);
    const values = [0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const left = gridCenter.x - cell * 2;
    const top = gridCenter.y - cell * 2;

    for (let row = 0; row < 2; row++) {
      for (let column = 0; column < 2; column++) {
        pen.strokeStyle = colors.muted;
        pen.lineWidth = .7;
        pen.strokeRect(left + column * cell * 2, top + row * cell * 2, cell * 2, cell * 2);
      }
    }

    pen.font = `${tall ? 10 : 13}px Alegreya, serif`;
    pen.textAlign = 'center';
    pen.textBaseline = 'middle';
    pen.fillStyle = colors.ink;

    for (const [index, value] of values.entries()) pen.fillText(String(value), left + (index % 4 + .5) * cell, top + (Math.floor(index / 4) + .5) * cell);

    if (time < 54800) {
      label('complete-evaluation', tall ? width * .5 : center.x, tall ? height * .41 : box.y + box.h * .20);
      if (!tall) words('2 × 2 COEFFICIENTS', gridCenter.x, gridCenter.y + cell * 2 + 18, box.w, false, size);
    }
  }

  if (orderTiles) {
    const proof = time >= 97000;
    const tileSize = tall ? 18 : 25;
    const firstX = box.x + box.w * (proof ? .17 : .23);
    const secondX = box.x + box.w * (proof ? .83 : .77);
    const tileY = box.y + box.h * (proof ? .15 : tall ? .21 : .30);
    const switching = smooth(time, 55800, 57000);
    const tile = (x: number, y: number, values: readonly number[]) => {
      pen.fillStyle = colors.paper;
      pen.fillRect(x - tileSize * .6, y - tileSize * .6, tileSize * 1.2, tileSize * 1.2);
      pen.strokeStyle = colors.ink;
      pen.lineWidth = .7;
      pen.strokeRect(x - tileSize * .6, y - tileSize * .6, tileSize * 1.2, tileSize * 1.2);
      pen.font = `${tall ? 9 : 12}px Alegreya, serif`;
      pen.textAlign = 'center';
      pen.textBaseline = 'middle';
      pen.fillStyle = colors.ink;

      for (const [index, value] of values.entries()) pen.fillText(String(value), x + (index % 2 === 0 ? -.3 : .3) * tileSize, y + (index < 2 ? -.3 : .3) * tileSize);
    };

    if (proof) {
      const progress = smooth(time, 97000, 98200);

      for (const [index, text] of ['FG', 'GF'].entries()) {
        const targetX = index === 0 ? firstX : secondX;
        const x = mix(box.x + box.w + tileSize, targetX, progress);
        pen.fillStyle = colors.paper;
        pen.fillRect(x - tileSize * .65, tileY - tileSize * .5, tileSize * 1.3, tileSize);
        pen.strokeStyle = colors.ink;
        pen.lineWidth = .8;
        pen.strokeRect(x - tileSize * .65, tileY - tileSize * .5, tileSize * 1.3, tileSize);
        words(text, x, tileY, tileSize * 1.3, false, size);
      }

      if (!tall) words('TESTED SEPARATELY\nNEVER EXCHANGED · SCHEMATIC', center.x, box.y + box.h * .94, box.w, false, size);
    } else {
      const entering = smooth(time, 54800, 55300);
      const carryFirst = mix(box.x + box.w + tileSize, mix(firstX, secondX, switching), entering);
      const carrySecond = mix(box.x + box.w + tileSize * 2, mix(secondX, firstX, switching), entering);
      tile(carryFirst, tileY - Math.sin(switching * Math.PI) * tileSize * .45, [0, 1, 0, 0]);
      tile(carrySecond, tileY + Math.sin(switching * Math.PI) * tileSize * .45, [0, 0, 1, 0]);
      tile((firstX + secondX) / 2, tileY + tileSize * 2, switching < .5 ? [1, 0, 0, 0] : [0, 0, 0, 1]);
      label('noncommuting', tall ? width * .5 : center.x, tall ? height * .41 : box.y + box.h * .95);

      if (switching < .15 || switching > .85) {
        words('B1', carryFirst, tileY - tileSize * .88, tileSize * 2, false, size);
        words('B2', carrySecond, tileY - tileSize * .88, tileSize * 2, false, size);
        words(switching < .5 ? 'B1B2' : 'B2B1', (firstX + secondX) / 2 - tileSize * 1.7, tileY + tileSize * 2, tileSize * 2, false, size);
      }
    }
  }

  if (metric > .99) {
    label('paulsen', matrixX, matrixY + (tall ? 0 : 35));

    if (!tall) words('CONDITION NUMBER 2\nCOMPUTED FOR THIS EXAMPLE', center.x, box.y + box.h * .90, box.w, false, size);
  }

  if (blockAmount < .05 && !showingSweep && !(time >= 97000 && time < 104000 && !tall) && !(tall && time >= 37000 && metric <= 0)) {
    const norm = metric > 0 ? 2 * vertical : pair.norm;
    const name = metric > 0 ? 'NEW NORM' : time < 7000 ? '‖D‖' : time < 15000 ? 'NORM' : time < 89500 ? '‖A‖' : time < 92000 ? 'NORM' : '‖E‖';
    words(`${name} = ${numberText(norm)}`, center.x, box.y + box.h * (tall ? metric > 0 ? .78 : .97 : .91), box.w, false, tall ? 10 : 12);
  }

  if (time < 37000) return;

  if (time < 44500) label('scalar-bound', tall ? width * .5 : center.x, tall ? height * .415 : balance.y - 13);

  const fill = smooth(time, 44500, 46700);
  const leftValue = operatorNorm(matrix);
  const rightValue = 2 * Math.sqrt(1 + ellipseParameter(time) ** 2);
  const barWidth = balance.w * (tall ? .85 : .63);
  const barStart = balance.x + balance.w * (tall ? .07 : .32);
  const firstY = balance.y + balance.h * (tall ? .54 : .25);
  const secondY = balance.y + balance.h * (tall ? .84 : .85);
  const bar = (value: number, y: number, text: string) => {
    const extent = barWidth * value / 3;
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .6;
    pen.strokeRect(barStart, y, barWidth, tall ? 4 : 6);
    pen.fillStyle = colors.ink;
    pen.fillRect(barStart, y, extent * fill, tall ? 4 : 6);
    const side = `${metric > 0 ? 'OLD ' : ''}${text.startsWith('LEFT') ? 'LEFT' : 'RIGHT'}`;
    const caption = tall && fill > .99 ? `${side}: ${numberText(value)}` : text;
    words(caption, tall ? balance.x + balance.w / 2 : balance.x + balance.w * .14, tall ? y - 8 : y + 3, tall ? balance.w + 3 : balance.w * .28, false, tall ? 9 : 10);

    if (fill > .99 && !tall) words(numberText(value), barStart + extent + 18, y + 3, 40, false, 11);
  };
  bar(leftValue, firstY, time >= 50500 && time < 58500 ? 'LEFT: ‖P[A]‖' : 'LEFT: ‖p(A)‖');
  bar(rightValue, secondY, 'RIGHT: 2 × MAX');

  if (!tall) words(time >= 58500 && time < 65500 ? 'p(z) = z · ORIGINAL NORM' : time < 89500 ? 'p(z) = z · EQUAL' : 'p(z) = z · BELOW, WITH ROOM', balance.x + balance.w * .62, balance.y + balance.h + 9, balance.w * .9, false, 10);
}

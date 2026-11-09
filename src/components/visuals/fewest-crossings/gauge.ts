import { Z, type GraphState } from './math';
import { layout, smooth } from './story';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type Point = { x: number; y: number };

type Label = (id: string, x: number, y: number, opacity?: number) => void;

const COMPLETE_RATIO = .98559895;

const BRICK_RATIO = .9118;

function mix(first: number, second: number, amount: number): number {
  return first + (second - first) * amount;
}

export function tallyTarget(width: number, height: number): Point {
  const { tally, tall } = layout(width, height);

  return { x: tally.x + tally.w / 2, y: tally.y + (tall ? 0 : tally.h * .17) };
}

export function drawGauge(pen: CanvasRenderingContext2D, width: number, height: number, time: number, colors: Colors, label: Label, state: GraphState): void {
  const { tally, gauge, tall } = layout(width, height);
  const target = tallyTarget(width, height);
  const size = tall ? 8 : 10;
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
  const line = (first: Point, second: Point, tone: keyof Colors = 'ink', weight = .8, progress = 1) => {
    if (progress <= 0) return;

    pen.beginPath();
    pen.moveTo(first.x, first.y);
    pen.lineTo(mix(first.x, second.x, Math.min(1, progress)), mix(first.y, second.y, Math.min(1, progress)));
    pen.strokeStyle = colors[tone];
    pen.lineWidth = weight;
    pen.stroke();
  };

  let signedCount = 0;
  let signedSum = 0;

  for (const [index, crossing] of state.signed.entries()) {
    if (time >= 83500 + index * 1100) {
      signedCount++;
      signedSum += crossing.sign;
    }
  }

  if (tall) {
    const comparison = state.complete && state.n >= 3 && time >= 37500 ? ` · Z(${state.n}) = ${Z(state.n)}` : '';
    const signedText = signedCount > 0 && time < 89000 ? ` · ${time >= 87500 ? 'SIGNED SUM' : 'SIGNED SO FAR'} ${signedSum}` : comparison;
    words(`CROSSINGS ${state.count}${signedText}`, target.x, target.y, tally.w, 'ink', time >= 83500 && time < 89000 ? 9 : 10);
  } else {
    words('CROSSINGS IN THIS DRAWING', target.x, tally.y, tally.w, 'ink', 11);
    words(String(state.count), target.x, target.y, tally.w, 'ink', 36);
  }

  if (time >= 15000 && time < 23000) {
    if (tall) {
      label('brick-example', target.x, tally.y + 24);
      label('brick-definition', target.x, tally.y + 44);
    } else {
      label('brick-formula', target.x, tally.y + tally.h * .38);
      label('brick-example', target.x, tally.y + tally.h * .56);
      label('brick-definition', target.x, tally.y + tally.h * .76);
    }
  }

  if (time >= 37500) {
    const formulaOnly = tall && time < 44000;

    if (time < 44000) {
      if (tall) {
        label('z-formula-top', target.x, tally.y + 22);
        label('z-formula-bottom', target.x, tally.y + 46);
      } else label('z-formula-wide', target.x, tally.y + tally.h * .80);
    }

    if (!formulaOnly) {
      for (let index = 0; index < 10; index++) {
        const n = index + 3;
        const columns = tall ? 5 : 10;
        const column = index % columns;
        const row = Math.floor(index / columns);
        const cellWidth = tally.w / columns;
        const x = tally.x + (column + .5) * cellWidth;
        const y = tall ? tally.y + 14 + row * 20 : tally.y + tally.h * .48;
        const matches = state.complete && state.n === n && state.count === Z(n);

        if (matches) {
          pen.strokeStyle = colors.ink;
          pen.lineWidth = .9;
          pen.strokeRect(x - cellWidth * .45, y - 5, cellWidth * .90, tall ? 18 : 30);
        }

        words(String(n), x, y, cellWidth, 'muted', tall ? 7 : 9);
        words(String(Z(n)), x, y + (tall ? 9 : 16), cellWidth, 'ink', tall ? 9 : 12);
      }
    }
  }

  if (time >= 82000 && time < 89000) {
    if (!tall && signedCount > 0) words(`${time >= 87500 ? 'SIGNED SUM' : 'SIGNED SO FAR'}: ${signedSum}`, target.x, tally.y + tally.h * .31, tally.w, 'ink', 11);
  }

  if (time < 15000) return;

  const claimed = time >= 74500;
  const claimProgress = smooth(time, 74500, 76800);
  const ratioLeft = gauge.x + gauge.w * (tall ? .58 : .52);
  const ratioRight = gauge.x + gauge.w * .97;
  const ratioAt = (value: number) => ratioLeft + (value - .8) / .2 * (ratioRight - ratioLeft);
  const caseLeft = gauge.x + gauge.w * .24;
  const caseRight = gauge.x + gauge.w * .47;
  const completeY = gauge.y + (tall ? 23 : gauge.h * .40);
  const brickY = tall ? completeY + 28 : gauge.y + gauge.h * .75;
  const namesX = gauge.x + gauge.w * .09;

  if (!(tall && time >= 37500 && time < 44000)) words(claimed ? time >= 97000 ? 'UNREVIEWED · CLAIMED FOR ALL DRAWINGS' : 'CLAIMED FOR ALL DRAWINGS' : tall ? 'PROVED · SMALL CASES | LARGE n RATIOS' : 'PROVED: NO DRAWING DOES BETTER', gauge.x + gauge.w / 2, gauge.y, gauge.w, claimed ? 'blue' : 'ink', tall ? 8 : 11);

  if (!tall) {
    words('SMALL CASES', (caseLeft + caseRight) / 2, gauge.y + gauge.h * .18, gauge.w * .45, 'muted', 9);
    words('LARGE n · RATIO TO FORMULA', (ratioLeft + ratioRight) / 2, gauge.y + gauge.h * .18, gauge.w * .49, 'muted', 9);
  }

  const lane = (y: number, name: string, available: boolean) => {
    if (!available) return;

    words(name, namesX, y, gauge.w * .22, 'ink', size);
    line({ x: ratioLeft, y }, { x: ratioRight, y }, 'muted', .65);

    for (const value of [.8, 1]) line({ x: ratioAt(value), y: y - 3 }, { x: ratioAt(value), y: y + 3 }, 'muted', .65);

    pen.setLineDash([2, 3]);
    line({ x: ratioRight, y: y - 8 }, { x: ratioRight, y: y + 8 }, 'muted', .7);
    pen.setLineDash([]);
  };
  lane(completeY, 'COMPLETE', time >= 37500);
  lane(brickY, 'BRICKYARD', true);

  if (time >= 51000) {
    line({ x: caseLeft, y: completeY }, { x: caseRight + (tall ? 7 : 12), y: completeY }, 'muted', .6);

    for (let n = 3; n <= 12; n++) {
      const x = caseLeft + (n - 3) / 9 * (caseRight - caseLeft);
      line({ x, y: completeY - 4 }, { x, y: completeY + 4 }, 'ink', 1, smooth(time, 51000 + (n - 3) * 90, 51600 + (n - 3) * 90));
    }

    const reportedX = caseRight + (tall ? 7 : 12);
    pen.beginPath();
    pen.arc(reportedX, completeY, tall ? 2 : 3, 0, Math.PI * 2);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .7;
    pen.stroke();
    words(tall ? '13 REPORTED' : 'UP TO 12 PROVED · 13 REPORTED', (caseLeft + caseRight) / 2, completeY - (tall ? 10 : 18), gauge.w * .28, 'ink', tall ? 6.5 : 9);
    words('3', caseLeft, completeY + (tall ? 10 : 15), 15, 'muted', tall ? 6 : 8);
    words('12', caseRight - (tall ? 5 : 7), completeY + (tall ? 10 : 15), 18, 'muted', tall ? 6 : 8);
    words('13', reportedX + (tall ? 3 : 4), completeY + (tall ? 10 : 15), 18, 'muted', tall ? 6 : 8);
  }

  if (time >= 59000) {
    words('ONE SIDE ≤ 6', (caseLeft + caseRight) / 2, brickY - (tall ? 10 : 18), gauge.w * .29, 'ink', tall ? 6.5 : 9);
    line({ x: caseLeft, y: brickY }, { x: caseRight, y: brickY }, 'ink', 1.5, smooth(time, 59000, 60600));
    words('7,7 · 7,9', (caseLeft + caseRight) / 2, brickY + (tall ? 10 : 17), gauge.w * .30, 'ink', tall ? 6.5 : 9);
  }

  const mark = (historical: number, y: number, text: string, start: number) => {
    if (time < start) return;

    const proof = mix(.8, historical, smooth(time, start, start + 2200));
    const current = mix(proof, 1, claimProgress);
    const x = ratioAt(current);
    pen.setLineDash(claimed ? [3, 2] : []);
    line({ x, y: y - 8 }, { x, y: y + 8 }, claimed ? 'blue' : 'ink', 1.8);
    pen.setLineDash([]);

    if (claimed) {
      const oldX = ratioAt(historical);
      pen.globalAlpha = .30;
      line({ x: oldX, y: y - 7 }, { x: oldX, y: y + 7 }, 'ink', .8);
      line({ x: oldX, y }, { x, y }, 'ink', .6);
      pen.globalAlpha = 1;
      words('1', ratioRight - 2, y - (tall ? 11 : 19), 18, 'blue', tall ? 8 : 11);
    } else {
      const labelX = current > .97 ? x - (tall ? 18 : 25) : x;
      const labelY = y - (tall ? 11 : 19);
      line({ x, y: y - 5 }, { x: labelX, y: labelY + 3 }, 'muted', .6);
      words(smooth(time, start, start + 2200) > .99 ? text : 'RISING', labelX, labelY, gauge.w * .45, 'ink', tall ? 7 : 10);
    }
  };
  mark(COMPLETE_RATIO, completeY, '0.98559895', 51000);
  mark(BRICK_RATIO, brickY, tall ? '0.9118 · n,n' : '0.9118 · K(n,n)', 59000);

  if (time >= 37500) {
    const footerY = brickY + (tall ? 11 : 22);

    for (const value of [.8, .9, 1]) words(value === 1 ? '1' : value.toFixed(1), ratioAt(value), footerY, 25, 'muted', tall ? 6.5 : 9);
  }

  if (!tall) {
    const note = time < 37500 ? 'BRICKYARD FORMULA CONJECTURED · 1955' : time < 51000 ? 'COMPLETE FORMULA CONJECTURED · 1963' : time < 59000 ? 'PAN–RICHTER, 2007 · 13 REPORTED, 2021' : time < 66000 ? 'KLEITMAN, 1970 · WOODALL, 1993' : time < 74500 ? 'SPECIAL DRAWINGS SETTLED; GENERAL ROUTES OPEN' : time < 97000 ? 'CLAIMED · 23 SEPTEMBER 2026 · ANY CURVES' : 'LEAN STATEMENTS · NO OUTSIDE REPLAY';
    words(note, gauge.x + gauge.w / 2, gauge.y + gauge.h * .96, gauge.w, claimed ? 'blue' : 'ink', 9);
  }
}

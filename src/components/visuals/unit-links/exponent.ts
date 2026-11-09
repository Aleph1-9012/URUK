import { UNIT_JUMPS } from './math';
import { layout, smooth, span } from './story';

type Colors = { ink: string; blue: string; muted: string; paper: string };

type Tone = keyof Colors;

type Point = { x: number; y: number };

type Label = (id: string, x: number, y: number, opacity?: number) => void;

export interface JumpDial {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
}

const JUMP_ANGLES = UNIT_JUMPS.map(point => Math.atan2(point.y, point.x)).sort((a, b) => a - b);

const FIRST_ANGLE = Math.atan2(4, 3);

function jumpAngle(time: number): number {
  if (time < 88500 || time >= 92500) return FIRST_ANGLE;

  const startIndex = JUMP_ANGLES.findIndex(angle => Math.abs(angle - FIRST_ANGLE) < 1e-10);
  const step = span(time, 88500, 92300) * 12;
  const index = Math.floor(step);
  const firstIndex = (startIndex + index) % JUMP_ANGLES.length;
  const secondIndex = (firstIndex + 1) % JUMP_ANGLES.length;
  const first = JUMP_ANGLES[firstIndex] ?? FIRST_ANGLE;
  let second = JUMP_ANGLES[secondIndex] ?? FIRST_ANGLE;

  if (second <= first) second += Math.PI * 2;

  const amount = Math.min(1, (step - index) * 2.5);
  const eased = amount * amount * (3 - 2 * amount);

  return first + (second - first) * eased;
}

export function jumpDialAt(width: number, height: number, time: number): JumpDial {
  const { exponent, tall } = layout(width, height);
  const angle = jumpAngle(time);

  return {
    x: exponent.x + exponent.w * .5,
    y: exponent.y + exponent.h * (tall ? .25 : .29),
    radius: Math.min(width * .10, exponent.h * .20),
    dx: Math.cos(angle),
    dy: Math.sin(angle),
  };
}

export function drawExponent(pen: CanvasRenderingContext2D, width: number, height: number, time: number, colors: Colors, label: Label): void {
  const { exponent: box, tall } = layout(width, height);
  const axisY = box.y + box.h * (tall ? .67 : .72);
  const axisLeft = box.x + box.w * .035;
  const axisWidth = box.w * .93;
  const at = (value: number) => axisLeft + (value - 1) * 2 * axisWidth;
  const axisRight = at(1.5);
  const size = tall ? 10 : 11;
  const line = (a: Point, b: Point, tone: Tone = 'ink', weight = 1, progress = 1) => {
    if (progress <= 0) return;

    pen.strokeStyle = colors[tone];
    pen.lineWidth = weight;
    pen.beginPath();
    pen.moveTo(a.x, a.y);
    pen.lineTo(a.x + (b.x - a.x) * Math.min(1, progress), a.y + (b.y - a.y) * Math.min(1, progress));
    pen.stroke();
  };
  const words = (text: string, x: number, y: number, maxWidth: number, tone: Tone = 'ink', fontSize = size) => {
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
      pen.fillRect(px - extent / 2 - 3, py - fontSize * .65, extent + 6, fontSize * 1.3);
      pen.fillStyle = colors[tone];
      pen.fillText(content, px, py);
    }
  };
  const arrow = (from: Point, to: Point, tone: Tone = 'ink', progress = 1) => {
    const end = { x: from.x + (to.x - from.x) * progress, y: from.y + (to.y - from.y) * progress };
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const head = tall ? 5 : 6;
    line(from, end, tone, 1.3);

    if (progress > .05) {
      line(end, { x: end.x - head * Math.cos(angle - .45), y: end.y - head * Math.sin(angle - .45) }, tone, 1.3);
      line(end, { x: end.x - head * Math.cos(angle + .45), y: end.y - head * Math.sin(angle + .45) }, tone, 1.3);
    }
  };
  const center = box.x + box.w / 2;
  const proofDial = time >= 85500 && time < 101500;
  const headingY = box.y + (tall ? 0 : box.h * .015);

  const heading = proofDial && tall ? time < 92500 ? 'JUMPS IN TWO COORDINATES' : 'AN EXAMPLE RATIO OF TWO JUMPS' : tall ? 'THE MOST LINKS GROW LIKE n TO A POWER' : 'THE MOST LINKS GROW LIKE\nn TO THE POWER...';
  words(heading, center, headingY - (proofDial && tall ? 6 : 0), box.w, 'ink', tall ? 9 : 11);
  line({ x: axisLeft, y: axisY }, { x: axisRight, y: axisY }, 'muted', .8, smooth(time, 0, 1200));

  for (const value of [1, 1.5]) {
    line({ x: at(value), y: axisY - 3 }, { x: at(value), y: axisY + 3 }, 'muted', .8);
    words(value === 1 ? '1' : '3/2', at(value), axisY + 13, 35, 'muted', size);
  }

  if (time >= 40500) {
    line({ x: at(4 / 3), y: axisY - 3 }, { x: at(4 / 3), y: axisY + 3 }, 'muted', .8);
    words('4/3', at(4 / 3), axisY + 13, 35, 'muted', size);
  }

  if (time < 23500) {
    words('CONSTRUCTIONS PUSH RIGHT\nCAPS PUSH LEFT', center, box.y + box.h * .35, box.w * .9, 'muted', size);

    return;
  }

  const mayMove = smooth(time, 61500, 63300);
  const lowerX = at(1 + .014 * mayMove);
  line({ x: lowerX, y: axisY - 9 }, { x: lowerX, y: axisY + 7 }, 'ink', 1.4);

  if (time >= 61500) {
    const labelX = axisLeft + Math.max(44, axisWidth * .16);
    const labelY = axisY - (tall ? 16 : 23);
    line({ x: lowerX, y: axisY - 6 }, { x: labelX - 12, y: labelY }, 'muted', .65);
    words(mayMove > .99 ? '1.014' : 'POSSIBLE', labelX, labelY, 55, 'ink', size);
  } else words('POSSIBLE', axisLeft + (tall ? 28 : 35), axisY - 17, 80, 'ink', size);

  if (time < 32000) {
    const nearingOne = smooth(time, 24500, 29500);
    const start = axisLeft + axisWidth * (.30 - .19 * nearingOne);
    arrow({ x: start, y: axisY - 8 }, { x: axisLeft + 5, y: axisY - 8 });
    words('BARELY ABOVE 1 · SCHEMATIC', center, box.y + box.h * (tall ? .28 : .19), box.w, 'ink', size);
    label(time < 27500 ? 'exp-erdos' : 'exp-guess', center, box.y + box.h * (tall ? .43 : .37));

    if (!tall) words(time < 27500 ? "ERDŐS'S CONSTRUCTION" : "ERDŐS'S GUESS · $500", center, box.y + box.h * .49, box.w, 'ink', size);

    return;
  }

  const capProgress = smooth(time, 40500, 42500);
  const upperX = at(1.5 - capProgress / 6);
  const capHeight = 10 * smooth(time, 32000, 33400);
  line({ x: upperX, y: axisY - capHeight }, { x: upperX, y: axisY + capHeight }, 'ink', 1.5);

  if (time >= 40500) {
    pen.globalAlpha = .25;
    line({ x: axisRight, y: axisY - 8 }, { x: axisRight, y: axisY + 8 }, 'muted', 1);
    line({ x: axisRight, y: axisY - 12 }, { x: upperX, y: axisY - 12 }, 'muted', .7);
    pen.globalAlpha = 1;
  }

  const bracketY = axisY + (tall ? 32 : 45);
  const bracketRight = time >= 68500 ? at(4 / 3) : upperX;
  line({ x: lowerX, y: bracketY - 4 }, { x: lowerX, y: bracketY }, 'ink', .8);
  const uncertainLength = tall ? 24 : 36;
  line({ x: lowerX, y: bracketY }, { x: time >= 68500 ? bracketRight - uncertainLength : bracketRight, y: bracketY }, 'ink', .8);

  if (time < 68500) line({ x: bracketRight, y: bracketY }, { x: bracketRight, y: bracketY - 4 }, 'ink', .8);
  else {
    pen.setLineDash([3, 3]);
    line({ x: bracketRight - uncertainLength, y: bracketY }, { x: bracketRight, y: bracketY }, 'blue', 1.2);
    pen.setLineDash([]);
  }

  words('WHERE THE TRUTH LIES', (lowerX + bracketRight) / 2, bracketY + (tall ? 13 : 16), box.w, 'muted', tall ? 9 : 10);

  if (time >= 68500) {
    const claimProgress = smooth(time, 68500, 70500);
    const from = { x: at(4 / 3), y: axisY - (tall ? 10 : 17) };
    // The arrow's length is typographic. It has no exponent coordinate or endpoint tick.
    const to = { x: from.x - Math.min(tall ? 48 : 66, axisWidth * .28), y: from.y };
    pen.setLineDash([4, 3]);
    arrow(from, to, 'blue', claimProgress);
    pen.setLineDash([]);
  }

  if (time >= 76500 && time < 101500) {
    const ghostX = at(4 / 3);
    const ghostY = axisY - (tall ? 12 : 20);
    pen.globalAlpha = .38;
    line({ x: ghostX, y: ghostY - 8 }, { x: ghostX, y: ghostY + 8 }, 'ink', 1);
    pen.globalAlpha = 1;

    if (time >= 97500) {
      line({ x: ghostX - 6, y: ghostY - 5 }, { x: ghostX + 6, y: ghostY + 5 }, 'blue', 1.3, smooth(time, 97500, 98300));
      line({ x: ghostX - 6, y: ghostY + 5 }, { x: ghostX + 6, y: ghostY - 5 }, 'blue', 1.3, smooth(time, 97800, 98600));
    }
  }

  if (proofDial) {
    const dial = jumpDialAt(width, height, time);
    const radius = dial.radius * smooth(time, 85500, 87200);
    pen.beginPath();
    pen.arc(dial.x, dial.y, radius, 0, Math.PI * 2 * smooth(time, 85500, 87200));
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .8;
    pen.stroke();

    for (const jump of UNIT_JUMPS) {
      const end = { x: dial.x + jump.x * radius, y: dial.y - jump.y * radius };
      line({ x: dial.x + jump.x * (radius - 2), y: dial.y - jump.y * (radius - 2) }, { x: end.x + jump.x * 2, y: end.y - jump.y * 2 }, 'muted', .6);
    }

    line({ x: dial.x - radius - 3, y: dial.y }, { x: dial.x + radius + 3, y: dial.y }, 'muted', .5);
    line({ x: dial.x, y: dial.y - radius - 3 }, { x: dial.x, y: dial.y + radius + 3 }, 'muted', .5);

    if (time < 88500) {
      const forwardLabelX = dial.x - dial.radius - (tall ? 45 : 58);
      const reciprocalLabelX = dial.x + dial.radius + (tall ? 45 : 58);
      words('z = x + iy', forwardLabelX, dial.y - (tall ? 17 : 30), tall ? 86 : 110, 'ink', tall ? 9 : 10);
      words('w = x − iy', reciprocalLabelX, dial.y - (tall ? 17 : 30), tall ? 86 : 110, 'ink', tall ? 9 : 10);
      label('jump-forward', forwardLabelX, dial.y + (tall ? 6 : -8));
      label('jump-reciprocal', reciprocalLabelX, dial.y + (tall ? 6 : 8));
    }

    if (time >= 87200 && time < 92500) {
      const forward = { x: dial.x + radius * dial.dx, y: dial.y - radius * dial.dy };
      const reciprocal = { x: forward.x, y: dial.y + radius * dial.dy };
      arrow(dial, forward, 'blue', smooth(time, 87200, 87700));
      arrow(dial, reciprocal, 'ink', smooth(time, 87500, 88000));

      if (time >= 88500) {
        words('d', forward.x + (forward.x < dial.x ? -10 : 10), forward.y - 7, 20, 'blue', size);
        words('1/d', reciprocal.x + (reciprocal.x < dial.x ? -12 : 12), reciprocal.y + 7, 28, 'ink', size);
      }
    } else if (time >= 92500) {
      const ratioX = 24 / 25;
      const ratioY = 7 / 25;
      arrow(dial, { x: dial.x + radius * ratioX, y: dial.y - radius * ratioY }, 'blue', smooth(time, 92500, 93500));
      label('jump-ratio', dial.x + (tall ? -radius - 45 : radius + 55), dial.y);

      if (tall) words('EXAMPLE', dial.x + radius + 41, dial.y, 65, 'ink', 9);

      if (!tall) words('ONE EXACT EXAMPLE', dial.x, dial.y + radius + 20, box.w, 'ink', size);
    }

    return;
  }

  const tagY = box.y + box.h * (tall ? .29 : .20);
  const formulaY = box.y + box.h * (tall ? .43 : .38);

  if (time < 40500) {
    words('AT MOST ABOUT', center, tagY, box.w);
    label('exp-three-halves', center, formulaY);
  } else if (time < 47500) {
    words(tall ? '1984 · THE CAP IS LOWERED' : 'SPENCER, SZEMERÉDI\nAND TROTTER · 1984', center, tagY, box.w);
    label('exp-four-thirds', center, formulaY);
  } else if (time < 56000) {
    words("REACHED IN VALTR'S NORM", center, tagY, box.w);
    label('exp-four-thirds', center, formulaY);
  } else if (time < 61500) {
    words('A ROUND-CIRCLE FEATURE\nMUST BE USED', center, tagY, box.w);
    label('exp-four-thirds', center, formulaY);
  } else if (time < 68500) {
    words(tall ? 'MAY 2026 · A CONSTRUCTION' : 'SAWIN · MAY 2026\nALONG A SEQUENCE', center, tagY, box.w);
    label('exp-may', center, formulaY);

    if (!tall) words("ERDŐS'S GUESS DISPROVED\nCHECKED BY ALON AND EIGHT OTHERS", center, box.y + box.h * .50, box.w);
  } else if (time < 76500) words('CLAIMED · 23 SEP 2026\nHOW MUCH: NOT GIVEN', center, tagY + (tall ? 5 : 0), box.w, 'blue');
  else if (time < 85500) words('ASSUME THE 4/3 CAP CANNOT DROP\nHOW THE CLAIMED PROOF GOES', center, tagY + (tall ? 5 : 0), box.w);
  else {
    words('UNREVIEWED', center, tagY, box.w, 'blue', tall ? 11 : 13);
    words(tall ? 'CLAIMED · NO VALUE GIVEN' : 'FIXED AMOUNT BELOW 4/3\nNO VALUE IS GIVEN', center, formulaY, box.w, 'blue', tall ? 9 : size);

    if (!tall) words("MAY'S CHECK IS A DIFFERENT PROOF", center, box.y + box.h * .50, box.w);
  }
}

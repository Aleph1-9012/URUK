import { PALETTE, type Point, type Pigment } from './math';

type Ink = { ink: string; blue: string; muted: string; paper: string };

type Label = (id: string, x: number, y: number, opacity?: number) => void;

type Box = { x: number; y: number; w: number; h: number };

function ease(time: number, start: number, end: number): number {
  const amount = Math.max(0, Math.min(1, (time - start) / (end - start)));

  return amount * amount * (3 - 2 * amount);
}

function shelfShift(width: number, height: number, time: number): number {
  if (height <= width) return 0;

  const page = ease(time, 44500, 46700) + ease(time, 50500, 52300) + ease(time, 53500, 55500);

  return (page * width * .95 + ease(time, 95500, 97500) * width) * (1 - ease(time, 115000, 117000));
}

function cardBox(index: number, width: number, height: number, time: number): Box {
  const tall = height > width;

  if (tall) {
    const x = time >= 115000
      ? width * .12 + width * (1 - ease(time, 117000, 118500))
      : width * .12 + index * width * .95 - shelfShift(width, height, time);

    return { x, y: height * .81, w: width * .76, h: height * .15 };
  }

  return { x: width * (.65 + index % 2 * .165), y: height * (.36 + Math.floor(index / 2) * .21), w: width * .145, h: height * .18 };
}

// x,y are the hinge in canvas pixels; mathematical y points upwards.
export function spindleCardPose(width: number, height: number, time = 34000): { x: number; y: number; unit: number } {
  const box = cardBox(0, width, height, time);
  const tall = height > width;
  if (tall) {
    const unit = Math.min(box.w * .25 / Math.sqrt(3), (box.h - 12) / 1.65);

    return { x: box.x + box.w * .68, y: box.y + box.h * .5 + unit * .31, unit };
  }

  const unit = Math.min(box.w / 2.5, box.h / 3.2);

  return { x: box.x + box.w / 2 - Math.sqrt(3) * unit / 2, y: box.y + box.h * .48 + unit * .3, unit };
}

const cssCache = new WeakMap<HTMLCanvasElement, { width: number; height: number; pigments: readonly string[] }>();

function canvasPigments(pen: CanvasRenderingContext2D): readonly string[] {
  const cached = cssCache.get(pen.canvas);

  if (cached?.width === pen.canvas.width && cached.height === pen.canvas.height) return cached.pigments;

  const style = getComputedStyle(pen.canvas);
  const pigments = PALETTE.map(color => style.getPropertyValue(`--five-${color.id}`).trim() || color.hex);
  cssCache.set(pen.canvas, { width: pen.canvas.width, height: pen.canvas.height, pigments });

  return pigments;
}

export function drawColourLedger(pen: CanvasRenderingContext2D, width: number, height: number, time: number, colors: Ink, label: Label): void {
  const tall = height > width;
  const pigments = canvasPigments(pen);
  const left = width * (tall ? .08 : .65);
  const right = width * (tall ? .92 : .96);
  const span = right - left;
  const middle = (left + right) / 2;
  const step = span / 7;
  const slotSize = Math.min(step - (tall ? 5 : 7), tall ? 27 : 37);
  const slotY = height * (tall ? .74 : .25);
  const bracketY = height * (tall ? .70 : .18);
  const titleY = height * (tall ? .64 : .095);
  const lift = ease(time, 96000, 99000) * (1 - ease(time, 115000, 117000));
  const pentagonCenter = { x: middle, y: height * (tall ? .84 : .74) };
  const radius = Math.min(span * .34, height * (tall ? .10 : .16));
  const at = (id: number): Point => {
    const start = { x: left + (id - .5) * step, y: slotY };

    if (id > 5) return start;

    const angle = -Math.PI / 2 + (id - 1) * 2 * Math.PI / 5;
    const target = { x: pentagonCenter.x + Math.cos(angle) * radius, y: pentagonCenter.y + Math.sin(angle) * radius };

    return { x: start.x + (target.x - start.x) * lift, y: start.y + (target.y - start.y) * lift };
  };
  const line = (points: readonly Point[], tone: keyof Ink = 'ink', alpha = 1, weight = 1) => {
    if (alpha <= 0 || points.length < 2) return;

    pen.globalAlpha = alpha;
    pen.strokeStyle = colors[tone];
    pen.lineWidth = weight;
    pen.beginPath();

    for (const [index, point] of points.entries()) {
      if (index === 0) pen.moveTo(point.x, point.y);
      else pen.lineTo(point.x, point.y);
    }

    pen.stroke();
    pen.globalAlpha = 1;
  };
  const words = (text: string, x: number, y: number, maxWidth: number, tone: keyof Ink = 'ink', size = tall ? 10 : 11) => {
    pen.font = `${size}px "Special Elite", monospace`;
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
      const cx = x;
      const cy = y + (index - (lines.length - 1) / 2) * (size + 3);
      pen.fillStyle = colors.paper;
      pen.fillRect(cx - extent / 2 - 2, cy - size * .65, extent + 4, size * 1.3);
      pen.fillStyle = colors[tone];
      pen.fillText(content, cx, cy);
    }
  };
  const pattern = (box: Box, color: Pigment) => {
    const pitch = tall ? 5 : 6;
    pen.save();
    pen.beginPath();
    pen.rect(box.x, box.y, box.w, box.h);
    pen.clip();
    pen.globalAlpha = .65;
    pen.strokeStyle = colors.ink;
    pen.fillStyle = colors.ink;
    pen.lineWidth = .5;
    pen.beginPath();

    if (color.pattern === 'h' || color.pattern === 'x') {
      for (let y = Math.floor(box.y / pitch) * pitch; y < box.y + box.h; y += pitch) {
        pen.moveTo(box.x, y);
        pen.lineTo(box.x + box.w, y);
      }
    }

    if (color.pattern === 'v' || color.pattern === 'x') {
      for (let x = Math.floor(box.x / pitch) * pitch; x < box.x + box.w; x += pitch) {
        pen.moveTo(x, box.y);
        pen.lineTo(x, box.y + box.h);
      }
    }

    if (color.pattern === 'd' || color.pattern === 'a') {
      const sign = color.pattern === 'd' ? -1 : 1;

      for (let x = Math.floor((box.x - box.h) / pitch) * pitch; x < box.x + box.w + box.h; x += pitch) {
        pen.moveTo(x, box.y);
        pen.lineTo(x + sign * box.h, box.y + box.h);
      }
    }

    pen.stroke();

    if (color.pattern === 'o') {
      for (let y = Math.floor(box.y / pitch) * pitch; y < box.y + box.h; y += pitch) {
        for (let x = Math.floor(box.x / pitch) * pitch; x < box.x + box.w; x += pitch) {
          pen.beginPath();
          pen.arc(x, y, .8, 0, Math.PI * 2);
          pen.fill();
        }
      }
    }

    pen.restore();
  };

  const minimum = 1 + 2 * ease(time, 9000, 12000) + ease(time, 28500, 32000) + ease(time, 44500, 48000) + ease(time, 53500, 57000);
  const knownUpper = time >= 34000;
  const claim = time >= 53500;
  const lowerX = left + (minimum - .5) * step;
  const upperX = left + 6.5 * step;
  const bracketVisible = ease(time, 9200, 11000);
  pen.setLineDash(claim ? [4, 3] : []);
  line([{ x: lowerX, y: bracketY + 5 }, { x: lowerX, y: bracketY }, { x: upperX, y: bracketY }, { x: upperX, y: bracketY + (knownUpper ? 5 : 0) }], claim ? 'blue' : 'ink', bracketVisible, 1.1);
  pen.setLineDash([]);

  if (!knownUpper) line([{ x: upperX - 5, y: bracketY - 4 }, { x: upperX, y: bracketY }, { x: upperX - 5, y: bracketY + 4 }], 'ink', bracketVisible);

  const heading = time < 9000 ? 'HOW FEW COLOURS?' : time < 25500 ? 'AT LEAST 3' : time < 34000 ? 'AT LEAST 4 · NELSON 1950' : time < 44500 ? '4, 5, 6 OR 7 · ISBELL 1950' : time < 53500 ? 'AT LEAST 5 · DE GREY 2018' : time < 115000 ? 'CLAIMED: 6 OR 7' : 'UNDER REVIEW: 6 OR 7';
  words(heading, middle, titleY, span + 15, claim ? 'blue' : 'ink');

  if (lift > 0) {
    let edgeIndex = 0;

    for (let from = 1; from <= 5; from++) {
      for (let to = from + 1; to <= 5; to++) {
        const a = at(from);
        const b = at(to);
        const progress = ease(time, 98000 + edgeIndex * 150, 98900 + edgeIndex * 150);
        line([a, { x: a.x + (b.x - a.x) * progress, y: a.y + (b.y - a.y) * progress }], 'muted', lift * .42, .7);
        edgeIndex += 1;
      }
    }

    const cycle = time < 105500 ? [1, 2, 3, 4, 5, 1] : time < 108000 ? [1, 2, 3, 4, 5, 1] : time < 110500 ? [1, 2, 3, 4, 1] : [1, 2, 3, 1];
    const cycleStart = time < 105500 ? 100000 : time < 108000 ? 105500 : time < 110500 ? 108000 : 110500;
    const cycleProgress = ease(time, cycleStart, cycleStart + 1700) * (cycle.length - 1);

    for (let edge = 0; edge < cycle.length - 1; edge++) {
      const from = cycle[edge];
      const to = cycle[edge + 1];

      if (from === undefined || to === undefined) continue;

      const a = at(from);
      const b = at(to);
      const part = Math.max(0, Math.min(1, cycleProgress - edge));
      line([a, { x: a.x + (b.x - a.x) * part, y: a.y + (b.y - a.y) * part }], 'blue', lift, 2);
    }

    const struck = time >= 107200 && time < 110500;

    if (struck) {
      line([{ x: pentagonCenter.x - 14, y: pentagonCenter.y - 14 }, { x: pentagonCenter.x + 14, y: pentagonCenter.y + 14 }], 'blue', lift, 1.7);
      line([{ x: pentagonCenter.x + 14, y: pentagonCenter.y - 14 }, { x: pentagonCenter.x - 14, y: pentagonCenter.y + 14 }], 'blue', lift, 1.7);
    }

    if (time < 115000) words(time < 105500 ? 'COLOUR CHANGES FORM A LOOP' : time < 108000 ? 'FIVE: RULED OUT' : time < 110500 ? 'FOUR: RULED OUT' : 'THREE: THE SPINDLE NEEDS FOUR', middle, height * (tall ? .98 : .95), span + 15, 'blue');
  }

  for (const color of PALETTE) {
    if (time < 300 + color.id * 260) continue;

    const point = at(color.id);
    const entered = ease(time, 300 + color.id * 260, 900 + color.id * 260);
    const x = point.x + (1 - entered) * (width + slotSize - point.x);
    const y = point.y;
    const box = { x: x - slotSize / 2, y: y - slotSize / 2, w: slotSize, h: slotSize };
    pen.save();
    pen.beginPath();
    pen.roundRect(box.x, box.y, box.w, box.h, lift * box.w / 2);
    pen.clip();
    pen.fillStyle = pigments[color.id - 1] ?? color.hex;
    pen.globalAlpha = .45;
    pen.fillRect(box.x, box.y, box.w, box.h);
    pen.globalAlpha = 1;
    pattern(box, color);
    pen.restore();
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .8;
    pen.beginPath();
    pen.roundRect(box.x, box.y, box.w, box.h, lift * box.w / 2);
    pen.stroke();
    words(String(color.id), x, y, slotSize - 3, 'ink', tall ? 12 : 14);

    if (color.id < Math.floor(minimum + .01) && (color.id > 5 || lift < .02)) {
      const strike = claim && color.id === 5 ? 'blue' : 'muted';
      pen.setLineDash(claim && color.id === 5 ? [3, 3] : []);
      line([{ x: box.x - 2, y: box.y + box.h + 3 }, { x: box.x + box.w + 2, y: box.y - 3 }], strike, entered, 1);
      pen.setLineDash([]);
    }
  }

  const cards = [
    { start: 31500, title: 'MOSER SPINDLE', detail: '7 POINTS · NEEDS FOUR' },
    { start: 44500, title: '1,581 POINTS', detail: 'DE GREY · 2018\nCOMPUTER CHECKED' },
    { start: 50500, title: '509 POINTS', detail: 'PARTS · 2020' },
    { start: 53500, title: 'A PATTERN FOR SIX', detail: 'EXISTS · NOT FOUND' },
  ];
  pen.save();
  pen.beginPath();
  pen.rect(tall ? width * .04 : left - 5, height * (tall ? .79 : .34), tall ? width * .92 : span + 10, height * (tall ? .19 : .43));
  pen.clip();

  for (const [index, card] of cards.entries()) {
    if (time < card.start || tall && time >= 115000 && index !== 0) continue;

    const entered = ease(time, card.start, card.start + 1800);
    const box = cardBox(index, width, height, time);
    const exit = tall || index < 2 ? 0 : ease(time, 95500, 97500) * height * .5;
    const x = box.x + (1 - entered) * width * .4;
    const y = box.y + exit;
    pen.strokeStyle = colors[index === 3 ? 'blue' : 'muted'];
    pen.lineWidth = .8;
    pen.setLineDash(index === 3 ? [4, 3] : []);
    pen.strokeRect(x, y, box.w, box.h);
    pen.setLineDash([]);
    const titleAt = index === 0 ? y + (tall ? box.h * .31 : 13) : y + box.h * .32;
    const textX = x + box.w * (tall && index === 0 ? .31 : .5);
    const textWidth = tall && index === 0 ? box.w * .58 : box.w - 8;
    words(card.title, textX, titleAt, textWidth, index === 3 ? 'blue' : 'ink', tall ? 9 : 10);
    words(card.detail, textX, index === 0 && !tall ? y + box.h - 10 : y + box.h * .72, textWidth, 'muted', tall ? 9 : 10);
  }

  pen.restore();

  if (time >= 53500 && time < 96000 && !tall) label('claim', middle, height * .87);
  if (time >= 61500 && time < 96000 && !tall) words('NO FINITE PATTERN BUILT', middle, height * .95, span + 10, 'muted');

  if (time >= 115000) {
    if (tall) words('POLYMATH16 · NO VERDICT YET', middle, height * .98, span + 15, 'muted');
    else label('status', middle, height * .87);
  }
}
